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

import { GoogleGenAI } from '@google/genai';

// Veo 3.1 Video generation via Gemini API
const veoAI = new GoogleGenAI({ apiKey: config.gemini.apiKey });

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
   * Process video generation (async) using Veo 2
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
        throw new Error('Gemini API key not configured. Set GEMINI_API_KEY to enable Veo 2 video generation.');
      }

      // Call Veo 2 video generation API
      const videoResult = await this.callVideoGenerationAPI(prompt, input);

      if (!videoResult.success) {
        throw new Error(videoResult.error || 'Video generation failed');
      }

      // Convert video data to base64 data URL for storage
      const videoDataUrl = `data:video/mp4;base64,${videoResult.videoData!.toString('base64')}`;

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
            videoUrl: videoDataUrl,
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
            videoUrl: videoDataUrl,
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

      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          failedItems: 1,
          completedAt: new Date(),
          metadata: { error: errorMessage },
        },
      });

      logger.error('Video generation failed', { jobId, error: errorMessage });
      throw error;
    }
  },

  /**
   * Call Veo 2 video generation API
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
    try {
      // Map options to Veo 3.1 format
      const aspectRatio = input.aspectRatio === '9:16' ? '9:16' : '16:9';
      const durationSeconds = parseInt(input.duration) || 8;
      const resolution = input.resolution || (durationSeconds === 8 ? '1080p' : '720p');

      // Start Veo 3.1 video generation
      let operation = await veoAI.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt,
        config: {
          aspectRatio,
          numberOfVideos: 1,
          durationSeconds,
          resolution,
        } as any,
      });

      // Poll until complete (Veo 3.1 is async — takes 1-3 minutes)
      let pollCount = 0;
      const maxPolls = 30; // 5 minutes max
      while (!operation.done && pollCount < maxPolls) {
        await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 seconds
        pollCount++;
        operation = await veoAI.operations.getVideosOperation({
          operation: operation,
        });
        logger.info('Veo 2 poll', { pollCount, done: operation.done });
      }

      if (!operation.done) {
        return { success: false, error: 'Video generation timed out after 5 minutes' };
      }

      // Extract video data
      const generatedVideo = operation.response?.generatedVideos?.[0];
      if (!generatedVideo?.video) {
        return { success: false, error: 'No video in response' };
      }

      // Get video bytes
      const videoData = Buffer.from(generatedVideo.video.videoBytes || []);

      return {
        success: true,
        videoData,
      };
    } catch (error: any) {
      logger.error('Veo 2 video generation failed', { error: error.message });

      if (error.message?.includes('SAFETY')) {
        return { success: false, error: 'Video blocked by safety filters. Try a different prompt.' };
      }

      return { success: false, error: error.message || 'Video generation failed' };
    }
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
      progress: job.status === 'completed' ? 100 : job.status === 'processing' ? 50 : 0,
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

    // Delete from database (video data is stored as base64 in metadata, no external storage to clean up)
    await prisma.content.delete({
      where: { id: contentId },
    });

    logger.info('Deleted video', { tenantId, contentId });
  },
};

export default videoCreatorService;
