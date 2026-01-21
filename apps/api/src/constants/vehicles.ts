/**
 * Vehicle Constants
 * Comprehensive list of car makes, models, years, and colors
 * Used for Check-In To Win, Car of the Day, and other vehicle-related features
 */

export const CAR_MAKES = [
  'Acura',
  'Alfa Romeo',
  'Aston Martin',
  'Audi',
  'Bentley',
  'BMW',
  'Buick',
  'Cadillac',
  'Chevrolet',
  'Chrysler',
  'Dodge',
  'Ferrari',
  'Fiat',
  'Ford',
  'Genesis',
  'GMC',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Jaguar',
  'Jeep',
  'Kia',
  'Lamborghini',
  'Land Rover',
  'Lexus',
  'Lincoln',
  'Lotus',
  'Maserati',
  'Mazda',
  'McLaren',
  'Mercedes-Benz',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Polestar',
  'Porsche',
  'Ram',
  'Rivian',
  'Rolls-Royce',
  'Subaru',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
] as const;

export type CarMake = (typeof CAR_MAKES)[number];

export const CAR_MODELS: Record<string, string[]> = {
  Acura: ['ILX', 'Integra', 'MDX', 'NSX', 'RDX', 'TLX', 'ZDX'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', '4C Spider'],
  'Aston Martin': ['DB11', 'DB12', 'DBX', 'Vantage', 'DBS'],
  Audi: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron', 'e-tron GT', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'R8', 'RS3', 'RS5', 'RS6', 'RS7', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'TT'],
  Bentley: ['Bentayga', 'Continental GT', 'Flying Spur'],
  BMW: ['2 Series', '3 Series', '4 Series', '5 Series', '7 Series', '8 Series', 'i4', 'i5', 'i7', 'iX', 'M2', 'M3', 'M4', 'M5', 'M8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'Z4'],
  Buick: ['Enclave', 'Encore', 'Encore GX', 'Envision', 'Envista'],
  Cadillac: ['CT4', 'CT5', 'Escalade', 'Escalade ESV', 'Lyriq', 'XT4', 'XT5', 'XT6'],
  Chevrolet: ['Blazer', 'Bolt EUV', 'Bolt EV', 'Camaro', 'Colorado', 'Corvette', 'Equinox', 'Malibu', 'Silverado 1500', 'Silverado 2500HD', 'Silverado 3500HD', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse', 'Trax'],
  Chrysler: ['300', 'Pacifica', 'Voyager'],
  Dodge: ['Challenger', 'Charger', 'Durango', 'Hornet'],
  Ferrari: ['296 GTB', '296 GTS', '812 Competizione', 'F8 Tributo', 'Portofino M', 'Purosangue', 'Roma', 'SF90 Stradale'],
  Fiat: ['500e', '500X'],
  Ford: ['Bronco', 'Bronco Sport', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'F-150 Lightning', 'Maverick', 'Mustang', 'Mustang Mach-E', 'Ranger', 'Super Duty F-250', 'Super Duty F-350', 'Transit', 'Transit Connect'],
  Genesis: ['Electrified G80', 'Electrified GV70', 'G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
  GMC: ['Acadia', 'Canyon', 'Hummer EV', 'Hummer EV SUV', 'Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD', 'Terrain', 'Yukon', 'Yukon XL'],
  Honda: ['Accord', 'Civic', 'CR-V', 'HR-V', 'Odyssey', 'Passport', 'Pilot', 'Prologue', 'Ridgeline'],
  Hyundai: ['Elantra', 'Ioniq 5', 'Ioniq 6', 'Kona', 'Palisade', 'Santa Cruz', 'Santa Fe', 'Sonata', 'Tucson', 'Venue'],
  Infiniti: ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
  Jaguar: ['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'XF'],
  Jeep: ['Compass', 'Gladiator', 'Grand Cherokee', 'Grand Cherokee 4xe', 'Grand Cherokee L', 'Grand Wagoneer', 'Renegade', 'Wagoneer', 'Wrangler', 'Wrangler 4xe'],
  Kia: ['Carnival', 'EV6', 'EV9', 'Forte', 'K5', 'Niro', 'Rio', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Telluride'],
  Lamborghini: ['Huracan', 'Revuelto', 'Urus'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
  Lexus: ['ES', 'GX', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX', 'RZ', 'TX', 'UX'],
  Lincoln: ['Aviator', 'Corsair', 'Nautilus', 'Navigator'],
  Lotus: ['Eletre', 'Emira', 'Evija'],
  Maserati: ['Ghibli', 'GranTurismo', 'Grecale', 'Levante', 'MC20', 'Quattroporte'],
  Mazda: ['CX-30', 'CX-5', 'CX-50', 'CX-70', 'CX-90', 'Mazda3', 'MX-30', 'MX-5 Miata'],
  McLaren: ['750S', 'Artura', 'GT'],
  'Mercedes-Benz': ['A-Class', 'AMG GT', 'C-Class', 'CLA', 'CLE', 'E-Class', 'EQB', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV', 'G-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'Maybach', 'S-Class', 'SL'],
  Mini: ['Clubman', 'Convertible', 'Countryman', 'Hardtop 2 Door', 'Hardtop 4 Door'],
  Mitsubishi: ['Eclipse Cross', 'Mirage', 'Outlander', 'Outlander Sport'],
  Nissan: ['Altima', 'Armada', 'Ariya', 'Frontier', 'GT-R', 'Kicks', 'Leaf', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa', 'Z'],
  Polestar: ['Polestar 2', 'Polestar 3'],
  Porsche: ['718 Boxster', '718 Cayman', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  Ram: ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
  Rivian: ['R1S', 'R1T'],
  'Rolls-Royce': ['Cullinan', 'Ghost', 'Phantom', 'Spectre'],
  Subaru: ['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'Solterra', 'WRX'],
  Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
  Toyota: ['4Runner', 'bZ4X', 'Camry', 'Corolla', 'Corolla Cross', 'Crown', 'Grand Highlander', 'GR86', 'GR Corolla', 'GR Supra', 'Highlander', 'Land Cruiser', 'Prius', 'RAV4', 'RAV4 Prime', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Venza'],
  Volkswagen: ['Arteon', 'Atlas', 'Atlas Cross Sport', 'Golf GTI', 'Golf R', 'ID.4', 'ID.Buzz', 'Jetta', 'Taos', 'Tiguan'],
  Volvo: ['C40 Recharge', 'S60', 'S90', 'V60', 'V90', 'XC40', 'XC40 Recharge', 'XC60', 'XC90'],
};

// Generate years from current year back to 1980
const currentYear = new Date().getFullYear();
export const CAR_YEARS: number[] = Array.from(
  { length: currentYear - 1979 },
  (_, i) => currentYear - i
);

export const CAR_COLORS = [
  'Black',
  'White',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Dark Blue',
  'Light Blue',
  'Green',
  'Dark Green',
  'Yellow',
  'Orange',
  'Brown',
  'Tan',
  'Beige',
  'Gold',
  'Bronze',
  'Burgundy',
  'Maroon',
  'Purple',
  'Pink',
  'Champagne',
  'Pearl White',
  'Metallic Silver',
  'Graphite',
  'Charcoal',
  'Copper',
  'Teal',
  'Other',
] as const;

export type CarColor = (typeof CAR_COLORS)[number];

// Helper function to get models for a make
export function getModelsForMake(make: string): string[] {
  return CAR_MODELS[make] || [];
}

// Helper to format full vehicle name
export function formatVehicleName(year: string | number, make: string, model: string): string {
  return `${year} ${make} ${model}`;
}
