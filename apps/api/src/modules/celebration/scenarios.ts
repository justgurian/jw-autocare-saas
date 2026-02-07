/**
 * Celebration Scenarios — 28 scenario templates across 5 categories
 * with person tags, occasion tags, and a prompt builder for Veo video generation.
 */

export interface CelebrationScenario {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  prompt: string;
  occasionTags: string[];
}

// ---------------------------------------------------------------------------
// 28 Celebration Scenarios
// ---------------------------------------------------------------------------

export const CELEBRATION_SCENARIOS: CelebrationScenario[] = [
  // ── DANCE (5) ──────────────────────────────────────────────────────────
  {
    id: 'tiktok-dance',
    name: 'TikTok Dance',
    category: 'dance',
    icon: '🕺',
    description: 'Break into a viral TikTok dance in the service bay',
    prompt:
      'Person breaks into viral TikTok dance in service bay, mechanics cheer in background, phone propped up recording. Auto repair shop setting, professional video quality. {PERSON} is the star of the video. {TAGS}',
    occasionTags: ['birthday', 'employee-of-month', 'just-because'],
  },
  {
    id: 'victory-dance',
    name: 'Victory Dance',
    category: 'dance',
    icon: '🎉',
    description: 'Celebratory dance under the car lift with confetti',
    prompt:
      'Person does celebratory dance under car lift, confetti falls from above, arms pumping. {PERSON} celebrating triumphantly. {TAGS}',
    occasionTags: ['promotion', 'employee-of-month', 'anniversary', 'just-because'],
  },
  {
    id: 'the-strut',
    name: 'The Boss Strut',
    category: 'dance',
    icon: '😎',
    description: 'Slow-mo walk through the shop like a boss',
    prompt:
      'Person walks through shop in slow-mo with dramatic backlight, mechanics part like Red Sea, wind blows hair. {PERSON} owns the room. {TAGS}',
    occasionTags: ['promotion', 'employee-of-month', 'just-because'],
  },
  {
    id: 'line-dance',
    name: 'Line Dance',
    category: 'dance',
    icon: '🤠',
    description: 'Lead a country line dance with the crew',
    prompt:
      'Person leads a line dance with mechanics in jumpsuits, synchronized moves, country music vibes, auto shop background. {PERSON} leading the crew. {TAGS}',
    occasionTags: ['birthday', 'retirement', 'just-because'],
  },
  {
    id: 'air-guitar',
    name: 'Air Guitar Hero',
    category: 'dance',
    icon: '🎸',
    description: 'Shred air guitar with a wrench while sparks fly',
    prompt:
      'Person shreds air guitar with a wrench while sparks fly from grinder behind them, rock concert lighting in auto shop. {PERSON} performing. {TAGS}',
    occasionTags: ['birthday', 'just-because'],
  },

  // ── COMEDY (8) ─────────────────────────────────────────────────────────
  {
    id: 'caught-dancing',
    name: 'Caught Dancing',
    category: 'comedy',
    icon: '😳',
    description: 'Caught dancing alone when someone opens the door',
    prompt:
      'Person dancing alone in empty auto shop, someone opens door, person freezes mid-move with guilty face. {PERSON} is caught red-handed. {TAGS}',
    occasionTags: ['birthday', 'just-because'],
  },
  {
    id: 'mic-drop',
    name: 'The Mic Drop',
    category: 'comedy',
    icon: '🎤',
    description: 'Diagnose, fix, drop the wrench, walk away',
    prompt:
      'Person diagnoses car problem instantly, fixes with one wrench turn, drops wrench like a mic, walks away without looking back. {PERSON} nails it. {TAGS}',
    occasionTags: ['employee-of-month', 'promotion', 'just-because'],
  },
  {
    id: 'the-glow-up',
    name: 'The Glow-Up',
    category: 'comedy',
    icon: '✨',
    description: 'Greasy mechanic spins into a glamorous transformation',
    prompt:
      'Person covered in grease and soot in auto shop, dramatic spin, emerges clean glamorous hair perfect, winks at camera. {PERSON} transformation. {TAGS}',
    occasionTags: ['birthday', 'promotion', 'just-because'],
  },
  {
    id: 'tire-throne',
    name: 'Tire Throne',
    category: 'comedy',
    icon: '👑',
    description: 'Sit on a throne of tires wearing a crown',
    prompt:
      'Person sits on a throne made of stacked tires wearing a crown, waving royally at mechanics bowing in auto shop. {PERSON} rules the shop. {TAGS}',
    occasionTags: ['employee-of-month', 'promotion', 'birthday'],
  },
  {
    id: 'the-flex',
    name: 'The Flex',
    category: 'comedy',
    icon: '💪',
    description: 'Flex dramatically after tightening a single bolt',
    prompt:
      'Person tightens single bolt, flexes muscles dramatically, action movie angle, lightning cracks behind them in auto shop. {PERSON} showing off. {TAGS}',
    occasionTags: ['employee-of-month', 'just-because'],
  },
  {
    id: 'wrong-tool',
    name: 'Wrong Tool',
    category: 'comedy',
    icon: '🔧',
    description: 'Grab the wrong tool three times before nailing it',
    prompt:
      'Person confidently grabs wrong tool, wrong tool, wrong tool — finally right one, finger guns at camera, winks. Auto shop setting. {PERSON} figures it out. {TAGS}',
    occasionTags: ['welcome', 'birthday', 'just-because'],
  },
  {
    id: 'confetti-bomb',
    name: 'Confetti Bomb',
    category: 'comedy',
    icon: '🎊',
    description: 'Confetti cannon fires mid-speech, zero flinch',
    prompt:
      "Person giving serious speech to camera in auto shop, confetti cannon fires behind them, they don't flinch, keeps talking. {PERSON} unfazed. {TAGS}",
    occasionTags: ['birthday', 'anniversary', 'retirement', 'just-because'],
  },
  {
    id: 'the-review',
    name: '5-Star Review',
    category: 'comedy',
    icon: '⭐',
    description: 'Read a glowing review like an Oscar speech',
    prompt:
      'Person reads a glowing review aloud dramatically like an Oscar acceptance speech in auto shop, tears up, thanks the team. {PERSON} accepts the award. {TAGS}',
    occasionTags: ['employee-of-month', 'just-because'],
  },

  // ── EPIC (6) ───────────────────────────────────────────────────────────
  {
    id: 'superhero-landing',
    name: 'Superhero Landing',
    category: 'epic',
    icon: '🦸',
    description: 'Three-point superhero landing with shockwave',
    prompt:
      'Person lands in 3-point superhero pose in front of auto shop, shockwave ripple, sparks fly, dramatic cinematic lighting. {PERSON} arrives. {TAGS}',
    occasionTags: ['welcome', 'promotion', 'birthday', 'just-because'],
  },
  {
    id: 'the-entrance',
    name: 'The Entrance',
    category: 'epic',
    icon: '🚪',
    description: 'Fog parts as you walk through the garage door',
    prompt:
      'Fog and smoke parts as person walks through garage door dramatically, silhouette to reveal, slow motion in auto shop. {PERSON} makes an entrance. {TAGS}',
    occasionTags: ['welcome', 'promotion', 'just-because'],
  },
  {
    id: 'time-freeze',
    name: 'Time Freeze',
    category: 'epic',
    icon: '⏸️',
    description: 'Walk through a frozen scene sipping coffee',
    prompt:
      'Everyone in auto shop frozen mid-action, person walks through frozen scene casually sipping coffee, unfazed. {PERSON} too cool. {TAGS}',
    occasionTags: ['employee-of-month', 'promotion', 'just-because'],
  },
  {
    id: 'the-transformation',
    name: 'The Transformation',
    category: 'epic',
    icon: '🔄',
    description: 'Spin-transform into full mechanic gear with cape',
    prompt:
      'Person spins and transforms from street clothes into full mechanic gear with cape, sparkle effects in auto shop. {PERSON} powers up. {TAGS}',
    occasionTags: ['welcome', 'promotion', 'just-because'],
  },
  {
    id: 'slow-mo-catch',
    name: 'Slow-Mo Catch',
    category: 'epic',
    icon: '🎬',
    description: 'Catch a falling wrench while an explosion goes off behind you',
    prompt:
      "Person catches falling wrench in epic slow-motion, explosion in background they don't look at, cool guys don't look at explosions. Auto shop. {PERSON} is legendary. {TAGS}",
    occasionTags: ['employee-of-month', 'just-because'],
  },
  {
    id: 'the-montage',
    name: 'Training Montage',
    category: 'epic',
    icon: '🏋️',
    description: 'Rocky-style training montage in the shop',
    prompt:
      'Rocky-style montage: lifting tires, running with toolbox, jumping jacks with wrenches, ending with celebration in auto shop. {PERSON} trains hard. {TAGS}',
    occasionTags: ['promotion', 'anniversary', 'just-because'],
  },

  // ── BEHIND THE SCENES (5) ─────────────────────────────────────────────
  {
    id: 'day-one',
    name: 'Day One',
    category: 'behind-the-scenes',
    icon: '📱',
    description: 'POV first day at the shop, wide-eyed and overwhelmed',
    prompt:
      'POV: First day at the shop — person looks wide-eyed at giant engine, overwhelmed expression, comedic UGC style, auto shop. {PERSON} on day one. {TAGS}',
    occasionTags: ['welcome', 'just-because'],
  },
  {
    id: 'the-interview',
    name: 'The Interview',
    category: 'behind-the-scenes',
    icon: '🎙️',
    description: 'Fake interview with funny questions and cutaway reactions',
    prompt:
      'Fake interview with ring light in auto shop, person answers funny questions, cutaway reactions, vlog style. {PERSON} in the hot seat. {TAGS}',
    occasionTags: ['employee-of-month', 'birthday', 'just-because'],
  },
  {
    id: 'shop-tour',
    name: 'Shop Tour',
    category: 'behind-the-scenes',
    icon: '🏪',
    description: 'Enthusiastic influencer-style shop tour',
    prompt:
      'Person gives enthusiastic shop tour, pointing at everything excitedly, zooming in on details, influencer energy, auto repair shop. {PERSON} shows off. {TAGS}',
    occasionTags: ['welcome', 'just-because'],
  },
  {
    id: 'grwm',
    name: 'Get Ready With Me',
    category: 'behind-the-scenes',
    icon: '👔',
    description: 'GRWM mechanic edition: gear up for the day',
    prompt:
      'GRWM mechanic edition: jumpsuit zip-up, gloves snap on, safety glasses, tool belt click, ready pose. Auto shop morning. {PERSON} gears up. {TAGS}',
    occasionTags: ['welcome', 'just-because'],
  },
  {
    id: 'day-in-life',
    name: 'A Day In My Life',
    category: 'behind-the-scenes',
    icon: '📅',
    description: 'Mini montage from alarm to sunset in the shop',
    prompt:
      'Mini montage: alarm, coffee, arriving at auto shop, working on cars, high-fives, sunset satisfied smile. {PERSON} day in the life. {TAGS}',
    occasionTags: ['anniversary', 'birthday', 'just-because'],
  },

  // ── HEARTFELT (4) ─────────────────────────────────────────────────────
  {
    id: 'standing-ovation',
    name: 'Standing Ovation',
    category: 'heartfelt',
    icon: '👏',
    description: 'Coworkers rise to applaud, group hug moment',
    prompt:
      'Coworkers rise to applaud person in auto shop, slow camera push-in, person gets emotional, group hug. {PERSON} is celebrated. {TAGS}',
    occasionTags: ['retirement', 'anniversary', 'employee-of-month', 'farewell'],
  },
  {
    id: 'wall-of-fame',
    name: 'Wall of Fame',
    category: 'heartfelt',
    icon: '🖼️',
    description: 'Photo hung on the Wall of Fame with a spotlight',
    prompt:
      "Person's photo gets ceremonially hung on Wall of Fame in auto shop, spotlight illuminates, applause from team. {PERSON} immortalized. {TAGS}",
    occasionTags: ['retirement', 'anniversary', 'employee-of-month'],
  },
  {
    id: 'highlight-reel',
    name: 'Highlight Reel',
    category: 'heartfelt',
    icon: '🎞️',
    description: 'Quick cuts of hard work, laughs, and celebration',
    prompt:
      'Quick cuts of person working hard, laughing with team, fixing cars, ending with celebration moment in auto shop. {PERSON} highlight reel. {TAGS}',
    occasionTags: ['retirement', 'anniversary', 'farewell'],
  },
  {
    id: 'keys-ceremony',
    name: 'Keys to the Shop',
    category: 'heartfelt',
    icon: '🔑',
    description: 'Ceremonially handed the keys to the shop',
    prompt:
      'Person handed keys ceremonially, they look proud and emotional, auto shop lights up behind them. {PERSON} gets the keys. {TAGS}',
    occasionTags: ['promotion', 'retirement'],
  },
];

