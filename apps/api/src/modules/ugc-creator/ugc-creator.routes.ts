/**
 * UGC Creator Routes
 * API endpoints for character-based UGC video generation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { ugcCreatorService } from './ugc-creator.service';
import { SCENE_CATEGORIES } from './scenes';
import { logger } from '../../utils/logger';

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/ugc-creator/characters
 * Get available characters (built-in + custom mascots)
 */
router.get('/characters', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const characters = await ugcCreatorService.getCharacters(tenantId);

    res.json({ success: true, data: characters });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/ugc-creator/scenes
 * Get available scenes, optionally filtered by category
 */
router.get('/scenes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;

    if (category && !SCENE_CATEGORIES.includes(category as any)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Valid options: ${SCENE_CATEGORIES.join(', ')}`,
      });
    }

    const scenes = ugcCreatorService.getScenes(category);
    res.json({ success: true, data: scenes });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/ugc-creator/generate
 * Start UGC video generation
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const { sceneId, characterId, car, aspectRatio, duration, commercialScript } = req.body;

    if (!sceneId) {
      return res.status(400).json({ success: false, error: 'sceneId is required' });
    }
    if (!characterId) {
      return res.status(400).json({ success: false, error: 'characterId is required' });
    }

    // Validate aspect ratio
    if (aspectRatio && !['16:9', '9:16'].includes(aspectRatio)) {
      return res.status(400).json({ success: false, error: 'Invalid aspectRatio. Use 16:9 or 9:16' });
    }

    logger.info('UGC video generation requested', { tenantId, userId, sceneId, characterId });

    const job = await ugcCreatorService.startGeneration(tenantId, userId, {
      sceneId,
      characterId,
      car,
      aspectRatio: aspectRatio || '9:16',
      duration: duration ? parseInt(duration) : 8,
      commercialScript,
    });

    res.json({
      success: true,
      data: {
        job,
        message: 'UGC video generation started. Poll the job status endpoint for updates.',
      },
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    logger.error('UGC video generation request failed', { error });
    next(error);
  }
});

/**
 * GET /api/v1/tools/ugc-creator/jobs/:jobId
 * Get UGC video generation job status
 */
router.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const job = await ugcCreatorService.getJobStatus(tenantId, req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/ugc-creator/history
 * Get recent UGC video generations
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const videos = await ugcCreatorService.getRecentVideos(tenantId, { limit, offset });

    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/tools/ugc-creator/:id
 * Delete a UGC video
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    await ugcCreatorService.deleteVideo(tenantId, req.params.id);

    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Video not found') {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    next(error);
  }
});

export default router;
