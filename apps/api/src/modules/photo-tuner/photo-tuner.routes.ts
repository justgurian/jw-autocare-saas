/**
 * Photo Tuner Routes
 * API endpoints for photo enhancement
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { photoTunerService } from './photo-tuner.service';
import { PhotoTuneInput, PhotoCategory, EnhancementPreset } from './photo-tuner.types';

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/photo-tuner/presets
 * Get all enhancement presets
 */
router.get('/presets', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const presets = photoTunerService.getPresets();
    res.json({ presets });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/photo-tuner/presets/:id
 * Get a specific preset
 */
router.get('/presets/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const preset = photoTunerService.getPresetById(req.params.id as EnhancementPreset);
    if (!preset) {
      return res.status(404).json({ error: 'Preset not found' });
    }
    res.json({ preset: { id: req.params.id, ...preset } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/photo-tuner/categories
 * Get all photo categories with recommendations
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = photoTunerService.getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/photo-tuner/categories/:id/presets
 * Get recommended presets for a category
 */
router.get('/categories/:id/presets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const presets = photoTunerService.getRecommendedPresets(req.params.id as PhotoCategory);
    res.json({ presets });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/photo-tuner/categories/:id/tips
 * Get tips for a photo category
 */
router.get('/categories/:id/tips', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tips = photoTunerService.getTipsForCategory(req.params.id as PhotoCategory);
    res.json({ tips });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/photo-tuner/enhance
 * Enhance a single photo
 */
router.post('/enhance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: PhotoTuneInput = req.body;

    if (!input.imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const result = await photoTunerService.enhancePhoto(input);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/photo-tuner/batch
 * Batch enhance multiple photos
 */
router.post('/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { images, preset, applyConsistently } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'images array is required' });
    }

    if (images.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 images per batch' });
    }

    const result = await photoTunerService.batchEnhance({
      images,
      preset: preset || 'auto-enhance',
      applyConsistently: applyConsistently ?? true,
    });

    res.json({ result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/photo-tuner/analyze
 * Analyze image and suggest optimal settings
 */
router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl, category } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const settings = await photoTunerService.analyzeAndSuggestSettings(imageUrl, category);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/photo-tuner/preview
 * Preview settings without saving
 */
router.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl, settings } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const result = await photoTunerService.previewSettings(imageUrl, settings || {});
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/photo-tuner/before-after
 * Create a before/after comparison image
 */
router.post('/before-after', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { originalUrl, enhancedUrl } = req.body;

    if (!originalUrl || !enhancedUrl) {
      return res.status(400).json({ error: 'originalUrl and enhancedUrl are required' });
    }

    const comparisonUrl = await photoTunerService.createBeforeAfter(originalUrl, enhancedUrl);
    res.json({ comparisonUrl });
  } catch (error) {
    next(error);
  }
});

export default router;
