/**
 * Batch Flyer Routes
 * API endpoints for the batch flyer generation system
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { prisma } from '../../db/client';
import { geminiService } from '../../services/gemini.service';
import {
  themeRegistry,
  NOSTALGIC_THEMES,
  NostalgicThemeDefinition,
  EraVehicle,
  getThemesFromHolidayPacks,
  STYLE_FAMILIES,
  getFamilyForTheme,
} from '../../prompts/themes';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import {
  batchGenerateSchema,
  approveFlyerSchema,
  updateCaptionSchema,
  inpaintSchema,
  saveFavoriteSchema,
  BatchFlyer,
  BatchGenerateResponse,
  BatchJobStatusResponse,
  INPAINT_PRESETS,
  InpaintPreset,
} from './batch-flyer.types';
import { getSmartSuggestions, getTopPerformingThemes } from './suggestions.service';
import sharp from 'sharp';
import { creativeLogoService } from '../../services/creative-logo.service';
import { LogoStyle, selectRandomLogoStyle } from '../../services/logo-styles';

import { buildNostalgicImagePrompt } from '../../services/prompt-builder.service';
import { fetchMascotAsBase64 } from '../../services/mascot.util';

const router = Router();

// ============================================================================
// CREATIVE LOGO INTEGRATION HELPER
// ============================================================================

/**
 * Get logo buffer from URL or data URL
 */
async function getLogoBuffer(logoUrl: string): Promise<Buffer | null> {
  try {
    if (logoUrl.startsWith('data:image')) {
      const base64Data = logoUrl.split(',')[1];
      if (!base64Data) return null;
      return Buffer.from(base64Data, 'base64');
    } else {
      const response = await fetch(logoUrl);
      if (!response.ok) {
        logger.warn('Failed to fetch logo from URL', { logoUrl });
        return null;
      }
      return Buffer.from(await response.arrayBuffer());
    }
  } catch (error) {
    logger.warn('Error getting logo buffer', { error });
    return null;
  }
}

/**
 * Creative logo integration with variety of styles
 * Returns the modified base64 image and the style that was applied
 * @param specificStyle - Optional: Use a specific pre-selected style instead of random
 */
async function compositeLogoCreatively(
  imageBase64: string,
  logoUrl: string | null | undefined,
  excludeStyles: string[] = [],
  specificStyle?: string // NEW: Use pre-selected style
): Promise<{ base64: string; appliedStyle: string }> {
  if (!logoUrl) {
    return { base64: imageBase64, appliedStyle: 'none' };
  }

  try {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const logoBuffer = await getLogoBuffer(logoUrl);

    if (!logoBuffer) {
      return { base64: imageBase64, appliedStyle: 'none' };
    }

    // Use creative logo service for placement
    // If specificStyle provided, use it; otherwise random with exclusions
    const result = await creativeLogoService.integrateLogoCreatively({
      logoBuffer,
      imageBuffer,
      style: specificStyle || 'random', // Use pre-selected style if provided
      excludeStyles: specificStyle ? [] : excludeStyles.slice(-2), // Only exclude if random
      variationSeed: Date.now() + Math.random() * 1000,
    });

    logger.info('Applied creative logo style', {
      style: result.appliedStyle,
      styleName: result.styleName,
      position: result.position,
      wasPreSelected: !!specificStyle,
    });

    return {
      base64: result.imageBuffer.toString('base64'),
      appliedStyle: result.appliedStyle,
    };
  } catch (error) {
    logger.warn('Failed to composite logo creatively, falling back to simple', { error });
    return { base64: imageBase64, appliedStyle: 'error' };
  }
}

// Track used logo styles within a batch generation to ensure variety
const batchLogoStyles: Map<string, string[]> = new Map();

router.use(authenticate);
router.use(tenantContext);

// ============================================================================
// SUGGESTIONS
// ============================================================================

