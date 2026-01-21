/**
 * Review Reply Types
 * Type definitions for AI-powered review response generation
 */

export type ReviewSentiment = 'positive' | 'negative' | 'neutral' | 'mixed';
export type ReviewPlatform = 'google' | 'yelp' | 'facebook' | 'other';
export type ResponseTone = 'professional' | 'friendly' | 'apologetic' | 'grateful' | 'empathetic';

export interface ReviewInput {
  // Review content
  reviewText: string;
  reviewerName?: string;
  starRating?: number; // 1-5

  // Platform info
  platform?: ReviewPlatform;

  // Response preferences
  tone?: ResponseTone;
  includeOffer?: boolean; // Include a make-it-right offer for negative reviews
  includeInviteBack?: boolean; // Include invitation to return

  // Custom mentions
  mentionService?: string; // e.g., "oil change", "brake repair"
  customPoints?: string[]; // Additional points to address
}

export interface ReviewAnalysis {
  sentiment: ReviewSentiment;
  keyPoints: string[];
  complaintsIdentified: string[];
  praisesIdentified: string[];
  suggestedTone: ResponseTone;
  urgency: 'high' | 'medium' | 'low';
}

export interface GeneratedReply {
  id: string;
  response: string;
  analysis: ReviewAnalysis;
  alternatives?: string[];
  tips?: string[];
}

export interface ReviewReplyHistory {
  id: string;
  tenantId: string;
  originalReview: string;
  generatedReply: string;
  platform?: string;
  starRating?: number;
  sentiment: ReviewSentiment;
  createdAt: Date;
}

// Response templates for different scenarios
export const RESPONSE_TEMPLATES = {
  positiveOpener: [
    'Thank you so much for your kind words, {name}!',
    'We really appreciate you taking the time to share your experience, {name}!',
    "Your review made our day, {name}! Thank you!",
    '{name}, thank you for this wonderful review!',
  ],

  negativeOpener: [
    '{name}, thank you for bringing this to our attention.',
    "We're sorry to hear about your experience, {name}.",
    '{name}, we appreciate your honest feedback.',
    'Thank you for sharing your concerns with us, {name}.',
  ],

  positiveCloser: [
    "We look forward to seeing you again soon!",
    "Thanks again for being a valued customer!",
    "See you next time!",
    "We're here whenever you need us!",
  ],

  negativeCloser: [
    "Please reach out to us directly so we can make this right.",
    "We'd love the opportunity to earn back your trust.",
    "Your satisfaction is our priority, and we hope to serve you better.",
    "Please contact us - we want to resolve this for you.",
  ],

  inviteBack: [
    "We hope to see you again soon!",
    "Please visit us again - we'd love to restore your confidence in us.",
    "We look forward to the opportunity to serve you again.",
  ],

  offer: [
    "We'd like to offer you a complimentary service inspection.",
    "Please allow us to make this right with a discount on your next visit.",
    "We want to resolve this - please contact us for a courtesy follow-up.",
  ],
};

/**
 * Analyze review sentiment and key points
 */
export function analyzeReviewLocally(review: string, starRating?: number): Partial<ReviewAnalysis> {
  const text = review.toLowerCase();

  // Simple sentiment detection
  const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'best', 'love', 'recommend', 'thank', 'professional', 'friendly', 'quick', 'honest', 'fair', 'helpful'];
  const negativeWords = ['terrible', 'awful', 'horrible', 'worst', 'never', 'rude', 'overcharged', 'expensive', 'slow', 'dishonest', 'rip', 'scam', 'incompetent', 'mistake', 'damage', 'broken', 'disappointed', 'frustrated'];

  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;

  let sentiment: ReviewSentiment = 'neutral';
  if (starRating) {
    if (starRating >= 4) sentiment = 'positive';
    else if (starRating <= 2) sentiment = 'negative';
    else sentiment = 'neutral';
  } else {
    if (positiveCount > negativeCount + 1) sentiment = 'positive';
    else if (negativeCount > positiveCount + 1) sentiment = 'negative';
    else if (positiveCount > 0 && negativeCount > 0) sentiment = 'mixed';
  }

  // Determine tone based on sentiment
  let suggestedTone: ResponseTone = 'professional';
  if (sentiment === 'positive') suggestedTone = 'grateful';
  else if (sentiment === 'negative') suggestedTone = 'empathetic';

  // Determine urgency
  let urgency: 'high' | 'medium' | 'low' = 'medium';
  if (sentiment === 'negative' && (starRating === 1 || negativeCount >= 3)) urgency = 'high';
  else if (sentiment === 'positive') urgency = 'low';

  return {
    sentiment,
    suggestedTone,
    urgency,
  };
}

