/**
 * Celebration Video Generator Service
 * Creates celebration videos (birthdays, anniversaries, milestones, etc.)
 * using Veo 3.1 with a reference photo.
 */

import { prisma } from '../../db/client';
import { logger } from '../../utils/logger';
import { storageService } from '../../services/storage.service';
import { veoService, VeoConfig } from '../../services/veo.service';
import {
  CelebrationInput,
  CelebrationTemplate,
  CelebrationType,
  CELEBRATION_TEMPLATES,
} from './celebration.types';

interface CelebrationJob {
  id: string;
  tenantId: string;
  userId: string;
  status: string;
  progress: number;
  videoUrl?: string;
  caption?: string;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export const celebrationService = {
  getTemplates(): CelebrationTemplate[] {
    return CELEBRATION_TEMPLATES;
  },

  getTemplate(id: CelebrationType): CelebrationTemplate | undefined {
    return CELEBRATION_TEMPLATES.find((t) => t.id === id);
  },

  async startGeneration(
    tenantId: string,
    userId: string,
    input: CelebrationInput
  ): Promise<CelebrationJob> {
    const template = CELEBRATION_TEMPLATES.find(
      (t) => t.id === input.celebrationType
    );
    if (!template) {
      throw new Error(`Unknown celebration type: ${input.celebrationType}`);
    }

    // Build prompt from template
    const message = input.customMessage
      ? `${input.personName} - ${input.customMessage}`
      : `${input.personName} - ${template.defaultMessage}`;

    let prompt = template.prompt.replace('[MESSAGE]', message);
    if (input.customDetails) {
      prompt = prompt.replace('[CUSTOM_DETAILS]', input.customDetails);
    } else {
      prompt = prompt.replace('[CUSTOM_DETAILS]', '');
    }

    // Create batch job
    const job = await prisma.batchJob.create({
      data: {
        tenantId,
        userId,
        jobType: 'celebration_video',
        totalItems: 1,
        completedItems: 0,
        status: 'pending',
        metadata: {
          celebrationType: input.celebrationType,
          personName: input.personName,
          customMessage: input.customMessage,
          prompt,
        } as any,
      },
    });

    logger.info('Celebration video job created', {
      jobId: job.id,
      tenantId,
      celebrationType: input.celebrationType,
      personName: input.personName,
    });

    // Fire-and-forget async processing
    this.processGeneration(job.id, tenantId, userId, prompt, input).catch(
      (error) => {
        logger.error('Celebration video generation failed', {
          jobId: job.id,
          error: error instanceof Error ? error.message : error,
        });
      }
    );

    return {
      id: job.id,
      tenantId: job.tenantId,
      userId: job.userId || '',
      status: 'pending',
      progress: 0,
      createdAt: job.createdAt,
    };
  },

  async processGeneration(
    jobId: string,
    tenantId: string,
    userId: string,
    prompt: string,
    input: CelebrationInput
  ): Promise<void> {
    try {
      // Update job to processing
      await prisma.batchJob.update({
        where: { id: jobId },
        data: { status: 'processing', startedAt: new Date() },
      });

      const veoConfig: VeoConfig = {
        aspectRatio: input.aspectRatio || '9:16',
        durationSeconds: parseInt(input.duration || '8s') || 8,
        resolution: '720p',
      };

      // Generate video from photo using Veo
      const result = await veoService.generateVideoFromImage(
        prompt,
        {
          imageBytes: input.photoBase64,
          mimeType: input.photoMimeType,
        },
        veoConfig
      );

      if (!result.success) {
        throw new Error(result.error || 'Celebration video generation failed');
      }

      // Save video to disk
      const contentId = `cel_${jobId}`;
      const { url: videoUrl } = await storageService.saveVideo(
        result.videoData!,
        tenantId,
        contentId
      );

      // Create Content record
      const template = CELEBRATION_TEMPLATES.find(
        (t) => t.id === input.celebrationType
      );
      const content = await prisma.content.create({
        data: {
          tenantId,
          userId,
          tool: 'celebration',
          contentType: 'video',
          title: `${template?.name || 'Celebration'} - ${input.personName}`,
          imageUrl: '',
          caption: input.customMessage || template?.defaultMessage || '',
          status: 'approved',
          moderationStatus: 'passed',
          metadata: {
            videoUrl,
            celebrationType: input.celebrationType,
            personName: input.personName,
            customMessage: input.customMessage,
            duration: input.duration || '8s',
            aspectRatio: input.aspectRatio || '9:16',
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
          },
        },
      });

      // Log usage
      await prisma.usageLog.create({
        data: {
          tenantId,
          userId,
          action: 'video_gen',
          tool: 'celebration',
          creditsUsed: 1,
          metadata: { contentId: content.id, jobId },
        },
      });

      logger.info('Celebration video completed', {
        jobId,
        contentId: content.id,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

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

      logger.error('Celebration video generation failed', {
        jobId,
        error: errorMessage,
      });
      throw error;
    }
  },

  async getJobStatus(
    tenantId: string,
    jobId: string
  ): Promise<CelebrationJob | null> {
    const job = await prisma.batchJob.findFirst({
      where: {
        id: jobId,
        tenantId,
        jobType: 'celebration_video',
      },
    });

    if (!job) return null;

    const metadata = job.metadata as Record<string, unknown>;

    return {
      id: job.id,
      tenantId: job.tenantId,
      userId: job.userId || '',
      status: job.status,
      progress: (() => {
        if (job.status === 'completed') return 100;
        if (job.status === 'failed') return 0;
        if (job.status === 'processing' && job.startedAt) {
          const elapsedMs = Date.now() - job.startedAt.getTime();
          const elapsedSec = elapsedMs / 1000;
          const estimatedTotalSec = 180;
          const pct = Math.min(
            95,
            Math.round((elapsedSec / estimatedTotalSec) * 100)
          );
          return Math.max(5, pct);
        }
        return 0;
      })(),
      videoUrl: metadata.videoUrl as string | undefined,
      caption: metadata.caption as string | undefined,
      error: metadata.error as string | undefined,
      startedAt: job.startedAt || undefined,
      completedAt: job.completedAt || undefined,
      createdAt: job.createdAt,
    };
  },
};

export default celebrationService;
