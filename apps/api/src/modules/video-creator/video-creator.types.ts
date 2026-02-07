/**
 * Video Creator Types
 * Type definitions for AI-powered video generation using Veo 3.1
 */

import { VideoAnimationPreset } from './video-creator.prompts';

export type VideoStyle =
  | 'cinematic'
  | 'commercial'
  | 'social-media'
  | 'documentary'
  | 'animated'
  | 'retro';

export type VideoAspectRatio = '16:9' | '9:16';

export type VideoDuration = '4s' | '6s' | '8s';

export type VideoResolution = '720p' | '1080p';

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  style: VideoStyle;
  duration: VideoDuration;
  aspectRatio: VideoAspectRatio;
  promptTemplate: string;
  category: 'promotional' | 'educational' | 'testimonial' | 'showcase';
  previewThumbnail?: string;
}

export interface VideoGenerationInput {
  // Template or custom
  templateId?: string;
  customPrompt?: string;

  // Content details
  topic: string;
  serviceHighlight?: string;
  callToAction?: string;

  // Visual options
  style: VideoStyle;
  aspectRatio: VideoAspectRatio;
  duration: VideoDuration;
  resolution?: VideoResolution;

  // Branding
  voiceoverText?: string;

  // Reference images
  referenceImages?: Array<{
    base64: string;
    mimeType: string;
    description?: string;
  }>;

  // Animation preset (Animate My Flyer)
  animationPreset?: VideoAnimationPreset;

  // Negative prompt for quality control
  negativePrompt?: string;

  // Mascot support
  mascotId?: string;
}

export interface VideoGenerationJob {
  id: string;
  tenantId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  input: VideoGenerationInput;
  videoUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface GeneratedVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  duration: string;
  aspectRatio: string;
  style: string;
  metadata: Record<string, unknown>;
}

// Video Options (Veo 3.1 capabilities)
export const VIDEO_OPTIONS = {
  durations: [
    { id: '4s', name: '4 seconds', description: 'Quick teaser' },
    { id: '6s', name: '6 seconds', description: 'Short promo' },
    { id: '8s', name: '8 seconds', description: 'Standard clip (supports HD/4K)' },
  ],
  resolutions: [
    { id: '720p', name: '720p', description: 'Standard quality (all durations)' },
    { id: '1080p', name: '1080p HD', description: 'High definition (8s only)' },
  ],
  aspectRatios: [
    { id: '16:9', name: 'Landscape (16:9)', description: 'YouTube, Website' },
    { id: '9:16', name: 'Portrait (9:16)', description: 'TikTok, Reels, Stories' },
  ],
  styles: [
    { id: 'cinematic', name: 'Cinematic', description: 'Hollywood-style dramatic' },
    { id: 'commercial', name: 'Commercial', description: 'Professional advertisement' },
    { id: 'social-media', name: 'Social Media', description: 'TikTok/Reels optimized' },
    { id: 'documentary', name: 'Documentary', description: 'Informative and educational' },
    { id: 'animated', name: 'Animated', description: 'Motion graphics style' },
    { id: 'retro', name: 'Retro', description: '1950s nostalgic style' },
  ],
};

