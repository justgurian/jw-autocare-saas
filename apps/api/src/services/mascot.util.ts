/**
 * Mascot utility — fetch a mascot image from disk and return as base64
 */

import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../db/client';
import { logger } from '../utils/logger';
import { PERSONALITY_PRESETS } from '../modules/mascot-builder/mascot-options';

export interface MascotData {
  base64: string;
  mimeType: string;
  characterPrompt: string;
  personality?: {
    presetId: string;
    catchphrase: string;
    energyLevel: string;
    speakingStyle: string;
  };
  shirtName?: string;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

export async function fetchMascotAsBase64(
  mascotId: string,
  tenantId: string
): Promise<MascotData | null> {
  try {
    const content = await prisma.content.findFirst({
      where: { id: mascotId, tenantId, tool: 'mascot_builder' },
    });

    if (!content || !content.imageUrl) {
      logger.warn('Mascot not found or has no image', { mascotId, tenantId });
      return null;
    }

    const filePath = path.join(process.cwd(), content.imageUrl);
    if (!fs.existsSync(filePath)) {
      logger.warn('Mascot image file not found on disk', { mascotId, filePath });
      return null;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');
    const mimeType = getMimeType(filePath);

    const meta = content.metadata as Record<string, unknown>;
    const characterPrompt = (meta?.characterPrompt as string) || content.caption || '';
    const shirtName = (meta?.shirtName as string) || undefined;

    // Extract personality data if stored
    let personality: MascotData['personality'] | undefined;
    if (meta?.personality && typeof meta.personality === 'object') {
      const p = meta.personality as Record<string, unknown>;
      if (p.presetId) {
        const preset = PERSONALITY_PRESETS.find((pr) => pr.id === p.presetId);
        if (preset) {
          personality = {
            presetId: preset.id,
            catchphrase: (p.catchphrase as string) || preset.defaultCatchphrase,
            energyLevel: (p.energyLevel as string) || preset.energyLevel,
            speakingStyle: preset.speakingStyle,
          };
        }
      }
    }

    return { base64, mimeType, characterPrompt, personality, shirtName };
  } catch (err) {
    logger.error('Failed to fetch mascot as base64', { mascotId, tenantId, error: err });
    return null;
  }
}

export function buildMascotVideoPrompt(options: {
  mascotName: string;
  characterPrompt: string;
  personality?: MascotData['personality'];
  sceneDescription: string;
  businessName: string;
  dialogue?: string;
}): string {
  const { mascotName, characterPrompt, personality, sceneDescription, businessName, dialogue } = options;

  const energyMap: Record<string, string> = {
    low: 'calmly and warmly',
    medium: 'confidently and clearly',
    high: 'enthusiastically and energetically',
    maximum: 'with explosive over-the-top energy, arms waving wildly',
  };
  const energyAdverb = energyMap[personality?.energyLevel || 'high'];

  const speakingNote = personality?.speakingStyle
    ? `Speaking style: ${personality.speakingStyle}.`
    : 'Speaking with enthusiasm and friendliness.';

  const catchphraseNote = personality?.catchphrase
    ? `The character says their signature catchphrase: "${personality.catchphrase}".`
    : '';

  const dialogueSection = dialogue
    ? `The character speaks directly into the camera, saying: "${dialogue}". The mouth moves to clearly match the spoken words.`
    : `The character speaks ${energyAdverb} directly into the camera about ${businessName}. ${catchphraseNote}`;

  return `A Muppet-style puppet character performing in a video. The character is: ${characterPrompt}

SCENE: ${sceneDescription}

PERFORMANCE:
The puppet character is TALKING ${energyAdverb} — their felt mouth opens and closes in clear speech movements. They gesture with their fuzzy three-fingered hands for emphasis. They look directly at the camera with expressive eyes.
${speakingNote}
${dialogueSection}

The background is an auto repair shop with visible signage reading "${businessName}". Cinematic lighting, professional video quality. Practical puppet photography, Jim Henson aesthetic.

CRITICAL: The character must be TALKING with visible mouth movement throughout the video. The mouth should open wide on emphasized words. The puppet should feel alive and animated, not static.`;
}
