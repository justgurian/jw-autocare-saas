import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Upload,
  Eraser,
  Image as ImageIcon,
  Sparkles,
  Maximize2,
  Crop,
  RotateCw,
  FlipHorizontal,
  Sliders,
  Sun,
  Type,
  ImagePlus,
  Square,
  AtSign,
  Download,
  Save,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  History,
  Wand2,
  X,
} from 'lucide-react';
import { api } from '../../../services/api';

interface EditOperation {
  id: string;
  name: string;
  icon: string;
}

interface EditPreset {
  id: string;
  name: string;
  description: string;
}

interface EditorOptions {
  presets: EditPreset[];
  filters: string[];
  aspectRatios: Array<{ id: string; name: string; ratio: number | null }>;
  operations: EditOperation[];
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  eraser: <Eraser size={18} />,
  image: <ImageIcon size={18} />,
  sparkles: <Sparkles size={18} />,
  maximize: <Maximize2 size={18} />,
  crop: <Crop size={18} />,
  'rotate-cw': <RotateCw size={18} />,
  'flip-horizontal': <FlipHorizontal size={18} />,
  sliders: <Sliders size={18} />,
  sun: <Sun size={18} />,
  type: <Type size={18} />,
  'image-plus': <ImagePlus size={18} />,
  square: <Square size={18} />,
  'at-sign': <AtSign size={18} />,
};

// Adjustment slider component
function AdjustmentSlider({
  label,
  value,
  onChange,
  min = -100,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-gray-500">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-retro-red"
      />
    </div>
  );
}

