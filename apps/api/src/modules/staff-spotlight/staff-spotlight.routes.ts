import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { staffSpotlightService } from './staff-spotlight.service';
import { SPOTLIGHT_FORMATS, SPOTLIGHT_FORMAT_IDS } from './spotlight-formats';
import { logger } from '../../utils/logger';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

const generateSchema = z.object({
  photoBase64: z.string().refine((v) => v.startsWith('data:image/'), {
    message: 'photoBase64 must be a data URL starting with data:image/',
  }),
  staffName: z.string().min(1).max(50),
  position: z.string().max(100).optional(),
  yearsExperience: z.number().int().min(0).max(99).optional(),
  specialty: z.string().max(100).optional(),
  funFact: z.string().max(200).optional(),
  nickname: z.string().max(50).optional(),
  certifications: z.array(z.string()).max(10).optional(),
  formats: z
    .array(z.enum(SPOTLIGHT_FORMAT_IDS as [string, ...string[]]))
    .min(1)
    .max(4),
});

/**
 * GET /api/v1/tools/staff-spotlight/formats
 * Return available format definitions
 */
router.get('/formats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      formats: SPOTLIGHT_FORMATS.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        icon: f.icon,
      })),
    },
  });
});

/**
 * POST /api/v1/tools/staff-spotlight/generate
 * Generate spotlight content from a staff photo
 */
router.post('/generate', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    logger.info('Staff Spotlight generation requested', {
      tenantId,
      userId,
      staffName: parsed.data.staffName,
      formats: parsed.data.formats,
    });

    const result = await staffSpotlightService.generate(tenantId, userId, parsed.data);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Staff Spotlight generation request failed', { error });
    next(error);
  }
});

export default router;
