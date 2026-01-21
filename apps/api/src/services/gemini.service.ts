import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { config } from '../config';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { getSeasonalEventsForMonth, getStateTips, getSeasonName } from '../prompts/calendar/seasonal-data';

// Initialize Gemini client (build: 2026-01-21-v2)
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// Models - using available Gemini models
const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Image generation model - Nano Banana Pro (Gemini 3 Pro Image Preview)
const imageModel = genAI.getGenerativeModel({
  model: 'gemini-3-pro-image-preview',
  generationConfig: {
    // @ts-ignore - responseModalities is supported in newer versions
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

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
      const result = await textModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
        },
      });

      const response = result.response;
      const text = response.text();

      logger.debug('Gemini text generation completed', {
        promptLength: prompt.length,
        responseLength: text.length,
      });

      return {
        text,
        usage: {
          promptTokens: 0, // Gemini doesn't return token counts in the same way
          completionTokens: 0,
          totalTokens: 0,
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
      const fullPrompt = `You are a professional graphic designer creating a stunning social media marketing image for an auto repair shop.

CREATE A VISUALLY STRIKING, HIGH-QUALITY MARKETING IMAGE with the following specifications:

=== CORE CONTENT ===
${prompt}

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
- Professional yet approachable - trustworthy auto shop aesthetic
- Clean, modern design that stands out in social media feeds
- Balance between eye-catching and professional
- Convey expertise, reliability, and quality service

=== QUALITY STANDARDS ===
- This image will be used for REAL BUSINESS MARKETING on social media
- It must look like it was created by a professional graphic designer
- The image should make people STOP SCROLLING when they see it
- Quality level: Ready to post on Instagram, Facebook, or print as a flyer

=== DO NOT INCLUDE ===
- Realistic human faces or photographs of real people
- Copyrighted logos, brand names, or trademarked characters
- Low quality, clipart-style, or amateur-looking elements
- Tiny unreadable text
- Cluttered or chaotic layouts
- Generic stock photo aesthetic
${options.negativePrompt ? `- ${options.negativePrompt}` : ''}

Generate a single, stunning marketing image that an auto repair shop would be proud to post on their social media.`;

      logger.info('Calling Nano Banana Pro model for image generation...');

      const result = await imageModel.generateContent(fullPrompt);
      const response = result.response;

      logger.info('Received response from image model', {
        hasResponse: !!response,
        hasCandidates: !!(response?.candidates?.length),
        candidateCount: response?.candidates?.length || 0,
      });

      // Check for image parts in the response
      const parts = response.candidates?.[0]?.content?.parts || [];

      logger.info('Response parts analysis', {
        partsCount: parts.length,
        partTypes: parts.map((p: any) => p.inlineData ? 'image' : p.text ? 'text' : 'unknown'),
      });

      for (const part of parts) {
        // @ts-ignore - inlineData may contain image
        if (part.inlineData) {
          // @ts-ignore
          const imageData = Buffer.from(part.inlineData.data, 'base64');
          // @ts-ignore
          const mimeType = part.inlineData.mimeType || 'image/png';

          logger.info('Image generated successfully with Nano Banana Pro', {
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
      const textResponse = response.text();
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
        errorStack: error.stack?.substring(0, 500),
      });

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
    if (profile.businessName) contextParts.push(`Business Name: ${profile.businessName}`);
    if (profile.city && profile.state) contextParts.push(`Location: ${profile.city}, ${profile.state}`);
    if (profile.tagline) contextParts.push(`Tagline: "${profile.tagline}"`);
    if (profile.specialties?.length) contextParts.push(`Specialties: ${profile.specialties.join(', ')}`);
    if (profile.uniqueSellingPoints?.length) contextParts.push(`Unique Selling Points: ${profile.uniqueSellingPoints.join('; ')}`);
    if (profile.targetDemographics) contextParts.push(`Target Customers: ${profile.targetDemographics}`);
    if (profile.targetPainPoints) contextParts.push(`Customer Pain Points: ${profile.targetPainPoints}`);

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
    if (profile.businessName) businessContext.push(`Shop Name: ${profile.businessName}`);
    if (profile.city && profile.state) businessContext.push(`Location: ${profile.city}, ${profile.state}`);
    if (profile.tagline) businessContext.push(`Tagline: "${profile.tagline}"`);
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
- Phone numbers or addresses`;

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
- Phone numbers or addresses`;

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

      // Create the image part from reference
      const imagePart: Part = {
        inlineData: {
          data: referenceImage.base64,
          mimeType: referenceImage.mimeType,
        },
      };

      // Generate with the reference image
      const result = await imageModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [imagePart, { text: fullPrompt }],
          },
        ],
      });

      const response = result.response;
      const parts = response.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        // @ts-ignore - inlineData may contain image
        if (part.inlineData) {
          // @ts-ignore
          const imageData = Buffer.from(part.inlineData.data, 'base64');
          // @ts-ignore
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
        response: response.text(),
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

  // Analyze image (for logo color extraction, etc.)
  async analyzeImage(imageUrl: string, prompt: string): Promise<string> {
    try {
      // Fetch image and convert to base64
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/png';

      const imagePart: Part = {
        inlineData: {
          data: base64,
          mimeType,
        },
      };

      const result = await visionModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              imagePart,
              { text: prompt },
            ],
          },
        ],
      });

      return result.response.text();
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
