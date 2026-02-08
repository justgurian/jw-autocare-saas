import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  X,
  Sun,
  Moon,
  Contrast,
  Thermometer,
  Sparkles,
  Wand2,
  Undo,
  Redo,
  Save,
  Loader2,
  Car,
  Type,
  Plus,
} from 'lucide-react';
import { contentApi } from '../../services/api';
import toast from 'react-hot-toast';

interface FlyerEditorProps {
  contentId: string;
  imageUrl: string;
  title?: string;
  onClose: () => void;
  onSave: (newImageUrl: string) => void;
}

type PresetType = 'brighten' | 'darken' | 'more-contrast' | 'less-contrast' | 'warmer' | 'cooler' | 'vintage' | 'sharpen';

const presets: { id: PresetType; name: string; icon: typeof Sun; description: string }[] = [
  { id: 'brighten', name: 'Brighten', icon: Sun, description: 'Lighter and more vibrant' },
  { id: 'darken', name: 'Darken', icon: Moon, description: 'Darker, moodier' },
  { id: 'more-contrast', name: 'Contrast +', icon: Contrast, description: 'Stronger colors' },
  { id: 'less-contrast', name: 'Contrast -', icon: Contrast, description: 'Softer, subtle' },
  { id: 'warmer', name: 'Warmer', icon: Thermometer, description: 'Golden tones' },
  { id: 'cooler', name: 'Cooler', icon: Thermometer, description: 'Blue tones' },
  { id: 'vintage', name: 'Vintage', icon: Sparkles, description: 'Classic film look' },
  { id: 'sharpen', name: 'Sharpen', icon: Wand2, description: 'Enhance details' },
];

