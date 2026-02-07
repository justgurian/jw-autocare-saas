/**
 * Car of the Day Types
 * Type definitions for the multi-asset car showcase feature
 */

export type AssetType = 'official' | 'comic' | 'action-figure' | 'movie-poster';

export interface CarOfDayInput {
  // Car image (required)
  carImage: {
    base64: string;
    mimeType: string;
  };
  // Optional person image (owner)
  personImage?: {
    base64: string;
    mimeType: string;
  };
  // Car details
  carYear?: string;
  carMake?: string;
  carModel?: string;
  carColor?: string;
  carNickname?: string;
  // Owner details
  ownerName?: string;
  ownerHandle?: string; // Social media handle
  // Generation options
  assetTypes?: AssetType[]; // Defaults to all 4
  // Logos for branding
  logos?: Array<{
    base64: string;
    mimeType: string;
  }>;
  // Optional mascot data
  mascotImage?: {
    base64: string;
    mimeType: string;
  };
  mascotCharacterPrompt?: string;
}

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  imageUrl: string;
  caption: string;
  thumbnailUrl?: string;
}

export interface CarOfDayResult {
  carName: string;
  assets: GeneratedAsset[];
  totalGenerated: number;
}

export const ASSET_TYPE_INFO: Record<AssetType, {
  name: string;
  description: string;
  emoji: string;
}> = {
  'official': {
    name: 'Official',
    description: 'Clean professional Car of the Day graphic',
    emoji: 'star',
  },
  'comic': {
    name: 'Comic Book',
    description: 'Vintage comic book cover style',
    emoji: 'burst',
  },
  'action-figure': {
    name: 'Action Figure',
    description: 'Toy collectible packaging style',
    emoji: 'toy',
  },
  'movie-poster': {
    name: 'Movie Poster',
    description: 'Hollywood blockbuster poster style',
    emoji: 'film',
  },
};

/**
 * Build prompt for Official Car of the Day asset
 */
export function buildOfficialPrompt(options: {
  carName: string;
  carColor?: string;
  ownerTag?: string;
  businessName: string;
  hasOwnerPhoto: boolean;
}): string {
  const { carName, carColor, ownerTag, businessName, hasOwnerPhoto } = options;

  return `Create a pristine "CAR OF THE DAY" social media graphic.

LAYOUT & COMPOSITION:
- Professional, clean design with high-end auto dealership quality
- Background: Blurred auto shop service bay with professional lighting
- Foreground: The provided car image placed prominently in the center
- Clean, modern aesthetic with premium feel

TEXT ELEMENTS:
- "CAR OF THE DAY" in bold gold/metallic letters at the top
- Subtext: "${carName}"
${ownerTag ? `- Owner tag: "${ownerTag}"` : ''}
- ${businessName} logo/branding in the corner

STYLING:
- ${carColor ? `Accent colors that complement the ${carColor} car` : 'Premium gold and black color scheme'}
- Subtle lens flares or light effects for premium feel
- Clean typography, easy to read
${hasOwnerPhoto ? '- If owner photo provided, show them standing proudly next to the car' : ''}

REQUIREMENTS:
- 4:5 aspect ratio (portrait, social media optimized)
- Professional marketing quality
- Eye-catching but not cluttered
- Suitable for Instagram/Facebook feed

DO NOT INCLUDE:
- Realistic human faces unless photo provided
- Copyrighted characters or logos
- Contact information or phone numbers`;
}

/**
 * Build prompt for Comic Book style asset
 */
export function buildComicPrompt(options: {
  carName: string;
  carNickname?: string;
  businessName: string;
}): string {
  const { carName, carNickname, businessName } = options;
  const title = carNickname || carName;

  return `Create a VINTAGE COMIC BOOK COVER featuring a car as the hero.

COMIC BOOK STYLE:
- Classic 1950s-1960s comic book cover aesthetic
- Bold halftone dots pattern (Ben-Day dots)
- Action lines radiating from the car
- Dramatic CMYK color separation look
- Vintage paper texture

LAYOUT:
- Title banner at top: "THE ADVENTURES OF ${title.toUpperCase()}"
- Dynamic action pose - car in dramatic angle
- Action burst effects (POW! ZOOM! VROOM!)
- Classic comic book border/frame
- Issue number in corner (e.g., "#1 COLLECTOR'S EDITION")

TEXT ELEMENTS:
- Main title in bold 3D comic font
- Subtitle: "FEATURING ${businessName.toUpperCase()}!"
- Price tag in corner (10¢ for vintage feel)
- "APPROVED BY THE MECHANICS GUILD" seal

COLOR SCHEME:
- Primary: Cyan, Magenta, Yellow, Black (classic print)
- Bold, saturated colors
- Newsprint/vintage paper look

MOOD:
- Exciting, adventurous, heroic
- The car is the STAR of the story
- Nostalgic comic book collector feel

Aspect ratio: 4:5 (comic book cover proportions)`;
}

