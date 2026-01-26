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
} from '../../prompts/themes';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import {
  generateSchema,
  generatePackSchema,
  nostalgicThemesQuerySchema,
  vehiclesQuerySchema,
  GeneratedFlyer,
  PACK_DEFINITIONS,
  PackType,
} from './promo-flyer.types';

const router = Router();

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

    // Pick random brand style (from the 8 premium styles)
    const brandStyles = themeRegistry.getBrandStyles();
    const randomStyle = brandStyles[Math.floor(Math.random() * brandStyles.length)];

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
        ? `Incorporate the business logo aesthetically into the design`
        : undefined,
    });

    // Generate caption in parallel
    const captionPromise = geminiService.generateMarketingCopyWithProfile({
      type: 'caption',
      topic: `${content.subject} - ${content.message}`,
      profile: profileContext,
      language: 'en',
    });

    // Generate content ID
    const contentId = uuidv4();

    // Generate image
    logger.info('Push to Start: Generating instant flyer', {
      themeId: randomStyle.id,
      contentType: content.type,
      subject: content.subject,
    });

    const imageResult = await geminiService.generateImage(imagePrompt, {
      aspectRatio: '4:5',
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
        promptUsed: imagePrompt,
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

    logger.info('Push to Start: Instant flyer generated successfully', {
      contentId: savedContent.id,
      tenantId,
      style: randomStyle.name,
    });

    res.status(201).json({
      id: savedContent.id,
      imageUrl: savedContent.imageUrl,
      caption: savedContent.caption,
      title: savedContent.title,
      theme: randomStyle.id,
      themeName: randomStyle.name,
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

    // Generate content ID early for storage
    const contentId = uuidv4();

    // Generate actual image using Gemini 2.0 Flash
    logger.info('Generating image with Gemini', { themeId: selectedThemeId, subject, vehicle: selectedVehicle?.name });
    const imageResult = await geminiService.generateImage(imagePrompt, {
      aspectRatio: '4:5',
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

    switch (packType) {
      case 'variety-3':
      case 'variety-5':
      case 'week-7':
        // Random variety - pick from all nostalgic themes, trying to avoid duplicates
        const allNostalgic = [...NOSTALGIC_THEMES];
        for (let i = 0; i < count && allNostalgic.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * allNostalgic.length);
          selectedThemes.push(allNostalgic.splice(randomIndex, 1)[0]);
        }
        break;

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

    // Generate all flyers
    const generatedFlyers: GeneratedFlyer[] = [];

    for (const theme of selectedThemes) {
      // Select vehicle for this flyer
      let selectedVehicle: EraVehicle | undefined;
      if (vehicleId === 'random') {
        selectedVehicle = themeRegistry.getRandomVehicleByEra(theme.era);
      } else if (vehicleId) {
        selectedVehicle = themeRegistry.getVehicleById(vehicleId);
      }

      // Build vehicle prompt addition
      let vehiclePromptAddition = '';
      if (selectedVehicle) {
        vehiclePromptAddition = `\n\nFEATURE THIS VEHICLE: ${themeRegistry.getVehicleImagePrompt(selectedVehicle)}`;
      }

      // Build image prompt
      const imagePrompt = buildNostalgicImagePrompt(theme, {
        headline: message,
        subject,
        details,
        businessName: profileContext.businessName,
        logoInstructions: brandKit?.logoUrl
          ? `Incorporate the business logo aesthetically into the design`
          : undefined,
        vehiclePrompt: vehiclePromptAddition,
      });

      const contentId = uuidv4();

      // Generate image
      logger.info('Pack generation: Creating flyer', { themeId: theme.id, packType });
      const imageResult = await geminiService.generateImage(imagePrompt, {
        aspectRatio: '4:5',
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
            isNostalgic: true,
            era: theme.era,
            style: theme.style,
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

// Helper function to build nostalgic image prompt
function buildNostalgicImagePrompt(
  theme: NostalgicThemeDefinition,
  content: {
    headline: string;
    subject: string;
    details?: string;
    businessName?: string;
    logoInstructions?: string;
    vehiclePrompt?: string;
  }
): string {
  return `You are an expert graphic designer creating a STUNNING promotional image for an auto repair shop's social media marketing.

=== CREATIVE DIRECTION ===
Create a promotional flyer in the "${theme.name}" style from the ${theme.era}.
This is a ${theme.style === 'comic-book' ? 'COMIC BOOK' : theme.style === 'movie-poster' ? 'MOVIE POSTER' : 'CAR MAGAZINE'} style design.

=== VISUAL STYLE SPECIFICATIONS ===
${theme.imagePrompt.style}

=== COLOR PALETTE ===
${theme.imagePrompt.colorPalette}

=== TYPOGRAPHY ===
${theme.imagePrompt.typography}

=== DESIGN ELEMENTS ===
${theme.imagePrompt.elements}

=== MOOD & ATMOSPHERE ===
${theme.imagePrompt.mood}

=== CAR/VEHICLE STYLING ===
${theme.carStyle}
${content.vehiclePrompt || ''}

=== COMPOSITION & LAYOUT ===
${theme.composition}

=== CONTENT TO FEATURE ===
HEADLINE (feature prominently): "${content.headline}"
SUBJECT/SERVICE: ${content.subject}
${content.details ? `DETAILS: ${content.details}` : ''}
${content.businessName ? `BUSINESS NAME: "${content.businessName}" - include as branding` : ''}
${content.logoInstructions ? `LOGO: ${content.logoInstructions}` : ''}

=== QUALITY STANDARDS ===
- Professional marketing agency quality
- Scroll-stopping visual impact
- Clean, polished, impressive design
- Auto repair industry appropriate
- Authentic ${theme.era} ${theme.style} aesthetic

=== MUST AVOID ===
${theme.avoidList}
- Realistic human faces
- Copyrighted logos or characters
- Tiny, unreadable text
- Cluttered layouts
- Amateur or low-quality appearance

Create ONE stunning 4:5 aspect ratio promotional image that an auto repair shop would proudly post on Instagram/Facebook.`;
}

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
