import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { USER_ROLES } from '../config';
import { UnauthorizedError, ForbiddenError } from './error.middleware';

// Extended user interface
export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  email: string;
  role: string;
  tier: 'base' | 'premium';
  firstName?: string;
  lastName?: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}

// JWT Authentication middleware
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: AuthenticatedUser | false) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(new UnauthorizedError('Invalid or expired token'));
    }

    req.user = user;
    next();
  })(req, res, next);
}

// Optional authentication (doesn't fail if not authenticated)
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: AuthenticatedUser | false) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
}

// Role-based authorization middleware
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Super admin can do everything
    if (req.user.role === USER_ROLES.SUPER_ADMIN) {
      return next();
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
}

// Check if user is owner or higher
export function requireOwner(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  const ownerRoles = [USER_ROLES.SUPER_ADMIN, USER_ROLES.OWNER];
  if (!ownerRoles.includes(req.user.role)) {
    return next(new ForbiddenError('Owner permission required'));
  }

  next();
}

// Check if user is manager or higher
export function requireManager(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  const managerRoles = [USER_ROLES.SUPER_ADMIN, USER_ROLES.OWNER, USER_ROLES.MANAGER];
  if (!managerRoles.includes(req.user.role)) {
    return next(new ForbiddenError('Manager permission required'));
  }

  next();
}

export default authenticate;
