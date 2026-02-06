import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Edit3,
  Wand2,
  Copy,
  Heart,
  Loader2,
  ChevronDown,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadApi } from '../../services/api';

interface BatchFlyer {
  id: string;
  imageUrl: string;
  caption: string;
  captionSpanish?: string | null;
  title: string;
  theme: string;
  themeName: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  scheduledFor?: string | null;
  status: string;
  index: number;
}

interface FlyerCarouselProps {
  flyers: BatchFlyer[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEditCaption: (flyer: BatchFlyer) => void;
  onEditImage: (flyer: BatchFlyer) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export default function FlyerCarousel({
  flyers,
  currentIndex,
  onIndexChange,
  onApprove,
  onReject,
  onEditCaption,
  onEditImage,
  isApproving,
  isRejecting,
}: FlyerCarouselProps) {
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showJumpTo, setShowJumpTo] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const currentFlyer = flyers[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < flyers.length - 1) {
        onIndexChange(currentIndex + 1);
      } else if (e.key === 'a' && currentFlyer?.approvalStatus === 'pending') {
        // 'a' for approve
        onApprove(currentFlyer.id);
      } else if (e.key === 'r' && currentFlyer?.approvalStatus === 'pending') {
        // 'r' for reject
        onReject(currentFlyer.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, flyers.length, currentFlyer, onIndexChange, onApprove, onReject]);

  // Auto-scroll thumbnail into view
  useEffect(() => {
    if (thumbnailRef.current) {
      const container = thumbnailRef.current;
      const thumbnail = container.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        const containerRect = container.getBoundingClientRect();
        const thumbRect = thumbnail.getBoundingClientRect();

        if (thumbRect.left < containerRect.left || thumbRect.right > containerRect.right) {
          thumbnail.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }
  }, [currentIndex]);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < flyers.length - 1) {
      onIndexChange(currentIndex + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  if (!currentFlyer) return null;

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < flyers.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(currentFlyer.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await downloadApi.downloadSingle(currentFlyer.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentFlyer.title || 'flyer'}-${currentIndex + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  };

  const startEditingCaption = () => {
    setCaptionText(currentFlyer.caption);
    setEditingCaption(true);
  };

  const getStatusColor = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6" ref={carouselRef}>
      {/* Keyboard Shortcuts Hint */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-xs text-gray-500">
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">→</kbd> Navigate</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">A</kbd> Approve</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">R</kbd> Reject</span>
      </div>

      {/* Main Preview Area */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Preview with touch handlers */}
        <div
          className="w-full md:w-1/2 relative"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="aspect-[4/5] border-2 border-black overflow-hidden bg-gray-100">
            <img
              src={currentFlyer.imageUrl}
              alt={currentFlyer.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Status Badge */}
          <div
            role="status"
            className={`absolute top-4 left-4 px-3 py-1 text-white font-heading uppercase text-sm ${getStatusColor(
              currentFlyer.approvalStatus
            )}`}
          >
            {currentFlyer.approvalStatus}
          </div>

          {/* Theme Badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 text-white text-xs">
            {currentFlyer.themeName}
          </div>

          {/* Edit Image Button */}
          <button
            onClick={() => onEditImage(currentFlyer)}
            className="absolute top-4 right-4 p-2 bg-white border-2 border-black shadow-retro hover:shadow-none transition-all"
            title="Edit image with AI"
            aria-label="Edit image with AI"
          >
            <Wand2 size={18} />
          </button>
        </div>

        {/* Caption & Actions */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Title */}
          <h3 className="font-heading text-lg uppercase mb-2">{currentFlyer.title}</h3>

          {/* Caption */}
          <div className="flex-1 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase">Caption</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCaption}
                  className="text-gray-500 hover:text-gray-700"
                  title="Copy caption"
                  aria-label="Copy caption to clipboard"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={startEditingCaption}
                  className="text-gray-500 hover:text-gray-700"
                  title="Edit caption"
                  aria-label="Edit caption"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            </div>

            {editingCaption ? (
              <div className="space-y-2">
                <textarea
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  className="w-full h-32 p-3 border-2 border-black focus:border-retro-red outline-none text-sm resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingCaption(false)}
                    className="px-3 py-1 border border-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onEditCaption({ ...currentFlyer, caption: captionText });
                      setEditingCaption(false);
                    }}
                    className="px-3 py-1 bg-retro-navy text-white text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 text-sm h-32 overflow-y-auto">
                {currentFlyer.caption}
              </div>
            )}

            {currentFlyer.captionSpanish && (
              <div className="mt-3">
                <span className="text-xs text-gray-500 uppercase">Spanish Caption</span>
                <div className="p-3 bg-gray-50 border border-gray-200 text-sm mt-1 h-24 overflow-y-auto">
                  {currentFlyer.captionSpanish}
                </div>
              </div>
            )}
          </div>

          {/* Approve/Reject Buttons */}
          {currentFlyer.approvalStatus === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => onReject(currentFlyer.id)}
                disabled={isRejecting}
                className="flex-1 py-4 border-2 border-black bg-white text-red-600 font-heading uppercase flex items-center justify-center gap-2 hover:bg-red-50 disabled:opacity-50"
              >
                {isRejecting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <X size={18} />
                )}
                Reject
              </button>
              <button
                onClick={() => onApprove(currentFlyer.id)}
                disabled={isApproving}
                className="flex-1 py-4 border-2 border-black bg-green-500 text-white font-heading uppercase flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50 shadow-retro hover:shadow-none transition-all"
              >
                {isApproving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Approve
              </button>
            </div>
          )}

