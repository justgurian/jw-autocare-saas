import { z } from 'zod';

// ─── Output Modes ───────────────────────────────────────────────────────────

export type OutputMode = 'photo-only' | 'photo-logo' | 'photo-text' | 'video';

// ─── Scene Types ────────────────────────────────────────────────────────────

export type SceneCategory =
  | 'action-shots'
  | 'shop-atmosphere'
  | 'detail-closeups'
  | 'team-culture'
  | 'customer-moments';

export interface PhotoScene {
  id: string;
  name: string;
  category: SceneCategory;
  prompt: string;
  shortDescription: string;
  suggestedCamera: string;
  suggestedLighting: string;
  peopleMode: 'none' | 'partial' | 'silhouette';
}

// ─── Aesthetics ─────────────────────────────────────────────────────────────

export interface ShopAesthetic {
  id: string;
  name: string;
  description: string;
  environmentPrompt: string;
  lightingPrompt: string;
  colorPalette: string[];
  materialTextures: string[];
}

// ─── Shop Profile (extracted from gallery analysis) ─────────────────────────

export interface ShopProfile {
  description: string;
  shopStyle: string;
  dominantColors: string[];
  materials: string[];
  lightingCharacter: string;
  equipmentVisible: string[];
  uniqueFeatures: string[];
}

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const outputModeSchema = z.enum(['photo-only', 'photo-logo', 'photo-text', 'video']);

export const enhanceRequestSchema = z.object({
  photoBase64: z.string().min(1),
  photoMimeType: z.string().min(1),
  outputMode: outputModeSchema,
  enhancementStyle: z.enum(['dramatic', 'clean', 'moody', 'bright', 'auto']),
  textContent: z.object({
    headline: z.string().optional(),
    subheadline: z.string().optional(),
    cta: z.string().optional(),
  }).optional(),
  aspectRatio: z.enum(['1:1', '4:5', '16:9', '9:16']).optional(),
});

export const generateRequestSchema = z.object({
  sceneId: z.string().min(1),
  outputMode: outputModeSchema,
  aestheticId: z.string().optional(),
  textContent: z.object({
    headline: z.string().optional(),
    subheadline: z.string().optional(),
    cta: z.string().optional(),
  }).optional(),
  aspectRatio: z.enum(['1:1', '4:5', '16:9', '9:16']).optional(),
});

export const videoRequestSchema = z.object({
  sceneId: z.string().min(1),
  aestheticId: z.string().optional(),
  aspectRatio: z.enum(['16:9', '9:16']).optional(),
  duration: z.number().min(5).max(15).optional(),
});

export const galleryUploadSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.string().min(1),
});
