import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Palette, ThumbsUp, Flame, Meh, ArrowRight, Wrench, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { batchFlyerApi, promoFlyerApi } from '../../../services/api';
import { usePollJob } from '../../../hooks/usePollJob';

type FeedbackType = 'fire' | 'solid' | 'meh';

interface SamplerFlyer {
  id: string;
  imageUrl: string;
  caption: string;
  familyId: string | null;
  familyName: string | null;
  themeName: string;
  round?: number;
}

const FUN_FACTS = [
  "Each style is inspired by a different decade of design",
  "Your shop info is woven into every flyer automatically",
  "The AI creates a unique composition for each style family",
  "Rate your favorites — future flyers will match your taste",
  "Over 48 retro themes across 10 style families",
  "Pro tip: Styles you rate highest appear more often",
  "Every image is unique — no templates, no stock photos",
  "Your competitors are still using Canva templates...",
];

export default function StyleSamplerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'generating' | 'results'>('form');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [flyers, setFlyers] = useState<SamplerFlyer[]>([]);
  const [partialFlyers, setPartialFlyers] = useState<SamplerFlyer[]>([]);
  const [feedback, setFeedback] = useState<Record<string, FeedbackType>>({});
  const [revealedCount, setRevealedCount] = useState(0);
  const [funFactIndex, setFunFactIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [allRoundFlyers, setAllRoundFlyers] = useState<SamplerFlyer[]>([]);
  const jobIdRef = useRef<string | null>(null);
  const partialPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch services for the form
  const { data: suggestions } = useQuery({
    queryKey: ['batch-suggestions'],
    queryFn: () => batchFlyerApi.getSuggestions().then(r => r.data),
  });

  const services = suggestions?.allServices || [];

  // Rotate fun facts every 4 seconds during generation
  useEffect(() => {
    if (step !== 'generating') return;
    const timer = setInterval(() => {
      setFunFactIndex(prev => (prev + 1) % FUN_FACTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [step]);

  // Poll for partial flyers during generation
  useEffect(() => {
    if (step !== 'generating' || !jobIdRef.current) return;

    const pollPartialFlyers = async () => {
      try {
        const res = await batchFlyerApi.getJobFlyers(jobIdRef.current!);
        const flyerData: SamplerFlyer[] = (res.data?.flyers || []).map((f: any) => ({
          id: f.id,
          imageUrl: f.imageUrl,
          caption: f.caption,
          familyId: f.familyId,
          familyName: f.familyName,
          themeName: f.themeName,
        }));
        if (flyerData.length > 0) {
          setPartialFlyers(flyerData);
        }
      } catch {
        // Silently continue — partial fetch is best-effort
      }
    };

    // First poll after 8 seconds (first flyer takes ~8s), then every 4s
    const initialTimer = setTimeout(() => {
      pollPartialFlyers();
      partialPollRef.current = setInterval(pollPartialFlyers, 4000);
    }, 8000);

    return () => {
      clearTimeout(initialTimer);
      if (partialPollRef.current) clearInterval(partialPollRef.current);
    };
  }, [step]);

  // Poll for job completion
  const { job, startPolling } = usePollJob({
    intervalMs: 4000,
    maxPollTimeMs: 300000,
    getJob: batchFlyerApi.getJob,
    onComplete: async (completedJob) => {
      if (partialPollRef.current) clearInterval(partialPollRef.current);
      try {
        const res = await batchFlyerApi.getJobFlyers(completedJob.id);
        const flyerData: SamplerFlyer[] = (res.data?.flyers || []).map((f: any) => ({
          id: f.id,
          imageUrl: f.imageUrl,
          caption: f.caption,
          familyId: f.familyId,
          familyName: f.familyName,
          themeName: f.themeName,
          round,
        }));
        setFlyers(flyerData);
        setAllRoundFlyers(prev => [...prev, ...flyerData]);
        setPartialFlyers([]);
        setStep('results');
        // Staggered reveal for any not yet shown
        const alreadyShown = partialFlyers.length;
        flyerData.forEach((_, i) => {
          if (i < alreadyShown) {
            setRevealedCount(prev => Math.max(prev, i + 1));
          } else {
            setTimeout(() => setRevealedCount(prev => prev + 1), (i - alreadyShown) * 300);
          }
        });
      } catch {
        toast.error('Failed to load results');
      }
    },
    onFailed: () => toast.error('Generation failed. Please try again.'),
    onTimeout: () => toast.error('Generation timed out. Please try again.'),
  });

  const startGeneration = useCallback(async (isMore = false) => {
    if (!isMore && !selectedServiceId && !customMessage) {
      toast.error('Pick a service or enter a custom message');
      return;
    }

    if (isMore) {
      setRound(prev => prev + 1);
    } else {
      setRound(1);
      setAllRoundFlyers([]);
      setFeedback({});
    }

    setStep('generating');
    setRevealedCount(0);
    setFlyers([]);
    setPartialFlyers([]);
    setFunFactIndex(0);

    try {
      const payload: any = {
        mode: 'month' as const,
        count: 10,
        themeStrategy: 'family-sampler' as const,
        language: 'en' as const,
      };

      if (selectedServiceId) {
        payload.contentType = 'services';
        payload.serviceIds = [selectedServiceId];
      } else {
        payload.contentType = 'custom';
        payload.customContent = [{
          message: customMessage,
          subject: customMessage,
        }];
      }

      const res = await batchFlyerApi.generate(payload);
      const jobId = res.data?.jobId;
      if (jobId) {
        jobIdRef.current = jobId;
        startPolling(jobId);
      } else {
        throw new Error('No job ID returned');
      }
    } catch {
      toast.error('Failed to start generation');
      setStep(isMore ? 'results' : 'form');
    }
  }, [selectedServiceId, customMessage, startPolling]);

  const handleGenerate = () => startGeneration(false);
  const handleGenerateMore = () => startGeneration(true);

  const handleFeedback = async (flyerId: string, type: FeedbackType) => {
    setFeedback(prev => ({ ...prev, [flyerId]: type }));
    try {
      await promoFlyerApi.submitFeedback(flyerId, type);
    } catch {
      // Silently fail — feedback is optional
    }
  };

  const progress = job?.progress || 0;

  // Feedback summary
  const feedbackCount = Object.keys(feedback).length;
  const fireCount = Object.values(feedback).filter(f => f === 'fire').length;
  const solidCount = Object.values(feedback).filter(f => f === 'solid').length;
  const mehCount = Object.values(feedback).filter(f => f === 'meh').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <Palette size={32} className="text-retro-red" />
          <h1 className="font-display text-3xl md:text-4xl text-retro-navy">Style Sampler</h1>
        </div>
        <p className="text-gray-600 text-lg">
          See your shop in 10 different styles. Same content, 10 unique looks.
        </p>
      </div>

      {/* FORM STATE */}
      {step === 'form' && (
        <div className="card-retro max-w-xl mx-auto p-8">
          <h2 className="font-heading text-xl mb-6 text-center">What should the flyer promote?</h2>

          {/* Service picker */}
          {services.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pick a service</label>
              <div className="grid grid-cols-2 gap-2">
                {services.slice(0, 8).map((svc: any) => (
                  <button
                    key={svc.id}
                    onClick={() => { setSelectedServiceId(svc.id); setCustomMessage(''); }}
                    className={`p-3 text-left text-sm border-2 rounded-lg transition-all ${
                      selectedServiceId === svc.id
                        ? 'border-retro-red bg-retro-red/10 text-retro-red font-medium'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {svc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Custom text */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom message</label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => { setCustomMessage(e.target.value); setSelectedServiceId(''); }}
              placeholder="e.g. Spring Special: 20% Off Oil Changes"
              className="input-retro w-full"
              maxLength={200}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedServiceId && !customMessage}
            className="btn-retro btn-retro-primary w-full text-lg py-4 disabled:opacity-50"
          >
            Generate 10 Styles
          </button>
          <p className="text-center text-sm text-gray-500 mt-3">Takes about 80 seconds</p>
        </div>
      )}

      {/* GENERATING STATE */}
      {step === 'generating' && (
        <div className="space-y-6">
          {/* Loading card with fun facts */}
          <div className="card-retro p-8 max-w-lg mx-auto text-center">
            {/* Animated wrench */}
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Wrench size={40} className="text-retro-red absolute inset-0 m-auto animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h2 className="font-heading text-xl mb-2">Creating your samples...</h2>
            <p className="text-gray-600 mb-1">{partialFlyers.length} of 10 styles complete</p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-retro-red to-retro-mustard h-3 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>

            {/* Fun fact carousel */}
            <div className="bg-retro-navy/5 border border-retro-navy/10 p-3 rounded-lg min-h-[40px] flex items-center justify-center">
              <p className="text-sm text-gray-600 italic transition-opacity duration-500">
                {FUN_FACTS[funFactIndex]}
              </p>
            </div>
          </div>

          {/* Live preview grid with actual images */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => {
              const flyer = partialFlyers[i];
              return (
                <div key={i} className="aspect-[4/5] rounded-lg overflow-hidden border-2 border-gray-200">
                  {flyer ? (
                    <img
                      src={flyer.imageUrl}
                      alt={flyer.familyName || flyer.themeName}
                      className="w-full h-full object-cover animate-fade-in"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse">
                      <span className="text-gray-400 text-xs">{i + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESULTS STATE */}
      {step === 'results' && (
        <div className="space-y-6">
          <p className="text-center text-gray-600">
            Rate each style to personalize your future flyers. Your favorites will appear more often!
          </p>

          {/* Feedback summary */}
          {feedbackCount > 0 && (
            <div className="flex justify-center gap-4 text-sm">
              {fireCount > 0 && (
                <span className="flex items-center gap-1 text-orange-600">
                  <Flame size={14} /> Loved {fireCount}
                </span>
              )}
              {solidCount > 0 && (
                <span className="flex items-center gap-1 text-blue-600">
                  <ThumbsUp size={14} /> Liked {solidCount}
                </span>
              )}
              {mehCount > 0 && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Meh size={14} /> Skipped {mehCount}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {flyers.map((flyer, i) => (
              <div
                key={flyer.id}
                className={`card-retro overflow-hidden transition-all duration-500 ${
                  i < revealedCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                {/* Flyer image */}
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={flyer.imageUrl}
                    alt={flyer.familyName || flyer.themeName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Family label */}
                <div className="p-3">
                  <p className="font-heading text-xs uppercase text-retro-navy truncate">
                    {flyer.familyName || flyer.themeName}
                  </p>

                  {/* Feedback toast message */}
                  {feedback[flyer.id] === 'fire' && (
                    <p className="text-[10px] text-orange-600 mt-1">More of this style coming!</p>
                  )}
                  {feedback[flyer.id] === 'meh' && (
                    <p className="text-[10px] text-gray-500 mt-1">Noted — less of this</p>
                  )}

                  {/* Feedback buttons */}
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => handleFeedback(flyer.id, 'fire')}
                      className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                        feedback[flyer.id] === 'fire'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 hover:bg-orange-100 text-gray-600'
                      }`}
                    >
                      <Flame size={14} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => handleFeedback(flyer.id, 'solid')}
                      className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                        feedback[flyer.id] === 'solid'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-blue-100 text-gray-600'
                      }`}
                    >
                      <ThumbsUp size={14} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => handleFeedback(flyer.id, 'meh')}
                      className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                        feedback[flyer.id] === 'meh'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Meh size={14} className="mx-auto" />
                    </button>
                  </div>

                  {/* Use this style */}
                  <button
                    onClick={() => navigate(`/tools/promo-flyer${flyer.familyId ? `?family=${flyer.familyId}` : ''}`)}
                    className="w-full mt-2 text-[11px] text-retro-red font-medium flex items-center justify-center gap-1 hover:gap-2 transition-all"
                  >
                    Use this style <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="flex justify-center gap-4">
              <button onClick={handleGenerateMore} className="btn-retro btn-retro-outline px-6 py-3 flex items-center gap-2">
                <RefreshCw size={16} />
                Generate 10 More
              </button>
              <button
                onClick={() => navigate('/tools/promo-flyer')}
                className="btn-retro btn-retro-primary px-6 py-3"
              >
                Start Making Flyers
              </button>
            </div>
            {round > 1 && (
              <p className="text-sm text-gray-500">
                Round {round} — The more you rate, the better your future flyers!
              </p>
            )}
          </div>

          {/* Previous rounds (collapsed) */}
          {allRoundFlyers.length > flyers.length && (
            <details className="mt-6">
              <summary className="font-heading text-sm uppercase text-gray-500 cursor-pointer hover:text-retro-navy">
                Previous rounds ({allRoundFlyers.length - flyers.length} flyers)
              </summary>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                {allRoundFlyers
                  .filter(f => !flyers.some(cf => cf.id === f.id))
                  .map(flyer => (
                    <div key={flyer.id} className="card-retro overflow-hidden opacity-80">
                      <div className="aspect-[4/5] overflow-hidden">
                        <img src={flyer.imageUrl} alt={flyer.familyName || flyer.themeName} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2">
                        <p className="font-heading text-[10px] uppercase text-gray-500 truncate">
                          {flyer.familyName || flyer.themeName}
                          {feedback[flyer.id] === 'fire' && ' — Loved'}
                          {feedback[flyer.id] === 'meh' && ' — Skipped'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
