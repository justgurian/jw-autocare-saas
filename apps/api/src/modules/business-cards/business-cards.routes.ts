/**
 * Business Cards Routes
 * API endpoints for business card generation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { businessCardsService } from './business-cards.service';
import { CardGenerationInput } from './business-cards.types';

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/business-cards/styles
 * Get all available card styles
 */
router.get('/styles', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const styles = businessCardsService.getStyles();
    res.json({ styles });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/business-cards/styles/:id
 * Get a specific card style
 */
router.get('/styles/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const style = businessCardsService.getStyleById(req.params.id as any);
    if (!style) {
      return res.status(404).json({ error: 'Style not found' });
    }
    res.json({ style });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/business-cards/titles
 * Get common job titles
 */
router.get('/titles', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const titles = businessCardsService.getTitles();
    res.json({ titles });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/business-cards/certifications
 * Get available certifications
 */
router.get('/certifications', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const certifications = businessCardsService.getCertifications();
    res.json({ certifications });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/business-cards/generate
 * Generate a business card
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: CardGenerationInput = req.body;

    if (!input.staff?.name || !input.staff?.title || !input.shop?.name || !input.shop?.phone) {
      return res.status(400).json({
        error: 'Staff name, title, shop name, and shop phone are required',
      });
    }

    // Set defaults
    input.style = input.style || 'classic';
    input.orientation = input.orientation || 'horizontal';

    const result = await businessCardsService.generateCard(input);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/business-cards/variations
 * Generate multiple card variations
 */
router.post('/variations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { input, count } = req.body;

    if (!input?.staff?.name || !input?.staff?.title || !input?.shop?.name || !input?.shop?.phone) {
      return res.status(400).json({
        error: 'Staff name, title, shop name, and shop phone are required',
      });
    }

    const variations = await businessCardsService.generateVariations(input, count || 3);
    res.json({ variations });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/business-cards/suggest-content
 * Get content suggestions based on role
 */
router.post('/suggest-content', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, shopName } = req.body;

    if (!title || !shopName) {
      return res.status(400).json({ error: 'title and shopName are required' });
    }

    const suggestions = await businessCardsService.suggestContent(title, shopName);
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

export default router;
