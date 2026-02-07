import { PhotoScene, ShopAesthetic, ShopProfile, OutputMode } from './shop-photographer.types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PhotographerPromptOptions {
  scene: PhotoScene;
  outputMode: OutputMode;
  aesthetic?: ShopAesthetic;
  shopProfile?: ShopProfile;
  businessName: string;
  textContent?: { headline?: string; subheadline?: string; cta?: string };
  logoDescription?: string;
}

export interface EnhancementPromptOptions {
  outputMode: OutputMode;
  enhancementStyle: 'dramatic' | 'clean' | 'moody' | 'bright' | 'auto';
  businessName: string;
  textContent?: { headline?: string; subheadline?: string; cta?: string };
  logoDescription?: string;
}

export interface VideoAnimationPromptOptions {
  scene: PhotoScene;
  businessName: string;
}

// ─── People Mode Rules ──────────────────────────────────────────────────────

function getPeopleModeDirective(peopleMode: PhotoScene['peopleMode']): string {
  switch (peopleMode) {
    case 'partial':
      return 'PEOPLE RULES: Show only hands, arms, torso. NEVER show full faces. Mechanics wear realistic work gloves and uniforms.';
    case 'silhouette':
      return 'PEOPLE RULES: People appear ONLY as dark silhouettes against bright backlight. No facial features visible.';
    case 'none':
      return 'PEOPLE RULES: No people in this scene.';
  }
}

// ─── Output Mode Directives ─────────────────────────────────────────────────

function getOutputModeDirective(
  outputMode: OutputMode,
  businessName: string,
  textContent?: { headline?: string; subheadline?: string; cta?: string },
): string {
  switch (outputMode) {
    case 'photo-only':
      return 'OUTPUT: Clean photographic output. NO text, NO overlays, NO watermarks.';

    case 'photo-logo':
      return `OUTPUT: The business logo appears PHYSICALLY in the scene — embroidered on a uniform, decal on a tool chest, neon sign on the wall, printed on a shop rag. It must look like it EXISTS in the physical space, NOT digitally pasted. Logo text: ${businessName}.`;

    case 'photo-text': {
      const headline = textContent?.headline || businessName;
      const subheadline = textContent?.subheadline || '';
      const cta = textContent?.cta || 'Call Today!';
      return `OUTPUT: This is a marketing flyer with professional typography. Include: HEADLINE: "${headline}" (large, bold), SUBHEADLINE: "${subheadline}" (medium), CTA: "${cta}" (button/banner). Text must be readable and professionally styled.`;
    }

    case 'video':
      return 'OUTPUT: Generate a clean photograph optimized for video animation. No text overlays. Strong focal point for camera movement.';
  }
}

// ─── Anti-AI Quality Gate ───────────────────────────────────────────────────

const ANTI_AI_QUALITY_GATE = `QUALITY GATE — This must be INDISTINGUISHABLE from a real photograph:
- Natural color grading — no HDR over-processing, no AI glow, no plastic skin
- Lens characteristics: natural bokeh from the specified f-stop, slight vignetting at corners, authentic depth of field
- Noise pattern: subtle fine-grain consistent with high-ISO capture
- Light behavior: physically accurate reflections, shadows with proper falloff, specular highlights on metal surfaces
- NEVER: symmetrical compositions, floating objects, inconsistent shadows, smooth plastic-looking surfaces, stock photo aesthetic`;

// ─── Main Prompt Builders ───────────────────────────────────────────────────

