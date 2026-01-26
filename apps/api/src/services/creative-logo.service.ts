/**
 * Creative Logo Integration Service
 * Main entry point for creative logo placement on flyers
 */

import sharp from 'sharp';
import { logoEffectsService } from './logo-effects.service';
import {
  LogoStyle,
  LogoEffect,
  PositionAnchor,
  LOGO_STYLES,
  getLogoStyle,
  selectRandomLogoStyle,
} from './logo-styles';
import { logger } from '../utils/logger';

export interface LogoIntegrationOptions {
  logoBuffer: Buffer;
  imageBuffer: Buffer;
  style?: string | 'random';
  excludeStyles?: string[];
  variationSeed?: number;
}

export interface LogoIntegrationResult {
  imageBuffer: Buffer;
  appliedStyle: string;
  styleName: string;
  position: { x: number; y: number };
}

/**
 * Calculate logo position based on anchor and image dimensions
 */
function calculatePosition(
  imageWidth: number,
  imageHeight: number,
  logoWidth: number,
  logoHeight: number,
  anchor: PositionAnchor,
  variationSeed: number
): { x: number; y: number } {
  // Increased padding to keep logo away from edges and content
  const padding = 35;

  // NO random variation for bottom-right - we want consistent, predictable placement
  // This ensures the logo always lands in the same safe spot

  // Base positions for each anchor
  const anchors: Record<PositionAnchor, { x: number; y: number }> = {
    'top-left': { x: padding, y: padding },
    'top-center': { x: (imageWidth - logoWidth) / 2, y: padding },
    'top-right': { x: imageWidth - logoWidth - padding, y: padding },
    'center-left': { x: padding, y: (imageHeight - logoHeight) / 2 },
    center: { x: (imageWidth - logoWidth) / 2, y: (imageHeight - logoHeight) / 2 },
    'center-right': { x: imageWidth - logoWidth - padding, y: (imageHeight - logoHeight) / 2 },
    'bottom-left': { x: padding, y: imageHeight - logoHeight - padding },
    'bottom-center': { x: (imageWidth - logoWidth) / 2, y: imageHeight - logoHeight - padding },
    'bottom-right': { x: imageWidth - logoWidth - padding, y: imageHeight - logoHeight - padding },
  };

  return anchors[anchor];
}

/**
 * Apply effects chain to logo buffer
 */
async function applyEffects(logoBuffer: Buffer, effects: LogoEffect[]): Promise<Buffer> {
  let result = logoBuffer;

  for (const effect of effects) {
    try {
      switch (effect.type) {
        case 'background':
          result = await logoEffectsService.applyBackground(result, {
            color: effect.color,
            gradient: effect.gradient,
            padding: effect.padding || 10,
            borderRadius: effect.borderRadius || 0,
          });
          break;

        case 'border':
          result = await logoEffectsService.applyBorder(result, {
            width: effect.width || 2,
            color: effect.color || '#FFFFFF',
            style: effect.style || 'solid',
            radius: effect.radius,
          });
          break;

        case 'shadow':
          result = await logoEffectsService.applyShadow(result, {
            blur: effect.blur || 5,
            opacity: effect.opacity || 0.3,
            offsetX: effect.offsetX || 0,
            offsetY: effect.offsetY || 2,
          });
          break;

        case 'glow':
          result = await logoEffectsService.applyGlow(result, {
            color: effect.color || 'auto',
            blur: effect.blur || 10,
            intensity: effect.intensity || 0.5,
          });
          break;
      }
    } catch (err) {
      logger.warn('Failed to apply logo effect', { effectType: effect.type, error: err });
      // Continue with remaining effects
    }
  }

  return result;
}

