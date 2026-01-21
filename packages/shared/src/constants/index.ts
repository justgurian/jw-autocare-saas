// Shared constants

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;

export const SUBSCRIPTION_TIERS = {
  BASE: 'base',
  PREMIUM: 'premium',
} as const;

export const CONTENT_TOOLS = {
  PROMO_FLYER: 'promo_flyer',
  INSTANT_PACK: 'instant_pack',
  CAR_OF_DAY: 'car_of_day',
  CHECK_IN_TO_WIN: 'check_in_to_win',
  PHOTO_TUNER: 'photo_tuner',
  REVIEW_REPLY: 'review_reply',
  SEO_BLOG: 'seo_blog',
  PERSONAL_CARD: 'personal_card',
  JARGON_BUSTER: 'jargon_buster',
  SMS_BLAST: 'sms_blast',
  UGC_VIDEO: 'ugc_video',
} as const;

export const BEAT_TYPES = {
  PROMO: 'promo',
  EDUCATIONAL: 'educational',
  ENGAGEMENT: 'engagement',
  SEASONAL: 'seasonal',
  COMMUNITY: 'community',
} as const;

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

export const BRAND_VOICES = [
  'friendly',
  'professional',
  'humorous',
  'authoritative',
  'casual',
] as const;

export const DEFAULT_VEHICLES = ['corvette', 'jeep'] as const;
