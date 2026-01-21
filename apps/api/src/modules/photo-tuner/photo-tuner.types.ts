/**
 * Photo Tuner Types
 * AI-powered photo enhancement for auto shop marketing
 */

export type EnhancementPreset =
  | 'auto-enhance'
  | 'vibrant'
  | 'professional'
  | 'warm'
  | 'cool'
  | 'high-contrast'
  | 'soft'
  | 'dramatic'
  | 'vintage'
  | 'clean';

export type PhotoCategory =
  | 'vehicle-exterior'
  | 'vehicle-interior'
  | 'engine-bay'
  | 'shop-interior'
  | 'shop-exterior'
  | 'team-photo'
  | 'before-after'
  | 'detail-shot';

export interface EnhancementSettings {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  sharpness: number; // 0 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  warmth: number; // -100 to 100
  vibrance: number; // -100 to 100
  clarity: number; // 0 to 100
  denoise: number; // 0 to 100
}

export interface PhotoTuneInput {
  imageUrl: string;
  preset?: EnhancementPreset;
  category?: PhotoCategory;
  customSettings?: Partial<EnhancementSettings>;
  autoCorrect?: boolean;
  removeBackground?: boolean;
  outputFormat?: 'jpeg' | 'png' | 'webp';
  outputQuality?: number; // 1-100
}

export interface PhotoTuneResult {
  originalUrl: string;
  enhancedUrl: string;
  thumbnailUrl: string;
  settings: EnhancementSettings;
  preset: EnhancementPreset | 'custom';
  improvements: string[];
  beforeAfterUrl?: string;
}

export interface BatchTuneInput {
  images: Array<{
    url: string;
    category?: PhotoCategory;
  }>;
  preset: EnhancementPreset;
  applyConsistently: boolean;
}

export interface BatchTuneResult {
  results: PhotoTuneResult[];
  totalProcessed: number;
  failedCount: number;
}

// Enhancement preset definitions
export const ENHANCEMENT_PRESETS: Record<EnhancementPreset, {
  name: string;
  description: string;
  settings: EnhancementSettings;
  bestFor: PhotoCategory[];
}> = {
  'auto-enhance': {
    name: 'Auto Enhance',
    description: 'AI-powered automatic enhancement',
    settings: {
      brightness: 5,
      contrast: 10,
      saturation: 10,
      sharpness: 20,
      highlights: -5,
      shadows: 15,
      warmth: 0,
      vibrance: 15,
      clarity: 15,
      denoise: 10,
    },
    bestFor: ['vehicle-exterior', 'vehicle-interior', 'shop-interior'],
  },
  vibrant: {
    name: 'Vibrant',
    description: 'Rich, eye-catching colors',
    settings: {
      brightness: 5,
      contrast: 15,
      saturation: 30,
      sharpness: 25,
      highlights: 0,
      shadows: 10,
      warmth: 5,
      vibrance: 35,
      clarity: 20,
      denoise: 5,
    },
    bestFor: ['vehicle-exterior', 'detail-shot'],
  },
  professional: {
    name: 'Professional',
    description: 'Clean, business-ready look',
    settings: {
      brightness: 5,
      contrast: 8,
      saturation: 5,
      sharpness: 15,
      highlights: -10,
      shadows: 5,
      warmth: 0,
      vibrance: 10,
      clarity: 10,
      denoise: 15,
    },
    bestFor: ['team-photo', 'shop-exterior', 'shop-interior'],
  },
  warm: {
    name: 'Warm',
    description: 'Inviting, friendly warmth',
    settings: {
      brightness: 5,
      contrast: 5,
      saturation: 15,
      sharpness: 10,
      highlights: 0,
      shadows: 10,
      warmth: 25,
      vibrance: 15,
      clarity: 10,
      denoise: 5,
    },
    bestFor: ['team-photo', 'shop-interior'],
  },
  cool: {
    name: 'Cool',
    description: 'Modern, clean cool tones',
    settings: {
      brightness: 5,
      contrast: 10,
      saturation: 5,
      sharpness: 15,
      highlights: 5,
      shadows: 5,
      warmth: -20,
      vibrance: 10,
      clarity: 15,
      denoise: 10,
    },
    bestFor: ['vehicle-interior', 'engine-bay'],
  },
  'high-contrast': {
    name: 'High Contrast',
    description: 'Bold, dramatic contrast',
    settings: {
      brightness: 0,
      contrast: 35,
      saturation: 15,
      sharpness: 30,
      highlights: -15,
      shadows: 20,
      warmth: 0,
      vibrance: 20,
      clarity: 30,
      denoise: 5,
    },
    bestFor: ['vehicle-exterior', 'detail-shot', 'engine-bay'],
  },
  soft: {
    name: 'Soft',
    description: 'Gentle, approachable look',
    settings: {
      brightness: 10,
      contrast: -5,
      saturation: -5,
      sharpness: 5,
      highlights: -15,
      shadows: 15,
      warmth: 5,
      vibrance: 5,
      clarity: 0,
      denoise: 20,
    },
    bestFor: ['team-photo', 'shop-interior'],
  },
  dramatic: {
    name: 'Dramatic',
    description: 'High-impact visual style',
    settings: {
      brightness: -5,
      contrast: 25,
      saturation: 20,
      sharpness: 35,
      highlights: -20,
      shadows: 25,
      warmth: -5,
      vibrance: 25,
      clarity: 35,
      denoise: 5,
    },
    bestFor: ['vehicle-exterior', 'engine-bay', 'detail-shot'],
  },
  vintage: {
    name: 'Vintage',
    description: 'Classic, nostalgic feel',
    settings: {
      brightness: 5,
      contrast: 5,
      saturation: -15,
      sharpness: 5,
      highlights: -10,
      shadows: 5,
      warmth: 20,
      vibrance: -10,
      clarity: 5,
      denoise: 10,
    },
    bestFor: ['vehicle-exterior', 'shop-exterior'],
  },
  clean: {
    name: 'Clean',
    description: 'Bright, crisp appearance',
    settings: {
      brightness: 15,
      contrast: 5,
      saturation: 5,
      sharpness: 20,
      highlights: 10,
      shadows: 5,
      warmth: 0,
      vibrance: 5,
      clarity: 20,
      denoise: 15,
    },
    bestFor: ['vehicle-interior', 'shop-interior', 'before-after'],
  },
};

