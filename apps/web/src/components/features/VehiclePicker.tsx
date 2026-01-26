import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { promoFlyerApi } from '../../services/api';
import { Car, Shuffle, ChevronDown } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: string;
  description: string;
}

interface VehiclePickerProps {
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string | null) => void;
  filterEra?: string;
}

export default function VehiclePicker({
  selectedVehicleId,
  onSelectVehicle,
  filterEra,
}: VehiclePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEra, setSelectedEra] = useState<string | null>(filterEra || null);

  // Fetch vehicles
  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ['vehicles', selectedEra],
    queryFn: () => promoFlyerApi.getVehicles(selectedEra || undefined).then(res => res.data),
  });

  const vehicles: Vehicle[] = vehiclesData?.vehicles || [];
  const eraInfo = vehiclesData?.eraInfo || {};

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const eras = ['1950s', '1960s', '1970s', '1980s'];

  return (
    <div className="space-y-3">
      <label className="block font-heading uppercase text-sm">
        Featured Vehicle
      </label>

      {/* Selection Mode */}
      <div className="flex gap-2">
        <button
          onClick={() => onSelectVehicle('random')}
          className={`flex-1 py-2 px-3 border-2 flex items-center justify-center gap-2 transition-all ${
            selectedVehicleId === 'random'
              ? 'border-retro-teal bg-teal-50 text-retro-teal'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
          }`}
        >
          <Shuffle size={16} />
          <span className="text-sm font-heading uppercase">Random</span>
        </button>
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (selectedVehicleId === 'random') {
              onSelectVehicle(null);
            }
          }}
          className={`flex-1 py-2 px-3 border-2 flex items-center justify-center gap-2 transition-all ${
            selectedVehicleId && selectedVehicleId !== 'random'
              ? 'border-retro-teal bg-teal-50 text-retro-teal'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
          }`}
        >
          <Car size={16} />
          <span className="text-sm font-heading uppercase">Choose</span>
          <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Selected Vehicle Display */}
      {selectedVehicle && (
        <div className="p-3 bg-teal-50 border-2 border-retro-teal text-sm">
          <p className="font-heading uppercase">{selectedVehicle.name}</p>
          <p className="text-gray-600 text-xs mt-1">{selectedVehicle.description}</p>
        </div>
      )}

      {/* Vehicle Selection Dropdown */}
      {isExpanded && (
        <div className="border-2 border-black bg-white">
          {/* Era Filter */}
          <div className="p-3 border-b-2 border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Filter by Era:</p>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedEra(null)}
                className={`px-2 py-1 text-xs font-heading uppercase ${
                  selectedEra === null
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {eras.map(era => (
                <button
                  key={era}
                  onClick={() => setSelectedEra(era === selectedEra ? null : era)}
                  className={`px-2 py-1 text-xs font-heading uppercase ${
                    selectedEra === era
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {(eraInfo as Record<string, { icon: string }>)[era]?.icon} {era}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle List */}
          <div className="max-h-[250px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">Loading vehicles...</div>
            ) : vehicles.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No vehicles found</div>
            ) : (
              vehicles.map(vehicle => (
                <button
                  key={vehicle.id}
                  onClick={() => {
                    onSelectVehicle(vehicle.id);
                    setIsExpanded(false);
                  }}
                  className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                    selectedVehicleId === vehicle.id ? 'bg-teal-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-heading uppercase text-sm">{vehicle.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{vehicle.description}</p>
                    </div>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600">
                      {vehicle.year.slice(0, 4)}s
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Optional: Choose a classic vehicle to feature in your flyer
      </p>
    </div>
  );
}
