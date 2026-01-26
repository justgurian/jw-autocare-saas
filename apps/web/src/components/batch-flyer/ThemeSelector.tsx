import { useState } from 'react';
import { Sparkles, Palette, Grid, Globe, Shuffle } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  category: string;
  shortDescription?: string;
  previewColors?: string[];
  era?: string;
  style?: string;
}

interface ThemeSelectorProps {
  strategy: 'auto' | 'single' | 'matrix';
  onStrategyChange: (strategy: 'auto' | 'single' | 'matrix') => void;
  singleThemeId: string;
  onSingleThemeChange: (themeId: string) => void;
  language: 'en' | 'es' | 'both';
  onLanguageChange: (language: 'en' | 'es' | 'both') => void;
  themes: Theme[];
}

export default function ThemeSelector({
  strategy,
  onStrategyChange,
  singleThemeId,
  onSingleThemeChange,
  language,
  onLanguageChange,
  themes,
}: ThemeSelectorProps) {
  const [filterEra, setFilterEra] = useState<string | null>(null);
  const [filterStyle, setFilterStyle] = useState<string | null>(null);

  const strategies = [
    {
      id: 'auto' as const,
      name: 'AI Picks',
      description: 'Let AI choose the best theme variety',
      icon: Sparkles,
      recommended: true,
    },
    {
      id: 'single' as const,
      name: 'Single Theme',
      description: 'Use one theme for all flyers',
      icon: Palette,
    },
    {
      id: 'matrix' as const,
      name: 'Custom Mix',
      description: 'Advanced: Assign themes yourself',
      icon: Grid,
      disabled: true,
    },
  ];

  const filteredThemes = themes.filter(t => {
    if (filterEra && t.era !== filterEra) return false;
    if (filterStyle && t.style !== filterStyle) return false;
    return true;
  });

  const eras = ['1950s', '1960s', '1970s', '1980s'];
  const styles = ['comic-book', 'movie-poster', 'magazine'];

  const selectRandomTheme = () => {
    if (filteredThemes.length > 0) {
      const randomTheme = filteredThemes[Math.floor(Math.random() * filteredThemes.length)];
      onSingleThemeChange(randomTheme.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg uppercase mb-4">Choose Your Style Strategy</h2>
        <p className="text-gray-600 text-sm mb-6">
          How should we select themes for your flyers?
        </p>
      </div>

      {/* Strategy Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map((s) => {
          const Icon = s.icon;
          const isSelected = strategy === s.id;

          return (
            <button
              key={s.id}
              onClick={() => !s.disabled && onStrategyChange(s.id)}
              disabled={s.disabled}
              className={`p-4 border-2 text-left transition-all relative ${
                isSelected
                  ? 'border-retro-red bg-red-50 shadow-retro'
                  : s.disabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
            >
              {s.recommended && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-retro-teal text-white text-xs font-heading uppercase">
                  Recommended
                </span>
              )}
              <Icon size={24} className={isSelected ? 'text-retro-red' : 'text-gray-400'} />
              <h3 className="font-heading text-sm uppercase mt-2">{s.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{s.description}</p>
              {s.disabled && (
                <span className="text-xs text-gray-400 mt-2 block">Coming soon</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Single Theme Selection */}
      {strategy === 'single' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm uppercase">Select a Theme</h3>
            <button
              onClick={selectRandomTheme}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-retro-red to-retro-teal text-white text-sm font-heading uppercase border-2 border-black shadow-retro hover:shadow-none transition-all"
            >
              <Shuffle size={16} />
              Surprise Me!
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Era:</span>
              <button
                onClick={() => setFilterEra(null)}
                className={`px-2 py-1 text-xs border ${
                  filterEra === null ? 'border-black bg-black text-white' : 'border-gray-300'
                }`}
              >
                All
              </button>
              {eras.map(era => (
                <button
                  key={era}
                  onClick={() => setFilterEra(filterEra === era ? null : era)}
                  className={`px-2 py-1 text-xs border ${
                    filterEra === era ? 'border-black bg-black text-white' : 'border-gray-300'
                  }`}
                >
                  {era}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Style:</span>
              <button
                onClick={() => setFilterStyle(null)}
                className={`px-2 py-1 text-xs border ${
                  filterStyle === null ? 'border-black bg-black text-white' : 'border-gray-300'
                }`}
              >
                All
              </button>
              {styles.map(style => (
                <button
                  key={style}
                  onClick={() => setFilterStyle(filterStyle === style ? null : style)}
                  className={`px-2 py-1 text-xs border ${
                    filterStyle === style ? 'border-black bg-black text-white' : 'border-gray-300'
                  }`}
                >
                  {style.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-2">
            {filteredThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onSingleThemeChange(theme.id)}
                className={`p-3 border-2 text-left transition-all ${
                  singleThemeId === theme.id
                    ? 'border-retro-red bg-red-50 shadow-retro'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
              >
                {/* Color Preview */}
                {theme.previewColors && (
                  <div className="flex gap-0.5 mb-2">
                    {theme.previewColors.slice(0, 4).map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-sm border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
                <p className="font-heading text-xs truncate">{theme.name}</p>
                <div className="flex gap-1 mt-1">
                  {theme.era && (
                    <span className="text-[10px] px-1 bg-gray-100 text-gray-600">{theme.era}</span>
                  )}
                  {theme.style && (
                    <span className="text-[10px] px-1 bg-gray-100 text-gray-600">
                      {theme.style.replace('-', ' ')}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {filteredThemes.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No themes match your filters</p>
              <button
                onClick={() => {
                  setFilterEra(null);
                  setFilterStyle(null);
                }}
                className="text-retro-teal underline mt-2 text-sm"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Auto Strategy Info */}
      {strategy === 'auto' && (
        <div className="bg-retro-cream border-2 border-dashed border-retro-navy/30 p-6 text-center">
          <Sparkles size={32} className="mx-auto mb-3 text-retro-teal" />
          <h3 className="font-heading text-lg uppercase mb-2">AI Will Pick the Best Themes</h3>
          <p className="text-sm text-gray-600">
            Each flyer will get a unique theme from our collection of 48 nostalgic styles.
            AI ensures variety while matching your content.
          </p>
        </div>
      )}

      {/* Language Toggle */}
      <div className="border-t-2 border-gray-200 pt-6">
        <h3 className="font-heading text-sm uppercase mb-4 flex items-center gap-2">
          <Globe size={16} />
          Caption Language
        </h3>
        <div className="flex gap-2">
          {[
            { id: 'en' as const, label: 'English' },
            { id: 'es' as const, label: 'Spanish' },
            { id: 'both' as const, label: 'Both' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => onLanguageChange(lang.id)}
              className={`flex-1 py-3 border-2 font-heading uppercase text-sm transition-all ${
                language === lang.id
                  ? 'border-retro-teal bg-teal-50 text-retro-teal'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {language === 'both'
            ? 'Generate captions in both English and Spanish'
            : `Generate caption in ${language === 'en' ? 'English' : 'Spanish'}`}
        </p>
      </div>
    </div>
  );
}
