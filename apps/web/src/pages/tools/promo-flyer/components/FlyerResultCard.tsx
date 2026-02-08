import { Download, Share2, Wand2, Film, Loader2, AlertCircle } from 'lucide-react';
import RetroLoadingStage from '../../../../components/garage/RetroLoadingStage';

export interface GeneratedFlyer {
  id: string;
  imageUrl: string;
  caption: string;
  captionSpanish?: string | null;
  title: string;
  theme: string;
  themeName: string;
  vehicle?: { id: string; name: string };
}

export interface GenerationSlot {
  id: string;
  status: 'pending' | 'loading' | 'done' | 'error';
  flyer: GeneratedFlyer | null;
  error: string | null;
  themeId: string;
  themeName: string;
}

const LOADING_MESSAGES: Record<number, string[]> = {
  0: ['Warming up the engine...', 'Turning the ignition...'],
  1: ['Your AI designer is sketching...', 'Mixing the paint...'],
  2: ['Adding the finishing touches...', 'Almost there...'],
  3: ['Polishing the chrome...', 'Ready to roll!'],
};

interface FlyerResultCardProps {
  slot: GenerationSlot;
  onEdit: () => void;
  onAnimate: () => void;
  onShare: () => void;
  onDownload: () => void;
}

export default function FlyerResultCard({
  slot, onEdit, onAnimate, onShare, onDownload,
}: FlyerResultCardProps) {
  // Loading state
  if (slot.status === 'pending' || slot.status === 'loading') {
    return (
      <div className="space-y-3">
        <div className="aspect-[4/5] border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
          <RetroLoadingStage
            isLoading
            estimatedDuration={25000}
            size="sm"
            showExhaust={false}
            phaseMessages={LOADING_MESSAGES}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-heading uppercase">
            {slot.themeName || 'Generating...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (slot.status === 'error') {
    return (
      <div className="space-y-3">
        <div className="aspect-[4/5] border-2 border-red-300 dark:border-red-700 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20">
          <AlertCircle size={32} className="text-red-400 mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400 font-heading uppercase">Generation Failed</p>
          <p className="text-xs text-red-500 mt-1 px-4 text-center">{slot.error || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  // Done state
  if (!slot.flyer) return null;

  return (
    <div className="space-y-3">
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden border-2 border-black dark:border-gray-600 shadow-retro">
        <img
          src={slot.flyer.imageUrl}
          alt={slot.flyer.title || 'Generated flyer'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Theme badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
          {slot.flyer.themeName}
        </span>
        {slot.flyer.vehicle && (
          <span className="text-xs px-2 py-1 bg-teal-50 dark:bg-teal-900/30 border border-retro-teal text-retro-teal">
            {slot.flyer.vehicle.name}
          </span>
        )}
      </div>

      {/* 4 Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onEdit}
          className="flex flex-col items-center gap-1 py-2.5 px-1 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <Wand2 size={18} className="text-retro-navy dark:text-gray-300" />
          <span className="text-[10px] font-heading uppercase text-gray-600 dark:text-gray-400">Edit</span>
        </button>
        <button
          onClick={onAnimate}
          className="flex flex-col items-center gap-1 py-2.5 px-1 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <Film size={18} className="text-retro-navy dark:text-gray-300" />
          <span className="text-[10px] font-heading uppercase text-gray-600 dark:text-gray-400">Animate</span>
        </button>
        <button
          onClick={onShare}
          className="flex flex-col items-center gap-1 py-2.5 px-1 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <Share2 size={18} className="text-retro-navy dark:text-gray-300" />
          <span className="text-[10px] font-heading uppercase text-gray-600 dark:text-gray-400">Share</span>
        </button>
        <button
          onClick={onDownload}
          className="flex flex-col items-center gap-1 py-2.5 px-1 border-2 border-retro-teal bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-800/40 transition-all"
        >
          <Download size={18} className="text-retro-teal" />
          <span className="text-[10px] font-heading uppercase text-retro-teal">Save</span>
        </button>
      </div>
    </div>
  );
}
