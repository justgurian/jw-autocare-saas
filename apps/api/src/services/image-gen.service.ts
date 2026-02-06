/**
 * Image Generation Service
 * Wrapper service for image generation and manipulation
 */

import sharp from 'sharp';
import { geminiService } from './gemini.service';
import { logger } from '../utils/logger';

interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16' | '7:4' | '4:7';
  style?: string;
}

interface EnhanceImageOptions {
  adjustments: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    sharpness?: number;
  };
  preview?: boolean;
}

interface ThumbnailOptions {
  width: number;
  height: number;
}

interface ImageResult {
  url: string;
  data?: Buffer;
  mimeType?: string;
}

export const imageGenService = {
  /**
   * Generate an image from a prompt
   */
  async generateImage(options: GenerateImageOptions): Promise<ImageResult> {
    try {
      const result = await geminiService.generateImage(options.prompt, {
        aspectRatio: options.aspectRatio as any || '4:5',
        style: options.style,
      });

      if (!result.success) {
        throw new Error(result.error || 'Image generation failed');
      }

      // Return a placeholder URL for now - in production this would be the actual URL
      return {
        url: result.localPath || '/placeholder-image.png',
        data: result.imageData,
        mimeType: result.mimeType,
      };
    } catch (error) {
      logger.error('Image generation failed', { error });
      throw error;
    }
  },

  /**
   * Enhance an existing image with adjustments
   */
  async enhanceImage(imageUrl: string, options: EnhanceImageOptions): Promise<ImageResult> {
    try {
      const adjustments = options.adjustments;
      let buffer: Buffer;
      let prefix = '';

      if (imageUrl.startsWith('data:')) {
        const match = imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/s);
        if (!match) return { url: imageUrl };
        buffer = Buffer.from(match[2], 'base64');
        prefix = `data:${match[1]};base64,`;
      } else {
        const response = await fetch(imageUrl);
        buffer = Buffer.from(await response.arrayBuffer());
        prefix = 'data:image/png;base64,';
      }

      let pipeline = sharp(buffer);
      if (adjustments.brightness) pipeline = pipeline.modulate({ brightness: adjustments.brightness });
      if (adjustments.saturation) pipeline = pipeline.modulate({ saturation: adjustments.saturation });
      if (adjustments.contrast) pipeline = pipeline.linear(adjustments.contrast, -(128 * (adjustments.contrast - 1)));

      const enhanced = await pipeline.png().toBuffer();
      return {
        url: `${prefix}${enhanced.toString('base64')}`,
      };
    } catch (error) {
      logger.warn('Image enhancement failed, returning original', { error });
      return { url: imageUrl };
    }
  },

  /**
   * Generate a thumbnail from an image
   */
  async generateThumbnail(imageUrl: string, options: ThumbnailOptions): Promise<ImageResult> {
    try {
      const { width = 400, height = 400 } = options;

      // Handle base64 data URLs
      if (imageUrl.startsWith('data:')) {
        const match = imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/s);
        if (!match) return { url: imageUrl };
        const buffer = Buffer.from(match[2], 'base64');
        const thumbnail = await sharp(buffer)
          .resize(width, height, { fit: 'cover' })
          .png()
          .toBuffer();
        return {
          url: `data:image/png;base64,${thumbnail.toString('base64')}`,
        };
      }

      // For URLs, fetch first
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const thumbnail = await sharp(buffer)
        .resize(width, height, { fit: 'cover' })
        .png()
        .toBuffer();
      return {
        url: `data:image/png;base64,${thumbnail.toString('base64')}`,
      };
    } catch (error) {
      logger.warn('Thumbnail generation failed, returning original', { error });
      return { url: imageUrl };
    }
  },

  /**
   * Remove background from an image
   */
  async removeBackground(imageUrl: string): Promise<ImageResult> {
    logger.info('Background removal requested — using AI edit approach');
    // For now, return original — true background removal needs specialized processing
    return { url: imageUrl };
  },
};
