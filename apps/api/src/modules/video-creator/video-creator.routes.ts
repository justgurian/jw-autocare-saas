/**
 * Video Creator Routes
 * API endpoints for AI-powered video generation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { videoCreatorService } from './video-creator.service';
import { VIDEO_TEMPLATES, VIDEO_OPTIONS, VideoStyle, VideoAspectRatio, VideoDuration } from './video-creator.types';
import { logger } from '../../utils/logger';

const router = Router();

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
      data: VIDEO_OPTIONS,
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
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const {
      templateId,
      customPrompt,
      topic,
      serviceHighlight,
      callToAction,
      style,
      aspectRatio,
      duration,
      includeLogoOverlay,
      includeMusicTrack,
      voiceoverText,
      referenceImages,
      resolution,
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
      includeLogoOverlay,
      includeMusicTrack,
      voiceoverText,
      referenceImages,
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
 * GET /api/v1/tools/video-creator/jobs/:jobId
 * Get video generation job status
 */
router.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const jobId = req.params.jobId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

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
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

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
    const tenantId = req.tenantId;
    const contentId = req.params.id;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

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
