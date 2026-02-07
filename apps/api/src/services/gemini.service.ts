import { GoogleGenAI, Part } from '@google/genai';
import { config } from '../config';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { getSeasonalEventsForMonth, getStateTips, getSeasonName } from '../prompts/calendar/seasonal-data';

// Sanitize user input for AI prompts to prevent prompt injection
function sanitizeForPrompt(input: string): string {
  if (!input) return '';
  // Remove potential prompt injection patterns
  return input
    .replace(/\b(ignore|disregard|forget|override)\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, '[filtered]')
    .replace(/\b(system|assistant|user)\s*:/gi, '[filtered]')
    .replace(/```[\s\S]*?```/g, '[code removed]')
    .slice(0, 500); // Limit length
}

// Initialize Gemini client (build: 2026-02-05-v2 — @google/genai SDK)
const apiKey = config.gemini.apiKey;
if (!apiKey) {
  logger.error('CRITICAL: GEMINI_API_KEY is not set!');
}
const ai = new GoogleGenAI({ apiKey });
logger.info('Gemini API initialized', { hasKey: !!apiKey });

// Model names
const TEXT_MODEL = 'gemini-2.0-flash';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';

interface TextGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

interface ImageGenerationOptions {
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
  style?: string;
  negativePrompt?: string;
  outputDir?: string;
  logoImage?: { base64: string; mimeType: string };
  mascotImage?: { base64: string; mimeType: string };
  contactInfo?: { phone?: string; website?: string };
}

function buildContactSection(contactInfo?: { phone?: string; website?: string }): string {
  const hasPhone = contactInfo?.phone && contactInfo.phone.trim().length > 0;
  const hasWebsite = contactInfo?.website && contactInfo.website.trim().length > 0;

  if (!hasPhone && !hasWebsite) {
    return `=== CALL TO ACTION ===
Include a compelling call-to-action phrase prominently in the design. Choose one that fits the flyer content:
- "Call Today!" or "Book Now!" or "Visit Us Today!" or "Schedule Your Service!"
The CTA must be clearly visible and styled as a button or banner element.`;
  }

  const contactLines: string[] = [];
  if (hasPhone) contactLines.push(`Phone: ${contactInfo!.phone!.trim()}`);
  if (hasWebsite) contactLines.push(`Website: ${contactInfo!.website!.trim()}`);

  return `=== CONTACT INFORMATION & CALL TO ACTION ===
CRITICAL: The following contact information MUST appear on the flyer, clearly readable:
${contactLines.map(l => `- ${l}`).join('\n')}

Display the contact info in a clean footer bar, banner, or dedicated contact strip at the bottom of the flyer.
Style it professionally — not cramped or as an afterthought. It should look intentionally designed.

Also include a compelling call-to-action phrase prominently in the design:
- "Call Today!" or "Book Now!" or "Visit Us Today!" or "Schedule Your Service!"
Choose the CTA that best matches the flyer's content. The CTA should be styled as a button or banner element, visually distinct from the contact information.`;
}

