import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config, TIER_LIMITS } from '../config';
import { logger } from '../utils/logger';

// Define authenticated request type
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    tier?: 'base' | 'premium';
  };
}

// Dynamic rate limiter based on user tier
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: (req: AuthenticatedRequest) => {
    // Get user tier from request (set by auth middleware)
    const tier = req.user?.tier || 'base';
    return TIER_LIMITS[tier].apiRatePerMinute;
  },
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => {
    // Use tenant ID if authenticated, otherwise use IP
    return req.user?.tenantId || req.ip || 'anonymous';
  },
  handler: (req: AuthenticatedRequest, res: Response) => {
    logger.warn('Rate limit exceeded', {
      tenantId: req.user?.tenantId,
      ip: req.ip,
      path: req.path,
    });

    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Stricter rate limiter for AI generation endpoints
export const generationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10, // Max 10 generation requests per minute
  message: {
    error: 'GENERATION_RATE_LIMIT',
    message: 'Too many generation requests, please wait before trying again',
  },
  keyGenerator: (req: AuthenticatedRequest) => {
    return `gen:${req.user?.tenantId || req.ip}`;
  },
});

// Auth endpoint rate limiter (prevent brute force)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 auth attempts per 15 minutes
  message: {
    error: 'AUTH_RATE_LIMIT',
    message: 'Too many authentication attempts, please try again later',
  },
  skipSuccessfulRequests: true,
});

export default rateLimiter;
