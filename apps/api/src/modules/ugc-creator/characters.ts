/**
 * UGC Creator — Built-in Character Definitions
 * Exact descriptions from docs/video-creator-kb.md Section 2
 */

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  isBuiltIn: boolean;
  /** If set, this character can only be used with scenes in this category */
  restrictToCategory?: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'classic-tony',
    name: 'Tony Automotive',
    description:
      "A muppet-style puppet with a tan fleece face, short black hair, thick black eyebrows, and a wide friendly mouth. He is wearing a dark blue mechanic's jumpsuit with a nametag that says 'Tony'.",
    personality: 'Friendly, enthusiastic, slightly chaotic shop mascot.',
    isBuiltIn: true,
  },
  {
    id: 'karen-puppet',
    name: 'Karen The Puppet',
    description:
      "A muppet-style puppet with a wild, spiky, exaggerated 'Can I speak to the manager' blonde bob hairstyle with chunky highlights. She has a permanent scowl. She is wearing a dark blue mechanic's jumpsuit with a name patch that says 'Karen'.",
    personality: 'Demanding, skeptical, always asking for the manager.',
    isBuiltIn: true,
  },
  {
    id: 'human-male',
    name: 'Male Mechanic',
    description:
      'A friendly photorealistic human male mechanic in his 30s. He is wearing a clean, professional dark blue mechanic\'s jumpsuit / uniform. He has a trustworthy smile and looks like a reliable technician.',
    personality: 'Professional, trustworthy, reliable.',
    isBuiltIn: true,
  },
  {
    id: 'human-female',
    name: 'Female Mechanic',
    description:
      'A professional photorealistic human female mechanic in her 20s. She is wearing a dark blue mechanic\'s jumpsuit / uniform. She has her hair tied back practically and looks skilled and confident.',
    personality: 'Skilled, confident, professional.',
    isBuiltIn: true,
  },
  {
    id: 'puppet-hands',
    name: 'Fuzzy Puppet Hands',
    description: 'Fuzzy puppet hands',
    personality: 'Used for ASMR scenes only.',
    isBuiltIn: true,
    restrictToCategory: 'asmr',
  },
];

export function getCharacterById(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}
