/**
 * Blog Generator Service
 * AI-powered SEO blog content generation for auto shops
 */

import { geminiService } from '../../services/gemini.service';
import {
  BlogCategory,
  BlogGenerationInput,
  BlogResult,
  BlogOutline,
  BlogIdea,
  BlogSection,
  SEOMetadata,
  BLOG_CATEGORIES,
  SEO_KEYWORDS,
  LENGTH_SPECS,
  calculateReadingTime,
  generateSlug,
} from './blog-generator.types';

class BlogGeneratorService {
  /**
   * Get all blog categories
   */
  getCategories() {
    return BLOG_CATEGORIES;
  }

  /**
   * Get SEO keywords for a category
   */
  getKeywordSuggestions(category: BlogCategory): string[] {
    return SEO_KEYWORDS[category] || [];
  }

  /**
   * Generate blog ideas based on category
   */
  async generateIdeas(category: BlogCategory, count: number = 5): Promise<BlogIdea[]> {
    const categoryInfo = BLOG_CATEGORIES.find((c) => c.id === category);

    const prompt = `Generate ${count} unique blog post ideas for an auto repair shop website.

Category: ${categoryInfo?.name}
Description: ${categoryInfo?.description}

For each idea, provide:
1. A compelling title (SEO-friendly, under 60 characters)
2. A brief description (1-2 sentences)
3. 3-4 target keywords
4. Difficulty level (easy/medium/hard based on technical depth required)
5. Seasonal relevance if applicable

Format as JSON array:
[
  {
    "title": "...",
    "category": "${category}",
    "description": "...",
    "targetKeywords": ["..."],
    "difficulty": "easy|medium|hard",
    "seasonalRelevance": "..."
  }
]

Make ideas:
- Relevant to auto shop customers
- Searchable and SEO-optimized
- Practical and helpful
- Varied in approach (some tips, some guides, some explanatory)`;

    const response = await geminiService.generateText(prompt);

    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse blog ideas:', error);
    }

