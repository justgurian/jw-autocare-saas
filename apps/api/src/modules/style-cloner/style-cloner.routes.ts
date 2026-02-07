import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireOwner } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { extractStyleFromImage, generatePreview, ExtractedStyle } from '../../services/style-cloner.service';
import { customThemeStore } from '../../services/custom-theme-store';
import { analyzeSchema, saveSchema, updateThemeSchema } from './style-cloner.types';

const router = Router();

// All routes require auth + tenant
router.use(authenticate, tenantContext);

// ============================================================================
// ADMIN ENDPOINTS (owner/super_admin only)
// ============================================================================

// POST /analyze — Upload reference image, get extracted style
router.post('/analyze', requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = analyzeSchema.parse(req.body);
    logger.info('Style cloner: analyzing reference image', { tenantId: req.user!.tenantId });

    const style = await extractStyleFromImage(parsed.imageBase64, parsed.mimeType);

    res.json({ success: true, data: style });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request', details: err.errors });
    }
    next(err);
  }
});

// POST /save — Save extracted style as draft custom theme
router.post('/save', requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = saveSchema.parse(req.body);
    const tenantId = req.user!.tenantId;

    // Save reference image to disk
    const uploadsDir = path.join(process.cwd(), 'uploads', 'style-cloner', tenantId);
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = parsed.referenceMimeType.split('/')[1] || 'png';
    const filename = `ref_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(parsed.referenceImageBase64, 'base64'));

    const relativeImageUrl = `uploads/style-cloner/${tenantId}/${filename}`;

    // Create Content record
    const content = await prisma.content.create({
      data: {
        id: uuidv4(),
        tenantId,
        tool: 'style_cloner',
        contentType: 'theme',
        title: parsed.name,
        caption: parsed.shortDescription || '',
        imageUrl: relativeImageUrl,
        status: 'draft',
        metadata: {
          name: parsed.name,
          shortDescription: parsed.shortDescription || '',
          sourceIndustry: parsed.sourceIndustry || 'unknown',
          imagePrompt: parsed.imagePrompt,
          compositionNotes: parsed.compositionNotes || '',
          avoidList: parsed.avoidList || '',
          previewColors: parsed.previewColors || [],
          textPrompt: parsed.textPrompt || { tone: 'professional', vocabulary: [] },
        } as any,
      },
    });

    res.json({
      success: true,
      data: {
        id: content.id,
        themeId: `custom-${content.id}`,
        name: content.title,
        status: content.status,
      },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request', details: err.errors });
    }
    next(err);
  }
});

// POST /preview/:id — Generate sample flyer from saved theme
router.post('/preview/:id', requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.findFirst({
      where: { id: req.params.id, tool: 'style_cloner', tenantId: req.user!.tenantId },
    });

    if (!content) {
      return res.status(404).json({ error: 'Custom theme not found' });
    }

    const meta = content.metadata as Record<string, any>;
    const style: ExtractedStyle = {
      name: meta.name || content.title,
      shortDescription: meta.shortDescription || content.caption || '',
      sourceIndustry: meta.sourceIndustry || 'unknown',
      imagePrompt: meta.imagePrompt,
      compositionNotes: meta.compositionNotes || '',
      avoidList: meta.avoidList || '',
      previewColors: meta.previewColors || [],
      textPrompt: meta.textPrompt || { tone: 'professional', vocabulary: [] },
    };

    // Read reference image
    const refPath = path.join(process.cwd(), content.imageUrl || '');
    if (!content.imageUrl || !fs.existsSync(refPath)) {
      return res.status(400).json({ error: 'Reference image not found on disk' });
    }

    const refBuffer = fs.readFileSync(refPath);
    const refBase64 = refBuffer.toString('base64');
    const refExt = path.extname(refPath).toLowerCase();
    const refMime = refExt === '.png' ? 'image/png' : refExt === '.webp' ? 'image/webp' : 'image/jpeg';

    const result = await generatePreview(style, refBase64, refMime);

    if (!result.success || !result.imageData) {
      return res.status(500).json({ error: result.error || 'Preview generation failed' });
    }

    // Save preview image
    const previewDir = path.join(process.cwd(), 'uploads', 'style-cloner', req.user!.tenantId, 'previews');
    fs.mkdirSync(previewDir, { recursive: true });
    const previewFilename = `preview_${Date.now()}.${result.mimeType?.split('/')[1] || 'png'}`;
    const previewPath = path.join(previewDir, previewFilename);
    fs.writeFileSync(previewPath, result.imageData);

    const previewUrl = `uploads/style-cloner/${req.user!.tenantId}/previews/${previewFilename}`;

    // Update content with preview URL
    await prisma.content.update({
      where: { id: content.id },
      data: {
        status: 'testing',
        metadata: { ...meta, previewImageUrl: `/${previewUrl}` } as any,
      },
    });

    res.json({
      success: true,
      data: {
        previewUrl: `/${previewUrl}`,
        themeId: `custom-${content.id}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /deploy/:id — Set theme status to approved (live for all users)
router.put('/deploy/:id', requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.findFirst({
      where: { id: req.params.id, tool: 'style_cloner', tenantId: req.user!.tenantId },
    });

    if (!content) {
      return res.status(404).json({ error: 'Custom theme not found' });
    }

    await prisma.content.update({
      where: { id: content.id },
      data: { status: 'approved' },
    });

    await customThemeStore.forceRefresh();

    res.json({
      success: true,
      data: { id: content.id, themeId: `custom-${content.id}`, status: 'approved' },
    });
  } catch (err) {
    next(err);
  }
});

