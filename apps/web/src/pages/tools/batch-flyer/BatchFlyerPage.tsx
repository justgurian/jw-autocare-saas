import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Zap,
  Calendar,
  Rocket,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Wand2,
  Heart,
  Clock,
  Loader2,
} from 'lucide-react';
import { batchFlyerApi, promoFlyerApi } from '../../../services/api';
import toast from 'react-hot-toast';
import ModeSelector from '../../../components/batch-flyer/ModeSelector';
import ContentSelector from '../../../components/batch-flyer/ContentSelector';
import ThemeSelector from '../../../components/batch-flyer/ThemeSelector';
import FlyerCarousel from '../../../components/batch-flyer/FlyerCarousel';
import FlyerEditor from '../../../components/flyer-editor/FlyerEditor';
import RetroLoadingStage from '../../../components/ui/RetroLoadingStage';

// Types
interface BatchFlyer {
  id: string;
  imageUrl: string;
  caption: string;
  captionSpanish?: string | null;
  title: string;
  theme: string;
  themeName: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  scheduledFor?: string | null;
  status: string;
  index: number;
}

interface ContentItem {
  id: string;
  type: 'service' | 'special';
  name: string;
  isSelected: boolean;
  reason?: string;
}

type Mode = 'quick' | 'week' | 'month';
type Step = 'mode' | 'content' | 'theme' | 'generating' | 'review' | 'complete';
type ThemeStrategy = 'auto' | 'single' | 'matrix';

