import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { celebrationApi } from '../../../services/api';
import MascotSelector from '../../../components/features/MascotSelector';
import ShareModal from '../../../components/features/ShareModal';
import { usePollJob } from '../../../hooks/usePollJob';
import toast from 'react-hot-toast';
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

interface Scenario {
  id: string;
  name: string;
  category: 'dance' | 'comedy' | 'epic' | 'behind-the-scenes' | 'heartfelt';
  icon: string;
  description: string;
  occasionTags: string[];
}

interface PersonTag {
  id: string;
  label: string;
  icon: string;
}

interface OccasionTag {
  id: string;
  label: string;
  icon: string;
}

const LOADING_MESSAGES: Record<string, string[]> = {
  dance: ['Warming up the dance floor...', 'Picking the perfect moves...', 'Getting the beat going...'],
  comedy: ['Writing the punchline...', 'Timing the comedy...', 'Setting up the bit...'],
  epic: ['Cueing dramatic music...', 'Adding explosions...', 'Charging the shockwave...'],
  'behind-the-scenes': ['Setting up the ring light...', 'Getting the vlog ready...', 'Finding the best angle...'],
  heartfelt: ['Getting the confetti ready...', 'Preparing the applause...', 'Warming hearts...'],
};

export default function CelebrationPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [occasionFilter, setOccasionFilter] = useState<string | null>(null);
  const [personName, setPersonName] = useState('');
  const [inputSource, setInputSource] = useState<'photo' | 'mascot' | 'generic'>('photo');
  const [photoData, setPhotoData] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [mascotId, setMascotId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [occasion, setOccasion] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [duration, setDuration] = useState<'4s' | '6s' | '8s'>('8s');
  const [generatedVideo, setGeneratedVideo] = useState<{ id: string; videoUrl: string; caption: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [step, setStep] = useState<'browse' | 'generating' | 'result'>('browse');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  // Fetch scenarios from API
  const { data: scenariosData } = useQuery({
    queryKey: ['celebration-scenarios'],
    queryFn: () => celebrationApi.getScenarios().then(r => r.data),
  });

  const scenarios: Scenario[] = scenariosData?.data?.scenarios || [];
  const personTags: PersonTag[] = scenariosData?.data?.personTags || [];
  const occasionTags: OccasionTag[] = scenariosData?.data?.occasionTags || [];

  // Filter scenarios by occasion
  const filteredScenarios = useMemo(() => {
    if (!occasionFilter) return scenarios;
    return scenarios.filter(s => s.occasionTags.includes(occasionFilter) || s.occasionTags.includes('just-because'));
  }, [scenarios, occasionFilter]);

  // Group by category
  const groupedScenarios = useMemo(() => {
    const groups: Record<string, { label: string; icon: string; scenarios: Scenario[] }> = {
      dance: { label: 'Dance Party', icon: '\uD83D\uDD7A', scenarios: [] },
      comedy: { label: 'Comedy', icon: '\uD83D\uDE02', scenarios: [] },
      epic: { label: 'Epic / Scroll-Stoppers', icon: '\uD83D\uDD25', scenarios: [] },
      'behind-the-scenes': { label: 'Behind the Scenes', icon: '\uD83C\uDFAC', scenarios: [] },
      heartfelt: { label: 'Heartfelt', icon: '\u2764\uFE0F', scenarios: [] },
    };
    filteredScenarios.forEach(s => {
      if (groups[s.category]) groups[s.category].scenarios.push(s);
    });
    return Object.entries(groups).filter(([, g]) => g.scenarios.length > 0);
  }, [filteredScenarios]);

  // Tag toggling
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  };

  // Photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Photo must be under 10MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setPhotoData({ base64, mimeType: file.type, preview: result });
    };
    reader.readAsDataURL(file);
  };

  // Poll job
  const { job: currentJob, startPolling } = usePollJob({
    getJob: celebrationApi.getJob,
    onComplete: (job) => {
      setGeneratedVideo({ id: job.id, videoUrl: job.videoUrl || '', caption: job.caption || '' });
      setStep('result');
      toast.success('Celebration video created!');
    },
    onFailed: (job) => { toast.error(job.error || 'Video generation failed'); setStep('browse'); },
    onTimeout: () => { toast.error('Video generation timed out.'); setStep('browse'); },
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: () => celebrationApi.generate({
      scenarioId: selectedScenario!.id,
      personName,
      personTags: selectedTags.length > 0 ? selectedTags : undefined,
      occasion: occasion || undefined,
      customMessage: customMessage || undefined,
      inputSource,
      photoBase64: inputSource === 'photo' ? photoData?.base64 : undefined,
      photoMimeType: inputSource === 'photo' ? photoData?.mimeType : undefined,
      mascotId: inputSource === 'mascot' ? mascotId || undefined : undefined,
      aspectRatio,
      duration,
    }),
    onSuccess: (response) => {
      const job = response.data.data?.job || response.data.job;
      setStep('generating');
      startPolling(job.id);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to start video generation');
    },
  });

  // Validation + generate
  const handleGenerate = () => {
    if (!selectedScenario) { toast.error('Select a scenario'); return; }
    if (!personName.trim()) { toast.error("Enter the person's name"); return; }
    if (inputSource === 'photo' && !photoData) { toast.error('Upload a photo'); return; }
    if (inputSource === 'mascot' && !mascotId) { toast.error('Select a mascot'); return; }
    generateMutation.mutate();
  };

  // Download
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
    } catch { window.open(generatedVideo.videoUrl, '_blank'); }
  };

  // Reset
  const resetAll = () => {
    setStep('browse');
    setSelectedScenario(null);
    setPersonName('');
    setInputSource('photo');
    setPhotoData(null);
    setMascotId(null);
    setSelectedTags([]);
    setOccasion('');
    setCustomMessage('');
    setGeneratedVideo(null);
  };

  // Rotate loading messages
  useEffect(() => {
    if (step !== 'generating') return;
    const interval = setInterval(() => {
      setLoadingMsgIndex(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [step]);

  const currentLoadingMsg = useMemo(() => {
    const cat = selectedScenario?.category || 'heartfelt';
    const msgs = LOADING_MESSAGES[cat] || LOADING_MESSAGES.heartfelt;
    return msgs[loadingMsgIndex % msgs.length];
  }, [loadingMsgIndex, selectedScenario]);

  // ---- BROWSE ----
  if (step === 'browse') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="heading-retro flex items-center justify-center gap-3">
            <PartyPopper className="text-retro-mustard" />
            Celebration Videos
          </h1>
          <p className="text-gray-600 mt-2">Create scroll-stopping celebration content for your team</p>
        </div>

        {/* Occasion Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setOccasionFilter(null)}
            className={`px-4 py-2 border-2 font-heading text-sm uppercase transition-all ${
              !occasionFilter ? 'border-retro-red bg-red-50 text-retro-red' : 'border-gray-300 hover:border-gray-500'
            }`}
          >
            All
          </button>
          {occasionTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setOccasionFilter(tag.id)}
              className={`px-4 py-2 border-2 font-heading text-sm uppercase transition-all ${
                occasionFilter === tag.id ? 'border-retro-red bg-red-50 text-retro-red' : 'border-gray-300 hover:border-gray-500'
              }`}
            >
              {tag.icon} {tag.label}
            </button>
          ))}
        </div>

        {/* Main: Scenario Gallery + Config Panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT: Scenario Gallery */}
          <div className="flex-1 space-y-6">
            {groupedScenarios.map(([category, group]) => (
              <div key={category}>
                <h3 className="font-heading text-lg uppercase flex items-center gap-2 mb-3">
                  <span>{group.icon}</span> {group.label}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {group.scenarios.map(scenario => (
                    <button
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario)}
                      className={`p-4 border-2 text-left transition-all ${
                        selectedScenario?.id === scenario.id
                          ? 'border-retro-red bg-red-50 shadow-retro border-4'
                          : 'border-gray-300 hover:border-gray-500 hover:shadow-md'
                      }`}
                    >
                      <span className="text-2xl">{scenario.icon}</span>
                      <h4 className="font-heading uppercase text-sm mt-1">{scenario.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{scenario.description}</p>
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-gray-100 rounded font-heading uppercase">
                        {scenario.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Config Panel (when scenario selected) */}
          {selectedScenario && (
            <div className="lg:w-96 space-y-4 lg:sticky lg:top-4 self-start">
              <div className="card-retro space-y-4">
                {/* Selected scenario header */}
                <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                  <span className="text-3xl">{selectedScenario.icon}</span>
                  <div>
                    <h3 className="font-heading text-lg uppercase">{selectedScenario.name}</h3>
                    <p className="text-sm text-gray-500">{selectedScenario.description}</p>
                  </div>
                </div>

                {/* Person's Name */}
                <div>
                  <label className="block font-heading text-sm uppercase mb-1">Person's Name *</label>
                  <input
                    type="text"
                    value={personName}
                    onChange={e => setPersonName(e.target.value)}
                    placeholder="Who is this video for?"
                    className="w-full p-3 border-2 border-black focus:ring-2 focus:ring-retro-red"
                  />
                </div>

                {/* Input Source Selector */}
                <div>
                  <label className="block font-heading text-sm uppercase mb-2">Video Source</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['photo', 'mascot', 'generic'] as const).map(src => (
                      <button
                        key={src}
                        onClick={() => setInputSource(src)}
                        className={`p-3 border-2 text-center transition-all ${
                          inputSource === src ? 'border-retro-red bg-red-50' : 'border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <span className="text-xl block">
                          {src === 'photo' ? '\uD83D\uDCF8' : src === 'mascot' ? '\uD83E\uDDF8' : '\uD83C\uDFAD'}
                        </span>
                        <span className="font-heading text-xs uppercase block mt-1">
                          {src === 'photo' ? 'Photo' : src === 'mascot' ? 'Mascot' : 'Fun Character'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo Upload (if photo mode) */}
                {inputSource === 'photo' && (
                  <div>
                    {photoData ? (
                      <div className="relative inline-block">
                        <img src={photoData.preview} alt="Uploaded" className="max-w-[150px] border-2 border-black shadow-retro" />
                        <button
                          onClick={() => setPhotoData(null)}
                          className="absolute -top-2 -right-2 bg-retro-red text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="card-retro border-dashed cursor-pointer flex flex-col items-center py-8 hover:bg-gray-50">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="font-heading text-xs">UPLOAD PHOTO</p>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    )}
                  </div>
                )}

                {/* Mascot Selector (if mascot mode) */}
                {inputSource === 'mascot' && (
                  <div>
                    <label className="block font-heading text-sm uppercase mb-2">Choose Mascot</label>
                    <MascotSelector selectedMascotId={mascotId} onSelect={setMascotId} />
                  </div>
                )}

                {/* Generic mode info */}
                {inputSource === 'generic' && (
                  <div className="bg-blue-50 border-2 border-blue-200 p-3 text-sm text-blue-700">
                    A fun Muppet-style puppet character will star in the video — no photo needed!
                  </div>
                )}

                {/* Person Tags */}
                <div>
                  <label className="block font-heading text-sm uppercase mb-2">Fun Tags (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {personTags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 border-2 text-sm transition-all ${
                          selectedTags.includes(tag.id)
                            ? 'border-retro-red bg-red-50 text-retro-red'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {tag.icon} {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasion */}
                <div>
                  <label className="block font-heading text-sm uppercase mb-1">Occasion (optional)</label>
                  <select
                    value={occasion}
                    onChange={e => setOccasion(e.target.value)}
                    className="w-full p-3 border-2 border-black"
                  >
                    <option value="">None</option>
                    {occasionTags.map(tag => (
                      <option key={tag.id} value={tag.id}>{tag.icon} {tag.label}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Message */}
                <div>
                  <label className="block font-heading text-sm uppercase mb-1">Custom Message (optional)</label>
                  <input
                    type="text"
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    placeholder="Happy Birthday Mike!"
                    className="w-full p-3 border-2 border-black"
                  />
                </div>

                {/* Aspect Ratio + Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-heading text-xs uppercase mb-1">Aspect Ratio</label>
                    <div className="flex gap-1">
                      {(['9:16', '16:9'] as const).map(ar => (
                        <button
                          key={ar}
                          onClick={() => setAspectRatio(ar)}
                          className={`flex-1 py-1.5 border-2 font-heading text-xs ${
                            aspectRatio === ar ? 'border-retro-red bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          {ar}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-heading text-xs uppercase mb-1">Duration</label>
                    <div className="flex gap-1">
                      {(['4s', '6s', '8s'] as const).map(d => (
                        <button
                          key={d}
                          onClick={() => setDuration(d)}
                          className={`flex-1 py-1.5 border-2 font-heading text-xs ${
                            duration === d ? 'border-retro-red bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending || !personName.trim() || (inputSource === 'photo' && !photoData) || (inputSource === 'mascot' && !mascotId)}
                  className="w-full btn-retro-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50"
                >
                  {generateMutation.isPending ? <Loader className="animate-spin" size={24} /> : <Sparkles size={24} />}
                  Create Video
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- GENERATING ----
  if (step === 'generating') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card-retro text-center py-12">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-retro-red/10 flex items-center justify-center">
              <Loader className="w-12 h-12 animate-spin text-retro-red" />
            </div>
            <div>
              <h2 className="font-heading text-2xl uppercase">Creating Celebration Video</h2>
              <p className="text-gray-600 mt-2">{currentLoadingMsg}</p>
            </div>
            {currentJob && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-full bg-retro-red rounded-full transition-all duration-500"
                    style={{ width: `${currentJob.progress || 0}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{currentJob.progress || 0}% complete</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- RESULT ----
  if (step === 'result' && generatedVideo) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
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

        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: generatedVideo.id,
            title: `Celebration - ${personName}`,
            imageUrl: generatedVideo.videoUrl,
            caption: generatedVideo.caption,
          }}
        />
      </div>
    );
  }

  return null;
}
