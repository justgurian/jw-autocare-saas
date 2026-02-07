/**
 * Mascot Builder Options
 * All push-button options for building a custom Muppet-style mechanic mascot.
 */

export const MASCOT_OPTIONS = {
  furColors: [
    { id: 'orange', name: 'Orange', hex: '#FF8C00' },
    { id: 'blue', name: 'Blue', hex: '#4169E1' },
    { id: 'green', name: 'Green', hex: '#32CD32' },
    { id: 'red', name: 'Red', hex: '#DC143C' },
    { id: 'purple', name: 'Purple', hex: '#9370DB' },
    { id: 'tan', name: 'Tan', hex: '#D2B48C' },
    { id: 'brown', name: 'Brown', hex: '#8B4513' },
    { id: 'pink', name: 'Pink', hex: '#FF69B4' },
  ],
  eyeStyles: [
    {
      id: 'googly',
      name: 'Googly Eyes',
      description:
        'Large round googly eyes with white sclera and black pupils, slightly uneven',
    },
    {
      id: 'button',
      name: 'Button Eyes',
      description: 'Two sewn-on black button eyes',
    },
    {
      id: 'wide',
      name: 'Wide Eyes',
      description:
        'Oversized round cartoon eyes with bright white sclera',
    },
    {
      id: 'sleepy',
      name: 'Sleepy Eyes',
      description:
        'Half-closed droopy eyelids with a relaxed expression',
    },
  ],
  hairstyles: [
    { id: 'short-black', name: 'Short Black', description: 'Short cropped black hair' },
    { id: 'spiky', name: 'Spiky', description: 'Spiky punk-style hair sticking up' },
    { id: 'curly', name: 'Curly', description: 'Wild curly hair' },
    { id: 'mohawk', name: 'Mohawk', description: 'Bold colorful mohawk' },
    { id: 'bald', name: 'Bald', description: 'No hair, smooth round head' },
    { id: 'long', name: 'Long', description: 'Long flowing hair past shoulders' },
    { id: 'ponytail', name: 'Ponytail', description: 'Hair pulled back in a neat ponytail' },
    { id: 'bob', name: 'Bob', description: 'Short bob cut at chin length' },
  ],
  outfitColors: [
    { id: 'navy', name: 'Navy Blue', hex: '#1B3A5C' },
    { id: 'red', name: 'Racing Red', hex: '#CC0000' },
    { id: 'grey', name: 'Charcoal', hex: '#444444' },
    { id: 'green', name: 'Forest Green', hex: '#228B22' },
    { id: 'black', name: 'Black', hex: '#111111' },
  ],
  accessories: [
    { id: 'none', name: 'None', description: '' },
    { id: 'cap', name: 'Baseball Cap', description: 'Wearing a baseball cap on the head' },
    { id: 'bandana', name: 'Bandana', description: 'Wearing a colorful bandana on the head' },
    {
      id: 'safety-goggles',
      name: 'Safety Goggles',
      description: 'Wearing clear safety goggles pushed up on the forehead',
    },
    {
      id: 'tool-belt',
      name: 'Tool Belt',
      description:
        'Wearing a leather tool belt around the waist with wrenches and screwdrivers',
    },
    { id: 'wrench', name: 'Wrench', description: 'Holding a large shiny wrench in one hand' },
    { id: 'clipboard', name: 'Clipboard', description: 'Holding a clipboard with a checklist' },
    { id: 'coffee-mug', name: 'Coffee Mug', description: 'Holding a steaming coffee mug' },
    { id: 'keys', name: 'Car Keys', description: 'Dangling a set of car keys from one hand' },
  ],
  outfitTypes: [
    { id: 'jumpsuit', name: 'Mechanic Jumpsuit', description: "a miniature mechanic's jumpsuit" },
    { id: 'polo', name: 'Polo Shirt', description: 'a neat polo shirt tucked into work pants' },
    { id: 'hoodie', name: 'Hoodie', description: 'a comfortable zip-up hoodie' },
    { id: 'hawaiian', name: 'Hawaiian Shirt', description: 'a loud Hawaiian shirt with tropical print' },
    { id: 'lab-coat', name: 'Lab Coat', description: 'a white lab coat like an automotive scientist' },
    { id: 'vest', name: 'Work Vest', description: 'a high-visibility safety vest over a t-shirt' },
    { id: 'apron', name: 'Shop Apron', description: 'a heavy canvas shop apron with pockets' },
  ],
  seasonalAccessories: [
    { id: 'none', name: 'None', description: '' },
    { id: 'santa-hat', name: 'Santa Hat', description: 'Wearing a red Santa hat with white trim' },
    { id: 'sunglasses', name: 'Sunglasses', description: 'Wearing cool aviator sunglasses' },
    { id: 'rain-gear', name: 'Rain Gear', description: 'Wearing a yellow rain slicker and rain hat' },
    { id: 'bunny-ears', name: 'Bunny Ears', description: 'Wearing a springtime bunny ears headband' },
    { id: 'flag-cape', name: 'July 4th Cape', description: 'Draped in a small American flag cape' },
    { id: 'fall-scarf', name: 'Fall Scarf', description: 'Wearing a cozy autumn-colored knit scarf' },
  ],
};

