/**
 * Settings Routes
 * Handles user and tenant settings including Auto-Pilot
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma } from '../../db/client';
import { logger } from '../../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticate);

interface AutoPilotSettings {
  enabled: boolean;
  frequency: 'daily' | '3x-week' | 'weekly';
  postingTimes: string[];
  platforms: {
    facebook: boolean;
    instagram: boolean;
  };
  contentTypes: {
    promos: boolean;
    tips: boolean;
    memes: boolean;
    seasonal: boolean;
  };
  autoApprove: boolean;
}

const defaultAutoPilotSettings: AutoPilotSettings = {
  enabled: false,
  frequency: '3x-week',
  postingTimes: ['09:00', '12:00', '17:00'],
  platforms: {
    facebook: true,
    instagram: true,
  },
  contentTypes: {
    promos: true,
    tips: true,
    memes: true,
    seasonal: true,
  },
  autoApprove: false,
};

/**
 * GET /settings/auto-pilot
 * Get auto-pilot settings for the current tenant
 */
router.get('/auto-pilot', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const settings = (tenant?.settings as Record<string, unknown>)?.autoPilot as AutoPilotSettings | undefined;

    res.json(settings || defaultAutoPilotSettings);
  } catch (error) {
    logger.error('Failed to get auto-pilot settings', { error });
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

/**
 * PUT /settings/auto-pilot
 * Update auto-pilot settings for the current tenant
 */
router.put('/auto-pilot', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const settings: AutoPilotSettings = req.body;

    // Validate settings
    if (typeof settings.enabled !== 'boolean') {
      return res.status(400).json({ error: 'Invalid settings: enabled must be a boolean' });
    }

    if (!['daily', '3x-week', 'weekly'].includes(settings.frequency)) {
      return res.status(400).json({ error: 'Invalid settings: invalid frequency' });
    }

    if (!Array.isArray(settings.postingTimes) || settings.postingTimes.length === 0) {
      return res.status(400).json({ error: 'Invalid settings: postingTimes must be a non-empty array' });
    }

    // Persist settings to database
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const currentSettings = (tenant?.settings || {}) as Record<string, unknown>;
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...currentSettings,
          autoPilot: settings,
        } as any,
      },
    });

    logger.info('Auto-pilot settings updated', { tenantId, enabled: settings.enabled });

    res.json({ success: true, settings });
  } catch (error) {
    logger.error('Failed to update auto-pilot settings', { error });
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * POST /settings/auto-pilot/toggle
 * Quick toggle for auto-pilot enabled state
 */
router.post('/auto-pilot/toggle', async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const tenantSettings = (tenant?.settings || {}) as Record<string, unknown>;
    const currentAutoPilot = (tenantSettings.autoPilot as AutoPilotSettings) || { ...defaultAutoPilotSettings };

    currentAutoPilot.enabled = !currentAutoPilot.enabled;

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...tenantSettings,
          autoPilot: currentAutoPilot,
        } as any,
      },
    });

    logger.info('Auto-pilot toggled', { tenantId, enabled: currentAutoPilot.enabled });

    res.json({ success: true, enabled: currentAutoPilot.enabled });
  } catch (error) {
    logger.error('Failed to toggle auto-pilot', { error });
    res.status(500).json({ error: 'Failed to toggle auto-pilot' });
  }
});

export default router;
