/**
 * Additional Theme Definitions
 * Extends the theme system to 45+ themes organized by category
 */

import { ThemeDefinition } from './index';

// ============================================================================
// VINTAGE & RETRO THEMES
// ============================================================================

export const vintageThemes: ThemeDefinition[] = [
  {
    id: 'art-deco-garage',
    name: 'Art Deco Garage',
    category: 'vintage',
    shortDescription: 'Glamorous 1920s-30s style',
    previewColors: ['#D4AF37', '#1C1C1C', '#F5F5DC', '#8B0000'],
    imagePrompt: {
      style: '1920s-30s Art Deco design, geometric elegance, Gatsby era glamour',
      colorPalette: 'Gold, black, cream, burgundy accents, metallic sheen',
      typography: 'Geometric display fonts, bold sans-serif, elegant spacing',
      elements: 'Sunburst patterns, geometric shapes, fan motifs, gold accents, vintage car illustrations',
      mood: 'Glamorous, elegant, sophisticated, timeless luxury',
    },
    textPrompt: {
      tone: 'Sophisticated, elegant, refined',
      vocabulary: ['elegant', 'distinguished', 'premier', 'exclusive', 'quality'],
    },
    mockupScenes: ['on marble counter', 'in gilded frame', 'theater lobby display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'route-66',
    name: 'Route 66',
    category: 'vintage',
    shortDescription: 'Classic American highway nostalgia',
    previewColors: ['#C41E3A', '#4169E1', '#F5DEB3', '#228B22'],
    imagePrompt: {
      style: 'Classic Route 66 Americana, roadside attraction aesthetic',
      colorPalette: 'Red, white, blue, desert tans, vintage greens',
      typography: 'Vintage highway signs, roadside attraction lettering',
      elements: 'Highway 66 shields, vintage gas pumps, roadside signs, desert landscapes, classic cars',
      mood: 'Adventurous, nostalgic, American freedom, open road spirit',
    },
    textPrompt: {
      tone: 'Adventurous, nostalgic, free-spirited',
      vocabulary: ['road trip', 'adventure', 'classic', 'American', 'journey'],
    },
    mockupScenes: ['roadside sign', 'vintage gas station', 'desert highway'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'drive-in-movie',
    name: 'Drive-In Movie',
    category: 'vintage',
    shortDescription: '1950s drive-in theater vibes',
    previewColors: ['#FF1493', '#00CED1', '#FFD700', '#191970'],
    imagePrompt: {
      style: '1950s drive-in movie theater aesthetic, starlit cinema nights',
      colorPalette: 'Neon pink, teal, gold stars, deep navy night sky',
      typography: 'Movie marquee lettering, bold illuminated style',
      elements: 'Movie screens, starry skies, classic cars, neon signs, popcorn graphics',
      mood: 'Fun, romantic, nostalgic, entertaining',
    },
    textPrompt: {
      tone: 'Fun, exciting, nostalgic',
      vocabulary: ['showtime', 'feature', 'premiere', 'classic', 'entertainment'],
    },
    mockupScenes: ['movie marquee', 'under stars', 'car dashboard at night'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'check_in_to_win'],
  },
  {
    id: 'chrome-diner',
    name: 'Chrome Diner',
    category: 'vintage',
    shortDescription: 'Shiny 50s diner aesthetic',
    previewColors: ['#FF6B6B', '#4ECDC4', '#F7F7F7', '#C0C0C0'],
    imagePrompt: {
      style: '1950s chrome diner aesthetic, retro restaurant vibes',
      colorPalette: 'Cherry red, mint green, chrome silver, checkerboard black/white',
      typography: 'Diner menu style, neon sign lettering, jukebox fonts',
      elements: 'Chrome finishes, checkered floors, jukebox, milkshake graphics, vinyl booths',
      mood: 'Fun, welcoming, nostalgic, community gathering',
    },
    textPrompt: {
      tone: 'Friendly, upbeat, welcoming',
      vocabulary: ['special', 'fresh', 'quality', 'family', 'classic'],
    },
    mockupScenes: ['diner counter', 'jukebox display', 'chrome tabletop'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'check_in_to_win'],
  },
  {
    id: 'pin-up-garage',
    name: 'Pin-Up Garage',
    category: 'vintage',
    shortDescription: 'Classic pin-up art style',
    previewColors: ['#DC143C', '#000080', '#F5F5DC', '#FFD700'],
    imagePrompt: {
      style: 'Classic 1940s-50s pin-up art inspired garage aesthetic',
      colorPalette: 'Crimson red, navy blue, cream, gold accents',
      typography: 'Vintage script and bold display fonts, hand-painted style',
      elements: 'Vintage car illustrations, tool graphics, banner ribbons, stars, aviation influence',
      mood: 'Bold, fun, classic Americana, eye-catching',
    },
    textPrompt: {
      tone: 'Bold, fun, attention-grabbing',
      vocabulary: ['classic', 'quality', 'trusted', 'service', 'original'],
    },
    mockupScenes: ['garage wall poster', 'tool calendar', 'shop window'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'vintage-racing',
    name: 'Vintage Racing',
    category: 'vintage',
    shortDescription: '1960s racing poster style',
    previewColors: ['#FF4500', '#1E3A5F', '#F5F5DC', '#8B4513'],
    imagePrompt: {
      style: '1960s vintage racing poster aesthetic, Le Mans era',
      colorPalette: 'Racing orange, deep blue, cream, leather brown',
      typography: 'Classic racing poster fonts, bold italic, hand-drawn feel',
      elements: 'Vintage race cars, checkered flags, speed lines, racing numbers, retro pit crew',
      mood: 'Exciting, prestigious, heritage, thrilling',
    },
    textPrompt: {
      tone: 'Exciting, prestigious, heritage-focused',
      vocabulary: ['champion', 'precision', 'heritage', 'performance', 'racing'],
    },
    mockupScenes: ['race track poster', 'pit garage wall', 'collectors display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
];

// ============================================================================
// MODERN & TECH THEMES
// ============================================================================

export const modernThemes: ThemeDefinition[] = [
  {
    id: 'cyberpunk-garage',
    name: 'Cyberpunk Garage',
    category: 'modern',
    shortDescription: 'Futuristic neon dystopia',
    previewColors: ['#FF00FF', '#00FFFF', '#1A1A2E', '#FFFF00'],
    imagePrompt: {
      style: 'Cyberpunk dystopian future, blade runner aesthetic',
      colorPalette: 'Magenta, cyan, deep purple, electric yellow, neon on dark',
      typography: 'Futuristic glitch fonts, digital display style, neon glow',
      elements: 'Holographic elements, rain reflections, neon kanji, futuristic vehicles, circuit patterns',
      mood: 'Edgy, futuristic, underground, cutting-edge',
    },
    textPrompt: {
      tone: 'Edgy, futuristic, mysterious',
      vocabulary: ['upgrade', 'tech', 'system', 'elite', 'next-gen'],
    },
    mockupScenes: ['rain-slicked street', 'neon alley', 'holographic display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'ugc_video'],
  },
  {
    id: 'electric-future',
    name: 'Electric Future',
    category: 'modern',
    shortDescription: 'Clean EV innovation style',
    previewColors: ['#00FF88', '#0066FF', '#FFFFFF', '#E0E0E0'],
    imagePrompt: {
      style: 'Clean electric vehicle future, sustainable innovation',
      colorPalette: 'Electric green, bright blue, pure white, soft gray',
      typography: 'Ultra-clean sans-serif, thin weights, generous spacing',
      elements: 'EV charging icons, battery graphics, clean energy symbols, sleek vehicles',
      mood: 'Clean, innovative, sustainable, forward-thinking',
    },
    textPrompt: {
      tone: 'Innovative, clean, forward-thinking',
      vocabulary: ['electric', 'sustainable', 'future', 'efficient', 'smart'],
    },
    mockupScenes: ['charging station', 'showroom floor', 'clean energy display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'seo_blog'],
  },
  {
    id: 'digital-grid',
    name: 'Digital Grid',
    category: 'modern',
    shortDescription: 'Matrix-inspired data visualization',
    previewColors: ['#00FF00', '#003300', '#111111', '#00CC00'],
    imagePrompt: {
      style: 'Matrix-inspired digital aesthetic, data visualization',
      colorPalette: 'Terminal green, deep black, matrix code green variations',
      typography: 'Monospace digital fonts, code-style text, terminal aesthetic',
      elements: 'Falling code, grid patterns, digital readouts, diagnostic displays, circuit traces',
      mood: 'Technical, precise, digital-native, advanced',
    },
    textPrompt: {
      tone: 'Technical, precise, data-driven',
      vocabulary: ['diagnostic', 'system', 'analyze', 'optimize', 'data'],
    },
    mockupScenes: ['diagnostic screen', 'tech display', 'digital dashboard'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'check_in_to_win'],
  },
  {
    id: 'holographic',
    name: 'Holographic',
    category: 'modern',
    shortDescription: 'Iridescent rainbow chrome',
    previewColors: ['#FF6EC7', '#7B68EE', '#00CED1', '#FFD700'],
    imagePrompt: {
      style: 'Holographic iridescent aesthetic, rainbow chrome finish',
      colorPalette: 'Shifting pink-purple-blue-gold, iridescent gradients, rainbow chrome',
      typography: 'Clean modern fonts with holographic shine effect',
      elements: 'Holographic textures, rainbow gradients, metallic sheens, prismatic light',
      mood: 'Premium, eye-catching, modern luxury, unique',
    },
    textPrompt: {
      tone: 'Premium, eye-catching, unique',
      vocabulary: ['premium', 'exclusive', 'custom', 'unique', 'shine'],
    },
    mockupScenes: ['luxury display', 'chrome surface', 'light-catching angle'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    category: 'modern',
    shortDescription: 'Retrowave sunset vibes',
    previewColors: ['#FF1493', '#4B0082', '#FF8C00', '#00CED1'],
    imagePrompt: {
      style: 'Synthwave retrowave aesthetic, sunset grid vibes',
      colorPalette: 'Hot pink, deep purple, sunset orange, teal, gradient sunsets',
      typography: 'Chrome 3D text, neon outlines, 80s-inspired futurism',
      elements: 'Grid horizon, sunset gradients, palm tree silhouettes, retro-future cars, chrome effects',
      mood: 'Nostalgic-futuristic, cool, vibrant, aesthetic',
    },
    textPrompt: {
      tone: 'Cool, vibrant, nostalgic-futuristic',
      vocabulary: ['retro', 'vibes', 'cruise', 'sunset', 'drive'],
    },
    mockupScenes: ['sunset background', 'neon display', 'chrome surface'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day', 'ugc_video'],
  },
];

// ============================================================================
// PREMIUM & LUXURY THEMES
// ============================================================================

export const premiumThemes: ThemeDefinition[] = [
  {
    id: 'italian-exotic',
    name: 'Italian Exotic',
    category: 'premium',
    shortDescription: 'Ferrari and Lamborghini essence',
    previewColors: ['#FF2800', '#000000', '#F5F5DC', '#FFD700'],
    imagePrompt: {
      style: 'Italian supercar exotic aesthetic, Maranello craftsmanship',
      colorPalette: 'Ferrari red, jet black, cream, gold accents',
      typography: 'Elegant Italian styling, refined serif or thin sans',
      elements: 'Prancing horse inspired shapes, racing heritage, Italian flag colors, sleek curves',
      mood: 'Passionate, exotic, prestigious, exciting',
    },
    textPrompt: {
      tone: 'Passionate, prestigious, exclusive',
      vocabulary: ['exotic', 'passion', 'precision', 'heritage', 'performance'],
    },
    mockupScenes: ['showroom display', 'Italian villa', 'racing garage'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'japanese-precision',
    name: 'Japanese Precision',
    category: 'premium',
    shortDescription: 'Lexus and Infiniti refinement',
    previewColors: ['#C0C0C0', '#1A1A1A', '#8B0000', '#FFFFFF'],
    imagePrompt: {
      style: 'Japanese luxury automotive precision, zen-inspired refinement',
      colorPalette: 'Silver, deep black, subtle red accents, pure white',
      typography: 'Clean, precise Japanese-inspired minimalism',
      elements: 'Minimalist design, precision details, zen patterns, cherry blossom hints, clean lines',
      mood: 'Precise, refined, harmonious, quality-focused',
    },
    textPrompt: {
      tone: 'Precise, refined, quality-focused',
      vocabulary: ['precision', 'craftsmanship', 'harmony', 'quality', 'detail'],
    },
    mockupScenes: ['zen garden setting', 'minimalist display', 'precision workshop'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'black-label',
    name: 'Black Label',
    category: 'premium',
    shortDescription: 'Ultra-premium dark luxury',
    previewColors: ['#000000', '#FFD700', '#1C1C1C', '#C0C0C0'],
    imagePrompt: {
      style: 'Ultra-premium black label aesthetic, exclusive luxury',
      colorPalette: 'Deep black, rich gold, platinum silver, subtle charcoal',
      typography: 'Elegant thin fonts, gold foil effect, minimal text',
      elements: 'Black matte textures, gold accents, embossed effects, luxury details',
      mood: 'Exclusive, sophisticated, powerful, ultra-premium',
    },
    textPrompt: {
      tone: 'Exclusive, sophisticated, ultra-premium',
      vocabulary: ['exclusive', 'elite', 'distinguished', 'premier', 'bespoke'],
    },
    mockupScenes: ['black velvet display', 'luxury showroom', 'gold-lit setting'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'platinum-prestige',
    name: 'Platinum Prestige',
    category: 'premium',
    shortDescription: 'Silver and white elegance',
    previewColors: ['#E5E4E2', '#FFFFFF', '#4A4A4A', '#C0C0C0'],
    imagePrompt: {
      style: 'Platinum and white luxury aesthetic, pristine elegance',
      colorPalette: 'Platinum silver, pure white, cool grays, subtle blue undertones',
      typography: 'Ultra-light elegant fonts, refined spacing, understated',
      elements: 'Platinum metallic effects, clean white space, subtle gradients, minimal accents',
      mood: 'Pure, elegant, prestigious, pristine',
    },
    textPrompt: {
      tone: 'Pure, elegant, prestigious',
      vocabulary: ['pristine', 'excellence', 'premium', 'certified', 'elite'],
    },
    mockupScenes: ['white gallery', 'platinum display', 'luxury boutique'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
];

// ============================================================================
// AUTOMOTIVE & PERFORMANCE THEMES
// ============================================================================

export const automotiveThemes: ThemeDefinition[] = [
  {
    id: 'off-road-adventure',
    name: 'Off-Road Adventure',
    category: 'automotive',
    shortDescription: 'Jeep and 4x4 rugged style',
    previewColors: ['#556B2F', '#8B4513', '#FFD700', '#4A4A4A'],
    imagePrompt: {
      style: 'Rugged off-road adventure aesthetic, trail-ready vibes',
      colorPalette: 'Olive green, mud brown, adventure gold, rock gray',
      typography: 'Bold rugged fonts, trail-worn style, outdoors aesthetic',
      elements: 'Mountain silhouettes, trail markers, tire tracks, compass graphics, 4x4 vehicles',
      mood: 'Adventurous, rugged, capable, outdoor-loving',
    },
    textPrompt: {
      tone: 'Adventurous, rugged, capable',
      vocabulary: ['trail', 'adventure', 'capable', 'rugged', 'ready'],
    },
    mockupScenes: ['trail sign', 'muddy truck bed', 'campsite display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'import-tuner',
    name: 'Import Tuner',
    category: 'automotive',
    shortDescription: 'JDM street racing culture',
    previewColors: ['#00FF00', '#FF4500', '#1C1C1C', '#FFFF00'],
    imagePrompt: {
      style: 'JDM import tuner aesthetic, street racing culture',
      colorPalette: 'Neon green, racing orange, black, electric yellow',
      typography: 'Japanese-influenced modern, racing decal style, sharp angles',
      elements: 'Rising sun hints, drift smoke, neon underglow, carbon fiber, spoiler silhouettes',
      mood: 'Fast, cool, underground, passionate',
    },
    textPrompt: {
      tone: 'Cool, fast, passionate',
      vocabulary: ['boost', 'tune', 'build', 'performance', 'custom'],
    },
    mockupScenes: ['parking garage', 'night meet', 'car show display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day', 'ugc_video'],
  },
  {
    id: 'classic-cruiser',
    name: 'Classic Cruiser',
    category: 'automotive',
    shortDescription: 'Lowrider and classic car culture',
    previewColors: ['#800020', '#FFD700', '#C0C0C0', '#000000'],
    imagePrompt: {
      style: 'Classic lowrider and cruiser aesthetic, car show culture',
      colorPalette: 'Candy burgundy, gold chrome, silver, deep black',
      typography: 'Classic script and bold block letters, lowrider style',
      elements: 'Chrome wheels, pinstripe flames, classic car profiles, chain steering wheels',
      mood: 'Cool, classic, proud, stylish',
    },
    textPrompt: {
      tone: 'Cool, proud, stylish',
      vocabulary: ['classic', 'custom', 'chrome', 'clean', 'show-quality'],
    },
    mockupScenes: ['car show display', 'boulevard cruise', 'garage reveal'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'drift-culture',
    name: 'Drift Culture',
    category: 'automotive',
    shortDescription: 'Japanese drift racing style',
    previewColors: ['#FF4500', '#000000', '#FFFFFF', '#FFD700'],
    imagePrompt: {
      style: 'Japanese drift racing aesthetic, tire smoke and angles',
      colorPalette: 'Burnt orange, black, white, gold sponsor style',
      typography: 'Aggressive angled fonts, racing livery style',
      elements: 'Tire smoke, sideways cars, Japanese text accents, racing numbers, drift angles',
      mood: 'Aggressive, skilled, exciting, rebellious',
    },
    textPrompt: {
      tone: 'Exciting, skilled, aggressive',
      vocabulary: ['angle', 'smoke', 'sideways', 'skill', 'control'],
    },
    mockupScenes: ['drift track', 'tire barrier', 'race paddock'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day', 'ugc_video'],
  },
  {
    id: 'nascar-oval',
    name: 'NASCAR Oval',
    category: 'automotive',
    shortDescription: 'American stock car racing',
    previewColors: ['#FF0000', '#00008B', '#FFFFFF', '#FFD700'],
    imagePrompt: {
      style: 'NASCAR and American oval racing aesthetic',
      colorPalette: 'Bold red, patriotic blue, white, gold championship',
      typography: 'Bold racing fonts, sponsor-style layouts, numbers prominent',
      elements: 'Checkered flags, oval track shapes, stock car silhouettes, sponsor banners, trophies',
      mood: 'Exciting, patriotic, competitive, fast',
    },
    textPrompt: {
      tone: 'Exciting, competitive, patriotic',
      vocabulary: ['champion', 'victory', 'speed', 'race', 'win'],
    },
    mockupScenes: ['victory lane', 'race track banner', 'pit road display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
];

// ============================================================================
// REGIONAL THEMES
// ============================================================================

export const regionalThemes: ThemeDefinition[] = [
  {
    id: 'texas-pride',
    name: 'Texas Pride',
    category: 'regional',
    shortDescription: 'Lone Star state aesthetic',
    previewColors: ['#BF0A30', '#002868', '#FFFFFF', '#DAA520'],
    imagePrompt: {
      style: 'Texas Lone Star aesthetic, big and bold',
      colorPalette: 'Texas red, blue, white, gold star accents',
      typography: 'Bold western fonts, star accents, Texas pride lettering',
      elements: 'Lone star motifs, Texas flag, longhorn silhouettes, oil derricks, cowboys boots',
      mood: 'Proud, big, friendly, genuine',
    },
    textPrompt: {
      tone: 'Proud, friendly, straightforward',
      vocabulary: ['Texas', 'big', 'trusted', 'quality', 'pride'],
    },
    mockupScenes: ['Texas ranch', 'rodeo display', 'truck tailgate'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'california-coast',
    name: 'California Coast',
    category: 'regional',
    shortDescription: 'SoCal beach vibes',
    previewColors: ['#FFB347', '#87CEEB', '#FFFFFF', '#228B22'],
    imagePrompt: {
      style: 'California coastal aesthetic, beach and surf vibes',
      colorPalette: 'Sunset orange, ocean blue, white, palm green',
      typography: 'Relaxed modern fonts, surf culture influence, laid-back style',
      elements: 'Palm trees, surfboards, coastal sunsets, beach vibes, convertible cars',
      mood: 'Relaxed, sunny, positive, coastal cool',
    },
    textPrompt: {
      tone: 'Relaxed, positive, laid-back',
      vocabulary: ['chill', 'smooth', 'cruise', 'quality', 'local'],
    },
    mockupScenes: ['beach parking', 'coastal highway', 'surf shop'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'florida-sunshine',
    name: 'Florida Sunshine',
    category: 'regional',
    shortDescription: 'Sunshine State tropical vibes',
    previewColors: ['#FF6347', '#00CED1', '#FFD700', '#98FB98'],
    imagePrompt: {
      style: 'Florida tropical sunshine aesthetic',
      colorPalette: 'Tropical coral, turquoise, sunshine gold, lime green',
      typography: 'Fun tropical fonts, relaxed coastal style',
      elements: 'Palm trees, flamingos, sunshine, art deco Miami hints, tropical flowers',
      mood: 'Sunny, fun, tropical, welcoming',
    },
    textPrompt: {
      tone: 'Sunny, fun, welcoming',
      vocabulary: ['sunshine', 'tropical', 'local', 'friendly', 'reliable'],
    },
    mockupScenes: ['beach parking', 'Miami street', 'tropical setting'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'check_in_to_win'],
  },
  {
    id: 'mountain-west',
    name: 'Mountain West',
    category: 'regional',
    shortDescription: 'Rocky Mountain rugged beauty',
    previewColors: ['#4682B4', '#228B22', '#F5F5DC', '#8B4513'],
    imagePrompt: {
      style: 'Rocky Mountain West aesthetic, outdoor adventure',
      colorPalette: 'Mountain blue, forest green, cream, leather brown',
      typography: 'Outdoors-inspired fonts, lodge style, rugged elegance',
      elements: 'Mountain peaks, pine trees, outdoor gear, ski resort hints, wildlife silhouettes',
      mood: 'Adventurous, natural, rugged, reliable',
    },
    textPrompt: {
      tone: 'Adventurous, reliable, natural',
      vocabulary: ['mountain', 'rugged', 'ready', 'trusted', 'local'],
    },
    mockupScenes: ['mountain lodge', 'ski resort', 'trailhead'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'southern-charm',
    name: 'Southern Charm',
    category: 'regional',
    shortDescription: 'Warm Southern hospitality',
    previewColors: ['#87CEEB', '#F5F5DC', '#FFB6C1', '#228B22'],
    imagePrompt: {
      style: 'Southern hospitality aesthetic, warm and welcoming',
      colorPalette: 'Soft sky blue, cream, blush pink, magnolia green',
      typography: 'Elegant script and classic fonts, warm traditional style',
      elements: 'Magnolia flowers, front porch vibes, sweet tea references, southern charm',
      mood: 'Warm, welcoming, gracious, trustworthy',
    },
    textPrompt: {
      tone: 'Warm, gracious, friendly',
      vocabulary: ['welcome', 'quality', 'trusted', 'friendly', 'neighbor'],
    },
    mockupScenes: ['front porch', 'country road', 'small town main street'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'pacific-northwest',
    name: 'Pacific Northwest',
    category: 'regional',
    shortDescription: 'Seattle/Portland evergreen style',
    previewColors: ['#228B22', '#4A4A4A', '#87CEEB', '#8B4513'],
    imagePrompt: {
      style: 'Pacific Northwest aesthetic, evergreen and coffee culture',
      colorPalette: 'Forest green, rain gray, sky blue, wood brown',
      typography: 'Modern outdoors fonts, craft aesthetic, clean lines',
      elements: 'Pine trees, mountain silhouettes, rain drops, coffee culture hints, hiking vibes',
      mood: 'Authentic, outdoorsy, sustainable, local',
    },
    textPrompt: {
      tone: 'Authentic, sustainable, local',
      vocabulary: ['local', 'green', 'quality', 'crafted', 'trusted'],
    },
    mockupScenes: ['coffee shop', 'rainy street', 'forest backdrop'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'seo_blog'],
  },
];

// ============================================================================
// LIFESTYLE & FAMILY THEMES
// ============================================================================

export const lifestyleThemes: ThemeDefinition[] = [
  {
    id: 'urban-commuter',
    name: 'Urban Commuter',
    category: 'lifestyle',
    shortDescription: 'City driving professional style',
    previewColors: ['#4A4A4A', '#00A86B', '#FFFFFF', '#FFD700'],
    imagePrompt: {
      style: 'Urban professional commuter aesthetic, city life',
      colorPalette: 'Sophisticated gray, transit green, white, gold accents',
      typography: 'Clean modern sans-serif, professional, minimal',
      elements: 'City skylines, metro hints, professional commuters, hybrid vehicles, parking garages',
      mood: 'Professional, efficient, urban, reliable',
    },
    textPrompt: {
      tone: 'Professional, efficient, practical',
      vocabulary: ['convenient', 'reliable', 'quick', 'professional', 'service'],
    },
    mockupScenes: ['parking garage', 'city street', 'office building'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'seo_blog'],
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    category: 'lifestyle',
    shortDescription: 'Adventure-ready recreation style',
    previewColors: ['#FF6600', '#228B22', '#F5F5DC', '#4682B4'],
    imagePrompt: {
      style: 'Weekend adventure and recreation aesthetic',
      colorPalette: 'Adventure orange, nature green, cream, lake blue',
      typography: 'Active outdoors fonts, energetic style',
      elements: 'Bikes, kayaks, camping gear, roof racks, adventure vehicles, outdoor activities',
      mood: 'Active, fun, adventure-ready, enthusiastic',
    },
    textPrompt: {
      tone: 'Enthusiastic, active, adventure-ready',
      vocabulary: ['adventure', 'ready', 'weekend', 'gear', 'go'],
    },
    mockupScenes: ['trailhead', 'campsite', 'adventure vehicle'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'pet-friendly',
    name: 'Pet Friendly',
    category: 'lifestyle',
    shortDescription: 'Four-legged friend approved',
    previewColors: ['#DEB887', '#87CEEB', '#90EE90', '#F5F5DC'],
    imagePrompt: {
      style: 'Pet-friendly family aesthetic, dog and cat lover vibes',
      colorPalette: 'Warm tan, sky blue, grass green, cream',
      typography: 'Friendly rounded fonts, approachable style',
      elements: 'Paw prints, happy dogs, pet silhouettes, family vehicles, dog park vibes',
      mood: 'Friendly, loving, family-oriented, fun',
    },
    textPrompt: {
      tone: 'Friendly, loving, fun',
      vocabulary: ['family', 'friendly', 'clean', 'trusted', 'care'],
    },
    mockupScenes: ['dog park', 'family car', 'pet store'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'check_in_to_win'],
  },
  {
    id: 'soccer-mom',
    name: 'Soccer Mom',
    category: 'lifestyle',
    shortDescription: 'Busy family on-the-go style',
    previewColors: ['#87CEEB', '#90EE90', '#FFD700', '#F5F5DC'],
    imagePrompt: {
      style: 'Busy family on-the-go aesthetic, organized chaos',
      colorPalette: 'Sky blue, grass green, sunshine yellow, warm cream',
      typography: 'Friendly readable fonts, family-oriented style',
      elements: 'Minivans, SUVs, sports equipment, school supplies, family activities',
      mood: 'Busy, caring, organized, family-first',
    },
    textPrompt: {
      tone: 'Caring, practical, family-focused',
      vocabulary: ['family', 'safe', 'reliable', 'quick', 'trusted'],
    },
    mockupScenes: ['school pickup', 'soccer field', 'family driveway'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
];

// ============================================================================
// PROFESSIONAL & INDUSTRIAL THEMES
// ============================================================================

export const professionalThemes: ThemeDefinition[] = [
  {
    id: 'fleet-services',
    name: 'Fleet Services',
    category: 'professional',
    shortDescription: 'Commercial fleet professional',
    previewColors: ['#1E3A5F', '#FF6600', '#F5F5DC', '#4A4A4A'],
    imagePrompt: {
      style: 'Commercial fleet services professional aesthetic',
      colorPalette: 'Professional navy, safety orange, cream, professional gray',
      typography: 'Bold professional fonts, clear business style',
      elements: 'Commercial vehicles, fleet graphics, maintenance checklists, professional badges',
      mood: 'Professional, reliable, business-focused, efficient',
    },
    textPrompt: {
      tone: 'Professional, reliable, business-focused',
      vocabulary: ['fleet', 'commercial', 'service', 'maintenance', 'professional'],
    },
    mockupScenes: ['fleet yard', 'commercial garage', 'business office'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'seo_blog'],
  },
  {
    id: 'certified-expert',
    name: 'Certified Expert',
    category: 'professional',
    shortDescription: 'ASE and manufacturer certified',
    previewColors: ['#1E3A5F', '#FFD700', '#FFFFFF', '#00A86B'],
    imagePrompt: {
      style: 'Certified professional expertise aesthetic',
      colorPalette: 'Trust navy, certification gold, clean white, success green',
      typography: 'Clean professional fonts, certificate styling',
      elements: 'Certification badges, ASE logos style, trust seals, diploma frames, quality checks',
      mood: 'Trustworthy, expert, certified, professional',
    },
    textPrompt: {
      tone: 'Expert, trustworthy, professional',
      vocabulary: ['certified', 'expert', 'trained', 'professional', 'guaranteed'],
    },
    mockupScenes: ['certificate wall', 'professional shop', 'service counter'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card', 'review_reply'],
  },
  {
    id: 'dealer-quality',
    name: 'Dealer Quality',
    category: 'professional',
    shortDescription: 'Dealership-level service',
    previewColors: ['#1C1C1C', '#C0C0C0', '#FFFFFF', '#8B0000'],
    imagePrompt: {
      style: 'Dealership-quality professional service aesthetic',
      colorPalette: 'Professional black, silver, white, accent red',
      typography: 'Premium clean fonts, dealership styling',
      elements: 'Showroom quality, OEM parts hints, professional waiting areas, dealer badges',
      mood: 'Premium, professional, dealer-quality, trustworthy',
    },
    textPrompt: {
      tone: 'Premium, professional, dealer-level',
      vocabulary: ['dealer', 'OEM', 'quality', 'factory', 'certified'],
    },
    mockupScenes: ['service waiting area', 'professional bay', 'customer lounge'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
];

// ============================================================================
// SEASONAL THEMES
// ============================================================================

export const seasonalThemes: ThemeDefinition[] = [
  {
    id: 'summer-road-trip',
    name: 'Summer Road Trip',
    category: 'seasonal',
    shortDescription: 'Vacation ready summer style',
    previewColors: ['#FFD700', '#00CED1', '#FF6347', '#87CEEB'],
    imagePrompt: {
      style: 'Summer road trip vacation aesthetic',
      colorPalette: 'Sunshine yellow, ocean teal, sunset coral, sky blue',
      typography: 'Fun vacation fonts, travel poster style',
      elements: 'Road maps, luggage, sunglasses, beach destinations, convertibles',
      mood: 'Fun, adventurous, vacation-ready, exciting',
    },
    textPrompt: {
      tone: 'Fun, exciting, vacation-ready',
      vocabulary: ['summer', 'road trip', 'vacation', 'ready', 'adventure'],
    },
    mockupScenes: ['beach parking', 'highway overlook', 'vacation spot'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'winter-ready',
    name: 'Winter Ready',
    category: 'seasonal',
    shortDescription: 'Cold weather prepared style',
    previewColors: ['#4682B4', '#F0F8FF', '#FF4500', '#1C1C1C'],
    imagePrompt: {
      style: 'Winter weather preparedness aesthetic',
      colorPalette: 'Ice blue, snow white, warming orange, tire black',
      typography: 'Bold clear fonts, winter weather alerts style',
      elements: 'Snowflakes, winter tires, ice scrapers, cozy warmth, heated garage',
      mood: 'Prepared, safe, warming, protective',
    },
    textPrompt: {
      tone: 'Protective, prepared, caring',
      vocabulary: ['winter', 'prepared', 'safe', 'ready', 'protect'],
    },
    mockupScenes: ['snowy parking lot', 'warm garage', 'winter road'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'fall-maintenance',
    name: 'Fall Maintenance',
    category: 'seasonal',
    shortDescription: 'Autumn preparation style',
    previewColors: ['#D2691E', '#FFD700', '#8B4513', '#800000'],
    imagePrompt: {
      style: 'Fall automotive maintenance aesthetic',
      colorPalette: 'Autumn orange, golden yellow, wood brown, deep red',
      typography: 'Warm seasonal fonts, harvest festival style',
      elements: 'Falling leaves, pumpkins, harvest colors, maintenance checklist, cozy vibes',
      mood: 'Warm, prepared, seasonal, comforting',
    },
    textPrompt: {
      tone: 'Warm, prepared, seasonal',
      vocabulary: ['fall', 'prepare', 'season', 'ready', 'maintenance'],
    },
    mockupScenes: ['autumn street', 'harvest festival', 'fall foliage'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'spring-clean',
    name: 'Spring Clean',
    category: 'seasonal',
    shortDescription: 'Fresh spring renewal style',
    previewColors: ['#90EE90', '#FFB6C1', '#87CEEB', '#F5F5DC'],
    imagePrompt: {
      style: 'Spring cleaning and renewal aesthetic',
      colorPalette: 'Fresh green, cherry blossom pink, clear sky blue, clean cream',
      typography: 'Light fresh fonts, springtime style',
      elements: 'Flowers blooming, fresh starts, cleaning bubbles, renewal symbols, bright sunshine',
      mood: 'Fresh, renewed, optimistic, clean',
    },
    textPrompt: {
      tone: 'Fresh, optimistic, renewed',
      vocabulary: ['spring', 'fresh', 'clean', 'renew', 'ready'],
    },
    mockupScenes: ['spring garden', 'fresh washed car', 'blooming trees'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// SPECIALTY THEMES
// ============================================================================

export const specialtyThemes: ThemeDefinition[] = [
  {
    id: 'diesel-power',
    name: 'Diesel Power',
    category: 'specialty',
    shortDescription: 'Heavy duty diesel specialist',
    previewColors: ['#2F4F4F', '#FF6600', '#C0C0C0', '#1C1C1C'],
    imagePrompt: {
      style: 'Diesel truck and heavy equipment aesthetic',
      colorPalette: 'Smoke stack gray, diesel orange, chrome silver, deep black',
      typography: 'Heavy industrial fonts, powerful bold style',
      elements: 'Smoke stacks, diesel engines, heavy trucks, power gauges, turbo graphics',
      mood: 'Powerful, heavy-duty, specialist, capable',
    },
    textPrompt: {
      tone: 'Powerful, specialist, heavy-duty',
      vocabulary: ['diesel', 'power', 'heavy-duty', 'turbo', 'torque'],
    },
    mockupScenes: ['truck stop', 'diesel shop', 'fleet yard'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'classic-restoration',
    name: 'Classic Restoration',
    category: 'specialty',
    shortDescription: 'Vintage car restoration expert',
    previewColors: ['#8B4513', '#FFD700', '#F5F5DC', '#800000'],
    imagePrompt: {
      style: 'Classic car restoration workshop aesthetic',
      colorPalette: 'Leather brown, restoration gold, aged cream, barn find red',
      typography: 'Vintage workshop fonts, restoration catalog style',
      elements: 'Classic car parts, restoration tools, before/after hints, vintage manuals',
      mood: 'Craftsmanship, heritage, passion, expertise',
    },
    textPrompt: {
      tone: 'Passionate, expert, heritage-focused',
      vocabulary: ['restore', 'classic', 'original', 'craftsmanship', 'heritage'],
    },
    mockupScenes: ['restoration shop', 'classic car show', 'vintage garage'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'motorcycle-shop',
    name: 'Motorcycle Shop',
    category: 'specialty',
    shortDescription: 'Two-wheel specialist style',
    previewColors: ['#1C1C1C', '#FF6600', '#C0C0C0', '#8B0000'],
    imagePrompt: {
      style: 'Motorcycle and biker culture aesthetic',
      colorPalette: 'Leather black, Harley orange, chrome silver, blood red',
      typography: 'Biker culture fonts, chrome and leather style',
      elements: 'Motorcycle silhouettes, skull accents, leather textures, chrome pipes, highway vibes',
      mood: 'Free, rebellious, passionate, brotherhood',
    },
    textPrompt: {
      tone: 'Free-spirited, passionate, brotherhood',
      vocabulary: ['ride', 'freedom', 'chrome', 'road', 'custom'],
    },
    mockupScenes: ['motorcycle shop', 'biker bar', 'open road'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'rv-camper',
    name: 'RV & Camper',
    category: 'specialty',
    shortDescription: 'Recreational vehicle specialist',
    previewColors: ['#228B22', '#F5F5DC', '#87CEEB', '#8B4513'],
    imagePrompt: {
      style: 'RV and camping lifestyle aesthetic',
      colorPalette: 'Nature green, cream, sky blue, wood brown',
      typography: 'Outdoor adventure fonts, campground style',
      elements: 'RV silhouettes, campfire graphics, national park vibes, outdoor living',
      mood: 'Adventurous, relaxed, nature-loving, free',
    },
    textPrompt: {
      tone: 'Adventurous, relaxed, friendly',
      vocabulary: ['adventure', 'camping', 'explore', 'freedom', 'travel'],
    },
    mockupScenes: ['campground', 'RV park', 'scenic overlook'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'seo_blog'],
  },
];

// Export all additional themes
export const ADDITIONAL_THEMES: ThemeDefinition[] = [
  ...vintageThemes,
  ...modernThemes,
  ...premiumThemes,
  ...automotiveThemes,
  ...regionalThemes,
  ...lifestyleThemes,
  ...professionalThemes,
  ...seasonalThemes,
  ...specialtyThemes,
];

export default ADDITIONAL_THEMES;
