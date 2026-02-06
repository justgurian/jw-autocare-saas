/**
 * Smart Rotation Service
 *
 * Intelligently selects themes based on user preferences and feedback history.
 * - Preferred families get 3x weight
 * - 'fire' ratings boost that family by +2 weight
 * - 'meh' ratings reduce that family by -1 weight (minimum 0.5)
 * - Last 3 used themes are excluded to prevent repeats
 * - Seasonal themes are injected with 2x weight when in season (Phase 6)
 */

import { ThemeDefinition } from '../prompts/themes';
import { themeRegistry, StyleFamily, STYLE_FAMILIES, NostalgicThemeDefinition } from '../prompts/themes';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface TenantStylePreferences {
  styleFamilyIds: string[];        // Favorite families (1-3 from taste test)
  feedbackHistory: FeedbackEntry[]; // Last 50 entries
  lastUsedThemeIds: string[];       // Last 3 theme IDs used
  weeklyDropDismissed?: string;     // ISO week string if dismissed
}

export interface FeedbackEntry {
  contentId: string;
  familyId: string;
  themeId: string;
  rating: 'fire' | 'solid' | 'meh';
  timestamp: string;
}

const DEFAULT_PREFERENCES: TenantStylePreferences = {
  styleFamilyIds: [],
  feedbackHistory: [],
  lastUsedThemeIds: [],
};

// ============================================================================
// PREFERENCE HELPERS
// ============================================================================

/**
 * Extract style preferences from tenant settings JSON.
 */
export function getPreferences(settings: Record<string, unknown>): TenantStylePreferences {
  const prefs = settings?.stylePreferences as Partial<TenantStylePreferences> | undefined;
  return {
    styleFamilyIds: prefs?.styleFamilyIds || DEFAULT_PREFERENCES.styleFamilyIds,
    feedbackHistory: prefs?.feedbackHistory || DEFAULT_PREFERENCES.feedbackHistory,
    lastUsedThemeIds: prefs?.lastUsedThemeIds || DEFAULT_PREFERENCES.lastUsedThemeIds,
    weeklyDropDismissed: prefs?.weeklyDropDismissed,
  };
}

/**
 * Build the settings update payload for Prisma.
 */
export function buildPreferencesUpdate(
  currentSettings: Record<string, unknown>,
  prefs: Partial<TenantStylePreferences>
): Record<string, unknown> {
  const current = getPreferences(currentSettings);
  return {
    ...currentSettings,
    stylePreferences: {
      ...current,
      ...prefs,
    },
  };
}

/**
 * Record that a theme was used (for repeat prevention).
 */
export function recordThemeUsage(
  currentSettings: Record<string, unknown>,
  themeId: string
): Record<string, unknown> {
  const prefs = getPreferences(currentSettings);
  const lastUsed = [themeId, ...prefs.lastUsedThemeIds].slice(0, 3);
  return buildPreferencesUpdate(currentSettings, { lastUsedThemeIds: lastUsed });
}

/**
 * Add feedback to the history (keeps last 50 entries).
 */
export function addFeedback(
  currentSettings: Record<string, unknown>,
  entry: FeedbackEntry
): Record<string, unknown> {
  const prefs = getPreferences(currentSettings);
  const history = [entry, ...prefs.feedbackHistory].slice(0, 50);
  return buildPreferencesUpdate(currentSettings, { feedbackHistory: history });
}

// ============================================================================
// SMART ROTATION ALGORITHM
// ============================================================================

/**
 * Select the next theme using the smart rotation algorithm.
 *
 * 1. Check for seasonal themes — 25% chance to inject one if in season
 * 2. Build weighted pool of all families
 * 3. Preferred families get 3x weight
 * 4. Apply feedback modifiers
 * 5. Pick a family via weighted random
 * 6. Pick a random theme from that family (excluding recently used)
 */
export function selectNextTheme(preferences: TenantStylePreferences): ThemeDefinition {
  // Seasonal auto-injection: 25% chance to pick a seasonal theme if any are in season
  const seasonalTheme = trySeasonalInjection(preferences);
  if (seasonalTheme) {
    logger.info('Smart rotation: Seasonal theme injected', {
      themeId: seasonalTheme.id,
      themeName: seasonalTheme.name,
    });
    return seasonalTheme;
  }

  const weights = buildFamilyWeights(preferences);
  const selectedFamily = weightedRandomFamily(weights);

  // Get themes from that family, excluding recently used
  const familyThemes = themeRegistry.getThemesByFamily(selectedFamily.id);
  const available = familyThemes.filter(t => !preferences.lastUsedThemeIds.includes(t.id));

  // If all themes in family were recently used, allow any
  const pool = available.length > 0 ? available : familyThemes;

  if (pool.length === 0) {
    // Extreme fallback - pick any random theme
    logger.warn('Smart rotation: No themes available in selected family, using global random', {
      familyId: selectedFamily.id,
    });
    const allThemes = themeRegistry.getAllThemes();
    return allThemes[Math.floor(Math.random() * allThemes.length)];
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];

  logger.info('Smart rotation selected theme', {
    familyId: selectedFamily.id,
    familyName: selectedFamily.name,
    themeId: selected.id,
    themeName: selected.name,
  });

  return selected;
}

