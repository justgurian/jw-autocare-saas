import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { promoFlyerApi, downloadApi } from '../../../services/api';
import { Eye, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from '../../../components/features/ShareModal';
import FlyerEditor from '../../../components/flyer-editor/FlyerEditor';
import PushToStartButton from '../../../components/features/PushToStartButton';
import ContentCalendar from '../../../components/features/ContentCalendar';
import FirstFlyerCelebration, { hasSeenFirstFlyerCelebration } from '../../../components/features/FirstFlyerCelebration';
import FlyerPreview from './components/FlyerPreview';
import type { GeneratedFlyer } from './components/FlyerPreview';
import { ContentStep, StyleStep, OptionsStep, GenerateStep } from './components/WizardSteps';

type PackType = 'variety-3' | 'variety-5' | 'week-7' | 'era' | 'style';

const wizardSteps = ['Content', 'Style', 'Options', 'Generate'];

type PageMode = 'instant' | 'custom' | 'calendar';

export default function PromoFlyerPage() {
  const [searchParams] = useSearchParams();
  const [pageMode, setPageMode] = useState<PageMode>('instant');
  const [step, setStep] = useState(0);
  const [useNostalgicThemes, setUseNostalgicThemes] = useState(true);
  const [formData, setFormData] = useState({
    message: '',
    subject: searchParams.get('topic') || '',
    details: '',
    themeId: searchParams.get('theme') || '',
    vehicleId: null as string | null,
    language: 'en' as 'en' | 'es' | 'both',
  });

  // Pack generation state
  const [packType, setPackType] = useState<PackType | null>(null);
  const [packEra, setPackEra] = useState<string | null>(null);
  const [packStyle, setPackStyle] = useState<string | null>(null);

  const [generatedContent, setGeneratedContent] = useState<GeneratedFlyer | null>(null);
  const [generatedPack, setGeneratedPack] = useState<GeneratedFlyer[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [activePackIndex, setActivePackIndex] = useState(0);
  const [mobileShowPreview, setMobileShowPreview] = useState(false);
  const [showFirstFlyerCelebration, setShowFirstFlyerCelebration] = useState(false);
  const [showFlyerEditor, setShowFlyerEditor] = useState(false);

  // Fetch themes for legacy selector
  const { data: themesData } = useQuery({
    queryKey: ['promo-flyer-themes'],
    queryFn: () => promoFlyerApi.getThemes().then(res => res.data),
  });

  // Generate single flyer mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      promoFlyerApi.generate({
        ...formData,
        vehicleId: formData.vehicleId || undefined,
      }),
    onSuccess: (res) => {
      setGeneratedContent({
        ...res.data,
        title: formData.subject,
      });
      setGeneratedPack([]);
      setMobileShowPreview(true); // Auto-show preview on mobile

      // Check if this is user's first flyer
      if (!hasSeenFirstFlyerCelebration()) {
        setShowFirstFlyerCelebration(true);
      } else {
        toast.success('Flyer generated!');
      }
    },
    onError: () => {
      toast.error('Generation failed. Please try again.');
    },
  });

  // Generate pack mutation
  const generatePackMutation = useMutation({
    mutationFn: () =>
      promoFlyerApi.generatePack({
        message: formData.message,
        subject: formData.subject,
        details: formData.details || undefined,
        packType: packType!,
        era: packEra as '1950s' | '1960s' | '1970s' | '1980s' | undefined,
        style: packStyle as 'comic-book' | 'movie-poster' | 'magazine' | undefined,
        vehicleId: formData.vehicleId || undefined,
        language: formData.language,
      }),
    onSuccess: (res) => {
      setGeneratedPack(res.data.flyers);
      setGeneratedContent(null);
      setActivePackIndex(0);
      setMobileShowPreview(true); // Auto-show preview on mobile
      toast.success(`${res.data.totalGenerated} flyers generated!`);
    },
    onError: () => {
      toast.error('Pack generation failed. Please try again.');
    },
  });

  const handleNext = () => {
    if (step < wizardSteps.length - 1) {
      setStep(step + 1);
    } else {
      if (packType) {
        generatePackMutation.mutate();
      } else {
        generateMutation.mutate();
      }
    }
  };

  const handleDownload = async (content: GeneratedFlyer) => {
    try {
      const response = await downloadApi.downloadSingle(content.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.title || 'promo-flyer'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleCopyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    toast.success('Caption copied!');
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const handleSurpriseMe = async () => {
    try {
      const response = await promoFlyerApi.getRandomTheme({ nostalgicOnly: true });
      setFormData({ ...formData, themeId: response.data.theme.id });
      toast.success(`Selected: ${response.data.theme.name}`);
    } catch {
      toast.error('Failed to get random theme');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.message && formData.subject;
      case 1:
        return formData.themeId;
      case 2:
        if (packType === 'era' && !packEra) return false;
        if (packType === 'style' && !packStyle) return false;
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const isGenerating = generateMutation.isPending || generatePackMutation.isPending;

  const currentFlyer = generatedPack.length > 0 ? generatedPack[activePackIndex] : generatedContent;

  const resetForm = () => {
    setGeneratedContent(null);
    setGeneratedPack([]);
    setStep(0);
    setFormData({
      message: '',
      subject: '',
      details: '',
      themeId: '',
      vehicleId: null,
      language: 'en',
    });
    setPackType(null);
    setPackEra(null);
    setPackStyle(null);
    setMobileShowPreview(false); // Back to form on mobile
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro text-5xl">FLYER CREATOR</h1>
        <p className="text-gray-600 mt-2 text-lg">
          10 style families, smart rotation, push-button marketing
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-2 border-black">
        {[
          { mode: 'instant' as PageMode, label: 'Instant', desc: 'One-click flyer' },
          { mode: 'calendar' as PageMode, label: 'Week Plan', desc: '7-day calendar' },
          { mode: 'custom' as PageMode, label: 'Custom', desc: 'Build your own' },
        ].map(({ mode, label, desc }) => (
          <button
            key={mode}
            onClick={() => setPageMode(mode)}
            className={`flex-1 py-3 px-2 text-center border-r last:border-r-0 border-black transition-all ${
              pageMode === mode
                ? 'bg-retro-navy text-white'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span className="font-heading text-sm uppercase block">{label}</span>
            <span className="text-xs opacity-70 hidden sm:block">{desc}</span>
          </button>
        ))}
      </div>

      {/* INSTANT MODE - Push to Start */}
      {pageMode === 'instant' && (
        <div className="card-retro bg-gradient-to-br from-gray-50 to-gray-100">
          <PushToStartButton />
        </div>
      )}

      {/* CALENDAR MODE - Week Planner */}
      {pageMode === 'calendar' && (
        <div className="card-retro">
          <ContentCalendar />
        </div>
      )}

      {/* CUSTOM MODE - Wizard Builder */}
      {pageMode === 'custom' && (
        <div className="space-y-6">
          {/* Wizard Progress */}
          <div className="flex items-center justify-between">
            {wizardSteps.map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <button
                  onClick={() => index < step && setStep(index)}
                  className={`w-10 h-10 flex items-center justify-center border-2 border-black font-heading ${
                    index < step
                      ? 'bg-retro-teal text-white cursor-pointer'
                      : index === step
                      ? 'bg-retro-red text-white'
                      : 'bg-white text-gray-400'
                  }`}
                >
                  {index + 1}
                </button>
                {index < wizardSteps.length - 1 && (
                  <div className={`w-12 sm:w-16 h-1 mx-1 sm:mx-2 ${index < step ? 'bg-retro-teal' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Mobile Toggle Button */}
          <div className="lg:hidden sticky top-0 z-20 bg-retro-cream py-3 -mx-4 px-4 border-b border-gray-200 flex gap-2">
            <button
              onClick={() => setMobileShowPreview(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 transition-all ${
                !mobileShowPreview
                  ? 'border-retro-red bg-retro-red text-white'
                  : 'border-gray-300 bg-white text-gray-600'
              }`}
            >
              <PenTool size={18} />
              <span className="font-heading text-sm uppercase">Edit</span>
            </button>
            <button
              onClick={() => setMobileShowPreview(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 transition-all ${
                mobileShowPreview
                  ? 'border-retro-red bg-retro-red text-white'
                  : 'border-gray-300 bg-white text-gray-600'
              } ${currentFlyer ? '' : 'opacity-50'}`}
              disabled={!currentFlyer}
            >
              <Eye size={18} />
              <span className="font-heading text-sm uppercase">Preview</span>
              {currentFlyer && (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form - Hidden on mobile when preview is active */}
            <div className={`card-retro ${mobileShowPreview ? 'hidden lg:block' : ''}`}>
              <h2 className="font-heading text-xl uppercase mb-4">
                {wizardSteps[step]}
              </h2>

              {step === 0 && (
                <ContentStep formData={formData} setFormData={setFormData} />
              )}

              {step === 1 && (
                <StyleStep
                  formData={formData}
                  setFormData={setFormData}
                  useNostalgicThemes={useNostalgicThemes}
                  setUseNostalgicThemes={setUseNostalgicThemes}
                  themesData={themesData}
                  onSurpriseMe={handleSurpriseMe}
                />
              )}

              {step === 2 && (
                <OptionsStep
                  formData={formData}
                  setFormData={setFormData}
                  packType={packType}
                  setPackType={setPackType}
                  packEra={packEra}
                  setPackEra={setPackEra}
                  packStyle={packStyle}
                  setPackStyle={setPackStyle}
                />
              )}

              {step === 3 && (
                <GenerateStep
                  formData={formData}
                  packType={packType}
                  packEra={packEra}
                  packStyle={packStyle}
                />
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="btn-retro-outline disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isGenerating}
                  className="btn-retro-primary disabled:opacity-50"
                >
                  {step === 3
                    ? isGenerating
                      ? 'Generating...'
                      : packType
                      ? 'Generate Pack'
                      : 'Generate Flyer'
                    : 'Next'}
                </button>
              </div>
            </div>

            {/* Preview - Hidden on mobile when form is active */}
            <div className={`card-retro ${!mobileShowPreview ? 'hidden lg:block' : ''}`}>
              <FlyerPreview
                currentFlyer={currentFlyer}
                generatedPack={generatedPack}
                activePackIndex={activePackIndex}
                setActivePackIndex={setActivePackIndex}
                isGenerating={isGenerating}
                captionCopied={captionCopied}
                onDownload={handleDownload}
                onCopyCaption={handleCopyCaption}
                onShare={() => setShowShareModal(true)}
                onReset={resetForm}
                onEditImage={() => setShowFlyerEditor(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {currentFlyer && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: currentFlyer.id,
            title: currentFlyer.title,
            imageUrl: currentFlyer.imageUrl,
            caption: currentFlyer.caption,
          }}
        />
      )}

      {/* Flyer Editor Modal */}
      {showFlyerEditor && currentFlyer && (
        <FlyerEditor
          contentId={currentFlyer.id}
          imageUrl={currentFlyer.imageUrl}
          title={currentFlyer.title}
          onClose={() => setShowFlyerEditor(false)}
          onSave={(newImageUrl) => {
            if (generatedPack.length > 0) {
              setGeneratedPack(prev =>
                prev.map((f, i) => i === activePackIndex ? { ...f, imageUrl: newImageUrl } : f)
              );
            }
            if (generatedContent) {
              setGeneratedContent({ ...generatedContent, imageUrl: newImageUrl });
            }
            setShowFlyerEditor(false);
            toast.success('Image updated!');
          }}
        />
      )}

      {/* First Flyer Celebration */}
      <FirstFlyerCelebration
        isOpen={showFirstFlyerCelebration}
        onClose={() => setShowFirstFlyerCelebration(false)}
        flyerTitle={generatedContent?.title || formData.subject}
        onShare={() => setShowShareModal(true)}
        onDownload={() => generatedContent && handleDownload(generatedContent)}
      />
    </div>
  );
}
