import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { promoFlyerApi } from '../../services/api';
import { Shuffle, Film, Newspaper, Sparkles } from 'lucide-react';

interface NostalgicTheme {
  id: string;
  name: string;
  category: string;
  shortDescription?: string;
  previewColors?: string[];
  era: '1950s' | '1960s' | '1970s' | '1980s';
  style: 'comic-book' | 'movie-poster' | 'magazine';
}

interface Era {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Style {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface NostalgicThemeGridProps {
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
  onSurpriseMe?: () => void;
}

const styleIcons: Record<string, React.ReactNode> = {
  'comic-book': <Sparkles size={14} />,
  'movie-poster': <Film size={14} />,
  'magazine': <Newspaper size={14} />,
};

export default function NostalgicThemeGrid({
  selectedThemeId,
  onSelectTheme,
  onSurpriseMe,
}: NostalgicThemeGridProps) {
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // Fetch themes data
  const { data: themesData, isLoading } = useQuery({
    queryKey: ['promo-flyer-themes'],
    queryFn: () => promoFlyerApi.getThemes().then(res => res.data),
  });

  // Filter themes based on selected era and style
  const filteredThemes = useMemo(() => {
    if (!themesData?.nostalgicThemes) return [];

    return themesData.nostalgicThemes.filter((theme: NostalgicTheme) => {
      if (selectedEra && theme.era !== selectedEra) return false;
      if (selectedStyle && theme.style !== selectedStyle) return false;
      return true;
    });
  }, [themesData?.nostalgicThemes, selectedEra, selectedStyle]);

  const eras: Era[] = themesData?.eras || [];
  const styles: Style[] = themesData?.styles || [];

  const handleSurpriseMe = async () => {
    if (onSurpriseMe) {
      onSurpriseMe();
      return;
    }

    // Default behavior: pick random from filtered
    if (filteredThemes.length > 0) {
      const randomTheme = filteredThemes[Math.floor(Math.random() * filteredThemes.length)];
      onSelectTheme(randomTheme.id);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Surprise Me Button */}
      <button
        onClick={handleSurpriseMe}
        className="w-full py-4 bg-gradient-to-r from-retro-red to-retro-teal text-white font-heading uppercase text-lg flex items-center justify-center gap-3 border-2 border-black shadow-retro hover:shadow-retro-lg transition-shadow"
      >
        <Shuffle size={24} />
        Surprise Me!
      </button>

      {/* Era Filter */}
      <div>
        <p className="font-heading uppercase text-xs text-gray-500 mb-2">Filter by Era</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedEra(null)}
            className={`px-3 py-1.5 text-xs font-heading uppercase border-2 transition-all ${
              selectedEra === null
                ? 'border-black bg-black text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
            }`}
          >
            All Eras
          </button>
          {eras.map((era) => (
            <button
              key={era.id}
              onClick={() => setSelectedEra(era.id === selectedEra ? null : era.id)}
              className={`px-3 py-1.5 text-xs font-heading uppercase border-2 transition-all flex items-center gap-1 ${
                selectedEra === era.id
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
              }`}
            >
              <span>{era.icon}</span>
              <span>{era.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style Filter */}
      <div>
        <p className="font-heading uppercase text-xs text-gray-500 mb-2">Filter by Style</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStyle(null)}
            className={`px-3 py-1.5 text-xs font-heading uppercase border-2 transition-all ${
              selectedStyle === null
                ? 'border-black bg-black text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
            }`}
          >
            All Styles
          </button>
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id === selectedStyle ? null : style.id)}
              className={`px-3 py-1.5 text-xs font-heading uppercase border-2 transition-all flex items-center gap-1 ${
                selectedStyle === style.id
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
              }`}
            >
              {styleIcons[style.id]}
              <span>{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Count */}
      <p className="text-sm text-gray-500">
        Showing {filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''}
      </p>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
        {filteredThemes.map((theme: NostalgicTheme) => (
          <button
            key={theme.id}
            onClick={() => onSelectTheme(theme.id)}
            className={`p-3 border-2 text-left transition-all ${
              selectedThemeId === theme.id
                ? 'border-retro-red bg-red-50 shadow-retro'
                : 'border-gray-300 hover:border-gray-500 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-heading uppercase text-sm truncate">{theme.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {theme.shortDescription}
                </p>
              </div>
              {/* Color chips */}
              {theme.previewColors && theme.previewColors.length > 0 && (
                <div className="flex gap-0.5 flex-shrink-0">
                  {theme.previewColors.slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-sm border border-black/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 uppercase flex items-center gap-1">
                {theme.era}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 uppercase flex items-center gap-1">
                {styleIcons[theme.style]}
                {theme.style.replace('-', ' ')}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filteredThemes.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No themes match your filters</p>
          <button
            onClick={() => {
              setSelectedEra(null);
              setSelectedStyle(null);
            }}
            className="text-retro-teal underline mt-2"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
