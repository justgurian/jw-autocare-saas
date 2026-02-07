import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { videoCreatorApi, servicesApi, specialsApi } from '../../../services/api';
import MascotSelector from '../../../components/features/MascotSelector';
import {
  Video,
  Film,
  Sparkles,
  Clock,
  Layout,
  Play,
  Download,
  Share2,
  Loader,
  ChevronRight,
  RefreshCw,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from '../../../components/features/ShareModal';
import { usePollJob } from '../../../hooks/usePollJob';

// Types
type VideoStyle = 'cinematic' | 'commercial' | 'social-media' | 'documentary' | 'animated' | 'retro';
type VideoAspectRatio = '16:9' | '9:16';
type VideoDuration = '4s' | '6s' | '8s';
type VideoResolution = '720p' | '1080p';

interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  style: VideoStyle;
  duration: VideoDuration;
  aspectRatio: VideoAspectRatio;
  category: string;
}

interface GeneratedVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  duration: string;
  aspectRatio: string;
  style: string;
}

const STYLE_INFO: Record<VideoStyle, { icon: string; color: string }> = {
  cinematic: { icon: '🎬', color: 'bg-purple-100 text-purple-800' },
  commercial: { icon: '📺', color: 'bg-blue-100 text-blue-800' },
  'social-media': { icon: '📱', color: 'bg-pink-100 text-pink-800' },
  documentary: { icon: '🎥', color: 'bg-green-100 text-green-800' },
  animated: { icon: '✨', color: 'bg-yellow-100 text-yellow-800' },
  retro: { icon: '📼', color: 'bg-orange-100 text-orange-800' },
};

