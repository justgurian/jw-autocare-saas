import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Flame, ThumbsUp, Meh, SkipForward } from 'lucide-react';
import { batchFlyerApi, promoFlyerApi } from '../../../services/api';
import { usePollJob } from '../../../hooks/usePollJob';

type FeedbackType = 'fire' | 'solid' | 'meh';

interface SamplerFlyer {
  id: string;
  imageUrl: string;
  familyId: string | null;
  familyName: string | null;
  themeName: string;
}

interface StyleSamplerStepProps {
  businessName: string;
  firstService: string;
  onComplete: () => void;
}

export default function StyleSamplerStep({ businessName, firstService, onComplete }: StyleSamplerStepProps) {
  const [flyers, setFlyers] = useState<SamplerFlyer[]>([]);
  const [feedback, setFeedback] = useState<Record<string, FeedbackType>>({});
  const [revealedCount, setRevealedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const hasStarted = useRef(false);

  const { job, startPolling } = usePollJob({
    intervalMs: 4000,
    maxPollTimeMs: 300000,
    getJob: batchFlyerApi.getJob,
    onComplete: async (completedJob) => {
      try {
        const res = await batchFlyerApi.getJobFlyers(completedJob.id);
        const flyerData: SamplerFlyer[] = (res.data?.flyers || []).map((f: any) => ({
          id: f.id,
          imageUrl: f.imageUrl,
          familyId: f.familyId,
          familyName: f.familyName,
          themeName: f.themeName,
        }));
        setFlyers(flyerData);
        setIsGenerating(false);
        setIsDone(true);
        // Staggered reveal
        flyerData.forEach((_, i) => {
          setTimeout(() => setRevealedCount((prev) => prev + 1), i * 300);
        });
      } catch {
        toast.error('Failed to load style samples');
        setIsGenerating(false);
      }
    },
    onFailed: () => {
      toast.error('Style generation failed');
      setIsGenerating(false);
    },
    onTimeout: () => {
      toast.error('Generation timed out');
      setIsGenerating(false);
    },
  });

  // Auto-start generation
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const content = firstService || businessName || 'Auto Repair';

    const startGeneration = async () => {
      setIsGenerating(true);
      try {
        const payload: any = {
          mode: 'month',
          count: 10,
          themeStrategy: 'family-sampler',
          language: 'en',
          contentType: 'custom',
          customContent: [{
            message: `Professional marketing for ${businessName || 'our auto shop'}`,
            subject: content,
          }],
        };

        const res = await batchFlyerApi.generate(payload);
        const jobId = res.data?.jobId;
        if (jobId) {
          startPolling(jobId);
        } else {
          throw new Error('No job ID');
        }
      } catch {
        toast.error('Failed to start style preview');
        setIsGenerating(false);
      }
    };

    startGeneration();
  }, [businessName, firstService, startPolling]);

  const handleFeedback = async (flyerId: string, type: FeedbackType) => {
    setFeedback((prev) => ({ ...prev, [flyerId]: type }));
    try {
      await promoFlyerApi.submitFeedback(flyerId, type);
    } catch {
      // Feedback is optional
    }
  };

  const progress = job?.progress || 0;
  const completedCount = Math.floor((progress / 100) * 10);
  const feedbackCount = Object.keys(feedback).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading text-xl mb-2">Preview Your Shop in Every Style</h2>
        <p className="text-gray-600 text-sm">
          We're generating 10 flyers — one in each style family — using your shop info.
          Rate them to personalize your experience!
        </p>
      </div>

      {/* Generating state */}
      {isGenerating && (
        <div className="space-y-4">
          <div className="card-retro p-6 text-center">
            <Loader2 size={36} className="animate-spin text-retro-red mx-auto mb-3" />
            <p className="font-heading text-lg">{completedCount} of 10 styles ready</p>
            <div className="w-full bg-gray-200 h-2 mt-3 rounded-full overflow-hidden">
              <div
                className="bg-retro-red h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
          </div>

          {/* Placeholder grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] border-2 border-gray-200 overflow-hidden">
                {i < completedCount ? (
                  <div className="w-full h-full bg-retro-mint/30 flex items-center justify-center">
                    <span className="font-heading text-retro-teal text-xs">Ready!</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse">
                    <span className="text-gray-400 text-xs">{i + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Skip button during generation */}
          <div className="text-center">
            <button
              onClick={onComplete}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto"
            >
              <SkipForward size={14} />
              Skip — I'll explore styles later
            </button>
          </div>
        </div>
      )}

      {/* Results state */}
      {isDone && flyers.length > 0 && (
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-500">
            {feedbackCount > 0 ? `${feedbackCount} of ${flyers.length} rated` : 'Tap an icon to rate each style'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {flyers.map((flyer, i) => (
              <div
                key={flyer.id}
                className={`border-2 border-black overflow-hidden transition-all duration-500 ${
                  i < revealedCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={flyer.imageUrl}
                    alt={flyer.familyName || flyer.themeName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 bg-white">
                  <p className="font-heading text-[10px] uppercase text-retro-navy truncate mb-1">
                    {flyer.familyName || flyer.themeName}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleFeedback(flyer.id, 'fire')}
                      className={`flex-1 py-1 rounded text-xs transition-all ${
                        feedback[flyer.id] === 'fire'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 hover:bg-orange-100'
                      }`}
                      title="Love it!"
                    >
                      <Flame size={12} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => handleFeedback(flyer.id, 'solid')}
                      className={`flex-1 py-1 rounded text-xs transition-all ${
                        feedback[flyer.id] === 'solid'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-blue-100'
                      }`}
                      title="Solid"
                    >
                      <ThumbsUp size={12} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => handleFeedback(flyer.id, 'meh')}
                      className={`flex-1 py-1 rounded text-xs transition-all ${
                        feedback[flyer.id] === 'meh'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      title="Not for me"
                    >
                      <Meh size={12} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed / empty state */}
      {!isGenerating && !isDone && (
        <div className="text-center py-8">
          <p className="text-gray-500">Style preview didn't load.</p>
          <button
            onClick={onComplete}
            className="text-retro-red text-sm mt-2 hover:underline"
          >
            Continue to dashboard
          </button>
        </div>
      )}
    </div>
  );
}
