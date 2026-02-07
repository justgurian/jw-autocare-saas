import { prisma } from '../../db/client';
import { logger } from '../../utils/logger';
import { storageService } from '../../services/storage.service';
import { JINGLE_GENRES, getGenreById } from './genres';
import { phoneticize } from './phoneticizer';
import {
  CompositionPlan,
  JingleGenerationInput,
  JingleJob,
} from './jingle-generator.types';

export const jingleGeneratorService = {
  getGenres() {
    return JINGLE_GENRES.map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      description: g.description,
    }));
  },

  phoneticize(shopName: string): string {
    return phoneticize(shopName);
  },

  /**
   * Build composition plan for Easy Mode — repeats the phoneticized shop name
   */
  buildEasyCompositionPlan(phoneticName: string, genreId: string): CompositionPlan {
    const genre = getGenreById(genreId);
    if (!genre) throw new Error(`Unknown genre: ${genreId}`);

    return {
      positive_global_styles: genre.positiveGlobalStyles,
      negative_global_styles: genre.negativeGlobalStyles,
      sections: [
        {
          section_name: 'Intro',
          positive_local_styles: genre.introOutroLocalStyles,
          negative_local_styles: ['vocals', 'lyrics', 'singing'],
          duration_ms: 5000,
          lines: [],
        },
        {
          section_name: 'Chorus 1',
          positive_local_styles: genre.chorusLocalStyles,
          negative_local_styles: [],
          duration_ms: 10000,
          lines: [phoneticName, phoneticName, phoneticName],
        },
        {
          section_name: 'Break',
          positive_local_styles: [...genre.introOutroLocalStyles, 'building energy'],
          negative_local_styles: [],
          duration_ms: 5000,
          lines: [],
        },
        {
          section_name: 'Chorus 2',
          positive_local_styles: [...genre.chorusLocalStyles, 'building energy', 'climax'],
          negative_local_styles: [],
          duration_ms: 10000,
          lines: [phoneticName, phoneticName, phoneticName],
        },
        {
          section_name: 'Outro',
          positive_local_styles: [...genre.introOutroLocalStyles, 'final tag', 'ending'],
          negative_local_styles: [],
          duration_ms: 3000,
          lines: [phoneticName],
        },
      ],
    };
  },

  /**
   * Build composition plan for Custom Mode — user-provided genre/lyrics
   */
  buildCustomCompositionPlan(
    genreId: string,
    customGenre: string | undefined,
    customLyrics: string | undefined,
    phoneticName: string
  ): CompositionPlan {
    const genre = getGenreById(genreId);

    // Determine style keywords — use custom genre text or fall back to preset
    const globalStyles = customGenre
      ? [customGenre, 'catchy', 'memorable hook']
      : genre?.positiveGlobalStyles || ['catchy', 'upbeat', 'memorable'];
    const negativeStyles = genre?.negativeGlobalStyles || [];
    const chorusStyles = customGenre
      ? [customGenre, 'catchy chorus', 'strong vocals']
      : genre?.chorusLocalStyles || ['catchy chorus', 'strong vocals'];
    const instrumentalStyles = customGenre
      ? [customGenre, 'instrumental']
      : genre?.introOutroLocalStyles || ['instrumental intro'];

    // Determine lyrics — use custom lyrics or fall back to phonetic name
    const lyrics = customLyrics
      ? customLyrics.split('\n').filter((line) => line.trim())
      : [phoneticName, phoneticName, phoneticName];

    return {
      positive_global_styles: globalStyles,
      negative_global_styles: negativeStyles,
      sections: [
        {
          section_name: 'Intro',
          positive_local_styles: instrumentalStyles,
          negative_local_styles: ['vocals', 'lyrics', 'singing'],
          duration_ms: 5000,
          lines: [],
        },
        {
          section_name: 'Verse',
          positive_local_styles: chorusStyles,
          negative_local_styles: [],
          duration_ms: 12000,
          lines: lyrics.slice(0, 4),
        },
        {
          section_name: 'Break',
          positive_local_styles: [...instrumentalStyles, 'building energy'],
          negative_local_styles: [],
          duration_ms: 4000,
          lines: [],
        },
        {
          section_name: 'Chorus',
          positive_local_styles: [...chorusStyles, 'building energy', 'climax'],
          negative_local_styles: [],
          duration_ms: 12000,
          lines: lyrics.length > 4 ? lyrics.slice(4, 8) : lyrics.slice(0, 4),
        },
        {
          section_name: 'Outro',
          positive_local_styles: [...instrumentalStyles, 'final tag', 'ending'],
          negative_local_styles: [],
          duration_ms: 3000,
          lines: [lyrics[0] || phoneticName],
        },
      ],
    };
  },

  async startGeneration(
    tenantId: string,
    userId: string,
    input: JingleGenerationInput
  ): Promise<JingleJob> {
    const genre = getGenreById(input.genreId);
    const mode = input.mode || 'easy';

    const phoneticName = phoneticize(input.shopName);

    const compositionPlan =
      mode === 'custom'
        ? this.buildCustomCompositionPlan(input.genreId, input.customGenre, input.customLyrics, phoneticName)
        : this.buildEasyCompositionPlan(phoneticName, input.genreId);

    const genreName = input.customGenre || genre?.name || input.genreId;

    const job = await prisma.batchJob.create({
      data: {
        tenantId,
        userId,
        jobType: 'jingle_generator_audio',
        totalItems: 1,
        completedItems: 0,
        status: 'pending',
        metadata: {
          shopName: input.shopName,
          genreId: input.genreId,
          genreName,
          phoneticName,
          mode,
          customGenre: input.customGenre,
          customLyrics: input.customLyrics,
        } as any,
      },
    });

    logger.info('Jingle generation job created', {
      jobId: job.id,
      tenantId,
      shopName: input.shopName,
      genreId: input.genreId,
      mode,
      phoneticName,
    });

    // Fire-and-forget
    this.processGeneration(job.id, tenantId, userId, input, phoneticName, genreName, compositionPlan).catch(
      (error) => {
        logger.error('Jingle generation failed', {
          jobId: job.id,
          error: error instanceof Error ? error.message : error,
        });
      }
    );

    return {
      id: job.id,
      status: 'pending',
      progress: 0,
      createdAt: job.createdAt,
    };
  },

  async processGeneration(
    jobId: string,
    tenantId: string,
    userId: string,
    input: JingleGenerationInput,
    phoneticName: string,
    genreName: string,
    compositionPlan: CompositionPlan
  ): Promise<void> {
    try {
      // Update job to processing
      await prisma.batchJob.update({
        where: { id: jobId },
        data: { status: 'processing', startedAt: new Date() },
      });

      // Check for API key
      if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY environment variable is not set');
      }

      // Call ElevenLabs Music API
      const response = await fetch(
        'https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            composition_plan: compositionPlan,
            respect_sections_durations: true,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
      }

      // Response is raw binary audio
      const audioBuffer = Buffer.from(await response.arrayBuffer());

      // Save audio file via storage service (returns URL string directly)
      const audioUrl = await storageService.uploadBuffer(
        audioBuffer,
        `audio/${tenantId}/jingle_${jobId}.mp3`,
        'audio/mpeg'
      );

      // Create Content record
      const content = await prisma.content.create({
        data: {
          tenantId,
          userId,
          tool: 'jingle_generator',
          contentType: 'audio',
          title: `${input.shopName} - ${genreName} Jingle`,
          imageUrl: '',
          caption: '',
          status: 'approved',
          moderationStatus: 'passed',
          metadata: {
            audioUrl,
            shopName: input.shopName,
            genreId: input.genreId,
            genreName,
            phoneticName,
            mode: input.mode || 'easy',
            customGenre: input.customGenre,
            customLyrics: input.customLyrics,
            duration: '30s',
            jobId,
          } as any,
        },
      });

      // Update job to completed
      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          completedItems: 1,
          completedAt: new Date(),
          metadata: {
            contentId: content.id,
            audioUrl,
            shopName: input.shopName,
            genreId: input.genreId,
            genreName,
            phoneticName,
          } as any,
        },
      });

      logger.info('Jingle generation completed', {
        jobId,
        contentId: content.id,
        audioUrl,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          failedItems: 1,
          completedAt: new Date(),
          metadata: {
            error: errorMessage,
            failedAt: new Date().toISOString(),
          } as any,
        },
      });

      logger.error('Jingle generation failed', {
        jobId,
        error: errorMessage,
      });
      throw error;
    }
  },

  async getJobStatus(tenantId: string, jobId: string): Promise<JingleJob | null> {
    const job = await prisma.batchJob.findFirst({
      where: {
        id: jobId,
        tenantId,
        jobType: 'jingle_generator_audio',
      },
    });

    if (!job) return null;

    const metadata = job.metadata as Record<string, unknown>;

    return {
      id: job.id,
      status: job.status as JingleJob['status'],
      progress: (() => {
        if (job.status === 'completed') return 100;
        if (job.status === 'failed') return 0;
        if (job.status === 'processing' && job.startedAt) {
          const elapsedMs = Date.now() - job.startedAt.getTime();
          const elapsedSec = elapsedMs / 1000;
          const estimatedTotalSec = 45;
          const pct = Math.min(95, Math.round((elapsedSec / estimatedTotalSec) * 100));
          return Math.max(5, pct);
        }
        return 0;
      })(),
      audioUrl: metadata.audioUrl as string | undefined,
      contentId: metadata.contentId as string | undefined,
      error: metadata.error as string | undefined,
      createdAt: job.createdAt,
    };
  },

  async getHistory(
    tenantId: string,
    opts: { limit?: number; offset?: number } = {}
  ) {
    const { limit = 20, offset = 0 } = opts;

    const items = await prisma.content.findMany({
      where: {
        tenantId,
        tool: 'jingle_generator',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return items.map((item) => {
      const metadata = item.metadata as Record<string, unknown>;
      return {
        id: item.id,
        title: item.title,
        audioUrl: metadata.audioUrl as string | undefined,
        shopName: metadata.shopName as string | undefined,
        genreId: metadata.genreId as string | undefined,
        genreName: metadata.genreName as string | undefined,
        phoneticName: metadata.phoneticName as string | undefined,
        createdAt: item.createdAt,
      };
    });
  },

  async deleteContent(tenantId: string, contentId: string): Promise<void> {
    const content = await prisma.content.findFirst({
      where: { id: contentId, tenantId, tool: 'jingle_generator' },
    });

    if (!content) throw new Error('Content not found');

    const metadata = content.metadata as Record<string, unknown>;
    const audioUrl = metadata.audioUrl as string | undefined;

    // Delete audio file if it exists
    if (audioUrl) {
      const uploadsIdx = audioUrl.indexOf('/uploads/');
      if (uploadsIdx !== -1) {
        const relativePath = audioUrl.substring(uploadsIdx + '/uploads/'.length);
        await storageService.deleteFile(relativePath);
      }
    }

    // Delete content record
    await prisma.content.delete({ where: { id: contentId } });

    logger.info('Jingle content deleted', { contentId, tenantId });
  },
};

export default jingleGeneratorService;
