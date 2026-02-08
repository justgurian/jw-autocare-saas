export interface StaffInfo {
  staffName: string;
  position?: string;
  yearsExperience?: number;
  specialty?: string;
  funFact?: string;
  nickname?: string;
  certifications?: string[];
  businessName?: string;
}

export interface SpotlightFormat {
  id: string;
  name: string;
  description: string;
  icon: string;
  buildPrompt: (staff: StaffInfo) => string;
}

function generateMovieTitle(specialty?: string): string {
  if (!specialty) return 'THE MECHANIC';
  const s = specialty.toLowerCase();
  if (s.includes('transmission')) return 'TRANSMISSION: IMPOSSIBLE';
  if (s.includes('brake')) return 'BRAKE FORCE';
  if (s.includes('diagnostic')) return 'THE DIAGNOSTIC';
  if (s.includes('engine')) return 'ENGINE OF FURY';
  if (s.includes('electric') || s.includes('hybrid')) return 'HIGH VOLTAGE';
  if (s.includes('suspension')) return 'SMOOTH RIDE';
  if (s.includes('exhaust')) return 'FULL THROTTLE';
  if (s.includes('oil')) return 'SLICK OPERATOR';
  if (s.includes('tire') || s.includes('wheel')) return 'ROLLING THUNDER';
  if (s.includes('ac') || s.includes('air') || s.includes('hvac')) return 'COLD CASE';
  return 'THE MECHANIC';
}

function heroName(staff: StaffInfo): string {
  if (staff.nickname) return staff.nickname;
  if (staff.specialty) return `The ${staff.specialty} Master`;
  return 'The Auto Avenger';
}

function veteranOrRising(yearsExperience?: number): string {
  return (yearsExperience && yearsExperience > 5) ? 'VETERAN' : 'RISING STAR';
}