// Video Templates
export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'promo-special',
    name: 'Special Offer Promo',
    description: 'Dynamic promo video for service specials and discounts',
    style: 'commercial',
    duration: '8s',
    aspectRatio: '9:16',
    promptTemplate: `Create a dynamic promotional video for an auto repair shop.

SCENE: Modern auto repair facility, clean and professional
ACTION: Camera pans across service bays, mechanics working, satisfied customers
TEXT OVERLAYS:
- "{topic}" as main headline
- "{serviceHighlight}" as feature
- "{callToAction}" at the end

STYLE: Fast-paced, energetic, modern commercial
MUSIC: Upbeat, professional, confidence-inspiring
COLORS: Red, black, white accents

END: Logo animation with call-to-action`,
    category: 'promotional',
  },
  {
    id: 'service-spotlight',
    name: 'Service Spotlight',
    description: 'Educational video highlighting a specific service',
    style: 'documentary',
    duration: '8s',
    aspectRatio: '16:9',
    promptTemplate: `Create an educational spotlight video for an auto repair service.

TOPIC: {topic}
SERVICE: {serviceHighlight}

SCENES:
1. Problem introduction (common car issue)
2. Expert mechanic explaining the solution
3. Service being performed (close-up shots)
4. Happy customer with fixed vehicle
5. Call-to-action

STYLE: Professional, trustworthy, informative
TONE: Friendly expert explaining to a friend
PACING: Moderate, allowing time to absorb information`,
    category: 'educational',
  },
  {
    id: 'car-reveal',
    name: 'Car Reveal',
    description: 'Dramatic reveal video for Car of the Day or completed work',
    style: 'cinematic',
    duration: '8s',
    aspectRatio: '16:9',
    promptTemplate: `Create a dramatic car reveal video.

SUBJECT: {topic}

SCENES:
1. Dark garage, dramatic lighting
2. Slow camera push toward covered car
3. Cover slowly drops, revealing the vehicle
4. 360-degree showcase with lens flares
5. Final beauty shot with text overlay

STYLE: Cinematic, dramatic, premium feel
MUSIC: Epic, building tension, satisfying reveal
LIGHTING: Dramatic, studio-quality, highlight reflections`,
    category: 'showcase',
  },
  {
    id: 'quick-tip',
    name: 'Quick Tip',
    description: 'Short educational tip for social media',
    style: 'social-media',
    duration: '6s',
    aspectRatio: '9:16',
    promptTemplate: `Create a quick car care tip video for social media.

TIP: {topic}
DETAIL: {serviceHighlight}

FORMAT:
- Hook in first 2 seconds
- Visual demonstration
- Key takeaway text overlay
- Shop branding

STYLE: Trendy, TikTok/Reels optimized
PACING: Quick cuts, attention-grabbing
TEXT: Bold, easy to read`,
    category: 'educational',
  },
  {
    id: 'testimonial',
    name: 'Customer Testimonial',
    description: 'Animated testimonial with customer quote',
    style: 'animated',
    duration: '8s',
    aspectRatio: '16:9',
    promptTemplate: `Create an animated customer testimonial video.

QUOTE: "{topic}"
CUSTOMER: {serviceHighlight}

ANIMATION:
1. Quote text animates in word by word
2. Star rating animation (5 stars)
3. Customer name and vehicle type
4. Shop logo and "Thank You" message

STYLE: Clean, modern, trustworthy
BACKGROUND: Subtle auto-themed animation
TEXT: Elegant, readable typography`,
    category: 'testimonial',
  },
  {
    id: 'retro-ad',
    name: 'Retro Commercial',
    description: '1950s-style nostalgic commercial',
    style: 'retro',
    duration: '8s',
    aspectRatio: '16:9',
    promptTemplate: `Create a nostalgic 1950s-style auto shop commercial.

MESSAGE: {topic}
SPECIAL: {serviceHighlight}

STYLE:
- Black and white or sepia toned
- Film grain effect
- Vintage announcer-style text
- Classic Americana imagery
- Old-fashioned cars mixed with modern elements

SCENES:
1. Vintage-style shop exterior
2. "Golly, my car needs service!" moment
3. Friendly mechanics helping
4. Happy family driving away
5. Vintage-style end card with phone number

MUSIC: 1950s jingle-style, catchy and memorable`,
    category: 'promotional',
  },
];

/**
 * Build video generation prompt
 */
export function buildVideoPrompt(options: {
  template: VideoTemplate;
  input: VideoGenerationInput;
  businessName: string;
  tagline?: string;
}): string {
  const { template, input, businessName, tagline } = options;

  let prompt = template.promptTemplate
    .replace(/{topic}/g, input.topic)
    .replace(/{serviceHighlight}/g, input.serviceHighlight || '')
    .replace(/{callToAction}/g, input.callToAction || 'Visit us today!');

  // Add business context
  prompt += `\n\nBUSINESS: ${businessName}`;
  if (tagline) prompt += `\nTAGLINE: "${tagline}"`;

  // Add duration and aspect ratio
  prompt += `\n\nTECHNICAL SPECS:`;
  prompt += `\n- Duration: ${input.duration}`;
  prompt += `\n- Aspect Ratio: ${input.aspectRatio}`;
  prompt += `\n- Style: ${input.style}`;

  // Add voiceover/audio instructions for Veo 3.1
  if (input.voiceoverText) {
    prompt += `\n\nAUDIO/VOICEOVER: The video MUST include spoken audio. A confident, professional voice speaks these words clearly: '${input.voiceoverText}'. The voiceover should be timed to match the video pacing and be clearly audible over any background music or sound effects.`;
  } else {
    prompt += `\n\nAUDIO: Include appropriate background music and sound effects that match the style. Make the audio energetic and attention-grabbing for social media.`;
  }

  // Safety guidelines
  prompt += `\n\nIMPORTANT:
- No copyrighted music or characters
- Professional, family-friendly content
- Clear, readable text overlays
- High production quality`;

  return prompt;
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): VideoTemplate | undefined {
  return VIDEO_TEMPLATES.find((t) => t.id === templateId);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: VideoTemplate['category']
): VideoTemplate[] {
  return VIDEO_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Generate video caption
 */
export function generateVideoCaption(options: {
  topic: string;
  style: VideoStyle;
  businessName: string;
  callToAction?: string;
}): string {
  const { topic, style, businessName, callToAction } = options;

  const styleTags: Record<VideoStyle, string> = {
    cinematic: '#Cinematic #Premium #AutoCare',
    commercial: '#Promotion #Special #LimitedTime',
    'social-media': '#CarTips #AutoTips #DidYouKnow',
    documentary: '#BehindTheScenes #ExpertAdvice #AutoEducation',
    animated: '#CustomerLove #Reviews #ThankYou',
    retro: '#ThrowbackThursday #Vintage #ClassicVibes',
  };

  return `${topic}

${callToAction || 'Visit us today!'}

${styleTags[style] || ''} #${businessName.replace(/\s+/g, '')} #AutoRepair #CarCare`;
}
