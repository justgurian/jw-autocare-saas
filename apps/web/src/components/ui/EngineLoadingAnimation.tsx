import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const LOADING_MESSAGES = [
  "Revving up the creativity...",
  "Checking the oil on your content...",
  "Tuning the marketing engine...",
  "Polishing the chrome...",
  "Cranking the creative carburetor...",
  "Warming up the design cylinders...",
  "Fueling your social media rocket...",
  "Supercharging your marketing...",
  "Fine-tuning the visual V8...",
  "Engaging the creativity clutch...",
  "Firing up the design engine...",
  "Painting the digital pinstripes...",
];

interface EngineLoadingAnimationProps {
  progress?: { completed: number; total: number };
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function EngineLoadingAnimation({
  progress,
  message,
  size = 'md',
}: EngineLoadingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(
    Math.floor(Math.random() * LOADING_MESSAGES.length)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const dimensions = size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-44 h-44' : 'w-32 h-32';
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 56 : 40;
  const progressPct = progress ? Math.round((progress.completed / progress.total) * 100) : null;

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-5">
      {/* Engine housing */}
      <div className="relative">
        <div className={`${dimensions} rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border-8 border-gray-700 shadow-[0_0_0_6px_#1f2937,0_0_40px_rgba(239,68,68,0.4)]`}>
          {/* Animated pulse rings */}
          <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20" />
          <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-pulse opacity-50" />

          {/* Inner glow */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-b from-red-700 to-red-900 border-4 border-red-600 flex items-center justify-center">
            <Loader2 size={iconSize} className="text-red-300 animate-spin drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
          </div>
        </div>

        {/* Progress ring overlay */}
        {progressPct !== null && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="46" fill="none"
              stroke="#14b8a6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progressPct * 2.89} 289`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
        )}
      </div>

      {/* Progress text */}
      {progress && (
        <div className="text-center">
          <p className="font-heading text-lg uppercase text-retro-teal">
            {progress.completed} / {progress.total}
          </p>
          <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-retro-teal to-retro-red rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Message */}
      <p className="font-heading text-sm uppercase text-gray-500 text-center animate-pulse max-w-xs">
        {message || LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
