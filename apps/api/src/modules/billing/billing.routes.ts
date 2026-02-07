import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';
import { TIER_LIMITS } from '../../config';

const router = Router();

// Protected routes
router.use(authenticate);
router.use(tenantContext);

// Get subscription details
router.get('/subscription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const tier = tenant.subscriptionTier as 'base' | 'premium';
    const limits = TIER_LIMITS[tier];

    res.json({
      tier: tenant.subscriptionTier,
      status: tenant.subscriptionStatus,
      limits,
    });
  } catch (error) {
    next(error);
  }
});

// Get usage for billing
router.get('/usage', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [imageCount, videoCount, totalCredits] = await Promise.all([
      prisma.usageLog.count({
        where: {
          tenantId,
          action: 'image_gen',
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.usageLog.count({
        where: {
          tenantId,
          action: 'video_gen',
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.usageLog.aggregate({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
        _sum: { creditsUsed: true },
      }),
    ]);

    const tier = req.user!.tier || 'base';
    const limits = TIER_LIMITS[tier];

    res.json({
      period: {
        start: startOfMonth.toISOString(),
        end: new Date().toISOString(),
      },
      usage: {
        images: {
          used: imageCount,
          limit: limits.imageGenerationsPerMonth,
          remaining: Math.max(0, limits.imageGenerationsPerMonth - imageCount),
        },
        videos: {
          used: videoCount,
          limit: limits.videoGenerationsPerMonth,
          remaining: Math.max(0, limits.videoGenerationsPerMonth - videoCount),
        },
        credits: {
          used: Number(totalCredits._sum.creditsUsed || 0),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
