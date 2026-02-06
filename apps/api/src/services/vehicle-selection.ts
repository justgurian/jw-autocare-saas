/**
 * Vehicle Selection Service
 *
 * Manages vehicle preferences for flyer generation.
 * Parallels the smart-rotation.ts pattern for storing preferences
 * in Tenant.settings JSON field.
 *
 * When generating a flyer:
 * - 80% chance: pick a car from the loved makes list
 * - 20% chance: no featured car (service-focused flyer)
 * - Never pick from the "never" list
 * - Rotate so the same car doesn't appear twice in a row
 */

import { getCarMakeById, getModelsForMake } from '../data/car-makes';

// ============================================================================
// TYPES
// ============================================================================

export interface LovedMake {
  makeId: string;
  models?: string[];  // Empty/undefined = all models OK
}

export interface VehiclePreferences {
  lovedMakes: LovedMake[];
  neverMakes: string[];
  lastUsedVehicles: string[];  // Last 3 "make:model" strings
}

export interface SelectedVehicle {
  make: string;   // Display name, e.g. "Subaru"
  model: string;  // Display name, e.g. "WRX"
}

// ============================================================================
// PREFERENCE HELPERS (mirror smart-rotation.ts pattern)
// ============================================================================

/**
 * Extract vehicle preferences from Tenant.settings JSON.
 */
export function getVehiclePreferences(settings: Record<string, unknown>): VehiclePreferences {
  const prefs = settings?.vehiclePreferences as Partial<VehiclePreferences> | undefined;
  return {
    lovedMakes: prefs?.lovedMakes || [],
    neverMakes: prefs?.neverMakes || [],
    lastUsedVehicles: prefs?.lastUsedVehicles || [],
  };
}

/**
 * Build an updated settings object with new vehicle preferences merged in.
 */
export function buildVehiclePreferencesUpdate(
  currentSettings: Record<string, unknown>,
  prefs: Partial<VehiclePreferences>
): Record<string, unknown> {
  const current = getVehiclePreferences(currentSettings);
  return {
    ...currentSettings,
    vehiclePreferences: {
      ...current,
      ...prefs,
    },
  };
}

/**
 * Record a vehicle usage for rotation (keeps last 3).
 */
export function recordVehicleUsage(
  currentSettings: Record<string, unknown>,
  vehicleKey: string
): Record<string, unknown> {
  const current = getVehiclePreferences(currentSettings);
  const updated = [vehicleKey, ...current.lastUsedVehicles].slice(0, 3);
  return buildVehiclePreferencesUpdate(currentSettings, { lastUsedVehicles: updated });
}

// ============================================================================
// VEHICLE SELECTION FOR FLYER GENERATION
// ============================================================================

const CAR_SHOW_PROBABILITY = 0.8; // 80% chance to show a car

/**
 * Select a vehicle for a flyer based on user preferences.
 *
 * Returns null 20% of the time (service-focused flyer, no car).
 * When returning a vehicle, picks from loved makes, avoids last 3 used.
 */
export function selectVehicleForFlyer(prefs: VehiclePreferences): SelectedVehicle | null {
  // 20% chance: no car
  if (Math.random() > CAR_SHOW_PROBABILITY) {
    return null;
  }

  // Need loved makes to pick from
  if (prefs.lovedMakes.length === 0) {
    return null;
  }

  // Build candidate pool: all loved make+model combos
  const candidates: SelectedVehicle[] = [];

  for (const loved of prefs.lovedMakes) {
    const makeData = getCarMakeById(loved.makeId);
    if (!makeData) continue;

    const models = (loved.models && loved.models.length > 0)
      ? loved.models
      : makeData.models;

    for (const model of models) {
      candidates.push({ make: makeData.name, model });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // Filter out last 3 used vehicles
  const recentKeys = new Set(prefs.lastUsedVehicles);
  const fresh = candidates.filter(c => !recentKeys.has(`${c.make}:${c.model}`));

  // If all candidates were recently used, reset and pick from full pool
  const pool = fresh.length > 0 ? fresh : candidates;

  // Random selection
  const selected = pool[Math.floor(Math.random() * pool.length)];
  return selected;
}

/**
 * Build the vehicle prompt injection for the AI image generator.
 *
 * Instructs the AI to render a modern car in whatever artistic style
 * the theme uses (e.g., modern Subaru WRX in 1970s comic book style).
 */
export function buildVehiclePromptForFlyer(vehicle: SelectedVehicle): string {
  return `

FEATURED VEHICLE: Show a modern ${vehicle.make} ${vehicle.model} prominently in this design.
Render the vehicle in the artistic style of the flyer — if the theme is retro, comic, vintage, or any specific art style, show the modern ${vehicle.make} ${vehicle.model} AS IF it existed in that era's art style.
The car should be clean, well-maintained, and aspirational — something a proud owner would drive to this shop.
Make the ${vehicle.make} ${vehicle.model} a focal point of the composition alongside the promotional content.`;
}

/**
 * Get the vehicle key for tracking usage.
 */
export function getVehicleKey(vehicle: SelectedVehicle): string {
  return `${vehicle.make}:${vehicle.model}`;
}
