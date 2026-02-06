/**
 * Video Creator Prompts
 * Animation presets for Animate My Flyer and commercial vibes for Easy Video
 */

// ─── Animation Presets (Animate My Flyer) ────────────────────────────────────

export type VideoAnimationPreset = 'burnout' | 'money-rain' | 'cinematic-reveal' | 'neon-sign';

interface AnimationPreset {
  id: VideoAnimationPreset;
  name: string;
  icon: string;
  description: string;
  buildPrompt: (businessName: string, topic: string) => string;
  negativePrompt: string;
}

export const ANIMATION_PRESETS: Record<VideoAnimationPreset, AnimationPreset> = {
  burnout: {
    id: 'burnout',
    name: 'Burnout',
    icon: '🏎️',
    description: 'Muscle car peels out with tire smoke in front of your shop',
    buildPrompt: (businessName: string, topic: string) => `
A powerful American muscle car peels out with massive tire smoke in front of "${businessName}" auto shop.
Camera starts tight on spinning rear wheels with rubber smoke billowing, then pulls back dramatically to reveal the full shop signage reading "${businessName}".
Bold text overlay appears: "${topic}".
V8 engine roar shakes the frame. Professional automotive lighting, golden hour sun casting long shadows.
Cinematic slow-motion tire smoke drifting across the frame. The car's paint gleams under warm light.
Chrome details catch lens flares. Exhaust pipes glow cherry red.

AUDIO: Deep V8 engine revving to redline, tire squeal on asphalt, classic rock guitar riff kicks in as the shop name is revealed.

STYLE: Professional automotive commercial, cinematic color grading, anamorphic lens, shallow depth of field on the car with the shop in sharp focus behind.
    `.trim(),
    negativePrompt: 'blurry, low quality, cartoon, anime, text errors, misspelled words, watermark, ugly, deformed cars, bad anatomy, extra wheels',
  },

  'money-rain': {
    id: 'money-rain',
    name: 'Money Rain',
    icon: '💰',
    description: 'Cash rains down from the sky revealing your deal',
    buildPrompt: (businessName: string, topic: string) => `
Hundred dollar bills rain down in ultra slow motion from a bright blue sky, fluttering and spinning.
Camera tilts down smoothly to reveal the front of "${businessName}" auto shop with a bold promotional banner reading "${topic}".
A happy customer standing next to their car gives an enthusiastic thumbs up while cash continues to fall around them.
Cash register cha-ching moment with sparkle effects. Vibrant, saturated colors. Bright daylight.
The bills catch sunlight as they tumble, creating a magical atmosphere of savings and celebration.

AUDIO: Coins clinking and jingling, satisfying cash register ka-ching, triumphant brass fanfare building to a crescendo as the deal text appears.

STYLE: Vibrant commercial, slightly over-the-top celebratory mood, clean professional look, punchy colors, dynamic camera movement.
    `.trim(),
    negativePrompt: 'blurry, low quality, cartoon, anime, text errors, misspelled words, watermark, ugly, dark, gloomy, depressing',
  },

  'cinematic-reveal': {
    id: 'cinematic-reveal',
    name: 'Cinematic Reveal',
    icon: '🎬',
    description: 'Dramatic spotlight reveal of a premium car with your branding',
    buildPrompt: (businessName: string, topic: string) => `
Dramatic dolly-in shot from complete darkness. A single spotlight snaps on, illuminating a pristine premium car with flawless paint.
More studio lights activate one by one, each revealing more of the car's stunning details — chrome trim, glossy paint reflections, perfect curves.
The camera orbits slowly as golden text materializes in the air: "${topic}".
Below it, the "${businessName}" logo appears with an elegant lens flare.
Anamorphic look with horizontal flares, shallow depth of field, the car is the hero.
Reflections dance on the polished floor. Mist or haze catches the light beams.

AUDIO: Deep cinematic bass drone slowly building tension, then a powerful orchestral hit as the full car is revealed. Subtle reverb in the space.

STYLE: Premium automotive reveal, studio lighting, anamorphic widescreen, shallow depth of field, luxury car commercial feel, dark moody atmosphere with dramatic lighting.
    `.trim(),
    negativePrompt: 'blurry, low quality, cartoon, anime, text errors, misspelled words, watermark, ugly, bright daylight, outdoor, cheap looking, deformed car',
  },

  'neon-sign': {
    id: 'neon-sign',
    name: 'Neon Sign',
    icon: '🌙',
    description: 'Neon tubes flicker to life spelling your deal at night',
    buildPrompt: (businessName: string, topic: string) => `
Night scene. A dark vintage auto shop exterior with brick walls and a weathered garage door.
Neon tubes begin to flicker to life one by one, buzzing with electricity, spelling out "${topic}" in bright glowing colors.
Then below, "${businessName}" lights up in a different neon color with a satisfying electrical hum.
Rain falls gently on the pavement, creating beautiful reflections of the neon colors — pinks, blues, greens shimmering on wet asphalt.
A classic car is parked under the neon sign, its chrome catching the colored light.
Puddles on the ground mirror the neon perfectly. Steam rises from a nearby grate.

AUDIO: Electric buzzing as each neon tube ignites, flickering and humming, light rain pattering on pavement, distant smooth jazz saxophone playing softly.

STYLE: Noir-inspired night scene, rich neon color palette, wet reflective surfaces, moody urban atmosphere, cinematic rain, vintage Americana meets modern neon aesthetic.
    `.trim(),
    negativePrompt: 'blurry, low quality, cartoon, anime, text errors, misspelled words, watermark, ugly, daylight, bright sun, modern building, generic',
  },
};

