/**
 * Photo Tuner Service
 * AI-powered photo enhancement for auto shop marketing
 */

import { imageGenService } from '../../services/image-gen.service';
import { geminiService } from '../../services/gemini.service';
import { logger } from '../../utils/logger';
import {
  EnhancementPreset,
  PhotoCategory,
  EnhancementSettings,
  PhotoTuneInput,
  PhotoTuneResult,
  BatchTuneInput,
  BatchTuneResult,
  ENHANCEMENT_PRESETS,
  CATEGORY_RECOMMENDATIONS,
  DEFAULT_SETTINGS,
  mergeSettings,
} from './photo-tuner.types';

class PhotoTunerService {
  /**
   * Get all enhancement presets
   */
  getPresets() {
    return Object.entries(ENHANCEMENT_PRESETS).map(([id, preset]) => ({
      id,
      ...preset,
    }));
  }

  /**
   * Get a specific preset
   */
  getPresetById(id: EnhancementPreset) {
    return ENHANCEMENT_PRESETS[id];
  }

  /**
   * Get all photo categories with recommendations
   */
  getCategories() {
    return Object.entries(CATEGORY_RECOMMENDATIONS).map(([id, category]) => ({
      id,
      ...category,
    }));
  }

  /**
   * Get recommended presets for a category
   */
  getRecommendedPresets(category: PhotoCategory) {
    const categoryInfo = CATEGORY_RECOMMENDATIONS[category];
    if (!categoryInfo) return [];

    return categoryInfo.recommendedPresets.map((presetId) => ({
      id: presetId,
      ...ENHANCEMENT_PRESETS[presetId],
    }));
  }

  /**
   * Enhance a single photo
   */
  async enhancePhoto(input: PhotoTuneInput): Promise<PhotoTuneResult> {
    // Determine settings to use
    let settings: EnhancementSettings;
    let presetUsed: EnhancementPreset | 'custom';

    if (input.customSettings && Object.keys(input.customSettings).length > 0) {
      settings = mergeSettings(DEFAULT_SETTINGS, input.customSettings);
      presetUsed = 'custom';
    } else if (input.preset) {
      settings = ENHANCEMENT_PRESETS[input.preset].settings;
      presetUsed = input.preset;
    } else if (input.autoCorrect) {
      settings = await this.analyzeAndSuggestSettings(input.imageUrl, input.category);
      presetUsed = 'custom';
    } else {
      settings = ENHANCEMENT_PRESETS['auto-enhance'].settings;
      presetUsed = 'auto-enhance';
    }

    // Apply enhancements using image service
    const enhancedImage = await imageGenService.enhanceImage(input.imageUrl, {
      adjustments: {
        brightness: settings.brightness,
        contrast: settings.contrast,
        saturation: settings.saturation,
        sharpness: settings.sharpness,
      },
    });

    // Generate thumbnail
    const thumbnail = await imageGenService.generateThumbnail(enhancedImage.url, {
      width: 200,
      height: 200,
    });

    // Determine improvements made
    const improvements = this.describeImprovements(settings);

    return {
      originalUrl: input.imageUrl,
      enhancedUrl: enhancedImage.url,
      thumbnailUrl: thumbnail.url,
      settings,
      preset: presetUsed,
      improvements,
    };
  }

  /**
   * Batch enhance multiple photos
   */
  async batchEnhance(input: BatchTuneInput): Promise<BatchTuneResult> {
    const results: PhotoTuneResult[] = [];
    let failedCount = 0;

    for (const image of input.images) {
      try {
        const result = await this.enhancePhoto({
          imageUrl: image.url,
          preset: input.preset,
          category: image.category,
        });
        results.push(result);
      } catch (error) {
        logger.error('Failed to enhance image:', error);
        failedCount++;
      }
    }

    return {
      results,
      totalProcessed: input.images.length,
      failedCount,
    };
  }

