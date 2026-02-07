import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { prisma } from '../../db/client';
import { geminiService } from '../../services/gemini.service';
import { MEME_STYLES, getMemeStyle, buildMemePrompt, getRandomTopicForStyle } from '../../prompts/memes/meme-styles';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { fetchMascotAsBase64 } from '../../services/mascot.util';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Get available meme styles
router.get('/styles', async (_req: Request, res: Response) => {
  const stylesByCategory = {
    relatable: MEME_STYLES.filter(s => s.category === 'relatable'),
    educational: MEME_STYLES.filter(s => s.category === 'educational'),
    seasonal: MEME_STYLES.filter(s => s.category === 'seasonal'),
    promotional: MEME_STYLES.filter(s => s.category === 'promotional'),
  };

  res.json({
    styles: MEME_STYLES.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      previewEmoji: s.previewEmoji,
      topicSuggestions: s.topicSuggestions,
    })),
    categories: Object.keys(stylesByCategory),
    byCategory: {
      relatable: stylesByCategory.relatable.map(s => ({ id: s.id, name: s.name, emoji: s.previewEmoji })),
      educational: stylesByCategory.educational.map(s => ({ id: s.id, name: s.name, emoji: s.previewEmoji })),
      seasonal: stylesByCategory.seasonal.map(s => ({ id: s.id, name: s.name, emoji: s.previewEmoji })),
      promotional: stylesByCategory.promotional.map(s => ({ id: s.id, name: s.name, emoji: s.previewEmoji })),
    },
  });
});

// Validation schema
const generateMemeSchema = z.object({
  styleId: z.string().min(1),
  topic: z.string().min(1).max(200),
  customText: z.string().max(300).optional(),
  mascotId: z.string().optional(),
});

// Generate meme
router.post('/generate', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    // Validate input
    const result = generateMemeSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Invalid input',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const { styleId, topic, customText, mascotId } = result.data;

    // Get meme style
    const style = getMemeStyle(styleId);
    if (!style) {
      throw new ValidationError('Invalid meme style');
    }

    // Get brand kit for business info
    const brandKit = await prisma.brandKit.findUnique({
      where: { tenantId },
    });

    // Build the prompt
    let imagePrompt = buildMemePrompt(style, {
      topic,
      customText,
      businessName: brandKit?.businessName || undefined,
      tagline: brandKit?.tagline || undefined,
    });

    // Handle optional mascot
    let mascotImageData: { base64: string; mimeType: string } | undefined;
    if (mascotId) {
      const mascot = await fetchMascotAsBase64(mascotId, tenantId);
      if (mascot) {
        imagePrompt += '\n\nFeaturing the shop mascot character: ' + mascot.characterPrompt;
        mascotImageData = { base64: mascot.base64, mimeType: mascot.mimeType };
      }
    }

    // Generate caption for social media
    const captionPromise = geminiService.generateMarketingCopyWithProfile({
      type: 'caption',
      topic: `Meme about: ${topic}`,
      profile: {
        businessName: brandKit?.businessName || undefined,
        brandVoice: 'humorous',
      },
      language: 'en',
      additionalContext: `This is a meme post. Make the caption short, funny, and engaging. Include relevant emojis and hashtags like #AutoRepair #CarMemes #MechanicLife. Keep it under 200 characters for maximum engagement.`,
    });

    // Generate content ID
    const contentId = uuidv4();

    logger.info('Generating meme', {
      styleId,
      styleName: style.name,
      topic,
      tenantId,
      hasMascot: !!mascotImageData,
    });

    // Generate image
    const imageResult = await geminiService.generateImage(imagePrompt, {
      aspectRatio: '1:1', // Square for social media
      mascotImage: mascotImageData,
    });

    let imageUrl: string;
    if (imageResult.success && imageResult.imageData) {
      // Convert to base64 data URL for immediate display (works without file storage)
      const base64Data = imageResult.imageData.toString('base64');
      const mimeType = imageResult.mimeType || 'image/png';
      imageUrl = `data:${mimeType};base64,${base64Data}`;
      logger.info('Meme image generated', { contentId, size: imageResult.imageData.length });
    } else {
      // Fallback placeholder
      logger.warn('Meme image generation failed', { error: imageResult.error });
      imageUrl = `https://placehold.co/1080x1080/1F2937/FFF?text=${encodeURIComponent(topic.substring(0, 30))}`;
    }

    const caption = await captionPromise;

    // Save to database
    const savedContent = await prisma.content.create({
      data: {
        id: contentId,
        tenantId,
        userId: req.user!.id,
        tool: 'meme_generator',
        contentType: 'image',
        title: `${style.name}: ${topic}`,
        promptUsed: imagePrompt,
        theme: styleId,
        imageUrl,
        caption,
        metadata: {
          styleId,
          styleName: style.name,
          topic,
          customText,
          category: style.category,
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
        tool: 'meme_generator',
        creditsUsed: 1,
        metadata: { contentId: savedContent.id, styleId },
      },
    });

    logger.info('Meme generated successfully', {
      contentId: savedContent.id,
      tenantId,
      style: style.name,
    });

    res.status(201).json({
      id: savedContent.id,
      imageUrl: savedContent.imageUrl,
      caption: savedContent.caption,
      title: savedContent.title,
      style: {
        id: style.id,
        name: style.name,
        emoji: style.previewEmoji,
      },
      status: savedContent.status,
    });
  } catch (error) {
    next(error);
  }
});

