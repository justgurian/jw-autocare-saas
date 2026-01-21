/**
 * Video Creator Routes
 * API endpoints for AI-powered video generation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { videoCreatorService } from './video-creator.service';
import { VIDEO_TEMPLATES, VideoStyle, VideoAspectRatio, VideoDuration } from './video-creator.types';
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
    const options = {
      styles: [
        { id: 'cinematic', name: 'Cinematic', description: 'Hollywood-style dramatic' },
        { id: 'commercial', name: 'Commercial', description: 'Professional advertisement' },
        { id: 'social-media', name: 'Social Media', description: 'TikTok/Reels optimized' },
        { id: 'documentary', name: 'Documentary', description: 'Informative and educational' },
        { id: 'animated', name: 'Animated', description: 'Motion graphics style' },
        { id: 'retro', name: 'Retro', description: '1950s nostalgic style' },
      ],
      durations: [
        { id: '5s', name: '5 seconds', description: 'Quick teaser' },
        { id: '10s', name: '10 seconds', description: 'Short promo' },
        { id: '15s', name: '15 seconds', description: 'Standard social' },
        { id: '30s', name: '30 seconds', description: 'Full promo' },
      ],
      aspectRatios: [
        { id: '16:9', name: 'Landscape (16:9)', description: 'YouTube, Website' },
        { id: '9:16', name: 'Portrait (9:16)', description: 'TikTok, Reels, Stories' },
        { id: '1:1', name: 'Square (1:1)', description: 'Instagram Feed' },
        { id: '4:5', name: 'Portrait (4:5)', description: 'Instagram Feed' },
      ],
    };

    res.json({
      success: true,
      data: options,
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
    const validAspectRatios: VideoAspectRatio[] = ['16:9', '9:16', '1:1', '4:5'];
    if (aspectRatio && !validAspectRatios.includes(aspectRatio)) {
      return res.status(400).json({
        success: false,
        error: `Invalid aspect ratio. Valid options: ${validAspectRatios.join(', ')}`,
      });
    }

    // Validate duration
    const validDurations: VideoDuration[] = ['5s', '10s', '15s', '30s'];
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
      duration: duration || '15s',
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
