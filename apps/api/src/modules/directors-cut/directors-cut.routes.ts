/**
 * Director's Cut Studio Routes
 * API endpoints for flyer-to-video animation with curated effects
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { directorsCutService } from './directors-cut.service';
import { logger } from '../../utils/logger';

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/directors-cut/effects
 * Get all available animation effects
 */
router.get('/effects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const effects = directorsCutService.getEffects();
    res.json({ success: true, data: effects });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/directors-cut/animate/:flyerId
 * Animate a flyer with a selected effect
 */
router.post('/animate/:flyerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;
    const flyerId = req.params.flyerId;

    const { effectId, aspectRatio, duration } = req.body;

    if (!effectId) {
      return res.status(400).json({ success: false, error: 'effectId is required' });
    }

    if (aspectRatio && !['16:9', '9:16'].includes(aspectRatio)) {
      return res.status(400).json({ success: false, error: 'Invalid aspectRatio. Use 16:9 or 9:16' });
    }

    logger.info("Director's Cut animation requested", { tenantId, userId, flyerId, effectId });

    const job = await directorsCutService.startAnimation(tenantId, userId, {
      flyerId,
      effectId,
      aspectRatio: aspectRatio || '9:16',
      duration: duration ? parseInt(duration) : 8,
    });

    res.json({
      success: true,
      data: {
        job,
        message: "Director's Cut animation started. Poll the job status endpoint for updates.",
      },
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    logger.error("Director's Cut animation request failed", { error });
    next(error);
  }
});

/**
 * GET /api/v1/tools/directors-cut/jobs/:jobId
 * Get animation job status
 */
router.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const job = await directorsCutService.getJobStatus(tenantId, req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/directors-cut/history
 * Get recent animations
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const videos = await directorsCutService.getRecentAnimations(tenantId, { limit });

    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
});

export default router;
