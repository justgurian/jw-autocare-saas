import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promoFlyerApi } from '../../services/api';
import { Sparkles, X, Zap } from 'lucide-react';

interface WeeklyThemeDropProps {
  onTryStyle?: (familyId: string) => void;
}

export default function WeeklyThemeDrop({ onTryStyle }: WeeklyThemeDropProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['weekly-drop'],
    queryFn: () => promoFlyerApi.getWeeklyDrop().then(res => res.data),
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  const dismissMutation = useMutation({
    mutationFn: () => promoFlyerApi.dismissWeeklyDrop(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-drop'] });
    },
  });

  if (isLoading || !data || data.dismissed) return null;

  const { family } = data;

  return (
    <div className="relative bg-gradient-to-r from-retro-navy to-retro-navy/90 text-white border-2 border-black shadow-retro overflow-hidden">
      {/* Dismiss button */}
      <button
        onClick={() => dismissMutation.mutate()}
        className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors z-10"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-4 p-4">
        {/* Emoji + sparkle */}
        <div className="text-4xl flex-shrink-0 relative">
          {family.emoji}
          <Sparkles size={14} className="absolute -top-1 -right-1 text-retro-mustard" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-retro-mustard font-heading flex items-center gap-1">
            <Zap size={12} />
            This Week's Featured Style
          </p>
          <p className="font-heading text-lg uppercase mt-0.5 truncate">
            {family.name}
          </p>
          <p className="text-sm text-gray-300 line-clamp-1">
            {family.description}
          </p>
        </div>

        {/* Try It button */}
        {onTryStyle && (
          <button
            onClick={() => onTryStyle(family.id)}
            className="flex-shrink-0 bg-retro-mustard text-black px-4 py-2 font-heading text-sm uppercase border-2 border-black shadow-retro-sm hover:shadow-none transition-all"
          >
            Try It
          </button>
        )}
      </div>
    </div>
  );
}
