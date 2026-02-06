import { prisma } from '../../db/client';
import { BadRequestError, NotFoundError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import Vibrant from 'node-vibrant';
import sharp from 'sharp';

/**
 * Remove white/near-white background from a logo image using Sharp.
 * Converts near-white pixels (R,G,B all >= 240) to transparent.
 * Falls back to the original image if processing fails.
 */
async function removeLogoBackground(imageInput: string): Promise<string> {
  let imageBuffer: Buffer;

  if (imageInput.startsWith('data:image')) {
    const base64Data = imageInput.split(',')[1];
    if (!base64Data) return imageInput;
    imageBuffer = Buffer.from(base64Data, 'base64');
  } else {
    try {
      const response = await fetch(imageInput);
      if (!response.ok) return imageInput;
      imageBuffer = Buffer.from(await response.arrayBuffer());
    } catch {
      return imageInput;
    }
  }

  try {
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    const pixels = new Uint8Array(data);
    const THRESHOLD = 240;

    for (let i = 0; i < pixels.length; i += channels) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
        pixels[i + 3] = 0;
      }
    }

    const resultBuffer = await sharp(Buffer.from(pixels), {
      raw: { width, height, channels },
    })
      .png()
      .toBuffer();

    return `data:image/png;base64,${resultBuffer.toString('base64')}`;
  } catch (error) {
    logger.warn('Logo background removal failed, using original', { error });
    return imageInput;
  }
}

interface OnboardingStatus {
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  steps: {
    step: number;
    name: string;
    completed: boolean;
  }[];
}

interface BrandKitUpdate {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  brandVoice?: string;
  tagline?: string;
  businessName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  defaultVehicle?: 'corvette' | 'jeep';
}

interface ServiceInput {
  name: string;
  description?: string;
  priceRange?: string;
  category?: string;
  isSpecialty?: boolean;
}

interface SpecialInput {
  title: string;
  description?: string;
  discountType?: 'percentage' | 'fixed' | 'bogo';
  discountValue?: number;
  validDays?: string[];
  recurring?: boolean;
}

const ONBOARDING_STEPS = [
  { step: 1, name: 'Business Info' },
  { step: 2, name: 'Logo & Colors' },
  { step: 3, name: 'Services' },
  { step: 4, name: 'Brand Voice' },
  { step: 5, name: 'Specials Vault' },
  { step: 6, name: 'Default Vehicle' },
];

