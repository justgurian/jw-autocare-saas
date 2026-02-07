import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';
import { ValidationError } from '../../middleware/error.middleware';
import { cache, invalidateCache } from '../../services/redis.service';
import { generationRateLimiter } from '../../middleware/rate-limit.middleware';
import { geminiService } from '../../services/gemini.service';
import { fetchWebsiteText } from '../../services/scraper.util';
import { logger } from '../../utils/logger';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Profile field weights for completion calculation
const PROFILE_WEIGHTS = {
  businessName: 15,
  logoUrl: 10,
  phone: 10,
  email: 5,
  address: 5,
  city: 5,
  state: 5,
  zipCode: 5,
  website: 5,
  primaryColor: 5,
  secondaryColor: 3,
  brandVoice: 7,
  tagline: 5,
  specialties: 5,      // At least 1
  uniqueSellingPoints: 5,  // At least 1
  services: 5,         // At least 1 service in services table
};

// Calculate profile completion percentage
function calculateProfileCompletion(brandKit: any, serviceCount: number): {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
  suggestions: string[];
} {
  let totalWeight = 0;
  let earnedWeight = 0;
  const completedFields: string[] = [];
  const missingFields: string[] = [];
  const suggestions: string[] = [];

  // Check each field
  for (const [field, weight] of Object.entries(PROFILE_WEIGHTS)) {
    totalWeight += weight;

    if (field === 'services') {
      if (serviceCount > 0) {
        earnedWeight += weight;
        completedFields.push(field);
      } else {
        missingFields.push(field);
        suggestions.push('Add at least one service you offer');
      }
    } else if (field === 'specialties' || field === 'uniqueSellingPoints') {
      const arr = brandKit?.[field];
      if (arr && Array.isArray(arr) && arr.length > 0) {
        earnedWeight += weight;
        completedFields.push(field);
      } else {
        missingFields.push(field);
        if (field === 'specialties') {
          suggestions.push('Add your shop specialties (e.g., European, Diesel, Imports)');
        } else {
          suggestions.push('Add what makes your shop unique');
        }
      }
    } else {
      const value = brandKit?.[field];
      if (value && value.toString().trim() !== '') {
        earnedWeight += weight;
        completedFields.push(field);
      } else {
        missingFields.push(field);
        // Add suggestions for important missing fields
        if (field === 'businessName') suggestions.push('Add your business name');
        if (field === 'logoUrl') suggestions.push('Upload your logo');
        if (field === 'phone') suggestions.push('Add your phone number');
        if (field === 'brandVoice') suggestions.push('Set your brand voice (friendly, professional, etc.)');
      }
    }
  }

  const percentage = Math.round((earnedWeight / totalWeight) * 100);

  return {
    percentage,
    completedFields,
    missingFields,
    suggestions: suggestions.slice(0, 3), // Top 3 suggestions
  };
}

// Get brand kit (basic) - cached per tenant for 5 minutes
router.get('/', async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const brandKit = await cache(`brand-kit:${tenantId}`, 300, () =>
    prisma.brandKit.findUnique({ where: { tenantId } })
  );
  res.json(brandKit);
});

// Get full profile with completion status
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    // Fetch all profile-related data in parallel
    const [brandKit, services, specials, tenant] = await Promise.all([
      prisma.brandKit.findUnique({
        where: { tenantId },
      }),
      prisma.service.findMany({
        where: { tenantId },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.special.findMany({
        where: { tenantId, isActive: true },
      }),
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          name: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          onboardingCompleted: true,
        },
      }),
    ]);

    // Calculate completion
    const completion = calculateProfileCompletion(brandKit, services.length);

    res.json({
      brandKit,
      services,
      specials,
      tenant,
      completion,
    });
  } catch (error) {
    next(error);
  }
});

