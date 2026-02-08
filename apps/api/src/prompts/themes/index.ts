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
import {
  STYLE_FAMILIES,
  StyleFamily,
  ALL_NEW_FAMILY_THEMES,
  getAllFamilies,
  getFamilyById,
  getFamilyForTheme,
  getWeeklyDropFamily,
  getCurrentWeekString,
} from './style-families';
import { customThemeStore } from '../../services/custom-theme-store';
import { buildClonedStylePrompt, ExtractedStyle } from '../../services/style-cloner.service';

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
    previewColors: ['#C41E3A', '#F5F5DC', '#4682B4', '#C0C0C0'],
    shortDescription: 'Classic 1950s hand-painted garage signs',
    imagePrompt: {
      style: 'Vintage 1950s americana garage. Hand-painted sign aesthetic with oil-stained textures. Full-service gas station era.',
      colorPalette: 'Cherry red (#C41E3A), cream (#F5F5DC), steel blue (#4682B4), chrome silver (#C0C0C0). Warm sepia undertones.',
      typography: 'Bold vintage slab-serif lettering. Hand-painted sign style with slight imperfections. All-caps headlines.',
      elements: 'Classic car silhouettes, oil cans, vintage tools, checkered floor, neon "OPEN" sign, chrome pinstriping borders.',
      mood: 'Nostalgic, trustworthy, classic American, family-owned warmth.',
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
    previewColors: ['#CC5500', '#F4A460', '#FF6B81', '#40E0D0'],
    shortDescription: 'Southwestern desert sunset vibes',
    imagePrompt: {
      style: 'Southwestern desert aesthetic. Arizona sunset golden hour. Adobe textures and dusty open roads.',
      colorPalette: 'Terracotta (#CC5500), desert sand (#F4A460), sunset coral (#FF6B81), turquoise (#40E0D0). Warm earth tones throughout.',
      typography: 'Bold western slab-serif. Rustic hand-stamped style. Warm-toned text on desert backgrounds.',
      elements: 'Saguaro cacti silhouettes, desert mountains, sunset gradient sky, dusty road, adobe wall textures.',
      mood: 'Warm, adventurous, local pride, rugged reliability.',
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
    previewColors: ['#0066FF', '#FF1493', '#39FF14', '#4B0082'],
    shortDescription: 'Cyberpunk neon glow on dark streets',
    imagePrompt: {
      style: 'Cyberpunk neon aesthetic. Night city vibes with glowing signage. Rain-slicked urban streets reflecting color.',
      colorPalette: 'Electric blue (#0066FF), hot pink (#FF1493), neon green (#39FF14), deep purple (#4B0082). All on black (#0A0A0A) backgrounds.',
      typography: 'Glowing neon tube lettering. Futuristic sans-serif with outer glow effect. Text looks like actual neon signs.',
      elements: 'Neon tube signs, rain puddle reflections, city buildings, glowing car headlights, steam/fog with neon color.',
      mood: 'Edgy, modern, premium, night-owl energy.',
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
    previewColors: ['#1E3A5F', '#C0C0C0', '#FFFFFF', '#CC0000'],
    shortDescription: 'Professional workshop with clean tools',
    imagePrompt: {
      style: 'Professional auto service aesthetic. Clean, organized workshop. ASE-certified expertise feel.',
      colorPalette: 'Deep navy (#1E3A5F), chrome silver (#C0C0C0), clean white (#FFFFFF), red accent (#CC0000). Professional and trustworthy.',
      typography: 'Clean sans-serif bold headings. Professional, readable at any size. High contrast on solid backgrounds.',
      elements: 'Wrench and gear icons, organized tool wall, clean workspace, certification badge graphic, polished floor.',
      mood: 'Professional, trustworthy, certified, expert craftsmanship.',
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
    previewColors: ['#FF1493', '#00CED1', '#FFD700', '#8A2BE2'],
    shortDescription: 'Synthwave VHS era, totally radical',
    imagePrompt: {
      style: '1980s pop culture aesthetic. Synthwave sunset grid vibes. VHS-era neon glow. Retro-futurism.',
      colorPalette: 'Hot pink (#FF1493), electric cyan (#00CED1), sunshine gold (#FFD700), purple gradient (#8A2BE2 to #4B0082). Sunset sky backdrop.',
      typography: 'Chrome 3D extruded text with pink/cyan reflections. Italic speed angle. Bold outlines with metallic sheen.',
      elements: 'Palm tree silhouettes, perspective grid horizon, geometric triangles, sunset gradient bands, DeLorean-style car.',
      mood: 'Fun, nostalgic, energetic, totally rad. VHS tracking lines optional.',
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
    previewColors: ['#FFFFFF', '#1A1A1A', '#FF4444', '#E0E0E0'],
    shortDescription: 'Clean white space, single accent color',
    imagePrompt: {
      style: 'Clean minimalist design. Apple-inspired luxury. Maximum white space. Less is more.',
      colorPalette: 'Pure white (#FFFFFF) dominant, charcoal black (#1A1A1A) text, single red accent (#FF4444), light gray (#E0E0E0) borders. 80% whitespace.',
      typography: 'Thin modern sans-serif (Helvetica Neue style). Generous letter-spacing. Lowercase elegance for body, uppercase for headline.',
      elements: 'Clean hairline borders, single geometric shape, ample negative space, subtle drop shadows. No clutter.',
      mood: 'Sophisticated, premium, clean, modern luxury. Breathable layout.',
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
    previewColors: ['#CC0000', '#1C1C1C', '#C0C0C0', '#FFD700'],
    shortDescription: 'High-performance racing heritage',
    imagePrompt: {
      style: 'High-performance automotive aesthetic. Racing heritage poster feel. Dynamic angles and motion blur.',
      colorPalette: 'Racing red (#CC0000), carbon black (#1C1C1C), metallic silver (#C0C0C0), yellow accent (#FFD700). Bold contrast.',
      typography: 'Bold italic racing fonts with speed line streaks. Dynamic tilted angles. Large impact headlines.',
      elements: 'Racing stripes, carbon fiber texture background, speedometer/tachometer graphic, checkered flag border accent.',
      mood: 'Fast, powerful, exciting, adrenaline-fueled performance.',
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
    previewColors: ['#6495ED', '#FFD700', '#90EE90', '#FF8C00'],
    shortDescription: 'Warm, approachable, family-first',
    imagePrompt: {
      style: 'Warm family-oriented design. Approachable and inviting. Bright, cheerful, safe.',
      colorPalette: 'Soft blue (#6495ED), warm yellow (#FFD700), gentle green (#90EE90), friendly orange (#FF8C00). Pastel-bright palette.',
      typography: 'Rounded friendly sans-serif (like Nunito). Easy to read, warm and welcoming. Large, soft headline.',
      elements: 'Family SUV/minivan silhouette, shield/safety icon, heart accent, clean simple layout with rounded corners.',
      mood: 'Warm, trustworthy, safe, family-first. Feels like a neighbor you trust.',
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
    previewColors: ['#228B22', '#8B4513', '#D2691E', '#4682B4'],
    shortDescription: 'Rugged work-ready pickup truck vibes',
    imagePrompt: {
      style: 'Rugged truck and country aesthetic. Work-ready, built tough. Dirt road reliability.',
      colorPalette: 'Forest green (#228B22), earth brown (#8B4513), rust orange (#D2691E), denim blue (#4682B4). Natural earth tones.',
      typography: 'Bold stencil military-style fonts. Rugged texture overlays. Workwear stamp aesthetic.',
      elements: 'Pickup truck silhouette, mountain ridge backdrop, dirt road texture, heavy-duty tool graphics, steel plate border.',
      mood: 'Rugged, hardworking, reliable, no-nonsense. Built Ford Tough energy.',
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
    previewColors: ['#228B22', '#87CEEB', '#8B4513', '#FFFFFF'],
    shortDescription: 'Sustainable, eco-friendly, forward-thinking',
    imagePrompt: {
      style: 'Eco-friendly modern design. Clean, sustainable, forward-thinking. Nature meets technology.',
      colorPalette: 'Leaf green (#228B22), sky blue (#87CEEB), earth brown (#8B4513), clean white (#FFFFFF). Natural, fresh palette.',
      typography: 'Clean modern rounded sans-serif. Organic letter shapes. Light weight for eco lightness, bold for headlines.',
      elements: 'Leaf/plant motifs, EV charging plug icon, recycling arrows, gradient green-to-blue backgrounds, clean air feel.',
      mood: 'Sustainable, forward-thinking, responsible, clean. Feel-good environmentalism.',
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

// Combined themes: brand styles first (premium), then legacy, additional, nostalgic, and new family themes
const allExisting = [
  ...brandStyleThemes,
  ...legacyThemes.filter(lt => !brandStyleThemes.some(bt => bt.id === lt.id)),
  ...ADDITIONAL_THEMES.filter(at =>
    !brandStyleThemes.some(bt => bt.id === at.id) &&
    !legacyThemes.some(lt => lt.id === at.id)
  ),
  ...nostalgicAsThemes.filter(nt =>
    !brandStyleThemes.some(bt => bt.id === nt.id) &&
    !legacyThemes.some(lt => lt.id === nt.id) &&
    !ADDITIONAL_THEMES.some(at => at.id === nt.id)
  ),
];
const existingIds = new Set(allExisting.map(t => t.id));
const themes: ThemeDefinition[] = [
  ...allExisting,
  ...ALL_NEW_FAMILY_THEMES.filter(t => !existingIds.has(t.id)),
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
  { id: 'custom', name: 'Custom Styles', icon: '🎨', description: 'Admin-curated styles from any industry' },
  { id: 'photography', name: 'Pro Photography', icon: '📸', description: 'Studio-quality car photography' },
  { id: 'meme', name: 'Social Meme', icon: '😂', description: 'Relatable humor and shareable content' },
  { id: 'before-after', name: 'Before / After', icon: '🔄', description: 'Transformation comparisons' },
  { id: 'bold-cta', name: 'Bold CTA', icon: '📣', description: 'Direct offers and pricing' },
  { id: 'editorial', name: 'Editorial', icon: '📰', description: 'Magazine and newsletter formats' },
  { id: 'edu-tips', name: 'Edu-Tips', icon: '💡', description: 'Educational tips and infographics' },
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
    return [...themes, ...customThemeStore.getAll()];
  },

  // Get total theme count
  getThemeCount(): number {
    return themes.length + customThemeStore.getAll().length;
  },

  // Get premium brand styles only (for featured display)
  getBrandStyles(): ThemeDefinition[] {
    return brandStyleThemes;
  },

  getTheme(id: string): ThemeDefinition | undefined {
    return themes.find(t => t.id === id) || customThemeStore.getById(id);
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
    // Custom theme — use cloned style prompt builder
    if (styleId.startsWith('custom-')) {
      const customTheme = customThemeStore.getById(styleId);
      if (customTheme) {
        // Build an ExtractedStyle from the theme definition
        const style: ExtractedStyle = {
          name: customTheme.name,
          shortDescription: customTheme.shortDescription || '',
          sourceIndustry: 'custom',
          imagePrompt: customTheme.imagePrompt,
          compositionNotes: (customTheme as any).compositionNotes || 'Strong composition with clear visual hierarchy.',
          avoidList: (customTheme as any).avoidList || 'Human faces/hands, copyrighted content, cluttered layouts',
          previewColors: customTheme.previewColors || [],
          textPrompt: customTheme.textPrompt,
        };
        return buildClonedStylePrompt(style, content);
      }
    }

    const brandStyle = getBrandStyle(styleId);
    if (brandStyle) {
      return buildBrandStyleImagePrompt(brandStyle, content);
    }
    // Fallback for legacy and additional themes
    const theme = themes.find(t => t.id === styleId);
    if (theme) {
      return `Create a professional marketing flyer in the "${theme.name}" style.

=== CREATIVE DIRECTION ===
Visual Style: ${theme.imagePrompt.style}
Color Palette: ${theme.imagePrompt.colorPalette}
Typography: ${theme.imagePrompt.typography}
Design Elements: ${theme.imagePrompt.elements}
Mood: ${theme.imagePrompt.mood}

=== CONTENT ===
HEADLINE: "${content.headline}"
SERVICE: ${content.subject}
${content.details ? `DETAILS: ${content.details}` : ''}
${content.businessName ? `BUSINESS NAME: "${content.businessName}"` : ''}
${content.logoInstructions ? `LOGO: ${content.logoInstructions}` : ''}`;
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
    const base = themes.filter(t => t.category === category);
    if (category === 'custom') {
      return [...base, ...customThemeStore.getAll()];
    }
    return base;
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
    const all = [...themes, ...customThemeStore.getAll()];
    return all.filter(t =>
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

  // ============================================================================
  // STYLE FAMILY METHODS
  // ============================================================================

  getAllFamilies(): StyleFamily[] {
    return getAllFamilies();
  },

  getFamilyById(id: string): StyleFamily | undefined {
    return getFamilyById(id);
  },

  getFamilyForTheme(themeId: string): StyleFamily | undefined {
    return getFamilyForTheme(themeId);
  },

  getWeeklyDropFamily(): StyleFamily {
    return getWeeklyDropFamily();
  },

  getCurrentWeekString(): string {
    return getCurrentWeekString();
  },

  /** Get resolved ThemeDefinition objects for a given family */
  getThemesByFamily(familyId: string): ThemeDefinition[] {
    const family = getFamilyById(familyId);
    if (!family) return [];
    return family.themeIds
      .map(id => themes.find(t => t.id === id))
      .filter((t): t is ThemeDefinition => t !== undefined);
  },

  /** Get a random theme from a specific family */
  getRandomThemeFromFamily(familyId: string): ThemeDefinition | undefined {
    const familyThemes = this.getThemesByFamily(familyId);
    if (familyThemes.length === 0) return undefined;
    return familyThemes[Math.floor(Math.random() * familyThemes.length)];
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

// Re-export style family types and helpers
export {
  STYLE_FAMILIES,
  StyleFamily,
  ALL_NEW_FAMILY_THEMES,
  getAllFamilies,
  getFamilyById,
  getFamilyForTheme,
  getWeeklyDropFamily,
  getCurrentWeekString,
} from './style-families';

export default themeRegistry;
