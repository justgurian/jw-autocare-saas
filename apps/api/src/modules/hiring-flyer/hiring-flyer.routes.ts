/**
 * Hiring Flyer Routes
 * Generate "NOW HIRING" flyers for auto shop positions
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { prisma } from '../../db/client';
import { geminiService } from '../../services/gemini.service';
import { themeRegistry, NostalgicThemeDefinition } from '../../prompts/themes';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { selectNextTheme, getPreferences } from '../../services/smart-rotation';
import { buildNostalgicImagePrompt } from '../../services/prompt-builder.service';
import {
  hiringGenerateSchema,
  COMMON_POSITIONS,
  CERTIFICATION_OPTIONS,
  BENEFIT_OPTIONS,
  type HiringFlyerResult,
} from './hiring-flyer.types';

const router = Router();

// Fetch a logo URL and convert to base64
async function fetchLogoAsBase64(logoUrl: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type') || 'image/png';
    return { base64: buffer.toString('base64'), mimeType };
  } catch (err) {
    logger.warn('Failed to fetch logo for hiring flyer', { logoUrl });
    return null;
  }
}

router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/hiring-flyer/positions
 * Return common auto shop positions
 */
router.get('/positions', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      positions: COMMON_POSITIONS,
      certifications: CERTIFICATION_OPTIONS,
      benefits: BENEFIT_OPTIONS,
    },
  });
});

/**
 * POST /api/v1/tools/hiring-flyer/generate
 * Generate a hiring flyer (simple or detailed mode)
 */
router.post('/generate', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = hiringGenerateSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const input = result.data;
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Get brand kit for personalization
    const brandKit = await prisma.brandKit.findUnique({ where: { tenantId } });

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

    // Select theme (use provided themeId or smart rotation)
    let selectedTheme: NostalgicThemeDefinition | undefined;
    if (input.themeId) {
      selectedTheme = themeRegistry.getNostalgicTheme(input.themeId) || undefined;
    }
    if (!selectedTheme) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { settings: true },
      });
      const prefs = getPreferences((tenant?.settings as Record<string, unknown>) || {});
      const rotatedTheme = selectNextTheme(prefs);
      selectedTheme = themeRegistry.getNostalgicTheme(rotatedTheme.themeId) || undefined;
    }
    if (!selectedTheme) {
      selectedTheme = themeRegistry.getRandomNostalgicTheme();
    }

    // Build the hiring-specific prompt
    const hiringDetails = buildHiringPromptDetails(input, profileContext);

    const imagePrompt = buildNostalgicImagePrompt(selectedTheme, {
      headline: `NOW HIRING: ${input.jobTitle}`,
      subject: `Hiring flyer for ${input.jobTitle} position`,
      details: hiringDetails,
      businessName: profileContext.businessName,
      logoInstructions: brandKit?.logoUrl
        ? 'Incorporate the business logo aesthetically into the design'
        : undefined,
    });

    // Fetch logo
    const logoImage = brandKit?.logoUrl ? await fetchLogoAsBase64(brandKit.logoUrl) : null;

    const contentId = uuidv4();

    logger.info('Generating hiring flyer', {
      tenantId,
      jobTitle: input.jobTitle,
      mode: input.mode,
      themeId: selectedTheme.id,
      hasLogo: !!logoImage,
    });

    // Generate image
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
      logger.info('Hiring flyer image generated', { contentId, size: imageResult.imageData.length });
    } else {
      logger.warn('Image generation failed, using placeholder', { error: imageResult.error });
      const colorHex = selectedTheme.previewColors?.[0]?.replace('#', '') || 'C53030';
      imageUrl = `https://placehold.co/800x1000/${colorHex}/FFF?text=${encodeURIComponent('NOW HIRING')}`;
    }

    // Generate captions
    const hiringCaptionTopic = buildHiringCaptionTopic(input, profileContext);
    const captionPromises: Promise<string>[] = [];

    if (input.language === 'en' || input.language === 'both') {
      captionPromises.push(
        geminiService.generateMarketingCopyWithProfile({
          type: 'caption',
          topic: hiringCaptionTopic,
          profile: profileContext,
          language: 'en',
        })
      );
    }
    if (input.language === 'es' || input.language === 'both') {
      captionPromises.push(
        geminiService.generateMarketingCopyWithProfile({
          type: 'caption',
          topic: hiringCaptionTopic,
          profile: profileContext,
          language: 'es',
        })
      );
    }

    const captions = await Promise.all(captionPromises);
    const caption = captions[0] || '';
    const captionSpanish = input.language === 'both' ? captions[1] : (input.language === 'es' ? captions[0] : null);

    // Save to DB
    const content = await prisma.content.create({
      data: {
        id: contentId,
        tenantId,
        userId,
        tool: 'hiring_flyer',
        contentType: 'image',
        title: `NOW HIRING: ${input.jobTitle}`,
        promptUsed: imagePrompt,
        theme: selectedTheme.id,
        imageUrl,
        caption,
        captionSpanish,
        metadata: {
          jobTitle: input.jobTitle,
          jobType: input.jobType,
          payRange: input.payRange,
          howToApply: input.howToApply,
          mode: input.mode,
          urgency: input.urgency,
          aiGenerated: imageResult.success,
        } as any,
        status: 'draft',
        moderationStatus: 'pending',
      },
    });

    // Log usage
    await prisma.usageLog.create({
      data: {
        tenantId,
        userId,
        action: 'image_gen',
        tool: 'hiring_flyer',
        creditsUsed: 1,
        metadata: { contentId: content.id },
      },
    });

    logger.info('Hiring flyer generated', { contentId: content.id, tenantId, themeId: selectedTheme.id });

    const response: HiringFlyerResult = {
      id: content.id,
      imageUrl: content.imageUrl!,
      caption: content.caption!,
      captionSpanish: content.captionSpanish,
      title: content.title!,
      theme: selectedTheme.id,
      themeName: selectedTheme.name,
      jobTitle: input.jobTitle,
      jobType: input.jobType,
    };

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    logger.error('Hiring flyer generation failed', { error });
    next(error);
  }
});

