import { prisma } from '../../db/client';
import { logger } from '../../utils/logger';
import { storageService } from '../../services/storage.service';
import { geminiService } from '../../services/gemini.service';
import { veoService, VeoConfig } from '../../services/veo.service';
import {
  OutputMode,
  ShopProfile,
  PhotoScene,
} from './shop-photographer.types';
import { SCENES, getSceneById, getScenesByCategory } from './scenes';
import { AESTHETICS, getAestheticById } from './aesthetics';
import {
  buildPhotographerPrompt,
  buildEnhancementPrompt,
  buildVideoAnimationPrompt,
} from './prompt-builder';
import * as fs from 'fs';
import * as path from 'path';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EnhanceInput {
  photoBase64: string;
  photoMimeType: string;
  outputMode: OutputMode;
  enhancementStyle: 'dramatic' | 'clean' | 'moody' | 'bright' | 'auto';
  textContent?: { headline?: string; subheadline?: string; cta?: string };
  aspectRatio?: string;
}

export interface GenerateInput {
  sceneId: string;
  outputMode: OutputMode;
  aestheticId?: string;
  textContent?: { headline?: string; subheadline?: string; cta?: string };
  aspectRatio?: string;
}

export interface VideoInput {
  sceneId: string;
  aestheticId?: string;
  aspectRatio?: '16:9' | '9:16';
  duration?: number;
}

export interface VideoJob {
  id: string;
  tenantId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  contentId?: string;
  error?: string;
  createdAt: Date;
}

// ─── Service ────────────────────────────────────────────────────────────────

