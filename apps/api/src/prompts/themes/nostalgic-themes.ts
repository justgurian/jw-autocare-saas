/**
 * Nostalgic Automotive Themes
 * Premium agency-quality themes across 4 styles and 4 eras
 *
 * Styles:
 * - Superhero Comics (5 themes) - Marvel/DC inspired with 3-panel story option
 * - Automotive Movie Posters (7 themes) - Action, racing, road trip focused
 * - Car Magazine (16 themes) - Classic automotive publication styles
 * - Classic Auto Advertising (4 themes) - Vintage service station and dealer ads
 */

import { ThemeDefinition, ThemeImagePrompt, ThemeTextPrompt } from './index';

// Extended interface for nostalgic themes with era and style metadata
export interface NostalgicThemeDefinition extends ThemeDefinition {
  era: '1950s' | '1960s' | '1970s' | '1980s';
  style: 'comic-book' | 'movie-poster' | 'magazine' | 'advertising';
  carStyle: string;  // How to render vehicles in this style
  composition: string;  // Layout and framing guidance
  avoidList: string;  // What NOT to include
  eraVehicles: string[];  // Suggested vehicle IDs for this era
}

// ============================================================================
// SUPERHERO COMIC STYLES (5 themes - automotive hero focus)
// Each theme can render as single cover OR 3-panel story based on composition
// ============================================================================

