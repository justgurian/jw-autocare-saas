import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import archiver from 'archiver';
import axios from 'axios';
import { PassThrough } from 'stream';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// ============================================================================
// DOWNLOAD SINGLE CONTENT
// ============================================================================

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId,
      },
    });

    if (!content || !content.imageUrl) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    // Fetch the image and stream it
    const response = await axios.get(content.imageUrl, {
      responseType: 'stream',
    });

    const contentType = response.headers['content-type'] || 'image/png';
    const extension = contentType.split('/')[1] || 'png';
    const filename = `${content.title || content.id}.${extension}`.replace(/[^a-zA-Z0-9.-]/g, '_');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    response.data.pipe(res);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// BULK DOWNLOAD AS ZIP
// ============================================================================

const bulkDownloadSchema = z.object({
  contentIds: z.array(z.string().uuid()).min(1).max(100),
  includeCaption: z.boolean().default(true),
});

router.post('/bulk', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = bulkDownloadSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed');
    }

    const { contentIds, includeCaption } = result.data;
    const tenantId = req.user!.tenantId;

    // Get all content
    const contents = await prisma.content.findMany({
      where: {
        id: { in: contentIds },
        tenantId,
      },
    });

    if (contents.length === 0) {
      res.status(404).json({ error: 'No content found' });
      return;
    }

    // Set up ZIP streaming response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="jw-autocare-content-${Date.now()}.zip"`);

    const archive = archiver('zip', {
      zlib: { level: 5 },
    });

    archive.on('error', (err) => {
      logger.error('Archive error', { error: err });
      throw err;
    });

    archive.pipe(res);

    // Add each image to the archive
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      if (!content.imageUrl) continue;

      try {
        const response = await axios.get(content.imageUrl, {
          responseType: 'arraybuffer',
        });

        const contentType = response.headers['content-type'] || 'image/png';
        const extension = contentType.split('/')[1] || 'png';
        const filename = `${String(i + 1).padStart(2, '0')}_${(content.title || content.id).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.${extension}`;

        archive.append(Buffer.from(response.data), { name: filename });

        // Add caption as text file if requested
        if (includeCaption && content.caption) {
          const captionFilename = filename.replace(/\.[^.]+$/, '_caption.txt');
          const captionContent = `Title: ${content.title || 'Untitled'}\n\nCaption:\n${content.caption}${content.captionSpanish ? `\n\nCaption (Spanish):\n${content.captionSpanish}` : ''}`;
          archive.append(captionContent, { name: captionFilename });
        }
      } catch (error) {
        logger.warn('Failed to fetch image for ZIP', { contentId: content.id, error });
      }
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DOWNLOAD CAMPAIGN ASSETS
// ============================================================================

router.get('/campaign/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.batchJob.findFirst({
      where: {
        id: req.params.jobId,
        tenantId: req.user!.tenantId,
        jobType: 'campaign',
      },
      include: {
        content: true,
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const campaignName = ((job.metadata as any)?.campaignName || 'campaign').replace(/[^a-zA-Z0-9]/g, '_');

    // Set up ZIP streaming response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${campaignName}-${Date.now()}.zip"`);

    const archive = archiver('zip', {
      zlib: { level: 5 },
    });

    archive.on('error', (err) => {
      logger.error('Archive error', { error: err });
      throw err;
    });

    archive.pipe(res);

    // Add each content item to the archive
    for (let i = 0; i < job.content.length; i++) {
      const content = job.content[i];
      if (!content.imageUrl) continue;

      try {
        const response = await axios.get(content.imageUrl, {
          responseType: 'arraybuffer',
        });

        const contentType = response.headers['content-type'] || 'image/png';
        const extension = contentType.split('/')[1] || 'png';
        const filename = `${String(i + 1).padStart(2, '0')}_${(content.title || 'content').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.${extension}`;

        archive.append(Buffer.from(response.data), { name: filename });

        // Add caption
        if (content.caption) {
          const captionFilename = filename.replace(/\.[^.]+$/, '_caption.txt');
          const captionContent = `Title: ${content.title || 'Untitled'}\n\nCaption:\n${content.caption}`;
          archive.append(captionContent, { name: captionFilename });
        }
      } catch (error) {
        logger.warn('Failed to fetch image for ZIP', { contentId: content.id, error });
      }
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DOWNLOAD ALL TENANT CONTENT
// ============================================================================

router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contents = await prisma.content.findMany({
      where: {
        tenantId: req.user!.tenantId,
        imageUrl: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 items
    });

    if (contents.length === 0) {
      res.status(404).json({ error: 'No content found' });
      return;
    }

    // Set up ZIP streaming response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="all-content-${Date.now()}.zip"`);

    const archive = archiver('zip', {
      zlib: { level: 5 },
    });

    archive.pipe(res);

    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      if (!content.imageUrl) continue;

      try {
        const response = await axios.get(content.imageUrl, {
          responseType: 'arraybuffer',
        });

        const contentType = response.headers['content-type'] || 'image/png';
        const extension = contentType.split('/')[1] || 'png';
        const filename = `${String(i + 1).padStart(3, '0')}_${(content.title || content.id).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.${extension}`;

        archive.append(Buffer.from(response.data), { name: filename });

        if (content.caption) {
          const captionFilename = filename.replace(/\.[^.]+$/, '_caption.txt');
          archive.append(`Title: ${content.title || 'Untitled'}\n\nCaption:\n${content.caption}`, { name: captionFilename });
        }
      } catch (error) {
        logger.warn('Failed to fetch image for ZIP', { contentId: content.id });
      }
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
});

export default router;