export interface MascotStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
  promptBase: string;
  bodyColorLabel: string;
}

export const MASCOT_STYLES: MascotStyle[] = [
  {
    id: 'muppet',
    name: 'Muppet Puppet',
    description: 'Jim Henson-style felt & fur puppet',
    icon: '🧸',
    promptBase: 'A handmade Muppet-style puppet mechanic character. {bodyColor} shaggy faux-fur covering entire body. {eyes}. {hair}. Wide hinged felt mouth with a friendly grin. A small round felt nose. Three fuzzy fingers on each hand. Practical puppet photography, studio lighting, Jim Henson workshop aesthetic.',
    bodyColorLabel: 'Fur Color',
  },
  {
    id: 'sports',
    name: 'Sports Mascot',
    description: 'Athletic team mascot in mechanic gear',
    icon: '🏈',
    promptBase: 'A professional sports team mascot character dressed as an auto mechanic. Oversized plush head, foam body suit. {bodyColor} colored fur/fabric. {eyes}. {hair}. Big friendly smile with exaggerated features. Thick padded gloves. Athletic build, energetic pose. Professional sports photography, arena lighting.',
    bodyColorLabel: 'Mascot Color',
  },
  {
    id: 'cartoon',
    name: 'Cartoon Character',
    description: '2D-style animated character, bold outlines',
    icon: '🎨',
    promptBase: 'A 2D cartoon-style auto mechanic character illustration. Bold black outlines, flat vibrant colors. {bodyColor} colored skin/body. {eyes}. {hair}. Exaggerated proportions, big head, small body. Cheerful expression, dynamic pose. Clean vector art style, white background. Saturday morning cartoon aesthetic.',
    bodyColorLabel: 'Character Color',
  },
  {
    id: 'retro',
    name: 'Retro Mascot',
    description: '1950s gas station attendant character',
    icon: '⛽',
    promptBase: 'A 1950s/1960s vintage gas station attendant mascot character. Retro illustration style with halftone dots and warm colors. {bodyColor} colored uniform. {eyes}. {hair}. Friendly wink, thumbs up pose. Vintage advertising art style, aged paper texture. Mid-century modern design aesthetic.',
    bodyColorLabel: 'Uniform Color',
  },
  {
    id: 'anime',
    name: 'Anime / Chibi',
    description: 'Cute Japanese chibi style, big eyes',
    icon: '✨',
    promptBase: 'A cute chibi/anime-style auto mechanic character. {bodyColor} colored hair highlights. {eyes} with large sparkly anime eyes. {hair}. Small round body, oversized head. Kawaii expression, blushing cheeks. Clean anime illustration style, soft pastel accents. Japanese character design aesthetic.',
    bodyColorLabel: 'Accent Color',
  },
  {
    id: 'realistic',
    name: 'Realistic CGI',
    description: 'Photorealistic 3D-rendered character',
    icon: '🤖',
    promptBase: 'A photorealistic 3D-rendered auto mechanic character. Pixar/Disney quality CGI rendering. {bodyColor} colored clothing accents. {eyes}. {hair}. Warm friendly expression, natural pose. Subsurface skin scattering, detailed textures. Studio portrait lighting, shallow depth of field.',
    bodyColorLabel: 'Accent Color',
  },
  {
    id: 'robot',
    name: 'Mascot Bot',
    description: 'Friendly robot mechanic, chrome & color',
    icon: '🦾',
    promptBase: 'A friendly robot auto mechanic character. Smooth chrome and {bodyColor} colored metal plating. {eyes} with glowing LED screen eyes. Antenna or sensor array on head. Articulated joints, tool-arm attachments. Cheerful digital smile on face screen. Clean product photography, studio lighting, white background.',
    bodyColorLabel: 'Metal Color',
  },
];

