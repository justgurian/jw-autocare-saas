import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { prisma } from '../../db/client';
import { geminiService } from '../../services/gemini.service';
import { storageService } from '../../services/storage.service';
import { themeRegistry } from '../../prompts/themes';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Campaign templates - predefined one-click campaigns
const CAMPAIGN_TEMPLATES = {
  seasonal_special: {
    name: 'Seasonal Special',
    description: 'Perfect for weather-related or holiday promotions',
    contentCount: 3,
    beatMix: ['promo', 'educational', 'engagement'],
    suggestedThemes: ['retro-garage', 'arizona-desert', 'classic-mechanic'],
  },
  service_spotlight: {
    name: 'Service Spotlight',
    description: 'Highlight a specific service with educational content',
    contentCount: 3,
    beatMix: ['promo', 'educational', 'educational'],
    suggestedThemes: ['classic-mechanic', 'modern-minimal', 'family-friendly'],
  },
  flash_sale: {
    name: 'Flash Sale',
    description: 'Time-limited offer with urgency',
    contentCount: 2,
    beatMix: ['promo', 'promo'],
    suggestedThemes: ['neon-nights', 'pop-culture-80s', 'sports-car'],
  },
  community_engagement: {
    name: 'Community Engagement',
    description: 'Build relationships with your community',
    contentCount: 3,
    beatMix: ['community', 'engagement', 'educational'],
    suggestedThemes: ['family-friendly', 'retro-garage', 'classic-mechanic'],
  },
  new_customer_welcome: {
    name: 'New Customer Welcome',
    description: 'Attract first-time customers with a special offer',
    contentCount: 2,
    beatMix: ['promo', 'educational'],
    suggestedThemes: ['modern-minimal', 'family-friendly', 'retro-garage'],
  },
};

// Get available campaign templates
router.get('/templates', async (_req: Request, res: Response) => {
  res.json({
    templates: Object.entries(CAMPAIGN_TEMPLATES).map(([id, template]) => ({
      id,
      ...template,
    })),
  });
});

// Launch one-click campaign schema
const launchCampaignSchema = z.object({
  templateId: z.enum([
    'seasonal_special',
    'service_spotlight',
    'flash_sale',
    'community_engagement',
    'new_customer_welcome',
  ]),
  topic: z.string().min(1).max(200),
  details: z.string().max(500).optional(),
  startDate: z.string().optional(), // ISO date string
  language: z.enum(['en', 'es']).default('en'),
});

// Launch a one-click campaign
router.post('/launch', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = launchCampaignSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed');
    }

    const { templateId, topic, details, startDate, language } = result.data;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    const template = CAMPAIGN_TEMPLATES[templateId];
    if (!template) {
      throw new ValidationError('Invalid campaign template');
    }

    // Get brand kit for profile context
    const brandKit = await prisma.brandKit.findUnique({
      where: { tenantId },
    });

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
      uniqueSellingPoints: brandKit?.uniqueSellingPoints || [],
      targetDemographics: brandKit?.targetDemographics || undefined,
      targetPainPoints: brandKit?.targetPainPoints || undefined,
    };

    // Create batch job for tracking
    const batchJob = await prisma.batchJob.create({
      data: {
        tenantId,
        userId,
        jobType: 'campaign',
        totalItems: template.contentCount,
        status: 'processing',
        startedAt: new Date(),
        metadata: {
          templateId,
          topic,
          details,
          campaignName: `${template.name}: ${topic}`,
        },
      },
    });

    // Calculate dates for calendar events
    const baseDate = startDate ? new Date(startDate) : new Date();
    const dates = Array.from({ length: template.contentCount }, (_, i) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i * 2); // Space content 2 days apart
      return date;
    });

    // Generate campaign content in background
    setImmediate(async () => {
      const generatedContent: string[] = [];

      try {
        for (let i = 0; i < template.contentCount; i++) {
          try {
            const contentId = uuidv4();
            const beatType = template.beatMix[i];
            const themeId = template.suggestedThemes[i % template.suggestedThemes.length];
            const theme = themeRegistry.getTheme(themeId);

            if (!theme) {
              logger.warn('Theme not found, using default', { themeId });
              continue;
            }

            // Generate variation of the topic based on beat type
            const topicVariation = await generateTopicVariation(topic, beatType, i, profileContext);

            // Build image prompt
            const imagePrompt = await geminiService.buildImagePromptWithProfile({
              theme: theme.imagePrompt,
              message: topicVariation.headline,
              subject: topic,
              details: details || topicVariation.description,
              profile: profileContext,
            });

            // Generate image
            logger.info(`Generating campaign content ${i + 1}/${template.contentCount}`, {
              beatType,
              themeId,
            });

            const imageResult = await geminiService.generateImage(imagePrompt, {
              aspectRatio: '4:5',
            });

            let imageUrl: string;
            let aiGenerated = false;

            if (imageResult.success && imageResult.imageData) {
              // Convert to base64 data URL for immediate display
              const base64Data = imageResult.imageData.toString('base64');
              const mimeType = imageResult.mimeType || 'image/png';
              imageUrl = `data:${mimeType};base64,${base64Data}`;
              aiGenerated = true;
            } else {
              // Fallback placeholder
              const colorHex = theme.imagePrompt.colorPalette.split(',')[0].trim().replace('#', '').substring(0, 6) || 'C53030';
              imageUrl = `https://placehold.co/800x1000/${colorHex}/FFF?text=${encodeURIComponent(topic.substring(0, 15))}`;
            }

            // Generate caption
            const caption = await geminiService.generateMarketingCopyWithProfile({
              type: 'caption',
              topic: `${topic} - ${topicVariation.headline}`,
              profile: profileContext,
              language,
            });

            // Create content record
            const content = await prisma.content.create({
              data: {
                id: contentId,
                tenantId,
                userId,
                batchJobId: batchJob.id,
                tool: 'campaign',
                contentType: 'image',
                title: topicVariation.headline,
                promptUsed: imagePrompt,
                theme: themeId,
                imageUrl,
                caption,
                captionSpanish: language === 'es' ? caption : undefined,
                metadata: {
                  campaignId: batchJob.id,
                  templateId,
                  beatType,
                  aiGenerated,
                  contentIndex: i,
                },
                status: 'draft',
                moderationStatus: 'pending',
              },
            });

            generatedContent.push(content.id);

            // Create corresponding calendar event
            await prisma.calendarEvent.create({
              data: {
                tenantId,
                contentId: content.id,
                scheduledDate: dates[i],
                beatType,
                suggestedTopic: topicVariation.headline,
                suggestedTheme: themeId,
                aiGenerated: true,
                status: 'scheduled',
                notes: `Campaign: ${template.name} - ${topic}`,
              },
            });

            // Update progress
            await prisma.batchJob.update({
              where: { id: batchJob.id },
              data: { completedItems: { increment: 1 } },
            });

            logger.info(`Campaign content ${i + 1} generated`, { contentId });
          } catch (error) {
            await prisma.batchJob.update({
              where: { id: batchJob.id },
              data: { failedItems: { increment: 1 } },
            });
            logger.error('Campaign content generation failed', { error, index: i });
          }
        }

        // Mark job complete
        await prisma.batchJob.update({
          where: { id: batchJob.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            metadata: {
              ...(batchJob.metadata as object),
              generatedContentIds: generatedContent,
            },
          },
        });

        logger.info('Campaign generation completed', {
          jobId: batchJob.id,
          contentCount: generatedContent.length,
        });
      } catch (error) {
        await prisma.batchJob.update({
          where: { id: batchJob.id },
          data: { status: 'failed' },
        });
        logger.error('Campaign generation failed', { error });
      }
    });

    res.status(202).json({
      jobId: batchJob.id,
      status: 'processing',
      campaign: {
        template: template.name,
        topic,
        contentCount: template.contentCount,
        scheduledDates: dates.map((d) => d.toISOString().split('T')[0]),
      },
      message: 'Campaign generation started',
    });
  } catch (error) {
    next(error);
  }
});