// Get just completion status (lightweight)
router.get('/completion', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    const [brandKit, serviceCount] = await Promise.all([
      prisma.brandKit.findUnique({
        where: { tenantId },
      }),
      prisma.service.count({
        where: { tenantId },
      }),
    ]);

    const completion = calculateProfileCompletion(brandKit, serviceCount);
    res.json(completion);
  } catch (error) {
    next(error);
  }
});

// Update brand kit
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const brandKit = await prisma.brandKit.update({
      where: { tenantId },
      data: req.body,
    });
    await invalidateCache(`brand-kit:${tenantId}*`);
    res.json(brandKit);
  } catch (error) {
    next(error);
  }
});

// Update profile (comprehensive update with validation)
const updateProfileSchema = z.object({
  // Business Info
  businessName: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  zipCode: z.string().max(20).optional().nullable(),
  website: z.string().url().max(255).optional().nullable(),

  // Brand Identity
  tagline: z.string().max(255).optional().nullable(),
  brandVoice: z.string().optional().nullable(),

  // Colors
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),

  // Arrays
  specialties: z.array(z.string()).optional(),
  uniqueSellingPoints: z.array(z.string()).optional(),
  shopPhotos: z.array(z.string().url()).optional(),

  // Target Customers
  targetDemographics: z.string().optional().nullable(),
  targetPainPoints: z.string().optional().nullable(),

  // Social Links
  socialLinks: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    youtube: z.string().url().optional(),
    tiktok: z.string().url().optional(),
    yelp: z.string().url().optional(),
    google: z.string().url().optional(),
  }).optional(),

  // Preferences
  defaultVehicle: z.enum(['corvette', 'jeep']).optional(),
});

router.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updateProfileSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(result.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const tenantId = req.user!.tenantId;

    // Update brand kit
    const brandKit = await prisma.brandKit.update({
      where: { tenantId },
      data: result.data,
    });

    // Get updated completion status
    const serviceCount = await prisma.service.count({ where: { tenantId } });
    const completion = calculateProfileCompletion(brandKit, serviceCount);

    await invalidateCache(`brand-kit:${tenantId}*`);
    res.json({
      brandKit,
      completion,
    });
  } catch (error) {
    next(error);
  }
});

// Add specialty
router.post('/specialties', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { specialty } = req.body;
    if (!specialty || typeof specialty !== 'string') {
      throw new ValidationError('Specialty is required');
    }

    const tenantId = req.user!.tenantId;
    const brandKit = await prisma.brandKit.update({
      where: { tenantId },
      data: {
        specialties: {
          push: specialty.trim(),
        },
      },
    });

    await invalidateCache(`brand-kit:${tenantId}*`);
    res.json(brandKit);
  } catch (error) {
    next(error);
  }
});

// Remove specialty
router.delete('/specialties/:specialty', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specialty = decodeURIComponent(req.params.specialty);
    const tenantId = req.user!.tenantId;

    // Get current specialties
    const current = await prisma.brandKit.findUnique({
      where: { tenantId },
      select: { specialties: true },
    });

    if (!current) {
      res.status(404).json({ error: 'Brand kit not found' });
      return;
    }

    // Filter out the specialty
    const updatedSpecialties = current.specialties.filter(s => s !== specialty);

    const brandKit = await prisma.brandKit.update({
      where: { tenantId },
      data: { specialties: updatedSpecialties },
    });

    await invalidateCache(`brand-kit:${tenantId}*`);
    res.json(brandKit);
  } catch (error) {
    next(error);
  }
});

// Add unique selling point
router.post('/usps', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usp } = req.body;
    if (!usp || typeof usp !== 'string') {
      throw new ValidationError('USP is required');
    }

    const tenantId = req.user!.tenantId;
    const brandKit = await prisma.brandKit.update({
      where: { tenantId },
      data: {
        uniqueSellingPoints: {
          push: usp.trim(),
        },
      },
    });

    await invalidateCache(`brand-kit:${tenantId}*`);
    res.json(brandKit);
  } catch (error) {
    next(error);
  }
});

