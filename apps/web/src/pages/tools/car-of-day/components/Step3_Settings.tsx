import { useState } from 'react';
import { Settings, ChevronRight, Check } from 'lucide-react';

type AssetType = 'official' | 'comic' | 'action-figure' | 'movie-poster';

interface AssetTypeInfo {
  id: AssetType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface Step3Props {
  assetTypes: AssetTypeInfo[];
  selectedTypes: AssetType[];
  onComplete: (types: AssetType[]) => void;
}

export default function Step3_Settings({ assetTypes, selectedTypes: initialTypes, onComplete }: Step3Props) {
  const [selectedTypes, setSelectedTypes] = useState<AssetType[]>(initialTypes);

  const toggleAssetType = (type: AssetType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  };

  const selectAll = () => {
    setSelectedTypes(assetTypes.map((t) => t.id));
  };

  const selectNone = () => {
    setSelectedTypes([]);
  };

  const canContinue = selectedTypes.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-retro-red/10 rounded-full mb-3">
          <Settings className="text-retro-red" size={32} />
        </div>
        <h2 className="font-heading text-2xl uppercase">Select Assets</h2>
        <p className="text-gray-600 text-sm mt-1">
          Choose which asset types to generate
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={selectAll}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Select All
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={selectNone}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          Clear
        </button>
      </div>

      {/* Asset Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assetTypes.map((asset) => {
          const isSelected = selectedTypes.includes(asset.id);

          return (
            <button
              key={asset.id}
              onClick={() => toggleAssetType(asset.id)}
              className={`relative p-4 border-4 rounded-lg text-left transition-all ${
                isSelected
                  ? 'border-retro-red bg-retro-red/5 shadow-retro'
                  : 'border-gray-200 hover:border-gray-400 bg-white'
              }`}
            >
              {/* Selection Indicator */}
              <div
                className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-retro-red border-retro-red text-white'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && <Check size={14} />}
              </div>

              {/* Content */}
              <div className="flex items-start gap-3">
                <div className="text-3xl">{asset.icon}</div>
                <div>
                  <h3 className="font-heading text-lg uppercase">{asset.name}</h3>
                  <p className="text-sm text-gray-600">{asset.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading text-sm uppercase text-gray-600">Selected Assets</p>
            <p className="text-2xl font-bold text-retro-red">
              {selectedTypes.length} <span className="text-sm text-gray-500">/ {assetTypes.length}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {selectedTypes.length === 0 && 'Select at least one asset type'}
              {selectedTypes.length === 1 && '1 asset will be generated'}
              {selectedTypes.length > 1 && `${selectedTypes.length} assets will be generated`}
            </p>
          </div>
        </div>
      </div>

      {/* Asset Descriptions */}
      <div className="bg-retro-mustard/10 p-4 rounded-lg border-2 border-retro-mustard">
        <p className="font-heading text-sm uppercase text-retro-mustard mb-2">Asset Previews</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-lg">⭐</span>
            <div>
              <p className="font-bold">Official</p>
              <p className="text-gray-600">Professional Car of the Day graphic</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">💥</span>
            <div>
              <p className="font-bold">Comic Book</p>
              <p className="text-gray-600">Vintage comic cover with halftone dots</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🧸</span>
            <div>
              <p className="font-bold">Action Figure</p>
              <p className="text-gray-600">80s/90s toy packaging style</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🎬</span>
            <div>
              <p className="font-bold">Movie Poster</p>
              <p className="text-gray-600">Hollywood blockbuster style</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => onComplete(selectedTypes)}
        disabled={!canContinue}
        className="w-full btn-retro-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to Generate
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