// GET /themes — List all custom themes (admin view)
router.get('/themes', requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contents = await prisma.content.findMany({
      where: { tool: 'style_cloner', contentType: 'theme', tenantId: req.user!.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const themes = contents.map((c) => {
      const meta = c.metadata as Record<string, any>;
      return {
        id: c.id,
        themeId: `custom-${c.id}`,
        name: c.title,
        shortDescription: c.caption,
        status: c.status,
        referenceImageUrl: c.imageUrl ? `/${c.imageUrl}` : null,
        previewImageUrl: meta?.previewImageUrl || null,
        previewColors: meta?.previewColors || [],
        sourceIndustry: meta?.sourceIndustry || 'unknown',
        createdAt: c.createdAt,
      };
    });

    res.json({ success: true, data: themes });
  } catch (err) {
    next(err);
  }
});

// GET /themes/:id — Get single custom theme
router.get('/themes/:id', requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.findFirst({
      where: { id: req.params.id, tool: 'style_cloner', tenantId: req.user!.tenantId },
    });

    if (!content) {
      return res.status(404).json({ error: 'Custom theme not found' });
    }

    const meta = content.metadata as Record<string, any>;
    res.json({
      success: true,
      data: {
        id: content.id,
        themeId: `custom-${content.id}`,
        name: content.title,
        shortDescription: content.caption,
        status: content.status,
        referenceImageUrl: content.imageUrl ? `/${content.imageUrl}` : null,
        previewImageUrl: meta?.previewImageUrl || null,
        style: meta,
        createdAt: content.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /themes/:id — Update theme fields
router.put('/themes/:id', requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateThemeSchema.parse(req.body);
    const content = await prisma.content.findFirst({
      where: { id: req.params.id, tool: 'style_cloner', tenantId: req.user!.tenantId },
    });

    if (!content) {
      return res.status(404).json({ error: 'Custom theme not found' });
    }

    const existingMeta = (content.metadata as Record<string, any>) || {};
    const updatedMeta = { ...existingMeta };

    if (parsed.imagePrompt) updatedMeta.imagePrompt = parsed.imagePrompt;
    if (parsed.compositionNotes !== undefined) updatedMeta.compositionNotes = parsed.compositionNotes;
    if (parsed.avoidList !== undefined) updatedMeta.avoidList = parsed.avoidList;
    if (parsed.previewColors) updatedMeta.previewColors = parsed.previewColors;
    if (parsed.textPrompt) updatedMeta.textPrompt = parsed.textPrompt;
    if (parsed.shortDescription !== undefined) updatedMeta.shortDescription = parsed.shortDescription;

    await prisma.content.update({
      where: { id: content.id },
      data: {
        title: parsed.name || content.title,
        caption: parsed.shortDescription || content.caption,
        metadata: updatedMeta as any,
      },
    });

    if (content.status === 'approved') {
      await customThemeStore.forceRefresh();
    }

    res.json({ success: true });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request', details: err.errors });
    }
    next(err);
  }
});

// DELETE /themes/:id — Soft delete (archive)
router.delete('/themes/:id', requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await prisma.content.findFirst({
      where: { id: req.params.id, tool: 'style_cloner', tenantId: req.user!.tenantId },
    });

    if (!content) {
      return res.status(404).json({ error: 'Custom theme not found' });
    }

    await prisma.content.update({
      where: { id: content.id },
      data: { status: 'archived' },
    });

    if (content.status === 'approved') {
      await customThemeStore.forceRefresh();
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// USER ENDPOINTS (any authenticated user)
// ============================================================================

// GET /new-styles — Get deployed themes user hasn't decided on
router.get('/new-styles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    // Get user's preferences
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const settings = (tenant?.settings as Record<string, any>) || {};
    const prefs = settings.stylePreferences || {};
    const approved: string[] = prefs.approvedCustomThemes || [];
    const rejected: string[] = prefs.rejectedCustomThemes || [];
    const decided = new Set([...approved, ...rejected]);

    // Get all deployed custom themes
    const deployed = await prisma.content.findMany({
      where: { tool: 'style_cloner', contentType: 'theme', status: 'approved' },
      orderBy: { createdAt: 'desc' },
    });

    const newStyles = deployed
      .filter((c) => !decided.has(`custom-${c.id}`))
      .map((c) => {
        const meta = c.metadata as Record<string, any>;
        return {
          id: c.id,
          themeId: `custom-${c.id}`,
          name: c.title,
          shortDescription: c.caption,
          previewImageUrl: meta?.previewImageUrl || null,
          previewColors: meta?.previewColors || [],
          sourceIndustry: meta?.sourceIndustry || 'unknown',
        };
      });

    res.json({ success: true, data: newStyles });
  } catch (err) {
    next(err);
  }
});

// POST /approve/:id — User approves a custom theme
router.post('/approve/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const themeId = `custom-${req.params.id}`;
    const tenantId = req.user!.tenantId;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const settings = (tenant?.settings as Record<string, any>) || {};
    const prefs = settings.stylePreferences || {};
    const approved: string[] = prefs.approvedCustomThemes || [];
    const rejected: string[] = prefs.rejectedCustomThemes || [];

    if (!approved.includes(themeId)) {
      approved.push(themeId);
    }
    // Remove from rejected if it was there
    const filteredRejected = rejected.filter((id: string) => id !== themeId);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          stylePreferences: {
            ...prefs,
            approvedCustomThemes: approved,
            rejectedCustomThemes: filteredRejected,
          },
        } as any,
      },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /reject/:id — User rejects a custom theme
router.post('/reject/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const themeId = `custom-${req.params.id}`;
    const tenantId = req.user!.tenantId;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const settings = (tenant?.settings as Record<string, any>) || {};
    const prefs = settings.stylePreferences || {};
    const approved: string[] = prefs.approvedCustomThemes || [];
    const rejected: string[] = prefs.rejectedCustomThemes || [];

    if (!rejected.includes(themeId)) {
      rejected.push(themeId);
    }
    const filteredApproved = approved.filter((id: string) => id !== themeId);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...settings,
          stylePreferences: {
            ...prefs,
            approvedCustomThemes: filteredApproved,
            rejectedCustomThemes: rejected,
          },
        } as any,
      },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