/**
 * Build prompt for Action Figure packaging asset
 */
export function buildActionFigurePrompt(options: {
  carName: string;
  carNickname?: string;
  ownerName?: string;
  businessName: string;
  hasOwnerPhoto: boolean;
}): string {
  const { carName, carNickname, ownerName, businessName, hasOwnerPhoto } = options;
  const figureName = carNickname || carName;

  const ownerInstructions = hasOwnerPhoto
    ? `*** CRITICAL: USE THE UPLOADED PHOTO ***
The uploaded photo shows the car owner. You MUST:
- Use their ACTUAL face and likeness from the photo
- Transform them into a stylized action figure that LOOKS LIKE THEM
- Keep their hair color, face shape, and distinctive features recognizable
- They should clearly see it's them in the final image

FIGURE/CONTENTS (in the bubble):
- ${ownerName || 'The Owner'} as an action figure - MUST LOOK LIKE the person in the photo
- The car as a die-cast model next to them`
    : `FIGURE/CONTENTS (in the bubble):
- Miniature mechanic figure accessory
- The car as the main "collectible" - styled as a die-cast model`;

  return `Create an ACTION FIGURE TOY PACKAGING design featuring a car as the collectible.

${ownerInstructions}

PACKAGING STYLE:
- 1980s-1990s action figure toy packaging aesthetic
- Clear plastic bubble window area (where the "figure" would be)
- Bold, colorful cardboard backing
- Retail-ready toy store appearance

KEY VISUAL ELEMENTS:
1. "LIMITED EDITION" badge in gold/metallic in top corner
2. "COLLECT THEM ALL!" text
3. "CAR OF THE DAY SERIES" branding
4. Barcode area at bottom (stylized)
5. ${businessName} as the "toy company" logo
6. Age rating badge ("AGES 16+ COLLECTOR")

OTHER ACCESSORIES:
- Tiny wrench/tool accessories
- Display stand with logo

TEXT ON PACKAGING:
- Product name: "${figureName.toUpperCase()}"
- Series: "${businessName} LEGENDS"
- Features list: "REAL ROLLING WHEELS! OPENING HOOD!"

COLOR SCHEME:
- Bold primary colors (red, yellow, blue)
- Metallic accents for LIMITED EDITION badge
- High contrast for retail visibility

Aspect ratio: 4:5 (toy packaging proportions)`;
}

/**
 * Build prompt for Movie Poster asset
 */
export function buildMoviePosterPrompt(options: {
  carName: string;
  carNickname?: string;
  ownerName?: string;
  businessName: string;
  location?: string;
  hasOwnerPhoto?: boolean;
}): string {
  const { carName, carNickname, ownerName, businessName, location, hasOwnerPhoto } = options;
  const movieTitle = carNickname || carName.split(' ').pop() || 'THE MACHINE';

  const starInstructions = hasOwnerPhoto
    ? `*** CRITICAL: USE THE UPLOADED PHOTO ***
The uploaded photo shows the car owner. You MUST:
- Use their ACTUAL face and likeness from the photo as THE STAR
- Show them in a heroic movie star pose next to or with the car
- Keep their hair color, face shape, and distinctive features recognizable
- They should clearly see it's them as the action hero

THE STAR:
- ${ownerName || 'The Owner'} is the LEADING ACTOR - use their likeness from the photo
- Show them in heroic action movie pose
- The car is their HERO VEHICLE`
    : `THE STAR:
- The car is the HERO VEHICLE in a dramatic chase/action scene`;

  return `Create a HOLLYWOOD BLOCKBUSTER MOVIE POSTER featuring a car as the star.

${starInstructions}

CINEMATIC STYLE:
- High-budget action movie poster aesthetic
- Orange and Teal cinematic color grading
- Dramatic lighting with lens flares
- Debris, sparks, or motion blur effects
- Epic scale and composition

LAYOUT:
- Movie title: "${movieTitle.toUpperCase()}" in large 3D metallic font
- Tagline at top: "THIS SUMMER..."
- Cinematic widescreen feel even in portrait format
- Credits block at bottom (styled film credits)
${hasOwnerPhoto ? `- STARRING: ${(ownerName || 'THE OWNER').toUpperCase()}` : ''}

TEXT ELEMENTS:
- Main title in chrome/metallic 3D font
- Tagline: "COMING SOON TO ${(location || 'SCOTTSDALE').toUpperCase()}"
- Credits: "DIRECTED BY ${businessName.toUpperCase()}"
- "BASED ON A TRUE RIDE"
- Rating badge: "RATED A FOR AWESOME"

VISUAL EFFECTS:
- Dramatic sky (sunset, storm clouds, or city lights)
- Reflection on wet pavement
- Speed lines or motion blur
- Cinematic lens flares
- Explosive or dramatic background elements

MOOD:
- Epic, thrilling, blockbuster
- Makes you want to see this "movie"

Aspect ratio: 2:3 (movie poster proportions) or 4:5 (social optimized)`;
}