// Remove unique selling point
router.delete('/usps/:index', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const index = parseInt(req.params.index);
    const tenantId = req.user!.tenantId;

    const current = await prisma.brandKit.findUnique({
      where: { tenantId },
      select: { uniqueSellingPoints: true },
    });

    if (!current) {
      res.status(404).json({ error: 'Brand kit not found' });
      return;
    }

    const updatedUSPs = current.uniqueSellingPoints.filter((_, i) => i !== index);

    const brandKit = await prisma.brandKit.update({
      where: { tenantId },
      data: { uniqueSellingPoints: updatedUSPs },
    });

    await invalidateCache(`brand-kit:${tenantId}*`);
    res.json(brandKit);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// WEBSITE IMPORT
// ============================================================================

const importWebsiteSchema = z.object({
  url: z.string().url().optional(),
  pastedText: z.string().max(100_000).optional(),
}).refine(data => data.url || data.pastedText, {
  message: 'Either url or pastedText must be provided',
});

const EXTRACTION_PROMPT = `You are a business data extraction expert. Analyze the following text from an auto repair shop's website and extract structured information.

Return a JSON object with this EXACT structure:
{
  "businessInfo": {
    "name": "Business Name",
    "phone": "555-555-5555",
    "address": "123 Main St",
    "city": "City",
    "state": "CA",
    "zipCode": "90210",
    "website": "https://...",
    "hours": "Mon-Fri 8am-6pm, Sat 9am-3pm",
    "tagline": "Your trusted mechanic",
    "aboutUs": "Brief description..."
  },
  "services": [
    {
      "name": "Oil Change",
      "description": "Full synthetic and conventional oil changes",
      "priceRange": "$49.99-$79.99",
      "category": "Maintenance"
    }
  ],
  "specials": [
    {
      "title": "Summer AC Special",
      "description": "Complete AC system check and recharge",
      "discountType": "percentage",
      "discountValue": 15
    }
  ],
  "talkingPoints": [
    "Family-owned since 1985",
    "ASE Certified technicians",
    "Free estimates"
  ]
}

Rules:
- For services, use these categories: Maintenance, Brakes, Tires, AC/Heating, Engine, Transmission, Electrical, Body, Inspection, Other
- For specials, discountType must be: "percentage", "fixed", or "bogo"
- Extract ALL services mentioned, even if pricing isn't listed (leave priceRange as "Call for pricing")
- Look for certifications, awards, years in business as talking points
- If information isn't available, use null for that field
- Return ONLY valid JSON, no markdown code blocks

Website content:
`;

// POST /import-website — scrape or accept pasted text, extract via Gemini
router.post('/import-website', generationRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = importWebsiteSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(parsed.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const { url, pastedText } = parsed.data;
    let text: string;
    let source: 'url' | 'text';

    if (url) {
      source = 'url';
      text = await fetchWebsiteText(url);
    } else {
      source = 'text';
      text = pastedText!;
    }

    logger.info('Running Gemini extraction for website import', {
      source,
      textLength: text.length,
      tenantId: req.user!.tenantId,
    });

    const result = await geminiService.generateText(EXTRACTION_PROMPT + text, {
      temperature: 0.2,
      maxTokens: 4096,
    });

    const responseText = result.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.warn('Gemini returned no parseable JSON', { responsePreview: responseText.slice(0, 300) });
      res.status(422).json({ success: false, error: 'Could not extract structured data. Try pasting the text directly.' });
      return;
    }

    let extracted: any;
    try {
      extracted = JSON.parse(jsonMatch[0]);
    } catch {
      logger.warn('Failed to parse extracted JSON', { raw: jsonMatch[0].slice(0, 500) });
      res.status(422).json({ success: false, error: 'Extraction produced invalid JSON. Try pasting the text directly.' });
      return;
    }

    res.json({
      success: true,
      extracted,
      source,
      sourceUrl: url || null,
    });
  } catch (error) {
    next(error);
  }
});