export const creativeLogoService = {
  /**
   * Get all available logo styles
   */
  getAvailableStyles(): LogoStyle[] {
    return LOGO_STYLES;
  },

  /**
   * Get a specific style by ID
   */
  getStyle(id: string): LogoStyle | undefined {
    return getLogoStyle(id);
  },

  /**
   * Select a random style with optional exclusions
   */
  selectRandomStyle(exclude: string[] = []): LogoStyle {
    return selectRandomLogoStyle(exclude);
  },

  /**
   * Get prompt enhancement text for a style
   */
  getPromptEnhancement(styleId: string): string {
    const style = getLogoStyle(styleId);
    return style?.promptHint || 'Leave a clear area in one corner for logo placement.';
  },

  /**
   * Main entry point: Apply creative logo integration to an image
   */
  async integrateLogoCreatively(
    options: LogoIntegrationOptions
  ): Promise<LogoIntegrationResult> {
    const { logoBuffer, imageBuffer, variationSeed = Date.now() } = options;

    // Select style
    let style: LogoStyle;
    if (options.style && options.style !== 'random') {
      style = getLogoStyle(options.style) || selectRandomLogoStyle(options.excludeStyles);
    } else {
      style = selectRandomLogoStyle(options.excludeStyles);
    }

    logger.info('Applying creative logo integration', {
      style: style.id,
      styleName: style.name,
    });

    try {
      // Get image dimensions
      const imageMetadata = await sharp(imageBuffer).metadata();
      const imageWidth = imageMetadata.width || 1080;
      const imageHeight = imageMetadata.height || 1350;

      // Calculate target logo size
      const targetLogoWidth = Math.round(imageWidth * style.transform.scale);

      // Resize logo
      let processedLogo = await logoEffectsService.resize(logoBuffer, targetLogoWidth);

      // Apply shape transform (circle if needed)
      if (style.transform.shape === 'circle') {
        processedLogo = await logoEffectsService.makeCircular(processedLogo);
      }

      // Apply rotation if specified
      if (style.transform.rotation) {
        processedLogo = await logoEffectsService.applyRotation(
          processedLogo,
          style.transform.rotation
        );
      }

      // Apply effects chain
      processedLogo = await applyEffects(processedLogo, style.effects);

      // Get final logo dimensions after all effects
      const logoMetadata = await sharp(processedLogo).metadata();
      const finalLogoWidth = logoMetadata.width || targetLogoWidth;
      const finalLogoHeight = logoMetadata.height || targetLogoWidth;

      // Calculate position
      const position = calculatePosition(
        imageWidth,
        imageHeight,
        finalLogoWidth,
        finalLogoHeight,
        style.position.anchor,
        variationSeed
      );

      // Composite onto image
      const result = await sharp(imageBuffer)
        .composite([
          {
            input: processedLogo,
            left: Math.round(position.x),
            top: Math.round(position.y),
          },
        ])
        .png()
        .toBuffer();

      return {
        imageBuffer: result,
        appliedStyle: style.id,
        styleName: style.name,
        position,
      };
    } catch (error) {
      logger.error('Failed to integrate logo creatively', { error, style: style.id });
      // Return original image on failure
      return {
        imageBuffer,
        appliedStyle: 'none',
        styleName: 'None (error)',
        position: { x: 0, y: 0 },
      };
    }
  },

  /**
   * Simple composite without creative effects (fallback)
   */
  async compositeSimple(
    imageBuffer: Buffer,
    logoBuffer: Buffer,
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right'
  ): Promise<Buffer> {
    const imageMetadata = await sharp(imageBuffer).metadata();
    const imageWidth = imageMetadata.width || 1080;
    const imageHeight = imageMetadata.height || 1350;

    const logoWidth = Math.round(imageWidth * 0.15);
    const resizedLogo = await sharp(logoBuffer)
      .resize(logoWidth, null, { fit: 'inside' })
      .toBuffer();

    const logoMetadata = await sharp(resizedLogo).metadata();
    const finalLogoWidth = logoMetadata.width || logoWidth;
    const finalLogoHeight = logoMetadata.height || logoWidth;

    const padding = 20;
    let left: number;
    let top: number;

    switch (position) {
      case 'top-left':
        left = padding;
        top = padding;
        break;
      case 'top-right':
        left = imageWidth - finalLogoWidth - padding;
        top = padding;
        break;
      case 'bottom-left':
        left = padding;
        top = imageHeight - finalLogoHeight - padding;
        break;
      default: // bottom-right
        left = imageWidth - finalLogoWidth - padding;
        top = imageHeight - finalLogoHeight - padding;
    }

    return sharp(imageBuffer)
      .composite([{ input: resizedLogo, left, top }])
      .png()
      .toBuffer();
  },
};

export default creativeLogoService;
