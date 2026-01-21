import { useState, useEffect, useRef } from 'react';
import { Trophy, Ticket, Sparkles, ChevronRight } from 'lucide-react';

interface Prize {
  id: string;
  label: string;
  probability: number;
  description?: string;
}

interface SpinResult {
  prize: Prize;
  validationCode: string;
  submissionId: string;
}

interface Step3Props {
  prizes: Prize[];
  onSpin: () => Promise<SpinResult>;
  onComplete: () => void;
  spinResult: SpinResult | null;
  isLoading: boolean;
}

export default function Step3_Winner({
  prizes,
  onSpin,
  onComplete,
  spinResult,
  isLoading,
}: Step3Props) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinFinished, setSpinFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedPrize, setDisplayedPrize] = useState<Prize | null>(null);
  const timerRef = useRef<number | null>(null);

  // Use prizes or fallback
  const activePrizes = prizes.length > 0 ? prizes : [
    { id: 'default', label: 'Mystery Prize', probability: 1 },
  ];

  const startSpin = async () => {
    if (isSpinning || spinResult) return;

    setIsSpinning(true);
    setSpinFinished(false);

    // Start the spin animation
    let speed = 50;
    let count = 0;
    const maxCount = 40 + Math.floor(Math.random() * 15);

    // Call API to get actual result
    let result: SpinResult;
    try {
      result = await onSpin();
    } catch {
      setIsSpinning(false);
      return;
    }

    const tick = () => {
      setCurrentIndex((prev) => (prev + 1) % activePrizes.length);
      count++;

      if (count < maxCount) {
        speed *= 1.05; // Slow down
        timerRef.current = window.setTimeout(tick, speed);
      } else {
        // Show the actual winning prize
        setDisplayedPrize(result.prize);
        setSpinFinished(true);
        setIsSpinning(false);
      }
    };

    tick();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // If we already have a spin result, show it
  useEffect(() => {
    if (spinResult && !spinFinished) {
      setDisplayedPrize(spinResult.prize);
      setSpinFinished(true);
    }
  }, [spinResult, spinFinished]);

  const currentPrize = displayedPrize || activePrizes[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
      <h2 className="text-4xl font-heading text-gray-800 leading-none">
        WINNER WINNER...
      </h2>

      {/* Prize Display */}
      <div className="relative w-full max-w-sm">
        {/* Slot machine frame */}
        <div className="relative h-48 bg-gray-800 border-8 border-retro-red rounded-xl shadow-2xl overflow-hidden flex items-center justify-center p-4">
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />

          {/* Prize text */}
          <div className="text-white flex flex-col items-center justify-center z-20">
            <span className="text-[10px] font-heading tracking-[0.5em] text-retro-mustard mb-2 uppercase">
              PRIZE SELECTOR
            </span>
            <div
              className={`text-4xl font-heading uppercase tracking-tight text-center px-4 leading-tight drop-shadow-lg ${
                isSpinning ? 'animate-pulse' : ''
              }`}
            >
              {currentPrize.label}
            </div>
          </div>

          {/* Side decorations */}
          <div className="absolute top-0 bottom-0 left-4 w-2 bg-retro-red/30" />
          <div className="absolute top-0 bottom-0 right-4 w-2 bg-retro-red/30" />

          {/* Spinning blur effect */}
          {isSpinning && (
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] animate-pulse pointer-events-none z-30" />
          )}
        </div>

        {/* Arrow pointer */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-[16px] border-t-transparent border-b-transparent border-l-retro-mustard" />
      </div>

      {/* Spin Button */}
      {!spinFinished && !isSpinning && (
        <button
          onClick={startSpin}
          disabled={isLoading}
          className="bg-retro-red text-white py-6 px-12 rounded-full font-heading text-3xl shadow-[0_10px_0_0_#911a1a] hover:shadow-[0_5px_0_0_#911a1a] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all flex items-center gap-4 group disabled:opacity-50"
        >
          <Trophy className="group-hover:rotate-12 transition-transform" />
          SPIN TO WIN!
        </button>
      )}

      {/* Spinning State */}
      {isSpinning && (
        <div className="flex items-center gap-3 text-xl font-heading text-gray-600">
          <div className="animate-spin h-6 w-6 border-4 border-retro-red border-t-transparent rounded-full" />
          Spinning...
        </div>
      )}

      {/* Winner Display */}
      {spinFinished && displayedPrize && (
        <div className="animate-bounce-in space-y-4">
          <div className="flex items-center justify-center gap-2 text-3xl font-heading text-green-600">
            <Sparkles className="animate-pulse" />
            YOU WON!
            <Sparkles className="animate-pulse" />
          </div>

          <div className="bg-white border-4 border-dashed border-green-500 p-6 rounded-lg rotate-2 shadow-xl">
            <Ticket size={48} className="mx-auto text-green-500 mb-2" />
            <h3 className="text-4xl font-heading uppercase text-gray-800">
              {displayedPrize.label}
            </h3>
            {displayedPrize.description && (
              <p className="text-gray-600 mt-2">{displayedPrize.description}</p>
            )}
            <p className="font-heading text-gray-500 tracking-wider mt-2">
              REDEEMABLE AT JW AUTO CARE
            </p>
          </div>

          <p className="text-gray-600 font-heading text-xl">
            Let's print your Limited Edition Action Figure with your prize included!
          </p>

          <button
            onClick={onComplete}
            className="btn-retro-primary py-4 px-8 flex items-center gap-2 mx-auto text-xl"
          >
            Create My Action Figure
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Prizes List (collapsed) */}
      {!spinFinished && (
        <details className="w-full max-w-sm text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            View possible prizes
          </summary>
          <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-1">
            {activePrizes.map((prize) => (
              <div
                key={prize.id}
                className="flex justify-between text-sm text-gray-600"
              >
                <span>{prize.label}</span>
                {prize.description && (
                  <span className="text-gray-400 text-xs truncate ml-2">
                    {prize.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
}
