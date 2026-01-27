import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { promoFlyerApi, downloadApi } from '../../services/api';
import { Power, Loader2, Download, Share2, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from './ShareModal';
import { LOADING_MESSAGES } from './FunLoadingMessages';

interface GeneratedContent {
  id: string;
  imageUrl: string;
  caption: string;
  title: string;
  theme: string;
  themeName: string;
}

export default function PushToStartButton() {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Push to Start mutation
  const instantMutation = useMutation({
    mutationFn: () => promoFlyerApi.instant(),
    onSuccess: (res) => {
      setGeneratedContent(res.data);
      toast.success('Flyer generated!');
    },
    onError: () => {
      toast.error('Generation failed. Please try again.');
    },
  });

  const handlePushToStart = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    instantMutation.mutate();
  };

  const handleDownload = async () => {
    if (!generatedContent) return;
    try {
      const response = await downloadApi.downloadSingle(generatedContent.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedContent.title || 'flyer'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleGenerateAnother = () => {
    setGeneratedContent(null);
    instantMutation.mutate();
  };

  // Cycle through loading messages
  useEffect(() => {
    if (!instantMutation.isPending) {
      setLoadingMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [instantMutation.isPending]);

  return (
    <div className="w-full">
      {/* Push to Start Button - Engine Ignition Style */}
      {!generatedContent && !instantMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-600 text-sm mb-6 text-center max-w-md">
            One click creates a professional flyer based on your services and specials.
            No thinking required.
          </p>

          <button
            onClick={handlePushToStart}
            className={`
              relative w-40 h-40 rounded-full
              bg-gradient-to-b from-gray-800 to-gray-900
              border-8 border-gray-700
              shadow-[0_0_0_8px_#1f2937,0_0_40px_rgba(0,0,0,0.5)]
              transition-all duration-100
              hover:shadow-[0_0_0_8px_#1f2937,0_0_60px_rgba(239,68,68,0.3)]
              active:scale-95
              ${isPressed ? 'scale-95' : ''}
              group
            `}
          >
            {/* Outer ring glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-600/20 to-transparent" />

            {/* Inner button surface */}
            <div className={`
              absolute inset-4 rounded-full
              bg-gradient-to-b from-gray-700 to-gray-800
              border-4 border-gray-600
              flex flex-col items-center justify-center
              transition-all duration-100
              ${isPressed ? 'from-red-700 to-red-800' : ''}
              group-hover:from-red-800 group-hover:to-red-900
            `}>
              {/* Power icon */}
              <Power
                size={48}
                className={`
                  text-red-500 mb-1
                  transition-all duration-300
                  group-hover:text-red-400 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]
                  ${isPressed ? 'text-red-300 drop-shadow-[0_0_15px_rgba(239,68,68,1)]' : ''}
                `}
              />

              {/* ENGINE START text */}
              <span className="text-[10px] font-bold tracking-widest text-gray-400 group-hover:text-gray-300 uppercase">
                Engine
              </span>
              <span className="text-xs font-bold tracking-wider text-red-500 group-hover:text-red-400 uppercase">
                Start
              </span>
            </div>

            {/* Glowing ring animation on hover */}
            <div className="absolute inset-0 rounded-full border-2 border-red-500/0 group-hover:border-red-500/50 group-hover:animate-pulse transition-all" />
          </button>

          <p className="text-lg font-heading uppercase mt-6 text-gray-700">
            Push to Start
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Sparkles size={12} className="text-retro-mustard" />
            AI-powered instant creation
          </p>
        </div>
      )}

      {/* Loading State - Engine Starting Animation */}
      {instantMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-40 h-40 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border-8 border-gray-700 shadow-[0_0_0_8px_#1f2937,0_0_60px_rgba(239,68,68,0.5)]">
            {/* Animated glow ring */}
            <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-30" />
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-pulse" />

            {/* Inner button */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-b from-red-700 to-red-900 border-4 border-red-600 flex flex-col items-center justify-center">
              <Loader2 size={48} className="text-red-300 animate-spin drop-shadow-[0_0_15px_rgba(239,68,68,1)]" />
            </div>
          </div>

          <p className="text-sm font-heading uppercase mt-6 text-red-600 animate-pulse max-w-xs text-center">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
        </div>
      )}

      {/* Result Display */}
      {generatedContent && !instantMutation.isPending && (
        <div className="space-y-4">
          {/* Generated Image */}
          <div className="relative">
            <div className="aspect-[4/5] bg-gray-100 border-4 border-black shadow-retro overflow-hidden">
              <img
                src={generatedContent.imageUrl}
                alt={generatedContent.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Style badge */}
            <div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1 text-xs font-heading uppercase">
              {generatedContent.themeName}
            </div>
          </div>

          {/* Caption */}
          <div className="bg-white p-4 border-2 border-black">
            <p className="font-heading text-sm uppercase mb-2 text-gray-600">Caption:</p>
            <p className="text-sm text-gray-900">{generatedContent.caption}</p>
          </div>

          {/* Primary Download Button */}
          <button
            onClick={handleDownload}
            className="w-full py-4 bg-retro-teal text-white border-2 border-black shadow-retro hover:shadow-none transition-all flex items-center justify-center gap-3 font-heading text-lg uppercase"
          >
            <Download size={24} />
            Download Image
          </button>

          {/* Mobile hint */}
          <p className="text-center text-xs text-gray-500 md:hidden">
            Tip: Long-press on image above to save directly
          </p>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="btn-retro-primary flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share
            </button>
            <button
              onClick={handleGenerateAnother}
              className="btn-retro-outline flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              New Flyer
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {generatedContent && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: generatedContent.id,
            title: generatedContent.title,
            imageUrl: generatedContent.imageUrl,
            caption: generatedContent.caption,
          }}
        />
      )}
    </div>
  );
}