/**
 * POST /api/v1/tools/hiring-flyer/instant
 * One-click hiring flyer with sensible defaults
 */
router.post('/instant', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Forward to generate with defaults
    req.body = {
      mode: 'simple',
      jobTitle: 'ASE Certified Technician',
      jobType: 'full-time',
      payRange: 'Competitive Pay',
      howToApply: 'call',
      language: 'en',
    };

    // Re-validate and process via generate handler
    const result = hiringGenerateSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const input = result.data;

    const brandKit = await prisma.brandKit.findUnique({ where: { tenantId } });
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

    // Pick a random theme
    const selectedTheme = themeRegistry.getRandomNostalgicTheme();

    const hiringDetails = buildHiringPromptDetails(input, profileContext);
    const imagePrompt = buildNostalgicImagePrompt(selectedTheme, {
      headline: `NOW HIRING: ${input.jobTitle}`,
      subject: `Hiring flyer for ${input.jobTitle} position`,
      details: hiringDetails,
      businessName: profileContext.businessName,
      logoInstructions: brandKit?.logoUrl
        ? 'Incorporate the business logo aesthetically into the design'
        : undefined,
    });

    const logoImage = brandKit?.logoUrl ? await fetchLogoAsBase64(brandKit.logoUrl) : null;
    const contentId = uuidv4();

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
      const colorHex = selectedTheme.previewColors?.[0]?.replace('#', '') || 'C53030';
      imageUrl = `https://placehold.co/800x1000/${colorHex}/FFF?text=${encodeURIComponent('NOW HIRING')}`;
    }

    const caption = await geminiService.generateMarketingCopyWithProfile({
      type: 'caption',
      topic: buildHiringCaptionTopic(input, profileContext),
      profile: profileContext,
      language: 'en',
    });

    const content = await prisma.content.create({
      data: {
        id: contentId,
        tenantId,
        userId,
        tool: 'hiring_flyer',
        contentType: 'image',
        title: `NOW HIRING: ${input.jobTitle}`,
        promptUsed: imagePrompt,
        theme: selectedTheme.id,
        imageUrl,
        caption,
        metadata: {
          jobTitle: input.jobTitle,
          jobType: input.jobType,
          payRange: input.payRange,
          howToApply: input.howToApply,
          mode: 'instant',
          aiGenerated: imageResult.success,
        } as any,
        status: 'draft',
        moderationStatus: 'pending',
      },
    });

    await prisma.usageLog.create({
      data: {
        tenantId,
        userId,
        action: 'image_gen',
        tool: 'hiring_flyer',
        creditsUsed: 1,
        metadata: { contentId: content.id },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: content.id,
        imageUrl: content.imageUrl!,
        caption: content.caption!,
        title: content.title!,
        theme: selectedTheme.id,
        themeName: selectedTheme.name,
        jobTitle: input.jobTitle,
        jobType: input.jobType,
      },
    });
  } catch (error) {
    logger.error('Instant hiring flyer failed', { error });
    next(error);
  }
});