// ---------------------------------------------------------------------------
// Person Tags (12)
// ---------------------------------------------------------------------------

export const PERSON_TAGS = [
  { id: 'loves-coffee', label: 'Loves Coffee', icon: '☕', promptInjection: 'always has a coffee in hand' },
  { id: 'car-nerd', label: 'Car Nerd', icon: '🚗', promptInjection: 'a total gearhead who loves talking about engines' },
  { id: 'always-dancing', label: 'Always Dancing', icon: '💃', promptInjection: "can't stop moving and grooving" },
  { id: 'music-lover', label: 'Music Lover', icon: '🎵', promptInjection: 'always has headphones or is humming a tune' },
  { id: 'pizza-fan', label: 'Pizza Obsessed', icon: '🍕', promptInjection: 'probably thinking about pizza right now' },
  { id: 'gym-rat', label: 'Gym Rat', icon: '💪', promptInjection: 'treats every job like a workout' },
  { id: 'cool-calm', label: 'Cool Under Pressure', icon: '😎', promptInjection: 'unshakeable composure, never breaks a sweat' },
  { id: 'tool-expert', label: 'Tool Expert', icon: '🔧', promptInjection: 'knows every tool by name and uses them like an artist' },
  { id: 'dog-person', label: 'Dog Person', icon: '🐕', promptInjection: 'talks about their dog constantly' },
  { id: 'competitive', label: 'Competitive', icon: '🏆', promptInjection: 'turns everything into a competition' },
  { id: 'class-clown', label: 'Class Clown', icon: '🤡', promptInjection: 'always making the team laugh' },
  { id: 'team-player', label: 'Team Player', icon: '❤️', promptInjection: 'always helping others and putting the team first' },
];

