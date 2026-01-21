/**
 * Check-In To Win Routes
 * API endpoints for the gamified check-in feature
 */

import { Router, Request, Response, NextFunction } from 'express';
import { checkInService } from './check-in.service';
import { CheckInFormData, Prize, DEFAULT_PRIZES } from './check-in.types';
import { authenticate, AuthenticatedUser } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { logger } from '../../utils/logger';
import { CAR_MAKES, CAR_MODELS, CAR_YEARS, CAR_COLORS } from '../../constants/vehicles';

// Extend Request type for authenticated routes
interface AuthRequest extends Request {
  user?: AuthenticatedUser & { tenant: { name: string } };
}

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(tenantContext);

/**
 * GET /vehicles
 * Get vehicle constants (makes, models, years, colors) for form dropdowns
 */
router.get('/vehicles', async (_req: Request, res: Response) => {
  res.json({
    makes: CAR_MAKES,
    models: CAR_MODELS,
    years: CAR_YEARS,
    colors: CAR_COLORS,
  });
});

/**
 * GET /prizes
 * Get prize configuration for the tenant
 */
router.get('/prizes', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const prizes = await checkInService.getPrizeConfiguration(tenantId);

    res.json({
      prizes,
      defaults: DEFAULT_PRIZES,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /prizes
 * Update prize configuration (owner/manager only)
 */
router.put('/prizes', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const userRole = req.user!.role;

    // Only owners and managers can update prizes
    if (!['owner', 'manager', 'super_admin'].includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only owners and managers can update prize configuration',
      });
    }

    const { prizes } = req.body as { prizes: Prize[] };

    if (!prizes || !Array.isArray(prizes) || prizes.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Prizes array is required',
      });
    }

    // Validate prize structure
    for (const prize of prizes) {
      if (!prize.id || !prize.label || typeof prize.probability !== 'number') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Each prize must have id, label, and probability',
        });
      }
      if (prize.probability < 0 || prize.probability > 1) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Prize probability must be between 0 and 1',
        });
      }
    }

    const config = await checkInService.updatePrizeConfiguration(tenantId, prizes);

    res.json({
      message: 'Prize configuration updated',
      config,
    });
  } catch (error: any) {
    if (error.message?.includes('sum to 1')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * POST /submit
 * Submit check-in form data (Step 1)
 */
router.post('/submit', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = req.body as CheckInFormData;

    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Customer name is required',
      });
    }

    const submission = await checkInService.submitCheckIn(tenantId, data);

    res.status(201).json({
      message: 'Check-in submitted successfully',
      submission,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /spin
 * Spin the prize wheel (Step 3)
 */
router.post('/spin', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { submissionId } = req.body as { submissionId: string };

    if (!submissionId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'submissionId is required',
      });
    }

    const result = await checkInService.spinPrizeWheel(tenantId, submissionId);

    res.json({
      message: 'Congratulations!',
      result,
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }
    if (error.message?.includes('already won')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * POST /generate
 * Generate Action Figure Meme (Step 4)
 */
router.post(
  '/generate',
  generationRateLimiter,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.user!.id;

      const { submissionId, personImage, logos } = req.body as {
        submissionId: string;
        personImage: { base64: string; mimeType: string };
        logos?: Array<{ base64: string; mimeType: string }>;
      };

      if (!submissionId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'submissionId is required',
        });
      }

      if (!personImage || !personImage.base64) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'personImage with base64 data is required',
        });
      }

      const result = await checkInService.generateActionFigure(tenantId, userId, {
        submissionId,
        personImage,
        logos,
      });

      res.json({
        message: 'Action figure generated successfully!',
        result,
      });
    } catch (error: any) {
      logger.error('Action figure generation failed', { error: error.message });

      if (error.message?.includes('not found')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }
      if (error.message?.includes('No prize')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      }

      next(error);
    }
  }
);

/**
 * POST /redeem
 * Redeem a prize
 */
router.post('/redeem', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { validationCode } = req.body as { validationCode: string };

    if (!validationCode) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'validationCode is required',
      });
    }

    const submission = await checkInService.redeemPrize(tenantId, validationCode);

    res.json({
      message: 'Prize redeemed successfully!',
      submission,
    });
  } catch (error: any) {
    if (error.message?.includes('Invalid validation code')) {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }
    if (error.message?.includes('already been redeemed')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * GET /validate/:code
 * Validate a prize code without redeeming
 */
router.get('/validate/:code', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { code } = req.params;

    const result = await checkInService.validatePrizeCode(tenantId, code);

    if (!result.valid) {
      return res.status(result.submission ? 409 : 404).json({
        valid: false,
        error: result.error,
        submission: result.submission,
      });
    }

    res.json({
      valid: true,
      submission: result.submission,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /submissions
 * Get recent check-in submissions
 */
router.get('/submissions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const includeRedeemed = req.query.includeRedeemed !== 'false';

    const submissions = await checkInService.getRecentCheckIns(tenantId, {
      limit: Math.min(limit, 100),
      includeRedeemed,
    });

    res.json({
      submissions,
      count: submissions.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /submissions/:id
 * Get a specific submission
 */
router.get('/submissions/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    const submissions = await checkInService.getRecentCheckIns(tenantId, { limit: 1000 });
    const submission = submissions.find((s) => s.id === id);

    if (!submission) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Submission not found',
      });
    }

    res.json({ submission });
  } catch (error) {
    next(error);
  }
});

export default router;
