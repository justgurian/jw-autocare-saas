import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { nanoid } from 'nanoid';

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Generate unique request ID
  req.requestId = nanoid(10);
  req.startTime = Date.now();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);

  // Log incoming request
  logger.http(`→ ${req.method} ${req.path}`, {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'http';

    logger[logLevel](`← ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`, {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}

export default requestLogger;
