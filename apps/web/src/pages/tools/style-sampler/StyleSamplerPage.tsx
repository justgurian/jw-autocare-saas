import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Palette, Flame, ThumbsUp, Meh, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { promoFlyerApi, batchFlyerApi } from '../../../services/api';
import RetroLoadingStage from '../../../components/garage/RetroLoadingStage';

type FeedbackType = 'fire' | 'solid' | 'meh';

interface Family {
  id: string;
  name: string;
  description: string;
  emoji: string;
  themeIds: string[];
}

interface GeneratedFlyer {
  id: string;
  imageUrl: string;
  caption: string;
  familyId: string;
  familyName: string;
  themeId: string;
}

type Phase = 'loading-families' | 'loading-first' | 'rating' | 'summary';

// Shuffle array (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LOADING_MESSAGES: Record<number, string[]> = {
  0: ['Warming up the engine...', 'Turning the ignition...'],
  1: ['Your AI designer is sketching...', 'Mixing the paint...'],
  2: ['Adding the finishing touches...', 'Almost there...'],
  3: ['Polishing the chrome...', 'Ready to roll!'],
};

export default function StyleSamplerPage() {
  const navigate = useNavigate();

  // Family queue & current position
  const [familyQueue, setFamilyQueue] = useState<Family[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generated flyers keyed by family ID
  const [flyerMap, setFlyerMap] = useState<Map<string, GeneratedFlyer>>(new Map());

  // Animation state
  const [swipeDirection, setSwipeDirection] = useState<'right' | 'left' | 'up' | null>(null);
  const [isEntering, setIsEntering] = useState(false);

  // Ratings
  const [ratings, setRatings] = useState<Record<string, FeedbackType>>({});

  // Phase
  const [phase, setPhase] = useState<Phase>('loading-families');

  // Track ongoing generation to prevent duplicates
  const generatingRef = useRef<Set<string>>(new Set());

  // Business context
  const [businessName, setBusinessName] = useState('');
  const [firstService, setFirstService] = useState('');

  // Fetch families with themeIds
  const { data: familiesData } = useQuery({
    queryKey: ['style-families'],
    queryFn: () => promoFlyerApi.getFamilies().then(r => r.data),
  });

  // Fetch suggestions for business context
  const { data: suggestions } = useQuery({
    queryKey: ['batch-suggestions'],
    queryFn: () => batchFlyerApi.getSuggestions().then(r => r.data),
  });

  // Extract business context from suggestions
  useEffect(() => {
    if (!suggestions) return;
    const services = suggestions.allServices || suggestions.services || [];
    if (services.length > 0) {
      const svc = services[0];
      setFirstService(typeof svc === 'string' ? svc : svc.name || 'Auto Repair');
    }
    if (suggestions.businessName) {
      setBusinessName(suggestions.businessName);
    }
  }, [suggestions]);

  // Initialize family queue once families load
  useEffect(() => {
    if (!familiesData?.families || familyQueue.length > 0) return;
    const families: Family[] = familiesData.families
      .filter((f: any) => f.themeIds && f.themeIds.length > 0)
      .map((f: any) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        emoji: f.emoji || '',
        themeIds: f.themeIds,
      }));

    if (families.length === 0) {
      toast.error('No style families available');
      return;
    }

    const shuffled = shuffle(families);
    setFamilyQueue(shuffled);
    setPhase('loading-first');
  }, [familiesData, familyQueue.length]);

  // Generate a flyer for a specific family
  const generateForFamily = useCallback(async (family: Family) => {
    // Prevent duplicate generation
    if (generatingRef.current.has(family.id)) return;
    generatingRef.current.add(family.id);

    const themeId = family.themeIds[Math.floor(Math.random() * family.themeIds.length)];
    const subject = firstService || 'Auto Repair';
    const sampleHeadlines = [
      `${subject} Special!`,
      `Save on ${subject}`,
      `Expert ${subject}`,
      `${subject} — Book Today!`,
      `Quality ${subject}`,
      `${subject} Done Right`,
      `Time for ${subject}!`,
      `${subject} You Can Trust`,
    ];
    const message = sampleHeadlines[Math.floor(Math.random() * sampleHeadlines.length)];

    try {
      const res = await promoFlyerApi.generate({
        message,
        subject,
        themeId,
      });

      const flyer: GeneratedFlyer = {
        id: res.data.id || res.data.contentId || `gen-${Date.now()}`,
        imageUrl: res.data.imageUrl,
        caption: res.data.caption || '',
        familyId: family.id,
        familyName: family.name,
        themeId,
      };

      setFlyerMap(prev => {
        const next = new Map(prev);
        next.set(family.id, flyer);
        return next;
      });

      return flyer;
    } catch (err) {
      console.error(`Failed to generate for ${family.name}:`, err);
      // Create error placeholder so we can skip it
      setFlyerMap(prev => {
        const next = new Map(prev);
        next.set(family.id, {
          id: `error-${family.id}`,
          imageUrl: '',
          caption: '',
          familyId: family.id,
          familyName: family.name,
          themeId,
        });
        return next;
      });
      return null;
    } finally {
      generatingRef.current.delete(family.id);
    }
  }, [businessName, firstService]);

  // Start pipeline: generate first 2 families
  useEffect(() => {
    if (phase !== 'loading-first' || familyQueue.length === 0) return;
    // Wait for business context to be ready (or timeout after 2s)
    const timer = setTimeout(() => {
      generateForFamily(familyQueue[0]);
      if (familyQueue.length > 1) {
        generateForFamily(familyQueue[1]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [phase, familyQueue, generateForFamily]);

  // Transition from loading-first to rating when first flyer is ready
  useEffect(() => {
    if (phase !== 'loading-first') return;
    if (familyQueue.length === 0) return;

    const firstFamily = familyQueue[0];
    const flyer = flyerMap.get(firstFamily.id);
    if (flyer && flyer.imageUrl) {
      setIsEntering(true);
      setPhase('rating');
      setTimeout(() => setIsEntering(false), 300);
    }
  }, [phase, familyQueue, flyerMap]);

  // Handle rating
  const handleRate = useCallback((type: FeedbackType) => {
    const family = familyQueue[currentIndex];
    if (!family) return;

    const flyer = flyerMap.get(family.id);
    if (!flyer) return;

    // Save rating
    setRatings(prev => ({ ...prev, [family.id]: type }));

    // Submit feedback to API (fire-and-forget)
    if (flyer.id && !flyer.id.startsWith('error-')) {
      promoFlyerApi.submitFeedback(flyer.id, type).catch(() => {});
    }

    // Determine swipe direction
    const direction = type === 'fire' ? 'right' : type === 'meh' ? 'up' : 'left';
    setSwipeDirection(direction);

    // After animation: advance
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      setSwipeDirection(null);

      if (nextIndex >= familyQueue.length) {
        // All families rated
        setPhase('summary');
        return;
      }

      setCurrentIndex(nextIndex);
      setIsEntering(true);
      setTimeout(() => setIsEntering(false), 300);

      // Pre-generate 2 ahead
      const pipelineIndex = nextIndex + 1;
      if (pipelineIndex < familyQueue.length) {
        const nextFamily = familyQueue[pipelineIndex];
        if (!flyerMap.has(nextFamily.id) && !generatingRef.current.has(nextFamily.id)) {
          generateForFamily(nextFamily);
        }
      }
    }, 400);
  }, [currentIndex, familyQueue, flyerMap, generateForFamily]);

  // Skip errored flyers automatically
  useEffect(() => {
    if (phase !== 'rating') return;
    const family = familyQueue[currentIndex];
    if (!family) return;
    const flyer = flyerMap.get(family.id);
    if (flyer && !flyer.imageUrl) {
      // This family errored — auto-skip
      const nextIndex = currentIndex + 1;
      if (nextIndex >= familyQueue.length) {
        setPhase('summary');
      } else {
        setCurrentIndex(nextIndex);
      }
    }
  }, [phase, currentIndex, familyQueue, flyerMap]);

  // Summary stats
  const fireCount = Object.values(ratings).filter(r => r === 'fire').length;
  const solidCount = Object.values(ratings).filter(r => r === 'solid').length;
  const mehCount = Object.values(ratings).filter(r => r === 'meh').length;

  // Restart with fresh random themes
  const handleRestart = () => {
    const reshuffled = shuffle(familyQueue);
    setFamilyQueue(reshuffled);
    setCurrentIndex(0);
    setFlyerMap(new Map());
    setRatings({});
    setSwipeDirection(null);
    generatingRef.current.clear();
    setPhase('loading-first');
  };

  // Current state
  const currentFamily = familyQueue[currentIndex];
  const currentFlyer = currentFamily ? flyerMap.get(currentFamily.id) : undefined;
  const isFlyerReady = currentFlyer && currentFlyer.imageUrl;

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <Palette size={28} className="text-retro-red" />
          <h1 className="font-display text-3xl text-retro-navy dark:text-gray-100">Style Sampler</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Rate each style to personalize your future flyers
        </p>
      </div>

      {/* LOADING FAMILIES */}
      {phase === 'loading-families' && (
        <div className="card-retro p-8 text-center">
          <Loader2 size={32} className="animate-spin text-retro-red mx-auto mb-3" />
          <p className="font-heading text-sm uppercase text-gray-500">Loading styles...</p>
        </div>
      )}

      {/* LOADING FIRST FLYER */}
      {phase === 'loading-first' && (
        <div className="card-retro p-8">
          <RetroLoadingStage
            isLoading
            estimatedDuration={25000}
            size="md"
            showExhaust
            phaseMessages={LOADING_MESSAGES}
          />
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 font-heading uppercase">
            Generating your first sample...
          </p>
        </div>
      )}

      {/* RATING PHASE */}
      {phase === 'rating' && currentFamily && (
        <>
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-retro-red to-retro-mustard transition-all duration-500"
                style={{ width: `${((currentIndex) / familyQueue.length) * 100}%` }}
              />
            </div>
            <span className="font-heading text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {currentIndex + 1} of {familyQueue.length}
            </span>
          </div>

          {/* Family badge */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-retro-navy/10 dark:bg-gray-700 border border-retro-navy/20 dark:border-gray-600">
              <span className="text-lg">{currentFamily.emoji}</span>
              <span className="font-heading text-sm uppercase text-retro-navy dark:text-gray-200">
                {currentFamily.name}
              </span>
            </span>
          </div>

          {/* Card area */}
          <div className="relative overflow-hidden" style={{ minHeight: '420px' }}>
            {isFlyerReady ? (
              <div
                className={`
                  ${swipeDirection === 'right' ? 'animate-swipe-right' : ''}
                  ${swipeDirection === 'left' ? 'animate-swipe-left' : ''}
                  ${swipeDirection === 'up' ? 'animate-swipe-up' : ''}
                  ${isEntering ? 'animate-card-enter' : ''}
                `}
              >
                <div className="aspect-[4/5] overflow-hidden border-2 border-black dark:border-gray-600 shadow-retro">
                  <img
                    src={currentFlyer!.imageUrl}
                    alt={`${currentFamily.name} style flyer`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              /* Waiting for flyer to generate */
              <div className="aspect-[4/5] border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center">
                <RetroLoadingStage
                  isLoading
                  estimatedDuration={25000}
                  size="sm"
                  showExhaust={false}
                  phaseMessages={LOADING_MESSAGES}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-heading uppercase">
                  Generating {currentFamily.name}...
                </p>
              </div>
            )}
          </div>

          {/* Rating buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleRate('meh')}
              disabled={!isFlyerReady || !!swipeDirection}
              className="flex-1 max-w-[120px] flex flex-col items-center gap-1.5 py-4 px-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Meh size={28} className="text-gray-400" />
              <span className="font-heading text-xs uppercase text-gray-500">Meh</span>
            </button>

            <button
              onClick={() => handleRate('solid')}
              disabled={!isFlyerReady || !!swipeDirection}
              className="flex-1 max-w-[120px] flex flex-col items-center gap-1.5 py-4 px-3 border-2 border-retro-teal dark:border-retro-teal bg-white dark:bg-gray-800 hover:bg-retro-teal/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <ThumbsUp size={28} className="text-retro-teal" />
              <span className="font-heading text-xs uppercase text-retro-teal">Solid</span>
            </button>

            <button
              onClick={() => handleRate('fire')}
              disabled={!isFlyerReady || !!swipeDirection}
              className="flex-1 max-w-[120px] flex flex-col items-center gap-1.5 py-4 px-3 border-2 border-retro-red dark:border-retro-red bg-white dark:bg-gray-800 hover:bg-retro-red/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Flame size={28} className="text-retro-red" />
              <span className="font-heading text-xs uppercase text-retro-red">Fire</span>
            </button>
          </div>

          {/* Hint text */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            {currentFamily.description}
          </p>
        </>
      )}

      {/* SUMMARY PHASE */}
      {phase === 'summary' && (
        <div className="card-retro p-8 text-center space-y-6">
          <div>
            <h2 className="font-display text-3xl text-retro-navy dark:text-gray-100 mb-2">
              STYLE TASTE COMPLETE
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your future flyers will match your taste!
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6">
            {fireCount > 0 && (
              <div className="text-center">
                <div className="text-3xl font-display text-retro-red">{fireCount}</div>
                <div className="flex items-center gap-1 text-xs font-heading uppercase text-retro-red">
                  <Flame size={14} /> Loved
                </div>
              </div>
            )}
            {solidCount > 0 && (
              <div className="text-center">
                <div className="text-3xl font-display text-retro-teal">{solidCount}</div>
                <div className="flex items-center gap-1 text-xs font-heading uppercase text-retro-teal">
                  <ThumbsUp size={14} /> Liked
                </div>
              </div>
            )}
            {mehCount > 0 && (
              <div className="text-center">
                <div className="text-3xl font-display text-gray-400">{mehCount}</div>
                <div className="flex items-center gap-1 text-xs font-heading uppercase text-gray-400">
                  <Meh size={14} /> Passed
                </div>
              </div>
            )}
          </div>

          {/* Fire-rated families */}
          {fireCount > 0 && (
            <div className="space-y-2">
              <p className="font-heading text-sm uppercase text-gray-500 dark:text-gray-400">
                Your top styles
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {familyQueue
                  .filter(f => ratings[f.id] === 'fire')
                  .map(f => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-retro-red/10 border border-retro-red/30 text-retro-red text-sm font-heading uppercase"
                    >
                      <span>{f.emoji}</span> {f.name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Thumbnail grid of all rated flyers */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {familyQueue.map(family => {
              const flyer = flyerMap.get(family.id);
              const rating = ratings[family.id];
              if (!flyer || !flyer.imageUrl) return null;
              return (
                <div
                  key={family.id}
                  className={`relative aspect-[4/5] overflow-hidden border-2 ${
                    rating === 'fire'
                      ? 'border-retro-red'
                      : rating === 'solid'
                      ? 'border-retro-teal'
                      : 'border-gray-300 opacity-60'
                  }`}
                >
                  <img
                    src={flyer.imageUrl}
                    alt={family.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5 font-heading uppercase">
                    {family.emoji} {rating === 'fire' ? '🔥' : rating === 'solid' ? '👍' : '😐'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => navigate('/tools/promo-flyer')}
              className="btn-retro btn-retro-primary w-full py-3 text-lg flex items-center justify-center gap-2"
            >
              Start Making Flyers <ArrowRight size={20} />
            </button>
            <button
              onClick={handleRestart}
              className="btn-retro-outline w-full py-2.5 text-sm"
            >
              Try 10 More Styles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