export default function ImageEditorPage() {
  // State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    temperature: 0,
  });
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPresets, setShowPresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch editor options
  const { data: options } = useQuery<EditorOptions>({
    queryKey: ['image-editor', 'options'],
    queryFn: async () => {
      const response = await api.get('/tools/image-editor/options');
      return response.data;
    },
  });

  // Process edits mutation
  const processEditsMutation = useMutation({
    mutationFn: async (operations: Array<{ operation: string; [key: string]: unknown }>) => {
      const response = await api.post('/tools/image-editor/process', {
        sourceImageUrl: selectedImage,
        operations,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSelectedImage(data.result.editedUrl);
      setEditHistory((prev) => [...prev.slice(0, historyIndex + 1), data.result.editedUrl]);
      setHistoryIndex((prev) => prev + 1);
    },
  });

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setSelectedImage(imageUrl);
        setEditHistory([imageUrl]);
        setHistoryIndex(0);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle operation click
  const handleOperationClick = (operationId: string) => {
    setActiveOperation(activeOperation === operationId ? null : operationId);
  };

  // Apply current adjustments
  const applyAdjustments = () => {
    if (!selectedImage) return;
    processEditsMutation.mutate([
      {
        operation: 'adjust',
        adjustments,
      },
    ]);
  };

  // Apply filter
  const applyFilter = (filter: string) => {
    if (!selectedImage) return;
    setSelectedFilter(filter);
    processEditsMutation.mutate([
      {
        operation: 'filter',
        filter,
      },
    ]);
  };

  // Apply preset
  const applyPreset = async (presetId: string) => {
    if (!selectedImage) return;
    try {
      const response = await api.post(`/tools/image-editor/preset/${presetId}`, {
        sourceImageUrl: selectedImage,
      });
      setSelectedImage(response.data.result.editedUrl);
      setShowPresets(false);
    } catch (error) {
      console.error('Failed to apply preset:', error);
    }
  };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSelectedImage(editHistory[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSelectedImage(editHistory[historyIndex + 1]);
    }
  };

  // Quick actions
  const quickActions = [
    { id: 'enhance', label: 'AI Enhance', icon: <Sparkles size={16} /> },
    { id: 'background_remove', label: 'Remove BG', icon: <Eraser size={16} /> },
    { id: 'crop', label: 'Crop', icon: <Crop size={16} /> },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-3xl text-retro-navy">Repair Bay</h1>
          <p className="text-gray-600 text-sm">Image Editor</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= editHistory.length - 1}
            className="p-2 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
          <button
            onClick={() => setShowPresets(true)}
            className="px-4 py-2 border-2 border-black hover:bg-gray-100 flex items-center gap-2"
          >
            <Wand2 size={16} />
            Presets
          </button>
          <button className="px-4 py-2 border-2 border-black hover:bg-gray-100 flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button className="px-4 py-2 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2">
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Toolbar */}
        <div className="w-16 bg-retro-navy border-2 border-black flex flex-col items-center py-3 gap-1 overflow-y-auto">
          {options?.operations.map((op) => (
            <button
              key={op.id}
              onClick={() => handleOperationClick(op.id)}
              className={`w-12 h-12 flex items-center justify-center transition-colors ${
                activeOperation === op.id
                  ? 'bg-retro-red text-white'
                  : 'text-white hover:bg-white/10'
              }`}
              title={op.name}
            >
              {iconMap[op.icon] || <ImageIcon size={18} />}
            </button>
          ))}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-gray-100 border-2 border-black relative overflow-hidden">
          {!selectedImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-400 hover:border-retro-navy transition-colors"
              >
                <Upload size={48} className="text-gray-400" />
                <div className="text-center">
                  <p className="font-heading text-lg text-gray-600">Upload an image</p>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                </div>
              </button>

              <div className="mt-8">
                <p className="text-sm text-gray-500 mb-3">Or start from existing content:</p>
                <div className="flex gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center p-4"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <img
                src={selectedImage}
                alt="Edit canvas"
                className="max-w-full max-h-full object-contain shadow-lg"
                style={{
                  filter: `
                    brightness(${100 + adjustments.brightness}%)
                    contrast(${100 + adjustments.contrast}%)
                    saturate(${100 + adjustments.saturation}%)
                  `,
                }}
              />
            </div>
          )}

          {/* Zoom controls */}
          {selectedImage && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border-2 border-black px-3 py-2">
              <button onClick={() => setZoom(Math.max(25, zoom - 25))}>
                <ZoomOut size={16} />
              </button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 25))}>
                <ZoomIn size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-72 bg-white border-2 border-black overflow-y-auto">
          {/* Quick Actions */}
          {selectedImage && (
            <div className="p-4 border-b-2 border-black">
              <h3 className="font-heading text-sm uppercase mb-3">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() =>
                      processEditsMutation.mutate([{ operation: action.id }])
                    }
                    className="p-3 border-2 border-black hover:bg-gray-50 flex flex-col items-center gap-1"
                  >
                    {action.icon}
                    <span className="text-[10px]">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Operation Panel */}
          {activeOperation === 'adjust' && (
            <div className="p-4 border-b-2 border-black">
              <h3 className="font-heading text-sm uppercase mb-4">Adjustments</h3>
              <div className="space-y-4">
                <AdjustmentSlider
                  label="Brightness"
                  value={adjustments.brightness}
                  onChange={(v) => setAdjustments({ ...adjustments, brightness: v })}
                />
                <AdjustmentSlider
                  label="Contrast"
                  value={adjustments.contrast}
                  onChange={(v) => setAdjustments({ ...adjustments, contrast: v })}
                />
                <AdjustmentSlider
                  label="Saturation"
                  value={adjustments.saturation}
                  onChange={(v) => setAdjustments({ ...adjustments, saturation: v })}
                />
                <AdjustmentSlider
                  label="Sharpness"
                  value={adjustments.sharpness}
                  onChange={(v) => setAdjustments({ ...adjustments, sharpness: v })}
                  min={0}
                  max={100}
                />
                <AdjustmentSlider
                  label="Temperature"
                  value={adjustments.temperature}
                  onChange={(v) => setAdjustments({ ...adjustments, temperature: v })}
                />
              </div>
              <button
                onClick={applyAdjustments}
                className="w-full mt-4 py-2 bg-retro-red text-white border-2 border-black"
              >
                Apply Adjustments
              </button>
            </div>
          )}

          {activeOperation === 'filter' && (
            <div className="p-4 border-b-2 border-black">
              <h3 className="font-heading text-sm uppercase mb-4">Filters</h3>
              <div className="grid grid-cols-3 gap-2">
                {options?.filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => applyFilter(filter)}
                    className={`p-2 border-2 text-xs capitalize ${
                      selectedFilter === filter
                        ? 'border-retro-red bg-retro-red/10'
                        : 'border-black hover:bg-gray-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeOperation === 'crop' && (
            <div className="p-4 border-b-2 border-black">
              <h3 className="font-heading text-sm uppercase mb-4">Crop</h3>
              <p className="text-sm text-gray-600 mb-3">Select aspect ratio:</p>
              <div className="grid grid-cols-2 gap-2">
                {options?.aspectRatios.map((ar) => (
                  <button
                    key={ar.id}
                    className="p-2 border-2 border-black hover:bg-gray-50 text-xs"
                  >
                    {ar.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeOperation === 'text_overlay' && (
            <div className="p-4 border-b-2 border-black">
              <h3 className="font-heading text-sm uppercase mb-4">Add Text</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full p-2 border-2 border-black"
                />
                <select className="w-full p-2 border-2 border-black">
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Georgia</option>
                  <option>Verdana</option>
                </select>
                <div className="flex gap-2">
                  <input type="number" placeholder="Size" className="w-20 p-2 border-2 border-black" />
                  <input type="color" className="w-12 h-10 border-2 border-black cursor-pointer" />
                </div>
                <button className="w-full py-2 bg-retro-navy text-white border-2 border-black">
                  Add Text
                </button>
              </div>
            </div>
          )}

          {/* History */}
          {selectedImage && (
            <div className="p-4">
              <h3 className="font-heading text-sm uppercase mb-3 flex items-center gap-2">
                <History size={14} />
                History
              </h3>
              <div className="space-y-2">
                {editHistory.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setHistoryIndex(i);
                      setSelectedImage(editHistory[i]);
                    }}
                    className={`w-full p-2 text-left text-sm border-2 ${
                      i === historyIndex
                        ? 'border-retro-red bg-retro-red/10'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {i === 0 ? 'Original' : `Edit ${i}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Presets Modal */}
      {showPresets && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-retro-navy text-white">
              <h2 className="font-heading text-xl">Quick Presets</h2>
              <button onClick={() => setShowPresets(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              {options?.presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className="p-4 border-2 border-black hover:border-retro-red text-left transition-colors"
                >
                  <h3 className="font-heading uppercase mb-1">{preset.name}</h3>
                  <p className="text-sm text-gray-600">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {processEditsMutation.isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black p-8 flex flex-col items-center">
            <div className="animate-spin w-12 h-12 border-4 border-retro-red border-t-transparent rounded-full mb-4" />
            <p className="font-heading">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
