/**
 * Content Category Themes — 6 new families, 19 themes
 *
 * These themes focus on content TYPES rather than visual art styles.
 * Families: Pro Photography, Social Meme, Before/After, Bold CTA, Editorial, Edu-Tips
 */

import type { ThemeDefinition } from './index';

// ============================================================================
// FAMILY 11: PRO PHOTOGRAPHY 📸 (4 themes)
// ============================================================================

export const proPhotographyThemes: ThemeDefinition[] = [
  {
    id: 'showroom-hero',
    name: 'Showroom Hero',
    category: 'photography',
    shortDescription: 'Studio-lit car, 3/4 angle, polished floor reflections',
    previewColors: ['#1A1A2E', '#C0C0C0', '#E8E8E8', '#3A86FF'],
    imagePrompt: {
      style: `Automotive showroom photography. Studio-lit car at 3/4 angle on polished dark floor.
        85mm lens bokeh effect. 3-point lighting setup with rim light highlighting edges.
        Car centered, hero composition. Reflections on floor. Dealership-quality product shot.`,
      colorPalette: `Deep charcoal background (#1A1A2E), chrome silver highlights (#C0C0C0),
        soft white fill (#E8E8E8), accent blue (#3A86FF) in reflections.
        Clean, controlled studio palette.`,
      typography: `Clean sans-serif, thin weight. Premium luxury brand feel.
        Text placed in generous negative space above or below car. Minimal.`,
      elements: `Polished floor reflections, rim lighting glow, subtle gradient backdrop,
        clean horizon line. No clutter — the car IS the design.`,
      mood: `Premium, aspirational, showroom-clean. This car just rolled off the detail bay.
        The kind of shot that makes people say "I want my car to look like THAT."`,
    },
    textPrompt: {
      tone: 'Premium, confident, clean',
      vocabulary: ['pristine', 'showroom', 'detail', 'shine', 'immaculate', 'premium'],
    },
    mockupScenes: ['showroom floor', 'studio backdrop', 'dealership window'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'golden-hour-shop',
    name: 'Golden Hour',
    category: 'photography',
    shortDescription: 'Warm sunset light on shop exterior with cinematic color',
    previewColors: ['#FF9E00', '#1A3C5E', '#FFD700', '#2C1810'],
    imagePrompt: {
      style: `Cinematic golden hour photography. Warm sunset light washing over shop exterior.
        Car parked out front catching orange light. Teal-orange color grading (Hollywood style).
        Wide angle establishing shot. Long shadows. Magic hour warmth.`,
      colorPalette: `Warm amber (#FF9E00), deep teal shadows (#1A3C5E), golden highlights (#FFD700),
        warm brown (#2C1810). Teal-orange complementary color grading throughout.`,
      typography: `Warm-toned serif or slab-serif. Text glows with golden warmth.
        Placed in sky area or shadow zone for contrast. Cinematic title card feel.`,
      elements: `Sunset sky gradient, long dramatic shadows, warm light on chrome/paint,
        shop signage catching golden light, lens flare accents. Atmospheric.`,
      mood: `Warm, inviting, golden-hour magic. The shop looks like a movie set.
        Everything feels trustworthy and beautiful in this light.`,
    },
    textPrompt: {
      tone: 'Warm, cinematic, inviting',
      vocabulary: ['golden', 'trusted', 'warmth', 'sunset', 'home', 'community'],
    },
    mockupScenes: ['shop exterior at sunset', 'parking lot golden hour', 'street corner dusk'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'detail-closeup',
    name: 'Detail Shot',
    category: 'photography',
    shortDescription: 'Macro photography: chrome, paint, engine bay',
    previewColors: ['#B8860B', '#1C1C1C', '#E0E0E0', '#C53030'],
    imagePrompt: {
      style: `Macro automotive photography. Extreme close-up of chrome trim, brake caliper,
        paint reflection, or engine bay detail. Shallow depth of field (f/1.8).
        Studio lighting with single key light. Tack-sharp focus point with creamy bokeh.`,
      colorPalette: `Dark chrome gold (#B8860B), deep black (#1C1C1C), highlight silver (#E0E0E0),
        accent red (#C53030) for brake calipers or accent. Rich, metallic tones.`,
      typography: `Small, precise sans-serif. Placed in bokeh areas where text is readable.
        Minimal text — the detail shot speaks for itself. Technical spec feel.`,
      elements: `Chrome reflections, paint depth/clearcoat layers, machined metal textures,
        water droplets on paint, carbon fiber weave, leather grain.`,
      mood: `Precision, craftsmanship, obsessive detail. This shop notices things
        other shops miss. Every bolt is perfect. Every surface is flawless.`,
    },
    textPrompt: {
      tone: 'Precise, expert, quality-obsessed',
      vocabulary: ['precision', 'detail', 'craftsmanship', 'perfection', 'meticulous', 'quality'],
    },
    mockupScenes: ['detail bay close-up', 'under hood shot', 'brake caliper macro'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'overhead-flatlay',
    name: 'Workshop Flatlay',
    category: 'photography',
    shortDescription: 'Top-down tools, parts, keys arranged artfully',
    previewColors: ['#4A4A4A', '#D4A574', '#2F4F4F', '#F5F5DC'],
    imagePrompt: {
      style: `Overhead flatlay photography. Top-down view of tools, parts, keys, and accessories
        arranged on clean work surface. Organized, artful arrangement like a magazine feature.
        Even, diffused overhead lighting. Knolling photography style — everything at right angles.`,
      colorPalette: `Workshop gray (#4A4A4A), warm wood/leather (#D4A574),
        dark teal (#2F4F4F), off-white surface (#F5F5DC). Natural, organized palette.`,
      typography: `Clean sans-serif in dark color. Text placed as if it's part of the arrangement.
        Could be on a card, tag, or label within the flatlay. Organized and intentional.`,
      elements: `Wrenches, sockets, OBD scanner, clean rags, car keys, oil filter,
        spark plugs, diagnostic tablet. Everything pristine and organized.`,
      mood: `Organized, professional, Instagram-worthy. This shop runs like a Swiss watch.
        Every tool has its place. Satisfying visual order.`,
    },
    textPrompt: {
      tone: 'Organized, professional, satisfying',
      vocabulary: ['equipped', 'organized', 'professional', 'ready', 'prepared', 'certified'],
    },
    mockupScenes: ['workbench top-down', 'tool chest flatlay', 'parts counter arrangement'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
];

// ============================================================================
// FAMILY 12: SOCIAL MEME 😂 (3 themes)
// ============================================================================

export const socialMemeThemes: ThemeDefinition[] = [
  {
    id: 'relatable-carowner',
    name: 'Car Owner Life',
    category: 'meme',
    shortDescription: 'Split-panel meme: expectation vs reality',
    previewColors: ['#FFFFFF', '#333333', '#FF4444', '#4CAF50'],
    imagePrompt: {
      style: `Social media meme format. Clean split-panel layout: top panel "Expectation" and
        bottom panel "Reality". Bold text captions. Two contrasting automotive scenes.
        Clean, shareable meme layout that looks native to Instagram/Facebook.`,
      colorPalette: `Clean white background (#FFFFFF), dark text (#333333),
        red accent for drama (#FF4444), green for the positive panel (#4CAF50).
        High contrast, simple, meme-native palette.`,
      typography: `Bold Impact-style or modern heavy sans-serif. Large, meme-readable text.
        "EXPECTATION" and "REALITY" labels. Text with subtle drop shadow.
        Readable at ANY size — this is social media first.`,
      elements: `Split panel divider, "Expectation vs Reality" labels, contrasting scenes,
        relatable automotive situations (check engine light, flat tire, etc.).
        Clean borders. Sharable format.`,
      mood: `Funny, relatable, shareable. Car owners see this and think "that's SO me."
        Humor drives engagement. The shop that makes you laugh earns your trust.`,
    },
    textPrompt: {
      tone: 'Funny, relatable, self-deprecating humor',
      vocabulary: ['literally', 'every time', 'me when', 'nobody', 'that moment', 'truth'],
    },
    mockupScenes: ['phone screen share', 'social media feed', 'group chat screenshot'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'mechanic-wisdom',
    name: 'Mechanic Says',
    category: 'meme',
    shortDescription: 'Bold quote on solid background, mechanic wisdom',
    previewColors: ['#1A1A2E', '#FFD700', '#FFFFFF', '#C53030'],
    imagePrompt: {
      style: `Quote card format. Bold wisdom text on solid dark background.
        Wrench or gear icon accent. "Your mechanic wishes you knew..." format.
        Clean, bold, instantly readable. Instagram quote card aesthetic.`,
      colorPalette: `Dark navy background (#1A1A2E), gold accent (#FFD700),
        white text (#FFFFFF), red emphasis (#C53030). High contrast, bold.`,
      typography: `Extra bold sans-serif for the quote. Thin secondary font for attribution.
        Quote marks as decorative elements. All caps for key phrases.
        Text fills 60-70% of the image — the text IS the design.`,
      elements: `Wrench icon, gear silhouette, oil drop, subtle automotive texture in background.
        Quote marks as large decorative elements. Minimal — text is king.`,
      mood: `Wise, educational with attitude. The mechanic dropping truth bombs.
        Shareable wisdom that makes car owners think twice.`,
    },
    textPrompt: {
      tone: 'Wise, direct, slightly sassy mechanic voice',
      vocabulary: ['truth', 'real talk', 'pro tip', 'your mechanic', 'trust me', 'fact'],
    },
    mockupScenes: ['social media feed', 'story format', 'bulletin board'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'dashboard-drama',
    name: 'Dashboard Drama',
    category: 'meme',
    shortDescription: 'Dramatic dashboard warning light with humorous headline',
    previewColors: ['#FF4444', '#1C1C1C', '#FFD700', '#FFFFFF'],
    imagePrompt: {
      style: `Dramatic close-up of dashboard warning light (check engine, oil pressure, temp).
        Glowing warning symbol against dark dashboard. Bold humorous headline above or below.
        Cinematic drama meets automotive humor. Movie-poster tension for a check engine light.`,
      colorPalette: `Warning red/amber glow (#FF4444, #FFD700) against dark interior (#1C1C1C),
        white text (#FFFFFF). Dashboard instrument cluster colors. Dramatic lighting.`,
      typography: `Bold condensed sans-serif headline. Movie-trailer typography.
        Dramatic, attention-grabbing. "THAT LIGHT MEANS SOMETHING" energy.
        Large enough to read on a phone thumbnail.`,
      elements: `Dashboard warning lights (glowing), steering wheel silhouette,
        instrument cluster gauges, dramatic lighting from dashboard glow.
        Dark interior atmosphere.`,
      mood: `Dramatic humor. Making a check engine light feel like a horror movie —
        but funny. Engagement bait that's actually useful.`,
    },
    textPrompt: {
      tone: 'Dramatic, funny, urgent',
      vocabulary: ['warning', 'don\'t ignore', 'that light', 'uh oh', 'time to', 'your car is telling you'],
    },
    mockupScenes: ['driver POV', 'dashboard close-up', 'night driving interior'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
];

// ============================================================================
// FAMILY 13: BEFORE/AFTER 🔄 (3 themes)
// ============================================================================

export const beforeAfterThemes: ThemeDefinition[] = [
  {
    id: 'split-transform',
    name: 'Side-by-Side',
    category: 'before-after',
    shortDescription: 'Vertical split: worn/dirty left, gleaming right',
    previewColors: ['#808080', '#4CAF50', '#333333', '#FFFFFF'],
    imagePrompt: {
      style: `Before/After split comparison. Vertical split down the center: left side is worn,
        dirty, faded (desaturated colors). Right side is gleaming, new, vivid colors.
        Same part/car shown in both states. Clean dividing line or gradient transition.`,
      colorPalette: `Left (before): desaturated grays (#808080), muted tones, dusty.
        Right (after): vivid, saturated colors, bright (#4CAF50 greens, clean whites).
        Dramatic color contrast between sides. Dark text (#333333) on light areas.`,
      typography: `"BEFORE" label on left (muted), "AFTER" label on right (bold, bright).
        Clean sans-serif. Service name in center or bottom. Clear hierarchy.`,
      elements: `Split divider line or gradient, matching compositions on both sides,
        arrows or swipe indicator, "BEFORE | AFTER" label strip.`,
      mood: `Transformative, satisfying, proof-of-work. See the difference.
        This is visual evidence that the shop delivers results.`,
    },
    textPrompt: {
      tone: 'Confident, results-driven, proof-based',
      vocabulary: ['transform', 'before', 'after', 'results', 'difference', 'restored'],
    },
    mockupScenes: ['split screen comparison', 'swipe reveal', 'side-by-side frames'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'dramatic-reveal',
    name: 'Dramatic Reveal',
    category: 'before-after',
    shortDescription: 'Diagonal wipe with strong color contrast',
    previewColors: ['#666666', '#FF6B35', '#1A1A2E', '#FFFFFF'],
    imagePrompt: {
      style: `Dramatic diagonal reveal. Faded, worn "before" state on upper-left fading diagonally
        into vivid, restored "after" state on lower-right. Strong diagonal line or gradient
        creating a reveal wipe effect. Cinematic transformation.`,
      colorPalette: `Before zone: desaturated gray (#666666), muted.
        After zone: vibrant orange/highlight (#FF6B35), rich darks (#1A1A2E).
        The color shift IS the reveal — before is dull, after pops.`,
      typography: `Dynamic angle text following the diagonal. Bold transformation words.
        "THE TRANSFORMATION" or "SEE THE DIFFERENCE" in bold block text.`,
      elements: `Diagonal wipe line, paint stroke or light beam as divider,
        sparkle/shine effects on the "after" side. Dynamic composition.`,
      mood: `Dramatic, cinematic, reveal moment. The "big transformation" reveal.
        Social media engagement magnet — people love transformations.`,
    },
    textPrompt: {
      tone: 'Dramatic, confident, transformative',
      vocabulary: ['reveal', 'transformation', 'watch this', 'incredible', 'restored', 'like new'],
    },
    mockupScenes: ['diagonal reveal', 'swipe transition', 'curtain pull'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'repair-timeline',
    name: 'Repair Story',
    category: 'before-after',
    shortDescription: '3-panel strip: Problem → Work → Result',
    previewColors: ['#C53030', '#FFD700', '#4CAF50', '#1A1A2E'],
    imagePrompt: {
      style: `3-panel comic strip layout: Panel 1 (Problem) shows the issue in red tones,
        Panel 2 (Work) shows the repair in progress in amber/gold tones,
        Panel 3 (Result) shows the fixed result in green/fresh tones.
        Comic-panel borders with numbered steps. Story format.`,
      colorPalette: `Panel 1: warning red (#C53030) tones. Panel 2: work-in-progress gold (#FFD700).
        Panel 3: success green (#4CAF50). Background dark (#1A1A2E). Each panel has its mood color.`,
      typography: `Step numbers "1 → 2 → 3" prominently labeled. Short captions per panel.
        "PROBLEM → FIX → DONE" format. Clean, readable panel text.`,
      elements: `3 equal panels with borders, step numbers, arrow connectors between panels,
        automotive repair sequence imagery. Progress indicator.`,
      mood: `Storytelling, educational, transparent. Showing the customer the full journey
        from problem to solution builds trust and demonstrates expertise.`,
    },
    textPrompt: {
      tone: 'Storytelling, transparent, educational',
      vocabulary: ['step', 'process', 'problem', 'solution', 'fixed', 'journey'],
    },
    mockupScenes: ['comic strip layout', 'timeline view', 'story sequence'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
];

// ============================================================================
// FAMILY 14: BOLD CTA 📣 (3 themes)
// ============================================================================

export const boldCtaThemes: ThemeDefinition[] = [
  {
    id: 'big-offer',
    name: 'Giant Offer',
    category: 'bold-cta',
    shortDescription: '80% of image is the discount in huge bold type',
    previewColors: ['#C53030', '#FFFFFF', '#FFD700', '#1A1A2E'],
    imagePrompt: {
      style: `Bold typographic design. 80% of the image is filled with the discount/price
        in ENORMOUS bold type. Solid color background. Clean sans-serif font.
        The number IS the design. Nothing else competes for attention.
        Think Times Square billboard impact.`,
      colorPalette: `Bold red background (#C53030) or dark navy (#1A1A2E),
        white text (#FFFFFF) for the big number, gold accent (#FFD700) for emphasis.
        Maximum contrast. Two-color impact.`,
      typography: `MASSIVE bold sans-serif. The discount number fills the frame.
        "$29.99" or "50% OFF" at billboard scale. Supporting text tiny below.
        The number is readable from across a room.`,
      elements: `Minimal — just the giant number/price, a thin divider line,
        and small supporting text. Maybe a subtle automotive icon.
        White space IS the design element.`,
      mood: `Direct, impactful, impossible to ignore. No fluff, no filler.
        The offer speaks for itself. LOUD and CLEAR.`,
    },
    textPrompt: {
      tone: 'Direct, urgent, no-nonsense',
      vocabulary: ['now', 'today', 'save', 'only', 'limited', 'deal'],
    },
    mockupScenes: ['storefront window', 'social media ad', 'text message preview'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'quick-facts',
    name: 'Service Card',
    category: 'bold-cta',
    shortDescription: 'Clean menu-style card: icon + service + price',
    previewColors: ['#FFFFFF', '#1A1A2E', '#4CAF50', '#E0E0E0'],
    imagePrompt: {
      style: `Clean service menu card layout. Icon + service name + price in a
        professional card format. Like a restaurant menu but for auto services.
        Modern, minimal, organized. Each service item clearly separated.`,
      colorPalette: `White background (#FFFFFF), dark text (#1A1A2E),
        price highlight green (#4CAF50), subtle divider gray (#E0E0E0).
        Clean, professional, easy to read.`,
      typography: `Clean sans-serif throughout. Service names in medium weight,
        prices in bold. Section headers in uppercase small text. Organized hierarchy.
        Nothing fancy — clarity is the goal.`,
      elements: `Small service icons (wrench, oil drop, tire, etc.), price tags,
        horizontal divider lines, clean card border with subtle shadow.
        Menu-style list format.`,
      mood: `Organized, transparent, professional. Customers see exactly what they get
        and what it costs. No surprises. Trust through transparency.`,
    },
    textPrompt: {
      tone: 'Clear, professional, transparent pricing',
      vocabulary: ['starting at', 'includes', 'service', 'complete', 'package', 'price'],
    },
    mockupScenes: ['service counter card', 'social media post', 'email newsletter'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'urgency-countdown',
    name: 'Limited Time',
    category: 'bold-cta',
    shortDescription: '"THIS WEEK ONLY" with bold red + clock urgency',
    previewColors: ['#C53030', '#1A1A2E', '#FFFFFF', '#FFD700'],
    imagePrompt: {
      style: `Urgency-driven promotional design. "THIS WEEK ONLY" or "LIMITED TIME" aesthetic.
        Bold red and black color scheme. Clock or countdown imagery.
        Creates FOMO (fear of missing out). Deadline-driven design.`,
      colorPalette: `Urgent red (#C53030), dark black (#1A1A2E), white text (#FFFFFF),
        gold accent (#FFD700) for price/deal highlight.
        Red = urgency, black = authority, gold = value.`,
      typography: `Heavy condensed sans-serif. "LIMITED TIME" in stamped/stencil style.
        Countdown numbers bold. "ACT NOW" / "ENDS FRIDAY" urgency text.
        Every word is a call to action.`,
      elements: `Clock/timer graphic, countdown numbers, starburst "SALE" badge,
        diagonal corner banner, red alert stripe. Scarcity indicators.`,
      mood: `Urgent, time-sensitive, act-now energy. Creates healthy FOMO.
        The customer feels like they'd be missing out if they don't call today.`,
    },
    textPrompt: {
      tone: 'Urgent, time-sensitive, motivating',
      vocabulary: ['limited', 'this week', 'ends soon', 'don\'t miss', 'act now', 'hurry'],
    },
    mockupScenes: ['window banner', 'social media ad', 'email blast'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
];

// ============================================================================
// FAMILY 15: EDITORIAL 📰 (3 themes)
// ============================================================================

export const editorialThemes: ThemeDefinition[] = [
  {
    id: 'magazine-cover',
    name: 'Cover Story',
    category: 'editorial',
    shortDescription: 'Automotive magazine cover with masthead and hero car',
    previewColors: ['#1A1A2E', '#C53030', '#FFFFFF', '#FFD700'],
    imagePrompt: {
      style: `Automotive magazine cover layout. Masthead at top, feature headline overlaying
        hero car image. Luxury editorial design. Cover lines on left side.
        Barcode/issue number in corner. Glossy magazine aesthetic.`,
      colorPalette: `Dark elegant background (#1A1A2E), red accent (#C53030),
        white text (#FFFFFF), gold highlights (#FFD700).
        Magazine-premium color scheme. Glossy and rich.`,
      typography: `Serif masthead font for magazine title. Bold sans-serif for feature headline.
        Italic for cover lines. Mix of weights creates editorial hierarchy.
        Elegant, authoritative, magazine-quality typography.`,
      elements: `Magazine masthead, cover lines, barcode graphic, issue number,
        "EXCLUSIVE" or "SPECIAL ISSUE" badge, hero car photograph.
        Full magazine cover composition.`,
      mood: `Prestigious, authoritative, feature-worthy. This auto shop is important enough
        to be a magazine cover story. Premium editorial feel.`,
    },
    textPrompt: {
      tone: 'Editorial, authoritative, prestigious',
      vocabulary: ['exclusive', 'feature', 'inside', 'discover', 'premium', 'spotlight'],
    },
    mockupScenes: ['magazine rack', 'newsstand display', 'coffee table spread'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'auto-editorial',
    name: 'Editorial Spread',
    category: 'editorial',
    shortDescription: 'Clean editorial layout with hero image and elegant text',
    previewColors: ['#F5F5F0', '#1A1A2E', '#C53030', '#808080'],
    imagePrompt: {
      style: `Clean automotive editorial spread. Large hero image area with elegant text overlay.
        Premium magazine interior page feel. Serif headlines with generous white space.
        Art-directed photography composition. Editorial grid layout.`,
      colorPalette: `Warm paper white (#F5F5F0), rich dark text (#1A1A2E),
        red accent (#C53030), sophisticated gray (#808080).
        Understated elegance. Quality paper feel.`,
      typography: `Elegant serif for headlines (like Playfair or similar). Thin sans-serif body text.
        Large drop cap or pull quote. Generous letter-spacing and line-height.
        Typography that whispers luxury.`,
      elements: `Large hero image, pull quote, elegant rule lines, drop cap,
        column layout suggestion, subtle page number. Editorial grid.`,
      mood: `Sophisticated, premium, editorial. This isn't a flyer — it's a feature article.
        The kind of quality that signals "we're serious professionals."`,
    },
    textPrompt: {
      tone: 'Sophisticated, refined, editorial',
      vocabulary: ['artisan', 'excellence', 'heritage', 'distinguished', 'curated', 'tradition'],
    },
    mockupScenes: ['magazine interior spread', 'coffee table display', 'framed editorial'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'newsletter-card',
    name: 'Newsletter',
    category: 'editorial',
    shortDescription: 'Modern card format: icon + headline + body text',
    previewColors: ['#FFFFFF', '#3A86FF', '#1A1A2E', '#F0F0F0'],
    imagePrompt: {
      style: `Modern newsletter card design. Clean card with rounded corners, icon at top,
        bold headline, short body text. Works for email or social media.
        Modern SaaS/tech newsletter aesthetic. Figma-quality design.`,
      colorPalette: `White card (#FFFFFF), brand blue (#3A86FF), dark text (#1A1A2E),
        light background (#F0F0F0). Clean, modern, accessible palette.`,
      typography: `Modern geometric sans-serif. Bold headline, regular body text.
        Clear hierarchy: icon → headline → body → CTA button.
        Digital-first readability.`,
      elements: `Rounded card border with shadow, simple icon at top,
        CTA button at bottom, clean section dividers.
        Minimal, functional, modern.`,
      mood: `Modern, informative, trustworthy. Like a well-designed email update
        from a brand you like. Professional but approachable.`,
    },
    textPrompt: {
      tone: 'Modern, informative, approachable',
      vocabulary: ['update', 'news', 'tip', 'learn', 'discover', 'this week'],
    },
    mockupScenes: ['email inbox', 'social media card', 'notification preview'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
];

// ============================================================================
// FAMILY 16: EDU-TIPS 💡 (3 themes)
// ============================================================================

export const eduTipsThemes: ThemeDefinition[] = [
  {
    id: 'tip-card',
    name: 'Pro Tip',
    category: 'edu-tips',
    shortDescription: '"Did you know?" format with icon and single tip',
    previewColors: ['#4CAF50', '#FFFFFF', '#1A1A2E', '#FFD700'],
    imagePrompt: {
      style: `Educational tip card. Lightbulb or "Did You Know?" icon at top.
        Single automotive maintenance tip with clear explanation.
        Clean background, one key message. Shareable wisdom format.
        Instagram infographic card style.`,
      colorPalette: `Green knowledge accent (#4CAF50), white background (#FFFFFF),
        dark text (#1A1A2E), gold lightbulb (#FFD700).
        Clean, educational, trustworthy palette.`,
      typography: `"DID YOU KNOW?" or "PRO TIP" in bold uppercase header.
        Tip text in clear, readable medium weight. Key stat or number in extra-bold.
        Hierarchy: label → tip → detail.`,
      elements: `Lightbulb icon, checkmark, single automotive illustration,
        tip number badge, clean card border. One tip, one visual. No clutter.`,
      mood: `Helpful, educational, establishing expertise. Position the shop as the
        knowledgeable friend who saves you money with good advice.`,
    },
    textPrompt: {
      tone: 'Helpful, educational, friendly expert',
      vocabulary: ['did you know', 'pro tip', 'save money', 'prevent', 'check', 'maintain'],
    },
    mockupScenes: ['social media card', 'phone screen', 'bulletin board pin'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'numbered-list',
    name: 'Top 5',
    category: 'edu-tips',
    shortDescription: '"5 Signs Your Brakes Need Service" numbered list',
    previewColors: ['#3A86FF', '#1A1A2E', '#FFFFFF', '#FFD700'],
    imagePrompt: {
      style: `Numbered list infographic. "5 Signs Your [Service] Needs Attention" format.
        Each item numbered with small icon. Clean vertical list layout.
        Instagram carousel-style single slide. Infographic quality.`,
      colorPalette: `Blue accent (#3A86FF), dark text (#1A1A2E), white background (#FFFFFF),
        gold number highlights (#FFD700). Professional infographic palette.`,
      typography: `Bold numbered list items. Numbers large and colorful, text clear and medium.
        Title in extra-bold at top. "1. 2. 3. 4. 5." format is the visual anchor.
        Each item one line of text.`,
      elements: `Large numbers (1-5), small icons per item (checkmark, wrench, warning),
        vertical list layout, clean dividers between items. Infographic style.`,
      mood: `Educational, authoritative, helpful. "Save this for later" content.
        Valuable enough that people screenshot and share it.`,
    },
    textPrompt: {
      tone: 'Authoritative, list-format, educational',
      vocabulary: ['signs', 'top', 'things', 'ways', 'mistakes', 'tips'],
    },
    mockupScenes: ['social carousel slide', 'infographic poster', 'phone screenshot'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
  {
    id: 'myth-buster',
    name: 'Myth vs Fact',
    category: 'edu-tips',
    shortDescription: 'Two-column checkmarks vs X marks, true or false',
    previewColors: ['#C53030', '#4CAF50', '#FFFFFF', '#1A1A2E'],
    imagePrompt: {
      style: `Myth vs Fact comparison infographic. Two-column layout with X marks (myths)
        on left and checkmarks (facts) on right. "TRUE or FALSE" automotive facts.
        Clean infographic design. Educational and shareable.`,
      colorPalette: `Red for myths (#C53030), green for facts (#4CAF50),
        white background (#FFFFFF), dark text (#1A1A2E).
        Red = wrong, green = right. Universal color coding.`,
      typography: `"MYTH" in red bold, "FACT" in green bold. Content text in medium weight.
        "VS" or divider between columns. Clear column headers.
        Readable at any size.`,
      elements: `X marks and checkmarks, two-column divider, "MYTH vs FACT" header,
        automotive icons for each point, clean infographic borders.
        Red/green color coding throughout.`,
      mood: `Myth-busting, educational, authority-building. The shop that sets the record
        straight. Shareable content that starts conversations.`,
    },
    textPrompt: {
      tone: 'Myth-busting, authoritative, educational',
      vocabulary: ['myth', 'fact', 'truth', 'actually', 'common mistake', 'the real story'],
    },
    mockupScenes: ['social media infographic', 'waiting room poster', 'educational handout'],
    compatibleTools: ['promo_flyer', 'instant_pack'],
  },
];

// ============================================================================
// ALL CONTENT THEMES COMBINED
// ============================================================================

export const ALL_CONTENT_THEMES: ThemeDefinition[] = [
  ...proPhotographyThemes,
  ...socialMemeThemes,
  ...beforeAfterThemes,
  ...boldCtaThemes,
  ...editorialThemes,
  ...eduTipsThemes,
];
