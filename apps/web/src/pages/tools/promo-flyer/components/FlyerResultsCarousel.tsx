import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FlyerResultCard from './FlyerResultCard';
import type { GenerationSlot } from './FlyerResultCard';

interface FlyerResultsCarouselProps {
  slots: GenerationSlot[];
  onEdit: (slot: GenerationSlot) => void;
  onAnimate: (slot: GenerationSlot) => void;
  onShare: (slot: GenerationSlot) => void;
  onDownload: (slot: GenerationSlot) => void;
}

export default function FlyerResultsCarousel({
  slots, onEdit, onAnimate, onShare, onDownload,
}: FlyerResultsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [isEntering, setIsEntering] = useState(false);

  if (slots.length === 0) return null;

  const clampedIndex = Math.min(currentIndex, slots.length - 1);
  const currentSlot = slots[clampedIndex];

  const doneCount = slots.filter(s => s.status === 'done').length;
  const loadingCount = slots.filter(s => s.status === 'loading' || s.status === 'pending').length;

  // Auto-advance to newest completed slot if current is still loading
  const navigateTo = (newIndex: number) => {
    const direction = newIndex > clampedIndex ? 'left' : 'right';
    setSwipeDir(direction);
    setTimeout(() => {
      setSwipeDir(null);
      setCurrentIndex(newIndex);
      setIsEntering(true);
      setTimeout(() => setIsEntering(false), 300);
    }, 200);
  };

  const goNext = () => {
    if (clampedIndex < slots.length - 1) navigateTo(clampedIndex + 1);
  };
  const goPrev = () => {
    if (clampedIndex > 0) navigateTo(clampedIndex - 1);
  };

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg uppercase">Results</h2>
        <div className="flex items-center gap-2 text-sm">
          {loadingCount > 0 && (
            <span className="text-gray-500">
              {doneCount}/{slots.length} ready
            </span>
          )}
          {loadingCount === 0 && doneCount > 0 && (
            <span className="text-retro-teal font-heading uppercase text-xs">All done</span>
          )}
        </div>
      </div>

      {/* Card area with swipe */}
      <div className="relative">
        {/* Nav arrows */}
        {slots.length > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={clampedIndex === 0}
              className="absolute left-0 top-1/3 -translate-x-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 shadow-retro disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              disabled={clampedIndex >= slots.length - 1}
              className="absolute right-0 top-1/3 translate-x-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 shadow-retro disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Card with animation */}
        <div className="px-6">
          <div
            className={`transition-transform duration-200
              ${swipeDir === 'left' ? '-translate-x-full opacity-0' : ''}
              ${swipeDir === 'right' ? 'translate-x-full opacity-0' : ''}
              ${isEntering ? 'animate-card-enter' : ''}
            `}
          >
            <FlyerResultCard
              slot={currentSlot}
              onEdit={() => onEdit(currentSlot)}
              onAnimate={() => onAnimate(currentSlot)}
              onShare={() => onShare(currentSlot)}
              onDownload={() => onDownload(currentSlot)}
            />
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {slots.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {slots.map((slot, i) => (
            <button
              key={slot.id}
              onClick={() => navigateTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === clampedIndex
                  ? 'bg-retro-red scale-125'
                  : slot.status === 'done'
                  ? 'bg-retro-teal'
                  : slot.status === 'error'
                  ? 'bg-red-300'
                  : 'bg-gray-300 animate-pulse'
              }`}
              title={`${slot.themeName} — ${slot.status}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {slots.length > 1 && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          {clampedIndex + 1} of {slots.length}
        </p>
      )}
    </div>
  );
}
