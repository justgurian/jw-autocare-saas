import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Get analytics overview
router.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalContent,
      contentThisMonth,
      totalGenerations,
      contentByTool,
    ] = await Promise.all([
      prisma.content.count({ where: { tenantId } }),
      prisma.content.count({
        where: {
          tenantId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.usageLog.count({ where: { tenantId } }),
      prisma.content.groupBy({
        by: ['tool'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    // Calculate time saved (estimate: 30 minutes per piece of content)
    const minutesSaved = totalContent * 30;
    const hoursSaved = Math.round(minutesSaved / 60);

    res.json({
      overview: {
        totalContent,
        contentThisMonth,
        totalGenerations,
        hoursSaved,
      },
      contentByTool: contentByTool.map(item => ({
        tool: item.tool,
        count: item._count,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Get usage statistics
router.get('/usage', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    const usageLogs = await prisma.usageLog.groupBy({
      by: ['action'],
      where: {
        tenantId,
        createdAt: { gte: daysAgo },
      },
      _count: true,
      _sum: {
        creditsUsed: true,
      },
    });

    // Get daily breakdown
    const dailyUsage = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM usage_logs
      WHERE tenant_id = ${tenantId}::uuid
        AND created_at >= ${daysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    res.json({
      summary: usageLogs.map(item => ({
        action: item.action,
        count: item._count,
        creditsUsed: item._sum.creditsUsed,
      })),
      daily: dailyUsage,
    });
  } catch (error) {
    next(error);
  }
});

// Get content statistics
router.get('/content-stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    const [byStatus, byTheme, recentContent] = await Promise.all([
      prisma.content.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      prisma.content.groupBy({
        by: ['theme'],
        where: { tenantId, theme: { not: null } },
        _count: true,
        orderBy: { _count: { theme: 'desc' } },
        take: 10,
      }),
      prisma.content.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          tool: true,
          theme: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
      topThemes: byTheme.map(t => ({ theme: t.theme, count: t._count })),
      recentContent,
    });
  } catch (error) {
    next(error);
  }
});

// Get time saved calculation
router.get('/time-saved', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    // Time estimates per content type (in minutes)
    const timeEstimates: Record<string, number> = {
      promo_flyer: 45,
      instant_pack: 30,
      car_of_day: 20,
      review_reply: 15,
      seo_blog: 120,
      personal_card: 30,
      photo_tuner: 15,
    };

    const contentByTool = await prisma.content.groupBy({
      by: ['tool'],
      where: { tenantId },
      _count: true,
    });

    let totalMinutes = 0;
    const breakdown = contentByTool.map(item => {
      const minutesPerItem = timeEstimates[item.tool] || 30;
      const minutesSaved = item._count * minutesPerItem;
      totalMinutes += minutesSaved;

      return {
        tool: item.tool,
        count: item._count,
        minutesPerItem,
        minutesSaved,
        hoursSaved: Math.round(minutesSaved / 60 * 10) / 10,
      };
    });

    // Calculate value (assuming $50/hour labor cost)
    const hourlyRate = 50;
    const totalHours = totalMinutes / 60;
    const valueSaved = Math.round(totalHours * hourlyRate);

    res.json({
      totalMinutes,
      totalHours: Math.round(totalHours * 10) / 10,
      valueSaved,
      breakdown,
    });
  } catch (error) {
    next(error);
  }
});

// Export analytics
router.get('/export/:format', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format } = req.params;

    if (format === 'csv') {
      // Generate CSV export
      res.json({ message: 'CSV export coming soon' });
    } else if (format === 'pdf') {
      // Generate PDF report
      res.json({ message: 'PDF export coming soon' });
    } else {
      res.status(400).json({ error: 'Invalid format. Use "csv" or "pdf"' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
