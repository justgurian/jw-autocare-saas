import { Zap, Calendar, Rocket, Minus, Plus } from 'lucide-react';

interface ModeSelectorProps {
  selectedMode: 'quick' | 'week' | 'month';
  onSelectMode: (mode: 'quick' | 'week' | 'month') => void;
  flyerCount: number;
  onCountChange: (count: number) => void;
}

const modes = [
  {
    id: 'quick' as const,
    name: 'Quick Post',
    description: '1-3 flyers for immediate needs',
    icon: Zap,
    minCount: 1,
    maxCount: 3,
    color: 'retro-teal',
  },
  {
    id: 'week' as const,
    name: 'Week Pack',
    description: 'Plan your whole week',
    icon: Calendar,
    minCount: 7,
    maxCount: 7,
    color: 'retro-red',
  },
  {
    id: 'month' as const,
    name: 'Month Blitz',
    description: 'Content for the entire month',
    icon: Rocket,
    minCount: 1,
    maxCount: 30,
    color: 'retro-navy',
  },
];

export default function ModeSelector({
  selectedMode,
  onSelectMode,
  flyerCount,
  onCountChange,
}: ModeSelectorProps) {
  const currentModeData = modes.find(m => m.id === selectedMode);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg uppercase mb-4">How many flyers do you need?</h2>
        <p className="text-gray-600 text-sm mb-6">
          Choose a mode based on your content planning needs
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`p-6 border-2 text-left transition-all ${
                isSelected
                  ? `border-${mode.color} bg-${mode.color}/5 shadow-retro`
                  : 'border-gray-300 hover:border-gray-500'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  isSelected ? `bg-${mode.color} text-white` : 'bg-gray-100 text-gray-600'
                }`}
                style={{
                  backgroundColor: isSelected
                    ? mode.color === 'retro-teal' ? '#14B8A6'
                    : mode.color === 'retro-red' ? '#DC2626'
                    : '#1E3A5F'
                    : undefined,
                }}
              >
                <Icon size={24} />
              </div>
              <h3 className="font-heading text-lg uppercase mb-1">{mode.name}</h3>
              <p className="text-sm text-gray-600">{mode.description}</p>
              {mode.id !== 'week' && (
                <p className="text-xs text-gray-400 mt-2">
                  {mode.minCount}-{mode.maxCount} flyers
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Count Selector (for quick and month modes) */}
      {selectedMode !== 'week' && currentModeData && (
        <div className="bg-retro-cream border-2 border-dashed border-retro-navy/30 p-6">
          <h3 className="font-heading text-sm uppercase mb-4">How many flyers?</h3>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => onCountChange(Math.max(currentModeData.minCount, flyerCount - 1))}
              disabled={flyerCount <= currentModeData.minCount}
              className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={20} />
            </button>
            <div className="w-24 text-center">
              <span className="font-display text-4xl text-retro-navy">{flyerCount}</span>
              <p className="text-xs text-gray-500">flyer{flyerCount > 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => onCountChange(Math.min(currentModeData.maxCount, flyerCount + 1))}
              disabled={flyerCount >= currentModeData.maxCount}
              className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            Max {currentModeData.maxCount} for {currentModeData.name}
          </p>
        </div>
      )}

      {/* Week Pack Info */}
      {selectedMode === 'week' && (
        <div className="bg-retro-cream border-2 border-dashed border-retro-navy/30 p-6 text-center">
          <Calendar size={32} className="mx-auto mb-3 text-retro-red" />
          <h3 className="font-heading text-lg uppercase mb-2">7 Flyers for the Week</h3>
          <p className="text-sm text-gray-600">
            One unique flyer for each day of the week, automatically scheduled at 9am
          </p>
        </div>
      )}
    </div>
  );
}