/**
 * Try to inject a seasonal theme. Returns a theme 25% of the time
 * if there are in-season holiday packs available.
 */
function trySeasonalInjection(preferences: TenantStylePreferences): ThemeDefinition | null {
  // 25% chance to inject seasonal
  if (Math.random() > 0.25) return null;

  const inSeasonPacks = themeRegistry.getInSeasonHolidayPacks();
  if (inSeasonPacks.length === 0) return null;

  // Get all seasonal themes from in-season packs
  const packIds = inSeasonPacks.map(p => p.id);
  const seasonalThemes = themeRegistry.getThemesFromHolidayPacks(packIds);

  if (seasonalThemes.length === 0) return null;

  // Filter out recently used
  const available = seasonalThemes.filter(
    t => !preferences.lastUsedThemeIds.includes(t.id)
  );

  const pool = available.length > 0 ? available : seasonalThemes;
  const selected = pool[Math.floor(Math.random() * pool.length)];

  // Convert NostalgicThemeDefinition to ThemeDefinition shape
  return {
    id: selected.id,
    name: selected.name,
    category: selected.category,
    previewColors: selected.previewColors,
    shortDescription: selected.shortDescription,
    imagePrompt: selected.imagePrompt,
    textPrompt: selected.textPrompt,
    mockupScenes: selected.mockupScenes,
    compatibleTools: selected.compatibleTools,
  };
}

/**
 * Select 7 unique themes for a content calendar week.
 * Ensures variety across families while respecting preferences.
 */
export function selectWeekThemes(preferences: TenantStylePreferences): ThemeDefinition[] {
  const themes: ThemeDefinition[] = [];
  const usedFamilyIds: string[] = [];
  const usedThemeIds: string[] = [...preferences.lastUsedThemeIds];
  const weights = buildFamilyWeights(preferences);

  for (let i = 0; i < 7; i++) {
    // Try to use different families first
    let familyPool = weights.filter(w => !usedFamilyIds.includes(w.family.id));

    // If we've used all 10 families, allow repeats but prefer unused
    if (familyPool.length === 0) {
      familyPool = weights;
    }

    const selectedFamily = weightedRandomFamily(familyPool);
    const familyThemes = themeRegistry.getThemesByFamily(selectedFamily.id);
    const available = familyThemes.filter(t => !usedThemeIds.includes(t.id));
    const pool = available.length > 0 ? available : familyThemes;

    if (pool.length > 0) {
      const theme = pool[Math.floor(Math.random() * pool.length)];
      themes.push(theme);
      usedFamilyIds.push(selectedFamily.id);
      usedThemeIds.push(theme.id);
    }
  }

  // Fill any gaps with random themes if needed
  while (themes.length < 7) {
    const allThemes = themeRegistry.getAllThemes();
    const remaining = allThemes.filter(t => !usedThemeIds.includes(t.id));
    if (remaining.length > 0) {
      const theme = remaining[Math.floor(Math.random() * remaining.length)];
      themes.push(theme);
      usedThemeIds.push(theme.id);
    } else {
      break;
    }
  }

  return themes;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

interface FamilyWeight {
  family: StyleFamily;
  weight: number;
}

function buildFamilyWeights(preferences: TenantStylePreferences): FamilyWeight[] {
  const weights: FamilyWeight[] = STYLE_FAMILIES.map(family => {
    let weight = 1.0; // Base weight

    // Preferred families get 3x
    if (preferences.styleFamilyIds.includes(family.id)) {
      weight = 3.0;
    }

    // Apply feedback modifiers
    for (const entry of preferences.feedbackHistory) {
      if (entry.familyId === family.id) {
        if (entry.rating === 'fire') {
          weight += 2.0;
        } else if (entry.rating === 'meh') {
          weight -= 1.0;
        }
        // 'solid' doesn't change weight
      }
    }

    // Minimum weight of 0.5 (never fully exclude a family)
    weight = Math.max(0.5, weight);

    return { family, weight };
  });

  return weights;
}

function weightedRandomFamily(weights: FamilyWeight[]): StyleFamily {
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;

  for (const w of weights) {
    random -= w.weight;
    if (random <= 0) {
      return w.family;
    }
  }

  // Fallback (shouldn't happen)
  return weights[0].family;
}
