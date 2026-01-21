/**
 * Video Creator Types
 * Type definitions for AI-powered video generation using Sora 2
 */

export type VideoStyle =
  | 'cinematic'
  | 'commercial'
  | 'social-media'
  | 'documentary'
  | 'animated'
  | 'retro';

export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export type VideoDuration = '5s' | '10s' | '15s' | '30s';

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

  // Branding
  includeLogoOverlay?: boolean;
  includeMusicTrack?: boolean;
  voiceoverText?: string;

  // Reference images
  referenceImages?: Array<{
    base64: string;
    mimeType: string;
    description?: string;
  }>;
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

// Video Templates
export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'promo-special',
    name: 'Special Offer Promo',
    description: 'Dynamic promo video for service specials and discounts',
    style: 'commercial',
    duration: '15s',
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
    duration: '30s',
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
    duration: '15s',
    aspectRatio: '4:5',
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
    duration: '10s',
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
    duration: '15s',
    aspectRatio: '1:1',
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
    duration: '30s',
    aspectRatio: '4:5',
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

  // Add voiceover if provided
  if (input.voiceoverText) {
    prompt += `\n\nVOICEOVER SCRIPT:\n"${input.voiceoverText}"`;
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