// Category-specific recommendations
export const CATEGORY_RECOMMENDATIONS: Record<PhotoCategory, {
  name: string;
  description: string;
  recommendedPresets: EnhancementPreset[];
  tips: string[];
}> = {
  'vehicle-exterior': {
    name: 'Vehicle Exterior',
    description: 'Outdoor shots of vehicles',
    recommendedPresets: ['vibrant', 'high-contrast', 'dramatic'],
    tips: [
      'Shoot during golden hour for best lighting',
      'Ensure vehicle is clean and detailed',
      'Use a polarizing filter to reduce reflections',
    ],
  },
  'vehicle-interior': {
    name: 'Vehicle Interior',
    description: 'Interior cabin shots',
    recommendedPresets: ['clean', 'cool', 'auto-enhance'],
    tips: [
      'Use diffused lighting to avoid harsh shadows',
      'Vacuum and detail before shooting',
      'Show steering wheel and dashboard clearly',
    ],
  },
  'engine-bay': {
    name: 'Engine Bay',
    description: 'Under-the-hood shots',
    recommendedPresets: ['high-contrast', 'dramatic', 'cool'],
    tips: [
      'Clean and degrease before shooting',
      'Use targeted lighting to highlight components',
      'Capture detail shots of quality parts',
    ],
  },
  'shop-interior': {
    name: 'Shop Interior',
    description: 'Inside the auto shop',
    recommendedPresets: ['professional', 'warm', 'clean'],
    tips: [
      'Keep the shop clean and organized',
      'Show equipment and workspace clearly',
      'Include team members when possible',
    ],
  },
  'shop-exterior': {
    name: 'Shop Exterior',
    description: 'Building and signage',
    recommendedPresets: ['professional', 'vibrant', 'auto-enhance'],
    tips: [
      'Shoot on a clear day',
      'Ensure signage is visible and legible',
      'Include parking area and entrance',
    ],
  },
  'team-photo': {
    name: 'Team Photo',
    description: 'Staff and team portraits',
    recommendedPresets: ['professional', 'warm', 'soft'],
    tips: [
      'Use even, flattering lighting',
      'Have team wear clean uniforms',
      'Capture genuine smiles',
    ],
  },
  'before-after': {
    name: 'Before & After',
    description: 'Transformation comparisons',
    recommendedPresets: ['clean', 'auto-enhance', 'high-contrast'],
    tips: [
      'Use consistent lighting and angles',
      'Ensure dramatic difference is visible',
      'Label before and after clearly',
    ],
  },
  'detail-shot': {
    name: 'Detail Shot',
    description: 'Close-up detail photos',
    recommendedPresets: ['vibrant', 'high-contrast', 'dramatic'],
    tips: [
      'Use macro mode or close-up lens',
      'Highlight quality craftsmanship',
      'Control depth of field for focus',
    ],
  },
};

// Default settings
export const DEFAULT_SETTINGS: EnhancementSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  highlights: 0,
  shadows: 0,
  warmth: 0,
  vibrance: 0,
  clarity: 0,
  denoise: 0,
};

// Helper function to merge settings
export function mergeSettings(
  base: EnhancementSettings,
  custom: Partial<EnhancementSettings>
): EnhancementSettings {
  return { ...base, ...custom };
}

// Helper function to clamp setting values
export function clampSetting(value: number, min: number = -100, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}
