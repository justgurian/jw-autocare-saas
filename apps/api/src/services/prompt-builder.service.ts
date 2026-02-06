/**
 * Prompt Builder Service
 * Shared image prompt construction for nostalgic automotive flyers.
 *
 * Phase 3 - Bayfiller Overhaul: Image Prompt Quality Upgrade
 *
 * Centralises the prompt that was previously duplicated in
 * promo-flyer.routes.ts and batch-flyer.routes.ts, and applies
 * upgraded quality instructions inspired by premium agency work.
 */

import { NostalgicThemeDefinition } from '../prompts/themes';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface NostalgicImagePromptOptions {
  headline: string;
  subject: string;
  details?: string;
  businessName?: string;
  logoInstructions?: string;
  vehiclePrompt?: string;
  logoPlacementHint?: string;
}

// ---------------------------------------------------------------------------
// Era-specific typography helper
// ---------------------------------------------------------------------------

function getEraTypographyDirective(theme: NostalgicThemeDefinition): string {
  const style = theme.style.toLowerCase();
  const era = theme.era;

  if (style.includes('comic')) {
    return 'Bold comic book lettering with halftone effects';
  }
  if (era === '1950s' || era === '1960s') {
    return 'Mid-century modern typography with atomic-age flair';
  }
  if (style.includes('movie') && (era === '1970s' || era === '1980s')) {
    return 'Glowing neon text with chrome or gradient effects';
  }
  // Advertising / magazine fallback
  return 'Hand-painted sign typography with weathered edges';
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

export function buildNostalgicImagePrompt(
  theme: NostalgicThemeDefinition,
  content: NostalgicImagePromptOptions,
): string {
  // Build logo placement section if hint provided
  const logoPlacementSection = content.logoPlacementHint
    ? `\n=== CRITICAL: LOGO PLACEMENT AREA ===\n${content.logoPlacementHint}\nDO NOT place text, important elements, or cluttered content in this area - the business logo will be placed there.\n`
    : '';

  const eraTypography = getEraTypographyDirective(theme);

  return `You are the creative director at a premium automotive advertising agency that has won multiple industry awards for print and social media campaigns.

=== OUTPUT ===
Create one finished, print-ready 1080x1350 (4:5) marketing flyer image.

=== CREATIVE DIRECTION ===
Create a promotional flyer in the "${theme.name}" style from the ${theme.era}.
This is a ${theme.style === 'comic-book' ? 'COMIC BOOK' : theme.style === 'movie-poster' ? 'MOVIE POSTER' : theme.style === 'advertising' ? 'CLASSIC ADVERTISING' : 'CAR MAGAZINE'} style design.

=== VISUAL STYLE SPECIFICATIONS ===
${theme.imagePrompt.style}

=== COLOR PALETTE ===
${theme.imagePrompt.colorPalette}
Colors must be saturated and high-contrast - this image competes for attention in a social media feed.

=== TYPOGRAPHY ===
${theme.imagePrompt.typography}
Era-specific direction: ${eraTypography}

TEXT RULES (non-negotiable):
- The business name MUST be the LARGEST text element - readable even at 200px phone thumbnail size.
- Use maximum 2 typeface families in the entire design.
- ALL text must have contrast backing: text shadows, solid color bars behind text, or gradient overlays. No text floating on busy backgrounds.
- Headline should be 3x larger than any secondary text.

=== DESIGN ELEMENTS ===
${theme.imagePrompt.elements}

=== MOOD & ATMOSPHERE ===
${theme.imagePrompt.mood}

=== CAR / VEHICLE STYLING ===
${theme.carStyle}
${content.vehiclePrompt || ''}

VEHICLE RENDERING:
- Show the vehicle at a dramatic 3/4 angle with professional automotive photography lighting.
- The car should look showroom-clean with visible reflections and highlights.

=== COMPOSITION & LAYOUT ===
${theme.composition}
${logoPlacementSection}
COMPOSITION RULES:
- One clear visual focal point - the featured vehicle or the main service element.
- At least 15% negative space for visual breathing room.
- Use the rule of thirds for layout composition.

=== CONTENT TO FEATURE ===
HEADLINE (feature prominently): "${content.headline}"
SUBJECT/SERVICE: ${content.subject}
${content.details ? `DETAILS: ${content.details}` : ''}
${content.businessName ? `BUSINESS NAME: "${content.businessName}" - include as branding (LARGEST text element)` : ''}
${content.logoInstructions ? `LOGO: ${content.logoInstructions}` : ''}

=== QUALITY GATE ===
The final image must look like it was created by a $100,000/year graphic designer, not by AI. It should be indistinguishable from professional agency work.
- Professional marketing agency quality
- Scroll-stopping visual impact
- Clean, polished, impressive design
- Auto repair industry appropriate
- Authentic ${theme.era} ${theme.style} aesthetic

=== MUST AVOID ===
${theme.avoidList}
- Human faces/hands
- Copyrighted logos or characters
- Clip-art style elements
- Blurry areas
- Unreadable text
- Cluttered layouts
- Amateur or low-quality appearance
${content.logoPlacementHint ? '- Placing text or important content in the logo placement area' : ''}

Create ONE stunning marketing flyer image that an auto repair shop would proudly post on Instagram/Facebook.`;
}
