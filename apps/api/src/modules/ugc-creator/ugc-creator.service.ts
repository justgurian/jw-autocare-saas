/**
 * UGC Creator Service
 * Business logic for character-based UGC video generation
 */

import { prisma } from '../../db/client';
import { logger } from '../../utils/logger';
import { storageService } from '../../services/storage.service';
import { veoService, VeoConfig } from '../../services/veo.service';
import { Character, CHARACTERS, getCharacterById } from './characters';
import { Scene, SCENES, getSceneById, getScenesByCategory } from './scenes';
import { buildUgcPrompt, CarDetails } from './prompt-builder';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UgcGenerationInput {
  sceneId: string;
  characterId: string;
  car?: CarDetails;
  aspectRatio?: '16:9' | '9:16';
  duration?: number;
  commercialScript?: string;
}

export interface VideoGenerationJob {
  id: string;
  tenantId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  caption?: string;
  error?: string;
  createdAt: Date;
}

export interface GeneratedVideo {
  id: string;
  videoUrl: string;
  caption: string;
  duration: string;
  aspectRatio: string;
  sceneId?: string;
  characterId?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const ugcCreatorService = {
  /**
   * Get available characters — built-in plus any custom mascots the tenant created
   */
  async getCharacters(tenantId: string): Promise<Character[]> {
    const builtIn = [...CHARACTERS];

    // Load custom mascots from Content where tool='mascot_builder'
    try {
      const mascots = await prisma.content.findMany({
        where: { tenantId, tool: 'mascot_builder', status: 'approved' },
        orderBy: { createdAt: 'desc' },
      });

      for (const m of mascots) {
        const meta = m.metadata as Record<string, unknown>;
        builtIn.push({
          id: `custom-${m.id}`,
          name: m.title || 'Custom Mascot',
          description: (meta.characterDescription as string) || m.caption || '',
          personality: (meta.personality as string) || '',
          isBuiltIn: false,
        });
      }
    } catch (err) {
      logger.warn('Failed to load custom mascots', { tenantId, error: err });
    }

    return builtIn;
  },

  /**
   * Get available scenes, optionally filtered by category
   */
  getScenes(category?: string): Scene[] {
    if (category) {
      return getScenesByCategory(category);
    }
    return SCENES;
  },

  /**
   * Start a UGC video generation job
   */
  async startGeneration(
    tenantId: string,
    userId: string,
    input: UgcGenerationInput
  ): Promise<VideoGenerationJob> {
    // Validate scene
    const scene = getSceneById(input.sceneId);
    if (!scene) {
      throw new Error(`Scene not found: ${input.sceneId}`);
    }

    // Validate character
    let character = getCharacterById(input.characterId);
    if (!character) {
      // May be a custom mascot — load from DB
      const customId = input.characterId.replace('custom-', '');
      const mascot = await prisma.content.findFirst({
        where: { id: customId, tenantId, tool: 'mascot_builder' },
      });
      if (mascot) {
        const meta = mascot.metadata as Record<string, unknown>;
        character = {
          id: input.characterId,
          name: mascot.title || 'Custom Mascot',
          description: (meta.characterDescription as string) || mascot.caption || '',
          personality: (meta.personality as string) || '',
          isBuiltIn: false,
        };
      } else {
        throw new Error(`Character not found: ${input.characterId}`);
      }
    }

    // ASMR scenes force puppet-hands
    if (scene.forceActor) {
      const forcedChar = getCharacterById(scene.forceActor);
      if (forcedChar) character = forcedChar;
    }

    // Get tenant info for business name
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const businessName = tenant?.name || 'JW Auto Care';

    // Build prompt
    const prompt = buildUgcPrompt({
      character,
      scene,
      car: input.car,
      businessName,
      commercialScript: input.commercialScript,
    });

    // Create job record
    const job = await prisma.batchJob.create({
      data: {
        tenantId,
        userId,
        jobType: 'ugc_video',
        totalItems: 1,
        completedItems: 0,
        status: 'pending',
        metadata: {
          type: 'ugc',
          sceneId: input.sceneId,
          characterId: input.characterId,
          car: input.car,
          prompt,
        } as any,
      },
    });

    logger.info('UGC video generation job created', {
      jobId: job.id,
      tenantId,
      sceneId: input.sceneId,
      characterId: input.characterId,
    });

    // Fire-and-forget async generation
    this.processGeneration(job.id, tenantId, userId, prompt, input, scene).catch((err) => {
      logger.error('UGC video generation failed', { jobId: job.id, error: err });
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
   * Process generation asynchronously
   */
  async processGeneration(
    jobId: string,
    tenantId: string,
    userId: string,
    prompt: string,
    input: UgcGenerationInput,
    scene: Scene
  ): Promise<void> {
    try {
      await prisma.batchJob.update({
        where: { id: jobId },
        data: { status: 'processing', startedAt: new Date() },
      });

      const veoConfig: VeoConfig = {
        aspectRatio: input.aspectRatio || '9:16',
        durationSeconds: input.duration || 8,
        resolution: '720p',
      };

      const result = await veoService.generateVideo(prompt, veoConfig);

      if (!result.success) {
        throw new Error(result.error || 'Video generation failed');
      }

      const tempContentId = `ugc_${jobId}`;
      const { url: videoUrl } = await storageService.saveVideo(
        result.videoData!,
        tenantId,
        tempContentId
      );

      const caption = `${scene.name} - ${scene.shortDescription}`;

      const content = await prisma.content.create({
        data: {
          tenantId,
          userId,
          tool: 'ugc_video',
          contentType: 'video',
          title: `UGC - ${scene.name}`,
          imageUrl: '',
          caption,
          status: 'approved',
          moderationStatus: 'passed',
          metadata: {
            videoUrl,
            sceneId: input.sceneId,
            characterId: input.characterId,
            car: input.car,
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
            caption,
          },
        },
      });

      logger.info('UGC video generation completed', { jobId, contentId: content.id });
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

      logger.error('UGC video generation failed', { jobId, error: errorMessage });
      throw error;
    }
  },

  /**
   * Get job status with progress estimate
   */
  async getJobStatus(tenantId: string, jobId: string): Promise<VideoGenerationJob | null> {
    const job = await prisma.batchJob.findFirst({
      where: { id: jobId, tenantId, jobType: 'ugc_video' },
    });

    if (!job) return null;

    const metadata = job.metadata as Record<string, unknown>;

    return {
      id: job.id,
      tenantId: job.tenantId,
      userId: job.userId || '',
      status: job.status as VideoGenerationJob['status'],
      progress: (() => {
        if (job.status === 'completed') return 100;
        if (job.status === 'failed') return 0;
        if (job.status === 'processing' && job.startedAt) {
          const elapsedMs = Date.now() - job.startedAt.getTime();
          const pct = Math.min(95, Math.round((elapsedMs / 1000 / 180) * 100));
          return Math.max(5, pct);
        }
        return 0;
      })(),
      videoUrl: metadata.videoUrl as string | undefined,
      caption: metadata.caption as string | undefined,
      error: metadata.error as string | undefined,
      createdAt: job.createdAt,
    };
  },

  /**
   * Get recent UGC videos for a tenant
   */
  async getRecentVideos(
    tenantId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<GeneratedVideo[]> {
    const { limit = 20, offset = 0 } = options;

    const content = await prisma.content.findMany({
      where: { tenantId, tool: 'ugc_video' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return content.map((c) => {
      const metadata = c.metadata as Record<string, unknown>;
      return {
        id: c.id,
        videoUrl: (metadata.videoUrl as string) || '',
        caption: c.caption || '',
        duration: String(metadata.duration || ''),
        aspectRatio: (metadata.aspectRatio as string) || '',
        sceneId: metadata.sceneId as string | undefined,
        characterId: metadata.characterId as string | undefined,
        metadata,
        createdAt: c.createdAt,
      };
    });
  },

  /**
   * Delete a UGC video
   */
  async deleteVideo(tenantId: string, contentId: string): Promise<void> {
    const content = await prisma.content.findFirst({
      where: { id: contentId, tenantId, tool: 'ugc_video' },
    });

    if (!content) {
      throw new Error('Video not found');
    }

    const metadata = content.metadata as Record<string, unknown>;
    const videoUrl = metadata?.videoUrl as string | undefined;
    if (videoUrl) {
      const uploadsIdx = videoUrl.indexOf('/uploads/');
      if (uploadsIdx !== -1) {
        const relativePath = videoUrl.substring(uploadsIdx + '/uploads/'.length);
        await storageService.deleteFile(relativePath);
      }
    }

    await prisma.content.delete({ where: { id: contentId } });
    logger.info('Deleted UGC video', { tenantId, contentId });
  },
};

export default ugcCreatorService;
