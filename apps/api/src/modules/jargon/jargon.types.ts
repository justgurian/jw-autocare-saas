/**
 * Jargon Generator Types
 * Translates auto repair terminology into customer-friendly language
 */

export type TranslationMode = 'simplify' | 'explain' | 'estimate' | 'email';

export interface JargonInput {
  text: string;
  mode: TranslationMode;
  context?: 'repair' | 'maintenance' | 'estimate' | 'general';
  includeAnalogy?: boolean;
  audienceLevel?: 'novice' | 'intermediate' | 'informed';
}

export interface JargonResult {
  original: string;
  translated: string;
  keyTerms?: Array<{
    term: string;
    explanation: string;
    analogy?: string;
  }>;
  suggestedPrice?: string;
  timeEstimate?: string;
}

// Common auto repair terms and their translations
export const AUTO_TERMS: Record<string, { simple: string; explanation: string; analogy?: string }> = {
  'timing belt': {
    simple: 'engine timing belt',
    explanation: 'A rubber belt that synchronizes your engine components to run smoothly',
    analogy: 'Like a conductor keeping an orchestra in sync',
  },
  'brake pads': {
    simple: 'brake pads',
    explanation: 'The parts that press against your wheels to slow down your car',
    analogy: 'Like the rubber eraser on the end of a pencil',
  },
  'transmission': {
    simple: 'gearbox',
    explanation: 'The system that transfers power from your engine to your wheels',
    analogy: 'Like the gears on a bicycle',
  },
  'catalytic converter': {
    simple: 'emissions cleaner',
    explanation: 'A device that reduces harmful exhaust emissions from your engine',
    analogy: 'Like a filter that cleans the air before it leaves your car',
  },
  'alternator': {
    simple: 'battery charger',
    explanation: 'The part that charges your battery while you drive',
    analogy: 'Like a phone charger for your car battery',
  },
  'serpentine belt': {
    simple: 'engine belt',
    explanation: 'A single belt that powers multiple engine accessories',
    analogy: 'Like a rubber band connecting multiple pulleys',
  },
  'cv joint': {
    simple: 'wheel joint',
    explanation: 'A joint that allows your wheels to turn while receiving power',
    analogy: 'Like your knee joint - bends but still supports weight',
  },
  'struts': {
    simple: 'suspension struts',
    explanation: 'Parts that absorb bumps and keep your tires on the road',
    analogy: 'Like shock absorbers in your shoes',
  },
  'thermostat': {
    simple: 'engine temperature regulator',
    explanation: 'Controls the flow of coolant to maintain proper engine temperature',
    analogy: 'Like your home thermostat but for your engine',
  },
  'radiator': {
    simple: 'engine cooler',
    explanation: 'Removes heat from your engine coolant to prevent overheating',
    analogy: 'Like a fan cooling down hot soup',
  },
};

// Build translation prompt
export function buildTranslationPrompt(input: JargonInput): string {
  const modeInstructions: Record<TranslationMode, string> = {
    simplify: `Translate this auto repair text into simple, customer-friendly language.
Avoid technical jargon. Explain what the customer needs to know without overwhelming them.
Keep it brief and reassuring.`,
    explain: `Provide a detailed but accessible explanation of this auto repair text.
Include what the parts do, why the repair is needed, and what happens if not addressed.
Use analogies to everyday objects when helpful.`,
    estimate: `Convert this repair description into a professional estimate explanation.
Include what will be done, why it is needed, and set realistic expectations.
Be transparent and build trust.`,
    email: `Convert this repair information into a professional customer email.
Be warm, clear, and professional. Explain the situation without causing alarm.
Include next steps and invite questions.`,
  };

  return `${modeInstructions[input.mode]}

Context: ${input.context || 'general'} auto repair
Audience: ${input.audienceLevel || 'novice'} car owner
${input.includeAnalogy ? 'Include helpful analogies to everyday objects.' : ''}

Original text:
"${input.text}"

Provide the translation in a friendly, professional tone.`;
}
