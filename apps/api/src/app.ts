import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import passport from 'passport';
import path from 'path';

import { config } from './config';
import { logger } from './utils/logger';
import { getRedisClient } from './services/redis.service';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { rateLimiter } from './middleware/rate-limit.middleware';
import { configurePassport } from './modules/auth/passport.config';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import onboardingRoutes from './modules/onboarding/onboarding.routes';
import brandKitRoutes from './modules/brand-kit/brand-kit.routes';
import servicesRoutes from './modules/tenants/services.routes';
import specialsRoutes from './modules/tenants/specials.routes';
import promoFlyerRoutes from './modules/promo-flyer/promo-flyer.routes';
import instantPackRoutes from './modules/instant-pack/instant-pack.routes';
import calendarRoutes from './modules/calendar/calendar.routes';
import contentRoutes from './modules/content/content.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import billingRoutes from './modules/billing/billing.routes';
import campaignRoutes from './modules/campaigns/campaign.routes';
import socialRoutes from './modules/social/social.routes';
import downloadRoutes from './modules/content/download.routes';
import memeRoutes from './modules/meme-generator/meme.routes';
import checkInRoutes from './modules/check-in/check-in.routes';
import carOfDayRoutes from './modules/car-of-day/car-of-day.routes';
import videoCreatorRoutes from './modules/video-creator/video-creator.routes';
import reviewReplyRoutes from './modules/review-reply/review-reply.routes';
import themesRoutes from './modules/themes/themes.routes';
import imageEditorRoutes from './modules/image-editor/image-editor.routes';
import jargonRoutes from './modules/jargon/jargon.routes';
import smsTemplatesRoutes from './modules/sms-templates/sms-templates.routes';
import blogGeneratorRoutes from './modules/blog-generator/blog-generator.routes';
import businessCardsRoutes from './modules/business-cards/business-cards.routes';
import photoTunerRoutes from './modules/photo-tuner/photo-tuner.routes';
import settingsRoutes from './modules/settings/settings.routes';
import batchFlyerRoutes from './modules/batch-flyer/batch-flyer.routes';
import ugcCreatorRoutes from './modules/ugc-creator/ugc-creator.routes';
import directorsCutRoutes from './modules/directors-cut/directors-cut.routes';
import celebrationRoutes from './modules/celebration/celebration.routes';
import mascotBuilderRoutes from './modules/mascot-builder/mascot-builder.routes';
import styleClonerRoutes from './modules/style-cloner/style-cloner.routes';

// Initialize Redis (non-blocking, app works without it)
getRedisClient();

// Initialize Express app
const app: Express = express();

// Trust proxy (for Cloud Run)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration - include all Railway web domains
const allowedOrigins = [
  config.webUrl,
  'http://localhost:3000',
  'http://localhost:5173', // Vite default port
  // Production web
  'https://web-production-58966.up.railway.app',
  // Development web
  'https://web-development-3362.up.railway.app',
  // Allow any Railway domains (for future deployments)
  ...(process.env.CORS_ADDITIONAL_ORIGINS?.split(',') || []),
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Serve uploaded files (static)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api', rateLimiter);

// Passport initialization
configurePassport(passport);
app.use(passport.initialize());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    build: 'cors-fix-v3-1769416088',
  });
});

// API Routes (v1)
const apiV1 = express.Router();

apiV1.use('/auth', authRoutes);
apiV1.use('/onboarding', onboardingRoutes);
apiV1.use('/brand-kit', brandKitRoutes);
apiV1.use('/services', servicesRoutes);
apiV1.use('/specials', specialsRoutes);
apiV1.use('/tools/promo-flyer', promoFlyerRoutes);
apiV1.use('/tools/instant-pack', instantPackRoutes);
apiV1.use('/calendar', calendarRoutes);
apiV1.use('/content', contentRoutes);
apiV1.use('/analytics', analyticsRoutes);
apiV1.use('/billing', billingRoutes);
apiV1.use('/campaigns', campaignRoutes);
apiV1.use('/social', socialRoutes);
apiV1.use('/download', downloadRoutes);
apiV1.use('/tools/meme-generator', memeRoutes);
apiV1.use('/tools/check-in', checkInRoutes);
apiV1.use('/tools/car-of-day', carOfDayRoutes);
apiV1.use('/tools/video-creator', videoCreatorRoutes);
apiV1.use('/tools/review-reply', reviewReplyRoutes);
apiV1.use('/themes', themesRoutes);
apiV1.use('/tools/image-editor', imageEditorRoutes);
apiV1.use('/tools/jargon', jargonRoutes);
apiV1.use('/tools/sms-templates', smsTemplatesRoutes);
apiV1.use('/tools/blog-generator', blogGeneratorRoutes);
apiV1.use('/tools/business-cards', businessCardsRoutes);
apiV1.use('/tools/photo-tuner', photoTunerRoutes);
apiV1.use('/settings', settingsRoutes);
apiV1.use('/batch-flyer', batchFlyerRoutes);
apiV1.use('/tools/ugc-creator', ugcCreatorRoutes);
apiV1.use('/tools/directors-cut', directorsCutRoutes);
apiV1.use('/tools/celebration', celebrationRoutes);
apiV1.use('/tools/mascot-builder', mascotBuilderRoutes);
apiV1.use('/tools/style-cloner', styleClonerRoutes);

app.use('/api/v1', apiV1);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚗 JW Auto Care API running on port ${PORT}`);
  logger.info(`📍 Environment: ${config.env}`);
  logger.info(`🌐 API URL: ${config.apiUrl}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

export default app;
// Force deploy 1769414970
