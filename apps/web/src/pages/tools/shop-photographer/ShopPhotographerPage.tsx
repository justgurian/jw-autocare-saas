import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { shopPhotographerApi } from '../../../services/api';
import { usePollJob } from '../../../hooks/usePollJob';
import toast from 'react-hot-toast';
import {
  Camera,
  Sparkles,
  Wand2,
  Upload,
  Sun,
  Moon,
  Lightbulb,
  Loader,
  Download,
  RefreshCw,
  ArrowLeft,
  Video,
  Image,
  FileText,
  X,
  Plus,
  Trash2,
  Monitor,
  Smartphone,
} from 'lucide-react';

interface SceneItem {
  id: string;
  name: string;
  shortDescription: string;
  category: string;
  suggestedCamera?: string;
}

interface AestheticItem {
  id: string;
  name: string;
  description: string;
  colorPalette?: string[];
}

const SCENE_CATEGORIES = [
  { id: 'action-shots', label: 'Action Shots' },
  { id: 'shop-atmosphere', label: 'Shop Atmosphere' },
  { id: 'detail-closeups', label: 'Detail Close-ups' },
  { id: 'team-culture', label: 'Team / Culture' },
  { id: 'customer-moments', label: 'Customer Moments' },
];

const ENHANCEMENT_STYLES = [
  { id: 'dramatic', label: 'Dramatic', description: 'Deep shadows, high contrast', Icon: Moon },
  { id: 'clean', label: 'Clean', description: 'Bright, minimal, modern', Icon: Sun },
  { id: 'moody', label: 'Moody', description: 'Dark tones, atmosphere', Icon: Moon },
  { id: 'bright', label: 'Bright', description: 'Vibrant, well-lit, cheerful', Icon: Lightbulb },
  { id: 'auto', label: 'Auto', description: 'AI picks the best style', Icon: Wand2 },
];

const OUTPUT_MODES = [
  { id: 'photo-only', label: 'Photo Only', Icon: Image },
  { id: 'photo-logo', label: '+ Logo', Icon: Camera },
  { id: 'photo-text', label: '+ Text Flyer', Icon: FileText },
  { id: 'video', label: 'Video', Icon: Video },
];

const IMAGE_RATIOS = [
  { id: '4:5', label: 'Timeline (4:5)', description: 'Instagram & Facebook feed', Icon: Smartphone },
  { id: '9:16', label: 'Reels (9:16)', description: 'Stories, Reels, TikTok', Icon: Smartphone },
];

const VIDEO_RATIOS = [
  { id: '9:16', label: 'Reels (9:16)', description: 'Vertical — Stories, Reels, TikTok', Icon: Smartphone },
  { id: '16:9', label: 'Widescreen (16:9)', description: 'Horizontal — YouTube, Facebook', Icon: Monitor },
];

