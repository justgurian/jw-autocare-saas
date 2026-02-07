import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { celebrationApi } from '../../../services/api';
import {
  PartyPopper,
  Upload,
  X,
  Loader,
  Download,
  Share2,
  RefreshCw,
  Check,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from '../../../components/features/ShareModal';
import { usePollJob } from '../../../hooks/usePollJob';

interface CelebrationType {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

const CELEBRATION_TYPES: CelebrationType[] = [
  { id: 'birthday', emoji: '\uD83C\uDF82', name: 'Birthday', description: 'Happy birthday celebration' },
  { id: 'work-anniversary', emoji: '\uD83C\uDF89', name: 'Work Anniversary', description: 'Years of service milestone' },
  { id: 'employee-of-month', emoji: '\uD83C\uDFC6', name: 'Employee of the Month', description: 'Top performer recognition' },
  { id: 'promotion', emoji: '\u2B50', name: 'Promotion', description: 'Moving up in the ranks' },
  { id: 'retirement', emoji: '\uD83D\uDE80', name: 'Retirement', description: 'Farewell and best wishes' },
  { id: 'new-hire', emoji: '\uD83D\uDC4B', name: 'Welcome New Hire', description: 'Welcome to the team' },
  { id: 'custom', emoji: '\u2764\uFE0F', name: 'Custom', description: 'Any celebration you want' },
];

interface PhotoData {
  base64: string;
  mimeType: string;
  preview: string;
}

interface GeneratedVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
}

export default function CelebrationPage() {
  const [step, setStep] = useState(1);
  const [celebrationType, setCelebrationType] = useState<CelebrationType | null>(null);
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [personName, setPersonName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Polling
  const { job: currentJob, startPolling } = usePollJob({
    getJob: celebrationApi.getJob,
    onComplete: (job) => {
      setGeneratedVideo({
        id: job.id,
        videoUrl: job.videoUrl || '',
        thumbnailUrl: job.thumbnailUrl || '',
        caption: job.caption || '',
      });
      setStep(3); // result
      toast.success('Celebration video created!');
    },
    onFailed: (job) => {
      toast.error(job.error || 'Video generation failed');
      setStep(1);
    },
    onTimeout: () => {
      toast.error('Video generation timed out. Please try again.');
      setStep(1);
    },
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      celebrationApi.generate({
        celebrationType: celebrationType!.id,
        personName,
        customMessage: customMessage || undefined,
        photoBase64: photoData!.base64,
        photoMimeType: photoData!.mimeType,
        aspectRatio,
      }),
    onSuccess: (response) => {
      const job = response.data.data?.job || response.data.job;
      setStep(2); // generating
      startPolling(job.id);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to start video generation');
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Photo must be under 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setPhotoData({ base64, mimeType: file.type, preview: result });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    if (!celebrationType) {
      toast.error('Please select a celebration type');
      return;
    }
    if (!photoData) {
      toast.error('Please upload a photo');
      return;
    }
    if (!personName.trim()) {
      toast.error('Please enter the person\'s name');
      return;
    }
    generateMutation.mutate();
  };

  const resetAll = () => {
    setStep(1);
    setCelebrationType(null);
    setPhotoData(null);
    setPersonName('');
    setCustomMessage('');
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
      a.download = `celebration-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Downloading video...');
    } catch {
      window.open(generatedVideo.videoUrl, '_blank');
    }
  };

  const isGenerating = step === 2 && currentJob && (currentJob.status === 'pending' || currentJob.status === 'processing');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro flex items-center justify-center gap-3">
          <PartyPopper className="text-retro-mustard" />
          Celebrations
        </h1>
        <p className="text-gray-600 mt-2">Create celebration videos for birthdays, milestones, and more</p>
      </div>

      {/* Step 1: Choose & Upload */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Celebration Type */}
          <div className="card-retro space-y-4">
            <h2 className="font-heading text-lg uppercase flex items-center gap-2">
              <Sparkles size={18} className="text-retro-mustard" />
              Choose Celebration Type
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CELEBRATION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setCelebrationType(type)}
                  className={`p-4 border-2 text-left transition-all ${
                    celebrationType?.id === type.id
                      ? 'border-retro-red bg-red-50 shadow-retro'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <h4 className="font-heading uppercase text-sm mt-1">{type.name}</h4>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="card-retro space-y-4">
            <h2 className="font-heading text-lg uppercase">Upload Photo</h2>
            {photoData ? (
              <div className="relative inline-block">
                <img
                  src={photoData.preview}
                  alt="Uploaded"
                  className="max-w-[200px] border-2 border-black shadow-retro"
                />
                <button
                  onClick={() => setPhotoData(null)}
                  className="absolute -top-2 -right-2 bg-retro-red text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="card-retro border-dashed cursor-pointer flex flex-col items-center justify-center py-12 hover:bg-gray-50 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="font-heading text-sm">DROP PHOTO HERE</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>

          {/* Person Name & Message */}
          <div className="card-retro space-y-4">
            <div>
              <label className="block font-heading text-sm uppercase mb-1">Person's Name *</label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Enter the person's name..."
                className="w-full p-3 border-2 border-black focus:ring-2 focus:ring-retro-red focus:border-retro-red"
              />
            </div>
            <div>
              <label className="block font-heading text-sm uppercase mb-1">Custom Message (Optional)</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={3}
                className="w-full p-3 border-2 border-black focus:ring-2 focus:ring-retro-red focus:border-retro-red"
              />
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="card-retro">
            <label className="block font-heading text-sm uppercase mb-2">Aspect Ratio</label>
            <div className="flex gap-3">
              {(['16:9', '9:16'] as const).map((ar) => (
                <button
                  key={ar}
                  onClick={() => setAspectRatio(ar)}
                  className={`flex-1 py-2 border-2 font-heading text-sm ${
                    aspectRatio === ar
                      ? 'border-retro-red bg-red-50 text-retro-red'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {ar === '16:9' ? 'Landscape 16:9' : 'Portrait 9:16'}
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !celebrationType || !photoData || !personName.trim()}
            className="w-full btn-retro-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <Loader className="animate-spin" size={24} />
            ) : (
              <Sparkles size={24} />
            )}
            Generate Celebration Video
          </button>
        </div>
      )}

      {/* Step 2: Generating */}
      {isGenerating && currentJob && (
        <div className="card-retro text-center py-12">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-retro-red/10 flex items-center justify-center">
              <Loader className="w-12 h-12 animate-spin text-retro-red" />
            </div>
            <div>
              <h2 className="font-heading text-2xl uppercase">Creating Celebration Video</h2>
              <p className="text-gray-600 mt-2">
                {currentJob.status === 'pending' && 'Preparing your celebration...'}
                {currentJob.status === 'processing' && 'AI is creating the video...'}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-full bg-retro-red rounded-full transition-all duration-500"
                style={{ width: `${currentJob.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{currentJob.progress}% complete</p>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && generatedVideo && (
        <div className="space-y-4">
          <div className="card-retro text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <Check size={24} />
              <span className="font-heading text-xl uppercase">Celebration Video Ready!</span>
            </div>
            <video
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full border-2 border-black shadow-retro"
              src={generatedVideo.videoUrl}
            />
          </div>
          <div className="flex gap-3">
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
            onClick={resetAll}
            className="btn-retro-outline w-full flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> Create Another
          </button>
        </div>
      )}

      {/* Share Modal */}
      {generatedVideo && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: generatedVideo.id,
            title: `Celebration - ${personName}`,
            imageUrl: generatedVideo.thumbnailUrl,
            caption: generatedVideo.caption,
          }}
        />
      )}
    </div>
  );
}
