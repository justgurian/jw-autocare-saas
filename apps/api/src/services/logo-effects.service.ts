/**
 * Logo Effects Service
 * Sharp-based visual effects for creative logo integration
 */

import sharp from 'sharp';

export interface ShadowOptions {
  blur: number;
  opacity: number;
  offsetX: number;
  offsetY: number;
  color?: string;
}

export interface GlowOptions {
  color: string | 'auto';
  blur: number;
  intensity: number;
}

export interface BorderOptions {
  width: number;
  color: string;
  style: 'solid' | 'stitched' | 'metallic' | 'dashed';
  radius?: number;
}

export interface BackgroundOptions {
  color?: string;
  gradient?: { from: string; to: string; direction: 'vertical' | 'horizontal' };
  padding: number;
  borderRadius: number;
}

export const logoEffectsService = {
  /**
   * Apply drop shadow effect
   */
  async applyShadow(
    imageBuffer: Buffer,
    options: ShadowOptions
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 100;
    const height = metadata.height || 100;

    const expandedWidth = width + options.blur * 2 + Math.abs(options.offsetX) + 10;
    const expandedHeight = height + options.blur * 2 + Math.abs(options.offsetY) + 10;

    // Create shadow by using the image as alpha and filling with dark color
    const shadow = await sharp(imageBuffer)
      .ensureAlpha()
      .extractChannel('alpha')
      .toColourspace('b-w')
      .linear(options.opacity, 0)
      .blur(Math.max(0.3, options.blur))
      .toBuffer();

    // Create the shadow as a dark layer
    const shadowLayer = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 255 },
      },
    })
      .composite([
        {
          input: shadow,
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();

    // Composite shadow behind original
    return sharp({
      create: {
        width: expandedWidth,
        height: expandedHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: shadowLayer,
          left: Math.round(options.blur + Math.max(0, options.offsetX)),
          top: Math.round(options.blur + Math.max(0, options.offsetY)),
          blend: 'over',
        },
        {
          input: imageBuffer,
          left: Math.round(options.blur + Math.max(0, -options.offsetX)),
          top: Math.round(options.blur + Math.max(0, -options.offsetY)),
          blend: 'over',
        },
      ])
      .png()
      .toBuffer();
  },

  /**
   * Apply glow effect (like neon)
   */
  async applyGlow(
    imageBuffer: Buffer,
    options: GlowOptions
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 100;
    const height = metadata.height || 100;

    const expandedSize = Math.ceil(options.blur * 2.5);
    const expandedWidth = width + expandedSize * 2;
    const expandedHeight = height + expandedSize * 2;

    // Create glow layer by blurring the image
    const glow = await sharp(imageBuffer)
      .blur(Math.max(0.3, options.blur))
      .modulate({ brightness: 1 + options.intensity })
      .toBuffer();

    // Create outer glow (wider blur)
    const outerGlow = await sharp(imageBuffer)
      .blur(Math.max(0.3, options.blur * 2))
      .modulate({ brightness: 1 + options.intensity * 0.5 })
      .toBuffer();

    return sharp({
      create: {
        width: expandedWidth,
        height: expandedHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: outerGlow,
          left: expandedSize,
          top: expandedSize,
          blend: 'screen',
        },
        {
          input: glow,
          left: expandedSize,
          top: expandedSize,
          blend: 'screen',
        },
        {
          input: imageBuffer,
          left: expandedSize,
          top: expandedSize,
          blend: 'over',
        },
      ])
      .png()
      .toBuffer();
  },

  /**
   * Apply border effect using SVG
   */
  async applyBorder(
    imageBuffer: Buffer,
    options: BorderOptions
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 100;
    const height = metadata.height || 100;

    const borderWidth = options.width;
    const newWidth = width + borderWidth * 2;
    const newHeight = height + borderWidth * 2;
    const radius = options.radius || 0;

    let borderSvg: string;

    switch (options.style) {
      case 'stitched':
        borderSvg = `
          <svg width="${newWidth}" height="${newHeight}">
            <rect x="${borderWidth / 2}" y="${borderWidth / 2}"
                  width="${newWidth - borderWidth}" height="${newHeight - borderWidth}"
                  fill="none" stroke="${options.color}" stroke-width="${borderWidth}"
                  stroke-dasharray="6,3" rx="${radius}" ry="${radius}"/>
          </svg>`;
        break;

      case 'metallic':
        borderSvg = `
          <svg width="${newWidth}" height="${newHeight}">
            <defs>
              <linearGradient id="metallic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#E8E8E8"/>
                <stop offset="25%" style="stop-color:#FFFFFF"/>
                <stop offset="50%" style="stop-color:#C0C0C0"/>
                <stop offset="75%" style="stop-color:#FFFFFF"/>
                <stop offset="100%" style="stop-color:#A0A0A0"/>
              </linearGradient>
            </defs>
            <rect x="${borderWidth / 2}" y="${borderWidth / 2}"
                  width="${newWidth - borderWidth}" height="${newHeight - borderWidth}"
                  fill="none" stroke="url(#metallic)" stroke-width="${borderWidth}"
                  rx="${radius}" ry="${radius}"/>
          </svg>`;
        break;

      case 'dashed':
        borderSvg = `
          <svg width="${newWidth}" height="${newHeight}">
            <rect x="${borderWidth / 2}" y="${borderWidth / 2}"
                  width="${newWidth - borderWidth}" height="${newHeight - borderWidth}"
                  fill="none" stroke="${options.color}" stroke-width="${borderWidth}"
                  stroke-dasharray="10,5" rx="${radius}" ry="${radius}"/>
          </svg>`;
        break;

      default: // solid
        borderSvg = `
          <svg width="${newWidth}" height="${newHeight}">
            <rect x="${borderWidth / 2}" y="${borderWidth / 2}"
                  width="${newWidth - borderWidth}" height="${newHeight - borderWidth}"
                  fill="none" stroke="${options.color}" stroke-width="${borderWidth}"
                  rx="${radius}" ry="${radius}"/>
          </svg>`;
    }

    const border = Buffer.from(borderSvg);

    return sharp({
      create: {
        width: newWidth,
        height: newHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: border, left: 0, top: 0 },
        { input: imageBuffer, left: borderWidth, top: borderWidth },
      ])
      .png()
      .toBuffer();
  },

  /**
   * Apply background with optional gradient
   */
  async applyBackground(
    imageBuffer: Buffer,
    options: BackgroundOptions
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 100;
    const height = metadata.height || 100;

    const newWidth = width + options.padding * 2;
    const newHeight = height + options.padding * 2;

    let bgSvg: string;
    if (options.gradient) {
      const { from, to, direction } = options.gradient;
      const coords =
        direction === 'vertical'
          ? 'x1="0%" y1="0%" x2="0%" y2="100%"'
          : 'x1="0%" y1="0%" x2="100%" y2="0%"';
      bgSvg = `
        <svg width="${newWidth}" height="${newHeight}">
          <defs>
            <linearGradient id="bg" ${coords}>
              <stop offset="0%" style="stop-color:${from}"/>
              <stop offset="100%" style="stop-color:${to}"/>
            </linearGradient>
          </defs>
          <rect width="${newWidth}" height="${newHeight}" fill="url(#bg)" rx="${options.borderRadius}"/>
        </svg>`;
    } else {
      bgSvg = `
        <svg width="${newWidth}" height="${newHeight}">
          <rect width="${newWidth}" height="${newHeight}" fill="${options.color || '#FFFFFF'}" rx="${options.borderRadius}"/>
        </svg>`;
    }

    const background = Buffer.from(bgSvg);

    return sharp(background)
      .composite([{ input: imageBuffer, left: options.padding, top: options.padding }])
      .png()
      .toBuffer();
  },

  /**
   * Make logo circular (for badge effects)
   */
  async makeCircular(imageBuffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const size = Math.max(metadata.width || 100, metadata.height || 100);

    // Resize to square with transparent background
    const squared = await sharp(imageBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    // Create circular mask
    const mask = Buffer.from(`
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>
    `);

    return sharp(squared)
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();
  },

  /**
   * Apply rotation with transparent background
   */
  async applyRotation(imageBuffer: Buffer, degrees: number): Promise<Buffer> {
    return sharp(imageBuffer)
      .rotate(degrees, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  },

  /**
   * Resize logo maintaining aspect ratio
   */
  async resize(imageBuffer: Buffer, targetWidth: number): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize(targetWidth, null, {
        fit: 'inside',
        withoutEnlargement: false,
      })
      .png()
      .toBuffer();
  },
};

export default logoEffectsService;
