import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { videoCreatorApi } from '../../services/api';
import { Video, X, Loader, Download, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePollJob } from '../../hooks/usePollJob';

interface VideoFromFlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  flyerId: string;
  flyerTitle?: string;
  flyerImageUrl?: string;
}

const PRESETS = [
  { id: 'burnout', name: 'Burnout', icon: '\uD83D\uDD25', description: 'Car peels out with tire smoke and engine roar' },
  { id: 'money-rain', name: 'Money Rain', icon: '\uD83D\uDCB0', description: 'Cash rains down over your deal' },
  { id: 'cinematic-reveal', name: 'Cinematic Reveal', icon: '\uD83C\uDFAC', description: 'Dramatic reveal with epic lighting' },
  { id: 'neon-sign', name: 'Neon Sign', icon: '\uD83D\uDCA1', description: 'Vintage neon sign lights up at night' },
] as const;

const STYLE_OPTIONS = [
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'animated', label: 'Animated' },
  { value: 'retro', label: 'Retro' },
];

const ASPECT_RATIO_OPTIONS = [
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
];

const DURATION_OPTIONS = [
  { value: '4s', label: '4 seconds' },
  { value: '6s', label: '6 seconds' },
  { value: '8s', label: '8 seconds' },
];

export default function VideoFromFlyerModal({
  isOpen,
  onClose,
  flyerId,
  flyerTitle,
  flyerImageUrl,
}: VideoFromFlyerModalProps) {
  const [style, setStyle] = useState<string>('commercial');
  const [aspectRatio, setAspectRatio] = useState<string>('9:16');
  const [duration, setDuration] = useState<string>('8s');
  const [phase, setPhase] = useState<'preset' | 'generating' | 'done'>('preset');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { job, startPolling } = usePollJob({
    onComplete: (completedJob) => {
      setVideoUrl(completedJob.videoUrl || '');
      setPhase('done');
      toast.success('Video ready!');
    },
    onFailed: (failedJob) => {
      toast.error(failedJob.error || 'Video generation failed');
      setPhase('preset');
    },
    onTimeout: () => {
      toast.error('Video generation timed out. Please try again.');
      setPhase('preset');
    },
  });

  const generateMutation = useMutation({
    mutationFn: (options: {
      animationPreset?: string;
      style?: string;
      aspectRatio?: string;
      duration?: string;
    }) =>
      videoCreatorApi.generateFromFlyer(flyerId, options as Parameters<typeof videoCreatorApi.generateFromFlyer>[1]),
    onSuccess: (res) => {
      const jobId = res.data?.data?.job?.id;
      if (jobId) {
        setPhase('generating');
        startPolling(jobId);
      } else {
        toast.error('Unexpected response from server');
      }
    },
    onError: () => {
      toast.error('Failed to start video generation');
    },
  });

  const handlePresetSelect = (presetId: string) => {
    generateMutation.mutate({ animationPreset: presetId });
  };

  const handleCustomGenerate = () => {
    generateMutation.mutate({
      style: style as 'cinematic' | 'commercial' | 'social-media' | 'documentary' | 'animated' | 'retro',
      aspectRatio: aspectRatio as '16:9' | '9:16',
      duration: duration as '4s' | '6s' | '8s',
    });
  };

  const handleClose = () => {
    setPhase('preset');
    setVideoUrl(null);
    setShowAdvanced(false);
    onClose();
  };

  const handleDownloadVideo = async () => {
    if (!videoUrl) return;
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bayfiller-video-${flyerTitle || Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Fallback: open in new tab
      window.open(videoUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  const progress = job?.progress || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card-retro border-2 border-black shadow-retro bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black bg-gray-50">
          <h2 className="font-heading text-lg uppercase flex items-center gap-2">
            <Video size={20} />
            Turn into Video
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Flyer Preview */}
        {flyerImageUrl && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-4 items-center">
              <img
                src={flyerImageUrl}
                alt={flyerTitle || 'Flyer preview'}
                className="w-20 h-20 object-cover border-2 border-black"
              />
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm uppercase truncate">
                  {flyerTitle || 'Untitled Flyer'}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Sparkles size={12} className="text-retro-mustard" />
                  Will be animated into a video
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preset Phase */}
        {phase === 'preset' && (
          <div className="p-4 space-y-4">
            {/* Preset Cards - 2x2 Grid */}
            <div>
              <label className="block font-heading text-sm uppercase mb-3">
                Choose an Animation
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    disabled={generateMutation.isPending}
                    className="group p-4 border-2 border-gray-200 hover:border-retro-navy hover:bg-gray-50 transition-all text-left flex flex-col items-center text-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-3xl">{preset.icon}</span>
                    <span className="font-heading text-sm uppercase">{preset.name}</span>
                    <span className="text-xs text-gray-500 leading-tight">{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Loading indicator when a preset was just clicked */}
            {generateMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader size={16} className="animate-spin" />
                Starting generation...
              </div>
            )}

            {/* Advanced Options Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
            >
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              Advanced Options
            </button>

            {/* Advanced Options (Collapsible) */}
            {showAdvanced && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                {/* Style Selector */}
                <div>
                  <label className="block font-heading text-sm uppercase mb-2">
                    Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setStyle(opt.value)}
                        className={`py-2 px-3 text-xs font-heading uppercase border-2 transition-all ${
                          style === opt.value
                            ? 'border-black bg-retro-navy text-white'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div>
                  <label className="block font-heading text-sm uppercase mb-2">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ASPECT_RATIO_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAspectRatio(opt.value)}
                        className={`py-2 px-3 text-xs font-heading uppercase border-2 transition-all ${
                          aspectRatio === opt.value
                            ? 'border-black bg-retro-navy text-white'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selector */}
                <div>
                  <label className="block font-heading text-sm uppercase mb-2">
                    Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDuration(opt.value)}
                        className={`py-2 px-3 text-xs font-heading uppercase border-2 transition-all ${
                          duration === opt.value
                            ? 'border-black bg-retro-navy text-white'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Custom Button */}
                <button
                  onClick={handleCustomGenerate}
                  disabled={generateMutation.isPending}
                  className="btn-retro-primary w-full flex items-center justify-center gap-2"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Custom
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Generating Phase */}
        {phase === 'generating' && (
          <div className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <Loader size={48} className="animate-spin text-retro-navy" />
            </div>
            <div>
              <p className="font-heading text-lg uppercase">Generating Video</p>
              <p className="text-sm text-gray-500 mt-1">
                This may take a minute...
              </p>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 border-2 border-black h-6 overflow-hidden">
              <div
                className="h-full bg-retro-teal transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-heading uppercase text-gray-600">
              {progress}% Complete
            </p>
          </div>
        )}

        {/* Done Phase */}
        {phase === 'done' && videoUrl && (
          <div className="p-4 space-y-4">
            <div className="border-2 border-black overflow-hidden bg-black">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadVideo}
                className="btn-retro-primary flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={handleClose}
                className="btn-retro-outline flex items-center justify-center gap-2"
              >
                <X size={18} />
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
