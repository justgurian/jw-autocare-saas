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

export interface MascotCustomization {
  shirtName: string;
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
