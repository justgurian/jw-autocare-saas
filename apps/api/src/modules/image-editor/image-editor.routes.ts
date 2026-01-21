/**
 * Image Editor (Repair Bay) Routes
 * API endpoints for image editing operations
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { imageEditorService } from './image-editor.service';
import {
  ImageEditInput,
  EDIT_PRESETS,
  FILTER_DEFINITIONS,
  ASPECT_RATIOS,
} from './image-editor.types';
import { logger } from '../../utils/logger';

const router = Router();

// Apply auth and tenant middleware
router.use(authenticate);
router.use(tenantContext);

/**
 * GET /options
 * Get available editing options (filters, presets, aspect ratios)
 */
router.get('/options', async (_req: Request, res: Response) => {
  res.json({
    presets: EDIT_PRESETS,
    filters: Object.keys(FILTER_DEFINITIONS),
    aspectRatios: ASPECT_RATIOS,
    operations: [
      { id: 'background_remove', name: 'Remove Background', icon: 'eraser' },
      { id: 'background_replace', name: 'Replace Background', icon: 'image' },
      { id: 'enhance', name: 'AI Enhance', icon: 'sparkles' },
      { id: 'resize', name: 'Resize', icon: 'maximize' },
      { id: 'crop', name: 'Crop', icon: 'crop' },
      { id: 'rotate', name: 'Rotate', icon: 'rotate-cw' },
      { id: 'flip', name: 'Flip', icon: 'flip-horizontal' },
      { id: 'filter', name: 'Filter', icon: 'sliders' },
      { id: 'adjust', name: 'Adjust', icon: 'sun' },
      { id: 'text_overlay', name: 'Add Text', icon: 'type' },
      { id: 'logo_overlay', name: 'Add Logo', icon: 'image-plus' },
      { id: 'border', name: 'Border', icon: 'square' },
      { id: 'watermark', name: 'Watermark', icon: 'at-sign' },
    ],
  });
});

/**
 * GET /presets
 * Get available edit presets
 */
router.get('/presets', async (_req: Request, res: Response) => {
  const presets = imageEditorService.getPresets();
  res.json({ presets });
});

/**
 * POST /process
 * Process image edits
 */
router.post(
  '/process',
  generationRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.user!.id;
      const input = req.body as ImageEditInput;

      if (!input.operations || input.operations.length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'At least one operation is required',
        });
      }

      if (!input.sourceImageUrl && !input.sourceImageBase64 && !input.contentId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Source image is required (URL, base64, or contentId)',
        });
      }

      const result = await imageEditorService.processEdits(tenantId, userId, input);

      res.json({
        message: 'Image processed successfully',
        result,
      });
    } catch (error: any) {
      logger.error('Image processing failed', { error: error.message });
      next(error);
    }
  }
);

/**
 * POST /preset/:presetId
 * Apply a preset to an image
 */
router.post(
  '/preset/:presetId',
  generationRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.user!.id;
      const { presetId } = req.params;
      const { sourceImageUrl } = req.body;

      if (!sourceImageUrl) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'sourceImageUrl is required',
        });
      }

      const result = await imageEditorService.applyPreset(
        tenantId,
        userId,
        presetId,
        sourceImageUrl
      );

      res.json({
        message: 'Preset applied successfully',
        result,
      });
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }
      next(error);
    }
  }
);

/**
 * POST /suggestions
 * Get AI suggestions for an image
 */
router.post('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl, imageBase64 } = req.body;

    if (!imageUrl && !imageBase64) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'imageUrl or imageBase64 is required',
      });
    }

    const suggestions = await imageEditorService.getSuggestions(imageUrl, imageBase64);

    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /history
 * Get edit history
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const history = await imageEditorService.getHistory(tenantId, { limit });

    res.json({
      history,
      count: history.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /:id/duplicate
 * Duplicate an existing edit
 */
router.post('/:id/duplicate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await imageEditorService.duplicateEdit(tenantId, userId, id);

    res.json({
      message: 'Edit duplicated successfully',
      result,
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * DELETE /:id
 * Delete an edit
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    await imageEditorService.deleteEdit(tenantId, id);

    res.json({
      message: 'Edit deleted successfully',
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }
    next(error);
  }
});

export default router;