export const comicBookThemes: NostalgicThemeDefinition[] = [
  // 1950s Golden Age Superhero
  {
    id: 'comic-50s-golden-age',
    name: 'Golden Age Hero',
    category: 'nostalgic',
    era: '1950s',
    style: 'comic-book',
    shortDescription: 'Classic Superman-era heroic comic covers',
    previewColors: ['#FF0000', '#0000FF', '#FFD700', '#FFFFFF'],
    imagePrompt: {
      style: `1950s Golden Age superhero comic book style inspired by early Superman, Captain America, and Wonder Woman comics.
        This is PREMIUM AGENCY QUALITY - every detail matters.

        VISUAL TECHNIQUE:
        - Bold primary colors with FLAT areas of solid color (no gradients within color blocks)
        - Visible Ben-Day dots halftone pattern on skin tones, backgrounds, and shadows
        - HEAVY black ink outlines (3-4pt weight) around ALL elements
        - Four-color printing aesthetic: cyan, magenta, yellow, black only
        - Hand-painted illustration quality with visible brushwork confidence

        COMPOSITION OPTIONS:
        Option A - COMIC COVER: Single dramatic hero shot with the car as the heroic vehicle
        Option B - 3-PANEL STORY: Three horizontal panels showing Problem → Repair → Victory

        For 3-panel layout:
        Panel 1: Vehicle in distress (steam, flat tire, warning light) - worried expression
        Panel 2: Heroic mechanic action shot with tools, dynamic pose
        Panel 3: Triumphant vehicle, gleaming, owner celebrating`,
      colorPalette: `STRICT Golden Age palette:
        - Hero Red (#FF0000) - bold, confident, dominant
        - Justice Blue (#0000FF) - trustworthy, heroic accents
        - Victory Gold (#FFD700) - triumph, excellence, chrome
        - Pure White (#FFFFFF) - highlights, speed lines, purity
        - Heavy Black - outlines, shadows, drama

        Ben-Day dot colors: Pink dots for skin, Yellow dots for warmth, Cyan dots for cool shadows
        NO modern gradients. Colors are FLAT with dot patterns for shading.`,
      typography: `AUTHENTIC Golden Age lettering:
        - Bold sans-serif block letters, slightly condensed, with THICK black outlines
        - Headlines in ALL CAPS with dramatic 3D perspective shadow
        - Action words ("POW!", "ZOOM!", "FIXED!") in explosive starburst shapes
        - Speech bubbles: rounded corners, thick black outlines, confident tails
        - Title treatment: Large, heroic, often arched or with perspective
        - Taglines in smaller italic serif: "The Incredible Story of..."`,
      elements: `GOLDEN AGE VISUAL ELEMENTS:
        - Dramatic sunburst/radiating lines behind hero vehicle (like Superman poses)
        - Comic panel borders: thick black with slight rounded corners
        - Speed lines for motion (parallel lines indicating movement)
        - Starbursts and explosion shapes for impact moments
        - Heroic emblems and badges (shop logo as superhero emblem)
        - American flag motifs and patriotic elements subtle in background
        - "Comics Code" style approval stamp aesthetic in corner`,
      mood: `HEROIC, TRIUMPHANT, PATRIOTIC, UNSTOPPABLE.
        The vehicle is the HERO of this story - powerful, gleaming, victorious.
        The auto shop is the hero's secret base where miracles happen.
        Every repair is a VICTORY over the forces of breakdown and despair.
        Confidence radiates from every element. This shop SAVES THE DAY.`,
    },
    textPrompt: {
      tone: 'Heroic, triumphant, confident, American',
      vocabulary: ['mighty', 'powerful', 'saves the day', 'hero', 'amazing', 'incredible', 'victory', 'triumph'],
    },
    carStyle: `1950s HERO VEHICLE rendering:
      - Chrome GLEAMING like polished mirrors catching dramatic light
      - Fins and curves emphasized as heroic design elements
      - Low angle shots making the car look powerful and imposing
      - Vehicle posed heroically: three-quarter front view, slight upward tilt
      - Paint so perfect it reflects the sky and surroundings
      - The car should look like it could leap tall buildings`,
    composition: `GOLDEN AGE COMPOSITION:
      COVER FORMAT: Central heroic composition with car at dramatic 3/4 angle.
      Sunburst rays emanating from behind the vehicle. Bold panel border frame.
      Title at top with dramatic perspective. Tagline at bottom.

      3-PANEL FORMAT: Three equal horizontal panels stacked vertically.
      Clear visual storytelling: distress → action → triumph.
      Each panel has its own border with small gutters between.
      Captions in yellow boxes at top of each panel.`,
    avoidList: `ABSOLUTELY AVOID:
      - Realistic human faces (use heroic silhouettes or stylized figures)
      - Modern vehicles or design elements
      - Gradients or photorealistic rendering
      - Dark, gritty, or cynical themes
      - Minimalist design
      - Muted or desaturated colors
      - Contemporary fonts or digital effects`,
    eraVehicles: ['chevy-57', 'tbird-55', 'cadillac-59', 'corvette-58'],
    mockupScenes: ['comic book cover', 'newsstand display', 'collectors frame'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1960s Silver Age Marvel
  {
    id: 'comic-60s-marvel',
    name: 'Silver Age Marvel',
    category: 'nostalgic',
    era: '1960s',
    style: 'comic-book',
    shortDescription: 'Kirby crackle and dynamic Marvel action',
    previewColors: ['#FF0000', '#0000CD', '#FFD700', '#000000'],
    imagePrompt: {
      style: `1960s Silver Age Marvel Comics style - the Jack Kirby and Steve Ditko era.
        Spider-Man, Fantastic Four, X-Men aesthetic. PREMIUM AGENCY QUALITY.

        VISUAL TECHNIQUE:
        - "KIRBY CRACKLE" energy dots: clusters of black dots forming energy fields
        - EXTREME dynamic poses with dramatic foreshortening
        - Bold, muscular compositions that BURST from the panel
        - High contrast with heavy blacks pooling in shadows
        - Four-color printing with bold, saturated primaries
        - Figures and vehicles breaking panel borders for impact

        COMPOSITION OPTIONS:
        Option A - DYNAMIC COVER: Car bursting toward viewer with Kirby Crackle energy
        Option B - 3-PANEL ACTION: Dynamic story panels with Marvel-style excitement

        For 3-panel layout:
        Panel 1: Dramatic problem reveal with exclamation effects ("MY CAR!")
        Panel 2: Heroic mechanic in dynamic Kirby pose, tools like weapons
        Panel 3: Explosive success with "INCREDIBLE!" burst effects`,
      colorPalette: `AUTHENTIC Marvel Silver Age palette:
        - Marvel Red (#FF0000) - power, danger, excitement
        - Marvel Blue (#0000CD) - heroic, cosmic, trustworthy
        - Heroic Gold (#FFD700) - triumph, energy, chrome accents
        - Heavy Blacks - dramatic shadows, outlines, Kirby Crackle

        Four-color printing aesthetic with BOLD saturation.
        Shadows rendered with crosshatching or solid black pools.`,
      typography: `MARVEL SILVER AGE LETTERING:
        - Bold condensed sans-serif, often ITALICIZED for ACTION
        - Sound effects in explosive, jagged, dimensional letters
        - "THWAK!" "KRAKOOM!" "VROOOOM!" style exclamations
        - Marvel-style title treatment: bold outlines, slight 3D effect
        - Caption boxes: yellow backgrounds, dramatic narration
        - Word balloons: more angular than Golden Age, dynamic tails`,
      elements: `SILVER AGE MARVEL ELEMENTS:
        - KIRBY CRACKLE: clusters of black dots forming energy patterns
        - Dynamic action lines (concentrated speed lines)
        - Cosmic swirls and energy effects surrounding vehicles
        - Panel-BREAKING compositions (elements cross borders)
        - Dramatic foreshortening (car coming RIGHT AT viewer)
        - Explosive backgrounds with debris and energy
        - "Marvel Corner Box" style logo placement option`,
      mood: `POWERFUL, DYNAMIC, EXPLOSIVE, EPIC.
        Every oil change is an EPIC BATTLE against the forces of wear!
        Every repair is an INCREDIBLE TRIUMPH over mechanical villainy!
        The excitement is PALPABLE. The action is UNSTOPPABLE.
        Readers should feel the POWER radiating from the image.`,
    },
    textPrompt: {
      tone: 'Epic, powerful, action-packed, incredible',
      vocabulary: ['mighty', 'incredible', 'unstoppable', 'power', 'battle', 'triumph', 'amazing', 'spectacular'],
    },
    carStyle: `1960s MUSCLE CAR as Marvel hero vehicle:
      - Dynamic pose with EXTREME foreshortening (front grille huge, rear small)
      - Kirby Crackle energy surrounding the vehicle
      - Low angle making the car look MASSIVE and powerful
      - Vehicle should appear to be BURSTING from the panel
      - Chrome and paint reflecting cosmic energy
      - Aggressive stance: wheels turned, ready for action`,
    composition: `MARVEL SILVER AGE COMPOSITION:
      COVER FORMAT: Dramatic foreshortening with car coming toward viewer.
      Kirby Crackle dots as energy field background. Diagonal panel borders.
      Title at top breaking conventional placement. Action-packed density.

      3-PANEL FORMAT: Each panel BURSTING with energy and motion.
      Elements breaking panel borders for impact. Overlapping compositions.
      Speed lines and energy effects connecting panels.`,
    avoidList: `ABSOLUTELY AVOID:
      - Static, posed compositions
      - Minimal or quiet design
      - Realistic photographic rendering
      - Soft or muted colors
      - Modern vehicles
      - Calm, peaceful imagery
      - Empty negative space`,
    eraVehicles: ['mustang-67', 'camaro-69', 'charger-68', 'corvette-63'],
    mockupScenes: ['spinner rack', 'collectors wall', 'comic shop display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1970s Bronze Age Street Hero
  {
    id: 'comic-70s-bronze-age',
    name: 'Bronze Age Street Hero',
    category: 'nostalgic',
    era: '1970s',
    style: 'comic-book',
    shortDescription: 'Gritty urban heroes and street-level action',
    previewColors: ['#8B4513', '#4A4A4A', '#FF6600', '#1C1C1C'],
    imagePrompt: {
      style: `1970s Bronze Age Comics style - Luke Cage, Iron Fist, The Punisher era.
        Grittier, more realistic than Silver Age. Street-level heroism.
        Neal Adams influenced realistic anatomy and dramatic lighting.
        PREMIUM AGENCY QUALITY - sophisticated and mature.

        VISUAL TECHNIQUE:
        - More realistic proportions than Silver Age (still stylized)
        - Heavy use of shadow and dramatic lighting contrasts
        - Urban environments: streetlights, neon signs, city textures
        - Earthier, muted color palette with strategic bright accents
        - Detailed cross-hatching for shadows and texture
        - Social relevance themes: working class heroes

        COMPOSITION OPTIONS:
        Option A - STREET COVER: Urban hero shot with city backdrop, dramatic lighting
        Option B - 3-PANEL NOIR: Street-level story with film noir influences

        For 3-panel layout:
        Panel 1: Night scene, vehicle breakdown under harsh streetlight
        Panel 2: Mechanic as street hero, determined expression, urban backdrop
        Panel 3: Dawn breaking, vehicle restored, neighborhood saved`,
      colorPalette: `BRONZE AGE URBAN PALETTE:
        - Street Brown (#8B4513) - gritty, real, working class
        - Urban Gray (#4A4A4A) - concrete, steel, city life
        - Warning Orange (#FF6600) - streetlights, danger, highlights
        - Shadow Black (#1C1C1C) - noir shadows, drama, mystery

        Earthier, more subdued than Silver Age but with PUNCH.
        Strategic use of bright colors for impact moments.`,
      typography: `BRONZE AGE MATURE LETTERING:
        - Less exclamation-heavy, more sophisticated
        - Bold but grounded fonts, realistic text styling
        - Narrative captions: serious, literary quality
        - Sound effects: still bold but more integrated
        - Title treatments: bold, urban, no-nonsense
        - Speech: more natural dialogue patterns`,
      elements: `BRONZE AGE STREET ELEMENTS:
        - City streets with texture and character
        - Dramatic streetlight pools and neon glows
        - Urban decay details: graffiti hints, worn surfaces
        - Chain link fences, brick walls, fire escapes
        - Realistic vehicles in authentic urban settings
        - Working class tools and environments
        - Night scenes with film noir lighting`,
      mood: `GRITTY, DETERMINED, STREET-LEVEL, REAL.
        Your NEIGHBORHOOD mechanic fighting the good fight.
        Blue collar heroism - honest work, real results.
        The shop is a refuge in the urban jungle.
        Authentic, tough, but ultimately hopeful.`,
    },
    textPrompt: {
      tone: 'Gritty, determined, street-wise, authentic',
      vocabulary: ['street', 'tough', 'real', 'honest', 'fight', 'neighborhood', 'trusted', 'reliable'],
    },
    carStyle: `1970s MUSCLE CAR as street hero vehicle:
      - Realistic rendering with dramatic urban lighting
      - Streetlight reflections on chrome and paint
      - Working class hero vehicle: powerful but accessible
      - Night scenes with pools of light and deep shadows
      - Authentic urban environment (parking lots, streets)
      - Some wear and character showing - this car has stories`,
    composition: `BRONZE AGE STREET COMPOSITION:
      COVER FORMAT: Street-level perspective, urban backdrop visible.
      Dramatic lighting from streetlamps creating pools and shadows.
      More realistic proportions, film noir influences.

      3-PANEL FORMAT: Cinematic storytelling like a graphic novel.
      Wide establishing shots mixed with close character moments.
      Lighting tells the emotional story across panels.`,
    avoidList: `ABSOLUTELY AVOID:
      - Bright, cheerful, suburban imagery
      - Cosmic or fantasy elements
      - Cute or cartoonish rendering
      - Clean, sterile environments
      - Daytime-only settings
      - Unrealistic lighting`,
    eraVehicles: ['challenger-71', 'trans-am-77', 'cuda-70', 'el-camino-72'],
    mockupScenes: ['urban newsstand', 'city street', 'warehouse wall'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1980s Dark Knight Style
  {
    id: 'comic-80s-dark-knight',
    name: 'Dark Knight Returns',
    category: 'nostalgic',
    era: '1980s',
    style: 'comic-book',
    shortDescription: 'Frank Miller noir with dramatic shadows',
    previewColors: ['#1a1a2e', '#16213e', '#FFD700', '#8B0000'],
    imagePrompt: {
      style: `Frank Miller's Dark Knight Returns style - the comic that changed everything.
        Heavy black inks, stark light/shadow contrast, rain-soaked urban noir.
        PREMIUM AGENCY QUALITY - bold, cinematic, unforgettable.

        VISUAL TECHNIQUE:
        - HEAVY black ink dominates - 60-70% of image can be shadow
        - Stark contrast: pure white highlights against deep blacks
        - Rain streaks rendered as white lines against dark
        - Lightning provides dramatic backlighting moments
        - Angular, aggressive panel compositions
        - Minimal color with maximum impact
        - Silhouettes against dramatic light sources

        COMPOSITION OPTIONS:
        Option A - NOIR COVER: Silhouette composition with dramatic backlighting
        Option B - 3-PANEL DARK STORY: Noir narrative with Miller's signature style

        For 3-panel layout:
        Panel 1: Storm gathering, vehicle in shadow, sense of dread
        Panel 2: LIGHTNING STRIKE moment - action revealed in flash
        Panel 3: Aftermath - calm after storm, vehicle triumphant in new light`,
      colorPalette: `DARK KNIGHT MINIMAL PALETTE:
        - Deep Black (#1a1a2e, #16213e) - DOMINANT, pooling shadows
        - Lightning Yellow (#FFD700) - STRATEGIC accent, lightning, hope
        - Blood Red (#8B0000) - danger, power, dramatic moments
        - Stark White - lightning, rain, highlights only

        90% of the image should be blacks and near-blacks.
        Color is RARE and therefore POWERFUL when used.`,
      typography: `DARK KNIGHT BOLD LETTERING:
        - Bold condensed sans-serif, slightly tilted for tension
        - Hand-lettered appearance with ROUGH edges
        - Text boxes: sharp corners, no rounded edges, stark
        - Sound effects: angular, explosive, debris-like
        - Minimal text - let the images speak
        - Title treatment: bold, simple, ICONIC`,
      elements: `DARK KNIGHT NOIR ELEMENTS:
        - Rain streaks: white lines against dark backgrounds
        - Lightning bolts providing dramatic illumination
        - City skyline silhouettes against stormy sky
        - Dramatic spotlights cutting through darkness
        - Cracked concrete, urban decay textures
        - Wet surfaces reflecting light pools
        - Stark silhouettes with minimal detail`,
      mood: `INTENSE, DRAMATIC, POWERFUL, NOIR.
        A sense of urban JUSTICE and unstoppable FORCE.
        Dark but ultimately HEROIC - the light always breaks through.
        The storm represents problems; the vehicle emerges VICTORIOUS.
        Cinematic drama in every frame.`,
    },
    textPrompt: {
      tone: 'Intense, dramatic, powerful, redemptive',
      vocabulary: ['justice', 'power', 'unstoppable', 'legendary', 'returns', 'rises', 'darkness', 'light'],
    },
    carStyle: `1980s VEHICLE as Dark Knight machine:
      - Aggressive silhouette emerging from shadows
      - Menacing headlights cutting through rain/darkness
      - Low angle making the car look like a WEAPON
      - Wet surfaces reflecting dramatic light sources
      - Angular, aggressive stance
      - The car should feel DANGEROUS and POWERFUL`,
    composition: `DARK KNIGHT NOIR COMPOSITION:
      COVER FORMAT: Silhouette-heavy with dramatic backlighting.
      Lightning or spotlight providing the key light source.
      Strong diagonal compositions creating tension.

      3-PANEL FORMAT: Cinematic pacing like a film sequence.
      Light and shadow tell the story. Minimal text needed.
      Each panel a dramatic photograph in ink.`,
    avoidList: `ABSOLUTELY AVOID:
      - Bright cheerful colors
      - Cute or friendly elements
      - Rounded, soft fonts
      - Daytime sunny scenes
      - Pastoral or suburban settings
      - Busy, cluttered compositions
      - Light-dominant images`,
    eraVehicles: ['gnx-87', 'corvette-85', 'countach'],
    mockupScenes: ['rain-soaked street', 'dark alley', 'urban noir'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1980s Neon Action Comics
  {
    id: 'comic-80s-neon-action',
    name: 'Neon Action',
    category: 'nostalgic',
    era: '1980s',
    style: 'comic-book',
    shortDescription: 'Explosive neon and chrome 80s action',
    previewColors: ['#FF00FF', '#00FFFF', '#FF6600', '#1C1C1C'],
    imagePrompt: {
      style: `1980s Neon Action Comics style - action movie adaptations, G.I. Joe, Transformers era.
        Bright neons on dark backgrounds, chrome effects, EXPLOSIVE action.
        PREMIUM AGENCY QUALITY - maximum impact, blockbuster energy.

        VISUAL TECHNIQUE:
        - NEON colors glowing against dark backgrounds
        - Chrome and metallic effects on vehicles and text
        - Laser beams, explosions, speed effects
        - High contrast: dark shadows with neon highlights
        - Action movie comic adaptation aesthetic
        - Everything moving, nothing static

        COMPOSITION OPTIONS:
        Option A - EXPLOSIVE COVER: Neon-drenched action shot with chrome title
        Option B - 3-PANEL BLOCKBUSTER: Movie-style action sequence

        For 3-panel layout:
        Panel 1: Vehicle in trouble, dramatic neon lighting, tension building
        Panel 2: EXPLOSIVE ACTION - sparks, tools, neon energy everywhere
        Panel 3: Victory pose, chrome gleaming, neon celebration effects`,
      colorPalette: `80s NEON ACTION PALETTE:
        - Hot Neon Pink (#FF00FF) - electric, exciting, 80s energy
        - Electric Cyan (#00FFFF) - cool neon, tech, speed
        - Action Orange (#FF6600) - explosions, sparks, heat
        - Night Black (#1C1C1C) - dark backgrounds for neon contrast
        - Chrome Silver - metallic reflections, 80s luxury

        Neons should GLOW against dark backgrounds.
        Chrome effects on text and vehicle highlights.`,
      typography: `80s ACTION LETTERING:
        - Chrome 3D letters with NEON GLOW outlines
        - Bold italics suggesting SPEED and motion
        - Explosive sound effects: "MAXIMUM!" "TURBO!" "POWER!"
        - Movie poster style titles with metallic sheen
        - Text that looks like it could be on an action figure box
        - Laser-style underlines and accents`,
      elements: `NEON ACTION ELEMENTS:
        - Laser beams and neon light trails
        - Explosions with orange/yellow centers
        - Chrome surfaces catching neon reflections
        - Speed lines in neon colors
        - Sparks and debris flying
        - Tech/gadget aesthetic hints
        - 80s grid patterns as backgrounds`,
      mood: `HIGH-OCTANE, EXPLOSIVE, MAXIMUM, TURBO.
        Your car gets BLOCKBUSTER treatment!
        Every service is an ACTION SEQUENCE.
        EXTREME excitement, MAXIMUM power, ULTIMATE results.
        This is the 80s turned up to ELEVEN.`,
    },
    textPrompt: {
      tone: 'Explosive, extreme, maximum, turbo',
      vocabulary: ['maximum', 'turbo', 'power', 'action', 'extreme', 'blast', 'ultimate', 'mega'],
    },
    carStyle: `1980s SPORTS CAR as action hero vehicle:
      - Neon lights reflecting off chrome and glossy paint
      - Speed lines and motion blur suggesting movement
      - Explosions or sparks in background
      - Dynamic angle with aggressive stance
      - Chrome and glass catching dramatic light
      - The car should look like it's FROM an action movie`,
    composition: `NEON ACTION COMPOSITION:
      COVER FORMAT: Dynamic diagonal with neon energy flowing.
      Explosions in background, vehicle BURSTING forward.
      Chrome title treatment at top or bottom.

      3-PANEL FORMAT: Movie storyboard pacing.
      Each panel escalates the action intensity.
      Neon effects connect panels visually.`,
    avoidList: `ABSOLUTELY AVOID:
      - Muted, desaturated colors
      - Static, posed compositions
      - Quiet, calm imagery
      - Vintage nostalgic softness
      - Minimal design aesthetic
      - Slow or peaceful feeling`,
    eraVehicles: ['testarossa', 'countach', 'corvette-85', 'gnx-87'],
    mockupScenes: ['arcade', 'video store', 'action figure display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// AUTOMOTIVE MOVIE POSTER STYLES (7 themes - car-focused films only)
// ============================================================================

export const moviePosterThemes: NostalgicThemeDefinition[] = [
  // 1950s Drive-In
  {
    id: 'poster-50s-drive-in',
    name: 'Drive-In Double Feature',
    category: 'nostalgic',
    era: '1950s',
    style: 'movie-poster',
    shortDescription: 'Classic drive-in movie poster excitement',
    previewColors: ['#FF0000', '#FFFF00', '#000000', '#00FF00'],
    imagePrompt: {
      style: `1950s Drive-In Movie poster style - the golden age of car culture cinema.
        Hot rods, teenage rebellion, AUTOMOTIVE DRAMA. PREMIUM AGENCY QUALITY.

        VISUAL TECHNIQUE:
        - Hand-painted illustration style with confident brushwork
        - Lurid, saturated colors that POP in outdoor theater lighting
        - Dramatic beams of light (car headlights, spotlights)
        - Cars as STARS of the movie, prominently featured
        - Theatrical staging with multiple dramatic elements
        - Classic movie poster composition with billing block

        AUTOMOTIVE FOCUS:
        - The CAR is the main attraction
        - Hot rods, custom cars, racing machines
        - Dramatic automotive action: races, chases, burnouts
        - Car culture as EXCITING and DRAMATIC`,
      colorPalette: `DRIVE-IN DRAMATIC PALETTE:
        - Screaming Red (#FF0000) - danger, excitement, hot rods
        - Warning Yellow (#FFFF00) - headlights, attention, drama
        - Night Black (#000000) - outdoor theater sky, shadows
        - Chrome highlights and flame effects

        Colors should be SATURATED to read at distance.
        High contrast for outdoor visibility.`,
      typography: `DRIVE-IN POSTER LETTERING:
        - Screaming ALL-CAPS headlines at dramatic angles
        - Multiple fonts competing for attention (period authentic)
        - 3D shadow effects on titles
        - "SEE!" "THRILL!" "EXPERIENCE!" callouts
        - Billing block at bottom with credits
        - Taglines that DEMAND attention`,
      elements: `DRIVE-IN POSTER ELEMENTS:
        - Dramatic headlight beams cutting through darkness
        - Classic cars prominently featured as heroes
        - Racing/action scenes suggested
        - Multiple dramatic moments composed together
        - Stars/credits in classic billing block style
        - "IN BLAZING COLOR!" type badges`,
      mood: `DRAMATIC, EXCITING, AUTOMOTIVE PASSION.
        The thrill of hot rods and open roads!
        Car culture as ADVENTURE and ROMANCE.
        Your shop: where automotive dreams come true.`,
    },
    textPrompt: {
      tone: 'Dramatic, thrilling, automotive excitement',
      vocabulary: ['thrill', 'incredible', 'amazing', 'speed', 'power', 'see', 'experience'],
    },
    carStyle: `1950s CAR as movie star:
      - Hero shot with dramatic lighting
      - Hot rod or custom car aesthetic
      - Flames, chrome, lowered stance
      - Dramatic angles suggesting speed and power
      - The car should look like a MOVIE STAR`,
    composition: `DRIVE-IN POSTER COMPOSITION:
      Classic movie poster layout with dramatic central image.
      Title at top with shadow and dimension.
      Billing block at bottom. Multiple elements composed for drama.`,
    avoidList: `Minimal design, subtle colors, modern vehicles,
      corporate sterility, small quiet text.`,
    eraVehicles: ['chevy-57', 'cadillac-59', 'tbird-55', 'mercury-49'],
    mockupScenes: ['drive-in screen', 'movie theater lobby', 'vintage poster display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1950s Rebel
  {
    id: 'poster-50s-rebel',
    name: 'Rebel Hot Rod',
    category: 'nostalgic',
    era: '1950s',
    style: 'movie-poster',
    shortDescription: 'James Dean cool meets hot rod culture',
    previewColors: ['#DC143C', '#000000', '#F5F5DC', '#4169E1'],
    imagePrompt: {
      style: `1950s Teenage Rebel movie poster - Rebel Without a Cause meets hot rod culture.
        James Dean cool, leather jacket silhouettes, AUTOMOTIVE REBELLION.
        PREMIUM AGENCY QUALITY - iconic and timeless.

        VISUAL TECHNIQUE:
        - Moody, dramatic lighting with strong shadows
        - Red and blue gels creating tension
        - Silhouettes and brooding poses
        - Hand-painted movie poster illustration
        - The car as symbol of FREEDOM and REBELLION

        AUTOMOTIVE FOCUS:
        - Hot rods and custom cars as rebellion symbols
        - Chicken run drama (cars racing toward cliff)
        - Night racing scenes
        - The car represents ESCAPE and IDENTITY`,
      colorPalette: `REBEL MOODY PALETTE:
        - Rebel Red (#DC143C) - passion, danger, hot rod flames
        - Leather Black (#000000) - jackets, night, rebellion
        - Cream (#F5F5DC) - T-shirts, innocence, contrast
        - Denim Blue (#4169E1) - jeans, sky, melancholy

        Dramatic, moody color with high contrast.
        The palette of a restless generation.`,
      typography: `REBEL POSTER LETTERING:
        - Bold dramatic titles with rebellious energy
        - Hand-painted movie poster style
        - Stars' names in elegant dramatic placement
        - Taglines with attitude: "They live fast..."
        - Slightly rough, imperfect letter edges`,
      elements: `REBEL POSTER ELEMENTS:
        - Leather jacket silhouettes (no detailed faces)
        - Pompadour hair shadows
        - Classic hot rods and customs
        - Night racing scenes
        - Cliff edges and danger
        - Street light pools`,
      mood: `COOL, REBELLIOUS, MISUNDERSTOOD, FREE.
        The auto shop for those who don't follow the crowd.
        Authentic rebel spirit - real service, no pretense.
        Your car is your FREEDOM.`,
    },
    textPrompt: {
      tone: 'Cool, rebellious, authentic, free',
      vocabulary: ['rebel', 'real', 'cool', 'ride', 'wild', 'free', 'live', 'fast'],
    },
    carStyle: `1950s HOT ROD as rebellion symbol:
      - Low and mean stance
      - Dramatic moody lighting
      - Flames or custom paint
      - The car as ESCAPE vehicle
      - Positioned for action (racing, chicken run)`,
    composition: `REBEL POSTER COMPOSITION:
      Dramatic portrait style with car as co-star.
      Moody lighting with figure silhouettes.
      Classic movie poster layout with attitude.`,
    avoidList: `Happy family imagery, corporate feeling, bright cheerful colors,
      conservative design, safe messaging.`,
    eraVehicles: ['mercury-49', 'chevy-57', 'tbird-55'],
    mockupScenes: ['teen hangout', 'malt shop', 'drive-in'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1960s Racing Film
  {
    id: 'poster-60s-racing',
    name: 'Grand Prix Racing',
    category: 'nostalgic',
    era: '1960s',
    style: 'movie-poster',
    shortDescription: 'Le Mans and Grand Prix racing drama',
    previewColors: ['#DC143C', '#FFFFFF', '#000000', '#FFD700'],
    imagePrompt: {
      style: `1960s Racing Movie poster - Le Mans, Grand Prix, Winning era.
        International racing glamour, speed, danger, victory.
        PREMIUM AGENCY QUALITY - cinematic and prestigious.

        VISUAL TECHNIQUE:
        - Cinematic widescreen composition feeling
        - Speed blur and motion effects
        - Racing stripe graphics integrated into design
        - Painted illustration with photographic realism hints
        - Multiple racing scenes composed together
        - Victory and danger both present

        AUTOMOTIVE FOCUS:
        - Racing cars as heroes (GT40, Ferrari, etc. style)
        - Track action: straightaways, corners, pit stops
        - Checkered flag victory moments
        - The drama of professional motorsport`,
      colorPalette: `RACING PRESTIGIOUS PALETTE:
        - Racing Red (#DC143C) - Ferrari, speed, passion
        - Pure White (#FFFFFF) - racing stripes, purity, excellence
        - Night Black (#000000) - tires, shadows, drama
        - Trophy Gold (#FFD700) - victory, champagne, achievement

        Clean, prestigious colors of international racing.`,
      typography: `RACING FILM LETTERING:
        - Elegant, prestigious fonts befitting international cinema
        - Title with speed lines or racing stripe integration
        - European film poster sophistication
        - Cast names with international flair
        - Taglines about speed, danger, victory`,
      elements: `RACING POSTER ELEMENTS:
        - Racing cars in dynamic action shots
        - Checkered flags and victory podiums
        - Track elements: corners, straightaways
        - Speed blur and motion lines
        - International racing atmosphere
        - Pit crew action hints`,
      mood: `PRESTIGIOUS, THRILLING, VICTORIOUS, INTERNATIONAL.
        Racing-bred service and precision.
        The drama of competition, the glory of victory.
        Your car receives CHAMPIONSHIP-level care.`,
    },
    textPrompt: {
      tone: 'Prestigious, thrilling, victorious, professional',
      vocabulary: ['racing', 'victory', 'champion', 'speed', 'precision', 'excellence', 'winner'],
    },
    carStyle: `1960s RACING CAR as champion:
      - Dynamic speed shot with motion blur
      - Racing livery and numbers
      - Low angle emphasizing speed and power
      - Track environment surrounding
      - Victory pose or racing action`,
    composition: `RACING POSTER COMPOSITION:
      Widescreen cinematic feeling. Racing action central.
      Multiple moments of drama composed together.
      Prestigious international film poster layout.`,
    avoidList: `Casual street scenes, slow imagery, non-racing vehicles,
      amateur aesthetic, static compositions.`,
    eraVehicles: ['corvette-63', 'mustang-67', 'gto-65', 'camaro-69'],
    mockupScenes: ['racing museum', 'dealership', 'motorsport event'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1970s Road Movie
  {
    id: 'poster-70s-road-movie',
    name: 'Open Road',
    category: 'nostalgic',
    era: '1970s',
    style: 'movie-poster',
    shortDescription: 'Easy Rider freedom and highway adventure',
    previewColors: ['#DAA520', '#87CEEB', '#8B4513', '#F5F5DC'],
    imagePrompt: {
      style: `1970s Road Movie poster - Easy Rider, Vanishing Point, Two-Lane Blacktop.
        Open highways, desert freedom, American soul searching.
        PREMIUM AGENCY QUALITY - cinematic and iconic.

        VISUAL TECHNIQUE:
        - Wide landscape format feeling
        - Golden hour lighting (sunset/sunrise)
        - Dust and atmosphere creating depth
        - Natural, earthy color palette
        - The CAR as freedom symbol
        - Vanishing point highway compositions

        AUTOMOTIVE FOCUS:
        - Muscle cars on open highways
        - Desert roads stretching to horizon
        - The car as ESCAPE and FREEDOM
        - Road trip romance and adventure`,
      colorPalette: `ROAD MOVIE NATURAL PALETTE:
        - Desert Gold (#DAA520) - sunset, sand, warmth
        - Open Sky Blue (#87CEEB) - freedom, endless sky
        - Road Dust Brown (#8B4513) - earth, authenticity
        - Cream (#F5F5DC) - clouds, light, hope

        Natural, earthy, cinematic warmth.
        The palette of the American Southwest.`,
      typography: `ROAD MOVIE LETTERING:
        - Free-spirited fonts, often hand-painted appearance
        - Road sign influences and highway marker styles
        - Journey-focused text with open spacing
        - Taglines about freedom, roads, journeys
        - Organic, natural letter forms`,
      elements: `ROAD MOVIE ELEMENTS:
        - Open highways stretching to horizon
        - Desert landscapes and rock formations
        - Vintage gas stations and motels
        - Dust clouds trailing behind vehicles
        - Big sky country panoramas
        - Freedom imagery: birds, open spaces`,
      mood: `FREE, ADVENTUROUS, SOUL-SEARCHING, AUTHENTIC.
        The open road calls. Your car's journey to freedom.
        Road trip ready service.
        The romance of the American highway.`,
    },
    textPrompt: {
      tone: 'Free, adventurous, authentic, journeying',
      vocabulary: ['freedom', 'road', 'journey', 'ride', 'open', 'horizon', 'soul', 'escape'],
    },
    carStyle: `1970s MUSCLE CAR as freedom machine:
      - On open highway, dust trailing
      - Golden hour lighting
      - Low angle emphasizing power and freedom
      - Desert or rural landscape setting
      - The car is ESCAPE personified`,
    composition: `ROAD MOVIE COMPOSITION:
      Wide landscape format. Open road stretching to horizon.
      Car as symbol of freedom in vast landscape.
      Big sky country panoramic feeling.`,
    avoidList: `Urban settings, corporate imagery, confined spaces,
      mainstream commercial aesthetic, claustrophobic compositions.`,
    eraVehicles: ['challenger-71', 'trans-am-77', 'el-camino-72', 'cuda-70'],
    mockupScenes: ['roadside diner', 'gas station', 'motel office'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1970s Trucker Film
  {
    id: 'poster-70s-trucker',
    name: 'Trucker Legend',
    category: 'nostalgic',
    era: '1970s',
    style: 'movie-poster',
    shortDescription: 'Smokey and the Bandit highway action',
    previewColors: ['#000000', '#FFD700', '#DC143C', '#4169E1'],
    imagePrompt: {
      style: `1970s Trucker Movie poster - Smokey and the Bandit, Convoy, White Line Fever.
        Highway outlaws, CB radio culture, American trucking adventure.
        PREMIUM AGENCY QUALITY - fun, rebellious, iconic.

        VISUAL TECHNIQUE:
        - Action-packed highway scenes
        - Chrome and lights gleaming
        - CB radio culture visual elements
        - The Trans Am and the Truck as heroes
        - Highway pursuit drama
        - Southern United States atmosphere

        AUTOMOTIVE FOCUS:
        - Trans Am style vehicles as outlaw heroes
        - Big rigs as supporting characters
        - Highway chase scenes
        - Smokey (police) as antagonist hints`,
      colorPalette: `TRUCKER OUTLAW PALETTE:
        - Bandit Black (#000000) - Trans Am, rebellion, cool
        - Screaming Eagle Gold (#FFD700) - Trans Am bird, chrome, glory
        - Red (#DC143C) - tail lights, Coors, action
        - Highway Blue (#4169E1) - sky, police lights, contrast

        Bold, fun, American highway colors.`,
      typography: `TRUCKER MOVIE LETTERING:
        - Bold, fun, slightly playful fonts
        - CB radio handle style text treatments
        - Southern flair in lettering
        - "Eastbound and down..." tagline style
        - Stars' names in prominent placement
        - Action movie excitement in typography`,
      elements: `TRUCKER POSTER ELEMENTS:
        - Trans Am with golden eagle
        - Big rig trucks in pursuit/convoy
        - Highway bridges and overpasses
        - Police cars in chase formation
        - CB radio antenna hints
        - Southern landscape elements`,
      mood: `FUN, REBELLIOUS, OUTLAW COOL, AMERICAN.
        Highway heroes who play by their own rules.
        Fast service with a smile and a story.
        The legend of the open highway.`,
    },
    textPrompt: {
      tone: 'Fun, rebellious, legendary, fast',
      vocabulary: ['legend', 'outlaw', 'highway', 'fast', 'eastbound', 'convoy', 'bandit', 'ride'],
    },
    carStyle: `1970s TRANS AM as outlaw hero:
      - Black and gold glory
      - Action shot: jumping, speeding, sliding
      - Highway setting with drama
      - Chrome and lights gleaming
      - The coolest car on the road`,
    composition: `TRUCKER POSTER COMPOSITION:
      Action-packed highway scene. Trans Am as star.
      Pursuit elements create tension and excitement.
      Fun, blockbuster energy throughout.`,
    avoidList: `Serious/dark tone, non-American settings, slow imagery,
      corporate sterility, non-automotive focus.`,
    eraVehicles: ['trans-am-77', 'challenger-71', 'el-camino-72'],
    mockupScenes: ['truck stop', 'diner', 'highway rest area'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1970s Car Chase Film
  {
    id: 'poster-70s-chase',
    name: 'Car Chase Cinema',
    category: 'nostalgic',
    era: '1970s',
    style: 'movie-poster',
    shortDescription: 'Bullitt and Vanishing Point chase drama',
    previewColors: ['#2F4F4F', '#000000', '#FFD700', '#DC143C'],
    imagePrompt: {
      style: `1970s Car Chase Movie poster - Bullitt, The French Connection, Vanishing Point.
        Urban or highway chase drama, serious automotive action.
        PREMIUM AGENCY QUALITY - gritty, real, intense.

        VISUAL TECHNIQUE:
        - Gritty, realistic action feeling
        - Urban streets or desert highways
        - Motion blur and speed effects
        - Serious, adult tone
        - The car as protagonist in life-or-death drama
        - San Francisco hills or desolate highways

        AUTOMOTIVE FOCUS:
        - Muscle cars in SERIOUS pursuit
        - Driving skill as heroism
        - Real stunts, real danger feeling
        - The car chase as ART form`,
      colorPalette: `CHASE FILM GRITTY PALETTE:
        - Highland Green (#2F4F4F) - Bullitt Mustang, sophistication
        - Asphalt Black (#000000) - tires, streets, danger
        - Chrome Gold (#FFD700) - badges, trim, quality
        - Tail Light Red (#DC143C) - brake lights, danger, stop

        Sophisticated, gritty, realistic tones.
        Adult crime drama palette.`,
      typography: `CHASE FILM LETTERING:
        - Sophisticated, serious fonts
        - Thriller movie typography
        - Stars' names prominently placed
        - Minimal, impactful taglines
        - No cartoonish elements
        - Quality thriller aesthetic`,
      elements: `CHASE POSTER ELEMENTS:
        - Muscle cars at speed through city/desert
        - San Francisco hills or desert highways
        - Motion blur suggesting dangerous speed
        - Urban architecture or open landscapes
        - Gun metal and chrome details
        - Serious, adult drama tone`,
      mood: `INTENSE, SKILLED, SERIOUS, LEGENDARY.
        When you need serious automotive expertise.
        Professional-grade service for serious drivers.
        The precision that saves lives.`,
    },
    textPrompt: {
      tone: 'Intense, professional, serious, expert',
      vocabulary: ['precision', 'skill', 'professional', 'expert', 'chase', 'pursuit', 'legendary'],
    },
    carStyle: `1970s MUSCLE CAR in serious pursuit:
      - Motion blur and speed
      - Urban or highway chase setting
      - Highland green, white, or other classic chase film colors
      - Serious, not playful
      - The car as instrument of survival`,
    composition: `CHASE POSTER COMPOSITION:
      Dynamic speed composition. Car in motion central.
      Urban or highway environment creating tension.
      Adult thriller sophistication throughout.`,
    avoidList: `Cartoonish action, family-friendly tone, static poses,
      non-automotive focus, amateur aesthetic.`,
    eraVehicles: ['challenger-71', 'cuda-70', 'trans-am-77', 'el-camino-72'],
    mockupScenes: ['theater lobby', 'urban street', 'sophisticated office'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1980s Blockbuster Action
  {
    id: 'poster-80s-blockbuster',
    name: 'Blockbuster Action',
    category: 'nostalgic',
    era: '1980s',
    style: 'movie-poster',
    shortDescription: 'Schwarzenegger-era explosions and chrome',
    previewColors: ['#FF6600', '#000000', '#FFD700', '#DC143C'],
    imagePrompt: {
      style: `1980s Blockbuster Action Movie poster - Schwarzenegger, Stallone, Die Hard era.
        Explosions, muscles, machines, PURE ACTION. Drew Struzan painted style.
        PREMIUM AGENCY QUALITY - maximum impact, summer blockbuster energy.

        VISUAL TECHNIQUE:
        - Drew Struzan influenced painted illustration
        - Explosions and fire as background elements
        - Chrome and metallic title treatments
        - Hero poses with vehicles
        - Action montage composition
        - Bold, saturated colors that POP

        AUTOMOTIVE FOCUS:
        - Sports cars and trucks as action hero vehicles
        - Vehicles jumping, crashing through explosions
        - Chrome and muscle aesthetic
        - The car as WEAPON and TOOL`,
      colorPalette: `BLOCKBUSTER ACTION PALETTE:
        - Explosion Orange (#FF6600) - fire, explosions, action
        - Shadow Black (#000000) - dramatic contrast, night scenes
        - Hero Gold (#FFD700) - chrome, titles, victory
        - Blood Red (#DC143C) - danger, power, intensity

        Bold, saturated SUMMER BLOCKBUSTER colors.`,
      typography: `BLOCKBUSTER LETTERING:
        - Bold CHROME or METALLIC 3D titles
        - Action movie fonts with fire/explosion effects
        - Taglines that sound like one-liners
        - Stars' names in powerful placement
        - "CONSIDER THIS SERVICE TERMINATED" energy`,
      elements: `BLOCKBUSTER POSTER ELEMENTS:
        - Explosions (MANDATORY)
        - Fire and smoke effects
        - Hero vehicles in action poses
        - Muscular, powerful aesthetic
        - Action montage composition
        - Sweat, steel, and chrome`,
      mood: `EXPLOSIVE, POWERFUL, UNSTOPPABLE, MAXIMUM.
        Consider your car problems TERMINATED.
        I'll be back... with your car FIXED.
        Action hero level automotive service.`,
    },
    textPrompt: {
      tone: 'Explosive, powerful, unstoppable, legendary',
      vocabulary: ['terminate', 'unstoppable', 'power', 'action', 'maximum', 'ultimate', 'legend'],
    },
    carStyle: `1980s ACTION HERO VEHICLE:
      - Sports car or truck as action star
      - Explosions in background
      - Dynamic action pose
      - Chrome gleaming through smoke
      - The car should look DANGEROUS and POWERFUL`,
    composition: `BLOCKBUSTER POSTER COMPOSITION:
      Drew Struzan style painted montage.
      Hero vehicle central with explosions surrounding.
      Action elements filling every corner.`,
    avoidList: `Quiet scenes, subtle imagery, minimal action,
      non-heroic positioning, muted colors.`,
    eraVehicles: ['gnx-87', 'testarossa', 'corvette-85', 'countach'],
    mockupScenes: ['movie theater', 'video store', 'bedroom poster wall'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// CLASSIC AUTO ADVERTISING STYLES (4 themes - NEW CATEGORY)
// ============================================================================

export const advertisingThemes: NostalgicThemeDefinition[] = [
  // 1950s Service Station Ad
  {
    id: 'ad-50s-service-station',
    name: 'Vintage Service Station',
    category: 'nostalgic',
    era: '1950s',
    style: 'advertising',
    shortDescription: 'Texaco-style friendly attendant service',
    previewColors: ['#FF0000', '#FFFFFF', '#228B22', '#FFD700'],
    imagePrompt: {
      style: `1950s Service Station Advertisement - Texaco, Shell, Gulf Oil era.
        Friendly uniformed attendants, full service gasoline, TRUST and RELIABILITY.
        PREMIUM AGENCY QUALITY - warm, professional, nostalgic excellence.

        VISUAL TECHNIQUE:
        - Warm, inviting illustration style
        - Clean, professional service imagery
        - Friendly attendant figures (stylized, not photorealistic faces)
        - Retro gas pumps and service station architecture
        - "Full Service" premium care aesthetic
        - Classic automotive advertising illustration quality

        ADVERTISING FOCUS:
        - The SERVICE EXPERIENCE is the hero
        - Trust, reliability, neighborhood care
        - "Your friendly neighborhood" warmth
        - Clean uniforms, clean facilities, quality work`,
      colorPalette: `SERVICE STATION TRUSTWORTHY PALETTE:
        - Service Red (#FF0000) - Texaco star, energy, attention
        - Clean White (#FFFFFF) - uniforms, cleanliness, trust
        - Success Green (#228B22) - go, money savings, reliability
        - Premium Gold (#FFD700) - quality, premium service, chrome

        Warm, trustworthy, professional colors.
        The palette of American SERVICE excellence.`,
      typography: `VINTAGE AD LETTERING:
        - Clean, professional vintage advertising fonts
        - Trust-building headlines
        - "Your Friendly..." "Full Service..." "Trust..."
        - Price points in bold, clear presentation
        - Taglines emphasizing quality and care
        - Period-accurate advertising copy style`,
      elements: `SERVICE STATION ELEMENTS:
        - Retro gas pumps with globe lights
        - Service bay architecture
        - Uniformed attendant figures (stylized)
        - Classic cars receiving care
        - "Full Service" signage
        - Clean, organized facilities
        - Oil cans and service equipment`,
      mood: `TRUSTWORTHY, FRIENDLY, PROFESSIONAL, RELIABLE.
        Your neighborhood service station that CARES.
        Full service with a smile and expertise.
        The way service USED to be (and should be).`,
    },
    textPrompt: {
      tone: 'Friendly, trustworthy, professional, caring',
      vocabulary: ['friendly', 'trust', 'service', 'care', 'quality', 'neighborhood', 'full service'],
    },
    carStyle: `1950s CAR receiving premium service:
      - At service station being cared for
      - Attendant checking under hood (stylized)
      - Clean, well-maintained appearance
      - The car is being PAMPERED`,
    composition: `SERVICE STATION AD COMPOSITION:
      Warm, inviting scene with service station prominent.
      Car receiving care as central focus.
      Clean typography with service messaging.`,
    avoidList: `Modern gas stations, self-service imagery,
      grimy mechanics, unfriendly aesthetics, rushed feeling.`,
    eraVehicles: ['chevy-57', 'tbird-55', 'cadillac-59', 'corvette-58'],
    mockupScenes: ['vintage gas station', 'service station wall', 'waiting room'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },

  // 1950s-60s Auto Dealer Ad
  {
    id: 'ad-50s-auto-dealer',
    name: 'Classic Auto Advertisement',
    category: 'nostalgic',
    era: '1950s',
    style: 'advertising',
    shortDescription: 'See the USA in your Chevrolet glamour',
    previewColors: ['#DC143C', '#1E3A5F', '#F5F5DC', '#FFD700'],
    imagePrompt: {
      style: `1950s-60s Classic Automobile Advertisement - "See the USA in your Chevrolet" era.
        Glamorous lifestyle, American dream, automotive aspiration.
        PREMIUM AGENCY QUALITY - Madison Avenue sophistication.

        VISUAL TECHNIQUE:
        - Glamorous illustration with lifestyle aspiration
        - The car as gateway to the American Dream
        - Beautiful settings: suburbs, vacations, success
        - Family happiness centered on the automobile
        - Magazine advertisement quality illustration
        - Aspirational messaging with emotional appeal

        ADVERTISING FOCUS:
        - The CAR enables the LIFESTYLE
        - American Dream imagery
        - Success, family, happiness through automotive ownership
        - "Your family deserves the best" messaging`,
      colorPalette: `AMERICAN DREAM PALETTE:
        - American Red (#DC143C) - patriotic, confident, bold
        - Patriotic Blue (#1E3A5F) - trustworthy, established, reliable
        - Dream Cream (#F5F5DC) - warmth, home, comfort
        - Success Gold (#FFD700) - achievement, quality, premium

        Warm, aspirational, American prosperity colors.`,
      typography: `CLASSIC AUTO AD LETTERING:
        - Elegant, aspirational advertising fonts
        - "See the USA..." "The American way..." style headlines
        - Persuasive copy with lifestyle benefits
        - Model names in distinctive script
        - Price and feature callouts clean and confident
        - Madison Avenue copywriting sophistication`,
      elements: `AUTO AD LIFESTYLE ELEMENTS:
        - Suburban homes and white picket fences
        - Vacation destinations and open roads
        - Happy family silhouettes (stylized)
        - American flag hints and patriotic elements
        - Success symbols: nice homes, nice clothes
        - The automobile as centerpiece of the good life`,
      mood: `ASPIRATIONAL, AMERICAN DREAM, FAMILY, SUCCESS.
        Your family deserves the BEST automotive care.
        The service that keeps the American Dream running.
        Trust and tradition, quality and care.`,
    },
    textPrompt: {
      tone: 'Aspirational, American, family-oriented, quality',
      vocabulary: ['family', 'American', 'quality', 'trust', 'dream', 'best', 'tradition'],
    },
    carStyle: `1950s-60s DREAM CAR in aspirational setting:
      - Gleaming in front of nice home
      - Family vacation ready
      - Symbol of success achieved
      - The car as lifestyle enabler`,
    composition: `AUTO AD LIFESTYLE COMPOSITION:
      Aspirational lifestyle scene with car as hero.
      Family/success elements surrounding.
      Elegant advertising layout with quality copywriting.`,
    avoidList: `Cynical messaging, urban grit, counter-culture,
      non-aspirational imagery, modern skepticism.`,
    eraVehicles: ['chevy-57', 'cadillac-59', 'tbird-55', 'corvette-58'],
    mockupScenes: ['living room', 'dealership', 'suburban setting'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },

  // 1970s Working Class Mechanic Hero
  {
    id: 'ad-70s-mechanic-hero',
    name: 'Working Class Mechanic',
    category: 'nostalgic',
    era: '1970s',
    style: 'advertising',
    shortDescription: 'Blue collar pride and honest work',
    previewColors: ['#4169E1', '#8B4513', '#F5F5DC', '#FF6600'],
    imagePrompt: {
      style: `1970s Working Class Hero imagery - blue collar pride, honest mechanics.
        Real people, real work, AUTHENTIC service.
        PREMIUM AGENCY QUALITY - dignified, authentic, respectful.

        VISUAL TECHNIQUE:
        - Dignified portrayal of working class expertise
        - Workshop environments with authentic details
        - Tools as instruments of skilled craft
        - Natural, honest lighting (not glamorized)
        - The mechanic as HERO of honest work
        - Period-accurate shop aesthetics

        ADVERTISING FOCUS:
        - Honest work by honest people
        - Skill and expertise celebrated
        - Your neighborhood mechanic WHO CARES
        - Real people, real quality`,
      colorPalette: `WORKING CLASS HERO PALETTE:
        - Denim Blue (#4169E1) - work clothes, reliability, honest
        - Shop Brown (#8B4513) - oil, wood, authentic materials
        - Work Cream (#F5F5DC) - clean rags, invoices, honesty
        - Safety Orange (#FF6600) - shop equipment, energy, attention

        Authentic, honest, working class dignity colors.`,
      typography: `WORKING CLASS AD LETTERING:
        - Honest, straightforward fonts
        - No-nonsense headlines
        - "Honest Work" "Real Quality" messaging
        - Clear, readable pricing
        - Trustworthy, not flashy
        - Local business authenticity`,
      elements: `WORKING CLASS ELEMENTS:
        - Workshop/garage environments
        - Professional tools arranged with care
        - Clean work uniforms with name patches
        - Completed quality work showcased
        - Certifications and expertise badges
        - Community connection imagery`,
      mood: `HONEST, SKILLED, AUTHENTIC, PRIDEFUL.
        Blue collar expertise you can trust.
        Real mechanics doing real work.
        The pride of craftsmanship in every job.`,
    },
    textPrompt: {
      tone: 'Honest, skilled, authentic, trustworthy',
      vocabulary: ['honest', 'skilled', 'real', 'quality', 'trust', 'craft', 'pride', 'expert'],
    },
    carStyle: `1970s CAR in working class context:
      - In shop receiving expert care
      - Hood up with skilled hands working
      - Authentic garage environment
      - The car is in GOOD HANDS`,
    composition: `WORKING CLASS AD COMPOSITION:
      Dignified workshop scene with expertise on display.
      Tools and skills prominent.
      Honest, authentic advertising layout.`,
    avoidList: `Glamorized imagery, corporate sterility,
      disrespectful portrayals, flashy marketing.`,
    eraVehicles: ['challenger-71', 'cuda-70', 'trans-am-77', 'el-camino-72'],
    mockupScenes: ['auto shop', 'garage', 'neighborhood street'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },

  // 1980s DIY Garage Culture
  {
    id: 'ad-80s-garage-culture',
    name: 'DIY Garage Culture',
    category: 'nostalgic',
    era: '1980s',
    style: 'advertising',
    shortDescription: 'Weekend warrior and Haynes manual spirit',
    previewColors: ['#FFD700', '#DC143C', '#1C1C1C', '#4169E1'],
    imagePrompt: {
      style: `1980s DIY Garage Culture - Haynes manual spirit, weekend warrior mechanics.
        Home garage heroes, project cars, DIY satisfaction.
        PREMIUM AGENCY QUALITY - empowering, enthusiastic, achievable.

        VISUAL TECHNIQUE:
        - Home garage environment with personal touches
        - Project car in progress showing achievable results
        - Tool organization and DIY setup
        - Natural weekend lighting through garage doors
        - The satisfaction of DOING IT YOURSELF
        - Haynes manual aesthetic influences

        ADVERTISING FOCUS:
        - We support DIY enthusiasts
        - Parts, advice, expertise for home mechanics
        - The joy of working on your own car
        - Expert backup when you need it`,
      colorPalette: `DIY GARAGE PALETTE:
        - Project Gold (#FFD700) - achievement, quality parts, success
        - Tool Red (#DC143C) - tool boxes, enthusiasm, energy
        - Garage Black (#1C1C1C) - oil, tires, serious work
        - Weekend Blue (#4169E1) - jeans, sky through garage door

        Enthusiast energy with home garage authenticity.`,
      typography: `DIY GARAGE LETTERING:
        - Enthusiastic, accessible fonts
        - "You CAN do it" empowering messaging
        - How-to style headlines
        - Part numbers and specs clearly displayed
        - Enthusiast magazine influences
        - Approachable, not intimidating`,
      elements: `DIY GARAGE ELEMENTS:
        - Home garage setup with personal touches
        - Project car in progress
        - Tool boxes and organized equipment
        - Haynes/Chilton manuals visible
        - Parts organized for installation
        - Weekend project atmosphere`,
      mood: `EMPOWERING, ENTHUSIASTIC, ACHIEVABLE, SATISFYING.
        Supporting the DIY enthusiast in everyone.
        Your project, our expertise and parts.
        The satisfaction of doing it yourself.`,
    },
    textPrompt: {
      tone: 'Empowering, enthusiastic, supportive, achievable',
      vocabulary: ['DIY', 'project', 'weekend', 'build', 'learn', 'achieve', 'support', 'parts'],
    },
    carStyle: `1980s PROJECT CAR in home garage:
      - Hood up, work in progress
      - Achievable project (not concours)
      - Real enthusiast environment
      - The car is a LABOR OF LOVE`,
    composition: `DIY GARAGE AD COMPOSITION:
      Home garage scene with project car.
      Tools and parts organized around.
      Empowering, achievable messaging throughout.`,
    avoidList: `Professional-only imagery, intimidating complexity,
      pristine show cars, inaccessible messaging.`,
    eraVehicles: ['gnx-87', 'corvette-85', 'testarossa', 'delorean'],
    mockupScenes: ['home garage', 'auto parts store', 'car meet'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'seo_blog'],
  },
];

// ============================================================================
// CAR MAGAZINE STYLES (16 themes - ALL PRESERVED)
// ============================================================================

export const magazineThemes: NostalgicThemeDefinition[] = [
  // 1950s Magazine Styles
  {
    id: 'magazine-50s-hot-rod',
    name: 'Hot Rod Magazine',
    category: 'nostalgic',
    era: '1950s',
    style: 'magazine',
    shortDescription: 'Flames and chrome and racing heritage',
    previewColors: ['#FF4500', '#FFD700', '#000000', '#C0C0C0'],
    imagePrompt: {
      style: `1950s Hot Rod Magazine cover style. Classic hot rod culture.
        Flames, chrome, racing heritage. Real car photography aesthetic
        with painted backgrounds. Speed and power.`,
      colorPalette: `Flame orange (#FF4500), chrome gold (#FFD700), night black (#000000),
        polished chrome (#C0C0C0). Racing colors.`,
      typography: `Classic Hot Rod Magazine masthead style. Bold, racing fonts.
        Feature headlines, technical specs mentioned.`,
      elements: `Flame paintjobs, chrome engines, racing stripes, speed equipment,
        trophies, checkered flags. Garage culture.`,
      mood: `Powerful, authentic, enthusiast. For true gearheads who understand.
        Hot rod heritage and racing spirit.`,
    },
    textPrompt: {
      tone: 'Authentic, powerful, enthusiast',
      vocabulary: ['hot rod', 'chrome', 'speed', 'power', 'build', 'race'],
    },
    carStyle: `1950s hot rod in magazine cover glory, flames and chrome,
      possibly at drag strip or speed shop. Hero shot.`,
    composition: `Magazine cover layout with masthead area, feature headlines,
      hero car shot. Classic automotive publication style.`,
    avoidList: `Modern vehicles, non-car-focused imagery, corporate sterility,
      amateur photography feel.`,
    eraVehicles: ['chevy-57', 'mercury-49', 'tbird-55'],
    mockupScenes: ['newsstand', 'garage wall', 'speed shop counter'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'magazine-50s-popular-mech',
    name: 'Popular Mechanics',
    category: 'nostalgic',
    era: '1950s',
    style: 'magazine',
    shortDescription: 'Technical illustrations and cutaways',
    previewColors: ['#1E3A5F', '#FFD700', '#F5F5DC', '#8B0000'],
    imagePrompt: {
      style: `1950s Popular Mechanics magazine style. Technical illustrations,
        cutaway diagrams, how-it-works aesthetics. Educational and fascinating.
        Post-war American innovation.`,
      colorPalette: `Technical blue (#1E3A5F), highlight gold (#FFD700),
        paper cream (#F5F5DC), accent red (#8B0000). Clean, technical.`,
      typography: `Clean, technical fonts. Scientific feeling. Numbered diagrams.
        Educational headlines. "How To" styling.`,
      elements: `Cutaway diagrams, technical illustrations, numbered parts,
        cross-sections, blueprint aesthetics. DIY spirit.`,
      mood: `Educational, fascinating, empowering. Understand how your car works.
        The science of automotive care explained.`,
    },
    textPrompt: {
      tone: 'Educational, technical, fascinating',
      vocabulary: ['how', 'science', 'technical', 'explained', 'works', 'discover'],
    },
    carStyle: `1950s car shown in technical cutaway or diagram style.
      Inner workings revealed. Educational presentation.`,
    composition: `Technical magazine layout with diagrams, callouts,
      educational presentation. Clean, organized.`,
    avoidList: `Flashy non-technical imagery, entertainment focus,
      non-educational content.`,
    eraVehicles: ['chevy-57', 'corvette-58', 'cadillac-59'],
    mockupScenes: ['library', 'workshop', 'garage workbench'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'seo_blog'],
  },
  {
    id: 'magazine-50s-life-ad',
    name: 'Life Magazine Ad',
    category: 'nostalgic',
    era: '1950s',
    style: 'magazine',
    shortDescription: 'Norman Rockwell Americana',
    previewColors: ['#DC143C', '#1E3A5F', '#F5F5DC', '#228B22'],
    imagePrompt: {
      style: `1950s Life Magazine advertisement style. Norman Rockwell Americana.
        Idealized American family life. Post-war prosperity and optimism.
        Illustration-based advertising.`,
      colorPalette: `American red (#DC143C), patriotic blue (#1E3A5F),
        warm cream (#F5F5DC), suburban green (#228B22). Warm, nostalgic.`,
      typography: `Elegant advertising fonts of the era. Persuasive copy style.
        Family-oriented messaging. Aspirational tone.`,
      elements: `Idealized family scenes, suburban homes, church steeples,
        American flags, happy families with cars. Prosperity symbols.`,
      mood: `Wholesome, aspirational, American dream. Your family deserves
        the best automotive care. Trust and tradition.`,
    },
    textPrompt: {
      tone: 'Wholesome, trustworthy, American',
      vocabulary: ['family', 'trust', 'quality', 'American', 'tradition', 'care'],
    },
    carStyle: `1950s family car in idealized American setting, possibly
      with happy family silhouettes. Norman Rockwell aesthetic.`,
    composition: `Life Magazine ad layout with elegant copy, hero image,
      aspirational messaging. Classic advertising composition.`,
    avoidList: `Edgy imagery, counter-culture themes, non-family content,
      modern cynicism.`,
    eraVehicles: ['chevy-57', 'cadillac-59', 'tbird-55'],
    mockupScenes: ['living room', 'waiting room', 'suburban home'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'magazine-50s-custom',
    name: 'Custom Car Quarterly',
    category: 'nostalgic',
    era: '1950s',
    style: 'magazine',
    shortDescription: 'Lead sleds and kustom kulture',
    previewColors: ['#800080', '#FFD700', '#F5F5DC', '#FF1493'],
    imagePrompt: {
      style: `1950s Custom Car culture magazine style. Kustom Kulture, lead sleds,
        chopped and channeled. George Barris and Ed Roth influenced.
        Art on wheels.`,
      colorPalette: `Candy purple (#800080), gold flake (#FFD700), pearl cream (#F5F5DC),
        hot pink (#FF1493). Custom paint colors.`,
      typography: `Custom lettering, pinstripe-inspired fonts. Show car names
        in fancy script. Builder credits prominent.`,
      elements: `Chopped tops, lowered stance, lakes pipes, pinstriping,
        custom interiors, show trophies. Kustom art.`,
      mood: `Artistic, unique, show-worthy. Your car is a canvas.
        Custom care for custom rides.`,
    },
    textPrompt: {
      tone: 'Artistic, unique, show-quality',
      vocabulary: ['custom', 'show', 'build', 'unique', 'art', 'quality'],
    },
    carStyle: `1950s custom (mercury, chevy) with chopped top, custom paint,
      lowered stance. Show car presentation.`,
    composition: `Custom car magazine cover with hero shot, builder credits,
      show information. Enthusiast publication style.`,
    avoidList: `Stock vehicles, corporate imagery, non-custom focus,
      mainstream advertising.`,
    eraVehicles: ['mercury-49', 'chevy-57', 'cadillac-59'],
    mockupScenes: ['car show', 'custom shop', 'kustom kulture event'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },

  // 1960s Magazine Styles
  {
    id: 'magazine-60s-motor-trend',
    name: 'Motor Trend Classic',
    category: 'nostalgic',
    era: '1960s',
    style: 'magazine',
    shortDescription: 'Professional photography and clean layouts',
    previewColors: ['#1E3A5F', '#C0C0C0', '#FFD700', '#FFFFFF'],
    imagePrompt: {
      style: `1960s Motor Trend magazine style. Professional automotive journalism.
        Clean photography, authoritative reviews, Car of the Year prestige.
        Respected publication aesthetic.`,
      colorPalette: `Professional navy (#1E3A5F), chrome silver (#C0C0C0),
        award gold (#FFD700), clean white (#FFFFFF). Authoritative.`,
      typography: `Professional masthead, clean headlines, authoritative body copy.
        Test results and specifications. Award badges.`,
      elements: `Professional car photography, test equipment hints, award badges,
        specification charts. Journalistic credibility.`,
      mood: `Authoritative, professional, trusted. Award-winning automotive care.
        The experts' choice for service.`,
    },
    textPrompt: {
      tone: 'Professional, authoritative, award-winning',
      vocabulary: ['award', 'expert', 'test', 'best', 'rated', 'professional'],
    },
    carStyle: `1960s muscle car in professional photography setting.
      Clean backdrop, dramatic lighting. Motor Trend test car feel.`,
    composition: `Professional magazine cover with masthead, feature car,
      award badges, test results preview. Authoritative layout.`,
    avoidList: `Amateur photography, casual tone, non-professional aesthetic,
      entertainment focus.`,
    eraVehicles: ['mustang-67', 'corvette-63', 'camaro-69', 'charger-68'],
    mockupScenes: ['dealership waiting room', 'professional office', 'car enthusiast library'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'review_reply'],
  },
  {
    id: 'magazine-60s-road-track',
    name: 'Road & Track',
    category: 'nostalgic',
    era: '1960s',
    style: 'magazine',
    shortDescription: 'European sophistication and racing heritage',
    previewColors: ['#DC143C', '#F5F5DC', '#000000', '#FFD700'],
    imagePrompt: {
      style: `1960s Road & Track magazine style. European sports car sophistication.
        Racing heritage, Le Mans glamour, enthusiast excellence.
        Refined automotive journalism.`,
      colorPalette: `Racing red (#DC143C), elegant cream (#F5F5DC),
        classic black (#000000), racing gold (#FFD700). Sophisticated.`,
      typography: `Elegant, refined typography. European influence. Racing results.
        Technical specifications. Sophisticated headlines.`,
      elements: `European sports cars, racing scenes, Le Mans hints, pit lane,
        trophies, timepieces. Racing heritage.`,
      mood: `Sophisticated, passionate, racing-bred. European automotive excellence.
        For those who appreciate the finer things in cars.`,
    },
    textPrompt: {
      tone: 'Sophisticated, racing-bred, refined',
      vocabulary: ['racing', 'European', 'heritage', 'precision', 'excellence', 'refined'],
    },
    carStyle: `1960s sports car (Corvette, European style) in racing context
      or sophisticated setting. Elegant presentation.`,
    composition: `Refined magazine layout with elegant typography, racing heritage,
      sophisticated presentation.`,
    avoidList: `Crude imagery, American muscle-only focus, casual tone,
      non-racing themes.`,
    eraVehicles: ['corvette-63', 'mustang-67', 'gto-65'],
    mockupScenes: ['racing club', 'European setting', 'refined study'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'magazine-60s-muscle',
    name: 'Muscle Car Monthly',
    category: 'nostalgic',
    era: '1960s',
    style: 'magazine',
    shortDescription: 'Big blocks and racing stripes',
    previewColors: ['#FF0000', '#FFFFFF', '#0000FF', '#FFD700'],
    imagePrompt: {
      style: `1960s Muscle Car magazine style. Big block power, racing stripes,
        horsepower wars. GTO vs Mustang vs Camaro. Detroit muscle at its peak.
        Drag strip glory.`,
      colorPalette: `Muscle red (#FF0000), rally white (#FFFFFF), racing blue (#0000FF),
        trophy gold (#FFD700). Bold American colors.`,
      typography: `Bold, powerful fonts. Horsepower numbers prominent.
        Drag strip times. Comparison tests.`,
      elements: `Muscle cars, racing stripes, hood scoops, drag strips,
        burnouts, trophy girls (implied). Raw power.`,
      mood: `Powerful, competitive, American muscle. Pure horsepower.
        The muscle car shop for serious power.`,
    },
    textPrompt: {
      tone: 'Powerful, competitive, pure muscle',
      vocabulary: ['power', 'horsepower', 'muscle', 'race', 'fast', 'boss'],
    },
    carStyle: `1960s muscle car (Mustang, Camaro, Charger, GTO) in action
      or dramatic power shot. Hood scoops and stripes prominent.`,
    composition: `Muscle car magazine cover with power shot, performance specs,
      comparison tease. High-octane layout.`,
    avoidList: `Economy cars, European focus, fuel efficiency,
      practical concerns.`,
    eraVehicles: ['mustang-67', 'camaro-69', 'charger-68', 'gto-65'],
    mockupScenes: ['drag strip', 'speed shop', 'muscle car show'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'magazine-60s-van',
    name: 'Custom Van',
    category: 'nostalgic',
    era: '1960s',
    style: 'magazine',
    shortDescription: 'Airbrushed murals and shag carpet',
    previewColors: ['#FF6600', '#800080', '#00CED1', '#FFD700'],
    imagePrompt: {
      style: `Late 1960s/early 70s Custom Van culture magazine style. Airbrushed murals,
        bubble windows, shag carpet interiors. Rolling art and mobile lifestyle.
        Groovy customization.`,
      colorPalette: `Sunset orange (#FF6600), wizard purple (#800080),
        surf teal (#00CED1), mural gold (#FFD700). Airbrushed gradients.`,
      typography: `Groovy, flowing fonts. Airbrush lettering style.
        Van names in custom script. "Far out" vocabulary.`,
      elements: `Airbrushed murals, wizards, fantasy scenes, bubble windows,
        mag wheels, custom interiors. Rolling artwork.`,
      mood: `Creative, free-spirited, groovy. Express yourself through your ride.
        Custom care for custom vans.`,
    },
    textPrompt: {
      tone: 'Creative, groovy, expressive',
      vocabulary: ['custom', 'groovy', 'express', 'art', 'vibe', 'far out'],
    },
    carStyle: `Custom van with airbrushed mural, bubble windows, mag wheels.
      Rolling art piece presentation.`,
    composition: `Custom van magazine cover with dramatic mural shot,
      interior peek, owner story tease.`,
    avoidList: `Plain vehicles, corporate vans, non-custom imagery,
      mainstream advertising.`,
    eraVehicles: ['mustang-67', 'camaro-69', 'corvette-63'],
    mockupScenes: ['van show', 'beach parking', 'custom shop'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1970s Magazine Styles
  {
    id: 'magazine-70s-car-craft',
    name: 'Car Craft',
    category: 'nostalgic',
    era: '1970s',
    style: 'magazine',
    shortDescription: 'DIY builds and garage mechanics',
    previewColors: ['#FF4500', '#4A4A4A', '#FFD700', '#F5F5DC'],
    imagePrompt: {
      style: `1970s Car Craft magazine style. DIY garage builds, how-to articles,
        budget hot rodding. Working class car culture. Wrench-turning wisdom.`,
      colorPalette: `Work orange (#FF4500), garage gray (#4A4A4A),
        trophy gold (#FFD700), shop rag cream (#F5F5DC). Authentic garage colors.`,
      typography: `Practical, readable fonts. How-to headlines. Parts lists.
        Step-by-step numbering. Technical but accessible.`,
      elements: `Garage scenes, tools, engine builds in progress, parts,
        work lights. Real wrench-turning imagery.`,
      mood: `Practical, hands-on, achievable. We speak your language.
        Real mechanics for real car people.`,
    },
    textPrompt: {
      tone: 'Practical, hands-on, real',
      vocabulary: ['build', 'how-to', 'DIY', 'wrench', 'real', 'garage'],
    },
    carStyle: `1970s car mid-build or in home garage setting.
      Engine on stand, parts organized. Working build.`,
    composition: `DIY magazine layout with how-to features, parts lists,
      budget building emphasis. Practical presentation.`,
    avoidList: `Show-only cars, unlimited budget builds, corporate sponsors,
      non-DIY focus.`,
    eraVehicles: ['challenger-71', 'cuda-70', 'trans-am-77', 'el-camino-72'],
    mockupScenes: ['home garage', 'auto parts store', 'swap meet'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'seo_blog'],
  },
  {
    id: 'magazine-70s-lowrider',
    name: 'Lowrider Magazine',
    category: 'nostalgic',
    era: '1970s',
    style: 'magazine',
    shortDescription: 'Hydraulics and candy paint',
    previewColors: ['#FFD700', '#8B0000', '#000000', '#00CED1'],
    imagePrompt: {
      style: `1970s Lowrider Magazine style. Chicano car culture. Candy paint,
        hydraulics, wire wheels. Low and slow lifestyle. Community and pride.`,
      colorPalette: `Gold flake (#FFD700), candy red (#8B0000), jet black (#000000),
        metal flake teal (#00CED1). Deep, rich custom colors.`,
      typography: `Chicano-influenced lettering, Old English style, custom scripts.
        Club names prominent. Community focus.`,
      elements: `Lowriders hitting switches, hydraulic pumps, wire wheels,
        chain steering wheels, plaque collections. Community pride.`,
      mood: `Proud, community-driven, artistic. Low and slow lifestyle.
        Respect the culture, respect the ride.`,
    },
    textPrompt: {
      tone: 'Proud, community, low-and-slow',
      vocabulary: ['pride', 'community', 'custom', 'low', 'respect', 'family'],
    },
    carStyle: `1970s lowrider (Impala, Monte Carlo) hitting switches or
      three-wheel motion. Candy paint gleaming.`,
    composition: `Lowrider magazine cover with dramatic pose, club information,
      community event details. Cultural pride presentation.`,
    avoidList: `Disrespectful imagery, non-lowrider focus, cultural appropriation,
      fast/racing themes.`,
    eraVehicles: ['el-camino-72', 'challenger-71', 'trans-am-77'],
    mockupScenes: ['car show', 'boulevard cruise', 'community event'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'magazine-70s-offroad',
    name: '4x4 Off-Road',
    category: 'nostalgic',
    era: '1970s',
    style: 'magazine',
    shortDescription: 'Mud and trails and lifted trucks',
    previewColors: ['#8B4513', '#228B22', '#FFD700', '#4682B4'],
    imagePrompt: {
      style: `1970s 4x4 Off-Road magazine style. Trail running, rock crawling,
        mud bogging. Lifted trucks and Jeeps. Outdoor adventure on four wheels.`,
      colorPalette: `Mud brown (#8B4513), trail green (#228B22),
        highlight gold (#FFD700), sky blue (#4682B4). Natural outdoor colors.`,
      typography: `Rugged, outdoorsy fonts. Trail reports. Lift kit specs.
        Adventure headlines. Outdoor magazine feel.`,
      elements: `Mud splashes, trail scenes, rock obstacles, camping gear,
        winches, lift kits. Outdoor adventure.`,
      mood: `Adventurous, capable, outdoorsy. Built for where the road ends.
        Off-road ready service.`,
    },
    textPrompt: {
      tone: 'Adventurous, rugged, capable',
      vocabulary: ['trail', 'off-road', 'adventure', 'capable', 'rugged', 'explore'],
    },
    carStyle: `1970s 4x4 (Bronco, Blazer, Jeep) on trail or mud bogging.
      Lifted, with oversized tires.`,
    composition: `Off-road magazine cover with action shot, trail report,
      gear guide. Adventure publication style.`,
    avoidList: `Pavement-only vehicles, urban settings, clean/shiny presentations,
      non-off-road content.`,
    eraVehicles: ['trans-am-77', 'el-camino-72', 'challenger-71'],
    mockupScenes: ['campsite', 'trail head', 'outdoor store'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'magazine-70s-import',
    name: 'Import Tuner Early',
    category: 'nostalgic',
    era: '1970s',
    style: 'magazine',
    shortDescription: 'Datsun Z and rising sun',
    previewColors: ['#FF4500', '#FFFFFF', '#000000', '#FFD700'],
    imagePrompt: {
      style: `1970s early import car magazine style. Datsun 240Z, early Japanese imports.
        Rising sun motifs, Japanese efficiency meets American customization.
        Import revolution beginning.`,
      colorPalette: `Rising sun orange (#FF4500), pure white (#FFFFFF),
        samurai black (#000000), gold accent (#FFD700). Japanese flag influenced.`,
      typography: `Mix of Japanese-influenced and Western fonts. Technical specs.
        Performance comparisons. Import specialty focus.`,
      elements: `Rising sun graphics, Japanese imports, comparison charts,
        performance modifications. East meets West.`,
      mood: `Innovative, efficient, exciting. The import revolution.
        Specialized care for imported excellence.`,
    },
    textPrompt: {
      tone: 'Innovative, specialized, exciting',
      vocabulary: ['import', 'precision', 'performance', 'specialized', 'innovation', 'Z'],
    },
    carStyle: `Datsun 240Z or similar Japanese import, possibly modified,
      with Japanese design influences.`,
    composition: `Import magazine cover with featured car, comparison data,
      modification spotlight. Specialty publication feel.`,
    avoidList: `Domestic-only focus, anti-import sentiment, non-specialty approach,
      mainstream American muscle focus.`,
    eraVehicles: ['datsun-z', 'trans-am-77', 'corvette-73'],
    mockupScenes: ['import specialty shop', 'car meet', 'tuner garage'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },

  // 1980s Magazine Styles
  {
    id: 'magazine-80s-turbo',
    name: 'Turbo & High-Tech',
    category: 'nostalgic',
    era: '1980s',
    style: 'magazine',
    shortDescription: 'Boost gauges and intercoolers',
    previewColors: ['#FF0000', '#000000', '#C0C0C0', '#00FF00'],
    imagePrompt: {
      style: `1980s Turbo performance magazine style. Boost gauges, intercoolers,
        high-tech performance. Buick Grand National, turbo era.
        Technology and power combined.`,
      colorPalette: `Turbo red (#FF0000), stealth black (#000000),
        tech silver (#C0C0C0), digital green (#00FF00). High-tech performance colors.`,
      typography: `Digital-influenced fonts, technical specifications,
        boost numbers prominent. Tech magazine feel.`,
      elements: `Turbo components, boost gauges, intercoolers, engine bays,
        dyno charts. Technology showcase.`,
      mood: `High-tech, powerful, cutting-edge. Turbo-charged service.
        Boost your performance with our expertise.`,
    },
    textPrompt: {
      tone: 'High-tech, powerful, boosted',
      vocabulary: ['turbo', 'boost', 'tech', 'power', 'performance', 'intercooler'],
    },
    carStyle: `1980s turbo car (Grand National, turbo Porsche style) with
      engine bay showcase, boost gauge visible.`,
    composition: `Tech magazine cover with cutaway views, spec charts,
      turbo technology focus. Performance publication style.`,
    avoidList: `Non-turbo focus, low-tech imagery, carbureted emphasis,
      non-performance content.`,
    eraVehicles: ['gnx-87', 'corvette-85', 'testarossa'],
    mockupScenes: ['performance shop', 'dyno room', 'turbo specialist'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
  {
    id: 'magazine-80s-delorean',
    name: 'DeLorean Dreams',
    category: 'nostalgic',
    era: '1980s',
    style: 'magazine',
    shortDescription: 'Stainless steel and gull wings',
    previewColors: ['#C0C0C0', '#000000', '#00FFFF', '#FF00FF'],
    imagePrompt: {
      style: `1980s DeLorean-era futurism magazine style. Stainless steel,
        gull wing doors, Back to the Future vibes. Futuristic dreams
        of the 80s. Where we're going, we don't need roads.`,
      colorPalette: `Stainless steel (#C0C0C0), void black (#000000),
        flux cyan (#00FFFF), time magenta (#FF00FF). Futuristic palette.`,
      typography: `Futuristic fonts, digital readouts, time display style.
        80s vision of the future typography.`,
      elements: `Gull wing doors, stainless steel, digital readouts,
        futuristic cityscapes, time travel hints. 80s future vision.`,
      mood: `Futuristic, dreaming, innovative. The future of automotive care
        is here. Great Scott!`,
    },
    textPrompt: {
      tone: 'Futuristic, dreaming, innovative',
      vocabulary: ['future', 'innovation', 'dream', 'time', 'beyond', 'tomorrow'],
    },
    carStyle: `DeLorean DMC-12 with gull wings open, dramatic lighting
      on stainless steel. Futuristic 80s dream machine.`,
    composition: `Futuristic magazine layout with DeLorean hero shot,
      future technology features. 80s futurism aesthetic.`,
    avoidList: `Dated/old appearance, non-futuristic themes, conventional styling,
      mundane presentation.`,
    eraVehicles: ['delorean', 'countach', 'testarossa'],
    mockupScenes: ['car show', 'collectors garage', 'movie memorabilia'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'magazine-80s-ferrari',
    name: 'Ferrari Poster',
    category: 'nostalgic',
    era: '1980s',
    style: 'magazine',
    shortDescription: 'Testarossa and Miami Vice lifestyle',
    previewColors: ['#FF0000', '#FFFFFF', '#000000', '#FFD700'],
    imagePrompt: {
      style: `1980s Ferrari poster/magazine style. Testarossa, Miami Vice era.
        Exotic lifestyle, palm trees, sunset beaches. Italian exotic
        in American paradise.`,
      colorPalette: `Ferrari red (#FF0000), Miami white (#FFFFFF),
        night black (#000000), wealth gold (#FFD700). Exotic luxury colors.`,
      typography: `Elegant Italian-influenced fonts, Ferrari script style.
        Lifestyle magazine typography. Exotic and refined.`,
      elements: `Ferrari badges, palm trees, Miami skyline, sunset,
        exotic lifestyle hints. 80s wealth and style.`,
      mood: `Exotic, aspirational, lifestyle. The Ferrari treatment for
        your prized vehicle. Exotic car expertise.`,
    },
    textPrompt: {
      tone: 'Exotic, aspirational, prestigious',
      vocabulary: ['exotic', 'Italian', 'prestige', 'lifestyle', 'passion', 'prancing'],
    },
    carStyle: `Ferrari Testarossa in Miami setting, palm trees, sunset,
      exotic lifestyle backdrop. 80s poster perfection.`,
    composition: `Exotic car poster layout with lifestyle setting,
      minimal text, maximum aspirational imagery.`,
    avoidList: `Economy cars, mundane settings, practical themes,
      non-exotic focus.`,
    eraVehicles: ['testarossa', 'countach', 'corvette-85'],
    mockupScenes: ['bedroom wall', 'garage dream board', 'exotic dealership'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'magazine-80s-import-tuner',
    name: 'Japanese Import',
    category: 'nostalgic',
    era: '1980s',
    style: 'magazine',
    shortDescription: 'Initial D vibes and midnight racing',
    previewColors: ['#FF4500', '#FFFFFF', '#000000', '#FFD700'],
    imagePrompt: {
      style: `1980s Japanese Import Tuner magazine style. Initial D era,
        touge mountain racing, JDM culture. Midnight Outlaw vibes.
        Japanese performance perfection.`,
      colorPalette: `Warning orange (#FF4500), tofu white (#FFFFFF),
        midnight black (#000000), champion gold (#FFD700). JDM colors.`,
      typography: `Japanese-influenced fonts, racing numbers, tech specs.
        JDM style text treatments. Drift culture typography.`,
      elements: `Mountain passes, drift smoke, Japanese text accents,
        racing liveries, JDM parts. Touge culture.`,
      mood: `Fast, precise, dedicated. JDM expertise for import excellence.
        The spirit of Japanese performance.`,
    },
    textPrompt: {
      tone: 'Precise, dedicated, JDM spirit',
      vocabulary: ['JDM', 'touge', 'drift', 'precision', 'spirit', 'midnight'],
    },
    carStyle: `1980s Japanese sports car (RX-7, Supra, Z car) in mountain
      pass or drift setting. JDM style.`,
    composition: `JDM magazine cover with action shot, Japanese text accents,
      performance parts feature. Import tuner style.`,
    avoidList: `Non-Japanese focus, slow/practical themes, non-performance content,
      Western muscle car focus.`,
    eraVehicles: ['datsun-z', 'gnx-87', 'corvette-85'],
    mockupScenes: ['import meet', 'mountain pass', 'JDM shop'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'car_of_day'],
  },
];

// ============================================================================
// COMBINED EXPORTS
// ============================================================================

export const NOSTALGIC_THEMES: NostalgicThemeDefinition[] = [
  ...comicBookThemes,
  ...moviePosterThemes,
  ...advertisingThemes,
  ...magazineThemes,
];

// Helper functions for filtering
export function getNostalgicThemesByEra(era: '1950s' | '1960s' | '1970s' | '1980s'): NostalgicThemeDefinition[] {
  return NOSTALGIC_THEMES.filter(theme => theme.era === era);
}

export function getNostalgicThemesByStyle(style: 'comic-book' | 'movie-poster' | 'magazine' | 'advertising'): NostalgicThemeDefinition[] {
  return NOSTALGIC_THEMES.filter(theme => theme.style === style);
}

export function getNostalgicThemesByEraAndStyle(
  era: '1950s' | '1960s' | '1970s' | '1980s',
  style: 'comic-book' | 'movie-poster' | 'magazine' | 'advertising'
): NostalgicThemeDefinition[] {
  return NOSTALGIC_THEMES.filter(theme => theme.era === era && theme.style === style);
}

export function getRandomNostalgicTheme(): NostalgicThemeDefinition {
  return NOSTALGIC_THEMES[Math.floor(Math.random() * NOSTALGIC_THEMES.length)];
}

export function getRandomNostalgicThemeByEra(era: '1950s' | '1960s' | '1970s' | '1980s'): NostalgicThemeDefinition {
  const eraThemes = getNostalgicThemesByEra(era);
  return eraThemes[Math.floor(Math.random() * eraThemes.length)];
}

export function getRandomNostalgicThemeByStyle(style: 'comic-book' | 'movie-poster' | 'magazine' | 'advertising'): NostalgicThemeDefinition {
  const styleThemes = getNostalgicThemesByStyle(style);
  return styleThemes[Math.floor(Math.random() * styleThemes.length)];
}

export default NOSTALGIC_THEMES;
