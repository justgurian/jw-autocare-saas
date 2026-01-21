import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';
import { config, TIER_LIMITS } from '../../config';
import { logger } from '../../utils/logger';

const router = Router();

// Stripe webhook (no auth required)
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In production, verify Stripe signature
    const event = req.body;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
      case 'invoice.paid':
        logger.info('Invoice paid', { invoiceId: event.data.object.id });
        break;
      case 'invoice.payment_failed':
        logger.warn('Payment failed', { invoiceId: event.data.object.id });
        break;
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

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
      pricing: {
        base: { price: 500, name: 'Base', features: ['500 images/month', 'Up to 10 batch size', 'All content tools'] },
        premium: { price: 750, name: 'Premium', features: ['2000 images/month', 'Up to 30 batch size', 'Video generation', 'Priority support'] },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create/update subscription
router.post('/subscription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier } = req.body;

    if (!['base', 'premium'].includes(tier)) {
      res.status(400).json({ error: 'Invalid tier' });
      return;
    }

    // In production, this would create a Stripe checkout session
    const checkoutUrl = `${config.webUrl}/checkout?tier=${tier}`;

    res.json({
      message: 'Redirect to checkout',
      checkoutUrl,
    });
  } catch (error) {
    next(error);
  }
});

// Update subscription tier
router.put('/subscription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier } = req.body;

    // In production, update Stripe subscription
    await prisma.tenant.update({
      where: { id: req.user!.tenantId },
      data: { subscriptionTier: tier },
    });

    res.json({ message: 'Subscription updated', tier });
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

// Get invoices
router.get('/invoices', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // In production, fetch from Stripe
    res.json({
      invoices: [],
      message: 'Invoice history will be available after Stripe integration',
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function handleSubscriptionUpdate(subscription: { customer: string; items: { data: Array<{ price: { id: string } }> }; status: string }) {
  const tenant = await prisma.tenant.findFirst({
    where: { stripeCustomerId: subscription.customer },
  });

  if (tenant) {
    const priceId = subscription.items.data[0]?.price.id;
    const tier = priceId === config.stripe.pricePremium ? 'premium' : 'base';

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: subscription.status,
      },
    });

    logger.info('Subscription updated', { tenantId: tenant.id, tier });
  }
}

async function handleSubscriptionCancelled(subscription: { customer: string }) {
  const tenant = await prisma.tenant.findFirst({
    where: { stripeCustomerId: subscription.customer },
  });

  if (tenant) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { subscriptionStatus: 'cancelled' },
    });

    logger.info('Subscription cancelled', { tenantId: tenant.id });
  }
}

export default router;
