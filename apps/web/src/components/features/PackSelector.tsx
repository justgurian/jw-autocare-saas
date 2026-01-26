import { useState } from 'react';
import { Package, ChevronDown } from 'lucide-react';

type PackType = 'variety-3' | 'variety-5' | 'week-7' | 'era' | 'style';

interface PackOption {
  id: PackType;
  name: string;
  count: number;
  description: string;
  requiresEra?: boolean;
  requiresStyle?: boolean;
}

const PACK_OPTIONS: PackOption[] = [
  {
    id: 'variety-3',
    name: '3-Pack Variety',
    count: 3,
    description: '3 different styles from different eras',
  },
  {
    id: 'variety-5',
    name: '5-Pack Variety',
    count: 5,
    description: '5 different styles from different eras',
  },
  {
    id: 'week-7',
    name: 'Week Pack',
    count: 7,
    description: '7 flyers for a week of content',
  },
  {
    id: 'era',
    name: 'Era Pack',
    count: 4,
    description: '4 flyers from the same era (all 3 styles + bonus)',
    requiresEra: true,
  },
  {
    id: 'style',
    name: 'Style Pack',
    count: 4,
    description: '4 flyers in same style from different eras',
    requiresStyle: true,
  },
];

interface PackSelectorProps {
  selectedPack: PackType | null;
  onSelectPack: (pack: PackType | null) => void;
  selectedEra: string | null;
  onSelectEra: (era: string | null) => void;
  selectedStyle: string | null;
  onSelectStyle: (style: string | null) => void;
}

export default function PackSelector({
  selectedPack,
  onSelectPack,
  selectedEra,
  onSelectEra,
  selectedStyle,
  onSelectStyle,
}: PackSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedOption = PACK_OPTIONS.find(p => p.id === selectedPack);

  const eras = ['1950s', '1960s', '1970s', '1980s'];
  const styles = [
    { id: 'comic-book', name: 'Comic Book' },
    { id: 'movie-poster', name: 'Movie Poster' },
    { id: 'magazine', name: 'Magazine' },
  ];

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 font-heading uppercase text-sm">
        <Package size={16} />
        Generate Multiple
      </label>

      {/* Pack Selector Dropdown */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 px-4 border-2 border-gray-300 bg-white text-left flex items-center justify-between hover:border-gray-500 transition-colors"
      >
        <span className="font-heading uppercase text-sm">
          {selectedOption ? selectedOption.name : 'Single Flyer'}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="border-2 border-black bg-white">
          {/* Single Flyer Option */}
          <button
            onClick={() => {
              onSelectPack(null);
              setIsExpanded(false);
            }}
            className={`w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              selectedPack === null ? 'bg-teal-50' : ''
            }`}
          >
            <p className="font-heading uppercase text-sm">Single Flyer</p>
            <p className="text-xs text-gray-500 mt-0.5">Generate one flyer at a time</p>
          </button>

          {/* Pack Options */}
          {PACK_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => {
                onSelectPack(option.id);
                setIsExpanded(false);
              }}
              className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                selectedPack === option.id ? 'bg-teal-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-heading uppercase text-sm">{option.name}</p>
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600">
                  {option.count} flyers
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Era Selection for Era Pack */}
      {selectedPack === 'era' && (
        <div className="p-3 border-2 border-dashed border-gray-300 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Select an era for the pack:</p>
          <div className="flex flex-wrap gap-2">
            {eras.map(era => (
              <button
                key={era}
                onClick={() => onSelectEra(era === selectedEra ? null : era)}
                className={`px-3 py-1.5 text-xs font-heading uppercase border-2 ${
                  selectedEra === era
                    ? 'border-retro-red bg-red-50 text-retro-red'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
                }`}
              >
                {era}
              </button>
            ))}
          </div>
          {!selectedEra && (
            <p className="text-xs text-retro-red mt-2">Please select an era</p>
          )}
        </div>
      )}

      {/* Style Selection for Style Pack */}
      {selectedPack === 'style' && (
        <div className="p-3 border-2 border-dashed border-gray-300 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Select a style for the pack:</p>
          <div className="flex flex-wrap gap-2">
            {styles.map(style => (
              <button
                key={style.id}
                onClick={() => onSelectStyle(style.id === selectedStyle ? null : style.id)}
                className={`px-3 py-1.5 text-xs font-heading uppercase border-2 ${
                  selectedStyle === style.id
                    ? 'border-retro-red bg-red-50 text-retro-red'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
          {!selectedStyle && (
            <p className="text-xs text-retro-red mt-2">Please select a style</p>
          )}
        </div>
      )}

      {selectedOption && (
        <p className="text-xs text-gray-500">
          This will generate {selectedOption.count} flyers at once
        </p>
      )}
    </div>
  );
}
