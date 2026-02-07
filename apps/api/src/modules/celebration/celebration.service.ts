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
import { CELEBRATION_SCENARIOS, buildCelebrationPrompt } from './scenarios';
import { fetchMascotAsBase64 } from '../../services/mascot.util';

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
    let prompt: string;
    let title: string;

    if (input.scenarioId) {
      // NEW scenario-based path
      const scenario = CELEBRATION_SCENARIOS.find(s => s.id === input.scenarioId);
      if (!scenario) throw new Error(`Unknown scenario: ${input.scenarioId}`);

      // Get business name from tenant
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      const businessName = tenant?.name || 'the auto shop';

      // Handle mascot source
      let mascotDescription: string | undefined;
      if (input.inputSource === 'mascot' && input.mascotId) {
        const mascotData = await fetchMascotAsBase64(input.mascotId, tenantId);
        if (mascotData) {
          mascotDescription = mascotData.characterPrompt;
        }
      }

      prompt = buildCelebrationPrompt({
        scenario,
        personName: input.personName,
        personTags: input.personTags || [],
        occasion: input.occasion,
        customMessage: input.customMessage,
        inputSource: input.inputSource || 'photo',
        mascotDescription,
        businessName,
      });

      title = `${scenario.name} - ${input.personName}`;
    } else {
      // LEGACY template-based path
      const template = CELEBRATION_TEMPLATES.find(t => t.id === input.celebrationType);
      if (!template) throw new Error(`Unknown celebration type: ${input.celebrationType}`);

      const message = input.customMessage
        ? `${input.personName} - ${input.customMessage}`
        : `${input.personName} - ${template.defaultMessage}`;

      prompt = template.prompt.replace('[MESSAGE]', message);
      if (input.customDetails) {
        prompt = prompt.replace('[CUSTOM_DETAILS]', input.customDetails);
      } else {
        prompt = prompt.replace('[CUSTOM_DETAILS]', '');
      }

      title = `${template.name} - ${input.personName}`;
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
          scenarioId: input.scenarioId,
          celebrationType: input.celebrationType,
          personName: input.personName,
          customMessage: input.customMessage,
          inputSource: input.inputSource || 'photo',
          mascotId: input.mascotId,
          prompt,
          title,
        } as any,
      },
    });

    logger.info('Celebration video job created', {
      jobId: job.id,
      tenantId,
      scenarioId: input.scenarioId || input.celebrationType,
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

      let result;
      const source = input.inputSource || 'photo';

      if (source === 'photo' && input.photoBase64) {
        // Photo mode — image-to-video
        result = await veoService.generateVideoFromImage(
          prompt,
          { imageBytes: input.photoBase64, mimeType: input.photoMimeType || 'image/jpeg' },
          veoConfig
        );
      } else if (source === 'mascot' && input.mascotId) {
        // Mascot mode — fetch mascot image, use as reference
        const mascotData = await fetchMascotAsBase64(input.mascotId, tenantId);
        if (mascotData) {
          result = await veoService.generateVideoFromImage(
            prompt,
            { imageBytes: mascotData.base64, mimeType: mascotData.mimeType },
            veoConfig
          );
        } else {
          // Fallback to text-only if mascot not found
          result = await veoService.generateVideo(prompt, veoConfig);
        }
      } else {
        // Generic mode — text-only
        result = await veoService.generateVideo(prompt, veoConfig);
      }

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

      // Get title from job metadata
      const jobRecord = await prisma.batchJob.findUnique({ where: { id: jobId } });
      const jobMeta = jobRecord?.metadata as Record<string, unknown>;
      const videoTitle = (jobMeta?.title as string) || `Celebration - ${input.personName}`;

      // Create Content record
      const content = await prisma.content.create({
        data: {
          tenantId,
          userId,
          tool: 'celebration',
          contentType: 'video',
          title: videoTitle,
          imageUrl: '',
          caption: input.customMessage || '',
          status: 'approved',
          moderationStatus: 'passed',
          metadata: {
            videoUrl,
            scenarioId: input.scenarioId,
            celebrationType: input.celebrationType,
            personName: input.personName,
            inputSource: source,
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
