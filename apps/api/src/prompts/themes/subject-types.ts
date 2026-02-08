/**
 * Subject Types — Controls what the flyer visually features.
 *
 * 6 options: hero-car, mechanic, detail-shot, shop-exterior, text-only, auto
 * Each injects a prompt section that tells Gemini what to focus on.
 */

export type SubjectType = 'hero-car' | 'mechanic' | 'detail-shot' | 'shop-exterior' | 'text-only' | 'auto';

interface SubjectDefinition {
  id: SubjectType;
  label: string;
  icon: string;
  description: string;
  promptInjection: string;
  negativeHint: string;
}

const SUBJECT_DEFINITIONS: SubjectDefinition[] = [
  {
    id: 'hero-car',
    label: 'Hero Car',
    icon: '🚗',
    description: 'Feature a vehicle as the star of the image',
    promptInjection: `=== SUBJECT FOCUS: HERO CAR ===
Feature a vehicle as the dominant visual element. Show it at a dramatic 3/4 angle with automotive photography lighting — large soft key light from front-left, rim light from behind creating an edge glow. The car's paint is mirror-glossy with visible reflections. Wheels are detailed and clean. The vehicle takes up 60-70% of the frame and IS the focal point of the image.`,
    negativeHint: 'Do not show people or shop buildings as primary subjects.',
  },
  {
    id: 'mechanic',
    label: 'Mechanic at Work',
    icon: '🔧',
    description: 'Feature a skilled mechanic working on a vehicle',
    promptInjection: `=== SUBJECT FOCUS: MECHANIC AT WORK ===
Feature a skilled auto mechanic mid-task in a well-lit shop environment. Show competence and focus — hands visible, tools in use, wearing a clean branded uniform. Warm tungsten workshop lighting. The mechanic is the emotional center of the image — this builds trust. Render the person in the artistic style of the theme (stylized, illustrated, or artistic — NOT photorealistic).`,
    negativeHint: 'The vehicle is secondary — mechanic is the focal point.',
  },
  {
    id: 'detail-shot',
    label: 'Detail / Close-up',
    icon: '📸',
    description: 'Extreme close-up of a car part or tool',
    promptInjection: `=== SUBJECT FOCUS: DETAIL CLOSE-UP ===
Feature an extreme close-up macro-style shot of an automotive component that showcases craftsmanship: a freshly turned brake rotor with machining marks catching the light, a meticulously organized engine bay, or a mirror-finish paint correction. Razor-thin depth of field — only the exact focal point is sharp, everything else melts into creamy bokeh. One deliberate light source creating texture-revealing shadows.`,
    negativeHint: 'Do not show full vehicles, people, or buildings. Focus on the detail.',
  },
  {
    id: 'shop-exterior',
    label: 'Shop Exterior',
    icon: '🏪',
    description: 'Welcoming view of the auto shop building',
    promptInjection: `=== SUBJECT FOCUS: SHOP EXTERIOR ===
Feature a welcoming auto repair shop exterior at golden hour. Clean, well-maintained building with clear signage. Bay doors are open, revealing activity inside (a car on the lift, a mechanic walking by). Tidy parking lot. The time of day is late afternoon golden light warming the building facade. Blue sky with a few clouds. This looks like a business you'd want to visit.`,
    negativeHint: 'Do not feature close-up car shots or individual people as primary subjects.',
  },
  {
    id: 'text-only',
    label: 'Typography Only',
    icon: '✏️',
    description: 'Bold type IS the design — no imagery',
    promptInjection: `=== SUBJECT FOCUS: TYPOGRAPHY ONLY ===
This is a typography-focused design with NO photographs or illustrations of cars, people, or shops. Bold type IS the entire design. The headline word or number dominates 60-80% of the frame. Background is a solid bold color or simple two-tone geometric split. Think Barbara Kruger, Helvetica poster, or Swiss graphic design. The power comes from scale contrast between massive headline text and tiny supporting text. Every pixel is intentional. Maximum negative space.`,
    negativeHint: 'Do NOT include any photographs, illustrations of vehicles, people, buildings, tools, or any representational imagery. ONLY typography and geometric shapes.',
  },
  {
    id: 'auto',
    label: 'Auto-pick',
    icon: '✨',
    description: 'Let the style decide what to feature',
    promptInjection: '',
    negativeHint: '',
  },
];

/**
 * Get the prompt injection for a subject type.
 * Returns empty string for 'auto' (let theme decide).
 */
export function getSubjectPromptInjection(subjectType?: SubjectType): string {
  if (!subjectType || subjectType === 'auto') return '';
  const def = SUBJECT_DEFINITIONS.find(s => s.id === subjectType);
  if (!def) return '';

  let injection = def.promptInjection;
  if (def.negativeHint) {
    injection += `\n${def.negativeHint}`;
  }
  return injection;
}

/**
 * Get all subject definitions (for API response to frontend).
 */
export function getAllSubjectTypes(): Array<{ id: SubjectType; label: string; icon: string; description: string }> {
  return SUBJECT_DEFINITIONS.map(s => ({
    id: s.id,
    label: s.label,
    icon: s.icon,
    description: s.description,
  }));
}