// ---------------------------------------------------------------------------
// Occasion Tags (8)
// ---------------------------------------------------------------------------

export const OCCASION_TAGS = [
  { id: 'birthday', label: 'Birthday', icon: '🎂' },
  { id: 'anniversary', label: 'Work Anniversary', icon: '🎉' },
  { id: 'employee-of-month', label: 'Employee of Month', icon: '🏆' },
  { id: 'promotion', label: 'Promotion', icon: '⭐' },
  { id: 'retirement', label: 'Retirement', icon: '🚀' },
  { id: 'welcome', label: 'Welcome / New Hire', icon: '👋' },
  { id: 'farewell', label: 'Farewell', icon: '✈️' },
  { id: 'just-because', label: 'Just Because', icon: '🎊' },
];

// ---------------------------------------------------------------------------
// Prompt Builder
// ---------------------------------------------------------------------------

export function buildCelebrationPrompt(options: {
  scenario: CelebrationScenario;
  personName: string;
  personTags: string[];
  occasion?: string;
  customMessage?: string;
  inputSource: 'photo' | 'mascot' | 'generic';
  mascotDescription?: string;
  businessName: string;
}): string {
  const {
    scenario,
    personName,
    personTags,
    occasion,
    customMessage,
    inputSource,
    mascotDescription,
    businessName,
  } = options;

  const parts: string[] = [];

  // Occasion prefix
  if (occasion) {
    const occasionTag = OCCASION_TAGS.find((t) => t.id === occasion);
    const label = occasionTag ? occasionTag.label : occasion;
    parts.push(`This is a ${label} celebration for ${personName}.`);
  }

  // Scenario prompt with replacements
  const tagPhrases = personTags
    .map((tagId) => PERSON_TAGS.find((t) => t.id === tagId))
    .filter(Boolean)
    .map((t) => t!.promptInjection);

  let scenarioPrompt = scenario.prompt
    .replace(/\{PERSON\}/g, personName)
    .replace(/\{TAGS\}/g, tagPhrases.length > 0 ? tagPhrases.join(', ') : '');

  parts.push(scenarioPrompt);

  // Input source modifiers
  if (inputSource === 'photo') {
    parts.push(`The person in the uploaded photo is ${personName}.`);
  } else if (inputSource === 'mascot') {
    if (mascotDescription) {
      parts.push(mascotDescription);
    }
    parts.push(
      `This Muppet-style puppet character plays the role of ${personName}.`
    );
  } else {
    parts.push(
      `The character is a friendly, enthusiastic Muppet-style puppet mechanic with big expressive eyes and fuzzy fur, playing the role of ${personName}.`
    );
  }

  // Business and quality
  parts.push(
    `Set in ${businessName} auto repair shop. Cinematic video quality, professional lighting, engaging social media content.`
  );

  // Custom message overlay
  if (customMessage) {
    parts.push(`Text overlay: "${customMessage}"`);
  }

  return parts.join(' ');
}
