import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Get all content
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tool, status, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = { tenantId: req.user!.tenantId };
    if (tool) where.tool = tool;
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.content.count({ where }),
    ]);

    res.json({
      content,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single content
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId,
      },
    });

    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json(content);
  } catch (error) {
    next(error);
  }
});

// Update content
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        caption: req.body.caption,
        captionSpanish: req.body.captionSpanish,
        status: req.body.status,
      },
    });
    res.json(content);
  } catch (error) {
    next(error);
  }
});

// Delete content
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.content.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Approve content
router.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        moderationStatus: 'passed',
      },
    });
    res.json(content);
  } catch (error) {
    next(error);
  }
});

// Download content
router.get('/:id/download/:format', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId,
      },
    });

    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    const { format } = req.params;

    if (format === 'png') {
      res.json({
        downloadUrl: content.imageUrl,
        format: 'png',
      });
    } else if (format === 'pdf') {
      res.json({
        downloadUrl: content.pdfUrl || content.imageUrl,
        format: 'pdf',
      });
    } else {
      res.status(400).json({ error: 'Invalid format. Use "png" or "pdf"' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
