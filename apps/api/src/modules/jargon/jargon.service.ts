/**
 * Jargon Generator Service
 * Translates auto repair terminology into customer-friendly language
 */

import { geminiService } from '../../services/gemini.service';
import { logger } from '../../utils/logger';
import {
  JargonInput,
  JargonResult,
  InvoiceAnalysisResult,
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

  /**
   * Analyze an invoice/receipt image and translate to layman's terms
   */
  async analyzeInvoiceImage(
    imageBase64: string,
    mimeType: string
  ): Promise<InvoiceAnalysisResult> {
    const prompt = `You are an expert auto mechanic helping a customer understand their repair invoice or receipt.

Analyze this auto repair invoice/receipt image and provide:

1. **WORK COMPLETED** - List each repair or service that was performed, explaining in simple layman's terms:
   - What the part/service is
   - What it does for the vehicle
   - Why it was needed

2. **WORK RECOMMENDED** - If there are any recommended future services or repairs mentioned, explain:
   - What each recommendation means
   - Why it might be needed
   - How urgent it is (immediate safety concern, soon, or can wait)

3. **COST BREAKDOWN** - If prices are visible:
   - Summarize the costs in a clear way
   - Note if the pricing seems reasonable (without being judgmental)

4. **KEY TERMS GLOSSARY** - Define any technical terms found on the invoice in simple language

Format your response as a JSON object with this structure:
{
  "workCompleted": [
    {
      "item": "Name of the repair/service",
      "simpleExplanation": "What this means in plain English",
      "whyNeeded": "Why this repair was necessary",
      "cost": "$XX.XX if visible"
    }
  ],
  "workRecommended": [
    {
      "item": "Name of recommended service",
      "simpleExplanation": "What this means",
      "urgency": "immediate|soon|can-wait",
      "reason": "Why it's recommended"
    }
  ],
  "totalCost": "$XX.XX if visible",
  "summary": "A friendly 2-3 sentence summary of what was done and the overall vehicle health",
  "glossary": [
    {
      "term": "Technical term",
      "definition": "Simple definition"
    }
  ]
}

Be friendly, reassuring, and focus on helping the customer understand their vehicle's needs without causing unnecessary worry.`;

    try {
      // Use Gemini's vision model to analyze the image
      const analysisText = await geminiService.analyzeImage(
        `data:${mimeType};base64,${imageBase64}`,
        prompt
      );

      logger.info('Invoice image analysis completed');

      // Try to parse the JSON response
      try {
        // Extract JSON from the response (might have markdown code blocks)
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            ...parsed,
          };
        }
      } catch (parseError) {
        logger.warn('Could not parse structured response, returning raw text', { parseError });
      }

      // Fallback: return the raw analysis as a summary
      return {
        success: true,
        workCompleted: [],
        workRecommended: [],
        summary: analysisText,
        glossary: [],
      };
    } catch (error) {
      logger.error('Invoice image analysis failed', { error });
      throw error;
    }
  },
};

export default jargonService;
