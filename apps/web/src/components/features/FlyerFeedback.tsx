import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { promoFlyerApi } from '../../services/api';
import { Flame, ThumbsUp, Meh } from 'lucide-react';

interface FlyerFeedbackProps {
  contentId: string;
}

type Rating = 'fire' | 'solid' | 'meh';

const FEEDBACK_OPTIONS: { rating: Rating; icon: typeof Flame; label: string; activeColor: string; activeBg: string }[] = [
  {
    rating: 'fire',
    icon: Flame,
    label: 'Fire',
    activeColor: 'text-orange-500',
    activeBg: 'bg-orange-50 border-orange-400',
  },
  {
    rating: 'solid',
    icon: ThumbsUp,
    label: 'Solid',
    activeColor: 'text-blue-500',
    activeBg: 'bg-blue-50 border-blue-400',
  },
  {
    rating: 'meh',
    icon: Meh,
    label: 'Meh',
    activeColor: 'text-gray-400',
    activeBg: 'bg-gray-50 border-gray-400',
  },
];

export default function FlyerFeedback({ contentId }: FlyerFeedbackProps) {
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const feedbackMutation = useMutation({
    mutationFn: (rating: Rating) => promoFlyerApi.submitFeedback(contentId, rating),
    onSuccess: () => {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 2000);
    },
  });

  const handleFeedback = (rating: Rating) => {
    setSelectedRating(rating);
    feedbackMutation.mutate(rating);
  };

  if (confirmed) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-sm text-retro-teal animate-fade-in">
        <span>Got it! We'll learn from this.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 text-center uppercase font-heading tracking-wider">
        Rate this flyer
      </p>
      <div className="flex gap-2">
        {FEEDBACK_OPTIONS.map(({ rating, icon: Icon, label, activeColor, activeBg }) => {
          const isSelected = selectedRating === rating;
          return (
            <button
              key={rating}
              onClick={() => handleFeedback(rating)}
              disabled={feedbackMutation.isPending}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2.5 border-2
                transition-all duration-200 text-sm font-heading uppercase
                ${isSelected
                  ? `${activeBg} ${activeColor} scale-105`
                  : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
