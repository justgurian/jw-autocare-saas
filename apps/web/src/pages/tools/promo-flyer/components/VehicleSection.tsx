import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { promoFlyerApi } from '../../../../services/api';
import { Car, Shuffle, X, PawPrint } from 'lucide-react';
import MascotSelector from '../../../../components/features/MascotSelector';

export type VehicleMode = 'mascot' | 'random' | 'specific' | 'none';

interface VehicleSelection {
  make: string;
  model: string;
  year: string;
  color: string;
  freeText: string;
}

interface VehicleSectionProps {
  vehicleMode: VehicleMode;
  onVehicleModeChange: (mode: VehicleMode) => void;
  vehicle: VehicleSelection;
  onVehicleChange: (vehicle: VehicleSelection) => void;
  mascotId: string | null;
  onMascotChange: (id: string | null) => void;
}

export default function VehicleSection({
  vehicleMode, onVehicleModeChange,
  vehicle, onVehicleChange,
  mascotId, onMascotChange,
}: VehicleSectionProps) {
  const [showSpecific, setShowSpecific] = useState(false);

  const { data } = useQuery({
    queryKey: ['modern-vehicles'],
    queryFn: () => promoFlyerApi.getModernVehicles().then(res => res.data),
    staleTime: 60 * 60 * 1000,
  });

  const makes: string[] = data?.makes || [];
  const models: Record<string, string[]> = data?.models || {};
  const years: number[] = data?.years || [];
  const colors: string[] = data?.colors || [];
  const modelsForMake = vehicle.make ? (models[vehicle.make] || []) : [];

  const handleModeChange = (mode: VehicleMode) => {
    onVehicleModeChange(mode);
    if (mode === 'random') {
      onVehicleChange({ make: '', model: '', year: '', color: '', freeText: '__random__' });
    } else if (mode === 'none') {
      onVehicleChange({ make: '', model: '', year: '', color: '', freeText: '' });
    } else if (mode === 'specific') {
      setShowSpecific(true);
      onVehicleChange({ make: '', model: '', year: '', color: '', freeText: '' });
    }
  };

  return (
    <div className="space-y-3">
      <label className="block font-heading uppercase text-sm">
        Vehicle <span className="text-gray-400 font-normal normal-case">(optional)</span>
      </label>

      {/* Mode buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        {([
          { mode: 'mascot' as const, icon: PawPrint, label: 'Mascot' },
          { mode: 'random' as const, icon: Shuffle, label: 'Random' },
          { mode: 'specific' as const, icon: Car, label: 'Pick' },
          { mode: 'none' as const, icon: X, label: 'None' },
        ]).map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => handleModeChange(opt.mode)}
              className={`flex flex-col items-center gap-1 py-2 px-1 border-2 transition-all ${
                vehicleMode === opt.mode
                  ? 'border-retro-red bg-red-50 text-retro-red'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
              }`}
            >
              <Icon size={16} />
              <span className="text-xs font-heading uppercase">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mascot picker */}
      {vehicleMode === 'mascot' && (
        <div className="p-3 border-2 border-gray-200 bg-gray-50">
          <MascotSelector onSelect={onMascotChange} selectedMascotId={mascotId} />
        </div>
      )}

      {/* Specific vehicle picker */}
      {vehicleMode === 'specific' && (
        <div className="space-y-3 p-3 border-2 border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Make</label>
              <select
                value={vehicle.make}
                onChange={e => onVehicleChange({ ...vehicle, make: e.target.value, model: '', freeText: '' })}
                className="w-full border-2 border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-retro-red focus:outline-none"
              >
                <option value="">Any Make</option>
                {makes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Model</label>
              <select
                value={vehicle.model}
                onChange={e => onVehicleChange({ ...vehicle, model: e.target.value, freeText: '' })}
                disabled={!vehicle.make}
                className="w-full border-2 border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-retro-red focus:outline-none disabled:opacity-50"
              >
                <option value="">Any Model</option>
                {modelsForMake.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Year</label>
              <select
                value={vehicle.year}
                onChange={e => onVehicleChange({ ...vehicle, year: e.target.value, freeText: '' })}
                className="w-full border-2 border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-retro-red focus:outline-none"
              >
                <option value="">Any Year</option>
                {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Color</label>
              <select
                value={vehicle.color}
                onChange={e => onVehicleChange({ ...vehicle, color: e.target.value, freeText: '' })}
                className="w-full border-2 border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-retro-red focus:outline-none"
              >
                <option value="">Any Color</option>
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Free text alternative */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-300" />
            <span className="text-xs text-gray-400">or type any vehicle</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          <input
            type="text"
            placeholder="e.g., 1972 lime green Plymouth Barracuda"
            value={vehicle.freeText === '__random__' ? '' : vehicle.freeText}
            onChange={e => onVehicleChange({ make: '', model: '', year: '', color: '', freeText: e.target.value })}
            className="w-full border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:border-retro-red focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
