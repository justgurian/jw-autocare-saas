/**
 * Car Makes Registry
 *
 * Static registry of ~35 popular car makes in the US auto repair market.
 * Used for the vehicle preferences system — shops pick makes they want
 * to see in generated flyers to attract the right customers.
 */

export interface CarMake {
  id: string;
  name: string;
  emoji: string;
  color: string;        // Brand-ish color for the UI card
  models: string[];     // Popular models (used as defaults when user doesn't specify)
}

export const CAR_MAKES: CarMake[] = [
  // --- Domestic (US) ---
  { id: 'ford', name: 'Ford', emoji: '🔵', color: '#003478', models: ['F-150', 'Mustang', 'Explorer', 'Bronco', 'Escape', 'Edge'] },
  { id: 'chevrolet', name: 'Chevrolet', emoji: '🏁', color: '#D1A626', models: ['Silverado', 'Camaro', 'Equinox', 'Tahoe', 'Corvette', 'Malibu'] },
  { id: 'dodge', name: 'Dodge', emoji: '🐏', color: '#BA0C2F', models: ['Challenger', 'Charger', 'Durango', 'Hornet'] },
  { id: 'ram', name: 'Ram', emoji: '🐑', color: '#000000', models: ['1500', '2500', '3500', 'ProMaster'] },
  { id: 'jeep', name: 'Jeep', emoji: '🏔️', color: '#4A6741', models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Gladiator', 'Compass'] },
  { id: 'gmc', name: 'GMC', emoji: '🔴', color: '#CC0000', models: ['Sierra', 'Yukon', 'Acadia', 'Canyon', 'Terrain'] },
  { id: 'chrysler', name: 'Chrysler', emoji: '🦅', color: '#00205B', models: ['Pacifica', '300'] },
  { id: 'buick', name: 'Buick', emoji: '🛡️', color: '#89734C', models: ['Enclave', 'Encore', 'Envista'] },
  { id: 'cadillac', name: 'Cadillac', emoji: '💎', color: '#A71930', models: ['Escalade', 'CT5', 'XT5', 'XT6', 'Lyriq'] },
  { id: 'lincoln', name: 'Lincoln', emoji: '⭐', color: '#2C2C2C', models: ['Navigator', 'Aviator', 'Corsair', 'Nautilus'] },

  // --- Japanese ---
  { id: 'toyota', name: 'Toyota', emoji: '🔴', color: '#EB0A1E', models: ['Camry', 'RAV4', 'Corolla', 'Tacoma', '4Runner', 'Highlander', 'Tundra'] },
  { id: 'honda', name: 'Honda', emoji: '❤️', color: '#CC0000', models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Ridgeline'] },
  { id: 'nissan', name: 'Nissan', emoji: '🔵', color: '#C3002F', models: ['Altima', 'Rogue', 'Pathfinder', 'Frontier', 'Sentra', 'Z'] },
  { id: 'subaru', name: 'Subaru', emoji: '🏔️', color: '#003399', models: ['Outback', 'WRX', 'Forester', 'Crosstrek', 'Impreza', 'Ascent'] },
  { id: 'mazda', name: 'Mazda', emoji: '🏎️', color: '#910000', models: ['Mazda3', 'CX-5', 'CX-50', 'CX-90', 'MX-5 Miata'] },
  { id: 'mitsubishi', name: 'Mitsubishi', emoji: '🔺', color: '#ED1C24', models: ['Outlander', 'Eclipse Cross', 'Mirage'] },

  // --- Japanese Luxury ---
  { id: 'lexus', name: 'Lexus', emoji: '✨', color: '#1A1A1A', models: ['RX', 'ES', 'NX', 'IS', 'GX', 'TX'] },
  { id: 'acura', name: 'Acura', emoji: '🅰️', color: '#2D2D2D', models: ['MDX', 'RDX', 'TLX', 'Integra'] },
  { id: 'infiniti', name: 'Infiniti', emoji: '♾️', color: '#1C1C1C', models: ['QX60', 'QX80', 'Q50', 'QX55'] },

  // --- Korean ---
  { id: 'hyundai', name: 'Hyundai', emoji: '🇰🇷', color: '#002C5F', models: ['Tucson', 'Santa Fe', 'Elantra', 'Palisade', 'Ioniq 5', 'Kona'] },
  { id: 'kia', name: 'Kia', emoji: '🔵', color: '#05141F', models: ['Sportage', 'Telluride', 'Forte', 'Sorento', 'EV6', 'Seltos'] },
  { id: 'genesis', name: 'Genesis', emoji: '🪽', color: '#1A1A1A', models: ['G70', 'G80', 'GV70', 'GV80', 'GV60'] },

  // --- German ---
  { id: 'bmw', name: 'BMW', emoji: '🏁', color: '#0066B1', models: ['3 Series', '5 Series', 'X3', 'X5', 'X1', 'iX'] },
  { id: 'mercedes', name: 'Mercedes-Benz', emoji: '⭐', color: '#333333', models: ['C-Class', 'E-Class', 'GLE', 'GLC', 'S-Class', 'A-Class'] },
  { id: 'audi', name: 'Audi', emoji: '🔘', color: '#BB0A30', models: ['A4', 'Q5', 'A6', 'Q7', 'Q3', 'e-tron'] },
  { id: 'volkswagen', name: 'Volkswagen', emoji: '🟦', color: '#001E50', models: ['Jetta', 'Tiguan', 'Atlas', 'Golf GTI', 'ID.4', 'Taos'] },
  { id: 'porsche', name: 'Porsche', emoji: '🏎️', color: '#9F0000', models: ['911', 'Cayenne', 'Macan', 'Taycan', 'Panamera'] },
  { id: 'mini', name: 'Mini', emoji: '🇬🇧', color: '#3D3D3D', models: ['Cooper', 'Countryman', 'Clubman'] },

  // --- European ---
  { id: 'volvo', name: 'Volvo', emoji: '🛡️', color: '#003057', models: ['XC90', 'XC60', 'XC40', 'S60', 'V60'] },
  { id: 'land-rover', name: 'Land Rover', emoji: '🌍', color: '#005A2B', models: ['Range Rover', 'Defender', 'Discovery', 'Evoque'] },
  { id: 'fiat', name: 'Fiat', emoji: '🇮🇹', color: '#8B0000', models: ['500', '500X'] },

  // --- Electric ---
  { id: 'tesla', name: 'Tesla', emoji: '⚡', color: '#CC0000', models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'] },
  { id: 'rivian', name: 'Rivian', emoji: '🌲', color: '#3D5C3E', models: ['R1T', 'R1S'] },
];

// Lookup helpers
const MAKES_BY_ID = new Map(CAR_MAKES.map(m => [m.id, m]));

export function getCarMakeById(id: string): CarMake | undefined {
  return MAKES_BY_ID.get(id);
}

export function getAllCarMakes(): CarMake[] {
  return CAR_MAKES;
}

export function getModelsForMake(makeId: string): string[] {
  return MAKES_BY_ID.get(makeId)?.models || [];
}

export function isValidMakeId(id: string): boolean {
  return MAKES_BY_ID.has(id);
}
