/**
 * Check-In To Win Service
 * Business logic for the gamified check-in feature
 */

import { prisma } from '../../db/client';
import { geminiService } from '../../services/gemini.service';
import { storageService } from '../../services/storage.service';
import { logger } from '../../utils/logger';
import {
  Prize,
  CheckInFormData,
  CheckInSubmission,
  PrizeConfiguration,
  SpinResult,
  ActionFigureGenerationInput,
  ActionFigureGenerationResult,
  DEFAULT_PRIZES,
  generateValidationCode,
  selectPrize,
} from './check-in.types';

export const checkInService = {
  /**
   * Get prize configuration for a tenant
   * Returns default prizes if no custom config exists
   */
  async getPrizeConfiguration(tenantId: string): Promise<Prize[]> {
    try {
      const config = await prisma.prizeConfiguration.findUnique({
        where: { tenantId },
      });

      if (config && config.prizes) {
        return config.prizes as Prize[];
      }

      return DEFAULT_PRIZES;
    } catch (error) {
      logger.warn('Error fetching prize config, using defaults', { tenantId, error });
      return DEFAULT_PRIZES;
    }
  },

  /**
   * Update prize configuration for a tenant
   */
  async updatePrizeConfiguration(tenantId: string, prizes: Prize[]): Promise<PrizeConfiguration> {
    // Validate probabilities sum to approximately 1
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    if (Math.abs(totalProbability - 1) > 0.01) {
      throw new Error(`Prize probabilities must sum to 1. Current sum: ${totalProbability}`);
    }

    const config = await prisma.prizeConfiguration.upsert({
      where: { tenantId },
      update: {
        prizes: prizes as any,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        prizes: prizes as any,
      },
    });

    return {
      id: config.id,
      tenantId: config.tenantId,
      prizes: config.prizes as Prize[],
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  },

  /**
   * Submit check-in form data (Step 1)
   */
  async submitCheckIn(tenantId: string, data: CheckInFormData): Promise<CheckInSubmission> {
    const validationCode = generateValidationCode();

    const submission = await prisma.checkInSubmission.create({
      data: {
        tenantId,
        customerName: data.name,
        customerPhone: data.phone || null,
        carYear: data.carYear ? parseInt(data.carYear, 10) : null,
        carMake: data.carMake || null,
        carModel: data.carModel || null,
        carColor: data.carColor || null,
        mileage: data.mileage ? parseInt(data.mileage, 10) : null,
        issueDescription: data.issue || null,
        validationCode,
        redeemed: false,
      },
    });

    logger.info('Check-in submitted', {
      tenantId,
      submissionId: submission.id,
      customerName: data.name,
    });

    return {
      id: submission.id,
      tenantId: submission.tenantId,
      customerName: submission.customerName,
      customerPhone: submission.customerPhone || undefined,
      carYear: submission.carYear || undefined,
      carMake: submission.carMake || undefined,
      carModel: submission.carModel || undefined,
      carColor: submission.carColor || undefined,
      mileage: submission.mileage || undefined,
      issueDescription: submission.issueDescription || undefined,
      validationCode: submission.validationCode,
      redeemed: submission.redeemed,
      createdAt: submission.createdAt,
    };
  },

  /**
   * Spin the prize wheel (Step 3)
   */
  async spinPrizeWheel(tenantId: string, submissionId: string): Promise<SpinResult> {
    // Verify submission exists and belongs to tenant
    const submission = await prisma.checkInSubmission.findFirst({
      where: {
        id: submissionId,
        tenantId,
      },
    });

    if (!submission) {
      throw new Error('Check-in submission not found');
    }

    // Check if already has a prize
    if (submission.prizeWon) {
      throw new Error('Prize already won for this check-in');
    }

    // Get prize configuration and select a prize
    const prizes = await this.getPrizeConfiguration(tenantId);
    const selectedPrize = selectPrize(prizes);

    // Update submission with prize
    await prisma.checkInSubmission.update({
      where: { id: submissionId },
      data: {
        prizeWon: selectedPrize.label,
        prizeId: selectedPrize.id,
      },
    });

    logger.info('Prize won', {
      tenantId,
      submissionId,
      prize: selectedPrize.label,
    });

    return {
      prize: selectedPrize,
      validationCode: submission.validationCode,
      submissionId,
    };
  },

  /**
   * Generate Action Figure Meme (Step 4)
   */
  async generateActionFigure(
    tenantId: string,
    userId: string,
    input: ActionFigureGenerationInput
  ): Promise<ActionFigureGenerationResult> {
    // Get submission details
    const submission = await prisma.checkInSubmission.findFirst({
      where: {
        id: input.submissionId,
        tenantId,
      },
    });

    if (!submission) {
      throw new Error('Check-in submission not found');
    }

    if (!submission.prizeWon) {
      throw new Error('No prize associated with this check-in. Spin the wheel first.');
    }

    // Get tenant/brand info for customization
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { brandKit: true },
    });

    const businessName = tenant?.name || 'JW Auto Care';
    const tagline = tenant?.brandKit?.tagline || 'Your Trusted Auto Experts';

    // Build the car name
    const carName = submission.carMake && submission.carModel
      ? `${submission.carYear || ''} ${submission.carMake} ${submission.carModel}`.trim()
      : 'Customer Vehicle';

    // Build action figure prompt
    const prompt = buildActionFigurePrompt({
      customerName: submission.customerName,
      carName,
      carColor: submission.carColor || undefined,
      prizeWon: submission.prizeWon,
      validationCode: submission.validationCode,
      businessName,
      tagline,
      hasPersonImage: true,
      personImageBase64: input.personImage.base64,
      personImageMimeType: input.personImage.mimeType,
      logos: input.logos,
    });

    // Generate image using Gemini WITH the person's photo reference
    // This ensures the output uses their likeness
    const imageResult = await geminiService.generateImageWithReference(
      prompt,
      {
        base64: input.personImage.base64,
        mimeType: input.personImage.mimeType,
      },
      {
        aspectRatio: '4:5',
      }
    );

    if (!imageResult.success || !imageResult.imageData) {
      throw new Error(imageResult.error || 'Failed to generate action figure image');
    }

    // Convert to base64 data URL for immediate display
    const base64Data = imageResult.imageData.toString('base64');
    const mimeType = imageResult.mimeType || 'image/png';
    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    // Generate caption
    const caption = generateActionFigureCaption({
      customerName: submission.customerName,
      prizeWon: submission.prizeWon,
      businessName,
    });

    // Save as content
    const content = await prisma.content.create({
      data: {
        tenantId,
        userId,
        tool: 'check_in_to_win',
        contentType: 'image',
        title: `Action Figure - ${submission.customerName}`,
        imageUrl,
        caption,
        status: 'approved',
        moderationStatus: 'passed',
        metadata: {
          submissionId: submission.id,
          validationCode: submission.validationCode,
          prizeWon: submission.prizeWon,
          customerName: submission.customerName,
          carDetails: carName,
        },
      },
    });

    // Link content to submission
    await prisma.checkInSubmission.update({
      where: { id: submission.id },
      data: { contentId: content.id },
    });

    logger.info('Action figure generated', {
      tenantId,
      submissionId: submission.id,
      contentId: content.id,
    });

    return {
      id: content.id,
      imageUrl,
      caption,
      validationCode: submission.validationCode,
      prize: submission.prizeWon,
    };
  },

  /**
   * Redeem a prize (marks as used)
   */
  async redeemPrize(tenantId: string, validationCode: string): Promise<CheckInSubmission> {
    const submission = await prisma.checkInSubmission.findFirst({
      where: {
        tenantId,
        validationCode,
      },
    });

    if (!submission) {
      throw new Error('Invalid validation code');
    }

    if (submission.redeemed) {
      throw new Error('Prize has already been redeemed');
    }

    const updated = await prisma.checkInSubmission.update({
      where: { id: submission.id },
      data: {
        redeemed: true,
        redeemedAt: new Date(),
      },
    });

    logger.info('Prize redeemed', {
      tenantId,
      submissionId: submission.id,
      validationCode,
      prize: submission.prizeWon,
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      customerName: updated.customerName,
      customerPhone: updated.customerPhone || undefined,
      carYear: updated.carYear || undefined,
      carMake: updated.carMake || undefined,
      carModel: updated.carModel || undefined,
      carColor: updated.carColor || undefined,
      mileage: updated.mileage || undefined,
      issueDescription: updated.issueDescription || undefined,
      prizeWon: updated.prizeWon || undefined,
      prizeId: updated.prizeId || undefined,
      validationCode: updated.validationCode,
      redeemed: updated.redeemed,
      redeemedAt: updated.redeemedAt || undefined,
      contentId: updated.contentId || undefined,
      createdAt: updated.createdAt,
    };
  },

  /**
   * Get recent check-ins for a tenant
   */
  async getRecentCheckIns(
    tenantId: string,
    options: { limit?: number; includeRedeemed?: boolean } = {}
  ): Promise<CheckInSubmission[]> {
    const { limit = 50, includeRedeemed = true } = options;

    const submissions = await prisma.checkInSubmission.findMany({
      where: {
        tenantId,
        ...(includeRedeemed ? {} : { redeemed: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return submissions.map((s) => ({
      id: s.id,
      tenantId: s.tenantId,
      customerName: s.customerName,
      customerPhone: s.customerPhone || undefined,
      carYear: s.carYear || undefined,
      carMake: s.carMake || undefined,
      carModel: s.carModel || undefined,
      carColor: s.carColor || undefined,
      mileage: s.mileage || undefined,
      issueDescription: s.issueDescription || undefined,
      prizeWon: s.prizeWon || undefined,
      prizeId: s.prizeId || undefined,
      validationCode: s.validationCode,
      redeemed: s.redeemed,
      redeemedAt: s.redeemedAt || undefined,
      contentId: s.contentId || undefined,
      createdAt: s.createdAt,
    }));
  },

  /**
   * Validate a prize code (check if valid and not redeemed)
   */
  async validatePrizeCode(
    tenantId: string,
    validationCode: string
  ): Promise<{ valid: boolean; submission?: CheckInSubmission; error?: string }> {
    const submission = await prisma.checkInSubmission.findFirst({
      where: {
        tenantId,
        validationCode,
      },
    });

    if (!submission) {
      return { valid: false, error: 'Invalid validation code' };
    }

    if (submission.redeemed) {
      return {
        valid: false,
        error: `Prize was already redeemed on ${submission.redeemedAt?.toLocaleDateString()}`,
        submission: {
          id: submission.id,
          tenantId: submission.tenantId,
          customerName: submission.customerName,
          validationCode: submission.validationCode,
          redeemed: submission.redeemed,
          redeemedAt: submission.redeemedAt || undefined,
          prizeWon: submission.prizeWon || undefined,
          createdAt: submission.createdAt,
        },
      };
    }

    return {
      valid: true,
      submission: {
        id: submission.id,
        tenantId: submission.tenantId,
        customerName: submission.customerName,
        customerPhone: submission.customerPhone || undefined,
        carYear: submission.carYear || undefined,
        carMake: submission.carMake || undefined,
        carModel: submission.carModel || undefined,
        carColor: submission.carColor || undefined,
        mileage: submission.mileage || undefined,
        issueDescription: submission.issueDescription || undefined,
        prizeWon: submission.prizeWon || undefined,
        prizeId: submission.prizeId || undefined,
        validationCode: submission.validationCode,
        redeemed: submission.redeemed,
        createdAt: submission.createdAt,
      },
    };
  },
};

/**
 * Build the action figure generation prompt
 */
function buildActionFigurePrompt(options: {
  customerName: string;
  carName: string;
  carColor?: string;
  prizeWon: string;
  validationCode: string;
  businessName: string;
  tagline: string;
  hasPersonImage: boolean;
  personImageBase64?: string;
  personImageMimeType?: string;
  logos?: Array<{ base64: string; mimeType: string }>;
}): string {
  const {
    customerName,
    carName,
    carColor,
    prizeWon,
    validationCode,
    businessName,
    tagline,
  } = options;

  return `Create an "ACTION FIGURE COLLECTIBLE BOX" style promotional image for an auto repair shop.

*** CRITICAL: USE THE UPLOADED PHOTO ***
The uploaded photo shows the customer. You MUST:
- Use their ACTUAL face and likeness from the photo
- Transform them into a stylized action figure version that LOOKS LIKE THEM
- Keep their hair color, face shape, and distinctive features recognizable
- They should be able to clearly see it's them in the final image

PACKAGING DESIGN:
- Style: 1980s-1990s action figure toy packaging aesthetic
- Primary element: Clear plastic bubble window showing the customer AS an action figure
- The figure inside should be a stylized cartoon/toy version of THE PERSON IN THE PHOTO
- Background: Bold, colorful cardboard backing with product graphics
- Border: Classic toy packaging frame with rounded corners
- Finish: High-gloss, retail-ready appearance

KEY VISUAL ELEMENTS:
1. "LIMITED EDITION" badge in gold/metallic in top corner
2. "COLLECT THEM ALL!" text somewhere on the packaging
3. Barcode area at bottom (can be stylized)
4. Age rating badge like vintage toys ("AGES 18+")
5. "${businessName}" logo prominently displayed
6. Tagline: "${tagline}"

FIGURE CONTENTS (inside the bubble):
- Main Figure: THE CUSTOMER from the uploaded photo, rendered as a stylized action figure
  * MUST look like the person in the photo (same face, hair, features)
  * Wearing a cool mechanic/racing outfit
  * Heroic, confident pose
- Figure Name Label: "${customerName}"
- Accessories included:
  * Miniature ${carColor ? carColor + ' ' : ''}${carName} (toy car size)
  * Prize ticket showing: "${prizeWon}"
  * Miniature wrench or tool accessory
  * Small base/stand with shop logo

TEXT ELEMENTS ON PACKAGING:
- Large title: "CHECK-IN CHAMPION"
- Subtitle: "${customerName}"
- Prize callout: "INCLUDES: ${prizeWon}!"
- Validation: "Code: ${validationCode}"
- Series name: "${businessName} Customer Heroes Series"

COLOR SCHEME:
- Use bold, vibrant toy packaging colors
- Red, yellow, blue primary palette
- Metallic accents (gold for LIMITED EDITION badge)
- High contrast for readability

MOOD & STYLE:
- Nostalgic 80s/90s toy aesthetic
- Fun and collectible feel - like a real toy you'd buy at a store
- The figure should be a FUN, FLATTERING stylized version of the customer
- Shareable on social media - they'll want to show their friends!

Create a fun, viral-worthy action figure box featuring THIS SPECIFIC CUSTOMER that they'll want to share on social media!`;
}

/**
 * Generate social media caption for action figure
 */
function generateActionFigureCaption(options: {
  customerName: string;
  prizeWon: string;
  businessName: string;
}): string {
  const { customerName, prizeWon, businessName } = options;

  const captions = [
    `Look what I won at ${businessName}! I'm a Limited Edition Action Figure now. Prize: ${prizeWon}!`,
    `Just got my action figure collectible from ${businessName}! Won ${prizeWon}!`,
    `New collector's item unlocked at ${businessName}! Prize inside: ${prizeWon}`,
  ];

  const caption = captions[Math.floor(Math.random() * captions.length)];

  return `${caption}

#CheckInToWin #ActionFigure #LimitedEdition #AutoCare #Winner #${businessName.replace(/\s+/g, '')}`;
}

export default checkInService;
