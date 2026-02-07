/**
 * UGC Creator — Scene Library
 * All 33 scenes from docs/video-creator-kb.md Section 3
 */

export interface Scene {
  id: string;
  name: string;
  category: string;
  prompt: string;
  shortDescription: string;
  /** If set, overrides the selected actor with this actor id */
  forceActor?: string;
}

export const SCENE_CATEGORIES = [
  'comedy',
  'scroll-stoppers',
  'pov',
  'asmr',
  'commercial',
] as const;

export type SceneCategory = (typeof SCENE_CATEGORIES)[number];

export const SCENES: Scene[] = [
  // ─── Comedy (Mishaps & Antics) ───────────────────────────────────────────
  {
    id: 'the-misfire',
    name: 'The Misfire',
    category: 'comedy',
    prompt:
      'The character is leaning over the open hood working. Suddenly, a small puff of black smoke explodes from the engine into their face. They cough and look at the camera with soot on their face.',
    shortDescription: 'Smoke explosion in the face',
  },
  {
    id: 'oil-squirt',
    name: 'Oil Squirt',
    category: 'comedy',
    prompt:
      'The character loosens a bolt and a stream of black oil comically squirts out, hitting them right in the safety goggles. They freeze in shock.',
    shortDescription: 'Oil hits the goggles',
  },
  {
    id: 'the-price-faint',
    name: 'The Price Faint',
    category: 'comedy',
    prompt:
      'The character is holding a piece of paper, looks at it with shock, and dramatically faints backward onto the floor in a comical way.',
    shortDescription: 'Dramatic faint at the price',
  },
  {
    id: 'tangled-up',
    name: 'Tangled Up',
    category: 'comedy',
    prompt:
      'The character is struggling and getting comically tangled up in bright orange air compressor hoses, spinning around looking confused.',
    shortDescription: 'Tangled in hoses',
  },
  {
    id: 'friday-dance',
    name: 'Friday Dance',
    category: 'comedy',
    prompt:
      'The character is doing a funny, high-energy victory dance, waving their arms in the air celebrating.',
    shortDescription: 'Victory dance celebration',
  },
  {
    id: 'chefs-kiss',
    name: "Chef's Kiss",
    category: 'comedy',
    prompt:
      "The character looks at the engine, nods approvingly, and performs a perfect Italian chef's kiss gesture.",
    shortDescription: 'Perfect engine appreciation',
  },
  {
    id: 'the-extra-part',
    name: 'The Extra Part',
    category: 'comedy',
    prompt:
      'The character is holding a single metal bolt, looking back and forth between the bolt and the car engine with exaggerated confusion.',
    shortDescription: 'Leftover bolt confusion',
  },
  {
    id: 'call-the-manager',
    name: 'Call the Manager',
    category: 'comedy',
    prompt:
      "The character is aggressively tapping a clipboard and pointing a finger, mouthing 'I want to speak to the manager' with an angry expression.",
    shortDescription: 'Manager demand',
  },
  {
    id: 'tiny-scratch',
    name: 'Tiny Scratch',
    category: 'comedy',
    prompt:
      'The character is using a huge magnifying glass to inspect a tiny, invisible spot on the car paint, looking extremely skeptical.',
    shortDescription: 'Inspecting invisible scratch',
  },
  {
    id: 'the-noise',
    name: 'The Noise',
    category: 'comedy',
    prompt:
      "The character holds a finger to their lips saying 'Shhh!' and leans their ear exaggeratedly close to the engine block to listen.",
    shortDescription: 'Listening for the noise',
  },
  {
    id: 'upside-down-manual',
    name: 'Upside Down Manual',
    category: 'comedy',
    prompt:
      'The character is intensely studying a repair manual, scratching their head. The camera reveals they are holding the book upside down.',
    shortDescription: 'Book held upside down',
  },
  {
    id: 'the-hammer-fix',
    name: 'The Hammer Fix',
    category: 'comedy',
    prompt:
      'The character is looking at a delicate computer chip, shrugs, and lifts a giant cartoonish mallet to hit it.',
    shortDescription: 'Giant mallet solution',
  },
  {
    id: 'the-zapper',
    name: 'The Zapper',
    category: 'comedy',
    prompt:
      'The character touches a wire and their whole body vibrates comically as if getting a mild electric shock, hair standing on end.',
    shortDescription: 'Comic electric shock',
  },
  {
    id: 'the-argument',
    name: 'The Argument',
    category: 'comedy',
    prompt:
      'The main character is waving their arms and arguing comically with a second blurry mechanic puppet in the background who is shaking their head.',
    shortDescription: 'Puppet argument',
  },
  {
    id: 'the-complaint',
    name: 'The Complaint',
    category: 'comedy',
    prompt:
      'The character is aggressively yelling and pointing a finger at the car engine as if scolding it for breaking down.',
    shortDescription: 'Scolding the engine',
  },

  // ─── Scroll-Stoppers (High Attention) ────────────────────────────────────
  {
    id: 'car-hypnosis',
    name: 'Car Hypnosis',
    category: 'scroll-stoppers',
    prompt:
      "The character holds a pocket watch in front of the car headlights, swinging it back and forth, intently whispering 'You are getting sleepy... start for me...'",
    shortDescription: 'Hypnotizing the car',
  },
  {
    id: 'dr-mechanic',
    name: 'Dr. Mechanic',
    category: 'scroll-stoppers',
    prompt:
      'The character wears a medical stethoscope, listening to the engine block with the seriousness of a heart surgeon, nodding gravely.',
    shortDescription: 'Engine stethoscope exam',
  },
  {
    id: 'the-long-manual',
    name: 'The Long Manual',
    category: 'scroll-stoppers',
    prompt:
      'The character opens a repair manual that comically unfolds like an accordion, stretching out of the frame and wrapping around them.',
    shortDescription: 'Never-ending manual',
  },
  {
    id: 'too-much-coffee',
    name: 'Too Much Coffee',
    category: 'scroll-stoppers',
    prompt:
      "The character is holding a mug that says 'Jet Fuel'. They are vibrating intensely from caffeine, trying to thread a needle or hold a tiny screw.",
    shortDescription: 'Caffeine jitters',
  },
  {
    id: 'duck-avalanche',
    name: 'Duck Avalanche',
    category: 'scroll-stoppers',
    prompt:
      'The character opens the car door and is immediately buried under an avalanche of hundreds of rubber ducks.',
    shortDescription: 'Rubber duck flood',
  },
  {
    id: 'the-magic-trick',
    name: 'The Magic Trick',
    category: 'scroll-stoppers',
    prompt:
      'The character tries to pull a wrench from a top hat but pulls out a rubber chicken instead, looking confused.',
    shortDescription: 'Rubber chicken magic',
  },
  {
    id: 'tire-workout',
    name: 'Tire Workout',
    category: 'scroll-stoppers',
    prompt:
      'The character is using a lug wrench like a dumbbell, struggling to lift it, sweating profusely with a headband on.',
    shortDescription: 'Wrench weightlifting',
  },
  {
    id: 'easy-fix-celebration',
    name: 'Easy Fix Celebration',
    category: 'scroll-stoppers',
    prompt:
      'The character tightens one single screw, then immediately pulls a cord releasing a massive confetti cannon celebration.',
    shortDescription: 'Confetti for one screw',
  },
  {
    id: 'the-squeak',
    name: 'The Squeak',
    category: 'scroll-stoppers',
    prompt:
      'The character is hunting a squeaking noise with a microphone. Every time they move their arm, their own elbow squeaks comically.',
    shortDescription: 'Squeaky elbow hunt',
  },
  {
    id: 'duct-tape-master',
    name: 'Duct Tape Master',
    category: 'scroll-stoppers',
    prompt:
      "The character is tangled in a mess of silver duct tape, looking at the camera with a 'mistakes were made' expression.",
    shortDescription: 'Duct tape disaster',
  },

  // ─── POV (Relatable) ────────────────────────────────────────────────────
  {
    id: 'the-diagnosis',
    name: 'The Diagnosis',
    category: 'pov',
    prompt:
      'Camera POV: The mechanic leans in close to the engine bay, holding a hand to their ear, listening intensely to a sound.',
    shortDescription: 'Listening for the problem',
  },
  {
    id: 'the-approval',
    name: 'The Approval',
    category: 'pov',
    prompt:
      'The mechanic wipes their hands on a rag, looks at the camera, and gives a confident, respectful nod of approval.',
    shortDescription: 'Confident nod of approval',
  },
  {
    id: 'the-diy-fail',
    name: 'The DIY Fail',
    category: 'pov',
    prompt:
      'The mechanic looks at the engine, sighs deeply, and does a slow, dramatic facepalm.',
    shortDescription: 'DIY facepalm',
  },
  {
    id: 'hard-work',
    name: 'Hard Work',
    category: 'pov',
    prompt:
      'The mechanic finishes a job, wipes their forehead with the back of their arm, and smiles with satisfaction.',
    shortDescription: 'Satisfied after hard work',
  },

  // ─── ASMR (Satisfying) — always use puppet-hands ────────────────────────
  {
    id: 'the-golden-pour',
    name: 'The Golden Pour',
    category: 'asmr',
    prompt:
      'Extreme close up of fuzzy puppet hands holding a quart of oil. Golden oil creates a smooth, satisfying laminar flow into the engine.',
    shortDescription: 'Satisfying oil pour',
    forceActor: 'puppet-hands',
  },
  {
    id: 'the-click',
    name: 'The Click',
    category: 'asmr',
    prompt:
      'Close up of fuzzy puppet hands using a chrome torque wrench on a bolt. Slow, deliberate movement until it clicks.',
    shortDescription: 'Satisfying torque click',
    forceActor: 'puppet-hands',
  },
  {
    id: 'soap-cannon',
    name: 'Soap Cannon',
    category: 'asmr',
    prompt:
      'Wide shot of fuzzy puppet hands holding a foam cannon. Thick, satisfying white soap foam covers a car completely.',
    shortDescription: 'Foam cannon satisfaction',
    forceActor: 'puppet-hands',
  },
  {
    id: 'the-peel',
    name: 'The Peel',
    category: 'asmr',
    prompt:
      'Extreme close up of fuzzy puppet hands slowly peeling the protective plastic film off a shiny new chrome emblem.',
    shortDescription: 'Chrome peel reveal',
    forceActor: 'puppet-hands',
  },

  // ─── Commercial / TV Spot (dynamic prompt via commercialScript) ───────
  {
    id: 'tv-commercial',
    name: 'TV Commercial',
    category: 'commercial',
    prompt:
      'POV close-up of the character speaking excitedly and fast directly into the camera lens. They are acting out a high-energy sales pitch. Background is a busy auto shop. Cinematic lighting.',
    shortDescription: 'Custom sales pitch to camera',
  },
];

export function getSceneById(id: string): Scene | undefined {
  return SCENES.find((s) => s.id === id);
}

export function getScenesByCategory(category: string): Scene[] {
  return SCENES.filter((s) => s.category === category);
}
