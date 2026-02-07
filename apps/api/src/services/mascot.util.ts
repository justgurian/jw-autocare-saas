/**
 * Mascot utility — fetch a mascot image from disk and return as base64
 */

import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../db/client';
import { logger } from '../utils/logger';

export interface MascotData {
  base64: string;
  mimeType: string;
  characterPrompt: string;
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

    return { base64, mimeType, characterPrompt };
  } catch (err) {
    logger.error('Failed to fetch mascot as base64', { mascotId, tenantId, error: err });
    return null;
  }
}
