import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { ValidationError } from '../../middleware/error.middleware';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Helper to validate request body
function validate<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });
    throw new ValidationError('Validation failed', errors);
  }
  return result.data;
}

export const authController = {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validate(registerSchema, req.body);
      const result = await authService.register(input);

      res.status(201).json({
        message: 'Registration successful',
        user: result.user,
        tokens: result.tokens,
      });
    } catch (error) {
      next(error);
    }
  },

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validate(loginSchema, req.body);
      const result = await authService.login(input);

      res.status(200).json({
        message: 'Login successful',
        user: result.user,
        tokens: result.tokens,
      });
    } catch (error) {
      next(error);
    }
  },

  // Refresh access token
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = validate(refreshSchema, req.body);
      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        message: 'Token refreshed',
        tokens,
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout user
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken;
      await authService.logout(req.user!.id, refreshToken);

      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getCurrentUser(req.user!.id);

      res.status(200).json({
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Google OAuth callback handler
  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.redirect(`${process.env.WEB_URL}/auth/login?error=google_auth_failed`);
        return;
      }

      const tokens = await authService.googleAuthCallback(req.user);

      // Redirect to frontend with tokens
      const redirectUrl = new URL(`${process.env.WEB_URL}/auth/callback`);
      redirectUrl.searchParams.set('accessToken', tokens.accessToken);
      redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);

      res.redirect(redirectUrl.toString());
    } catch (error) {
      next(error);
    }
  },

  // Request password reset
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = validate(forgotPasswordSchema, req.body);
      await authService.forgotPassword(email);

      // Always return success to prevent email enumeration
      res.status(200).json({
        message: 'If an account with that email exists, we sent password reset instructions.',
      });
    } catch (error) {
      next(error);
    }
  },

  // Reset password with token
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = validate(resetPasswordSchema, req.body);
      await authService.resetPassword(token, password);

      res.status(200).json({
        message: 'Password reset successful. You can now log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
