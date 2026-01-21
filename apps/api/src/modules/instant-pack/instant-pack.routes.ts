import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { prisma } from '../../db/client';
import { themeRegistry } from '../../prompts/themes';
import { geminiService } from '../../services/gemini.service';
import { storageService } from '../../services/storage.service';
import { ValidationError } from '../../middleware/error.middleware';
import { TIER_LIMITS } from '../../config';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

const generateSchema = z.object({
  count: z.number().int().min(1).max(30),
  language: z.enum(['en', 'es']).default('en'),
});

// Start batch generation
router.post('/generate', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = generateSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed');
    }

    const { count, language } = result.data;
    const tenantId = req.user!.tenantId;
    const tier = req.user!.tier || 'base';

    // Check tier limit
    const maxSize = TIER_LIMITS[tier].instantPackMaxSize;
    if (count > maxSize) {
      throw new ValidationError(`Maximum batch size for your tier is ${maxSize}`);
    }

    // Capture user ID before async context
    const userId = req.user!.id;

    // Create batch job
    const batchJob = await prisma.batchJob.create({
      data: {
        tenantId,
        userId,
        jobType: 'instant_pack',
        totalItems: count,
        status: 'processing',
        startedAt: new Date(),
        metadata: { language },
      },
    });

    // Select random varied themes
    const themes = themeRegistry.getRandomThemes(count);

    // Generate content in background (simplified for MVP)
    // In production, this would use Bull queue
    setImmediate(async () => {
      try {
        const brandKit = await prisma.brandKit.findUnique({
          where: { tenantId },
        });

        // Build profile context for AI personalization
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

        // Generate content ideas using AI
        const services = await prisma.service.findMany({
          where: { tenantId },
          take: 10,
        });
        const serviceNames = services.map(s => s.name);

        for (let i = 0; i < count; i++) {
          try {
            const theme = themes[i % themes.length];
            const contentId = uuidv4();

            // Generate a marketing message
            const topics = [
              'oil change special',
              'brake inspection',
              'tire rotation deal',
              'AC service',
              'engine tune-up',
              'transmission service',
              'wheel alignment',
              'battery check',
              'coolant flush',
              'diagnostic special',
            ];
            const topic = serviceNames[i % serviceNames.length] || topics[i % topics.length];

            // Build image prompt with profile context
            const imagePrompt = await geminiService.buildImagePromptWithProfile({
              theme: theme.imagePrompt,
              message: `Special offer on ${topic}!`,
              subject: topic,
              profile: profileContext,
            });

            // Generate image
            logger.info(`Generating instant pack item ${i + 1}/${count}`, { theme: theme.id });
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
              logger.info(`AI image generated for item ${i + 1}`, { contentId, size: imageResult.imageData.length });
            } else {
              // Fallback to placeholder
              const colorHex = theme.imagePrompt.colorPalette.split(',')[0].trim().replace('#', '').substring(0, 6) || 'C53030';
              imageUrl = `https://placehold.co/800x1000/${colorHex}/FFF?text=${encodeURIComponent(topic.substring(0, 15))}`;
              logger.warn(`Using placeholder for item ${i + 1}`, { error: imageResult.error });
            }

            // Generate caption with profile context
            const caption = await geminiService.generateMarketingCopyWithProfile({
              type: 'caption',
              topic,
              profile: profileContext,
              language,
            });

            // Create content record
            await prisma.content.create({
              data: {
                id: contentId,
                tenantId,
                userId,
                batchJobId: batchJob.id,
                tool: 'instant_pack',
                contentType: 'image',
                title: `${theme.name} - ${topic}`,
                theme: theme.id,
                imageUrl,
                caption,
                captionSpanish: language === 'es' ? caption : undefined,
                metadata: {
                  topic,
                  aiGenerated,
                  batchIndex: i,
                },
                status: 'draft',
                moderationStatus: 'pending',
              },
            });

            // Update progress
            await prisma.batchJob.update({
              where: { id: batchJob.id },
              data: { completedItems: { increment: 1 } },
            });
          } catch (error) {
            await prisma.batchJob.update({
              where: { id: batchJob.id },
              data: { failedItems: { increment: 1 } },
            });
            logger.error('Instant pack item generation failed', { error, index: i });
          }
        }

        // Mark job complete
        await prisma.batchJob.update({
          where: { id: batchJob.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        });

        logger.info('Instant pack batch completed', { jobId: batchJob.id, count });
      } catch (error) {
        await prisma.batchJob.update({
          where: { id: batchJob.id },
          data: { status: 'failed' },
        });
        logger.error('Instant pack batch failed', { error });
      }
    });

    res.status(202).json({
      jobId: batchJob.id,
      status: 'processing',
      totalItems: count,
      message: 'Batch generation started',
    });
  } catch (error) {
    next(error);
  }
});

// Get job status
router.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.batchJob.findFirst({
      where: {
        id: req.params.jobId,
        tenantId: req.user!.tenantId,
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            thumbnailUrl: true,
            theme: true,
            status: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({
      id: job.id,
      status: job.status,
      totalItems: job.totalItems,
      completedItems: job.completedItems,
      failedItems: job.failedItems,
      progress: Math.round((job.completedItems / job.totalItems) * 100),
      content: job.content,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    next(error);
  }
});

// Get job progress (lightweight endpoint for polling)
router.get('/jobs/:jobId/progress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.batchJob.findFirst({
      where: {
        id: req.params.jobId,
        tenantId: req.user!.tenantId,
      },
      select: {
        status: true,
        totalItems: true,
        completedItems: true,
        failedItems: true,
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({
      status: job.status,
      progress: Math.round((job.completedItems / job.totalItems) * 100),
      completed: job.completedItems,
      failed: job.failedItems,
      total: job.totalItems,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
