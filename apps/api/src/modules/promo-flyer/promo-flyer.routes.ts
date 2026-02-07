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
  NOSTALGIC_ERAS,
  NOSTALGIC_STYLES,
  getFamilyForTheme,
} from '../../prompts/themes';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import {
  getPreferences,
  buildPreferencesUpdate,
  recordThemeUsage,
  addFeedback,
  selectNextTheme,
  selectWeekThemes,
  type TenantStylePreferences,
  type FeedbackEntry,
} from '../../services/smart-rotation';
import {
  getVehiclePreferences,
  buildVehiclePreferencesUpdate,
  selectVehicleForFlyer,
  buildVehiclePromptForFlyer,
  getVehicleKey,
  recordVehicleUsage as recordVehicleUsageHelper,
} from '../../services/vehicle-selection';
import { getAllCarMakes, isValidMakeId } from '../../data/car-makes';
import {
  generateSchema,
  generatePackSchema,
  nostalgicThemesQuerySchema,
  vehiclesQuerySchema,
  GeneratedFlyer,
  PACK_DEFINITIONS,
  PackType,
} from './promo-flyer.types';

import { buildNostalgicImagePrompt } from '../../services/prompt-builder.service';
import { fetchMascotAsBase64 } from '../../services/mascot.util';

const router = Router();

// Fetch a logo URL and convert to base64 for passing to the image model
async function fetchLogoAsBase64(logoUrl: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type') || 'image/png';
    return { base64: buffer.toString('base64'), mimeType };
  } catch (err) {
    logger.warn('Failed to fetch logo for image generation', { logoUrl });
    return null;
  }
}

router.use(authenticate);
router.use(tenantContext);

// Get available themes (brand styles featured first)
router.get('/themes', async (_req: Request, res: Response) => {
  const brandStyles = themeRegistry.getBrandStyles();
  const allThemes = themeRegistry.getAllThemes();
  const nostalgicThemes = themeRegistry.getNostalgicThemes();

  res.json({
    // Featured brand styles (premium, comprehensive styles)
    brandStyles: brandStyles.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      shortDescription: t.shortDescription,
      fullDescription: t.fullDescription,
      previewColors: t.previewColors,
      previewUrl: t.previewUrl,
    })),
    // All themes including legacy (for backward compatibility)
    themes: allThemes.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      shortDescription: t.shortDescription,
      previewColors: t.previewColors,
      previewUrl: t.previewUrl,
    })),
    // Nostalgic themes (48 new themes)
    nostalgicThemes: nostalgicThemes.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      shortDescription: t.shortDescription,
      previewColors: t.previewColors,
      era: t.era,
      style: t.style,
    })),
    categories: themeRegistry.getCategories(),
    // Era and style metadata for filtering
    eras: NOSTALGIC_ERAS,
    styles: NOSTALGIC_STYLES,
  });
});

// Get nostalgic themes with filtering
router.get('/nostalgic-themes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = nostalgicThemesQuerySchema.safeParse(req.query);

    let themes: NostalgicThemeDefinition[];

    if (query.success && query.data.era && query.data.style) {
      themes = themeRegistry.getNostalgicThemesByEraAndStyle(query.data.era, query.data.style);
    } else if (query.success && query.data.era) {
      themes = themeRegistry.getNostalgicThemesByEra(query.data.era);
    } else if (query.success && query.data.style) {
      themes = themeRegistry.getNostalgicThemesByStyle(query.data.style);
    } else {
      themes = themeRegistry.getNostalgicThemes();
    }

    res.json({
      themes: themes.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        shortDescription: t.shortDescription,
        previewColors: t.previewColors,
        era: t.era,
        style: t.style,
      })),
      eras: NOSTALGIC_ERAS,
      styles: NOSTALGIC_STYLES,
      totalCount: themes.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get vehicles by era
router.get('/vehicles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = vehiclesQuerySchema.safeParse(req.query);

    let vehicles: EraVehicle[];

    if (query.success && query.data.era) {
      vehicles = themeRegistry.getVehiclesByEra(query.data.era);
    } else {
      vehicles = themeRegistry.getAllVehicles();
    }

    res.json({
      vehicles: vehicles.map(v => ({
        id: v.id,
        name: v.name,
        make: v.make,
        model: v.model,
        year: v.year,
        description: v.description,
      })),
      era: query.success ? query.data.era : undefined,
      eraInfo: themeRegistry.getEraInfo(),
    });
  } catch (error) {
    next(error);
  }
});

