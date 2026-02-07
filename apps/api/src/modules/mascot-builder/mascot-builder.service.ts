/**
 * Mascot Builder Service
 * Generates custom Muppet-style mechanic mascots using Gemini image generation.
 *
 * IMPORTANT: This uses Gemini IMAGE generation (gemini-3-pro-image-preview), NOT Veo video.
 */

import { GoogleGenAI } from '@google/genai';
import { config } from '../../config';
import { prisma } from '../../db/client';
import { logger } from '../../utils/logger';
import { storageService } from '../../services/storage.service';
import { MASCOT_OPTIONS, MascotCustomization, MascotResult } from './mascot-options';

const IMAGE_MODEL = 'gemini-3-pro-image-preview';
const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

export const mascotBuilderService = {
  getOptions(): typeof MASCOT_OPTIONS {
    return MASCOT_OPTIONS;
  },

  buildMascotPrompt(input: MascotCustomization): string {
    const furColor = MASCOT_OPTIONS.furColors.find((c) => c.id === input.furColor);
    const eyeStyle = MASCOT_OPTIONS.eyeStyles.find((e) => e.id === input.eyeStyle);
    const hairstyle = MASCOT_OPTIONS.hairstyles.find((h) => h.id === input.hairstyle);
    const outfitColor = MASCOT_OPTIONS.outfitColors.find((o) => o.id === input.outfitColor);
    const accessory = input.accessory
      ? MASCOT_OPTIONS.accessories.find((a) => a.id === input.accessory)
      : null;

    // Look up outfit type description
    const outfitType = MASCOT_OPTIONS.outfitTypes.find(o => o.id === input.outfitType) || MASCOT_OPTIONS.outfitTypes[0];
    const outfitDesc = outfitType.description;

    // Look up seasonal accessory
    const seasonalAcc = input.seasonalAccessory ? MASCOT_OPTIONS.seasonalAccessories.find(s => s.id === input.seasonalAccessory) : null;
    const seasonalDesc = seasonalAcc && seasonalAcc.id !== 'none' && seasonalAcc.description ? ` ${seasonalAcc.description}.` : '';

    const furName = furColor?.name || 'Orange';
    const eyeDesc = eyeStyle?.description || 'Large round googly eyes';
    const hairDesc = hairstyle?.description || 'Short cropped black hair';
    const outfitName = outfitColor?.name || 'Navy Blue';
    const accessoryDesc =
      accessory && accessory.id !== 'none' && accessory.description
        ? ` ${accessory.description}.`
        : '';

    return `A handmade Muppet-style puppet mechanic character. ${furName} shaggy faux-fur covering entire body. ${eyeDesc}. ${hairDesc}. Wide hinged felt mouth with a friendly grin. A small round felt nose. Wearing ${outfitDesc} in ${outfitName} color with a white nametag patch that says '${input.shirtName}'.${accessoryDesc}${seasonalDesc} Three fuzzy fingers on each hand. Practical puppet photography, studio lighting, Jim Henson workshop aesthetic. Full body shot, white/neutral background.`;
  },

  async generateMascot(
    tenantId: string,
    userId: string,
    input: MascotCustomization
  ): Promise<MascotResult> {
    const characterPrompt = this.buildMascotPrompt(input);

    logger.info('Generating mascot image', {
      tenantId,
      shirtName: input.shirtName,
      furColor: input.furColor,
    });

    // Call Gemini image generation
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: 'user', parts: [{ text: characterPrompt }] }],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData);

    if (!imagePart?.inlineData?.data) {
      logger.error('Mascot generation returned no image', {
        partsCount: parts.length,
        partTypes: parts.map((p) =>
          p.inlineData ? 'image' : p.text ? 'text' : 'unknown'
        ),
      });
      throw new Error('Mascot image generation failed - no image in response');
    }

    const imageData = Buffer.from(imagePart.inlineData.data, 'base64');
    const mimeType = imagePart.inlineData.mimeType || 'image/png';

    logger.info('Mascot image generated', {
      size: imageData.length,
      mimeType,
    });

    // Save image via storageService
    const contentId = `mascot_${Date.now()}`;
    const { url: imageUrl } = await storageService.saveImage(
      imageData,
      tenantId,
      contentId,
      mimeType
    );

    // Create Content record
    const content = await prisma.content.create({
      data: {
        tenantId,
        userId,
        tool: 'mascot_builder',
        contentType: 'image',
        title: `Mascot - ${input.shirtName}`,
        imageUrl,
        caption: `Meet ${input.shirtName}, our shop mascot!`,
        status: 'approved',
        moderationStatus: 'passed',
        metadata: {
          shirtName: input.shirtName,
          furColor: input.furColor,
          eyeStyle: input.eyeStyle,
          hairstyle: input.hairstyle,
          outfitColor: input.outfitColor,
          accessory: input.accessory || 'none',
          outfitType: input.outfitType || 'jumpsuit',
          seasonalAccessory: input.seasonalAccessory || 'none',
          personality: input.personality || null,
          characterPrompt,
        } as any,
      },
    });

    // Log usage
    await prisma.usageLog.create({
      data: {
        tenantId,
        userId,
        action: 'image_gen',
        tool: 'mascot_builder',
        creditsUsed: 1,
        metadata: { contentId: content.id },
      },
    });

    logger.info('Mascot saved', { contentId: content.id, tenantId });

    return {
      id: content.id,
      imageUrl,
      characterPrompt,
    };
  },

  async getMascots(tenantId: string) {
    return prisma.content.findMany({
      where: {
        tenantId,
        tool: 'mascot_builder',
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async deleteMascot(tenantId: string, mascotId: string): Promise<void> {
    const content = await prisma.content.findFirst({
      where: {
        id: mascotId,
        tenantId,
        tool: 'mascot_builder',
      },
    });

    if (!content) {
      throw new Error('Mascot not found');
    }

    // Delete image file from disk if stored locally
    if (content.imageUrl) {
      const uploadsIdx = content.imageUrl.indexOf('/uploads/');
      if (uploadsIdx !== -1) {
        const relativePath = content.imageUrl.substring(
          uploadsIdx + '/uploads/'.length
        );
        await storageService.deleteFile(relativePath);
      }
    }

    // Delete from database
    await prisma.content.delete({
      where: { id: mascotId },
    });

    logger.info('Mascot deleted', { tenantId, mascotId });
  },
};

export default mascotBuilderService;
