/**
 * Auto Repair Meme Styles
 * Meme templates designed for auto repair shop marketing
 */

export interface MemeStyle {
  id: string;
  name: string;
  description: string;
  category: 'relatable' | 'educational' | 'seasonal' | 'promotional';
  previewEmoji: string;
  imagePrompt: {
    format: string;
    style: string;
    elements: string;
    textPlacement: string;
    mood: string;
  };
  topicSuggestions: string[];
}

export const MEME_STYLES: MemeStyle[] = [
  // RELATABLE MEMES
  {
    id: 'check-engine-denial',
    name: 'Check Engine Denial',
    description: 'The classic "ignoring the check engine light" meme',
    category: 'relatable',
    previewEmoji: '🙈',
    imagePrompt: {
      format: 'Two-panel or reaction meme format',
      style: 'Cartoon illustration style, expressive characters, bold outlines, vibrant colors',
      elements: 'Car dashboard with glowing check engine light, worried/relaxed driver expressions, speech bubbles',
      textPlacement: 'Bold white text with black outline at top and bottom',
      mood: 'Humorous, relatable, slightly self-deprecating',
    },
    topicSuggestions: [
      'Ignoring warning lights',
      'Turning up the radio to ignore car noises',
      'Hoping the problem fixes itself',
    ],
  },
  {
    id: 'mechanic-face',
    name: 'Mechanic Face',
    description: 'The look mechanics give when they see DIY repairs',
    category: 'relatable',
    previewEmoji: '😬',
    imagePrompt: {
      format: 'Single panel reaction meme with expressive mechanic character',
      style: 'Exaggerated cartoon style, comic book aesthetic, dramatic expressions',
      elements: 'Mechanic character in work clothes, tools, garage background, dramatic lighting',
      textPlacement: 'Large impact font at top describing the situation',
      mood: 'Shocked, amused, professional concern',
    },
    topicSuggestions: [
      'Duct tape repairs',
      'YouTube mechanic attempts',
      'Wrong oil in engine',
      'Zip ties holding bumper',
    ],
  },
  {
    id: 'before-after-service',
    name: 'Before & After',
    description: 'Dramatic before/after car service transformation',
    category: 'promotional',
    previewEmoji: '✨',
    imagePrompt: {
      format: 'Side-by-side split panel comparison',
      style: 'Clean, professional with slight cartoon enhancement, high contrast',
      elements: 'Sad/tired car on left, happy/shiny car on right, sparkle effects, transformation arrows',
      textPlacement: 'Labels above each panel, tagline at bottom',
      mood: 'Satisfying, transformation, professional pride',
    },
    topicSuggestions: [
      'Oil change transformation',
      'Detail service results',
      'Brake service before/after',
      'Engine cleaning',
    ],
  },
  {
    id: 'car-owner-vs-mechanic',
    name: 'Car Owner vs Mechanic',
    description: 'What car owners think vs what mechanics see',
    category: 'relatable',
    previewEmoji: '🤔',
    imagePrompt: {
      format: 'Two-panel comparison meme, left vs right',
      style: 'Contrasting styles - simple/naive on left, detailed/realistic on right',
      elements: 'Simple car drawing vs complex mechanical diagram, thought bubbles, character reactions',
      textPlacement: 'Header text for each panel, explanatory caption',
      mood: 'Educational humor, gentle ribbing, expertise showcase',
    },
    topicSuggestions: [
      'Simple noise vs major repair',
      'Quick fix expectations',
      'Parts cost reality',
      'Time estimates',
    ],
  },
  {
    id: 'seasonal-car-problems',
    name: 'Seasonal Struggles',
    description: 'Weather-related car problems everyone relates to',
    category: 'seasonal',
    previewEmoji: '🌡️',
    imagePrompt: {
      format: 'Single panel scene with weather elements',
      style: 'Cartoon illustration, exaggerated weather effects, expressive vehicle',
      elements: 'Anthropomorphized car, weather elements (sun, snow, rain), dramatic environment',
      textPlacement: 'Bold caption above or below the scene',
      mood: 'Relatable frustration, seasonal humor',
    },
    topicSuggestions: [
      'Summer AC struggles',
      'Winter wont start',
      'Monsoon wipers needed',
      'Dead battery in cold',
    ],
  },
  {
    id: 'diy-vs-pro',
    name: 'DIY vs Pro',
    description: 'Amateur attempts vs professional results',
    category: 'educational',
    previewEmoji: '🔧',
    imagePrompt: {
      format: 'Expectation vs Reality split panel',
      style: 'Left side messy/chaotic, right side clean/professional',
      elements: 'Tools scattered vs organized, frustrated DIYer vs confident mechanic, damaged vs fixed',
      textPlacement: 'Expectation/Reality labels, shop branding at bottom',
      mood: 'Humorous comparison, professional value proposition',
    },
    topicSuggestions: [
      'Oil change attempt',
      'Brake pad replacement',
      'Tire rotation',
      'Battery replacement',
    ],
  },
  {
    id: 'car-talking',
    name: 'If Cars Could Talk',
    description: 'What your car would say if it could speak',
    category: 'relatable',
    previewEmoji: '🚗💬',
    imagePrompt: {
      format: 'Comic style with speech bubble from car',
      style: 'Anthropomorphized car with expressive headlights as eyes, cartoon style',
      elements: 'Car with face/expressions, large speech bubble, garage or road background',
      textPlacement: 'Speech bubble with main text, small caption for context',
      mood: 'Funny, personified, guilt-inducing humor',
    },
    topicSuggestions: [
      'Overdue oil change',
      'Bald tires complaint',
      'Strange noise explanation',
      'Maintenance reminder',
    ],
  },
  {
    id: 'customer-classic',
    name: 'Customer Classics',
    description: 'Things mechanics hear every day',
    category: 'relatable',
    previewEmoji: '🗣️',
    imagePrompt: {
      format: 'Quote-style meme with reaction image',
      style: 'Clean design with large quote text, small reaction illustration',
      elements: 'Large quotation marks, customer silhouette, mechanic reaction face',
      textPlacement: 'Large quote in center, reaction below',
      mood: 'Industry humor, knowing smile, relatable for both sides',
    },
    topicSuggestions: [
      'It just started making that noise',
      'My friend says its an easy fix',
      'Can you just look at it real quick',
      'I think I just need an oil change',
    ],
  },
  {
    id: 'proud-mechanic',
    name: 'Mechanic Pride',
    description: 'The satisfaction of a job well done',
    category: 'promotional',
    previewEmoji: '💪',
    imagePrompt: {
      format: 'Heroic pose or achievement unlocked style',
      style: 'Dynamic, slightly dramatic, professional pride aesthetic',
      elements: 'Mechanic in heroic stance, fixed car, satisfied customer, achievement graphics',
      textPlacement: 'Bold achievement text, shop branding prominent',
      mood: 'Pride, satisfaction, professional excellence',
    },
    topicSuggestions: [
      'Complex repair completed',
      'Customer car saved',
      'Impossible fix achieved',
      'Record service time',
    ],
  },
  {
    id: 'procrastination-station',
    name: 'Procrastination Station',
    description: 'Putting off car maintenance until disaster',
    category: 'relatable',
    previewEmoji: '⏰',
    imagePrompt: {
      format: 'Timeline or progression meme showing escalation',
      style: 'Comic strip style, escalating chaos, expressive characters',
      elements: 'Calendar/clock elements, progressively worse car condition, panic at the end',
      textPlacement: 'Time labels for each stage, punchline at bottom',
      mood: 'Cautionary humor, relatable procrastination',
    },
    topicSuggestions: [
      'Oil change overdue progression',
      'Brake squeak to brake fail',
      'Small leak to big problem',
      'Tire wear timeline',
    ],
  },
];

