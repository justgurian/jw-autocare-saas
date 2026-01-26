import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
} from 'lucide-react';
import { batchFlyerApi } from '../../services/api';
import toast from 'react-hot-toast';

interface BatchFlyer {
  id: string;
  imageUrl: string;
  caption: string;
  title: string;
  theme: string;
  themeName: string;
}

interface InPaintEditorProps {
  flyer: BatchFlyer;
  onClose: () => void;
  onSave: (newImageUrl: string) => void;
}

type PresetType = 'brighten' | 'darken' | 'more-contrast' | 'less-contrast' | 'warmer' | 'cooler' | 'vintage' | 'sharpen';

const presets = [
  { id: 'brighten' as PresetType, name: 'Brighten', icon: Sun, description: 'Make lighter and more vibrant' },
  { id: 'darken' as PresetType, name: 'Darken', icon: Moon, description: 'Make darker, moodier' },
  { id: 'more-contrast' as PresetType, name: 'More Contrast', icon: Contrast, description: 'Stronger lights and darks' },
  { id: 'less-contrast' as PresetType, name: 'Less Contrast', icon: Contrast, description: 'Softer, more subtle' },
  { id: 'warmer' as PresetType, name: 'Warmer', icon: Thermometer, description: 'Add golden tones' },
  { id: 'cooler' as PresetType, name: 'Cooler', icon: Thermometer, description: 'Add blue tones' },
  { id: 'vintage' as PresetType, name: 'Vintage', icon: Sparkles, description: 'Classic film look' },
  { id: 'sharpen' as PresetType, name: 'Sharpen', icon: Wand2, description: 'Enhance details' },
];

export default function InPaintEditor({ flyer, onClose, onSave }: InPaintEditorProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(flyer.imageUrl);
  const [history, setHistory] = useState<string[]>([flyer.imageUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');

  const inpaintMutation = useMutation({
    mutationFn: async (data: {
      editType: 'preset' | 'custom';
      preset?: PresetType;
      customPrompt?: string;
    }) => {
      const response = await batchFlyerApi.inpaint(flyer.id, data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.imageUrl) {
        // Add to history
        const newHistory = [...history.slice(0, historyIndex + 1), data.imageUrl];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setCurrentImageUrl(data.imageUrl);
        toast.success('Edit applied!');
      } else {
        toast.error(data.error || 'Failed to apply edit');
      }
    },
    onError: () => {
      toast.error('Failed to apply edit');
    },
  });

  const applyPreset = (preset: PresetType) => {
    inpaintMutation.mutate({
      editType: 'preset',
      preset,
    });
  };

  const applyCustomEdit = () => {
    if (!customPrompt.trim()) return;
    inpaintMutation.mutate({
      editType: 'custom',
      customPrompt,
    });
    setCustomPrompt('');
  };

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

  const handleSave = () => {
    onSave(currentImageUrl);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasChanges = currentImageUrl !== flyer.imageUrl;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <h2 className="font-heading text-lg uppercase">Edit Image with AI</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Image Preview */}
          <div className="w-1/2 p-4 bg-gray-100 flex items-center justify-center">
            <div className="relative">
              <img
                src={currentImageUrl}
                alt={flyer.title}
                className="max-w-full max-h-[60vh] border-2 border-black"
              />
              {inpaintMutation.isPending && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={48} className="animate-spin mx-auto text-retro-red" />
                    <p className="mt-2 font-heading">Applying edit...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit Controls */}
          <div className="w-1/2 p-4 overflow-y-auto">
            {/* Undo/Redo */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={undo}
                disabled={!canUndo || inpaintMutation.isPending}
                className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo size={16} />
                Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo || inpaintMutation.isPending}
                className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo size={16} />
                Redo
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mb-6">
              <h3 className="font-heading text-sm uppercase mb-3">Quick Edits</h3>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      disabled={inpaintMutation.isPending}
                      className="p-3 border-2 border-gray-300 hover:border-retro-red hover:bg-red-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} />
                        <span className="font-heading text-sm">{preset.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">{preset.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Edit */}
            <div className="mb-6">
              <h3 className="font-heading text-sm uppercase mb-3">Custom Edit</h3>
              <p className="text-xs text-gray-500 mb-2">
                Describe the change you want in your own words
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Make the background more vibrant"
                  className="flex-1 p-3 border-2 border-black focus:border-retro-red outline-none"
                  disabled={inpaintMutation.isPending}
                />
                <button
                  onClick={applyCustomEdit}
                  disabled={!customPrompt.trim() || inpaintMutation.isPending}
                  className="px-4 py-2 bg-retro-navy text-white border-2 border-black hover:bg-retro-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-retro-cream border-2 border-dashed border-retro-navy/30 p-4">
              <h4 className="font-heading text-xs uppercase mb-2">Custom Edit Examples</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p>"Make the car more prominent"</p>
                <p>"Add more dramatic lighting"</p>
                <p>"Make the text stand out more"</p>
                <p>"Add a sunset glow to the background"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t-2 border-black bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-black bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || inpaintMutation.isPending}
            className="px-6 py-2 bg-green-500 text-white border-2 border-black shadow-retro hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
