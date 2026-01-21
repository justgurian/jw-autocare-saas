/**
 * Jargon Generator Service
 * Translates auto repair terminology into customer-friendly language
 */

import { geminiService } from '../../services/gemini.service';
import { logger } from '../../utils/logger';
import {
  JargonInput,
  JargonResult,
  AUTO_TERMS,
  buildTranslationPrompt,
} from './jargon.types';

export const jargonService = {
  /**
   * Translate technical auto text into customer-friendly language
   */
  async translate(input: JargonInput): Promise<JargonResult> {
    const prompt = buildTranslationPrompt(input);

    try {
      const result = await geminiService.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 500,
      });

      const translated = result.text?.trim() || input.text;

      // Extract key terms found in the original text
      const keyTerms = this.extractKeyTerms(input.text);

      logger.info('Jargon translation completed', { mode: input.mode });

      return {
        original: input.text,
        translated,
        keyTerms,
      };
    } catch (error) {
      logger.error('Jargon translation failed', { error });
      // Fallback to basic term replacement
      return this.basicTranslation(input);
    }
  },

  /**
   * Extract and explain key terms found in text
   */
  extractKeyTerms(text: string): JargonResult['keyTerms'] {
    const lowerText = text.toLowerCase();
    const foundTerms: JargonResult['keyTerms'] = [];

    for (const [term, data] of Object.entries(AUTO_TERMS)) {
      if (lowerText.includes(term)) {
        foundTerms.push({
          term,
          explanation: data.explanation,
          analogy: data.analogy,
        });
      }
    }

    return foundTerms;
  },

  /**
   * Basic translation using term dictionary (fallback)
   */
  basicTranslation(input: JargonInput): JargonResult {
    let translated = input.text;
    const keyTerms: JargonResult['keyTerms'] = [];

    for (const [term, data] of Object.entries(AUTO_TERMS)) {
      if (translated.toLowerCase().includes(term)) {
        // Don't replace the term, but add to key terms
        keyTerms.push({
          term,
          explanation: data.explanation,
          analogy: data.analogy,
        });
      }
    }

    return {
      original: input.text,
      translated,
      keyTerms,
    };
  },

  /**
   * Generate a customer-friendly estimate
   */
  async generateEstimate(
    repairs: Array<{ name: string; description: string; price?: number }>
  ): Promise<string> {
    const repairsList = repairs
      .map((r, i) => `${i + 1}. ${r.name}: ${r.description}${r.price ? ` - $${r.price}` : ''}`)
      .join('\n');

    const prompt = `Create a customer-friendly repair estimate explanation.

Repairs needed:
${repairsList}

Write a warm, professional explanation that:
1. Summarizes what needs to be done
2. Explains why each repair is important
3. Prioritizes by urgency (safety first, then performance, then convenience)
4. Reassures the customer about quality and value
5. Invites questions

Keep it concise but thorough.`;

    const result = await geminiService.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 600,
    });

    return result.text?.trim() || '';
  },

  /**
   * Get term definitions
   */
  getTermDictionary() {
    return AUTO_TERMS;
  },

  /**
   * Look up a specific term
   */
  lookupTerm(term: string): typeof AUTO_TERMS[string] | null {
    const lowerTerm = term.toLowerCase();
    return AUTO_TERMS[lowerTerm] || null;
  },
};

export default jargonService;