// POST /import-confirm — save reviewed/edited import data to DB
const importConfirmSchema = z.object({
  services: z.array(z.object({
    name: z.string().max(255),
    description: z.string().optional().nullable(),
    priceRange: z.string().max(50).optional().nullable(),
    category: z.string().max(100).optional().nullable(),
    isSpecialty: z.boolean().optional().default(false),
  })).optional(),
  specials: z.array(z.object({
    title: z.string().max(255),
    description: z.string().optional().nullable(),
    discountType: z.enum(['percentage', 'fixed', 'bogo']).optional().nullable(),
    discountValue: z.number().optional().nullable(),
  })).optional(),
  businessInfo: z.object({
    name: z.string().max(255).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    tagline: z.string().max(255).optional().nullable(),
    website: z.string().max(255).optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(50).optional().nullable(),
    zipCode: z.string().max(20).optional().nullable(),
  }).optional(),
  talkingPoints: z.array(z.string()).optional(),
});

router.post('/import-confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = importConfirmSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Validation failed',
        Object.fromEntries(parsed.error.errors.map(e => [e.path.join('.'), [e.message]]))
      );
    }

    const tenantId = req.user!.tenantId;
    const { services, specials, businessInfo, talkingPoints } = parsed.data;
    const results: Record<string, any> = {};

    // Services: delete existing then recreate
    if (services && services.length > 0) {
      await prisma.service.deleteMany({ where: { tenantId } });
      const created = await Promise.all(
        services.map((svc, idx) =>
          prisma.service.create({
            data: {
              tenantId,
              name: svc.name,
              description: svc.description ?? null,
              priceRange: svc.priceRange ?? null,
              category: svc.category ?? null,
              isSpecialty: svc.isSpecialty ?? false,
              sortOrder: idx,
            },
          })
        )
      );
      results.servicesImported = created.length;
    }

    // Specials: delete existing then recreate
    if (specials && specials.length > 0) {
      await prisma.special.deleteMany({ where: { tenantId } });
      const created = await Promise.all(
        specials.map(sp =>
          prisma.special.create({
            data: {
              tenantId,
              title: sp.title,
              description: sp.description ?? null,
              discountType: sp.discountType ?? null,
              discountValue: sp.discountValue ?? null,
              isActive: true,
            },
          })
        )
      );
      results.specialsImported = created.length;
    }

    // Business info: update BrandKit fields
    if (businessInfo) {
      const updateData: Record<string, any> = {};
      if (businessInfo.name) updateData.businessName = businessInfo.name;
      if (businessInfo.phone) updateData.phone = businessInfo.phone;
      if (businessInfo.tagline) updateData.tagline = businessInfo.tagline;
      if (businessInfo.website) updateData.website = businessInfo.website;
      if (businessInfo.address) updateData.address = businessInfo.address;
      if (businessInfo.city) updateData.city = businessInfo.city;
      if (businessInfo.state) updateData.state = businessInfo.state;
      if (businessInfo.zipCode) updateData.zipCode = businessInfo.zipCode;

      if (Object.keys(updateData).length > 0) {
        await prisma.brandKit.update({
          where: { tenantId },
          data: updateData,
        });
        results.businessInfoUpdated = true;
      }
    }

    // Talking points: update uniqueSellingPoints
    if (talkingPoints && talkingPoints.length > 0) {
      await prisma.brandKit.update({
        where: { tenantId },
        data: { uniqueSellingPoints: talkingPoints },
      });
      results.talkingPointsImported = talkingPoints.length;
    }

    await invalidateCache(`brand-kit:${tenantId}*`);

    logger.info('Website import confirmed', { tenantId, results });

    res.json({ success: true, ...results });
  } catch (error) {
    next(error);
  }
});

export default router;
