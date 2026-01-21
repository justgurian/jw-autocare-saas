/**
 * JW Auto Care AI - Brand Style System
 *
 * These are comprehensive visual identity packages that produce consistent,
 * professional-looking marketing materials. Each style is designed to create
 * a cohesive brand experience across all generated content.
 */

export interface BrandStyle {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  previewColors: string[]; // For UI preview chips

  // Detailed visual specifications
  visual: {
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      description: string;
    };
    typography: {
      headlines: string;
      body: string;
      style: string;
    };
    designElements: string[];
    texture: string;
    mood: string;
  };

  // AI Image Generation Prompt
  imagePrompt: {
    styleDirective: string;
    visualElements: string;
    colorInstructions: string;
    typographyInstructions: string;
    compositionRules: string;
    avoidElements: string;
  };

  // Caption tone
  captionStyle: {
    tone: string;
    vocabulary: string[];
    emoji: string;
  };
}

export const BRAND_STYLES: BrandStyle[] = [
  // =========================================================================
  // 1. 1950s AMERICANA GARAGE
  // =========================================================================
  {
    id: '1950s-americana',
    name: '1950s Americana',
    shortDescription: 'Classic retro gas station vibes',
    fullDescription: 'Nostalgic 1950s American garage aesthetic. Think vintage Texaco stations, chrome diners, and hand-painted signs. Perfect for family-owned shops that want to convey trust and heritage.',
    previewColors: ['#C41E3A', '#F5F5DC', '#228B22', '#C0C0C0'],

    visual: {
      colorPalette: {
        primary: '#C41E3A', // Cherry red
        secondary: '#F5F5DC', // Cream
        accent: '#228B22', // Forest green
        background: '#FDF5E6', // Old lace
        text: '#2F2F2F', // Charcoal
        description: 'Cherry red and cream with forest green accents, chrome silver details'
      },
      typography: {
        headlines: 'Bold slab serif or hand-painted script style',
        body: 'Classic rounded sans-serif',
        style: 'All-caps headlines, generous letter spacing, vintage feel'
      },
      designElements: [
        'Chrome pinstriping and borders',
        'Vintage car silhouettes (1950s models)',
        'Checkerboard patterns',
        'Retro starbursts and badges',
        'Hand-painted sign lettering',
        'Art deco flourishes',
        'Vintage tool illustrations',
        'Classic gas pump imagery'
      ],
      texture: 'Slightly weathered paper, subtle grain, warm vintage tones',
      mood: 'Nostalgic, trustworthy, family-friendly, American heritage'
    },

    imagePrompt: {
      styleDirective: `Create a promotional flyer in authentic 1950s American advertising style.
The aesthetic should evoke classic Texaco and Gulf gas station advertisements from the 1950s era.
Think Norman Rockwell meets vintage automotive advertising.`,

      visualElements: `Include these 1950s design elements:
- Chrome-style borders and pinstriping
- Vintage starburst or badge shapes for highlighting deals
- Classic 1950s car silhouettes or illustrations (Chevrolet Bel Air, Ford Fairlane style)
- Art deco corner flourishes
- Retro ribbon banners for text
- Checkerboard accents where appropriate`,

      colorInstructions: `Color palette:
- Primary: Cherry red (#C41E3A)
- Secondary: Cream white (#F5F5DC)
- Accent: Forest green (#228B22)
- Metallic chrome/silver highlights
- Warm sepia undertones
Colors should feel warm and nostalgic, not harsh`,

      typographyInstructions: `Typography style:
- Headlines: Bold slab serif or hand-painted script appearance
- All headlines in CAPS with generous letter spacing
- Secondary text in friendly rounded sans-serif
- Price callouts in bold with starburst backgrounds
- Text should look like vintage hand-lettered signs`,

      compositionRules: `Composition:
- Central focal point with radiating design elements
- Bold headline at top, call-to-action at bottom
- Generous white space (cream space) around elements
- Symmetrical, balanced layout
- Vintage border treatment around edges
- Professional marketing hierarchy`,

      avoidElements: `AVOID: Modern gradients, neon colors, digital/tech aesthetics,
minimalist design, contemporary fonts, realistic photographs of people`
    },

    captionStyle: {
      tone: 'Friendly, nostalgic, trustworthy, family-focused',
      vocabulary: ['folks', 'neighbor', 'family-owned', 'trusted', 'since', 'quality', 'honest', 'dependable'],
      emoji: '🚗🔧⭐'
    }
  },

  // =========================================================================
  // 2. EUROPEAN LUXURY AUTO
  // =========================================================================
  {
    id: 'european-luxury',
    name: 'European Luxury',
    shortDescription: 'Premium Mercedes/BMW aesthetic',
    fullDescription: 'Sophisticated European automotive marketing style. Clean, minimal, and premium. Inspired by Mercedes-Benz, BMW, and Audi dealership aesthetics. Perfect for shops specializing in European vehicles or wanting an upscale image.',
    previewColors: ['#1C2841', '#C0C0C0', '#FFFFFF', '#B8860B'],

    visual: {
      colorPalette: {
        primary: '#1C2841', // Deep navy
        secondary: '#C0C0C0', // Silver
        accent: '#B8860B', // Subtle gold
        background: '#FFFFFF', // Pure white
        text: '#1C2841', // Deep navy
        description: 'Deep navy and silver with subtle gold accents on pure white'
      },
      typography: {
        headlines: 'Thin elegant sans-serif (like Helvetica Neue Light)',
        body: 'Light, refined sans-serif with generous tracking',
        style: 'Minimal, lots of white space, understated elegance'
      },
      designElements: [
        'Thin elegant lines',
        'Subtle geometric patterns',
        'Premium metallic accents',
        'Dramatic lighting effects',
        'Clean geometric shapes',
        'Sophisticated gradients',
        'Minimal iconography',
        'High-end automotive silhouettes'
      ],
      texture: 'Smooth, clean, subtle brushed metal effects',
      mood: 'Sophisticated, premium, trustworthy, exclusive'
    },

    imagePrompt: {
      styleDirective: `Create a promotional flyer in premium European luxury automotive style.
The aesthetic should match high-end Mercedes-Benz, BMW, or Audi dealership marketing.
Think sophisticated, minimal, and unmistakably premium.`,

      visualElements: `Include these luxury design elements:
- Clean geometric shapes and thin elegant lines
- Subtle metallic silver accents
- Premium-looking gradients (subtle, not garish)
- Sophisticated shadow effects
- High-end automotive imagery or silhouettes
- Minimal, purposeful design elements only`,

      colorInstructions: `Color palette:
- Primary: Deep navy blue (#1C2841)
- Secondary: Silver/platinum (#C0C0C0)
- Accent: Subtle gold highlights (#B8860B)
- Background: Pure white or very light gray
- High contrast, clean, premium feel
Colors should feel expensive and refined`,

      typographyInstructions: `Typography style:
- Headlines: Thin, elegant sans-serif (light weight)
- Generous letter spacing (tracking)
- ALL CAPS for headlines with extreme elegance
- Minimal text - every word purposeful
- Numbers styled prominently for pricing
- Refined, never bold or aggressive`,

      compositionRules: `Composition:
- LOTS of white space - let it breathe
- Asymmetrical but perfectly balanced
- Strong visual hierarchy
- Single focal point
- Text aligned with precision
- Premium, gallery-like presentation
- Sophisticated and restrained`,

      avoidElements: `AVOID: Bright colors, busy patterns, cluttered layouts,
cartoon elements, casual fonts, starburst shapes, loud call-to-actions,
anything that looks budget or discount-focused`
    },

    captionStyle: {
      tone: 'Sophisticated, confident, understated, professional',
      vocabulary: ['precision', 'excellence', 'craftsmanship', 'expertise', 'premium', 'certified', 'specialist'],
      emoji: '🔹' // Minimal emoji use
    }
  },

  // =========================================================================
  // 3. MUSCLE CAR / PERFORMANCE
  // =========================================================================
  {
    id: 'muscle-performance',
    name: 'Muscle & Performance',
    shortDescription: 'Bold racing and hot rod energy',
    fullDescription: 'High-octane muscle car and performance shop aesthetic. Racing stripes, aggressive angles, and powerful imagery. Perfect for performance shops, hot rod specialists, and speed enthusiasts.',
    previewColors: ['#FF0000', '#000000', '#FF6600', '#FFCC00'],

    visual: {
      colorPalette: {
        primary: '#FF0000', // Racing red
        secondary: '#000000', // Black
        accent: '#FF6600', // Flame orange
        background: '#1A1A1A', // Dark charcoal
        text: '#FFFFFF', // White
        description: 'Racing red, black, and flame orange with chrome accents'
      },
      typography: {
        headlines: 'Bold italic racing fonts, aggressive angles',
        body: 'Strong condensed sans-serif',
        style: 'Angled text, speed lines, high impact'
      },
      designElements: [
        'Racing stripes',
        'Flame graphics',
        'Speedometer/tachometer imagery',
        'Checkered flags',
        'Lightning bolts',
        'Chrome exhaust pipes',
        'Aggressive angular shapes',
        'Muscle car silhouettes'
      ],
      texture: 'Carbon fiber patterns, metallic sheen, high gloss',
      mood: 'Powerful, fast, aggressive, exciting'
    },

    imagePrompt: {
      styleDirective: `Create a promotional flyer in aggressive muscle car and performance racing style.
The aesthetic should evoke hot rod culture, drag racing, and American muscle car heritage.
Think powerful, fast, and unapologetically bold.`,

      visualElements: `Include these performance design elements:
- Racing stripes (dual or triple stripe patterns)
- Flame graphics or hot rod flame accents
- Speedometer or tachometer graphical elements
- Checkered flag patterns where appropriate
- Aggressive angular shapes and dynamic lines
- Muscle car silhouettes (Mustang, Camaro, Challenger style)
- Chrome mechanical elements (headers, pipes)`,

      colorInstructions: `Color palette:
- Primary: Racing red (#FF0000)
- Secondary: Jet black (#000000)
- Accent: Flame orange (#FF6600) and chrome yellow (#FFCC00)
- Background: Dark charcoal or black
- Chrome/metallic highlights
- High contrast, bold, aggressive`,

      typographyInstructions: `Typography style:
- Headlines: Bold italic with aggressive angles
- Racing-inspired fonts with speed feeling
- Condensed, powerful letterforms
- Text can be angled for dynamic effect
- Strong contrast against backgrounds
- All caps for impact`,

      compositionRules: `Composition:
- Dynamic, angled layouts
- Strong diagonal movement
- Bold, in-your-face presentation
- Hero image or graphic prominence
- Text integrated with speed lines
- High energy, not static`,

      avoidElements: `AVOID: Soft colors, rounded fonts, cute elements,
elegant/refined aesthetics, lots of white space, minimal design,
anything delicate or subtle`
    },

    captionStyle: {
      tone: 'Bold, exciting, powerful, enthusiastic',
      vocabulary: ['power', 'performance', 'speed', 'horsepower', 'torque', 'custom', 'built', 'unleash'],
      emoji: '🏁🔥💨🏎️'
    }
  },

  // =========================================================================
  // 4. MODERN TECH-FORWARD
  // =========================================================================
  {
    id: 'modern-tech',
    name: 'Modern Tech-Forward',
    shortDescription: 'Sleek, innovative, digital-age',
    fullDescription: 'Clean, modern, technology-focused aesthetic. Inspired by Tesla service centers and modern automotive tech. Perfect for shops emphasizing diagnostics, EVs, hybrids, and cutting-edge service.',
    previewColors: ['#00D4FF', '#FFFFFF', '#1E1E1E', '#00FF88'],

    visual: {
      colorPalette: {
        primary: '#00D4FF', // Electric cyan
        secondary: '#FFFFFF', // White
        accent: '#00FF88', // Neon green
        background: '#0A0A0A', // Near black
        text: '#FFFFFF', // White
        description: 'Electric blue and neon accents on dark or white backgrounds'
      },
      typography: {
        headlines: 'Geometric sans-serif, clean and futuristic',
        body: 'Light, modern sans-serif',
        style: 'Precise, technical, clean edges'
      },
      designElements: [
        'Circuit board patterns',
        'Geometric grid layouts',
        'Glowing line effects',
        'Digital UI elements',
        'Hexagonal shapes',
        'Subtle particle effects',
        'Tech iconography',
        'Clean data visualizations'
      ],
      texture: 'Smooth, matte with glowing accents',
      mood: 'Innovative, precise, advanced, trustworthy'
    },

    imagePrompt: {
      styleDirective: `Create a promotional flyer in modern tech-forward automotive style.
The aesthetic should evoke Tesla service centers, advanced diagnostics, and cutting-edge technology.
Think innovative, precise, and unmistakably modern.`,

      visualElements: `Include these tech-forward design elements:
- Circuit board or digital grid patterns
- Glowing line accents and borders
- Hexagonal or geometric shapes
- Clean iconography
- Subtle tech-inspired textures
- Modern car silhouettes (EV/contemporary style)
- Holographic or gradient effects`,

      colorInstructions: `Color palette:
- Primary: Electric cyan/blue (#00D4FF)
- Accent: Neon green highlights (#00FF88)
- Can use dark mode (black background) or light mode (white)
- Glowing, luminous accent effects
- High-tech, clean color application`,

      typographyInstructions: `Typography style:
- Headlines: Clean geometric sans-serif
- Precise, technical appearance
- Light to medium weights
- Clean edges, no decorative elements
- Modern, Elon-era aesthetic
- Numbers and data styled prominently`,

      compositionRules: `Composition:
- Grid-based, precise alignment
- Clean white space or dark space
- Minimalist but not boring
- Tech UI-inspired layouts
- Centered or asymmetrical balance
- Information hierarchy clarity`,

      avoidElements: `AVOID: Vintage elements, warm colors, hand-drawn anything,
rustic textures, traditional design, ornate decorations,
busy patterns, retro aesthetics`
    },

    captionStyle: {
      tone: 'Professional, innovative, precise, confident',
      vocabulary: ['advanced', 'precision', 'diagnostic', 'technology', 'certified', 'expert', 'state-of-the-art'],
      emoji: '⚡🔋✨'
    }
  },

  // =========================================================================
  // 5. FRIENDLY NEIGHBORHOOD
  // =========================================================================
  {
    id: 'friendly-neighborhood',
    name: 'Friendly Neighborhood',
    shortDescription: 'Warm, welcoming, local shop feel',
    fullDescription: 'Approachable, friendly aesthetic for community-focused shops. Warm colors, friendly illustrations, and welcoming messaging. Perfect for family shops that want to feel like a trusted neighbor.',
    previewColors: ['#4A90A4', '#F4A460', '#90EE90', '#FFE4B5'],

    visual: {
      colorPalette: {
        primary: '#4A90A4', // Warm blue
        secondary: '#F4A460', // Sandy orange
        accent: '#90EE90', // Light green
        background: '#FFF8DC', // Cornsilk
        text: '#2F4F4F', // Dark slate
        description: 'Warm blue, friendly orange, and soft green on cream backgrounds'
      },
      typography: {
        headlines: 'Rounded, friendly sans-serif',
        body: 'Warm, readable sans-serif',
        style: 'Approachable, not corporate, human feeling'
      },
      designElements: [
        'Friendly car illustrations',
        'Rounded shapes and corners',
        'Hand-drawn style icons',
        'Smiling mechanic characters',
        'Tool illustrations (wrenches, etc.)',
        'Badge and seal graphics',
        'Warm gradient backgrounds',
        'Community imagery'
      ],
      texture: 'Soft, warm, slightly textured paper feel',
      mood: 'Welcoming, trustworthy, friendly, local'
    },

    imagePrompt: {
      styleDirective: `Create a promotional flyer in warm, friendly neighborhood shop style.
The aesthetic should feel like your trusted local mechanic - approachable, honest, and community-focused.
Think welcoming, warm, and genuinely friendly.`,

      visualElements: `Include these friendly design elements:
- Rounded corners and soft shapes
- Friendly illustrated car graphics (cute but not childish)
- Hand-drawn style icons and elements
- Trust badges and satisfaction seals
- Warm, inviting color washes
- Simple, clean illustrations
- Community-focused imagery`,

      colorInstructions: `Color palette:
- Primary: Warm trustworthy blue (#4A90A4)
- Secondary: Friendly orange/peach (#F4A460)
- Accent: Fresh green (#90EE90)
- Background: Warm cream or soft white
- All colors should feel warm and approachable
- Nothing harsh or cold`,

      typographyInstructions: `Typography style:
- Headlines: Rounded, friendly fonts
- Approachable, not corporate
- Medium weights, easy to read
- Can use slight curves or playful elements
- Human and warm, not sterile
- Conversational tone`,

      compositionRules: `Composition:
- Open, welcoming layouts
- Centered or comfortable asymmetry
- Not too corporate or formal
- Plenty of breathing room
- Illustrations support not dominate
- Easy to scan and understand`,

      avoidElements: `AVOID: Corporate coldness, aggressive angles, dark colors,
intimidating imagery, premium/luxury aesthetics,
overly technical elements, harsh contrasts`
    },

    captionStyle: {
      tone: 'Warm, friendly, conversational, trustworthy',
      vocabulary: ['neighbors', 'family', 'trusted', 'honest', 'friendly', 'care', 'community', 'local'],
      emoji: '😊🚗👨‍🔧💚'
    }
  },

  // =========================================================================
  // 6. DESERT SOUTHWEST
  // =========================================================================
  {
    id: 'desert-southwest',
    name: 'Desert Southwest',
    shortDescription: 'Arizona/Nevada desert aesthetic',
    fullDescription: 'Warm desert-inspired aesthetic perfect for Southwest shops. Terracotta, turquoise, and sunset colors with rugged authenticity. Ideal for Arizona, Nevada, New Mexico, and Texas shops.',
    previewColors: ['#CD853F', '#40E0D0', '#FF6347', '#DEB887'],

    visual: {
      colorPalette: {
        primary: '#CD853F', // Terracotta
        secondary: '#40E0D0', // Turquoise
        accent: '#FF6347', // Sunset orange/tomato
        background: '#DEB887', // Desert sand
        text: '#4A3728', // Desert brown
        description: 'Terracotta, turquoise, and sunset colors with sandy backgrounds'
      },
      typography: {
        headlines: 'Western-inspired but modern, strong serifs',
        body: 'Clean, readable sans-serif',
        style: 'Rugged but refined, desert character'
      },
      designElements: [
        'Desert landscape silhouettes',
        'Cactus and succulent imagery',
        'Sunset gradient backgrounds',
        'Native American-inspired geometric patterns',
        'Adobe and terracotta textures',
        'Vintage Route 66 elements',
        'Desert highway imagery',
        'Copper and turquoise accents'
      ],
      texture: 'Sandy, warm, slight grain like desert wind',
      mood: 'Warm, authentic, rugged, dependable'
    },

    imagePrompt: {
      styleDirective: `Create a promotional flyer in Desert Southwest style.
The aesthetic should evoke Arizona, Nevada, and New Mexico - warm deserts, stunning sunsets, and rugged authenticity.
Think terracotta, turquoise, and the beauty of the American Southwest.`,

      visualElements: `Include these Southwest design elements:
- Desert landscape elements (mountains, cacti silhouettes)
- Sunset gradient backgrounds (orange, pink, purple)
- Turquoise jewelry-inspired accents
- Geometric Native American-inspired patterns (respectfully)
- Adobe/terracotta texture elements
- Route 66 or desert highway imagery
- Warm, sandy textures`,

      colorInstructions: `Color palette:
- Primary: Terracotta/burnt sienna (#CD853F)
- Secondary: Turquoise (#40E0D0)
- Accent: Sunset orange and reds (#FF6347)
- Background: Desert sand tones (#DEB887)
- Warm throughout, like a desert sunset
- Can include purple sunset accents`,

      typographyInstructions: `Typography style:
- Headlines: Western-influenced but modern
- Strong, sturdy letterforms
- Can have slight vintage character
- Readable and clear
- Desert-appropriate, rugged feeling`,

      compositionRules: `Composition:
- Horizontal landscape orientation works well
- Can use sunset as background gradient
- Desert silhouettes at edges
- Warm, inviting overall feel
- Space like the open desert`,

      avoidElements: `AVOID: Cold colors, urban aesthetics, high-tech elements,
clinical whites, European luxury style,
culturally insensitive Native American imagery`
    },

    captionStyle: {
      tone: 'Warm, authentic, friendly, local pride',
      vocabulary: ['Arizona', 'desert', 'trusted', 'local', 'family', 'quality', 'dependable', 'heat'],
      emoji: '🌵☀️🏜️'
    }
  },

  // =========================================================================
  // 7. URBAN INDUSTRIAL
  // =========================================================================
  {
    id: 'urban-industrial',
    name: 'Urban Industrial',
    shortDescription: 'Gritty city garage authenticity',
    fullDescription: 'Raw, authentic urban garage aesthetic. Concrete, steel, and hard work. Perfect for city shops that want to project toughness, expertise, and no-nonsense professionalism.',
    previewColors: ['#708090', '#FFD700', '#1C1C1C', '#FF4500'],

    visual: {
      colorPalette: {
        primary: '#708090', // Slate gray
        secondary: '#FFD700', // Safety yellow
        accent: '#FF4500', // Warning orange-red
        background: '#1C1C1C', // Near black
        text: '#FFFFFF', // White
        description: 'Industrial grays, safety yellow, and warning orange on dark backgrounds'
      },
      typography: {
        headlines: 'Industrial stencil or bold condensed',
        body: 'Strong, industrial sans-serif',
        style: 'Bold, utilitarian, no-frills'
      },
      designElements: [
        'Concrete textures',
        'Caution/warning stripes',
        'Industrial stencil lettering',
        'Grunge and distressed elements',
        'Metal textures',
        'Gear and mechanical imagery',
        'Urban photography style',
        'Construction/safety motifs'
      ],
      texture: 'Concrete, metal, slight grunge and wear',
      mood: 'Tough, authentic, hardworking, expert'
    },

    imagePrompt: {
      styleDirective: `Create a promotional flyer in urban industrial garage style.
The aesthetic should evoke a serious city garage - concrete, steel, hard work, and expertise.
Think authentic, no-nonsense, and undeniably skilled.`,

      visualElements: `Include these industrial design elements:
- Concrete and metal textures
- Caution/warning stripe accents (yellow/black)
- Industrial stencil-style elements
- Gear and mechanical iconography
- Slight grunge or distressed effects
- Bold geometric shapes
- Urban/industrial photography style`,

      colorInstructions: `Color palette:
- Primary: Industrial slate gray (#708090)
- Secondary: Safety yellow (#FFD700)
- Accent: Warning orange-red (#FF4500)
- Background: Dark charcoal or concrete gray
- High contrast, industrial feeling
- Can include rust tones`,

      typographyInstructions: `Typography style:
- Headlines: Industrial stencil or bold condensed
- Utilitarian, functional appearance
- Strong, heavy weights
- No decorative flourishes
- Clear, direct communication
- Military/industrial influence`,

      compositionRules: `Composition:
- Bold, direct layouts
- Strong geometric structure
- Warning stripe borders optional
- Dark, moody atmosphere
- Text should punch through
- Serious and professional`,

      avoidElements: `AVOID: Soft colors, cute elements, delicate fonts,
luxury aesthetics, friendly illustrations,
warm fuzzy feelings, pastoral imagery`
    },

    captionStyle: {
      tone: 'Direct, professional, confident, expert',
      vocabulary: ['expert', 'professional', 'certified', 'skilled', 'quality', 'guaranteed', 'built', 'tough'],
      emoji: '🔧⚙️💪'
    }
  },

  // =========================================================================
  // 8. CLASSIC BRITISH RACING
  // =========================================================================
  {
    id: 'british-racing',
    name: 'British Racing Heritage',
    shortDescription: 'Elegant motorsport tradition',
    fullDescription: 'Sophisticated British racing heritage style. British Racing Green, classic elegance, and motorsport tradition. Perfect for European specialty shops, classic car specialists, and upscale services.',
    previewColors: ['#004225', '#F5F5DC', '#DAA520', '#8B4513'],

    visual: {
      colorPalette: {
        primary: '#004225', // British Racing Green
        secondary: '#F5F5DC', // Cream
        accent: '#DAA520', // Gold
        background: '#FFFFF0', // Ivory
        text: '#1C1C1C', // Near black
        description: 'British Racing Green with cream, gold accents, and rich leather browns'
      },
      typography: {
        headlines: 'Classic serif with racing heritage',
        body: 'Elegant serif or refined sans-serif',
        style: 'Sophisticated, traditional, timeless'
      },
      designElements: [
        'Laurel wreath graphics',
        'Racing number circles',
        'Heraldic elements',
        'Vintage racing badges',
        'Leather texture accents',
        'Classic car silhouettes (Jaguar, Aston Martin)',
        'Checkered flag elements',
        'Gold pinstriping'
      ],
      texture: 'Rich leather, polished metal, classic paper',
      mood: 'Sophisticated, heritage, craftsmanship, prestigious'
    },

    imagePrompt: {
      styleDirective: `Create a promotional flyer in British Racing Heritage style.
The aesthetic should evoke classic Jaguar, Aston Martin, and Lotus racing heritage.
Think sophisticated, traditional, and timelessly elegant.`,

      visualElements: `Include these British racing design elements:
- Laurel wreath graphics
- Classic racing number circles
- Heraldic shield or crest elements
- Vintage racing badge designs
- Classic British car silhouettes
- Checkered flag accents
- Gold pinstriping or borders
- Leather texture hints`,

      colorInstructions: `Color palette:
- Primary: British Racing Green (#004225)
- Secondary: Cream/ivory (#F5F5DC)
- Accent: Rich gold (#DAA520)
- Background: Ivory or cream
- Brown leather tones as accents
- Classic, not modern`,

      typographyInstructions: `Typography style:
- Headlines: Classic serif with character
- Elegant, refined letterforms
- Traditional racing typography feel
- Gold or cream on green works well
- Sophisticated, never casual
- Timeless appearance`,

      compositionRules: `Composition:
- Balanced, traditional layouts
- Central badges or crests
- Elegant borders
- Heritage-focused hierarchy
- Classic poster proportions
- Sophisticated and prestigious`,

      avoidElements: `AVOID: Modern tech aesthetics, neon colors, casual fonts,
American muscle car elements, budget/discount feeling,
industrial grunge, bright primary colors`
    },

    captionStyle: {
      tone: 'Sophisticated, distinguished, knowledgeable, refined',
      vocabulary: ['heritage', 'craftsmanship', 'specialist', 'distinguished', 'excellence', 'tradition', 'precision'],
      emoji: '🏆🍀' // Minimal
    }
  }
];

