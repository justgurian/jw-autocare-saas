import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { prisma } from '../../db/client';
import { geminiService } from '../../services/gemini.service';
import { themeRegistry } from '../../prompts/themes';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Validation schema
const generateSchema = z.object({
  message: z.string().min(1).max(500),
  subject: z.string().min(1).max(200),
  details: z.string().max(500).optional(),
  themeId: z.string().min(1),
  language: z.enum(['en', 'es']).default('en'),
  generateMockup: z.boolean().default(false),
});

// Get available themes (brand styles featured first)
router.get('/themes', async (_req: Request, res: Response) => {
  const brandStyles = themeRegistry.getBrandStyles();
  const allThemes = themeRegistry.getAllThemes();

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
    categories: themeRegistry.getCategories(),
  });
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

// Generate promo flyer
router.post('/generate', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const result = generateSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const { message, subject, details, themeId, language, generateMockup } = result.data;
    const tenantId = req.user!.tenantId;

    // Get theme
    const theme = themeRegistry.getTheme(themeId);
    if (!theme) {
      throw new ValidationError('Invalid theme', { themeId: ['Theme not found'] });
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

    // Build image generation prompt using enhanced brand style system
    const imagePrompt = themeRegistry.buildImagePrompt(themeId, {
      headline: message,
      subject,
      details,
      businessName: profileContext.businessName,
      logoInstructions: brandKit?.logoUrl
        ? `Incorporate the business logo aesthetically into the design`
        : undefined,
    });

    // Generate caption in parallel with image (using profile-aware method)
    const captionPromise = geminiService.generateMarketingCopyWithProfile({
      type: 'caption',
      topic: `${subject} - ${message}`,
      profile: profileContext,
      language,
    });

    // Generate content ID early for storage
    const contentId = uuidv4();

    // Generate actual image using Gemini 2.0 Flash
    logger.info('Generating image with Gemini', { themeId, subject });
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
      imageUrl = `https://placehold.co/800x1000/${theme.imagePrompt.colorPalette.split(',')[0].trim().replace('#', '').substring(0, 6) || 'C53030'}/FFF?text=${encodeURIComponent(message.substring(0, 20))}`;
    }

    const caption = await captionPromise;

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
        theme: themeId,
        imageUrl,
        caption,
        captionSpanish: language === 'es' ? caption : null,
        metadata: {
          message,
          subject,
          details,
          language,
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

    logger.info('Promo flyer generated', { contentId: content.id, tenantId });

    res.status(201).json({
      id: content.id,
      imageUrl: content.imageUrl,
      caption: content.caption,
      theme: themeId,
      status: content.status,
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