// Get smart AI suggestions for content
router.get('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    logger.info('Getting suggestions for tenant', { tenantId });

    const suggestions = await getSmartSuggestions(tenantId);

    logger.info('Suggestions response', {
      tenantId,
      contentSuggestionsCount: suggestions.contentSuggestions?.length || 0,
      allServicesCount: suggestions.allServices?.length || 0,
      allSpecialsCount: suggestions.allSpecials?.length || 0,
    });

    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

// Get top performing themes
router.get('/top-themes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const themes = await getTopPerformingThemes(tenantId);

    res.json({ themes });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// BATCH GENERATION
// ============================================================================

// Start batch generation job
router.post('/generate', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = batchGenerateSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const {
      mode,
      count,
      contentType,
      serviceIds,
      specialIds,
      customContent,
      themeStrategy,
      singleThemeId,
      themeMatrix,
      holidayPacks, // Optional: opt-in holiday theme packs
      language,
      vehicleId,
      mascotId,
    } = result.data;

    const tenantId = req.user!.tenantId;

    // Create batch job record
    const batchJob = await prisma.batchJob.create({
      data: {
        tenantId,
        userId: req.user!.id,
        jobType: 'batch_flyer',
        totalItems: count,
        completedItems: 0,
        failedItems: 0,
        status: 'processing',
        mode,
        themeStrategy,
        selectedThemes: themeMatrix ? JSON.stringify(themeMatrix) : null,
        metadata: {
          contentType,
          serviceIds,
          specialIds,
          language,
          vehicleId,
          holidayPacks, // Track which holiday packs were selected
        },
        startedAt: new Date(),
      },
    });

    // Get brand kit for personalization
    const brandKit = await prisma.brandKit.findUnique({
      where: { tenantId },
    });

    const profileContext = {
      businessName: brandKit?.businessName || undefined,
      city: brandKit?.city || undefined,
      state: brandKit?.state || undefined,
      tagline: brandKit?.tagline || undefined,
      specialties: brandKit?.specialties || [],
      brandVoice: brandKit?.brandVoice || 'friendly',
      primaryColor: brandKit?.primaryColor || undefined,
      secondaryColor: brandKit?.secondaryColor || undefined,
    };

    // Build content items to generate
    const contentItems = await buildContentItems(
      tenantId,
      count,
      contentType,
      serviceIds,
      specialIds,
      customContent
    );

    // Select themes for each flyer (include holiday themes only if packs are selected)
    const selectedThemes = selectThemes(count, themeStrategy, singleThemeId, themeMatrix, holidayPacks);

    // Fetch mascot data ONCE if mascotId provided
    let mascotImageData: { base64: string; mimeType: string } | undefined;
    let mascotCharacterPrompt: string | undefined;
    if (mascotId) {
      const mascot = await fetchMascotAsBase64(mascotId, tenantId);
      if (mascot) {
        mascotCharacterPrompt = mascot.characterPrompt;
        mascotImageData = { base64: mascot.base64, mimeType: mascot.mimeType };
      }
    }

    // Generate flyers (async - don't await)
    generateFlyers(
      batchJob.id,
      tenantId,
      req.user!.id,
      contentItems,
      selectedThemes,
      profileContext,
      brandKit,
      language,
      vehicleId,
      mascotImageData,
      mascotCharacterPrompt
    ).catch(error => {
      logger.error('Batch generation failed', { jobId: batchJob.id, error });
    });

    const response: BatchGenerateResponse = {
      jobId: batchJob.id,
      status: 'processing',
      mode,
      count,
      message: `Generating ${count} flyer${count > 1 ? 's' : ''}...`,
    };

    res.status(202).json(response);
  } catch (error) {
    next(error);
  }
});

