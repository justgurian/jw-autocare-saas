/**
 * Logo Styles - Redesigned for Natural Scene Integration
 *
 * Two modes:
 * 1. SCENE-INTEGRATED: Logo appears as part of the scene (vehicle decal, shop sign, badge)
 * 2. OVERLAY: Clean professional corner placement with nice effects
 *
 * The key is prompt engineering that creates actual space for the logo in the generated image.
 */

export type PositionAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type IntegrationMode = 'scene-integrated' | 'overlay';

export interface LogoEffect {
  type: 'shadow' | 'glow' | 'border' | 'background' | 'reflection' | 'vintage';
  // Shadow options
  blur?: number;
  opacity?: number;
  offsetX?: number;
  offsetY?: number;
  // Glow options
  intensity?: number;
  // Border options
  width?: number;
  color?: string;
  style?: 'solid' | 'stitched' | 'metallic' | 'dashed';
  radius?: number;
  // Background options
  padding?: number;
  borderRadius?: number;
  gradient?: { from: string; to: string; direction: 'vertical' | 'horizontal' };
}

export interface LogoTransform {
  scale: number;
  shape?: 'original' | 'circle';
  rotation?: number;
  perspective?: number; // For scene-integrated looks
}

export interface LogoStyle {
  id: string;
  name: string;
  description: string;
  mode: IntegrationMode;
  position: {
    anchor: PositionAnchor;
  };
  transform: LogoTransform;
  effects: LogoEffect[];
  promptHint: string; // CRITICAL: This tells the AI how to create space for the logo
  sceneDescription?: string; // For scene-integrated: describes what the logo area looks like
}

/**
 * REDESIGNED Logo Styles
 *
 * Scene-integrated styles: Logo looks like part of the image
 * Overlay styles: Clean corner placement
 */
export const LOGO_STYLES: LogoStyle[] = [
  // ============================================================================
  // SCENE-INTEGRATED STYLES - Logo looks like it's part of the scene
  // ============================================================================

  // Style 1: Vehicle Door Decal - Logo appears ON the vehicle
  {
    id: 'vehicle-door-decal',
    name: 'Vehicle Door Decal',
    description: 'Logo appears as a vinyl decal on a vehicle door or panel',
    mode: 'scene-integrated',
    position: { anchor: 'center-left' }, // Will be placed on detected vehicle area
    transform: {
      scale: 0.18,
      rotation: 0,
    },
    effects: [
      { type: 'shadow', blur: 2, opacity: 0.3, offsetX: 1, offsetY: 1 },
    ],
    promptHint: `IMPORTANT COMPOSITION REQUIREMENT: The image MUST include a prominent vehicle (car/truck) positioned so that the LEFT SIDE DOOR or LEFT FENDER is clearly visible and relatively flat/unobstructed. This vehicle surface area should be a solid color without busy patterns, text, or graphics - it will be used for business branding. Frame the shot so this vehicle surface is in the lower-left or center-left of the image.`,
    sceneDescription: 'Vehicle door/panel surface for decal placement',
  },

  // Style 2: Shop Sign - Logo appears on a sign in the background
  {
    id: 'shop-sign',
    name: 'Shop Sign',
    description: 'Logo appears on a garage sign or banner in the scene',
    mode: 'scene-integrated',
    position: { anchor: 'top-center' },
    transform: {
      scale: 0.22,
      rotation: 0,
    },
    effects: [
      { type: 'background', color: '#1a1a2e', padding: 15, borderRadius: 0 },
      { type: 'border', width: 4, color: '#333344', style: 'solid', radius: 0 },
      { type: 'shadow', blur: 8, opacity: 0.5, offsetX: 3, offsetY: 5 },
    ],
    promptHint: `IMPORTANT COMPOSITION REQUIREMENT: Include a BLANK RECTANGULAR SIGN, BANNER, or MARQUEE at the TOP of the image. This sign should be clearly visible against the background, with a solid dark color (dark blue, black, or dark gray) and NO TEXT on it - leave it completely blank for business branding to be added. The sign should be prominent, taking up about 20% of the image width, positioned in the upper portion of the composition.`,
    sceneDescription: 'Blank shop sign or banner for logo placement',
  },

  // Style 3: Toolbox/Equipment Sticker - Logo on garage equipment
  {
    id: 'toolbox-sticker',
    name: 'Toolbox Sticker',
    description: 'Logo appears as a sticker on a red toolbox or equipment',
    mode: 'scene-integrated',
    position: { anchor: 'bottom-left' },
    transform: {
      scale: 0.14,
      rotation: -3,
    },
    effects: [
      { type: 'background', color: '#FFFFFF', padding: 6, borderRadius: 3 },
      { type: 'shadow', blur: 2, opacity: 0.4, offsetX: 1, offsetY: 1 },
    ],
    promptHint: `IMPORTANT COMPOSITION REQUIREMENT: Include a RED TOOL BOX, TOOL CHEST, or SHOP EQUIPMENT in the LOWER LEFT area of the image. This toolbox should have a visible flat surface (drawer front or side panel) that is a solid red color WITHOUT any existing stickers, text, or logos - leave this surface blank for business branding. The toolbox should be clearly visible but not the main focus.`,
    sceneDescription: 'Red toolbox surface for sticker placement',
  },

  // ============================================================================
  // OVERLAY STYLES - Clean professional corner placement
  // ============================================================================

  // Style 4: Professional Corner Badge (PRIMARY OVERLAY STYLE)
  {
    id: 'corner-badge',
    name: 'Professional Corner Badge',
    description: 'Clean, professional logo badge in the corner',
    mode: 'overlay',
    position: { anchor: 'bottom-right' },
    transform: {
      scale: 0.13,
      rotation: 0,
    },
    effects: [
      { type: 'background', color: '#FFFFFF', padding: 10, borderRadius: 6 },
      { type: 'border', width: 2, color: '#E0E0E0', style: 'solid', radius: 6 },
      { type: 'shadow', blur: 6, opacity: 0.35, offsetX: 2, offsetY: 3 },
    ],
    promptHint: `COMPOSITION NOTE: Keep the BOTTOM RIGHT corner of the image relatively clear and simple. Avoid placing important text, faces, or key visual elements in the bottom right area. A subtle background or continuation of the scene in this area is fine.`,
    sceneDescription: 'Corner overlay position',
  },

  // Style 5: Vintage Badge - For retro themes
  {
    id: 'vintage-badge',
    name: 'Vintage Badge',
    description: 'Retro-styled badge with metallic border',
    mode: 'overlay',
    position: { anchor: 'bottom-right' },
    transform: {
      scale: 0.15,
      shape: 'circle',
      rotation: 0,
    },
    effects: [
      { type: 'border', width: 4, color: '#C0C0C0', style: 'metallic', radius: 999 },
      { type: 'border', width: 2, color: '#B8860B', style: 'solid', radius: 999 },
      { type: 'shadow', blur: 6, opacity: 0.4, offsetX: 2, offsetY: 3 },
    ],
    promptHint: `COMPOSITION NOTE: Keep the BOTTOM RIGHT corner of the image relatively clear. This area will feature a circular vintage-style badge. Avoid placing important elements there.`,
    sceneDescription: 'Corner badge position',
  },

  // Style 6: Racing Sponsor - For action/racing themes
  {
    id: 'racing-sponsor',
    name: 'Racing Sponsor',
    description: 'Motorsport sponsor-style badge',
    mode: 'overlay',
    position: { anchor: 'top-right' },
    transform: {
      scale: 0.14,
      rotation: -2,
    },
    effects: [
      { type: 'background', color: '#FFFFFF', padding: 8, borderRadius: 3 },
      { type: 'border', width: 2, color: '#CC0000', style: 'solid', radius: 3 },
      { type: 'shadow', blur: 4, opacity: 0.4, offsetX: 2, offsetY: 2 },
    ],
    promptHint: `COMPOSITION NOTE: Keep the TOP RIGHT corner of the image relatively clear for sponsor-style branding. Place main headlines and text in the center or left side of the image.`,
    sceneDescription: 'Top right sponsor position',
  },
];

