import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { promoFlyerApi } from '../../../../services/api';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RandomizeToggle from './RandomizeToggle';

interface Family {
  id: string;
  name: string;
  description: string;
  emoji: string;
  themeIds: string[];
}

interface Theme {
  id: string;
  name: string;
  shortDescription?: string;
  previewColors?: string[];
}

interface StyleSectionProps {
  themeId: string | null;
  onThemeChange: (themeId: string | null) => void;
  familyId: string | null;
  onFamilyChange: (familyId: string | null) => void;
  randomize: boolean;
  onRandomizeToggle: () => void;
  subjectType: string;
  onSubjectTypeChange: (type: string) => void;
}

const SUBJECT_OPTIONS = [
  { id: 'auto', label: 'Auto-pick', icon: '\u{2728}' },
  { id: 'hero-car', label: 'Hero Car', icon: '\u{1F697}' },
  { id: 'mechanic', label: 'Mechanic', icon: '\u{1F527}' },
  { id: 'detail-shot', label: 'Detail', icon: '\u{1F4F8}' },
  { id: 'shop-exterior', label: 'Shop', icon: '\u{1F3EA}' },
  { id: 'text-only', label: 'Text Only', icon: '\u{270F}\u{FE0F}' },
];

export default function StyleSection({
  themeId, onThemeChange,
  familyId, onFamilyChange,
  randomize, onRandomizeToggle,
  subjectType, onSubjectTypeChange,
}: StyleSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const { data: familiesData } = useQuery({
    queryKey: ['style-families'],
    queryFn: () => promoFlyerApi.getFamilies().then(r => r.data),
  });

  const { data: themesData } = useQuery({
    queryKey: ['promo-flyer-themes'],
    queryFn: () => promoFlyerApi.getThemes().then(r => r.data),
  });

  const families: Family[] = familiesData?.families || [];
  const allThemes: Theme[] = [
    ...(themesData?.brandStyles || []),
    ...(themesData?.nostalgicThemes || []),
  ];

  const selectedFamily = families.find(f => f.id === familyId);
  const themesInFamily = selectedFamily
    ? allThemes.filter(t => selectedFamily.themeIds.includes(t.id))
    : [];

  const handleFamilySelect = (fid: string | null) => {
    onFamilyChange(fid);
    onThemeChange(null);
    // Selecting a family should disable randomize; deselecting can re-enable
    if (fid !== null && randomize) onRandomizeToggle();
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {/* Collapse Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-heading text-sm uppercase">Style</span>
          {randomize && (
            <span className="text-xs px-2 py-0.5 bg-retro-red/10 text-retro-red border border-retro-red/30">
              Random
            </span>
          )}
          {!randomize && themeId && (
            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
              {allThemes.find(t => t.id === themeId)?.name || themeId}
            </span>
          )}
          {!randomize && !themeId && familyId && (
            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
              {selectedFamily?.emoji} {selectedFamily?.name}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="p-3 pt-0 space-y-4">
          {/* Randomize toggle */}
          <div className="flex items-center gap-3">
            <RandomizeToggle active={randomize} onToggle={onRandomizeToggle} label="Random theme" />
            <span className="text-xs text-gray-500">
              {randomize ? 'AI picks the best style for your content' : 'Pick a specific style'}
            </span>
          </div>

          {!randomize && (
            <>
              {/* Family pills */}
              <div className="flex flex-wrap gap-1.5">
                {families.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFamilySelect(f.id === familyId ? null : f.id)}
                    className={`flex items-center gap-1 py-1.5 px-2.5 border-2 text-xs transition-all ${
                      familyId === f.id
                        ? 'border-retro-red bg-red-50 text-retro-red'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <span>{f.emoji}</span>
                    <span className="font-heading uppercase">{f.name}</span>
                  </button>
                ))}
              </div>

              {/* Themes in selected family */}
              {selectedFamily && themesInFamily.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto">
                  {themesInFamily.map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onThemeChange(theme.id === themeId ? null : theme.id)}
                      className={`p-2 border-2 text-left transition-all ${
                        themeId === theme.id
                          ? 'border-retro-red bg-red-50'
                          : 'border-gray-300 bg-white hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-heading uppercase text-xs truncate">{theme.name}</p>
                          {theme.shortDescription && (
                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{theme.shortDescription}</p>
                          )}
                        </div>
                        {theme.previewColors && theme.previewColors.length > 0 && (
                          <div className="flex gap-0.5 flex-shrink-0">
                            {theme.previewColors.slice(0, 3).map((color, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 rounded-sm border border-black/20"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Subject Type */}
          <div>
            <label className="block font-heading uppercase text-xs text-gray-500 mb-1.5">Subject Focus</label>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSubjectTypeChange(opt.id)}
                  className={`flex items-center gap-1 py-1.5 px-2.5 border-2 text-xs transition-all ${
                    subjectType === opt.id
                      ? 'border-retro-red bg-red-50 text-retro-red'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="font-heading uppercase">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