// Get campaign job status
router.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.batchJob.findFirst({
      where: {
        id: req.params.jobId,
        tenantId: req.user!.tenantId,
        jobType: 'campaign',
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            thumbnailUrl: true,
            caption: true,
            theme: true,
            status: true,
            metadata: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Campaign job not found' });
      return;
    }

    // Get associated calendar events
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        tenantId: req.user!.tenantId,
        contentId: { in: job.content.map((c) => c.id) },
      },
      select: {
        id: true,
        scheduledDate: true,
        beatType: true,
        status: true,
      },
    });

    res.json({
      id: job.id,
      status: job.status,
      campaign: job.metadata,
      progress: {
        total: job.totalItems,
        completed: job.completedItems,
        failed: job.failedItems,
        percentage: Math.round((job.completedItems / job.totalItems) * 100),
      },
      content: job.content.map((c) => ({
        ...c,
        calendarEvent: calendarEvents.find((e) => e.contentId === c.id),
      })),
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    next(error);
  }
});

// Get recent campaigns
router.get('/recent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await prisma.batchJob.findMany({
      where: {
        tenantId: req.user!.tenantId,
        jobType: 'campaign',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            imageUrl: true,
          },
          take: 3,
        },
      },
    });

    res.json({
      campaigns: campaigns.map((c) => ({
        id: c.id,
        name: (c.metadata as { campaignName?: string })?.campaignName || 'Campaign',
        template: (c.metadata as { templateId?: string })?.templateId,
        status: c.status,
        contentCount: c.totalItems,
        completedCount: c.completedItems,
        preview: c.content,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Helper: Generate topic variations based on beat type
async function generateTopicVariation(
  baseTopic: string,
  beatType: string,
  index: number,
  profile: Record<string, unknown>
): Promise<{ headline: string; description: string }> {
  const prompts: Record<string, string> = {
    promo: `Create a promotional headline and short description for: "${baseTopic}"
Focus on the offer, discount, or special value. Make it urgent and compelling.
${profile.businessName ? `Business: ${profile.businessName}` : ''}`,

    educational: `Create an educational headline and short description about: "${baseTopic}"
Focus on teaching customers something valuable. Be helpful and informative.
${profile.specialties ? `Specialties: ${(profile.specialties as string[]).join(', ')}` : ''}`,

    engagement: `Create an engaging headline and question about: "${baseTopic}"
Focus on sparking conversation and interaction. Be fun and relatable.`,

    seasonal: `Create a seasonal/timely headline and description for: "${baseTopic}"
Connect it to current weather, holidays, or seasonal needs.
${profile.city && profile.state ? `Location: ${profile.city}, ${profile.state}` : ''}`,

    community: `Create a community-focused headline and description about: "${baseTopic}"
Focus on local connection, team appreciation, or customer stories.
${profile.businessName ? `Business: ${profile.businessName}` : ''}`,
  };

  const result = await geminiService.generateText(
    `${prompts[beatType] || prompts.promo}

Return JSON format only:
{"headline": "short catchy headline", "description": "1-2 sentence description"}`,
    { temperature: 0.8, maxTokens: 256 }
  );

  try {
    const jsonMatch = result.text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    logger.warn('Failed to parse topic variation, using defaults');
  }

  // Fallback
  return {
    headline: `${baseTopic} - ${beatType.charAt(0).toUpperCase() + beatType.slice(1)}`,
    description: `Learn more about ${baseTopic} at our shop.`,
  };
}

export default router;
