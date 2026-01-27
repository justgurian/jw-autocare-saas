import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Fun automotive-themed loading messages
const LOADING_MESSAGES = [
  "Revving up the creativity...",
  "Checking the oil on your content...",
  "Tuning the marketing engine...",
  "Polishing the chrome...",
  "Consulting the meme gods...",
  "Adding that retro zing...",
  "Cranking the creative carburetor...",
  "Warming up the design cylinders...",
  "Fueling your social media rocket...",
  "Installing the fun filter...",
  "Calibrating the awesome-ometer...",
  "Channeling 1970s energy...",
  "Teaching AI about transmissions...",
  "Waxing the pixel finish...",
  "Supercharging your marketing...",
  "Fine-tuning the visual V8...",
  "Engaging the creativity clutch...",
  "Loading premium content...",
  "Firing up the design engine...",
  "Painting the digital pinstripes...",
];

interface FunLoadingMessagesProps {
  isLoading: boolean;
  className?: string;
  spinnerSize?: number;
}

export default function FunLoadingMessages({
  isLoading,
  className = '',
  spinnerSize = 24,
}: FunLoadingMessagesProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      // Reset to random message when starting new load
      setMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
      return;
    }

    // Cycle through messages every 2 seconds
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <Loader2 size={spinnerSize} className="animate-spin text-retro-red" />
      <p className="font-heading text-sm uppercase text-gray-600 text-center animate-pulse">
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}

// Export messages for use in other contexts (like toast)
export { LOADING_MESSAGES };

// Helper to get a random loading message
export function getRandomLoadingMessage(): string {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}