export function buildPhotographerPrompt(options: PhotographerPromptOptions): string {
  const {
    scene,
    outputMode,
    aesthetic,
    shopProfile,
    businessName,
    textContent,
  } = options;

  const sections: string[] = [];

  // Layer 1: Photographer Identity
  sections.push(
    `PHOTOGRAPHER IDENTITY: You are a 20-year veteran automotive industry photographer. Your work has appeared in Motor Trend, Car and Driver, and top industry publications. You shoot with a Phase One IQ4 150MP digital back and Schneider-Kreuznach optics. Every image you create is indistinguishable from a real photograph.`
  );

  // Layer 2: Scene Description
  sections.push(
    `SCENE: ${scene.prompt}\nCAMERA: ${scene.suggestedCamera}\nLIGHTING: ${scene.suggestedLighting}`
  );

  // Layer 3: Environment (shopProfile takes priority over aesthetic)
  if (shopProfile) {
    sections.push(
      `ENVIRONMENT (from real shop analysis):\n` +
      `Shop Style: ${shopProfile.shopStyle}\n` +
      `Description: ${shopProfile.description}\n` +
      `Dominant Colors: ${shopProfile.dominantColors.join(', ')}\n` +
      `Materials: ${shopProfile.materials.join(', ')}\n` +
      `Lighting Character: ${shopProfile.lightingCharacter}\n` +
      `Equipment Visible: ${shopProfile.equipmentVisible.join(', ')}\n` +
      `Unique Features: ${shopProfile.uniqueFeatures.join(', ')}`
    );
  } else if (aesthetic) {
    sections.push(
      `ENVIRONMENT (${aesthetic.name}):\n` +
      `${aesthetic.environmentPrompt}\n` +
      `Lighting: ${aesthetic.lightingPrompt}\n` +
      `Color Palette: ${aesthetic.colorPalette.join(', ')}\n` +
      `Materials & Textures: ${aesthetic.materialTextures.join(', ')}`
    );
  }

  // Layer 4: Output Mode
  sections.push(getOutputModeDirective(outputMode, businessName, textContent));

  // People Mode
  sections.push(getPeopleModeDirective(scene.peopleMode));

  // Layer 5: Anti-AI Quality Gate
  sections.push(ANTI_AI_QUALITY_GATE);

  return sections.join('\n\n');
}

export function buildEnhancementPrompt(options: EnhancementPromptOptions): string {
  const {
    outputMode,
    enhancementStyle,
    businessName,
    textContent,
  } = options;

  const sections: string[] = [];

  // Base enhancement instruction
  sections.push(
    `PHOTO ENHANCEMENT: Transform this real shop photo into a professional-grade marketing image.\n` +
    `- Fix white balance, exposure, and lighting as if professional strobes were used during the shoot\n` +
    `- Remove visual clutter, polish surfaces that should be clean\n` +
    `- Add subtle atmosphere (haze for depth, warm highlights on chrome)\n` +
    `- PRESERVE: actual shop layout, real signage, real branding — do not invent new elements`
  );

  // Enhancement style modifier
  const styleModifiers: Record<string, string> = {
    dramatic: 'STYLE: Dramatic — deep shadows, strong contrast, cinematic color grading. Think Michael Bay automotive shots with rich blacks and saturated highlights.',
    clean: 'STYLE: Clean — bright, even, architectural photography style. Think Architectural Digest with balanced exposure and neutral color temperature.',
    moody: 'STYLE: Moody — low key, rich shadows, editorial magazine feel. Think Esquire with selective lighting and deep atmosphere.',
    bright: 'STYLE: Bright — high key, welcoming, bright and airy. Think social media lifestyle photography with lifted shadows and warm tones.',
    auto: 'STYLE: Auto — analyze the photo\'s existing character and enhance it in the most flattering direction. Preserve the natural mood while elevating quality.',
  };

  sections.push(styleModifiers[enhancementStyle] || styleModifiers.auto);

  // Output mode directive
  sections.push(getOutputModeDirective(outputMode, businessName, textContent));

  return sections.join('\n\n');
}

export function buildVideoAnimationPrompt(options: VideoAnimationPromptOptions): string {
  const { scene, businessName } = options;

  // Scene-specific motion descriptions
  const motionByCategory: Record<string, string> = {
    'action-shots': 'Subtle vibration and tool motion continues from the still frame. Sparks or fluid movement adds life.',
    'shop-atmosphere': 'Slow dolly forward exploring the space. Overhead lights flicker subtly. Atmospheric dust particles drift through light beams.',
    'detail-closeups': 'Gentle orbital camera movement around the subject. Light catches different angles of the surface. Rack focus reveals depth.',
    'team-culture': 'Slight parallax movement reveals depth between foreground figures and background environment.',
    'customer-moments': 'Slow push-in toward the key interaction point. Warm light intensifies slightly.',
  };

  const motion = motionByCategory[scene.category] || 'Subtle camera push-in with parallax depth.';

  return `Subtle camera push-in with parallax depth. ${motion} Ambient shop sounds — air compressor hum, distant tool clatter, radio in background. Professional automotive advertisement quality for ${businessName}.`;
}