// Get a random theme (Surprise Me!)
router.get('/random-theme', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { era, style, nostalgicOnly } = req.query;

    let theme;

    if (nostalgicOnly === 'true' || era || style) {
      // Return a random nostalgic theme
      if (era && style) {
        const validEra = era as '1950s' | '1960s' | '1970s' | '1980s';
        const validStyle = style as 'comic-book' | 'movie-poster' | 'magazine';
        const themes = themeRegistry.getNostalgicThemesByEraAndStyle(validEra, validStyle);
        theme = themes[Math.floor(Math.random() * themes.length)];
      } else if (era) {
        theme = themeRegistry.getRandomNostalgicThemeByEra(era as '1950s' | '1960s' | '1970s' | '1980s');
      } else if (style) {
        theme = themeRegistry.getRandomNostalgicThemeByStyle(style as 'comic-book' | 'movie-poster' | 'magazine');
      } else {
        theme = themeRegistry.getRandomNostalgicTheme();
      }

      res.json({
        theme: {
          id: theme.id,
          name: theme.name,
          category: theme.category,
          shortDescription: theme.shortDescription,
          previewColors: theme.previewColors,
          era: theme.era,
          style: theme.style,
        },
        isNostalgic: true,
      });
    } else {
      // Return a random theme from all themes
      const allThemes = themeRegistry.getAllThemes();
      theme = allThemes[Math.floor(Math.random() * allThemes.length)];

      res.json({
        theme: {
          id: theme.id,
          name: theme.name,
          category: theme.category,
          shortDescription: theme.shortDescription,
          previewColors: theme.previewColors,
        },
        isNostalgic: false,
      });
    }
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// STYLE FAMILY & PREFERENCE ENDPOINTS
// ============================================================================

// Get all style families
router.get('/families', async (_req: Request, res: Response) => {
  const families = themeRegistry.getAllFamilies();
  res.json({
    families: families.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      emoji: f.emoji,
      previewImage: f.previewImage,
      themeCount: f.themeIds.length,
      tags: f.tags,
    })),
  });
});

// Get all car makes (for the selection grid)
router.get('/car-makes', async (_req: Request, res: Response) => {
  const makes = getAllCarMakes();
  res.json({
    makes: makes.map(m => ({
      id: m.id,
      name: m.name,
      emoji: m.emoji,
      color: m.color,
      models: m.models,
    })),
  });
});

// Get vehicle preferences for the current tenant
router.get('/vehicle-preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId },
      select: { settings: true },
    });
    const prefs = getVehiclePreferences((tenant?.settings as Record<string, unknown>) || {});
    res.json(prefs);
  } catch (error) {
    next(error);
  }
});

// Save vehicle preferences
router.post('/vehicle-preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lovedMakes, neverMakes } = req.body;

    if (!Array.isArray(lovedMakes)) {
      throw new ValidationError('Invalid vehicle preferences', {
        lovedMakes: ['lovedMakes must be an array'],
      });
    }

    // Validate make IDs
    for (const entry of lovedMakes) {
      if (!entry.makeId || !isValidMakeId(entry.makeId)) {
        throw new ValidationError('Invalid make', { lovedMakes: [`Unknown make: ${entry.makeId}`] });
      }
    }
    if (Array.isArray(neverMakes)) {
      for (const makeId of neverMakes) {
        if (!isValidMakeId(makeId)) {
          throw new ValidationError('Invalid make', { neverMakes: [`Unknown make: ${makeId}`] });
        }
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId },
      select: { settings: true },
    });

    const currentSettings = (tenant?.settings as Record<string, unknown>) || {};
    const updatedSettings = buildVehiclePreferencesUpdate(currentSettings, {
      lovedMakes: lovedMakes.map((e: any) => ({ makeId: e.makeId, models: e.models || [] })),
      neverMakes: Array.isArray(neverMakes) ? neverMakes : [],
    });

    await prisma.tenant.update({
      where: { id: req.user!.tenantId },
      data: { settings: updatedSettings as any },
    });

    logger.info('Vehicle preferences saved', { tenantId: req.user!.tenantId, lovedCount: lovedMakes.length, neverCount: neverMakes?.length || 0 });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get style preferences for the current tenant
router.get('/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId },
      select: { settings: true },
    });
    const prefs = getPreferences((tenant?.settings as Record<string, unknown>) || {});
    res.json(prefs);
  } catch (error) {
    next(error);
  }
});

// Save style preferences (from taste test or settings page)
router.post('/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { styleFamilyIds } = req.body;
    if (!Array.isArray(styleFamilyIds) || styleFamilyIds.length === 0 || styleFamilyIds.length > 3) {
      throw new ValidationError('Select 1-3 style families', {
        styleFamilyIds: ['Please select between 1 and 3 style families'],
      });
    }

    // Validate family IDs exist
    for (const id of styleFamilyIds) {
      if (!themeRegistry.getFamilyById(id)) {
        throw new ValidationError('Invalid family', { styleFamilyIds: [`Unknown family: ${id}`] });
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId },
      select: { settings: true },
    });

    const currentSettings = (tenant?.settings as Record<string, unknown>) || {};
    const updatedSettings = buildPreferencesUpdate(currentSettings, { styleFamilyIds });

    await prisma.tenant.update({
      where: { id: req.user!.tenantId },
      data: { settings: updatedSettings as any },
    });

    logger.info('Style preferences saved', { tenantId: req.user!.tenantId, styleFamilyIds });
    res.json({ success: true, styleFamilyIds });
  } catch (error) {
    next(error);
  }
});

