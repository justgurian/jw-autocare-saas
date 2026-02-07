import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { directorsCutApi, contentApi } from '../../../services/api';
import {
  Clapperboard,
  Loader,
  Download,
  Share2,
  RefreshCw,
  Check,
  Sparkles,
  ArrowRight,
  Wind,
  Flame,
  Snowflake,
  DollarSign,
  MonitorSmartphone,
  Bird,
  Rewind,
  Maximize2,
  MoveRight,
  ZoomIn,
  Gauge,
  CloudFog,
  Timer,
  Zap,
  Car,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from '../../../components/features/ShareModal';
import { usePollJob } from '../../../hooks/usePollJob';

interface Effect {
  id: string;
  name: string;
  icon: typeof Flame;
}

const EFFECTS: Effect[] = [
  { id: 'the-burnout', name: 'The Burnout', icon: Flame },
  { id: 'the-lowrider', name: 'The Lowrider', icon: Car },
  { id: 'time-traveler', name: 'Time Traveler', icon: Zap },
  { id: 'alien-abduction', name: 'Alien Abduction', icon: Sparkles },
  { id: 'flash-freeze', name: 'Flash Freeze', icon: Snowflake },
  { id: 'cash-storm', name: 'Cash Storm', icon: DollarSign },
  { id: 'screen-crack', name: 'Screen Crack', icon: MonitorSmartphone },
  { id: 'duck-avalanche', name: 'Duck Avalanche', icon: Bird },
  { id: 'vcr-glitch', name: 'VCR Glitch', icon: Rewind },
  { id: 'exploded-view', name: 'Exploded View', icon: Maximize2 },
  { id: 'drive-away', name: 'Drive Away', icon: MoveRight },
  { id: 'crash-zoom', name: 'Crash Zoom', icon: ZoomIn },
  { id: 'speed-blur', name: 'Speed Blur', icon: Gauge },
  { id: 'dust-storm', name: 'Dust Storm', icon: CloudFog },
  { id: 'slow-creep', name: 'Slow Creep', icon: Timer },
];

interface Flyer {
  id: string;
  title: string;
  imageUrl: string;
}

interface GeneratedVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
}