export default function FlyerEditor({ contentId, imageUrl, title, onClose, onSave }: FlyerEditorProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [history, setHistory] = useState<string[]>([imageUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [newHeadline, setNewHeadline] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showOtherVehicle, setShowOtherVehicle] = useState(false);
  const [otherMake, setOtherMake] = useState('');
  const [otherModel, setOtherModel] = useState('');
  const [otherYear, setOtherYear] = useState('');
  const [otherColor, setOtherColor] = useState('');

  // Fetch vehicle suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['edit-suggestions', contentId],
    queryFn: () => contentApi.getEditSuggestions(contentId).then(r => r.data),
  });

  // Edit mutation (used by all edit actions)
  const editMutation = useMutation({
    mutationFn: (data: Parameters<typeof contentApi.edit>[1]) =>
      contentApi.edit(contentId, data),
    onSuccess: (response) => {
      if (response.data.success && response.data.imageUrl) {
        const newHistory = [...history.slice(0, historyIndex + 1), response.data.imageUrl];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setCurrentImageUrl(response.data.imageUrl);
        toast.success('Edit applied!');
      } else {
        toast.error(response.data.error || 'Failed to apply edit');
      }
    },
    onError: () => toast.error('Failed to apply edit'),
  });

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentImageUrl(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentImageUrl(history[historyIndex + 1]);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasChanges = currentImageUrl !== imageUrl;
  const isLoading = editMutation.isPending;

  const vehicleSuggestions = suggestions?.vehicleSuggestions || [];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black dark:border-gray-600">
          <h2 className="font-heading text-lg uppercase text-gray-900 dark:text-gray-100">
            Edit Flyer{title ? ` — ${title}` : ''}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Image Preview */}
          <div className="w-1/2 p-4 bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
            <div className="relative">
              <img
                src={currentImageUrl}
                alt={title || 'Flyer'}
                className="max-w-full max-h-[60vh] border-2 border-black"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={48} className="animate-spin mx-auto text-retro-red" />
                    <p className="mt-2 font-heading">Applying edit...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit Controls */}
          <div className="w-1/2 p-4 overflow-y-auto space-y-5 text-gray-900 dark:text-gray-100">
            {/* Undo/Redo */}
            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={!canUndo || isLoading}
                className="flex items-center gap-2 px-3 py-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Undo size={16} /> Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo || isLoading}
                className="flex items-center gap-2 px-3 py-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Redo size={16} /> Redo
              </button>
            </div>

            {/* SWAP VEHICLE */}
            <div>
              <h3 className="font-heading text-sm uppercase mb-2 flex items-center gap-2">
                <Car size={16} /> Swap Vehicle
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {vehicleSuggestions.map((s: { make: string; model: string; label: string }) => (
                  <button
                    key={s.label}
                    onClick={() => editMutation.mutate({
                      editType: 'swap-vehicle',
                      vehicleMake: s.make,
                      vehicleModel: s.model,
                    })}
                    disabled={isLoading}
                    className="px-3 py-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 hover:border-retro-red hover:bg-red-50 dark:hover:bg-retro-red/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {s.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowOtherVehicle(!showOtherVehicle)}
                  disabled={isLoading}
                  className="px-3 py-2 border-2 border-dashed border-gray-400 dark:border-gray-500 hover:border-retro-red text-sm text-gray-500 dark:text-gray-400 hover:text-retro-red transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus size={14} /> Other...
                </button>
              </div>
              {showOtherVehicle && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={otherMake}
                    onChange={(e) => setOtherMake(e.target.value)}
                    placeholder="Make (e.g. Tesla)"
                    className="p-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-sm focus:border-retro-red outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    value={otherModel}
                    onChange={(e) => setOtherModel(e.target.value)}
                    placeholder="Model (e.g. Model 3)"
                    className="p-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-sm focus:border-retro-red outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    value={otherYear}
                    onChange={(e) => setOtherYear(e.target.value)}
                    placeholder="Year (e.g. 2024)"
                    className="p-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-sm focus:border-retro-red outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    value={otherColor}
                    onChange={(e) => setOtherColor(e.target.value)}
                    placeholder="Color (e.g. Red)"
                    className="p-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-sm focus:border-retro-red outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => {
                      if (otherMake.trim()) {
                        // Build a descriptive string: "2024 Red Tesla Model 3"
                        const parts = [otherYear.trim(), otherColor.trim(), otherMake.trim(), otherModel.trim()].filter(Boolean);
                        editMutation.mutate({
                          editType: 'swap-vehicle',
                          vehicleMake: parts.join(' '),
                        });
                        setOtherMake('');
                        setOtherModel('');
                        setOtherYear('');
                        setOtherColor('');
                      }
                    }}
                    disabled={!otherMake.trim() || isLoading}
                    className="col-span-2 px-4 py-2 bg-retro-navy text-white border-2 border-black dark:border-gray-500 text-sm font-heading uppercase disabled:opacity-50 hover:bg-retro-navy/90 transition-colors"
                  >
                    Go
                  </button>
                </div>
              )}
            </div>

            {/* CHANGE TEXT */}
            <div>
              <h3 className="font-heading text-sm uppercase mb-2 flex items-center gap-2">
                <Type size={16} /> Change Headline
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  placeholder="Enter new headline text..."
                  className="flex-1 p-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-sm focus:border-retro-red outline-none placeholder-gray-400 dark:placeholder-gray-500"
                  maxLength={200}
                  disabled={isLoading}
                />
                <button
                  onClick={() => {
                    if (newHeadline.trim()) {
                      editMutation.mutate({ editType: 'change-text', newHeadline: newHeadline.trim() });
                      setNewHeadline('');
                    }
                  }}
                  disabled={!newHeadline.trim() || isLoading}
                  className="px-4 py-2 bg-retro-navy text-white border-2 border-black dark:border-gray-500 text-sm disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* QUICK ADJUST */}
            <div>
              <h3 className="font-heading text-sm uppercase mb-2 flex items-center gap-2">
                <Sparkles size={16} /> Quick Adjust
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => editMutation.mutate({ editType: 'adjust-preset', preset: preset.id })}
                      disabled={isLoading}
                      className="p-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 hover:border-retro-red hover:bg-red-50 dark:hover:bg-retro-red/20 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      title={preset.description}
                    >
                      <Icon size={16} className="mx-auto mb-1" />
                      <span className="text-xs">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOM */}
            <div>
              <h3 className="font-heading text-sm uppercase mb-2 flex items-center gap-2">
                <Wand2 size={16} /> Custom Edit
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe any change you want..."
                  className="flex-1 p-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-sm focus:border-retro-red outline-none placeholder-gray-400 dark:placeholder-gray-500"
                  maxLength={500}
                  disabled={isLoading}
                />
                <button
                  onClick={() => {
                    if (customPrompt.trim()) {
                      editMutation.mutate({ editType: 'custom', customPrompt: customPrompt.trim() });
                      setCustomPrompt('');
                    }
                  }}
                  disabled={!customPrompt.trim() || isLoading}
                  className="px-4 py-2 bg-retro-navy text-white border-2 border-black dark:border-gray-500 text-sm disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
                <p>"Add a sunset background"</p>
                <p>"Make the text stand out more"</p>
                <p>"Change the color scheme to blue and white"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(currentImageUrl)}
            disabled={!hasChanges || isLoading}
            className="px-6 py-2 bg-green-500 text-white border-2 border-black dark:border-green-700 shadow-retro hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
