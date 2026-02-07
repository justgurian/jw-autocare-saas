import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { promoFlyerApi } from '../../services/api';
import { Power, Download, Share2, RefreshCw, Sparkles, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from './ShareModal';
import VideoFromFlyerModal from './VideoFromFlyerModal';
import RetroLoadingStage from '../garage/RetroLoadingStage';
import { useFileDownload } from '../../hooks/useFileDownload';
import type { GeneratedContent } from '../../types/content';
import FlyerFeedback from './FlyerFeedback';

interface PushToStartButtonProps {
  size?: 'default' | 'hero';
}

export default function PushToStartButton({ size = 'default' }: PushToStartButtonProps) {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const download = useFileDownload();

  const isHero = size === 'hero';

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

  const handleDownload = () => {
    if (!generatedContent) return;
    download(generatedContent.id, generatedContent.title || 'flyer');
  };

  const handleGenerateAnother = () => {
    setGeneratedContent(null);
    instantMutation.mutate();
  };

  return (
    <div className="w-full">
      {/* Push to Start Button - Engine Ignition Style */}
      {!generatedContent && !instantMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-8">
          <p className={`text-gray-600 mb-6 text-center max-w-md ${isHero ? 'text-base' : 'text-sm'}`}>
            One click creates a professional flyer based on your services and specials.
            No thinking required.
          </p>

          <button
            onClick={handlePushToStart}
            aria-label="Generate content"
            className={`
              relative rounded-full
              bg-gradient-to-b from-gray-800 to-gray-900
              border-8 border-gray-700
              transition-all duration-100
              active:scale-95
              ${isHero ? 'w-56 h-56' : 'w-40 h-40'}
              ${isPressed ? 'scale-95' : ''}
              ${isHero
                ? 'easy-button-pulse hover:shadow-[0_0_0_8px_#1f2937,0_0_80px_rgba(239,68,68,0.6)]'
                : 'shadow-[0_0_0_8px_#1f2937,0_0_40px_rgba(0,0,0,0.5)] hover:shadow-[0_0_0_8px_#1f2937,0_0_60px_rgba(239,68,68,0.3)]'
              }
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
                size={isHero ? 56 : 48}
                className={`
                  text-red-500 mb-1
                  transition-all duration-300
                  group-hover:text-red-400 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]
                  ${isPressed ? 'text-red-300 drop-shadow-[0_0_15px_rgba(239,68,68,1)]' : ''}
                `}
              />

              {/* Button label text */}
              {isHero ? (
                <>
                  <span className="text-xs font-bold tracking-widest text-gray-400 group-hover:text-gray-300 uppercase">
                    The Easy
                  </span>
                  <span className="text-sm font-bold tracking-wider text-red-500 group-hover:text-red-400 uppercase">
                    Button
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 group-hover:text-gray-300 uppercase">
                    Engine
                  </span>
                  <span className="text-xs font-bold tracking-wider text-red-500 group-hover:text-red-400 uppercase">
                    Start
                  </span>
                </>
              )}
            </div>

            {/* Glowing ring animation on hover */}
            <div className="absolute inset-0 rounded-full border-2 border-red-500/0 group-hover:border-red-500/50 group-hover:animate-pulse transition-all" />
          </button>

          <p className={`font-heading uppercase mt-6 text-gray-700 ${isHero ? 'text-xl' : 'text-lg'}`}>
            Push to Start
          </p>
          <p className={`text-gray-500 mt-1 flex items-center gap-1 ${isHero ? 'text-sm' : 'text-xs'}`}>
            <Sparkles size={isHero ? 14 : 12} className="text-retro-mustard" />
            AI-powered instant creation
          </p>
        </div>
      )}

      {/* Loading State */}
      {instantMutation.isPending && (
        <RetroLoadingStage
          isLoading={true}
          estimatedDuration={10000}
          size="lg"
          showExhaust={true}
        />
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

          {/* Feedback */}
          <FlyerFeedback contentId={generatedContent.id} />

          {/* Secondary Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="btn-retro-primary flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share
            </button>
            <button
              onClick={() => setShowVideoModal(true)}
              className="btn-retro-outline flex items-center justify-center gap-2"
            >
              <Video size={18} />
              Animate
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

      {/* Video From Flyer Modal */}
      {generatedContent && (
        <VideoFromFlyerModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          flyerId={generatedContent.id}
          flyerTitle={generatedContent.title}
          flyerImageUrl={generatedContent.imageUrl}
        />
      )}
    </div>
  );
}
