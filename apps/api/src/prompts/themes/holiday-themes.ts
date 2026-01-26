/**
 * Holiday Theme Packs
 * Seasonal themes that are opt-in only - not shown in default theme selection
 * Users must explicitly select a holiday pack to use these themes
 */

import { NostalgicThemeDefinition } from './nostalgic-themes';

export interface HolidayPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  holidays: string[]; // Which holidays this applies to
  dateRanges?: { start: string; end: string }[]; // MM-DD format for optional auto-suggestions
  themes: NostalgicThemeDefinition[];
}

// ============================================================================
// HALLOWEEN PACK - Horror/Spooky themes
// ============================================================================

const halloweenThemes: NostalgicThemeDefinition[] = [
  // EC Horror Comics (moved from nostalgic-themes.ts)
  {
    id: 'comic-50s-ec-horror',
    name: 'EC Horror Comics',
    category: 'holiday',
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
  // Slasher Horror (moved from nostalgic-themes.ts)
  {
    id: 'poster-80s-slasher',
    name: 'Slasher Horror',
    category: 'holiday',
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
  // Additional Halloween theme
  {
    id: 'halloween-garage',
    name: 'Haunted Garage',
    category: 'holiday',
    era: '1980s',
    style: 'movie-poster',
    shortDescription: 'Spooky auto shop vibes',
    previewColors: ['#FF6600', '#000000', '#800080', '#FFD700'],
    imagePrompt: {
      style: `Halloween promotional style. Spooky but fun atmosphere.
        Jack-o-lanterns, candy corn colors, haunted garage aesthetic.
        Playful scary rather than genuinely frightening.`,
      colorPalette: `Pumpkin orange (#FF6600), midnight black (#000000),
        witch purple (#800080), candy corn gold (#FFD700). Halloween colors.`,
      typography: `Spooky but readable fonts. Halloween-themed lettering.
        Bold and playful. Not too scary for families.`,
      elements: `Jack-o-lanterns, bats, spiderwebs, candy corn, autumn leaves,
        haunted garage setting, friendly ghosts.`,
      mood: `Fun spooky, family-friendly Halloween, trick-or-treat energy.
        Scary good deals! Don't let car problems haunt you!`,
    },
    textPrompt: {
      tone: 'Fun spooky, family-friendly, festive',
      vocabulary: ['spooky', 'treats', 'boo-tiful', 'frighteningly good', 'no tricks'],
    },
    carStyle: `Car with Halloween decorations, pumpkins on hood, spooky garage setting.
      Fun and festive rather than frightening.`,
    composition: `Halloween poster layout with festive elements. Pumpkins and
      decorations frame the main message.`,
    avoidList: `Actually scary content, gore, dark themes,
      non-family-friendly imagery.`,
    eraVehicles: ['gnx-87', 'corvette-85', 'trans-am-77'],
    mockupScenes: ['Halloween storefront', 'trick-or-treat display', 'October calendar'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// CHRISTMAS/WINTER HOLIDAYS PACK
// ============================================================================

const winterHolidayThemes: NostalgicThemeDefinition[] = [
  {
    id: 'christmas-classic',
    name: 'Classic Christmas',
    category: 'holiday',
    era: '1950s',
    style: 'magazine',
    shortDescription: 'Traditional red and green holiday',
    previewColors: ['#C41E3A', '#228B22', '#FFD700', '#FFFFFF'],
    imagePrompt: {
      style: `Classic Christmas promotional style. Traditional red and green.
        Warm, festive, Norman Rockwell-inspired holiday feeling.
        Cozy winter vibes with a touch of automotive flair.`,
      colorPalette: `Christmas red (#C41E3A), holly green (#228B22),
        gold ornament (#FFD700), snow white (#FFFFFF). Traditional palette.`,
      typography: `Classic holiday fonts, festive serifs. Warm and inviting.
        Traditional Christmas card style lettering.`,
      elements: `Christmas trees, ornaments, snow, ribbons, bows, wreaths,
        candy canes, cozy winter scenes. Auto shop with holiday decorations.`,
      mood: `Warm, festive, family, giving. Gift yourself great service.
        Joyful holiday spirit with automotive theme.`,
    },
    textPrompt: {
      tone: 'Warm, festive, giving',
      vocabulary: ['joy', 'gift', 'merry', 'holiday', 'season', 'peace'],
    },
    carStyle: `Classic car with Christmas decorations, snow on roof, warm lighting.
      Holiday shopping vibes. Vintage Christmas aesthetic.`,
    composition: `Festive frame with holiday elements. Warm lighting and
      cozy atmosphere. Gift-giving theme.`,
    avoidList: `Non-Christmas religious symbols, cold/corporate feeling,
      non-festive colors.`,
    eraVehicles: ['chevy-57', 'cadillac-59', 'mercury-49'],
    mockupScenes: ['Christmas card', 'holiday storefront', 'winter wonderland'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'winter-wonderland',
    name: 'Winter Wonderland',
    category: 'holiday',
    era: '1960s',
    style: 'magazine',
    shortDescription: 'Snowy winter service themes',
    previewColors: ['#87CEEB', '#FFFFFF', '#C0C0C0', '#1E90FF'],
    imagePrompt: {
      style: `Winter wonderland promotional style. Snowy, icy, magical winter.
        Blue and white color scheme. Emphasize winter car care importance.`,
      colorPalette: `Ice blue (#87CEEB), pure snow white (#FFFFFF),
        silver frost (#C0C0C0), winter sky blue (#1E90FF). Cool winter palette.`,
      typography: `Clean, crisp fonts with frost effects. Winter-themed
        lettering. Professional but seasonal.`,
      elements: `Snowflakes, icicles, frost patterns, snow-covered roads,
        winter tires, antifreeze, warm exhaust clouds in cold air.`,
      mood: `Preparedness, safety, winter-ready. Get your car ready for winter.
        Reliable service for cold weather.`,
    },
    textPrompt: {
      tone: 'Prepared, safe, reliable',
      vocabulary: ['winter-ready', 'freeze', 'protection', 'cold', 'safe', 'prepared'],
    },
    carStyle: `Car in snowy setting, demonstrating winter preparedness.
      Snow tires, frost on windows, winter road conditions.`,
    composition: `Winter landscape with automotive focus. Snow and ice
      elements frame the message. Safety-focused.`,
    avoidList: `Summer imagery, warm colors, beach scenes,
      unprepared vehicles stuck in snow.`,
    eraVehicles: ['mustang-65', 'corvette-63', 'impala-64'],
    mockupScenes: ['winter road', 'snowy parking lot', 'cold weather garage'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'new-years',
    name: 'New Year New Ride',
    category: 'holiday',
    era: '1980s',
    style: 'movie-poster',
    shortDescription: 'Fresh start celebration',
    previewColors: ['#FFD700', '#000000', '#C0C0C0', '#FFFFFF'],
    imagePrompt: {
      style: `New Year celebration style. Champagne, confetti, fresh starts.
        Gold and silver sparkle. New year, new car care resolution.`,
      colorPalette: `Champagne gold (#FFD700), midnight black (#000000),
        silver confetti (#C0C0C0), sparkle white (#FFFFFF). Celebratory.`,
      typography: `Elegant, celebratory fonts. New Year countdown style.
        Numbers and year prominently featured.`,
      elements: `Confetti, champagne bubbles, fireworks, clock/countdown,
        sparklers, celebration imagery. Fresh start themes.`,
      mood: `Fresh start, celebration, resolution, renewal. Start the year
        right with proper car maintenance.`,
    },
    textPrompt: {
      tone: 'Celebratory, fresh, resolute',
      vocabulary: ['new year', 'fresh start', 'resolution', 'celebrate', 'renew', 'begin'],
    },
    carStyle: `Car looking fresh and renewed, sparkling clean. New year
      energy and fresh start vibes.`,
    composition: `Celebration-themed layout with countdown elements.
      Confetti and sparkle frame the main message.`,
    avoidList: `Sad endings, old/worn imagery, depressing themes,
      non-celebratory colors.`,
    eraVehicles: ['countach', 'testarossa', 'corvette-85'],
    mockupScenes: ['New Year party', 'midnight celebration', 'January calendar'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// VALENTINE'S DAY PACK
// ============================================================================

const valentinesThemes: NostalgicThemeDefinition[] = [
  {
    id: 'valentines-love-your-car',
    name: 'Love Your Car',
    category: 'holiday',
    era: '1950s',
    style: 'comic-book',
    shortDescription: 'Hearts and romance themes',
    previewColors: ['#FF69B4', '#DC143C', '#FFB6C1', '#FFFFFF'],
    imagePrompt: {
      style: `Valentine's Day romance comics style. Hearts, love, pink and red.
        1950s romance comic aesthetic. "We love taking care of your car!"`,
      colorPalette: `Hot pink (#FF69B4), passionate red (#DC143C),
        soft pink (#FFB6C1), pure white (#FFFFFF). Romantic palette.`,
      typography: `Romantic, flowing fonts with heart accents. Love letter
        style. Valentine's card typography.`,
      elements: `Hearts, roses, Cupid arrows, love letters, chocolate boxes,
        romantic scenery. Car with heart decorations.`,
      mood: `Romantic, caring, loving. Show your car some love!
        We love our customers. Heart-felt service.`,
    },
    textPrompt: {
      tone: 'Loving, caring, romantic',
      vocabulary: ['love', 'heart', 'care', 'sweetheart', 'cherish', 'dear'],
    },
    carStyle: `Classic car as object of affection. Heart decorations,
      romantic setting. The car you love.`,
    composition: `Romance comic layout with heart borders and romantic
      framing. Love letter style presentation.`,
    avoidList: `Crude or adult content, broken hearts, sad romance themes,
      non-romantic colors.`,
    eraVehicles: ['chevy-57', 'corvette-53', 'cadillac-59'],
    mockupScenes: ["Valentine's card", 'romance display', 'February promotion'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// PATRIOTIC PACK (4th of July, Memorial Day, Veterans Day, Presidents Day)
// ============================================================================

const patrioticThemes: NostalgicThemeDefinition[] = [
  {
    id: 'fourth-of-july',
    name: '4th of July',
    category: 'holiday',
    era: '1960s',
    style: 'movie-poster',
    shortDescription: 'Fireworks and patriotic pride',
    previewColors: ['#B22234', '#FFFFFF', '#3C3B6E', '#FFD700'],
    imagePrompt: {
      style: `4th of July celebration style. Fireworks, American flags,
        patriotic pride. Summer BBQ and freedom vibes.`,
      colorPalette: `American red (#B22234), pure white (#FFFFFF),
        American blue (#3C3B6E), firework gold (#FFD700). USA colors.`,
      typography: `Bold, patriotic fonts. Stars and stripes incorporated.
        American pride lettering. Strong and proud.`,
      elements: `Fireworks, American flags, stars, stripes, eagles,
        BBQ imagery, summer vibes, liberty themes.`,
      mood: `Patriotic, celebratory, proud, free. American-made service.
        Freedom from car problems! Independence Day special.`,
    },
    textPrompt: {
      tone: 'Patriotic, proud, celebratory',
      vocabulary: ['freedom', 'America', 'independence', 'liberty', 'stars', 'proud'],
    },
    carStyle: `American muscle car with patriotic decorations. USA flag
      colors. Classic American automotive pride.`,
    composition: `Patriotic poster layout with flag elements and fireworks.
      Stars and stripes frame the message.`,
    avoidList: `Political statements, foreign cars prominently featured,
      un-American themes.`,
    eraVehicles: ['mustang-65', 'corvette-63', 'impala-64', 'challenger-71'],
    mockupScenes: ['July 4th parade', 'fireworks display', 'summer BBQ'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'memorial-day',
    name: 'Memorial Day',
    category: 'holiday',
    era: '1970s',
    style: 'magazine',
    shortDescription: 'Honor and remember themes',
    previewColors: ['#B22234', '#FFFFFF', '#3C3B6E', '#000000'],
    imagePrompt: {
      style: `Memorial Day tribute style. Respectful, honoring, patriotic.
        American flags at half-staff. Remembrance with dignity.`,
      colorPalette: `American red (#B22234), pure white (#FFFFFF),
        American blue (#3C3B6E), solemn black (#000000). Respectful.`,
      typography: `Dignified, respectful fonts. Elegant serif with
        patriotic touches. Solemn but proud.`,
      elements: `American flags, poppies, ribbons, military silhouettes,
        memorial imagery. Respectful tributes.`,
      mood: `Respectful, honoring, grateful. Honoring those who served.
        Service with honor. Thank you veterans.`,
    },
    textPrompt: {
      tone: 'Respectful, honoring, grateful',
      vocabulary: ['honor', 'remember', 'service', 'sacrifice', 'heroes', 'gratitude'],
    },
    carStyle: `Classic American car in respectful setting. Perhaps
      at a memorial or with flag. Dignified presentation.`,
    composition: `Respectful memorial layout. Patriotic elements without
      being overly festive. Dignified framing.`,
    avoidList: `Overly celebratory imagery, party themes, disrespectful content,
      inappropriate levity.`,
    eraVehicles: ['trans-am-77', 'corvette-73', 'challenger-71'],
    mockupScenes: ['memorial display', 'Veterans honor', 'flag ceremony'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'veterans-day',
    name: 'Veterans Day',
    category: 'holiday',
    era: '1980s',
    style: 'magazine',
    shortDescription: 'Saluting those who served',
    previewColors: ['#B22234', '#FFFFFF', '#3C3B6E', '#C0C0C0'],
    imagePrompt: {
      style: `Veterans Day tribute style. Honoring military service.
        Respectful and grateful. Veterans discount promotional.`,
      colorPalette: `American red (#B22234), pure white (#FFFFFF),
        American blue (#3C3B6E), military silver (#C0C0C0). Patriotic.`,
      typography: `Strong, dignified military-inspired fonts. Respectful
        but confident. Service-oriented.`,
      elements: `American flag, military emblems, dog tags, service ribbons,
        veteran silhouettes. Thank you messaging.`,
      mood: `Grateful, respectful, honoring. Special offer for veterans.
        Thank you for your service. Military discount.`,
    },
    textPrompt: {
      tone: 'Grateful, respectful, honoring',
      vocabulary: ['thank you', 'service', 'veteran', 'honor', 'salute', 'hero'],
    },
    carStyle: `American car, perhaps with veteran owner or military
      connection. Respectful and proud presentation.`,
    composition: `Veterans tribute layout with military elements.
      Thank you messaging prominent. Respectful design.`,
    avoidList: `Political statements, war glorification, insensitive content,
      disrespectful imagery.`,
    eraVehicles: ['gnx-87', 'corvette-85', 'trans-am-77'],
    mockupScenes: ['Veterans day ceremony', 'military appreciation', 'November tribute'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// SPRING HOLIDAYS PACK (Easter, St. Patrick's Day)
// ============================================================================

const springThemes: NostalgicThemeDefinition[] = [
  {
    id: 'easter-spring',
    name: 'Easter Spring',
    category: 'holiday',
    era: '1950s',
    style: 'magazine',
    shortDescription: 'Pastel renewal themes',
    previewColors: ['#FFB6C1', '#E6E6FA', '#98FB98', '#FFFF00'],
    imagePrompt: {
      style: `Easter and spring renewal style. Pastels, flowers, renewal.
        Fresh start after winter. Spring cleaning for your car.`,
      colorPalette: `Easter pink (#FFB6C1), lavender (#E6E6FA),
        spring green (#98FB98), sunny yellow (#FFFF00). Soft pastels.`,
      typography: `Soft, friendly, spring-like fonts. Gentle curves,
        flower accents. Fresh and inviting.`,
      elements: `Easter eggs, bunnies, flowers, spring blossoms, sunshine,
        fresh green grass, renewal imagery.`,
      mood: `Renewal, fresh, hopeful. Spring cleaning for your car!
        Fresh start with new season. Rebirth and renewal.`,
    },
    textPrompt: {
      tone: 'Fresh, hopeful, renewing',
      vocabulary: ['spring', 'fresh', 'renew', 'bloom', 'clean', 'new'],
    },
    carStyle: `Clean, fresh car ready for spring. Perhaps with flower
      decorations or spring setting. Renewed and ready.`,
    composition: `Spring-themed layout with pastel colors and floral
      elements. Fresh and inviting design.`,
    avoidList: `Dark or winter imagery, wilted flowers, brown/dead colors,
      heavy or oppressive themes.`,
    eraVehicles: ['chevy-57', 'corvette-53', 'cadillac-59'],
    mockupScenes: ['spring garden', 'Easter display', 'flower shop'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'st-patricks',
    name: "St. Patrick's Day",
    category: 'holiday',
    era: '1970s',
    style: 'comic-book',
    shortDescription: 'Lucky green themes',
    previewColors: ['#228B22', '#FFD700', '#FFFFFF', '#006400'],
    imagePrompt: {
      style: `St. Patrick's Day style. Lucky green, gold coins, shamrocks.
        Irish luck and celebration. Lucky deals on service!`,
      colorPalette: `Shamrock green (#228B22), pot of gold (#FFD700),
        pure white (#FFFFFF), deep green (#006400). Irish colors.`,
      typography: `Celtic-inspired fonts, Irish style lettering.
        Playful and lucky. Shamrock accents.`,
      elements: `Shamrocks, four-leaf clovers, rainbows, pots of gold,
        leprechaun hat, lucky horseshoes, green decorations.`,
      mood: `Lucky, festive, fun. Lucky you found us! Get lucky with
        great service. Pot of gold savings.`,
    },
    textPrompt: {
      tone: 'Lucky, festive, fun',
      vocabulary: ['lucky', 'green', 'gold', 'fortune', 'charm', 'blessed'],
    },
    carStyle: `Car with green decorations or in Irish-themed setting.
      Lucky and festive presentation.`,
    composition: `St. Patrick's themed layout with shamrocks and gold.
      Lucky elements frame the main message.`,
    avoidList: `Offensive Irish stereotypes, excessive drinking references,
      inappropriate leprechaun imagery.`,
    eraVehicles: ['corvette-73', 'trans-am-77', 'challenger-71'],
    mockupScenes: ["St. Patrick's parade", 'Irish pub', 'March celebration'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// THANKSGIVING PACK
// ============================================================================

const thanksgivingThemes: NostalgicThemeDefinition[] = [
  {
    id: 'thanksgiving-gratitude',
    name: 'Thanksgiving Gratitude',
    category: 'holiday',
    era: '1950s',
    style: 'magazine',
    shortDescription: 'Harvest and family themes',
    previewColors: ['#FF8C00', '#8B4513', '#FFD700', '#800020'],
    imagePrompt: {
      style: `Thanksgiving celebration style. Harvest colors, family gathering,
        gratitude themes. Norman Rockwell-inspired warmth.`,
      colorPalette: `Pumpkin orange (#FF8C00), harvest brown (#8B4513),
        golden wheat (#FFD700), cranberry (#800020). Autumn warmth.`,
      typography: `Warm, traditional fonts with harvest accents.
        Grateful and inviting. Thanksgiving card style.`,
      elements: `Turkeys, pumpkins, autumn leaves, harvest cornucopia,
        family table, gratitude imagery, fall decorations.`,
      mood: `Grateful, warm, family. Thankful for your business!
        Get ready for the holidays. Family road trips.`,
    },
    textPrompt: {
      tone: 'Grateful, warm, family-focused',
      vocabulary: ['thankful', 'grateful', 'family', 'harvest', 'blessing', 'gather'],
    },
    carStyle: `Car ready for holiday travel, autumn setting. Family
      road trip vibes. Warm and inviting.`,
    composition: `Thanksgiving-themed layout with harvest elements.
      Warm, inviting family atmosphere.`,
    avoidList: `Offensive Native American imagery, political themes,
      non-inclusive content.`,
    eraVehicles: ['chevy-57', 'cadillac-59', 'mercury-49'],
    mockupScenes: ['Thanksgiving table', 'harvest festival', 'November travel'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// SUMMER PACK (Labor Day, Memorial Day kickoff)
// ============================================================================

const summerThemes: NostalgicThemeDefinition[] = [
  {
    id: 'labor-day-summer-end',
    name: 'Labor Day',
    category: 'holiday',
    era: '1960s',
    style: 'movie-poster',
    shortDescription: 'End of summer celebration',
    previewColors: ['#FF6347', '#FFD700', '#87CEEB', '#FFFFFF'],
    imagePrompt: {
      style: `Labor Day end-of-summer style. Last BBQ of summer, road trips,
        worker appreciation. Summer send-off celebration.`,
      colorPalette: `Sunset orange (#FF6347), sunshine gold (#FFD700),
        summer sky blue (#87CEEB), beach white (#FFFFFF). Warm summer.`,
      typography: `Bold summer fonts, vacation style lettering.
        Fun and festive. Last chance summer deals.`,
      elements: `BBQ grills, beach scenes, road trip imagery, summer sun,
        worker appreciation, end of summer vibes.`,
      mood: `Celebratory, appreciative, summer fun. Last summer road trip!
        Labor Day deals. Thank you for your hard work.`,
    },
    textPrompt: {
      tone: 'Celebratory, appreciative, fun',
      vocabulary: ['summer', 'labor', 'work', 'celebrate', 'weekend', 'road trip'],
    },
    carStyle: `Summer road trip ready car, perhaps at beach or BBQ.
      End of summer vibes. Ready for one more adventure.`,
    composition: `Summer celebration layout with BBQ and beach elements.
      Worker appreciation undertones.`,
    avoidList: `Winter imagery, sad endings, work complaints,
      non-celebratory themes.`,
    eraVehicles: ['mustang-65', 'corvette-63', 'impala-64'],
    mockupScenes: ['Labor Day BBQ', 'summer beach', 'road trip'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
  {
    id: 'summer-road-trip',
    name: 'Summer Road Trip',
    category: 'holiday',
    era: '1970s',
    style: 'magazine',
    shortDescription: 'Vacation-ready themes',
    previewColors: ['#FF6347', '#FFD700', '#00CED1', '#32CD32'],
    imagePrompt: {
      style: `Summer vacation road trip style. Adventure, freedom, open road.
        Classic summer vacation vibes. Get your car ready for adventure!`,
      colorPalette: `Sunset orange (#FF6347), sunshine yellow (#FFD700),
        ocean turquoise (#00CED1), grass green (#32CD32). Bright summer.`,
      typography: `Fun, adventurous fonts. Road trip lettering.
        Vacation mood. Ready for adventure.`,
      elements: `Open roads, highway signs, beach destinations, camping,
        luggage racks, vacation imagery, summer activities.`,
      mood: `Adventurous, free, exciting. Get road trip ready!
        Summer vacation service special. Adventure awaits.`,
    },
    textPrompt: {
      tone: 'Adventurous, free, exciting',
      vocabulary: ['adventure', 'road trip', 'vacation', 'summer', 'freedom', 'explore'],
    },
    carStyle: `Car loaded for road trip, open highway, vacation destination.
      Summer adventure vibes. Freedom of the open road.`,
    composition: `Road trip adventure layout with highway and destination
      imagery. Freedom and adventure themes.`,
    avoidList: `Winter, work/office imagery, boring destinations,
      car problems on the road.`,
    eraVehicles: ['corvette-73', 'trans-am-77', 'el-camino-72'],
    mockupScenes: ['highway billboard', 'vacation postcard', 'road trip'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// MLK DAY PACK
// ============================================================================

const mlkDayThemes: NostalgicThemeDefinition[] = [
  {
    id: 'mlk-day-service',
    name: 'MLK Day of Service',
    category: 'holiday',
    era: '1960s',
    style: 'magazine',
    shortDescription: 'Unity and community themes',
    previewColors: ['#4169E1', '#FFD700', '#FFFFFF', '#000000'],
    imagePrompt: {
      style: `MLK Day of Service style. Unity, community, service.
        Respectful tribute with community focus. Day of service themes.`,
      colorPalette: `Royal blue (#4169E1), hope gold (#FFD700),
        peace white (#FFFFFF), strength black (#000000). Dignified.`,
      typography: `Dignified, inspiring fonts. Unity messaging.
        Respectful but uplifting. Community service.`,
      elements: `Diverse hands united, community imagery, service symbols,
        peace doves, unity chains, dream themes.`,
      mood: `United, hopeful, service-oriented. Serving our community.
        Unity in service. Dreams of great service.`,
    },
    textPrompt: {
      tone: 'United, hopeful, service-oriented',
      vocabulary: ['unity', 'service', 'community', 'dream', 'together', 'hope'],
    },
    carStyle: `Car as symbol of progress and freedom. Community service
      context. Unity and togetherness.`,
    composition: `Unity and service themed layout. Community focus with
      respectful tribute elements.`,
    avoidList: `Appropriation, political statements, divisive content,
      disrespectful imagery.`,
    eraVehicles: ['mustang-65', 'corvette-63', 'impala-64'],
    mockupScenes: ['community event', 'service day', 'unity gathering'],
    compatibleTools: ['promo_flyer', 'instant_pack', 'campaign'],
  },
];

// ============================================================================
// HOLIDAY PACKS REGISTRY
// ============================================================================

export const HOLIDAY_PACKS: HolidayPack[] = [
  {
    id: 'halloween',
    name: 'Halloween',
    description: 'Spooky and horror-themed designs for Halloween season',
    icon: '🎃',
    holidays: ['Halloween'],
    dateRanges: [{ start: '10-01', end: '10-31' }],
    themes: halloweenThemes,
  },
  {
    id: 'winter-holidays',
    name: 'Winter Holidays',
    description: 'Christmas, New Year, and winter celebration themes',
    icon: '🎄',
    holidays: ['Christmas', "New Year's Eve", "New Year's Day"],
    dateRanges: [{ start: '12-01', end: '12-31' }, { start: '01-01', end: '01-07' }],
    themes: winterHolidayThemes,
  },
  {
    id: 'valentines',
    name: "Valentine's Day",
    description: 'Love and romance themed designs',
    icon: '💕',
    holidays: ["Valentine's Day"],
    dateRanges: [{ start: '02-01', end: '02-14' }],
    themes: valentinesThemes,
  },
  {
    id: 'patriotic',
    name: 'Patriotic',
    description: 'American holidays: 4th of July, Memorial Day, Veterans Day',
    icon: '🇺🇸',
    holidays: ['4th of July', 'Memorial Day', 'Veterans Day', 'Presidents Day'],
    dateRanges: [
      { start: '05-20', end: '05-31' }, // Memorial Day
      { start: '07-01', end: '07-07' }, // 4th of July
      { start: '11-01', end: '11-15' }, // Veterans Day
    ],
    themes: patrioticThemes,
  },
  {
    id: 'spring',
    name: 'Spring',
    description: "Easter and St. Patrick's Day themes",
    icon: '🌸',
    holidays: ['Easter', "St. Patrick's Day"],
    dateRanges: [
      { start: '03-10', end: '03-17' }, // St. Patrick's
      { start: '03-15', end: '04-30' }, // Easter season (varies)
    ],
    themes: springThemes,
  },
  {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    description: 'Harvest and gratitude themes',
    icon: '🦃',
    holidays: ['Thanksgiving'],
    dateRanges: [{ start: '11-15', end: '11-30' }],
    themes: thanksgivingThemes,
  },
  {
    id: 'summer',
    name: 'Summer',
    description: 'Labor Day and summer road trip themes',
    icon: '☀️',
    holidays: ['Labor Day', 'Memorial Day (Summer Kickoff)'],
    dateRanges: [
      { start: '05-20', end: '09-10' }, // Summer season
    ],
    themes: summerThemes,
  },
  {
    id: 'mlk-day',
    name: 'MLK Day',
    description: 'Unity and community service themes',
    icon: '✊',
    holidays: ['Martin Luther King Jr. Day'],
    dateRanges: [{ start: '01-10', end: '01-20' }],
    themes: mlkDayThemes,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all holiday packs
 */
export function getAllHolidayPacks(): HolidayPack[] {
  return HOLIDAY_PACKS;
}

/**
 * Get a specific holiday pack by ID
 */
export function getHolidayPack(id: string): HolidayPack | undefined {
  return HOLIDAY_PACKS.find(pack => pack.id === id);
}

/**
 * Get all themes from specified holiday packs
 */
export function getThemesFromHolidayPacks(packIds: string[]): NostalgicThemeDefinition[] {
  const themes: NostalgicThemeDefinition[] = [];
  for (const packId of packIds) {
    const pack = getHolidayPack(packId);
    if (pack) {
      themes.push(...pack.themes);
    }
  }
  return themes;
}

/**
 * Get all holiday theme IDs (for exclusion from default themes)
 */
export function getAllHolidayThemeIds(): string[] {
  return HOLIDAY_PACKS.flatMap(pack => pack.themes.map(theme => theme.id));
}

/**
 * Get holiday packs that are currently in season
 * Based on the current date and defined date ranges
 */
export function getInSeasonHolidayPacks(): HolidayPack[] {
  const today = new Date();
  const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return HOLIDAY_PACKS.filter(pack => {
    if (!pack.dateRanges) return false;
    return pack.dateRanges.some(range => {
      return monthDay >= range.start && monthDay <= range.end;
    });
  });
}

/**
 * Get a specific holiday theme by ID
 */
export function getHolidayTheme(themeId: string): NostalgicThemeDefinition | undefined {
  for (const pack of HOLIDAY_PACKS) {
    const theme = pack.themes.find(t => t.id === themeId);
    if (theme) return theme;
  }
  return undefined;
}