// Helper function to get a style by ID
export function getBrandStyle(styleId: string): BrandStyle | undefined {
  return BRAND_STYLES.find(style => style.id === styleId);
}

// Helper to get all styles for UI
export function getAllBrandStyles(): BrandStyle[] {
  return BRAND_STYLES;
}

// Build comprehensive image prompt from brand style
export function buildBrandStyleImagePrompt(
  style: BrandStyle,
  content: {
    headline: string;
    subject: string;
    details?: string;
    businessName?: string;
    logoInstructions?: string;
  }
): string {
  const { imagePrompt } = style;

  return `You are an expert graphic designer at a top marketing agency creating a STUNNING promotional image for an auto repair shop's social media marketing.

=== CREATIVE DIRECTION ===
${imagePrompt.styleDirective}

=== TARGET OUTPUT ===
Create a high-quality, professional promotional flyer/social media post that:
- Stops people scrolling on Instagram/Facebook
- Looks like it was designed by a professional agency
- Perfectly captures the "${style.name}" visual identity
- Makes people want to visit this auto shop

=== VISUAL DESIGN SPECIFICATIONS ===

STYLE & AESTHETIC:
${imagePrompt.visualElements}

COLOR PALETTE (USE THESE EXACT COLORS):
${imagePrompt.colorInstructions}

TYPOGRAPHY REQUIREMENTS (CRITICAL):
${imagePrompt.typographyInstructions}
- Main headline must be EXTREMELY LARGE and BOLD
- Text must be crisp, clear, and readable even as a small thumbnail
- Use HIGH CONTRAST - white or light text on dark backgrounds, or dark text with stroke on light backgrounds
- Text should take up significant space in the composition

=== CONTENT TO FEATURE ===
HEADLINE (feature this prominently): "${content.headline}"
SUBJECT/SERVICE: ${content.subject}
${content.details ? `ADDITIONAL DETAILS: ${content.details}` : ''}
${content.businessName ? `BUSINESS NAME: "${content.businessName}" - include this in the design as branding` : ''}
${content.logoInstructions ? `\nLOGO PLACEMENT: ${content.logoInstructions}` : ''}

=== COMPOSITION & LAYOUT ===
${imagePrompt.compositionRules}
- Create a single, cohesive marketing image (NOT a collage or multiple panels)
- Strong visual hierarchy: Headline > Subject > Details > Branding
- Professional marketing quality - this will represent a real business
- Balanced, intentional white/negative space

=== QUALITY STANDARDS ===
This image MUST look like:
- Professional graphic design work from a marketing agency
- Something a business would proudly post on their social media
- High-end marketing material, not clip-art or amateur design
- Clean, polished, and visually impressive

=== ABSOLUTE REQUIREMENTS ===
✅ Professional marketing quality
✅ Bold, readable text that pops
✅ Cohesive ${style.name} visual style throughout
✅ Eye-catching colors and composition
✅ Automotive/auto-repair appropriate imagery

=== MUST AVOID ===
${imagePrompt.avoidElements}
❌ Realistic photographs of human faces
❌ Copyrighted logos, brand names, or characters
❌ Tiny, illegible, or poorly placed text
❌ Cluttered, busy, or chaotic layouts
❌ Generic stock photo aesthetic
❌ Watermarks or template-looking elements
❌ Phone numbers or specific street addresses
❌ Low-quality, amateur, or unprofessional elements

=== OUTPUT SPECIFICATIONS ===
- Aspect ratio: 4:5 (portrait, optimized for Instagram/Facebook)
- Single cohesive image (not a collage)
- Print-ready quality at the given dimensions
- The ${style.name} style should be immediately recognizable

Create ONE stunning, scroll-stopping promotional image that a professional auto repair shop would proudly share on their social media.`;
}