// Submit feedback (fire / solid / meh)
router.post('/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentId, rating } = req.body;

    if (!contentId || !['fire', 'solid', 'meh'].includes(rating)) {
      throw new ValidationError('Invalid feedback', {
        rating: ['Rating must be fire, solid, or meh'],
      });
    }

    // Find the content to get its theme info
    const content = await prisma.content.findFirst({
      where: { id: contentId, tenantId: req.user!.tenantId },
      select: { theme: true, metadata: true },
    });

    if (!content) {
      throw new ValidationError('Content not found');
    }

    const themeId = content.theme || '';
    const family = getFamilyForTheme(themeId);
    const familyId = family?.id || 'unknown';

    const entry: FeedbackEntry = {
      contentId,
      familyId,
      themeId,
      rating,
      timestamp: new Date().toISOString(),
    };

    // Update tenant preferences with new feedback
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId },
      select: { settings: true },
    });

    const currentSettings = (tenant?.settings as Record<string, unknown>) || {};
    const updatedSettings = addFeedback(currentSettings, entry);

    await prisma.tenant.update({
      where: { id: req.user!.tenantId },
      data: { settings: updatedSettings as any },
    });

    // Also store feedback on the content's metadata
    const contentMeta = (content.metadata as Record<string, unknown>) || {};
    await prisma.content.update({
      where: { id: contentId },
      data: {
        metadata: { ...contentMeta, userRating: rating },
      },
    });

    logger.info('Feedback recorded', { contentId, rating, familyId, tenantId: req.user!.tenantId });
    res.json({ success: true, rating, familyId });
  } catch (error) {
    next(error);
  }
});

// Get weekly featured theme drop
router.get('/weekly-drop', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const family = themeRegistry.getWeeklyDropFamily();
    const weekString = themeRegistry.getCurrentWeekString();

    // Check if user dismissed this week's drop
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId },
      select: { settings: true },
    });
    const prefs = getPreferences((tenant?.settings as Record<string, unknown>) || {});
    const dismissed = prefs.weeklyDropDismissed === weekString;

    res.json({
      family: {
        id: family.id,
        name: family.name,
        description: family.description,
        emoji: family.emoji,
        previewImage: family.previewImage,
      },
      weekString,
      dismissed,
    });
  } catch (error) {
    next(error);
  }
});

// Dismiss weekly drop
router.post('/weekly-drop/dismiss', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weekString = themeRegistry.getCurrentWeekString();
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId },
      select: { settings: true },
    });

    const currentSettings = (tenant?.settings as Record<string, unknown>) || {};
    const updatedSettings = buildPreferencesUpdate(currentSettings, {
      weeklyDropDismissed: weekString,
    });

    await prisma.tenant.update({
      where: { id: req.user!.tenantId },
      data: { settings: updatedSettings as any },
    });

    res.json({ success: true, dismissed: weekString });
  } catch (error) {
    next(error);
  }
});

// Get week plan - returns 7 themes for the content calendar (no image generation)
router.get('/calendar/week-plan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId },
      select: { settings: true },
    });
    const prefs = getPreferences((tenant?.settings as Record<string, unknown>) || {});
    const themes = selectWeekThemes(prefs);

    const days = themes.map((theme, index) => {
      const family = getFamilyForTheme(theme.id);
      return {
        dayIndex: index,
        themeId: theme.id,
        themeName: theme.name,
        familyId: family?.id || 'unknown',
        familyName: family?.name || 'Mixed',
        emoji: family?.emoji || '🎨',
        previewImage: family?.previewImage,
      };
    });

    res.json({ days });
  } catch (error) {
    next(error);
  }
});