export interface MascotCustomization {
  shirtName: string;
  mascotName?: string;
  mascotStyle?: string;
  furColor: string;
  eyeStyle: string;
  hairstyle: string;
  outfitColor: string;
  accessory?: string;
  outfitType?: string;
  seasonalAccessory?: string;
  personality?: {
    presetId: string;
    catchphrase?: string;
    energyLevel?: 'low' | 'medium' | 'high' | 'maximum';
  };
}

export interface MascotResult {
  id: string;
  imageUrl: string;
  characterPrompt: string;
}

export interface PersonalityPreset {
  id: string;
  name: string;
  description: string;
  energyLevel: 'low' | 'medium' | 'high' | 'maximum';
  speakingStyle: string;
  defaultCatchphrase: string;
  icon: string;
}

export const PERSONALITY_PRESETS: PersonalityPreset[] = [
  {
    id: 'hype-man',
    name: 'The Hype Man',
    description: 'Over-the-top excited about every service',
    energyLevel: 'maximum',
    speakingStyle: 'Fast-talking, uses superlatives, lots of exclamation points',
    defaultCatchphrase: "LET'S GOOOOO! Your car is gonna LOVE this!",
    icon: '🔥',
  },
  {
    id: 'trusted-expert',
    name: 'The Trusted Expert',
    description: 'Calm, knowledgeable, explains things clearly',
    energyLevel: 'medium',
    speakingStyle: 'Measured, confident, uses technical terms but explains them simply',
    defaultCatchphrase: "Here's the deal — we'll take great care of your ride.",
    icon: '🔧',
  },
  {
    id: 'funny-friend',
    name: 'The Funny Friend',
    description: 'Makes everything a joke, self-deprecating humor',
    energyLevel: 'high',
    speakingStyle: 'Jokes, puns, playful sarcasm, breaks the fourth wall',
    defaultCatchphrase: "Your car called... it says it misses us!",
    icon: '😂',
  },
  {
    id: 'neighborhood-buddy',
    name: 'The Neighborhood Buddy',
    description: 'Your neighbor who happens to be an amazing mechanic',
    energyLevel: 'low',
    speakingStyle: 'Conversational, warm, uses "we" and "our community"',
    defaultCatchphrase: "We treat every car like it belongs to family.",
    icon: '🏘️',
  },
  {
    id: 'drill-sergeant',
    name: 'The Drill Sergeant',
    description: 'Barks orders at engines, inspects with military precision',
    energyLevel: 'high',
    speakingStyle: 'Short commands, intense, dramatic pauses, military metaphors',
    defaultCatchphrase: "DROP AND GIVE ME AN OIL CHANGE, SOLDIER!",
    icon: '🫡',
  },
];
