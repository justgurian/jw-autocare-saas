/**
 * Style Cloner Service — AI-powered style extraction and cloned prompt building
 */

import { geminiService } from './gemini.service';
import { logger } from '../utils/logger';

export interface ExtractedStyle {
  name: string;
  shortDescription: string;
  sourceIndustry: string;
  imagePrompt: {
    style: string;
    colorPalette: string;
    typography: string;
    elements: string;
    mood: string;
  };
  compositionNotes: string;
  avoidList: string;
  previewColors: string[]; // 3-5 hex codes
  textPrompt: {
    tone: string;
    vocabulary: string[];
  };
}

export async function extractStyleFromImage(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedStyle> {
  const prompt = `You are an expert graphic designer and art director. Analyze the attached reference image — a marketing flyer or artwork — and extract its complete visual style into a structured JSON format.

Your analysis must be detailed enough that another designer could recreate this exact visual style for a completely different industry (auto repair shops).

Return ONLY valid JSON matching this exact schema:

{
  "name": "string — A catchy 2-4 word name for this style (e.g., 'Neon Retro Burst', 'Coastal Clean', 'Grunge Industrial')",
  "shortDescription": "string — One sentence describing the style's vibe and feel",
  "sourceIndustry": "string — What industry this flyer was originally for (e.g., 'restaurant', 'gym', 'retail', 'music')",
  "imagePrompt": {
    "style": "string — Detailed visual style directive: artistic technique, era influences, rendering approach, texture treatment. Be specific enough to guide AI image generation. Example: 'Bold retro pop art style with halftone dot patterns, thick black outlines, and saturated primary colors reminiscent of 1960s comic book advertising'",
    "colorPalette": "string — Exact color instructions including hex codes where possible. Describe primary, secondary, accent, and background colors. Example: 'Primary: deep navy #1a2744, Secondary: coral red #e85d4e, Accent: gold #d4a843, Background: cream white #f5f0e8 with subtle texture'",
    "typography": "string — Detailed font/text treatment description: font style, weight, case, effects, hierarchy, decorative treatments. Example: 'Bold condensed sans-serif headlines in all-caps with slight letter spacing, script accent text for taglines, hand-drawn feel for details'",
    "elements": "string — All design elements, patterns, textures, borders, decorative motifs, iconography. Example: 'Geometric art deco borders, sunburst rays, stippled shading, vintage badge/seal elements, decorative corner flourishes'",
    "mood": "string — Atmosphere, feeling, energy level, emotional response the design evokes. Example: 'High-energy, bold and confident, vintage nostalgia with modern edge, feels premium but approachable'"
  },
  "compositionNotes": "string — Layout structure, visual hierarchy, spacing, alignment, focal point placement. Example: 'Strong center-weighted composition with headline at top third, hero image center, details at bottom. Generous margins with decorative border frame.'",
  "avoidList": "string — Comma-separated list of things to avoid when recreating this style. Example: 'photorealistic people, gradients, minimalist whitespace, thin fonts, muted colors'",
  "previewColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "textPrompt": {
    "tone": "string — Copy/text voice that matches this visual style. Example: 'Bold, direct, and enthusiastic with a vintage flair'",
    "vocabulary": ["word1", "word2", "word3", "word4", "word5", "word6"]
  }
}

IMPORTANT:
- Be EXTREMELY detailed in the imagePrompt fields — these will be used to generate images in this style
- Extract EXACT hex colors where possible (at least 3-5 key colors)
- Describe typography in enough detail to guide font/text rendering
- The style must be adaptable to auto repair shop content
- Return ONLY the JSON, no markdown formatting, no explanation`;

  const raw = await geminiService.analyzeImageFromBase64(imageBase64, mimeType, prompt);

  // Parse JSON from response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    logger.error('Failed to extract JSON from style analysis', { responseLength: raw.length });
    throw new Error('AI did not return valid JSON for style extraction');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as ExtractedStyle;
    // Validate minimum fields
    if (!parsed.name || !parsed.imagePrompt?.style) {
      throw new Error('Extracted style missing required fields');
    }
    return parsed;
  } catch (err) {
    logger.error('Failed to parse extracted style JSON', { error: err, raw: raw.substring(0, 500) });
    throw new Error('Failed to parse AI style extraction result');
  }
}

export function buildClonedStylePrompt(
  style: ExtractedStyle,
  content: {
    headline: string;
    subject: string;
    details?: string;
    businessName?: string;
    logoInstructions?: string;
  }
): string {
  return `You are the creative director at a premium automotive advertising agency that has won multiple industry awards for print and social media campaigns.

=== OUTPUT ===
Create one finished, print-ready 1080x1350 (4:5) marketing flyer image.

=== CREATIVE DIRECTION ===
Recreate the visual style described below — originally from the ${style.sourceIndustry} industry — but adapted for an auto repair shop.
Style: "${style.name}" — ${style.shortDescription}

=== VISUAL STYLE SPECIFICATIONS ===
${style.imagePrompt.style}

=== COLOR PALETTE ===
${style.imagePrompt.colorPalette}
Colors must be saturated and high-contrast — this image competes for attention in a social media feed.

=== TYPOGRAPHY ===
${style.imagePrompt.typography}

TEXT RULES (non-negotiable):
- The business name MUST be the LARGEST text element — readable even at 200px phone thumbnail size.
- Use maximum 2 typeface families in the entire design.
- ALL text must have contrast backing: text shadows, solid color bars behind text, or gradient overlays.
- Headline should be 3x larger than any secondary text.

=== DESIGN ELEMENTS ===
${style.imagePrompt.elements}

=== MOOD & ATMOSPHERE ===
${style.imagePrompt.mood}

=== COMPOSITION & LAYOUT ===
${style.compositionNotes}

COMPOSITION RULES:
- One clear visual focal point.
- At least 15% negative space for visual breathing room.
- Use the rule of thirds for layout composition.

=== CONTENT TO FEATURE ===
HEADLINE (feature prominently): "${content.headline}"
SUBJECT/SERVICE: ${content.subject}
${content.details ? `DETAILS: ${content.details}` : ''}
${content.businessName ? `BUSINESS NAME: "${content.businessName}" — include as branding (LARGEST text element)` : ''}
${content.logoInstructions ? `LOGO: ${content.logoInstructions}` : ''}

=== QUALITY GATE ===
The final image must look like it was created by a $100,000/year graphic designer, not by AI.
- Professional marketing agency quality
- Scroll-stopping visual impact
- Clean, polished, impressive design
- Auto repair industry appropriate
- Authentic "${style.name}" aesthetic cloned from the reference

=== MUST AVOID ===
${style.avoidList}
- Human faces/hands
- Copyrighted logos or characters
- Clip-art style elements
- Blurry areas
- Unreadable text
- Cluttered layouts
- Amateur or low-quality appearance

Create ONE stunning marketing flyer image that an auto repair shop would proudly post on Instagram/Facebook.`;
}

export async function generatePreview(
  style: ExtractedStyle,
  referenceImageBase64: string,
  mimeType: string
): Promise<{ success: boolean; imageData?: Buffer; mimeType?: string; error?: string }> {
  const prompt = buildClonedStylePrompt(style, {
    headline: 'Expert Auto Repair',
    subject: 'Brake Service Special',
    details: 'Free inspection with any brake service. Honest Service, Fair Prices.',
    businessName: 'Bay Area Auto Care',
  });

  const result = await geminiService.generateImage(prompt, {
    referenceImage: { base64: referenceImageBase64, mimeType },
  });

  return result;
}