// PUSH TO START - One-click instant flyer generation
router.post('/instant', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    // Get brand kit and business profile
    const brandKit = await prisma.brandKit.findUnique({
      where: { tenantId },
    });

    // Get services and specials for content inspiration
    const [services, specials] = await Promise.all([
      prisma.service.findMany({
        where: { tenantId },
        take: 20,
      }),
      prisma.special.findMany({
        where: {
          tenantId,
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } },
          ],
        },
        take: 10,
      }),
    ]);

    // Build content pool - prioritize active specials, then services
    const contentPool: Array<{ message: string; subject: string; details?: string; type: 'special' | 'service' }> = [];

    // Add active specials
    for (const special of specials) {
      const discount = special.discountType === 'percentage'
        ? `${special.discountValue}% OFF`
        : special.discountType === 'fixed'
        ? `$${special.discountValue} OFF`
        : special.discountType === 'bogo'
        ? 'Buy One Get One'
        : 'Special Offer';

      contentPool.push({
        message: `${discount} ${special.title}`,
        subject: special.title,
        details: special.description || undefined,
        type: 'special',
      });
    }

    // Add services with promotional messages
    const promoMessages = [
      'Time for a Check-Up!',
      'Keep Your Ride Running Smooth',
      'Don\'t Wait - Book Today!',
      'Expert Service You Can Trust',
      'Quality Care for Your Vehicle',
      'Professional Service, Fair Prices',
      'Your Car Deserves the Best',
      'Maintenance Made Easy',
    ];

    for (const service of services.slice(0, 10)) {
      const randomPromo = promoMessages[Math.floor(Math.random() * promoMessages.length)];
      contentPool.push({
        message: randomPromo,
        subject: service.name,
        details: service.description || undefined,
        type: 'service',
      });
    }

    // If no content pool, create generic
    if (contentPool.length === 0) {
      contentPool.push({
        message: 'Quality Auto Care You Can Trust',
        subject: 'Full Service Auto Repair',
        details: 'Expert mechanics, honest prices, friendly service',
        type: 'service',
      });
    }

    // Pick random content
    const content = contentPool[Math.floor(Math.random() * contentPool.length)];

    // Use smart rotation to pick theme based on user preferences
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const stylePrefs = getPreferences((tenant?.settings as Record<string, unknown>) || {});

    // Allow optional themeId override (used by content calendar for progressive loading)
    let smartTheme;
    if (req.body?.themeId) {
      const requestedTheme = themeRegistry.getTheme(req.body.themeId) || themeRegistry.getNostalgicTheme(req.body.themeId);
      if (requestedTheme) {
        smartTheme = requestedTheme;
      } else {
        smartTheme = selectNextTheme(stylePrefs);
      }
    } else {
      smartTheme = selectNextTheme(stylePrefs);
    }

    // Use smartTheme as the selected style
    const randomStyle = smartTheme;

    // Build profile context
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

    // Build enhanced image prompt using brand style system
    const imagePrompt = themeRegistry.buildImagePrompt(randomStyle.id, {
      headline: content.message,
      subject: content.subject,
      details: content.details,
      businessName: profileContext.businessName,
      logoInstructions: brandKit?.logoUrl
        ? `The business logo is attached as a reference image. You MUST incorporate this exact logo prominently into the flyer design. Place it where it is clearly visible.`
        : undefined,
    });

    // Vehicle injection: 80% chance to feature a car from loved makes
    const vehiclePrefs = getVehiclePreferences((tenant?.settings as Record<string, unknown>) || {});
    const selectedVehicle2 = selectVehicleForFlyer(vehiclePrefs);
    let finalImagePrompt = imagePrompt;
    if (selectedVehicle2) {
      finalImagePrompt += buildVehiclePromptForFlyer(selectedVehicle2);
    }

    // Handle optional mascot
    const mascotId = req.body?.mascotId as string | undefined;
    let mascotImageData: { base64: string; mimeType: string } | undefined;
    if (mascotId) {
      const mascot = await fetchMascotAsBase64(mascotId, tenantId);
      if (mascot) {
        finalImagePrompt += '\n\nFeaturing the shop mascot character: ' + mascot.characterPrompt;
        mascotImageData = { base64: mascot.base64, mimeType: mascot.mimeType };
      }
    }

    // Generate caption in parallel
    const captionPromise = geminiService.generateMarketingCopyWithProfile({
      type: 'caption',
      topic: `${content.subject} - ${content.message}`,
      profile: profileContext,
      language: 'en',
    });

    // Generate content ID
    const contentId = uuidv4();

    // Fetch logo if available (in parallel with other setup)
    const logoImage = brandKit?.logoUrl ? await fetchLogoAsBase64(brandKit.logoUrl) : null;

    // Generate image
    logger.info('Push to Start: Generating instant flyer', {
      themeId: randomStyle.id,
      contentType: content.type,
      subject: content.subject,
      hasLogo: !!logoImage,
      hasMascot: !!mascotImageData,
    });

    const imageResult = await geminiService.generateImage(finalImagePrompt, {
      aspectRatio: '4:5',
      logoImage: logoImage || undefined,
      mascotImage: mascotImageData,
      contactInfo: {
        phone: brandKit?.phone || undefined,
        website: brandKit?.website || undefined,
      },
    });

    let imageUrl: string;
    if (imageResult.success && imageResult.imageData) {
      // Convert to base64 data URL for immediate display (works without file storage)
      const base64Data = imageResult.imageData.toString('base64');
      const mimeType = imageResult.mimeType || 'image/png';
      imageUrl = `data:${mimeType};base64,${base64Data}`;
      logger.info('Instant flyer image generated', { contentId, size: imageResult.imageData.length });
    } else {
      // Fallback placeholder
      logger.warn('Instant flyer image generation failed', { error: imageResult.error });
      const colorHex = randomStyle.previewColors?.[0]?.replace('#', '') || 'C53030';
      imageUrl = `https://placehold.co/800x1000/${colorHex}/FFF?text=${encodeURIComponent(content.message.substring(0, 20))}`;
    }

    const caption = await captionPromise;

    // Save to database
    const savedContent = await prisma.content.create({
      data: {
        id: contentId,
        tenantId,
        userId: req.user!.id,
        tool: 'promo_flyer',
        contentType: 'image',
        title: content.subject,
        promptUsed: finalImagePrompt,
        theme: randomStyle.id,
        imageUrl,
        caption,
        metadata: {
          message: content.message,
          subject: content.subject,
          details: content.details,
          instant: true,
          contentSourceType: content.type,
          aiGenerated: imageResult.success,
        },
        status: 'draft',
        moderationStatus: 'pending',
      },
    });

    // Log usage
    await prisma.usageLog.create({
      data: {
        tenantId,
        userId: req.user!.id,
        action: 'image_gen',
        tool: 'promo_flyer_instant',
        creditsUsed: 1,
        metadata: { contentId: savedContent.id },
      },
    });

    // Record theme usage for smart rotation
    let usageSettings = recordThemeUsage(
      (tenant?.settings as Record<string, unknown>) || {},
      randomStyle.id
    );
    if (selectedVehicle2) {
      usageSettings = recordVehicleUsageHelper(usageSettings, getVehicleKey(selectedVehicle2));
    }
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: usageSettings as any },
    });

    const selectedFamily = getFamilyForTheme(randomStyle.id);

    logger.info('Push to Start: Instant flyer generated successfully', {
      contentId: savedContent.id,
      tenantId,
      style: randomStyle.name,
      familyId: selectedFamily?.id,
    });

    res.status(201).json({
      id: savedContent.id,
      imageUrl: savedContent.imageUrl,
      caption: savedContent.caption,
      title: savedContent.title,
      theme: randomStyle.id,
      themeName: randomStyle.name,
      familyId: selectedFamily?.id,
      familyName: selectedFamily?.name,
      vehicleMake: selectedVehicle2?.make,
      vehicleModel: selectedVehicle2?.model,
      status: savedContent.status,
      instant: true,
    });
  } catch (error) {
    next(error);
  }
});

