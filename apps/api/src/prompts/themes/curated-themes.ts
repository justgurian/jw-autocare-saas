/**
 * Curated Themes — 22 carefully crafted themes across 10 style families.
 *
 * Each theme has a research-backed prompt designed to produce distinctive,
 * agency-quality results from Gemini image generation.
 *
 * PROMPT RULES (learned from failures):
 * 1. NEVER use the word "flyer" or "marketing" in the prompt body
 * 2. NEVER describe what the image IS — describe what it LOOKS LIKE
 * 3. Be hyper-specific about visual details (camera, lighting, texture)
 * 4. Keep each field under 150 words — Gemini follows focused prompts better
 * 5. Specify "render the text" not "include text that says"
 */

import type { ThemeDefinition } from './index';

// ============================================================================
// FAMILY 1: Classic Americana 🚗
// ============================================================================

const FIFTIES_SERVICE_STATION: ThemeDefinition = {
  id: '50s-service-station',
  name: '1950s Service Station',
  category: 'Classic Americana',
  shortDescription: 'Flat illustration, hand-lettered signs, chrome era nostalgia',
  previewColors: ['#C41E3A', '#F5F5DC', '#008080', '#C0C0C0'],
  imagePrompt: {
    style: 'Flat vintage illustration in mid-century commercial art style. A chrome-finned car parked at a red service station with a spinning globe pump topper. Checkered tile floor, hand-painted "FULL SERVICE" signage, a uniformed attendant silhouette. Warm afternoon light, slight paper grain texture. Think Norman Rockwell meets a 1950s Saturday Evening Post advertisement.',
    colorPalette: 'Cherry Red #C41E3A, Cream #F5F5DC, Teal #008080, Chrome Silver #C0C0C0, Sky Blue #87CEEB. Warm sepia undertones throughout.',
    typography: 'Bold vintage slab-serif lettering like hand-painted gas station signs. All-caps headlines with slight imperfections suggesting hand work. Script accents for secondary text. Think Clarendon or Rockwell Bold.',
    elements: 'Chrome car fins, spinning globe gas pump, checkered floor, neon OPEN sign, Route 66 shield, chrome pinstriping borders, oil can graphics, vintage price sign.',
    mood: 'Nostalgic, trustworthy, classic American warmth',
  },
  textPrompt: {
    tone: 'Friendly, neighborly, all-American. Like your trusted local mechanic since 1955.',
    vocabulary: ['full-service', 'trusted', 'family-owned', 'classic care', 'since day one'],
  },
  mockupScenes: ['vintage-poster', 'postcard'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const SIXTIES_MUSCLE: ThemeDefinition = {
  id: '60s-muscle-thunder',
  name: '1960s Muscle Car',
  category: 'Classic Americana',
  shortDescription: 'Roaring muscle cars, drag strips, bold racing energy',
  previewColors: ['#FF6600', '#191970', '#C0C0C0', '#FFD700'],
  imagePrompt: {
    style: 'Bold 1960s muscle car era. A powerful American muscle car (Chevelle SS, GTO, or Mustang silhouette) with aggressive stance, wide tires, and racing stripes on a drag strip. Exhaust haze, rubber marks on asphalt. The composition channels 1960s Hot Rod magazine covers — dramatic low angle, the car fills the frame. Saturated color photography with slight film grain.',
    colorPalette: 'Hugger Orange #FF6600, Midnight Blue #191970, Chrome Silver #C0C0C0, Gold #FFD700, Asphalt Black #1A1A1A.',
    typography: 'Ultra-bold condensed sans-serif, slightly italic — screaming power. Think Eurostile Extended Bold or Impact. Large point size. Text has drop shadows or metallic chrome effect.',
    elements: 'Racing stripes, exhaust smoke, drag strip lane markers, tachometer graphics, checkered flag accents, chrome bumper reflections, "SS" or "GTO" badge styling.',
    mood: 'Powerful, aggressive, American muscle',
  },
  textPrompt: {
    tone: 'Bold, confident, performance-obsessed. Muscle car energy.',
    vocabulary: ['power', 'performance', 'muscle', 'thunder', 'unleash'],
  },
  mockupScenes: ['poster', 'magazine-ad'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const SEVENTIES_CUSTOM: ThemeDefinition = {
  id: '70s-custom-van',
  name: '1970s Custom Culture',
  category: 'Classic Americana',
  shortDescription: 'Airbrushed fantasy, psychedelic sunsets, custom van vibes',
  previewColors: ['#CC5500', '#4B0082', '#FFD700', '#FF6347'],
  imagePrompt: {
    style: 'Airbrushed 1970s custom van/hot rod art. Fantasy landscape with a psychedelic sunset gradient (orange to purple to magenta). A custom-painted hot rod or van with detailed airbrush murals on the body. Wizard-riding-an-eagle energy. Smooth color gradients, soft-edge airbrush technique. The entire image looks like it was painted on the side of a 1975 Chevy van by a master airbrusher.',
    colorPalette: 'Burnt Orange #CC5500, Deep Purple #4B0082, Gold #FFD700, Sunset Pink #FF6347, Midnight Blue #191970.',
    typography: 'Flowing psychedelic lettering with rounded forms and gradient fills. Bubble letters or Roger Dean-inspired typography. The text looks like it was airbrushed onto the image.',
    elements: 'Airbrush gradients, custom flame paint jobs, chopper handlebars, wizard imagery, eagle wings, sunset landscapes, chrome details, shag carpet textures.',
    mood: 'Groovy, free-spirited, custom culture',
  },
  textPrompt: {
    tone: 'Laid-back, creative, custom-work focused.',
    vocabulary: ['custom', 'crafted', 'one-of-a-kind', 'ride', 'cruisin'],
  },
  mockupScenes: ['poster', 'van-panel'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// ============================================================================
// FAMILY 2: Synthwave & Neon 🌆
// ============================================================================

const EIGHTIES_SYNTHWAVE: ThemeDefinition = {
  id: '80s-synthwave',
  name: 'Outrun Synthwave',
  category: 'Synthwave & Neon',
  shortDescription: 'Neon grid horizon, chrome car, retro-future sunset',
  previewColors: ['#FF1493', '#00FFFF', '#7B2FBE', '#0A0A2A'],
  imagePrompt: {
    style: 'Outrun/synthwave aesthetic. A chrome sports car (Testarossa or DeLorean silhouette) drives toward a neon sunset on an infinite perspective grid. Palm tree silhouettes on both sides. The sky is a gradient from hot pink to deep purple to dark blue. Neon grid lines glow on the ground plane, converging at the horizon. Scan lines and VHS-style artifacts subtly overlay everything. This is the definitive 1980s retrowave image.',
    colorPalette: 'Hot Pink #FF1493, Cyan #00FFFF, Purple #7B2FBE, Dark Navy #0A0A2A, Chrome Silver.',
    typography: 'Chrome or neon text with a horizontal glow line through the middle. Retro-futuristic typeface like Blade Runner or Tron. Text casts a colored glow onto surrounding surfaces.',
    elements: 'Neon grid horizon, palm tree silhouettes, chrome car, sun disk with horizontal lines through it, scan lines, VHS tracking artifacts, laser beam accents.',
    mood: 'Retro-futuristic, electric, cool',
  },
  textPrompt: {
    tone: 'Cool, retro-futuristic, effortlessly stylish.',
    vocabulary: ['ride', 'drive', 'neon', 'after dark', 'cruise'],
  },
  mockupScenes: ['neon-sign', 'poster'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const MIAMI_VICE_NEON: ThemeDefinition = {
  id: 'miami-vice-neon',
  name: 'Miami Vice',
  category: 'Synthwave & Neon',
  shortDescription: 'Wet city streets, neon signs, rain reflections',
  previewColors: ['#39FF14', '#FF1493', '#0066FF', '#1A0A2E'],
  imagePrompt: {
    style: 'Neon-noir urban night scene. A wet city street reflects colorful neon signs — an auto shop storefront glows with neon tubing in hot pink, electric blue, and green. Rain puddles mirror the light. Purple atmospheric haze. The car parked out front catches neon reflections on its wet paint. The vibe is Miami Vice meets Blade Runner — glamorous, dangerous, electric.',
    colorPalette: 'Neon Green #39FF14, Hot Pink #FF1493, Electric Blue #0066FF, Deep Purple-Black #1A0A2E, Wet Asphalt reflections.',
    typography: 'Neon sign-style text that appears to glow with a colored halo. Buzzing neon tube effect. Sans-serif, slightly condensed. The text IS a neon sign mounted on a dark wall.',
    elements: 'Neon tube signage, wet street reflections, rain, purple haze atmosphere, palm trees, sports car, fluorescent light spill from shop interior.',
    mood: 'Electric, nocturnal, glamorous',
  },
  textPrompt: {
    tone: 'Slick, nocturnal, Miami cool.',
    vocabulary: ['night', 'open late', 'drive in', 'neon', 'city'],
  },
  mockupScenes: ['neon-sign', 'storefront'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// ============================================================================
// FAMILY 3: Import & Tuner 🏎
// ============================================================================

const JDM_TUNER: ThemeDefinition = {
  id: '90s-jdm-tuner',
  name: 'JDM Street',
  category: 'Import & Tuner',
  shortDescription: 'Modified imports, city night, underglow, Initial D energy',
  previewColors: ['#0066FF', '#FF4500', '#1A1A1A', '#00FF00'],
  imagePrompt: {
    style: '1990s-2000s JDM tuner culture. A modified Japanese import (Supra, Skyline GTR, or Civic silhouette) in a city parking garage or street scene at night. Underglow neon reflects off wet pavement. Carbon fiber body kit visible. The scene channels Initial D and early Fast & Furious — illegal street racing energy. High-contrast night photography with artificial lighting.',
    colorPalette: 'Electric Blue #0066FF, Flame Orange #FF4500, Carbon Black #1A1A1A, Underglow Green #00FF00, Headlight White.',
    typography: 'Angular, condensed, Japanese-influenced sans-serif. May include Japanese katakana characters as decorative elements alongside English text. Bold and aggressive letterforms.',
    elements: 'Carbon fiber texture, underglow neon, turbo wastegate, hood scoop, spoiler wing, Japanese text accents, speedometer graphics, city light bokeh.',
    mood: 'Underground, adrenaline, street credibility',
  },
  textPrompt: {
    tone: 'Street-smart, import culture, tuner lifestyle.',
    vocabulary: ['boost', 'turbo', 'tuned', 'built not bought', 'street'],
  },
  mockupScenes: ['garage-wall', 'poster'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const DRIFT_KING: ThemeDefinition = {
  id: 'drift-king',
  name: 'Drift Culture',
  category: 'Import & Tuner',
  shortDescription: 'Tire smoke, sideways action, frozen drift moment',
  previewColors: ['#FF0000', '#FFFFFF', '#000000', '#FFD700'],
  imagePrompt: {
    style: 'Action-frozen drift photography. A car caught mid-drift at full opposite lock — rear tires smoking, massive tire smoke clouds billowing. The car is tack-sharp while the background has slight motion blur suggesting speed. The camera is low, trackside perspective. High-contrast, saturated color. Japanese motorsport energy — think Formula D or Tsukuba Circuit.',
    colorPalette: 'Racing Red #FF0000, White #FFFFFF, Black #000000, Gold #FFD700, Smoke Gray.',
    typography: 'Ultra-bold condensed italic sans-serif screaming speed and aggression. Tilted at a slight angle matching the drift angle. Japanese flag or rising sun motif possible as background element.',
    elements: 'Tire smoke clouds, skid marks, opposite-lock steering, racing numbers, speed lines, Japanese flag accents, catch fence blur.',
    mood: 'Adrenaline, precision, controlled chaos',
  },
  textPrompt: {
    tone: 'Aggressive, precise, motorsport-focused.',
    vocabulary: ['slide', 'grip', 'precision', 'angle', 'full send'],
  },
  mockupScenes: ['poster', 'banner'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// ============================================================================
// FAMILY 4: Comic & Pop Art 💥
// ============================================================================

const COMIC_ACTION: ThemeDefinition = {
  id: 'comic-action',
  name: 'Comic Book',
  category: 'Comic & Pop Art',
  shortDescription: 'Halftone dots, POW bubbles, 3-panel action strip',
  previewColors: ['#FF0000', '#0066FF', '#FFD700', '#000000'],
  imagePrompt: {
    style: 'Classic American comic book art. Bold black outlines, Ben-Day halftone dot patterns, flat color fills. A 3-panel action strip showing: Panel 1 — a car arriving with a problem (steam, flat tire), Panel 2 — a heroic mechanic fixing it (action lines, "POW!" burst), Panel 3 — the car leaving gleaming and fixed. Speech bubbles, action burst effects (ZAP! ZOOM! FIXED!). The art style references Jack Kirby and classic Marvel/DC comic books.',
    colorPalette: 'Primary Red #FF0000, Blue #0066FF, Yellow #FFD700, Black #000000, White #FFFFFF. Printed on newsprint-colored background.',
    typography: 'Comic book lettering — bold, hand-drawn-looking all-caps in speech bubbles and action bursts. Think classic comic book title fonts with dramatic perspective.',
    elements: 'Halftone dot patterns, speech bubbles, action burst stars, speed lines, panel borders, dramatic shadows, newsprint texture.',
    mood: 'Heroic, energetic, fun',
  },
  textPrompt: {
    tone: 'Heroic, action-packed, fun and bold.',
    vocabulary: ['pow', 'zoom', 'hero', 'rescue', 'action'],
  },
  mockupScenes: ['comic-panel', 'poster'],
  compatibleTools: ['promo_flyer', 'social_post', 'meme_generator'],
};

const POP_ART_GARAGE: ThemeDefinition = {
  id: 'pop-art-garage',
  name: 'Pop Art',
  category: 'Comic & Pop Art',
  shortDescription: 'Warhol-style quadrants, bold flat colors, screen-print look',
  previewColors: ['#00BCD4', '#E91E63', '#FFEB3B', '#8BC34A'],
  imagePrompt: {
    style: 'Andy Warhol-inspired pop art. A single car image repeated in 4 quadrants (2x2 grid), each rendered in a different bold color scheme. Flat, screen-print look with no gradients — pure areas of solid color. High contrast, simplified shapes. The overall effect is a Warhol silkscreen print of a car. Thick black outlines separate color areas.',
    colorPalette: 'Cyan #00BCD4, Magenta #E91E63, Yellow #FFEB3B, Lime Green #8BC34A. Each quadrant uses a different dominant color.',
    typography: 'Bold sans-serif, screen-print style. Text appears as if silk-screened with slight misregistration (colors offset by 1-2 pixels). Clean, modern, Helvetica-influenced.',
    elements: 'Repeated image grid, solid color fills, screen-print texture, Warhol-style color shifts, black outlines, pop culture iconography.',
    mood: 'Bold, artistic, gallery-worthy',
  },
  textPrompt: {
    tone: 'Artsy, bold, pop-culture savvy.',
    vocabulary: ['iconic', 'bold', 'style', 'pop', 'original'],
  },
  mockupScenes: ['gallery-print', 'poster'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// ============================================================================
// FAMILY 5: Cinematic 🎬
// ============================================================================

const MOVIE_POSTER: ThemeDefinition = {
  id: 'movie-poster',
  name: 'Blockbuster Poster',
  category: 'Cinematic',
  shortDescription: 'Dramatic lighting, hero car, cinematic title treatment',
  previewColors: ['#0A1628', '#C5A55A', '#B8B8B8', '#FF4444'],
  imagePrompt: {
    style: 'Hollywood blockbuster movie poster composition. A hero car dramatically lit from below with warm amber light, creating long shadows. Lens flares streak across the frame. The car sits against a dark, moody cityscape or desert highway backdrop. Cinematic title treatment at top — large, metallic, with the text casting shadows. A tagline in smaller text below. The overall composition mimics a Fast & Furious or John Wick movie poster.',
    colorPalette: 'Deep Blue-Black #0A1628, Gold #C5A55A, Silver #B8B8B8, Accent Red #FF4444.',
    typography: 'Cinematic title font — large, metallic (chrome or gold), with bevel/emboss. Title spans the full width. Tagline in thin elegant sans-serif below. Credits block at very bottom in tiny compressed type.',
    elements: 'Lens flares, dramatic uplighting, silhouetted cityscape, metallic text treatment, film grain, anamorphic lens bokeh, credits block.',
    mood: 'Epic, dramatic, blockbuster',
  },
  textPrompt: {
    tone: 'Dramatic, epic, cinematic one-liners.',
    vocabulary: ['coming soon', 'the ultimate', 'experience', 'premiere', 'epic'],
  },
  mockupScenes: ['movie-poster', 'billboard'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const NOIR_DETECTIVE: ThemeDefinition = {
  id: 'noir-detective',
  name: 'Film Noir',
  category: 'Cinematic',
  shortDescription: 'Black & white, red accent, dramatic shadows, wet streets',
  previewColors: ['#000000', '#FFFFFF', '#CC0000', '#444444'],
  imagePrompt: {
    style: 'Classic film noir aesthetic. Predominantly black and white with a single color accent (red — used only for brake lights, a neon sign, or a single design element). Wet streets reflecting streetlights. Dramatic shadows cast by venetian blinds or fire escape ladders. A dark car parked under a single streetlamp pool of light. Fog or mist rolls at ground level. A silhouetted figure in a fedora and trench coat stands nearby. The mood is 1940s detective thriller.',
    colorPalette: 'Black #000000, White #FFFFFF, Accent Red #CC0000, Dark Gray #444444. Everything is black and white EXCEPT the single red accent.',
    typography: 'Art deco serif or classic noir title font. Think Casablanca or The Maltese Falcon title cards. Elegant, slightly condensed, with long shadows.',
    elements: 'Venetian blind shadows, wet street reflections, streetlamp pool of light, fog/mist, fedora silhouette, film grain, spotlight beams.',
    mood: 'Mysterious, dramatic, sophisticated',
  },
  textPrompt: {
    tone: 'Mysterious, noir narrative voice.',
    vocabulary: ['dark', 'case', 'detective', 'shadows', 'midnight'],
  },
  mockupScenes: ['movie-poster', 'noir-scene'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// ============================================================================
// FAMILY 6: Retro Poster Art 🎨
// ============================================================================

const WPA_TRAVEL_POSTER: ThemeDefinition = {
  id: 'wpa-travel-poster',
  name: 'Travel Poster',
  category: 'Retro Poster Art',
  shortDescription: 'WPA national parks style, flat color, woodcut feel',
  previewColors: ['#4A90D9', '#A0522D', '#2D572C', '#1B1B3A'],
  imagePrompt: {
    style: '1930s-40s WPA Works Progress Administration national parks poster style. Flat areas of solid color with no gradients — separated by clean edges like a woodcut or screen print. Long shadows suggest golden-hour lighting. An auto repair shop building rendered as a charming landmark, with a vintage car parked in front and scenic hills in the background. A decorative Art Deco border frames the composition. The style directly references the iconic national parks posters.',
    colorPalette: 'Sky Blue #4A90D9, Burnt Sienna #A0522D, Forest Green #2D572C, Navy #1B1B3A, Cream #FAF0E6.',
    typography: 'Art Deco display fonts — Futura, Neutraface, or Gill Sans Bold. All caps with generous letter-spacing. Thin decorative lines separate text elements. The text feels architectural.',
    elements: 'Flat color blocks, WPA-style simplified landscape, Art Deco border frame, long dramatic shadows, stylized clouds, decorative line separators.',
    mood: 'Charming, timeless, community-rooted',
  },
  textPrompt: {
    tone: 'Inviting, community-focused, timeless.',
    vocabulary: ['visit', 'neighborhood', 'trusted', 'community', 'since'],
  },
  mockupScenes: ['vintage-poster', 'framed-print'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const PINUP_NOSE_ART: ThemeDefinition = {
  id: 'pinup-nose-art',
  name: 'Pin-Up Garage',
  category: 'Retro Poster Art',
  shortDescription: 'WWII nose art, Rosie the Riveter, emblem badge design',
  previewColors: ['#CC0000', '#001F3F', '#FFD700', '#F5F5DC'],
  imagePrompt: {
    style: 'WWII bomber nose art meets Rosie the Riveter. A stylized empowered figure (NOT sexualized — strong, confident) in mechanic coveralls, red bandana, and victory-roll hairstyle, holding a large wrench. The figure is rendered in traditional American tattoo art / Gil Elvgren illustration style — bold outlines, soft shading, warm tones. Composed as a circular emblem or shield badge with ribbon banners curving around for text. Stars and wrench icons as decorative elements. The whole design works as a badge/patch/sticker.',
    colorPalette: 'Pin-Up Red #CC0000, Navy Blue #001F3F, Gold #FFD700, Cream/Parchment #F5F5DC, Olive Drab #556B2F.',
    typography: 'Tattoo-parlor combination: flowing script for the shop name (on ribbon banner), heavy slab serif for supporting text (Rockwell, Clarendon). The typography is decorative and integral to the badge design.',
    elements: 'Circular badge/emblem frame, ribbon banners, stars, crossed wrenches, gear icons, tattoo-style illustration, checkerboard edge pattern.',
    mood: 'Badass, patriotic, old-school toughness',
  },
  textPrompt: {
    tone: 'Tough, patriotic, skilled craftsperson energy.',
    vocabulary: ['crew', 'tough', 'no job too big', 'built to last', 'grit'],
  },
  mockupScenes: ['emblem', 'patch', 'poster'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// ============================================================================
// FAMILY 7: Urban & Street 🎨
// ============================================================================

const GRAFFITI_GARAGE: ThemeDefinition = {
  id: 'graffiti-garage',
  name: 'Graffiti',
  category: 'Urban & Street',
  shortDescription: 'Spray-paint murals, drips, bold wildstyle lettering',
  previewColors: ['#FF3333', '#00FF00', '#000000', '#FFFFFF'],
  imagePrompt: {
    style: 'Urban graffiti street art. A brick wall mural of a car rendered in bold spray-paint style — drips running down, stencil elements, overlapping tags. The shop name is in wildstyle graffiti lettering (complex, interlocking, 3D). Paint splatter and overspray texture everywhere. The wall has layers of older graffiti underneath, partially covered. A concrete sidewalk at the bottom grounds the scene. The art style references Banksy, KAWS, and classic NYC subway graffiti.',
    colorPalette: 'Spray Can Red #FF3333, Electric Green #00FF00, Black #000000, White #FFFFFF, Brick Brown #8B4513.',
    typography: 'Wildstyle graffiti lettering for the headline — complex, 3D, interlocking letters with arrows and connections. Supporting text in clean stencil-cut letters. Paint drips on letter edges.',
    elements: 'Spray paint drips, stencil cuts, brick wall texture, paint splatter, overlapping tags, throw-up lettering, concrete sidewalk, wheat-paste poster corners.',
    mood: 'Urban, rebellious, creative',
  },
  textPrompt: {
    tone: 'Street-smart, creative, urban edge.',
    vocabulary: ['street', 'fresh', 'original', 'represent', 'real'],
  },
  mockupScenes: ['street-wall', 'urban-poster'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const LOWRIDER_CULTURE: ThemeDefinition = {
  id: 'lowrider-culture',
  name: 'Lowrider Art',
  category: 'Urban & Street',
  shortDescription: 'Candy paint Impala, golden hour boulevard, Chicano airbrush',
  previewColors: ['#9B111E', '#C0C0C0', '#CFB53B', '#4B0082'],
  imagePrompt: {
    style: 'Lowrider culture Chicano art. A candy-painted lowrider (1964 Impala silhouette is iconic) at three-wheel-motion — hydraulics lifting one corner. Golden hour boulevard scene, palm trees, mural wall in background. The art style is hyper-detailed airbrush work with soft gradients, realistic chrome Dayton wire wheels catching the light. The paint job shows deep candy apple red or emerald green with visible pinstriping. The sky is a perfect sunset gradient from peach to lavender to deep blue.',
    colorPalette: 'Candy Apple Red #9B111E, Chrome Silver #C0C0C0, Gold Leaf #CFB53B, Deep Purple #4B0082, Sunset gradient (Peach to Lavender to Deep Blue).',
    typography: 'Old English / Blackletter for the shop name (Canterbury, Cloister Black). Supporting text in clean block sans-serif. Gold or chrome text effects with slight 3D depth.',
    elements: 'Candy paint reflections, Dayton wire wheels, hydraulic lift, pinstriping details, boulevard scene, palm trees, mural wall, low camera angle.',
    mood: 'Proud, artistic, community culture',
  },
  textPrompt: {
    tone: 'Proud, community-rooted, custom work culture.',
    vocabulary: ['custom', 'show quality', 'boulevard', 'clean', 'pride'],
  },
  mockupScenes: ['poster', 'magazine-spread'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// ============================================================================
// FAMILY 8: Clean & Modern ⚡
// ============================================================================

const MODERN_MINIMAL: ThemeDefinition = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  category: 'Clean & Modern',
  shortDescription: 'Clean background, geometric shapes, Apple-inspired',
  previewColors: ['#FFFFFF', '#1A1A1A', '#FF4444', '#F0F0F0'],
  imagePrompt: {
    style: 'Ultra-clean modern minimalist design. White or light gray background with massive negative space. A single bold color accent (red) used sparingly for key elements. Geometric shapes — circles, lines, rectangles — create structure without clutter. The design breathes. If a car appears, it is a clean silhouette or rendered in simple flat style. The aesthetic references Apple product pages, Swiss graphic design, and modern luxury branding.',
    colorPalette: 'White #FFFFFF, Black #1A1A1A, Accent Red #FF4444, Light Gray #F0F0F0.',
    typography: 'Clean, modern sans-serif — Inter, Helvetica Neue, or SF Pro Display. Light to medium weight for body text, bold for headline. Generous letter-spacing. The typography is elegant and restrained.',
    elements: 'Geometric shapes, thin divider lines, massive negative space, single accent color, clean grid alignment, subtle shadow for depth.',
    mood: 'Clean, confident, premium',
  },
  textPrompt: {
    tone: 'Clean, professional, confident without being loud.',
    vocabulary: ['simple', 'clean', 'premium', 'effortless', 'quality'],
  },
  mockupScenes: ['social-card', 'web-banner'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const LUXURY_EDITORIAL: ThemeDefinition = {
  id: 'luxury-editorial',
  name: 'Luxury Editorial',
  category: 'Clean & Modern',
  shortDescription: 'Studio-lit car, polished black floor, magazine elegance',
  previewColors: ['#0D0D0D', '#C5A55A', '#F0F0F0', '#36454F'],
  imagePrompt: {
    style: 'Luxury automotive magazine editorial. A flawless studio photograph of a high-end car on a polished black reflective floor that mirrors the car perfectly. Three-point studio lighting creates a single dramatic highlight along the car body lines. Background is a smooth gradient from charcoal to pure black. Every surface is immaculate. The composition is Robb Report cover quality — the car floats in darkness with perfect reflections below.',
    colorPalette: 'Deep Black #0D0D0D, Gold Accent #C5A55A, Cool White #F0F0F0, Charcoal #36454F.',
    typography: 'Ultra-thin serif — Didot, Bodoni, or Playfair Display Thin. Extreme contrast between thick and thin strokes. Very wide letter-spacing. Lowercase or mixed case. Small text relative to the car — the car dominates.',
    elements: 'Polished reflective floor, studio lighting highlights, gradient-to-black background, minimal text placement, editorial layout, negative space.',
    mood: 'Exclusive, premium, aspirational',
  },
  textPrompt: {
    tone: 'Luxury, understated, exclusive.',
    vocabulary: ['concierge', 'premium', 'appointment', 'distinguished', 'curated'],
  },
  mockupScenes: ['magazine-cover', 'editorial'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const BOLD_TYPOGRAPHY: ThemeDefinition = {
  id: 'bold-typography',
  name: 'Bold Type',
  category: 'Clean & Modern',
  shortDescription: 'Giant text IS the design — no imagery, pure impact',
  previewColors: ['#000000', '#FFD700', '#FFFFFF', '#FF0000'],
  imagePrompt: {
    style: 'Pure typography poster. NO photographs, NO illustrations, NO imagery of any kind. Bold type IS the entire design. The headline word or price number takes up 60-80% of the frame in ultra-bold condensed type. Background is a single solid bold color. Supporting text is tiny in a contrasting corner. The design references Barbara Kruger art, Swiss International style, and Helvetica poster aesthetics. The power comes from extreme scale contrast between enormous headline text and small supporting text.',
    colorPalette: 'Black #000000, Yellow #FFD700, White #FFFFFF. OR: Red #FF0000 + White. High contrast, 2-3 color maximum.',
    typography: 'Ultra-bold condensed sans-serif for the hero text — Oswald, Bebas Neue, Anton, or Impact. One word per line, stacked vertically. Supporting text in thin weight of the same family. Scale ratio: headline 200pt, details 14pt.',
    elements: 'NOTHING but typography and solid color. No icons, no images, no decorative elements. The text arrangement IS the design. Geometric alignment. Aggressive white space.',
    mood: 'Direct, urgent, no-nonsense',
  },
  textPrompt: {
    tone: 'Direct, bold, zero fluff.',
    vocabulary: ['now', 'today', 'save', 'only', 'limited'],
  },
  mockupScenes: ['poster', 'social-card'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// ============================================================================
// FAMILY 9: Workshop & Craft 🔧
// ============================================================================

const HONEST_WORKSHOP: ThemeDefinition = {
  id: 'honest-workshop',
  name: 'Honest Workshop',
  category: 'Workshop & Craft',
  shortDescription: 'Warm shop interior, organized tools, inviting atmosphere',
  previewColors: ['#DAA520', '#003366', '#708090', '#8B4513'],
  imagePrompt: {
    style: 'Warm photorealistic auto shop interior. An inviting workshop with tools organized on a pegboard wall, warm tungsten overhead lighting casting amber tones. A car on a lift in the background, bay doors open to afternoon light. The concrete floor is clean. Equipment is well-maintained. The scene communicates competence, care, and pride in the workspace. The lighting is the key — warm, tungsten-amber, making everything look inviting. The camera angle is at eye level, as if you just walked in.',
    colorPalette: 'Workshop Amber #DAA520, Uniform Blue #003366, Tool Steel #708090, Warm Brown #8B4513, Concrete Gray #A9A9A9.',
    typography: 'Friendly but professional rounded sans-serif — Nunito, Quicksand, or Poppins. Semi-bold headlines, regular body. The text feels approachable and trustworthy.',
    elements: 'Pegboard tool wall, car on lift, open bay doors, tungsten lighting, concrete floor, organized workbenches, shop vac, diagnostic equipment.',
    mood: 'Trustworthy, competent, inviting',
  },
  textPrompt: {
    tone: 'Honest, friendly, down-to-earth professional.',
    vocabulary: ['honest', 'fair', 'trusted', 'family', 'care'],
  },
  mockupScenes: ['shop-scene', 'social-post'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const KNOLLING_FLATLAY: ThemeDefinition = {
  id: 'knolling-flatlay',
  name: 'Tool Flatlay',
  category: 'Workshop & Craft',
  shortDescription: 'Overhead bird\'s-eye, perfectly organized tools, satisfying grid',
  previewColors: ['#B0B0B0', '#2C2C2C', '#FF6600', '#D3D3D3'],
  imagePrompt: {
    style: 'Perfectly organized overhead knolling/flatlay photography. Bird\'s-eye camera angle (90 degrees straight down). Automotive tools and parts arranged in a deeply satisfying geometric grid on a clean brushed steel or concrete surface. Every item is parallel or perpendicular: wrenches graduated by size, spark plugs in a row, fresh brake pads, an oil filter, a torque wrench, blue nitrile gloves. Equal spacing between all items. Even, shadowless overhead lighting. The effect is automotive ASMR — deeply satisfying organization. Think Tom Sachs knolling.',
    colorPalette: 'Chrome Steel #B0B0B0, Black Rubber #2C2C2C, Orange Handles #FF6600, Concrete Gray #D3D3D3, Blue Nitrile #4169E1.',
    typography: 'Clean, technical, monospaced — IBM Plex Mono or Source Code Pro. The organized tools create a grid and the text respects that grid. Small, precise labels.',
    elements: 'Wrenches graduated by size, spark plugs, brake pads, oil filter, torque wrench, nitrile gloves, brushed steel surface, perfect grid alignment, equal spacing.',
    mood: 'Organized, precise, satisfying',
  },
  textPrompt: {
    tone: 'Precise, organized, detail-obsessed.',
    vocabulary: ['complete', 'every detail', 'prepared', 'equipped', 'precision'],
  },
  mockupScenes: ['social-card', 'instagram-square'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// ============================================================================
// FAMILY 10: Racing & Speed 🏁
// ============================================================================

const NASCAR_SPEED: ThemeDefinition = {
  id: 'nascar-speed',
  name: 'Racing Poster',
  category: 'Racing & Speed',
  shortDescription: 'Stock car blasting through, motion blur, checkered flags',
  previewColors: ['#FF0000', '#FFD700', '#0066FF', '#333333'],
  imagePrompt: {
    style: 'High-speed racing poster. A race car or stock car blasts through the frame at full speed — heavy motion blur in the background while the car is tack-sharp (panning shot effect). Tire marks streak across the asphalt. A checkered flag waves at one edge. The composition has strong diagonal energy — the car enters from one corner and exits the opposite, creating dynamic motion. Everything screams velocity. The poster treatment adds dramatic text across the top or diagonal.',
    colorPalette: 'Racing Red #FF0000, Bright Yellow #FFD700, Electric Blue #0066FF, Asphalt Dark Gray #333333, Checkered Black & White.',
    typography: 'Ultra-bold condensed italic sans-serif — screaming speed. Text tilted at a slight angle matching the motion. Often outlined with a thick stroke. Numbers are oversized and integral.',
    elements: 'Motion blur lines, checkered flag, tire marks, speed streaks, diagonal composition, race number graphics, sponsor-style text placement.',
    mood: 'Fast, exciting, high-octane',
  },
  textPrompt: {
    tone: 'Fast, energetic, race-day excitement.',
    vocabulary: ['fast', 'pit stop', 'race', 'speed', 'no wait'],
  },
  mockupScenes: ['poster', 'banner'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const VINTAGE_RALLY: ThemeDefinition = {
  id: 'vintage-rally',
  name: 'Vintage Rally',
  category: 'Racing & Speed',
  shortDescription: 'European rally poster, mountain roads, hand-painted illustration',
  previewColors: ['#004225', '#FAF0E6', '#8B4513', '#4682B4'],
  imagePrompt: {
    style: 'European vintage rally poster. A classic sports car (Porsche 911, Mini Cooper, or Alpine A110 silhouette) navigating a winding mountain road with dust cloud trailing. Spectators line the route behind hay bales. Hand-painted illustration style with visible brush strokes and slightly muted, vintage-print colors. The composition references 1960s-70s Monte Carlo Rally and Le Mans posters. A decorative border frames the scene. Rolling hills and stone walls in the background.',
    colorPalette: 'British Racing Green #004225, Cream #FAF0E6, Rust #8B4513, Steel Blue #4682B4, Dust Brown #D2B48C.',
    typography: 'Bold serif or display font with European sophistication — Bodoni, Didot, or a hand-drawn display face. Mixed weights: heavy for the event name, light for details. Decorative flourishes.',
    elements: 'Mountain road switchbacks, dust clouds, hay bale barriers, spectators, rally number plates, decorative border, stone walls, rolling hills.',
    mood: 'Adventurous, classic, European elegance',
  },
  textPrompt: {
    tone: 'Classic, adventurous, European motorsport heritage.',
    vocabulary: ['rally', 'tour', 'classic', 'precision', 'road'],
  },
  mockupScenes: ['vintage-poster', 'framed-print'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const CURATED_THEMES: ThemeDefinition[] = [
  // Family 1: Classic Americana
  FIFTIES_SERVICE_STATION,
  SIXTIES_MUSCLE,
  SEVENTIES_CUSTOM,
  // Family 2: Synthwave & Neon
  EIGHTIES_SYNTHWAVE,
  MIAMI_VICE_NEON,
  // Family 3: Import & Tuner
  JDM_TUNER,
  DRIFT_KING,
  // Family 4: Comic & Pop Art
  COMIC_ACTION,
  POP_ART_GARAGE,
  // Family 5: Cinematic
  MOVIE_POSTER,
  NOIR_DETECTIVE,
  // Family 6: Retro Poster Art
  WPA_TRAVEL_POSTER,
  PINUP_NOSE_ART,
  // Family 7: Urban & Street
  GRAFFITI_GARAGE,
  LOWRIDER_CULTURE,
  // Family 8: Clean & Modern
  MODERN_MINIMAL,
  LUXURY_EDITORIAL,
  BOLD_TYPOGRAPHY,
  // Family 9: Workshop & Craft
  HONEST_WORKSHOP,
  KNOLLING_FLATLAY,
  // Family 10: Racing & Speed
  NASCAR_SPEED,
  VINTAGE_RALLY,
];

export function getCuratedTheme(id: string): ThemeDefinition | undefined {
  return CURATED_THEMES.find(t => t.id === id);
}
