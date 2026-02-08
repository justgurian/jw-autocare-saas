/**
 * Promo Flyer Types
 * Types for the nostalgic theme expansion with vehicle selection, language toggle, and pack generation
 */

import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const generateSchema = z.object({
  message: z.string().min(1).max(500),
  subject: z.string().min(1).max(200),
  details: z.string().max(500).optional(),
  themeId: z.string().min(1),
  vehicleId: z.string().optional(), // 'random' or specific era vehicle ID (backward compat)
  vehicleMake: z.string().max(50).optional(),
  vehicleModel: z.string().max(50).optional(),
  vehicleYear: z.union([z.string(), z.number()]).optional(),
  vehicleColor: z.string().max(30).optional(),
  vehicleFreeText: z.string().max(200).optional(),
  language: z.enum(['en', 'es', 'both']).default('en'),
  subjectType: z.enum(['hero-car', 'mechanic', 'detail-shot', 'shop-exterior', 'text-only', 'auto']).optional().default('auto'),
  generateMockup: z.boolean().default(false),
});

export const generatePackSchema = z.object({
  message: z.string().min(1).max(500),
  subject: z.string().min(1).max(200),
  details: z.string().max(500).optional(),
  packType: z.enum(['variety-3', 'variety-5', 'week-7', 'era', 'style']),
  era: z.enum(['1950s', '1960s', '1970s', '1980s']).optional(), // Required for era pack
  style: z.enum(['comic-book', 'movie-poster', 'magazine']).optional(), // Required for style pack
  vehicleId: z.string().optional(), // 'random' or specific vehicle ID
  language: z.enum(['en', 'es', 'both']).default('en'),
});

export const nostalgicThemesQuerySchema = z.object({
  era: z.enum(['1950s', '1960s', '1970s', '1980s']).optional(),
  style: z.enum(['comic-book', 'movie-poster', 'magazine']).optional(),
});

export const vehiclesQuerySchema = z.object({
  era: z.enum(['1950s', '1960s', '1970s', '1980s']).optional(),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type GenerateInput = z.infer<typeof generateSchema>;
export type GeneratePackInput = z.infer<typeof generatePackSchema>;
export type NostalgicThemesQuery = z.infer<typeof nostalgicThemesQuerySchema>;
export type VehiclesQuery = z.infer<typeof vehiclesQuerySchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface GeneratedFlyer {
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
  status: string;
  instant?: boolean;
}

export interface GeneratedPack {
  packType: string;
  flyers: GeneratedFlyer[];
  totalGenerated: number;
  era?: string;
  style?: string;
}

export interface ThemeResponse {
  id: string;
  name: string;
  category: string;
  shortDescription?: string;
  previewColors?: string[];
  previewUrl?: string;
}

export interface NostalgicThemeResponse extends ThemeResponse {
  era: '1950s' | '1960s' | '1970s' | '1980s';
  style: 'comic-book' | 'movie-poster' | 'magazine';
}

export interface VehicleResponse {
  id: string;
  name: string;
  make: string;
  model: string;
  year: string;
  description: string;
}

export interface ThemesEndpointResponse {
  brandStyles: ThemeResponse[];
  themes: ThemeResponse[];
  nostalgicThemes: NostalgicThemeResponse[];
  categories: string[];
  eras: Array<{ id: string; name: string; icon: string; description: string }>;
  styles: Array<{ id: string; name: string; icon: string; description: string }>;
}

export interface VehiclesEndpointResponse {
  vehicles: VehicleResponse[];
  era?: string;
}

// ============================================================================
// PACK TYPE DEFINITIONS
// ============================================================================

export const PACK_DEFINITIONS = {
  'variety-3': {
    name: '3-Pack Variety',
    count: 3,
    description: '3 different styles from different eras',
    selectionMethod: 'random-variety',
  },
  'variety-5': {
    name: '5-Pack Variety',
    count: 5,
    description: '5 different styles from different eras',
    selectionMethod: 'random-variety',
  },
  'week-7': {
    name: 'Week Pack',
    count: 7,
    description: '7 flyers for a week of content',
    selectionMethod: 'random-variety',
  },
  'era': {
    name: 'Era Pack',
    count: 4,
    description: '4 flyers from the same era (all 3 styles + 1 bonus)',
    selectionMethod: 'same-era',
  },
  'style': {
    name: 'Style Pack',
    count: 4,
    description: '4 flyers in the same style from different eras',
    selectionMethod: 'same-style',
  },
} as const;

export type PackType = keyof typeof PACK_DEFINITIONS;
