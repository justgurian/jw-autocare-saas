/**
 * UGC Creator — Prompt Construction
 * Implements the formula from docs/video-creator-kb.md Section 5
 *
 * Formula:
 *   [Actor Description] + performing + [Scene Label] + in an auto shop.
 *   + [Scene Prompt]
 *   + Background car: [Car Year] [Car Make] [Car Model] [Car Color].
 *   + Cinematic lighting, photorealistic.
 *
 * Special handling:
 *   - ASMR: Actor is replaced with "Fuzzy puppet hands"
 *   - Commercial: Adds dialogue injection with business name and script
 */

import { Character } from './characters';
import { Scene } from './scenes';

export interface CarDetails {
  year?: string;
  make?: string;
  model?: string;
  color?: string;
}

export interface PromptBuildOptions {
  character: Character;
  scene: Scene;
  car?: CarDetails;
  businessName?: string;
  commercialScript?: string;
}

export function buildUgcPrompt(options: PromptBuildOptions): string {
  const { character, scene, car, businessName, commercialScript } = options;

  // Determine actor description
  const isAsmr = scene.category === 'asmr' || scene.forceActor === 'puppet-hands';
  const actorDescription = isAsmr ? 'Fuzzy puppet hands' : character.description;

  // Base prompt assembly
  const parts: string[] = [];

  // [Actor] performing [Scene Label] in an auto shop.
  parts.push(`${actorDescription} performing "${scene.name}" in an auto shop.`);

  // [Scene Prompt]
  parts.push(scene.prompt);

  // Commercial / TV Spot dialogue injection
  if (scene.category === 'commercial' && commercialScript) {
    const shopName = businessName || 'JW AUTO CARE';
    parts.push(
      `POV close-up of the character speaking excitedly and fast directly into the camera lens. They are acting out a sales pitch for '${shopName}'. Background is a busy auto shop with a neon sign that says '${shopName}'. Cinematic lighting.`
    );
    parts.push(
      `The character is excitedly speaking the following lines to the camera: '${commercialScript}'. Ensure the mouth moves to match a fast-paced sales pitch.`
    );
  }

  // Background car
  if (car && (car.year || car.make || car.model || car.color)) {
    const carParts = [car.year, car.make, car.model, car.color].filter(Boolean);
    parts.push(`Background car: ${carParts.join(' ')}.`);
  }

  // Closing quality tags
  parts.push('Cinematic lighting, photorealistic.');

  return parts.join('\n');
}
