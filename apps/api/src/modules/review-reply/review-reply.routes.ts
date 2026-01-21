/**
 * Review Reply Routes
 * API endpoints for AI-powered review response generation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { reviewReplyService } from './review-reply.service';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * POST /api/v1/tools/review-reply/generate
 * Generate a reply for a customer review
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const {
      reviewText,
      reviewerName,
      starRating,
      platform,
      tone,
      includeOffer,
      includeInviteBack,
      mentionService,
      customPoints,
    } = req.body;

    // Validate required fields
    if (!reviewText || typeof reviewText !== 'string' || reviewText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Review text is required',
      });
    }

    // Validate star rating if provided
    if (starRating !== undefined && (starRating < 1 || starRating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Star rating must be between 1 and 5',
      });
    }

    // Validate tone if provided
    const validTones = ['professional', 'friendly', 'apologetic', 'grateful', 'empathetic'];
    if (tone && !validTones.includes(tone)) {
      return res.status(400).json({
        success: false,
        error: `Invalid tone. Valid options: ${validTones.join(', ')}`,
      });
    }

    logger.info('Review reply generation requested', {
      tenantId,
      userId,
      platform,
      starRating,
    });

    const result = await reviewReplyService.generateReply(tenantId, userId, {
      reviewText,
      reviewerName,
      starRating,
      platform,
      tone,
      includeOffer,
      includeInviteBack,
      mentionService,
      customPoints,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Review reply generation failed', { error });
    next(error);
  }
});

/**
 * POST /api/v1/tools/review-reply/analyze
 * Analyze a review without generating a response
 */
router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { reviewText, starRating } = req.body;

    if (!reviewText || typeof reviewText !== 'string' || reviewText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Review text is required',
      });
    }

    const analysis = await reviewReplyService.analyzeReview(reviewText, starRating);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/review-reply/regenerate
 * Regenerate a reply with a different tone
 */
router.post('/regenerate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const {
      reviewText,
      reviewerName,
      starRating,
      platform,
      newTone,
      includeOffer,
      includeInviteBack,
      mentionService,
      customPoints,
    } = req.body;

    if (!reviewText) {
      return res.status(400).json({
        success: false,
        error: 'Review text is required',
      });
    }

    const validTones = ['professional', 'friendly', 'apologetic', 'grateful', 'empathetic'];
    if (!newTone || !validTones.includes(newTone)) {
      return res.status(400).json({
        success: false,
        error: `Valid tone is required. Options: ${validTones.join(', ')}`,
      });
    }

    const result = await reviewReplyService.regenerateWithTone(
      tenantId,
      userId,
      {
        reviewText,
        reviewerName,
        starRating,
        platform,
        includeOffer,
        includeInviteBack,
        mentionService,
        customPoints,
      },
      newTone
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/review-reply/quick-responses
 * Get quick response templates
 */
router.get('/quick-responses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = reviewReplyService.getQuickResponses();

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/review-reply/history
 * Get reply history
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const history = await reviewReplyService.getHistory(tenantId, { limit });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/tools/review-reply/:id
 * Delete a reply from history
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const replyId = req.params.id;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    await reviewReplyService.deleteFromHistory(tenantId, replyId);

    res.json({
      success: true,
      message: 'Reply deleted from history',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
