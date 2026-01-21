/**
 * Jargon Generator Routes
 * API endpoints for terminology translation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { jargonService } from './jargon.service';
import { JargonInput, AUTO_TERMS } from './jargon.types';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

/**
 * POST /translate
 * Translate technical text to customer-friendly language
 */
router.post('/translate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = req.body as JargonInput;

    if (!input.text || input.text.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Text is required',
      });
    }

    if (!input.mode) {
      input.mode = 'simplify';
    }

    const result = await jargonService.translate(input);

    res.json({ result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /estimate
 * Generate customer-friendly estimate explanation
 */
router.post('/estimate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { repairs } = req.body as {
      repairs: Array<{ name: string; description: string; price?: number }>;
    };

    if (!repairs || repairs.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'At least one repair is required',
      });
    }

    const explanation = await jargonService.generateEstimate(repairs);

    res.json({ explanation });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dictionary
 * Get the term dictionary
 */
router.get('/dictionary', async (_req: Request, res: Response) => {
  const dictionary = jargonService.getTermDictionary();

  res.json({
    terms: Object.entries(dictionary).map(([term, data]) => ({
      term,
      ...data,
    })),
    count: Object.keys(dictionary).length,
  });
});

/**
 * GET /lookup/:term
 * Look up a specific term
 */
router.get('/lookup/:term', async (req: Request, res: Response) => {
  const { term } = req.params;
  const definition = jargonService.lookupTerm(term);

  if (!definition) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Term "${term}" not found in dictionary`,
    });
  }

  res.json({
    term,
    ...definition,
  });
});

/**
 * GET /modes
 * Get available translation modes
 */
router.get('/modes', async (_req: Request, res: Response) => {
  res.json({
    modes: [
      { id: 'simplify', name: 'Simplify', description: 'Convert to plain language' },
      { id: 'explain', name: 'Explain', description: 'Detailed explanation with analogies' },
      { id: 'estimate', name: 'Estimate', description: 'Professional estimate format' },
      { id: 'email', name: 'Email', description: 'Customer communication email' },
    ],
  });
});

export default router;
