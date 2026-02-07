import { z } from 'zod';

export const analyzeSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
});

export const saveSchema = z.object({
  name: z.string().min(1).max(100),
  shortDescription: z.string().max(300).optional(),
  sourceIndustry: z.string().max(100).optional(),
  imagePrompt: z.object({
    style: z.string(),
    colorPalette: z.string(),
    typography: z.string(),
    elements: z.string(),
    mood: z.string(),
  }),
  compositionNotes: z.string().optional(),
  avoidList: z.string().optional(),
  previewColors: z.array(z.string()).optional(),
  textPrompt: z.object({
    tone: z.string(),
    vocabulary: z.array(z.string()),
  }).optional(),
  referenceImageBase64: z.string().min(1),
  referenceMimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
});

export const updateThemeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  shortDescription: z.string().max(300).optional(),
  imagePrompt: z.object({
    style: z.string(),
    colorPalette: z.string(),
    typography: z.string(),
    elements: z.string(),
    mood: z.string(),
  }).optional(),
  compositionNotes: z.string().optional(),
  avoidList: z.string().optional(),
  previewColors: z.array(z.string()).optional(),
  textPrompt: z.object({
    tone: z.string(),
    vocabulary: z.array(z.string()),
  }).optional(),
});
