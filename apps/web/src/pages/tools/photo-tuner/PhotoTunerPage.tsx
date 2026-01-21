import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Image,
  Upload,
  Sliders,
  Wand2,
  Download,
  RefreshCw,
  Sun,
  Contrast,
  Droplets,
  Focus,
  Thermometer,
  Sparkles,
  SplitSquareHorizontal,
  Check,
} from 'lucide-react';
import { api } from '../../../services/api';

interface EnhancementPreset {
  id: string;
  name: string;
  description: string;
  bestFor: string[];
}

interface PhotoCategory {
  id: string;
  name: string;
  description: string;
  recommendedPresets: string[];
  tips: string[];
}

interface EnhancementSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  highlights: number;
  shadows: number;
  warmth: number;
  vibrance: number;
  clarity: number;
  denoise: number;
}

interface PhotoTuneResult {
  originalUrl: string;
  enhancedUrl: string;
  thumbnailUrl: string;
  settings: EnhancementSettings;
  preset: string;
  improvements: string[];
}

const DEFAULT_SETTINGS: EnhancementSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  highlights: 0,
  shadows: 0,
  warmth: 0,
  vibrance: 0,
  clarity: 0,
  denoise: 0,
};

export default function PhotoTunerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [settings, setSettings] = useState<EnhancementSettings>(DEFAULT_SETTINGS);
  const [useCustomSettings, setUseCustomSettings] = useState(false);
  const [result, setResult] = useState<PhotoTuneResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch presets
  const { data: presetsData } = useQuery<{ presets: EnhancementPreset[] }>({
    queryKey: ['photo-tuner', 'presets'],
    queryFn: async () => {
      const response = await api.get('/tools/photo-tuner/presets');
      return response.data;
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery<{ categories: PhotoCategory[] }>({
    queryKey: ['photo-tuner', 'categories'],
    queryFn: async () => {
      const response = await api.get('/tools/photo-tuner/categories');
      return response.data;
    },
  });

  // Enhance mutation
  const enhanceMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tools/photo-tuner/enhance', {
        imageUrl,
        preset: useCustomSettings ? undefined : selectedPreset,
        category: selectedCategory,
        customSettings: useCustomSettings ? settings : undefined,
        autoCorrect: !selectedPreset && !useCustomSettings,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data.result);
    },
  });

  // Analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tools/photo-tuner/analyze', {
        imageUrl,
        category: selectedCategory,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSettings(data.settings);
      setUseCustomSettings(true);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setResult(null);
    }
  };

  const handleSettingChange = (key: keyof EnhancementSettings, value: number) => {
    setSettings({ ...settings, [key]: value });
    setUseCustomSettings(true);
    setSelectedPreset(null);
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    setUseCustomSettings(false);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setUseCustomSettings(false);
    setSelectedPreset(null);
  };

  const settingSliders: Array<{
    key: keyof EnhancementSettings;
    label: string;
    icon: React.ReactNode;
    min: number;
    max: number;
  }> = [
    { key: 'brightness', label: 'Brightness', icon: <Sun size={16} />, min: -100, max: 100 },
    { key: 'contrast', label: 'Contrast', icon: <Contrast size={16} />, min: -100, max: 100 },
    { key: 'saturation', label: 'Saturation', icon: <Droplets size={16} />, min: -100, max: 100 },
    { key: 'sharpness', label: 'Sharpness', icon: <Focus size={16} />, min: 0, max: 100 },
    { key: 'warmth', label: 'Warmth', icon: <Thermometer size={16} />, min: -100, max: 100 },
    { key: 'vibrance', label: 'Vibrance', icon: <Sparkles size={16} />, min: -100, max: 100 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-retro-navy mb-2">Photo Tuner</h1>
        <p className="text-gray-600">
          Enhance your auto shop photos with AI-powered adjustments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Upload / Preview */}
          <div className="bg-white border-2 border-black p-4">
            {!imageUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 p-12 text-center cursor-pointer hover:border-retro-navy transition-colors"
              >
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="font-heading mb-2">Drop an image or click to upload</p>
                <p className="text-sm text-gray-500">Supports JPG, PNG, WebP</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Display */}
                <div className="relative">
                  {showComparison && result ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-heading uppercase text-gray-500 mb-1">Before</p>
                        <img
                          src={imageUrl}
                          alt="Original"
                          className="w-full border-2 border-black"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-heading uppercase text-gray-500 mb-1">After</p>
                        <img
                          src={result.enhancedUrl || imageUrl}
                          alt="Enhanced"
                          className="w-full border-2 border-black"
                        />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={result?.enhancedUrl || imageUrl}
                      alt="Photo"
                      className="w-full border-2 border-black"
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border-2 border-black text-sm hover:bg-gray-50"
                  >
                    Change Image
                  </button>
                  {result && (
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className={`px-4 py-2 border-2 text-sm flex items-center gap-2 ${
                        showComparison ? 'border-retro-red bg-retro-red/5' : 'border-black hover:bg-gray-50'
                      }`}
                    >
                      <SplitSquareHorizontal size={16} />
                      Compare
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Enhancement Controls */}
          {imageUrl && (
            <div className="bg-white border-2 border-black p-4 space-y-4">
              {/* Tabs */}
              <div className="flex border-b-2 border-black -mx-4 -mt-4">
                <button
                  onClick={() => setUseCustomSettings(false)}
                  className={`flex-1 py-3 text-center font-heading text-sm ${
                    !useCustomSettings ? 'bg-retro-navy text-white' : ''
                  }`}
                >
                  Presets
                </button>
                <button
                  onClick={() => setUseCustomSettings(true)}
                  className={`flex-1 py-3 text-center font-heading text-sm ${
                    useCustomSettings ? 'bg-retro-navy text-white' : ''
                  }`}
                >
                  Manual Adjust
                </button>
              </div>

              {!useCustomSettings ? (
                /* Presets Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {presetsData?.presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`p-3 text-left border-2 transition-all ${
                        selectedPreset === preset.id
                          ? 'border-retro-red bg-retro-red/5'
                          : 'border-gray-200 hover:border-retro-navy'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedPreset === preset.id && <Check size={14} className="text-retro-red" />}
                        <span className="font-heading text-sm">{preset.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                    </button>
                  ))}
                </div>
              ) : (
                /* Manual Sliders */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => analyzeMutation.mutate()}
                      disabled={analyzeMutation.isPending}
                      className="px-4 py-2 bg-retro-navy text-white text-sm flex items-center gap-2"
                    >
                      {analyzeMutation.isPending ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Wand2 size={14} />
                      )}
                      Auto Analyze
                    </button>
                    <button
                      onClick={resetSettings}
                      className="text-sm text-gray-500 hover:text-retro-navy"
                    >
                      Reset All
                    </button>
                  </div>

                  {settingSliders.map(({ key, label, icon, min, max }) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          {icon}
                          {label}
                        </label>
                        <span className="text-sm text-gray-500">{settings[key]}</span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={settings[key]}
                        onChange={(e) => handleSettingChange(key, parseInt(e.target.value))}
                        className="w-full accent-retro-red"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Enhance Button */}
              <button
                onClick={() => enhanceMutation.mutate()}
                disabled={enhanceMutation.isPending}
                className="w-full py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 font-heading uppercase flex items-center justify-center gap-2"
              >
                {enhanceMutation.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Enhance Photo
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-white border-2 border-black p-4">
              <h3 className="font-heading uppercase mb-3">Improvements Made</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.improvements.map((improvement, i) => (
                  <span key={i} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                    {improvement}
                  </span>
                ))}
              </div>
              <button className="w-full py-2 bg-retro-navy text-white border-2 border-black flex items-center justify-center gap-2 hover:bg-retro-navy/90">
                <Download size={16} />
                Download Enhanced Photo
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category Selection */}
          <div className="bg-white border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-3">Photo Category</h3>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full px-3 py-2 border-2 border-black"
            >
              <option value="">Auto-detect</option>
              {categoriesData?.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {selectedCategory && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200">
                <p className="text-xs font-heading uppercase text-gray-600 mb-2">
                  Recommended Presets
                </p>
                <div className="flex flex-wrap gap-1">
                  {categoriesData?.categories
                    .find((c) => c.id === selectedCategory)
                    ?.recommendedPresets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handlePresetSelect(preset)}
                        className={`px-2 py-1 text-xs border ${
                          selectedPreset === preset
                            ? 'border-retro-red bg-retro-red/10'
                            : 'border-gray-300 hover:border-retro-navy'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          {selectedCategory && (
            <div className="bg-retro-cream border-2 border-black p-4">
              <h3 className="font-heading text-sm uppercase mb-2">Photo Tips</h3>
              <ul className="text-xs text-gray-600 space-y-2">
                {categoriesData?.categories
                  .find((c) => c.id === selectedCategory)
                  ?.tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
              </ul>
            </div>
          )}

          {/* Quick Stats */}
          {imageFile && (
            <div className="bg-white border-2 border-black p-4">
              <h3 className="font-heading text-sm uppercase mb-3">Image Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="truncate ml-2">{imageFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span>{(imageFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span>{imageFile.type}</span>
                </div>
              </div>
            </div>
          )}

          {/* General Tips */}
          <div className="bg-white border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-2">Enhancement Tips</h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Start with Auto Enhance for quick results</li>
              <li>• Use category presets for best results</li>
              <li>• Manual adjustments give you full control</li>
              <li>• Compare before/after to see changes</li>
              <li>• High-res images produce better results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
