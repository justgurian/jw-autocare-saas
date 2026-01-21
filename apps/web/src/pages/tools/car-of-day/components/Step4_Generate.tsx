import { useState, useEffect } from 'react';
import { Sparkles, Car, ImageIcon, User, Loader } from 'lucide-react';
import type { CarOfDayFormData, CarImage } from '../CarOfDayPage';

type AssetType = 'official' | 'comic' | 'action-figure' | 'movie-poster';

interface AssetTypeInfo {
  id: AssetType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface Step4Props {
  formData: CarOfDayFormData;
  carImage: CarImage | null;
  personImage: CarImage | null;
  selectedAssetTypes: AssetType[];
  assetTypes: AssetTypeInfo[];
  onGenerate: () => void;
  isLoading: boolean;
}

const LOADING_PHRASES = [
  'Polishing the chrome...',
  'Revving up the AI engine...',
  'Applying the finishing touches...',
  'Creating your masterpiece...',
  'Making it Instagram-worthy...',
  'Adding that WOW factor...',
  'Generating automotive art...',
  'Tuning the visuals...',
];

export default function Step4_Generate({
  formData,
  carImage,
  personImage,
  selectedAssetTypes,
  assetTypes,
  onGenerate,
  isLoading,
}: Step4Props) {
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  // Cycle through loading phrases
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Build car display name
  const carName =
    formData.carNickname ||
    `${formData.carYear} ${formData.carMake} ${formData.carModel}`.trim() ||
    'Your Vehicle';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-retro-red/10 rounded-full mb-3">
          <Sparkles className="text-retro-red" size={32} />
        </div>
        <h2 className="font-heading text-2xl uppercase">Ready to Generate</h2>
        <p className="text-gray-600 text-sm mt-1">Review your settings and create your assets</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-retro-cream to-white border-4 border-black rounded-lg p-6 shadow-retro">
        {/* Car Info */}
        <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-200">
          {carImage && (
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-4 border-black">
              <img
                src={`data:${carImage.mimeType};base64,${carImage.base64}`}
                alt="Car"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Car size={16} className="text-retro-red" />
              <span className="font-heading text-sm uppercase text-gray-600">Vehicle</span>
            </div>
            <h3 className="font-heading text-xl">{carName}</h3>
            {formData.carNickname && (
              <p className="text-sm text-gray-600">
                {formData.carYear} {formData.carMake} {formData.carModel}
              </p>
            )}
            {formData.carColor && (
              <p className="text-sm text-gray-500">Color: {formData.carColor}</p>
            )}
          </div>
        </div>

        {/* Owner Info (if present) */}
        {(formData.ownerName || personImage) && (
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
            {personImage ? (
              <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-black">
                <img
                  src={`data:${personImage.mimeType};base64,${personImage.base64}`}
                  alt="Owner"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={24} className="text-gray-400" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-gray-500" />
                <span className="font-heading text-xs uppercase text-gray-600">Owner</span>
              </div>
              <p className="font-medium">
                {formData.ownerName || 'Anonymous'}
                {formData.ownerHandle && (
                  <span className="text-blue-600 ml-2">@{formData.ownerHandle.replace('@', '')}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Selected Assets */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={16} className="text-gray-500" />
            <span className="font-heading text-sm uppercase text-gray-600">
              Assets to Generate ({selectedAssetTypes.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedAssetTypes.map((typeId) => {
              const asset = assetTypes.find((t) => t.id === typeId);
              return (
                <span
                  key={typeId}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-retro-red text-white rounded-full text-sm font-heading uppercase"
                >
                  <span className="text-lg">{asset?.icon}</span>
                  {asset?.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generation Time Estimate */}
      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 text-center">
        <p className="text-sm text-blue-700">
          <span className="font-bold">Estimated time:</span>{' '}
          {selectedAssetTypes.length * 15}-{selectedAssetTypes.length * 25} seconds
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Each asset is AI-generated with custom prompts
        </p>
      </div>

      {/* Generate Button */}
      {isLoading ? (
        <div className="bg-retro-red text-white p-8 rounded-lg text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader className="w-16 h-16 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🚗</span>
              </div>
            </div>
            <div>
              <p className="font-heading text-2xl uppercase">Generating Assets</p>
              <p className="text-retro-cream mt-2 animate-pulse">
                {LOADING_PHRASES[loadingPhraseIndex]}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="w-full max-w-xs bg-white/20 rounded-full h-2 mt-4">
              <div
                className="h-full bg-white rounded-full animate-pulse"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={onGenerate}
          className="w-full bg-retro-red hover:bg-retro-red/90 text-white p-6 rounded-lg border-4 border-black shadow-retro hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 font-heading text-2xl uppercase"
        >
          <Sparkles size={28} />
          Generate {selectedAssetTypes.length} Assets
        </button>
      )}

      {/* Tips */}
      {!isLoading && (
        <p className="text-center text-sm text-gray-500">
          Click generate to create your Car of the Day assets. You can download and share each one
          individually, or download all as a pack.
        </p>
      )}
    </div>
  );
}