export default function ShopPhotographerPage() {
  const queryClient = useQueryClient();

  // Wizard state
  const [mode, setMode] = useState<'select' | 'enhance' | 'generate'>('select');
  const [step, setStep] = useState(0);
  const [outputMode, setOutputMode] = useState<string>('photo-only');
  const [enhancementStyle, setEnhancementStyle] = useState('auto');
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [selectedAesthetic, setSelectedAesthetic] = useState<string | null>(null);
  const [sceneCategory, setSceneCategory] = useState('action-shots');
  const [shopSource, setShopSource] = useState<'photos' | 'style'>('style');
  const [uploadedPhoto, setUploadedPhoto] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [textContent, setTextContent] = useState({ headline: '', subheadline: '', cta: '' });
  const [imageAspectRatio, setImageAspectRatio] = useState<'4:5' | '9:16'>('4:5');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultIsVideo, setResultIsVideo] = useState(false);

  // Data fetching
  const { data: scenesData } = useQuery({
    queryKey: ['shop-photographer-scenes'],
    queryFn: () => shopPhotographerApi.getScenes().then(r => r.data),
  });

  const { data: aestheticsData } = useQuery({
    queryKey: ['shop-photographer-aesthetics'],
    queryFn: () => shopPhotographerApi.getAesthetics().then(r => r.data),
  });

  const { data: galleryData, refetch: refetchGallery } = useQuery({
    queryKey: ['shop-photographer-gallery'],
    queryFn: () => shopPhotographerApi.getGallery().then(r => r.data),
    enabled: mode === 'generate',
  });

  const scenes: SceneItem[] = scenesData?.data || [];
  const aesthetics: AestheticItem[] = aestheticsData?.data || [];
  const gallery: string[] = galleryData?.data || [];

  const filteredScenes = scenes.filter(s => s.category === sceneCategory);

  // Video polling
  const { job, isPolling, startPolling } = usePollJob({
    getJob: shopPhotographerApi.getJob,
    onComplete: (completedJob) => {
      setResultUrl(completedJob.videoUrl || '');
      setResultIsVideo(true);
      setStep(2);
      setIsGenerating(false);
      toast.success('Video created!');
    },
    onFailed: (failedJob) => {
      setIsGenerating(false);
      toast.error(failedJob.error || 'Video generation failed.');
    },
    onTimeout: () => {
      setIsGenerating(false);
      toast.error('Video generation timed out. Try again.');
    },
  });

  // File upload handler
  const handleFileUpload = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setUploadedPhoto({ base64, mimeType: file.type, preview: dataUrl });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  // Gallery upload
  const handleGalleryUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        await shopPhotographerApi.addToGallery({ imageBase64: base64, mimeType: file.type });
        queryClient.invalidateQueries({ queryKey: ['shop-photographer-gallery'] });
        toast.success('Photo added to gallery!');
      } catch {
        toast.error('Failed to upload photo.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFromGallery = async (index: number) => {
    try {
      await shopPhotographerApi.removeFromGallery(index);
      queryClient.invalidateQueries({ queryKey: ['shop-photographer-gallery'] });
      toast.success('Photo removed.');
    } catch {
      toast.error('Failed to remove photo.');
    }
  };

  // Enhance handler
  const handleEnhance = async () => {
    if (!uploadedPhoto) return;
    setIsGenerating(true);

    if (outputMode === 'video') {
      try {
        const response = await shopPhotographerApi.enhance({
          photoBase64: uploadedPhoto.base64,
          photoMimeType: uploadedPhoto.mimeType,
          outputMode: outputMode as any,
          enhancementStyle: enhancementStyle as any,
          aspectRatio: videoAspectRatio,
        });
        const jobId = response.data?.data?.job?.id || response.data?.data?.id || response.data?.id;
        if (jobId) {
          startPolling(jobId);
        }
      } catch {
        toast.error('Video generation failed.');
        setIsGenerating(false);
      }
      return;
    }

    try {
      const response = await shopPhotographerApi.enhance({
        photoBase64: uploadedPhoto.base64,
        photoMimeType: uploadedPhoto.mimeType,
        outputMode: outputMode as any,
        enhancementStyle: enhancementStyle as any,
        textContent: outputMode === 'photo-text' ? textContent : undefined,
        aspectRatio: imageAspectRatio,
      });
      setResultUrl(response.data?.data?.imageUrl || response.data?.imageUrl);
      setResultIsVideo(false);
      setStep(2);
      toast.success('Photo enhanced!');
    } catch {
      toast.error('Enhancement failed. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate handler
  const handleGenerate = async () => {
    if (!selectedScene) return;

    if (outputMode === 'video') {
      try {
        setIsGenerating(true);
        const response = await shopPhotographerApi.generateVideo({
          sceneId: selectedScene,
          aestheticId: selectedAesthetic || undefined,
          aspectRatio: videoAspectRatio,
        });
        const jobId = response.data?.data?.job?.id || response.data?.data?.id || response.data?.id;
        startPolling(jobId);
      } catch {
        toast.error('Video generation failed.');
        setIsGenerating(false);
      }
      return;
    }

    setIsGenerating(true);
    try {
      const response = await shopPhotographerApi.generate({
        sceneId: selectedScene,
        outputMode: outputMode as any,
        aestheticId: selectedAesthetic || undefined,
        textContent: outputMode === 'photo-text' ? textContent : undefined,
        aspectRatio: imageAspectRatio,
      });
      setResultUrl(response.data?.data?.imageUrl || response.data?.imageUrl);
      setResultIsVideo(false);
      setStep(2);
      toast.success('Photo generated!');
    } catch {
      toast.error('Generation failed. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Create video from current scene
  const handleCreateVideo = async () => {
    if (!selectedScene) return;
    try {
      setIsGenerating(true);
      setResultIsVideo(true);
      const response = await shopPhotographerApi.generateVideo({
        sceneId: selectedScene,
        aestheticId: selectedAesthetic || undefined,
        aspectRatio: videoAspectRatio,
      });
      const jobId = response.data?.data?.job?.id || response.data?.data?.id || response.data?.id;
      startPolling(jobId);
    } catch {
      toast.error('Video generation failed.');
      setIsGenerating(false);
    }
  };

  // Reset
  const resetAll = () => {
    setMode('select');
    setStep(0);
    setOutputMode('photo-only');
    setEnhancementStyle('auto');
    setSelectedScene(null);
    setSelectedAesthetic(null);
    setSceneCategory('action-shots');
    setShopSource('style');
    setUploadedPhoto(null);
    setTextContent({ headline: '', subheadline: '', cta: '' });
    setImageAspectRatio('4:5');
    setVideoAspectRatio('9:16');
    setResultUrl(null);
    setIsGenerating(false);
    setResultIsVideo(false);
  };

  const resetToStep1 = () => {
    setStep(1);
    setResultUrl(null);
    setResultIsVideo(false);
  };

  // ── RENDER ──

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-retro-navy">Shop Photographer</h1>
        <p className="font-heading text-sm text-gray-600 uppercase mt-2">
          Professional photography without hiring a photographer
        </p>
      </div>

      {/* Step 0: Mode Selection */}
      {step === 0 && mode === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => { setMode('enhance'); setStep(1); }}
            className="text-left p-8 bg-white border-4 border-black shadow-retro hover:bg-retro-cream transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-8 h-8 text-retro-red" />
              <Sparkles className="w-6 h-6 text-retro-mustard" />
            </div>
            <h2 className="font-display text-2xl text-retro-navy mb-2">Enhance My Photo</h2>
            <p className="font-heading text-sm text-gray-600 uppercase">
              Upload a real shop photo and transform it into professional content
            </p>
          </button>

          <button
            onClick={() => { setMode('generate'); setStep(1); }}
            className="text-left p-8 bg-white border-4 border-black shadow-retro hover:bg-retro-cream transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <Wand2 className="w-8 h-8 text-retro-red" />
            </div>
            <h2 className="font-display text-2xl text-retro-navy mb-2">Generate From Scratch</h2>
            <p className="font-heading text-sm text-gray-600 uppercase">
              AI creates stunning photography from scene templates
            </p>
          </button>
        </div>
      )}

      {/* Step 1a: Enhance Path */}
      {step === 1 && mode === 'enhance' && (
        <div className="space-y-8">
          <button
            onClick={resetAll}
            className="flex items-center gap-2 font-heading text-sm text-retro-navy uppercase hover:text-retro-red transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to mode selection
          </button>

          {/* Upload Zone */}
          <div className="bg-white border-4 border-black shadow-retro p-6">
            <h3 className="font-display text-xl text-retro-navy mb-4">Upload Your Photo</h3>
            {!uploadedPhoto ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-4 border-dashed border-gray-300 p-12 text-center cursor-pointer hover:border-retro-red transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="font-heading text-sm text-gray-600 uppercase mb-2">
                  Drag and drop your photo here
                </p>
                <p className="text-xs text-gray-400 mb-4">or</p>
                <label className="inline-block px-6 py-2 bg-retro-navy text-white font-heading text-sm uppercase border-2 border-black cursor-pointer hover:bg-retro-red transition-colors">
                  Browse Files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">Max 10MB. JPG, PNG, WebP</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={uploadedPhoto.preview}
                  alt="Uploaded"
                  className="w-full max-h-[400px] object-contain border-2 border-black"
                />
                <button
                  onClick={() => setUploadedPhoto(null)}
                  className="absolute top-2 right-2 p-1 bg-white border-2 border-black hover:bg-red-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Enhancement Style */}
          <div className="bg-white border-4 border-black shadow-retro p-6">
            <h3 className="font-display text-xl text-retro-navy mb-4">Enhancement Style</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ENHANCEMENT_STYLES.map(({ id, label, description, Icon }) => (
                <button
                  key={id}
                  onClick={() => setEnhancementStyle(id)}
                  className={`p-4 border-2 border-black text-center transition-colors ${
                    enhancementStyle === id
                      ? 'bg-retro-red text-white'
                      : 'bg-white hover:bg-retro-cream'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-heading text-xs uppercase font-bold">{label}</p>
                  <p className={`text-xs mt-1 ${enhancementStyle === id ? 'text-red-100' : 'text-gray-500'}`}>
                    {description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Output Mode */}
          <div className="bg-white border-4 border-black shadow-retro p-6">
            <h3 className="font-display text-xl text-retro-navy mb-4">Output Mode</h3>
            <div className="flex flex-wrap gap-2">
              {OUTPUT_MODES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setOutputMode(id)}
                  className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-heading text-sm uppercase transition-colors ${
                    outputMode === id
                      ? 'bg-retro-red text-white'
                      : 'bg-white hover:bg-retro-cream'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="bg-white border-4 border-black shadow-retro p-6">
            <h3 className="font-display text-xl text-retro-navy mb-4">
              {outputMode === 'video' ? 'Video Format' : 'Image Format'}
            </h3>
            <div className="flex flex-wrap gap-3">
              {(outputMode === 'video' ? VIDEO_RATIOS : IMAGE_RATIOS).map(({ id, label, description, Icon }) => (
                <button
                  key={id}
                  onClick={() => outputMode === 'video'
                    ? setVideoAspectRatio(id as '9:16' | '16:9')
                    : setImageAspectRatio(id as '4:5' | '9:16')
                  }
                  className={`flex items-center gap-3 px-5 py-3 border-2 border-black transition-colors ${
                    (outputMode === 'video' ? videoAspectRatio : imageAspectRatio) === id
                      ? 'bg-retro-red text-white'
                      : 'bg-white hover:bg-retro-cream'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-heading text-xs uppercase font-bold">{label}</p>
                    <p className={`text-xs ${(outputMode === 'video' ? videoAspectRatio : imageAspectRatio) === id ? 'text-red-100' : 'text-gray-500'}`}>
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Fields (conditional) */}
          {outputMode === 'photo-text' && (
            <div className="bg-white border-4 border-black shadow-retro p-6">
              <h3 className="font-display text-xl text-retro-navy mb-4">Text Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-heading text-xs uppercase text-gray-600 mb-1">
                    Headline *
                  </label>
                  <input
                    type="text"
                    value={textContent.headline}
                    onChange={(e) => setTextContent(prev => ({ ...prev, headline: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-black font-heading text-sm"
                    placeholder="Your main headline"
                  />
                </div>
                <div>
                  <label className="block font-heading text-xs uppercase text-gray-600 mb-1">
                    Subheadline
                  </label>
                  <input
                    type="text"
                    value={textContent.subheadline}
                    onChange={(e) => setTextContent(prev => ({ ...prev, subheadline: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-black font-heading text-sm"
                    placeholder="Optional subheadline"
                  />
                </div>
                <div>
                  <label className="block font-heading text-xs uppercase text-gray-600 mb-1">
                    Call to Action
                  </label>
                  <input
                    type="text"
                    value={textContent.cta}
                    onChange={(e) => setTextContent(prev => ({ ...prev, cta: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-black font-heading text-sm"
                    placeholder="Call Today!"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transform Button */}
          <button
            onClick={handleEnhance}
            disabled={!uploadedPhoto || isGenerating || (outputMode === 'photo-text' && !textContent.headline)}
            className="w-full py-4 bg-retro-red text-white font-display text-xl uppercase border-4 border-black shadow-retro disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-3">
                <Loader className="w-6 h-6 animate-spin" />
                {isPolling ? `Creating video... ${job?.progress || 0}%` : 'Enhancing your photo...'}
              </span>
            ) : (
              'Transform'
            )}
          </button>
        </div>
      )}

      {/* Step 1b: Generate Path */}
      {step === 1 && mode === 'generate' && (
        <div className="space-y-8">
          <button
            onClick={resetAll}
            className="flex items-center gap-2 font-heading text-sm text-retro-navy uppercase hover:text-retro-red transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to mode selection
          </button>

          {/* Scene Picker */}
          <div className="bg-white border-4 border-black shadow-retro p-6">
            <h3 className="font-display text-xl text-retro-navy mb-4">Choose a Scene</h3>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {SCENE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSceneCategory(cat.id)}
                  className={`px-4 py-2 border-2 border-black font-heading text-xs uppercase transition-colors ${
                    sceneCategory === cat.id
                      ? 'bg-retro-navy text-white'
                      : 'bg-white hover:bg-retro-cream'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Scene Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScenes.length > 0 ? (
                filteredScenes.map(scene => (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedScene(scene.id)}
                    className={`text-left p-4 border-2 transition-colors ${
                      selectedScene === scene.id
                        ? 'border-retro-red bg-red-50'
                        : 'border-black hover:bg-retro-cream'
                    }`}
                  >
                    <p className="font-heading text-sm uppercase font-bold text-retro-navy">{scene.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{scene.shortDescription}</p>
                    {scene.suggestedCamera && (
                      <p className="text-xs text-gray-400 mt-2 italic">{scene.suggestedCamera}</p>
                    )}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-3">
                  {scenes.length === 0 ? 'Loading scenes...' : 'No scenes in this category.'}
                </p>
              )}
            </div>
          </div>

          {/* Shop Source */}
          <div className="bg-white border-4 border-black shadow-retro p-6">
            <h3 className="font-display text-xl text-retro-navy mb-4">Shop Source</h3>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setShopSource('photos')}
                className={`flex-1 px-4 py-3 border-2 border-black font-heading text-sm uppercase transition-colors ${
                  shopSource === 'photos'
                    ? 'bg-retro-navy text-white'
                    : 'bg-white hover:bg-retro-cream'
                }`}
              >
                Use My Photos
              </button>
              <button
                onClick={() => setShopSource('style')}
                className={`flex-1 px-4 py-3 border-2 border-black font-heading text-sm uppercase transition-colors ${
                  shopSource === 'style'
                    ? 'bg-retro-navy text-white'
                    : 'bg-white hover:bg-retro-cream'
                }`}
              >
                Pick a Style
              </button>
            </div>

            {shopSource === 'photos' && (
              <div>
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                    {gallery.map((imgUrl, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={imgUrl}
                          alt={`Gallery ${i + 1}`}
                          className="w-full h-24 object-cover border-2 border-black"
                        />
                        <button
                          onClick={() => handleRemoveFromGallery(i)}
                          className="absolute top-1 right-1 p-0.5 bg-white border border-black opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No photos in your gallery yet.</p>
                )}
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-retro-cream border-2 border-black font-heading text-xs uppercase cursor-pointer hover:bg-retro-mustard transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGalleryUpload(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {shopSource === 'style' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aesthetics.length > 0 ? (
                  aesthetics.map(aes => (
                    <button
                      key={aes.id}
                      onClick={() => setSelectedAesthetic(aes.id)}
                      className={`text-left p-4 border-2 transition-colors ${
                        selectedAesthetic === aes.id
                          ? 'border-retro-red bg-red-50'
                          : 'border-black hover:bg-retro-cream'
                      }`}
                    >
                      <p className="font-heading text-sm uppercase font-bold text-retro-navy">{aes.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{aes.description}</p>
                      {aes.colorPalette && aes.colorPalette.length > 0 && (
                        <div className="flex gap-1 mt-3">
                          {aes.colorPalette.map((color, i) => (
                            <span
                              key={i}
                              className="w-5 h-5 rounded-full border border-black"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 col-span-3">Loading aesthetics...</p>
                )}
              </div>
            )}
          </div>

          {/* Output Mode */}
          <div className="bg-white border-4 border-black shadow-retro p-6">
            <h3 className="font-display text-xl text-retro-navy mb-4">Output Mode</h3>
            <div className="flex flex-wrap gap-2">
              {OUTPUT_MODES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setOutputMode(id)}
                  className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-heading text-sm uppercase transition-colors ${
                    outputMode === id
                      ? 'bg-retro-red text-white'
                      : 'bg-white hover:bg-retro-cream'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="bg-white border-4 border-black shadow-retro p-6">
            <h3 className="font-display text-xl text-retro-navy mb-4">
              {outputMode === 'video' ? 'Video Format' : 'Image Format'}
            </h3>
            <div className="flex flex-wrap gap-3">
              {(outputMode === 'video' ? VIDEO_RATIOS : IMAGE_RATIOS).map(({ id, label, description, Icon }) => (
                <button
                  key={id}
                  onClick={() => outputMode === 'video'
                    ? setVideoAspectRatio(id as '9:16' | '16:9')
                    : setImageAspectRatio(id as '4:5' | '9:16')
                  }
                  className={`flex items-center gap-3 px-5 py-3 border-2 border-black transition-colors ${
                    (outputMode === 'video' ? videoAspectRatio : imageAspectRatio) === id
                      ? 'bg-retro-red text-white'
                      : 'bg-white hover:bg-retro-cream'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-heading text-xs uppercase font-bold">{label}</p>
                    <p className={`text-xs ${(outputMode === 'video' ? videoAspectRatio : imageAspectRatio) === id ? 'text-red-100' : 'text-gray-500'}`}>
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Fields (conditional) */}
          {outputMode === 'photo-text' && (
            <div className="bg-white border-4 border-black shadow-retro p-6">
              <h3 className="font-display text-xl text-retro-navy mb-4">Text Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-heading text-xs uppercase text-gray-600 mb-1">
                    Headline *
                  </label>
                  <input
                    type="text"
                    value={textContent.headline}
                    onChange={(e) => setTextContent(prev => ({ ...prev, headline: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-black font-heading text-sm"
                    placeholder="Your main headline"
                  />
                </div>
                <div>
                  <label className="block font-heading text-xs uppercase text-gray-600 mb-1">
                    Subheadline
                  </label>
                  <input
                    type="text"
                    value={textContent.subheadline}
                    onChange={(e) => setTextContent(prev => ({ ...prev, subheadline: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-black font-heading text-sm"
                    placeholder="Optional subheadline"
                  />
                </div>
                <div>
                  <label className="block font-heading text-xs uppercase text-gray-600 mb-1">
                    Call to Action
                  </label>
                  <input
                    type="text"
                    value={textContent.cta}
                    onChange={(e) => setTextContent(prev => ({ ...prev, cta: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-black font-heading text-sm"
                    placeholder="Call Today!"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!selectedScene || isGenerating || (outputMode === 'photo-text' && !textContent.headline)}
            className="w-full py-4 bg-retro-red text-white font-display text-xl uppercase border-4 border-black shadow-retro disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-3">
                <Loader className="w-6 h-6 animate-spin" />
                {isPolling ? `Creating video... ${job?.progress || 0}%` : 'Generating...'}
              </span>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      )}

      {/* Step 2: Result Display */}
      {step === 2 && resultUrl && (
        <div className="space-y-6">
          <button
            onClick={resetAll}
            className="flex items-center gap-2 font-heading text-sm text-retro-navy uppercase hover:text-retro-red transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Start Over
          </button>

          <div className="bg-white border-4 border-black shadow-retro p-4">
            {resultIsVideo ? (
              <video
                src={resultUrl}
                controls
                className="w-full max-h-[600px] border-4 border-black shadow-retro"
              />
            ) : (
              <img
                src={resultUrl}
                alt="Generated result"
                className="w-full max-h-[600px] object-contain border-4 border-black shadow-retro"
              />
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-2 px-6 py-3 bg-retro-navy text-white font-heading text-sm uppercase border-2 border-black hover:bg-retro-red transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <button
              onClick={resetToStep1}
              className="flex items-center gap-2 px-6 py-3 bg-white text-retro-navy font-heading text-sm uppercase border-2 border-black hover:bg-retro-cream transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Again
            </button>
            {!resultIsVideo && outputMode !== 'video' && mode === 'generate' && selectedScene && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateVideo}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-3 bg-retro-mustard text-retro-navy font-heading text-sm uppercase border-2 border-black hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  <Video className="w-4 h-4" />
                  Create Video
                </button>
                <select
                  value={videoAspectRatio}
                  onChange={(e) => setVideoAspectRatio(e.target.value as '9:16' | '16:9')}
                  className="px-3 py-3 border-2 border-black font-heading text-xs uppercase bg-white"
                >
                  <option value="9:16">9:16 Reels</option>
                  <option value="16:9">16:9 Widescreen</option>
                </select>
              </div>
            )}
            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-600 font-heading text-sm uppercase border-2 border-black hover:bg-retro-cream transition-colors"
            >
              Start Over
            </button>
          </div>

          {/* Video polling progress (when creating video from result) */}
          {isGenerating && isPolling && (
            <div className="bg-white border-4 border-black shadow-retro p-6">
              <div className="flex items-center gap-3 mb-3">
                <Loader className="w-5 h-5 animate-spin text-retro-red" />
                <p className="font-heading text-sm uppercase text-retro-navy">
                  Creating video... {job?.progress || 0}%
                </p>
              </div>
              <div className="w-full bg-gray-200 border-2 border-black h-4">
                <div
                  className="h-full bg-retro-red transition-all duration-500"
                  style={{ width: `${job?.progress || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
