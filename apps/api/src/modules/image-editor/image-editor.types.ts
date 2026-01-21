/**
 * Image Editor (Repair Bay) Types
 * Type definitions for the image editing tool
 */

// Available editing operations
export type EditOperation =
  | 'background_remove'
  | 'background_replace'
  | 'enhance'
  | 'resize'
  | 'crop'
  | 'rotate'
  | 'flip'
  | 'filter'
  | 'adjust'
  | 'text_overlay'
  | 'logo_overlay'
  | 'border'
  | 'watermark';

// Filter presets
export type FilterPreset =
  | 'none'
  | 'vintage'
  | 'vibrant'
  | 'muted'
  | 'dramatic'
  | 'warm'
  | 'cool'
  | 'blackwhite'
  | 'sepia'
  | 'highcontrast';

// Image adjustment parameters
export interface ImageAdjustments {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  sharpness?: number; // 0 to 100
  blur?: number; // 0 to 100
  temperature?: number; // -100 to 100 (cool to warm)
  tint?: number; // -100 to 100
  highlights?: number; // -100 to 100
  shadows?: number; // -100 to 100
}

// Crop settings
export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: string; // e.g., '4:5', '1:1', '16:9'
}

// Resize settings
export interface ResizeSettings {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  resizeMode?: 'fit' | 'fill' | 'stretch';
}

// Text overlay settings
export interface TextOverlay {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor?: string;
  padding?: number;
  rotation?: number;
  alignment?: 'left' | 'center' | 'right';
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

// Logo/Image overlay settings
export interface ImageOverlay {
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number; // 0 to 1
  rotation?: number;
}

// Border settings
export interface BorderSettings {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  radius?: number;
}

// Watermark settings
export interface WatermarkSettings {
  text?: string;
  imageUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tile';
  opacity: number;
  size?: number;
}

// Background replacement settings
export interface BackgroundSettings {
  type: 'color' | 'gradient' | 'image' | 'transparent';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
  imageUrl?: string;
  blur?: number;
}

// Edit request for a single operation
export interface EditRequest {
  operation: EditOperation;
  adjustments?: ImageAdjustments;
  filter?: FilterPreset;
  crop?: CropSettings;
  resize?: ResizeSettings;
  rotate?: number; // degrees
  flip?: 'horizontal' | 'vertical' | 'both';
  textOverlay?: TextOverlay;
  imageOverlay?: ImageOverlay;
  border?: BorderSettings;
  watermark?: WatermarkSettings;
  background?: BackgroundSettings;
}

// Full edit session input
export interface ImageEditInput {
  sourceImageUrl?: string;
  sourceImageBase64?: string;
  contentId?: string; // If editing existing content
  operations: EditRequest[];
  outputFormat?: 'png' | 'jpeg' | 'webp';
  outputQuality?: number; // 1-100 for jpeg/webp
}

// Edit result
export interface ImageEditResult {
  id: string;
  originalUrl: string;
  editedUrl: string;
  thumbnailUrl: string;
  operations: EditOperation[];
  metadata: {
    originalSize: { width: number; height: number };
    editedSize: { width: number; height: number };
    format: string;
    fileSize: number;
  };
  createdAt: Date;
}

// Edit history entry
export interface EditHistoryEntry {
  id: string;
  tenantId: string;
  userId: string;
  originalUrl: string;
  editedUrl: string;
  operations: EditOperation[];
  createdAt: Date;
}

// AI-powered edit suggestions
export interface EditSuggestion {
  operation: EditOperation;
  description: string;
  confidence: number;
  parameters?: Partial<EditRequest>;
}

// Preset templates for quick edits
export const EDIT_PRESETS = [
  {
    id: 'social-ready',
    name: 'Social Media Ready',
    description: 'Optimized for Instagram/Facebook posts',
    operations: [
      { operation: 'resize' as EditOperation, resize: { width: 1080, height: 1350, maintainAspectRatio: false } },
      { operation: 'enhance' as EditOperation },
    ],
  },
  {
    id: 'print-ready',
    name: 'Print Ready',
    description: 'High quality for printing',
    operations: [
      { operation: 'enhance' as EditOperation },
      { operation: 'adjust' as EditOperation, adjustments: { sharpness: 20 } },
    ],
  },
  {
    id: 'vintage-look',
    name: 'Vintage Look',
    description: 'Classic retro styling',
    operations: [
      { operation: 'filter' as EditOperation, filter: 'vintage' as FilterPreset },
      { operation: 'border' as EditOperation, border: { width: 20, color: '#F5F5DC', style: 'solid' } },
    ],
  },
  {
    id: 'clean-background',
    name: 'Clean Background',
    description: 'Remove and replace background',
    operations: [
      { operation: 'background_remove' as EditOperation },
      { operation: 'background_replace' as EditOperation, background: { type: 'color', color: '#FFFFFF' } },
    ],
  },
  {
    id: 'branded',
    name: 'Add Branding',
    description: 'Add logo watermark',
    operations: [
      { operation: 'watermark' as EditOperation, watermark: { position: 'bottom-right', opacity: 0.7 } },
    ],
  },
];

// Filter definitions with adjustment values
export const FILTER_DEFINITIONS: Record<FilterPreset, ImageAdjustments> = {
  none: {},
  vintage: { saturation: -20, contrast: 10, temperature: 20, highlights: -10 },
  vibrant: { saturation: 30, contrast: 15, brightness: 5 },
  muted: { saturation: -30, contrast: -10 },
  dramatic: { contrast: 40, shadows: -20, highlights: 20 },
  warm: { temperature: 30, saturation: 10 },
  cool: { temperature: -30, tint: 10 },
  blackwhite: { saturation: -100 },
  sepia: { saturation: -50, temperature: 40, contrast: 10 },
  highcontrast: { contrast: 50, shadows: -30, highlights: 30 },
};

// Available aspect ratios
export const ASPECT_RATIOS = [
  { id: 'free', name: 'Free', ratio: null },
  { id: '1:1', name: 'Square', ratio: 1 },
  { id: '4:5', name: 'Portrait (4:5)', ratio: 0.8 },
  { id: '5:4', name: 'Landscape (5:4)', ratio: 1.25 },
  { id: '16:9', name: 'Widescreen', ratio: 16 / 9 },
  { id: '9:16', name: 'Story/Reel', ratio: 9 / 16 },
  { id: '3:2', name: 'Classic Photo', ratio: 1.5 },
  { id: '2:3', name: 'Portrait Photo', ratio: 2 / 3 },
];
