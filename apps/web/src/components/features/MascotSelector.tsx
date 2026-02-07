import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { mascotBuilderApi } from '../../services/api';

interface MascotSelectorProps {
  onSelect: (mascotId: string | null) => void;
  selectedMascotId: string | null;
}

interface Mascot {
  id: string;
  name: string;
  imageUrl: string;
  personality?: {
    presetId: string;
    catchphrase: string;
    energyLevel: string;
  };
}

const PERSONALITY_ICONS: Record<string, string> = {
  'hype-man': '🔥',
  'trusted-expert': '🔧',
  'funny-friend': '😂',
  'neighborhood-buddy': '🏘️',
  'drill-sergeant': '🫡',
};

export default function MascotSelector({ onSelect, selectedMascotId }: MascotSelectorProps) {
  const { data: mascotsData, isLoading } = useQuery({
    queryKey: ['mascots'],
    queryFn: () => mascotBuilderApi.getMascots().then(r => r.data),
  });

  const mascots: Mascot[] = mascotsData?.data || [];

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 font-heading uppercase">Loading mascots...</div>
    );
  }

  if (mascots.length === 0) {
    return (
      <div className="flex gap-3">
        <p className="text-sm text-gray-500 font-heading uppercase">
          No mascots yet --
        </p>
        <Link
          to="/tools/mascot-builder"
          className="flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 hover:border-retro-red hover:bg-red-50 transition-all"
        >
          <Plus size={20} className="text-gray-400" />
          <span className="text-xs text-gray-500 mt-1">Create</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {/* None option */}
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center rounded border-2 transition-all ${
          selectedMascotId === null
            ? 'border-retro-red bg-red-50 border-4'
            : 'border-gray-300 hover:border-gray-500'
        }`}
      >
        <span className="text-2xl text-gray-400">X</span>
        <span className="font-heading text-xs uppercase mt-1">No Mascot</span>
      </button>

      {/* Mascot thumbnails */}
      {mascots.map((mascot) => (
        <button
          key={mascot.id}
          onClick={() => onSelect(mascot.id)}
          className={`flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center rounded border-2 transition-all ${
            selectedMascotId === mascot.id
              ? 'border-retro-red bg-red-50 border-4'
              : 'border-gray-300 hover:border-gray-500'
          }`}
        >
          <img
            src={mascot.imageUrl}
            alt={mascot.name}
            className="w-12 h-12 object-cover rounded"
          />
          <span className="font-heading text-xs uppercase mt-1 truncate w-full text-center px-1">
            {mascot.name}
          </span>
          {mascot.personality?.presetId && PERSONALITY_ICONS[mascot.personality.presetId] && (
            <span className="text-xs">{PERSONALITY_ICONS[mascot.personality.presetId]}</span>
          )}
        </button>
      ))}

      {/* Create New + */}
      <Link
        to="/tools/mascot-builder"
        className="flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 hover:border-retro-red hover:bg-red-50 transition-all"
      >
        <Plus size={20} className="text-gray-400" />
        <span className="text-xs text-gray-500 mt-1">Create</span>
      </Link>
    </div>
  );
}
