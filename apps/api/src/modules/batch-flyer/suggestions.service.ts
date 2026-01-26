/**
 * Suggestions Service
 * Provides smart AI-powered suggestions for batch flyer content based on:
 * - Location/climate awareness (no snow tires in Florida!)
 * - Seasonal relevance (AC in summer, heating in winter)
 * - Performance data (themes that worked well before)
 * - Service rotation (suggest services not recently promoted)
 */

import { prisma } from '../../db/client';
import { Suggestion, SuggestionsResponse } from './batch-flyer.types';

// Climate zones based on US states
const WARM_CLIMATE_STATES = [
  'FL', 'Florida',
  'TX', 'Texas',
  'AZ', 'Arizona',
  'CA', 'California',
  'NV', 'Nevada',
  'HI', 'Hawaii',
  'LA', 'Louisiana',
  'MS', 'Mississippi',
  'AL', 'Alabama',
  'GA', 'Georgia',
  'SC', 'South Carolina',
  'NM', 'New Mexico',
];

const COLD_CLIMATE_STATES = [
  'AK', 'Alaska',
  'MN', 'Minnesota',
  'WI', 'Wisconsin',
  'MI', 'Michigan',
  'ND', 'North Dakota',
  'SD', 'South Dakota',
  'MT', 'Montana',
  'WY', 'Wyoming',
  'ID', 'Idaho',
  'VT', 'Vermont',
  'NH', 'New Hampshire',
  'ME', 'Maine',
  'NY', 'New York',
  'MA', 'Massachusetts',
];

// Service keywords for matching
const SERVICE_KEYWORDS = {
  ac: ['ac', 'air conditioning', 'a/c', 'cooling', 'freon', 'refrigerant'],
  heating: ['heater', 'heating', 'heat', 'defroster', 'defrost'],
  tires: ['tire', 'tires', 'wheel', 'wheels', 'alignment', 'rotation', 'balance'],
  winterTires: ['winter tire', 'snow tire', 'snow tires', 'winter tires', 'studded'],
  brakes: ['brake', 'brakes', 'rotor', 'rotors', 'pad', 'pads', 'caliper'],
  oil: ['oil', 'oil change', 'lube', 'filter'],
  battery: ['battery', 'batteries', 'alternator', 'charging'],
  coolant: ['coolant', 'antifreeze', 'radiator', 'overheating'],
  inspection: ['inspection', 'safety check', 'safety inspection', 'state inspection'],
  tuneUp: ['tune up', 'tune-up', 'maintenance', 'service'],
};

type ClimateZone = 'warm' | 'cold' | 'moderate';

function getClimateZone(state: string | null | undefined): ClimateZone {
  if (!state) return 'moderate';

  const normalizedState = state.trim();
  if (WARM_CLIMATE_STATES.some(s => s.toLowerCase() === normalizedState.toLowerCase())) {
    return 'warm';
  }
  if (COLD_CLIMATE_STATES.some(s => s.toLowerCase() === normalizedState.toLowerCase())) {
    return 'cold';
  }
  return 'moderate';
}

