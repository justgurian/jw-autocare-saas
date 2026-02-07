import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jingleGeneratorApi } from '../../../services/api';
import { usePollJob } from '../../../hooks/usePollJob';
import {
  Music,
  Mic2,
  Download,
  RefreshCw,
  Loader,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Trash2,
  Clock,
  Zap,
  Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Genre {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface JingleResult {
  contentId: string;
  audioUrl: string;
  shopName: string;
  genreId: string;
  genreName: string;
  phoneticName: string;
}

interface HistoryItem {
  id: string;
  title: string;
  audioUrl: string;
  shopName: string;
  genreId: string;
  genreName: string;
  phoneticName: string;
  createdAt: string;
}

type JingleMode = 'easy' | 'custom';

export default function JingleGeneratorPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'name' | 'genre' | 'generating' | 'result'>('name');
  const [shopName, setShopName] = useState('');
  const [phoneticPreview, setPhoneticPreview] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [mode, setMode] = useState<JingleMode>('easy');
  const [customGenre, setCustomGenre] = useState('');
  const [customLyrics, setCustomLyrics] = useState('');
  const [result, setResult] = useState<JingleResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // ─── Polling Hook ──────────────────────────────────────────────────────────
  const { job: currentJob, startPolling } = usePollJob({
    getJob: jingleGeneratorApi.getJob,
    intervalMs: 3000,
    maxPollTimeMs: 120000,
    onComplete: (job) => {
      const metadata = job.metadata || {};
      setResult({
        contentId: job.contentId || '',
        audioUrl: (metadata.audioUrl as string) || '',
        shopName: (metadata.shopName as string) || shopName,
        genreId: (metadata.genreId as string) || selectedGenre?.id || '',
        genreName: (metadata.genreName as string) || customGenre || selectedGenre?.name || '',
        phoneticName: (metadata.phoneticName as string) || phoneticPreview,
      });
      setStep('result');
      toast.success('Your jingle is ready!');
      queryClient.invalidateQueries({ queryKey: ['jingle-history'] });
    },
    onFailed: (job) => {
      toast.error(job.error || 'Jingle generation failed. Please try again.');
      setStep('genre');
    },
    onTimeout: () => {
      toast.error('Generation timed out. Please try again.');
      setStep('genre');
    },
  });

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: genresData } = useQuery({
    queryKey: ['jingle-genres'],
    queryFn: () => jingleGeneratorApi.getGenres().then((r) => r.data),
  });
  const genres: Genre[] = genresData?.data || [];

  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ['jingle-history'],
    queryFn: () => jingleGeneratorApi.getHistory().then((r) => r.data),
    enabled: showHistory,
  });
  const history: HistoryItem[] = historyData?.data || [];

  // ─── Phonetic Preview (debounced) ──────────────────────────────────────────
  const previewMutation = useMutation({
    mutationFn: (name: string) => jingleGeneratorApi.preview(name),
    onSuccess: (res) => {
      setPhoneticPreview(res.data?.data?.phoneticName || '');
    },
  });

  useEffect(() => {
    if (shopName.length < 2) {
      setPhoneticPreview('');
      return;
    }
    const timer = setTimeout(() => {
      previewMutation.mutate(shopName);
    }, 300);
    return () => clearTimeout(timer);
  }, [shopName]);

  // ─── Generate ──────────────────────────────────────────────────────────────
  const generateMutation = useMutation({
    mutationFn: (data: {
      shopName: string;
      genreId: string;
      mode: JingleMode;
      customGenre?: string;
      customLyrics?: string;
    }) => jingleGeneratorApi.generate(data),
    onSuccess: (response) => {
      const jobId = response.data?.data?.job?.id || response.data?.data?.id || response.data?.id;
      if (jobId) {
        setStep('generating');
        startPolling(jobId);
      } else {
        toast.error('Failed to start generation');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to start jingle generation');
    },
  });

  // ─── Delete ────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => jingleGeneratorApi.delete(id),
    onSuccess: () => {
      toast.success('Jingle deleted');
      refetchHistory();
    },
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!selectedGenre) return;
    generateMutation.mutate({
      shopName,
      genreId: selectedGenre.id,
      mode,
      customGenre: mode === 'custom' ? customGenre || undefined : undefined,
      customLyrics: mode === 'custom' ? customLyrics || undefined : undefined,
    });
  };

  const handleStartOver = () => {
    setStep('name');
    setResult(null);
    setSelectedGenre(null);
    setShopName('');
    setPhoneticPreview('');
    setCustomGenre('');
    setCustomLyrics('');
  };

  const handleTryAnotherGenre = () => {
    setStep('genre');
    setResult(null);
    setSelectedGenre(null);
  };

  const handleDownload = () => {
    if (!result?.audioUrl) return;
    const a = document.createElement('a');
    a.href = result.audioUrl;
    a.download = `${result.shopName.replace(/\s+/g, '-')}-jingle.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-retro-navy flex items-center gap-3">
            <Music className="text-retro-red" size={32} />
            Jingle Generator
          </h1>
          <p className="text-gray-600 mt-1 font-heading">
            Create a catchy song jingle for your shop
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 border-2 border-black bg-retro-cream hover:bg-retro-mustard font-heading text-sm shadow-retro transition-colors"
        >
          <Clock size={16} className="inline mr-2" />
          {showHistory ? 'Hide' : 'Show'} History
        </button>
      </div>

      {/* Progress Steps */}
      {step !== 'result' && (
        <div className="flex items-center gap-2 mb-6">
          {(['name', 'genre', 'generating'] as const).map((s, i) => {
            const stepLabels = ['Shop Name', 'Style & Lyrics', 'Generate'];
            const stepIndex = ['name', 'genre', 'generating'].indexOf(step);
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-heading text-sm ${
                    step === s
                      ? 'bg-retro-red text-white'
                      : stepIndex > i
                        ? 'bg-retro-navy text-white'
                        : 'bg-retro-cream text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`text-xs font-heading hidden sm:inline ${step === s ? 'text-retro-red' : 'text-gray-400'}`}>
                  {stepLabels[i]}
                </span>
                {i < 2 && <ChevronRight size={16} className="text-gray-300" />}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Step 1: Shop Name + Mode Selection ─────────────────────────── */}
      {step === 'name' && (
        <div className="border-4 border-black bg-white p-8 shadow-retro">
          <h2 className="text-xl font-heading text-retro-navy mb-2">
            What's your shop called?
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            We'll turn your shop name into a catchy jingle
          </p>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="e.g., JW Auto Care"
            className="w-full p-4 border-2 border-black font-heading text-lg focus:outline-none focus:ring-2 focus:ring-retro-red"
            maxLength={100}
            autoFocus
          />

          {phoneticPreview && (
            <div className="mt-4 p-4 bg-retro-cream border-2 border-dashed border-retro-navy rounded">
              <p className="text-sm font-heading text-gray-500 mb-1">
                Your jingle will sing:
              </p>
              <p className="text-xl text-retro-red font-bold tracking-wide">
                {phoneticPreview}
              </p>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="mt-6 mb-4">
            <p className="text-sm font-heading text-gray-500 mb-3">Choose your mode:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('easy')}
                className={`p-4 border-2 text-left transition-all ${
                  mode === 'easy'
                    ? 'border-retro-red bg-red-50 shadow-retro'
                    : 'border-black bg-white hover:bg-retro-cream'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={18} className={mode === 'easy' ? 'text-retro-red' : 'text-gray-400'} />
                  <span className="font-heading text-sm">Easy Mode</span>
                </div>
                <p className="text-xs text-gray-500">
                  Catchy jingle that repeats your shop name — pick a genre and go
                </p>
              </button>
              <button
                onClick={() => setMode('custom')}
                className={`p-4 border-2 text-left transition-all ${
                  mode === 'custom'
                    ? 'border-retro-red bg-red-50 shadow-retro'
                    : 'border-black bg-white hover:bg-retro-cream'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Pencil size={18} className={mode === 'custom' ? 'text-retro-red' : 'text-gray-400'} />
                  <span className="font-heading text-sm">Custom Mode</span>
                </div>
                <p className="text-xs text-gray-500">
                  Write your own lyrics and/or describe a custom genre
                </p>
              </button>
            </div>
          </div>

          <button
            onClick={() => setStep('genre')}
            disabled={shopName.length < 2}
            className="mt-4 px-8 py-3 bg-retro-red text-white border-2 border-black font-heading text-lg shadow-retro hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={20} className="inline ml-1" />
          </button>
        </div>
      )}

      {/* ─── Step 2: Genre + Custom Options ────────────────────────────── */}
      {step === 'genre' && (
        <div className="border-4 border-black bg-white p-8 shadow-retro">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-heading text-retro-navy">
              {mode === 'easy' ? 'Pick a genre' : 'Customize your jingle'}
            </h2>
            <button
              onClick={() => setStep('name')}
              className="text-sm font-heading text-retro-navy hover:underline flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Back
            </button>
          </div>

          <p className="mb-4 text-gray-500 text-sm">
            {mode === 'easy' ? 'Singing: ' : 'Shop: '}
            <span className="text-retro-red font-bold">{mode === 'easy' ? phoneticPreview : shopName}</span>
          </p>

          {/* Genre Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 mb-6">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre)}
                className={`p-3 border-2 text-center transition-all ${
                  selectedGenre?.id === genre.id
                    ? 'border-retro-red bg-red-50 shadow-retro scale-105'
                    : 'border-black bg-white hover:bg-retro-cream hover:shadow-retro'
                }`}
              >
                <span className="text-xl block mb-1">{genre.icon}</span>
                <span className="font-heading text-xs block">{genre.name}</span>
              </button>
            ))}
          </div>

          {/* Custom Mode Fields */}
          {mode === 'custom' && (
            <div className="space-y-4 mb-6 p-4 bg-retro-cream border-2 border-dashed border-retro-navy rounded">
              <div>
                <label className="block text-sm font-heading text-retro-navy mb-1">
                  Custom Genre / Style (optional)
                </label>
                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="e.g., 80s synthwave, mariachi, gospel choir, lo-fi beats..."
                  className="w-full p-3 border-2 border-black font-heading text-sm focus:outline-none focus:ring-2 focus:ring-retro-red"
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Describe any genre or style. Leave blank to use the selected preset above.
                </p>
              </div>

              <div>
                <label className="block text-sm font-heading text-retro-navy mb-1">
                  Custom Lyrics (optional)
                </label>
                <textarea
                  value={customLyrics}
                  onChange={(e) => setCustomLyrics(e.target.value)}
                  placeholder={"e.g.,\nJay Double-Yew Auto Care\nWe fix your ride right\nJay Double-Yew Auto Care\nDay or night"}
                  className="w-full p-3 border-2 border-black font-heading text-sm focus:outline-none focus:ring-2 focus:ring-retro-red resize-y min-h-[100px]"
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Write your own lyrics (one line per row). Leave blank to auto-repeat your shop name.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!selectedGenre || generateMutation.isPending}
            className="px-8 py-3 bg-retro-red text-white border-2 border-black font-heading text-lg shadow-retro hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generateMutation.isPending ? (
              <>
                <Loader size={20} className="inline animate-spin mr-2" /> Starting...
              </>
            ) : (
              <>
                <Mic2 size={20} className="inline mr-2" /> Generate Jingle
              </>
            )}
          </button>
        </div>
      )}

      {/* ─── Step 3: Generating ────────────────────────────────────────── */}
      {step === 'generating' && currentJob && (
        <div className="border-4 border-black bg-white p-8 shadow-retro text-center">
          <div className="animate-spin-slow w-16 h-16 border-4 border-retro-red border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-heading text-retro-navy mb-2">
            Composing Your Jingle...
          </h2>
          <p className="text-gray-600 mb-6">
            Creating a <span className="font-heading">{customGenre || selectedGenre?.name}</span> jingle for{' '}
            <span className="font-heading">"{shopName}"</span>
          </p>

          <div className="w-full max-w-md mx-auto bg-gray-200 border-2 border-black h-6 overflow-hidden">
            <div
              className="h-full bg-retro-red transition-all duration-500"
              style={{ width: `${currentJob.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 font-heading">
            {currentJob.progress}% complete
          </p>
        </div>
      )}

      {/* ─── Result ────────────────────────────────────────────────────── */}
      {step === 'result' && result && (
        <div className="border-4 border-black bg-white p-8 shadow-retro">
          <h2 className="text-xl font-heading text-retro-navy mb-4 flex items-center gap-2">
            <Volume2 className="text-retro-red" /> Your Jingle is Ready!
          </h2>

          <div className="mb-4 space-y-1">
            <p className="text-gray-600">
              <span className="font-heading">Shop:</span> {result.shopName}
            </p>
            <p className="text-gray-600">
              <span className="font-heading">Genre:</span> {result.genreName}
            </p>
            {result.phoneticName && (
              <p className="text-gray-600">
                <span className="font-heading">Lyrics:</span>{' '}
                <span className="text-retro-red font-bold">{result.phoneticName}</span>
              </p>
            )}
          </div>

          <div className="bg-retro-cream border-2 border-black p-4 mb-6">
            <audio controls className="w-full" src={result.audioUrl} autoPlay>
              Your browser does not support the audio element.
            </audio>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-retro-navy text-white border-2 border-black font-heading shadow-retro hover:bg-blue-900 transition-colors"
            >
              <Download size={18} className="inline mr-2" /> Download MP3
            </button>
            <button
              onClick={handleTryAnotherGenre}
              className="px-6 py-3 bg-retro-cream text-retro-navy border-2 border-black font-heading shadow-retro hover:bg-retro-mustard transition-colors"
            >
              <RefreshCw size={18} className="inline mr-2" /> Try Another Genre
            </button>
            <button
              onClick={handleStartOver}
              className="px-6 py-3 bg-white text-gray-600 border-2 border-gray-300 font-heading hover:border-black transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* ─── History ───────────────────────────────────────────────────── */}
      {showHistory && (
        <div className="mt-8 border-4 border-black bg-white p-6 shadow-retro">
          <h2 className="text-lg font-heading text-retro-navy mb-4">Past Jingles</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No jingles generated yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 border-2 border-gray-200 hover:border-black transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <audio controls className="h-8 flex-shrink-0" src={item.audioUrl} />
                  <button
                    onClick={() => {
                      if (confirm('Delete this jingle?')) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
