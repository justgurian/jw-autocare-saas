/**
 * Video Creator Service
 * Business logic for AI-powered video generation using Veo 3.1
 * Uses Veo 3.1 via Google Gemini API for video generation
 */

import { prisma } from '../../db/client';
import { logger } from '../../utils/logger';
import { config } from '../../config';
import {
  VideoGenerationInput,
  VideoGenerationJob,
  GeneratedVideo,
  VIDEO_TEMPLATES,
  VideoTemplate,
  buildVideoPrompt,
  getTemplateById,
  generateVideoCaption,
} from './video-creator.types';
import { ANIMATION_PRESETS, COMMERCIAL_VIBES, VideoAnimationPreset } from './video-creator.prompts';
import { storageService } from '../../services/storage.service';

import { GoogleGenAI } from '@google/genai';

// Veo 3.1 Video generation via Gemini API
const veoAI = new GoogleGenAI({ apiKey: config.gemini.apiKey });

/**
 * Check if an error is retryable (transient/server-side)
 */
function isRetryableError(error?: string): boolean {
  if (!error) return false;
  const retryablePatterns = [
    'INTERNAL',
    'UNAVAILABLE',
    'DEADLINE_EXCEEDED',
    'RESOURCE_EXHAUSTED',
    'timed out',
    'timeout',
    '503',
    '500',
    '429',
    'rate limit',
    'overloaded',
  ];
  const lower = error.toLowerCase();
  return retryablePatterns.some((p) => lower.includes(p.toLowerCase()));
}

