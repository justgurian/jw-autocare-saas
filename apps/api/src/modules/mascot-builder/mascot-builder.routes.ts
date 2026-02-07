/**
 * Mascot Builder Routes
 * Endpoints for creating and managing custom Muppet-style mechanic mascots.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { mascotBuilderService } from './mascot-builder.service';
import { MASCOT_OPTIONS } from './mascot-options';
import { logger } from '../../utils/logger';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/mascot-builder/options
 * Get all mascot customization options
 */
router.get('/options', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const options = mascotBuilderService.getOptions();
    res.json({ success: true, data: options });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/mascot-builder/generate
 * Generate a mascot image from selected options
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const { shirtName, furColor, eyeStyle, hairstyle, outfitColor, accessory } =
      req.body;

    // Validate required fields
    if (!shirtName || !furColor || !eyeStyle || !hairstyle || !outfitColor) {
      return res.status(400).json({
        success: false,
        error:
          'shirtName, furColor, eyeStyle, hairstyle, and outfitColor are required',
      });
    }

    // Validate option IDs exist
    if (!MASCOT_OPTIONS.furColors.find((c) => c.id === furColor)) {
      return res.status(400).json({
        success: false,
        error: `Invalid furColor. Valid options: ${MASCOT_OPTIONS.furColors.map((c) => c.id).join(', ')}`,
      });
    }
    if (!MASCOT_OPTIONS.eyeStyles.find((e) => e.id === eyeStyle)) {
      return res.status(400).json({
        success: false,
        error: `Invalid eyeStyle. Valid options: ${MASCOT_OPTIONS.eyeStyles.map((e) => e.id).join(', ')}`,
      });
    }
    if (!MASCOT_OPTIONS.hairstyles.find((h) => h.id === hairstyle)) {
      return res.status(400).json({
        success: false,
        error: `Invalid hairstyle. Valid options: ${MASCOT_OPTIONS.hairstyles.map((h) => h.id).join(', ')}`,
      });
    }
    if (!MASCOT_OPTIONS.outfitColors.find((o) => o.id === outfitColor)) {
      return res.status(400).json({
        success: false,
        error: `Invalid outfitColor. Valid options: ${MASCOT_OPTIONS.outfitColors.map((o) => o.id).join(', ')}`,
      });
    }
    if (accessory && !MASCOT_OPTIONS.accessories.find((a) => a.id === accessory)) {
      return res.status(400).json({
        success: false,
        error: `Invalid accessory. Valid options: ${MASCOT_OPTIONS.accessories.map((a) => a.id).join(', ')}`,
      });
    }

    // Validate shirtName length
    if (shirtName.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'shirtName must be 20 characters or less',
      });
    }

    logger.info('Mascot generation requested', {
      tenantId,
      userId,
      shirtName,
      furColor,
    });

    const result = await mascotBuilderService.generateMascot(tenantId, userId, {
      shirtName,
      furColor,
      eyeStyle,
      hairstyle,
      outfitColor,
      accessory,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Mascot generation request failed', { error });
    next(error);
  }
});

/**
 * GET /api/v1/tools/mascot-builder/mascots
 * Get all mascots for the current tenant
 */
router.get('/mascots', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const mascots = await mascotBuilderService.getMascots(tenantId);

    res.json({
      success: true,
      data: mascots.map((m) => {
        const metadata = m.metadata as Record<string, unknown>;
        return {
          id: m.id,
          title: m.title,
          imageUrl: m.imageUrl,
          characterPrompt: metadata.characterPrompt,
          shirtName: metadata.shirtName,
          furColor: metadata.furColor,
          eyeStyle: metadata.eyeStyle,
          hairstyle: metadata.hairstyle,
          outfitColor: metadata.outfitColor,
          accessory: metadata.accessory,
          createdAt: m.createdAt,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/tools/mascot-builder/mascots/:id
 * Delete a mascot
 */
router.delete('/mascots/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const mascotId = req.params.id;

    await mascotBuilderService.deleteMascot(tenantId, mascotId);

    res.json({ success: true, message: 'Mascot deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
