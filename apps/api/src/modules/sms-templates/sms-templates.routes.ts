/**
 * SMS Templates Routes
 * API endpoints for SMS template management and generation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { smsTemplatesService } from './sms-templates.service';
import { SMSCategory, GenerateSMSInput } from './sms-templates.types';

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(tenantContext);

/**
 * GET /api/v1/tools/sms-templates
 * Get all pre-built SMS templates
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = smsTemplatesService.getAllTemplates();
    res.json({ templates });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/sms-templates/categories
 * Get all SMS categories with counts
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = smsTemplatesService.getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/sms-templates/category/:category
 * Get templates by category
 */
router.get('/category/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.params.category as SMSCategory;
    const templates = smsTemplatesService.getTemplatesByCategory(category);
    res.json({ templates });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/sms-templates/:id
 * Get a single template by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = smsTemplatesService.getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ template });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/sms-templates/fill
 * Fill a template with variables
 */
router.post('/fill', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateId, variables } = req.body;

    if (!templateId || !variables) {
      return res.status(400).json({ error: 'templateId and variables are required' });
    }

    const result = smsTemplatesService.fillTemplate(templateId, variables);
    if (!result) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/sms-templates/generate
 * Generate a custom SMS message using AI
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: GenerateSMSInput = req.body;

    if (!input.category || !input.context) {
      return res.status(400).json({ error: 'category and context are required' });
    }

    const result = await smsTemplatesService.generateCustomSMS(input);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/sms-templates/variations
 * Generate multiple SMS variations for A/B testing
 */
router.post('/variations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { input, count } = req.body;

    if (!input?.category || !input?.context) {
      return res.status(400).json({ error: 'input with category and context is required' });
    }

    const variations = await smsTemplatesService.generateVariations(input, count || 3);
    res.json({ variations });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/sms-templates/optimize
 * Optimize an existing SMS message
 */
router.post('/optimize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, goal } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const validGoals = ['shorter', 'clearer', 'urgent'];
    const optimizeGoal = validGoals.includes(goal) ? goal : 'shorter';

    const result = await smsTemplatesService.optimizeMessage(message, optimizeGoal);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/sms-templates/compliance
 * Check message for compliance issues
 */
router.post('/compliance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const result = smsTemplatesService.checkCompliance(message);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/sms-templates/send-times/:category
 * Get suggested send times for a category
 */
router.get('/send-times/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.params.category as SMSCategory;
    const suggestions = smsTemplatesService.getSuggestedSendTimes(category);
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

export default router;
