import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { jingleGeneratorService } from './jingle-generator.service';
import { generateJingleSchema } from './jingle-generator.types';
import { logger } from '../../utils/logger';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/jingle-generator/genres
 * Returns available jingle genres (without internal style keywords)
 */
router.get('/genres', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const genres = jingleGeneratorService.getGenres();
    res.json({ success: true, data: genres });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/jingle-generator/preview
 * Preview how a shop name will be phoneticized for singing
 */
router.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shopName } = req.body;

    if (!shopName || typeof shopName !== 'string') {
      return res.status(400).json({ success: false, error: 'shopName is required' });
    }

    const phoneticName = jingleGeneratorService.phoneticize(shopName);
    res.json({ success: true, data: { phoneticName } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/jingle-generator/generate
 * Start jingle generation
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const parsed = generateJingleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(', '),
      });
    }

    logger.info('Jingle generation requested', {
      tenantId,
      userId,
      shopName: parsed.data.shopName,
      genreId: parsed.data.genreId,
    });

    const job = await jingleGeneratorService.startGeneration(tenantId, userId, parsed.data);

    res.json({
      success: true,
      data: { job, message: 'Jingle generation started.' },
    });
  } catch (error) {
    logger.error('Jingle generation request failed', { error });
    next(error);
  }
});

/**
 * GET /api/v1/tools/jingle-generator/jobs/:jobId
 * Poll for jingle generation job status
 */
router.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const jobId = req.params.jobId;

    const job = await jingleGeneratorService.getJobStatus(tenantId, jobId);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/jingle-generator/history
 * Get jingle generation history for the tenant
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const history = await jingleGeneratorService.getHistory(tenantId, { limit, offset });
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/tools/jingle-generator/:id
 * Delete a jingle content item
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const contentId = req.params.id;

    await jingleGeneratorService.deleteContent(tenantId, contentId);
    res.json({ success: true, data: { message: 'Jingle deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