export const onboardingService = {
  // Get onboarding status
  async getStatus(tenantId: string): Promise<OnboardingStatus> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        brandKit: true,
        services: true,
        specials: true,
      },
    });

    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    const currentStep = tenant.onboardingStep;
    const completed = tenant.onboardingCompleted;

    // Determine which steps are completed based on data
    const steps = ONBOARDING_STEPS.map((s) => ({
      ...s,
      completed: this.isStepCompleted(s.step, tenant, tenant.brandKit, tenant.services, tenant.specials),
    }));

    return {
      currentStep,
      totalSteps: ONBOARDING_STEPS.length,
      completed,
      steps,
    };
  },

  // Check if a step is completed
  isStepCompleted(
    step: number,
    tenant: { onboardingStep: number },
    brandKit: { businessName?: string | null; logoUrl?: string | null; brandVoice?: string | null; defaultVehicle?: string } | null,
    services: unknown[],
    specials: unknown[]
  ): boolean {
    if (tenant.onboardingStep > step) return true;

    switch (step) {
      case 1: // Business Info
        return !!(brandKit?.businessName);
      case 2: // Logo & Colors
        return !!(brandKit?.logoUrl);
      case 3: // Services
        return services.length > 0;
      case 4: // Brand Voice
        return !!(brandKit?.brandVoice);
      case 5: // Specials Vault
        return specials.length >= 0; // Optional, so always passable
      case 6: // Default Vehicle
        return !!(brandKit?.defaultVehicle);
      default:
        return false;
    }
  },

  // Update step 1: Business Info
  async updateBusinessInfo(tenantId: string, data: BrandKitUpdate): Promise<void> {
    await prisma.brandKit.update({
      where: { tenantId },
      data: {
        businessName: data.businessName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        website: data.website,
        tagline: data.tagline,
      },
    });

    // Also update tenant name
    if (data.businessName) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          name: data.businessName,
          onboardingStep: { increment: 1 },
        },
      });
    }

    logger.info('Business info updated', { tenantId });
  },

  // Upload logo, remove background, and extract colors
  async uploadLogo(tenantId: string, logoUrl: string): Promise<{ colors: string[] }> {
    // Step 1: Remove white background from logo
    let processedLogoUrl = logoUrl;
    try {
      processedLogoUrl = await removeLogoBackground(logoUrl);
      logger.info('Logo background removal completed', { tenantId });
    } catch (error) {
      logger.warn('Logo background removal failed, proceeding with original', { error });
    }

    // Step 2: Extract dominant colors from ORIGINAL image (not the transparency-modified one)
    let extractedColors: string[] = [];

    try {
      let vibrantInput: string | Buffer = logoUrl;
      if (logoUrl.startsWith('data:image')) {
        const base64Data = logoUrl.split(',')[1];
        if (base64Data) {
          vibrantInput = Buffer.from(base64Data, 'base64');
        }
      }

      const palette = await Vibrant.from(vibrantInput).getPalette();
      extractedColors = [
        palette.Vibrant?.hex || '#C53030',
        palette.Muted?.hex || '#2C7A7B',
        palette.DarkVibrant?.hex || '#1A365D',
      ].filter(Boolean);
    } catch (error) {
      logger.warn('Failed to extract colors from logo', { error });
      extractedColors = ['#C53030', '#2C7A7B', '#1A365D'];
    }

    // Step 3: Save PROCESSED logo (with transparent background)
    await prisma.brandKit.update({
      where: { tenantId },
      data: {
        logoUrl: processedLogoUrl,
        primaryColor: extractedColors[0],
        secondaryColor: extractedColors[1],
        accentColor: extractedColors[2],
      },
    });

    logger.info('Logo uploaded and colors extracted', { tenantId, colors: extractedColors });

    return { colors: extractedColors };
  },

  // Update colors
  async updateColors(tenantId: string, colors: { primary?: string; secondary?: string; accent?: string }): Promise<void> {
    await prisma.brandKit.update({
      where: { tenantId },
      data: {
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        accentColor: colors.accent,
      },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingStep: { increment: 1 } },
    });

    logger.info('Colors updated', { tenantId });
  },

  // Add services (Step 3)
  async addServices(tenantId: string, services: ServiceInput[]): Promise<void> {
    // Delete existing services and add new ones
    await prisma.service.deleteMany({ where: { tenantId } });

    await prisma.service.createMany({
      data: services.map((s, index) => ({
        tenantId,
        name: s.name,
        description: s.description,
        priceRange: s.priceRange,
        category: s.category,
        isSpecialty: s.isSpecialty || false,
        sortOrder: index,
      })),
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingStep: { increment: 1 } },
    });

    logger.info('Services added', { tenantId, count: services.length });
  },

  // Update brand voice (Step 4)
  async updateBrandVoice(tenantId: string, brandVoice: string): Promise<void> {
    await prisma.brandKit.update({
      where: { tenantId },
      data: { brandVoice },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingStep: { increment: 1 } },
    });

    logger.info('Brand voice updated', { tenantId });
  },

  // Add specials (Step 5)
  async addSpecials(tenantId: string, specials: SpecialInput[]): Promise<void> {
    if (specials.length > 0) {
      await prisma.special.createMany({
        data: specials.map((s) => ({
          tenantId,
          title: s.title,
          description: s.description,
          discountType: s.discountType,
          discountValue: s.discountValue,
          validDays: s.validDays || [],
          recurring: s.recurring || false,
        })),
      });
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingStep: { increment: 1 } },
    });

    logger.info('Specials added', { tenantId, count: specials.length });
  },

  // Set default vehicle (Step 6)
  async setDefaultVehicle(tenantId: string, vehicle: 'corvette' | 'jeep'): Promise<void> {
    await prisma.brandKit.update({
      where: { tenantId },
      data: { defaultVehicle: vehicle },
    });

    logger.info('Default vehicle set', { tenantId, vehicle });
  },

  // Complete onboarding
  async completeOnboarding(tenantId: string): Promise<void> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        brandKit: true,
        services: true,
      },
    });

    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    // Validate minimum requirements
    if (!tenant.brandKit?.businessName) {
      throw new BadRequestError('Business name is required');
    }

    if (tenant.services.length === 0) {
      throw new BadRequestError('At least one service is required');
    }

    // Mark onboarding as complete
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        onboardingCompleted: true,
        onboardingStep: 7,
        settings: {
          ...(tenant.settings as object || {}),
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
        },
      },
    });

    logger.info('Onboarding completed', { tenantId });
  },

  // Get brand kit
  async getBrandKit(tenantId: string) {
    const brandKit = await prisma.brandKit.findUnique({
      where: { tenantId },
    });

    if (!brandKit) {
      throw new NotFoundError('Brand kit not found');
    }

    return brandKit;
  },
};

export default onboardingService;