export default function BatchFlyerPage() {
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('mode');

  // Mode selection
  const [selectedMode, setSelectedMode] = useState<Mode>('quick');
  const [flyerCount, setFlyerCount] = useState(1);

  // Content selection
  const [selectedContent, setSelectedContent] = useState<ContentItem[]>([]);
  const [customContent, setCustomContent] = useState<Array<{ message: string; subject: string; details?: string }>>([]);

  // Theme selection
  const [themeStrategy, setThemeStrategy] = useState<ThemeStrategy>('auto');
  const [singleThemeId, setSingleThemeId] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'es' | 'both'>('en');

  // Generation
  const [jobId, setJobId] = useState<string | null>(null);
  const [generatedFlyers, setGeneratedFlyers] = useState<BatchFlyer[]>([]);
  const [currentFlyerIndex, setCurrentFlyerIndex] = useState(0);

  // Editing
  const [editingFlyer, setEditingFlyer] = useState<BatchFlyer | null>(null);
  const [showInPaintEditor, setShowInPaintEditor] = useState(false);

  // Get suggestions
  const { data: suggestionsData } = useQuery({
    queryKey: ['batch-flyer-suggestions'],
    queryFn: () => batchFlyerApi.getSuggestions().then(res => res.data),
  });

  // Get themes
  const { data: themesData } = useQuery({
    queryKey: ['promo-flyer-themes'],
    queryFn: () => promoFlyerApi.getThemes().then(res => res.data),
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const serviceIds = selectedContent
        .filter(c => c.type === 'service' && c.isSelected)
        .map(c => c.id);
      const specialIds = selectedContent
        .filter(c => c.type === 'special' && c.isSelected)
        .map(c => c.id);

      const contentType = customContent.length > 0
        ? (serviceIds.length > 0 || specialIds.length > 0 ? 'mixed' : 'custom')
        : (serviceIds.length > 0 && specialIds.length > 0 ? 'mixed' : serviceIds.length > 0 ? 'services' : 'specials');

      return batchFlyerApi.generate({
        mode: selectedMode,
        count: flyerCount,
        contentType,
        serviceIds: serviceIds.length > 0 ? serviceIds : undefined,
        specialIds: specialIds.length > 0 ? specialIds : undefined,
        customContent: customContent.length > 0 ? customContent : undefined,
        themeStrategy,
        singleThemeId: themeStrategy === 'single' ? singleThemeId : undefined,
        language,
      });
    },
    onSuccess: (response) => {
      setJobId(response.data.jobId);
      setCurrentStep('generating');
      toast.success('Generation started!');
    },
    onError: () => {
      toast.error('Failed to start generation');
    },
  });

  // Poll for job status
  const { data: jobStatus } = useQuery({
    queryKey: ['batch-job', jobId],
    queryFn: () => batchFlyerApi.getJob(jobId!).then(res => res.data),
    enabled: !!jobId && currentStep === 'generating',
    refetchInterval: (data) => {
      if (data?.state?.data?.job?.status === 'completed' || data?.state?.data?.job?.status === 'failed') {
        return false;
      }
      return 2000;
    },
  });

  // Get flyers when job completes
  const { data: flyersData } = useQuery({
    queryKey: ['batch-job-flyers', jobId],
    queryFn: () => batchFlyerApi.getJobFlyers(jobId!).then(res => res.data),
    enabled: !!jobId && jobStatus?.job?.status === 'completed',
  });

  // Update flyers when data arrives
  useEffect(() => {
    if (flyersData?.flyers) {
      setGeneratedFlyers(flyersData.flyers);
      setCurrentStep('review');
    }
  }, [flyersData]);

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => batchFlyerApi.approveFlyer(id),
    onSuccess: (_, id) => {
      setGeneratedFlyers(prev =>
        prev.map(f => f.id === id ? { ...f, approvalStatus: 'approved' } : f)
      );
      toast.success('Flyer approved and scheduled!');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (id: string) => batchFlyerApi.rejectFlyer(id),
    onSuccess: (_, id) => {
      setGeneratedFlyers(prev =>
        prev.map(f => f.id === id ? { ...f, approvalStatus: 'rejected' } : f)
      );
    },
  });

  // Update caption mutation
  const updateCaptionMutation = useMutation({
    mutationFn: ({ id, caption }: { id: string; caption: string }) =>
      batchFlyerApi.updateCaption(id, { caption }),
    onSuccess: (_, { id, caption }) => {
      setGeneratedFlyers(prev =>
        prev.map(f => f.id === id ? { ...f, caption } : f)
      );
      toast.success('Caption updated!');
    },
  });

  // Initialize content from suggestions or raw service/special lists
  useEffect(() => {
    if (selectedContent.length === 0 && suggestionsData) {
      const items: ContentItem[] = [];

      // First try contentSuggestions (smart AI suggestions)
      if (suggestionsData.contentSuggestions?.length > 0) {
        for (const s of suggestionsData.contentSuggestions) {
          items.push({
            id: s.serviceId || s.specialId || '',
            type: s.serviceId ? 'service' : 'special' as 'service' | 'special',
            name: s.name,
            isSelected: s.isPreSelected,
            reason: s.reason,
          });
        }
      }

      // If no suggestions, use raw service/special lists
      if (items.length === 0) {
        // Add all services
        if (suggestionsData.allServices?.length > 0) {
          for (const service of suggestionsData.allServices) {
            items.push({
              id: service.id,
              type: 'service',
              name: service.name,
              isSelected: items.length < 3, // Pre-select first 3
              reason: service.category || 'Available service',
            });
          }
        }
        // Add all specials
        if (suggestionsData.allSpecials?.length > 0) {
          for (const special of suggestionsData.allSpecials) {
            items.push({
              id: special.id,
              type: 'special',
              name: special.title,
              isSelected: true, // Always pre-select specials
              reason: 'Active special',
            });
          }
        }
      }

      if (items.length > 0) {
        setSelectedContent(items);
      }
    }
  }, [suggestionsData, selectedContent.length]);

  // Mode count defaults
  useEffect(() => {
    switch (selectedMode) {
      case 'quick':
        setFlyerCount(1);
        break;
      case 'week':
        setFlyerCount(7);
        break;
      case 'month':
        setFlyerCount(20);
        break;
    }
  }, [selectedMode]);

  const handleNext = () => {
    switch (currentStep) {
      case 'mode':
        setCurrentStep('content');
        break;
      case 'content':
        setCurrentStep('theme');
        break;
      case 'theme':
        generateMutation.mutate();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'content':
        setCurrentStep('mode');
        break;
      case 'theme':
        setCurrentStep('content');
        break;
      case 'review':
        // Can't go back during review
        break;
    }
  };

  const handleComplete = () => {
    const approved = generatedFlyers.filter(f => f.approvalStatus === 'approved').length;
    toast.success(`${approved} flyer${approved !== 1 ? 's' : ''} scheduled!`);
    setCurrentStep('complete');
  };

  const currentFlyer = generatedFlyers[currentFlyerIndex];
  const approvedCount = generatedFlyers.filter(f => f.approvalStatus === 'approved').length;
  const rejectedCount = generatedFlyers.filter(f => f.approvalStatus === 'rejected').length;
  const pendingCount = generatedFlyers.filter(f => f.approvalStatus === 'pending').length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-retro-navy mb-2">Batch Flyer Generator</h1>
        <p className="text-gray-600">
          Create stunning promotional flyers in minutes. Plan your whole week or month!
        </p>
      </div>

      {/* Progress Steps */}
      {currentStep !== 'complete' && (
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {['mode', 'content', 'theme', 'generating', 'review'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-heading ${
                    currentStep === step
                      ? 'border-retro-red bg-retro-red text-white'
                      : ['mode', 'content', 'theme', 'generating', 'review'].indexOf(currentStep) > index
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {['mode', 'content', 'theme', 'generating', 'review'].indexOf(currentStep) > index ? (
                    <Check size={14} />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 4 && (
                  <div
                    className={`w-12 h-0.5 ${
                      ['mode', 'content', 'theme', 'generating', 'review'].indexOf(currentStep) > index
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
            <span>Mode</span>
            <span>Content</span>
            <span>Theme</span>
            <span>Generate</span>
            <span>Review</span>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white border-2 border-black p-6 shadow-retro">
        {/* Mode Selection */}
        {currentStep === 'mode' && (
          <ModeSelector
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            flyerCount={flyerCount}
            onCountChange={setFlyerCount}
          />
        )}

        {/* Content Selection */}
        {currentStep === 'content' && (
          <ContentSelector
            selectedContent={selectedContent}
            onContentChange={setSelectedContent}
            customContent={customContent}
            onCustomContentChange={setCustomContent}
            suggestions={suggestionsData}
          />
        )}

        {/* Theme Selection */}
        {currentStep === 'theme' && (
          <ThemeSelector
            strategy={themeStrategy}
            onStrategyChange={setThemeStrategy}
            singleThemeId={singleThemeId}
            onSingleThemeChange={setSingleThemeId}
            language={language}
            onLanguageChange={setLanguage}
            themes={themesData?.nostalgicThemes || []}
          />
        )}

        {/* Generation Progress */}
        {currentStep === 'generating' && (
          <RetroLoadingStage
            isLoading={true}
            estimatedDuration={flyerCount * 8000}
            size="lg"
            showExhaust={true}
            progress={{
              completed: jobStatus?.job?.completedItems || 0,
              total: jobStatus?.job?.totalItems || flyerCount,
            }}
            phaseMessages={{
              0: ['Firing up the batch press...', 'Loading the design templates...'],
              1: ['Your AI team is hard at work...', 'Each flyer gets its own style...'],
              2: ['Mixing unique color palettes...', 'Adding your brand\'s signature touch...'],
              3: ['Final quality checks...', 'Almost there — just a few more...'],
            }}
          />
        )}

        {/* Review Carousel */}
        {currentStep === 'review' && currentFlyer && (
          <FlyerCarousel
            flyers={generatedFlyers}
            currentIndex={currentFlyerIndex}
            onIndexChange={setCurrentFlyerIndex}
            onApprove={(id) => approveMutation.mutate(id)}
            onReject={(id) => rejectMutation.mutate(id)}
            onEditCaption={(flyer) => setEditingFlyer(flyer)}
            onEditImage={(flyer) => {
              setEditingFlyer(flyer);
              setShowInPaintEditor(true);
            }}
            isApproving={approveMutation.isPending}
            isRejecting={rejectMutation.isPending}
          />
        )}

        {/* Completion */}
        {currentStep === 'complete' && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={40} className="text-white" />
            </div>
            <h2 className="font-heading text-2xl uppercase mb-2">All Done!</h2>
            <p className="text-gray-600 mb-6">
              {approvedCount} flyer{approvedCount !== 1 ? 's' : ''} scheduled for posting
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setCurrentStep('mode');
                  setGeneratedFlyers([]);
                  setJobId(null);
                  setCurrentFlyerIndex(0);
                }}
                className="px-6 py-3 border-2 border-black bg-white text-retro-navy font-heading uppercase hover:bg-gray-50"
              >
                Create More
              </button>
              <a
                href="/calendar"
                className="px-6 py-3 border-2 border-black bg-retro-teal text-white font-heading uppercase hover:bg-retro-teal/90"
              >
                View Calendar
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {['mode', 'content', 'theme'].includes(currentStep) && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 'mode'}
            className="px-6 py-3 border-2 border-black bg-white text-retro-navy font-heading uppercase hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 'content' && selectedContent.filter(c => c.isSelected).length === 0 && customContent.length === 0) ||
              (currentStep === 'theme' && themeStrategy === 'single' && !singleThemeId) ||
              generateMutation.isPending
            }
            className="px-8 py-3 border-2 border-black bg-retro-red text-white font-heading uppercase shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {currentStep === 'theme' ? (
              generateMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Rocket size={18} />
                  Generate {flyerCount} Flyer{flyerCount > 1 ? 's' : ''}
                </>
              )
            ) : (
              <>
                Next
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      )}

      {/* Review Navigation */}
      {currentStep === 'review' && (
        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <Check size={16} /> {approvedCount} Approved
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <X size={16} /> {rejectedCount} Rejected
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <Clock size={16} /> {pendingCount} Pending
            </span>
          </div>
          <button
            onClick={handleComplete}
            disabled={pendingCount > 0}
            className="px-8 py-3 border-2 border-black bg-green-500 text-white font-heading uppercase shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Calendar size={18} />
            Schedule {approvedCount} Flyer{approvedCount !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Flyer Editor Modal */}
      {showInPaintEditor && editingFlyer && (
        <FlyerEditor
          contentId={editingFlyer.id}
          imageUrl={editingFlyer.imageUrl}
          title={editingFlyer.title}
          onClose={() => {
            setShowInPaintEditor(false);
            setEditingFlyer(null);
          }}
          onSave={(newImageUrl) => {
            setGeneratedFlyers(prev =>
              prev.map(f => f.id === editingFlyer.id ? { ...f, imageUrl: newImageUrl } : f)
            );
            setShowInPaintEditor(false);
            setEditingFlyer(null);
            toast.success('Image updated!');
          }}
        />
      )}
    </div>
  );
}
