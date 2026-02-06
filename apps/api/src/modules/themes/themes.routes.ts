/**
 * Theme Browser Routes
 * API endpoints for browsing and selecting themes
 */

import { Router, Request, Response } from 'express';
import { themeRegistry, THEME_CATEGORIES, ThemeDefinition } from '../../prompts/themes';
import { cache } from '../../services/redis.service';

const router = Router();

// Theme API response type
interface ThemeResponse {
  id: string;
  name: string;
  category: string;
  shortDescription?: string;
  previewColors?: string[];
  previewUrl?: string;
  compatibleTools: string[];
}

// Convert full theme to API response (lighter payload)
function toThemeResponse(theme: ThemeDefinition): ThemeResponse {
  return {
    id: theme.id,
    name: theme.name,
    category: theme.category,
    shortDescription: theme.shortDescription,
    previewColors: theme.previewColors,
    previewUrl: theme.previewUrl,
    compatibleTools: theme.compatibleTools,
  };
}

/**
 * GET /
 * Get all themes (paginated optional)
 */
router.get('/', async (req: Request, res: Response) => {
  const { category, tool, search, limit, offset } = req.query;

  // Build cache key from query params (themes are static, cache aggressively)
  const cacheKey = `themes:list:${category || ''}:${tool || ''}:${search || ''}:${limit || ''}:${offset || ''}`;

  const result = await cache(cacheKey, 3600, async () => {
    let themes = themeRegistry.getAllThemes();

    if (category && typeof category === 'string') {
      themes = themes.filter(t => t.category === category);
    }
    if (tool && typeof tool === 'string') {
      themes = themes.filter(t => t.compatibleTools.includes(tool));
    }
    if (search && typeof search === 'string') {
      themes = themeRegistry.searchThemes(search);
    }

    const totalCount = themes.length;
    const offsetNum = parseInt(offset as string, 10) || 0;
    const limitNum = parseInt(limit as string, 10) || 100;
    themes = themes.slice(offsetNum, offsetNum + limitNum);

    return {
      themes: themes.map(toThemeResponse),
      total: totalCount,
      offset: offsetNum,
      limit: limitNum,
    };
  });

  res.json(result);
});

/**
 * GET /categories
 * Get all theme categories with metadata
 */
router.get('/categories', async (_req: Request, res: Response) => {
  const result = await cache('themes:categories', 3600, async () => {
    const categories = THEME_CATEGORIES.map(cat => ({
      ...cat,
      count: themeRegistry.getThemesByCategory(cat.id).length,
    }));

    return {
      categories,
      total: themeRegistry.getThemeCount(),
    };
  });

  res.json(result);
});

/**
 * GET /featured
 * Get featured/recommended themes
 */
router.get('/featured', async (req: Request, res: Response) => {
  const count = parseInt(req.query.count as string, 10) || 8;
  const featured = themeRegistry.getFeaturedThemes(count);

  res.json({
    themes: featured.map(toThemeResponse),
  });
});

/**
 * GET /grouped
 * Get themes grouped by category
 */
router.get('/grouped', async (_req: Request, res: Response) => {
  const data = await cache('themes:grouped', 3600, async () => {
    const grouped = themeRegistry.getThemesGroupedByCategory();

    const result: Record<string, {
      category: typeof THEME_CATEGORIES[0];
      themes: ThemeResponse[];
    }> = {};

    for (const [categoryId, themes] of Object.entries(grouped)) {
      const categoryInfo = THEME_CATEGORIES.find(c => c.id === categoryId);
      result[categoryId] = {
        category: categoryInfo || { id: categoryId, name: categoryId, icon: '🎨', description: '' },
        themes: themes.map(toThemeResponse),
      };
    }

    return {
      grouped: result,
      totalThemes: themeRegistry.getThemeCount(),
    };
  });

  res.json(data);
});

/**
 * GET /random
 * Get random themes
 */
router.get('/random', async (req: Request, res: Response) => {
  const count = parseInt(req.query.count as string, 10) || 6;
  const exclude = req.query.exclude
    ? (req.query.exclude as string).split(',')
    : [];

  const random = themeRegistry.getRandomThemes(count, exclude);

  res.json({
    themes: random.map(toThemeResponse),
  });
});

/**
 * GET /:id
 * Get a specific theme by ID (full details)
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const theme = themeRegistry.getTheme(id);

  if (!theme) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Theme "${id}" not found`,
    });
  }

  // Return full theme details for single theme view
  res.json({
    theme: {
      ...toThemeResponse(theme),
      fullDescription: theme.fullDescription,
      imagePrompt: theme.imagePrompt,
      textPrompt: theme.textPrompt,
      mockupScenes: theme.mockupScenes,
    },
  });
});

/**
 * GET /category/:category
 * Get all themes in a specific category
 */
router.get('/category/:category', async (req: Request, res: Response) => {
  const { category } = req.params;
  const themes = themeRegistry.getThemesByCategory(category);
  const categoryInfo = THEME_CATEGORIES.find(c => c.id === category);

  if (themes.length === 0 && !categoryInfo) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Category "${category}" not found`,
    });
  }

  res.json({
    category: categoryInfo || { id: category, name: category, icon: '🎨', description: '' },
    themes: themes.map(toThemeResponse),
    count: themes.length,
  });
});

export default router;
