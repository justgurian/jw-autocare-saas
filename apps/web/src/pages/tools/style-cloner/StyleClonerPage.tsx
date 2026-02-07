import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Sparkles, Eye, Rocket, Trash2, RefreshCw, Check, X, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { styleClonerApi } from '../../../services/api';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

interface ExtractedStyle {
  name: string;
  shortDescription: string;
  sourceIndustry: string;
  imagePrompt: {
    style: string;
    colorPalette: string;
    typography: string;
    elements: string;
    mood: string;
  };
  compositionNotes: string;
  avoidList: string;
  previewColors: string[];
  textPrompt: {
    tone: string;
    vocabulary: string[];
  };
}

interface CustomTheme {
  id: string;
  themeId: string;
  name: string;
  shortDescription: string;
  status: string;
  referenceImageUrl: string | null;
  previewImageUrl: string | null;
  previewColors: string[];
  sourceIndustry: string;
  createdAt: string;
}

type Phase = 'upload' | 'review' | 'test' | 'done';

export default function StyleClonerPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [phase, setPhase] = useState<Phase>('upload');
  const [referenceImage, setReferenceImage] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null);
  const [extractedStyle, setExtractedStyle] = useState<ExtractedStyle | null>(null);
  const [savedThemeId, setSavedThemeId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Existing themes query
  const { data: themesData, isLoading: loadingThemes } = useQuery({
    queryKey: ['custom-themes'],
    queryFn: () => styleClonerApi.getThemes().then(r => r.data),
  });
  const themes: CustomTheme[] = themesData?.data || [];

  // Mutations
  const analyzeMutation = useMutation({
    mutationFn: (data: { imageBase64: string; mimeType: string }) => styleClonerApi.analyze(data),
    onSuccess: (res) => {
      setExtractedStyle(res.data.data);
      setPhase('review');
      toast.success('Style extracted successfully!');
    },
    onError: () => toast.error('Failed to analyze style. Try a different image.'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => styleClonerApi.save(data),
    onSuccess: (res) => {
      setSavedThemeId(res.data.data.id);
      setPhase('test');
      queryClient.invalidateQueries({ queryKey: ['custom-themes'] });
      toast.success('Theme saved as draft!');
    },
    onError: () => toast.error('Failed to save theme.'),
  });

  const previewMutation = useMutation({
    mutationFn: (id: string) => styleClonerApi.preview(id),
    onSuccess: (res) => {
      setPreviewUrl(res.data.data.previewUrl);
      queryClient.invalidateQueries({ queryKey: ['custom-themes'] });
      toast.success('Preview generated!');
    },
    onError: () => toast.error('Preview generation failed. Try again.'),
  });

  const deployMutation = useMutation({
    mutationFn: (id: string) => styleClonerApi.deploy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-themes'] });
      toast.success('Theme deployed to all users!');
      resetWorkflow();
    },
    onError: () => toast.error('Failed to deploy theme.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => styleClonerApi.deleteTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-themes'] });
      toast.success('Theme archived.');
    },
  });

  // File handling
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type as string;
      setReferenceImage({ base64, mimeType, previewUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const resetWorkflow = () => {
    setPhase('upload');
    setReferenceImage(null);
    setExtractedStyle(null);
    setSavedThemeId(null);
    setPreviewUrl(null);
  };

  const handleAnalyze = () => {
    if (!referenceImage) return;
    analyzeMutation.mutate({
      imageBase64: referenceImage.base64,
      mimeType: referenceImage.mimeType,
    });
  };

  const handleSave = () => {
    if (!extractedStyle || !referenceImage) return;
    saveMutation.mutate({
      ...extractedStyle,
      referenceImageBase64: referenceImage.base64,
      referenceMimeType: referenceImage.mimeType,
    });
  };

  const handlePreview = () => {
    if (!savedThemeId) return;
    previewMutation.mutate(savedThemeId);
  };

  const handleDeploy = () => {
    if (!savedThemeId) return;
    deployMutation.mutate(savedThemeId);
  };

  const updateStyleField = (path: string, value: string) => {
    if (!extractedStyle) return;
    const updated = { ...extractedStyle };
    if (path.startsWith('imagePrompt.')) {
      const field = path.split('.')[1] as keyof ExtractedStyle['imagePrompt'];
      updated.imagePrompt = { ...updated.imagePrompt, [field]: value };
    } else {
      (updated as any)[path] = value;
    }
    setExtractedStyle(updated);
  };

  const statusColor = (status: string) => {
    if (status === 'approved') return 'bg-green-500';
    if (status === 'testing') return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const statusLabel = (status: string) => {
    if (status === 'approved') return 'LIVE';
    if (status === 'testing') return 'TESTING';
    return 'DRAFT';
  };

  // Resolve image URLs — prefix with API base if relative
  const resolveUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Strip /api/v1 from API_URL to get base server URL
    const base = API_URL.replace(/\/api\/v1\/?$/, '');
    return `${base}${url.startsWith('/') ? url : '/' + url}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-retro-navy">Style Cloner</h1>
        <p className="text-gray-600 mt-1">Upload any artwork, clone its style, deploy as a theme</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {(['upload', 'review', 'test'] as Phase[]).map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-sm border-2 ${
                phase === step
                  ? 'bg-retro-red text-white border-retro-red'
                  : i < ['upload', 'review', 'test'].indexOf(phase)
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-gray-200 text-gray-500 border-gray-300'
              }`}
            >
              {i < ['upload', 'review', 'test'].indexOf(phase) ? <Check size={14} /> : i + 1}
            </div>
            <span className="font-heading text-xs uppercase hidden sm:block">
              {step === 'upload' ? 'Upload' : step === 'review' ? 'Review' : 'Test & Deploy'}
            </span>
            {i < 2 && <div className="w-8 h-0.5 bg-gray-300" />}
          </div>
        ))}
        {phase !== 'upload' && (
          <button onClick={resetWorkflow} className="ml-auto text-sm text-gray-500 hover:text-retro-red flex items-center gap-1">
            <RefreshCw size={14} /> Start Over
          </button>
        )}
      </div>

      {/* Phase 1: Upload */}
      {phase === 'upload' && (
        <div className="border-4 border-black bg-white p-8 shadow-retro">
          <h2 className="font-heading text-xl uppercase mb-4">Upload Reference Image</h2>
          <p className="text-gray-600 text-sm mb-6">
            Find any flyer, poster, or artwork you like from any industry — restaurant, gym, retail, music — and upload it here.
            Our AI will extract the visual style and adapt it for auto repair shop marketing.
          </p>

          {!referenceImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-retro-red hover:bg-red-50 transition-all"
            >
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="font-heading text-lg uppercase text-gray-600">Drop image here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse (PNG, JPG, WebP — max 8MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <img
                src={referenceImage.previewUrl}
                alt="Reference"
                className="max-h-96 object-contain border-2 border-black"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setReferenceImage(null); }}
                  className="px-4 py-2 border-2 border-black text-sm font-heading uppercase hover:bg-gray-100"
                >
                  <X size={14} className="inline mr-1" /> Remove
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                  className="px-6 py-2 bg-retro-red text-white font-heading uppercase border-2 border-black shadow-retro hover:shadow-none transition-all disabled:opacity-50"
                >
                  {analyzeMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles size={16} /> Analyze Style
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 2: Review & Edit */}
      {phase === 'review' && extractedStyle && (
        <div className="border-4 border-black bg-white p-8 shadow-retro">
          <h2 className="font-heading text-xl uppercase mb-4">Review Extracted Style</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Reference Image */}
            <div>
              <p className="font-heading text-sm uppercase text-gray-500 mb-2">Reference Image</p>
              {referenceImage && (
                <img
                  src={referenceImage.previewUrl}
                  alt="Reference"
                  className="w-full object-contain border-2 border-black max-h-[500px]"
                />
              )}
              {/* Color Swatches */}
              {extractedStyle.previewColors?.length > 0 && (
                <div className="mt-4">
                  <p className="font-heading text-xs uppercase text-gray-500 mb-2">Extracted Colors</p>
                  <div className="flex gap-2">
                    {extractedStyle.previewColors.map((color, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-black rounded"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Editable Fields */}
            <div className="space-y-4">
              <div>
                <label className="font-heading text-xs uppercase text-gray-500">Style Name</label>
                <input
                  value={extractedStyle.name}
                  onChange={(e) => updateStyleField('name', e.target.value)}
                  className="w-full border-2 border-black p-2 font-heading text-lg"
                />
              </div>
              <div>
                <label className="font-heading text-xs uppercase text-gray-500">Description</label>
                <input
                  value={extractedStyle.shortDescription}
                  onChange={(e) => updateStyleField('shortDescription', e.target.value)}
                  className="w-full border-2 border-black p-2 text-sm"
                />
              </div>
              <div>
                <label className="font-heading text-xs uppercase text-gray-500">Source Industry</label>
                <input
                  value={extractedStyle.sourceIndustry}
                  onChange={(e) => updateStyleField('sourceIndustry', e.target.value)}
                  className="w-full border-2 border-black p-2 text-sm"
                />
              </div>

              <hr className="border-gray-200" />
              <p className="font-heading text-sm uppercase">Image Prompt Fields</p>

              {(['style', 'colorPalette', 'typography', 'elements', 'mood'] as const).map((field) => (
                <div key={field}>
                  <label className="font-heading text-xs uppercase text-gray-500">
                    {field === 'colorPalette' ? 'Color Palette' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <textarea
                    value={extractedStyle.imagePrompt[field]}
                    onChange={(e) => updateStyleField(`imagePrompt.${field}`, e.target.value)}
                    rows={3}
                    className="w-full border-2 border-black p-2 text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="font-heading text-xs uppercase text-gray-500">Composition Notes</label>
                <textarea
                  value={extractedStyle.compositionNotes}
                  onChange={(e) => updateStyleField('compositionNotes', e.target.value)}
                  rows={2}
                  className="w-full border-2 border-black p-2 text-sm"
                />
              </div>
              <div>
                <label className="font-heading text-xs uppercase text-gray-500">Avoid List</label>
                <textarea
                  value={extractedStyle.avoidList}
                  onChange={(e) => updateStyleField('avoidList', e.target.value)}
                  rows={2}
                  className="w-full border-2 border-black p-2 text-sm"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full py-3 bg-retro-navy text-white font-heading uppercase border-2 border-black shadow-retro hover:shadow-none transition-all disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save as Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Test & Deploy */}
      {phase === 'test' && (
        <div className="border-4 border-black bg-white p-8 shadow-retro">
          <h2 className="font-heading text-xl uppercase mb-4">Test & Deploy</h2>
          <p className="text-gray-600 text-sm mb-6">
            Generate a sample auto-repair flyer in this style to see how it looks. If you're happy, deploy it to all users.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Reference */}
            <div>
              <p className="font-heading text-sm uppercase text-gray-500 mb-2">Reference</p>
              {referenceImage && (
                <img
                  src={referenceImage.previewUrl}
                  alt="Reference"
                  className="w-full object-contain border-2 border-black max-h-[500px]"
                />
              )}
            </div>

            {/* Right: Preview */}
            <div>
              <p className="font-heading text-sm uppercase text-gray-500 mb-2">Generated Preview</p>
              {previewUrl ? (
                <img
                  src={resolveUrl(previewUrl)!}
                  alt="Preview"
                  className="w-full object-contain border-2 border-black max-h-[500px]"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 h-64 flex items-center justify-center">
                  <p className="text-gray-400 font-heading text-sm">Preview will appear here</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={handlePreview}
              disabled={previewMutation.isPending}
              className="px-6 py-3 bg-retro-navy text-white font-heading uppercase border-2 border-black shadow-retro hover:shadow-none transition-all disabled:opacity-50"
            >
              {previewMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Eye size={16} /> {previewUrl ? 'Regenerate' : 'Generate Preview'}
                </span>
              )}
            </button>

            {previewUrl && (
              <button
                onClick={handleDeploy}
                disabled={deployMutation.isPending}
                className="px-6 py-3 bg-green-600 text-white font-heading uppercase border-2 border-black shadow-retro hover:shadow-none transition-all disabled:opacity-50"
              >
                {deployMutation.isPending ? (
                  'Deploying...'
                ) : (
                  <span className="flex items-center gap-2">
                    <Rocket size={16} /> Deploy to All Users
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Theme Management Grid (always visible) */}
      <div className="mt-12">
        <h2 className="font-heading text-xl uppercase mb-4 flex items-center gap-2">
          <Palette size={20} /> Custom Themes
        </h2>

        {loadingThemes ? (
          <p className="text-gray-500 font-heading text-sm">Loading themes...</p>
        ) : themes.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">No custom themes yet. Upload a reference image above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <div key={theme.id} className="border-2 border-black bg-white shadow-retro overflow-hidden">
                {/* Image */}
                <div className="h-40 bg-gray-100 relative">
                  {theme.previewImageUrl ? (
                    <img
                      src={resolveUrl(theme.previewImageUrl)!}
                      alt={theme.name}
                      className="w-full h-full object-cover"
                    />
                  ) : theme.referenceImageUrl ? (
                    <img
                      src={resolveUrl(theme.referenceImageUrl)!}
                      alt={theme.name}
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="flex gap-1">
                        {(theme.previewColors || []).map((c, i) => (
                          <div key={i} className="w-8 h-20 rounded" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Status Badge */}
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 text-white text-xs font-heading uppercase ${statusColor(
                      theme.status
                    )}`}
                  >
                    {statusLabel(theme.status)}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-heading text-sm uppercase truncate">{theme.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{theme.shortDescription}</p>
                  <p className="text-xs text-gray-400 mt-1">From: {theme.sourceIndustry}</p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {theme.status !== 'approved' && (
                      <button
                        onClick={() => deployMutation.mutate(theme.id)}
                        className="flex-1 py-1.5 bg-green-600 text-white text-xs font-heading uppercase border border-black hover:bg-green-700"
                      >
                        Deploy
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(theme.id)}
                      className="py-1.5 px-3 bg-gray-200 text-gray-700 text-xs font-heading uppercase border border-black hover:bg-gray-300"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
