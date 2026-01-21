import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  public errors: Record<string, string[]>;

  constructor(message: string = 'Validation Error', errors: Record<string, string[]> = {}) {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too Many Requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class ContentModerationError extends AppError {
  public reasons: string[];

  constructor(reasons: string[] = []) {
    super('Content flagged by moderation', 400, 'CONTENT_MODERATION_FAILED');
    this.reasons = reasons;
  }
}

export class UsageLimitError extends AppError {
  constructor(limitType: string) {
    super(`Usage limit exceeded: ${limitType}`, 402, 'USAGE_LIMIT_EXCEEDED');
  }
}

// Error handler middleware
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      error: err.code || 'ERROR',
      message: err.message,
    };

    // Add validation errors if present
    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }

    // Add moderation reasons if present
    if (err instanceof ContentModerationError) {
      response.reasons = err.reasons;
    }

    // Add stack trace in development
    if (config.env === 'development') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code: string; meta?: { target?: string[] } };

    if (prismaError.code === 'P2002') {
      res.status(409).json({
        error: 'CONFLICT',
        message: `Duplicate entry for ${prismaError.meta?.target?.join(', ') || 'field'}`,
      });
      return;
    }

    if (prismaError.code === 'P2025') {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Record not found',
      });
      return;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid authentication token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired',
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: config.env === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    ...(config.env === 'development' && { stack: err.stack }),
  });
}

export default errorHandler;
