import { ShopAesthetic } from './shop-photographer.types';

// ─── 6 Shop Style Presets ───────────────────────────────────────────────────

export const AESTHETICS: ShopAesthetic[] = [
  {
    id: 'classic-americana',
    name: 'Classic Americana',
    description: 'Nostalgic Americana garage with vintage character and chrome accents',
    environmentPrompt: 'Checkered black-and-white floor, neon signs glowing on the walls, chrome bumpers mounted as decor, a vintage Coca-Cola cooler in the corner, hand-painted lettering on the walls',
    lightingPrompt: 'Warm tungsten work lights mixed with colorful neon glow from wall signs, creating pools of warm light with colored accents',
    colorPalette: ['#CC3333', '#1A3C6E', '#F5E6CC', '#C0C0C0', '#4A2E1F'],
    materialTextures: ['Sealed concrete', 'Chrome trim', 'Vinyl upholstery', 'Aged hardwood', 'Porcelain enamel signs'],
  },
  {
    id: 'modern-highend',
    name: 'Modern High-End',
    description: 'Sleek, clinical precision shop with glass walls and LED architecture',
    environmentPrompt: 'White epoxy-coated floor reflecting overhead lights, glass partition walls separating service bays, stainless steel workbenches, LED strip lighting along ceiling edges and bay dividers',
    lightingPrompt: 'Cool bright LED panels with architectural spotlight accents on vehicles, creating a clean clinical atmosphere with dramatic highlights',
    colorPalette: ['#FFFFFF', '#2C2C2C', '#4A90D9', '#E8E8E8', '#00B4D8'],
    materialTextures: ['High-gloss epoxy', 'Tempered glass', 'Brushed stainless steel', 'Black rubber matting', 'Anodized aluminum'],
  },
  {
    id: 'neighborhood-trusted',
    name: 'Neighborhood Trusted',
    description: 'Warm community shop with brick walls and family character',
    environmentPrompt: 'Exposed brick walls with decades of patina, family photos on a wooden shelf, hand-painted welcome signs, a community bulletin board with local business cards and kids drawings',
    lightingPrompt: 'Mixed warm fluorescent overhead tubes and natural daylight streaming through large front windows, creating a lived-in warm glow',
    colorPalette: ['#8B4513', '#2E5E3F', '#F5DEB3', '#A0522D', '#FFF8DC'],
    materialTextures: ['Worn red brick', 'Weathered hardwood shelving', 'Painted metal signage', 'Laminate countertops', 'Terracotta tile'],
  },
  {
    id: 'industrial-grit',
    name: 'Industrial Grit',
    description: 'Raw, no-nonsense heavy-duty shop with steel and concrete',
    environmentPrompt: 'Raw concrete block walls, exposed steel I-beams and bar joists overhead, chain hoists hanging from rail tracks, welding curtains in the background, oil-stained floor with industrial floor drains — no pretense, all business',
    lightingPrompt: 'Harsh overhead halogen high-bay fixtures casting hard shadows, occasional welding flash blue-white accents in background',
    colorPalette: ['#4A4A4A', '#FF6B35', '#2C2C2C', '#8B7355', '#DAA520'],
    materialTextures: ['Poured concrete', 'Structural steel', 'Industrial rubber', 'Grease-darkened metal', 'Heavy-gauge chain'],
  },
  {
    id: 'desert-southwest',
    name: 'Desert Southwest',
    description: 'Sun-baked desert garage with adobe walls and Route 66 character',
    environmentPrompt: 'Adobe stucco walls in warm earth tones, turquoise-painted door frames and accents, Route 66 memorabilia and vintage gas station signs, desert landscape visible through open bay doors with red rock formations in the distance',
    lightingPrompt: 'Bright desert sunlight flooding through wide open bay doors, casting sharp geometric shadows across the floor, bleached by intense natural light',
    colorPalette: ['#D2691E', '#40E0D0', '#F4A460', '#FFF8DC', '#CD853F'],
    materialTextures: ['Smooth stucco', 'Saltillo clay tile', 'Sun-bleached wood', 'Patina copper fixtures', 'Weathered leather'],
  },
  {
    id: 'urban-professional',
    name: 'Urban Professional',
    description: 'Compact city shop with modern signage and tight efficiency',
    environmentPrompt: 'Compact city shop maximizing every square foot, modern LED channel letter signage, glass storefront facing the street, tight efficient layout with wall-mounted tool systems and vertical storage, polished concrete floor',
    lightingPrompt: 'Bright LED panel ceiling lights with city ambient light through glass storefront windows, creating a clean modern brightness',
    colorPalette: ['#1A1A2E', '#E94560', '#F5F5F5', '#16213E', '#0F3460'],
    materialTextures: ['Polished concrete', 'Commercial glass', 'Brushed aluminum', 'LED channel letters', 'Rubber anti-fatigue matting'],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getAestheticById(id: string): ShopAesthetic | undefined {
  return AESTHETICS.find((a) => a.id === id);
}
