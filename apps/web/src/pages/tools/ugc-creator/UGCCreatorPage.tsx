import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ugcCreatorApi, servicesApi, specialsApi } from '../../../services/api';
import {
  Film,
  Laugh,
  Eye,
  Mic,
  Tv,
  ChevronRight,
  ChevronLeft,
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

// ── Scene & Character data (from knowledge base) ──

interface Scene {
  id: string;
  name: string;
  shortDescription: string;
  category: 'comedy' | 'relatable' | 'asmr' | 'tv-spot';
}

interface Character {
  id: string;
  name: string;
  personality: string;
  isBuiltIn?: boolean;
  imageUrl?: string;
  restrictToCategory?: string;
}

const BUILTIN_EMOJI: Record<string, string> = {
  'classic-tony': '\uD83E\uDDF8',
  'karen-puppet': '\uD83D\uDE24',
  'human-male': '\uD83D\uDC68\u200D\uD83D\uDD27',
  'human-female': '\uD83D\uDC69\u200D\uD83D\uDD27',
  'puppet-hands': '\uD83E\uDD32',
};

const SCENES: Scene[] = [
  // Comedy
  { id: 'the-misfire', name: 'The Misfire', shortDescription: 'Engine backfires in face.', category: 'comedy' },
  { id: 'oil-squirt', name: 'Oil Squirt', shortDescription: 'Oil squirts unexpectedly.', category: 'comedy' },
  { id: 'the-price-faint', name: 'The Price Faint', shortDescription: "Reacting to a competitor's bill.", category: 'comedy' },
  { id: 'tangled-up', name: 'Tangled Up', shortDescription: 'Getting comically tangled.', category: 'comedy' },
  { id: 'friday-dance', name: 'Friday Dance', shortDescription: 'Doing a happy victory dance.', category: 'comedy' },
  { id: 'chefs-kiss', name: "Chef's Kiss", shortDescription: 'Approving a job well done.', category: 'comedy' },
  { id: 'the-extra-part', name: 'The Extra Part', shortDescription: 'One bolt left over after reassembly.', category: 'comedy' },
  { id: 'call-the-manager', name: 'Call the Manager', shortDescription: 'Demanding to see the manager.', category: 'comedy' },
  { id: 'tiny-scratch', name: 'Tiny Scratch', shortDescription: 'Inspecting an invisible scratch.', category: 'comedy' },
  { id: 'the-noise', name: 'The Noise', shortDescription: 'Listening for a mysterious sound.', category: 'comedy' },
  { id: 'upside-down-manual', name: 'Upside Down Manual', shortDescription: 'Reading the manual wrong.', category: 'comedy' },
  { id: 'the-hammer-fix', name: 'The Hammer Fix', shortDescription: 'Using a giant mallet on a chip.', category: 'comedy' },
  { id: 'the-zapper', name: 'The Zapper', shortDescription: 'Getting a comical electric shock.', category: 'comedy' },
  { id: 'the-argument', name: 'The Argument', shortDescription: 'Arguing with another mechanic.', category: 'comedy' },
  { id: 'the-complaint', name: 'The Complaint', shortDescription: 'Scolding the car for breaking.', category: 'comedy' },
  // Relatable (scroll-stoppers + POV combined)
  { id: 'car-hypnosis', name: 'Car Hypnosis', shortDescription: 'Hypnotizing the car to start.', category: 'relatable' },
  { id: 'dr-mechanic', name: 'Dr. Mechanic', shortDescription: 'Listening to the engine like a doctor.', category: 'relatable' },
  { id: 'the-long-manual', name: 'The Long Manual', shortDescription: 'An accordion-folding repair manual.', category: 'relatable' },
  { id: 'too-much-coffee', name: 'Too Much Coffee', shortDescription: 'Vibrating from caffeine overdose.', category: 'relatable' },
  { id: 'duck-avalanche', name: 'Duck Avalanche', shortDescription: 'Buried under rubber ducks.', category: 'relatable' },
  { id: 'the-magic-trick', name: 'The Magic Trick', shortDescription: 'Pulling a rubber chicken from a hat.', category: 'relatable' },
  { id: 'tire-workout', name: 'Tire Workout', shortDescription: 'Using a lug wrench as a dumbbell.', category: 'relatable' },
  { id: 'easy-fix-celebration', name: 'Easy Fix Celebration', shortDescription: 'Confetti cannon for one screw.', category: 'relatable' },
  { id: 'the-squeak', name: 'The Squeak', shortDescription: 'Hunting a squeaking noise.', category: 'relatable' },
  { id: 'duct-tape-master', name: 'Duct Tape Master', shortDescription: 'Tangled in duct tape.', category: 'relatable' },
  { id: 'the-diagnosis', name: 'The Diagnosis', shortDescription: 'Listening intently to the engine.', category: 'relatable' },
  { id: 'the-approval', name: 'The Approval', shortDescription: 'A confident nod of approval.', category: 'relatable' },
  { id: 'the-diy-fail', name: 'The DIY Fail', shortDescription: 'A dramatic facepalm moment.', category: 'relatable' },
  { id: 'hard-work', name: 'Hard Work', shortDescription: 'Satisfied smile after finishing.', category: 'relatable' },
  // ASMR
  { id: 'the-golden-pour', name: 'The Golden Pour', shortDescription: 'Smooth laminar oil flow.', category: 'asmr' },
  { id: 'the-click', name: 'The Click', shortDescription: 'Satisfying torque wrench click.', category: 'asmr' },
  { id: 'soap-cannon', name: 'Soap Cannon', shortDescription: 'Thick foam covering a car.', category: 'asmr' },
  { id: 'the-peel', name: 'The Peel', shortDescription: 'Peeling protective plastic film.', category: 'asmr' },
  // TV Spot
  { id: 'tv-commercial', name: 'TV Commercial', shortDescription: 'Custom sales pitch to camera.', category: 'tv-spot' },
];

type Category = 'comedy' | 'relatable' | 'asmr' | 'tv-spot';

const CATEGORY_META: Record<Category, { label: string; icon: typeof Laugh }> = {
  comedy: { label: 'Comedy', icon: Laugh },
  relatable: { label: 'Relatable', icon: Eye },
  asmr: { label: 'ASMR', icon: Mic },
  'tv-spot': { label: 'TV Spot', icon: Tv },
};

const CAR_PRESETS = [
  { label: 'Classic Vette', year: '2024', make: 'Chevrolet', model: 'Corvette', color: 'Red' },
  { label: 'Rugged Jeep', year: '2024', make: 'Jeep', model: 'Wrangler', color: 'Black' },
];

interface GeneratedVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
}

