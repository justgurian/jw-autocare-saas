import { BRAND_STYLES, BrandStyle, getBrandStyle, buildBrandStyleImagePrompt } from './brand-styles';
import { ADDITIONAL_THEMES } from './additional-themes';
import {
  NOSTALGIC_THEMES,
  NostalgicThemeDefinition,
  getNostalgicThemesByEra,
  getNostalgicThemesByStyle,
  getNostalgicThemesByEraAndStyle,
  getRandomNostalgicTheme,
  getRandomNostalgicThemeByEra,
  getRandomNostalgicThemeByStyle,
} from './nostalgic-themes';
import {
  ERA_VEHICLES,
  ALL_VEHICLES,
  EraVehicle,
  getVehicleById,
  getVehiclesByEra,
  getRandomVehicle,
  getRandomVehicleByEra,
  getVehicleImagePrompt,
  ERA_INFO,
} from './era-vehicles';
import {
  HOLIDAY_PACKS,
  HolidayPack,
  getAllHolidayPacks,
  getHolidayPack,
  getThemesFromHolidayPacks,
  getAllHolidayThemeIds,
  getInSeasonHolidayPacks,
  getHolidayTheme,
} from './holiday-themes';

export interface ThemeImagePrompt {
  style: string;
  colorPalette: string;
  typography: string;
  elements: string;
  mood: string;
}

export interface ThemeTextPrompt {
  tone: string;
  vocabulary: string[];
}

export interface ThemeDefinition {
  id: string;
  name: string;
  category: string;
  previewUrl?: string;
  previewColors?: string[]; // Color chips for UI preview
  shortDescription?: string;
  fullDescription?: string;
  imagePrompt: ThemeImagePrompt;
  textPrompt: ThemeTextPrompt;
  mockupScenes: string[];
  compatibleTools: string[];
  // Link to comprehensive brand style (if available)
  brandStyleId?: string;
}

