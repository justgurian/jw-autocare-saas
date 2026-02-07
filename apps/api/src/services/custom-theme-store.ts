/**
 * Custom Theme Store — in-memory cache of admin-deployed custom themes
 * loaded from Content table (tool='style_cloner')
 */

import { prisma } from '../db/client';
import { logger } from '../utils/logger';
import type { ThemeDefinition, ThemeImagePrompt, ThemeTextPrompt } from '../prompts/themes';
import type { ExtractedStyle } from './style-cloner.service';

let cachedThemes: ThemeDefinition[] = [];
let lastRefresh = 0;
const CACHE_TTL = 60_000; // 1 minute

function contentToTheme(content: any): ThemeDefinition | null {
  try {
    const meta = content.metadata as Record<string, any>;
    if (!meta?.imagePrompt) return null;

    const style = meta as ExtractedStyle;

    return {
      id: `custom-${content.id}`,
      name: content.title || style.name || 'Custom Style',
      category: 'custom',
      previewUrl: meta.previewImageUrl || undefined,
      previewColors: style.previewColors || [],
      shortDescription: content.caption || style.shortDescription || '',
      fullDescription: style.shortDescription || '',
      imagePrompt: style.imagePrompt as ThemeImagePrompt,
      textPrompt: style.textPrompt as ThemeTextPrompt || { tone: 'professional', vocabulary: [] },
      mockupScenes: [],
      compatibleTools: ['promo_flyer'],
    };
  } catch (err) {
    logger.warn('Failed to convert content to custom theme', { contentId: content.id, error: err });
    return null;
  }
}

export const customThemeStore = {
  async refreshIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - lastRefresh < CACHE_TTL && cachedThemes.length > 0) return;

    try {
      const contents = await prisma.content.findMany({
        where: {
          tool: 'style_cloner',
          contentType: 'theme',
          status: 'approved',
        },
        orderBy: { createdAt: 'desc' },
      });

      cachedThemes = contents
        .map(contentToTheme)
        .filter((t): t is ThemeDefinition => t !== null);

      lastRefresh = now;
      logger.debug('Custom theme cache refreshed', { count: cachedThemes.length });
    } catch (err) {
      logger.error('Failed to refresh custom theme cache', { error: err });
    }
  },

  getAll(): ThemeDefinition[] {
    // Trigger async refresh but return what we have
    this.refreshIfNeeded().catch(() => {});
    return cachedThemes;
  },

  getById(id: string): ThemeDefinition | undefined {
    this.refreshIfNeeded().catch(() => {});
    return cachedThemes.find((t) => t.id === id);
  },

  async forceRefresh(): Promise<void> {
    lastRefresh = 0;
    await this.refreshIfNeeded();
  },
};
