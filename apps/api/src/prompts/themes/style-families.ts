/**
 * Style Families - Curated groups of themes for the intelligent style system
 *
 * 10 Style Families, each containing 3-5 curated themes from existing registry
 * plus new themes for the 3 new families (Neon & Synthwave, Street Art & Graffiti, Anime & Manga).
 */

import type { ThemeDefinition, ThemeImagePrompt, ThemeTextPrompt } from './index';
import { ALL_CONTENT_THEMES } from './content-themes';
import { CURATED_THEMES } from './curated-themes';

export interface StyleFamily {
  id: string;
  name: string;
  description: string;
  emoji: string;
  previewImage: string; // Path: /images/families/{id}.svg
  themeIds: string[];   // References to existing themes in the registry
  tags: string[];
}

// ============================================================================
// STYLE FAMILY DEFINITIONS
// ============================================================================

export const STYLE_FAMILIES: StyleFamily[] = [
  {
    id: 'classic-americana',
    name: 'Classic Americana',
    description: '1950s service stations, 60s muscle, 70s custom vans & chrome dreams',
    emoji: '🚗',
    previewImage: '/images/families/classic-americana.svg',
    themeIds: ['50s-service-station', '60s-muscle-thunder', '70s-custom-van'],
    tags: ['vintage', 'retro', '1950s', '1960s', '1970s', 'nostalgia', 'chrome'],
  },
  {
    id: 'neon-synthwave',
    name: 'Synthwave & Neon',
    description: '80s retrowave grids, neon signs & wet city streets at night',
    emoji: '🌆',
    previewImage: '/images/families/neon-synthwave.svg',
    themeIds: ['80s-synthwave', 'miami-vice-neon'],
    tags: ['neon', 'synthwave', '80s', 'retrowave', 'miami', 'vaporwave'],
  },
  {
    id: 'import-tuner',
    name: 'Import & Tuner',
    description: 'JDM street racing, drift culture & underglow nights',
    emoji: '🏎',
    previewImage: '/images/families/retro-racing.svg',
    themeIds: ['90s-jdm-tuner', 'drift-king'],
    tags: ['jdm', 'tuner', 'drift', 'import', '90s', 'street'],
  },
  {
    id: 'comic-pop-art',
    name: 'Comic & Pop Art',
    description: 'Halftone dots, POW bubbles & Warhol-style color pops',
    emoji: '💥',
    previewImage: '/images/families/comic-pop-art.svg',
    themeIds: ['comic-action', 'pop-art-garage'],
    tags: ['comic', 'pop-art', 'superhero', 'halftone', 'bold', 'warhol'],
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Movie poster drama, film noir shadows & blockbuster energy',
    emoji: '🎬',
    previewImage: '/images/families/cinematic.svg',
    themeIds: ['movie-poster', 'noir-detective'],
    tags: ['movie', 'cinema', 'poster', 'dramatic', 'noir', 'blockbuster'],
  },
  {
    id: 'retro-poster-art',
    name: 'Retro Poster Art',
    description: 'WPA travel posters, pin-up garage emblems & vintage illustration',
    emoji: '🎨',
    previewImage: '/images/families/street-art-graffiti.svg',
    themeIds: ['wpa-travel-poster', 'pinup-nose-art'],
    tags: ['wpa', 'travel-poster', 'pin-up', 'emblem', 'illustration', 'vintage'],
  },
  {
    id: 'urban-street',
    name: 'Urban & Street',
    description: 'Graffiti wildstyle, lowrider culture & street art murals',
    emoji: '🔥',
    previewImage: '/images/families/anime-manga.svg',
    themeIds: ['graffiti-garage', 'lowrider-culture'],
    tags: ['graffiti', 'lowrider', 'urban', 'street-art', 'chicano', 'mural'],
  },
  {
    id: 'clean-modern',
    name: 'Clean & Modern',
    description: 'Minimal design, luxury editorial & bold typography',
    emoji: '⚡',
    previewImage: '/images/families/bold-modern.svg',
    themeIds: ['modern-minimal', 'luxury-editorial', 'bold-typography'],
    tags: ['modern', 'clean', 'minimal', 'luxury', 'typography', 'editorial'],
  },
  {
    id: 'workshop-craft',
    name: 'Workshop & Craft',
    description: 'Honest shop interiors, organized tool flatlays & warm lighting',
    emoji: '🔧',
    previewImage: '/images/families/vintage-workshop.svg',
    themeIds: ['honest-workshop', 'knolling-flatlay'],
    tags: ['workshop', 'tools', 'knolling', 'craft', 'honest', 'warm'],
  },
  {
    id: 'racing-speed',
    name: 'Racing & Speed',
    description: 'NASCAR motion blur, vintage rally posters & checkered flags',
    emoji: '🏁',
    previewImage: '/images/families/retro-racing.svg',
    themeIds: ['nascar-speed', 'vintage-rally'],
    tags: ['racing', 'speed', 'nascar', 'rally', 'motorsport', 'checkered'],
  },
  {
    id: 'auto-magazine',
    name: 'Auto Magazine',
    description: 'Classic car magazine covers reimagined — Motor Trend, Road & Track & more',
    emoji: '📰',
    previewImage: '/images/families/auto-magazine.svg',
    themeIds: [
      'mt-60s-car-of-year', 'mt-70s-road-test', 'mt-80s-performance',
      'mt-2000s-dark-hero', 'mt-modern-digital',
      'rt-60s-grand-touring', 'rt-70s-open-road', 'rt-80s-red-ferrari',
      'rt-modern-cinematic', 'rt-california-lifestyle',
      'hotrod-custom-build', 'dub-custom-wheels', 'import-tuner-night', 'rt-racing-cockpit',
    ],
    tags: ['magazine', 'cover', 'motor-trend', 'road-track', 'hot-rod', 'dub', 'editorial', 'newsstand'],
  },
];