function getCurrentSeason(timezone: string): 'spring' | 'summer' | 'fall' | 'winter' {
  // Get current date in tenant's timezone
  const now = new Date();
  const month = now.getMonth(); // 0-11

  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

interface ServiceWithId {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
}

interface SpecialWithId {
  id: string;
  title: string;
  description: string | null;
}

export async function getSmartSuggestions(tenantId: string): Promise<SuggestionsResponse> {
  // Get tenant's brand kit for location info
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      brandKit: true,
    },
  });

  // Get all services and specials for this tenant
  const [services, specials, recentContent] = await Promise.all([
    prisma.service.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.special.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
    }),
    // Get recent content to avoid suggesting recently used services
    prisma.content.findMany({
      where: {
        tenantId,
        tool: 'promo_flyer',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      },
      select: {
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  const climate = getClimateZone(tenant?.brandKit?.state);
  const season = getCurrentSeason(tenant?.timezone || 'America/New_York');

  const seasonal: Suggestion[] = [];
  const trending: Suggestion[] = [];
  const rotation: Suggestion[] = [];
  const contentSuggestions: SuggestionsResponse['contentSuggestions'] = [];

  // Track which services have been used recently
  const recentlyUsedServices = new Set<string>();
  for (const content of recentContent) {
    const metadata = content.metadata as { serviceId?: string; subject?: string } | null;
    if (metadata?.serviceId) {
      recentlyUsedServices.add(metadata.serviceId);
    }
    // Also check by subject name match
    if (metadata?.subject) {
      const matchingService = services.find(s =>
        s.name.toLowerCase() === metadata.subject?.toLowerCase()
      );
      if (matchingService) {
        recentlyUsedServices.add(matchingService.id);
      }
    }
  }

  // Generate seasonal suggestions based on location and time of year
  for (const service of services) {
    const serviceName = service.name.toLowerCase();
    const serviceDesc = (service.description || '').toLowerCase();
    const fullText = `${serviceName} ${serviceDesc}`;

    // AC suggestions - summer in warm/moderate climates
    if ((season === 'summer' || (season === 'spring' && climate === 'warm')) &&
        matchesKeywords(fullText, SERVICE_KEYWORDS.ac)) {
      seasonal.push({
        id: `seasonal-ac-${service.id}`,
        type: 'seasonal',
        serviceId: service.id,
        serviceName: service.name,
        reason: climate === 'warm'
          ? "Hot weather ahead - AC services are essential"
          : "Summer is coming - time for AC checkups",
        priority: 9,
      });
    }

    // Heating suggestions - fall/winter in cold/moderate climates
    if ((season === 'winter' || season === 'fall') && climate !== 'warm' &&
        matchesKeywords(fullText, SERVICE_KEYWORDS.heating)) {
      seasonal.push({
        id: `seasonal-heat-${service.id}`,
        type: 'seasonal',
        serviceId: service.id,
        serviceName: service.name,
        reason: "Cold weather approaching - heating system checks are important",
        priority: 8,
      });
    }

    // Winter tire suggestions - ONLY in cold climates
    if ((season === 'fall' || season === 'winter') && climate === 'cold' &&
        matchesKeywords(fullText, SERVICE_KEYWORDS.winterTires)) {
      seasonal.push({
        id: `seasonal-winter-tire-${service.id}`,
        type: 'seasonal',
        serviceId: service.id,
        serviceName: service.name,
        reason: "Snow season is here - winter tires keep customers safe",
        priority: 10,
      });
    }

    // Battery suggestions - extreme weather
    if ((season === 'winter' || season === 'summer') &&
        matchesKeywords(fullText, SERVICE_KEYWORDS.battery)) {
      seasonal.push({
        id: `seasonal-battery-${service.id}`,
        type: 'seasonal',
        serviceId: service.id,
        serviceName: service.name,
        reason: season === 'winter'
          ? "Cold weather is hard on batteries"
          : "Heat can drain batteries faster",
        priority: 7,
      });
    }

    // Coolant/radiator - summer
    if (season === 'summer' && matchesKeywords(fullText, SERVICE_KEYWORDS.coolant)) {
      seasonal.push({
        id: `seasonal-coolant-${service.id}`,
        type: 'seasonal',
        serviceId: service.id,
        serviceName: service.name,
        reason: "Summer heat means overheating risk - coolant checks are timely",
        priority: 8,
      });
    }

    // Service rotation - suggest services not recently promoted
    if (!recentlyUsedServices.has(service.id)) {
      rotation.push({
        id: `rotation-${service.id}`,
        type: 'rotation',
        serviceId: service.id,
        serviceName: service.name,
        reason: "Haven't promoted this service recently",
        priority: 5,
      });
    }
  }

  // Add active specials as high priority suggestions
  for (const special of specials) {
    trending.push({
      id: `special-${special.id}`,
      type: 'trending',
      specialId: special.id,
      specialName: special.title,
      reason: "Active special - great for engagement",
      priority: 8,
    });
  }

  // Build content suggestions (pre-selected items for the UI)
  // Priority: 1) Active specials, 2) Seasonal services, 3) Rotation services
  const addedIds = new Set<string>();

  // Add top specials first
  for (const special of specials.slice(0, 3)) {
    contentSuggestions.push({
      specialId: special.id,
      name: special.title,
      isPreSelected: true,
      reason: "Active special promotion",
    });
    addedIds.add(`special-${special.id}`);
  }

  // Add top seasonal suggestions
  const sortedSeasonal = seasonal.sort((a, b) => b.priority - a.priority);
  for (const suggestion of sortedSeasonal.slice(0, 3)) {
    if (suggestion.serviceId && !addedIds.has(`service-${suggestion.serviceId}`)) {
      contentSuggestions.push({
        serviceId: suggestion.serviceId,
        name: suggestion.serviceName || '',
        isPreSelected: true,
        reason: suggestion.reason,
      });
      addedIds.add(`service-${suggestion.serviceId}`);
    }
  }

  // Fill remaining with rotation suggestions
  const sortedRotation = rotation.sort((a, b) => b.priority - a.priority);
  for (const suggestion of sortedRotation) {
    if (contentSuggestions.length >= 7) break;
    if (suggestion.serviceId && !addedIds.has(`service-${suggestion.serviceId}`)) {
      contentSuggestions.push({
        serviceId: suggestion.serviceId,
        name: suggestion.serviceName || '',
        isPreSelected: contentSuggestions.length < 5, // Pre-select top 5
        reason: suggestion.reason,
      });
      addedIds.add(`service-${suggestion.serviceId}`);
    }
  }

  // If no content suggestions were generated, add ALL services and specials
  // This ensures the UI always shows available content
  if (contentSuggestions.length === 0) {
    // Add all services
    for (const service of services) {
      contentSuggestions.push({
        serviceId: service.id,
        name: service.name,
        isPreSelected: contentSuggestions.length < 3, // Pre-select first 3
        reason: 'Available service',
      });
    }
    // Add all specials
    for (const special of specials) {
      contentSuggestions.push({
        specialId: special.id,
        name: special.title,
        isPreSelected: true, // Always pre-select specials
        reason: 'Active special',
      });
    }
  }

  return {
    seasonal: sortedSeasonal.slice(0, 5),
    trending: trending.slice(0, 5),
    rotation: sortedRotation.slice(0, 5),
    contentSuggestions,
    // Also include raw lists for the UI to display all options
    allServices: services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
    })),
    allSpecials: specials.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
    })),
  };
}

export async function getTopPerformingThemes(tenantId: string): Promise<Array<{
  themeId: string;
  themeName: string;
  usageCount: number;
}>> {
  // Get themes used in recent content, grouped by popularity
  const content = await prisma.content.findMany({
    where: {
      tenantId,
      tool: 'promo_flyer',
      theme: { not: null },
    },
    select: {
      theme: true,
      metadata: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const themeCounts = new Map<string, { count: number; name: string }>();

  for (const item of content) {
    if (item.theme) {
      const existing = themeCounts.get(item.theme);
      const metadata = item.metadata as { themeName?: string } | null;
      if (existing) {
        existing.count++;
      } else {
        themeCounts.set(item.theme, {
          count: 1,
          name: metadata?.themeName || item.theme,
        });
      }
    }
  }

  return Array.from(themeCounts.entries())
    .map(([themeId, data]) => ({
      themeId,
      themeName: data.name,
      usageCount: data.count,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
}
