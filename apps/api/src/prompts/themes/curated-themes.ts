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
// FAMILY 11: Auto Magazine 📰
// ============================================================================

// --- Motor Trend Style (5 themes) ---

const MT_60S_CAR_OF_YEAR: ThemeDefinition = {
  id: 'mt-60s-car-of-year',
  name: 'Motor Trend 1960s',
  category: 'Auto Magazine',
  shortDescription: '1960s award issue — collage layout, gold trophy, dense text',
  previewColors: ['#CC0000', '#FFD700', '#F5F5DC', '#1A1A1A'],
  imagePrompt: {
    style: 'A 1960s automotive award publication cover. Multiple cars shown at different dramatic angles in a stacked collage composition — a sedan at top, a coupe at center, a convertible at bottom. A gold trophy or award emblem anchors one corner. The background is a warm gradient from deep red to gold. The composition is dense and information-rich, like a newsstand publication fighting for attention. Saturated Kodachrome color with slight film grain.',
    colorPalette: 'Deep Red #CC0000, Gold #FFD700, Cream #F5F5DC, Black #1A1A1A. Warm, rich, award-ceremony palette.',
    typography: 'Bold serif masthead at the very top in the largest type. The business name IS the masthead — rendered like a 1960s publication logo in heavy condensed serif. "Car of the Year!" or "SPECIAL ISSUE" in a secondary bold serif. Dense teaser text in small serif along the top edge.',
    elements: 'Gold award trophy or emblem badge, multiple car illustrations at different angles, "SPECIAL ISSUE" burst flag, stacked car layout showing 3 vehicles, dense teaser text along all four edges in small serif type: road test references, tech features, comparison notes. Price tag element in upper corner. Aged paper texture overlay.',
    mood: 'Prestigious, information-dense, newsstand excitement',
  },
  textPrompt: {
    tone: 'Authoritative, award-giving, excited about automotive excellence.',
    vocabulary: ['award', 'top pick', 'best', 'tested', 'review'],
  },
  mockupScenes: ['magazine-cover', 'newsstand'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const MT_70S_ROAD_TEST: ThemeDefinition = {
  id: 'mt-70s-road-test',
  name: 'Motor Trend 1970s',
  category: 'Auto Magazine',
  shortDescription: '1970s road test — earth tones, desert setting, Cooper Black type',
  previewColors: ['#DAA520', '#8B4513', '#F5DEB3', '#4A4A4A'],
  imagePrompt: {
    style: 'A 1970s automotive publication cover. A car parked in a sun-baked desert or rural highway setting. The sky is a hazy warm amber. A person stands next to the car for scale and lifestyle context — rendered in the artistic style of the theme, not photorealistic. The overall feel is warm, slightly faded Kodak film with lifted blacks. Earth tones dominate. The composition is relaxed and editorial, like a lifestyle road trip feature.',
    colorPalette: 'Goldenrod #DAA520, Saddle Brown #8B4513, Wheat #F5DEB3, Warm Gray #4A4A4A, Avocado Green #6B8E23. Warm 1970s earth-tone palette throughout.',
    typography: 'Chunky rounded serif masthead (Cooper Black or Souvenir Bold feel) at the top. The business name rendered as the publication masthead in this chunky warm serif. Headline in a lighter serif below. Year date and price elements. Teaser text in small serif along top edge in warm brown tones.',
    elements: 'Desert or rural highway setting, warm hazy sky, person standing beside car, "Road Test" or "New Cars" callout badges, film grain texture, teaser text along top: model comparisons, driving impressions, engineering notes. Vintage price tag "50¢" element in corner. Muted, warm color grading throughout.',
    mood: 'Warm, laid-back, road-trip editorial',
  },
  textPrompt: {
    tone: 'Relaxed, warm, road-trip storytelling.',
    vocabulary: ['road test', 'drive', 'new model', 'touring', 'cruising'],
  },
  mockupScenes: ['magazine-cover', 'newsstand'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const MT_80S_PERFORMANCE: ThemeDefinition = {
  id: 'mt-80s-performance',
  name: 'Motor Trend 1980s',
  category: 'Auto Magazine',
  shortDescription: '1980s king of the road — bold stats, red/black drama, metallic type',
  previewColors: ['#CC0000', '#C0C0C0', '#1A1A1A', '#FFD700'],
  imagePrompt: {
    style: 'A 1980s-90s performance automotive publication cover. A powerful car photographed at a low dramatic angle against a dark moody background — slightly wet road catching reflections, dark sky. The car is aggressive and dominant, filling 60% of the frame. The lighting is dramatic: single key light from front-left creating sharp highlights along body lines, with the rest falling into shadow. High-contrast, punchy color. The energy screams horsepower and speed.',
    colorPalette: 'Racing Red #CC0000, Metallic Silver #C0C0C0, Deep Black #1A1A1A, Gold #FFD700. High-contrast palette — dark backgrounds with bright metallic accents.',
    typography: 'Ultra-bold condensed sans-serif masthead (Impact or Bebas Neue feel) across the top, slightly italic for speed feel. The business name IS the masthead — enormous, bold, commanding. Headline text in white or metallic silver, giant point size. Performance numbers (horsepower, 0-60 times) rendered as large display elements near the car.',
    elements: 'Star rating badges, "EXCLUSIVE" or "FIRST TEST" corner flags in red, horsepower and performance statistics rendered prominently: "540 HP" "0-60: 3.9s". Comparison bar at very bottom edge listing competitor vehicles in small condensed type. Multiple edge teasers in condensed sans-serif. Row of star ratings. The layout feels dense with information like a real newsstand publication competing for attention.',
    mood: 'Aggressive, performance-obsessed, newsstand dominant',
  },
  textPrompt: {
    tone: 'Bold, aggressive, performance-focused. King of the road energy.',
    vocabulary: ['power', 'king', 'exclusive', 'tested', 'performance'],
  },
  mockupScenes: ['magazine-cover', 'newsstand'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const MT_2000S_DARK_HERO: ThemeDefinition = {
  id: 'mt-2000s-dark-hero',
  name: 'Motor Trend 2000s',
  category: 'Auto Magazine',
  shortDescription: '2000s dark studio — dramatic lighting, metallic text, hero shot',
  previewColors: ['#0A1628', '#C0C0C0', '#FFFFFF', '#333333'],
  imagePrompt: {
    style: 'A 2000s automotive publication cover. Dark, dramatic studio environment with a single hero car lit by controlled studio lighting — three-point setup with a strong key light creating sharp specular highlights along the body, a fill light for shadow detail, and a rim light separating the car from the near-black background. The floor is polished dark, catching faint reflections. A subtle lens flare cuts diagonally. Cool color temperature. The image is technically perfect — this is professional studio photography.',
    colorPalette: 'Navy Black #0A1628, Metallic Silver #C0C0C0, Pure White #FFFFFF, Dark Gray #333333, Cool Blue accent #4682B4.',
    typography: 'Bold modern sans-serif masthead in white or silver-metallic. The business name as masthead spans the full width at top. Headline in bold condensed white with subtle chrome/metallic text effect. Secondary text in lighter weight. Clean, professional hierarchy. Slight drop shadow or outer glow on text for readability against dark background.',
    elements: 'Dark gradient studio background, controlled three-point lighting on car, subtle lens flare, polished reflective floor, metallic text effects, comparison bar at bottom in small sans-serif listing competing vehicles. Minimal edge teasers — 2-3 maximum in small clean type. "FIRST TEST" badge. Technology and luxury emphasis.',
    mood: 'Dark, dramatic, studio-perfect, premium',
  },
  textPrompt: {
    tone: 'Professional, dramatic, technically impressive.',
    vocabulary: ['exclusive', 'first drive', 'tested', 'technology', 'precision'],
  },
  mockupScenes: ['magazine-cover', 'newsstand'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const MT_MODERN_DIGITAL: ThemeDefinition = {
  id: 'mt-modern-digital',
  name: 'Motor Trend Modern',
  category: 'Auto Magazine',
  shortDescription: 'Modern clean — white background, bold statement, digital polish',
  previewColors: ['#FFFFFF', '#1A1A1A', '#E63946', '#333333'],
  imagePrompt: {
    style: 'A modern digital-era automotive publication cover. Clean white or very light gray background. A single dramatic vehicle dominates the center of the frame — shot at a slight low angle with clean, even studio lighting and no harsh shadows. The composition is airy and minimal with generous white space. Everything feels polished, high-resolution, and contemporary. Think Apple-product-launch level visual cleanliness applied to an automotive layout.',
    colorPalette: 'Clean White #FFFFFF, Near Black #1A1A1A, Bold Red accent #E63946, Dark Gray #333333. Minimal palette — the car provides the color.',
    typography: 'Clean geometric sans-serif masthead (Montserrat, Futura, or similar) in bold black at the top. The business name as masthead — large, clean, authoritative. Headline in bold sans-serif, possibly with one word in the accent color for emphasis. Minimal teaser text — just 1-2 lines along the very top edge. Modern, digital-native typography with generous letter-spacing.',
    elements: 'White/light background with no distracting environment, single hero vehicle as the absolute focus, minimal edge text — maximum 2 teasers in small clean sans-serif at top edge. "EXCLUSIVE" or "SPECIAL REPORT" label in red accent. Clean drop shadow grounding the car. The design breathes — at least 30% white space. Digital polish throughout.',
    mood: 'Clean, modern, digitally polished',
  },
  textPrompt: {
    tone: 'Contemporary, clean, authoritative.',
    vocabulary: ['exclusive', 'special report', 'future', 'innovation', 'tested'],
  },
  mockupScenes: ['magazine-cover', 'digital-edition'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// --- Road & Track Style (5 themes) ---

const RT_60S_GRAND_TOURING: ThemeDefinition = {
  id: 'rt-60s-grand-touring',
  name: 'Road & Track 1960s',
  category: 'Auto Magazine',
  shortDescription: '1960s grand touring — elegant serif, European cars, dense editorial text',
  previewColors: ['#1A1A1A', '#8B0000', '#F5F5DC', '#4682B4'],
  imagePrompt: {
    style: 'A 1960s European automotive enthusiast publication cover. An elegant sports car (Ferrari, Porsche, Jaguar, or BMW silhouette) photographed in a pastoral European setting or on a scenic coastal road. The photography has a slightly desaturated, vintage film quality — muted warm tones with excellent contrast. Multiple car photos may be stacked in a collage layout. The composition references sophisticated 1960s automotive journalism — refined, knowledgeable, European-inflected.',
    colorPalette: 'Near Black #1A1A1A, Dark Red #8B0000, Cream #F5F5DC, Steel Blue #4682B4, Warm Gray #A9A9A9. Refined, subdued palette with warmth.',
    typography: 'Elegant serif masthead with a decorative ampersand "&" symbol as a distinctive design element. The business name rendered as a prestigious publication masthead in elegant serif (Garamond, Caslon, or Baskerville feel). "The Motor Enthusiasts\' Magazine" style subtitle in small italic. Dense teaser text in small serif along top and sides — road test listings, car comparisons, technical articles. Refined typographic hierarchy.',
    elements: 'European sports car in pastoral or coastal setting, elegant serif ampersand "&" as a design feature, stacked photo collage of multiple cars, dense classified-style teaser text along all edges: "Road Tests:..." "Driving Impressions:..." "Technical Analysis:..." listings. Issue number and date in small serif. Vintage paper texture. The layout is information-rich but elegantly organized.',
    mood: 'Elegant, sophisticated, European automotive culture',
  },
  textPrompt: {
    tone: 'Refined, knowledgeable, European sensibility.',
    vocabulary: ['grand touring', 'driving impressions', 'road test', 'elegance', 'precision'],
  },
  mockupScenes: ['magazine-cover', 'newsstand'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const RT_70S_OPEN_ROAD: ThemeDefinition = {
  id: 'rt-70s-open-road',
  name: 'Road & Track 1970s',
  category: 'Auto Magazine',
  shortDescription: '1970s open road — convertibles, pastoral scenery, driving impressions',
  previewColors: ['#87CEEB', '#228B22', '#DAA520', '#F5F5DC'],
  imagePrompt: {
    style: 'A 1970s automotive enthusiast publication cover. A convertible sports car driving on an open country road through rolling green hills and pastoral scenery. Blue sky with photogenic clouds. Natural golden-hour sunlight. The composition is relaxed and contemplative — this is about the joy of driving, not speed. The photography has warm 1970s film quality with soft highlights and slightly amber shadows. The setting could be British countryside, California coast, or European countryside.',
    colorPalette: 'Sky Blue #87CEEB, Forest Green #228B22, Goldenrod #DAA520, Cream #F5F5DC, Earth Brown #8B7355. Natural outdoor palette — greens, blues, golds.',
    typography: 'Serif masthead with an elegant ampersand "&" at the top — refined but warmer than the 1960s version. The business name as masthead in warm serif type. "Driving Impressions" style subtitle. Headline in a friendly serif — not aggressive, conversational. Teaser text along top edge in small serif: performance comparisons, model reviews.',
    elements: 'Open country road, rolling hills, blue sky with clouds, convertible with top down, natural scenery dominating the background. Teaser text at top: "Improved Performance for..." and model comparison headlines. Issue date and "The Motor Enthusiasts\' Magazine" subtitle. Warm, natural atmosphere. Person driving the car visible but small — the drive experience is the focus.',
    mood: 'Pastoral, contemplative, driving-pleasure focused',
  },
  textPrompt: {
    tone: 'Warm, relaxed, focused on the driving experience.',
    vocabulary: ['open road', 'driving', 'performance', 'touring', 'impressions'],
  },
  mockupScenes: ['magazine-cover', 'newsstand'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const RT_80S_RED_FERRARI: ThemeDefinition = {
  id: 'rt-80s-red-ferrari',
  name: 'Road & Track 1980s',
  category: 'Auto Magazine',
  shortDescription: '1980s supercar era — red Italian exotics, bold claims, 0-60 stats',
  previewColors: ['#CC0000', '#FFFFFF', '#FFD700', '#1A1A1A'],
  imagePrompt: {
    style: 'A 1980s-90s exotic car publication cover. A red Italian supercar (Ferrari, Lamborghini silhouette) dominates the frame at an aggressive 3/4 front angle — low, wide, dramatic. The car fills 70% of the composition. Background is either a dramatic sunset gradient or dark studio setting. The lighting is warm and saturated, making the red paint absolutely glow. This is peak supercar era energy — excess, speed, desire. The car is the object of pure aspiration.',
    colorPalette: 'Ferrari Red #CC0000, Pure White #FFFFFF, Gold #FFD700, Black #1A1A1A, Warm Orange accent #FF6600.',
    typography: 'Bold sans-serif masthead with decorative ampersand "&" at the top. The business name in bold serif or sans-serif as the masthead. Massive headline in bold red or white — "RED HOT" or "THE MOST EXOTIC EVER" energy — dramatic claims in large point size. Performance stats rendered large: "240 bhp, 0-60: 5.5 seconds". Comparison listings at bottom in condensed type.',
    elements: 'Red exotic supercar as absolute hero, aggressive low angle, "Collector\'s Edition" or "FIRST TEST" badge, bold performance statistics rendered prominently (bhp, 0-60 times, top speed). Bottom edge: condensed comparison listings of competing models. "50th Anniversary" or milestone celebration style. Saturated warm lighting making the red paint luminous.',
    mood: 'Aspirational, exotic, red-hot desire',
  },
  textPrompt: {
    tone: 'Passionate, aspirational, supercar-obsessed.',
    vocabulary: ['exotic', 'supercar', 'red hot', 'bhp', 'first test'],
  },
  mockupScenes: ['magazine-cover', 'newsstand'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const RT_MODERN_CINEMATIC: ThemeDefinition = {
  id: 'rt-modern-cinematic',
  name: 'Road & Track Editorial',
  category: 'Auto Magazine',
  shortDescription: 'Modern editorial — cinematic shadows, film-like color, minimal text',
  previewColors: ['#8B0000', '#2C3E50', '#F0E68C', '#1A1A1A'],
  imagePrompt: {
    style: 'A modern cinematic automotive editorial cover. A single car shot from an unusual, artful angle — rear 3/4 in dramatic shadows, or low profile against dramatic sky. Film-like color grading with rich shadows and selective warm highlights. The composition is more cinema than journalism — long shadows, golden hour light, architectural framing. Shallow depth of field creating dreamy background bokeh. This is automotive photography as art — unexpected angles, moody lighting, the car as sculpture.',
    colorPalette: 'Dark Red #8B0000, Slate Blue #2C3E50, Warm Gold #F0E68C, Near Black #1A1A1A, Warm Highlights #FFE4B5.',
    typography: 'Clean modern serif or transitional serif masthead with a distinctive ampersand "&" design element. The business name as masthead — elegant, refined. Headline in editorial serif — thought-provoking, not aggressive: "Go to the Races That MATTER MOST" energy. Minimal text — just masthead, one headline, and perhaps a single line of secondary text. The photography speaks.',
    elements: 'Cinematic car photography with dramatic shadows and selective lighting, golden hour atmosphere, architectural or landscape framing, film grain texture, minimal text — this cover breathes. One editorial headline positioned thoughtfully. No edge teasers or stats — modern editorial simplicity. The car\'s form and light tell the story.',
    mood: 'Cinematic, artful, editorially sophisticated',
  },
  textPrompt: {
    tone: 'Thoughtful, cinematic, editorially sophisticated.',
    vocabulary: ['matters', 'sacred', 'pursuit', 'craft', 'experience'],
  },
  mockupScenes: ['magazine-cover', 'gallery-print'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const RT_CALIFORNIA_LIFESTYLE: ThemeDefinition = {
  id: 'rt-california-lifestyle',
  name: 'Road & Track California',
  category: 'Auto Magazine',
  shortDescription: 'California lifestyle — teal retro grading, multiple Porsches, scenic',
  previewColors: ['#008B8B', '#DAA520', '#F5F5DC', '#2F4F4F'],
  imagePrompt: {
    style: 'A modern lifestyle automotive editorial cover with retro-warm color grading. Multiple sports cars (Porsche 911s, vintage and modern mixed) gathered in a scenic California mountain parking area or coastal overlook. The color grading is distinctively retro — teal shadows, warm golden highlights, slightly desaturated mid-tones like a faded film postcard. People are casually present — leaning on cars, taking photos, enjoying the scene. This is automotive lifestyle as aspiration — the cars AND the life around them.',
    colorPalette: 'Teal #008B8B, Warm Gold #DAA520, Cream #F5F5DC, Dark Teal #2F4F4F, Sunset Peach #FFDAB9.',
    typography: 'Clean sans-serif masthead with bold ampersand "&" design element at the top. The business name as masthead. Playful editorial headline — "I\'m Going to CALIFORNIA" energy — aspirational, warm, inviting. Typography is clean and modern but with a retro-warm feel from the color grading. Minimal supporting text.',
    elements: 'Multiple sports cars gathered in a scenic location (mountain parking lot, coastal overlook), people interacting casually with the cars, scenic California landscape (redwoods, mountains, coast), vintage-warm color grading throughout (teal + gold), lifestyle atmosphere. Minimal text — the scene tells the story. Perhaps a single "Vol. XX No. XX" issue reference in small type.',
    mood: 'Aspirational, lifestyle-warm, California dreaming',
  },
  textPrompt: {
    tone: 'Warm, aspirational, lifestyle-focused.',
    vocabulary: ['California', 'gathering', 'community', 'drive', 'lifestyle'],
  },
  mockupScenes: ['magazine-cover', 'gallery-print'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

// --- Specialty Magazine Styles (4 themes) ---

const HOTROD_CUSTOM_BUILD: ThemeDefinition = {
  id: 'hotrod-custom-build',
  name: 'Hot Rod Magazine',
  category: 'Auto Magazine',
  shortDescription: 'Hot Rod mag — American muscle, flames, chrome, custom builds',
  previewColors: ['#FF4500', '#FFD700', '#1A1A1A', '#C0C0C0'],
  imagePrompt: {
    style: 'A classic Hot Rod publication cover. An American hot rod or muscle car with custom flame paint job, exposed chrome engine, and aggressive stance — photographed at a low angle in a garage or drag strip setting. The car is a work of art: candy paint catching light, chrome headers gleaming, fat rear tires. The energy is pure American custom car culture — raw, loud, proud. Saturated color photography with warm lighting emphasizing chrome and paint.',
    colorPalette: 'Flame Orange-Red #FF4500, Gold #FFD700, Deep Black #1A1A1A, Chrome Silver #C0C0C0, Candy Red #9B111E.',
    typography: 'Bold aggressive display type for the masthead — condensed, powerful, slightly vintage. The business name as masthead in aggressive bold type. Headlines in bold condensed: "AMERICA\'S HOTTEST BUILDS" energy. Performance stats rendered large. Edge teasers in bold condensed sans-serif: "TECH: How to..." and "DYNO RESULTS" callouts.',
    elements: 'Custom flame paint job on the car, exposed chrome engine with headers, drag strip or garage setting, "TECH:" feature callouts, dyno results and horsepower statistics, speed equipment references, custom wheel details. Dense edge teasers: build features, tech tips, product reviews. The layout is packed with energy and information like a real enthusiast publication.',
    mood: 'Raw, American muscle, custom car pride',
  },
  textPrompt: {
    tone: 'Bold, proud, custom car culture through and through.',
    vocabulary: ['custom', 'build', 'hot rod', 'chrome', 'power'],
  },
  mockupScenes: ['magazine-cover', 'newsstand'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const DUB_CUSTOM_WHEELS: ThemeDefinition = {
  id: 'dub-custom-wheels',
  name: 'DUB Magazine',
  category: 'Auto Magazine',
  shortDescription: 'DUB mag — massive wheels, urban luxury, hip-hop culture',
  previewColors: ['#FFD700', '#C0C0C0', '#1A1A1A', '#800080'],
  imagePrompt: {
    style: 'An urban custom car culture publication cover. A luxury vehicle (Escalade, Charger, or exotic car silhouette) sitting on massive oversized chrome wheels (24"+ rims) in an urban night setting — city lights reflecting off the chrome and candy paint. The car has an air-suspension stance, custom interior glow visible through tinted windows. Wet city street reflections. The aesthetic is hip-hop luxury meets automotive art — flashy, bold, unapologetic. Professional studio-quality photography with dramatic lighting.',
    colorPalette: 'Gold #FFD700, Chrome Silver #C0C0C0, Deep Black #1A1A1A, Purple #800080, Candy Paint tones. Metallic and chrome finishes dominate.',
    typography: 'Bold urban display type for masthead — thick, powerful, with gold or chrome text effects. The business name as masthead with metallic finish. Headlines with chrome or gold gradient text. "EXCLUSIVE" tags in bold. Typography is flashy and confident — gold outlines, emboss effects, luxury weight.',
    elements: 'Oversized chrome wheels (24"+ deep-dish rims) as a prominent design element, candy paint with metallic flake, urban night cityscape background, air suspension stance, "EXCLUSIVE" and "WORLD PREMIERE" tags, chrome and gold accents throughout. Interior glow visible. Edge text with celebrity references and custom build specs.',
    mood: 'Urban luxury, hip-hop culture, flashy and bold',
  },
  textPrompt: {
    tone: 'Bold, flashy, luxury culture.',
    vocabulary: ['exclusive', 'custom', 'luxury', 'premier', 'chrome'],
  },
  mockupScenes: ['magazine-cover', 'newsstand'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const IMPORT_TUNER_NIGHT: ThemeDefinition = {
  id: 'import-tuner-night',
  name: 'Import Tuner',
  category: 'Auto Magazine',
  shortDescription: 'Super Street / Import Tuner — neon underglow, JDM, night scene',
  previewColors: ['#39FF14', '#0066FF', '#1A1A1A', '#FF4500'],
  imagePrompt: {
    style: 'A JDM tuner culture publication cover. A modified Japanese import (Supra, GTR, Civic, or Evo silhouette) in a wet parking garage or city street at night. Neon underglow casts colored light on the wet asphalt. The car is slammed with aftermarket wheels, body kit, and visible intercooler. Rain puddles reflect neon signs. The atmosphere is Need for Speed Underground meets Tokyo street racing — electric, underground, adrenaline. Wide-angle low shot exaggerating the car\'s aggressive stance.',
    colorPalette: 'Neon Green #39FF14, Electric Blue #0066FF, Night Black #1A1A1A, Flame Orange #FF4500, Purple underglow #9B30FF.',
    typography: 'Angular tech-forward sans-serif masthead — sharp, aggressive, digital. The business name as masthead in angular bold type. Japanese katakana characters as decorative accent elements alongside English text. "DYNO TESTED" and "FULL BUILD SPEC" callout badges. Performance stats in tech-style display font: boost pressure, wheel horsepower.',
    elements: 'Neon underglow reflecting on wet pavement, aftermarket body kit and oversized wing, wet street with puddle reflections of neon signs, Japanese characters as decorative accents, turbo boost gauge graphics, "DYNO TESTED: XXX WHP" statistics. Edge teasers in angular type: build specs, modification lists, product reviews. Night atmosphere with sodium-vapor and neon lighting.',
    mood: 'Underground, electric, JDM adrenaline',
  },
  textPrompt: {
    tone: 'Tech-forward, underground, performance-obsessed.',
    vocabulary: ['boost', 'tuned', 'JDM', 'build', 'dyno'],
  },
  mockupScenes: ['magazine-cover', 'newsstand'],
  compatibleTools: ['promo_flyer', 'social_post'],
};

const RT_RACING_COCKPIT: ThemeDefinition = {
  id: 'rt-racing-cockpit',
  name: 'Road & Track Racing',
  category: 'Auto Magazine',
  shortDescription: 'Racing special — cockpit view, helmet visor, dramatic illustration',
  previewColors: ['#CC0000', '#FFFFFF', '#1A1A1A', '#DAA520'],
  imagePrompt: {
    style: 'A dramatic racing-focused automotive publication cover rendered as a painted illustration. The viewer looks over a racing driver\'s shoulder from inside the cockpit — gloved hands gripping the steering wheel, a glimpse of helmet visor with reflections, the track stretching ahead through the windscreen. The style is painted illustration, not photography — bold brush strokes, dramatic color, action-frozen composition. Inspired by 1960s motorsport art and racing posters. Red is the dominant color with dramatic contrast.',
    colorPalette: 'Racing Red #CC0000, Pure White #FFFFFF, Near Black #1A1A1A, Gold #DAA520, Chrome accents.',
    typography: 'Bold serif masthead with elegant ampersand "&" at the top — prestigious and classic. The business name as masthead in refined serif. "The Sporting Tradition" or "Racing Special" as a subtitle. Headline in a dramatic serif — bold racing claims. Minimal but impactful text — the dramatic illustration carries the cover.',
    elements: 'Cockpit-perspective composition showing driver\'s gloved hands on wheel, helmet visor with reflections, track ahead through windscreen, racing car bodywork visible at frame edges. Painted illustration style with bold strokes. Racing number on the car visible. Wind and speed suggested through blur and motion. "RACING SPECIAL" edition label.',
    mood: 'Dramatic, racing-heritage, heroic illustration',
  },
  textPrompt: {
    tone: 'Dramatic, heritage-rich, racing passion.',
    vocabulary: ['racing', 'heritage', 'tradition', 'driver', 'track'],
  },
  mockupScenes: ['magazine-cover', 'framed-print'],
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
  // Family 11: Auto Magazine
  MT_60S_CAR_OF_YEAR,
  MT_70S_ROAD_TEST,
  MT_80S_PERFORMANCE,
  MT_2000S_DARK_HERO,
  MT_MODERN_DIGITAL,
  RT_60S_GRAND_TOURING,
  RT_70S_OPEN_ROAD,
  RT_80S_RED_FERRARI,
  RT_MODERN_CINEMATIC,
  RT_CALIFORNIA_LIFESTYLE,
  HOTROD_CUSTOM_BUILD,
  DUB_CUSTOM_WHEELS,
  IMPORT_TUNER_NIGHT,
  RT_RACING_COCKPIT,
];

export function getCuratedTheme(id: string): ThemeDefinition | undefined {
  return CURATED_THEMES.find(t => t.id === id);
}
