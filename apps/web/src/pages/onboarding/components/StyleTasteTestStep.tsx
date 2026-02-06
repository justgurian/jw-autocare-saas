import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { promoFlyerApi } from '../../../services/api';
import { CheckCircle, Loader2 } from 'lucide-react';

interface StyleFamily {
  id: string;
  name: string;
  description: string;
  emoji: string;
  previewImage: string;
  themeCount: number;
  tags: string[];
}

interface StyleTasteTestStepProps {
  selectedFamilies: string[];
  onChange: (families: string[]) => void;
}

export default function StyleTasteTestStep({ selectedFamilies, onChange }: StyleTasteTestStepProps) {
  const [animatedIn, setAnimatedIn] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['style-families'],
    queryFn: () => promoFlyerApi.getFamilies().then(res => res.data),
  });

  const families: StyleFamily[] = data?.families || [];

  // Staggered animation on mount
  useEffect(() => {
    families.forEach((_, index) => {
      setTimeout(() => {
        setAnimatedIn(prev => new Set(prev).add(index));
      }, index * 80);
    });
  }, [families.length]);

  const toggleFamily = (familyId: string) => {
    if (selectedFamilies.includes(familyId)) {
      onChange(selectedFamilies.filter(id => id !== familyId));
    } else if (selectedFamilies.length < 3) {
      onChange([...selectedFamilies, familyId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-retro-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Pick <strong>1-3 styles</strong> you love. We'll use these to generate flyers that match your vibe.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          You can always change these later in settings.
        </p>
      </div>

      {/* Selection count indicator */}
      <div className="flex justify-center gap-2 mb-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
              i < selectedFamilies.length
                ? 'bg-retro-teal border-retro-teal scale-110'
                : 'bg-white border-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Family Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {families.map((family, index) => {
          const isSelected = selectedFamilies.includes(family.id);
          const isDisabled = !isSelected && selectedFamilies.length >= 3;
          const isVisible = animatedIn.has(index);

          return (
            <button
              key={family.id}
              onClick={() => !isDisabled && toggleFamily(family.id)}
              disabled={isDisabled}
              className={`
                relative p-4 border-2 text-left transition-all duration-200
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                ${isSelected
                  ? 'border-retro-teal bg-retro-teal/10 shadow-[3px_3px_0_0_#2DD4BF]'
                  : isDisabled
                    ? 'border-gray-200 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-400 hover:shadow-retro cursor-pointer'
                }
              `}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle size={20} className="text-retro-teal" />
                </div>
              )}

              {/* Emoji */}
              <div className="text-3xl mb-2">{family.emoji}</div>

              {/* Name */}
              <p className="font-heading text-sm uppercase leading-tight">
                {family.name}
              </p>

              {/* Description */}
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {family.description}
              </p>

              {/* Theme count */}
              <p className="text-xs text-gray-400 mt-2">
                {family.themeCount} themes
              </p>
            </button>
          );
        })}
      </div>

      {selectedFamilies.length === 0 && (
        <p className="text-center text-sm text-gray-400 mt-4">
          Tap a style to select it
        </p>
      )}
    </div>
  );
}
