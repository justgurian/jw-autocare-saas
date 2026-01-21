/**
 * Video Creator Service
 * Business logic for AI-powered video generation
 * Designed for Sora 2 integration (or compatible video generation API)
 */

import { prisma } from '../../db/client';
import { storageService } from '../../services/storage.service';
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

// Sora 2 / Video API configuration
const VIDEO_API_KEY = config.sora?.apiKey || process.env.SORA_API_KEY;
const VIDEO_API_URL = config.sora?.apiUrl || 'https://api.openai.com/v1/videos/generations';

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
      tagline,
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
          input,
          prompt,
          template: template.id,
        },
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
   * Process video generation (async)
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

      // Check if API key is configured
      if (!VIDEO_API_KEY) {
        // Simulate video generation for demo/development
        logger.warn('Video API key not configured, using simulation mode');
        await this.simulateVideoGeneration(jobId, tenantId, userId, input);
        return;
      }

      // Call Sora 2 / Video generation API
      const videoResult = await this.callVideoGenerationAPI(prompt, input);

      if (!videoResult.success) {
        throw new Error(videoResult.error || 'Video generation failed');
      }

      // Upload video to storage
      const videoBuffer = await this.downloadVideo(videoResult.videoUrl!);
      const videoFilename = `video-${jobId}-${Date.now()}.mp4`;
      const videoUrl = await storageService.uploadBuffer(
        videoBuffer,
        `tenants/${tenantId}/videos/${videoFilename}`,
        'video/mp4'
      );

      // Generate thumbnail (if API provides one or extract from video)
      const thumbnailUrl = videoResult.thumbnailUrl || videoUrl.replace('.mp4', '-thumb.jpg');

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
          imageUrl: thumbnailUrl,
          caption,
          status: 'approved',
          moderationStatus: 'passed',
          metadata: {
            videoUrl,
            thumbnailUrl,
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
            thumbnailUrl,
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
   * Call video generation API (Sora 2 or compatible)
   */
  async callVideoGenerationAPI(
    prompt: string,
    input: VideoGenerationInput
  ): Promise<{
    success: boolean;
    videoUrl?: string;
    thumbnailUrl?: string;
    error?: string;
  }> {
    try {
      // Sora 2 API call (structure may vary based on actual API)
      const response = await fetch(VIDEO_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VIDEO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sora-2',
          prompt,
          duration: input.duration,
          aspect_ratio: input.aspectRatio,
          style: input.style,
          // Include reference images if provided
          ...(input.referenceImages?.length && {
            reference_images: input.referenceImages.map((img) => ({
              data: img.base64,
              mime_type: img.mimeType,
            })),
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        videoUrl: data.data?.[0]?.url || data.url,
        thumbnailUrl: data.data?.[0]?.thumbnail || data.thumbnail,
      };
    } catch (error) {
      logger.error('Video API call failed', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API call failed',
      };
    }
  },

  /**
   * Simulate video generation for demo mode
   */
  async simulateVideoGeneration(
    jobId: string,
    tenantId: string,
    userId: string,
    input: VideoGenerationInput
  ): Promise<void> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Generate placeholder thumbnail using Gemini
    const { geminiService } = await import('../../services/gemini.service');

    const thumbnailPrompt = `Create a video thumbnail image for an auto repair shop promotional video.
Topic: ${input.topic}
Style: ${input.style}
This should look like a professional video thumbnail with a play button overlay.
Include bold text overlay and automotive imagery.`;

    const thumbnailResult = await geminiService.generateImage(thumbnailPrompt, {
      aspectRatio: input.aspectRatio === '16:9' ? '16:9' : '4:5',
    });

    let thumbnailUrl = '';
    if (thumbnailResult.success && thumbnailResult.imageData) {
      const filename = `video-thumb-${jobId}-${Date.now()}.png`;
      thumbnailUrl = await storageService.uploadBuffer(
        thumbnailResult.imageData,
        `tenants/${tenantId}/videos/${filename}`,
        'image/png'
      );
    }

    // Generate caption
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const caption = generateVideoCaption({
      topic: input.topic,
      style: input.style,
      businessName: tenant?.name || 'Our Shop',
      callToAction: input.callToAction,
    });

    // Create content record (video placeholder)
    const content = await prisma.content.create({
      data: {
        tenantId,
        userId,
        tool: 'video_creator',
        contentType: 'video',
        title: `Video - ${input.topic}`,
        imageUrl: thumbnailUrl,
        caption,
        status: 'draft', // Draft until real video is available
        moderationStatus: 'passed',
        metadata: {
          thumbnailUrl,
          duration: input.duration,
          aspectRatio: input.aspectRatio,
          style: input.style,
          jobId,
          isSimulated: true,
          note: 'Video API key not configured. This is a placeholder.',
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
          thumbnailUrl,
          caption,
          isSimulated: true,
        },
      },
    });

    logger.info('Simulated video generation completed', {
      jobId,
      contentId: content.id,
    });
  },

  /**
   * Download video from URL
   */
  async downloadVideo(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
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

    const metadata = content.metadata as Record<string, unknown>;

    // Delete video from storage
    if (metadata.videoUrl) {
      try {
        await storageService.deleteFile(metadata.videoUrl as string);
      } catch (error) {
        logger.warn('Failed to delete video from storage', { error });
      }
    }

    // Delete thumbnail
    if (content.imageUrl) {
      try {
        await storageService.deleteFile(content.imageUrl);
      } catch (error) {
        logger.warn('Failed to delete thumbnail from storage', { error });
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
