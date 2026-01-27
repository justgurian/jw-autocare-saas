import { useEffect, useState } from 'react';
import { Share2, Download, X, Sparkles } from 'lucide-react';
import Confetti from './Confetti';

interface FirstFlyerCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  flyerTitle?: string;
}

// Local storage key for tracking first flyer
const FIRST_FLYER_KEY = 'bayfiller_first_flyer_celebrated';

export function hasSeenFirstFlyerCelebration(): boolean {
  return localStorage.getItem(FIRST_FLYER_KEY) === 'true';
}

export function markFirstFlyerCelebrationSeen(): void {
  localStorage.setItem(FIRST_FLYER_KEY, 'true');
}

export default function FirstFlyerCelebration({
  isOpen,
  onClose,
  onShare,
  onDownload,
  flyerTitle,
}: FirstFlyerCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      markFirstFlyerCelebrationSeen();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <Confetti isActive={showConfetti} duration={4000} />

      <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60">
        <div className="relative bg-white border-4 border-black shadow-retro-lg max-w-md w-full animate-bounce-in">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Celebration icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-retro-mustard to-yellow-400 border-4 border-black flex items-center justify-center animate-pulse">
              <Sparkles size={40} className="text-retro-navy" />
            </div>

            <h2 className="font-display text-3xl text-retro-navy tracking-wide mb-2">
              YOUR FIRST MASTERPIECE!
            </h2>

            <p className="font-script text-xl text-retro-red mb-4">
              You did it!
            </p>

            {flyerTitle && (
              <p className="text-gray-600 mb-6">
                "{flyerTitle}" is ready to share with the world
              </p>
            )}

            <p className="text-gray-500 text-sm mb-6">
              This is just the beginning. Keep creating amazing content
              and watch your customer engagement soar!
            </p>

            {/* Action buttons */}
            <div className="space-y-3">
              {onShare && (
                <button
                  onClick={() => {
                    onShare();
                    onClose();
                  }}
                  className="w-full btn-retro-primary flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share This Flyer!
                </button>
              )}

              {onDownload && (
                <button
                  onClick={() => {
                    onDownload();
                  }}
                  className="w-full btn-retro-secondary flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full btn-retro-outline text-sm"
              >
                Keep Creating
              </button>
            </div>
          </div>

          {/* Fun stats at bottom */}
          <div className="bg-retro-navy text-white p-4">
            <p className="text-center text-sm font-heading uppercase">
              Milestone Unlocked: First Flyer Created!
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
}
