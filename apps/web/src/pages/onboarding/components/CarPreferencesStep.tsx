import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Ban } from 'lucide-react';

// Static car makes registry — no API call needed
const CAR_MAKES = [
  { id: 'ford', name: 'Ford', models: ['F-150', 'Mustang', 'Explorer', 'Bronco', 'Escape', 'Edge'] },
  { id: 'chevrolet', name: 'Chevy', models: ['Silverado', 'Camaro', 'Equinox', 'Tahoe', 'Corvette', 'Malibu'] },
  { id: 'dodge', name: 'Dodge', models: ['Challenger', 'Charger', 'Durango', 'Hornet'] },
  { id: 'ram', name: 'Ram', models: ['1500', '2500', '3500', 'ProMaster'] },
  { id: 'jeep', name: 'Jeep', models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Gladiator', 'Compass'] },
  { id: 'gmc', name: 'GMC', models: ['Sierra', 'Yukon', 'Acadia', 'Canyon', 'Terrain'] },
  { id: 'toyota', name: 'Toyota', models: ['Camry', 'RAV4', 'Corolla', 'Tacoma', '4Runner', 'Highlander', 'Tundra'] },
  { id: 'honda', name: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Ridgeline'] },
  { id: 'nissan', name: 'Nissan', models: ['Altima', 'Rogue', 'Pathfinder', 'Frontier', 'Sentra', 'Z'] },
  { id: 'subaru', name: 'Subaru', models: ['Outback', 'WRX', 'Forester', 'Crosstrek', 'Impreza', 'Ascent'] },
  { id: 'mazda', name: 'Mazda', models: ['Mazda3', 'CX-5', 'CX-50', 'CX-90', 'MX-5 Miata'] },
  { id: 'hyundai', name: 'Hyundai', models: ['Tucson', 'Santa Fe', 'Elantra', 'Palisade', 'Ioniq 5', 'Kona'] },
  { id: 'kia', name: 'Kia', models: ['Sportage', 'Telluride', 'Forte', 'Sorento', 'EV6', 'Seltos'] },
  { id: 'bmw', name: 'BMW', models: ['3 Series', '5 Series', 'X3', 'X5', 'X1', 'iX'] },
  { id: 'mercedes', name: 'Mercedes', models: ['C-Class', 'E-Class', 'GLE', 'GLC', 'S-Class', 'A-Class'] },
  { id: 'audi', name: 'Audi', models: ['A4', 'Q5', 'A6', 'Q7', 'Q3', 'e-tron'] },
  { id: 'volkswagen', name: 'VW', models: ['Jetta', 'Tiguan', 'Atlas', 'Golf GTI', 'ID.4', 'Taos'] },
  { id: 'lexus', name: 'Lexus', models: ['RX', 'ES', 'NX', 'IS', 'GX', 'TX'] },
  { id: 'acura', name: 'Acura', models: ['MDX', 'RDX', 'TLX', 'Integra'] },
  { id: 'porsche', name: 'Porsche', models: ['911', 'Cayenne', 'Macan', 'Taycan', 'Panamera'] },
  { id: 'tesla', name: 'Tesla', models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'] },
  { id: 'volvo', name: 'Volvo', models: ['XC90', 'XC60', 'XC40', 'S60', 'V60'] },
  { id: 'land-rover', name: 'Land Rover', models: ['Range Rover', 'Defender', 'Discovery', 'Evoque'] },
  { id: 'cadillac', name: 'Cadillac', models: ['Escalade', 'CT5', 'XT5', 'XT6', 'Lyriq'] },
  { id: 'lincoln', name: 'Lincoln', models: ['Navigator', 'Aviator', 'Corsair', 'Nautilus'] },
  { id: 'chrysler', name: 'Chrysler', models: ['Pacifica', '300'] },
  { id: 'buick', name: 'Buick', models: ['Enclave', 'Encore', 'Envista'] },
  { id: 'genesis', name: 'Genesis', models: ['G70', 'G80', 'GV70', 'GV80', 'GV60'] },
  { id: 'infiniti', name: 'Infiniti', models: ['QX60', 'QX80', 'Q50', 'QX55'] },
  { id: 'mitsubishi', name: 'Mitsubishi', models: ['Outlander', 'Eclipse Cross', 'Mirage'] },
  { id: 'mini', name: 'Mini', models: ['Cooper', 'Countryman', 'Clubman'] },
  { id: 'fiat', name: 'Fiat', models: ['500', '500X'] },
  { id: 'rivian', name: 'Rivian', models: ['R1T', 'R1S'] },
];

interface LovedMake {
  makeId: string;
  models?: string[];
}

interface CarPreferencesStepProps {
  lovedMakes: LovedMake[];
  neverMakes: string[];
  onChange: (loved: LovedMake[], never: string[]) => void;
}

export default function CarPreferencesStep({ lovedMakes, neverMakes, onChange }: CarPreferencesStepProps) {
  const [blockMode, setBlockMode] = useState(false);
  const [expandedMake, setExpandedMake] = useState<string | null>(null);

  const isLoved = (makeId: string) => lovedMakes.some(l => l.makeId === makeId);
  const isNever = (makeId: string) => neverMakes.includes(makeId);

  const handleMakeClick = (makeId: string) => {
    if (blockMode) {
      if (isNever(makeId)) {
        onChange(lovedMakes, neverMakes.filter(id => id !== makeId));
      } else {
        onChange(
          lovedMakes.filter(l => l.makeId !== makeId),
          [...neverMakes, makeId]
        );
      }
    } else {
      if (isLoved(makeId)) {
        onChange(lovedMakes.filter(l => l.makeId !== makeId), neverMakes);
      } else {
        onChange(
          [...lovedMakes, { makeId, models: [] }],
          neverMakes.filter(id => id !== makeId)
        );
      }
    }
  };

  const handleModelToggle = (makeId: string, model: string) => {
    const loved = lovedMakes.find(l => l.makeId === makeId);
    if (!loved) return;

    const currentModels = loved.models || [];
    const updated = currentModels.includes(model)
      ? currentModels.filter(m => m !== model)
      : [...currentModels, model];

    onChange(
      lovedMakes.map(l => l.makeId === makeId ? { ...l, models: updated } : l),
      neverMakes
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-gray-600">
          Pick car brands your customers drive. We'll feature them in your flyers.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          You can always change these later in settings.
        </p>
      </div>

      {/* Mode toggle + counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {lovedMakes.length > 0 && (
            <span className="text-sm font-heading uppercase text-retro-teal">
              {lovedMakes.length} selected
            </span>
          )}
          {neverMakes.length > 0 && (
            <span className="text-sm font-heading uppercase text-retro-red">
              {neverMakes.length} blocked
            </span>
          )}
        </div>

        <button
          onClick={() => setBlockMode(!blockMode)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading uppercase border-2 transition-all
            ${blockMode
              ? 'bg-retro-red/10 border-retro-red text-retro-red'
              : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
            }
          `}
        >
          <Ban size={14} />
          {blockMode ? 'Blocking Mode' : 'Block Brands'}
        </button>
      </div>

      {blockMode && (
        <p className="text-xs text-retro-red text-center animate-fade-in">
          Tap brands you NEVER want to see in your flyers
        </p>
      )}

      {/* Makes Grid — simple text cards */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {CAR_MAKES.map((make) => {
          const loved = isLoved(make.id);
          const never = isNever(make.id);

          return (
            <button
              key={make.id}
              onClick={() => handleMakeClick(make.id)}
              className={`
                relative px-3 py-2.5 border-2 transition-all duration-150 text-center
                ${loved
                  ? 'border-retro-teal bg-retro-teal/10 shadow-[2px_2px_0_0_#2DD4BF]'
                  : never
                    ? 'border-retro-red bg-retro-red/10 shadow-[2px_2px_0_0_#C53030]'
                    : blockMode
                      ? 'border-gray-200 hover:border-retro-red/50'
                      : 'border-gray-200 hover:border-gray-400 hover:shadow-retro-sm'
                }
              `}
            >
              {loved && (
                <CheckCircle size={14} className="text-retro-teal absolute top-1 right-1" />
              )}
              {never && (
                <XCircle size={14} className="text-retro-red absolute top-1 right-1" />
              )}
              <span className="font-heading text-sm uppercase">
                {make.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Model Drill-down for loved makes */}
      {lovedMakes.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="font-heading text-sm uppercase text-gray-500">
            Pick specific models? <span className="text-gray-400 font-body normal-case">(optional)</span>
          </p>

          {lovedMakes.map(loved => {
            const make = CAR_MAKES.find(m => m.id === loved.makeId);
            if (!make) return null;
            const isExpanded = expandedMake === loved.makeId;
            const selectedModels = loved.models || [];

            return (
              <div key={loved.makeId} className="border border-gray-200">
                <button
                  onClick={() => setExpandedMake(isExpanded ? null : loved.makeId)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm uppercase">{make.name}</span>
                    {selectedModels.length > 0 && (
                      <span className="text-xs text-retro-teal">
                        ({selectedModels.length} models)
                      </span>
                    )}
                    {selectedModels.length === 0 && (
                      <span className="text-xs text-gray-400">All models</span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 flex flex-wrap gap-2 animate-fade-in">
                    {make.models.map(model => {
                      const isSelected = selectedModels.includes(model);
                      return (
                        <button
                          key={model}
                          onClick={() => handleModelToggle(loved.makeId, model)}
                          className={`
                            px-3 py-1.5 text-xs font-heading uppercase border transition-all
                            ${isSelected
                              ? 'bg-retro-teal text-white border-retro-teal'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-retro-teal'
                            }
                          `}
                        >
                          {model}
                        </button>
                      );
                    })}
                    <p className="w-full text-[10px] text-gray-400 mt-1">
                      No models selected = all models will appear
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {lovedMakes.length === 0 && !blockMode && (
        <p className="text-center text-sm text-gray-400 mt-4">
          Tap car brands your customers drive
        </p>
      )}
    </div>
  );
}
