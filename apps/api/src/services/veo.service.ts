/**
 * Shared Veo 3.1 Video Generation Service
 * Extracted from video-creator.service.ts for reuse across UGC Creator, Director's Cut, etc.
 *
 * CRITICAL LESSONS (from previous debugging):
 * - Model: veo-3.1-fast-generate-preview (NOT the standard preview)
 * - Veo returns a URI, NOT raw videoBytes — must download with x-goog-api-key header
 * - generateAudio param is NOT supported — Veo generates audio natively
 * - personGeneration: 'allow_adult' is NOT supported via Gemini API
 * - Only valid config params: aspectRatio, numberOfVideos, durationSeconds, resolution, negativePrompt
 */

import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { logger } from '../utils/logger';

const VEO_MODEL = 'veo-3.1-fast-generate-preview';
const HARD_TIMEOUT_MS = 6 * 60 * 1000; // 6 minutes
const POLL_INTERVAL_MS = 10_000; // 10 seconds
const MAX_POLLS = 30; // 5 minutes max polling

const veoAI = new GoogleGenAI({ apiKey: config.gemini.apiKey });

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VeoConfig {
  aspectRatio?: '16:9' | '9:16';
  durationSeconds?: number;
  resolution?: '720p' | '1080p';
  negativePrompt?: string;
}

export interface VeoImage {
  imageBytes: string; // base64
  mimeType: string;
}

export interface VeoReferenceImage {
  base64: string;
  mimeType: string;
}

export interface VeoResult {
  success: boolean;
  videoData?: Buffer;
  error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isRetryableError(error?: string): boolean {
  if (!error) return false;
  const retryablePatterns = [
    'INTERNAL',
    'UNAVAILABLE',
    'DEADLINE_EXCEEDED',
    'RESOURCE_EXHAUSTED',
    'timed out',
    'timeout',
    '503',
    '500',
    '429',
    'rate limit',
    'overloaded',
  ];
  const lower = error.toLowerCase();
  return retryablePatterns.some((p) => lower.includes(p.toLowerCase()));
}

async function extractVideoData(video: any): Promise<Buffer> {
  // Try direct bytes first
  if (video.videoBytes && video.videoBytes.length > 0) {
    return Buffer.from(video.videoBytes);
  }

  // Download via URI — requires API key in header
  if (video.uri) {
    logger.info('Downloading video from URI', { uri: video.uri });
    const response = await fetch(video.uri, {
      headers: { 'x-goog-api-key': config.gemini.apiKey },
    });
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
    }
    const data = Buffer.from(await response.arrayBuffer());
    logger.info('Video downloaded', { size: data.length });
    return data;
  }

  // Fallback: SDK download
  try {
    const tmpPath = `/tmp/veo-${Date.now()}.mp4`;
    await veoAI.files.download({ file: video, downloadPath: tmpPath } as any);
    const fs = await import('fs');
    const data = fs.readFileSync(tmpPath);
    fs.unlinkSync(tmpPath);
    return data;
  } catch (dlError: any) {
    logger.error('All video extraction methods failed', {
      videoKeys: Object.keys(video),
      downloadError: dlError.message,
    });
    throw new Error('Could not extract video data from Veo response');
  }
}

async function pollOperation(operation: any): Promise<any> {
  let pollCount = 0;
  while (!operation.done && pollCount < MAX_POLLS) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    pollCount++;
    operation = await veoAI.operations.getVideosOperation({ operation });
    logger.info('Veo 3.1 poll', { pollCount, done: operation.done });
  }
  return operation;
}

async function callVeo(
  prompt: string,
  veoConfig: VeoConfig,
  image?: VeoImage
): Promise<VeoResult> {
  try {
    const generateConfig: any = {
      aspectRatio: veoConfig.aspectRatio || '9:16',
      numberOfVideos: 1,
      durationSeconds: veoConfig.durationSeconds || 8,
      resolution: veoConfig.resolution || '720p',
    };

    if (veoConfig.negativePrompt) {
      generateConfig.negativePrompt = veoConfig.negativePrompt;
    }

    const generateParams: any = {
      model: VEO_MODEL,
      prompt,
      config: generateConfig,
    };

    if (image) {
      generateParams.image = {
        imageBytes: image.imageBytes,
        mimeType: image.mimeType,
      };
    }

    let operation = await veoAI.models.generateVideos(generateParams);
    operation = await pollOperation(operation);

    if (!operation.done) {
      return { success: false, error: 'Video generation timed out after 5 minutes' };
    }

    const generatedVideo = operation.response?.generatedVideos?.[0];
    if (!generatedVideo?.video) {
      logger.error('No video in Veo response', {
        hasResponse: !!operation.response,
        generatedVideosCount: operation.response?.generatedVideos?.length,
      });
      return { success: false, error: 'No video in response' };
    }

    const videoData = await extractVideoData(generatedVideo.video);
    return { success: true, videoData };
  } catch (error: any) {
    logger.error('Veo 3.1 video generation failed', { error: error.message });

    if (error.message?.includes('SAFETY')) {
      return { success: false, error: 'Video blocked by safety filters. Try a different prompt.' };
    }

    return { success: false, error: error.message || 'Video generation failed' };
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const veoService = {
  /**
   * Generate video from text prompt (UGC Creator, Commercial, etc.)
   */
  async generateVideo(prompt: string, veoConfig: VeoConfig = {}): Promise<VeoResult> {
    if (!config.gemini.apiKey) {
      return { success: false, error: 'Gemini API key not configured.' };
    }

    const generate = () => callVeo(prompt, veoConfig);
    const timeout = new Promise<VeoResult>((resolve) =>
      setTimeout(() => resolve({ success: false, error: 'Video generation hard timeout after 6 minutes' }), HARD_TIMEOUT_MS)
    );

    let result = await Promise.race([generate(), timeout]);

    // Single retry on transient errors
    if (!result.success && isRetryableError(result.error)) {
      logger.info('Retrying video generation after retryable error', { error: result.error });
      await new Promise((resolve) => setTimeout(resolve, 5000));
      result = await Promise.race([callVeo(prompt, veoConfig), timeout]);
    }

    return result;
  },

  /**
   * Generate video from image + prompt (Director's Cut, flyer animation, etc.)
   * The image is used as the first frame / reference.
   */
  async generateVideoFromImage(
    prompt: string,
    image: VeoImage,
    veoConfig: VeoConfig = {}
  ): Promise<VeoResult> {
    if (!config.gemini.apiKey) {
      return { success: false, error: 'Gemini API key not configured.' };
    }

    const generate = () => callVeo(prompt, veoConfig, image);
    const timeout = new Promise<VeoResult>((resolve) =>
      setTimeout(() => resolve({ success: false, error: 'Video generation hard timeout after 6 minutes' }), HARD_TIMEOUT_MS)
    );

    let result = await Promise.race([generate(), timeout]);

    // Single retry on transient errors
    if (!result.success && isRetryableError(result.error)) {
      logger.info('Retrying image-to-video generation after retryable error', { error: result.error });
      await new Promise((resolve) => setTimeout(resolve, 5000));
      result = await Promise.race([callVeo(prompt, veoConfig, image), timeout]);
    }

    return result;
  },
};

export default veoService;
