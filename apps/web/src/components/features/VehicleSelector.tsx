import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { promoFlyerApi } from '../../services/api';
import { Car, Shuffle, X } from 'lucide-react';

interface VehicleSelection {
  make: string;
  model: string;
  year: string;
  color: string;
  freeText: string;
}

interface VehicleSelectorProps {
  value: VehicleSelection;
  onChange: (value: VehicleSelection) => void;
}

export default function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
  const [mode, setMode] = useState<'none' | 'select' | 'freetext'>(
    value.freeText ? 'freetext' : value.make ? 'select' : 'none'
  );

  const { data } = useQuery({
    queryKey: ['modern-vehicles'],
    queryFn: () => promoFlyerApi.getModernVehicles().then(res => res.data),
    staleTime: 60 * 60 * 1000, // 1 hour — this data doesn't change
  });

  const makes: string[] = data?.makes || [];
  const models: Record<string, string[]> = data?.models || {};
  const years: number[] = data?.years || [];
  const colors: string[] = data?.colors || [];

  const modelsForMake = value.make ? (models[value.make] || []) : [];

  const handleMakeChange = (make: string) => {
    onChange({ ...value, make, model: '', freeText: '' });
    setMode('select');
  };

  const handleRandom = () => {
    onChange({ make: '', model: '', year: '', color: '', freeText: '__random__' });
    setMode('none');
  };

  const handleNoCar = () => {
    onChange({ make: '', model: '', year: '', color: '', freeText: '' });
    setMode('none');
  };

  const isFreeTextMode = mode === 'freetext';
  const isSelectMode = mode === 'select';
  const isRandom = value.freeText === '__random__';
  const hasSelection = value.make || (value.freeText && value.freeText !== '__random__');

  return (
    <div className="space-y-3">
      <label className="block font-heading uppercase text-sm">
        Featured Vehicle <span className="text-gray-400 font-normal normal-case">(optional)</span>
      </label>

      {/* Mode buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleRandom}
          className={`flex-1 py-2 px-3 border-2 flex items-center justify-center gap-2 transition-all ${
            isRandom
              ? 'border-retro-teal bg-teal-50 text-retro-teal'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
          }`}
        >
          <Shuffle size={16} />
          <span className="text-sm font-heading uppercase">Random</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('select');
            if (isRandom) onChange({ make: '', model: '', year: '', color: '', freeText: '' });
          }}
          className={`flex-1 py-2 px-3 border-2 flex items-center justify-center gap-2 transition-all ${
            isSelectMode
              ? 'border-retro-teal bg-teal-50 text-retro-teal'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
          }`}
        >
          <Car size={16} />
          <span className="text-sm font-heading uppercase">Choose</span>
        </button>
        <button
          type="button"
          onClick={handleNoCar}
          className={`flex-1 py-2 px-3 border-2 flex items-center justify-center gap-2 transition-all ${
            mode === 'none' && !isRandom
              ? 'border-retro-teal bg-teal-50 text-retro-teal'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
          }`}
        >
          <X size={16} />
          <span className="text-sm font-heading uppercase">No Car</span>
        </button>
      </div>

      {/* Dropdowns */}
      {isSelectMode && (
        <div className="space-y-3 p-3 border-2 border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            {/* Make */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Make</label>
              <select
                value={value.make}
                onChange={e => handleMakeChange(e.target.value)}
                className="w-full border-2 border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-retro-teal focus:outline-none"
              >
                <option value="">Any Make</option>
                {makes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Model</label>
              <select
                value={value.model}
                onChange={e => onChange({ ...value, model: e.target.value, freeText: '' })}
                disabled={!value.make}
                className="w-full border-2 border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-retro-teal focus:outline-none disabled:opacity-50"
              >
                <option value="">Any Model</option>
                {modelsForMake.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Year</label>
              <select
                value={value.year}
                onChange={e => onChange({ ...value, year: e.target.value, freeText: '' })}
                className="w-full border-2 border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-retro-teal focus:outline-none"
              >
                <option value="">Any Year</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Color</label>
              <select
                value={value.color}
                onChange={e => onChange({ ...value, color: e.target.value, freeText: '' })}
                className="w-full border-2 border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-retro-teal focus:outline-none"
              >
                <option value="">Any Color</option>
                {colors.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-300" />
            <span className="text-xs text-gray-400">or type any vehicle</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Free text */}
          <input
            type="text"
            placeholder="e.g., 1972 lime green Plymouth Barracuda"
            value={value.freeText === '__random__' ? '' : value.freeText}
            onChange={e => {
              const text = e.target.value;
              onChange({ make: '', model: '', year: '', color: '', freeText: text });
              setMode(text ? 'freetext' : 'select');
            }}
            className="w-full border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:border-retro-teal focus:outline-none"
          />
        </div>
      )}

      {/* Summary of selection */}
      {hasSelection && !isSelectMode && (
        <div className="p-2 bg-teal-50 border border-retro-teal text-sm flex items-center justify-between">
          <span className="font-heading text-xs uppercase">
            {value.freeText && value.freeText !== '__random__'
              ? value.freeText
              : [value.color, value.year, value.make, value.model].filter(Boolean).join(' ')}
          </span>
          <button
            type="button"
            onClick={() => setMode('select')}
            className="text-retro-teal text-xs underline"
          >
            Edit
          </button>
        </div>
      )}

      {isRandom && (
        <p className="text-xs text-gray-500">
          A vehicle from your loved makes will be randomly selected
        </p>
      )}
    </div>
  );
}
