import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { prisma } from '../../db/client';
import { geminiService } from '../../services/gemini.service';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { getVehiclePreferences } from '../../services/vehicle-selection';
import { getCarMakeById } from '../../data/car-makes';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Get all content
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tool, status, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = { tenantId: req.user!.tenantId };
    if (tool) where.tool = tool;
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.content.count({ where }),
    ]);

    res.json({
      content,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single content
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId,
      },
    });

    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json(content);
  } catch (error) {
    next(error);
  }
});

// Update content
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        caption: req.body.caption,
        captionSpanish: req.body.captionSpanish,
        status: req.body.status,
      },
    });
    res.json(content);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// IMAGE EDITING (True editing via Gemini)
// ============================================================================

const contentEditSchema = z.object({
  editType: z.enum(['swap-vehicle', 'change-text', 'adjust-preset', 'custom']),
  vehicleMake: z.string().max(100).optional(),
  vehicleModel: z.string().max(100).optional(),
  newHeadline: z.string().max(200).optional(),
  preset: z.enum([
    'brighten', 'darken', 'more-contrast', 'less-contrast',
    'warmer', 'cooler', 'vintage', 'sharpen',
  ]).optional(),
  customPrompt: z.string().max(500).optional(),
});

const ADJUST_PRESETS: Record<string, string> = {
  brighten: 'Make the image brighter and more vibrant while keeping all content intact',
  darken: 'Make the image darker and moodier while keeping all content intact',
  'more-contrast': 'Increase contrast to make colors pop while keeping all content intact',
  'less-contrast': 'Reduce contrast for a softer look while keeping all content intact',
  warmer: 'Shift colors warmer with golden tones while keeping all content intact',
  cooler: 'Shift colors cooler with blue tones while keeping all content intact',
  vintage: 'Apply a vintage film look with faded colors while keeping all content intact',
  sharpen: 'Sharpen details and enhance edges while keeping all content intact',
};

// Edit content image (true image editing — passes existing image to Gemini)
router.post('/:id/edit', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    const result = contentEditSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const { editType, vehicleMake, vehicleModel, newHeadline, preset, customPrompt } = result.data;

    // Fetch content record
    const content = await prisma.content.findFirst({
      where: { id, tenantId },
    });
    if (!content || !content.imageUrl) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    // Extract base64 from the imageUrl
    let base64Data: string;
    let mimeType: string;

    if (content.imageUrl.startsWith('data:')) {
      const match = content.imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/s);
      if (!match) throw new ValidationError('Invalid image data');
      mimeType = match[1];
      base64Data = match[2];
    } else {
      const fetchResponse = await fetch(content.imageUrl);
      const buffer = Buffer.from(await fetchResponse.arrayBuffer());
      base64Data = buffer.toString('base64');
      mimeType = fetchResponse.headers.get('content-type') || 'image/png';
    }

    // Build edit instruction based on editType
    let editInstruction: string;
    switch (editType) {
      case 'swap-vehicle':
        if (!vehicleMake) throw new ValidationError('vehicleMake is required for swap-vehicle');
        editInstruction = `Replace the vehicle/car in this image with a ${vehicleMake}${vehicleModel ? ' ' + vehicleModel : ''}. Keep the same artistic style, composition, colors, text, and all other elements exactly the same. Only change the car/vehicle.`;
        break;
      case 'change-text':
        if (!newHeadline) throw new ValidationError('newHeadline is required for change-text');
        editInstruction = `Change the main headline/title text on this flyer to read: "${newHeadline}". Keep the same font style, colors, layout, images, and everything else exactly the same. Only change the headline text.`;
        break;
      case 'adjust-preset':
        if (!preset || !ADJUST_PRESETS[preset]) throw new ValidationError('Valid preset is required');
        editInstruction = ADJUST_PRESETS[preset];
        break;
      case 'custom':
        if (!customPrompt) throw new ValidationError('customPrompt is required for custom edit');
        editInstruction = customPrompt;
        break;
      default:
        throw new ValidationError('Unknown editType');
    }

    logger.info('Applying true image edit', { contentId: id, editType, preset });

    const editResult = await geminiService.editImage(
      { base64: base64Data, mimeType },
      editInstruction,
      { aspectRatio: '4:5' }
    );

    if (editResult.success && editResult.imageData) {
      const newBase64 = editResult.imageData.toString('base64');
      const newMimeType = editResult.mimeType || 'image/png';
      const newImageUrl = `data:${newMimeType};base64,${newBase64}`;

      await prisma.content.update({
        where: { id },
        data: {
          imageUrl: newImageUrl,
          metadata: {
            ...(content.metadata as object),
            lastEdit: {
              type: editType,
              vehicleMake, vehicleModel, newHeadline, preset, customPrompt,
              timestamp: new Date().toISOString(),
            },
          },
        },
      });

      await prisma.usageLog.create({
        data: {
          tenantId,
          userId: req.user!.id,
          action: 'image_edit',
          tool: 'content_edit',
          creditsUsed: 0.5,
          metadata: { contentId: id, editType } as any,
        },
      });

      res.json({ success: true, imageUrl: newImageUrl });
    } else {
      res.json({ success: false, error: editResult.error || 'Edit failed' });
    }
  } catch (error) {
    next(error);
  }
});

// Get edit suggestions (vehicle preferences for swap buttons)
router.get('/:id/edit-suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const vehiclePrefs = getVehiclePreferences(
      (tenant?.settings as Record<string, unknown>) || {}
    );

    // Build vehicle suggestions from loved makes
    const vehicleSuggestions = vehiclePrefs.lovedMakes.flatMap(loved => {
      const makeData = getCarMakeById(loved.makeId);
      if (!makeData) return [];
      const models = (loved.models && loved.models.length > 0)
        ? loved.models
        : makeData.models.slice(0, 2);
      return models.map(model => ({
        make: makeData.name,
        model,
        label: `${makeData.name} ${model}`,
      }));
    });

    // If no preferences, show popular defaults
    const defaults = vehicleSuggestions.length > 0 ? [] : [
      { make: 'Ford', model: 'F-150', label: 'Ford F-150' },
      { make: 'Toyota', model: 'Camry', label: 'Toyota Camry' },
      { make: 'Chevrolet', model: 'Silverado', label: 'Chevy Silverado' },
      { make: 'Honda', model: 'Civic', label: 'Honda Civic' },
      { make: 'BMW', model: '3 Series', label: 'BMW 3 Series' },
      { make: 'Jeep', model: 'Wrangler', label: 'Jeep Wrangler' },
    ];

    res.json({
      vehicleSuggestions: [...vehicleSuggestions, ...defaults].slice(0, 12),
    });
  } catch (error) {
    next(error);
  }
});

// Delete content
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.content.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Approve content
router.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        moderationStatus: 'passed',
      },
    });
    res.json(content);
  } catch (error) {
    next(error);
  }
});

// Download content
router.get('/:id/download/:format', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId,
      },
    });

    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    const { format } = req.params;

    if (format === 'png') {
      res.json({
        downloadUrl: content.imageUrl,
        format: 'png',
      });
    } else if (format === 'pdf') {
      res.json({
        downloadUrl: content.pdfUrl || content.imageUrl,
        format: 'pdf',
      });
    } else {
      res.status(400).json({ error: 'Invalid format. Use "png" or "pdf"' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
