import { Request, Response, NextFunction } from 'express';
import { prisma, setTenantContext } from '../db/client';
import { UnauthorizedError, NotFoundError } from './error.middleware';
import { logger } from '../utils/logger';

// Extend Express Request with tenant info
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenant?: {
        id: string;
        name: string;
        slug: string;
        subscriptionTier: string;
        subscriptionStatus: string;
        settings: Record<string, unknown>;
      };
    }
  }
}

// Tenant context middleware - sets tenant from authenticated user
export async function tenantContext(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.tenantId) {
      return next(new UnauthorizedError('Tenant context required'));
    }

    const tenantId = req.user.tenantId;

    // Fetch tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        settings: true,
      },
    });

    if (!tenant) {
      return next(new NotFoundError('Tenant not found'));
    }

    // Check subscription status
    if (tenant.subscriptionStatus === 'cancelled' || tenant.subscriptionStatus === 'expired') {
      return next(new UnauthorizedError('Subscription inactive. Please renew your subscription.'));
    }

    // Set tenant context for RLS
    await setTenantContext(tenantId);

    // Attach tenant info to request
    req.tenantId = tenantId;
    req.tenant = tenant as Request['tenant'];

    logger.debug('Tenant context set', { tenantId, tenantSlug: tenant.slug });

    next();
  } catch (error) {
    next(error);
  }
}

// Middleware to verify user belongs to the specified tenant
export function verifyTenantAccess(req: Request, _res: Response, next: NextFunction): void {
  const requestedTenantId = req.params.tenantId || req.body?.tenantId;

  if (requestedTenantId && req.user?.tenantId !== requestedTenantId) {
    // Only super admin can access other tenants
    if (req.user?.role !== 'super_admin') {
      return next(new UnauthorizedError('Access denied to this tenant'));
    }
  }

  next();
}

// Middleware to check subscription tier for premium features
export function requirePremium(req: Request, _res: Response, next: NextFunction): void {
  if (!req.tenant) {
    return next(new UnauthorizedError('Tenant context required'));
  }

  if (req.tenant.subscriptionTier !== 'premium') {
    return next(new UnauthorizedError('Premium subscription required for this feature'));
  }

  next();
}

// Middleware to check if onboarding is complete
export function requireOnboardingComplete(req: Request, _res: Response, next: NextFunction): void {
  // Allow onboarding endpoints
  if (req.path.startsWith('/api/v1/onboarding')) {
    return next();
  }

  // Check onboarding status from tenant settings
  const tenant = req.tenant;
  if (tenant && !tenant.settings?.onboardingCompleted) {
    return next(new UnauthorizedError('Please complete onboarding first'));
  }

  next();
}

export default tenantContext;
