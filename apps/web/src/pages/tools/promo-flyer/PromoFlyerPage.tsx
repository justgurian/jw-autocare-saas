import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Rocket, Sparkles } from 'lucide-react';
import { promoFlyerApi, batchFlyerApi, downloadApi, hiringFlyerApi, memeApi } from '../../../services/api';
import ContentTypeSelector, { type ContentType } from './components/ContentTypeSelector';
import StyleSection from './components/StyleSection';
import VehicleSection, { type VehicleMode } from './components/VehicleSection';
import HiringInputs from './components/HiringInputs';
import MemeInputs from './components/MemeInputs';
import FlyerResultsCarousel from './components/FlyerResultsCarousel';
import type { GenerationSlot, GeneratedFlyer } from './components/FlyerResultCard';
import ShareModal from '../../../components/features/ShareModal';
import FlyerEditor from '../../../components/flyer-editor/FlyerEditor';
import VideoFromFlyerModal from '../../../components/features/VideoFromFlyerModal';
import FirstFlyerCelebration, { hasSeenFirstFlyerCelebration } from '../../../components/features/FirstFlyerCelebration';

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Count range: 1-10 via slider

interface Family {
  id: string;
  name: string;
  emoji: string;
  themeIds: string[];
}

export default function PromoFlyerPage() {
  // ---------- Data queries ----------
  const { data: suggestionsData } = useQuery({
    queryKey: ['batch-suggestions'],
    queryFn: () => batchFlyerApi.getSuggestions().then(r => r.data),
  });

  const { data: familiesData } = useQuery({
    queryKey: ['style-families'],
    queryFn: () => promoFlyerApi.getFamilies().then(r => r.data),
  });

  const services: any[] = suggestionsData?.allServices || [];
  const specials: any[] = suggestionsData?.allSpecials || [];
  const families: Family[] = (familiesData?.families || []).filter(
    (f: any) => f.themeIds?.length > 0
  );

  // ---------- Form state ----------
  const [contentType, setContentType] = useState<ContentType>('service');
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [specialId, setSpecialId] = useState<string | null>(null);
  const [headline, setHeadline] = useState('');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');

  // Hiring fields
  const [position, setPosition] = useState('');
  const [jobType, setJobType] = useState<'full-time' | 'part-time' | 'seasonal'>('full-time');
  const [payRange, setPayRange] = useState('');
  const [howToApply, setHowToApply] = useState<'call' | 'email' | 'visit' | 'online'>('call');

  // Meme fields
  const [memeStyleId, setMemeStyleId] = useState('');
  const [memeTopic, setMemeTopic] = useState('');

  // Style
  const [themeId, setThemeId] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [subjectType, setSubjectType] = useState('auto');
  const [randomizeTheme, setRandomizeTheme] = useState(true);

  // Vehicle
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>('random');
  const [vehicle, setVehicle] = useState({ make: '', model: '', year: '', color: '', freeText: '__random__' });
  const [mascotId, setMascotId] = useState<string | null>(null);

  // Count
  const [count, setCount] = useState(3);

  // Results
  const [slots, setSlots] = useState<GenerationSlot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modals
  const [editingSlot, setEditingSlot] = useState<GenerationSlot | null>(null);
  const [animatingSlot, setAnimatingSlot] = useState<GenerationSlot | null>(null);
  const [sharingSlot, setSharingSlot] = useState<GenerationSlot | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const firstFlyerCheckedRef = useRef(false);

  // ---------- Helpers ----------

  const updateSlot = useCallback((slotId: string, updates: Partial<GenerationSlot>) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, ...updates } : s));
  }, []);

  /** Pick N theme IDs spread across different families for variety */
  const pickThemes = useCallback((n: number): Array<{ themeId: string; themeName: string }> => {
    if (!randomizeTheme && themeId) {
      return Array.from({ length: n }, () => ({ themeId, themeName: '' }));
    }

    if (!randomizeTheme && familyId) {
      const fam = families.find(f => f.id === familyId);
      if (fam) {
        const shuffled = shuffle(fam.themeIds);
        return Array.from({ length: n }, (_, i) => ({
          themeId: shuffled[i % shuffled.length],
          themeName: fam.name,
        }));
      }
    }

    // Random: spread across different families
    if (families.length === 0) {
      return Array.from({ length: n }, () => ({ themeId: '', themeName: 'Random' }));
    }
    const shuffledFams = shuffle(families);
    return Array.from({ length: n }, (_, i) => {
      const fam = shuffledFams[i % shuffledFams.length];
      const tid = fam.themeIds[Math.floor(Math.random() * fam.themeIds.length)];
      return { themeId: tid, themeName: `${fam.emoji} ${fam.name}` };
    });
  }, [randomizeTheme, themeId, familyId, families]);

  /** Build vehicle params for the API call */
  const getVehicleParams = useCallback(() => {
    const params: Record<string, any> = {};
    if (mascotId) params.mascotId = mascotId;

    if (vehicleMode === 'none') return params;
    if (vehicleMode === 'random' || vehicleMode === 'mascot') {
      params.vehicleId = 'random';
      return params;
    }
    // specific
    const v = vehicle;
    if (v.freeText && v.freeText !== '__random__') {
      params.vehicleFreeText = v.freeText;
    } else if (v.make) {
      params.vehicleMake = v.make;
      if (v.model) params.vehicleModel = v.model;
      if (v.year) params.vehicleYear = v.year;
      if (v.color) params.vehicleColor = v.color;
    }
    return params;
  }, [vehicleMode, vehicle, mascotId]);

  // ---------- Generation ----------

  const generateFlyers = useCallback(async (
    slotsToGen: GenerationSlot[],
    genType: ContentType,
    genHeadline: string,
    genSubject: string,
    genDetails: string,
  ) => {
    setIsGenerating(true);

    const promises = slotsToGen.map(async (slot) => {
      updateSlot(slot.id, { status: 'loading' });

      try {
        let result: GeneratedFlyer;

        if (genType === 'hiring') {
          const res = await hiringFlyerApi.generate({
            mode: 'simple',
            jobTitle: position || 'Automotive Technician',
            jobType,
            payRange: payRange || undefined,
            howToApply,
            language: 'en',
            themeId: slot.themeId || undefined,
          });
          result = {
            id: res.data.id,
            imageUrl: res.data.imageUrl,
            caption: res.data.caption || '',
            captionSpanish: res.data.captionSpanish,
            title: res.data.title || position,
            theme: res.data.theme || slot.themeId,
            themeName: res.data.themeName || slot.themeName,
          };
        } else if (genType === 'meme') {
          const res = await memeApi.generate({
            styleId: memeStyleId,
            topic: memeTopic,
            mascotId: mascotId || undefined,
          });
          result = {
            id: res.data.id,
            imageUrl: res.data.imageUrl,
            caption: res.data.caption || '',
            title: res.data.title || memeTopic,
            theme: res.data.style?.id || 'meme',
            themeName: res.data.style?.name || 'Meme',
          };
        } else {
          const res = await promoFlyerApi.generate({
            message: genHeadline,
            subject: genSubject,
            details: genDetails || undefined,
            themeId: slot.themeId,
            subjectType: subjectType as any,
            ...getVehicleParams(),
          });
          result = {
            id: res.data.id || res.data.contentId,
            imageUrl: res.data.imageUrl,
            caption: res.data.caption || '',
            captionSpanish: res.data.captionSpanish,
            title: genSubject || genHeadline,
            theme: res.data.theme || slot.themeId,
            themeName: res.data.themeName || slot.themeName,
            vehicle: res.data.vehicle,
          };
        }

        updateSlot(slot.id, { status: 'done', flyer: result });

        // First-ever flyer celebration
        if (!firstFlyerCheckedRef.current && !hasSeenFirstFlyerCelebration()) {
          firstFlyerCheckedRef.current = true;
          setShowCelebration(true);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || 'Generation failed';
        updateSlot(slot.id, { status: 'error', error: msg });
      }
    });

    await Promise.allSettled(promises);
    setIsGenerating(false);
    toast.success('Generation complete!');
  }, [updateSlot, position, jobType, payRange, howToApply, memeStyleId, memeTopic, mascotId, subjectType, getVehicleParams]);

  // ---------- Easy Button ----------

  const handleEasyGenerate = useCallback(() => {
    let easyHeadline = 'Auto Repair Special!';
    let easySubject = 'Auto Repair';
    let easyDetails = '';

    if (services.length > 0) {
      const svc = services[Math.floor(Math.random() * services.length)];
      easySubject = typeof svc === 'string' ? svc : svc.name;
      const headlines = [
        `${easySubject} Special!`,
        `Expert ${easySubject}`,
        `Save on ${easySubject}`,
        `Quality ${easySubject}`,
        `${easySubject} Done Right`,
      ];
      easyHeadline = headlines[Math.floor(Math.random() * headlines.length)];
    } else if (specials.length > 0) {
      const sp = specials[Math.floor(Math.random() * specials.length)];
      easySubject = typeof sp === 'string' ? sp : sp.name;
      easyHeadline = sp.discountText
        ? `${sp.discountText} — ${easySubject}`
        : `${easySubject} Special!`;
      easyDetails = sp.description || '';
    }

    const themes = pickThemes(count);
    const newSlots: GenerationSlot[] = themes.map((t, i) => ({
      id: `easy-${Date.now()}-${i}`,
      status: 'pending' as const,
      flyer: null,
      error: null,
      themeId: t.themeId,
      themeName: t.themeName,
    }));

    setSlots(newSlots);
    generateFlyers(newSlots, 'service', easyHeadline, easySubject, easyDetails);
  }, [services, specials, count, pickThemes, generateFlyers]);

  // ---------- Custom Generate ----------

  const handleCustomGenerate = useCallback(() => {
    if (contentType === 'service' || contentType === 'special' || contentType === 'custom') {
      if (!headline && !subject) {
        toast.error('Enter a headline or subject');
        return;
      }
    }
    if (contentType === 'hiring' && !position) {
      toast.error('Enter a position');
      return;
    }
    if (contentType === 'meme' && (!memeStyleId || !memeTopic)) {
      toast.error('Pick a meme style and topic');
      return;
    }

    const themes = pickThemes(count);
    const newSlots: GenerationSlot[] = themes.map((t, i) => ({
      id: `custom-${Date.now()}-${i}`,
      status: 'pending' as const,
      flyer: null,
      error: null,
      themeId: t.themeId,
      themeName: t.themeName,
    }));

    setSlots(newSlots);
    generateFlyers(newSlots, contentType, headline, subject, details);
  }, [contentType, headline, subject, details, position, memeStyleId, memeTopic, count, pickThemes, generateFlyers]);

  // ---------- Download ----------

  const handleDownload = useCallback(async (slot: GenerationSlot) => {
    if (!slot.flyer) return;
    try {
      const response = await downloadApi.downloadSingle(slot.flyer.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slot.flyer.title || 'flyer'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  }, []);

  // ---------- Auto-fill handlers ----------

  const handleServiceSelect = (svc: any) => {
    setServiceId(svc?.id || null);
    if (svc) {
      setSubject(svc.name);
      setHeadline(`${svc.name} Special!`);
      setDetails(svc.description || '');
    }
  };

  const handleSpecialSelect = (sp: any) => {
    setSpecialId(sp?.id || null);
    if (sp) {
      setSubject(sp.name);
      setHeadline(sp.discountText ? `${sp.discountText} — ${sp.name}` : `${sp.name}!`);
      setDetails(sp.description || '');
    }
  };

  // Active flyers for modals
  const activeEditFlyer = editingSlot?.flyer;
  const activeSharingFlyer = sharingSlot?.flyer;
  const activeAnimatingFlyer = animatingSlot?.flyer;

  // ---------- Count slider (shared) ----------
  const CountSlider = () => (
    <div className="flex items-center gap-3 flex-1">
      <span className="font-heading text-lg w-7 text-center tabular-nums text-retro-red">{count}</span>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={count}
        onChange={e => setCount(Number(e.target.value))}
        className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-retro-red [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-retro-red [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
      />
    </div>
  );

  // ===================================================================
  // RENDER
  // ===================================================================

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro text-4xl sm:text-5xl">CREATE A FLYER</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Easy button or full control — your call
        </p>
      </div>

      {/* ========== EASY BUTTON ========== */}
      <div className="card-retro bg-gradient-to-br from-retro-red/5 to-retro-teal/5 dark:from-retro-red/10 dark:to-retro-teal/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} className="text-retro-red" />
          <h2 className="font-heading text-lg uppercase">Instant Flyer</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          We'll pick the best service, style, and car. Just hit go.
        </p>

        <div className="flex items-center gap-3">
          <CountSlider />
          <button
            onClick={handleEasyGenerate}
            disabled={isGenerating}
            className="flex-1 py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:shadow-none transition-all font-heading uppercase text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Rocket size={20} />
            {isGenerating ? 'Generating...' : 'GO'}
          </button>
        </div>
      </div>

      {/* ========== DIVIDER ========== */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t-2 border-gray-300 dark:border-gray-600" />
        <span className="font-heading text-xs uppercase text-gray-400 dark:text-gray-500 whitespace-nowrap">
          or customize
        </span>
        <div className="flex-1 border-t-2 border-gray-300 dark:border-gray-600" />
      </div>

      {/* ========== CONTENT SECTION ========== */}
      <div className="card-retro p-5 space-y-4">
        <h3 className="font-heading text-sm uppercase text-gray-500 dark:text-gray-400">
          What are you promoting?
        </h3>

        <ContentTypeSelector
          contentType={contentType}
          onContentTypeChange={setContentType}
          services={services}
          selectedServiceId={serviceId}
          onServiceSelect={handleServiceSelect}
          specials={specials}
          selectedSpecialId={specialId}
          onSpecialSelect={handleSpecialSelect}
        />

        {/* Content-type-specific inputs */}
        {contentType === 'hiring' ? (
          <HiringInputs
            position={position}
            onPositionChange={setPosition}
            jobType={jobType}
            onJobTypeChange={setJobType}
            payRange={payRange}
            onPayRangeChange={setPayRange}
            howToApply={howToApply}
            onHowToApplyChange={setHowToApply}
          />
        ) : contentType === 'meme' ? (
          <MemeInputs
            styleId={memeStyleId}
            onStyleIdChange={setMemeStyleId}
            topic={memeTopic}
            onTopicChange={setMemeTopic}
          />
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block font-heading uppercase text-sm mb-1.5">Headline *</label>
              <input
                type="text"
                className="input-retro"
                placeholder="e.g., 20% OFF Oil Changes!"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-heading uppercase text-sm mb-1.5">Subject *</label>
              <input
                type="text"
                className="input-retro"
                placeholder="e.g., Full Synthetic Oil Change"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-heading uppercase text-sm mb-1.5">
                Details <span className="text-gray-400 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                className="input-retro min-h-[60px]"
                placeholder="e.g., Includes filter, up to 5 quarts..."
                value={details}
                onChange={e => setDetails(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ========== STYLE SECTION ========== */}
      <StyleSection
        themeId={themeId}
        onThemeChange={setThemeId}
        familyId={familyId}
        onFamilyChange={setFamilyId}
        randomize={randomizeTheme}
        onRandomizeToggle={() => setRandomizeTheme(prev => !prev)}
        subjectType={subjectType}
        onSubjectTypeChange={setSubjectType}
      />

      {/* ========== VEHICLE SECTION ========== */}
      <div className="card-retro p-5">
        <VehicleSection
          vehicleMode={vehicleMode}
          onVehicleModeChange={setVehicleMode}
          vehicle={vehicle}
          onVehicleChange={setVehicle}
          mascotId={mascotId}
          onMascotChange={setMascotId}
        />
      </div>

      {/* ========== GENERATE BUTTON ========== */}
      <div className="card-retro p-5">
        <div className="flex items-center gap-3">
          <CountSlider />
          <button
            onClick={handleCustomGenerate}
            disabled={isGenerating}
            className="flex-1 py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:shadow-none transition-all font-heading uppercase text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Rocket size={20} />
            {isGenerating
              ? 'Generating...'
              : count > 1
              ? `Generate ${count} Flyers`
              : 'Generate Flyer'}
          </button>
        </div>
      </div>

      {/* ========== RESULTS CAROUSEL ========== */}
      {slots.length > 0 && (
        <div className="card-retro p-5">
          <FlyerResultsCarousel
            slots={slots}
            onEdit={slot => setEditingSlot(slot)}
            onAnimate={slot => setAnimatingSlot(slot)}
            onShare={slot => setSharingSlot(slot)}
            onDownload={handleDownload}
          />
        </div>
      )}

      {/* ========== MODALS ========== */}

      {activeSharingFlyer && (
        <ShareModal
          isOpen={!!sharingSlot}
          onClose={() => setSharingSlot(null)}
          content={{
            id: activeSharingFlyer.id,
            title: activeSharingFlyer.title,
            imageUrl: activeSharingFlyer.imageUrl,
            caption: activeSharingFlyer.caption,
          }}
        />
      )}

      {editingSlot && activeEditFlyer && (
        <FlyerEditor
          contentId={activeEditFlyer.id}
          imageUrl={activeEditFlyer.imageUrl}
          title={activeEditFlyer.title}
          onClose={() => setEditingSlot(null)}
          onSave={(newImageUrl) => {
            updateSlot(editingSlot.id, {
              flyer: { ...activeEditFlyer, imageUrl: newImageUrl },
            });
            setEditingSlot(null);
            toast.success('Image updated!');
          }}
        />
      )}

      {animatingSlot && activeAnimatingFlyer && (
        <VideoFromFlyerModal
          isOpen={!!animatingSlot}
          onClose={() => setAnimatingSlot(null)}
          flyerId={activeAnimatingFlyer.id}
          flyerTitle={activeAnimatingFlyer.title}
          flyerImageUrl={activeAnimatingFlyer.imageUrl}
        />
      )}

      <FirstFlyerCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        flyerTitle={subject || headline || 'Your Flyer'}
        onShare={() => {
          const firstDone = slots.find(s => s.status === 'done');
          if (firstDone) setSharingSlot(firstDone);
        }}
        onDownload={() => {
          const firstDone = slots.find(s => s.status === 'done');
          if (firstDone) handleDownload(firstDone);
        }}
      />
    </div>
  );
}
