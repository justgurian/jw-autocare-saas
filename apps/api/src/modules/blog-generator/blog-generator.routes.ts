/**
 * Blog Generator Routes
 * API endpoints for blog content generation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { blogGeneratorService } from './blog-generator.service';
import { BlogCategory, BlogGenerationInput } from './blog-generator.types';

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/blog-generator/categories
 * Get all blog categories with descriptions
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = blogGeneratorService.getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/blog-generator/keywords/:category
 * Get SEO keyword suggestions for a category
 */
router.get('/keywords/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.params.category as BlogCategory;
    const keywords = blogGeneratorService.getKeywordSuggestions(category);
    res.json({ keywords });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/blog-generator/ideas
 * Generate blog post ideas for a category
 */
router.post('/ideas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, count } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'category is required' });
    }

    const ideas = await blogGeneratorService.generateIdeas(category, count || 5);
    res.json({ ideas });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/blog-generator/outline
 * Generate a blog post outline
 */
router.post('/outline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: BlogGenerationInput = req.body;

    if (!input.topic || !input.category || !input.length) {
      return res.status(400).json({ error: 'topic, category, and length are required' });
    }

    const outline = await blogGeneratorService.generateOutline(input);
    res.json({ outline });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/blog-generator/generate
 * Generate a complete blog post
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: BlogGenerationInput = req.body;

    if (!input.topic || !input.category || !input.length) {
      return res.status(400).json({ error: 'topic, category, and length are required' });
    }

    // Set defaults
    input.tone = input.tone || 'conversational';
    input.includeCallToAction = input.includeCallToAction ?? true;

    const blog = await blogGeneratorService.generateBlog(input);
    res.json({ blog });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/blog-generator/optimize-seo
 * Optimize existing content for SEO
 */
router.post('/optimize-seo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, targetKeywords } = req.body;

    if (!content || !targetKeywords || !targetKeywords.length) {
      return res.status(400).json({ error: 'content and targetKeywords are required' });
    }

    const result = await blogGeneratorService.optimizeForSEO(content, targetKeywords);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/blog-generator/meta-description
 * Generate a meta description
 */
router.post('/meta-description', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    const metaDescription = await blogGeneratorService.generateMetaDescription(title, content);
    res.json({ metaDescription });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/blog-generator/internal-links/:category
 * Get internal linking suggestions
 */
router.get('/internal-links/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.params.category as BlogCategory;
    const suggestions = blogGeneratorService.suggestInternalLinks(category);
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

export default router;
