import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { reviewReplyApi } from '../../../services/api';
import {
  MessageSquare,
  Star,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Loader,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Clock,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
type ReviewSentiment = 'positive' | 'negative' | 'neutral' | 'mixed';
type ResponseTone = 'professional' | 'friendly' | 'apologetic' | 'grateful' | 'empathetic';
type ReviewPlatform = 'google' | 'yelp' | 'facebook' | 'other';

interface ReviewAnalysis {
  sentiment: ReviewSentiment;
  keyPoints: string[];
  complaintsIdentified: string[];
  praisesIdentified: string[];
  suggestedTone: ResponseTone;
  urgency: 'high' | 'medium' | 'low';
}

interface GeneratedReply {
  id: string;
  response: string;
  analysis: ReviewAnalysis;
  alternatives?: string[];
  tips?: string[];
}

const SENTIMENT_ICONS: Record<ReviewSentiment, { icon: React.ReactNode; color: string; bg: string }> = {
  positive: { icon: <ThumbsUp size={20} />, color: 'text-green-600', bg: 'bg-green-100' },
  negative: { icon: <ThumbsDown size={20} />, color: 'text-red-600', bg: 'bg-red-100' },
  neutral: { icon: <Meh size={20} />, color: 'text-gray-600', bg: 'bg-gray-100' },
  mixed: { icon: <AlertCircle size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-100' },
};

const TONE_OPTIONS: Array<{ id: ResponseTone; name: string; description: string }> = [
  { id: 'professional', name: 'Professional', description: 'Formal and business-like' },
  { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
  { id: 'apologetic', name: 'Apologetic', description: 'Sincere and remorseful' },
  { id: 'grateful', name: 'Grateful', description: 'Appreciative and thankful' },
  { id: 'empathetic', name: 'Empathetic', description: 'Understanding and caring' },
];

const PLATFORM_OPTIONS: Array<{ id: ReviewPlatform; name: string }> = [
  { id: 'google', name: 'Google' },
  { id: 'yelp', name: 'Yelp' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'other', name: 'Other' },
];

export default function ReviewReplyPage() {
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [starRating, setStarRating] = useState<number | undefined>(undefined);
  const [platform, setPlatform] = useState<ReviewPlatform>('google');
  const [selectedTone, setSelectedTone] = useState<ResponseTone | undefined>(undefined);
  const [includeOffer, setIncludeOffer] = useState(false);
  const [includeInviteBack, setIncludeInviteBack] = useState(true);

  const [generatedReply, setGeneratedReply] = useState<GeneratedReply | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      reviewReplyApi.generate({
        reviewText,
        reviewerName: reviewerName || undefined,
        starRating,
        platform,
        tone: selectedTone,
        includeOffer,
        includeInviteBack,
      }),
    onSuccess: (response) => {
      setGeneratedReply(response.data.data);
      toast.success('Reply generated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate reply');
    },
  });

  // Regenerate with different tone
  const regenerateMutation = useMutation({
    mutationFn: (newTone: ResponseTone) =>
      reviewReplyApi.regenerate({
        reviewText,
        reviewerName: reviewerName || undefined,
        starRating,
        platform,
        newTone,
        includeOffer,
        includeInviteBack,
      }),
    onSuccess: (response) => {
      setGeneratedReply(response.data.data);
      toast.success('Reply regenerated with new tone!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to regenerate');
    },
  });

  // Handle generate
  const handleGenerate = () => {
    if (!reviewText.trim()) {
      toast.error('Please enter the review text');
      return;
    }
    generateMutation.mutate();
  };

  // Handle copy
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Handle reset
  const handleReset = () => {
    setReviewText('');
    setReviewerName('');
    setStarRating(undefined);
    setPlatform('google');
    setSelectedTone(undefined);
    setIncludeOffer(false);
    setIncludeInviteBack(true);
    setGeneratedReply(null);
  };

  const isLoading = generateMutation.isPending || regenerateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro flex items-center justify-center gap-3">
          <MessageSquare className="text-retro-mustard" />
          Review Reply AI
        </h1>
        <p className="text-gray-600 mt-2">
          Generate professional responses to customer reviews in seconds
        </p>
      </div>

      {/* Input Section */}
      <div className="card-retro space-y-6">
        <h2 className="font-heading text-xl uppercase border-b border-gray-200 pb-2">
          Paste the Review
        </h2>

        {/* Review Text */}
        <div>
          <label className="block font-heading text-sm uppercase mb-2">
            Review Text *
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder='Paste the customer review here, e.g., "Great service! The team was friendly and fixed my car quickly..."'
            rows={5}
            className="w-full p-4 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red resize-none"
          />
        </div>

        {/* Review Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Reviewer Name */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2">
              Reviewer Name
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="John D."
              className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red"
            />
          </div>

          {/* Star Rating */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2">
              Star Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setStarRating(starRating === rating ? undefined : rating)}
                  className={`p-2 rounded transition-all ${
                    starRating && starRating >= rating
                      ? 'text-yellow-500'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star size={24} fill={starRating && starRating >= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as ReviewPlatform)}
              className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red"
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Response Options */}
        <div className="bg-gray-50 p-4 rounded border-2 border-gray-200">
          <h3 className="font-heading text-sm uppercase mb-3">Response Options</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tone */}
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Tone (optional)</label>
              <select
                value={selectedTone || ''}
                onChange={(e) => setSelectedTone(e.target.value as ResponseTone || undefined)}
                className="w-full p-2 border-2 border-gray-300 rounded focus:ring-2 focus:ring-retro-red"
              >
                <option value="">Auto-detect</option>
                {TONE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} - {t.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOffer}
                  onChange={(e) => setIncludeOffer(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-retro-red focus:ring-retro-red"
                />
                <span className="text-sm">Include make-it-right offer (for negative reviews)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInviteBack}
                  onChange={(e) => setIncludeInviteBack(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-retro-red focus:ring-retro-red"
                />
                <span className="text-sm">Include invitation to return</span>
              </label>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !reviewText.trim()}
          className="w-full btn-retro-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <Sparkles size={20} />
          )}
          Generate Reply
        </button>
      </div>

      {/* Generated Reply Section */}
      {generatedReply && (
        <div className="space-y-6">
          {/* Analysis Card */}
          <div className="card-retro">
            <h3 className="font-heading text-lg uppercase mb-4 flex items-center gap-2">
              <AlertCircle size={18} />
              Review Analysis
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Sentiment */}
              <div className={`p-3 rounded-lg ${SENTIMENT_ICONS[generatedReply.analysis.sentiment].bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  {SENTIMENT_ICONS[generatedReply.analysis.sentiment].icon}
                  <span className={`font-heading text-sm uppercase ${SENTIMENT_ICONS[generatedReply.analysis.sentiment].color}`}>
                    Sentiment
                  </span>
                </div>
                <p className="font-bold capitalize">{generatedReply.analysis.sentiment}</p>
              </div>

              {/* Tone */}
              <div className="p-3 rounded-lg bg-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={18} className="text-blue-600" />
                  <span className="font-heading text-sm uppercase text-blue-600">Tone</span>
                </div>
                <p className="font-bold capitalize">{generatedReply.analysis.suggestedTone}</p>
              </div>

              {/* Urgency */}
              <div className={`p-3 rounded-lg ${
                generatedReply.analysis.urgency === 'high' ? 'bg-red-100' :
                generatedReply.analysis.urgency === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={18} className={
                    generatedReply.analysis.urgency === 'high' ? 'text-red-600' :
                    generatedReply.analysis.urgency === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  } />
                  <span className={`font-heading text-sm uppercase ${
                    generatedReply.analysis.urgency === 'high' ? 'text-red-600' :
                    generatedReply.analysis.urgency === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>Urgency</span>
                </div>
                <p className="font-bold capitalize">{generatedReply.analysis.urgency}</p>
              </div>

              {/* Key Points Count */}
              <div className="p-3 rounded-lg bg-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={18} className="text-purple-600" />
                  <span className="font-heading text-sm uppercase text-purple-600">Points</span>
                </div>
                <p className="font-bold">
                  {generatedReply.analysis.keyPoints?.length || 0} identified
                </p>
              </div>
            </div>

            {/* Key Points */}
            {(generatedReply.analysis.complaintsIdentified?.length > 0 ||
              generatedReply.analysis.praisesIdentified?.length > 0) && (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {generatedReply.analysis.complaintsIdentified?.length > 0 && (
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <p className="font-heading text-xs uppercase text-red-600 mb-1">Concerns Identified</p>
                    <ul className="text-sm space-y-1">
                      {generatedReply.analysis.complaintsIdentified.map((c, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-red-500">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {generatedReply.analysis.praisesIdentified?.length > 0 && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-heading text-xs uppercase text-green-600 mb-1">Praises Identified</p>
                    <ul className="text-sm space-y-1">
                      {generatedReply.analysis.praisesIdentified.map((p, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-green-500">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Generated Response */}
          <div className="card-retro">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg uppercase">Your Response</h3>
              <button
                onClick={() => handleCopy(generatedReply.response)}
                className="btn-retro-secondary flex items-center gap-2 text-sm"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="p-4 bg-white border-4 border-black rounded shadow-retro">
              <p className="text-gray-900 whitespace-pre-wrap">{generatedReply.response}</p>
            </div>

            {/* Tone Regeneration */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Regenerate with different tone:</p>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => regenerateMutation.mutate(tone.id)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm border-2 border-gray-300 rounded hover:border-retro-red hover:bg-retro-red/5 transition-all disabled:opacity-50"
                  >
                    {tone.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alternatives */}
          {generatedReply.alternatives && generatedReply.alternatives.length > 0 && (
            <div className="card-retro">
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-heading text-lg uppercase">Alternative Responses</h3>
                {showAlternatives ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {showAlternatives && (
                <div className="mt-4 space-y-3">
                  {generatedReply.alternatives.map((alt, index) => (
                    <div key={index} className="p-3 bg-gray-50 border-2 border-gray-200 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-heading uppercase text-gray-500">
                          Alternative {index + 1}
                        </span>
                        <button
                          onClick={() => handleCopy(alt)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-sm text-gray-700">{alt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          {generatedReply.tips && generatedReply.tips.length > 0 && (
            <div className="card-retro">
              <button
                onClick={() => setShowTips(!showTips)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-heading text-lg uppercase flex items-center gap-2">
                  <Lightbulb size={18} className="text-yellow-500" />
                  Pro Tips
                </h3>
                {showTips ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {showTips && (
                <ul className="mt-4 space-y-2">
                  {generatedReply.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-yellow-500 font-bold">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Start Over */}
          <button
            onClick={handleReset}
            className="w-full btn-retro-outline flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Reply to Another Review
          </button>
        </div>
      )}
    </div>
  );
}