export default function UGCCreatorPage() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>('comedy');
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [car, setCar] = useState({ year: '2024', make: 'Chevrolet', model: 'Corvette', color: 'Red' });
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<'4s' | '6s' | '8s'>('6s');
  const [commercialScript, setCommercialScript] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const filteredScenes = SCENES.filter((s) => s.category === selectedCategory);

  // Fetch characters from API
  const { data: charactersData } = useQuery({
    queryKey: ['ugc-characters'],
    queryFn: () => ugcCreatorApi.getCharacters().then(r => r.data),
  });
  const allCharacters: Character[] = (charactersData?.data || []);

  const availableCharacters = selectedCategory === 'asmr'
    ? allCharacters.filter(c => c.restrictToCategory === 'asmr' || c.id === 'puppet-hands')
    : allCharacters.filter(c => c.restrictToCategory !== 'asmr');

  // Fetch services and specials for TV Spot dropdown
  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.getAll().then(r => r.data),
  });
  const { data: specialsData } = useQuery({
    queryKey: ['specials'],
    queryFn: () => specialsApi.getAll().then(r => r.data),
  });
  const services = servicesData?.data || [];
  const specials = specialsData?.data || [];

  const formatDiscount = (s: any) => {
    if (s.discountType === 'percentage') return `${s.discountValue}% OFF`;
    if (s.discountType === 'fixed') return `$${s.discountValue} OFF`;
    if (s.discountType === 'bogo') return 'BOGO';
    return 'Special Offer';
  };

  // Polling
  const { job: currentJob, startPolling } = usePollJob({
    getJob: ugcCreatorApi.getJob,
    onComplete: (job) => {
      setGeneratedVideo({
        id: job.id,
        videoUrl: job.videoUrl || '',
        thumbnailUrl: job.thumbnailUrl || '',
        caption: job.caption || '',
      });
      setStep(4); // result
      toast.success('Video generated successfully!');
    },
    onFailed: (job) => {
      toast.error(job.error || 'Video generation failed');
      setStep(3);
    },
    onTimeout: () => {
      toast.error('Video generation timed out. Please try again.');
      setStep(3);
    },
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      ugcCreatorApi.generate({
        sceneId: selectedScene!.id,
        characterId: selectedCharacter!.id,
        car,
        aspectRatio,
        duration,
        commercialScript: selectedCategory === 'tv-spot' ? commercialScript : undefined,
      }),
    onSuccess: (response) => {
      const job = response.data.data?.job || response.data.job;
      setStep(3.5 as any); // generating state
      startPolling(job.id);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to start video generation');
    },
  });

  const handleGenerate = () => {
    if (!selectedScene || !selectedCharacter) {
      toast.error('Please select a scene and character');
      return;
    }
    generateMutation.mutate();
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedScene(null);
    setSelectedCharacter(null);
    setCar({ year: '2024', make: 'Chevrolet', model: 'Corvette', color: 'Red' });
    setAspectRatio('16:9');
    setDuration('6s');
    setCommercialScript('');
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
      a.download = `ugc-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Downloading video...');
    } catch {
      window.open(generatedVideo.videoUrl, '_blank');
    }
  };

  const isGenerating = step === 3.5;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro flex items-center justify-center gap-3">
          <Film className="text-retro-mustard" />
          UGC Creator
        </h1>
        <p className="text-gray-600 mt-2">Create character-based video skits for social media</p>
      </div>

      {/* Wizard Steps */}
      <div className="flex items-center justify-center gap-0">
        {[
          { num: 1, label: 'CONCEPT' },
          { num: 2, label: 'TALENT & SET' },
          { num: 3, label: 'ACTION!' },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            {idx > 0 && <div className="w-16 h-0.5 bg-gray-300" />}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  step >= s.num
                    ? 'bg-retro-red text-white border-retro-red'
                    : 'bg-gray-200 text-gray-500 border-gray-300'
                }`}
              >
                {step > s.num && step < 3.5 ? <Check size={16} /> : s.num}
              </div>
              <span
                className={`font-heading text-xs mt-1 uppercase ${
                  step >= s.num ? 'text-retro-red' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Choose Your Vibe */}
      {step === 1 && (
        <div className="card-retro space-y-4">
          <h2 className="font-heading text-lg uppercase flex items-center gap-2">
            <Sparkles size={18} className="text-retro-mustard" />
            1. Choose Your Vibe
          </h2>

          {/* Category tabs */}
          <div className="flex border-2 border-black">
            {(['comedy', 'relatable', 'asmr', 'tv-spot'] as Category[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedScene(null);
                  }}
                  className={`flex-1 py-2 px-3 font-heading uppercase text-sm border-r last:border-r-0 border-black flex items-center justify-center gap-1 ${
                    selectedCategory === cat
                      ? 'bg-retro-red text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={14} />
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Scene cards */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {filteredScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene)}
                className={`p-3 border-2 text-left transition-all ${
                  selectedScene?.id === scene.id
                    ? 'border-retro-red bg-red-50 shadow-[2px_2px_0px_black]'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
              >
                <h4 className="font-heading uppercase text-sm">{scene.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{scene.shortDescription}</p>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button onClick={resetWizard} className="btn-retro-outline text-sm">
              START OVER
            </button>
            <button
              onClick={() => {
                if (!selectedScene) {
                  toast.error('Please select a scene first');
                  return;
                }
                setStep(2);
              }}
              className="btn-retro-primary flex items-center gap-2 text-sm"
            >
              NEXT STEP <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Talent & Set */}
      {step === 2 && (
        <div className="space-y-6">
          {/* The Talent */}
          <div className="card-retro space-y-4">
            <div>
              <h3 className="font-heading text-lg">2. THE TALENT</h3>
              <p className="text-sm text-gray-500">
                Who is starring in this video? All talent come dressed in professional mechanic attire.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {availableCharacters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharacter(char)}
                  className={`p-4 border-2 text-left transition-all ${
                    selectedCharacter?.id === char.id
                      ? 'border-retro-red bg-red-50 shadow-retro'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {char.isBuiltIn !== false ? (
                    <span className="text-2xl">{BUILTIN_EMOJI[char.id] || '🎭'}</span>
                  ) : char.imageUrl ? (
                    <img src={char.imageUrl} alt={char.name} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <span className="text-2xl">🎭</span>
                  )}
                  <h4 className="font-heading uppercase mt-1">{char.name}</h4>
                  <p className="text-xs text-gray-500">{char.personality}</p>
                </button>
              ))}
              {availableCharacters.length === 0 && (
                <p className="col-span-2 text-sm text-gray-500 font-heading uppercase">No characters available for this category</p>
              )}
            </div>
          </div>

          {/* The Set */}
          <div className="card-retro space-y-4">
            <h3 className="font-heading text-lg">3. THE SET (BACKGROUND)</h3>

            {/* Quick presets */}
            <div className="flex gap-3">
              {CAR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    setCar({
                      year: preset.year,
                      make: preset.make,
                      model: preset.model,
                      color: preset.color,
                    })
                  }
                  className={`flex-1 py-2 px-4 border-2 font-heading uppercase text-sm transition-all ${
                    car.make === preset.make && car.model === preset.model
                      ? 'border-retro-red bg-red-50 text-retro-red'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Car fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-heading text-xs uppercase mb-1 text-gray-500">Year</label>
                <input
                  type="text"
                  value={car.year}
                  onChange={(e) => setCar((p) => ({ ...p, year: e.target.value }))}
                  className="w-full p-2 border-2 border-black text-sm focus:ring-2 focus:ring-retro-red focus:border-retro-red"
                />
              </div>
              <div>
                <label className="block font-heading text-xs uppercase mb-1 text-gray-500">Make</label>
                <input
                  type="text"
                  value={car.make}
                  onChange={(e) => setCar((p) => ({ ...p, make: e.target.value }))}
                  className="w-full p-2 border-2 border-black text-sm focus:ring-2 focus:ring-retro-red focus:border-retro-red"
                />
              </div>
              <div>
                <label className="block font-heading text-xs uppercase mb-1 text-gray-500">Model</label>
                <input
                  type="text"
                  value={car.model}
                  onChange={(e) => setCar((p) => ({ ...p, model: e.target.value }))}
                  className="w-full p-2 border-2 border-black text-sm focus:ring-2 focus:ring-retro-red focus:border-retro-red"
                />
              </div>
              <div>
                <label className="block font-heading text-xs uppercase mb-1 text-gray-500">Color</label>
                <input
                  type="text"
                  value={car.color}
                  onChange={(e) => setCar((p) => ({ ...p, color: e.target.value }))}
                  className="w-full p-2 border-2 border-black text-sm focus:ring-2 focus:ring-retro-red focus:border-retro-red"
                />
              </div>
            </div>

            {/* Preview */}
            <p className="text-xs text-gray-500 font-heading uppercase">
              CURRENT SELECTION:{' '}
              <span className="text-retro-navy font-bold">
                {car.color} {car.year} {car.make} {car.model}
              </span>
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn-retro-outline flex items-center gap-2 text-sm">
              <ChevronLeft size={16} /> PREVIOUS
            </button>
            <button
              onClick={() => {
                if (!selectedCharacter) {
                  toast.error('Please select a character');
                  return;
                }
                setStep(3);
              }}
              className="btn-retro-primary flex items-center gap-2 text-sm"
            >
              NEXT STEP <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Action! */}
      {step === 3 && (
        <div className="card-retro space-y-6">
          <h2 className="font-heading text-lg uppercase">Action!</h2>

          {/* Summary */}
          <div className="bg-retro-cream p-4 border-2 border-retro-mustard space-y-2">
            <h3 className="font-heading text-sm uppercase text-gray-600">Your Video Setup</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Scene:</span>{' '}
                <span className="font-medium">{selectedScene?.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Character:</span>{' '}
                <span className="font-medium">{selectedCharacter?.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Car:</span>{' '}
                <span className="font-medium">
                  {car.color} {car.year} {car.make} {car.model}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>{' '}
                <span className="font-medium capitalize">{selectedScene?.category}</span>
              </div>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
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

          {/* Duration */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2">Duration</label>
            <div className="flex gap-3">
              {(['4s', '6s', '8s'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 border-2 font-heading text-sm ${
                    duration === d
                      ? 'border-retro-red bg-red-50 text-retro-red'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Commercial script (TV Spot only) */}
          {selectedScene?.category === 'tv-spot' && (
            <div className="space-y-3">
              <div>
                <label className="block font-heading text-sm uppercase mb-2">Pick a Promo to Pitch</label>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setCommercialScript(val);
                  }}
                  className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red"
                  defaultValue=""
                >
                  <option value="" disabled>-- Pick a promo to pitch --</option>
                  {specials.length > 0 && (
                    <optgroup label="Specials">
                      {specials.map((s: any) => {
                        const script = `Hey! Come check out our ${formatDiscount(s)} on ${s.title}! ${s.description || "Don't miss this deal!"}. Call today!`;
                        return <option key={s.id} value={script}>{formatDiscount(s)} {s.title}</option>;
                      })}
                    </optgroup>
                  )}
                  {services.length > 0 && (
                    <optgroup label="Services">
                      {services.map((s: any) => {
                        const script = `Hey! Come check out our ${s.name}! ${s.description || "Don't miss this deal!"}. Call today!`;
                        return <option key={s.id} value={script}>{s.name}</option>;
                      })}
                    </optgroup>
                  )}
                </select>
              </div>
              <div>
                <label className="block font-heading text-sm uppercase mb-2">Commercial Script</label>
                <textarea
                  value={commercialScript}
                  onChange={(e) => setCommercialScript(e.target.value)}
                  placeholder="Write your sales pitch script..."
                  rows={4}
                  className="w-full p-3 border-2 border-black focus:ring-2 focus:ring-retro-red focus:border-retro-red text-sm"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-retro-outline flex items-center gap-2 text-sm">
              <ChevronLeft size={16} /> BACK
            </button>
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="flex-1 btn-retro-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generateMutation.isPending ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Sparkles size={20} />
              )}
              GENERATE VIDEO
            </button>
          </div>
        </div>
      )}

      {/* Generating state */}
      {isGenerating && currentJob && (
        <div className="card-retro text-center py-12">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-retro-red/10 flex items-center justify-center">
              <Loader className="w-12 h-12 animate-spin text-retro-red" />
            </div>
            <div>
              <h2 className="font-heading text-2xl uppercase">Creating Your Video</h2>
              <p className="text-gray-600 mt-2">
                {currentJob.status === 'pending' && 'Preparing your video...'}
                {currentJob.status === 'processing' && 'AI is generating your video...'}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-full bg-retro-red rounded-full transition-all duration-500"
                style={{ width: `${currentJob.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{currentJob.progress}% complete</p>
            <p className="text-xs text-gray-400">
              Veo 3.1 generation typically takes 1-3 minutes. Please wait...
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 4 && generatedVideo && (
        <div className="space-y-4">
          <div className="card-retro text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <Check size={24} />
              <span className="font-heading text-xl uppercase">Video Ready!</span>
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
            <button onClick={handleDownload} className="btn-retro-primary flex-1 flex items-center justify-center gap-2">
              <Download size={18} /> Download
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="btn-retro-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Share2 size={18} /> Share
            </button>
          </div>
          <button onClick={resetWizard} className="btn-retro-outline w-full flex items-center justify-center gap-2">
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
            title: `UGC - ${selectedScene?.name || 'Video'}`,
            imageUrl: generatedVideo.thumbnailUrl,
            caption: generatedVideo.caption,
          }}
        />
      )}
    </div>
  );
}