// Convert brand styles to theme definitions for backward compatibility
function brandStyleToTheme(style: BrandStyle): ThemeDefinition {
  return {
    id: style.id,
    name: style.name,
    category: getCategoryFromStyle(style.id),
    previewColors: style.previewColors,
    shortDescription: style.shortDescription,
    fullDescription: style.fullDescription,
    imagePrompt: {
      style: style.imagePrompt.styleDirective,
      colorPalette: style.imagePrompt.colorInstructions,
      typography: style.imagePrompt.typographyInstructions,
      elements: style.imagePrompt.visualElements,
      mood: style.visual.mood,
    },
    textPrompt: {
      tone: style.captionStyle.tone,
      vocabulary: style.captionStyle.vocabulary,
    },
    mockupScenes: [
      'on professional shop wall',
      'displayed on service counter',
      'shared on social media',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card', 'campaign'],
    brandStyleId: style.id,
  };
}

function getCategoryFromStyle(styleId: string): string {
  const categoryMap: Record<string, string> = {
    '1950s-americana': 'vintage',
    'european-luxury': 'premium',
    'muscle-performance': 'automotive',
    'modern-tech': 'modern',
    'friendly-neighborhood': 'lifestyle',
    'desert-southwest': 'regional',
    'urban-industrial': 'professional',
    'british-racing': 'premium',
  };
  return categoryMap[styleId] || 'general';
}

// Brand styles converted to themes (primary styles - shown first)
const brandStyleThemes: ThemeDefinition[] = BRAND_STYLES.map(brandStyleToTheme);

// Legacy theme definitions (kept for backward compatibility)
const legacyThemes: ThemeDefinition[] = [
  {
    id: 'retro-garage',
    name: 'Retro Garage',
    category: 'vintage',
    previewUrl: '/themes/retro-garage-preview.jpg',
    imagePrompt: {
      style: 'vintage 1950s americana garage aesthetic, hand-painted sign style',
      colorPalette: 'warm sepia tones, chrome accents, red and cream, classic blue',
      typography: 'bold vintage lettering, hand-painted sign style, retro fonts',
      elements: 'classic car silhouettes, oil cans, vintage tools, checkered floor, neon signs',
      mood: 'nostalgic, trustworthy, classic american, family-owned feel',
    },
    textPrompt: {
      tone: 'friendly, nostalgic, family-business feel',
      vocabulary: ['folks', 'trusted', 'family-owned', 'since', 'classic', 'dependable'],
    },
    mockupScenes: [
      'posted on vintage garage wall with tools',
      'held by mechanic in retro uniform',
      'displayed on classic car windshield',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'arizona-desert',
    name: 'Arizona Desert',
    category: 'regional',
    previewUrl: '/themes/arizona-desert-preview.jpg',
    imagePrompt: {
      style: 'southwestern desert aesthetic, Arizona sunset vibes',
      colorPalette: 'terracotta orange, desert sand, sunset pink, turquoise accents',
      typography: 'bold western fonts, rustic styling, cactus motifs',
      elements: 'saguaro cacti, desert mountains, sunset gradients, Route 66 vibes',
      mood: 'warm, adventurous, local pride, rugged reliability',
    },
    textPrompt: {
      tone: 'warm, local, adventure-oriented',
      vocabulary: ['desert-tested', 'Arizona tough', 'beat the heat', 'local', 'your neighbor'],
    },
    mockupScenes: [
      'posted on adobe wall',
      'on truck tailgate in desert setting',
      'roadside with mountains backdrop',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    category: 'modern',
    previewUrl: '/themes/neon-nights-preview.jpg',
    imagePrompt: {
      style: 'cyberpunk neon aesthetic, night city vibes, glowing signage',
      colorPalette: 'electric blue, hot pink, neon green, deep purple, black backgrounds',
      typography: 'glowing neon tube letters, futuristic fonts, outlined text',
      elements: 'neon signs, city reflections, rain-slicked streets, glowing car lights',
      mood: 'edgy, modern, premium, night-owl energy',
    },
    textPrompt: {
      tone: 'edgy, premium, modern',
      vocabulary: ['premium', 'performance', 'elite', '24/7', 'night owl'],
    },
    mockupScenes: [
      'neon sign in shop window',
      'reflected in wet pavement',
      'illuminated in dark garage',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'ugc_video'],
  },
  {
    id: 'classic-mechanic',
    name: 'Classic Mechanic',
    category: 'professional',
    previewUrl: '/themes/classic-mechanic-preview.jpg',
    imagePrompt: {
      style: 'professional auto service aesthetic, clean workshop vibes',
      colorPalette: 'deep blue, silver chrome, white, red accents',
      typography: 'clean sans-serif, professional bold headings, clear readable text',
      elements: 'wrench and gear icons, clean tools, organized workspace, certificates',
      mood: 'professional, trustworthy, certified, expert',
    },
    textPrompt: {
      tone: 'professional, expert, reassuring',
      vocabulary: ['certified', 'expert', 'professional', 'factory-trained', 'guaranteed'],
    },
    mockupScenes: [
      'on clipboard in clean shop',
      'framed on shop wall',
      'on service counter',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card', 'review_reply'],
  },
  {
    id: 'pop-culture-80s',
    name: '80s Pop Culture',
    category: 'retro',
    previewUrl: '/themes/pop-culture-80s-preview.jpg',
    imagePrompt: {
      style: '1980s pop culture aesthetic, synthwave vibes, VHS era',
      colorPalette: 'hot pink, electric cyan, yellow, purple gradient sunsets',
      typography: 'chrome 3D text, grid patterns, italic speed lines',
      elements: 'palm trees, sunset grids, geometric shapes, cassette tapes, DeLorean vibes',
      mood: 'fun, nostalgic, energetic, totally rad',
    },
    textPrompt: {
      tone: 'fun, nostalgic, energetic',
      vocabulary: ['radical', 'awesome', 'totally', 'turbo', 'maximum'],
    },
    mockupScenes: [
      'VHS cover style',
      'arcade cabinet screen',
      'boombox sticker',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'ugc_video'],
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'modern',
    previewUrl: '/themes/modern-minimal-preview.jpg',
    imagePrompt: {
      style: 'clean minimalist design, modern luxury aesthetic',
      colorPalette: 'white space, black text, single accent color, subtle grays',
      typography: 'thin modern fonts, generous spacing, lowercase elegance',
      elements: 'clean lines, geometric shapes, ample white space, subtle shadows',
      mood: 'sophisticated, premium, clean, modern luxury',
    },
    textPrompt: {
      tone: 'sophisticated, concise, premium',
      vocabulary: ['precision', 'excellence', 'premium', 'curated', 'refined'],
    },
    mockupScenes: [
      'on marble countertop',
      'minimal white gallery wall',
      'luxury car dashboard',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card', 'seo_blog'],
  },
  {
    id: 'sports-car',
    name: 'Sports Car',
    category: 'automotive',
    previewUrl: '/themes/sports-car-preview.jpg',
    imagePrompt: {
      style: 'high-performance automotive aesthetic, racing heritage',
      colorPalette: 'racing red, carbon black, metallic silver, yellow accents',
      typography: 'bold italic racing fonts, speed lines, dynamic angles',
      elements: 'racing stripes, carbon fiber textures, speedometer graphics, checkered flags',
      mood: 'fast, powerful, exciting, performance-focused',
    },
    textPrompt: {
      tone: 'exciting, performance-driven, enthusiast',
      vocabulary: ['performance', 'power', 'precision', 'speed', 'track-ready', 'horsepower'],
    },
    mockupScenes: [
      'on race track barrier',
      'garage with sports car',
      'pit lane display',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'family-friendly',
    name: 'Family Friendly',
    category: 'lifestyle',
    previewUrl: '/themes/family-friendly-preview.jpg',
    imagePrompt: {
      style: 'warm family-oriented design, approachable and friendly',
      colorPalette: 'soft blue, warm yellow, gentle green, friendly orange',
      typography: 'rounded friendly fonts, easy to read, welcoming style',
      elements: 'family car silhouettes, happy illustrations, safe symbols, heart icons',
      mood: 'warm, trustworthy, safe, family-first',
    },
    textPrompt: {
      tone: 'warm, caring, family-oriented',
      vocabulary: ['family', 'safe', 'trusted', 'care', 'protect', 'peace of mind'],
    },
    mockupScenes: [
      'on family minivan',
      'school pickup line',
      'soccer mom approved',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card', 'check_in_to_win'],
  },
  {
    id: 'truck-country',
    name: 'Truck Country',
    category: 'automotive',
    previewUrl: '/themes/truck-country-preview.jpg',
    imagePrompt: {
      style: 'rugged truck and country aesthetic, work-ready vibes',
      colorPalette: 'forest green, brown earth tones, rust orange, denim blue',
      typography: 'bold stencil fonts, rugged textures, workwear style',
      elements: 'pickup truck silhouettes, mountains, dirt roads, tool graphics',
      mood: 'rugged, hardworking, reliable, no-nonsense',
    },
    textPrompt: {
      tone: 'straight-talking, hardworking, reliable',
      vocabulary: ['tough', 'reliable', 'work-ready', 'built to last', 'get it done'],
    },
    mockupScenes: [
      'truck bed display',
      'country road sign',
      'work site bulletin board',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'eco-green',
    name: 'Eco Green',
    category: 'modern',
    previewUrl: '/themes/eco-green-preview.jpg',
    imagePrompt: {
      style: 'eco-friendly modern design, sustainable vibes',
      colorPalette: 'leaf green, sky blue, earth brown, clean white',
      typography: 'clean modern fonts, organic curves, nature-inspired',
      elements: 'leaf motifs, EV charging, recycling symbols, nature backgrounds',
      mood: 'sustainable, forward-thinking, responsible, clean',
    },
    textPrompt: {
      tone: 'responsible, forward-thinking, caring',
      vocabulary: ['eco-friendly', 'sustainable', 'green', 'future', 'responsible', 'clean'],
    },
    mockupScenes: [
      'EV charging station',
      'green parking lot',
      'sustainable shop front',
    ],
    compatibleTools: ['promo_flyer', 'instant_pack', 'seo_blog'],
  },
];

// Convert nostalgic themes to standard theme definitions
const nostalgicAsThemes: ThemeDefinition[] = NOSTALGIC_THEMES.map(theme => ({
  id: theme.id,
  name: theme.name,
  category: theme.category,
  previewColors: theme.previewColors,
  shortDescription: theme.shortDescription,
  imagePrompt: theme.imagePrompt,
  textPrompt: theme.textPrompt,
  mockupScenes: theme.mockupScenes,
  compatibleTools: theme.compatibleTools,
}));

// Combined themes: brand styles first (premium), then legacy themes, then additional themes, then nostalgic themes
const themes: ThemeDefinition[] = [
  ...brandStyleThemes,
  ...legacyThemes.filter(lt => !brandStyleThemes.some(bt => bt.id === lt.id)), // Avoid duplicates
  ...ADDITIONAL_THEMES.filter(at =>
    !brandStyleThemes.some(bt => bt.id === at.id) &&
    !legacyThemes.some(lt => lt.id === at.id)
  ), // Avoid duplicates with additional themes
  ...nostalgicAsThemes.filter(nt =>
    !brandStyleThemes.some(bt => bt.id === nt.id) &&
    !legacyThemes.some(lt => lt.id === nt.id) &&
    !ADDITIONAL_THEMES.some(at => at.id === nt.id)
  ), // Avoid duplicates with nostalgic themes
];

// Category definitions with display info
export const THEME_CATEGORIES = [
  { id: 'vintage', name: 'Vintage & Retro', icon: '🎞️', description: 'Classic and nostalgic styles' },
  { id: 'modern', name: 'Modern & Tech', icon: '⚡', description: 'Sleek and futuristic designs' },
  { id: 'premium', name: 'Premium & Luxury', icon: '✨', description: 'High-end and sophisticated' },
  { id: 'automotive', name: 'Automotive', icon: '🏎️', description: 'Performance and car culture' },
  { id: 'regional', name: 'Regional', icon: '📍', description: 'Location-specific styles' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '👨‍👩‍👧‍👦', description: 'Family and daily life' },
  { id: 'professional', name: 'Professional', icon: '🔧', description: 'Business and industrial' },
  { id: 'seasonal', name: 'Seasonal', icon: '🗓️', description: 'Time-based promotions' },
  { id: 'specialty', name: 'Specialty', icon: '🎯', description: 'Niche and specific services' },
  { id: 'retro', name: 'Retro', icon: '📼', description: '80s and 90s throwback' },
  { id: 'nostalgic', name: 'Nostalgic', icon: '🎬', description: 'Comic, movie, and magazine styles from classic eras' },
  { id: 'general', name: 'General', icon: '🎨', description: 'All-purpose styles' },
];

// Era definitions for nostalgic themes
export const NOSTALGIC_ERAS = [
  { id: '1950s', name: 'The Fifties', icon: '🚀', description: 'Chrome, fins, and the American Dream' },
  { id: '1960s', name: 'The Sixties', icon: '🏁', description: 'Muscle cars and the pony car revolution' },
  { id: '1970s', name: 'The Seventies', icon: '🌅', description: 'Muscle car twilight and new directions' },
  { id: '1980s', name: 'The Eighties', icon: '⚡', description: 'Technology, turbos, and exotic dreams' },
];

// Style definitions for nostalgic themes
export const NOSTALGIC_STYLES = [
  { id: 'comic-book', name: 'Comic Book', icon: '🦸', description: 'Bold colors and action panels' },
  { id: 'movie-poster', name: 'Movie Poster', icon: '🎬', description: 'Cinematic drama and style' },
  { id: 'magazine', name: 'Car Magazine', icon: '📰', description: 'Automotive publication aesthetics' },
];

// Theme registry
export const themeRegistry = {
  getAllThemes(): ThemeDefinition[] {
    return themes;
  },

  // Get total theme count
  getThemeCount(): number {
    return themes.length;
  },

  // Get premium brand styles only (for featured display)
  getBrandStyles(): ThemeDefinition[] {
    return brandStyleThemes;
  },

  getTheme(id: string): ThemeDefinition | undefined {
    return themes.find(t => t.id === id);
  },

  // Get comprehensive brand style for enhanced prompts
  getBrandStyle(id: string): BrandStyle | undefined {
    return getBrandStyle(id);
  },

  // Build enhanced image prompt using brand style system
  buildImagePrompt(
    styleId: string,
    content: {
      headline: string;
      subject: string;
      details?: string;
      businessName?: string;
      logoInstructions?: string;
    }
  ): string {
    const brandStyle = getBrandStyle(styleId);
    if (brandStyle) {
      return buildBrandStyleImagePrompt(brandStyle, content);
    }
    // Fallback for legacy and additional themes
    const theme = themes.find(t => t.id === styleId);
    if (theme) {
      return `You are an expert graphic designer creating a STUNNING promotional image for an auto repair shop's social media marketing.

=== CREATIVE DIRECTION ===
Create a professional marketing flyer in the "${theme.name}" style.
Visual Style: ${theme.imagePrompt.style}
Color Mood: ${theme.imagePrompt.mood}

=== VISUAL DESIGN SPECIFICATIONS ===

COLORS:
${theme.imagePrompt.colorPalette}
- Use bold, vibrant versions of these colors that pop on social media
- Ensure strong contrast between background and text

TYPOGRAPHY:
${theme.imagePrompt.typography}
- Headlines must be EXTREMELY LARGE, BOLD, and READABLE
- Text must be clearly legible even as a small thumbnail
- Use high contrast text colors (white with black outline works universally)

DESIGN ELEMENTS:
${theme.imagePrompt.elements}
- Incorporate these elements tastefully to support the theme
- Don't overcrowd - leave breathing room

=== CONTENT TO FEATURE ===
HEADLINE (prominent): "${content.headline}"
SUBJECT/SERVICE: ${content.subject}
${content.details ? `DETAILS: ${content.details}` : ''}
${content.businessName ? `BUSINESS NAME: "${content.businessName}" - include as branding` : ''}
${content.logoInstructions ? `LOGO: ${content.logoInstructions}` : ''}

=== QUALITY STANDARDS ===
- Professional marketing agency quality
- Scroll-stopping visual impact
- Clean, polished, impressive design
- Auto repair industry appropriate

=== MUST AVOID ===
❌ Realistic human faces
❌ Copyrighted logos or characters
❌ Tiny, unreadable text
❌ Cluttered layouts
❌ Amateur or low-quality appearance

Create ONE stunning 4:5 aspect ratio promotional image that an auto repair shop would proudly post on Instagram/Facebook.`;
    }
    return '';
  },

  // Get all category definitions with metadata
  getCategoryDefinitions(): typeof THEME_CATEGORIES {
    return THEME_CATEGORIES;
  },

  getCategories(): string[] {
    return [...new Set(themes.map(t => t.category))];
  },

  getThemesByCategory(category: string): ThemeDefinition[] {
    return themes.filter(t => t.category === category);
  },

  // Get themes organized by category for UI display
  getThemesGroupedByCategory(): Record<string, ThemeDefinition[]> {
    const grouped: Record<string, ThemeDefinition[]> = {};
    for (const theme of themes) {
      if (!grouped[theme.category]) {
        grouped[theme.category] = [];
      }
      grouped[theme.category].push(theme);
    }
    return grouped;
  },

  getThemesForTool(tool: string): ThemeDefinition[] {
    return themes.filter(t => t.compatibleTools.includes(tool));
  },

  // Search themes by name or description
  searchThemes(query: string): ThemeDefinition[] {
    const lowerQuery = query.toLowerCase();
    return themes.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.shortDescription?.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery)
    );
  },

  // Get featured themes (brand styles + popular picks)
  getFeaturedThemes(count: number = 8): ThemeDefinition[] {
    const featured = [
      ...brandStyleThemes.slice(0, 4),
      ...themes.filter(t => !brandStyleThemes.some(bs => bs.id === t.id)).slice(0, count - 4),
    ];
    return featured.slice(0, count);
  },

  getRandomThemes(count: number, exclude: string[] = []): ThemeDefinition[] {
    const available = themes.filter(t => !exclude.includes(t.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },

  // ============================================================================
  // NOSTALGIC THEME METHODS
  // ============================================================================

  // Get all nostalgic themes
  getNostalgicThemes(): NostalgicThemeDefinition[] {
    return NOSTALGIC_THEMES;
  },

  // Get nostalgic themes by era
  getNostalgicThemesByEra(era: '1950s' | '1960s' | '1970s' | '1980s'): NostalgicThemeDefinition[] {
    return getNostalgicThemesByEra(era);
  },

  // Get nostalgic themes by style
  getNostalgicThemesByStyle(style: 'comic-book' | 'movie-poster' | 'magazine'): NostalgicThemeDefinition[] {
    return getNostalgicThemesByStyle(style);
  },

  // Get nostalgic themes by era and style
  getNostalgicThemesByEraAndStyle(
    era: '1950s' | '1960s' | '1970s' | '1980s',
    style: 'comic-book' | 'movie-poster' | 'magazine'
  ): NostalgicThemeDefinition[] {
    return getNostalgicThemesByEraAndStyle(era, style);
  },

  // Get a random nostalgic theme
  getRandomNostalgicTheme(): NostalgicThemeDefinition {
    return getRandomNostalgicTheme();
  },

  // Get a random nostalgic theme by era
  getRandomNostalgicThemeByEra(era: '1950s' | '1960s' | '1970s' | '1980s'): NostalgicThemeDefinition {
    return getRandomNostalgicThemeByEra(era);
  },

  // Get a random nostalgic theme by style
  getRandomNostalgicThemeByStyle(style: 'comic-book' | 'movie-poster' | 'magazine'): NostalgicThemeDefinition {
    return getRandomNostalgicThemeByStyle(style);
  },

  // Get a nostalgic theme by ID
  getNostalgicTheme(id: string): NostalgicThemeDefinition | undefined {
    return NOSTALGIC_THEMES.find(t => t.id === id);
  },

  // ============================================================================
  // VEHICLE METHODS
  // ============================================================================

  // Get all vehicles
  getAllVehicles(): EraVehicle[] {
    return ALL_VEHICLES;
  },

  // Get vehicles by era
  getVehiclesByEra(era: '1950s' | '1960s' | '1970s' | '1980s'): EraVehicle[] {
    return getVehiclesByEra(era);
  },

  // Get a vehicle by ID
  getVehicleById(id: string): EraVehicle | undefined {
    return getVehicleById(id);
  },

  // Get a random vehicle
  getRandomVehicle(): EraVehicle {
    return getRandomVehicle();
  },

  // Get a random vehicle by era
  getRandomVehicleByEra(era: '1950s' | '1960s' | '1970s' | '1980s'): EraVehicle {
    return getRandomVehicleByEra(era);
  },

  // Get vehicle image prompt hint
  getVehicleImagePrompt(vehicle: EraVehicle): string {
    return getVehicleImagePrompt(vehicle);
  },

  // Get era info
  getEraInfo(): typeof ERA_INFO {
    return ERA_INFO;
  },

  // Get random brand styles (premium styles only)
  getRandomBrandStyles(count: number, exclude: string[] = []): ThemeDefinition[] {
    const available = brandStyleThemes.filter(t => !exclude.includes(t.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },

  // Get themes by multiple categories
  getThemesByCategories(categories: string[]): ThemeDefinition[] {
    return themes.filter(t => categories.includes(t.category));
  },

  // ============================================================================
  // HOLIDAY THEME METHODS
  // ============================================================================

  // Get all holiday packs
  getAllHolidayPacks(): HolidayPack[] {
    return getAllHolidayPacks();
  },

  // Get a specific holiday pack by ID
  getHolidayPack(id: string): HolidayPack | undefined {
    return getHolidayPack(id);
  },

  // Get themes from specified holiday packs
  getThemesFromHolidayPacks(packIds: string[]): NostalgicThemeDefinition[] {
    return getThemesFromHolidayPacks(packIds);
  },

  // Get holiday packs that are currently in season
  getInSeasonHolidayPacks(): HolidayPack[] {
    return getInSeasonHolidayPacks();
  },

  // Get a specific holiday theme by ID
  getHolidayTheme(themeId: string): NostalgicThemeDefinition | undefined {
    return getHolidayTheme(themeId);
  },

  // Get all holiday theme IDs (useful for exclusion)
  getAllHolidayThemeIds(): string[] {
    return getAllHolidayThemeIds();
  },
};

// Re-export brand style types and helpers
export { BrandStyle, getBrandStyle, buildBrandStyleImagePrompt, BRAND_STYLES };
export { ADDITIONAL_THEMES } from './additional-themes';

// Re-export nostalgic theme types and helpers
export {
  NOSTALGIC_THEMES,
  NostalgicThemeDefinition,
  getNostalgicThemesByEra,
  getNostalgicThemesByStyle,
  getNostalgicThemesByEraAndStyle,
  getRandomNostalgicTheme,
  getRandomNostalgicThemeByEra,
  getRandomNostalgicThemeByStyle,
} from './nostalgic-themes';

// Re-export vehicle types and helpers
export {
  ERA_VEHICLES,
  ALL_VEHICLES,
  EraVehicle,
  getVehicleById,
  getVehiclesByEra,
  getRandomVehicle,
  getRandomVehicleByEra,
  getVehicleImagePrompt,
  ERA_INFO,
} from './era-vehicles';

// Re-export holiday theme types and helpers
export {
  HOLIDAY_PACKS,
  HolidayPack,
  getAllHolidayPacks,
  getHolidayPack,
  getThemesFromHolidayPacks,
  getAllHolidayThemeIds,
  getInSeasonHolidayPacks,
  getHolidayTheme,
} from './holiday-themes';

export default themeRegistry;
