import { Shuffle } from 'lucide-react';

interface RandomizeToggleProps {
  active: boolean;
  onToggle: () => void;
  label?: string;
}

export default function RandomizeToggle({ active, onToggle, label }: RandomizeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={label || 'Randomize'}
      className={`p-1.5 border-2 transition-all ${
        active
          ? 'border-retro-red bg-retro-red text-white'
          : 'border-gray-300 bg-white text-gray-400 hover:border-gray-500 hover:text-gray-600'
      }`}
    >
      <Shuffle size={16} />
    </button>
  );
}
