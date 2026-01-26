/**
 * Era-Appropriate Vehicles
 * Classic vehicles organized by decade for nostalgic theme generation
 */

export interface EraVehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: string;
  description: string;
  imagePromptHint: string;  // Hint for how to render this vehicle
}

export interface EraVehicles {
  era: '1950s' | '1960s' | '1970s' | '1980s';
  vehicles: EraVehicle[];
}

// 1950s Vehicles - Fins, Chrome, and American Dreams
export const VEHICLES_1950s: EraVehicle[] = [
  {
    id: 'chevy-57',
    name: "1957 Chevy Bel Air",
    make: 'Chevrolet',
    model: 'Bel Air',
    year: '1957',
    description: 'The iconic tri-five Chevy with its distinctive styling and chrome trim',
    imagePromptHint: 'Chrome fins, two-tone paint, wide whitewall tires, rocket-like hood ornament',
  },
  {
    id: 'tbird-55',
    name: "1955 Ford Thunderbird",
    make: 'Ford',
    model: 'Thunderbird',
    year: '1955',
    description: 'The original personal luxury car with porthole hardtop',
    imagePromptHint: 'Two-seater convertible or hardtop with porthole windows, elegant curves, chrome bumpers',
  },
  {
    id: 'cadillac-59',
    name: "1959 Cadillac Eldorado",
    make: 'Cadillac',
    model: 'Eldorado',
    year: '1959',
    description: 'Peak fin era Cadillac with the tallest tail fins ever produced',
    imagePromptHint: 'Massive tail fins, dual bullet taillights, extreme chrome, ultimate 50s luxury',
  },
  {
    id: 'corvette-58',
    name: "1958 Chevrolet Corvette",
    make: 'Chevrolet',
    model: 'Corvette',
    year: '1958',
    description: 'First year of quad headlights and chrome trunk spears',
    imagePromptHint: 'Dual headlights per side, chrome spears on trunk, cove side panels, white coves optional',
  },
  {
    id: 'mercury-49',
    name: "1949 Mercury (Lead Sled)",
    make: 'Mercury',
    model: 'Eight',
    year: '1949',
    description: 'The quintessential custom car canvas, famous from Rebel Without a Cause',
    imagePromptHint: 'Chopped top, frenched headlights, shaved chrome, lowered stance, lead sled custom potential',
  },
];

// 1960s Vehicles - Muscle Cars and Pony Cars
export const VEHICLES_1960s: EraVehicle[] = [
  {
    id: 'mustang-67',
    name: "1967 Ford Mustang",
    make: 'Ford',
    model: 'Mustang',
    year: '1967',
    description: 'The fastback that defined the pony car era',
    imagePromptHint: 'Fastback roofline, side scoops, tri-bar taillights, galloping horse emblem',
  },
  {
    id: 'camaro-69',
    name: "1969 Chevrolet Camaro",
    make: 'Chevrolet',
    model: 'Camaro',
    year: '1969',
    description: 'The most aggressive first-gen Camaro with speed lines',
    imagePromptHint: 'Speed lines down sides, split front bumper, cowl induction hood possible, aggressive stance',
  },
  {
    id: 'charger-68',
    name: "1968 Dodge Charger",
    make: 'Dodge',
    model: 'Charger',
    year: '1968',
    description: 'The coke bottle Charger made famous by Bullitt',
    imagePromptHint: 'Hidden headlights, flying buttress rear window, full-width taillights, muscular haunches',
  },
  {
    id: 'corvette-63',
    name: "1963 Corvette Stingray",
    make: 'Chevrolet',
    model: 'Corvette Stingray',
    year: '1963',
    description: 'The split-window coupe, most collectible Corvette',
    imagePromptHint: 'Split rear window (63 only), pointed nose, hidden headlights, dramatic curves',
  },
  {
    id: 'gto-65',
    name: "1965 Pontiac GTO",
    make: 'Pontiac',
    model: 'GTO',
    year: '1965',
    description: 'The original muscle car that started it all',
    imagePromptHint: 'Stacked headlights, hood scoops, GTO badges, aggressive Pontiac split grille',
  },
];

// 1970s Vehicles - Muscle Car Twilight and New Directions
export const VEHICLES_1970s: EraVehicle[] = [
  {
    id: 'cuda-70',
    name: "1970 Plymouth Barracuda",
    make: 'Plymouth',
    model: 'Barracuda',
    year: '1970',
    description: 'The E-body Cuda with Shaker hood and aggressive stance',
    imagePromptHint: 'Shaker hood scoop, quad headlights, hockey stick stripes, wide aggressive body',
  },
  {
    id: 'challenger-71',
    name: "1971 Dodge Challenger",
    make: 'Dodge',
    model: 'Challenger',
    year: '1971',
    description: "The Vanishing Point car, ultimate road warrior",
    imagePromptHint: 'Long hood, short deck, pistol grip shifter implied, R/T stripes, menacing front end',
  },
  {
    id: 'trans-am-77',
    name: "1977 Pontiac Trans Am",
    make: 'Pontiac',
    model: 'Firebird Trans Am',
    year: '1977',
    description: 'The Bandit car with screaming chicken hood decal',
    imagePromptHint: 'Giant firebird hood decal, T-tops, shaker scoop, black and gold Bandit package',
  },
  {
    id: 'datsun-z',
    name: "1973 Datsun 240Z",
    make: 'Datsun',
    model: '240Z',
    year: '1973',
    description: 'The affordable sports car that changed the industry',
    imagePromptHint: 'Long hood, fastback, inline-6, Japanese sports car elegance, side vents',
  },
  {
    id: 'el-camino-72',
    name: "1972 Chevrolet El Camino",
    make: 'Chevrolet',
    model: 'El Camino',
    year: '1972',
    description: 'The gentleman\'s hot rod pickup with SS option',
    imagePromptHint: 'Car-truck hybrid, muscle car front, pickup bed, SS stripes possible, lowered stance',
  },
];

