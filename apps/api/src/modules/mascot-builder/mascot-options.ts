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
  ],
};

export interface MascotCustomization {
  shirtName: string;
  furColor: string;
  eyeStyle: string;
  hairstyle: string;
  outfitColor: string;
  accessory?: string;
}

export interface MascotResult {
  id: string;
  imageUrl: string;
  characterPrompt: string;
}
