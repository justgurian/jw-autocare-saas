/**
 * Celebration Video Generator Routes
 * Endpoints for creating celebration videos (birthday, anniversary, milestone, etc.)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { celebrationService } from './celebration.service';
import { CelebrationType, CELEBRATION_TEMPLATES } from './celebration.types';
import { logger } from '../../utils/logger';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/celebration/templates
 * Get all celebration templates
 */
router.get('/templates', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = celebrationService.getTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/celebration/generate
 * Start celebration video generation
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const {
      celebrationType,
      personName,
      customMessage,
      customDetails,
      photoBase64,
      photoMimeType,
      aspectRatio,
      duration,
    } = req.body;

    // Validate required fields
    if (!celebrationType || !personName || !photoBase64 || !photoMimeType) {
      return res.status(400).json({
        success: false,
        error: 'celebrationType, personName, photoBase64, and photoMimeType are required',
      });
    }

    // Validate celebration type
    const validTypes: CelebrationType[] = [
      'birthday',
      'work-anniversary',
      'milestone',
      'retirement',
      'employee-of-month',
      'grand-opening',
      'custom',
    ];
    if (!validTypes.includes(celebrationType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid celebrationType. Valid options: ${validTypes.join(', ')}`,
      });
    }

    // Validate aspect ratio
    if (aspectRatio && !['16:9', '9:16'].includes(aspectRatio)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid aspectRatio. Valid options: 16:9, 9:16',
      });
    }

    // Validate duration
    if (duration && !['4s', '6s', '8s'].includes(duration)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid duration. Valid options: 4s, 6s, 8s',
      });
    }

    logger.info('Celebration video generation requested', {
      tenantId,
      userId,
      celebrationType,
      personName,
    });

    const job = await celebrationService.startGeneration(tenantId, userId, {
      celebrationType,
      personName,
      customMessage,
      customDetails,
      photoBase64,
      photoMimeType,
      aspectRatio,
      duration,
    });

    res.json({
      success: true,
      data: {
        job,
        message: 'Celebration video generation started. Poll the status endpoint for updates.',
      },
    });
  } catch (error) {
    logger.error('Celebration video generation request failed', { error });
    next(error);
  }
});

/**
 * GET /api/v1/tools/celebration/jobs/:jobId
 * Get celebration video job status
 */
router.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const jobId = req.params.jobId;

    const job = await celebrationService.getJobStatus(tenantId, jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

export default router;
