import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { shopPhotographerService } from './shop-photographer.service';
import { SCENE_CATEGORIES } from './scenes';
import {
  enhanceRequestSchema,
  generateRequestSchema,
  videoRequestSchema,
  galleryUploadSchema,
} from './shop-photographer.types';
import { logger } from '../../utils/logger';

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(tenantContext);

// ─── Scene & Aesthetic Endpoints ────────────────────────────────────────────

/**
 * GET /scenes
 * Get available scenes, optional ?category= filter
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

    const scenes = shopPhotographerService.getScenes(category);
    res.json({ success: true, data: scenes });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /aesthetics
 * Get all shop aesthetic presets
 */
router.get('/aesthetics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const aesthetics = shopPhotographerService.getAesthetics();
    res.json({ success: true, data: aesthetics });
  } catch (error) {
    next(error);
  }
});

// ─── Gallery Endpoints ──────────────────────────────────────────────────────

/**
 * GET /gallery
 * Get tenant gallery photos
 */
router.get('/gallery', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const photos = await shopPhotographerService.getGallery(tenantId);
    res.json({ success: true, data: photos });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /gallery
 * Upload photo to gallery
 */
router.post('/gallery', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const parsed = galleryUploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }

    const url = await shopPhotographerService.addToGallery(
      tenantId,
      parsed.data.imageBase64,
      parsed.data.mimeType
    );

    res.json({ success: true, data: { url } });
  } catch (error: any) {
    if (error.message?.includes('Maximum 10')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
});

/**
 * DELETE /gallery/:index
 * Remove photo at index
 */
router.delete('/gallery/:index', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const index = parseInt(req.params.index, 10);

    if (isNaN(index)) {
      return res.status(400).json({ success: false, error: 'Invalid index' });
    }

    await shopPhotographerService.removeFromGallery(tenantId, index);
    res.json({ success: true, message: 'Photo removed' });
  } catch (error: any) {
    if (error.message?.includes('Invalid gallery')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
});

/**
 * POST /gallery/analyze
 * Analyze gallery to extract ShopProfile
 */
router.post('/gallery/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const profile = await shopPhotographerService.analyzeShopPhotos(tenantId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    if (error.message?.includes('No gallery photos')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
});

// ─── Generation Endpoints ───────────────────────────────────────────────────

/**
 * POST /enhance
 * Enhance an uploaded photo
 */
router.post('/enhance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const parsed = enhanceRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }

    logger.info('Shop photo enhancement requested', { tenantId, userId, style: parsed.data.enhancementStyle });

    const result = await shopPhotographerService.enhancePhoto(tenantId, userId, parsed.data);
    res.json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Shop photo enhancement failed', { error: error.message });
    next(error);
  }
});

/**
 * POST /generate
 * Generate a scene photo
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const parsed = generateRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }

    logger.info('Shop scene generation requested', {
      tenantId,
      userId,
      sceneId: parsed.data.sceneId,
      outputMode: parsed.data.outputMode,
    });

    const result = await shopPhotographerService.generateScene(tenantId, userId, parsed.data);
    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    logger.error('Shop scene generation failed', { error: error.message });
    next(error);
  }
});

/**
 * POST /generate-video
 * Start video generation (returns job for polling)
 */
router.post('/generate-video', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const parsed = videoRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }

    logger.info('Shop video generation requested', {
      tenantId,
      userId,
      sceneId: parsed.data.sceneId,
    });

    const job = await shopPhotographerService.startVideoGeneration(tenantId, userId, parsed.data);

    res.json({
      success: true,
      data: {
        job,
        message: 'Video generation started. Poll the job status endpoint for updates.',
      },
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    logger.error('Shop video generation request failed', { error: error.message });
    next(error);
  }
});

/**
 * GET /jobs/:jobId
 * Poll job status
 */
router.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const job = await shopPhotographerService.getJobStatus(tenantId, req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

// ─── History & Management ───────────────────────────────────────────────────

/**
 * GET /history
 * Get past generations
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const history = await shopPhotographerService.getHistory(tenantId, { limit, offset });
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /:id
 * Delete content
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    await shopPhotographerService.deleteContent(tenantId, req.params.id);
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Content not found') {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    next(error);
  }
});

export default router;
