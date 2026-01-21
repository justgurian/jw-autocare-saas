/**
 * Settings Routes
 * Handles user and tenant settings including Auto-Pilot
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
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

// In-memory storage for demo (would be in database in production)
const autoPilotStore = new Map<string, AutoPilotSettings>();

/**
 * GET /settings/auto-pilot
 * Get auto-pilot settings for the current tenant
 */
router.get('/auto-pilot', (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const settings = autoPilotStore.get(tenantId) || {
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

    res.json(settings);
  } catch (error) {
    logger.error('Failed to get auto-pilot settings', { error });
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

/**
 * PUT /settings/auto-pilot
 * Update auto-pilot settings for the current tenant
 */
router.put('/auto-pilot', (req: Request, res: Response) => {
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

    // Store settings
    autoPilotStore.set(tenantId, settings);

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
router.post('/auto-pilot/toggle', (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const currentSettings = autoPilotStore.get(tenantId) || {
      enabled: false,
      frequency: '3x-week' as const,
      postingTimes: ['09:00', '12:00', '17:00'],
      platforms: { facebook: true, instagram: true },
      contentTypes: { promos: true, tips: true, memes: true, seasonal: true },
      autoApprove: false,
    };

    currentSettings.enabled = !currentSettings.enabled;
    autoPilotStore.set(tenantId, currentSettings);

    logger.info('Auto-pilot toggled', { tenantId, enabled: currentSettings.enabled });

    res.json({ success: true, enabled: currentSettings.enabled });
  } catch (error) {
    logger.error('Failed to toggle auto-pilot', { error });
    res.status(500).json({ error: 'Failed to toggle auto-pilot' });
  }
});

export default router;