export const SPOTLIGHT_FORMATS: SpotlightFormat[] = [
  {
    id: 'trading-card',
    name: 'Trading Card',
    description: 'A glossy collectible trading card with stats and holographic border',
    icon: '🃏',
    buildPrompt: (staff) =>
      `Create a professional sports trading card design featuring the person in the reference photo. The card should have: A polished portrait of the person in their mechanic/auto repair attire, rendered in the glossy trading card art style. Card layout with name '${staff.staffName}' in bold at the top, position '${staff.position || 'Technician'}' below. Side stats bar showing: YEARS: ${staff.yearsExperience ?? '?'}, SPECIALTY: ${staff.specialty || 'All-Around'}. A holographic shimmer border effect. Background: auto repair shop elements. Card number '#001'. The design should look like an authentic collectible trading card you'd find in a pack. 4:5 aspect ratio.`,
  },
  {
    id: 'superhero',
    name: 'Superhero Card',
    description: 'A dramatic comic book superhero card with powers and action pose',
    icon: '🦸',
    buildPrompt: (staff) =>
      `Create a dramatic comic book superhero card featuring the person in the reference photo transformed into a superhero. Their face and features should be recognizable but rendered in bold comic book art style with halftone dots. They should wear a superhero costume in red and blue with a wrench/gear emblem on the chest. Flowing cape. Power aura glowing around them. Hero name: '${heroName(staff)}' in bold comic font at top. Superpowers listed: '${staff.specialty || 'Master Mechanic'}', 'Customer Satisfaction', '${staff.funFact || 'Unbreakable Focus'}'. Dramatic action pose with tools as weapons. 4:5 aspect ratio.`,
  },
  {
    id: 'action-figure',
    name: 'Action Figure Box',
    description: 'A realistic toy action figure box with accessories listed',
    icon: '🤖',
    buildPrompt: (staff) =>
      `Create a realistic photo of a toy action figure box/packaging featuring the person from the reference photo as the action figure visible through the clear plastic window. The box should look like an authentic toy product. Box header: 'AUTO HERO SERIES' brand. Figure name: '${staff.staffName}' in bold. 'ACCESSORIES INCLUDED:' listing their tools (wrench set, diagnostic scanner, ${staff.specialty || 'repair'} kit). 'WARNING: May cause vehicles to run perfectly.' Age rating: 'AGES: All who need car repairs'. The figure should be posed in mechanic attire. Realistic toy packaging photography style. 4:5 aspect ratio.`,
  },
  {
    id: 'movie-poster',
    name: 'Movie Poster',
    description: 'A cinematic action movie poster with dramatic lighting',
    icon: '🎬',
    buildPrompt: (staff) =>
      `Create a cinematic action movie poster featuring the person from the reference photo as the star. Dramatic lighting, looking heroic. Movie title in large bold text: '${generateMovieTitle(staff.specialty)}'. Tagline: 'One mechanic. One mission. Your car fixed right.' Starring: ${staff.staffName}. Credits block at bottom in tiny movie credits font. Dark cinematic background with sparks and workshop elements. Epic movie poster composition. 4:5 aspect ratio.`,
  },
  {
    id: 'magazine-cover',
    name: 'Magazine Cover',
    description: 'A glossy magazine cover with headlines and professional photo',
    icon: '📰',
    buildPrompt: (staff) =>
      `Create a glossy magazine cover design featuring the person from the reference photo as the cover star, posed professionally. Magazine name: 'AUTO PRO MONTHLY' in elegant serif font at top. Issue: 'SPECIAL EDITION'. Cover headlines: 'Meet ${staff.staffName}: ${staff.position || 'Master Technician'}', 'The Secret Behind ${staff.yearsExperience ?? 'Years'} Years of Excellence', '${staff.specialty || 'Auto Repair'} — How the Pros Do It', 'EXCLUSIVE: ${staff.funFact || 'The Story Behind the Wrench'}'. Professional photography style, studio lighting. Barcode in corner. Price '$4.99'. Clean editorial magazine layout. 4:5 aspect ratio.`,
  },
  {
    id: 'wanted-poster',
    name: 'Wanted Poster',
    description: 'An old West wanted poster with humorous charges',
    icon: '🤠',
    buildPrompt: (staff) =>
      `Create an old West wanted poster featuring the person from the reference photo. Aged, yellowed parchment paper texture with burned/torn edges. 'WANTED' in large old West serif font at top. 'DEAD OR ALIVE' crossed out, replaced with 'EXPERIENCED & RELIABLE'. Photo rendered as an old-timey sepia portrait. Name: '${staff.staffName}' below photo. 'FOR: Exceptional Auto Repair Service & Honest Pricing'. REWARD: 'A Car That Actually Works'. CRIMES: 'Fixed cars honestly', 'Charged fair prices', 'Showed up on time', '${staff.funFact || 'Made customers smile'}'. Old West typography throughout. 4:5 aspect ratio.`,
  },
  {
    id: 'employee-month',
    name: 'Employee of the Month',
    description: 'A glamorous Employee of the Month display with gold frame',
    icon: '🏆',
    buildPrompt: (staff) =>
      `Create a glamorous Employee of the Month display featuring the person from the reference photo. Ornate gold picture frame with decorative flourishes. Dramatic spotlight/stage lighting from above. Gold trophy or medal beside them. Confetti and celebration elements. Plaque text: 'EMPLOYEE OF THE MONTH' in engraved gold lettering. '${staff.staffName}' below. '${staff.position || 'Technician'} — ${staff.yearsExperience ?? '?'} Years'. Quote: '${staff.funFact || 'Dedicated to excellence'}'. Achievement badges: '${staff.specialty || 'Auto Repair'} Expert', 'Customer Favorite'. Warm, celebratory professional photography. 4:5 aspect ratio.`,
  },
  {
    id: 'comic-strip',
    name: 'Comic Strip',
    description: 'A 4-panel comic strip telling a fun repair story',
    icon: '💬',
    buildPrompt: (staff) =>
      `Create a 4-panel comic strip featuring the person from the reference photo rendered as a cartoon character (their face recognizable but in a fun cartoon art style). Panel 1: Customer arrives with a broken car, worried face. Panel 2: ${staff.staffName} examines the car with confidence, speech bubble: 'I know exactly what this is!' Panel 3: Working on the car with dramatic action lines and 'WRENCH!' sound effect. Panel 4: Happy customer and ${staff.staffName} high-fiving, car gleaming, speech bubble: 'Good as new!' Bold outlines, bright colors, newspaper comic strip style. Panels arranged 2x2. 4:5 aspect ratio.`,
  },
  {
    id: 'sports-card',
    name: 'Sports Card',
    description: 'An NFL/NBA style draft card with season stats',
    icon: '🏈',
    buildPrompt: (staff) =>
      `Create an NFL/NBA style draft card design featuring the person from the reference photo. 'DRAFT PICK' header with team logo (wrench/gear icon). Large action-style photo of them in mechanic gear. Team: '${staff.businessName || 'Auto All-Stars'}'. Position: '${staff.position || 'Technician'}'. '${veteranOrRising(staff.yearsExperience)}' tag. Season stats box: 'Cars Fixed: 500+', '5-Star Reviews: 100+', 'Specialty: ${staff.specialty || 'All-Around'}'. Holographic/foil card effect. Stadium floodlight background. Authentic sports card layout. 4:5 aspect ratio.`,
  },
  {
    id: 'album-cover',
    name: 'Album Cover',
    description: 'A music album cover with dramatic styling and track list',
    icon: '🎵',
    buildPrompt: (staff) =>
      `Create a music album cover featuring the person from the reference photo posed dramatically. Album title in stylized text: 'UNDER THE HOOD'. Artist name: '${staff.staffName}' in bold. Genre aesthetic: hip-hop/R&B meets auto shop (dramatic lighting, dark background, chrome and engine parts as props). 'FEATURING: ${staff.specialty || 'Master Repairs'}'. Parental advisory sticker replaced with 'CERTIFIED MECHANIC ADVISORY'. Record label: '${staff.businessName || 'Garage Records'}'. Professional album cover photography and typography. Square aspect ratio but fit in 4:5 with black bars.`,
  },
];

export const SPOTLIGHT_FORMAT_IDS = SPOTLIGHT_FORMATS.map((f) => f.id);
