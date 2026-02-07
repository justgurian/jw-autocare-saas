/**
 * Car of the Day Routes
 * API endpoints for the multi-asset car showcase feature
 */

import { Router, Request, Response, NextFunction } from 'express';
import { carOfDayService } from './car-of-day.service';
import { ASSET_TYPE_INFO, AssetType } from './car-of-day.types';
import { logger } from '../../utils/logger';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { fetchMascotAsBase64 } from '../../services/mascot.util';

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/car-of-day/asset-types
 * Get available asset types
 */
router.get('/asset-types', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assetTypes = Object.entries(ASSET_TYPE_INFO).map(([id, info]) => ({
      id,
      ...info,
    }));

    res.json({
      success: true,
      data: assetTypes,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/car-of-day/generate
 * Generate Car of the Day assets
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const {
      carImage,
      personImage,
      carYear,
      carMake,
      carModel,
      carColor,
      carNickname,
      ownerName,
      ownerHandle,
      assetTypes,
      logos,
      mascotId,
    } = req.body;

    // Validate required fields
    if (!carImage || !carImage.base64 || !carImage.mimeType) {
      return res.status(400).json({
        success: false,
        error: 'Car image is required with base64 and mimeType',
      });
    }

    // Validate asset types if provided
    if (assetTypes && Array.isArray(assetTypes)) {
      const validTypes = Object.keys(ASSET_TYPE_INFO);
      const invalidTypes = assetTypes.filter((t: string) => !validTypes.includes(t));
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid asset types: ${invalidTypes.join(', ')}. Valid types: ${validTypes.join(', ')}`,
        });
      }
    }

    // Fetch mascot data if mascotId provided
    let mascotImageData: { base64: string; mimeType: string } | undefined;
    let mascotCharacterPrompt: string | undefined;
    if (mascotId) {
      const mascot = await fetchMascotAsBase64(mascotId, tenantId);
      if (mascot) {
        mascotCharacterPrompt = mascot.characterPrompt;
        mascotImageData = { base64: mascot.base64, mimeType: mascot.mimeType };
      }
    }

    logger.info('Car of the Day generation requested', {
      tenantId,
      userId,
      carMake,
      carModel,
      assetTypes,
      hasMascot: !!mascotImageData,
    });

    const result = await carOfDayService.generateCarOfDay(tenantId, userId, {
      carImage,
      personImage,
      carYear,
      carMake,
      carModel,
      carColor,
      carNickname,
      ownerName,
      ownerHandle,
      assetTypes,
      logos,
      mascotImage: mascotImageData,
      mascotCharacterPrompt,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Car of the Day generation failed', { error });
    next(error);
  }
});

/**
 * POST /api/v1/tools/car-of-day/generate-single
 * Generate a single asset type
 */
router.post('/generate-single', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const {
      assetType,
      carImage,
      personImage,
      carYear,
      carMake,
      carModel,
      carColor,
      carNickname,
      ownerName,
      ownerHandle,
      logos,
      mascotId,
    } = req.body;

    // Validate required fields
    if (!assetType) {
      return res.status(400).json({
        success: false,
        error: 'Asset type is required',
      });
    }

    const validTypes = Object.keys(ASSET_TYPE_INFO);
    if (!validTypes.includes(assetType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid asset type: ${assetType}. Valid types: ${validTypes.join(', ')}`,
      });
    }

    if (!carImage || !carImage.base64 || !carImage.mimeType) {
      return res.status(400).json({
        success: false,
        error: 'Car image is required with base64 and mimeType',
      });
    }

    // Fetch mascot data if mascotId provided
    let mascotImageData: { base64: string; mimeType: string } | undefined;
    let mascotCharacterPrompt: string | undefined;
    if (mascotId) {
      const mascot = await fetchMascotAsBase64(mascotId, tenantId);
      if (mascot) {
        mascotCharacterPrompt = mascot.characterPrompt;
        mascotImageData = { base64: mascot.base64, mimeType: mascot.mimeType };
      }
    }

    const result = await carOfDayService.generateCarOfDay(tenantId, userId, {
      carImage,
      personImage,
      carYear,
      carMake,
      carModel,
      carColor,
      carNickname,
      ownerName,
      ownerHandle,
      assetTypes: [assetType as AssetType],
      logos,
      mascotImage: mascotImageData,
      mascotCharacterPrompt,
    });

    res.json({
      success: true,
      data: result.assets[0],
    });
  } catch (error) {
    logger.error('Single asset generation failed', { error });
    next(error);
  }
});

/**
 * GET /api/v1/tools/car-of-day/history
 * Get recent Car of the Day generations
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const history = await carOfDayService.getRecentCarOfDay(tenantId, { limit });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/tools/car-of-day/:id
 * Delete a Car of the Day asset
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const contentId = req.params.id;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    await carOfDayService.deleteAsset(tenantId, contentId);

    res.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
