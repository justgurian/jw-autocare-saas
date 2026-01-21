/**
 * Review Reply Service
 * Business logic for AI-powered review response generation
 */

import { prisma } from '../../db/client';
import { geminiService } from '../../services/gemini.service';
import { logger } from '../../utils/logger';
import {
  ReviewInput,
  ReviewAnalysis,
  GeneratedReply,
  ReviewReplyHistory,
  ReviewSentiment,
  ResponseTone,
  analyzeReviewLocally,
  buildAnalysisPrompt,
  buildResponsePrompt,
  buildAlternativesPrompt,
} from './review-reply.types';

export const reviewReplyService = {
  /**
   * Analyze a review and generate response
   */
  async generateReply(
    tenantId: string,
    userId: string,
    input: ReviewInput
  ): Promise<GeneratedReply> {
    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { brandKit: true },
    });

    const businessName = tenant?.name || 'Our Auto Shop';
    const reviewerName = input.reviewerName || 'Valued Customer';

    // Step 1: Analyze the review
    const analysis = await this.analyzeReview(input.reviewText, input.starRating);

    // Determine tone (use provided or suggested)
    const tone = input.tone || analysis.suggestedTone;

    // Step 2: Generate response
    const responsePrompt = buildResponsePrompt({
      review: input.reviewText,
      reviewerName,
      starRating: input.starRating,
      analysis,
      tone,
      includeOffer: input.includeOffer ?? (analysis.sentiment === 'negative'),
      includeInviteBack: input.includeInviteBack ?? true,
      businessName,
      mentionService: input.mentionService,
      customPoints: input.customPoints,
    });

    const responseResult = await geminiService.generateText(responsePrompt, {
      temperature: 0.7,
      maxTokens: 300,
    });

    const response = (responseResult.text || '').trim();

    // Step 3: Generate alternative responses
    let alternatives: string[] = [];
    try {
      const altPrompt = buildAlternativesPrompt(response, tone);
      const altResult = await geminiService.generateText(altPrompt, {
        temperature: 0.8,
        maxTokens: 500,
      });

      const jsonMatch = altResult.text?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        alternatives = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.warn('Failed to generate alternative responses', { error });
    }

    // Step 4: Generate tips for responding
    const tips = this.generateTips(analysis);

    // Step 5: Save to history
    const id = await this.saveToHistory(tenantId, userId, {
      originalReview: input.reviewText,
      generatedReply: response,
      platform: input.platform,
      starRating: input.starRating,
      sentiment: analysis.sentiment,
    });

    logger.info('Review reply generated', {
      tenantId,
      sentiment: analysis.sentiment,
      tone,
    });

    return {
      id,
      response,
      analysis,
      alternatives,
      tips,
    };
  },

  /**
   * Analyze a review using AI
   */
  async analyzeReview(reviewText: string, starRating?: number): Promise<ReviewAnalysis> {
    try {
      const prompt = buildAnalysisPrompt(reviewText, starRating);

      const result = await geminiService.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 500,
      });

      // Parse JSON response
      const jsonMatch = result.text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sentiment: parsed.sentiment || 'neutral',
          keyPoints: parsed.keyPoints || [],
          complaintsIdentified: parsed.complaintsIdentified || [],
          praisesIdentified: parsed.praisesIdentified || [],
          suggestedTone: parsed.suggestedTone || 'professional',
          urgency: parsed.urgency || 'medium',
        };
      }

      // Fallback to local analysis
      const localAnalysis = analyzeReviewLocally(reviewText, starRating);
      return {
        sentiment: localAnalysis.sentiment || 'neutral',
        keyPoints: [],
        complaintsIdentified: [],
        praisesIdentified: [],
        suggestedTone: localAnalysis.suggestedTone || 'professional',
        urgency: localAnalysis.urgency || 'medium',
      };
    } catch (error) {
      logger.warn('AI analysis failed, using local analysis', { error });

      const localAnalysis = analyzeReviewLocally(reviewText, starRating);
      return {
        sentiment: localAnalysis.sentiment || 'neutral',
        keyPoints: [],
        complaintsIdentified: [],
        praisesIdentified: [],
        suggestedTone: localAnalysis.suggestedTone || 'professional',
        urgency: localAnalysis.urgency || 'medium',
      };
    }
  },

  /**
   * Generate tips based on analysis
   */
  generateTips(analysis: ReviewAnalysis): string[] {
    const tips: string[] = [];

    if (analysis.sentiment === 'negative') {
      tips.push('Respond within 24-48 hours to show you take feedback seriously');
      tips.push('Consider following up privately to discuss resolution');
      if (analysis.urgency === 'high') {
        tips.push('This review needs immediate attention due to severity');
      }
    }

    if (analysis.sentiment === 'positive') {
      tips.push('Responding to positive reviews encourages more customers to leave reviews');
      tips.push('Consider asking if they would refer friends and family');
    }

    if (analysis.sentiment === 'mixed') {
      tips.push('Address both the concerns and the positive aspects');
      tips.push('Focus on turning this customer into a loyal advocate');
    }

    if (analysis.complaintsIdentified.length > 0) {
      tips.push('Specific complaints should be addressed point by point');
    }

    return tips;
  },

  /**
   * Regenerate response with different tone
   */
  async regenerateWithTone(
    tenantId: string,
    userId: string,
    input: ReviewInput,
    newTone: ResponseTone
  ): Promise<GeneratedReply> {
    return this.generateReply(tenantId, userId, {
      ...input,
      tone: newTone,
    });
  },

  /**
   * Save reply to history
   */
  async saveToHistory(
    tenantId: string,
    userId: string,
    data: {
      originalReview: string;
      generatedReply: string;
      platform?: string;
      starRating?: number;
      sentiment: ReviewSentiment;
    }
  ): Promise<string> {
    const content = await prisma.content.create({
      data: {
        tenantId,
        userId,
        tool: 'review_reply',
        contentType: 'text',
        title: `Review Reply - ${data.sentiment}`,
        caption: data.generatedReply,
        status: 'draft',
        moderationStatus: 'passed',
        metadata: {
          originalReview: data.originalReview,
          platform: data.platform,
          starRating: data.starRating,
          sentiment: data.sentiment,
        },
      },
    });

    return content.id;
  },

  /**
   * Get reply history
   */
  async getHistory(
    tenantId: string,
    options: { limit?: number } = {}
  ): Promise<ReviewReplyHistory[]> {
    const { limit = 50 } = options;

    const content = await prisma.content.findMany({
      where: {
        tenantId,
        tool: 'review_reply',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return content.map((c) => {
      const metadata = c.metadata as Record<string, unknown>;
      return {
        id: c.id,
        tenantId: c.tenantId,
        originalReview: (metadata.originalReview as string) || '',
        generatedReply: c.caption || '',
        platform: metadata.platform as string | undefined,
        starRating: metadata.starRating as number | undefined,
        sentiment: (metadata.sentiment as ReviewSentiment) || 'neutral',
        createdAt: c.createdAt,
      };
    });
  },

  /**
   * Delete a reply from history
   */
  async deleteFromHistory(tenantId: string, replyId: string): Promise<void> {
    const content = await prisma.content.findFirst({
      where: {
        id: replyId,
        tenantId,
        tool: 'review_reply',
      },
    });

    if (!content) {
      throw new Error('Reply not found');
    }

    await prisma.content.delete({
      where: { id: replyId },
    });

    logger.info('Deleted review reply from history', { tenantId, replyId });
  },

  /**
   * Quick response suggestions for common scenarios
   */
  getQuickResponses(): Array<{
    scenario: string;
    template: string;
  }> {
    return [
      {
        scenario: '5-star positive review',
        template:
          'Thank you so much for the wonderful review, {name}! We truly appreciate your kind words about {service}. Our team works hard to provide excellent service, and knowing we made your day makes it all worthwhile. We look forward to seeing you again soon!',
      },
      {
        scenario: '1-star complaint about wait time',
        template:
          "{name}, we sincerely apologize for the longer than expected wait time during your visit. This is not the experience we strive for, and we are taking steps to improve our scheduling. We would love the opportunity to make this right - please reach out to us directly.",
      },
      {
        scenario: '1-star complaint about pricing',
        template:
          '{name}, thank you for your feedback about our pricing. We understand repairs can be an unexpected expense, and we always aim to be transparent about costs before work begins. We would welcome the chance to review your invoice with you and ensure you understand the value of the work performed.',
      },
      {
        scenario: '3-star mixed review',
        template:
          'Thank you for taking the time to share your experience, {name}. We are glad {positive_aspect} met your expectations. We take your concerns about {negative_aspect} seriously and are working to improve. We hope you will give us another opportunity to exceed your expectations.',
      },
    ];
  },
};

export default reviewReplyService;
