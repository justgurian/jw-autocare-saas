import { prisma } from '../../db/client';
import { logger } from '../../utils/logger';
import { storageService } from '../../services/storage.service';
import { geminiService } from '../../services/gemini.service';
import { SPOTLIGHT_FORMATS, SPOTLIGHT_FORMAT_IDS, StaffInfo } from './spotlight-formats';

export interface SpotlightInput {
  photoBase64: string;
  staffName: string;
  position?: string;
  yearsExperience?: number;
  specialty?: string;
  funFact?: string;
  nickname?: string;
  certifications?: string[];
  formats: string[];
}

export interface SpotlightResult {
  formatId: string;
  formatName: string;
  contentId: string;
  imageUrl: string;
  error?: string;
}

function parseDataUrl(dataUrl: string): { base64: string; mimeType: string } {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/s);
  if (!match) {
    throw new Error('Invalid data URL format');
  }
  return { mimeType: match[1], base64: match[2] };
}

export const staffSpotlightService = {
  async generate(
    tenantId: string,
    userId: string,
    input: SpotlightInput
  ): Promise<{ results: SpotlightResult[] }> {
    // Fetch tenant for businessName
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const settings = (tenant?.settings as Record<string, any>) || {};
    const businessName = settings.businessName || tenant?.name || undefined;

    // Parse the staff photo
    const { base64, mimeType } = parseDataUrl(input.photoBase64);

    // Build staff info for prompt generation
    const staffInfo: StaffInfo = {
      staffName: input.staffName,
      position: input.position,
      yearsExperience: input.yearsExperience,
      specialty: input.specialty,
      funFact: input.funFact,
      nickname: input.nickname,
      certifications: input.certifications,
      businessName,
    };

    // Resolve the requested formats
    const requestedFormats = input.formats
      .map((id) => SPOTLIGHT_FORMATS.find((f) => f.id === id))
      .filter(Boolean) as typeof SPOTLIGHT_FORMATS;

    logger.info('Staff Spotlight generation started', {
      tenantId,
      staffName: input.staffName,
      formatCount: requestedFormats.length,
      formatIds: requestedFormats.map((f) => f.id),
    });

    // Fire all format generations concurrently
    const settled = await Promise.allSettled(
      requestedFormats.map(async (format) => {
        const prompt = format.buildPrompt(staffInfo);

        logger.info('Generating spotlight format', {
          formatId: format.id,
          staffName: input.staffName,
        });

        const result = await geminiService.generateImageWithReference(
          prompt,
          { base64, mimeType }
        );

        if (!result.success || !result.imageData) {
          throw new Error(result.error || 'Image generation failed');
        }

        // Save image
        const contentId = `spotlight_${format.id}_${Date.now()}`;
        const { url: imageUrl } = await storageService.saveImage(
          result.imageData,
          tenantId,
          contentId,
          result.mimeType || 'image/png'
        );

        // Create Content record
        const content = await prisma.content.create({
          data: {
            tenantId,
            userId,
            tool: 'staff_spotlight',
            contentType: 'image',
            title: `${format.name} - ${input.staffName}`,
            imageUrl,
            caption: `${format.name} featuring ${input.staffName}`,
            status: 'approved',
            moderationStatus: 'passed',
            metadata: {
              formatId: format.id,
              formatName: format.name,
              staffName: input.staffName,
              position: input.position || null,
              specialty: input.specialty || null,
            } as any,
          },
        });

        // Log usage
        await prisma.usageLog.create({
          data: {
            tenantId,
            userId,
            action: 'image_gen',
            tool: 'staff_spotlight',
            creditsUsed: 1,
            metadata: { contentId: content.id, formatId: format.id },
          },
        });

        logger.info('Spotlight format generated', {
          formatId: format.id,
          contentId: content.id,
        });

        return {
          formatId: format.id,
          formatName: format.name,
          contentId: content.id,
          imageUrl,
        } as SpotlightResult;
      })
    );

    // Collect results, including errors for failed formats
    const results: SpotlightResult[] = settled.map((outcome, i) => {
      if (outcome.status === 'fulfilled') {
        return outcome.value;
      }
      const format = requestedFormats[i];
      logger.error('Spotlight format generation failed', {
        formatId: format.id,
        error: (outcome.reason as Error).message,
      });
      return {
        formatId: format.id,
        formatName: format.name,
        contentId: '',
        imageUrl: '',
        error: (outcome.reason as Error).message || 'Generation failed',
      };
    });

    logger.info('Staff Spotlight generation complete', {
      tenantId,
      total: results.length,
      succeeded: results.filter((r) => !r.error).length,
      failed: results.filter((r) => r.error).length,
    });

    return { results };
  },
};

export default staffSpotlightService;
