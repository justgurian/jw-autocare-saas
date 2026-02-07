/**
 * Director's Cut Studio Service
 * Animates static flyers using Veo image-to-video with curated effects
 */

import * as fs from 'fs';
import { prisma } from '../../db/client';
import { logger } from '../../utils/logger';
import { storageService } from '../../services/storage.service';
import { veoService, VeoConfig } from '../../services/veo.service';
import { AnimationEffect, EFFECTS, getEffectById } from './effects';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnimationInput {
  flyerId: string;
  effectId: string;
  aspectRatio?: '16:9' | '9:16';
  duration?: number;
}

export interface VideoGenerationJob {
  id: string;
  tenantId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
  createdAt: Date;
}

export interface GeneratedVideo {
  id: string;
  videoUrl: string;
  caption: string;
  effectId?: string;
  flyerId?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// Global negative prompt for all Director's Cut animations
const GLOBAL_NEGATIVE_PROMPT = 'warping text, distorted letters, moving logos, morphing text';

// ─── Service ─────────────────────────────────────────────────────────────────

export const directorsCutService = {
  /**
   * Get all available animation effects
   */
  getEffects(): AnimationEffect[] {
    return EFFECTS;
  },

  /**
   * Start a flyer animation job
   */
  async startAnimation(
    tenantId: string,
    userId: string,
    input: AnimationInput
  ): Promise<VideoGenerationJob> {
    // Validate effect
    const effect = getEffectById(input.effectId);
    if (!effect) {
      throw new Error(`Effect not found: ${input.effectId}`);
    }

    // Fetch the flyer content record
    const flyer = await prisma.content.findFirst({
      where: { id: input.flyerId, tenantId },
    });

    if (!flyer) {
      throw new Error('Flyer not found');
    }

    // Extract image data — handle both data URLs and file URLs (same pattern as video-creator.routes.ts from-flyer)
    const imageUrl = flyer.imageUrl || '';
    let mimeType: string;
    let base64: string;

    const dataUrlMatch = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      base64 = dataUrlMatch[2];
    } else if (imageUrl.startsWith('http')) {
      const uploadsIdx = imageUrl.indexOf('/uploads/');
      let imageBuffer: Buffer;

      if (uploadsIdx !== -1) {
        const relativePath = imageUrl.substring(uploadsIdx + '/uploads/'.length);
        const localPath = storageService.getLocalPath(relativePath);
        if (!fs.existsSync(localPath)) {
          throw new Error('Flyer image file not found on disk');
        }
        imageBuffer = fs.readFileSync(localPath);
        const ext = relativePath.split('.').pop()?.toLowerCase();
        mimeType =
          ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : ext === 'webp'
            ? 'image/webp'
            : 'image/png';
      } else {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch flyer image from URL');
        }
        imageBuffer = Buffer.from(await response.arrayBuffer());
        mimeType = response.headers.get('content-type') || 'image/png';
      }

      base64 = imageBuffer.toString('base64');
    } else {
      throw new Error('Flyer does not have a valid image');
    }

    // Create job record
    const job = await prisma.batchJob.create({
      data: {
        tenantId,
        userId,
        jobType: 'directors_cut',
        totalItems: 1,
        completedItems: 0,
        status: 'pending',
        metadata: {
          type: 'directors_cut',
          flyerId: input.flyerId,
          effectId: input.effectId,
          prompt: effect.prompt,
        } as any,
      },
    });

    logger.info("Director's Cut animation job created", {
      jobId: job.id,
      tenantId,
      flyerId: input.flyerId,
      effectId: input.effectId,
    });

    // Fire-and-forget async generation
    this.processAnimation(job.id, tenantId, userId, effect, base64, mimeType, input, flyer.title || 'Animated Flyer').catch(
      (err) => {
        logger.error("Director's Cut animation failed", { jobId: job.id, error: err });
      }
    );

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
   * Process animation asynchronously
   */
  async processAnimation(
    jobId: string,
    tenantId: string,
    userId: string,
    effect: AnimationEffect,
    imageBase64: string,
    imageMimeType: string,
    input: AnimationInput,
    flyerTitle: string
  ): Promise<void> {
    try {
      await prisma.batchJob.update({
        where: { id: jobId },
        data: { status: 'processing', startedAt: new Date() },
      });

      // Combine global + effect negative prompts
      const combinedNegative = [GLOBAL_NEGATIVE_PROMPT, effect.negativePrompt]
        .filter(Boolean)
        .join(', ');

      const veoConfig: VeoConfig = {
        aspectRatio: input.aspectRatio || '9:16',
        durationSeconds: input.duration || 8,
        resolution: '720p',
        negativePrompt: combinedNegative,
      };

      const result = await veoService.generateVideoFromImage(
        effect.prompt,
        { imageBytes: imageBase64, mimeType: imageMimeType },
        veoConfig
      );

      if (!result.success) {
        throw new Error(result.error || 'Animation generation failed');
      }

      const tempContentId = `dc_${jobId}`;
      const { url: videoUrl } = await storageService.saveVideo(
        result.videoData!,
        tenantId,
        tempContentId
      );

      const caption = `${effect.name} - Animated flyer`;

      const content = await prisma.content.create({
        data: {
          tenantId,
          userId,
          tool: 'directors_cut',
          contentType: 'video',
          title: `Director's Cut - ${flyerTitle} (${effect.name})`,
          imageUrl: '',
          caption,
          status: 'approved',
          moderationStatus: 'passed',
          metadata: {
            videoUrl,
            flyerId: input.flyerId,
            effectId: input.effectId,
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

      logger.info("Director's Cut animation completed", { jobId, contentId: content.id });
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

      logger.error("Director's Cut animation failed", { jobId, error: errorMessage });
      throw error;
    }
  },

  /**
   * Get job status with progress estimate
   */
  async getJobStatus(tenantId: string, jobId: string): Promise<VideoGenerationJob | null> {
    const job = await prisma.batchJob.findFirst({
      where: { id: jobId, tenantId, jobType: 'directors_cut' },
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
      error: metadata.error as string | undefined,
      createdAt: job.createdAt,
    };
  },

  /**
   * Get recent Director's Cut animations for a tenant
   */
  async getRecentAnimations(tenantId: string, options: { limit?: number } = {}): Promise<GeneratedVideo[]> {
    const { limit = 20 } = options;

    const content = await prisma.content.findMany({
      where: { tenantId, tool: 'directors_cut' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return content.map((c) => {
      const metadata = c.metadata as Record<string, unknown>;
      return {
        id: c.id,
        videoUrl: (metadata.videoUrl as string) || '',
        caption: c.caption || '',
        effectId: metadata.effectId as string | undefined,
        flyerId: metadata.flyerId as string | undefined,
        metadata,
        createdAt: c.createdAt,
      };
    });
  },
};

export default directorsCutService;