// Get meme style by ID
export function getMemeStyle(id: string): MemeStyle | undefined {
  return MEME_STYLES.find(style => style.id === id);
}

// Get meme styles by category
export function getMemeStylesByCategory(category: MemeStyle['category']): MemeStyle[] {
  return MEME_STYLES.filter(style => style.category === category);
}

// Build meme generation prompt
export function buildMemePrompt(
  style: MemeStyle,
  content: {
    topic: string;
    customText?: string;
    businessName?: string;
    tagline?: string;
  }
): string {
  const { imagePrompt } = style;

  return `Create a VIRAL-WORTHY MEME IMAGE for an auto repair shop's social media marketing.

=== MEME CONCEPT ===
Style: "${style.name}" - ${style.description}
Topic: ${content.topic}
${content.customText ? `Caption/Text: "${content.customText}"` : ''}

=== VISUAL DESIGN SPECIFICATIONS ===

LAYOUT FORMAT:
${imagePrompt.format}

ARTISTIC STYLE:
${imagePrompt.style}
- Use BOLD, SATURATED COLORS that pop on social media
- High contrast between elements for visual impact
- Clean, crisp lines and professional illustration quality
- Modern meme aesthetic that feels current and trendy

KEY VISUAL ELEMENTS TO INCLUDE:
${imagePrompt.elements}
- Automotive theme: cars, tools, garage setting, mechanical parts
- Expressive cartoon characters (NOT realistic humans)
- Dynamic composition with energy and movement

TEXT DESIGN (CRITICAL):
${imagePrompt.textPlacement}
- Text must be EXTREMELY LARGE and BOLD - readable even as a thumbnail
- Use classic meme fonts: Impact, bold sans-serif, or stylized block letters
- WHITE TEXT with THICK BLACK OUTLINE for maximum readability
- Text should take up significant portion of the image
- Caption placement should follow established meme conventions

MOOD & TONE:
${imagePrompt.mood}
- This should make car owners LAUGH and want to SHARE
- Relatable humor that mechanics and customers both appreciate
- Professional enough for a business to post proudly

${content.businessName ? `
BRANDING:
- Business: "${content.businessName}"
${content.tagline ? `- Tagline: "${content.tagline}"` : ''}
- Include subtle branding - small logo placement or business name in corner
- Don't make it feel like an ad - meme first, branding second
` : ''}

=== QUALITY REQUIREMENTS ===
- This will be posted on Instagram, Facebook, Twitter by a REAL BUSINESS
- Must look professionally designed, not amateur or cheap
- Should generate engagement: likes, comments, shares, tags
- The humor should land immediately - no explanation needed
- Image quality: crisp, clean, high resolution appearance

=== ABSOLUTELY DO NOT INCLUDE ===
- Realistic photographs or human faces
- Copyrighted characters (create ORIGINAL cartoon characters)
- Offensive, crude, or inappropriate content
- Tiny text that's hard to read
- Cluttered or confusing layouts
- Watermarks or stock photo artifacts
- Generic clip-art style graphics

Generate a scroll-stopping, shareable automotive meme that balances HUMOR with PROFESSIONALISM.
Aspect ratio: 1:1 (square format for social media)`;
}

// Get random topic suggestion for a style
export function getRandomTopicForStyle(styleId: string): string {
  const style = getMemeStyle(styleId);
  if (!style || style.topicSuggestions.length === 0) {
    return 'Car maintenance reminder';
  }
  return style.topicSuggestions[Math.floor(Math.random() * style.topicSuggestions.length)];
}

export default MEME_STYLES;