// ============================================================================
// NEW THEMES — Neon & Synthwave (1 new, rest from existing registry)
// ============================================================================

export const neonSynthwaveNewThemes: ThemeDefinition[] = [
  {
    id: 'neon-miami-vice',
    name: 'Miami Vice Neon',
    category: 'neon-synthwave',
    shortDescription: 'Pastel neon, palm trees, and Miami Vice glamour',
    previewColors: ['#FF6EC7', '#00FFFF', '#FF00FF', '#1A1A2E'],
    imagePrompt: {
      style: `Miami Vice 1980s aesthetic. Pastel pink and electric blue neon lighting.
        Tropical sunset backdrop with palm tree silhouettes. Chrome-detailed sports cars
        reflected in rain-slicked streets. Venetian blinds shadow patterns.
        Premium TV show credits quality — glamorous, dangerous, neon-soaked.`,
      colorPalette: `Hot pink (#FF6EC7), electric cyan (#00FFFF), magenta (#FF00FF),
        deep midnight (#1A1A2E), white neon glow, pastel peach highlights.
        Everything glows against dark backgrounds.`,
      typography: `Thin italic sans-serif in neon glow style. Chrome 3D text with pink/cyan
        reflections. Handwritten script accents for taglines. All text should look like
        glowing neon tube signage.`,
      elements: `Palm tree silhouettes, neon tube borders, sunset gradient strips,
        chrome car grilles reflecting neon, rain puddle reflections,
        venetian blind shadow bars, flamingo motifs, luxury yacht vibes.`,
      mood: `Glamorous, dangerous, neon-soaked nightlife. The garage is the hottest spot
        in town. Every oil change feels like a high-speed pursuit through Miami at sunset.`,
    },
    textPrompt: {
      tone: 'Smooth, cool, glamorous, nightlife energy',
      vocabulary: ['cruise', 'neon', 'midnight', 'coast', 'sleek', 'vice', 'electric'],
    },
    mockupScenes: ['neon-lit street corner', 'palm-lined boulevard', 'rain-soaked parking lot'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
];

// ============================================================================
// NEW THEMES — Street Art & Graffiti (4 new themes)
// ============================================================================

export const streetArtNewThemes: ThemeDefinition[] = [
  {
    id: 'graffiti-garage',
    name: 'Graffiti Garage',
    category: 'street-art-graffiti',
    shortDescription: 'Bold spray-paint tags and wildstyle lettering',
    previewColors: ['#FF4500', '#00FF00', '#FFD700', '#1C1C1C'],
    imagePrompt: {
      style: `New York City 1980s graffiti wildstyle aesthetic. Bold spray paint lettering
        with drips, tags, and throw-ups on brick walls and metal shutters.
        Influenced by artists like SEEN, DONDI, and FUTURA. Layered tags with
        3D block letters, arrows, and connections. Raw urban energy.`,
      colorPalette: `Spray can primary colors: fire engine red (#FF4500), electric lime (#00FF00),
        gold chrome (#FFD700), deep black (#1C1C1C), royal blue, hot pink.
        Colors should look like actual spray paint with overspray halos and drip marks.`,
      typography: `WILDSTYLE graffiti lettering — interconnected, angular, with arrows and
        flourishes. Block letters with 3D shadows and highlights. Tag-style script
        for secondary text. Bubble letters for fun callouts. All text looks hand-sprayed.`,
      elements: `Brick wall textures, metal roller shutters, spray can caps scattered,
        drip marks, overspray halos, stencil layers, wheat-paste poster remnants,
        subway train panels, fire escape silhouettes.`,
      mood: `Raw, rebellious, artistic, street-credible. This auto shop has STREET CRED.
        The flyer looks like it was tagged by a legendary graffiti artist on a warehouse wall.`,
    },
    textPrompt: {
      tone: 'Bold, street-smart, authentic, urban cool',
      vocabulary: ['fresh', 'legit', 'real deal', 'street', 'original', 'custom'],
    },
    mockupScenes: ['tagged brick wall', 'subway platform', 'warehouse door'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'mural-master',
    name: 'Mural Master',
    category: 'street-art-graffiti',
    shortDescription: 'Photorealistic street murals with vibrant colors',
    previewColors: ['#E63946', '#457B9D', '#F1FAEE', '#A8DADC'],
    imagePrompt: {
      style: `Large-scale photorealistic street mural style, inspired by artists like
        Shepard Fairey, Banksy, and Eduardo Kobra. Building-sized artwork with
        geometric color blocking and photorealistic vehicle portraits.
        The entire flyer looks like a freshly painted wall mural.`,
      colorPalette: `Rich jewel tones: crimson red (#E63946), ocean blue (#457B9D),
        warm cream (#F1FAEE), soft teal (#A8DADC), deep charcoal.
        Colors are vibrant and saturated like fresh outdoor paint.`,
      typography: `Clean stencil-style lettering in bold block capitals.
        Obey/Shepard Fairey propaganda poster influence.
        Strong contrast with outlined letters. Readable from across the street.`,
      elements: `Brick wall texture showing through paint, geometric color blocks,
        vehicle portraits rendered in mural style, stars and geometric patterns,
        peeling paint edges revealing layers beneath, power lines and urban skyline silhouettes.`,
      mood: `Artistic, impactful, community-proud. This mural makes the neighborhood better.
        It's art that also tells you where to get your car fixed. Monumental and impressive.`,
    },
    textPrompt: {
      tone: 'Artistic, community-minded, impactful, proud',
      vocabulary: ['artisan', 'craft', 'community', 'local', 'pride', 'masterwork'],
    },
    mockupScenes: ['building wall', 'alley mural', 'parking garage'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'stencil-street',
    name: 'Stencil Street',
    category: 'street-art-graffiti',
    shortDescription: 'Banksy-inspired stencil art with social commentary',
    previewColors: ['#000000', '#FF0000', '#FFFFFF', '#808080'],
    imagePrompt: {
      style: `Banksy-inspired political stencil art style. High-contrast black and white
        stencil work with selective red accent color. Subversive wit meets auto repair.
        Looks like spray-painted stencils on concrete walls. Raw, thought-provoking, clever.`,
      colorPalette: `Primarily black stencil on white/gray concrete background.
        Single accent color: bold red (#FF0000) used sparingly for emphasis.
        Concrete gray textures. High contrast, minimal palette for maximum impact.`,
      typography: `Stencil-cut military font style. Blocky, functional, spray-painted.
        Some hand-scrawled text like chalk or marker annotations.
        Anti-establishment feel in the lettering.`,
      elements: `Stencil-sprayed vehicle silhouettes, rats with wrenches (Banksy-style),
        dripping paint, concrete wall textures, security camera motifs,
        ironic juxtapositions of luxury and grit, barcode elements.`,
      mood: `Clever, subversive, witty, anti-corporate. This shop is the underdog hero.
        Smart humor meets auto repair. Makes people stop, think, and smile.`,
    },
    textPrompt: {
      tone: 'Witty, clever, anti-corporate, rebellious',
      vocabulary: ['honest', 'real', 'no BS', 'underground', 'authentic', 'independent'],
    },
    mockupScenes: ['concrete wall', 'underpass pillar', 'abandoned building'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'urban-tag',
    name: 'Urban Tag',
    category: 'street-art-graffiti',
    shortDescription: 'Clean modern street art with geometric patterns',
    previewColors: ['#FF6B35', '#004E89', '#1A1A2E', '#F5F5F5'],
    imagePrompt: {
      style: `Modern clean street art combining geometric patterns with urban tag energy.
        Think KAWS meets Obey meets modern branding. Bold shapes, limited palette,
        contemporary street aesthetic that would look at home in a gallery or on a wall.`,
      colorPalette: `Burnt orange (#FF6B35), deep blue (#004E89), near-black (#1A1A2E),
        off-white (#F5F5F5). Clean, curated palette like a modern art exhibition.
        Each color used with intention and strong contrast.`,
      typography: `Modern condensed sans-serif in all caps. Clean but with slight
        hand-drawn imperfections. Bold weight, tight tracking.
        Feels designed but not corporate — the sweet spot of street-meets-studio.`,
      elements: `Geometric triangles and circles, clean line patterns,
        abstract vehicle forms from basic shapes, dot matrix patterns,
        subtle texture overlays, modern icon-style tools and gears.`,
      mood: `Contemporary, gallery-worthy, cool without trying.
        This is street art for the Instagram age — clean enough to share,
        cool enough to respect. Urban sophistication.`,
    },
    textPrompt: {
      tone: 'Contemporary, cool, curated, effortlessly stylish',
      vocabulary: ['curated', 'original', 'authentic', 'fresh', 'crafted', 'studio'],
    },
    mockupScenes: ['gallery wall', 'modern storefront', 'concrete pillar'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
];

// ============================================================================
// NEW THEMES — Anime & Manga (4 new themes)
// ============================================================================

export const animeMangaNewThemes: ThemeDefinition[] = [
  {
    id: 'anime-drift-hero',
    name: 'Drift Hero',
    category: 'anime-manga',
    shortDescription: 'Initial D meets auto repair — high-speed drift anime',
    previewColors: ['#FF4444', '#FFFFFF', '#333333', '#FFD700'],
    imagePrompt: {
      style: `Japanese anime style inspired by Initial D and Wangan Midnight.
        High-speed drift racing aesthetics with dynamic motion blur and speed lines.
        Night touge (mountain pass) racing atmosphere. Cars rendered in detailed
        anime style with dramatic headlight glares and tire smoke.`,
      colorPalette: `Racing red (#FF4444), clean white, dark asphalt gray (#333333),
        headlight gold (#FFD700), neon underglow accents. Night scene with
        dramatic lighting from headlights and street lamps. Speed line whites.`,
      typography: `Bold Japanese-influenced display font in English. Angular, dynamic,
        slightly italic suggesting speed. Katakana-style decorative accents.
        Large impact headlines with dramatic drop shadows.`,
      elements: `Speed lines radiating outward, tire smoke clouds, dramatic car angles,
        touge mountain road curves, guardrail reflections, tachometer graphics,
        manga panel borders for multi-frame layouts, turbo boost effects.`,
      mood: `Adrenaline-pumping, heroic, competitive. Every car that leaves this shop
        is ready for the touge. The mechanics are drift legends. Pure automotive passion.`,
    },
    textPrompt: {
      tone: 'Intense, passionate, heroic, competitive',
      vocabulary: ['legend', 'drift', 'spirit', 'master', 'ultimate', 'champion'],
    },
    mockupScenes: ['mountain pass road', 'midnight parking garage', 'race starting line'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'manga-mecha-shop',
    name: 'Mecha Shop',
    category: 'anime-manga',
    shortDescription: 'Giant robot workshop — Gundam-inspired auto repair',
    previewColors: ['#2196F3', '#FF5722', '#FFFFFF', '#37474F'],
    imagePrompt: {
      style: `Mecha anime style inspired by Gundam and Evangelion. The auto shop reimagined
        as a giant robot maintenance bay. Vehicles rendered as sleek mecha units.
        Mechanics in pilot suits working with massive robotic tools.
        Technical readouts and HUD displays overlay the scene.`,
      colorPalette: `Gundam blue (#2196F3), warning orange (#FF5722), armor white (#FFFFFF),
        steel gray (#37474F), neon green for HUD elements, yellow caution stripes.
        Clean, technical color coding like a military mecha hangar.`,
      typography: `Technical sans-serif font with angular cuts. Military designation style
        numbering. HUD-style data readouts. Stencil markings on panels.
        Clean, precise, authoritative.`,
      elements: `Mecha hangar bay backgrounds, robotic arms and cranes, technical HUD overlays,
        vehicle diagnostic hologram displays, warning stripes, blast doors,
        energy cables, cockpit canopy reflections, panel line details.`,
      mood: `Futuristic, epic, precision-engineered. This isn't a garage — it's a mecha
        maintenance hangar. Every repair is a mission. Every mechanic is a pilot technician.`,
    },
    textPrompt: {
      tone: 'Epic, technical, futuristic, mission-driven',
      vocabulary: ['unit', 'mission', 'deploy', 'maintenance bay', 'systems', 'optimal'],
    },
    mockupScenes: ['mecha hangar', 'command center display', 'launch pad'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'manga-racing-spirit',
    name: 'Racing Spirit',
    category: 'anime-manga',
    shortDescription: 'Shonen manga energy — dramatic action panels and power-ups',
    previewColors: ['#FF0000', '#000000', '#FFFF00', '#FFFFFF'],
    imagePrompt: {
      style: `Shonen manga action style inspired by Dragon Ball, One Piece, and My Hero Academia.
        Dramatic action poses, power-up auras, and intense speed lines. Mechanics shown
        as battle-ready heroes with glowing energy effects. Black and white manga panels
        with selective color pops. Screentone dot patterns for shading.`,
      colorPalette: `Bold red (#FF0000) for power effects, deep black ink outlines,
        energy yellow (#FFFF00) for power-up auras, stark white highlights.
        Primarily black and white manga style with selective color for impact moments.`,
      typography: `Manga sound effect style — bold, angular, explosive.
        "VROOOOM!" and "FIXED!" in dramatic impact lettering.
        Speed lines behind text. Exclamation-heavy.
        Main text in clean bold sans-serif, effects in hand-drawn manga style.`,
      elements: `Manga speed lines, power-up aura effects, dramatic close-up panels,
        screentone dot shading, impact starburst frames, sweat drops,
        determination lines, battle damage sparks, shonen jump-style chapter headers.`,
      mood: `INTENSE, PASSIONATE, NEVER-GIVE-UP SPIRIT! Every repair is an epic battle!
        The mechanics have the heart of champions! They'll push past their limits to
        fix your car! PLUS ULTRA energy for auto repair!`,
    },
    textPrompt: {
      tone: 'Intense, passionate, heroic, never-give-up energy',
      vocabulary: ['ultimate', 'spirit', 'power', 'legendary', 'unstoppable', 'hero'],
    },
    mockupScenes: ['manga page spread', 'action panel layout', 'hero pose poster'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
];

// ============================================================================
// ALL NEW THEMES COMBINED (for registration in the theme registry)
// ============================================================================

export const ALL_NEW_FAMILY_THEMES: ThemeDefinition[] = [
  ...neonSynthwaveNewThemes,
  ...streetArtNewThemes,
  ...animeMangaNewThemes,
  ...ALL_CONTENT_THEMES,
  ...CURATED_THEMES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAllFamilies(): StyleFamily[] {
  return STYLE_FAMILIES;
}

export function getFamilyById(id: string): StyleFamily | undefined {
  return STYLE_FAMILIES.find(f => f.id === id);
}

export function getFamilyForTheme(themeId: string): StyleFamily | undefined {
  return STYLE_FAMILIES.find(f => f.themeIds.includes(themeId));
}

/**
 * Get the weekly featured family based on ISO week number.
 * Deterministic — same for all users in the same week.
 */
export function getWeeklyDropFamily(): StyleFamily {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  const familyIndex = weekNumber % STYLE_FAMILIES.length;
  return STYLE_FAMILIES[familyIndex];
}

/**
 * Get the current ISO week string (e.g. "2026-W06") for dismissal tracking.
 */
export function getCurrentWeekString(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}