// 1980s Vehicles - Technology and Excess
export const VEHICLES_1980s: EraVehicle[] = [
  {
    id: 'corvette-85',
    name: "1985 Chevrolet Corvette",
    make: 'Chevrolet',
    model: 'Corvette',
    year: '1985',
    description: 'The C4 Corvette with digital dashboard and clamshell hood',
    imagePromptHint: 'C4 body style, clamshell hood, digital gauges, aerodynamic wedge shape',
  },
  {
    id: 'gnx-87',
    name: "1987 Buick Grand National GNX",
    make: 'Buick',
    model: 'Grand National GNX',
    year: '1987',
    description: 'The sinister black turbo Buick that embarrassed supercars',
    imagePromptHint: 'All black, menacing, turbocharged V6, understated but deadly, no chrome',
  },
  {
    id: 'testarossa',
    name: "1986 Ferrari Testarossa",
    make: 'Ferrari',
    model: 'Testarossa',
    year: '1986',
    description: 'The Miami Vice poster car with side strakes',
    imagePromptHint: 'Side strakes/cheese grater vents, pop-up headlights, wide rear, flat-12 engine',
  },
  {
    id: 'countach',
    name: "1988 Lamborghini Countach",
    make: 'Lamborghini',
    model: 'Countach',
    year: '1988',
    description: 'The bedroom poster supercar with scissor doors',
    imagePromptHint: 'Scissor doors, extreme wedge shape, massive rear wing, angular Italian design',
  },
  {
    id: 'delorean',
    name: "1981 DeLorean DMC-12",
    make: 'DeLorean',
    model: 'DMC-12',
    year: '1981',
    description: 'The stainless steel time machine with gull-wing doors',
    imagePromptHint: 'Brushed stainless steel body, gull-wing doors, wedge shape, louvers, Back to the Future iconic',
  },
];

// Combined by era for easy lookup
export const ERA_VEHICLES: Record<'1950s' | '1960s' | '1970s' | '1980s', EraVehicle[]> = {
  '1950s': VEHICLES_1950s,
  '1960s': VEHICLES_1960s,
  '1970s': VEHICLES_1970s,
  '1980s': VEHICLES_1980s,
};

// All vehicles flat array
export const ALL_VEHICLES: EraVehicle[] = [
  ...VEHICLES_1950s,
  ...VEHICLES_1960s,
  ...VEHICLES_1970s,
  ...VEHICLES_1980s,
];

// Helper functions
export function getVehicleById(id: string): EraVehicle | undefined {
  return ALL_VEHICLES.find(v => v.id === id);
}

export function getVehiclesByEra(era: '1950s' | '1960s' | '1970s' | '1980s'): EraVehicle[] {
  return ERA_VEHICLES[era];
}

export function getRandomVehicle(): EraVehicle {
  return ALL_VEHICLES[Math.floor(Math.random() * ALL_VEHICLES.length)];
}

export function getRandomVehicleByEra(era: '1950s' | '1960s' | '1970s' | '1980s'): EraVehicle {
  const vehicles = ERA_VEHICLES[era];
  return vehicles[Math.floor(Math.random() * vehicles.length)];
}

export function getVehicleImagePrompt(vehicle: EraVehicle): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}. ${vehicle.description}. Visual details: ${vehicle.imagePromptHint}`;
}

// Vehicle era detection from theme
export function getEraForVehicle(vehicleId: string): '1950s' | '1960s' | '1970s' | '1980s' | undefined {
  if (VEHICLES_1950s.some(v => v.id === vehicleId)) return '1950s';
  if (VEHICLES_1960s.some(v => v.id === vehicleId)) return '1960s';
  if (VEHICLES_1970s.some(v => v.id === vehicleId)) return '1970s';
  if (VEHICLES_1980s.some(v => v.id === vehicleId)) return '1980s';
  return undefined;
}

// Era display info
export const ERA_INFO: Record<'1950s' | '1960s' | '1970s' | '1980s', { name: string; description: string; icon: string }> = {
  '1950s': {
    name: 'The Fifties',
    description: 'Chrome, fins, and the American Dream',
    icon: '🚀',
  },
  '1960s': {
    name: 'The Sixties',
    description: 'Muscle cars and the pony car revolution',
    icon: '🏁',
  },
  '1970s': {
    name: 'The Seventies',
    description: 'Muscle car twilight and new directions',
    icon: '🌅',
  },
  '1980s': {
    name: 'The Eighties',
    description: 'Technology, turbos, and exotic dreams',
    icon: '⚡',
  },
};

export default ERA_VEHICLES;
