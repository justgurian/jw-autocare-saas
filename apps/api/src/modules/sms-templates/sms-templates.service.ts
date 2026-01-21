/**
 * SMS Templates Service
 * AI-powered SMS generation and template management for auto shops
 */

import { geminiService } from '../../services/gemini.service';
import {
  SMSCategory,
  SMSTemplate,
  GenerateSMSInput,
  SMSResult,
  SMS_TEMPLATES,
  calculateSegments,
  fillTemplate,
} from './sms-templates.types';

class SMSTemplatesService {
  /**
   * Get all pre-built templates
   */
  getAllTemplates(): SMSTemplate[] {
    return SMS_TEMPLATES;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: SMSCategory): SMSTemplate[] {
    return SMS_TEMPLATES.filter((t) => t.category === category);
  }

  /**
   * Get a single template by ID
   */
  getTemplateById(id: string): SMSTemplate | undefined {
    return SMS_TEMPLATES.find((t) => t.id === id);
  }

  /**
   * Get all available categories with counts
   */
  getCategories(): Array<{ id: SMSCategory; name: string; count: number; description: string }> {
    const categories: Array<{ id: SMSCategory; name: string; description: string }> = [
      { id: 'reminder', name: 'Reminders', description: 'Appointment and maintenance reminders' },
      { id: 'promotion', name: 'Promotions', description: 'Special offers and discounts' },
      { id: 'follow-up', name: 'Follow-ups', description: 'Post-service and estimate follow-ups' },
      { id: 'appointment', name: 'Appointments', description: 'Booking confirmations and changes' },
      { id: 'thank-you', name: 'Thank You', description: 'Customer appreciation messages' },
      { id: 'seasonal', name: 'Seasonal', description: 'Weather and seasonal service reminders' },
    ];

    return categories.map((cat) => ({
      ...cat,
      count: SMS_TEMPLATES.filter((t) => t.category === cat.id).length,
    }));
  }

  /**
   * Fill a template with provided variables
   */
  fillTemplate(templateId: string, variables: Record<string, string>): SMSResult | null {
    const template = this.getTemplateById(templateId);
    if (!template) return null;

    const message = fillTemplate(template.template, variables);
    return {
      message,
      characterCount: message.length,
      segmentCount: calculateSegments(message),
      variables,
    };
  }

  /**
   * Generate a custom SMS message using AI
   */
  async generateCustomSMS(input: GenerateSMSInput): Promise<SMSResult> {
    const prompt = this.buildGenerationPrompt(input);

    const response = await geminiService.generateText(prompt);

    // Clean up the response and ensure it fits SMS constraints
    let message = this.cleanSMSMessage(response);

    // If too long, ask AI to shorten
    if (message.length > 160 && !input.includeLink) {
      message = await this.shortenMessage(message);
    }

    const variables: Record<string, string> = {};
    if (input.customerName) variables.name = input.customerName;
    if (input.serviceName) variables.service = input.serviceName;
    if (input.offerDetails) variables.offer = input.offerDetails;
    if (input.appointmentDate) variables.date = input.appointmentDate;

    return {
      message,
      characterCount: message.length,
      segmentCount: calculateSegments(message),
      variables,
    };
  }

  /**
   * Generate multiple SMS variations for A/B testing
   */
  async generateVariations(input: GenerateSMSInput, count: number = 3): Promise<SMSResult[]> {
    const results: SMSResult[] = [];
    const tones: Array<'friendly' | 'professional' | 'urgent'> = ['friendly', 'professional', 'urgent'];

    for (let i = 0; i < Math.min(count, 3); i++) {
      const variation = await this.generateCustomSMS({
        ...input,
        tone: tones[i] || input.tone,
      });
      results.push(variation);
    }

    return results;
  }

  /**
   * Optimize an existing message
   */
  async optimizeMessage(message: string, goal: 'shorter' | 'clearer' | 'urgent'): Promise<SMSResult> {
    const prompt = `Optimize this SMS message for auto shop marketing. Goal: make it ${goal}.

Original message: "${message}"

Requirements:
- Keep under 160 characters if possible
- Maintain the core message
- Use action words
- Be ${goal === 'urgent' ? 'compelling and time-sensitive' : goal === 'clearer' ? 'simple and easy to understand' : 'brief and punchy'}

Return ONLY the optimized message, no explanations.`;

    const optimized = await geminiService.generateText(prompt);
    const cleaned = this.cleanSMSMessage(optimized);

    return {
      message: cleaned,
      characterCount: cleaned.length,
      segmentCount: calculateSegments(cleaned),
      variables: {},
    };
  }

