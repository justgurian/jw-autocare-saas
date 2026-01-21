import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { memeApi, downloadApi } from '../../../services/api';
import {
  Laugh,
  Shuffle,
  Download,
  Share2,
  Loader2,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from '../../../components/features/ShareModal';

interface MemeStyle {
  id: string;
  name: string;
  description: string;
  category: string;
  previewEmoji: string;
  topicSuggestions: string[];
}

interface GeneratedMeme {
  id: string;
  imageUrl: string;
  caption: string;
  title: string;
  style: {
    id: string;
    name: string;
    emoji: string;
  };
  topic?: string;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  relatable: { label: 'Relatable', color: 'bg-blue-500' },
  educational: { label: 'Educational', color: 'bg-green-500' },
  seasonal: { label: 'Seasonal', color: 'bg-orange-500' },
  promotional: { label: 'Promotional', color: 'bg-purple-500' },
};

export default function MemeGeneratorPage() {
  const [selectedStyle, setSelectedStyle] = useState<MemeStyle | null>(null);
  const [topic, setTopic] = useState('');
  const [customText, setCustomText] = useState('');
  const [generatedMeme, setGeneratedMeme] = useState<GeneratedMeme | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);

  // Fetch meme styles
  const { data: stylesData } = useQuery({
    queryKey: ['meme-styles'],
    queryFn: () => memeApi.getStyles().then(res => res.data),
  });

  // Generate meme mutation
  const generateMutation = useMutation({
    mutationFn: () => memeApi.generate({
      styleId: selectedStyle!.id,
      topic,
      customText: customText || undefined,
    }),
    onSuccess: (res) => {
      setGeneratedMeme(res.data);
      toast.success('Meme generated!');
    },
    onError: () => {
      toast.error('Generation failed. Please try again.');
    },
  });

  // Random meme mutation
  const randomMutation = useMutation({
    mutationFn: () => memeApi.random(),
    onSuccess: (res) => {
      setGeneratedMeme(res.data);
      toast.success('Random meme generated!');
    },
    onError: () => {
      toast.error('Generation failed. Please try again.');
    },
  });

  const handleGenerate = () => {
    if (!selectedStyle || !topic.trim()) {
      toast.error('Please select a style and enter a topic');
      return;
    }
    generateMutation.mutate();
  };

  const handleRandomMeme = () => {
    randomMutation.mutate();
  };

  const handleDownload = async () => {
    if (!generatedMeme) return;
    try {
      const response = await downloadApi.downloadSingle(generatedMeme.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `meme-${generatedMeme.style.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleCopyCaption = () => {
    if (!generatedMeme?.caption) return;
    navigator.clipboard.writeText(generatedMeme.caption);
    setCaptionCopied(true);
    toast.success('Caption copied!');
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setTopic(suggestion);
  };

  const isGenerating = generateMutation.isPending || randomMutation.isPending;
  const styles: MemeStyle[] = stylesData?.styles || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="heading-retro flex items-center gap-3">
          <Laugh className="text-retro-mustard" />
          Meme Generator
        </h1>
        <p className="text-gray-600 mt-2">
          Create viral-worthy memes for your auto repair shop's social media
        </p>
      </div>

      {/* Random Meme Button - Hero */}
      <div className="card-retro bg-gradient-to-r from-retro-mustard to-yellow-500 text-white border-4 border-black">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl uppercase flex items-center gap-2">
              <Shuffle size={28} />
              Feeling Lucky?
            </h2>
            <p className="text-white/80 mt-1">
              Generate a random meme with one click - AI picks the style and topic!
            </p>
          </div>
          <button
            onClick={handleRandomMeme}
            disabled={isGenerating}
            className="btn-retro bg-white text-gray-900 hover:bg-gray-100 flex items-center gap-2 px-8 py-4 text-lg"
          >
            {randomMutation.isPending ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Random Meme
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Style Selection & Form */}
        <div className="space-y-6">
          {/* Style Selection */}
          <div className="card-retro">
            <h2 className="font-heading text-xl uppercase mb-4">1. Choose a Meme Style</h2>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(CATEGORY_LABELS).map(([category, { label, color }]) => {
                const categoryStyles = styles.filter(s => s.category === category);
                if (categoryStyles.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-sm font-heading uppercase text-gray-600">{label}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {categoryStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => {
                            setSelectedStyle(style);
                            setTopic('');
                          }}
                          className={`p-3 border-2 text-left transition-all ${
                            selectedStyle?.id === style.id
                              ? 'border-retro-red bg-red-50'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{style.previewEmoji}</span>
                            <div className="flex-1">
                              <p className="font-heading text-sm uppercase">{style.name}</p>
                              <p className="text-xs text-gray-500">{style.description}</p>
                            </div>
                            {selectedStyle?.id === style.id && (
                              <Check size={20} className="text-retro-red" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic Input */}
          {selectedStyle && (
            <div className="card-retro">
              <h2 className="font-heading text-xl uppercase mb-4">2. Enter Your Topic</h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-heading text-sm uppercase mb-2">
                    Meme Topic *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Check engine light, Oil changes, Brake squeaks..."
                    className="input-retro w-full"
                    maxLength={200}
                  />
                </div>

                {/* Topic Suggestions */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStyle.topicSuggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleUseSuggestion(suggestion)}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-heading text-sm uppercase mb-2">
                    Custom Text (Optional)
                  </label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Add specific text you want on the meme..."
                    className="input-retro w-full h-20 resize-none"
                    maxLength={300}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || isGenerating}
                  className="btn-retro-primary w-full flex items-center justify-center gap-2 py-4"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Generating Meme...
                    </>
                  ) : (
                    <>
                      <Laugh size={20} />
                      Generate Meme
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Preview */}
        <div className="card-retro">
          <h2 className="font-heading text-xl uppercase mb-4">Preview</h2>

          {generatedMeme ? (
            <div className="space-y-4">
              {/* Generated Image */}
              <div className="relative">
                <div className="aspect-square bg-gray-100 border-4 border-black shadow-retro overflow-hidden">
                  <img
                    src={generatedMeme.imageUrl}
                    alt={generatedMeme.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Style badge */}
                <div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1 text-xs font-heading uppercase flex items-center gap-1">
                  <span>{generatedMeme.style.emoji}</span>
                  {generatedMeme.style.name}
                </div>
              </div>

              {/* Caption */}
              <div className="bg-white p-4 border-2 border-black">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-heading text-sm uppercase text-gray-600">Caption:</p>
                  <button
                    onClick={handleCopyCaption}
                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
                  >
                    {captionCopied ? <Check size={12} /> : <Copy size={12} />}
                    {captionCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-900">{generatedMeme.caption}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownload}
                  className="btn-retro-secondary flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="btn-retro-primary flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>

              {/* Generate Another */}
              <button
                onClick={() => setGeneratedMeme(null)}
                className="w-full btn-retro-outline flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Create Another
              </button>
            </div>
          ) : isGenerating ? (
            <div className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
              <Loader2 size={48} className="animate-spin text-retro-mustard mb-4" />
              <p className="font-heading uppercase">Generating your meme...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
              <Laugh size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                {selectedStyle
                  ? 'Enter a topic and click Generate'
                  : 'Select a meme style to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {generatedMeme && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: generatedMeme.id,
            title: generatedMeme.title,
            imageUrl: generatedMeme.imageUrl,
            caption: generatedMeme.caption,
          }}
        />
      )}
    </div>
  );
}