  /**
   * Analyze image and suggest optimal settings
   */
  async analyzeAndSuggestSettings(
    imageUrl: string,
    category?: PhotoCategory
  ): Promise<EnhancementSettings> {
    // Use AI to analyze the image
    const prompt = `Analyze this auto shop marketing image and suggest optimal enhancement settings.
${category ? `Image category: ${category}` : ''}

Consider:
- Current brightness and exposure
- Color balance and saturation
- Clarity and sharpness needs
- Any noise or quality issues

Provide settings as JSON with values from -100 to 100 (0 is no change):
{
  "brightness": number,
  "contrast": number,
  "saturation": number,
  "sharpness": number (0-100),
  "highlights": number,
  "shadows": number,
  "warmth": number,
  "vibrance": number,
  "clarity": number (0-100),
  "denoise": number (0-100)
}`;

    try {
      const response = await geminiService.analyzeImage(imageUrl, prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const suggested = JSON.parse(jsonMatch[0]);
        return mergeSettings(DEFAULT_SETTINGS, suggested);
      }
    } catch (error) {
      logger.error('Failed to analyze image:', error);
    }

    // Fall back to category-specific preset or auto-enhance
    if (category && CATEGORY_RECOMMENDATIONS[category]) {
      const recommendedPreset = CATEGORY_RECOMMENDATIONS[category].recommendedPresets[0];
      return ENHANCEMENT_PRESETS[recommendedPreset].settings;
    }

    return ENHANCEMENT_PRESETS['auto-enhance'].settings;
  }

  /**
   * Create a before/after comparison image
   */
  async createBeforeAfter(
    originalUrl: string,
    enhancedUrl: string
  ): Promise<string> {
    // Use image generation to create side-by-side comparison
    const comparisonPrompt = `Create a professional before/after comparison image showing the original on the left labeled "Before" and the enhanced version on the right labeled "After". Use a clean dividing line in the middle. Add subtle labels at the bottom of each side.`;

    const comparison = await imageGenService.generateImage({
      prompt: comparisonPrompt,
      aspectRatio: '16:9',
      style: 'photographic',
    });

    return comparison.url;
  }

  /**
   * Get tips for a specific photo category
   */
  getTipsForCategory(category: PhotoCategory): string[] {
    return CATEGORY_RECOMMENDATIONS[category]?.tips || [];
  }

  /**
   * Preview settings without saving
   */
  async previewSettings(
    imageUrl: string,
    settings: Partial<EnhancementSettings>
  ): Promise<{ previewUrl: string }> {
    const fullSettings = mergeSettings(DEFAULT_SETTINGS, settings);

    const preview = await imageGenService.enhanceImage(imageUrl, {
      adjustments: {
        brightness: fullSettings.brightness,
        contrast: fullSettings.contrast,
        saturation: fullSettings.saturation,
        sharpness: fullSettings.sharpness,
      },
      preview: true,
    });

    return { previewUrl: preview.url };
  }

  /**
   * Describe what improvements were made
   */
  private describeImprovements(settings: EnhancementSettings): string[] {
    const improvements: string[] = [];

    if (settings.brightness > 5) improvements.push('Brightened image');
    if (settings.brightness < -5) improvements.push('Reduced brightness');

    if (settings.contrast > 10) improvements.push('Enhanced contrast');
    if (settings.contrast < -10) improvements.push('Softened contrast');

    if (settings.saturation > 10) improvements.push('Boosted colors');
    if (settings.saturation < -10) improvements.push('Reduced saturation');

    if (settings.sharpness > 15) improvements.push('Increased sharpness');

    if (settings.highlights < -10) improvements.push('Recovered highlights');
    if (settings.shadows > 10) improvements.push('Opened up shadows');

    if (settings.warmth > 10) improvements.push('Added warmth');
    if (settings.warmth < -10) improvements.push('Cooled tones');

    if (settings.vibrance > 10) improvements.push('Enhanced vibrance');

    if (settings.clarity > 15) improvements.push('Improved clarity');

    if (settings.denoise > 10) improvements.push('Reduced noise');

    if (improvements.length === 0) {
      improvements.push('Minor adjustments applied');
    }

    return improvements;
  }
}

export const photoTunerService = new PhotoTunerService();