  /**
   * Check message for compliance issues
   */
  checkCompliance(message: string): {
    isCompliant: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for spam trigger words
    const spamWords = ['free', 'winner', 'congratulations', 'urgent', 'act now', 'limited time'];
    const lowerMessage = message.toLowerCase();
    spamWords.forEach((word) => {
      if (lowerMessage.includes(word)) {
        issues.push(`Contains potential spam trigger: "${word}"`);
      }
    });

    // Check for opt-out info
    if (!lowerMessage.includes('reply stop') && !lowerMessage.includes('text stop') && !lowerMessage.includes('opt out')) {
      suggestions.push('Consider adding opt-out instructions for marketing messages');
    }

    // Check for excessive caps
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (capsRatio > 0.3) {
      issues.push('Too many capital letters - may appear spammy');
    }

    // Check for excessive punctuation
    if ((message.match(/[!?]{2,}/g) || []).length > 0) {
      issues.push('Excessive punctuation may trigger spam filters');
    }

    // Check length
    if (message.length > 320) {
      issues.push('Message exceeds 2 segments - consider shortening');
    }

    return {
      isCompliant: issues.length === 0,
      issues,
      suggestions,
    };
  }

  /**
   * Suggest best send times based on category
   */
  getSuggestedSendTimes(category: SMSCategory): {
    bestDays: string[];
    bestTimes: string[];
    avoidTimes: string[];
  } {
    const suggestions: Record<SMSCategory, { bestDays: string[]; bestTimes: string[]; avoidTimes: string[] }> = {
      reminder: {
        bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
        bestTimes: ['9:00 AM', '2:00 PM'],
        avoidTimes: ['Before 8 AM', 'After 8 PM', 'Weekends'],
      },
      promotion: {
        bestDays: ['Tuesday', 'Thursday', 'Saturday'],
        bestTimes: ['10:00 AM', '12:00 PM', '6:00 PM'],
        avoidTimes: ['Monday morning', 'Friday evening'],
      },
      'follow-up': {
        bestDays: ['Monday', 'Tuesday', 'Wednesday'],
        bestTimes: ['10:00 AM', '3:00 PM'],
        avoidTimes: ['Before 9 AM', 'After 6 PM'],
      },
      appointment: {
        bestDays: ['Any day'],
        bestTimes: ['Business hours', '24 hours before appointment'],
        avoidTimes: ['After 8 PM', 'Before 7 AM'],
      },
      'thank-you': {
        bestDays: ['Same day as service', 'Next business day'],
        bestTimes: ['2:00 PM - 5:00 PM'],
        avoidTimes: ['Too early', 'Late at night'],
      },
      seasonal: {
        bestDays: ['Monday', 'Tuesday'],
        bestTimes: ['9:00 AM', '11:00 AM'],
        avoidTimes: ['Holidays', 'Weekends'],
      },
    };

    return suggestions[category];
  }

  /**
   * Build the AI generation prompt
   */
  private buildGenerationPrompt(input: GenerateSMSInput): string {
    const toneDescriptions = {
      friendly: 'warm, casual, and approachable',
      professional: 'formal, respectful, and business-like',
      urgent: 'compelling, time-sensitive, and action-oriented',
    };

    const categoryDescriptions = {
      reminder: 'remind customer about appointments or maintenance',
      promotion: 'promote special offers or discounts',
      'follow-up': 'follow up after service or estimate',
      appointment: 'confirm or manage appointments',
      'thank-you': 'express gratitude and appreciation',
      seasonal: 'promote seasonal services or weather-related maintenance',
    };

    return `Generate an SMS message for an auto repair shop.

Category: ${categoryDescriptions[input.category]}
Tone: ${toneDescriptions[input.tone || 'friendly']}
Context: ${input.context}
${input.customerName ? `Customer name: ${input.customerName}` : ''}
${input.serviceName ? `Service: ${input.serviceName}` : ''}
${input.offerDetails ? `Offer details: ${input.offerDetails}` : ''}
${input.appointmentDate ? `Appointment date: ${input.appointmentDate}` : ''}
${input.includeLink ? 'Include a placeholder for a link: {link}' : ''}

Requirements:
- Keep under ${input.includeLink ? '140' : '160'} characters if possible
- Use natural, conversational language
- Include a clear call-to-action
- Use {name} for customer name if personalization is needed
- Be concise but complete
- No hashtags or emojis unless specifically requested

Return ONLY the SMS message text, no explanations or quotes.`;
  }

  /**
   * Clean up AI-generated SMS message
   */
  private cleanSMSMessage(message: string): string {
    return message
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Shorten a message that's too long
   */
  private async shortenMessage(message: string): Promise<string> {
    const prompt = `Shorten this SMS message to under 160 characters while keeping the core message:

"${message}"

Return ONLY the shortened message, no explanations.`;

    const shortened = await geminiService.generateText(prompt);
    return this.cleanSMSMessage(shortened);
  }
}

export const smsTemplatesService = new SMSTemplatesService();
