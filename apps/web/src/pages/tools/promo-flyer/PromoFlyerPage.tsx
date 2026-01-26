import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { promoFlyerApi, downloadApi } from '../../../services/api';
import { Wand2, Download, Share2, Copy, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from '../../../components/features/ShareModal';
import PushToStartButton from '../../../components/features/PushToStartButton';
import NostalgicThemeGrid from '../../../components/features/NostalgicThemeGrid';
import VehiclePicker from '../../../components/features/VehiclePicker';
import LanguageToggle from '../../../components/features/LanguageToggle';
import PackSelector from '../../../components/features/PackSelector';

type PackType = 'variety-3' | 'variety-5' | 'week-7' | 'era' | 'style';

interface GeneratedFlyer {
  id: string;
  imageUrl: string;
  caption: string;
  captionSpanish?: string | null;
  title?: string;
  theme: string;
  themeName: string;
  vehicle?: { id: string; name: string };
}

const wizardSteps = ['Content', 'Style', 'Options', 'Generate'];

export default function PromoFlyerPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(searchParams.get('advanced') === 'true');
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
      toast.success('Flyer generated!');
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
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="heading-retro">Promo Flyer</h1>
        <p className="text-gray-600 mt-2">
          Create stunning promotional flyers with 48 nostalgic styles from the 1950s-1980s
        </p>
      </div>

      {/* PUSH TO START - Primary Action */}
      <div className="card-retro bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="font-heading text-2xl uppercase mb-2">Instant Flyer</h2>
          <p className="text-gray-600 text-sm mb-4">
            One-click creates a professional flyer from your services & specials
          </p>
        </div>
        <PushToStartButton />
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-200 hover:border-gray-300 transition-colors"
      >
        {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        <span className="font-heading text-sm uppercase">
          {showAdvanced ? 'Hide' : 'Show'} Custom Flyer Builder
        </span>
      </button>

      {/* Advanced Custom Builder - Collapsible */}
      {showAdvanced && (
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

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="card-retro">
              <h2 className="font-heading text-xl uppercase mb-4">
                {wizardSteps[step]}
              </h2>

              {/* Step 0: Content */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-heading uppercase text-sm mb-2">
                      Main Message *
                    </label>
                    <input
                      type="text"
                      className="input-retro"
                      placeholder="e.g., 20% OFF Oil Changes!"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-heading uppercase text-sm mb-2">
                      Subject/Service *
                    </label>
                    <input
                      type="text"
                      className="input-retro"
                      placeholder="e.g., Full Synthetic Oil Change"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-heading uppercase text-sm mb-2">
                      Additional Details
                    </label>
                    <textarea
                      className="input-retro min-h-[80px]"
                      placeholder="e.g., Includes filter, up to 5 quarts..."
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Style Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Theme Type Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setUseNostalgicThemes(true)}
                      className={`flex-1 py-2 px-3 border-2 flex items-center justify-center gap-2 transition-all ${
                        useNostalgicThemes
                          ? 'border-retro-red bg-red-50 text-retro-red'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <Sparkles size={16} />
                      <span className="text-sm font-heading uppercase">Nostalgic</span>
                    </button>
                    <button
                      onClick={() => setUseNostalgicThemes(false)}
                      className={`flex-1 py-2 px-3 border-2 flex items-center justify-center gap-2 transition-all ${
                        !useNostalgicThemes
                          ? 'border-retro-red bg-red-50 text-retro-red'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <Wand2 size={16} />
                      <span className="text-sm font-heading uppercase">Classic</span>
                    </button>
                  </div>

                  {useNostalgicThemes ? (
                    <NostalgicThemeGrid
                      selectedThemeId={formData.themeId}
                      onSelectTheme={(themeId) => setFormData({ ...formData, themeId })}
                      onSurpriseMe={handleSurpriseMe}
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                      {themesData?.brandStyles?.map((style: {
                        id: string;
                        name: string;
                        category: string;
                        shortDescription?: string;
                        previewColors?: string[];
                      }) => (
                        <button
                          key={style.id}
                          onClick={() => setFormData({ ...formData, themeId: style.id })}
                          className={`p-4 border-2 text-left transition-all ${
                            formData.themeId === style.id
                              ? 'border-retro-red bg-red-50 shadow-retro'
                              : 'border-gray-300 hover:border-gray-500 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-heading uppercase text-sm">{style.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{style.shortDescription}</p>
                            </div>
                            {style.previewColors && style.previewColors.length > 0 && (
                              <div className="flex gap-1">
                                {style.previewColors.slice(0, 4).map((color, i) => (
                                  <div
                                    key={i}
                                    className="w-5 h-5 rounded-sm border border-black/20"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Options */}
              {step === 2 && (
                <div className="space-y-6">
                  <VehiclePicker
                    selectedVehicleId={formData.vehicleId}
                    onSelectVehicle={(vehicleId) => setFormData({ ...formData, vehicleId })}
                  />

                  <LanguageToggle
                    language={formData.language}
                    onChange={(language) => setFormData({ ...formData, language })}
                  />

                  <PackSelector
                    selectedPack={packType}
                    onSelectPack={setPackType}
                    selectedEra={packEra}
                    onSelectEra={setPackEra}
                    selectedStyle={packStyle}
                    onSelectStyle={setPackStyle}
                  />
                </div>
              )}

              {/* Step 3: Generate */}
              {step === 3 && (
                <div className="text-center py-8">
                  <Wand2 size={48} className="mx-auto mb-4 text-retro-red" />
                  <p className="font-heading text-lg uppercase mb-2">Ready to Generate!</p>
                  <p className="text-gray-600 mb-4">
                    {packType
                      ? `Create ${packType === 'variety-3' ? 3 : packType === 'variety-5' ? 5 : packType === 'week-7' ? 7 : 4} flyers`
                      : 'Create your custom flyer'}
                  </p>
                  <div className="text-left bg-gray-50 p-4 border-2 border-black mb-4 text-sm">
                    <p><strong>Message:</strong> {formData.message}</p>
                    <p><strong>Subject:</strong> {formData.subject}</p>
                    <p><strong>Theme:</strong> {formData.themeId}</p>
                    {formData.vehicleId && (
                      <p><strong>Vehicle:</strong> {formData.vehicleId === 'random' ? 'Random' : formData.vehicleId}</p>
                    )}
                    <p><strong>Language:</strong> {formData.language === 'both' ? 'English & Spanish' : formData.language === 'es' ? 'Spanish' : 'English'}</p>
                    {packType && (
                      <p><strong>Pack:</strong> {packType}{packEra ? ` (${packEra})` : ''}{packStyle ? ` (${packStyle})` : ''}</p>
                    )}
                  </div>
                </div>
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

            {/* Preview */}
            <div className="card-retro">
              <h2 className="font-heading text-xl uppercase mb-4">Preview</h2>

              {currentFlyer ? (
                <div>
                  {/* Pack Navigation */}
                  {generatedPack.length > 0 && (
                    <div className="flex items-center justify-between mb-4 p-2 bg-gray-100 border-2 border-black">
                      <button
                        onClick={() => setActivePackIndex(Math.max(0, activePackIndex - 1))}
                        disabled={activePackIndex === 0}
                        className="px-3 py-1 text-sm disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="font-heading text-sm">
                        {activePackIndex + 1} / {generatedPack.length}
                      </span>
                      <button
                        onClick={() => setActivePackIndex(Math.min(generatedPack.length - 1, activePackIndex + 1))}
                        disabled={activePackIndex === generatedPack.length - 1}
                        className="px-3 py-1 text-sm disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}

                  <div className="aspect-[4/5] bg-gray-200 border-2 border-black mb-4">
                    <img
                      src={currentFlyer.imageUrl}
                      alt="Generated flyer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Theme & Vehicle Info */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-300">
                      {currentFlyer.themeName}
                    </span>
                    {currentFlyer.vehicle && (
                      <span className="text-xs px-2 py-1 bg-teal-50 border border-retro-teal text-retro-teal">
                        {currentFlyer.vehicle.name}
                      </span>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="bg-gray-50 p-4 border-2 border-black mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-heading uppercase text-sm">Caption:</p>
                      <button
                        onClick={() => handleCopyCaption(currentFlyer.caption)}
                        className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
                      >
                        {captionCopied ? <Check size={12} /> : <Copy size={12} />}
                        {captionCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm">{currentFlyer.caption}</p>

                    {currentFlyer.captionSpanish && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-heading uppercase text-sm">Spanish:</p>
                          <button
                            onClick={() => handleCopyCaption(currentFlyer.captionSpanish!)}
                            className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
                          >
                            <Copy size={12} />
                            Copy
                          </button>
                        </div>
                        <p className="text-sm">{currentFlyer.captionSpanish}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleDownload(currentFlyer)}
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

                  <button
                    onClick={resetForm}
                    className="w-full mt-3 btn-retro-outline text-sm"
                  >
                    Create Another
                  </button>
                </div>
              ) : (
                <div className="aspect-[4/5] bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Wand2 size={48} className="mx-auto mb-2" />
                    <p>Your flyer will appear here</p>
                  </div>
                </div>
              )}
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
    </div>
  );
}
