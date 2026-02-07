/**
 * Celebration Video Generator Routes
 * Endpoints for creating celebration videos (birthday, anniversary, milestone, etc.)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { celebrationService } from './celebration.service';
import { CelebrationType, CELEBRATION_TEMPLATES } from './celebration.types';
import { CELEBRATION_SCENARIOS, PERSON_TAGS, OCCASION_TAGS } from './scenarios';
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
 * GET /api/v1/tools/celebration/scenarios
 * Get all celebration scenarios, person tags, and occasion tags
 */
router.get('/scenarios', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: {
        scenarios: CELEBRATION_SCENARIOS,
        personTags: PERSON_TAGS,
        occasionTags: OCCASION_TAGS,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/celebration/generate
 * Start celebration video generation (supports both new scenario and legacy template modes)
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;
    const {
      // New fields
      scenarioId,
      personTags,
      inputSource,
      mascotId,
      occasion,
      // Legacy fields
      celebrationType,
      customDetails,
      // Common
      personName,
      customMessage,
      photoBase64,
      photoMimeType,
      aspectRatio,
      duration,
    } = req.body;

    // Validate: must have either scenarioId or celebrationType
    if (!scenarioId && !celebrationType) {
      return res.status(400).json({ success: false, error: 'scenarioId or celebrationType is required' });
    }

    if (!personName) {
      return res.status(400).json({ success: false, error: 'personName is required' });
    }

    // New mode validation
    if (scenarioId) {
      const validScenario = CELEBRATION_SCENARIOS.find(s => s.id === scenarioId);
      if (!validScenario) {
        return res.status(400).json({ success: false, error: 'Invalid scenarioId' });
      }

      const source = inputSource || 'photo';
      if (source === 'photo' && (!photoBase64 || !photoMimeType)) {
        return res.status(400).json({ success: false, error: 'photoBase64 and photoMimeType required for photo mode' });
      }
      if (source === 'mascot' && !mascotId) {
        return res.status(400).json({ success: false, error: 'mascotId required for mascot mode' });
      }
    } else {
      // Legacy mode: require photo
      if (!photoBase64 || !photoMimeType) {
        return res.status(400).json({ success: false, error: 'photoBase64 and photoMimeType are required' });
      }
    }

    // Validate aspect ratio and duration
    if (aspectRatio && !['16:9', '9:16'].includes(aspectRatio)) {
      return res.status(400).json({ success: false, error: 'Invalid aspectRatio' });
    }
    if (duration && !['4s', '6s', '8s'].includes(duration)) {
      return res.status(400).json({ success: false, error: 'Invalid duration' });
    }

    logger.info('Celebration video generation requested', {
      tenantId, userId, scenarioId: scenarioId || celebrationType, personName,
    });

    const job = await celebrationService.startGeneration(tenantId, userId, {
      scenarioId,
      celebrationType,
      personName,
      customMessage,
      customDetails,
      photoBase64,
      photoMimeType,
      personTags,
      inputSource: inputSource || (scenarioId ? undefined : 'photo'),
      mascotId,
      occasion,
      aspectRatio,
      duration,
    });

    res.json({
      success: true,
      data: { job, message: 'Celebration video generation started.' },
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