export const ANIMATION_PRESET_OPTIONS = Object.values(ANIMATION_PRESETS).map((p) => ({
  id: p.id,
  name: p.name,
  icon: p.icon,
  description: p.description,
}));

// ─── Commercial Vibes (Easy Video) ───────────────────────────────────────────

interface CommercialVibe {
  id: string;
  name: string;
  buildPrompt: (businessName: string, service: string, cta: string, tagline?: string) => string;
}

export const COMMERCIAL_VIBES: CommercialVibe[] = [
  {
    id: 'tiktok-energy',
    name: 'TikTok Energy',
    buildPrompt: (businessName: string, service: string, cta: string, tagline?: string) => `
Fast-paced vertical video for "${businessName}". Hook the viewer in the first 1-2 seconds with something visually striking.
Quick cuts montage with dynamic camera movement:
1. Close-up of a mechanic's hands working with a sparking wrench
2. Under-the-hood shot with dramatic lighting
3. Happy customer receiving keys with a big smile
4. Car driving away smoothly into the street
Bold text overlays that are large enough to read on a phone screen appear with trendy transitions: "${service}" as the main hook.
${tagline ? `Tagline flashes: "${tagline}"` : ''}
Call-to-action pops up at the end: "${cta}"
Vibrant, saturated colors. Snappy zoom transitions. Modern, youthful energy.
Vertical 9:16 format optimized for mobile viewing.

AUDIO: Upbeat pop beat with bass drops on each cut, wrench clicking rhythmically, engine starting with a satisfying roar.

STYLE: TikTok/Reels optimized vertical format, trendy transitions (zoom cuts, whip pans), bold large text overlays, vibrant color grading, fast pacing, attention-grabbing from first frame.
    `.trim(),
  },
  {
    id: 'professional-trust',
    name: 'Professional Trust',
    buildPrompt: (businessName: string, service: string, cta: string, tagline?: string) => `
Clean, professional commercial for "${businessName}". Hook the viewer in the first 1-2 seconds with something visually striking.
Smooth tracking shot gliding through a pristine service bay with quick cuts and dynamic camera movement.
Uniformed mechanics work methodically with modern diagnostic equipment glowing with data.
A service advisor shakes hands warmly with a customer, both smiling with genuine trust.
Warm, inviting lighting. Shallow depth of field keeping the focus on human connections.
Bold text that is large enough to read on a phone screen appears cleanly: "${service}".
${tagline ? `"${tagline}" fades in elegantly.` : ''}
Closing frame: "${cta}" with the business name.
Vertical 9:16 format optimized for mobile viewing.

AUDIO: Warm ambient background music with gentle piano, professional and confident tone, subtle sound of tools and equipment.

STYLE: Premium commercial quality, warm color temperature, shallow depth of field, steady smooth camera movements, trustworthy and clean aesthetic, corporate but approachable.
    `.trim(),
  },
  {
    id: 'retro-nostalgia',
    name: 'Retro Nostalgia',
    buildPrompt: (businessName: string, service: string, cta: string, tagline?: string) => `
1950s-style retro commercial for "${businessName}". Hook the viewer in the first 1-2 seconds with something visually striking.
Film grain texture, warm sepia tones with occasional color pops. Quick cuts and dynamic camera movement.
A friendly mechanic in vintage coveralls and a cap waves at the camera with a big smile.
Classic cars with chrome bumpers and fins line the service bays. Hand-painted signs on the walls.
A happy family piles into their freshly serviced car and drives away waving.
Vintage-style title card appears with retro typography, bold text large enough to read on a phone screen: "${service}".
${tagline ? `Announcer-style text card: "${tagline}"` : ''}
End card with nostalgic frame: "${cta}" at "${businessName}".
Vertical 9:16 format optimized for mobile viewing.

AUDIO: Catchy 1950s jingle with ukulele and upright bass, classic radio announcer voice style, old-fashioned car horn "ahooga", cheerful whistling.

STYLE: 1950s Americana aesthetic, film grain and slight vignette, warm sepia/vintage color grading, hand-lettered typography, wholesome family-friendly mood, nostalgic charm.
    `.trim(),
  },
  {
    id: 'cinematic-hero',
    name: 'Cinematic Hero',
    buildPrompt: (businessName: string, service: string, cta: string, tagline?: string) => `
Hook the viewer in the first 1-2 seconds with something visually striking.
Epic drone shot slowly approaching "${businessName}" auto shop at golden hour, sun setting behind the building casting dramatic long shadows.
Cut to: Slow-motion shot of a mechanic confidently lowering a car from a hydraulic lift, sparks of light dancing off metal.
Quick cuts and dynamic camera movement. Dramatic shadows and lens flares create a premium, heroic atmosphere.
The mechanic looks up at camera with quiet confidence. Tools gleam on the wall behind them.
Bold text that is large enough to read on a phone screen materializes with cinematic weight: "${service}".
${tagline ? `"${tagline}" appears with a lens flare accent.` : ''}
Final epic wide shot of the shop with "${cta}" overlaid.
Vertical 9:16 format optimized for mobile viewing.

AUDIO: Epic cinematic orchestral score building slowly, deep engine purr, satisfying metallic wrench click echoing, sweeping strings crescendo.

STYLE: Cinematic widescreen, golden hour lighting, dramatic lens flares, slow-motion hero shots, shallow depth of field, premium blockbuster feel, bold confident mood.
    `.trim(),
  },
  {
    id: 'satisfying-asmr',
    name: 'Satisfying ASMR',
    buildPrompt: (businessName: string, service: string, cta: string, tagline?: string) => `
Hook the viewer in the first 1-2 seconds with an extreme close-up of something visually satisfying.
ASMR-style auto repair video for "${businessName}". Macro lens detail shots throughout.
Close-up of mechanic hands working on an engine with satisfying wrench clicks and ratchet sounds.
Engine parts being carefully cleaned and polished until they gleam. Every bolt tightened with a satisfying click.
Quick cuts between different satisfying moments: oil pouring smoothly, a spark plug threading in perfectly, a fresh air filter snapping into place.
Dynamic camera movement orbiting around the work. Bold text large enough to read on a phone screen: "${service}".
${tagline ? `"${tagline}" appears subtly.` : ''}
Final shot: completed engine bay looking pristine, "${cta}" overlaid.
Vertical 9:16 format optimized for mobile viewing.

AUDIO: ASMR-style audio is critical. Crisp ratchet clicking, metallic tool sounds, satisfying snap-fits, engine purring to life at the end. Minimal background music, let the sounds be the star.

STYLE: Macro photography, extreme close-ups, shallow depth of field, clean lighting, satisfying visual textures, oddly satisfying content style, premium detail shots.
    `.trim(),
  },
  {
    id: 'before-after',
    name: 'Before & After',
    buildPrompt: (businessName: string, service: string, cta: string, tagline?: string) => `
Hook the viewer in the first 1-2 seconds with a dramatic "before" shot that demands attention.
Dramatic transformation reveal for "${businessName}". Split-screen or wipe transition showing the transformation.
Left side / first half: dirty, damaged, or worn vehicle — dull paint, grime, visible wear, problem areas highlighted.
Right side / second half: clean, repaired, pristine vehicle — gleaming paint, spotless interior, problem areas fixed and perfect.
Quick cuts and dynamic camera movement building to the satisfying reveal moment.
Bold text large enough to read on a phone screen: "${service}".
${tagline ? `"${tagline}" appears during the reveal.` : ''}
The transformation wipe creates a deeply satisfying visual moment. End with "${cta}".
Vertical 9:16 format optimized for mobile viewing.

AUDIO: Tense, building music during the "before" section, then a satisfying whoosh and triumphant beat drop during the reveal. Crowd "ooh" reaction sound effect on the transformation.

STYLE: High contrast between before (desaturated, gritty) and after (vibrant, clean), dramatic wipe/split-screen transition, satisfying reveal editing, social media viral format.
    `.trim(),
  },
  {
    id: 'day-in-the-life',
    name: 'Day in the Life',
    buildPrompt: (businessName: string, service: string, cta: string, tagline?: string) => `
Hook the viewer in the first 1-2 seconds with an establishing shot of bay doors opening at sunrise.
Day-in-the-life montage for "${businessName}". Quick cuts and dynamic camera movement throughout.
Opening bay doors at sunrise with golden light flooding in. Morning coffee and clipboard, ready for the day.
Cars rolling in one by one. The team working together — wrenching, diagnosing, lifting.
Quick montage of different jobs throughout the day: oil changes, brake work, engine diagnostics.
A satisfied customer shaking hands and driving away with a smile.
Final shot: sunset behind the shop, bay doors closing after a productive day.
Bold text large enough to read on a phone screen: "${service}".
${tagline ? `"${tagline}" appears during the montage.` : ''}
End card: "${cta}" at "${businessName}".
Vertical 9:16 format optimized for mobile viewing.

AUDIO: Upbeat indie/folk music building energy through the day, ambient shop sounds (air tools, engine starts, friendly chatter), satisfying end-of-day quiet.

STYLE: Documentary-style authenticity, warm natural lighting, time-lapse feel, quick montage cuts, relatable behind-the-scenes vibe, golden hour bookends, community and teamwork focus.
    `.trim(),
  },
];
