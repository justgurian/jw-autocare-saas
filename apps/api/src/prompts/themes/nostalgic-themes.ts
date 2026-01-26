/**
 * Nostalgic Automotive Themes
 * 48 themes across 3 styles (Comic Book, Movie Poster, Car Magazine) and 4 eras (1950s, 1960s, 1970s, 1980s)
 */

import { ThemeDefinition, ThemeImagePrompt, ThemeTextPrompt } from './index';

// Extended interface for nostalgic themes with era and style metadata
export interface NostalgicThemeDefinition extends ThemeDefinition {
  era: '1950s' | '1960s' | '1970s' | '1980s';
  style: 'comic-book' | 'movie-poster' | 'magazine';
  carStyle: string;  // How to render vehicles in this style
  composition: string;  // Layout and framing guidance
  avoidList: string;  // What NOT to include
  eraVehicles: string[];  // Suggested vehicle IDs for this era
}

// ============================================================================
// COMIC BOOK STYLES (16 themes)
// ============================================================================

export const comicBookThemes: NostalgicThemeDefinition[] = [
  // 1950s Comic Book Styles
  {
    id: 'comic-50s-golden-age',
    name: 'Golden Age Hero',
    category: 'nostalgic',
    era: '1950s',
    style: 'comic-book',
    shortDescription: 'Bold primary colors and heroic poses',
    previewColors: ['#FF0000', '#0000FF', '#FFD700', '#FFFFFF'],
    imagePrompt: {
      style: `1950s Golden Age comic book style. Bold primary colors with flat areas of solid color.
        Ben-Day dots halftone pattern visible on skin tones and backgrounds. Heavy black outlines
        around all elements. Heroic dynamic poses. Classic four-color printing aesthetic.`,
      colorPalette: `Primary colors dominate: bright red (#FF0000), royal blue (#0000FF),
        golden yellow (#FFD700). White (#FFFFFF) for highlights. Black for heavy outlines.
        Ben-Day dots in pink, yellow, and cyan for shading.`,
      typography: `Bold sans-serif block letters with heavy black outlines. Slightly condensed.
        Action words in explosive burst shapes. Speech bubbles with rounded corners.
        Headlines in all caps with dramatic perspective.`,
      elements: `Sunburst action lines behind main subject. Comic panel borders.
        Speed lines for motion. Star bursts and explosion shapes. Heroic emblems.`,
      mood: `Heroic, triumphant, powerful, patriotic. The car is the hero saving the day.
        Confident and unstoppable.`,
    },
    textPrompt: {
      tone: 'Heroic, triumphant, confident',
      vocabulary: ['mighty', 'powerful', 'saves', 'hero', 'amazing', 'incredible'],
    },
    carStyle: `Classic 1950s car rendered as a heroic vehicle, chrome gleaming,
      positioned heroically with dramatic lighting. Fins and chrome emphasized.`,
    composition: `Central heroic composition with car at dramatic angle.
      Sunburst rays emanating from behind. Bold panel border frame.`,
    avoidList: `Realistic human faces, dark/gritty themes, modern vehicles,
      minimalist design, photorealistic rendering.`,
    eraVehicles: ['chevy-57', 'tbird-55', 'cadillac-59', 'corvette-58'],
    mockupScenes: ['comic book cover', 'newsstand display', 'collectors frame'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'comic-50s-ec-horror',
    name: 'EC Horror Comics',
    category: 'nostalgic',
    era: '1950s',
    style: 'comic-book',
    shortDescription: 'Tales from the Crypt lurid style',
    previewColors: ['#8B0000', '#4A0080', '#00FF00', '#FFD700'],
    imagePrompt: {
      style: `1950s EC Horror Comics style (Tales from the Crypt, Vault of Horror).
        Lurid, exaggerated colors. Dramatic shadows and grotesque details.
        Highly detailed linework with cross-hatching. Melodramatic compositions.`,
      colorPalette: `Blood red (#8B0000), eerie purple (#4A0080), sickly green (#00FF00),
        gold for title treatment (#FFD700). Deep shadows in blue-black.
        Flesh tones with green undertones for creepy effect.`,
      typography: `Dripping horror letters, irregular and creepy. Title in large
        ghoulish font with 3D depth. Narrative boxes in yellowed parchment style.
        Exclamation-heavy text.`,
      elements: `Creepy shadows, dramatic lighting from below, cobwebs,
        cemetery gates, eerie mist, full moon, gnarled trees. But automotive themed.`,
      mood: `Campy horror, tongue-in-cheek spooky, dramatic irony. The deal is
        "scary good" - play on horror tropes for auto service.`,
    },
    textPrompt: {
      tone: 'Campy horror, dramatic, tongue-in-cheek',
      vocabulary: ['terrifying', 'shocking', 'beware', 'doom', 'fate', 'horror'],
    },
    carStyle: `1950s car emerging from fog or shadow, headlights glowing ominously,
      chrome reflecting eerie moonlight. Dramatic low-angle shot.`,
    composition: `Dutch angle, dramatic shadows. Vignette effect with dark edges.
      Title treatment at top in horror font.`,
    avoidList: `Actual gore, real monsters, child-unfriendly content,
      modern horror aesthetics, realistic violence.`,
    eraVehicles: ['mercury-49', 'chevy-57', 'cadillac-59'],
    mockupScenes: ['horror comic cover', 'midnight display', 'spooky backdrop'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'comic-50s-romance',
    name: 'Romance Comics',
    category: 'nostalgic',
    era: '1950s',
    style: 'comic-book',
    shortDescription: 'Dreamy pastels and heart motifs',
    previewColors: ['#FFB6C1', '#E6E6FA', '#FF69B4', '#87CEEB'],
    imagePrompt: {
      style: `1950s Romance Comics style. Soft, dreamy illustrations with
        beautiful idealized subjects. Pastel color palette. Gentle linework
        with soft hatching. Emotional, sentimental compositions.`,
      colorPalette: `Soft pink (#FFB6C1), lavender (#E6E6FA), hot pink accent (#FF69B4),
        powder blue (#87CEEB). Cream backgrounds. Soft shadows in purple tones.`,
      typography: `Elegant script fonts for titles mixed with readable serif text.
        Thought bubbles with cloud-like edges. Heart decorations.
        Romantic cursive headlines.`,
      elements: `Heart motifs, soft clouds, starbursts of love, dreamy backgrounds,
        soft-focus effects, romantic scenery. Flowers and ribbons.`,
      mood: `Romantic, dreamy, emotional. The love story between a car owner
        and their trusted mechanic. Sweet and sentimental.`,
    },
    textPrompt: {
      tone: 'Romantic, sweet, heartfelt',
      vocabulary: ['love', 'trust', 'forever', 'care', 'devoted', 'cherish'],
    },
    carStyle: `1950s car as object of affection, polished and beautiful,
      soft lighting making chrome glow romantically. Like a love interest.`,
    composition: `Soft vignette, dreamy edges. Central composition with
      decorative heart borders. Pastel gradient backgrounds.`,
    avoidList: `Harsh colors, aggressive imagery, dark themes,
      anything unromantic or harsh.`,
    eraVehicles: ['tbird-55', 'corvette-58', 'chevy-57'],
    mockupScenes: ['magazine rack', 'bedside table', 'romantic setting'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'comic-50s-scifi-pulp',
    name: 'Sci-Fi Pulp',
    category: 'nostalgic',
    era: '1950s',
    style: 'comic-book',
    shortDescription: 'Retro rockets and ray guns',
    previewColors: ['#00CED1', '#FF4500', '#FFD700', '#4B0082'],
    imagePrompt: {
      style: `1950s Sci-Fi Pulp comic style. Retro-futuristic aesthetic with
        rocket ships, ray guns, and alien landscapes. Vivid, saturated colors.
        Dramatic space backgrounds. Chrome and fins everywhere.`,
      colorPalette: `Turquoise (#00CED1), rocket orange (#FF4500), gold chrome (#FFD700),
        space purple (#4B0082). Starfield blacks. Laser beam reds and greens.`,
      typography: `Atomic age fonts with orbital rings and satellite dots.
        Futuristic sans-serif with chrome effects. Exclamation-heavy.
        "Amazing!" "Incredible!" style callouts.`,
      elements: `Rocket fins, orbital rings, stars and planets, ray beams,
        chrome robots, atomic symbols, retro space helmets. Futuristic cityscapes.`,
      mood: `Wonder, excitement, futuristic optimism. The auto shop of TOMORROW!
        Space-age technology meets automotive care.`,
    },
    textPrompt: {
      tone: 'Futuristic, exciting, wonder-filled',
      vocabulary: ['atomic', 'space-age', 'future', 'incredible', 'amazing', 'rocket'],
    },
    carStyle: `1950s car reimagined with rocket fins and chrome, looking like
      a space vehicle. Futuristic lighting with lens flares. Flying car vibes.`,
    composition: `Dynamic diagonal composition. Space background with planets.
      Rocket trails and speed lines. Chrome reflections.`,
    avoidList: `Modern sci-fi aesthetics, dark/dystopian themes, realistic space,
      contemporary vehicles.`,
    eraVehicles: ['cadillac-59', 'corvette-58', 'tbird-55'],
    mockupScenes: ['comic book stand', 'retro diner', 'collectors display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1960s Comic Book Styles
  {
    id: 'comic-60s-marvel',
    name: 'Silver Age Marvel',
    category: 'nostalgic',
    era: '1960s',
    style: 'comic-book',
    shortDescription: 'Kirby crackle and dynamic poses',
    previewColors: ['#FF0000', '#0000CD', '#FFD700', '#000000'],
    imagePrompt: {
      style: `1960s Silver Age Marvel Comics style. Jack Kirby-inspired dynamic poses
        and "Kirby Crackle" energy effects. Bold, muscular compositions.
        High contrast with heavy blacks. Dramatic foreshortening.`,
      colorPalette: `Marvel red (#FF0000), Marvel blue (#0000CD), heroic gold (#FFD700),
        heavy blacks for shadows. Four-color printing aesthetic with bold primaries.`,
      typography: `Bold condensed sans-serif, often italicized for action.
        Sound effects in explosive, jagged letters. "THWAK!" "KRAKOOM!" style.
        Marvel-style logo treatment with bold outlines.`,
      elements: `Kirby Crackle energy dots, dynamic action lines, cosmic swirls,
        dramatic foreshortening, explosive backgrounds. Panel-breaking compositions.`,
      mood: `Powerful, dynamic, heroic. Every oil change is an EPIC BATTLE
        against wear and tear! High energy and excitement.`,
    },
    textPrompt: {
      tone: 'Epic, powerful, action-packed',
      vocabulary: ['mighty', 'incredible', 'unstoppable', 'power', 'battle', 'triumph'],
    },
    carStyle: `1960s muscle car in powerful, dynamic pose with Kirby Crackle
      energy surrounding it. Low angle, heroic stance. Breaking out of the frame.`,
    composition: `Dramatic foreshortening with car coming toward viewer.
      Kirby Crackle dots as energy background. Diagonal panel borders.`,
    avoidList: `Static poses, minimal design, realistic rendering,
      soft colors, quiet compositions.`,
    eraVehicles: ['mustang-67', 'camaro-69', 'charger-68', 'corvette-63'],
    mockupScenes: ['spinner rack', 'collectors wall', 'comic shop display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'comic-60s-pop-art',
    name: 'Pop Art (Lichtenstein)',
    category: 'nostalgic',
    era: '1960s',
    style: 'comic-book',
    shortDescription: 'Ben-Day dots and speech bubbles',
    previewColors: ['#FFFF00', '#FF0000', '#0000FF', '#FFFFFF'],
    imagePrompt: {
      style: `Roy Lichtenstein Pop Art style. Large visible Ben-Day dots.
        Bold black outlines. Primary colors. Single dramatic moment frozen.
        Comic panel aesthetic blown up to gallery size.`,
      colorPalette: `Bold yellow (#FFFF00), bright red (#FF0000), pure blue (#0000FF),
        stark white (#FFFFFF). Large visible Ben-Day dots in these colors.
        Heavy black outlines around everything.`,
      typography: `Comic book speech bubbles with bold sans-serif text.
        All caps. Thought bubbles. Sound effects in explosive shapes.
        Text as visual element, not just communication.`,
      elements: `Oversized Ben-Day dots as prominent pattern. Speech bubbles
        with bold proclamations. Dramatic single-moment composition.
        Bold black outlines on everything.`,
      mood: `Dramatic, ironic, art-gallery elevated. A single moment of
        automotive revelation captured in fine art style.`,
    },
    textPrompt: {
      tone: 'Dramatic, ironic, bold',
      vocabulary: ['suddenly', 'amazing', 'wow', 'incredible', 'perfect'],
    },
    carStyle: `1960s car rendered in flat Pop Art style with visible Ben-Day
      dots. Bold black outlines. Simplified forms. Single dramatic angle.`,
    composition: `Single dramatic moment, tightly cropped. Large speech bubble
      with key message. Ben-Day dots as dominant texture.`,
    avoidList: `Realistic rendering, subtle colors, complex compositions,
      photographic quality, modern vehicles.`,
    eraVehicles: ['mustang-67', 'corvette-63', 'camaro-69'],
    mockupScenes: ['art gallery', 'modern museum', 'design studio'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'comic-60s-underground',
    name: 'Underground Comix',
    category: 'nostalgic',
    era: '1960s',
    style: 'comic-book',
    shortDescription: 'Psychedelic counterculture style',
    previewColors: ['#FF00FF', '#00FF00', '#FF6600', '#FFFF00'],
    imagePrompt: {
      style: `1960s Underground Comix style. Psychedelic, surreal artwork.
        R. Crumb and Zap Comix influenced. Exaggerated proportions, melting
        forms, trippy patterns. Hand-drawn, rough linework.`,
      colorPalette: `Psychedelic magenta (#FF00FF), acid green (#00FF00),
        orange (#FF6600), yellow (#FFFF00). Clashing, vibrant combinations.
        Swirling gradients and rainbow effects.`,
      typography: `Hand-drawn, wobbly letters. Organic, flowing text that
        curves and bends. Bubble letters. Counter-culture aesthetic.
        Text integrated into psychedelic patterns.`,
      elements: `Swirling patterns, melting forms, paisley, flowers, peace
        symbols, mushrooms, cosmic eyes. Surreal, dreamy backgrounds.`,
      mood: `Trippy, free-spirited, counterculture cool. Far out automotive
        vibes. The mechanic as psychedelic guru.`,
    },
    textPrompt: {
      tone: 'Trippy, free-spirited, groovy',
      vocabulary: ['groovy', 'far out', 'cosmic', 'trippy', 'peace', 'cool'],
    },
    carStyle: `1960s VW Bus or muscle car with psychedelic paint job,
      melting slightly, surrounded by swirling patterns. Peace symbols
      and flowers incorporated.`,
    composition: `Swirling, organic layout without rigid panels. Elements
      flow into each other. Central subject surrounded by psychedelic patterns.`,
    avoidList: `Corporate look, rigid layouts, conservative colors,
      modern vehicles, clean minimalism.`,
    eraVehicles: ['corvette-63', 'mustang-67', 'gto-65'],
    mockupScenes: ['head shop poster', 'dorm room wall', 'record store'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'comic-60s-spy',
    name: 'Spy Comics',
    category: 'nostalgic',
    era: '1960s',
    style: 'comic-book',
    shortDescription: 'International intrigue and gadgets',
    previewColors: ['#000000', '#C0C0C0', '#FFD700', '#DC143C'],
    imagePrompt: {
      style: `1960s Spy Comics and espionage thriller style. Sleek, sophisticated.
        James Bond influence. Exotic locations, gadgets, danger. High contrast
        with dramatic shadows. Elegant and dangerous.`,
      colorPalette: `Tuxedo black (#000000), sleek silver (#C0C0C0), gold accents (#FFD700),
        femme fatale red (#DC143C). Gun barrel gray. Martini olive hints.`,
      typography: `Sleek, sophisticated sans-serif. Title in gold with shadow.
        International intrigue feeling. Dossier-style text treatments.
        Bold but elegant.`,
      elements: `Gun barrels, silhouettes, exotic locations, gadgets and gizmos,
        tuxedos and evening gowns (suggested, not shown). Casino chips, martini glasses.`,
      mood: `Sophisticated danger, international intrigue. Your car gets
        secret agent level treatment. Licensed to thrill.`,
    },
    textPrompt: {
      tone: 'Sophisticated, dangerous, intriguing',
      vocabulary: ['secret', 'elite', 'mission', 'classified', 'agent', 'exclusive'],
    },
    carStyle: `1960s Aston Martin type sports car, sleek and dangerous,
      emerging from shadows. Chrome glinting. Gadget-equipped appearance.`,
    composition: `Dramatic silhouette composition. Gun barrel spiral frame option.
      Mysterious shadows. Diagonal compositions suggesting danger.`,
    avoidList: `Cute or friendly imagery, bright cheerful colors,
      family-oriented themes, casual aesthetic.`,
    eraVehicles: ['corvette-63', 'mustang-67', 'charger-68'],
    mockupScenes: ['casino display', 'luxury hotel', 'secret lair'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },

  // 1970s Comic Book Styles
  {
    id: 'comic-70s-bronze-age',
    name: 'Bronze Age Gritty',
    category: 'nostalgic',
    era: '1970s',
    style: 'comic-book',
    shortDescription: 'Urban anti-heroes and darker tones',
    previewColors: ['#8B4513', '#4A4A4A', '#FF6600', '#1C1C1C'],
    imagePrompt: {
      style: `1970s Bronze Age Comics style. Grittier, more realistic than Silver Age.
        Urban settings, anti-heroes, social relevance. Neal Adams influenced
        realistic anatomy and dramatic lighting. Darker color palette.`,
      colorPalette: `Gritty brown (#8B4513), urban gray (#4A4A4A), warning orange (#FF6600),
        shadow black (#1C1C1C). Muted, earthier colors. Less bright primaries.`,
      typography: `More mature, serious fonts. Less exclamation marks.
        Grounded, realistic text. Bold but not bombastic.
        Urban, street-level feeling.`,
      elements: `City streets, urban decay, streetlights, graffiti hints,
        chain link fences. Gritty urban environment. Realistic vehicles.`,
      mood: `Gritty, realistic, street-level heroism. Your neighborhood
        mechanic fighting the good fight against automotive problems.`,
    },
    textPrompt: {
      tone: 'Gritty, realistic, determined',
      vocabulary: ['street', 'tough', 'real', 'honest', 'fight', 'neighborhood'],
    },
    carStyle: `1970s muscle car in urban setting, realistic rendering,
      dramatic streetlight shadows. Working class hero vehicle.`,
    composition: `Street-level perspective, urban backgrounds. Dramatic
      lighting from streetlamps. More realistic proportions.`,
    avoidList: `Bright cheerful colors, cosmic/fantasy elements, cute imagery,
      clean suburban settings.`,
    eraVehicles: ['challenger-71', 'trans-am-77', 'cuda-70', 'el-camino-72'],
    mockupScenes: ['urban newsstand', 'city street', 'warehouse'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'comic-70s-kung-fu',
    name: 'Kung Fu Comics',
    category: 'nostalgic',
    era: '1970s',
    style: 'comic-book',
    shortDescription: 'Martial arts action and Eastern motifs',
    previewColors: ['#FF0000', '#FFD700', '#000000', '#FFFFFF'],
    imagePrompt: {
      style: `1970s Kung Fu Comics style. Martial arts action with Eastern influences.
        Dynamic action poses with speed lines. Asian-inspired design elements.
        High-kicking action and philosophy combined.`,
      colorPalette: `Dragon red (#FF0000), gold (#FFD700), ink black (#000000),
        paper white (#FFFFFF). Asian brush painting influences.
        Bold contrasts.`,
      typography: `Asian-inspired brush stroke lettering mixed with action comics fonts.
        Sound effects in martial arts style. Dynamic, angular arrangements.`,
      elements: `Action speed lines, martial arts poses, dragon motifs,
        yin-yang symbols, bamboo, Asian architecture hints. Flying kicks.`,
      mood: `Powerful, disciplined, honorable. Master mechanics with
        ancient automotive wisdom. Precision and power combined.`,
    },
    textPrompt: {
      tone: 'Powerful, disciplined, wise',
      vocabulary: ['master', 'precision', 'honor', 'power', 'skill', 'warrior'],
    },
    carStyle: `1970s car in dynamic action pose, as if performing martial arts.
      Speed lines showing movement. Dragon decal possibilities.`,
    composition: `Dynamic diagonal action lines. Central subject in powerful pose.
      Asian-inspired border elements.`,
    avoidList: `Static compositions, soft imagery, realistic rendering,
      non-action themes.`,
    eraVehicles: ['datsun-z', 'challenger-71', 'trans-am-77'],
    mockupScenes: ['martial arts school', 'action display', 'dojo wall'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'comic-70s-heavy-metal',
    name: 'Heavy Metal Magazine',
    category: 'nostalgic',
    era: '1970s',
    style: 'comic-book',
    shortDescription: 'Epic fantasy and airbrushed art',
    previewColors: ['#4B0082', '#00CED1', '#FF6347', '#C0C0C0'],
    imagePrompt: {
      style: `Heavy Metal Magazine style. Adult fantasy illustration with
        airbrushed perfection. Epic scope, sensual curves, chrome and flesh.
        Moebius and Frazetta influences. Otherworldly and epic.`,
      colorPalette: `Deep purple (#4B0082), cosmic teal (#00CED1), sunset orange (#FF6347),
        metallic chrome (#C0C0C0). Airbrushed gradients. Otherworldly colors.`,
      typography: `Elegant, futuristic fonts with chrome effects. Airbrushed
        3D letters. Epic, cinematic title treatments. Sophisticated layout.`,
      elements: `Cosmic landscapes, chrome surfaces, mysterious atmospheres,
        alien skies, epic vistas. Airbrushed perfection on surfaces.`,
      mood: `Epic, otherworldly, sophisticated adult fantasy. Your car enters
        a realm of legendary automotive care. Transcendent experience.`,
    },
    textPrompt: {
      tone: 'Epic, sophisticated, transcendent',
      vocabulary: ['legendary', 'epic', 'realm', 'transcend', 'ultimate', 'journey'],
    },
    carStyle: `1970s car rendered with airbrushed perfection, chrome gleaming,
      in otherworldly landscape. Almost alive, sensual curves emphasized.`,
    composition: `Epic landscape format. Car as hero in vast setting.
      Dramatic lighting from multiple alien suns or moons.`,
    avoidList: `Cartoonish rendering, mundane settings, amateur artwork,
      cheap printing aesthetic.`,
    eraVehicles: ['trans-am-77', 'corvette-73', 'challenger-71'],
    mockupScenes: ['art gallery', 'collector frame', 'adult bookstore'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'comic-70s-blaxploitation',
    name: 'Blaxploitation Style',
    category: 'nostalgic',
    era: '1970s',
    style: 'comic-book',
    shortDescription: 'Urban cool and funky typography',
    previewColors: ['#FF6600', '#800080', '#FFD700', '#000000'],
    imagePrompt: {
      style: `1970s Blaxploitation movie poster comic style. Bold, funky, urban cool.
        Afros, platform shoes suggested in silhouette. Vibrant, bold design.
        Street-smart and stylish.`,
      colorPalette: `Funky orange (#FF6600), royal purple (#800080), gold bling (#FFD700),
        soul black (#000000). Bold, vibrant combinations. Gradient backgrounds.`,
      typography: `Funky display fonts, groovy curves. 3D block letters with
        bold outlines. Stylized, urban typography. Big and bold titles.`,
      elements: `Urban skylines, disco balls, funky patterns, gold chains,
        platform silhouettes. 70s fashion hints. Muscle cars prominent.`,
      mood: `Cool, confident, street-smart. The baddest auto shop in town.
        Funky fresh automotive service. Right on!`,
    },
    textPrompt: {
      tone: 'Cool, confident, funky',
      vocabulary: ['cool', 'smooth', 'bad', 'righteous', 'solid', 'funky'],
    },
    carStyle: `1970s muscle car or Cadillac, low rider stance, gleaming chrome,
      urban backdrop. Cool and confident. Rolling art.`,
    composition: `Bold central composition with funky border elements.
      Urban skyline backdrop. Diagonal energy lines.`,
    avoidList: `Stereotypical imagery, offensive content, suburban themes,
      conservative design.`,
    eraVehicles: ['el-camino-72', 'challenger-71', 'trans-am-77'],
    mockupScenes: ['urban record shop', '70s barbershop', 'soul food restaurant'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1980s Comic Book Styles
  {
    id: 'comic-80s-dark-knight',
    name: 'Dark Knight Returns',
    category: 'nostalgic',
    era: '1980s',
    style: 'comic-book',
    shortDescription: 'Heavy shadows and noir style',
    previewColors: ['#1a1a2e', '#16213e', '#FFD700', '#8B0000'],
    imagePrompt: {
      style: `Frank Miller's Dark Knight Returns style. Heavy black inks,
        stark contrast between light and shadow. Dramatic noir lighting with
        rain-soaked streets. Bold, angular compositions. Gritty urban atmosphere.`,
      colorPalette: `Deep blacks (#1a1a2e, #16213e) dominate. Accent with
        lightning yellow (#FFD700) and blood red (#8B0000). Minimal color,
        mostly monochromatic with strategic pops.`,
      typography: `Bold condensed sans-serif headlines, slightly tilted.
        Hand-lettered appearance with rough edges. Text boxes with sharp corners.
        Sound effects in angular, explosive letterforms.`,
      elements: `Rain streaks, lightning bolts, city skyline silhouettes,
        dramatic spotlights, cracked concrete, urban decay details.`,
      mood: `Intense, dramatic, powerful, brooding. A sense of urban justice
        and unstoppable force. Dark but heroic.`,
    },
    textPrompt: {
      tone: 'Intense, dramatic, powerful',
      vocabulary: ['justice', 'power', 'unstoppable', 'legendary', 'returns', 'darkness'],
    },
    carStyle: `Aggressive muscle car silhouette emerging from shadows.
      Menacing headlights cutting through rain. Low angle, powerful stance.
      The car as a weapon.`,
    composition: `Dutch angles, dramatic low angles looking up.
      Strong diagonal compositions. Silhouettes against lightning or spotlight.`,
    avoidList: `Bright cheerful colors, cute elements, rounded fonts,
      daytime scenes, pastoral settings.`,
    eraVehicles: ['gnx-87', 'corvette-85', 'countach'],
    mockupScenes: ['rain-soaked street', 'dark alley', 'urban noir'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'comic-80s-neon-action',
    name: 'Neon Action',
    category: 'nostalgic',
    era: '1980s',
    style: 'comic-book',
    shortDescription: 'Bright neons and chrome accents',
    previewColors: ['#FF00FF', '#00FFFF', '#FF6600', '#1C1C1C'],
    imagePrompt: {
      style: `1980s Neon Action Comics style. Bright neon colors on dark backgrounds.
        Chrome effects, laser beams, high-tech gadgets. Action movie comic adaptations
        aesthetic. Bold and explosive.`,
      colorPalette: `Hot neon pink (#FF00FF), electric cyan (#00FFFF), action orange (#FF6600),
        black backgrounds (#1C1C1C). Neon glow effects. Chrome reflections.`,
      typography: `Chrome 3D letters with neon glow. Bold italics suggesting speed.
        Explosive sound effects. Movie poster style titles.`,
      elements: `Laser beams, explosions, chrome surfaces, neon signs,
        action poses, speed lines. High-tech gadgetry.`,
      mood: `High-octane action, explosive excitement. Your car gets
        blockbuster treatment. Maximum power!`,
    },
    textPrompt: {
      tone: 'Explosive, exciting, maximum',
      vocabulary: ['maximum', 'turbo', 'power', 'action', 'extreme', 'blast'],
    },
    carStyle: `1980s sports car in action pose, neon lights reflecting off
      chrome and paint. Speed lines and explosions around it.`,
    composition: `Dynamic diagonal action. Explosions in background.
      Neon light trails. Speed blur effects.`,
    avoidList: `Muted colors, static poses, quiet compositions,
      vintage/nostalgic softness.`,
    eraVehicles: ['testarossa', 'countach', 'corvette-85', 'gnx-87'],
    mockupScenes: ['arcade', 'video store', 'action figure display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'comic-80s-manga',
    name: 'Manga Influence',
    category: 'nostalgic',
    era: '1980s',
    style: 'comic-book',
    shortDescription: 'Speed lines and dynamic angles',
    previewColors: ['#FFFFFF', '#000000', '#FF0000', '#0000FF'],
    imagePrompt: {
      style: `1980s Manga-influenced American comics style. Akira and Speed Racer
        influences. Dynamic speed lines, expressive effects, dramatic angles.
        High contrast black and white with spot color.`,
      colorPalette: `Primarily black and white with strategic spot colors:
        action red (#FF0000) and cool blue (#0000FF). Screentone patterns.
        High contrast.`,
      typography: `Dynamic manga-style sound effects. Bold katakana-influenced
        English letters. Speed lines through text. Explosive arrangements.`,
      elements: `Speed lines (concentrated and radiating), motion blur,
        dramatic zoom effects, screentone patterns, impact frames.`,
      mood: `Fast, dynamic, intense. Every service is a high-speed chase.
        Dramatic and exciting like a manga action scene.`,
    },
    textPrompt: {
      tone: 'Fast, intense, dynamic',
      vocabulary: ['speed', 'maximum', 'intense', 'power', 'ultimate', 'racing'],
    },
    carStyle: `1980s car in extreme dynamic angle, speed lines radiating,
      as if from anime chase scene. Dramatic foreshortening.`,
    composition: `Extreme angles, radiating speed lines, impact frames.
      Manga panel-style dramatic breakouts.`,
    avoidList: `Static poses, realistic rendering, muted colors,
      slow/calm imagery.`,
    eraVehicles: ['delorean', 'testarossa', 'gnx-87'],
    mockupScenes: ['manga shop', 'anime display', 'import store'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'comic-80s-indie',
    name: 'Indie Comics',
    category: 'nostalgic',
    era: '1980s',
    style: 'comic-book',
    shortDescription: 'Black & white with spot color',
    previewColors: ['#000000', '#FFFFFF', '#FF4500', '#4A4A4A'],
    imagePrompt: {
      style: `1980s Independent Comics style. Black and white with occasional
        spot color. More personal, artistic vision. Love and Rockets, Cerebus
        influenced. Detailed linework, alternative aesthetic.`,
      colorPalette: `Primarily black and white. Single spot color for emphasis:
        often orange-red (#FF4500). Gray tones (#4A4A4A) for depth.
        Artistic, limited palette.`,
      typography: `Hand-lettered appearance, personal style. Alternative fonts.
        Text integrated into art. Less commercial, more artistic.`,
      elements: `Detailed linework, cross-hatching, stippling. Personal,
        slice-of-life details. Urban environments. Thoughtful compositions.`,
      mood: `Personal, authentic, artistic. The indie mechanic who truly
        cares about your car. Real craftsmanship.`,
    },
    textPrompt: {
      tone: 'Authentic, personal, crafted',
      vocabulary: ['real', 'craft', 'care', 'honest', 'quality', 'personal'],
    },
    carStyle: `1980s car rendered with detailed linework, cross-hatching
      for shadows. Artistic, personal interpretation. Character over flash.`,
    composition: `Thoughtful, artistic composition. Not flashy but meaningful.
      Strong use of negative space. Detailed textures.`,
    avoidList: `Flashy commercial styling, bright colors, bombastic action,
      corporate feeling.`,
    eraVehicles: ['corvette-85', 'delorean', 'gnx-87'],
    mockupScenes: ['indie bookstore', 'coffee shop', 'art gallery'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
];

// ============================================================================
// MOVIE POSTER STYLES (16 themes)
// ============================================================================

export const moviePosterThemes: NostalgicThemeDefinition[] = [
  // 1950s Movie Poster Styles
  {
    id: 'poster-50s-drive-in',
    name: 'Drive-In B-Movie',
    category: 'nostalgic',
    era: '1950s',
    style: 'movie-poster',
    shortDescription: 'Lurid colors and screaming text',
    previewColors: ['#FF0000', '#FFFF00', '#000000', '#00FF00'],
    imagePrompt: {
      style: `1950s Drive-In B-Movie poster style. Lurid, exaggerated colors.
        Screaming headlines. Over-the-top dramatic imagery. Cheap but
        charming aesthetic. Attack of the killer everything!`,
      colorPalette: `Screaming red (#FF0000), warning yellow (#FFFF00), night black (#000000),
        radioactive green (#00FF00). Clashing, attention-grabbing combinations.`,
      typography: `Screaming all-caps headlines, often at angles. Dripping
        or shaking letters. Multiple fonts competing for attention.
        "THEY CAME FROM..." style.`,
      elements: `Dramatic beams of light, screaming (implied) figures,
        giant objects, city destruction hints, classic cars prominently featured.`,
      mood: `Over-the-top dramatic, campy fun, cult classic vibes. Your car
        faces THE ATTACK OF ENGINE PROBLEMS! Theatrical drama.`,
    },
    textPrompt: {
      tone: 'Dramatic, campy, over-the-top',
      vocabulary: ['attack', 'terror', 'incredible', 'amazing', 'giant', 'monster'],
    },
    carStyle: `1950s car prominently featured, either as hero vehicle or
      dramatically lit centerpiece. Drive-in screen aesthetic.`,
    composition: `Dramatic diagonal compositions, multiple competing focal points,
      theatrical staging. Movie poster format with billing block area.`,
    avoidList: `Subtle design, minimal text, sophisticated aesthetic,
      modern vehicles.`,
    eraVehicles: ['chevy-57', 'cadillac-59', 'tbird-55'],
    mockupScenes: ['drive-in screen', 'movie theater lobby', 'vintage poster display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'poster-50s-hitchcock',
    name: 'Hitchcock Thriller',
    category: 'nostalgic',
    era: '1950s',
    style: 'movie-poster',
    shortDescription: 'Vertigo spirals and elegant danger',
    previewColors: ['#FF4500', '#2F4F4F', '#FFD700', '#FFFFFF'],
    imagePrompt: {
      style: `Alfred Hitchcock movie poster style. Saul Bass influenced design.
        Vertigo spirals, silhouettes, sophisticated danger. Elegant but menacing.
        Graphic design masterwork.`,
      colorPalette: `Vertigo orange (#FF4500), dark teal (#2F4F4F), elegant gold (#FFD700),
        stark white (#FFFFFF). Bold, limited palette. High contrast.`,
      typography: `Elegant sans-serif, often Futura or similar. Sophisticated
        arrangement. Text as design element. Saul Bass inspired layouts.`,
      elements: `Spiral patterns, silhouettes, fragmented images, mysterious
        figures, elegant danger, graphic shapes.`,
      mood: `Sophisticated suspense, elegant danger. Something isn't quite right
        with your car... but we'll solve the mystery. Thrilling service.`,
    },
    textPrompt: {
      tone: 'Sophisticated, suspenseful, elegant',
      vocabulary: ['mystery', 'suspense', 'discover', 'reveal', 'secret', 'intrigue'],
    },
    carStyle: `1950s car as silhouette or fragmented Saul Bass style imagery.
      Mysterious, elegant. Part of larger graphic composition.`,
    composition: `Saul Bass inspired graphic design. Spirals, fragments,
      silhouettes. Sophisticated layout with intentional negative space.`,
    avoidList: `Cluttered design, cheap aesthetic, bright cheerful colors,
      obvious imagery.`,
    eraVehicles: ['tbird-55', 'corvette-58', 'cadillac-59'],
    mockupScenes: ['art house theater', 'design museum', 'sophisticated lobby'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'poster-50s-rebel',
    name: 'Rebel Without a Cause',
    category: 'nostalgic',
    era: '1950s',
    style: 'movie-poster',
    shortDescription: 'James Dean cool and leather jackets',
    previewColors: ['#DC143C', '#000000', '#F5F5DC', '#4169E1'],
    imagePrompt: {
      style: `1950s teenage rebel movie poster style. James Dean, Marlon Brando
        cool. Leather jacket silhouettes, brooding poses. Red and blue dramatic
        lighting. Teen angst meets automotive passion.`,
      colorPalette: `Rebel red (#DC143C), leather black (#000000), cream (#F5F5DC),
        denim blue (#4169E1). Dramatic, moody colors.`,
      typography: `Bold dramatic titles with casual, rebellious energy.
        Hand-painted movie poster style. Stars' names prominent.`,
      elements: `Leather jacket suggestions, pompadour hair silhouettes,
        cigarette smoke hints, classic cars, brooding poses.`,
      mood: `Cool, rebellious, misunderstood. The auto shop for those who
        don't follow the crowd. Authentic rebel spirit.`,
    },
    textPrompt: {
      tone: 'Cool, rebellious, authentic',
      vocabulary: ['rebel', 'real', 'cool', 'ride', 'wild', 'free'],
    },
    carStyle: `1950s hot rod or muscle car, low and mean. Dramatic lighting,
      possibly in chicken run stance. Symbol of rebellion.`,
    composition: `Dramatic portrait style with car as co-star.
      Moody lighting, figure in silhouette. Classic movie poster layout.`,
    avoidList: `Happy family imagery, corporate feeling, bright cheerful colors,
      conservative design.`,
    eraVehicles: ['mercury-49', 'chevy-57', 'tbird-55'],
    mockupScenes: ['teen hangout', 'malt shop', 'drive-in'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'poster-50s-creature',
    name: 'Creature Feature',
    category: 'nostalgic',
    era: '1950s',
    style: 'movie-poster',
    shortDescription: 'Classic monsters and dramatic lighting',
    previewColors: ['#006400', '#1C1C1C', '#FFD700', '#8B4513'],
    imagePrompt: {
      style: `1950s Creature Feature movie poster style. Creature from the Black Lagoon,
        Godzilla aesthetic. Dramatic lighting, mysterious creatures (implied),
        classic monsters. Painted illustration style.`,
      colorPalette: `Creature green (#006400), shadow black (#1C1C1C), spotlight gold (#FFD700),
        swamp brown (#8B4513). Moody, mysterious colors.`,
      typography: `Dramatic 3D titles, often with texture (scales, dripping).
        Classic monster movie fonts. Theatrical billing block.`,
      elements: `Mysterious shadows, creature silhouettes, spotlights,
        dramatic landscapes, fog, water reflections.`,
      mood: `Mysterious, dramatic, thrilling. What creature lurks in your
        engine? We'll find and defeat it! Monster-slaying mechanics.`,
    },
    textPrompt: {
      tone: 'Mysterious, thrilling, dramatic',
      vocabulary: ['creature', 'lurking', 'discover', 'battle', 'defeat', 'mysterious'],
    },
    carStyle: `1950s car dramatically lit, possibly with mysterious shadow
      lurking nearby. Spotlight on the hero vehicle.`,
    composition: `Dramatic lighting from below or behind. Mysterious shadows.
      Classic creature feature staging. Theatrical composition.`,
    avoidList: `Actual monsters shown clearly, gore, child-unfriendly content,
      modern horror aesthetic.`,
    eraVehicles: ['cadillac-59', 'chevy-57', 'mercury-49'],
    mockupScenes: ['monster movie marathon', 'creature double feature', 'late night show'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1960s Movie Poster Styles
  {
    id: 'poster-60s-bond',
    name: 'Bond/Spy Film',
    category: 'nostalgic',
    era: '1960s',
    style: 'movie-poster',
    shortDescription: 'Gun barrels and international glamour',
    previewColors: ['#FFD700', '#000000', '#DC143C', '#C0C0C0'],
    imagePrompt: {
      style: `James Bond movie poster style. Robert McGinnis inspired. Glamorous,
        dangerous, international. Silhouettes, action poses, exotic locations
        implied. Sophisticated cool.`,
      colorPalette: `Bond gold (#FFD700), tuxedo black (#000000), danger red (#DC143C),
        gun metal (#C0C0C0). Elegant, high-contrast.`,
      typography: `Elegant gold typography, often with gun barrel O's.
        Sophisticated sans-serif. International feeling. 007 style numbers.`,
      elements: `Gun barrel motifs, silhouettes, action poses, gadget hints,
        playing cards, dice, martini suggestions. Exotic luxury.`,
      mood: `Sophisticated, dangerous, glamorous. Licensed to change your oil.
        Secret agent level automotive care.`,
    },
    textPrompt: {
      tone: 'Sophisticated, dangerous, glamorous',
      vocabulary: ['licensed', 'secret', 'agent', 'mission', 'elite', 'exclusive'],
    },
    carStyle: `1960s sports car (Aston Martin style), sleek and dangerous.
      Gun barrel framing option. Gadget-equipped appearance.`,
    composition: `Classic Bond poster layout with figure silhouettes,
      gun barrel framing, montage of action elements.`,
    avoidList: `Casual imagery, cheap aesthetic, family-friendly cuteness,
      non-premium feeling.`,
    eraVehicles: ['corvette-63', 'mustang-67', 'charger-68'],
    mockupScenes: ['casino entrance', 'luxury hotel', 'international airport'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'poster-60s-beach',
    name: 'Beach Party',
    category: 'nostalgic',
    era: '1960s',
    style: 'movie-poster',
    shortDescription: 'Surfboards and fun in the sun',
    previewColors: ['#FFD700', '#00CED1', '#FF6347', '#FFFFFF'],
    imagePrompt: {
      style: `1960s Beach Party movie poster style. Frankie and Annette vibes.
        Surfboards, bikinis (suggested), fun in the sun. Bright, cheerful,
        innocent fun. Beach Blanket Bingo aesthetic.`,
      colorPalette: `Sunshine yellow (#FFD700), ocean turquoise (#00CED1),
        sunset coral (#FF6347), sand white (#FFFFFF). Bright, cheerful.`,
      typography: `Fun, bouncy fonts. Often with surfboard or wave motifs.
        Casual, friendly, party vibes. Exclamation points!`,
      elements: `Surfboards, beach umbrellas, waves, palm trees, classic cars
        on the beach, tiki elements. Summer fun imagery.`,
      mood: `Fun, carefree, sunny. Summer automotive care is a beach party!
        Good vibes and great service.`,
    },
    textPrompt: {
      tone: 'Fun, sunny, carefree',
      vocabulary: ['summer', 'fun', 'beach', 'party', 'surf', 'cool'],
    },
    carStyle: `1960s convertible on the beach, surfboards nearby.
      Sunny, cheerful lighting. Summer road trip ready.`,
    composition: `Bright, cheerful composition. Beach setting.
      Multiple fun elements. Party poster layout.`,
    avoidList: `Dark moody colors, serious themes, winter imagery,
      corporate feeling.`,
    eraVehicles: ['mustang-67', 'corvette-63', 'camaro-69'],
    mockupScenes: ['beach boardwalk', 'surf shop', 'summer vacation'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'poster-60s-giallo',
    name: 'Italian Giallo',
    category: 'nostalgic',
    era: '1960s',
    style: 'movie-poster',
    shortDescription: 'Bold reds and artistic mystery',
    previewColors: ['#8B0000', '#000000', '#FFD700', '#4B0082'],
    imagePrompt: {
      style: `1960s Italian Giallo movie poster style. Bold, artistic, mysterious.
        Blood reds, artistic compositions, fashion-forward. Dario Argento
        aesthetic. High art meets thriller.`,
      colorPalette: `Giallo red (#8B0000), shadow black (#000000), gold accent (#FFD700),
        mysterious purple (#4B0082). Bold, artistic palette.`,
      typography: `Elegant Italian typography, often with dramatic angles.
        Artistic arrangement. Fashion magazine meets thriller.`,
      elements: `Mysterious gloved hands, dramatic eyes, artistic blood splashes,
        fashion elements, Italian style. Sophisticated danger.`,
      mood: `Artistic, mysterious, fashionable danger. Italian automotive artistry.
        Style and substance combined.`,
    },
    textPrompt: {
      tone: 'Artistic, mysterious, sophisticated',
      vocabulary: ['mysterious', 'elegant', 'artistic', 'style', 'danger', 'fashion'],
    },
    carStyle: `1960s Italian sports car (Alfa Romeo, Ferrari style) in
      artistic composition. Dramatic lighting, mysterious atmosphere.`,
    composition: `Artistic, fashion-forward layout. Dramatic angles.
      Sophisticated European design sensibility.`,
    avoidList: `Gore, cheap horror aesthetic, American mainstream style,
      casual imagery.`,
    eraVehicles: ['corvette-63', 'mustang-67', 'gto-65'],
    mockupScenes: ['Italian cinema', 'art gallery', 'fashion boutique'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'personal_card'],
  },
  {
    id: 'poster-60s-psychedelic',
    name: 'Psychedelic Trip',
    category: 'nostalgic',
    era: '1960s',
    style: 'movie-poster',
    shortDescription: 'Swirling colors and flower power',
    previewColors: ['#FF00FF', '#FFFF00', '#00FF00', '#FF6600'],
    imagePrompt: {
      style: `1960s Psychedelic movie poster style. Yellow Submarine, Easy Rider
        influences. Swirling colors, trippy patterns, flower power.
        Mind-expanding visual experience.`,
      colorPalette: `Psychedelic pink (#FF00FF), acid yellow (#FFFF00),
        electric green (#00FF00), orange (#FF6600). Swirling gradients.`,
      typography: `Flowing, organic psychedelic lettering. Bubble letters
        that morph and flow. Art Nouveau meets acid trip.`,
      elements: `Swirling patterns, peace signs, flowers, mushrooms,
        cosmic imagery, melting forms. Mind-expansion visuals.`,
      mood: `Trippy, expansive, far out. A mind-blowing automotive experience.
        Tune in, turn on, drive on.`,
    },
    textPrompt: {
      tone: 'Trippy, expansive, groovy',
      vocabulary: ['cosmic', 'groovy', 'trip', 'peace', 'mind', 'expand'],
    },
    carStyle: `1960s car (or VW Bus) with psychedelic paint job,
      melting into swirling background patterns.`,
    composition: `Swirling, organic composition. No rigid structure.
      Elements flow into each other. Cosmic expansion.`,
    avoidList: `Corporate rigidity, conservative colors, structured layouts,
      mainstream aesthetic.`,
    eraVehicles: ['corvette-63', 'mustang-67', 'camaro-69'],
    mockupScenes: ['head shop', 'record store', 'concert poster wall'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1970s Movie Poster Styles
  {
    id: 'poster-70s-grindhouse',
    name: 'Grindhouse',
    category: 'nostalgic',
    era: '1970s',
    style: 'movie-poster',
    shortDescription: 'Exploitation style and scratched film',
    previewColors: ['#FF4500', '#FFD700', '#000000', '#8B0000'],
    imagePrompt: {
      style: `1970s Grindhouse exploitation movie poster style. Scratched, worn film aesthetic.
        Bold, trashy, attention-grabbing. Missing reels, age damage.
        Pulpy, lurid, unforgettable.`,
      colorPalette: `Exploitation orange (#FF4500), grindhouse gold (#FFD700),
        film black (#000000), blood red (#8B0000). Worn, faded colors.`,
      typography: `Bold, screaming headlines. Multiple competing fonts.
        Wear and tear on letters. "THEY CALL HIM..." style.`,
      elements: `Film scratches, reel marks, age spots, torn edges.
        Action poses, car chases implied. Exploitation aesthetic.`,
      mood: `Raw, gritty, unforgettable. The auto shop experience you'll
        never forget. No holds barred automotive care.`,
    },
    textPrompt: {
      tone: 'Raw, bold, unforgettable',
      vocabulary: ['raw', 'real', 'wild', 'unforgettable', 'extreme', 'legendary'],
    },
    carStyle: `1970s muscle car in action, possibly mid-chase or stunt.
      Scratched film overlay. Exploitation movie hero vehicle.`,
    composition: `Worn movie poster with scratches and damage.
      Bold, attention-grabbing layout. Grindhouse aesthetic.`,
    avoidList: `Clean polished look, corporate aesthetic, family-friendly,
      subtle design.`,
    eraVehicles: ['challenger-71', 'trans-am-77', 'cuda-70', 'el-camino-72'],
    mockupScenes: ['42nd street theater', 'drive-in', 'video rental'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'poster-70s-disco',
    name: 'Disco Fever',
    category: 'nostalgic',
    era: '1970s',
    style: 'movie-poster',
    shortDescription: 'Glitter and mirror ball glamour',
    previewColors: ['#FFD700', '#C0C0C0', '#FF1493', '#4B0082'],
    imagePrompt: {
      style: `1970s Disco movie poster style. Saturday Night Fever, Thank God It's Friday.
        Glitter, mirror balls, dance floor glamour. Polyester suits and
        platform shoes suggested in silhouette.`,
      colorPalette: `Disco gold (#FFD700), mirror ball silver (#C0C0C0),
        hot pink (#FF1493), deep purple (#4B0082). Glitter effects.`,
      typography: `Glamorous disco fonts, often with glitter or chrome effect.
        Funky, stylized letters. Dance floor ready.`,
      elements: `Mirror ball reflections, dance floor patterns, glitter,
        disco lights, funky silhouettes. Night fever atmosphere.`,
      mood: `Glamorous, fun, fever-pitch excitement. Saturday night automotive
        service. Disco inferno of great deals!`,
    },
    textPrompt: {
      tone: 'Glamorous, funky, fever-pitch',
      vocabulary: ['fever', 'dance', 'night', 'groove', 'funky', 'boogie'],
    },
    carStyle: `1970s car (Lincoln, Cadillac) with disco ball reflections,
      glitter effects. Night club parking lot glamour.`,
    composition: `Dance floor inspired layout. Mirror ball lighting effects.
      Glamorous, nightlife composition.`,
    avoidList: `Daytime imagery, work clothes, conservative aesthetic,
      suburban normalcy.`,
    eraVehicles: ['el-camino-72', 'trans-am-77', 'challenger-71'],
    mockupScenes: ['disco entrance', 'nightclub', 'roller rink'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'poster-70s-road-movie',
    name: 'Road Movie',
    category: 'nostalgic',
    era: '1970s',
    style: 'movie-poster',
    shortDescription: 'Open highways and dusty freedom',
    previewColors: ['#DAA520', '#87CEEB', '#8B4513', '#F5F5DC'],
    imagePrompt: {
      style: `1970s Road Movie poster style. Easy Rider, Vanishing Point, Two-Lane Blacktop.
        Open highways, desert freedom, dust and sun. Counter-culture journey.
        Freedom on four wheels.`,
      colorPalette: `Desert gold (#DAA520), open sky blue (#87CEEB),
        road dust brown (#8B4513), cream (#F5F5DC). Natural, earthy.`,
      typography: `Free-spirited fonts, often hand-painted appearance.
        Road sign influences. Journey-focused text.`,
      elements: `Open highways, desert landscapes, gas stations, motels,
        road signs, dust clouds. Freedom imagery.`,
      mood: `Free, adventurous, soul-searching. The open road calls.
        Your car's journey to ultimate freedom and performance.`,
    },
    textPrompt: {
      tone: 'Free, adventurous, soul-searching',
      vocabulary: ['freedom', 'road', 'journey', 'ride', 'open', 'horizon'],
    },
    carStyle: `1970s muscle car on open highway, dust trailing,
      sun setting. Symbol of freedom and rebellion.`,
    composition: `Wide landscape format. Open road stretching to horizon.
      Car as symbol of freedom. Big sky country.`,
    avoidList: `Urban settings, corporate imagery, confined spaces,
      mainstream commercial look.`,
    eraVehicles: ['challenger-71', 'trans-am-77', 'el-camino-72'],
    mockupScenes: ['roadside diner', 'gas station', 'motel office'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'poster-70s-disaster',
    name: 'Disaster Epic',
    category: 'nostalgic',
    era: '1970s',
    style: 'movie-poster',
    shortDescription: 'Towering infernos and star-studded casts',
    previewColors: ['#FF4500', '#FFD700', '#000000', '#4169E1'],
    imagePrompt: {
      style: `1970s Disaster Movie poster style. The Towering Inferno, Earthquake,
        The Poseidon Adventure. Epic scale, multiple storylines, star-studded.
        Dramatic destruction and heroism.`,
      colorPalette: `Disaster orange (#FF4500), gold (#FFD700), smoke black (#000000),
        water blue (#4169E1). Dramatic, intense colors.`,
      typography: `Epic disaster movie fonts, large and imposing. Star names
        prominently displayed. Multiple storyline suggestions.`,
      elements: `Flames, explosions, dramatic rescues (implied), falling debris,
        heroic figures, multiple vignettes.`,
      mood: `Epic, dramatic, heroic. When automotive disaster strikes,
        we're the heroes who save the day! All-star service.`,
    },
    textPrompt: {
      tone: 'Epic, heroic, dramatic',
      vocabulary: ['epic', 'disaster', 'hero', 'save', 'survive', 'rescue'],
    },
    carStyle: `1970s car being heroically saved or dramatically centered
      amid epic scenes. Multiple car stories suggested.`,
    composition: `Multi-panel disaster movie layout. Multiple storylines.
      Epic scale with dramatic elements.`,
    avoidList: `Small scale, quiet imagery, minimal cast, subtle drama,
      single-focus composition.`,
    eraVehicles: ['trans-am-77', 'cuda-70', 'challenger-71'],
    mockupScenes: ['movie premiere', 'theater lobby', 'Hollywood opening'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },

  // 1980s Movie Poster Styles
  {
    id: 'poster-80s-blockbuster',
    name: 'Blockbuster Action',
    category: 'nostalgic',
    era: '1980s',
    style: 'movie-poster',
    shortDescription: 'Explosions and hero poses',
    previewColors: ['#FF6600', '#000000', '#FFD700', '#DC143C'],
    imagePrompt: {
      style: `1980s Blockbuster Action movie poster style. Schwarzenegger, Stallone era.
        Explosions, hero poses, one-liners implied. Drew Struzan painted style.
        Muscles and machines.`,
      colorPalette: `Action orange (#FF6600), shadow black (#000000),
        hero gold (#FFD700), blood red (#DC143C). Bold, saturated.`,
      typography: `Bold chrome or metallic 3D titles. Action movie fonts
        with explosions in letters. Taglines prominent.`,
      elements: `Explosions, fire, hero poses, weapons (tools as weapons),
        action montage. Sweat and steel.`,
      mood: `Explosive, powerful, unstoppable. Consider this service your
        termination of car problems. I'll be back... with your car fixed!`,
    },
    textPrompt: {
      tone: 'Explosive, powerful, one-liner ready',
      vocabulary: ['terminate', 'unstoppable', 'power', 'action', 'maximum', 'ultimate'],
    },
    carStyle: `1980s sports car or truck, action hero vehicle, explosions behind.
      Muscles and machines aesthetic.`,
    composition: `Drew Struzan style painted montage. Hero vehicle central.
      Explosions and action surrounding.`,
    avoidList: `Quiet scenes, subtle imagery, minimal action,
      non-heroic positioning.`,
    eraVehicles: ['gnx-87', 'testarossa', 'corvette-85', 'countach'],
    mockupScenes: ['movie theater', 'video store', 'bedroom poster'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'poster-80s-teen',
    name: 'Teen Comedy',
    category: 'nostalgic',
    era: '1980s',
    style: 'movie-poster',
    shortDescription: 'John Hughes vibes and bright colors',
    previewColors: ['#FF69B4', '#00BFFF', '#FFFF00', '#FF6347'],
    imagePrompt: {
      style: `1980s Teen Comedy movie poster style. John Hughes, Fast Times.
        Bright colors, fun poses, high school vibes. Locker room humor,
        prom dreams, teenage adventures.`,
      colorPalette: `Teen pink (#FF69B4), cool blue (#00BFFF), sunshine yellow (#FFFF00),
        fun coral (#FF6347). Bright, youthful, optimistic.`,
      typography: `Fun, youthful fonts. Often handwritten or casual style.
        Bright colors. Exclamation points and fun punctuation!`,
      elements: `High school imagery, fun poses, bright backgrounds,
        youthful energy. Cars as freedom symbols.`,
      mood: `Fun, youthful, memorable. The totally awesome auto shop experience.
        Ferris Bueller would approve!`,
    },
    textPrompt: {
      tone: 'Fun, awesome, memorable',
      vocabulary: ['awesome', 'totally', 'fun', 'cool', 'best', 'amazing'],
    },
    carStyle: `1980s car (Ferrari 308, Porsche, or family station wagon)
      as symbol of freedom and adventure. Teen dream vehicle.`,
    composition: `Fun, youthful layout. Bright colors, casual poses.
      High school yearbook meets movie poster.`,
    avoidList: `Dark themes, adult content, serious imagery,
      corporate feeling.`,
    eraVehicles: ['testarossa', 'corvette-85', 'delorean'],
    mockupScenes: ['mall theater', 'bedroom wall', 'school hallway'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'poster-80s-synth-scifi',
    name: 'Sci-Fi Synth',
    category: 'nostalgic',
    era: '1980s',
    style: 'movie-poster',
    shortDescription: 'Tron grids and laser beams',
    previewColors: ['#00FFFF', '#FF00FF', '#000000', '#0000FF'],
    imagePrompt: {
      style: `1980s Sci-Fi Synth movie poster style. Tron, Blade Runner, The Last Starfighter.
        Grid lines, laser beams, computer graphics aesthetic. Neon on black.
        Digital frontier.`,
      colorPalette: `Cyan glow (#00FFFF), magenta (#FF00FF), void black (#000000),
        electric blue (#0000FF). Neon glows on dark backgrounds.`,
      typography: `Digital fonts, grid-based letters, neon glow effects.
        Computer terminal aesthetic. Futuristic sans-serif.`,
      elements: `Grid patterns, laser beams, digital landscapes, neon outlines,
        computer graphics, wireframe objects.`,
      mood: `Futuristic, digital, cutting-edge. Your car enters the grid
        for next-level service. End of line... problems.`,
    },
    textPrompt: {
      tone: 'Futuristic, digital, cutting-edge',
      vocabulary: ['digital', 'grid', 'future', 'program', 'system', 'laser'],
    },
    carStyle: `1980s car (especially DeLorean) rendered in Tron-style wireframe
      or neon outline. Digital frontier aesthetic.`,
    composition: `Grid-based composition. Neon elements on black void.
      Digital landscape. Wireframe styling.`,
    avoidList: `Organic imagery, natural colors, traditional aesthetics,
      non-digital appearance.`,
    eraVehicles: ['delorean', 'testarossa', 'countach', 'corvette-85'],
    mockupScenes: ['arcade', 'computer store', 'sci-fi convention'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'poster-80s-slasher',
    name: 'Slasher Horror',
    category: 'nostalgic',
    era: '1980s',
    style: 'movie-poster',
    shortDescription: 'Dark woods and masked figures',
    previewColors: ['#8B0000', '#000000', '#C0C0C0', '#228B22'],
    imagePrompt: {
      style: `1980s Slasher Horror movie poster style. Friday the 13th, Halloween,
        Nightmare on Elm Street. Dark woods, mysterious figures, blood red text.
        Teen terror (implied, not shown).`,
      colorPalette: `Blood red (#8B0000), night black (#000000), knife silver (#C0C0C0),
        forest green (#228B22). Dark, ominous.`,
      typography: `Dripping horror fonts, blood-red text. Slasher movie titles.
        Ominous taglines. Date prominently featured.`,
      elements: `Dark forests, mysterious shadows, knife/tool silhouettes,
        full moon, abandoned buildings. Menacing atmosphere.`,
      mood: `Suspenseful, ominous, thrilling. The nightmare of car problems
        ends here. We slay automotive demons.`,
    },
    textPrompt: {
      tone: 'Suspenseful, ominous, thrilling',
      vocabulary: ['nightmare', 'fear', 'survive', 'terror', 'final', 'slay'],
    },
    carStyle: `1980s car in dark, ominous setting. Headlights cutting through
      fog. Mysterious, cinematic lighting.`,
    composition: `Ominous horror poster layout. Mysterious central figure/car.
      Dark woods or suburban setting.`,
    avoidList: `Gore, explicit violence, child-unfriendly content,
      bright cheerful colors.`,
    eraVehicles: ['gnx-87', 'corvette-85', 'delorean'],
    mockupScenes: ['video rental horror section', 'midnight movie', 'Halloween display'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// CAR MAGAZINE STYLES (16 themes)
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
  ...magazineThemes,
];

// Helper functions for filtering
export function getNostalgicThemesByEra(era: '1950s' | '1960s' | '1970s' | '1980s'): NostalgicThemeDefinition[] {
  return NOSTALGIC_THEMES.filter(theme => theme.era === era);
}

export function getNostalgicThemesByStyle(style: 'comic-book' | 'movie-poster' | 'magazine'): NostalgicThemeDefinition[] {
  return NOSTALGIC_THEMES.filter(theme => theme.style === style);
}

export function getNostalgicThemesByEraAndStyle(
  era: '1950s' | '1960s' | '1970s' | '1980s',
  style: 'comic-book' | 'movie-poster' | 'magazine'
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

export function getRandomNostalgicThemeByStyle(style: 'comic-book' | 'movie-poster' | 'magazine'): NostalgicThemeDefinition {
  const styleThemes = getNostalgicThemesByStyle(style);
  return styleThemes[Math.floor(Math.random() * styleThemes.length)];
}

export default NOSTALGIC_THEMES;
