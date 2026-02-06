import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import PDFDocument from 'pdfkit';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';
import { geminiService } from '../../services/gemini.service';
import { ValidationError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

const generateSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024).max(2030),
  count: z.number().int().min(1).max(90).default(30),
});

// Get calendar events
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;

    let whereClause: Record<string, unknown> = { tenantId: req.user!.tenantId };

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      whereClause = {
        ...whereClause,
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            thumbnailUrl: true,
            status: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Generate calendar content ideas with profile-aware AI
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = generateSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Validation failed');
    }

    const { month, year, count } = result.data;
    const tenantId = req.user!.tenantId;

    // Get tenant services for context
    const services = await prisma.service.findMany({
      where: { tenantId },
      select: { name: true },
    });

    // Get full brand kit / profile for personalized AI generation
    const brandKit = await prisma.brandKit.findUnique({
      where: { tenantId },
    });

    // Build profile context for AI personalization
    const profileContext = {
      businessName: brandKit?.businessName || undefined,
      city: brandKit?.city || undefined,
      state: brandKit?.state || undefined,
      tagline: brandKit?.tagline || undefined,
      specialties: brandKit?.specialties || [],
      brandVoice: brandKit?.brandVoice || 'friendly',
      uniqueSellingPoints: brandKit?.uniqueSellingPoints || [],
      targetDemographics: brandKit?.targetDemographics || undefined,
      targetPainPoints: brandKit?.targetPainPoints || undefined,
    };

    // Get existing events to avoid duplicates
    const existingEvents = await prisma.calendarEvent.findMany({
      where: {
        tenantId,
        scheduledDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
      select: { suggestedTopic: true },
    });

    // Generate content ideas using profile-aware AI with seasonal awareness
    const ideas = await geminiService.generateContentIdeasWithProfile({
      count,
      month,
      year,
      services: services.map(s => s.name),
      profile: profileContext,
      existingTopics: existingEvents.map(e => e.suggestedTopic).filter(Boolean) as string[],
    });

    // Create calendar events with seasonal tie information
    const events = await prisma.calendarEvent.createMany({
      data: ideas.map(idea => ({
        tenantId,
        scheduledDate: new Date(year, month - 1, parseInt(idea.date)),
        beatType: idea.beatType,
        suggestedTopic: idea.topic,
        suggestedTheme: idea.suggestedTheme,
        aiGenerated: true,
        status: 'suggested',
        notes: idea.seasonalTie ? `Seasonal tie: ${idea.seasonalTie}` : null,
      })),
    });

    logger.info('Calendar events generated with profile context', {
      tenantId,
      count: ideas.length,
      hasProfile: !!brandKit?.businessName,
    });

    res.status(201).json({
      message: 'Calendar events generated',
      count: ideas.length,
      profilePersonalized: !!brandKit?.businessName,
    });
  } catch (error) {
    next(error);
  }
});

// Update calendar event
router.put('/events/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.calendarEvent.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Delete calendar event
router.delete('/events/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.calendarEvent.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Month names for PDF header
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Export calendar (PDF/iCal)
router.get('/export/:format', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format } = req.params;
    const { month, year } = req.query;

    const events = await prisma.calendarEvent.findMany({
      where: {
        tenantId: req.user!.tenantId,
        ...(month && year ? {
          scheduledDate: {
            gte: new Date(Number(year), Number(month) - 1, 1),
            lte: new Date(Number(year), Number(month), 0),
          },
        } : {}),
      },
      orderBy: { scheduledDate: 'asc' },
    });

    if (format === 'ical') {
      // Generate iCal format
      const icalContent = generateICalContent(events, req.tenant!.name);
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename=marketing-calendar.ics');
      res.send(icalContent);
    } else if (format === 'pdf') {
      const monthNum = month ? Number(month) : new Date().getMonth() + 1;
      const yearNum = year ? Number(year) : new Date().getFullYear();
      const monthName = MONTH_NAMES[monthNum - 1];

      const doc = new PDFDocument({ size: 'letter', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=marketing-calendar-${monthNum}-${yearNum}.pdf`);
      doc.pipe(res);

      // Title
      doc.fontSize(24).font('Helvetica-Bold').text('Marketing Calendar', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text(`${monthName} ${yearNum}`, { align: 'center' });
      doc.moveDown(2);

      // Events
      if (events.length === 0) {
        doc.fontSize(12).font('Helvetica').text('No events scheduled for this period.', { align: 'center' });
      } else {
        for (const event of events) {
          doc.fontSize(12).font('Helvetica-Bold')
            .text(`${new Date(event.scheduledDate).toLocaleDateString()} — ${event.suggestedTopic || 'Marketing Post'}`);
          if (event.beatType) {
            doc.fontSize(10).font('Helvetica').text(`Type: ${event.beatType}`);
          }
          if (event.notes) {
            doc.fontSize(10).font('Helvetica').text(event.notes);
          }
          doc.moveDown(0.5);
        }
      }

      doc.end();
      return;
    } else {
      res.status(400).json({ error: 'Invalid format. Use "pdf" or "ical"' });
    }
  } catch (error) {
    next(error);
  }
});

// Helper to generate iCal content
function generateICalContent(events: Array<{ id: string; scheduledDate: Date; suggestedTopic: string | null; beatType: string | null }>, calendarName: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//JW Auto Care//${calendarName}//EN`,
    `X-WR-CALNAME:${calendarName} Marketing Calendar`,
  ];

  events.forEach(event => {
    const dateStr = event.scheduledDate.toISOString().split('T')[0].replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@jwautocare.com`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `SUMMARY:${event.suggestedTopic || 'Marketing Post'}`,
      `DESCRIPTION:Beat Type: ${event.beatType || 'general'}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export default router;