/**
 * Weights for random selection
 *
 * Distribution designed for variety:
 * - 40% scene-integrated (logo looks part of the image)
 * - 60% overlay (clean professional placement)
 */
export const STYLE_WEIGHTS: Record<string, number> = {
  // Scene-integrated styles (40% total)
  'vehicle-door-decal': 15,
  'shop-sign': 12,
  'toolbox-sticker': 13,

  // Overlay styles (60% total)
  'corner-badge': 25,      // Most common - always looks good
  'vintage-badge': 18,     // Good for retro themes
  'racing-sponsor': 17,    // Good for action themes
};

/**
 * Get a style by ID
 */
export function getLogoStyle(id: string): LogoStyle | undefined {
  return LOGO_STYLES.find((s) => s.id === id);
}

/**
 * Select a random style with weighting
 */
export function selectRandomLogoStyle(excludeIds: string[] = []): LogoStyle {
  const available = LOGO_STYLES.filter((s) => !excludeIds.includes(s.id));

  if (available.length === 0) {
    return LOGO_STYLES[Math.floor(Math.random() * LOGO_STYLES.length)];
  }

  const totalWeight = available.reduce((sum, s) => sum + (STYLE_WEIGHTS[s.id] || 10), 0);

  let random = Math.random() * totalWeight;
  for (const style of available) {
    random -= STYLE_WEIGHTS[style.id] || 10;
    if (random <= 0) {
      return style;
    }
  }

  return available[0];
}

/**
 * Select a style appropriate for a specific theme era
 */
export function selectStyleForTheme(era?: string, style?: string): LogoStyle {
  // For vintage themes (1950s-1970s), prefer vintage badge or vehicle decal
  if (era === '1950s' || era === '1960s') {
    const vintageStyles = ['vintage-badge', 'vehicle-door-decal', 'corner-badge'];
    const styleId = vintageStyles[Math.floor(Math.random() * vintageStyles.length)];
    return getLogoStyle(styleId) || LOGO_STYLES[0];
  }

  // For 1980s themes, prefer racing sponsor or shop sign
  if (era === '1980s') {
    const modernStyles = ['racing-sponsor', 'shop-sign', 'corner-badge'];
    const styleId = modernStyles[Math.floor(Math.random() * modernStyles.length)];
    return getLogoStyle(styleId) || LOGO_STYLES[0];
  }

  // For magazine styles, prefer corner badge or shop sign
  if (style === 'magazine') {
    const magazineStyles = ['corner-badge', 'shop-sign'];
    const styleId = magazineStyles[Math.floor(Math.random() * magazineStyles.length)];
    return getLogoStyle(styleId) || LOGO_STYLES[0];
  }

  // Default: random selection
  return selectRandomLogoStyle();
}

/**
 * Get all available style IDs
 */
export function getAllStyleIds(): string[] {
  return LOGO_STYLES.map((s) => s.id);
}

/**
 * Get styles by mode
 */
export function getStylesByMode(mode: IntegrationMode): LogoStyle[] {
  return LOGO_STYLES.filter((s) => s.mode === mode);
}

/**
 * Get all styles for display
 */
export function getStylesForDisplay(): Array<{ id: string; name: string; description: string; mode: IntegrationMode }> {
  return LOGO_STYLES.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    mode: s.mode,
  }));
}