          {currentFlyer.approvalStatus === 'approved' && (
            <div className="space-y-3">
              <div className="py-3 bg-green-50 border-2 border-green-500 text-green-700 text-center font-heading uppercase text-sm">
                Approved & Scheduled
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-retro-teal text-white border-2 border-black shadow-retro hover:shadow-none transition-all flex items-center justify-center gap-2 font-heading uppercase"
              >
                <Download size={20} />
                Download Image
              </button>
            </div>
          )}

          {currentFlyer.approvalStatus === 'rejected' && (
            <div className="py-4 bg-red-50 border-2 border-red-500 text-red-700 text-center font-heading uppercase">
              Rejected
            </div>
          )}

          {/* Download button for pending items too */}
          {currentFlyer.approvalStatus === 'pending' && (
            <button
              onClick={handleDownload}
              className="w-full mt-3 py-2 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
            >
              <Download size={16} />
              Download Preview
            </button>
          )}

          {/* Mobile hint */}
          <p className="text-center text-xs text-gray-400 md:hidden mt-2">
            Long-press image to save directly
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="p-3 border-2 border-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous (← arrow key)"
          aria-label="Previous flyer"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Jump to dropdown for large batches */}
        {flyers.length > 5 ? (
          <div className="relative">
            <button
              onClick={() => setShowJumpTo(!showJumpTo)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 font-heading"
            >
              <span className="text-lg">{currentIndex + 1} / {flyers.length}</span>
              <ChevronDown size={16} className={`transition-transform ${showJumpTo ? 'rotate-180' : ''}`} />
            </button>

            {showJumpTo && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border-2 border-black shadow-retro z-20 max-h-48 overflow-y-auto min-w-[120px]">
                {flyers.map((flyer, index) => (
                  <button
                    key={flyer.id}
                    onClick={() => {
                      onIndexChange(index);
                      setShowJumpTo(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-100 ${
                      index === currentIndex ? 'bg-retro-red text-white hover:bg-retro-red' : ''
                    }`}
                  >
                    <span>Flyer {index + 1}</span>
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(flyer.approvalStatus)}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="font-heading text-lg px-4">
            {currentIndex + 1} / {flyers.length}
          </span>
        )}

        <button
          onClick={goToNext}
          disabled={currentIndex === flyers.length - 1}
          className="p-3 border-2 border-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next (→ arrow key)"
          aria-label="Next flyer"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Mobile swipe hint */}
      <p className="text-center text-xs text-gray-400 md:hidden">
        Swipe left/right on image to navigate
      </p>

      {/* Thumbnail Strip */}
      <div ref={thumbnailRef} className="flex gap-2 overflow-x-auto pb-2 px-1">
        {flyers.map((flyer, index) => (
          <button
            key={flyer.id}
            onClick={() => onIndexChange(index)}
            className={`relative flex-shrink-0 w-16 h-20 border-2 overflow-hidden ${
              index === currentIndex
                ? 'border-retro-red shadow-retro'
                : 'border-gray-300 hover:border-gray-500'
            }`}
          >
            <img
              src={flyer.imageUrl}
              alt={`Flyer ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Status indicator */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 ${getStatusColor(
                flyer.approvalStatus
              )}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
