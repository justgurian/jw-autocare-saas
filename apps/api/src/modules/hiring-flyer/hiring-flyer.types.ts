import { z } from 'zod';

// ============================================================================
// COMMON POSITIONS
// ============================================================================

export const COMMON_POSITIONS = [
  { id: 'ase-tech', title: 'ASE Certified Technician', category: 'technician' },
  { id: 'oil-change-tech', title: 'Oil Change Technician', category: 'technician' },
  { id: 'service-advisor', title: 'Service Advisor', category: 'front-office' },
  { id: 'parts-counter', title: 'Parts Counter Associate', category: 'front-office' },
  { id: 'detailer', title: 'Auto Detailer', category: 'technician' },
  { id: 'apprentice', title: 'Apprentice Mechanic', category: 'technician' },
  { id: 'tire-tech', title: 'Tire Technician', category: 'technician' },
  { id: 'brake-specialist', title: 'Brake Specialist', category: 'technician' },
  { id: 'alignment-tech', title: 'Alignment Technician', category: 'technician' },
  { id: 'shop-manager', title: 'Shop Manager', category: 'management' },
] as const;

export type CommonPositionId = typeof COMMON_POSITIONS[number]['id'];

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const hiringGenerateSchema = z.object({
  mode: z.enum(['simple', 'detailed']).default('simple'),

  // Simple mode fields
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  jobType: z.enum(['full-time', 'part-time', 'seasonal']).default('full-time'),
  payRange: z.string().max(100).optional(),
  howToApply: z.enum(['call', 'email', 'visit', 'online']).default('call'),

  // Detailed mode fields
  requiredCerts: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  experienceLevel: z.enum(['none', 'entry', 'mid', 'senior']).optional(),
  urgency: z.enum(['normal', 'urgent', 'immediate']).optional(),

  // Theme override (optional — defaults to smart rotation)
  themeId: z.string().optional(),
  language: z.enum(['en', 'es', 'both']).default('en'),
});

export type HiringGenerateInput = z.infer<typeof hiringGenerateSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface HiringFlyerResult {
  id: string;
  imageUrl: string;
  caption: string;
  captionSpanish?: string | null;
  title: string;
  theme: string;
  themeName: string;
  jobTitle: string;
  jobType: string;
}

// ============================================================================
// CERTIFICATION OPTIONS (for detailed mode UI)
// ============================================================================

export const CERTIFICATION_OPTIONS = [
  'ASE Certified',
  'EPA 608',
  'EPA 609',
  'OSHA 10',
  'OSHA 30',
  'State Inspection License',
  'CDL',
] as const;

export const BENEFIT_OPTIONS = [
  'Health Insurance',
  'Dental & Vision',
  'Paid Time Off',
  'Tool Allowance',
  'Uniform Provided',
  'Training & Certifications',
  'Retirement/401k',
  'Performance Bonuses',
  'Flexible Schedule',
] as const;