// Get batch job status and progress
router.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { jobId } = req.params;

    const job = await prisma.batchJob.findFirst({
      where: {
        id: jobId,
        tenantId,
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const progress = job.totalItems > 0
      ? Math.round((job.completedItems / job.totalItems) * 100)
      : 0;

    const response: BatchJobStatusResponse = {
      job: {
        id: job.id,
        status: job.status as 'pending' | 'processing' | 'completed' | 'failed',
        mode: job.mode || 'quick',
        themeStrategy: job.themeStrategy || 'auto',
        totalItems: job.totalItems,
        completedItems: job.completedItems,
        failedItems: job.failedItems,
        createdAt: job.createdAt.toISOString(),
        startedAt: job.startedAt?.toISOString() || null,
        completedAt: job.completedAt?.toISOString() || null,
      },
      progress,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get generated flyers for a job
router.get('/jobs/:jobId/flyers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { jobId } = req.params;

    const content = await prisma.content.findMany({
      where: {
        tenantId,
        batchJobId: jobId,
      },
      orderBy: { createdAt: 'asc' },
    });

    const flyers: BatchFlyer[] = content.map((item, index) => ({
      id: item.id,
      imageUrl: item.imageUrl || '',
      caption: item.caption || '',
      captionSpanish: item.captionSpanish,
      title: item.title || '',
      theme: item.theme || '',
      themeName: (item.metadata as { themeName?: string })?.themeName || item.theme || '',
      vehicle: (item.metadata as { vehicleId?: string; vehicleName?: string })?.vehicleId
        ? {
            id: (item.metadata as { vehicleId: string }).vehicleId,
            name: (item.metadata as { vehicleName?: string }).vehicleName || '',
          }
        : undefined,
      familyId: (item.metadata as any)?.familyId || null,
      familyName: (item.metadata as any)?.familyName || null,
      approvalStatus: (item.approvalStatus || 'pending') as 'pending' | 'approved' | 'rejected',
      scheduledFor: item.scheduledFor?.toISOString() || null,
      status: item.status,
      index,
    }));

    res.json({ flyers });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// FLYER ACTIONS
// ============================================================================

// Approve flyer and schedule
router.post('/flyers/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    const result = approveFlyerSchema.safeParse(req.body);
    const data = result.success ? result.data : {};

    // Get tenant timezone for smart scheduling
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { timezone: true },
    });

    // Calculate scheduled time - default to 9am in tenant's timezone
    let scheduledFor: Date | undefined;
    if (data.scheduledFor) {
      scheduledFor = new Date(data.scheduledFor);
    } else {
      // Default: next available 9am slot
      scheduledFor = getNext9AM(tenant?.timezone || 'America/New_York');
    }

    const content = await prisma.content.update({
      where: { id },
      data: {
        approvalStatus: 'approved',
        scheduledFor,
        ...(data.caption && { caption: data.caption }),
      },
    });

    // Create calendar event for the scheduled post
    await prisma.calendarEvent.create({
      data: {
        tenantId,
        contentId: content.id,
        scheduledDate: scheduledFor,
        status: 'scheduled',
        beatType: 'social_post',
        suggestedTopic: content.title,
        aiGenerated: true,
      },
    });

    res.json({
      success: true,
      flyer: {
        id: content.id,
        approvalStatus: 'approved',
        scheduledFor: scheduledFor.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Reject flyer
router.post('/flyers/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    await prisma.content.update({
      where: { id },
      data: {
        approvalStatus: 'rejected',
      },
    });

    res.json({
      success: true,
      flyer: {
        id,
        approvalStatus: 'rejected',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update flyer caption
router.put('/flyers/:id/caption', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = updateCaptionSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const { caption, captionSpanish } = result.data;

    const content = await prisma.content.update({
      where: { id },
      data: {
        caption,
        ...(captionSpanish && { captionSpanish }),
      },
    });

    res.json({
      success: true,
      caption: content.caption,
      captionSpanish: content.captionSpanish,
    });
  } catch (error) {
    next(error);
  }
});

// Apply inpaint edit to flyer
router.post('/flyers/:id/inpaint', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    const result = inpaintSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const { editType, preset, customPrompt } = result.data;

    // Get the current content
    const content = await prisma.content.findFirst({
      where: { id, tenantId },
    });

    if (!content || !content.imageUrl) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    // Build edit prompt
    let editPrompt: string;
    if (editType === 'preset' && preset) {
      const presetDef = INPAINT_PRESETS[preset as InpaintPreset];
      editPrompt = presetDef.prompt;
    } else if (customPrompt) {
      editPrompt = customPrompt;
    } else {
      throw new ValidationError('Either preset or customPrompt is required');
    }

    // True image editing: pass existing image to Gemini
    let imgBase64: string;
    let imgMimeType: string;

    if (content.imageUrl!.startsWith('data:')) {
      const match = content.imageUrl!.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/s);
      if (!match) throw new ValidationError('Invalid image data');
      imgMimeType = match[1];
      imgBase64 = match[2];
    } else {
      const fetchResp = await fetch(content.imageUrl!);
      const buf = Buffer.from(await fetchResp.arrayBuffer());
      imgBase64 = buf.toString('base64');
      imgMimeType = fetchResp.headers.get('content-type') || 'image/png';
    }

    logger.info('Applying true image edit', { contentId: id, editType, preset });

    const imageResult = await geminiService.editImage(
      { base64: imgBase64, mimeType: imgMimeType },
      editPrompt,
      { aspectRatio: '4:5' }
    );

    if (imageResult.success && imageResult.imageData) {
      const base64Data = imageResult.imageData.toString('base64');
      const mimeType = imageResult.mimeType || 'image/png';
      const newImageUrl = `data:${mimeType};base64,${base64Data}`;

      // Update content with new image
      await prisma.content.update({
        where: { id },
        data: {
          imageUrl: newImageUrl,
          metadata: {
            ...(content.metadata as object),
            lastEdit: {
              type: editType,
              preset,
              customPrompt,
              timestamp: new Date().toISOString(),
            },
          },
        },
      });

      // Log usage
      await prisma.usageLog.create({
        data: {
          tenantId,
          userId: req.user!.id,
          action: 'image_edit',
          tool: 'batch_flyer_inpaint',
          creditsUsed: 0.5,
          metadata: { contentId: id, editType, preset },
        },
      });

      res.json({
        success: true,
        imageUrl: newImageUrl,
      });
    } else {
      res.json({
        success: false,
        error: 'Failed to apply edit',
      });
    }
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// FAVORITES
// ============================================================================

// Get favorites
router.get('/favorites', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    const favorites = await prisma.favoriteTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        content: {
          select: {
            imageUrl: true,
          },
        },
      },
    });

    res.json({
      favorites: favorites.map(f => ({
        id: f.id,
        name: f.name,
        themeId: f.themeId,
        themeName: themeRegistry.getTheme(f.themeId)?.name || f.themeId,
        serviceId: f.serviceId,
        specialId: f.specialId,
        customText: f.customText,
        contentId: f.contentId,
        previewUrl: f.content?.imageUrl || null,
        createdAt: f.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Save as favorite
router.post('/favorites', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    const result = saveFavoriteSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const { name, themeId, serviceId, specialId, customText, contentId } = result.data;

    const favorite = await prisma.favoriteTemplate.create({
      data: {
        tenantId,
        name,
        themeId,
        serviceId,
        specialId,
        customText,
        contentId,
      },
    });

    res.status(201).json({
      success: true,
      favorite: {
        id: favorite.id,
        name: favorite.name,
        themeId: favorite.themeId,
        createdAt: favorite.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete favorite
router.delete('/favorites/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    await prisma.favoriteTemplate.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

interface ContentItem {
  message: string;
  subject: string;
  details?: string;
  sourceType: 'service' | 'special' | 'custom';
  sourceId?: string;
}

async function buildContentItems(
  tenantId: string,
  count: number,
  contentType: string,
  serviceIds?: string[],
  specialIds?: string[],
  customContent?: Array<{ message: string; subject: string; details?: string }>
): Promise<ContentItem[]> {
  const items: ContentItem[] = [];

  // Get services if needed
  if ((contentType === 'services' || contentType === 'mixed') && serviceIds?.length) {
    const services = await prisma.service.findMany({
      where: { tenantId, id: { in: serviceIds } },
    });

    const promoMessages = [
      'Time for a Check-Up!',
      'Keep Your Ride Running Smooth',
      "Don't Wait - Book Today!",
      'Expert Service You Can Trust',
      'Quality Care for Your Vehicle',
    ];

    for (const service of services) {
      items.push({
        message: promoMessages[Math.floor(Math.random() * promoMessages.length)],
        subject: service.name,
        details: service.description || undefined,
        sourceType: 'service',
        sourceId: service.id,
      });
    }
  }

  // Get specials if needed
  if ((contentType === 'specials' || contentType === 'mixed') && specialIds?.length) {
    const specials = await prisma.special.findMany({
      where: { tenantId, id: { in: specialIds } },
    });

    for (const special of specials) {
      const discount = special.discountType === 'percentage'
        ? `${special.discountValue}% OFF`
        : special.discountType === 'fixed'
        ? `$${special.discountValue} OFF`
        : 'Special Offer';

      items.push({
        message: `${discount} ${special.title}`,
        subject: special.title,
        details: special.description || undefined,
        sourceType: 'special',
        sourceId: special.id,
      });
    }
  }

  // Add custom content
  if ((contentType === 'custom' || contentType === 'mixed') && customContent?.length) {
    for (const custom of customContent) {
      items.push({
        message: custom.message,
        subject: custom.subject,
        details: custom.details,
        sourceType: 'custom',
      });
    }
  }

  // If we need more items than we have, cycle through
  while (items.length < count && items.length > 0) {
    const index = items.length % items.length;
    items.push({ ...items[index] });
  }

  // If still no items, create generic
  if (items.length === 0) {
    for (let i = 0; i < count; i++) {
      items.push({
        message: 'Quality Auto Care You Can Trust',
        subject: 'Full Service Auto Repair',
        details: 'Expert mechanics, honest prices',
        sourceType: 'custom',
      });
    }
  }

  return items.slice(0, count);
}

function selectThemes(
  count: number,
  strategy: string,
  singleThemeId?: string,
  themeMatrix?: Array<{ index: number; themeId: string }>,
  holidayPacks?: string[] // Optional: include themes from these holiday packs
): NostalgicThemeDefinition[] {
  const themes: NostalgicThemeDefinition[] = [];

  // Get holiday themes if packs are selected
  const holidayThemes = holidayPacks?.length
    ? getThemesFromHolidayPacks(holidayPacks)
    : [];

  if (strategy === 'single' && singleThemeId) {
    // All flyers use the same theme
    // Check both nostalgic and holiday themes
    let theme = themeRegistry.getNostalgicTheme(singleThemeId);
    if (!theme) {
      theme = themeRegistry.getHolidayTheme(singleThemeId);
    }
    theme = theme || NOSTALGIC_THEMES[0];
    for (let i = 0; i < count; i++) {
      themes.push(theme);
    }
  } else if (strategy === 'matrix' && themeMatrix?.length) {
    // User-specified theme for each slot
    const combinedThemes = [...NOSTALGIC_THEMES, ...holidayThemes];
    for (let i = 0; i < count; i++) {
      const entry = themeMatrix.find(e => e.index === i);
      if (entry) {
        let theme = themeRegistry.getNostalgicTheme(entry.themeId);
        if (!theme) {
          theme = themeRegistry.getHolidayTheme(entry.themeId);
        }
        themes.push(theme || combinedThemes[Math.floor(Math.random() * combinedThemes.length)]);
      } else {
        themes.push(combinedThemes[Math.floor(Math.random() * combinedThemes.length)]);
      }
    }
  } else if (strategy === 'family-sampler') {
    // Pick exactly 1 random theme from each of the 10 style families
    for (const family of STYLE_FAMILIES) {
      const familyThemeDefs = family.themeIds
        .map((id: string) => themeRegistry.getNostalgicTheme(id))
        .filter((t): t is NostalgicThemeDefinition => t != null);
      if (familyThemeDefs.length > 0) {
        themes.push(familyThemeDefs[Math.floor(Math.random() * familyThemeDefs.length)]);
      }
    }
    // If count > families, cycle through again
    const base = [...themes];
    while (themes.length < count && base.length > 0) {
      themes.push(base[themes.length % base.length]);
    }
  } else {
    // Auto: AI picks varied themes from combined pool
    // Include holiday themes only if explicitly requested via holidayPacks
    const available = [...NOSTALGIC_THEMES, ...holidayThemes];
    for (let i = 0; i < count; i++) {
      if (available.length === 0) {
        // Reset pool if we need more themes than available
        available.push(...NOSTALGIC_THEMES, ...holidayThemes);
      }
      const randomIndex = Math.floor(Math.random() * available.length);
      themes.push(available.splice(randomIndex, 1)[0]);
    }
  }

  return themes;
}

async function generateFlyers(
  jobId: string,
  tenantId: string,
  userId: string,
  contentItems: ContentItem[],
  themes: NostalgicThemeDefinition[],
  profileContext: {
    businessName?: string;
    city?: string;
    state?: string;
    tagline?: string;
    specialties: string[];
    brandVoice: string;
    primaryColor?: string;
    secondaryColor?: string;
  },
  brandKit: { logoUrl?: string | null; phone?: string | null; website?: string | null } | null,
  language: 'en' | 'es' | 'both',
  vehicleId?: string,
  mascotImageData?: { base64: string; mimeType: string },
  mascotCharacterPrompt?: string,
): Promise<void> {
  try {
    for (let i = 0; i < contentItems.length; i++) {
      const content = contentItems[i];
      const theme = themes[i];

      try {
        // Select vehicle
        let selectedVehicle: EraVehicle | undefined;
        if (vehicleId === 'random') {
          selectedVehicle = themeRegistry.getRandomVehicleByEra(theme.era);
        } else if (vehicleId) {
          selectedVehicle = themeRegistry.getVehicleById(vehicleId);
        }

        // Build vehicle prompt
        let vehiclePromptAddition = '';
        if (selectedVehicle) {
          vehiclePromptAddition = `\n\nFEATURE THIS VEHICLE: ${themeRegistry.getVehicleImagePrompt(selectedVehicle)}`;
        }

        // PRE-SELECT logo style BEFORE image generation so AI knows where to leave space
        let preSelectedLogoStyle: LogoStyle | null = null;
        let logoPromptHint = '';
        if (brandKit?.logoUrl) {
          const usedStyles = batchLogoStyles.get(jobId) || [];
          preSelectedLogoStyle = selectRandomLogoStyle(usedStyles.slice(-2));
          logoPromptHint = creativeLogoService.getPromptEnhancement(preSelectedLogoStyle.id);
          logger.info('Pre-selected logo style for image generation', {
            jobId,
            index: i,
            style: preSelectedLogoStyle.id,
            promptHint: logoPromptHint,
          });
        }

        // Build image prompt WITH logo placement hint
        let imagePrompt = buildNostalgicImagePrompt(theme, {
          headline: content.message,
          subject: content.subject,
          details: content.details,
          businessName: profileContext.businessName,
          logoInstructions: brandKit?.logoUrl
            ? 'Incorporate the business logo aesthetically into the design'
            : undefined,
          vehiclePrompt: vehiclePromptAddition,
          logoPlacementHint: logoPromptHint, // Tell AI where to leave space for logo
        });

        // Append mascot character prompt if present
        if (mascotCharacterPrompt) {
          imagePrompt += '\n\nFeaturing the shop mascot character: ' + mascotCharacterPrompt;
        }

        const contentId = uuidv4();

        // Generate image
        logger.info('Batch generation: Creating flyer', {
          jobId,
          index: i,
          themeId: theme.id,
          hasMascot: !!mascotImageData,
        });

        const imageResult = await geminiService.generateImage(imagePrompt, {
          aspectRatio: '4:5',
          contactInfo: {
            phone: brandKit?.phone || undefined,
            website: brandKit?.website || undefined,
          },
          mascotImage: mascotImageData,
        });

        let imageUrl: string;
        let appliedLogoStyle = 'none'; // Track which logo style was used

        if (imageResult.success && imageResult.imageData) {
          let base64Data = imageResult.imageData.toString('base64');

          // Creative logo integration using PRE-SELECTED style
          if (brandKit?.logoUrl && preSelectedLogoStyle) {
            logger.info('Applying creative logo integration with pre-selected style', {
              jobId,
              index: i,
              preSelectedStyle: preSelectedLogoStyle.id,
            });

            const logoResult = await compositeLogoCreatively(
              base64Data,
              brandKit.logoUrl,
              [], // No exclusions needed - we already selected the style
              preSelectedLogoStyle.id // Use the pre-selected style
            );
            base64Data = logoResult.base64;
            appliedLogoStyle = logoResult.appliedStyle;

            // Track this style for batch variety
            const usedStyles = batchLogoStyles.get(jobId) || [];
            usedStyles.push(appliedLogoStyle);
            batchLogoStyles.set(jobId, usedStyles);
          }

          const mimeType = 'image/png'; // Always PNG after sharp processing
          imageUrl = `data:${mimeType};base64,${base64Data}`;
        } else {
          const colorHex = theme.previewColors?.[0]?.replace('#', '') || 'C53030';
          imageUrl = `https://placehold.co/800x1000/${colorHex}/FFF?text=${encodeURIComponent(content.message.substring(0, 20))}`;
        }

        // Generate varied caption
        const captionPromises: Promise<string>[] = [];
        if (language === 'en' || language === 'both') {
          captionPromises.push(
            geminiService.generateMarketingCopyWithProfile({
              type: 'caption',
              topic: `${content.subject} - ${content.message}`,
              profile: profileContext,
              language: 'en',
            })
          );
        }
        if (language === 'es' || language === 'both') {
          captionPromises.push(
            geminiService.generateMarketingCopyWithProfile({
              type: 'caption',
              topic: `${content.subject} - ${content.message}`,
              profile: profileContext,
              language: 'es',
            })
          );
        }

        const captions = await Promise.all(captionPromises);
        const caption = language === 'es' ? captions[0] : captions[0];
        const captionSpanish = language === 'both' ? captions[1] : (language === 'es' ? captions[0] : null);

        // Save to database
        await prisma.content.create({
          data: {
            id: contentId,
            tenantId,
            userId,
            batchJobId: jobId,
            tool: 'batch_flyer',
            contentType: 'image',
            title: content.subject,
            promptUsed: imagePrompt,
            theme: theme.id,
            imageUrl,
            caption,
            captionSpanish,
            approvalStatus: 'pending',
            metadata: {
              message: content.message,
              subject: content.subject,
              details: content.details,
              language,
              vehicleId: selectedVehicle?.id,
              vehicleName: selectedVehicle?.name,
              themeName: theme.name,
              familyId: getFamilyForTheme(theme.id)?.id || null,
              familyName: getFamilyForTheme(theme.id)?.name || null,
              isNostalgic: true,
              era: theme.era,
              style: theme.style,
              sourceType: content.sourceType,
              sourceId: content.sourceId,
              aiGenerated: imageResult.success,
              logoStyle: appliedLogoStyle, // Creative logo placement style used
            },
            status: 'draft',
            moderationStatus: 'pending',
          },
        });

        // Update job progress
        await prisma.batchJob.update({
          where: { id: jobId },
          data: { completedItems: { increment: 1 } },
        });

      } catch (error) {
        logger.error('Failed to generate flyer in batch', { jobId, index: i, error });

        // Update failed count
        await prisma.batchJob.update({
          where: { id: jobId },
          data: { failedItems: { increment: 1 } },
        });
      }
    }

    // Mark job as complete
    await prisma.batchJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Log usage
    await prisma.usageLog.create({
      data: {
        tenantId,
        userId,
        action: 'batch_gen',
        tool: 'batch_flyer',
        creditsUsed: contentItems.length,
        metadata: { jobId, count: contentItems.length },
      },
    });

    logger.info('Batch generation completed', { jobId, total: contentItems.length });

    // Cleanup logo styles tracking for this batch
    batchLogoStyles.delete(jobId);

  } catch (error) {
    logger.error('Batch generation failed', { jobId, error });

    await prisma.batchJob.update({
      where: { id: jobId },
      data: { status: 'failed' },
    });
  }
}

function getNext9AM(timezone: string): Date {
  // Simple implementation - get tomorrow at 9am
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow;
}

export default router;