/**
 * Build review analysis prompt
 */
export function buildAnalysisPrompt(review: string, starRating?: number): string {
  return `Analyze this customer review for an auto repair shop:

REVIEW:
"${review}"
${starRating ? `STAR RATING: ${starRating}/5` : ''}

Provide a JSON analysis with:
1. sentiment: "positive" | "negative" | "neutral" | "mixed"
2. keyPoints: Array of main points the customer is making
3. complaintsIdentified: Array of specific complaints (if any)
4. praisesIdentified: Array of specific praises (if any)
5. suggestedTone: Best tone for response ("professional" | "friendly" | "apologetic" | "grateful" | "empathetic")
6. urgency: How quickly this should be addressed ("high" | "medium" | "low")

Return ONLY valid JSON, no markdown or explanation.`;
}

/**
 * Build response generation prompt
 */
export function buildResponsePrompt(options: {
  review: string;
  reviewerName: string;
  starRating?: number;
  analysis: ReviewAnalysis;
  tone: ResponseTone;
  includeOffer: boolean;
  includeInviteBack: boolean;
  businessName: string;
  mentionService?: string;
  customPoints?: string[];
}): string {
  const {
    review,
    reviewerName,
    starRating,
    analysis,
    tone,
    includeOffer,
    includeInviteBack,
    businessName,
    mentionService,
    customPoints,
  } = options;

  return `Write a professional response to this customer review for ${businessName}, an auto repair shop.

ORIGINAL REVIEW:
"${review}"

REVIEWER NAME: ${reviewerName}
${starRating ? `STAR RATING: ${starRating}/5` : ''}

ANALYSIS:
- Sentiment: ${analysis.sentiment}
- Key concerns: ${analysis.complaintsIdentified.join(', ') || 'None'}
- Praises: ${analysis.praisesIdentified.join(', ') || 'None'}

RESPONSE REQUIREMENTS:
- Tone: ${tone}
- Length: 2-4 sentences (concise but thorough)
- Address the reviewer by name
${analysis.complaintsIdentified.length > 0 ? '- Acknowledge specific concerns raised' : ''}
${analysis.praisesIdentified.length > 0 ? '- Thank them for specific praise' : ''}
${includeOffer && analysis.sentiment === 'negative' ? '- Include an offer to make things right' : ''}
${includeInviteBack ? '- Include invitation to return' : ''}
${mentionService ? `- Reference the service they mentioned: ${mentionService}` : ''}
${customPoints?.length ? `- Also address: ${customPoints.join(', ')}` : ''}

IMPORTANT GUIDELINES:
- Be genuine, not robotic
- Never be defensive
- For negative reviews: apologize sincerely, take responsibility, offer resolution
- For positive reviews: express genuine gratitude, reinforce their experience
- Sign off with the shop name
- Do NOT include any contact information (phone, email, address)
- Keep the response under 100 words

Write the response directly, no quotes or markdown:`;
}

/**
 * Build alternative responses prompt
 */
export function buildAlternativesPrompt(
  originalResponse: string,
  tone: ResponseTone
): string {
  return `Generate 2 alternative versions of this review response with slightly different approaches:

ORIGINAL RESPONSE:
"${originalResponse}"

Requirements:
- Keep the same general message and tone (${tone})
- Vary the wording and sentence structure
- Same length (2-4 sentences)
- Don't add new information

Return as JSON array of 2 strings:
["alternative 1", "alternative 2"]`;
}
