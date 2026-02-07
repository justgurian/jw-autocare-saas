/**
 * Video Creator Routes
 * API endpoints for AI-powered video generation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { videoCreatorService } from './video-creator.service';
import { VIDEO_TEMPLATES, VIDEO_OPTIONS, VideoStyle, VideoAspectRatio, VideoDuration, VideoGenerationInput } from './video-creator.types';
import { ANIMATION_PRESET_OPTIONS, ANIMATION_PRESETS, VideoAnimationPreset } from './video-creator.prompts';
import { logger } from '../../utils/logger';
import { prisma } from '../../db/client';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import * as fs from 'fs';
import { storageService } from '../../services/storage.service';

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/video-creator/templates
 * Get all video templates
 */
router.get('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = videoCreatorService.getTemplates();

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/video-creator/templates/:id
 * Get a specific template
 */
router.get('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = videoCreatorService.getTemplate(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/video-creator/options
 * Get available video options (styles, durations, aspect ratios)
 */
router.get('/options', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: {
        ...VIDEO_OPTIONS,
        animationPresets: ANIMATION_PRESET_OPTIONS,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/video-creator/generate
 * Start video generation
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    logger.debug('POST /generate hit', { tenantId, userId, body: req.body });

    const {
      templateId,
      customPrompt,
      topic,
      serviceHighlight,
      callToAction,
      style,
      aspectRatio,
      duration,
      voiceoverText,
      referenceImages,
      resolution,
      mascotId,
    } = req.body;

    // Validate required fields
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required',
      });
    }

    // Validate style
    const validStyles: VideoStyle[] = ['cinematic', 'commercial', 'social-media', 'documentary', 'animated', 'retro'];
    if (style && !validStyles.includes(style)) {
      return res.status(400).json({
        success: false,
        error: `Invalid style. Valid options: ${validStyles.join(', ')}`,
      });
    }

    // Validate aspect ratio
    const validAspectRatios: VideoAspectRatio[] = ['16:9', '9:16'];
    if (aspectRatio && !validAspectRatios.includes(aspectRatio)) {
      return res.status(400).json({
        success: false,
        error: `Invalid aspect ratio. Valid options: ${validAspectRatios.join(', ')}`,
      });
    }

    // Validate duration
    const validDurations: VideoDuration[] = ['4s', '6s', '8s'];
    if (duration && !validDurations.includes(duration)) {
      return res.status(400).json({
        success: false,
        error: `Invalid duration. Valid options: ${validDurations.join(', ')}`,
      });
    }

    logger.info('Video generation requested', {
      tenantId,
      userId,
      topic,
      style,
      templateId,
    });

    const job = await videoCreatorService.startVideoGeneration(tenantId, userId, {
      templateId,
      customPrompt,
      topic,
      serviceHighlight,
      callToAction,
      style: style || 'commercial',
      aspectRatio: aspectRatio || '9:16',
      duration: duration || '8s',
      resolution: resolution || '720p',
      voiceoverText,
      referenceImages,
      mascotId,
    });

    res.json({
      success: true,
      data: {
        job,
        message: 'Video generation started. Poll the status endpoint for updates.',
      },
    });
  } catch (error) {
    logger.error('Video generation request failed', { error });
    next(error);
  }
});

/**
 * POST /api/v1/tools/video-creator/from-flyer/:flyerId
 * Animate a flyer into a video
 */