export default function VideoCreatorPage() {
  const [step, setStep] = useState<'template' | 'customize' | 'generating' | 'result'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    serviceHighlight: '',
    callToAction: '',
    style: 'commercial' as VideoStyle,
    aspectRatio: '9:16' as VideoAspectRatio,
    duration: '8s' as VideoDuration,
    resolution: '1080p' as VideoResolution,
    voiceoverText: '',
  });
  const [mascotId, setMascotId] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [customTopic, setCustomTopic] = useState(false);
  const [customHighlight, setCustomHighlight] = useState(false);
  const [customCta, setCustomCta] = useState(false);

  // Shared polling hook
  const { job: currentJob, startPolling } = usePollJob({
    onComplete: (job) => {
      setGeneratedVideo({
        id: job.id,
        videoUrl: job.videoUrl || '',
        thumbnailUrl: job.thumbnailUrl || '',
        caption: job.caption || '',
        duration: formData.duration,
        aspectRatio: formData.aspectRatio,
        style: formData.style,
      });
      setStep('result');
      toast.success('Video generated successfully!');
    },
    onFailed: (job) => {
      toast.error(job.error || 'Video generation failed');
      setStep('customize');
    },
    onTimeout: () => {
      toast.error('Video generation timed out. Please try again.');
      setStep('customize');
    },
  });

  // Fetch templates
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['video-templates'],
    queryFn: () => videoCreatorApi.getTemplates().then((res) => res.data),
  });

  // Fetch options
  const { data: optionsData } = useQuery({
    queryKey: ['video-options'],
    queryFn: () => videoCreatorApi.getOptions().then((res) => res.data),
  });

  // Fetch services and specials for dropdowns
  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.getAll().then(r => r.data),
  });
  const { data: specialsData } = useQuery({
    queryKey: ['specials'],
    queryFn: () => specialsApi.getAll().then(r => r.data),
  });
  const services = Array.isArray(servicesData) ? servicesData : servicesData?.data || [];
  const specials = Array.isArray(specialsData) ? specialsData : specialsData?.data || [];

  const formatDiscount = (s: any) => {
    if (s.discountType === 'percentage') return `${s.discountValue}% OFF`;
    if (s.discountType === 'fixed') return `$${s.discountValue} OFF`;
    if (s.discountType === 'bogo') return 'BOGO';
    return 'Special Offer';
  };

  const templates: VideoTemplate[] = templatesData?.data || [];
  const options = optionsData?.data;

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: (data: typeof formData & { templateId?: string; mascotId?: string }) =>
      videoCreatorApi.generate(data),
    onSuccess: (response) => {
      const job = response.data.data.job;
      setStep('generating');
      startPolling(job.id);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to start video generation');
    },
  });

  // Handle template selection
  const handleSelectTemplate = (template: VideoTemplate) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      style: template.style,
      aspectRatio: template.aspectRatio,
      duration: template.duration,
    }));
    setStep('customize');
  };

  // Handle form change
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle generate
  const handleGenerate = () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    generateMutation.mutate({
      ...formData,
      templateId: selectedTemplate?.id,
      mascotId: mascotId || undefined,
    });
  };

  // Handle reset
  const handleReset = () => {
    setStep('template');
    setSelectedTemplate(null);
    setFormData({
      topic: '',
      serviceHighlight: '',
      callToAction: '',
      style: 'commercial',
      aspectRatio: '9:16',
      duration: '8s',
      resolution: '1080p',
      voiceoverText: '',
    });
    setGeneratedVideo(null);
  };

  // Handle download with fetch + blob
  const handleDownload = async () => {
    if (!generatedVideo?.videoUrl) {
      toast.error('No video to download');
      return;
    }

    try {
      const response = await fetch(generatedVideo.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bayfiller-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Downloading video...');
    } catch {
      // Fallback: open in new tab
      window.open(generatedVideo.videoUrl, '_blank');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* New Video Studio Banner */}
      <div className="card-retro bg-retro-cream border-retro-red mb-6">
        <h3 className="font-heading text-lg">New Video Studio Tools Available!</h3>
        <div className="flex gap-3 mt-3 flex-wrap">
          <Link to="/tools/ugc-creator" className="btn-retro-primary text-sm">UGC Creator</Link>
          <Link to="/tools/directors-cut" className="btn-retro-secondary text-sm">Director's Cut</Link>
          <Link to="/tools/celebration" className="btn-retro-outline text-sm">Celebrations</Link>
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro flex items-center justify-center gap-3">
          <Video className="text-retro-mustard" />
          Video Creator
        </h1>
        <p className="text-gray-600 mt-2">
          Create AI-powered promotional videos for your auto shop
        </p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          <Sparkles size={14} />
          Powered by Veo 3.1
        </div>
      </div>

      {/* Step: Template Selection */}
      {step === 'template' && (
        <div className="space-y-6">
          <div className="card-retro">
            <h2 className="font-heading text-xl uppercase mb-4 border-b border-gray-200 pb-2">
              Choose a Template
            </h2>

            {templatesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-retro-red" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => {
                  const styleInfo = STYLE_INFO[template.style];

                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="p-4 border-4 border-gray-200 rounded-lg text-left hover:border-retro-red hover:shadow-retro transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{styleInfo.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-heading text-lg uppercase group-hover:text-retro-red">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${styleInfo.color}`}>
                              {template.style}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              {template.duration}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              {template.aspectRatio}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Option */}
          <div className="text-center">
            <button
              onClick={() => setStep('customize')}
              className="btn-retro-outline"
            >
              Or create a custom video from scratch
            </button>
          </div>
        </div>
      )}

      {/* Step: Customize */}
      {step === 'customize' && (
        <div className="card-retro space-y-6">
          {/* Selected Template Badge */}
          {selectedTemplate && (
            <div className="flex items-center gap-3 p-3 bg-retro-cream border-2 border-retro-mustard rounded">
              <span className="text-2xl">{STYLE_INFO[selectedTemplate.style].icon}</span>
              <div>
                <p className="font-heading uppercase text-sm">Using Template:</p>
                <p className="font-bold">{selectedTemplate.name}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setStep('template');
                }}
                className="ml-auto text-sm text-gray-500 hover:text-red-500"
              >
                Change
              </button>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block font-heading text-sm uppercase mb-1">
                Topic / Main Message *
              </label>
              <select
                value={customTopic ? '__custom__' : formData.topic}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setCustomTopic(true);
                    handleChange('topic', '');
                  } else {
                    setCustomTopic(false);
                    handleChange('topic', e.target.value);
                  }
                }}
                className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red"
              >
                <option value="" disabled>-- Select a topic --</option>
                {specials.length > 0 && (
                  <optgroup label="Specials">
                    {specials.map((s: any) => {
                      const label = `${formatDiscount(s)} ${s.title}`;
                      return <option key={s.id} value={label}>{label}</option>;
                    })}
                  </optgroup>
                )}
                {services.length > 0 && (
                  <optgroup label="Services">
                    {services.map((s: any) => (
                      <option key={s.id} value={`${s.name} Special`}>{s.name} Special</option>
                    ))}
                  </optgroup>
                )}
                <option value="__custom__">Custom...</option>
              </select>
              {customTopic && (
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleChange('topic', e.target.value)}
                  placeholder="e.g., Summer AC Special, Brake Safety Week, Oil Change Deal"
                  className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red mt-2"
                />
              )}
            </div>

            <div>
              <label className="block font-heading text-sm uppercase mb-1">
                Service Highlight
              </label>
              <select
                value={customHighlight ? '__custom__' : formData.serviceHighlight}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setCustomHighlight(true);
                    handleChange('serviceHighlight', '');
                  } else {
                    setCustomHighlight(false);
                    handleChange('serviceHighlight', e.target.value);
                  }
                }}
                className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red"
              >
                <option value="">-- Select a highlight --</option>
                {services.length > 0 && (
                  <optgroup label="Services">
                    {services.map((s: any) => {
                      const label = `${s.name}${s.priceRange ? ' - ' + s.priceRange : ''}`;
                      return <option key={s.id} value={label}>{label}</option>;
                    })}
                  </optgroup>
                )}
                {specials.length > 0 && (
                  <optgroup label="Specials">
                    {specials.map((s: any) => {
                      const label = `${s.title} - ${s.description}`;
                      return <option key={s.id} value={label}>{label}</option>;
                    })}
                  </optgroup>
                )}
                <option value="__custom__">Custom...</option>
              </select>
              {customHighlight && (
                <input
                  type="text"
                  value={formData.serviceHighlight}
                  onChange={(e) => handleChange('serviceHighlight', e.target.value)}
                  placeholder="e.g., $49.99 oil change, Free AC check, 10% off brakes"
                  className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red mt-2"
                />
              )}
            </div>

            <div>
              <label className="block font-heading text-sm uppercase mb-1">
                Call to Action
              </label>
              <select
                value={customCta ? '__custom__' : formData.callToAction}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setCustomCta(true);
                    handleChange('callToAction', '');
                  } else {
                    setCustomCta(false);
                    handleChange('callToAction', e.target.value);
                  }
                }}
                className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red"
              >
                <option value="">-- Select a CTA --</option>
                <option value="Call Now!">Call Now!</option>
                <option value="Book Online Today">Book Online Today</option>
                <option value="Visit Us Today">Visit Us Today</option>
                <option value="Schedule Your Appointment">Schedule Your Appointment</option>
                <option value="Limited Time Offer - Act Now!">Limited Time Offer - Act Now!</option>
                <option value="Stop By Today">Stop By Today</option>
                <option value="__custom__">Custom...</option>
              </select>
              {customCta && (
                <input
                  type="text"
                  value={formData.callToAction}
                  onChange={(e) => handleChange('callToAction', e.target.value)}
                  placeholder="e.g., Call now!, Book online today, Visit us in Scottsdale"
                  className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red mt-2"
                />
              )}
            </div>

            {/* Style, Duration, Aspect Ratio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-heading text-sm uppercase mb-1">
                  <Film size={14} className="inline mr-1" />
                  Style
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => handleChange('style', e.target.value)}
                  className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red"
                >
                  {options?.styles?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  )) || (
                    <>
                      <option value="commercial">Commercial</option>
                      <option value="cinematic">Cinematic</option>
                      <option value="social-media">Social Media</option>
                      <option value="documentary">Documentary</option>
                      <option value="animated">Animated</option>
                      <option value="retro">Retro</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-heading text-sm uppercase mb-1">
                  <Clock size={14} className="inline mr-1" />
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red"
                >
                  <option value="4s">4 seconds (teaser)</option>
                  <option value="6s">6 seconds (standard)</option>
                  <option value="8s">8 seconds (HD/1080p)</option>
                </select>
              </div>

              {/* Resolution */}
              <div>
                <label className="block text-sm font-heading uppercase mb-1">Resolution</label>
                <select
                  value={formData.resolution || '720p'}
                  onChange={(e) => handleChange('resolution', e.target.value)}
                  className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red"
                >
                  <option value="720p">720p (all durations)</option>
                  <option value="1080p" disabled={formData.duration !== '8s'}>1080p HD (8s only)</option>
                </select>
              </div>

              <div>
                <label className="block font-heading text-sm uppercase mb-1">
                  <Layout size={14} className="inline mr-1" />
                  Aspect Ratio
                </label>
                <select
                  value={formData.aspectRatio}
                  onChange={(e) => handleChange('aspectRatio', e.target.value)}
                  className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red"
                >
                  <option value="9:16">Portrait 9:16 (TikTok/Reels)</option>
                  <option value="16:9">Landscape 16:9 (YouTube)</option>
                </select>
              </div>
            </div>

            {/* Voiceover (optional) */}
            <div>
              <label className="block font-heading text-sm uppercase mb-1">
                Voiceover Script (Optional)
              </label>
              <textarea
                value={formData.voiceoverText}
                onChange={(e) => handleChange('voiceoverText', e.target.value)}
                placeholder="Add a script for AI-generated voiceover..."
                rows={3}
                className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red"
              />
            </div>

            {/* Mascot Selector */}
            <div>
              <label className="block font-heading text-sm uppercase mb-2">Feature Your Mascot</label>
              <MascotSelector onSelect={setMascotId} selectedMascotId={mascotId} />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-4">
            <button
              onClick={() => setStep('template')}
              className="btn-retro-outline"
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !formData.topic.trim()}
              className="flex-1 btn-retro-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generateMutation.isPending ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Sparkles size={20} />
              )}
              Generate Video
            </button>
          </div>
        </div>
      )}

      {/* Step: Generating */}
      {step === 'generating' && currentJob && (
        <div className="card-retro text-center py-12">
          <div className="max-w-md mx-auto space-y-6">
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full bg-retro-red/10 flex items-center justify-center">
                <Loader className="w-12 h-12 animate-spin text-retro-red" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🎬</span>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl uppercase">Creating Your Video</h2>
              <p className="text-gray-600 mt-2">
                {currentJob.status === 'pending' && 'Preparing your video...'}
                {currentJob.status === 'processing' && 'AI is generating your video...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-full bg-retro-red rounded-full transition-all duration-500"
                style={{ width: `${currentJob.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{currentJob.progress}% complete</p>

            <p className="text-xs text-gray-400">
              Veo 3.1 generation typically takes 1-3 minutes. Please wait...
            </p>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && generatedVideo && (
        <div className="space-y-6">
          <div className="card-retro text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <Check size={24} />
              <span className="font-heading text-xl uppercase">Video Ready!</span>
            </div>

            {/* Video Preview */}
            <div className="max-w-lg mx-auto">
              {generatedVideo.videoUrl ? (
                <div className="relative bg-gray-900 rounded-lg overflow-hidden border-4 border-black shadow-retro">
                  <video
                    src={generatedVideo.videoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {generatedVideo.duration}
                  </div>
                </div>
              ) : generatedVideo.thumbnailUrl ? (
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border-4 border-black shadow-retro">
                  <img
                    src={generatedVideo.thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play size={32} className="text-retro-red ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-4 border-black">
                  <div className="text-center text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-2" />
                    <p>Video preview not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="flex justify-center gap-4 mt-4">
              <span className={`px-3 py-1 rounded-full text-sm ${STYLE_INFO[generatedVideo.style as VideoStyle]?.color || 'bg-gray-100'}`}>
                {STYLE_INFO[generatedVideo.style as VideoStyle]?.icon} {generatedVideo.style}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                {generatedVideo.aspectRatio}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                {generatedVideo.duration}
              </span>
            </div>
          </div>

          {/* Caption */}
          {generatedVideo.caption && (
            <div className="card-retro">
              <h3 className="font-heading text-sm uppercase text-gray-600 mb-2">Caption:</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{generatedVideo.caption}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleDownload}
              className="btn-retro-secondary flex items-center justify-center gap-2"
              disabled={!generatedVideo.videoUrl}
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

          {/* Start Over */}
          <button
            onClick={handleReset}
            className="w-full btn-retro-outline flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Create Another Video
          </button>
        </div>
      )}

      {/* Share Modal */}
      {generatedVideo && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: generatedVideo.id,
            title: `Video - ${formData.topic}`,
            imageUrl: generatedVideo.thumbnailUrl,
            caption: generatedVideo.caption,
          }}
        />
      )}
    </div>
  );
}
