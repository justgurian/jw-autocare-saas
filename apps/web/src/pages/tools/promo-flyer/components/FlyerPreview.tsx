import { Download, Share2, Copy, Check, Wand2 } from 'lucide-react';
import FunLoadingMessages from '../../../../components/features/FunLoadingMessages';

export interface GeneratedFlyer {
  id: string;
  imageUrl: string;
  caption: string;
  captionSpanish?: string | null;
  title?: string;
  theme: string;
  themeName: string;
  vehicle?: { id: string; name: string };
}

interface FlyerPreviewProps {
  currentFlyer: GeneratedFlyer | null;
  generatedPack: GeneratedFlyer[];
  activePackIndex: number;
  setActivePackIndex: (index: number) => void;
  isGenerating: boolean;
  captionCopied: boolean;
  onDownload: (content: GeneratedFlyer) => void;
  onCopyCaption: (caption: string) => void;
  onShare: () => void;
  onReset: () => void;
  onEditImage?: (content: GeneratedFlyer) => void;
}

export default function FlyerPreview({
  currentFlyer,
  generatedPack,
  activePackIndex,
  setActivePackIndex,
  isGenerating,
  captionCopied,
  onDownload,
  onCopyCaption,
  onShare,
  onReset,
  onEditImage,
}: FlyerPreviewProps) {
  return (
    <>
      <h2 className="font-heading text-xl uppercase mb-4">Preview</h2>

      {currentFlyer ? (
        <div>
          {/* Pack Navigation */}
          {generatedPack.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-2 bg-gray-100 border-2 border-black">
              <button
                onClick={() => setActivePackIndex(Math.max(0, activePackIndex - 1))}
                disabled={activePackIndex === 0}
                className="px-3 py-1 text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="font-heading text-sm">
                {activePackIndex + 1} / {generatedPack.length}
              </span>
              <button
                onClick={() => setActivePackIndex(Math.min(generatedPack.length - 1, activePackIndex + 1))}
                disabled={activePackIndex === generatedPack.length - 1}
                className="px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          <div className="aspect-[4/5] bg-gray-200 border-2 border-black mb-4">
            <img
              src={currentFlyer.imageUrl}
              alt="Generated flyer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Theme & Vehicle Info */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-300">
              {currentFlyer.themeName}
            </span>
            {currentFlyer.vehicle && (
              <span className="text-xs px-2 py-1 bg-teal-50 border border-retro-teal text-retro-teal">
                {currentFlyer.vehicle.name}
              </span>
            )}
          </div>

          {/* Caption */}
          <div className="bg-gray-50 p-4 border-2 border-black mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-heading uppercase text-sm">Caption:</p>
              <button
                onClick={() => onCopyCaption(currentFlyer.caption)}
                className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                {captionCopied ? <Check size={12} /> : <Copy size={12} />}
                {captionCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm">{currentFlyer.caption}</p>

            {currentFlyer.captionSpanish && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-heading uppercase text-sm">Spanish:</p>
                  <button
                    onClick={() => onCopyCaption(currentFlyer.captionSpanish!)}
                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
                <p className="text-sm">{currentFlyer.captionSpanish}</p>
              </div>
            )}
          </div>

          {/* Primary Download Button - Most Important Action */}
          <button
            onClick={() => onDownload(currentFlyer)}
            className="w-full py-4 bg-retro-teal text-white border-2 border-black shadow-retro hover:shadow-none transition-all flex items-center justify-center gap-3 font-heading text-lg uppercase"
          >
            <Download size={24} />
            Download Image
          </button>

          {/* Edit Image Button */}
          {onEditImage && (
            <button
              onClick={() => onEditImage(currentFlyer)}
              className="w-full py-3 mt-3 bg-retro-navy text-white border-2 border-black shadow-retro hover:shadow-none transition-all flex items-center justify-center gap-2 font-heading uppercase"
            >
              <Wand2 size={20} />
              Edit Image
            </button>
          )}

          {/* Mobile hint */}
          <p className="text-center text-xs text-gray-500 md:hidden">
            Tip: Long-press on image above to save directly
          </p>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onShare}
              className="btn-retro-primary flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share
            </button>
            <button
              onClick={onReset}
              className="btn-retro-outline flex items-center justify-center gap-2"
            >
              Create Another
            </button>
          </div>
        </div>
      ) : isGenerating ? (
        <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-retro-red flex items-center justify-center">
          <FunLoadingMessages isLoading={true} spinnerSize={48} />
        </div>
      ) : (
        <div className="aspect-[4/5] bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Wand2 size={48} className="mx-auto mb-2" />
            <p>Your flyer will appear here</p>
          </div>
        </div>
      )}
    </>
  );
}