router.post('/from-flyer/:flyerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const { style, aspectRatio, duration, resolution, animationPreset } = req.body;

    // Fetch the flyer content record
    const flyer = await prisma.content.findFirst({
      where: { id: req.params.flyerId, tenantId },
    });

    if (!flyer) {
      return res.status(404).json({
        success: false,
        error: 'Flyer not found',
      });
    }

    // Extract image data — handle both base64 data URLs and file URLs
    const imageUrl = flyer.imageUrl || '';
    let mimeType: string;
    let base64: string;

    const dataUrlMatch = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUrlMatch) {
      // Legacy path: base64 data URL
      mimeType = dataUrlMatch[1];
      base64 = dataUrlMatch[2];
    } else if (imageUrl.startsWith('http')) {
      // File URL path: fetch the image and convert to base64
      try {
        // Check if it's a local uploads URL — read directly from disk
        const uploadsIdx = imageUrl.indexOf('/uploads/');
        let imageBuffer: Buffer;

        if (uploadsIdx !== -1) {
          const relativePath = imageUrl.substring(uploadsIdx + '/uploads/'.length);
          const localPath = storageService.getLocalPath(relativePath);
          if (!fs.existsSync(localPath)) {
            return res.status(400).json({
              success: false,
              error: 'Flyer image file not found on disk',
            });
          }
          imageBuffer = fs.readFileSync(localPath);
          // Infer mime type from extension
          const ext = relativePath.split('.').pop()?.toLowerCase();
          mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
            : ext === 'webp' ? 'image/webp'
            : 'image/png';
        } else {
          // Remote URL: fetch it
          const response = await fetch(imageUrl);
          if (!response.ok) {
            return res.status(400).json({
              success: false,
              error: 'Failed to fetch flyer image from URL',
            });
          }
          imageBuffer = Buffer.from(await response.arrayBuffer());
          mimeType = response.headers.get('content-type') || 'image/png';
        }

        base64 = imageBuffer.toString('base64');
      } catch (fetchError) {
        logger.error('Failed to fetch flyer image', { imageUrl, error: fetchError });
        return res.status(400).json({
          success: false,
          error: 'Failed to retrieve flyer image',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Flyer does not have a valid image',
      });
    }

    // Get business name for preset prompts
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const businessName = tenant?.name || 'Our Auto Shop';

    // Build preset prompt if animation preset is specified
    let presetPrompt: { prompt: string; negativePrompt: string } | undefined;
    if (animationPreset) {
      presetPrompt = videoCreatorService.buildAnimatedFlyerPrompt(
        animationPreset,
        businessName,
        flyer.title || 'Promotional Video'
      );
    }

    // Build video generation input from flyer data
    const input: VideoGenerationInput = {
      topic: flyer.title || 'Promotional Video',
      style: style || 'commercial',
      aspectRatio: aspectRatio || '9:16',
      duration: duration || '8s',
      resolution: resolution || '720p',
      animationPreset: animationPreset || undefined,
      negativePrompt: presetPrompt?.negativePrompt || undefined,
      referenceImages: [
        {
          base64,
          mimeType,
        },
      ],
    };

    logger.info('Flyer-to-video generation requested', {
      tenantId,
      userId,
      flyerId: req.params.flyerId,
      style: input.style,
      animationPreset: animationPreset || 'none',
    });

    const job = await videoCreatorService.startVideoGeneration(tenantId, userId, input);

    res.json({
      success: true,
      data: {
        job,
        message: 'Flyer-to-video generation started. Poll the status endpoint for updates.',
      },
    });
  } catch (error) {
    logger.error('Flyer-to-video generation request failed', { error });
    next(error);
  }
});

/**
 * POST /api/v1/tools/video-creator/instant
 * One-click instant commercial generation
 */
router.post('/instant', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    logger.info('Instant video generation requested', { tenantId, userId });

    const job = await videoCreatorService.startInstantVideoGeneration(tenantId, userId);

    res.json({
      success: true,
      data: {
        job,
        message: 'Instant video generation started. Poll the status endpoint for updates.',
      },
    });
  } catch (error) {
    logger.error('Instant video generation request failed', { error });
    next(error);
  }
});

/**
 * GET /api/v1/tools/video-creator/jobs/:jobId
 * Get video generation job status
 */
router.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const jobId = req.params.jobId;

    const job = await videoCreatorService.getJobStatus(tenantId, jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/video-creator/history
 * Get recent video generations
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const videos = await videoCreatorService.getRecentVideos(tenantId, { limit });

    res.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/tools/video-creator/:id
 * Delete a video
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const contentId = req.params.id;

    await videoCreatorService.deleteVideo(tenantId, contentId);

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
