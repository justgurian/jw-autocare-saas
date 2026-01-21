import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { onboardingService } from './onboarding.service';
import { ValidationError } from '../../middleware/error.middleware';

// Validation schemas
const businessInfoSchema = z.object({
  businessName: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  tagline: z.string().optional(),
});

const colorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceRange: z.string().optional(),
  category: z.string().optional(),
  isSpecialty: z.boolean().optional(),
});

const servicesSchema = z.object({
  services: z.array(serviceSchema).min(1),
});

const brandVoiceSchema = z.object({
  brandVoice: z.enum(['friendly', 'professional', 'humorous', 'authoritative', 'casual']).or(z.string().min(1)),
});

const specialSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed', 'bogo']).optional(),
  discountValue: z.number().positive().optional(),
  validDays: z.array(z.string()).optional(),
  recurring: z.boolean().optional(),
});

const specialsSchema = z.object({
  specials: z.array(specialSchema),
});

const defaultVehicleSchema = z.object({
  vehicle: z.enum(['corvette', 'jeep']),
});

function validate<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(err.message);
    });
    throw new ValidationError('Validation failed', errors);
  }
  return result.data;
}

export const onboardingController = {
  // Get onboarding status
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await onboardingService.getStatus(req.user!.tenantId);
      res.json(status);
    } catch (error) {
      next(error);
    }
  },

  // Step 1: Business Info
  async updateBusinessInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validate(businessInfoSchema, req.body);
      await onboardingService.updateBusinessInfo(req.user!.tenantId, data);
      res.json({ message: 'Business info updated', step: 1 });
    } catch (error) {
      next(error);
    }
  },

  // Step 2: Upload Logo
  async uploadLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In production, this would handle file upload to GCS
      const { logoUrl } = req.body;
      if (!logoUrl) {
        throw new ValidationError('Logo URL is required');
      }
      const result = await onboardingService.uploadLogo(req.user!.tenantId, logoUrl);
      res.json({ message: 'Logo uploaded', colors: result.colors, step: 2 });
    } catch (error) {
      next(error);
    }
  },

  // Step 2b: Update Colors
  async updateColors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const colors = validate(colorsSchema, req.body);
      await onboardingService.updateColors(req.user!.tenantId, colors);
      res.json({ message: 'Colors updated', step: 2 });
    } catch (error) {
      next(error);
    }
  },

  // Step 3: Add Services
  async addServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { services } = validate(servicesSchema, req.body);
      await onboardingService.addServices(req.user!.tenantId, services);
      res.json({ message: 'Services added', count: services.length, step: 3 });
    } catch (error) {
      next(error);
    }
  },

  // Step 4: Brand Voice
  async updateBrandVoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { brandVoice } = validate(brandVoiceSchema, req.body);
      await onboardingService.updateBrandVoice(req.user!.tenantId, brandVoice);
      res.json({ message: 'Brand voice updated', step: 4 });
    } catch (error) {
      next(error);
    }
  },

  // Step 5: Specials Vault
  async addSpecials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { specials } = validate(specialsSchema, req.body);
      await onboardingService.addSpecials(req.user!.tenantId, specials);
      res.json({ message: 'Specials added', count: specials.length, step: 5 });
    } catch (error) {
      next(error);
    }
  },

  // Step 6: Default Vehicle
  async setDefaultVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { vehicle } = validate(defaultVehicleSchema, req.body);
      await onboardingService.setDefaultVehicle(req.user!.tenantId, vehicle);
      res.json({ message: 'Default vehicle set', vehicle, step: 6 });
    } catch (error) {
      next(error);
    }
  },

  // Complete Onboarding
  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await onboardingService.completeOnboarding(req.user!.tenantId);
      res.json({ message: 'Onboarding completed successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Get Brand Kit
  async getBrandKit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brandKit = await onboardingService.getBrandKit(req.user!.tenantId);
      res.json(brandKit);
    } catch (error) {
      next(error);
    }
  },
};

export default onboardingController;