/**
 * GET /api/v1/tools/hiring-flyer/history
 * Get recent hiring flyers
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const flyers = await prisma.content.findMany({
      where: { tenantId, tool: 'hiring_flyer' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        caption: true,
        captionSpanish: true,
        theme: true,
        metadata: true,
        status: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: flyers.map(f => ({
        ...f,
        jobTitle: (f.metadata as any)?.jobTitle || '',
        jobType: (f.metadata as any)?.jobType || '',
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/tools/hiring-flyer/:id
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const contentId = req.params.id;
    if (!tenantId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    await prisma.content.deleteMany({
      where: { id: contentId, tenantId, tool: 'hiring_flyer' },
    });

    res.json({ success: true, message: 'Hiring flyer deleted' });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildHiringPromptDetails(
  input: { mode: string; jobTitle: string; jobType: string; payRange?: string; howToApply: string; requiredCerts?: string[]; skills?: string[]; benefits?: string[]; experienceLevel?: string; urgency?: string },
  profile: { businessName?: string; city?: string; state?: string },
): string {
  const lines: string[] = [];

  lines.push(`IMPORTANT: This is a NOW HIRING / recruitment flyer. The text "NOW HIRING" must be the most prominent headline on the flyer.`);
  lines.push(`Position: ${input.jobTitle}`);
  lines.push(`Job Type: ${input.jobType}`);

  if (input.payRange) {
    lines.push(`Pay: ${input.payRange}`);
  }

  const applyMethods: Record<string, string> = {
    call: `Call ${profile.businessName || 'us'} today`,
    email: 'Email your resume',
    visit: `Visit ${profile.businessName || 'our shop'} in person`,
    online: 'Apply online',
  };
  lines.push(`How to Apply: ${applyMethods[input.howToApply] || 'Contact us'}`);

  if (profile.city && profile.state) {
    lines.push(`Location: ${profile.city}, ${profile.state}`);
  }

  if (input.mode === 'detailed') {
    if (input.requiredCerts && input.requiredCerts.length > 0) {
      lines.push(`Required Certifications: ${input.requiredCerts.join(', ')}`);
    }
    if (input.skills && input.skills.length > 0) {
      lines.push(`Skills: ${input.skills.join(', ')}`);
    }
    if (input.benefits && input.benefits.length > 0) {
      lines.push(`Benefits: ${input.benefits.join(', ')}`);
    }
    if (input.experienceLevel) {
      const levels: Record<string, string> = {
        none: 'No experience needed — we train!',
        entry: 'Entry level',
        mid: '2-5 years experience preferred',
        senior: '5+ years experience required',
      };
      lines.push(`Experience: ${levels[input.experienceLevel] || input.experienceLevel}`);
    }
    if (input.urgency === 'urgent' || input.urgency === 'immediate') {
      lines.push(`URGENCY: ${input.urgency === 'immediate' ? 'HIRING IMMEDIATELY' : 'URGENT — Hiring Now!'}`);
    }
  }

  return lines.join('\n');
}

function buildHiringCaptionTopic(
  input: { jobTitle: string; jobType: string; payRange?: string; howToApply: string; urgency?: string },
  profile: { businessName?: string; city?: string; state?: string },
): string {
  let topic = `NOW HIRING: ${input.jobTitle} (${input.jobType})`;
  if (profile.businessName) topic += ` at ${profile.businessName}`;
  if (profile.city) topic += ` in ${profile.city}`;
  if (input.payRange) topic += ` — ${input.payRange}`;
  if (input.urgency === 'immediate') topic += ' — HIRING IMMEDIATELY';
  topic += `. This is a recruitment/hiring post for social media.`;
  return topic;
}

export default router;
