import { useState, useEffect, useCallback } from 'react';
import RetroTachometer from './RetroTachometer';
import ExhaustParticles from './ExhaustParticles';
import { useFakeProgress } from '../../hooks/useFakeProgress';

/**
 * RetroLoadingStage — The ultimate loading experience.
 *
 * Combines the SVG tachometer, exhaust particles, fake progress psychology,
 * and phased story messages into a single drop-in component.
 *
 * The fake progress needle moves on a timer (always feels smooth),
 * and real data arriving before the needle hits 100% creates
 * a "faster than expected" perception.
 */

const DEFAULT_PHASE_MESSAGES: Record<number, string[]> = {
  0: [
    'Opening the garage door...',
    'Flipping the OPEN sign...',
    'Warming up the equipment...',
    'Clocking in for the shift...',
  ],
  1: [
    'Your designer just had their coffee...',
    'Sketching out some ideas...',
    'Picking the perfect colors...',
    'Laying down the base coat...',
  ],
  2: [
    'Adding the finishing touches...',
    'Buffing out the details...',
    'Pinstriping the edges...',
    'Fun fact: The first speeding ticket was in 1896 — at 8 mph.',
    'Mixing the perfect chrome blend...',
  ],
  3: [
    'Running the quality inspection...',
    'One final polish...',
    'Checking under the hood...',
    'Almost there — giving it one more wax...',
  ],
};

interface RetroLoadingStageProps {
  /** Whether loading is active */
  isLoading: boolean;
  /** Estimated wait time in ms (adjusts fake progress curve). Default: 12000 */
  estimatedDuration?: number;
  /** Size of the tachometer */
  size?: 'sm' | 'md' | 'lg';
  /** Show exhaust particles */
  showExhaust?: boolean;
  /** For multi-item operations: completed/total count */
  progress?: { completed: number; total: number };
  /** Custom phase messages override */
  phaseMessages?: Record<number, string[]>;
  /** Callback when the animation has fully completed (reached 100%) */
  onAnimationComplete?: () => void;
}

export default function RetroLoadingStage({
  isLoading,
  estimatedDuration = 12000,
  size = 'md',
  showExhaust = true,
  progress,
  phaseMessages = DEFAULT_PHASE_MESSAGES,
  onAnimationComplete,
}: RetroLoadingStageProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);

  const fakeProgress = useFakeProgress({
    estimatedDuration,
    onPhaseChange: (newPhase) => {
      // Immediately show first message of the new phase
      const msgs = phaseMessages[newPhase] || [];
      if (msgs.length > 0) {
        setCurrentMessage(msgs[0]);
        setMessageKey(prev => prev + 1);
      }
    },
  });

  // Start/stop fake progress when isLoading changes
  useEffect(() => {
    if (isLoading) {
      fakeProgress.start();
      // Set initial message
      const msgs = phaseMessages[0] || [];
      if (msgs.length > 0) {
        setCurrentMessage(msgs[Math.floor(Math.random() * msgs.length)]);
      }
    } else if (!isLoading && fakeProgress.isRunning) {
      fakeProgress.complete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // When real progress completes, trigger the snap to 100%
  useEffect(() => {
    if (progress && progress.completed >= progress.total && progress.total > 0) {
      fakeProgress.complete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.completed, progress?.total]);

  // Fire onAnimationComplete when fake progress reaches 100%
  useEffect(() => {
    if (fakeProgress.isComplete) {
      onAnimationComplete?.();
    }
  }, [fakeProgress.isComplete, onAnimationComplete]);

  // Cycle messages within the current phase every 3 seconds
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      const msgs = phaseMessages[fakeProgress.phase] || [];
      if (msgs.length > 1) {
        setCurrentMessage(prev => {
          const currentIdx = msgs.indexOf(prev);
          const nextIdx = (currentIdx + 1) % msgs.length;
          return msgs[nextIdx];
        });
        setMessageKey(prev => prev + 1);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading, fakeProgress.phase, phaseMessages]);

  // Reset when loading starts fresh
  useEffect(() => {
    if (!isLoading) {
      // Small delay before resetting to allow completion animation to play
      const timer = setTimeout(() => {
        fakeProgress.reset();
      }, 600);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Determine exhaust intensity from phase
  const exhaustIntensity = fakeProgress.phase >= 3 ? 'redline' as const
    : fakeProgress.phase >= 2 ? 'revving' as const
    : 'idle' as const;

  // Don't render after completion animation
  if (!isLoading && fakeProgress.progress === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-4">
      {/* Tachometer with exhaust particles */}
      <div className="relative">
        {showExhaust && (
          <ExhaustParticles
            isActive={isLoading}
            intensity={exhaustIntensity}
          />
        )}
        <RetroTachometer
          progress={fakeProgress.progress}
          size={size}
          glowOnRedline
        />
      </div>

      {/* Real progress count (for multi-item operations) */}
      {progress && (
        <div className="text-center">
          <p className="font-heading text-lg uppercase text-retro-teal tracking-wider">
            {progress.completed} <span className="text-gray-400">/</span> {progress.total}
          </p>
        </div>
      )}

      {/* Phased story message with crossfade */}
      <div className="h-6 flex items-center justify-center overflow-hidden">
        <p
          key={messageKey}
          className="font-heading text-sm uppercase text-gray-500 text-center animate-fade-crossfade max-w-xs"
        >
          {currentMessage}
        </p>
      </div>
    </div>
  );
}