// Random meme generator - picks random style and topic
router.post('/random', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    // Pick random style
    const randomStyle = MEME_STYLES[Math.floor(Math.random() * MEME_STYLES.length)];
    const randomTopic = getRandomTopicForStyle(randomStyle.id);

    // Get brand kit
    const brandKit = await prisma.brandKit.findUnique({
      where: { tenantId },
    });

    // Build prompt
    const imagePrompt = buildMemePrompt(randomStyle, {
      topic: randomTopic,
      businessName: brandKit?.businessName || undefined,
      tagline: brandKit?.tagline || undefined,
    });

    // Generate caption
    const captionPromise = geminiService.generateMarketingCopyWithProfile({
      type: 'caption',
      topic: `Meme about: ${randomTopic}`,
      profile: {
        businessName: brandKit?.businessName || undefined,
        brandVoice: 'humorous',
      },
      language: 'en',
      additionalContext: `This is a meme post. Make the caption short, funny, and engaging. Include relevant emojis and hashtags. Keep it under 200 characters.`,
    });

    const contentId = uuidv4();

    logger.info('Generating random meme', {
      styleId: randomStyle.id,
      styleName: randomStyle.name,
      topic: randomTopic,
      tenantId,
    });

    // Generate image
    const imageResult = await geminiService.generateImage(imagePrompt, {
      aspectRatio: '1:1',
    });

    let imageUrl: string;
    if (imageResult.success && imageResult.imageData) {
      // Convert to base64 data URL for immediate display
      const base64Data = imageResult.imageData.toString('base64');
      const mimeType = imageResult.mimeType || 'image/png';
      imageUrl = `data:${mimeType};base64,${base64Data}`;
      logger.info('Random meme image generated', { contentId, size: imageResult.imageData.length });
    } else {
      logger.warn('Random meme image generation failed', { error: imageResult.error });
      imageUrl = `https://placehold.co/1080x1080/1F2937/FFF?text=${encodeURIComponent(randomTopic.substring(0, 30))}`;
    }

    const caption = await captionPromise;

    // Save to database
    const savedContent = await prisma.content.create({
      data: {
        id: contentId,
        tenantId,
        userId: req.user!.id,
        tool: 'meme_generator',
        contentType: 'image',
        title: `${randomStyle.name}: ${randomTopic}`,
        promptUsed: imagePrompt,
        theme: randomStyle.id,
        imageUrl,
        caption,
        metadata: {
          styleId: randomStyle.id,
          styleName: randomStyle.name,
          topic: randomTopic,
          category: randomStyle.category,
          random: true,
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
        tool: 'meme_generator_random',
        creditsUsed: 1,
        metadata: { contentId: savedContent.id },
      },
    });

    logger.info('Random meme generated', {
      contentId: savedContent.id,
      style: randomStyle.name,
    });

    res.status(201).json({
      id: savedContent.id,
      imageUrl: savedContent.imageUrl,
      caption: savedContent.caption,
      title: savedContent.title,
      style: {
        id: randomStyle.id,
        name: randomStyle.name,
        emoji: randomStyle.previewEmoji,
      },
      topic: randomTopic,
      status: savedContent.status,
      random: true,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
