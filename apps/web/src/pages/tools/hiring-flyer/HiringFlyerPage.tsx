import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Zap,
  Pencil,
  Loader,
  Download,
  RefreshCw,
  Clock,
  Trash2,
  Share2,
  Check,
} from 'lucide-react';
import { hiringFlyerApi } from '../../../services/api';

type HiringMode = 'simple' | 'detailed';
type JobType = 'full-time' | 'part-time' | 'seasonal';
type HowToApply = 'call' | 'email' | 'visit' | 'online';
type ExperienceLevel = 'none' | 'entry' | 'mid' | 'senior';
type Urgency = 'normal' | 'urgent' | 'immediate';

interface Position {
  id: string;
  title: string;
  category: string;
}

interface HiringResult {
  id: string;
  imageUrl: string;
  caption: string;
  captionSpanish?: string | null;
  title: string;
  theme: string;
  themeName: string;
  jobTitle: string;
  jobType: string;
}

interface HistoryItem {
  id: string;
  title: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  jobTitle: string;
  jobType: string;
}

export default function HiringFlyerPage() {
  const [step, setStep] = useState<'form' | 'generating' | 'result'>('form');
  const [mode, setMode] = useState<HiringMode>('simple');
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState<JobType>('full-time');
  const [payRange, setPayRange] = useState('');
  const [howToApply, setHowToApply] = useState<HowToApply>('call');
  const [showHistory, setShowHistory] = useState(false);
  const [result, setResult] = useState<HiringResult | null>(null);
  const [captionCopied, setCaptionCopied] = useState(false);

  // Detailed mode fields
  const [requiredCerts, setRequiredCerts] = useState<string[]>([]);
  const [skills, setSkills] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('entry');
  const [urgency, setUrgency] = useState<Urgency>('normal');

  // Fetch positions and options
  const { data: positionsData } = useQuery({
    queryKey: ['hiring-positions'],
    queryFn: () => hiringFlyerApi.getPositions().then(r => r.data),
  });

  const positions: Position[] = positionsData?.data?.positions || [];
  const certOptions: string[] = positionsData?.data?.certifications || [];
  const benefitOptions: string[] = positionsData?.data?.benefits || [];

  // History
  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ['hiring-history'],
    queryFn: () => hiringFlyerApi.getHistory().then(r => r.data),
    enabled: showHistory,
  });
  const history: HistoryItem[] = historyData?.data || [];

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: (data: Parameters<typeof hiringFlyerApi.generate>[0]) =>
      hiringFlyerApi.generate(data),
    onSuccess: (response) => {
      const flyerData = response.data?.data;
      if (flyerData) {
        setResult(flyerData);
        setStep('result');
        toast.success('Hiring flyer created!');
      } else {
        toast.error('Failed to generate flyer');
        setStep('form');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate hiring flyer');
      setStep('form');
    },
  });

  // Instant mutation
  const instantMutation = useMutation({
    mutationFn: () => hiringFlyerApi.instant(),
    onSuccess: (response) => {
      const flyerData = response.data?.data;
      if (flyerData) {
        setResult(flyerData);
        setStep('result');
        toast.success('Instant hiring flyer created!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => hiringFlyerApi.delete(id),
    onSuccess: () => {
      toast.success('Flyer deleted');
      refetchHistory();
    },
  });

  const handleGenerate = () => {
    if (!jobTitle.trim()) {
      toast.error('Please enter a job title');
      return;
    }

    setStep('generating');

    const payload: Parameters<typeof hiringFlyerApi.generate>[0] = {
      mode,
      jobTitle: jobTitle.trim(),
      jobType,
      payRange: payRange || undefined,
      howToApply,
      language: 'en',
    };

    if (mode === 'detailed') {
      payload.requiredCerts = requiredCerts.length > 0 ? requiredCerts : undefined;
      payload.skills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined;
      payload.benefits = benefits.length > 0 ? benefits : undefined;
      payload.experienceLevel = experienceLevel;
      payload.urgency = urgency;
    }

    generateMutation.mutate(payload);
  };

  const handleStartOver = () => {
    setStep('form');
    setResult(null);
    setJobTitle('');
    setPayRange('');
    setRequiredCerts([]);
    setSkills('');
    setBenefits([]);
    setExperienceLevel('entry');
    setUrgency('normal');
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const a = document.createElement('a');
    a.href = result.imageUrl;
    a.download = `now-hiring-${result.jobTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCaption = () => {
    if (!result?.caption) return;
    navigator.clipboard.writeText(result.caption);
    setCaptionCopied(true);
    toast.success('Caption copied!');
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const toggleCert = (cert: string) => {
    setRequiredCerts(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const toggleBenefit = (benefit: string) => {
    setBenefits(prev =>
      prev.includes(benefit) ? prev.filter(b => b !== benefit) : [...prev, benefit]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-retro-navy flex items-center gap-3">
            <Briefcase className="text-retro-red" size={32} />
            Now Hiring
          </h1>
          <p className="text-gray-600 mt-1 font-heading">
            Create a professional hiring flyer for your open positions
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 border-2 border-black bg-retro-cream hover:bg-retro-mustard font-heading text-sm shadow-retro transition-colors"
        >
          <Clock size={16} className="inline mr-2" />
          {showHistory ? 'Hide' : 'Show'} History
        </button>
      </div>

      {/* FORM STATE */}
      {step === 'form' && (
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('simple')}
              className={`p-4 border-2 text-left transition-all ${
                mode === 'simple'
                  ? 'border-retro-red bg-red-50 shadow-retro'
                  : 'border-black bg-white hover:bg-retro-cream'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap size={18} className={mode === 'simple' ? 'text-retro-red' : 'text-gray-400'} />
                <span className="font-heading text-sm">Simple</span>
              </div>
              <p className="text-xs text-gray-500">
                Pick a position, set the basics, and go
              </p>
            </button>
            <button
              onClick={() => setMode('detailed')}
              className={`p-4 border-2 text-left transition-all ${
                mode === 'detailed'
                  ? 'border-retro-red bg-red-50 shadow-retro'
                  : 'border-black bg-white hover:bg-retro-cream'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Pencil size={18} className={mode === 'detailed' ? 'text-retro-red' : 'text-gray-400'} />
                <span className="font-heading text-sm">Detailed</span>
              </div>
              <p className="text-xs text-gray-500">
                Add certs, benefits, skills, and urgency
              </p>
            </button>
          </div>

          {/* Main Form */}
          <div className="border-4 border-black bg-white p-8 shadow-retro">
            {/* Position Picker */}
            <div className="mb-6">
              <label className="block text-sm font-heading text-retro-navy mb-2">Position</label>
              {positions.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {positions.map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setJobTitle(pos.title)}
                      className={`p-2.5 text-left text-sm border-2 rounded transition-all ${
                        jobTitle === pos.title
                          ? 'border-retro-red bg-retro-red/10 text-retro-red font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pos.title}
                    </button>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Or type a custom position..."
                className="w-full p-3 border-2 border-black font-heading text-sm focus:outline-none focus:ring-2 focus:ring-retro-red"
                maxLength={200}
              />
            </div>

            {/* Job Type */}
            <div className="mb-6">
              <label className="block text-sm font-heading text-retro-navy mb-2">Job Type</label>
              <div className="flex gap-3">
                {(['full-time', 'part-time', 'seasonal'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setJobType(type)}
                    className={`px-4 py-2 border-2 font-heading text-sm capitalize transition-all ${
                      jobType === type
                        ? 'border-retro-red bg-red-50 text-retro-red'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Pay Range */}
            <div className="mb-6">
              <label className="block text-sm font-heading text-retro-navy mb-2">Pay Range (optional)</label>
              <input
                type="text"
                value={payRange}
                onChange={(e) => setPayRange(e.target.value)}
                placeholder="e.g. $20-30/hr, Competitive Pay, DOE"
                className="w-full p-3 border-2 border-black font-heading text-sm focus:outline-none focus:ring-2 focus:ring-retro-red"
                maxLength={100}
              />
            </div>

            {/* How to Apply */}
            <div className="mb-6">
              <label className="block text-sm font-heading text-retro-navy mb-2">How to Apply</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {([
                  { value: 'call' as const, label: 'Call Us' },
                  { value: 'email' as const, label: 'Email Resume' },
                  { value: 'visit' as const, label: 'Visit In Person' },
                  { value: 'online' as const, label: 'Apply Online' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setHowToApply(opt.value)}
                    className={`p-2.5 border-2 font-heading text-sm transition-all ${
                      howToApply === opt.value
                        ? 'border-retro-red bg-red-50 text-retro-red'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Mode Fields */}
            {mode === 'detailed' && (
              <div className="space-y-6 p-4 bg-retro-cream border-2 border-dashed border-retro-navy rounded mb-6">
                {/* Required Certs */}
                <div>
                  <label className="block text-sm font-heading text-retro-navy mb-2">Required Certifications</label>
                  <div className="flex flex-wrap gap-2">
                    {certOptions.map((cert) => (
                      <button
                        key={cert}
                        onClick={() => toggleCert(cert)}
                        className={`px-3 py-1.5 border-2 text-xs font-heading transition-all ${
                          requiredCerts.includes(cert)
                            ? 'border-retro-red bg-retro-red text-white'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        {requiredCerts.includes(cert) && <Check size={12} className="inline mr-1" />}
                        {cert}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-heading text-retro-navy mb-2">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Brake repair, Diagnostics, A/C service"
                    className="w-full p-3 border-2 border-black font-heading text-sm focus:outline-none focus:ring-2 focus:ring-retro-red"
                    maxLength={500}
                  />
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-heading text-retro-navy mb-2">Benefits Offered</label>
                  <div className="flex flex-wrap gap-2">
                    {benefitOptions.map((benefit) => (
                      <button
                        key={benefit}
                        onClick={() => toggleBenefit(benefit)}
                        className={`px-3 py-1.5 border-2 text-xs font-heading transition-all ${
                          benefits.includes(benefit)
                            ? 'border-retro-navy bg-retro-navy text-white'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        {benefits.includes(benefit) && <Check size={12} className="inline mr-1" />}
                        {benefit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-heading text-retro-navy mb-2">Experience Level</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {([
                      { value: 'none' as const, label: 'Will Train' },
                      { value: 'entry' as const, label: 'Entry Level' },
                      { value: 'mid' as const, label: '2-5 Years' },
                      { value: 'senior' as const, label: '5+ Years' },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setExperienceLevel(opt.value)}
                        className={`p-2 border-2 font-heading text-xs transition-all ${
                          experienceLevel === opt.value
                            ? 'border-retro-red bg-red-50 text-retro-red'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-heading text-retro-navy mb-2">Urgency</label>
                  <div className="flex gap-3">
                    {([
                      { value: 'normal' as const, label: 'Normal' },
                      { value: 'urgent' as const, label: 'Urgent' },
                      { value: 'immediate' as const, label: 'Immediate' },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setUrgency(opt.value)}
                        className={`px-4 py-2 border-2 font-heading text-sm transition-all ${
                          urgency === opt.value
                            ? opt.value === 'immediate'
                              ? 'border-red-600 bg-red-600 text-white'
                              : opt.value === 'urgent'
                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                : 'border-retro-red bg-red-50 text-retro-red'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generate Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={!jobTitle.trim() || generateMutation.isPending}
                className="flex-1 px-8 py-4 bg-retro-red text-white border-2 border-black font-heading text-lg shadow-retro hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generateMutation.isPending ? (
                  <><Loader size={20} className="inline animate-spin mr-2" /> Generating...</>
                ) : (
                  <><Briefcase size={20} className="inline mr-2" /> Create Hiring Flyer</>
                )}
              </button>
              <button
                onClick={() => {
                  setStep('generating');
                  instantMutation.mutate();
                }}
                disabled={instantMutation.isPending}
                className="px-6 py-4 bg-retro-cream text-retro-navy border-2 border-black font-heading text-sm shadow-retro hover:bg-retro-mustard disabled:opacity-50 transition-colors"
                title="One-click: ASE Technician, full-time, competitive pay"
              >
                <Zap size={18} className="inline mr-1" /> Instant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATING STATE */}
      {step === 'generating' && (
        <div className="border-4 border-black bg-white p-8 shadow-retro text-center">
          <div className="animate-spin-slow w-16 h-16 border-4 border-retro-red border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-heading text-retro-navy mb-2">
            Creating Your Hiring Flyer...
          </h2>
          <p className="text-gray-600">
            Generating a professional "NOW HIRING" flyer
            {jobTitle && <> for <span className="font-heading">"{jobTitle}"</span></>}
          </p>
        </div>
      )}

      {/* RESULT STATE */}
      {step === 'result' && result && (
        <div className="space-y-6">
          <div className="border-4 border-black bg-white p-8 shadow-retro">
            <h2 className="text-xl font-heading text-retro-navy mb-4">
              Your Hiring Flyer is Ready!
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Preview */}
              <div className="aspect-[4/5] overflow-hidden border-2 border-gray-200 rounded-lg">
                <img
                  src={result.imageUrl}
                  alt={result.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details + Actions */}
              <div className="space-y-4">
                <div>
                  <p className="font-heading text-sm text-gray-500 mb-1">Position</p>
                  <p className="text-lg font-heading text-retro-navy">{result.jobTitle}</p>
                </div>
                <div>
                  <p className="font-heading text-sm text-gray-500 mb-1">Type</p>
                  <p className="text-sm capitalize">{result.jobType.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="font-heading text-sm text-gray-500 mb-1">Theme</p>
                  <p className="text-sm">{result.themeName}</p>
                </div>

                {/* Caption */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-heading text-sm text-gray-500">Social Caption</p>
                    <button
                      onClick={handleCopyCaption}
                      className="text-xs text-retro-red hover:underline flex items-center gap-1"
                    >
                      {captionCopied ? <Check size={12} /> : <Share2 size={12} />}
                      {captionCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 bg-retro-cream p-3 border border-gray-200 rounded max-h-32 overflow-y-auto">
                    {result.caption}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleDownload}
                    className="w-full px-6 py-3 bg-retro-navy text-white border-2 border-black font-heading shadow-retro hover:bg-blue-900 transition-colors"
                  >
                    <Download size={18} className="inline mr-2" /> Download Flyer
                  </button>
                  <button
                    onClick={() => { setStep('form'); setResult(null); }}
                    className="w-full px-6 py-3 bg-retro-cream text-retro-navy border-2 border-black font-heading shadow-retro hover:bg-retro-mustard transition-colors"
                  >
                    <RefreshCw size={18} className="inline mr-2" /> Make Another
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="w-full px-6 py-3 bg-white text-gray-600 border-2 border-gray-300 font-heading hover:border-black transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {showHistory && (
        <div className="mt-8 border-4 border-black bg-white p-6 shadow-retro">
          <h2 className="text-lg font-heading text-retro-navy mb-4">Past Hiring Flyers</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No hiring flyers generated yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors group"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="font-heading text-xs truncate">{item.jobTitle || item.title}</p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Delete this flyer?')) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      className="mt-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
