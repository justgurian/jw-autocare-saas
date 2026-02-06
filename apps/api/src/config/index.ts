import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// Determine API URL for production (Railway provides RAILWAY_PUBLIC_DOMAIN)
const getApiUrl = () => {
  if (process.env.API_URL) return process.env.API_URL;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  if (process.env.RAILWAY_STATIC_URL) return process.env.RAILWAY_STATIC_URL;
  return 'http://localhost:3001';
};

export const config = {
  // Application
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiUrl: getApiUrl(),
  webUrl: process.env.WEB_URL || 'http://localhost:3000',

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // JWT Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
  },

  // Google Cloud
  gcp: {
    projectId: process.env.GCP_PROJECT_ID || '',
    bucketName: process.env.GCS_BUCKET_NAME || 'jw-autocare-content',
    keyFile: process.env.GCS_KEY_FILE || '',
  },

  // Google AI (Gemini)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },


  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceBase: process.env.STRIPE_PRICE_BASE || '',
    pricePremium: process.env.STRIPE_PRICE_PREMIUM || '',
  },

  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10),
  },

  // Content Moderation
  moderation: {
    enabled: process.env.ENABLE_CONTENT_MODERATION === 'true',
  },

  // Logging
  log: {
    level: process.env.LOG_LEVEL || 'debug',
  },
} as const;

// Tier configuration
export const TIER_LIMITS = {
  base: {
    imageGenerationsPerMonth: 500,
    instantPackMaxSize: 10,
    videoGenerationsPerMonth: 0,
    apiRatePerMinute: 60,
    storageGB: 10,
  },
  premium: {
    imageGenerationsPerMonth: 2000,
    instantPackMaxSize: 30,
    videoGenerationsPerMonth: 50,
    apiRatePerMinute: 120,
    storageGB: 50,
  },
} as const;

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;

// Content tools
export const CONTENT_TOOLS = {
  PROMO_FLYER: 'promo_flyer',
  INSTANT_PACK: 'instant_pack',
  CAR_OF_DAY: 'car_of_day',
  CHECK_IN_TO_WIN: 'check_in_to_win',
  VIDEO_CREATOR: 'video_creator',
  PHOTO_TUNER: 'photo_tuner',
  REVIEW_REPLY: 'review_reply',
  SEO_BLOG: 'seo_blog',
  PERSONAL_CARD: 'personal_card',
  JARGON_BUSTER: 'jargon_buster',
  SMS_BLAST: 'sms_blast',
  UGC_VIDEO: 'ugc_video',
} as const;

// Content status
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  POSTED: 'posted',
  ARCHIVED: 'archived',
} as const;

// Moderation status
export const MODERATION_STATUS = {
  PENDING: 'pending',
  PASSED: 'passed',
  FLAGGED: 'flagged',
} as const;

export default config;
