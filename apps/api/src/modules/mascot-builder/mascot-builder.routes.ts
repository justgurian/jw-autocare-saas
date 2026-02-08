/**
 * Mascot Builder Routes
 * Endpoints for creating and managing custom Muppet-style mechanic mascots.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { mascotBuilderService } from './mascot-builder.service';
import { MASCOT_OPTIONS, MASCOT_STYLES, PERSONALITY_PRESETS } from './mascot-options';
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
    res.json({ success: true, data: { ...options, mascotStyles: MASCOT_STYLES, personalityPresets: PERSONALITY_PRESETS } });
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

    const { shirtName, mascotName, mascotStyle, furColor, eyeStyle, hairstyle, outfitColor, accessory, outfitType, seasonalAccessory, personality } =
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
    if (outfitType && !MASCOT_OPTIONS.outfitTypes.find((o) => o.id === outfitType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid outfitType. Valid options: ${MASCOT_OPTIONS.outfitTypes.map((o) => o.id).join(', ')}`,
      });
    }
    if (seasonalAccessory && !MASCOT_OPTIONS.seasonalAccessories.find((s) => s.id === seasonalAccessory)) {
      return res.status(400).json({
        success: false,
        error: `Invalid seasonalAccessory. Valid options: ${MASCOT_OPTIONS.seasonalAccessories.map((s) => s.id).join(', ')}`,
      });
    }
    if (personality) {
      if (personality.presetId && !PERSONALITY_PRESETS.find((p) => p.id === personality.presetId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid personality presetId. Valid options: ${PERSONALITY_PRESETS.map((p) => p.id).join(', ')}`,
        });
      }
      const validEnergyLevels = ['low', 'medium', 'high', 'maximum'];
      if (personality.energyLevel && !validEnergyLevels.includes(personality.energyLevel)) {
        return res.status(400).json({
          success: false,
          error: `Invalid energyLevel. Valid options: ${validEnergyLevels.join(', ')}`,
        });
      }
    }

    // Validate mascot style
    if (mascotStyle && !MASCOT_STYLES.find((s) => s.id === mascotStyle)) {
      return res.status(400).json({
        success: false,
        error: `Invalid mascotStyle. Valid options: ${MASCOT_STYLES.map((s) => s.id).join(', ')}`,
      });
    }

    // Validate mascotName length
    if (mascotName && mascotName.length > 30) {
      return res.status(400).json({
        success: false,
        error: 'mascotName must be 30 characters or less',
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
      mascotName,
      mascotStyle,
      furColor,
      eyeStyle,
      hairstyle,
      outfitColor,
      accessory,
      outfitType,
      seasonalAccessory,
      personality,
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
 * POST /api/v1/tools/mascot-builder/generate-v2
 * Generate mascot images in multiple styles using one of three modes: photo, describe, build
 */
const validStyleIds = MASCOT_STYLES.map((s) => s.id);

const generateV2Schema = z.object({
  mode: z.enum(['photo', 'describe', 'build']),
  photoBase64: z.string().optional(),
  description: z.string().max(500).optional(),
  styles: z.array(z.string()).min(1).max(4).refine(
    (arr) => arr.every((id) => validStyleIds.includes(id)),
    { message: `Each style must be one of: ${validStyleIds.join(', ')}` }
  ),
  shirtName: z.string().min(1).max(20),
  mascotName: z.string().max(30).optional(),
  furColor: z.string().optional(),
  eyeStyle: z.string().optional(),
  hairstyle: z.string().optional(),
  outfitType: z.string().optional(),
  outfitColor: z.string().optional(),
  accessory: z.string().optional(),
  seasonalAccessory: z.string().optional(),
  personality: z.object({
    presetId: z.string(),
    catchphrase: z.string().optional(),
    energyLevel: z.string().optional(),
    speakingStyle: z.string().optional(),
  }).optional(),
}).refine(
  (data) => {
    if (data.mode === 'photo') return !!data.photoBase64;
    return true;
  },
  { message: 'photoBase64 is required when mode is photo', path: ['photoBase64'] }
).refine(
  (data) => {
    if (data.mode === 'describe') return !!data.description;
    return true;
  },
  { message: 'description is required when mode is describe', path: ['description'] }
);

router.post('/generate-v2', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const parsed = generateV2Schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.errors.map((e) => e.message).join('; '),
      });
    }

    const input = parsed.data;

    logger.info('Mascot V2 generation requested', {
      tenantId,
      userId,
      mode: input.mode,
      styles: input.styles,
      shirtName: input.shirtName,
    });

    const { results } = await mascotBuilderService.generateV2(tenantId, userId, input);

    res.status(201).json({
      success: true,
      results,
    });
  } catch (error) {
    logger.error('Mascot V2 generation request failed', { error });
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
          mascotName: metadata.mascotName || null,
          mascotStyle: metadata.mascotStyle || 'muppet',
          furColor: metadata.furColor,
          eyeStyle: metadata.eyeStyle,
          hairstyle: metadata.hairstyle,
          outfitColor: metadata.outfitColor,
          accessory: metadata.accessory,
          outfitType: metadata.outfitType,
          seasonalAccessory: metadata.seasonalAccessory,
          personality: metadata.personality,
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
