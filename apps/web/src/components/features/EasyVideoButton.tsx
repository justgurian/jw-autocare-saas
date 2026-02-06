import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { videoCreatorApi } from '../../services/api';
import { Film, Download, RefreshCw, Sparkles, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePollJob } from '../../hooks/usePollJob';

interface EasyVideoButtonProps {
  size?: 'default' | 'hero';
}

export default function EasyVideoButton({ size = 'default' }: EasyVideoButtonProps) {
  const [phase, setPhase] = useState<'idle' | 'generating' | 'done'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const isHero = size === 'hero';

  const { job, startPolling } = usePollJob({
    onComplete: (completedJob) => {
      setVideoUrl(completedJob.videoUrl || '');
      setPhase('done');
      toast.success('Video ready!');
    },
    onFailed: (failedJob) => {
      toast.error(failedJob.error || 'Video generation failed');
      setPhase('idle');
    },
    onTimeout: () => {
      toast.error('Video generation timed out. Please try again.');
      setPhase('idle');
    },
  });

  const instantMutation = useMutation({
    mutationFn: () => videoCreatorApi.instant(),
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
      toast.error('Video generation failed. Please try again.');
    },
  });

  const handlePush = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    instantMutation.mutate();
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bayfiller-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Fallback: open in new tab
      window.open(videoUrl, '_blank');
    }
  };

  const handleGenerateAnother = () => {
    setVideoUrl(null);
    setPhase('idle');
  };

  const progress = job?.progress || 0;

  return (
    <div className="w-full">
      {/* Idle - Push to Start */}
      {phase === 'idle' && !instantMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-8">
          <p className={`text-gray-600 mb-6 text-center max-w-md ${isHero ? 'text-base' : 'text-sm'}`}>
            One click creates an AI-powered commercial video for your shop.
            No setup required.
          </p>

          <button
            onClick={handlePush}
            aria-label="Generate video"
            className={`
              relative rounded-full
              bg-gradient-to-b from-gray-800 to-gray-900
              border-8 border-gray-700
              transition-all duration-100
              active:scale-95
              ${isHero ? 'w-56 h-56' : 'w-40 h-40'}
              ${isPressed ? 'scale-95' : ''}
              ${isHero
                ? 'easy-button-pulse hover:shadow-[0_0_0_8px_#1f2937,0_0_80px_rgba(59,130,246,0.6)]'
                : 'shadow-[0_0_0_8px_#1f2937,0_0_40px_rgba(0,0,0,0.5)] hover:shadow-[0_0_0_8px_#1f2937,0_0_60px_rgba(59,130,246,0.3)]'
              }
              group
            `}
          >
            {/* Outer ring glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-600/20 to-transparent" />

            {/* Inner button surface */}
            <div className={`
              absolute inset-4 rounded-full
              bg-gradient-to-b from-gray-700 to-gray-800
              border-4 border-gray-600
              flex flex-col items-center justify-center
              transition-all duration-100
              ${isPressed ? 'from-blue-700 to-blue-800' : ''}
              group-hover:from-blue-800 group-hover:to-blue-900
            `}>
              <Film
                size={isHero ? 56 : 48}
                className={`
                  text-blue-400 mb-1
                  transition-all duration-300
                  group-hover:text-blue-300 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]
                  ${isPressed ? 'text-blue-200 drop-shadow-[0_0_15px_rgba(59,130,246,1)]' : ''}
                `}
              />

              {isHero ? (
                <>
                  <span className="text-xs font-bold tracking-widest text-gray-400 group-hover:text-gray-300 uppercase">
                    Easy
                  </span>
                  <span className="text-sm font-bold tracking-wider text-blue-400 group-hover:text-blue-300 uppercase">
                    Video
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 group-hover:text-gray-300 uppercase">
                    Easy
                  </span>
                  <span className="text-xs font-bold tracking-wider text-blue-400 group-hover:text-blue-300 uppercase">
                    Video
                  </span>
                </>
              )}
            </div>

            {/* Glowing ring animation on hover */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/0 group-hover:border-blue-500/50 group-hover:animate-pulse transition-all" />
          </button>

          <p className={`font-heading uppercase mt-6 text-gray-700 ${isHero ? 'text-xl' : 'text-lg'}`}>
            Easy Video
          </p>
          <p className={`text-gray-500 mt-1 flex items-center gap-1 ${isHero ? 'text-sm' : 'text-xs'}`}>
            <Sparkles size={isHero ? 14 : 12} className="text-retro-mustard" />
            AI-powered instant video
          </p>
        </div>
      )}

      {/* Loading State */}
      {(instantMutation.isPending || phase === 'generating') && (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="relative">
            <Loader size={64} className="animate-spin text-blue-500" />
          </div>
          <div className="text-center">
            <p className="font-heading text-lg uppercase">Creating Your Video</p>
            <p className="text-sm text-gray-500 mt-1">
              Veo 3.1 is generating your commercial...
            </p>
          </div>
          {/* Progress Bar */}
          <div className="w-full max-w-xs bg-gray-200 border-2 border-black h-6 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm font-heading uppercase text-gray-600">
            {progress}% Complete
          </p>
          <p className="text-xs text-gray-400">
            This typically takes 1-3 minutes
          </p>
        </div>
      )}

      {/* Result Display */}
      {phase === 'done' && videoUrl && (
        <div className="space-y-4">
          <div className="border-4 border-black shadow-retro overflow-hidden bg-black">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="py-3 bg-blue-600 text-white border-2 border-black shadow-retro hover:shadow-none transition-all flex items-center justify-center gap-2 font-heading uppercase"
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={handleGenerateAnother}
              className="btn-retro-outline flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              New Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