// Generate promo flyer (enhanced with vehicle selection and language options)
router.post('/generate', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const result = generateSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const { message, subject, details, themeId, vehicleId, language, generateMockup } = result.data;
    const tenantId = req.user!.tenantId;

    // Handle random theme selection
    let selectedThemeId = themeId;
    if (themeId === 'random') {
      const randomTheme = themeRegistry.getRandomNostalgicTheme();
      selectedThemeId = randomTheme.id;
    }

    // Get theme (check nostalgic themes first, then regular themes)
    const nostalgicTheme = themeRegistry.getNostalgicTheme(selectedThemeId);
    const regularTheme = themeRegistry.getTheme(selectedThemeId);
    const theme = nostalgicTheme || regularTheme;

    if (!theme) {
      throw new ValidationError('Invalid theme', { themeId: ['Theme not found'] });
    }

    // Handle vehicle selection
    let selectedVehicle: EraVehicle | undefined;
    if (vehicleId === 'random') {
      // If nostalgic theme, get era-appropriate vehicle
      if (nostalgicTheme) {
        selectedVehicle = themeRegistry.getRandomVehicleByEra(nostalgicTheme.era);
      } else {
        selectedVehicle = themeRegistry.getRandomVehicle();
      }
    } else if (vehicleId) {
      selectedVehicle = themeRegistry.getVehicleById(vehicleId);
    }

    // Get full brand kit / profile for personalization
    const brandKit = await prisma.brandKit.findUnique({
      where: { tenantId },
    });

    // Build profile context for AI
    const profileContext = {
      businessName: brandKit?.businessName || undefined,
      city: brandKit?.city || undefined,
      state: brandKit?.state || undefined,
      tagline: brandKit?.tagline || undefined,
      specialties: brandKit?.specialties || [],
      brandVoice: brandKit?.brandVoice || 'friendly',
      primaryColor: brandKit?.primaryColor || undefined,
      secondaryColor: brandKit?.secondaryColor || undefined,
      uniqueSellingPoints: brandKit?.uniqueSellingPoints || [],
      targetDemographics: brandKit?.targetDemographics || undefined,
      targetPainPoints: brandKit?.targetPainPoints || undefined,
    };

    // Build vehicle prompt addition
    let vehiclePromptAddition = '';
    if (selectedVehicle) {
      vehiclePromptAddition = `\n\nFEATURE THIS VEHICLE: ${themeRegistry.getVehicleImagePrompt(selectedVehicle)}`;
    } else if (nostalgicTheme) {
      // For nostalgic themes without specific vehicle, add era context
      vehiclePromptAddition = `\n\nERA CONTEXT: This is a ${nostalgicTheme.era} themed design. Include era-appropriate vehicle imagery.`;
    }

    // Build image generation prompt
    let imagePrompt: string;
    if (nostalgicTheme) {
      // Use nostalgic theme's detailed prompts
      imagePrompt = buildNostalgicImagePrompt(nostalgicTheme, {
        headline: message,
        subject,
        details,
        businessName: profileContext.businessName,
        logoInstructions: brandKit?.logoUrl
          ? `Incorporate the business logo aesthetically into the design`
          : undefined,
        vehiclePrompt: vehiclePromptAddition,
      });
    } else {
      // Use standard brand style prompt
      imagePrompt = themeRegistry.buildImagePrompt(selectedThemeId, {
        headline: message,
        subject,
        details,
        businessName: profileContext.businessName,
        logoInstructions: brandKit?.logoUrl
          ? `Incorporate the business logo aesthetically into the design`
          : undefined,
      }) + vehiclePromptAddition;
    }

    // Handle optional mascot
    const mascotId = req.body?.mascotId as string | undefined;
    let mascotImageData: { base64: string; mimeType: string } | undefined;
    if (mascotId) {
      const mascot = await fetchMascotAsBase64(mascotId, tenantId);
      if (mascot) {
        imagePrompt += '\n\nFeaturing the shop mascot character: ' + mascot.characterPrompt;
        mascotImageData = { base64: mascot.base64, mimeType: mascot.mimeType };
      }
    }

    // Generate captions based on language option
    const captionPromises: Promise<string>[] = [];

    if (language === 'en' || language === 'both') {
      captionPromises.push(
        geminiService.generateMarketingCopyWithProfile({
          type: 'caption',
          topic: `${subject} - ${message}`,
          profile: profileContext,
          language: 'en',
        })
      );
    }

    if (language === 'es' || language === 'both') {
      captionPromises.push(
        geminiService.generateMarketingCopyWithProfile({
          type: 'caption',
          topic: `${subject} - ${message}`,
          profile: profileContext,
          language: 'es',
        })
      );
    }

    // Fetch logo if available
    const logoImage = brandKit?.logoUrl ? await fetchLogoAsBase64(brandKit.logoUrl) : null;

    // Generate content ID early for storage
    const contentId = uuidv4();

    // Generate actual image using Nano Banana Pro
    logger.info('Generating image with Nano Banana Pro', { themeId: selectedThemeId, subject, vehicle: selectedVehicle?.name, hasLogo: !!logoImage, hasMascot: !!mascotImageData });
    const imageResult = await geminiService.generateImage(imagePrompt, {
      aspectRatio: '4:5',
      logoImage: logoImage || undefined,
      mascotImage: mascotImageData,
      contactInfo: {
        phone: brandKit?.phone || undefined,
        website: brandKit?.website || undefined,
      },
    });

    let imageUrl: string;

    if (imageResult.success && imageResult.imageData) {
      // Convert to base64 data URL for immediate display (works without file storage)
      const base64Data = imageResult.imageData.toString('base64');
      const mimeType = imageResult.mimeType || 'image/png';
      imageUrl = `data:${mimeType};base64,${base64Data}`;
      logger.info('AI-generated image created', { contentId, size: imageResult.imageData.length });
    } else {
      // Fallback to placeholder if image generation fails
      logger.warn('Image generation failed, using placeholder', { error: imageResult.error });
      const colorHex = theme.previewColors?.[0]?.replace('#', '') || 'C53030';
      imageUrl = `https://placehold.co/800x1000/${colorHex}/FFF?text=${encodeURIComponent(message.substring(0, 20))}`;
    }

    const captions = await Promise.all(captionPromises);
    const caption = language === 'es' ? captions[0] : captions[0];
    const captionSpanish = language === 'both' ? captions[1] : (language === 'es' ? captions[0] : null);

    // Save content to database
    const content = await prisma.content.create({
      data: {
        id: contentId,
        tenantId,
        userId: req.user!.id,
        tool: 'promo_flyer',
        contentType: 'image',
        title: subject,
        promptUsed: imagePrompt,
        theme: selectedThemeId,
        imageUrl,
        caption,
        captionSpanish,
        metadata: {
          message,
          subject,
          details,
          language,
          vehicleId: selectedVehicle?.id,
          vehicleName: selectedVehicle?.name,
          isNostalgic: !!nostalgicTheme,
          era: nostalgicTheme?.era,
          style: nostalgicTheme?.style,
          aiGenerated: imageResult.success,
        },
        status: 'draft',
        moderationStatus: 'pending',
      },
    });

    // Log usage
    await prisma.usageLog.create({
      data: {
        tenantId,
        userId: req.user!.id,
        action: 'image_gen',
        tool: 'promo_flyer',
        creditsUsed: 1,
        metadata: { contentId: content.id },
      },
    });

    logger.info('Promo flyer generated', { contentId: content.id, tenantId, themeId: selectedThemeId });

    const response: GeneratedFlyer = {
      id: content.id,
      imageUrl: content.imageUrl!,
      caption: content.caption!,
      captionSpanish: content.captionSpanish,
      title: content.title!,
      theme: selectedThemeId,
      themeName: theme.name,
      vehicle: selectedVehicle ? { id: selectedVehicle.id, name: selectedVehicle.name } : undefined,
      status: content.status,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Generate pack of flyers
router.post('/generate-pack', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const result = generatePackSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const { message, subject, details, packType, era, style, vehicleId, language } = result.data;
    const tenantId = req.user!.tenantId;

    // Validate pack-specific requirements
    if (packType === 'era' && !era) {
      throw new ValidationError('Era is required for era pack', { era: ['Please select an era'] });
    }
    if (packType === 'style' && !style) {
      throw new ValidationError('Style is required for style pack', { style: ['Please select a style'] });
    }

    const packDef = PACK_DEFINITIONS[packType as PackType];
    const count = packDef.count;

    // Select themes based on pack type
    let selectedThemes: NostalgicThemeDefinition[] = [];
    let useSmartThemes = false; // Flag for week-7 using ThemeDefinition[] instead

    // For week-7, use smart rotation (returns ThemeDefinition[], not NostalgicThemeDefinition[])
    let smartSelectedThemes: import('../../prompts/themes').ThemeDefinition[] = [];

    switch (packType) {
      case 'week-7': {
        // Use smart rotation for content calendar
        const tenantForPrefs = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { settings: true },
        });
        const weekPrefs = getPreferences((tenantForPrefs?.settings as Record<string, unknown>) || {});
        smartSelectedThemes = selectWeekThemes(weekPrefs);
        useSmartThemes = true;
        break;
      }
      case 'variety-3':
      case 'variety-5': {
        // Random variety - pick from all nostalgic themes, trying to avoid duplicates
        const allNostalgic = [...NOSTALGIC_THEMES];
        for (let i = 0; i < count && allNostalgic.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * allNostalgic.length);
          selectedThemes.push(allNostalgic.splice(randomIndex, 1)[0]);
        }
        break;
      }

      case 'era':
        // All styles from the same era + 1 bonus
        const eraThemes = themeRegistry.getNostalgicThemesByEra(era!);
        // Get one of each style
        const comicEra = eraThemes.filter(t => t.style === 'comic-book');
        const movieEra = eraThemes.filter(t => t.style === 'movie-poster');
        const magEra = eraThemes.filter(t => t.style === 'magazine');

        if (comicEra.length > 0) selectedThemes.push(comicEra[Math.floor(Math.random() * comicEra.length)]);
        if (movieEra.length > 0) selectedThemes.push(movieEra[Math.floor(Math.random() * movieEra.length)]);
        if (magEra.length > 0) selectedThemes.push(magEra[Math.floor(Math.random() * magEra.length)]);

        // Add bonus theme from same era
        const remaining = eraThemes.filter(t => !selectedThemes.includes(t));
        if (remaining.length > 0) {
          selectedThemes.push(remaining[Math.floor(Math.random() * remaining.length)]);
        }
        break;

      case 'style':
        // Same style from different eras
        const styleThemes = themeRegistry.getNostalgicThemesByStyle(style!);
        const eras = ['1950s', '1960s', '1970s', '1980s'] as const;
        for (const e of eras) {
          const eraStyle = styleThemes.filter(t => t.era === e);
          if (eraStyle.length > 0) {
            selectedThemes.push(eraStyle[Math.floor(Math.random() * eraStyle.length)]);
          }
        }
        break;
    }

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

    // Fetch logo once for all flyers in the pack
    const logoImage = brandKit?.logoUrl ? await fetchLogoAsBase64(brandKit.logoUrl) : null;

    // Generate all flyers - handle both nostalgic and smart-selected themes
    const generatedFlyers: GeneratedFlyer[] = [];

    // Build unified theme list
    type UnifiedTheme = { id: string; name: string; previewColors?: string[]; isNostalgic: boolean; nostalgic?: NostalgicThemeDefinition; standard?: import('../../prompts/themes').ThemeDefinition };
    const unifiedThemes: UnifiedTheme[] = useSmartThemes
      ? smartSelectedThemes.map(t => {
          const nostalgic = themeRegistry.getNostalgicTheme(t.id);
          return { id: t.id, name: t.name, previewColors: t.previewColors, isNostalgic: !!nostalgic, nostalgic, standard: t };
        })
      : selectedThemes.map(t => ({ id: t.id, name: t.name, previewColors: t.previewColors, isNostalgic: true, nostalgic: t }));

    for (const theme of unifiedThemes) {
      // Select vehicle for this flyer
      let selectedVehicle: EraVehicle | undefined;
      if (vehicleId === 'random') {
        if (theme.nostalgic) {
          selectedVehicle = themeRegistry.getRandomVehicleByEra(theme.nostalgic.era);
        } else {
          selectedVehicle = themeRegistry.getRandomVehicle();
        }
      } else if (vehicleId) {
        selectedVehicle = themeRegistry.getVehicleById(vehicleId);
      }

      // Build vehicle prompt addition
      let vehiclePromptAddition = '';
      if (selectedVehicle) {
        vehiclePromptAddition = `\n\nFEATURE THIS VEHICLE: ${themeRegistry.getVehicleImagePrompt(selectedVehicle)}`;
      }

      // Build image prompt based on theme type
      let imagePrompt: string;
      if (theme.nostalgic) {
        imagePrompt = buildNostalgicImagePrompt(theme.nostalgic, {
          headline: message,
          subject,
          details,
          businessName: profileContext.businessName,
          logoInstructions: brandKit?.logoUrl
            ? `Incorporate the business logo aesthetically into the design`
            : undefined,
          vehiclePrompt: vehiclePromptAddition,
        });
      } else {
        imagePrompt = themeRegistry.buildImagePrompt(theme.id, {
          headline: message,
          subject,
          details,
          businessName: profileContext.businessName,
          logoInstructions: brandKit?.logoUrl
            ? `Incorporate the business logo aesthetically into the design`
            : undefined,
        }) + vehiclePromptAddition;
      }

      const contentId = uuidv4();

      // Generate image
      const family = getFamilyForTheme(theme.id);
      logger.info('Pack generation: Creating flyer', { themeId: theme.id, familyId: family?.id, packType, hasLogo: !!logoImage });
      const imageResult = await geminiService.generateImage(imagePrompt, {
        aspectRatio: '4:5',
        logoImage: logoImage || undefined,
        contactInfo: {
          phone: brandKit?.phone || undefined,
          website: brandKit?.website || undefined,
        },
      });

      let imageUrl: string;
      if (imageResult.success && imageResult.imageData) {
        const base64Data = imageResult.imageData.toString('base64');
        const mimeType = imageResult.mimeType || 'image/png';
        imageUrl = `data:${mimeType};base64,${base64Data}`;
      } else {
        const colorHex = theme.previewColors?.[0]?.replace('#', '') || 'C53030';
        imageUrl = `https://placehold.co/800x1000/${colorHex}/FFF?text=${encodeURIComponent(message.substring(0, 20))}`;
      }

      // Generate captions
      const captionPromises: Promise<string>[] = [];
      if (language === 'en' || language === 'both') {
        captionPromises.push(
          geminiService.generateMarketingCopyWithProfile({
            type: 'caption',
            topic: `${subject} - ${message}`,
            profile: profileContext,
            language: 'en',
          })
        );
      }
      if (language === 'es' || language === 'both') {
        captionPromises.push(
          geminiService.generateMarketingCopyWithProfile({
            type: 'caption',
            topic: `${subject} - ${message}`,
            profile: profileContext,
            language: 'es',
          })
        );
      }

      const captions = await Promise.all(captionPromises);
      const caption = language === 'es' ? captions[0] : captions[0];
      const captionSpanish = language === 'both' ? captions[1] : (language === 'es' ? captions[0] : null);

      // Save to database
      const content = await prisma.content.create({
        data: {
          id: contentId,
          tenantId,
          userId: req.user!.id,
          tool: 'promo_flyer',
          contentType: 'image',
          title: subject,
          promptUsed: imagePrompt,
          theme: theme.id,
          imageUrl,
          caption,
          captionSpanish,
          metadata: {
            message,
            subject,
            details,
            language,
            vehicleId: selectedVehicle?.id,
            vehicleName: selectedVehicle?.name,
            isNostalgic: theme.isNostalgic,
            era: theme.nostalgic?.era,
            style: theme.nostalgic?.style,
            familyId: family?.id,
            packType,
            aiGenerated: imageResult.success,
          },
          status: 'draft',
          moderationStatus: 'pending',
        },
      });

      generatedFlyers.push({
        id: content.id,
        imageUrl: content.imageUrl!,
        caption: content.caption!,
        captionSpanish: content.captionSpanish,
        title: content.title!,
        theme: theme.id,
        themeName: theme.name,
        vehicle: selectedVehicle ? { id: selectedVehicle.id, name: selectedVehicle.name } : undefined,
        status: content.status,
      });
    }

    // Log usage for the pack
    await prisma.usageLog.create({
      data: {
        tenantId,
        userId: req.user!.id,
        action: 'image_gen',
        tool: 'promo_flyer_pack',
        creditsUsed: generatedFlyers.length,
        metadata: { packType, count: generatedFlyers.length },
      },
    });

    logger.info('Pack generated successfully', { packType, count: generatedFlyers.length, tenantId });

    res.status(201).json({
      packType,
      flyers: generatedFlyers,
      totalGenerated: generatedFlyers.length,
      era: era || undefined,
      style: style || undefined,
    });
  } catch (error) {
    next(error);
  }
});

// Generate mockup
router.post('/mockup', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentId, sceneIndex = 0 } = req.body;

    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        tenantId: req.user!.tenantId,
      },
    });

    if (!content) {
      throw new ValidationError('Content not found');
    }

    // Get theme for mockup scenes
    const theme = themeRegistry.getTheme(content.theme || '');

    // For MVP, return placeholder mockup
    const mockupUrl = `https://placehold.co/1200x900/1A365D/FFF?text=Mockup+Preview`;

    // Update content with mockup URL
    await prisma.content.update({
      where: { id: contentId },
      data: { mockupUrl },
    });

    res.json({
      mockupUrl,
      scene: theme?.mockupScenes?.[sceneIndex] || 'default scene',
    });
  } catch (error) {
    next(error);
  }
});

// Get preview
router.get('/preview/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId,
        tool: 'promo_flyer',
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

export default router;
