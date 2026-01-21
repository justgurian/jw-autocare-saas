/**
 * Blog Generator Types
 * AI-powered SEO blog content generation for auto shops
 */

export type BlogCategory =
  | 'maintenance-tips'
  | 'seasonal-care'
  | 'how-to-guides'
  | 'industry-news'
  | 'customer-stories'
  | 'safety-tips'
  | 'money-saving'
  | 'vehicle-specific';

export type BlogLength = 'short' | 'medium' | 'long';

export type ContentTone = 'educational' | 'conversational' | 'professional' | 'friendly';

export interface BlogGenerationInput {
  topic: string;
  category: BlogCategory;
  targetKeywords?: string[];
  length: BlogLength;
  tone: ContentTone;
  includeCallToAction?: boolean;
  shopName?: string;
  shopPhone?: string;
}

export interface BlogSection {
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'callout';
  content: string;
  items?: string[]; // For list type
}

export interface SEOMetadata {
  title: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  slug: string;
  readingTime: number;
}

export interface BlogResult {
  title: string;
  introduction: string;
  sections: BlogSection[];
  conclusion: string;
  callToAction?: string;
  seo: SEOMetadata;
  wordCount: number;
  htmlContent: string;
  markdownContent: string;
}

export interface BlogOutline {
  title: string;
  sections: Array<{
    heading: string;
    points: string[];
  }>;
  estimatedWordCount: number;
}

export interface BlogIdea {
  title: string;
  category: BlogCategory;
  description: string;
  targetKeywords: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  seasonalRelevance?: string;
}

// Pre-defined blog topic templates
export const BLOG_CATEGORIES: Array<{
  id: BlogCategory;
  name: string;
  description: string;
  exampleTopics: string[];
}> = [
  {
    id: 'maintenance-tips',
    name: 'Maintenance Tips',
    description: 'Regular car care advice and preventive maintenance',
    exampleTopics: [
      'How Often Should You Change Your Oil?',
      'Signs Your Brakes Need Attention',
      'Understanding Your Dashboard Warning Lights',
    ],
  },
  {
    id: 'seasonal-care',
    name: 'Seasonal Care',
    description: 'Weather-specific vehicle preparation and tips',
    exampleTopics: [
      'Preparing Your Car for Winter Driving',
      'Summer Road Trip Checklist',
      'Spring Car Care After Winter',
    ],
  },
  {
    id: 'how-to-guides',
    name: 'How-To Guides',
    description: 'Step-by-step instructions for simple car tasks',
    exampleTopics: [
      'How to Check Your Tire Pressure',
      'How to Jump Start a Car Safely',
      'How to Replace Windshield Wipers',
    ],
  },
  {
    id: 'industry-news',
    name: 'Industry News',
    description: 'Updates on automotive trends and technology',
    exampleTopics: [
      'What Electric Vehicles Mean for Auto Repair',
      'New Safety Features in Modern Cars',
      'Understanding Hybrid Technology',
    ],
  },
  {
    id: 'customer-stories',
    name: 'Customer Stories',
    description: 'Success stories and testimonials from your shop',
    exampleTopics: [
      'How We Saved This Classic Car',
      'Family Road Trip Success Story',
      'From Breakdown to Breakthrough',
    ],
  },
  {
    id: 'safety-tips',
    name: 'Safety Tips',
    description: 'Keeping drivers and passengers safe on the road',
    exampleTopics: [
      'Essential Items for Your Emergency Car Kit',
      'Night Driving Safety Tips',
      'Protecting Your Car from Theft',
    ],
  },
  {
    id: 'money-saving',
    name: 'Money-Saving',
    description: 'Budget-friendly car care advice',
    exampleTopics: [
      'Simple Habits That Save on Car Repairs',
      'When to DIY vs Call a Professional',
      'Understanding Your Repair Estimate',
    ],
  },
  {
    id: 'vehicle-specific',
    name: 'Vehicle-Specific',
    description: 'Tips for specific makes and models',
    exampleTopics: [
      'Common Issues with [Make/Model] and How to Prevent Them',
      'Best Maintenance Schedule for Your [Vehicle]',
      'Why [Brand] Owners Love Our Shop',
    ],
  },
];

// SEO keyword suggestions by category
export const SEO_KEYWORDS: Record<BlogCategory, string[]> = {
  'maintenance-tips': [
    'car maintenance',
    'auto repair',
    'vehicle service',
    'oil change',
    'brake service',
    'tire rotation',
    'preventive maintenance',
    'car care tips',
  ],
  'seasonal-care': [
    'winter car care',
    'summer driving',
    'seasonal maintenance',
    'weather preparation',
    'road trip ready',
    'winter tires',
    'AC service',
    'antifreeze',
  ],
  'how-to-guides': [
    'how to',
    'step by step',
    'DIY car',
    'car tutorial',
    'easy fix',
    'quick guide',
    'beginner friendly',
    'car basics',
  ],
  'industry-news': [
    'automotive news',
    'car technology',
    'auto industry',
    'electric vehicles',
    'hybrid cars',
    'car trends',
    'new features',
    'automotive innovation',
  ],
  'customer-stories': [
    'customer review',
    'testimonial',
    'success story',
    'case study',
    'repair story',
    'satisfied customer',
    'local mechanic',
    'trusted shop',
  ],
  'safety-tips': [
    'car safety',
    'driving safety',
    'road safety',
    'vehicle security',
    'safe driving',
    'emergency kit',
    'accident prevention',
    'defensive driving',
  ],
  'money-saving': [
    'save money',
    'affordable repair',
    'budget car care',
    'cost effective',
    'repair costs',
    'cheap maintenance',
    'value service',
    'smart car owner',
  ],
  'vehicle-specific': [
    'make model',
    'brand specific',
    'common problems',
    'reliability',
    'manufacturer',
    'model year',
    'vehicle type',
    'car brand',
  ],
};

// Blog length specifications
export const LENGTH_SPECS: Record<BlogLength, { minWords: number; maxWords: number; sections: number }> = {
  short: { minWords: 300, maxWords: 500, sections: 2 },
  medium: { minWords: 600, maxWords: 900, sections: 4 },
  long: { minWords: 1000, maxWords: 1500, sections: 6 },
};

// Helper function to calculate reading time
export function calculateReadingTime(wordCount: number): number {
  // Average reading speed is 200-250 words per minute
  return Math.ceil(wordCount / 200);
}

// Helper function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
