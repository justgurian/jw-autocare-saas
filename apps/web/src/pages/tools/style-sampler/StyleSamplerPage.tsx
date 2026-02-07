import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Palette, Loader2, ThumbsUp, Flame, Meh, ArrowRight } from 'lucide-react';
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
}

export default function StyleSamplerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'generating' | 'results'>('form');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [flyers, setFlyers] = useState<SamplerFlyer[]>([]);
  const [feedback, setFeedback] = useState<Record<string, FeedbackType>>({});
  const [revealedCount, setRevealedCount] = useState(0);

  // Fetch services for the form
  const { data: suggestions } = useQuery({
    queryKey: ['batch-suggestions'],
    queryFn: () => batchFlyerApi.getSuggestions().then(r => r.data),
  });

  const services = suggestions?.allServices || [];

  // Poll for job completion
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
          caption: f.caption,
          familyId: f.familyId,
          familyName: f.familyName,
          themeName: f.themeName,
        }));
        setFlyers(flyerData);
        setStep('results');
        // Animate card reveals
        flyerData.forEach((_, i) => {
          setTimeout(() => setRevealedCount(prev => prev + 1), i * 300);
        });
      } catch {
        toast.error('Failed to load results');
      }
    },
    onFailed: () => toast.error('Generation failed. Please try again.'),
    onTimeout: () => toast.error('Generation timed out. Please try again.'),
  });

  const handleGenerate = async () => {
    if (!selectedServiceId && !customMessage) {
      toast.error('Pick a service or enter a custom message');
      return;
    }

    setStep('generating');
    setRevealedCount(0);
    setFlyers([]);
    setFeedback({});

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
        startPolling(jobId);
      } else {
        throw new Error('No job ID returned');
      }
    } catch {
      toast.error('Failed to start generation');
      setStep('form');
    }
  };

  const handleFeedback = async (flyerId: string, type: FeedbackType) => {
    setFeedback(prev => ({ ...prev, [flyerId]: type }));
    try {
      await promoFlyerApi.submitFeedback(flyerId, type);
    } catch {
      // Silently fail — feedback is optional
    }
  };

  const progress = job?.progress || 0;
  const completedCount = Math.floor((progress / 100) * 10);

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
        <div className="text-center space-y-6">
          <div className="card-retro p-8 max-w-md mx-auto">
            <Loader2 size={48} className="animate-spin text-retro-red mx-auto mb-4" />
            <h2 className="font-heading text-xl mb-2">Generating your samples...</h2>
            <p className="text-gray-600 mb-4">{completedCount} of 10 styles complete</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-retro-red h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
          </div>

          {/* Preview grid showing placeholders + completed */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-lg overflow-hidden border-2 border-gray-200">
                {i < completedCount ? (
                  <div className="w-full h-full bg-retro-mint/30 flex items-center justify-center">
                    <span className="font-heading text-retro-teal text-sm">Ready!</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse">
                    <span className="text-gray-400 text-xs">{i + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS STATE */}
      {step === 'results' && (
        <div className="space-y-6">
          <p className="text-center text-gray-600">
            Rate each style to personalize your future flyers. Your favorites will appear more often!
          </p>

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
          <div className="flex justify-center gap-4 pt-4">
            <button onClick={() => setStep('form')} className="btn-retro btn-retro-outline px-6 py-3">
              Try Different Content
            </button>
            <button
              onClick={() => navigate('/tools/promo-flyer')}
              className="btn-retro btn-retro-primary px-6 py-3"
            >
              Start Making Flyers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