export default function DirectorsCutPage() {
  const [searchParams] = useSearchParams();
  const preselectedFlyerId = searchParams.get('flyerId');

  const [selectedFlyer, setSelectedFlyer] = useState<Flyer | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<'4s' | '6s' | '8s'>('6s');
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Fetch recent flyers
  const { data: flyersData, isLoading: flyersLoading } = useQuery({
    queryKey: ['flyers-for-animation'],
    queryFn: () => contentApi.getAll({ tool: 'promo_flyer', limit: 20 }).then((res) => res.data),
  });

  const flyers: Flyer[] = (flyersData?.data || []).map((c: any) => ({
    id: c.id,
    title: c.title || 'Untitled Flyer',
    imageUrl: c.imageUrl || c.metadata?.imageUrl,
  }));

  // Auto-select pre-selected flyer
  if (preselectedFlyerId && !selectedFlyer && flyers.length > 0) {
    const found = flyers.find((f) => f.id === preselectedFlyerId);
    if (found) setSelectedFlyer(found);
  }

  // Polling
  const { job: currentJob, startPolling } = usePollJob({
    getJob: directorsCutApi.getJob,
    onComplete: (job) => {
      setGeneratedVideo({
        id: job.id,
        videoUrl: job.videoUrl || '',
        thumbnailUrl: job.thumbnailUrl || '',
        caption: job.caption || '',
      });
      toast.success('Animation complete!');
    },
    onFailed: (job) => {
      toast.error(job.error || 'Animation failed');
    },
    onTimeout: () => {
      toast.error('Animation timed out. Please try again.');
    },
  });

  // Animate mutation
  const animateMutation = useMutation({
    mutationFn: () =>
      directorsCutApi.animate(selectedFlyer!.id, {
        effectId: selectedEffect!.id,
        aspectRatio,
        duration,
      }),
    onSuccess: (response) => {
      const job = response.data.data?.job || response.data.job;
      startPolling(job.id);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to start animation');
    },
  });

  const handleAnimate = () => {
    if (!selectedFlyer) {
      toast.error('Please select a flyer');
      return;
    }
    if (!selectedEffect) {
      toast.error('Please select an effect');
      return;
    }
    animateMutation.mutate();
  };

  const handleReset = () => {
    setSelectedFlyer(null);
    setSelectedEffect(null);
    setGeneratedVideo(null);
  };

  const handleDownload = async () => {
    if (!generatedVideo?.videoUrl) return;
    try {
      const response = await fetch(generatedVideo.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `directors-cut-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Downloading video...');
    } catch {
      window.open(generatedVideo.videoUrl, '_blank');
    }
  };

  const isGenerating = currentJob && (currentJob.status === 'pending' || currentJob.status === 'processing') && !generatedVideo;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro flex items-center justify-center gap-3">
          <Clapperboard className="text-retro-mustard" />
          Director's Cut Studio
        </h1>
        <p className="text-gray-600 mt-2">Animate your flyers with cinematic effects</p>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Flyer Preview */}
        <div className="card-retro min-h-[500px] flex flex-col">
          {generatedVideo ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-3">
                <Check size={20} />
                <span className="font-heading text-lg uppercase">Animation Ready!</span>
              </div>
              <video
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full border-2 border-black shadow-retro flex-1 object-contain"
                src={generatedVideo.videoUrl}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleDownload}
                  className="btn-retro-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Download
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="btn-retro-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Share2 size={18} /> Share
                </button>
              </div>
              <button
                onClick={handleReset}
                className="btn-retro-outline w-full mt-3 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> Create Another
              </button>
            </div>
          ) : isGenerating && currentJob ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              {selectedFlyer && (
                <div className="relative w-full mb-6">
                  <img
                    src={selectedFlyer.imageUrl}
                    alt={selectedFlyer.title}
                    className="w-full border-2 border-black opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="text-center text-white">
                      <Loader className="w-12 h-12 animate-spin mx-auto mb-3" />
                      <p className="font-heading uppercase">Animating...</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-full bg-retro-red rounded-full transition-all duration-500"
                  style={{ width: `${currentJob.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{currentJob.progress}% complete</p>
            </div>
          ) : selectedFlyer ? (
            <div className="flex-1 flex flex-col">
              <h3 className="font-heading text-sm uppercase text-gray-500 mb-3">Selected Flyer</h3>
              <img
                src={selectedFlyer.imageUrl}
                alt={selectedFlyer.title}
                className="w-full border-2 border-black shadow-retro flex-1 object-contain"
              />
              <button
                onClick={() => setSelectedFlyer(null)}
                className="text-sm text-gray-500 hover:text-retro-red mt-3 underline"
              >
                Change flyer
              </button>
            </div>
          ) : (
            <div className="flex-1">
              <h3 className="font-heading text-sm uppercase text-gray-500 mb-3">Choose a Flyer</h3>
              {flyersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-retro-red" size={32} />
                </div>
              ) : flyers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Clapperboard size={48} className="mx-auto mb-3" />
                  <p className="font-heading">No Flyers Found</p>
                  <p className="text-sm mt-1">Create some flyers first to animate them.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                  {flyers.map((flyer) => (
                    <button
                      key={flyer.id}
                      onClick={() => setSelectedFlyer(flyer)}
                      className="border-2 border-gray-300 hover:border-retro-red transition-all overflow-hidden"
                    >
                      <img src={flyer.imageUrl} alt={flyer.title} className="w-full aspect-[4/5] object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Effect Selector */}
        <div className="card-retro bg-gray-900 text-white min-h-[500px] flex flex-col">
          <h3 className="font-heading text-lg uppercase mb-4 text-white">Select Action</h3>

          {/* Effect list */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px] pr-1">
            {EFFECTS.map((effect) => {
              const Icon = effect.icon;
              return (
                <button
                  key={effect.id}
                  onClick={() => setSelectedEffect(effect)}
                  className={`w-full flex items-center gap-3 py-3 px-4 border-2 transition-all ${
                    selectedEffect?.id === effect.id
                      ? 'border-retro-red bg-red-900/40 text-white'
                      : 'border-gray-600 hover:bg-gray-800 text-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-heading uppercase text-sm">{effect.name}</span>
                </button>
              );
            })}
          </div>

          {/* Options */}
          <div className="mt-4 space-y-3 border-t border-gray-700 pt-4">
            {/* Aspect Ratio */}
            <div>
              <label className="block font-heading text-xs uppercase text-gray-400 mb-1">Aspect Ratio</label>
              <div className="flex gap-2">
                {(['16:9', '9:16'] as const).map((ar) => (
                  <button
                    key={ar}
                    onClick={() => setAspectRatio(ar)}
                    className={`flex-1 py-1.5 border-2 font-heading text-xs ${
                      aspectRatio === ar
                        ? 'border-retro-red bg-retro-red text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block font-heading text-xs uppercase text-gray-400 mb-1">Duration</label>
              <div className="flex gap-2">
                {(['4s', '6s', '8s'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-1.5 border-2 font-heading text-xs ${
                      duration === d
                        ? 'border-retro-red bg-retro-red text-white'
                        : 'border-gray-600 text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Animate Button */}
            <button
              onClick={handleAnimate}
              disabled={!selectedFlyer || !selectedEffect || animateMutation.isPending || !!isGenerating}
              className="w-full btn-retro-primary flex items-center justify-center gap-2 disabled:opacity-50 py-3"
            >
              {animateMutation.isPending || isGenerating ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <ArrowRight size={20} />
              )}
              ANIMATE
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {generatedVideo && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: generatedVideo.id,
            title: `Director's Cut - ${selectedEffect?.name || 'Animation'}`,
            imageUrl: generatedVideo.thumbnailUrl,
            caption: generatedVideo.caption,
          }}
        />
      )}
    </div>
  );
}
