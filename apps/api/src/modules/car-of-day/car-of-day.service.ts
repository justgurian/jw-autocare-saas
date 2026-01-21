/**
 * Car of the Day Service
 * Generates multiple promotional assets showcasing customer vehicles
 */

import { prisma } from '../../db/client';
import { geminiService } from '../../services/gemini.service';
import { storageService } from '../../services/storage.service';
import { logger } from '../../utils/logger';
import {
  AssetType,
  CarOfDayInput,
  GeneratedAsset,
  CarOfDayResult,
  ASSET_TYPE_INFO,
  buildOfficialPrompt,
  buildComicPrompt,
  buildActionFigurePrompt,
  buildMoviePosterPrompt,
} from './car-of-day.types';

// Default asset types to generate if not specified
const DEFAULT_ASSET_TYPES: AssetType[] = ['official', 'comic', 'action-figure', 'movie-poster'];

export const carOfDayService = {
  /**
   * Generate all Car of the Day assets
   */
  async generateCarOfDay(
    tenantId: string,
    userId: string,
    input: CarOfDayInput
  ): Promise<CarOfDayResult> {
    // Determine which assets to generate
    const assetTypes = input.assetTypes?.length ? input.assetTypes : DEFAULT_ASSET_TYPES;

    // Get tenant/brand info for customization
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { brandKit: true },
    });

    const businessName = tenant?.name || 'JW Auto Care';
    const location = tenant?.brandKit?.city
      ? `${tenant.brandKit.city}, ${tenant.brandKit.state || ''}`
      : 'Scottsdale, AZ';

    // Build the car name
    const carName = buildCarName(input);
    const carNickname = input.carNickname;
    const ownerTag = input.ownerHandle
      ? `@${input.ownerHandle.replace('@', '')}`
      : '';

    logger.info('Generating Car of the Day assets', {
      tenantId,
      carName,
      assetTypes,
    });

    const assets: GeneratedAsset[] = [];
    const errors: string[] = [];

    // Generate each asset type
    for (const assetType of assetTypes) {
      try {
        const asset = await this.generateSingleAsset({
          tenantId,
          userId,
          assetType,
          carName,
          carNickname,
          carColor: input.carColor,
          ownerName: input.ownerName,
          ownerTag,
          businessName,
          location,
          hasOwnerPhoto: !!input.personImage,
          carImage: input.carImage,
          personImage: input.personImage,
          logos: input.logos,
        });

        assets.push(asset);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to generate ${assetType} asset`, {
          tenantId,
          assetType,
          error: errorMessage,
        });
        errors.push(`${assetType}: ${errorMessage}`);
      }
    }

    // If no assets were generated, throw error
    if (assets.length === 0) {
      throw new Error(`Failed to generate any assets. Errors: ${errors.join('; ')}`);
    }

    logger.info('Car of the Day generation complete', {
      tenantId,
      carName,
      totalGenerated: assets.length,
      errors: errors.length,
    });

    return {
      carName,
      assets,
      totalGenerated: assets.length,
    };
  },

  /**
   * Generate a single asset type
   */
  async generateSingleAsset(options: {
    tenantId: string;
    userId: string;
    assetType: AssetType;
    carName: string;
    carNickname?: string;
    carColor?: string;
    ownerName?: string;
    ownerTag?: string;
    businessName: string;
    location: string;
    hasOwnerPhoto: boolean;
    carImage: { base64: string; mimeType: string };
    personImage?: { base64: string; mimeType: string };
    logos?: Array<{ base64: string; mimeType: string }>;
  }): Promise<GeneratedAsset> {
    const {
      tenantId,
      userId,
      assetType,
      carName,
      carNickname,
      carColor,
      ownerName,
      ownerTag,
      businessName,
      location,
      hasOwnerPhoto,
    } = options;

    // Build the prompt based on asset type
    const prompt = this.buildPromptForAssetType({
      assetType,
      carName,
      carNickname,
      carColor,
      ownerName,
      ownerTag,
      businessName,
      location,
      hasOwnerPhoto,
    });

    // Determine aspect ratio based on asset type
    const aspectRatio = assetType === 'movie-poster' ? '4:5' : '4:5';

    // Generate the image - use reference photo if person image is provided
    let imageResult;
    if (options.personImage && (assetType === 'action-figure' || assetType === 'comic' || assetType === 'movie-poster')) {
      // Use the person's photo as reference to capture their likeness
      imageResult = await geminiService.generateImageWithReference(
        prompt,
        {
          base64: options.personImage.base64,
          mimeType: options.personImage.mimeType,
        },
        { aspectRatio }
      );
    } else {
      imageResult = await geminiService.generateImage(prompt, {
        aspectRatio,
      });
    }

    if (!imageResult.success || !imageResult.imageData) {
      throw new Error(imageResult.error || `Failed to generate ${assetType} image`);
    }

    // Convert to base64 data URL for immediate display
    const base64Data = imageResult.imageData.toString('base64');
    const mimeType = imageResult.mimeType || 'image/png';
    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    // Generate caption
    const caption = generateCaption({
      assetType,
      carName,
      carNickname,
      ownerTag,
      businessName,
    });

    // Save as content
    const content = await prisma.content.create({
      data: {
        tenantId,
        userId,
        tool: 'car_of_day',
        contentType: 'image',
        title: `Car of the Day - ${ASSET_TYPE_INFO[assetType].name} - ${carName}`,
        imageUrl,
        caption,
        status: 'approved',
        moderationStatus: 'passed',
        metadata: {
          assetType,
          carName,
          carNickname,
          ownerName,
        },
      },
    });

    logger.info(`Generated ${assetType} asset`, {
      tenantId,
      contentId: content.id,
      carName,
    });

    return {
      id: content.id,
      type: assetType,
      imageUrl,
      caption,
    };
  },

  /**
   * Build prompt based on asset type
   */
  buildPromptForAssetType(options: {
    assetType: AssetType;
    carName: string;
    carNickname?: string;
    carColor?: string;
    ownerName?: string;
    ownerTag?: string;
    businessName: string;
    location: string;
    hasOwnerPhoto: boolean;
  }): string {
    const {
      assetType,
      carName,
      carNickname,
      carColor,
      ownerName,
      ownerTag,
      businessName,
      location,
      hasOwnerPhoto,
    } = options;

    switch (assetType) {
      case 'official':
        return buildOfficialPrompt({
          carName,
          carColor,
          ownerTag,
          businessName,
          hasOwnerPhoto,
        });

      case 'comic':
        return buildComicPrompt({
          carName,
          carNickname,
          businessName,
        });

      case 'action-figure':
        return buildActionFigurePrompt({
          carName,
          carNickname,
          ownerName,
          businessName,
          hasOwnerPhoto,
        });

      case 'movie-poster':
        return buildMoviePosterPrompt({
          carName,
          carNickname,
          ownerName,
          businessName,
          location,
          hasOwnerPhoto,
        });

      default:
        throw new Error(`Unknown asset type: ${assetType}`);
    }
  },

  /**
   * Get recent Car of the Day content for a tenant
   */
  async getRecentCarOfDay(
    tenantId: string,
    options: { limit?: number } = {}
  ): Promise<Array<{
    id: string;
    carName: string;
    assetType: AssetType;
    imageUrl: string;
    caption: string;
    createdAt: Date;
  }>> {
    const { limit = 20 } = options;

    const content = await prisma.content.findMany({
      where: {
        tenantId,
        tool: 'car_of_day',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return content.map((c) => ({
      id: c.id,
      carName: (c.metadata as any)?.carName || 'Unknown',
      assetType: (c.metadata as any)?.assetType || 'official',
      imageUrl: c.imageUrl || '',
      caption: c.caption || '',
      createdAt: c.createdAt,
    }));
  },

  /**
   * Delete a Car of the Day asset
   */
  async deleteAsset(tenantId: string, contentId: string): Promise<void> {
    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        tenantId,
        tool: 'car_of_day',
      },
    });

    if (!content) {
      throw new Error('Asset not found');
    }

    // Delete from storage if URL exists
    if (content.imageUrl) {
      try {
        await storageService.deleteFile(content.imageUrl);
      } catch (error) {
        logger.warn('Failed to delete image from storage', { error, imageUrl: content.imageUrl });
      }
    }

    // Delete from database
    await prisma.content.delete({
      where: { id: contentId },
    });

    logger.info('Deleted Car of the Day asset', { tenantId, contentId });
  },
};

/**
 * Build the car name from input
 */
function buildCarName(input: CarOfDayInput): string {
  if (input.carNickname) {
    return `"${input.carNickname}"`;
  }

  const parts: string[] = [];
  if (input.carYear) parts.push(input.carYear);
  if (input.carMake) parts.push(input.carMake);
  if (input.carModel) parts.push(input.carModel);

  return parts.length > 0 ? parts.join(' ') : 'Customer Vehicle';
}

/**
 * Generate caption based on asset type
 */
function generateCaption(options: {
  assetType: AssetType;
  carName: string;
  carNickname?: string;
  ownerTag?: string;
  businessName: string;
}): string {
  const { assetType, carName, carNickname, ownerTag, businessName } = options;
  const displayName = carNickname ? `"${carNickname}"` : carName;

  const captions: Record<AssetType, string> = {
    'official': `Check out today's #CarOfTheDay at ${businessName}! \n\nShowcasing this beautiful ${displayName}. ${ownerTag ? `Owned by ${ownerTag}` : ''}\n\nThanks for trusting us with your ride!\n\n#AutoCare #CarSpotlight #${businessName.replace(/\s+/g, '')}`,

    'comic': `It's a bird... It's a plane... It's ${displayName}! \n\n#CarOfTheDay #Comics #AutoHero #${businessName.replace(/\s+/g, '')}`,

    'action-figure': `Collect them all! Today's Limited Edition drop: ${displayName}.\n\n#CarOfTheDay #ToyCollector #LimitedEdition #${businessName.replace(/\s+/g, '')}`,

    'movie-poster': `Coming to a shop near you... \n\nStarring: ${displayName}\nDirected by: ${businessName}\n\n#CarOfTheDay #Blockbuster #ComingSoon #${businessName.replace(/\s+/g, '')}`,
  };

  return captions[assetType];
}

export default carOfDayService;