export const videoCreatorService = {
  /**
   * Get all video templates
   */
  getTemplates(): VideoTemplate[] {
    return VIDEO_TEMPLATES;
  },

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): VideoTemplate | undefined {
    return getTemplateById(templateId);
  },

  /**
   * Start video generation job
   */
  async startVideoGeneration(
    tenantId: string,
    userId: string,
    input: VideoGenerationInput
  ): Promise<VideoGenerationJob> {
    // Get tenant info for branding
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { brandKit: true },
    });

    const businessName = tenant?.name || 'JW Auto Care';
    const tagline = tenant?.brandKit?.tagline;

    // Get template if specified
    const template = input.templateId
      ? getTemplateById(input.templateId)
      : VIDEO_TEMPLATES.find((t) => t.style === input.style) || VIDEO_TEMPLATES[0];

    if (!template) {
      throw new Error('Template not found');
    }

    // Build the video generation prompt
    const prompt = buildVideoPrompt({
      template,
      input,
      businessName,
      tagline: tagline || undefined,
    });

    // Create job record in database
    const job = await prisma.batchJob.create({
      data: {
        tenantId,
        userId,
        jobType: 'video_generation',
        totalItems: 1,
        completedItems: 0,
        status: 'pending',
        metadata: {
          input: JSON.parse(JSON.stringify(input)),
          prompt,
          template: template.id,
        } as any,
      },
    });

    logger.info('Video generation job created', {
      jobId: job.id,
      tenantId,
      template: template.id,
    });

    // Start async generation (in real implementation, this would queue the job)
    this.processVideoGeneration(job.id, tenantId, userId, prompt, input).catch(
      (error) => {
        logger.error('Video generation failed', { jobId: job.id, error });
      }
    );

    return {
      id: job.id,
      tenantId: job.tenantId,
      userId: job.userId || '',
      status: 'pending',
      progress: 0,
      input,
      createdAt: job.createdAt,
    };
  },

  /**
   * Process video generation (async) using Veo 3.1
   */
  async processVideoGeneration(
    jobId: string,
    tenantId: string,
    userId: string,
    prompt: string,
    input: VideoGenerationInput
  ): Promise<void> {
    try {
      // Update job status to processing
      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'processing',
          startedAt: new Date(),
        },
      });

      // Check if Gemini API key is configured
      if (!config.gemini.apiKey) {
        throw new Error('Gemini API key not configured. Set GEMINI_API_KEY to enable Veo 3.1 video generation.');
      }

      // Call Veo 3.1 video generation API with single retry on retryable errors
      let videoResult = await this.callVideoGenerationAPI(prompt, input);

      if (!videoResult.success && isRetryableError(videoResult.error)) {
        logger.info('Retrying video generation after retryable error', { jobId, error: videoResult.error });
        await new Promise((resolve) => setTimeout(resolve, 5000));
        videoResult = await this.callVideoGenerationAPI(prompt, input);
      }

      if (!videoResult.success) {
        throw new Error(videoResult.error || 'Video generation failed');
      }

      // Generate a temporary content ID for file storage
      const tempContentId = `vid_${jobId}`;

      // Save video to disk instead of base64 data URL
      const { url: videoUrl } = await storageService.saveVideo(
        videoResult.videoData!,
        tenantId,
        tempContentId
      );

      // Generate caption
      const caption = generateVideoCaption({
        topic: input.topic,
        style: input.style,
        businessName: (await prisma.tenant.findUnique({ where: { id: tenantId } }))?.name || 'Our Shop',
        callToAction: input.callToAction,
      });

      // Save as content
      const content = await prisma.content.create({
        data: {
          tenantId,
          userId,
          tool: 'video_creator',
          contentType: 'video',
          title: `Video - ${input.topic}`,
          imageUrl: videoResult.thumbnailUrl || '',
          caption,
          status: 'approved',
          moderationStatus: 'passed',
          metadata: {
            videoUrl,
            thumbnailUrl: videoResult.thumbnailUrl || '',
            duration: input.duration,
            aspectRatio: input.aspectRatio,
            style: input.style,
            jobId,
          },
        },
      });

      // Update job as completed
      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          completedItems: 1,
          completedAt: new Date(),
          metadata: {
            contentId: content.id,
            videoUrl,
            thumbnailUrl: videoResult.thumbnailUrl || '',
            caption,
          },
        },
      });

      logger.info('Video generation completed', {
        jobId,
        contentId: content.id,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          failedItems: 1,
          completedAt: new Date(),
          metadata: {
            error: errorMessage,
            errorStack,
            failedAt: new Date().toISOString(),
            prompt: undefined, // preserve from creation if possible
          } as any,
        },
      });

      logger.error('Video generation failed', { jobId, error: errorMessage });
      throw error;
    }
  },

  /**
   * Call Veo 3.1 video generation API
   */
  async callVideoGenerationAPI(
    prompt: string,
    input: VideoGenerationInput
  ): Promise<{
    success: boolean;
    videoData?: Buffer;
    thumbnailUrl?: string;
    error?: string;
  }> {
    const HARD_TIMEOUT_MS = 6 * 60 * 1000; // 6 minutes

    const generate = async (): Promise<{
      success: boolean;
      videoData?: Buffer;
      thumbnailUrl?: string;
      error?: string;
    }> => {
      try {
        // Map options to Veo 3.1 format
        const aspectRatio = input.aspectRatio === '9:16' ? '9:16' : '16:9';
        const durationSeconds = parseInt(input.duration) || 8;
        const resolution = input.resolution || (durationSeconds === 8 ? '1080p' : '720p');

        // Start Veo 3.1 video generation
        // Note: Veo 3.1 generates audio natively (no generateAudio param)
        // personGeneration not currently supported via Gemini API
        const generateConfig: any = {
          aspectRatio,
          numberOfVideos: 1,
          durationSeconds,
          resolution,
        };

        // Include negative prompt if provided
        if (input.negativePrompt) {
          generateConfig.negativePrompt = input.negativePrompt;
        }

        // If reference images are provided (flyer-to-video), pass as image reference
        const generateParams: any = {
          model: 'veo-3.1-generate-preview',
          prompt,
          config: generateConfig,
        };

        if (input.referenceImages?.length) {
          generateParams.image = {
            imageBytes: input.referenceImages[0].base64,
            mimeType: input.referenceImages[0].mimeType,
          };
        }

        let operation = await veoAI.models.generateVideos(generateParams);

        // Poll until complete (Veo 3.1 is async — takes 1-3 minutes)
        let pollCount = 0;
        const maxPolls = 30; // 5 minutes max
        while (!operation.done && pollCount < maxPolls) {
          await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 seconds
          pollCount++;
          operation = await veoAI.operations.getVideosOperation({
            operation: operation,
          });
          logger.info('Veo 3.1 poll', { pollCount, done: operation.done });
        }

        if (!operation.done) {
          return { success: false, error: 'Video generation timed out after 5 minutes' };
        }

        // Extract video data
        const generatedVideo = operation.response?.generatedVideos?.[0];
        if (!generatedVideo?.video) {
          logger.error('No video in Veo response', {
            hasResponse: !!operation.response,
            generatedVideosCount: operation.response?.generatedVideos?.length,
            responseKeys: operation.response ? Object.keys(operation.response) : [],
          });
          return { success: false, error: 'No video in response' };
        }

        const video = generatedVideo.video;

        // Try to get video data - SDK may provide bytes directly or via download
        let videoData: Buffer;

        if ((video as any).videoBytes && (video as any).videoBytes.length > 0) {
          // Direct bytes available
          videoData = Buffer.from((video as any).videoBytes);
        } else if ((video as any).uri) {
          // Download via URI — requires API key in header
          const videoUri = (video as any).uri;
          logger.info('Downloading video from URI', { uri: videoUri });
          const response = await fetch(videoUri, {
            headers: {
              'x-goog-api-key': config.gemini.apiKey,
            },
          });
          if (!response.ok) {
            logger.error('Video download failed', { status: response.status, statusText: response.statusText });
            return { success: false, error: `Failed to download video: ${response.status} ${response.statusText}` };
          }
          videoData = Buffer.from(await response.arrayBuffer());
          logger.info('Video downloaded', { size: videoData.length });
        } else {
          // Try SDK download method
          try {
            const tmpPath = `/tmp/veo-${Date.now()}.mp4`;
            await veoAI.files.download({
              file: video,
              downloadPath: tmpPath,
            } as any);
            const fs = await import('fs');
            videoData = fs.readFileSync(tmpPath);
            fs.unlinkSync(tmpPath); // cleanup
          } catch (dlError: any) {
            logger.error('All video extraction methods failed', {
              videoKeys: Object.keys(video),
              videoStringified: JSON.stringify(video).substring(0, 500),
              downloadError: dlError.message,
            });
            return { success: false, error: 'Could not extract video data from Veo response' };
          }
        }

        return {
          success: true,
          videoData,
        };
      } catch (error: any) {
        logger.error('Veo 3.1 video generation failed', { error: error.message });

        if (error.message?.includes('SAFETY')) {
          return { success: false, error: 'Video blocked by safety filters. Try a different prompt.' };
        }

        return { success: false, error: error.message || 'Video generation failed' };
      }
    };

    // Race against hard timeout
    const timeoutPromise = new Promise<{ success: false; error: string }>((resolve) =>
      setTimeout(() => resolve({ success: false, error: 'Video generation hard timeout after 6 minutes' }), HARD_TIMEOUT_MS)
    );

    return Promise.race([generate(), timeoutPromise]);
  },

  /**
   * Get video generation job status
   */
  async getJobStatus(
    tenantId: string,
    jobId: string
  ): Promise<VideoGenerationJob | null> {
    const job = await prisma.batchJob.findFirst({
      where: {
        id: jobId,
        tenantId,
        jobType: 'video_generation',
      },
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
          // Time-based estimate: Veo typically takes 1-4 minutes
          const elapsedMs = Date.now() - job.startedAt.getTime();
          const elapsedSec = elapsedMs / 1000;
          const estimatedTotalSec = 180; // ~3 minutes typical
          const pct = Math.min(95, Math.round((elapsedSec / estimatedTotalSec) * 100));
          return Math.max(5, pct); // At least 5% when processing
        }
        return 0;
      })(),
      input: metadata.input as VideoGenerationInput,
      videoUrl: metadata.videoUrl as string | undefined,
      thumbnailUrl: metadata.thumbnailUrl as string | undefined,
      caption: metadata.caption as string | undefined,
      error: metadata.error as string | undefined,
      startedAt: job.startedAt || undefined,
      completedAt: job.completedAt || undefined,
      createdAt: job.createdAt,
    };
  },

  /**
   * Get recent video generations
   */
  async getRecentVideos(
    tenantId: string,
    options: { limit?: number } = {}
  ): Promise<GeneratedVideo[]> {
    const { limit = 20 } = options;

    const content = await prisma.content.findMany({
      where: {
        tenantId,
        tool: 'video_creator',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return content.map((c) => {
      const metadata = c.metadata as Record<string, unknown>;
      return {
        id: c.id,
        videoUrl: (metadata.videoUrl as string) || '',
        thumbnailUrl: c.imageUrl || '',
        caption: c.caption || '',
        duration: (metadata.duration as string) || '',
        aspectRatio: (metadata.aspectRatio as string) || '',
        style: (metadata.style as string) || '',
        metadata,
      };
    });
  },

  /**
   * Start instant video generation (one-click, like The Easy Button)
   * Fetches tenant services/specials, picks randomly, picks a random vibe, generates
   */
  async startInstantVideoGeneration(
    tenantId: string,
    userId: string
  ): Promise<VideoGenerationJob> {
    // Get tenant info + brand kit
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { brandKit: true },
    });

    const businessName = tenant?.name || 'Our Auto Shop';
    const tagline = tenant?.brandKit?.tagline;

    // Get services and specials for content
    const [services, specials] = await Promise.all([
      prisma.service.findMany({ where: { tenantId }, take: 20 }),
      prisma.special.findMany({
        where: {
          tenantId,
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
        take: 10,
      }),
    ]);

    // Build content pool
    let service = 'Full Service Auto Repair';
    let cta = 'Call us today!';

    if (specials.length > 0) {
      const special = specials[Math.floor(Math.random() * specials.length)];
      const discount =
        special.discountType === 'percentage'
          ? `${special.discountValue}% OFF`
          : special.discountType === 'fixed'
          ? `$${special.discountValue} OFF`
          : 'Special Offer';
      service = `${discount} - ${special.title}`;
      cta = special.description || 'Book your appointment today!';
    } else if (services.length > 0) {
      const svc = services[Math.floor(Math.random() * services.length)];
      service = svc.name;
      cta = svc.description || 'Visit us today!';
    }

    // Pick a random commercial vibe
    const vibe = COMMERCIAL_VIBES[Math.floor(Math.random() * COMMERCIAL_VIBES.length)];
    const prompt = vibe.buildPrompt(businessName, service, cta, tagline || undefined);

    // Create job
    const job = await prisma.batchJob.create({
      data: {
        tenantId,
        userId,
        jobType: 'video_generation',
        totalItems: 1,
        completedItems: 0,
        status: 'pending',
        metadata: {
          type: 'instant',
          vibe: vibe.id,
          prompt,
          service,
        } as any,
      },
    });

    logger.info('Instant video generation job created', {
      jobId: job.id,
      tenantId,
      vibe: vibe.id,
    });

    // Start async generation
    const input: VideoGenerationInput = {
      topic: service,
      style: 'commercial',
      aspectRatio: '9:16',
      duration: '8s',
      resolution: '720p',
    };

    this.processVideoGeneration(job.id, tenantId, userId, prompt, input).catch(
      (error) => {
        logger.error('Instant video generation failed', { jobId: job.id, error });
      }
    );

    return {
      id: job.id,
      tenantId: job.tenantId,
      userId: job.userId || '',
      status: 'pending',
      progress: 0,
      input,
      createdAt: job.createdAt,
    };
  },

  /**
   * Build animated flyer prompt using a preset
   */
  buildAnimatedFlyerPrompt(
    presetId: string,
    businessName: string,
    topic: string
  ): { prompt: string; negativePrompt: string } {
    const preset = ANIMATION_PRESETS[presetId as VideoAnimationPreset];
    if (!preset) {
      return { prompt: `Animate this flyer for "${businessName}" about "${topic}" into a dynamic, attention-grabbing video.`, negativePrompt: '' };
    }
    return {
      prompt: preset.buildPrompt(businessName, topic),
      negativePrompt: preset.negativePrompt,
    };
  },

  /**
   * Delete a video
   */
  async deleteVideo(tenantId: string, contentId: string): Promise<void> {
    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        tenantId,
        tool: 'video_creator',
      },
    });

    if (!content) {
      throw new Error('Video not found');
    }

    // Delete video file from disk if it exists
    const metadata = content.metadata as Record<string, unknown>;
    const videoUrl = metadata?.videoUrl as string | undefined;
    if (videoUrl) {
      const uploadsIdx = videoUrl.indexOf('/uploads/');
      if (uploadsIdx !== -1) {
        const relativePath = videoUrl.substring(uploadsIdx + '/uploads/'.length);
        await storageService.deleteFile(relativePath);
      }
    }

    // Delete from database
    await prisma.content.delete({
      where: { id: contentId },
    });

    logger.info('Deleted video', { tenantId, contentId });
  },
};

export default videoCreatorService;
