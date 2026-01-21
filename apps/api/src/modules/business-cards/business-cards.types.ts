/**
 * Business Cards Types
 * AI-powered business card generation for auto shop staff
 */

export type CardStyle =
  | 'classic'
  | 'modern'
  | 'retro'
  | 'minimal'
  | 'bold'
  | 'premium'
  | 'industrial'
  | 'vintage-garage';

export type CardOrientation = 'horizontal' | 'vertical';

export interface StaffInfo {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  directLine?: string;
  certifications?: string[];
  specialties?: string[];
  yearsExperience?: number;
  photo?: string;
}

export interface ShopInfo {
  name: string;
  tagline?: string;
  logo?: string;
  address?: string;
  phone: string;
  website?: string;
  hours?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface CardGenerationInput {
  staff: StaffInfo;
  shop: ShopInfo;
  style: CardStyle;
  orientation: CardOrientation;
  includeQR?: boolean;
  qrContent?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  includeBackDesign?: boolean;
}

export interface CardDesign {
  front: {
    layout: string;
    elements: CardElement[];
  };
  back?: {
    layout: string;
    elements: CardElement[];
  };
}

export interface CardElement {
  type: 'text' | 'image' | 'logo' | 'qr' | 'line' | 'shape';
  content?: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style?: {
    font?: string;
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface CardResult {
  frontImageUrl: string;
  backImageUrl?: string;
  printReadyPdfUrl: string;
  design: CardDesign;
}

// Card style definitions
export const CARD_STYLES: Array<{
  id: CardStyle;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  features: string[];
}> = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Timeless, traditional business card design',
    colors: {
      primary: '#1a365d',
      secondary: '#2b6cb0',
      accent: '#c53030',
      text: '#1a202c',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Arial, sans-serif',
    },
    features: ['Clean layout', 'Professional typography', 'Subtle accents'],
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Clean, contemporary design with bold typography',
    colors: {
      primary: '#000000',
      secondary: '#4a5568',
      accent: '#ed8936',
      text: '#2d3748',
      background: '#f7fafc',
    },
    fonts: {
      heading: 'Helvetica Neue, sans-serif',
      body: 'Helvetica Neue, sans-serif',
    },
    features: ['Minimal elements', 'Strong typography', 'Whitespace focused'],
  },
  {
    id: 'retro',
    name: 'Retro Garage',
    description: '1950s americana auto shop aesthetic',
    colors: {
      primary: '#2c3e50',
      secondary: '#c0392b',
      accent: '#f39c12',
      text: '#1a1a1a',
      background: '#f5e6d3',
    },
    fonts: {
      heading: 'Oswald, sans-serif',
      body: 'Roboto, sans-serif',
    },
    features: ['Vintage vibes', 'Bold colors', 'Retro typography'],
  },
  {
    id: 'minimal',
    name: 'Ultra Minimal',
    description: 'Maximum simplicity, essential information only',
    colors: {
      primary: '#1a1a1a',
      secondary: '#666666',
      accent: '#1a1a1a',
      text: '#333333',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Open Sans, sans-serif',
    },
    features: ['Essential info only', 'Lots of whitespace', 'Clean lines'],
  },
  {
    id: 'bold',
    name: 'Bold Statement',
    description: 'Eye-catching design that stands out',
    colors: {
      primary: '#e53e3e',
      secondary: '#1a202c',
      accent: '#ecc94b',
      text: '#ffffff',
      background: '#1a202c',
    },
    fonts: {
      heading: 'Impact, sans-serif',
      body: 'Roboto, sans-serif',
    },
    features: ['High contrast', 'Bold colors', 'Attention-grabbing'],
  },
  {
    id: 'premium',
    name: 'Premium Executive',
    description: 'Luxury feel with sophisticated design',
    colors: {
      primary: '#2d3748',
      secondary: '#c6a962',
      accent: '#c6a962',
      text: '#1a202c',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Lato, sans-serif',
    },
    features: ['Gold accents', 'Elegant typography', 'Premium feel'],
  },
  {
    id: 'industrial',
    name: 'Industrial Workshop',
    description: 'Rugged, mechanical workshop aesthetic',
    colors: {
      primary: '#2f3640',
      secondary: '#ff6b35',
      accent: '#ffcc00',
      text: '#f5f6fa',
      background: '#2f3640',
    },
    fonts: {
      heading: 'Anton, sans-serif',
      body: 'Roboto Condensed, sans-serif',
    },
    features: ['Industrial look', 'Mechanical feel', 'High-visibility colors'],
  },
  {
    id: 'vintage-garage',
    name: 'Vintage Auto',
    description: 'Classic car era inspired design',
    colors: {
      primary: '#8b0000',
      secondary: '#2c3e50',
      accent: '#d4af37',
      text: '#2c2c2c',
      background: '#f5f5dc',
    },
    fonts: {
      heading: 'Bebas Neue, sans-serif',
      body: 'Source Sans Pro, sans-serif',
    },
    features: ['Chrome accents', 'Classic car elements', 'Nostalgic feel'],
  },
];

// Standard business card sizes
export const CARD_SIZES = {
  us: { width: 3.5, height: 2, unit: 'inches' },
  eu: { width: 85, height: 55, unit: 'mm' },
  jp: { width: 91, height: 55, unit: 'mm' },
};

// Common job titles for auto shops
export const COMMON_TITLES = [
  'Owner',
  'General Manager',
  'Service Manager',
  'Service Advisor',
  'Master Technician',
  'Lead Technician',
  'Automotive Technician',
  'Mechanic',
  'Parts Manager',
  'Parts Specialist',
  'Shop Foreman',
  'Customer Service Representative',
  'Office Manager',
  'Fleet Manager',
  'Estimator',
];

// Auto industry certifications
export const CERTIFICATIONS = [
  'ASE Certified',
  'ASE Master Technician',
  'ASE L1 Advanced Engine Performance',
  'ASE L2 Electronic Diesel Engine',
  'ASE L3 Light Duty Hybrid/Electric',
  'I-CAR Certified',
  'EPA 608 Certified',
  'State Inspector',
  'Emissions Certified',
  'AC Delco Certified',
  'Bosch Certified',
  'AAA Approved',
];
