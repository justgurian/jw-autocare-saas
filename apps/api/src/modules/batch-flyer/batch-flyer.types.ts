/**
 * Batch Flyer Types
 * Types for the batch flyer generation system with smart suggestions,
 * carousel review, inpaint editing, and auto-scheduling
 */

import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Custom content item for manual text entry
const customContentSchema = z.object({
  message: z.string().min(1).max(500),
  subject: z.string().min(1).max(200),
  details: z.string().max(500).optional(),
});

// Theme matrix entry for advanced users
const themeMatrixEntrySchema = z.object({
  index: z.number().int().min(0),
  themeId: z.string().min(1),
});

// Main batch generation request schema
export const batchGenerateSchema = z.object({
  mode: z.enum(['quick', 'week', 'month']),
  count: z.number().int().min(1).max(30),

  // Content Selection
  contentType: z.enum(['services', 'specials', 'custom', 'mixed']),
  serviceIds: z.array(z.string()).optional(),
  specialIds: z.array(z.string()).optional(),
  customContent: z.array(customContentSchema).optional(),

  // Theme Selection
  themeStrategy: z.enum(['auto', 'single', 'matrix']).default('auto'),
  singleThemeId: z.string().optional(),
  themeMatrix: z.array(themeMatrixEntrySchema).optional(),

  // Holiday Packs (opt-in seasonal themes)
  // By default, holiday themes are NOT included unless explicitly selected
  holidayPacks: z.array(z.string()).optional(), // e.g., ['halloween', 'christmas']

  // Options
  language: z.enum(['en', 'es', 'both']).default('en'),
  vehicleId: z.string().optional(),
  mascotId: z.string().optional(),
});

// Approve flyer with scheduling
export const approveFlyerSchema = z.object({
  scheduledFor: z.string().datetime().optional(), // ISO datetime
  caption: z.string().max(2000).optional(), // Allow caption update on approve
});

// Update flyer caption
export const updateCaptionSchema = z.object({
  caption: z.string().max(2000),
  captionSpanish: z.string().max(2000).optional(),
});

// Inpaint request schema
export const inpaintSchema = z.object({
  editType: z.enum(['preset', 'custom']),
  preset: z.enum([
    'brighten',
    'darken',
    'more-contrast',
    'less-contrast',
    'warmer',
    'cooler',
    'vintage',
    'sharpen',
  ]).optional(),
  customPrompt: z.string().max(500).optional(),
});

// Save as favorite
export const saveFavoriteSchema = z.object({
  name: z.string().min(1).max(255),
  themeId: z.string().min(1),
  serviceId: z.string().optional(),
  specialId: z.string().optional(),
  customText: z.string().max(1000).optional(),
  contentId: z.string().optional(),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type BatchGenerateInput = z.infer<typeof batchGenerateSchema>;
export type ApproveFlyerInput = z.infer<typeof approveFlyerSchema>;
export type UpdateCaptionInput = z.infer<typeof updateCaptionSchema>;
export type InpaintInput = z.infer<typeof inpaintSchema>;
export type SaveFavoriteInput = z.infer<typeof saveFavoriteSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface BatchFlyer {
  id: string;
  imageUrl: string;
  caption: string;
  captionSpanish?: string | null;
  title: string;
  theme: string;
  themeName: string;
  vehicle?: {
    id: string;
    name: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  scheduledFor?: string | null;
  status: string;
  index: number;
}

export interface BatchJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mode: string;
  themeStrategy: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface BatchGenerateResponse {
  jobId: string;
  status: 'pending' | 'processing';
  mode: string;
  count: number;
  message: string;
}

export interface BatchJobStatusResponse {
  job: BatchJob;
  progress: number; // 0-100
  flyers?: BatchFlyer[];
}

export interface Suggestion {
  id: string;
  type: 'seasonal' | 'trending' | 'rotation' | 'performance';
  serviceId?: string;
  specialId?: string;
  serviceName?: string;
  specialName?: string;
  themeId?: string;
  themeName?: string;
  reason: string;
  priority: number; // 1-10
}

export interface SuggestionsResponse {
  seasonal: Suggestion[];
  trending: Suggestion[];
  rotation: Suggestion[];
  contentSuggestions: Array<{
    serviceId?: string;
    specialId?: string;
    name: string;
    isPreSelected: boolean;
    reason: string;
  }>;
  // Raw lists so UI can display all available options
  allServices: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string | null;
  }>;
  allSpecials: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
}

export interface FavoriteTemplate {
  id: string;
  name: string;
  themeId: string;
  themeName?: string;
  serviceId?: string;
  specialId?: string;
  customText?: string;
  contentId?: string;
  previewUrl?: string;
  createdAt: string;
}

export interface InpaintResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// ============================================================================
// MODE DEFINITIONS
// ============================================================================

export const MODE_DEFINITIONS = {
  quick: {
    name: 'Quick Post',
    description: '1-3 flyers for immediate needs',
    minCount: 1,
    maxCount: 3,
    defaultCount: 1,
  },
  week: {
    name: 'Week Pack',
    description: 'Plan your whole week',
    minCount: 7,
    maxCount: 7,
    defaultCount: 7,
  },
  month: {
    name: 'Month Blitz',
    description: 'Content for the entire month',
    minCount: 1,
    maxCount: 30,
    defaultCount: 20,
  },
} as const;

export type Mode = keyof typeof MODE_DEFINITIONS;

// ============================================================================
// INPAINT PRESETS
// ============================================================================

export const INPAINT_PRESETS = {
  brighten: {
    name: 'Brighten',
    description: 'Make the image lighter and more vibrant',
    prompt: 'Increase overall brightness while maintaining contrast and color balance',
  },
  darken: {
    name: 'Darken',
    description: 'Make the image darker for a moodier look',
    prompt: 'Decrease overall brightness while maintaining contrast and color balance',
  },
  'more-contrast': {
    name: 'More Contrast',
    description: 'Increase the difference between light and dark areas',
    prompt: 'Increase contrast to make colors pop and details stand out',
  },
  'less-contrast': {
    name: 'Less Contrast',
    description: 'Soften the image with less contrast',
    prompt: 'Reduce contrast for a softer, more subtle appearance',
  },
  warmer: {
    name: 'Warmer',
    description: 'Add warm, golden tones',
    prompt: 'Shift color temperature warmer with golden and orange undertones',
  },
  cooler: {
    name: 'Cooler',
    description: 'Add cool, blue tones',
    prompt: 'Shift color temperature cooler with blue and silver undertones',
  },
  vintage: {
    name: 'Vintage',
    description: 'Add a classic film look',
    prompt: 'Apply vintage film effect with faded colors, slight grain, and warm shadows',
  },
  sharpen: {
    name: 'Sharpen',
    description: 'Enhance details and edges',
    prompt: 'Sharpen details and enhance edge definition for a crisper image',
  },
} as const;

export type InpaintPreset = keyof typeof INPAINT_PRESETS;
