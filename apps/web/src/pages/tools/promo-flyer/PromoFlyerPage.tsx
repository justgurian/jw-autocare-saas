import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { promoFlyerApi, downloadApi } from '../../../services/api';
import { Wand2, Download, Share2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from '../../../components/features/ShareModal';
import PushToStartButton from '../../../components/features/PushToStartButton';

const wizardSteps = ['Message', 'Subject', 'Details', 'Style', 'Generate'];

export default function PromoFlyerPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(searchParams.get('advanced') === 'true');
  const [formData, setFormData] = useState({
    message: '',
    subject: searchParams.get('topic') || '',
    details: '',
    themeId: searchParams.get('theme') || '',
    language: 'en',
  });
  const [generatedContent, setGeneratedContent] = useState<{
    id: string;
    imageUrl: string;
    caption: string;
    title?: string;
  } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);

  // Fetch themes
  const { data: themesData } = useQuery({
    queryKey: ['promo-flyer-themes'],
    queryFn: () => promoFlyerApi.getThemes().then(res => res.data),
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: () => promoFlyerApi.generate(formData),
    onSuccess: (res) => {
      setGeneratedContent({
        ...res.data,
        title: formData.subject,
      });
      toast.success('Flyer generated!');
    },
    onError: () => {
      toast.error('Generation failed. Please try again.');
    },
  });

  const handleNext = () => {
    if (step < wizardSteps.length - 1) {
      setStep(step + 1);
    } else {
      generateMutation.mutate();
    }
  };

  const handleDownload = async () => {
    if (!generatedContent) return;
    try {
      const response = await downloadApi.downloadSingle(generatedContent.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.subject || 'promo-flyer'}.png`;
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
    if (!generatedContent?.caption) return;
    navigator.clipboard.writeText(generatedContent.caption);
    setCaptionCopied(true);
    toast.success('Caption copied!');
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="heading-retro">Promo Flyer</h1>
        <p className="text-gray-600 mt-2">
          Create stunning promotional flyers in seconds
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
                  <div className={`w-16 h-1 mx-2 ${index < step ? 'bg-retro-teal' : 'bg-gray-300'}`} />
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

              {step === 0 && (
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
                  <p className="text-sm text-gray-500 mt-2">
                    What's the headline of your flyer?
                  </p>
                </div>
              )}

              {step === 1 && (
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
                  <p className="text-sm text-gray-500 mt-2">
                    What service or topic is this about?
                  </p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <label className="block font-heading uppercase text-sm mb-2">
                    Additional Details
                  </label>
                  <textarea
                    className="input-retro min-h-[120px]"
                    placeholder="e.g., Includes filter, up to 5 quarts, free inspection..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Add any extra info to include (optional)
                  </p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <label className="block font-heading uppercase text-sm mb-2">
                    Choose Style *
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select a visual style for your flyer
                  </p>
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                    {/* Brand Styles first (featured) */}
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
                          {/* Color chips */}
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
                        <div className="mt-2">
                          <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 uppercase">
                            {style.category}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-8">
                  <Wand2 size={48} className="mx-auto mb-4 text-retro-red" />
                  <p className="font-heading text-lg uppercase mb-2">Ready to Generate!</p>
                  <p className="text-gray-600 mb-4">
                    Click the button below to create your flyer
                  </p>
                  <div className="text-left bg-gray-50 p-4 border-2 border-black mb-4">
                    <p><strong>Message:</strong> {formData.message}</p>
                    <p><strong>Subject:</strong> {formData.subject}</p>
                    <p><strong>Theme:</strong> {formData.themeId}</p>
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
                  disabled={
                    (step === 0 && !formData.message) ||
                    (step === 1 && !formData.subject) ||
                    (step === 3 && !formData.themeId) ||
                    generateMutation.isPending
                  }
                  className="btn-retro-primary disabled:opacity-50"
                >
                  {step === 4
                    ? generateMutation.isPending
                      ? 'Generating...'
                      : 'Generate Flyer'
                    : 'Next'}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="card-retro">
              <h2 className="font-heading text-xl uppercase mb-4">Preview</h2>

              {generatedContent ? (
                <div>
                  <div className="aspect-[4/5] bg-gray-200 border-2 border-black mb-4">
                    <img
                      src={generatedContent.imageUrl}
                      alt="Generated flyer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 border-2 border-black mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-heading uppercase text-sm">Caption:</p>
                      <button
                        onClick={handleCopyCaption}
                        className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
                      >
                        {captionCopied ? <Check size={12} /> : <Copy size={12} />}
                        {captionCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm">{generatedContent.caption}</p>
                  </div>

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

                  <button
                    onClick={() => {
                      setGeneratedContent(null);
                      setStep(0);
                      setFormData({ message: '', subject: '', details: '', themeId: '', language: 'en' });
                    }}
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
      {generatedContent && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: generatedContent.id,
            title: generatedContent.title,
            imageUrl: generatedContent.imageUrl,
            caption: generatedContent.caption,
          }}
        />
      )}
    </div>
  );
}