    // Return example ideas if parsing fails
    return categoryInfo?.exampleTopics.slice(0, count).map((topic) => ({
      title: topic,
      category,
      description: `A helpful article about ${topic.toLowerCase()}`,
      targetKeywords: SEO_KEYWORDS[category].slice(0, 3),
      difficulty: 'medium' as const,
    })) || [];
  }

  /**
   * Generate a blog outline
   */
  async generateOutline(input: BlogGenerationInput): Promise<BlogOutline> {
    const lengthSpec = LENGTH_SPECS[input.length];

    const prompt = `Create a detailed blog post outline for an auto repair shop.

Topic: ${input.topic}
Category: ${input.category}
Target length: ${lengthSpec.minWords}-${lengthSpec.maxWords} words
Number of sections: ${lengthSpec.sections}
Target keywords: ${input.targetKeywords?.join(', ') || 'general auto repair'}
Tone: ${input.tone}

Generate an outline with:
1. A compelling, SEO-optimized title (under 60 characters)
2. ${lengthSpec.sections} main sections, each with:
   - A clear heading (H2)
   - 2-4 key points to cover

Format as JSON:
{
  "title": "...",
  "sections": [
    {
      "heading": "...",
      "points": ["...", "..."]
    }
  ],
  "estimatedWordCount": ${Math.round((lengthSpec.minWords + lengthSpec.maxWords) / 2)}
}

Make the outline:
- Logically structured
- Easy to follow
- SEO-friendly with natural keyword placement
- Valuable to car owners`;

    const response = await geminiService.generateText(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse outline:', error);
    }

    // Return basic outline if parsing fails
    return {
      title: input.topic,
      sections: [
        { heading: 'Introduction', points: ['Overview of the topic'] },
        { heading: 'Main Content', points: ['Key information', 'Important details'] },
        { heading: 'Conclusion', points: ['Summary', 'Call to action'] },
      ],
      estimatedWordCount: lengthSpec.minWords,
    };
  }

  /**
   * Generate full blog post
   */
  async generateBlog(input: BlogGenerationInput): Promise<BlogResult> {
    const lengthSpec = LENGTH_SPECS[input.length];
    const categoryInfo = BLOG_CATEGORIES.find((c) => c.id === input.category);

    const prompt = `Write a complete blog post for an auto repair shop website.

Topic: ${input.topic}
Category: ${categoryInfo?.name}
Target length: ${lengthSpec.minWords}-${lengthSpec.maxWords} words
Target keywords: ${input.targetKeywords?.join(', ') || 'auto repair, car maintenance'}
Tone: ${input.tone}
${input.shopName ? `Shop name: ${input.shopName}` : ''}
${input.shopPhone ? `Shop phone: ${input.shopPhone}` : ''}
${input.includeCallToAction ? 'Include a call-to-action at the end' : ''}

Write a well-structured blog post with:
1. An engaging introduction (hook the reader)
2. ${lengthSpec.sections} informative sections with clear headings
3. A conclusion that summarizes key points
${input.includeCallToAction ? '4. A compelling call-to-action' : ''}

Requirements:
- Use natural, conversational language
- Include practical tips and advice
- Avoid overly technical jargon (or explain it)
- Make it helpful for everyday car owners
- Naturally incorporate keywords (dont stuff them)
- Use short paragraphs for readability

Format the response as JSON:
{
  "title": "SEO-optimized title under 60 chars",
  "introduction": "Engaging intro paragraph",
  "sections": [
    {
      "type": "heading",
      "content": "Section Title"
    },
    {
      "type": "paragraph",
      "content": "Section content..."
    },
    {
      "type": "list",
      "content": "List title",
      "items": ["item 1", "item 2"]
    }
  ],
  "conclusion": "Summarizing paragraph",
  "callToAction": "CTA text if requested",
  "seo": {
    "title": "SEO title with keyword",
    "metaDescription": "150-160 char meta description",
    "focusKeyword": "main keyword",
    "secondaryKeywords": ["keyword2", "keyword3"]
  }
}`;

    const response = await geminiService.generateText(prompt);

    let blogData: {
      title: string;
      introduction: string;
      sections: BlogSection[];
      conclusion: string;
      callToAction?: string;
      seo: Partial<SEOMetadata>;
    };

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        blogData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (error) {
      console.error('Failed to parse blog:', error);
      // Create basic structure from raw response
      blogData = {
        title: input.topic,
        introduction: 'Introduction paragraph',
        sections: [
          { type: 'heading', content: 'Main Content' },
          { type: 'paragraph', content: response },
        ],
        conclusion: 'Conclusion paragraph',
        seo: {},
      };
    }

    // Build HTML and Markdown content
    const { htmlContent, markdownContent, wordCount } = this.buildContent(blogData);

    // Complete SEO metadata
    const seo: SEOMetadata = {
      title: blogData.seo?.title || blogData.title,
      metaDescription: blogData.seo?.metaDescription || blogData.introduction.substring(0, 155) + '...',
      focusKeyword: blogData.seo?.focusKeyword || input.targetKeywords?.[0] || input.category,
      secondaryKeywords: blogData.seo?.secondaryKeywords || input.targetKeywords || [],
      slug: generateSlug(blogData.title),
      readingTime: calculateReadingTime(wordCount),
    };

    return {
      title: blogData.title,
      introduction: blogData.introduction,
      sections: blogData.sections,
      conclusion: blogData.conclusion,
      callToAction: blogData.callToAction,
      seo,
      wordCount,
      htmlContent,
      markdownContent,
    };
  }

  /**
   * Optimize existing content for SEO
   */
  async optimizeForSEO(content: string, targetKeywords: string[]): Promise<{
    optimizedContent: string;
    suggestions: string[];
    keywordDensity: Record<string, number>;
  }> {
    const prompt = `Analyze and optimize this blog content for SEO.

Content:
${content}

Target keywords: ${targetKeywords.join(', ')}

Provide:
1. An optimized version of the content with better keyword placement
2. 3-5 specific suggestions for improvement
3. Current keyword density analysis

Format as JSON:
{
  "optimizedContent": "...",
  "suggestions": ["...", "..."],
  "keywordDensity": { "keyword": 1.5 }
}`;

    const response = await geminiService.generateText(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse SEO optimization:', error);
    }

    return {
      optimizedContent: content,
      suggestions: ['Add more target keywords naturally', 'Include internal links', 'Add more subheadings'],
      keywordDensity: {},
    };
  }

  /**
   * Generate meta description
   */
  async generateMetaDescription(title: string, content: string): Promise<string> {
    const prompt = `Write a compelling meta description for this blog post.

Title: ${title}
Content preview: ${content.substring(0, 500)}...

Requirements:
- Exactly 150-160 characters
- Include primary topic/keyword
- Compelling and click-worthy
- Accurately represents the content

Return ONLY the meta description text, no explanations.`;

    const response = await geminiService.generateText(prompt);
    return response.trim().substring(0, 160);
  }

  /**
   * Suggest internal linking opportunities
   */
  suggestInternalLinks(category: BlogCategory): Array<{
    anchor: string;
    suggestedPage: string;
    context: string;
  }> {
    const linkSuggestions: Record<BlogCategory, Array<{ anchor: string; suggestedPage: string; context: string }>> = {
      'maintenance-tips': [
        { anchor: 'schedule your service', suggestedPage: '/schedule', context: 'Link to booking page' },
        { anchor: 'our services', suggestedPage: '/services', context: 'Link to services list' },
        { anchor: 'contact us', suggestedPage: '/contact', context: 'Link to contact page' },
      ],
      'seasonal-care': [
        { anchor: 'seasonal specials', suggestedPage: '/specials', context: 'Link to current promotions' },
        { anchor: 'book an inspection', suggestedPage: '/schedule', context: 'Link to scheduling' },
        { anchor: 'tire services', suggestedPage: '/services/tires', context: 'Link to tire services' },
      ],
      'how-to-guides': [
        { anchor: 'professional help', suggestedPage: '/schedule', context: 'When DIY is not enough' },
        { anchor: 'our experts', suggestedPage: '/about', context: 'Link to about/team page' },
        { anchor: 'get a quote', suggestedPage: '/quote', context: 'Link to estimate request' },
      ],
      'industry-news': [
        { anchor: 'our blog', suggestedPage: '/blog', context: 'Link to more articles' },
        { anchor: 'learn more', suggestedPage: '/services', context: 'Link to relevant services' },
        { anchor: 'stay updated', suggestedPage: '/newsletter', context: 'Newsletter signup' },
      ],
      'customer-stories': [
        { anchor: 'see our reviews', suggestedPage: '/reviews', context: 'Link to reviews page' },
        { anchor: 'share your story', suggestedPage: '/contact', context: 'Link to contact' },
        { anchor: 'become a customer', suggestedPage: '/schedule', context: 'Link to booking' },
      ],
      'safety-tips': [
        { anchor: 'safety inspection', suggestedPage: '/services/inspection', context: 'Link to inspection service' },
        { anchor: 'emergency services', suggestedPage: '/services/emergency', context: 'Emergency repair info' },
        { anchor: 'book now', suggestedPage: '/schedule', context: 'Schedule safety check' },
      ],
      'money-saving': [
        { anchor: 'current specials', suggestedPage: '/specials', context: 'Link to promotions' },
        { anchor: 'maintenance packages', suggestedPage: '/services/packages', context: 'Service bundles' },
        { anchor: 'free estimate', suggestedPage: '/quote', context: 'Link to quote form' },
      ],
      'vehicle-specific': [
        { anchor: 'our expertise', suggestedPage: '/about', context: 'Shop specializations' },
        { anchor: 'brand services', suggestedPage: '/services', context: 'Specific make/model services' },
        { anchor: 'schedule service', suggestedPage: '/schedule', context: 'Booking page' },
      ],
    };

    return linkSuggestions[category] || [];
  }

  /**
   * Build HTML and Markdown content from blog data
   */
  private buildContent(blogData: {
    title: string;
    introduction: string;
    sections: BlogSection[];
    conclusion: string;
    callToAction?: string;
  }): { htmlContent: string; markdownContent: string; wordCount: number } {
    let html = `<article>\n<h1>${blogData.title}</h1>\n\n<p>${blogData.introduction}</p>\n\n`;
    let markdown = `# ${blogData.title}\n\n${blogData.introduction}\n\n`;
    let wordCount = this.countWords(blogData.introduction);

    for (const section of blogData.sections) {
      switch (section.type) {
        case 'heading':
          html += `<h2>${section.content}</h2>\n`;
          markdown += `## ${section.content}\n\n`;
          break;
        case 'paragraph':
          html += `<p>${section.content}</p>\n`;
          markdown += `${section.content}\n\n`;
          wordCount += this.countWords(section.content);
          break;
        case 'list':
          html += `<h3>${section.content}</h3>\n<ul>\n`;
          markdown += `### ${section.content}\n\n`;
          if (section.items) {
            for (const item of section.items) {
              html += `<li>${item}</li>\n`;
              markdown += `- ${item}\n`;
              wordCount += this.countWords(item);
            }
          }
          html += `</ul>\n`;
          markdown += '\n';
          break;
        case 'quote':
          html += `<blockquote>${section.content}</blockquote>\n`;
          markdown += `> ${section.content}\n\n`;
          wordCount += this.countWords(section.content);
          break;
        case 'callout':
          html += `<div class="callout"><p>${section.content}</p></div>\n`;
          markdown += `**${section.content}**\n\n`;
          wordCount += this.countWords(section.content);
          break;
      }
    }

    html += `<p>${blogData.conclusion}</p>\n`;
    markdown += `${blogData.conclusion}\n\n`;
    wordCount += this.countWords(blogData.conclusion);

    if (blogData.callToAction) {
      html += `<div class="cta"><p>${blogData.callToAction}</p></div>\n`;
      markdown += `---\n\n**${blogData.callToAction}**\n`;
      wordCount += this.countWords(blogData.callToAction);
    }

    html += '</article>';

    return { htmlContent: html, markdownContent: markdown, wordCount };
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }
}

export const blogGeneratorService = new BlogGeneratorService();
