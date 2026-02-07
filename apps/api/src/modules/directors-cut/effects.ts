/**
 * Director's Cut Studio — Animation Effects
 * All 15 effects from docs/video-creator-kb.md Section 4
 * Each prompt ends with "Keep the text and logo stable."
 */

export interface AnimationEffect {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  negativePrompt: string;
}

export const EFFECTS: AnimationEffect[] = [
  {
    id: 'the-burnout',
    name: 'The Burnout',
    icon: '\uD83D\uDE97', // car
    prompt:
      "The car's rear tires spin aggressively, creating a massive cloud of white smoke. The car shakes with power. Keep the text and logo stable.",
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'the-lowrider',
    name: 'The Lowrider',
    icon: '\uD83D\uDD7A', // dancing
    prompt:
      'The car remains in place but begins to bounce rhythmically on its suspension, front-to-back or side-to-side. Hydraulic suspension action. Hip hop style. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'time-traveler',
    name: 'Time Traveler',
    icon: '\u26A1', // lightning
    prompt:
      'Two trails of fire instantly ignite behind the rear tires, and electricity arcs across the bodywork. The car stays stationary as if revving for a time jump. 80s sci-fi style. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'alien-abduction',
    name: 'Alien Abduction',
    icon: '\uD83D\uDEF8', // ufo
    prompt:
      'The sky darkens, a bright green tractor beam spotlight shines down from above, and the car slowly lifts 6 inches off the ground, floating. Sci-fi atmosphere. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'flash-freeze',
    name: 'Flash Freeze',
    icon: '\u2744\uFE0F', // snowflake
    prompt:
      'A blast of cold wind hits the car, and the entire vehicle and screen instantly frost over with ice crystals and snow. Winter freeze effect. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'cash-storm',
    name: 'Cash Storm',
    icon: '\uD83D\uDCB5', // money
    prompt:
      'Thousands of $100 bills rain down from the sky in slow motion, burying the hood of the car. Money raining everywhere. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'screen-crack',
    name: 'Screen Crack',
    icon: '\uD83D\uDCA5', // collision
    prompt:
      "The car revs and 'bumps' the camera, causing a spiderweb fracture to appear on the 'lens', followed by a digital glitch effect. Breaking the fourth wall. Keep the text and logo stable.",
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'duck-avalanche',
    name: 'Duck Avalanche',
    icon: '\uD83E\uDD86', // duck
    prompt:
      'Instead of rain, hundreds of yellow rubber ducks fall from the sky, bouncing off the windshield and hood. Jeep Ducking tradition. Funny and chaotic. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'vcr-glitch',
    name: 'VCR Glitch',
    icon: '\uD83D\uDCFC', // vhs
    prompt:
      'The image distorts with heavy 1980s VHS tracking lines, color separation, and magnetic distortion, then snaps back to crystal clear. Retro analog video effect. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'exploded-view',
    name: 'Exploded View',
    icon: '\uD83D\uDD27', // wrench
    prompt:
      "The car parts (doors, hood, wheels) float outward slightly, expanding into an 'exploded view' diagram, and then magnetically snap back together tight. Engineering visualization. Keep the text and logo stable.",
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'drive-away',
    name: 'Drive Away',
    icon: '\uD83D\uDE80', // rocket
    prompt:
      'The car accelerates quickly and drives away into the distance, leaving the frame. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'crash-zoom',
    name: 'Crash Zoom',
    icon: '\uD83D\uDD0D', // magnifying glass
    prompt:
      "The camera performs a fast, dramatic crash zoom into the car's front grille. High energy. Keep the text and logo stable.",
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'speed-blur',
    name: 'Speed Blur',
    icon: '\uD83C\uDFCE\uFE0F', // racing car
    prompt:
      'The background transforms into motion-blurred speed lines, making it look like the car is traveling at 200mph. The car remains sharp. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'dust-storm',
    name: 'Dust Storm',
    icon: '\uD83C\uDF2A\uFE0F', // tornado
    prompt:
      'A massive Arizona dust storm blows across the screen, enveloping the car in sand and dust. Dramatic atmosphere. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
  {
    id: 'slow-creep',
    name: 'Slow Creep',
    icon: '\uD83D\uDC40', // eyes
    prompt:
      'The car slowly creeps forward towards the camera, looking menacing and powerful. Low angle. Keep the text and logo stable.',
    negativePrompt: 'warping text, distorted letters, moving logos, morphing text',
  },
];

export function getEffectById(id: string): AnimationEffect | undefined {
  return EFFECTS.find((e) => e.id === id);
}
