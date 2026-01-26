import { useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  const currentFlyer = flyers[currentIndex];

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
    <div className="space-y-6">
      {/* Main Preview Area */}
      <div className="flex gap-6">
        {/* Image Preview */}
        <div className="w-1/2 relative">
          <div className="aspect-[4/5] border-2 border-black overflow-hidden bg-gray-100">
            <img
              src={currentFlyer.imageUrl}
              alt={currentFlyer.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Status Badge */}
          <div
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
          >
            <Wand2 size={18} />
          </button>
        </div>

        {/* Caption & Actions */}
        <div className="w-1/2 flex flex-col">
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
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={startEditingCaption}
                  className="text-gray-500 hover:text-gray-700"
                  title="Edit caption"
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
            <div className="py-4 bg-green-50 border-2 border-green-500 text-green-700 text-center font-heading uppercase">
              Approved & Scheduled
            </div>
          )}

          {currentFlyer.approvalStatus === 'rejected' && (
            <div className="py-4 bg-red-50 border-2 border-red-500 text-red-700 text-center font-heading uppercase">
              Rejected
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="p-3 border-2 border-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="font-heading text-lg">
          {currentIndex + 1} / {flyers.length}
        </span>

        <button
          onClick={goToNext}
          disabled={currentIndex === flyers.length - 1}
          className="p-3 border-2 border-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
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
