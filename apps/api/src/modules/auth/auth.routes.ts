import { Router } from 'express';
import passport from 'passport';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rate-limit.middleware';

const router = Router();

// Public routes with rate limiting
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.WEB_URL}/auth/login?error=google_auth_failed`,
  }),
  authController.googleCallback
);

export default router;