export const shopPhotographerService = {
  /**
   * Get available scenes, optionally filtered by category
   */
  getScenes(category?: string): PhotoScene[] {
    if (category) {
      return getScenesByCategory(category);
    }
    return SCENES;
  },

  /**
   * Get all aesthetic presets
   */
  getAesthetics() {
    return AESTHETICS;
  },

  /**
   * Get tenant gallery photos from BrandKit
   */
  async getGallery(tenantId: string): Promise<string[]> {
    const brandKit = await prisma.brandKit.findFirst({ where: { tenantId } });
    return ((brandKit as any)?.shopPhotos || []) as string[];
  },

  /**
   * Add a photo to the tenant gallery (max 10)
   */
  async addToGallery(tenantId: string, base64: string, mimeType: string): Promise<string> {
    const ext = mimeType.split('/')[1] || 'png';
    const filename = `gallery_${Date.now()}.${ext}`;
    const storagePath = `images/${tenantId}/${filename}`;
    const buffer = Buffer.from(base64, 'base64');
    const url = await storageService.uploadBuffer(buffer, storagePath);

    const brandKit = await prisma.brandKit.findFirst({ where: { tenantId } });
    if (!brandKit) {
      throw new Error('Brand kit not found. Complete onboarding first.');
    }

    const photos = ((brandKit as any)?.shopPhotos || []) as string[];
    if (photos.length >= 10) {
      throw new Error('Maximum 10 gallery photos. Remove one before adding another.');
    }

    photos.push(url);
    await prisma.brandKit.update({
      where: { id: brandKit.id },
      data: { shopPhotos: photos } as any,
    });

    logger.info('Gallery photo added', { tenantId, url });
    return url;
  },

  /**
   * Remove a photo from the gallery by index
   */
  async removeFromGallery(tenantId: string, index: number): Promise<void> {
    const brandKit = await prisma.brandKit.findFirst({ where: { tenantId } });
    if (!brandKit) throw new Error('Brand kit not found');

    const photos = ((brandKit as any)?.shopPhotos || []) as string[];
    if (index < 0 || index >= photos.length) {
      throw new Error('Invalid gallery photo index');
    }

    const removedUrl = photos[index];
    photos.splice(index, 1);

    await prisma.brandKit.update({
      where: { id: brandKit.id },
      data: { shopPhotos: photos } as any,
    });

    // Delete file from disk
    const uploadsIdx = removedUrl.indexOf('/uploads/');
    if (uploadsIdx !== -1) {
      const relativePath = removedUrl.substring(uploadsIdx + '/uploads/'.length);
      await storageService.deleteFile(relativePath);
    }

    logger.info('Gallery photo removed', { tenantId, index });
  },

  /**
   * Analyze gallery photos to extract a ShopProfile
   */
  async analyzeShopPhotos(tenantId: string): Promise<ShopProfile> {
    const photos = await this.getGallery(tenantId);
    if (photos.length === 0) {
      throw new Error('No gallery photos to analyze. Upload at least one photo first.');
    }

    // Read first 3 gallery photos from disk
    const photosToAnalyze = photos.slice(0, 3);
    const analysisPrompts: string[] = [];

    for (const photoUrl of photosToAnalyze) {
      const uploadsIdx = photoUrl.indexOf('/uploads/');
      if (uploadsIdx === -1) continue;

      const relativePath = photoUrl.substring(uploadsIdx + '/uploads/'.length);
      const fullPath = path.join(process.cwd(), 'uploads', relativePath);

      if (!fs.existsSync(fullPath)) continue;

      const fileBuffer = fs.readFileSync(fullPath);
      const base64 = fileBuffer.toString('base64');
      const ext = path.extname(fullPath).slice(1);
      const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      const analysisResult = await geminiService.analyzeImageFromBase64(
        base64,
        mimeType,
        `Analyze this auto repair shop photograph. Extract the following details as JSON:
{
  "description": "Brief description of what the photo shows",
  "shopStyle": "Overall style/vibe (e.g., modern, vintage, industrial, neighborhood)",
  "dominantColors": ["list of dominant hex colors"],
  "materials": ["visible materials like concrete, brick, steel, wood"],
  "lightingCharacter": "Description of the lighting (warm, cool, natural, fluorescent, mixed)",
  "equipmentVisible": ["visible equipment like lifts, tool chests, compressors"],
  "uniqueFeatures": ["any distinctive or unique visual features"]
}
Return ONLY the JSON, no other text.`
      );

      analysisPrompts.push(analysisResult);
    }

    if (analysisPrompts.length === 0) {
      throw new Error('Could not read any gallery photos from disk');
    }

    // Merge multiple analyses into one ShopProfile
    const mergePrompt = `You are merging multiple auto shop photo analyses into a single consolidated ShopProfile.

Individual analyses:
${analysisPrompts.map((a, i) => `Photo ${i + 1}: ${a}`).join('\n\n')}

Merge these into a single JSON object with these fields:
{
  "description": "Overall description of the shop's visual character",
  "shopStyle": "The dominant style",
  "dominantColors": ["merged list of most common hex colors, max 6"],
  "materials": ["merged list of most common materials"],
  "lightingCharacter": "Overall lighting character",
  "equipmentVisible": ["merged equipment list"],
  "uniqueFeatures": ["merged unique features"]
}
Return ONLY the JSON.`;

    const mergedResult = await geminiService.analyzeImageFromBase64(
      // Use the first photo as context but we're really asking for text merge
      Buffer.from(analysisPrompts.join('\n')).toString('base64'),
      'text/plain',
      mergePrompt
    );

    try {
      const jsonMatch = mergedResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ShopProfile;
      }
    } catch (e) {
      logger.warn('Failed to parse merged shop profile JSON', { result: mergedResult });
    }

    // Fallback: try to parse the first individual analysis
    try {
      const jsonMatch = analysisPrompts[0].match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ShopProfile;
      }
    } catch (e) {
      // ignore
    }

    throw new Error('Could not extract shop profile from photos');
  },

  /**
   * Enhance an uploaded photo into professional marketing material
   */
  async enhancePhoto(tenantId: string, userId: string, input: EnhanceInput) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const businessName = tenant?.name || 'Auto Care';

    const enhancementPrompt = buildEnhancementPrompt({
      outputMode: input.outputMode,
      enhancementStyle: input.enhancementStyle,
      businessName,
      textContent: input.textContent,
    });

    const result = await geminiService.editImage(
      { base64: input.photoBase64, mimeType: input.photoMimeType },
      enhancementPrompt,
      { aspectRatio: input.aspectRatio }
    );

    if (!result.success || !result.imageData) {
      throw new Error(result.error || 'Photo enhancement failed');
    }

    const contentId = `shop_enhance_${Date.now()}`;
    const { url } = await storageService.saveImage(
      result.imageData,
      tenantId,
      contentId,
      result.mimeType || 'image/png'
    );

    const content = await prisma.content.create({
      data: {
        tenantId,
        userId,
        tool: 'shop_photographer',
        contentType: 'image',
        title: `Shop Photo — Enhanced (${input.enhancementStyle})`,
        imageUrl: url,
        caption: `Professional ${input.enhancementStyle} enhancement`,
        status: 'approved',
        moderationStatus: 'passed',
        metadata: {
          type: 'enhancement',
          outputMode: input.outputMode,
          enhancementStyle: input.enhancementStyle,
          imageUrl: url,
        } as any,
      },
    });

    return {
      contentId: content.id,
      imageUrl: url,
    };
  },

  /**
   * Generate a professional photo from a scene template
   */
  async generateScene(tenantId: string, userId: string, input: GenerateInput) {
    const scene = getSceneById(input.sceneId);
    if (!scene) throw new Error(`Scene not found: ${input.sceneId}`);

    const aesthetic = input.aestheticId ? getAestheticById(input.aestheticId) : undefined;
    if (input.aestheticId && !aesthetic) {
      throw new Error(`Aesthetic not found: ${input.aestheticId}`);
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const businessName = tenant?.name || 'Auto Care';

    // If user has gallery photos and no aesthetic selected, analyze their shop
    let shopProfile: ShopProfile | undefined;
    if (!aesthetic) {
      try {
        const gallery = await this.getGallery(tenantId);
        if (gallery.length > 0) {
          shopProfile = await this.analyzeShopPhotos(tenantId);
        }
      } catch (err) {
        logger.warn('Shop photo analysis failed, falling back to no profile', { tenantId, error: err });
      }
    }

    const prompt = buildPhotographerPrompt({
      scene,
      outputMode: input.outputMode,
      aesthetic,
      shopProfile,
      businessName,
      textContent: input.textContent,
    });

    // Build generation options
    const options: any = {
      aspectRatio: input.aspectRatio || '4:5',
    };

    // If photo-logo mode, try to fetch logo from BrandKit
    if (input.outputMode === 'photo-logo') {
      try {
        const brandKit = await prisma.brandKit.findFirst({ where: { tenantId } });
        const logoUrl = (brandKit as any)?.logoUrl as string | undefined;
        if (logoUrl) {
          const uploadsIdx = logoUrl.indexOf('/uploads/');
          if (uploadsIdx !== -1) {
            const relativePath = logoUrl.substring(uploadsIdx + '/uploads/'.length);
            const fullPath = path.join(process.cwd(), 'uploads', relativePath);
            if (fs.existsSync(fullPath)) {
              const logoBuffer = fs.readFileSync(fullPath);
              const ext = path.extname(fullPath).slice(1);
              options.logoImage = {
                base64: logoBuffer.toString('base64'),
                mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
              };
            }
          }
        }
      } catch (err) {
        logger.warn('Could not load logo for photo-logo mode', { tenantId, error: err });
      }
    }

    // If gallery photos exist, load first one as reference
    try {
      const gallery = await this.getGallery(tenantId);
      if (gallery.length > 0) {
        const firstUrl = gallery[0];
        const uploadsIdx = firstUrl.indexOf('/uploads/');
        if (uploadsIdx !== -1) {
          const relativePath = firstUrl.substring(uploadsIdx + '/uploads/'.length);
          const fullPath = path.join(process.cwd(), 'uploads', relativePath);
          if (fs.existsSync(fullPath)) {
            const refBuffer = fs.readFileSync(fullPath);
            const ext = path.extname(fullPath).slice(1);
            options.referenceImage = {
              base64: refBuffer.toString('base64'),
              mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
            };
          }
        }
      }
    } catch (err) {
      logger.warn('Could not load reference image', { tenantId, error: err });
    }

    const result = await geminiService.generateImage(prompt, options);

    if (!result.success || !result.imageData) {
      throw new Error(result.error || 'Scene generation failed');
    }

    const contentId = `shop_scene_${Date.now()}`;
    const { url } = await storageService.saveImage(
      result.imageData,
      tenantId,
      contentId,
      result.mimeType || 'image/png'
    );

    const content = await prisma.content.create({
      data: {
        tenantId,
        userId,
        tool: 'shop_photographer',
        contentType: 'image',
        title: `Shop Photo — ${scene.name}`,
        imageUrl: url,
        caption: scene.shortDescription,
        status: 'approved',
        moderationStatus: 'passed',
        metadata: {
          type: 'scene',
          sceneId: input.sceneId,
          outputMode: input.outputMode,
          aestheticId: input.aestheticId,
          imageUrl: url,
        } as any,
      },
    });

    return {
      contentId: content.id,
      imageUrl: url,
      scene: scene.name,
    };
  },

  /**
   * Start video generation (two-phase: image -> video)
   */
  async startVideoGeneration(tenantId: string, userId: string, input: VideoInput): Promise<VideoJob> {
    const scene = getSceneById(input.sceneId);
    if (!scene) throw new Error(`Scene not found: ${input.sceneId}`);

    const job = await prisma.batchJob.create({
      data: {
        tenantId,
        userId,
        jobType: 'shop_photographer_video',
        totalItems: 1,
        completedItems: 0,
        status: 'pending',
        metadata: {
          type: 'shop_photographer_video',
          sceneId: input.sceneId,
          aestheticId: input.aestheticId,
        } as any,
      },
    });

    logger.info('Shop photographer video job created', {
      jobId: job.id,
      tenantId,
      sceneId: input.sceneId,
    });

    // Fire-and-forget
    this.processVideoGeneration(job.id, tenantId, userId, input, scene).catch((err) => {
      logger.error('Shop photographer video generation failed', { jobId: job.id, error: err });
    });

    return {
      id: job.id,
      tenantId,
      userId,
      status: 'pending',
      progress: 0,
      createdAt: job.createdAt,
    };
  },

  /**
   * Async video processing (image -> video pipeline)
   */
  async processVideoGeneration(
    jobId: string,
    tenantId: string,
    userId: string,
    input: VideoInput,
    scene: PhotoScene,
  ): Promise<void> {
    try {
      await prisma.batchJob.update({
        where: { id: jobId },
        data: { status: 'processing', startedAt: new Date() },
      });

      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      const businessName = tenant?.name || 'Auto Care';

      const aesthetic = input.aestheticId ? getAestheticById(input.aestheticId) : undefined;

      // Phase 1: Generate hero image (outputMode forced to 'video')
      const prompt = buildPhotographerPrompt({
        scene,
        outputMode: 'video',
        aesthetic,
        businessName,
      });

      const imageResult = await geminiService.generateImage(prompt, {
        aspectRatio: (input.aspectRatio as any) || '9:16',
      });

      if (!imageResult.success || !imageResult.imageData) {
        throw new Error(imageResult.error || 'Hero image generation failed');
      }

      // Phase 2: Animate the hero image
      const heroBase64 = imageResult.imageData.toString('base64');
      const heroMimeType = imageResult.mimeType || 'image/png';

      const animationPrompt = buildVideoAnimationPrompt({ scene, businessName });

      const veoConfig: VeoConfig = {
        aspectRatio: input.aspectRatio || '9:16',
        durationSeconds: input.duration || 8,
        resolution: '720p',
      };

      const videoResult = await veoService.generateVideoFromImage(
        animationPrompt,
        { imageBytes: heroBase64, mimeType: heroMimeType },
        veoConfig
      );

      if (!videoResult.success || !videoResult.videoData) {
        throw new Error(videoResult.error || 'Video generation failed');
      }

      const tempContentId = `shop_video_${jobId}`;
      const { url: videoUrl } = await storageService.saveVideo(
        videoResult.videoData,
        tenantId,
        tempContentId
      );

      const content = await prisma.content.create({
        data: {
          tenantId,
          userId,
          tool: 'shop_photographer',
          contentType: 'video',
          title: `Shop Video — ${scene.name}`,
          imageUrl: '',
          caption: scene.shortDescription,
          status: 'approved',
          moderationStatus: 'passed',
          metadata: {
            videoUrl,
            type: 'video',
            sceneId: input.sceneId,
            aestheticId: input.aestheticId,
            aspectRatio: input.aspectRatio || '9:16',
            duration: input.duration || 8,
            jobId,
          } as any,
        },
      });

      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          completedItems: 1,
          completedAt: new Date(),
          metadata: {
            contentId: content.id,
            videoUrl,
          },
        },
      });

      logger.info('Shop photographer video completed', { jobId, contentId: content.id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          failedItems: 1,
          completedAt: new Date(),
          metadata: {
            error: errorMessage,
            failedAt: new Date().toISOString(),
          } as any,
        },
      });

      logger.error('Shop photographer video failed', { jobId, error: errorMessage });
      throw error;
    }
  },

  /**
   * Get job status with progress estimate
   */
  async getJobStatus(tenantId: string, jobId: string): Promise<VideoJob | null> {
    const job = await prisma.batchJob.findFirst({
      where: { id: jobId, tenantId, jobType: 'shop_photographer_video' },
    });

    if (!job) return null;

    const metadata = job.metadata as Record<string, unknown>;

    return {
      id: job.id,
      tenantId: job.tenantId,
      userId: job.userId || '',
      status: job.status as VideoJob['status'],
      progress: (() => {
        if (job.status === 'completed') return 100;
        if (job.status === 'failed') return 0;
        if (job.status === 'processing' && job.startedAt) {
          // 5 minutes = 100% base estimate
          const elapsedMs = Date.now() - job.startedAt.getTime();
          const pct = Math.min(95, Math.round((elapsedMs / 1000 / 300) * 100));
          return Math.max(5, pct);
        }
        return 0;
      })(),
      videoUrl: metadata.videoUrl as string | undefined,
      contentId: metadata.contentId as string | undefined,
      error: metadata.error as string | undefined,
      createdAt: job.createdAt,
    };
  },

  /**
   * Get generation history for a tenant
   */
  async getHistory(tenantId: string, opts: { limit?: number; offset?: number } = {}) {
    const { limit = 20, offset = 0 } = opts;

    const content = await prisma.content.findMany({
      where: { tenantId, tool: 'shop_photographer' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return content.map((c) => {
      const metadata = c.metadata as Record<string, unknown>;
      return {
        id: c.id,
        title: c.title,
        contentType: c.contentType,
        imageUrl: c.imageUrl || (metadata.imageUrl as string) || '',
        videoUrl: (metadata.videoUrl as string) || undefined,
        caption: c.caption || '',
        sceneId: metadata.sceneId as string | undefined,
        outputMode: metadata.outputMode as string | undefined,
        metadata,
        createdAt: c.createdAt,
      };
    });
  },

  /**
   * Delete a content item
   */
  async deleteContent(tenantId: string, contentId: string): Promise<void> {
    const content = await prisma.content.findFirst({
      where: { id: contentId, tenantId, tool: 'shop_photographer' },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    const metadata = content.metadata as Record<string, unknown>;

    // Delete image file if present
    const imageUrl = content.imageUrl || (metadata.imageUrl as string);
    if (imageUrl) {
      const uploadsIdx = imageUrl.indexOf('/uploads/');
      if (uploadsIdx !== -1) {
        const relativePath = imageUrl.substring(uploadsIdx + '/uploads/'.length);
        await storageService.deleteFile(relativePath);
      }
    }

    // Delete video file if present
    const videoUrl = metadata.videoUrl as string | undefined;
    if (videoUrl) {
      const uploadsIdx = videoUrl.indexOf('/uploads/');
      if (uploadsIdx !== -1) {
        const relativePath = videoUrl.substring(uploadsIdx + '/uploads/'.length);
        await storageService.deleteFile(relativePath);
      }
    }

    await prisma.content.delete({ where: { id: contentId } });
    logger.info('Deleted shop photographer content', { tenantId, contentId });
  },
};

export default shopPhotographerService;