interface GenerationResult {
  text?: string;
  imageUrl?: string;
  imageData?: Buffer;
  mimeType?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface ImageGenResult {
  success: boolean;
  imageData?: Buffer;
  mimeType?: string;
  localPath?: string;
  error?: string;
}

export const geminiService = {
  // Generate text content
  async generateText(prompt: string, options: TextGenerationOptions = {}): Promise<GenerationResult> {
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
        },
      });

      const text = response.text || '';

      logger.debug('Gemini text generation completed', {
        promptLength: prompt.length,
        responseLength: text.length,
      });

      return {
        text,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      logger.error('Gemini text generation failed', { error });
      throw error;
    }
  },

  // Generate image using Nano Banana Pro (Gemini 3 Pro Image Preview)
  async generateImage(prompt: string, options: ImageGenerationOptions = {}): Promise<ImageGenResult> {
    try {
      logger.info('Starting image generation with Nano Banana Pro', { promptLength: prompt.length });

      // Build comprehensive prompt for high-quality auto repair marketing images
      const contactSection = buildContactSection(options.contactInfo);

      const fullPrompt = `You are an elite professional graphic designer at a top-tier marketing agency, creating a STUNNING promotional image for a premium independent auto repair shop — the kind of shop trusted by its community, known for exceptional work, and proud of its reputation.

CREATE A VISUALLY STRIKING, HIGH-QUALITY MARKETING IMAGE with the following specifications:

=== CORE CONTENT ===
${prompt}

${contactSection}

=== VISUAL DESIGN REQUIREMENTS ===

COMPOSITION & LAYOUT:
- Create a clean, professional composition with clear visual hierarchy
- Use the rule of thirds for balanced, eye-catching design
- Leave breathing room - don't overcrowd the image
- Ensure the main message is immediately visible and readable
- Aspect ratio: ${options.aspectRatio || '4:5'} (optimized for Instagram/Facebook)

TYPOGRAPHY & TEXT:
- Use BOLD, LARGE, highly readable text for headlines
- Text must have HIGH CONTRAST against background (white text on dark, or dark text with white outline)
- Professional sans-serif fonts that convey trust and reliability
- Text should be readable even when image is viewed as a small thumbnail on mobile
- Include subtle text shadows or outlines for maximum readability

COLOR PALETTE:
- Use rich, vibrant colors that pop on social media feeds
- Professional automotive colors: deep reds, metallic blues, chrome silvers, classic blacks
- Accent colors that create energy: bright yellows, electric oranges, clean whites
- Ensure colors work together harmoniously

VISUAL ELEMENTS:
- Incorporate automotive imagery: tools, cars, wheels, gauges, garage elements
- Use dynamic angles and perspectives for visual interest
- Add subtle shine, reflections, or metallic effects for premium feel
- Include design elements like racing stripes, checkered patterns, or gear shapes

STYLE & MOOD:
- Premium, trustworthy, expert auto shop aesthetic — the kind of place you'd trust with your family's car
- Clean, modern design that stands out in social media feeds
- Balance between eye-catching and professional
- Convey decades of expertise, unshakable reliability, and top-quality service

=== QUALITY STANDARDS ===
- This image will be used for REAL BUSINESS MARKETING for a PREMIUM independent auto repair shop
- It must look like it was created by a top-tier professional graphic designer at a real agency
- The image should make people STOP SCROLLING when they see it in their feed
- Quality level: Ready to post on Instagram, Facebook, or print as a professional flyer
- The viewer should feel TRUST and CONFIDENCE in this shop after seeing this image
- This shop is in the TOP 5% of independent repair shops — the image quality must reflect that

=== DO NOT INCLUDE ===
- Realistic human faces or photographs of real people
- Copyrighted logos, brand names, or trademarked characters
- Low quality, clipart-style, or amateur-looking elements
- Tiny unreadable text
- Cluttered or chaotic layouts
- Generic stock photo aesthetic
- Cheesy, cheap, or discount-store aesthetics
${options.negativePrompt ? `- ${options.negativePrompt}` : ''}

Generate a single, stunning marketing image that a premium auto repair shop would be proud to post on their social media.`;

      logger.info('Calling image model for generation...', {
        hasLogo: !!options.logoImage,
        hasMascot: !!options.mascotImage,
      });

      let contents: Part[] | string;
      const hasLogo = !!options.logoImage;
      const hasMascot = !!options.mascotImage;

      if (hasLogo || hasMascot) {
        const parts: Part[] = [];
        if (hasLogo) {
          parts.push({
            inlineData: {
              data: options.logoImage!.base64,
              mimeType: options.logoImage!.mimeType,
            },
          });
        }
        if (hasMascot) {
          parts.push({
            inlineData: {
              data: options.mascotImage!.base64,
              mimeType: options.mascotImage!.mimeType,
            },
          });
        }

        let textAddendum = '';
        if (hasLogo) {
          textAddendum += '\n\nIMPORTANT: The attached image is the business logo. You MUST incorporate this exact logo into the flyer design. Place it prominently where it is clearly visible — typically in the top or bottom area of the flyer. CRITICAL: If the logo has a white, colored, or solid background rectangle/box, IGNORE that background entirely — treat it as transparent. Only render the actual logo design/artwork itself, seamlessly integrated into the flyer. There should be NO visible bounding box, white rectangle, or background shape around the logo.';
        }
        if (hasMascot) {
          textAddendum += "\n\nIMPORTANT: The attached image is the shop's custom mascot character — a Muppet-style puppet. Feature this exact puppet character prominently in the image as a key visual element. Keep the character's appearance, colors, outfit, and style exactly as shown in the reference image.";
        }

        parts.push({ text: fullPrompt + textAddendum });
        contents = parts;
      } else {
        contents = fullPrompt;
      }

      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      logger.info('Received response from image model', {
        hasResponse: !!response,
        hasCandidates: !!(response?.candidates?.length),
        candidateCount: response?.candidates?.length || 0,
      });

      // Check for image parts in the response
      const parts = response.candidates?.[0]?.content?.parts || [];

      logger.info('Response parts analysis', {
        partsCount: parts.length,
        partTypes: parts.map((p) => p.inlineData ? 'image' : p.text ? 'text' : 'unknown'),
      });

      for (const part of parts) {
        if (part.inlineData) {
          const imageData = Buffer.from(part.inlineData.data!, 'base64');
          const mimeType = part.inlineData.mimeType || 'image/png';

          logger.info('Image generated successfully', {
            size: imageData.length,
            mimeType,
            sizeKB: Math.round(imageData.length / 1024),
          });

          // Save to local file if outputDir is provided
          let localPath: string | undefined;
          if (options.outputDir) {
            const extension = mimeType.split('/')[1] || 'png';
            const filename = `generated_${Date.now()}.${extension}`;
            localPath = path.join(options.outputDir, filename);

            // Ensure directory exists
            fs.mkdirSync(options.outputDir, { recursive: true });
            fs.writeFileSync(localPath, imageData);

            logger.debug('Image saved to local file', { localPath });
          }

          return {
            success: true,
            imageData,
            mimeType,
            localPath,
          };
        }
      }

      // If no image was generated, log the text response for debugging
      const textResponse = response.text || '';
      logger.warn('No image generated in response - model returned text only', {
        textResponseLength: textResponse?.length || 0,
        textResponsePreview: textResponse?.substring(0, 500) || 'empty',
        finishReason: response.candidates?.[0]?.finishReason,
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      });

      return {
        success: false,
        error: `No image generated. Model response: ${textResponse?.substring(0, 200) || 'empty'}`,
      };
    } catch (error: any) {
      logger.error('Nano Banana Pro image generation failed', {
        error: error.message,
        errorName: error.name,
        errorCode: error.code,
        errorStatus: error.status,
        errorDetails: JSON.stringify(error.errorDetails || error.details || {}),
        errorStack: error.stack?.substring(0, 500),
      });
      logger.error('Full Gemini error details', { errorMessage: error.message, errorCode: error.code });

      // Check for specific errors
      if (error.message?.includes('SAFETY')) {
        return {
          success: false,
          error: 'Content was blocked by safety filters. Try adjusting your prompt.',
        };
      }

      if (error.message?.includes('not found') || error.message?.includes('404')) {
        return {
          success: false,
          error: 'Image generation model not available. Please check model configuration.',
        };
      }

      if (error.message?.includes('quota') || error.message?.includes('rate')) {
        return {
          success: false,
          error: 'API rate limit reached. Please try again in a moment.',
        };
      }

      return {
        success: false,
        error: error.message || 'Image generation failed',
      };
    }
  },

  // Enhanced marketing copy with full profile context
  async generateMarketingCopyWithProfile(options: {
    type: 'caption' | 'headline' | 'description' | 'blog';
    topic: string;
    profile: {
      businessName?: string;
      city?: string;
      state?: string;
      brandVoice?: string;
      tagline?: string;
      specialties?: string[];
      uniqueSellingPoints?: string[];
      targetDemographics?: string;
      targetPainPoints?: string;
    };
    language?: 'en' | 'es';
    maxLength?: number;
  }): Promise<string> {
    const { profile, topic, type, language, maxLength } = options;
    const languageInstruction = language === 'es'
      ? 'Write the response in Spanish.'
      : 'Write the response in English.';

    // Build rich context from profile
    const contextParts: string[] = [];
    if (profile.businessName) contextParts.push(`Business Name: ${sanitizeForPrompt(profile.businessName)}`);
    if (profile.city && profile.state) contextParts.push(`Location: ${profile.city}, ${profile.state}`);
    if (profile.tagline) contextParts.push(`Tagline: "${sanitizeForPrompt(profile.tagline)}"`);
    if (profile.specialties?.length) contextParts.push(`Specialties: ${profile.specialties.join(', ')}`);
    if (profile.uniqueSellingPoints?.length) contextParts.push(`Unique Selling Points: ${profile.uniqueSellingPoints.join('; ')}`);
    if (profile.targetDemographics) contextParts.push(`Target Customers: ${sanitizeForPrompt(profile.targetDemographics)}`);
    if (profile.targetPainPoints) contextParts.push(`Customer Pain Points: ${sanitizeForPrompt(profile.targetPainPoints)}`);

    const businessContext = contextParts.length > 0
      ? `\n\nBUSINESS CONTEXT:\n${contextParts.join('\n')}`
      : '';

    const voiceDesc = {
      friendly: 'warm, welcoming, conversational',
      professional: 'trustworthy, reliable, confident',
      technical: 'knowledgeable, detailed, expert',
      neighborhood: 'community-focused, family-oriented, personal',
      humorous: 'lighthearted, fun, memorable with personality',
    }[profile.brandVoice || 'friendly'] || 'friendly and approachable';

    const prompts: Record<string, string> = {
      caption: `Write a short, engaging social media caption for an auto repair shop.
Topic: ${topic}
Brand Voice: ${voiceDesc}${businessContext}
${languageInstruction}
Keep it under ${maxLength || 280} characters. Include relevant emojis. Make it feel authentic to this specific shop.`,

      headline: `Write a catchy headline for an auto repair shop promotion.
Topic: ${topic}
Brand Voice: ${voiceDesc}${businessContext}
${languageInstruction}
Keep it short, punchy, and attention-grabbing (under 10 words).`,

      description: `Write a compelling description for an auto repair service.
Topic: ${topic}
Brand Voice: ${voiceDesc}${businessContext}
${languageInstruction}
Keep it under 150 words. Focus on benefits to the customer. Reference specific shop strengths if relevant.`,

      blog: `Write an SEO-optimized blog article for an auto repair shop.
Topic: ${topic}
Brand Voice: ${voiceDesc}${businessContext}
${languageInstruction}
Write 800-1200 words. Include specific references to the business when appropriate.`,
    };

    const result = await this.generateText(prompts[type], {
      temperature: 0.8,
      maxTokens: type === 'blog' ? 4096 : 512,
    });

    return result.text || '';
  },

  // Generate marketing copy (simple version for backward compatibility)
  async generateMarketingCopy(options: {
    type: 'caption' | 'headline' | 'description' | 'blog';
    topic: string;
    brandVoice: string;
    keywords?: string[];
    language?: 'en' | 'es';
    maxLength?: number;
  }): Promise<string> {
    const languageInstruction = options.language === 'es'
      ? 'Write the response in Spanish.'
      : 'Write the response in English.';

    const prompts: Record<string, string> = {
      caption: `Write a short, engaging social media caption for an auto repair shop.
Topic: ${options.topic}
Brand Voice: ${options.brandVoice}
${options.keywords?.length ? `Keywords to include: ${options.keywords.join(', ')}` : ''}
${languageInstruction}
Keep it under ${options.maxLength || 280} characters. Include relevant emojis.`,

      headline: `Write a catchy headline for an auto repair shop promotion.
Topic: ${options.topic}
Brand Voice: ${options.brandVoice}
${languageInstruction}
Keep it short, punchy, and attention-grabbing (under 10 words).`,

      description: `Write a compelling description for an auto repair service.
Topic: ${options.topic}
Brand Voice: ${options.brandVoice}
${languageInstruction}
Keep it under 150 words. Focus on benefits to the customer.`,

      blog: `Write an SEO-optimized blog article for an auto repair shop.
Topic: ${options.topic}
Brand Voice: ${options.brandVoice}
${options.keywords?.length ? `Target Keywords: ${options.keywords.join(', ')}` : ''}
${languageInstruction}
Write 800-1200 words. Include:
- Engaging introduction
- Practical tips for car owners
- When to seek professional help
- Conclusion with call-to-action`,
    };

    const result = await this.generateText(prompts[options.type], {
      temperature: 0.8,
      maxTokens: options.type === 'blog' ? 4096 : 512,
    });

    return result.text || '';
  },

  // Enhanced image prompt with full profile context
  async buildImagePromptWithProfile(options: {
    theme: {
      style: string;
      colorPalette: string;
      typography: string;
      elements: string;
      mood: string;
    };
    message: string;
    subject: string;
    details?: string;
    profile: {
      businessName?: string;
      city?: string;
      state?: string;
      tagline?: string;
      specialties?: string[];
      brandVoice?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
  }): Promise<string> {
    const { theme, message, subject, details, profile } = options;

    // Build business context
    const businessContext: string[] = [];
    if (profile.businessName) businessContext.push(`Shop Name: ${sanitizeForPrompt(profile.businessName)}`);
    if (profile.city && profile.state) businessContext.push(`Location: ${profile.city}, ${profile.state}`);
    if (profile.tagline) businessContext.push(`Tagline: "${sanitizeForPrompt(profile.tagline)}"`);
    if (profile.specialties?.length) businessContext.push(`Specialties: ${profile.specialties.slice(0, 3).join(', ')}`);

    // Determine brand personality for visual style
    const brandPersonality = {
      friendly: 'warm, inviting, approachable',
      professional: 'clean, trustworthy, established',
      technical: 'precise, modern, detailed',
      neighborhood: 'local, community-focused, personal',
      humorous: 'playful, energetic, memorable',
    }[profile.brandVoice || 'friendly'] || 'welcoming and professional';

    const prompt = `Create a promotional flyer image for an auto repair shop.

BUSINESS IDENTITY:
${businessContext.length > 0 ? businessContext.join('\n') : 'Local auto repair shop'}
Brand Personality: ${brandPersonality}

VISUAL STYLE:
- Style: ${theme.style}
- Color Palette: ${theme.colorPalette}${profile.primaryColor ? ` with brand colors ${profile.primaryColor}` : ''}${profile.secondaryColor ? ` and ${profile.secondaryColor}` : ''}
- Typography: ${theme.typography}
- Design Elements: ${theme.elements}
- Mood: ${theme.mood}

CONTENT:
- Main Message: ${message}
- Subject/Service: ${subject}
${details ? `- Additional Details: ${details}` : ''}
${profile.businessName ? `- Feature the business name "${profile.businessName}" prominently` : ''}

REQUIREMENTS:
- Professional marketing quality
- Clear, readable text that pops
- Visually striking composition
- Auto repair industry appropriate
- Social media ready (4:5 aspect ratio)
- Convey ${brandPersonality} feeling

DO NOT include:
- Copyrighted logos or characters
- Offensive content
- Realistic human faces
- Offensive or discriminatory content`;

    return prompt;
  },

  // Generate image prompt (simple version for backward compatibility)
  async buildImagePrompt(options: {
    theme: {
      style: string;
      colorPalette: string;
      typography: string;
      elements: string;
      mood: string;
    };
    message: string;
    subject: string;
    details?: string;
    brandColors?: {
      primary: string;
      secondary: string;
    };
  }): Promise<string> {
    const { theme, message, subject, details, brandColors } = options;

    const prompt = `Create a promotional flyer image for an auto repair shop.

VISUAL STYLE:
- Style: ${theme.style}
- Color Palette: ${theme.colorPalette}${brandColors ? ` with brand colors ${brandColors.primary} and ${brandColors.secondary}` : ''}
- Typography: ${theme.typography}
- Design Elements: ${theme.elements}
- Mood: ${theme.mood}

CONTENT:
- Main Message: ${message}
- Subject/Service: ${subject}
${details ? `- Additional Details: ${details}` : ''}

REQUIREMENTS:
- Professional marketing quality
- Clear, readable text
- Visually striking composition
- Auto repair industry appropriate
- Social media ready (4:5 aspect ratio)

DO NOT include:
- Copyrighted logos or characters
- Offensive content
- Realistic human faces
- Offensive or discriminatory content`;

    return prompt;
  },

  // Generate image with reference photo (for creating images that use a person's likeness)
  async generateImageWithReference(
    prompt: string,
    referenceImage: { base64: string; mimeType: string },
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenResult> {
    try {
      logger.info('Starting image generation with reference photo', {
        promptLength: prompt.length,
        hasReference: true,
      });

      // Build the full prompt that references the uploaded photo
      const fullPrompt = `Using the uploaded photo as a reference for the person's appearance and likeness, ${prompt}

CRITICAL INSTRUCTIONS FOR USING THE REFERENCE PHOTO:
- Use the person's face, hair style, and general appearance from the uploaded photo
- Transform them into the requested style while keeping them recognizable
- Maintain their distinctive features so they can recognize themselves
- The person in the generated image should clearly be the same person from the photo

Aspect ratio: ${options.aspectRatio || '4:5'} (portrait orientation for social media)`;

      // Generate with the reference image
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: [
          {
            inlineData: {
              data: referenceImage.base64,
              mimeType: referenceImage.mimeType,
            },
          },
          { text: fullPrompt },
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.inlineData) {
          const imageData = Buffer.from(part.inlineData.data!, 'base64');
          const mimeType = part.inlineData.mimeType || 'image/png';

          logger.info('Image with reference generated successfully', {
            size: imageData.length,
            mimeType,
          });

          return {
            success: true,
            imageData,
            mimeType,
          };
        }
      }

      // If no image was generated, return error
      logger.warn('No image generated with reference', {
        response: response.text,
      });

      return {
        success: false,
        error: 'No image generated. The model returned text instead of an image.',
      };
    } catch (error: any) {
      logger.error('Gemini image generation with reference failed', { error: error.message });

      if (error.message?.includes('SAFETY')) {
        return {
          success: false,
          error: 'Content was blocked by safety filters. Try adjusting your prompt.',
        };
      }

      return {
        success: false,
        error: error.message || 'Image generation failed',
      };
    }
  },

  // Edit an existing image using Gemini (true image editing — passes the actual image)
  async editImage(
    existingImage: { base64: string; mimeType: string },
    editInstruction: string,
    options: { aspectRatio?: string } = {}
  ): Promise<ImageGenResult> {
    try {
      logger.info('Starting true image edit with Gemini', {
        instructionLength: editInstruction.length,
      });

      const editPrompt = `You are editing an existing marketing flyer image for a professional auto repair shop.

EDIT INSTRUCTION: ${editInstruction}

CRITICAL RULES:
- Keep the overall layout, composition, and design style of the original image
- Only change what the edit instruction specifically asks for
- Maintain the same professional quality and aesthetic
- Keep all text, logos, and brand elements that are NOT being changed
- Preserve colors, fonts, and visual hierarchy unless told otherwise
- The result must be a complete, polished marketing flyer — not a rough edit

Aspect ratio: ${options.aspectRatio || '4:5'} (portrait orientation for social media)`;

      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: [
          {
            inlineData: {
              data: existingImage.base64,
              mimeType: existingImage.mimeType,
            },
          },
          { text: editPrompt },
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.inlineData) {
          const imageData = Buffer.from(part.inlineData.data!, 'base64');
          const mimeType = part.inlineData.mimeType || 'image/png';

          logger.info('Image edit completed successfully', {
            size: imageData.length,
            mimeType,
          });

          return { success: true, imageData, mimeType };
        }
      }

      logger.warn('No image generated during edit', {
        response: response.text,
      });

      return {
        success: false,
        error: 'No image generated. The model returned text instead of an image.',
      };
    } catch (error: any) {
      logger.error('Gemini image edit failed', { error: error.message });

      if (error.message?.includes('SAFETY')) {
        return {
          success: false,
          error: 'Content was blocked by safety filters. Try a different edit.',
        };
      }

      return {
        success: false,
        error: error.message || 'Image edit failed',
      };
    }
  },

  // Analyze image (for logo color extraction, etc.)
  async analyzeImage(imageUrl: string, prompt: string): Promise<string> {
    try {
      // Fetch image and convert to base64
      const fetchResp = await fetch(imageUrl);
      const buffer = await fetchResp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = fetchResp.headers.get('content-type') || 'image/png';

      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: [
          {
            inlineData: {
              data: base64,
              mimeType,
            },
          },
          { text: prompt },
        ],
      });

      return response.text || '';
    } catch (error) {
      logger.error('Gemini image analysis failed', { error });
      throw error;
    }
  },

  // Generate content ideas for calendar
  async generateContentIdeas(options: {
    count: number;
    month: number;
    year: number;
    services: string[];
    location?: { city: string; state: string };
    existingTopics?: string[];
  }): Promise<Array<{ date: string; topic: string; beatType: string; suggestedTheme: string }>> {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const prompt = `Generate ${options.count} social media content ideas for an auto repair shop for ${monthNames[options.month - 1]} ${options.year}.

SERVICES OFFERED:
${options.services.map(s => `- ${s}`).join('\n')}

${options.location ? `LOCATION: ${options.location.city}, ${options.location.state}` : ''}

${options.existingTopics?.length ? `AVOID THESE TOPICS (already used):\n${options.existingTopics.join('\n')}` : ''}

For each content idea, provide:
1. Suggested date (day of month)
2. Topic/headline
3. Beat type (one of: promo, educational, engagement, seasonal, community)
4. Suggested visual theme (one of: retro-garage, arizona-desert, neon-nights, classic-mechanic, pop-culture-80s, modern-minimal, sports-car, family-friendly)

Consider:
- Local weather and seasonal needs (summer heat, winter prep, etc.)
- Holidays and events in ${monthNames[options.month - 1]}
- Mix of promotional and educational content
- Engagement posts (questions, polls, car of the day)

Return as JSON array:
[{"date": "5", "topic": "...", "beatType": "...", "suggestedTheme": "..."}]`;

    const result = await this.generateText(prompt, { temperature: 0.9 });

    try {
      // Extract JSON from response
      const jsonMatch = result.text?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      logger.warn('Failed to parse content ideas JSON', { response: result.text });
    }

    return [];
  },

  // Enhanced profile-aware content ideas for calendar with seasonal awareness
  async generateContentIdeasWithProfile(options: {
    count: number;
    month: number;
    year: number;
    services: string[];
    profile: {
      businessName?: string;
      city?: string;
      state?: string;
      tagline?: string;
      specialties?: string[];
      brandVoice?: string;
      uniqueSellingPoints?: string[];
      targetDemographics?: string;
      targetPainPoints?: string;
    };
    existingTopics?: string[];
  }): Promise<Array<{ date: string; topic: string; beatType: string; suggestedTheme: string; seasonalTie?: string }>> {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const { profile, month, year, count, services, existingTopics } = options;

    // Get seasonal data
    const seasonalEvents = getSeasonalEventsForMonth(month);
    const stateTips = getStateTips(profile.state || '');
    const seasonName = getSeasonName(month);

    // Build business context
    const businessContext: string[] = [];
    if (profile.businessName) businessContext.push(`Business Name: ${profile.businessName}`);
    if (profile.city && profile.state) businessContext.push(`Location: ${profile.city}, ${profile.state}`);
    if (profile.tagline) businessContext.push(`Tagline: "${profile.tagline}"`);
    if (profile.specialties?.length) businessContext.push(`Specialties: ${profile.specialties.join(', ')}`);
    if (profile.uniqueSellingPoints?.length) businessContext.push(`Unique Selling Points: ${profile.uniqueSellingPoints.join('; ')}`);
    if (profile.targetDemographics) businessContext.push(`Target Customers: ${profile.targetDemographics}`);
    if (profile.targetPainPoints) businessContext.push(`Customer Pain Points to Address: ${profile.targetPainPoints}`);

    // Determine brand voice for tone
    const voiceDesc = {
      friendly: 'warm, welcoming, conversational',
      professional: 'trustworthy, reliable, confident',
      technical: 'knowledgeable, detailed, expert',
      neighborhood: 'community-focused, family-oriented, personal',
      humorous: 'lighthearted, fun, memorable with personality',
    }[profile.brandVoice || 'friendly'] || 'friendly and approachable';

    const prompt = `Generate ${count} social media content ideas for an auto repair shop for ${monthNames[month - 1]} ${year}.

BUSINESS PROFILE:
${businessContext.length > 0 ? businessContext.join('\n') : 'Local auto repair shop'}
Brand Voice: ${voiceDesc}

SERVICES OFFERED:
${services.map(s => `- ${s}`).join('\n')}

SEASONAL CONTEXT (${seasonName}):
Key Events & Holidays This Month:
${seasonalEvents.map(e => `- ${e.name}: ${e.marketingAngle}`).join('\n')}

Local/Regional Considerations:
${stateTips.map(t => `- ${t}`).join('\n')}

${existingTopics?.length ? `AVOID THESE TOPICS (already scheduled):\n${existingTopics.join('\n')}` : ''}

CONTENT STRATEGY:
Generate a balanced mix of:
- Promo posts: Special offers, discounts, service packages (aim for ~30%)
- Educational posts: Tips, how-tos, maintenance advice (aim for ~25%)
- Engagement posts: Questions, polls, car spotlights, fun facts (aim for ~20%)
- Seasonal posts: Weather-related, holiday-tied content (aim for ~15%)
- Community posts: Local events, team spotlights, customer appreciation (aim for ~10%)

For each content idea, provide:
1. Suggested date (day of month, 1-${new Date(year, month, 0).getDate()})
2. Topic/headline (compelling, specific to this business)
3. Beat type (promo, educational, engagement, seasonal, community)
4. Suggested visual theme (retro-garage, arizona-desert, neon-nights, classic-mechanic, pop-culture-80s, modern-minimal, sports-car, family-friendly)
5. Seasonal tie (if applicable, which holiday/event it connects to)

IMPORTANT:
- Space content evenly throughout the month
- Make topics specific to THIS business's specialties and USPs when possible
- Address target customer pain points in educational content
- Keep the brand voice consistent: ${voiceDesc}
- Tie promotional content to seasonal events when natural

Return as JSON array:
[{"date": "5", "topic": "...", "beatType": "promo", "suggestedTheme": "retro-garage", "seasonalTie": "National Car Care Month"}]`;

    const result = await this.generateText(prompt, { temperature: 0.85, maxTokens: 4096 });

    try {
      const jsonMatch = result.text?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const ideas = JSON.parse(jsonMatch[0]);
        logger.info('Generated profile-aware content ideas', { count: ideas.length, month, year });
        return ideas;
      }
    } catch (e) {
      logger.warn('Failed to parse content ideas JSON', { response: result.text });
    }

    return [];
  },

  // Content moderation check
  async moderateContent(text: string): Promise<{ safe: boolean; categories: string[] }> {
    const prompt = `Analyze this marketing content for an auto repair shop and check if it's appropriate.

CONTENT:
${text}

Check for:
- Inappropriate language
- Misleading claims
- Discriminatory content
- Safety concerns
- Legal issues

Return JSON: {"safe": true/false, "categories": ["list of flagged categories if any"]}`;

    const result = await this.generateText(prompt, { temperature: 0.1 });

    try {
      const jsonMatch = result.text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      logger.warn('Failed to parse moderation result');
    }

    return { safe: true, categories: [] };
  },
};

export default geminiService;
