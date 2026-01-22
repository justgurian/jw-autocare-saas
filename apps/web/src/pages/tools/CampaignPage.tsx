import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi, downloadApi } from '../../services/api';
import {
  Rocket,
  Sparkles,
  Calendar,
  Image,
  Check,
  Loader2,
  ChevronRight,
  Clock,
  Tag,
  Target,
  Users,
  Zap,
  Gift,
  Download,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import ShareModal from '../../components/features/ShareModal';

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  contentCount: number;
  beatMix: string[];
  suggestedThemes: string[];
}

interface RecentCampaign {
  id: string;
  name: string;
  template: string;
  status: string;
  contentCount: number;
  completedCount: number;
  preview: Array<{ id: string; title: string; imageUrl: string; thumbnailUrl: string }>;
  createdAt: string;
}

interface CampaignJob {
  id: string;
  status: string;
  progress?: {
    total: number;
    completed: number;
    failed: number;
    percentage: number;
  };
  content?: Array<{
    id: string;
    title: string;
    imageUrl: string;
    caption: string;
    theme: string;
  }>;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  seasonal_special: <Calendar size={24} />,
  service_spotlight: <Target size={24} />,
  flash_sale: <Zap size={24} />,
  community_engagement: <Users size={24} />,
  new_customer_welcome: <Gift size={24} />,
};

const TEMPLATE_COLORS: Record<string, string> = {
  seasonal_special: 'bg-retro-navy',
  service_spotlight: 'bg-retro-teal',
  flash_sale: 'bg-retro-red',
  community_engagement: 'bg-retro-mint',
  new_customer_welcome: 'bg-retro-mustard',
};

export default function CampaignPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [startDate, setStartDate] = useState('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<number | false>(false);
  const [shareContent, setShareContent] = useState<{ id: string; title?: string; imageUrl?: string; caption?: string } | null>(null);
  const queryClient = useQueryClient();

  // Download campaign as ZIP
  const handleDownloadCampaign = async (jobId: string, campaignName: string) => {
    try {
      toast.loading('Preparing download...', { id: 'download' });
      const response = await downloadApi.downloadCampaign(jobId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaignName.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!', { id: 'download' });
    } catch {
      toast.error('Failed to download', { id: 'download' });
    }
  };

  // Fetch templates
  const { data: templatesData } = useQuery({
    queryKey: ['campaign-templates'],
    queryFn: () => campaignApi.getTemplates().then((res) => res.data),
  });

  // Fetch recent campaigns
  const { data: recentData } = useQuery({
    queryKey: ['recent-campaigns'],
    queryFn: () => campaignApi.getRecent().then((res) => res.data),
  });

  // Poll for job status
  const { data: jobData } = useQuery<CampaignJob | null>({
    queryKey: ['campaign-job', activeJobId],
    queryFn: () => (activeJobId ? campaignApi.getJob(activeJobId).then((res) => res.data) : null),
    enabled: !!activeJobId,
    refetchInterval: pollInterval,
  });

  // Stop polling when job completes
  useEffect(() => {
    if (jobData?.status === 'completed' || jobData?.status === 'failed') {
      setPollInterval(false);
      if (jobData.status === 'completed') {
        toast.success('Campaign generated successfully!');
        queryClient.invalidateQueries({ queryKey: ['recent-campaigns'] });
      } else {
        toast.error('Campaign generation failed');
      }
    }
  }, [jobData?.status, queryClient]);

  // Launch campaign mutation
  const launchMutation = useMutation({
    mutationFn: (data: { templateId: string; topic: string; details?: string; startDate?: string }) =>
      campaignApi.launch(data),
    onSuccess: (res) => {
      setActiveJobId(res.data.jobId);
      setPollInterval(2000); // Poll every 2 seconds
      toast.success('Campaign generation started!');
      // Reset form
      setTopic('');
      setDetails('');
      setSelectedTemplate(null);
    },
    onError: () => {
      toast.error('Failed to launch campaign');
    },
  });

  const handleLaunch = () => {
    if (!selectedTemplate || !topic.trim()) {
      toast.error('Please select a template and enter a topic');
      return;
    }

    launchMutation.mutate({
      templateId: selectedTemplate.id,
      topic: topic.trim(),
      details: details.trim() || undefined,
      startDate: startDate || undefined,
    });
  };

  const templates: CampaignTemplate[] = templatesData?.templates || [];
  const recentCampaigns: RecentCampaign[] = recentData?.campaigns || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="heading-retro flex items-center gap-3">
          <Rocket className="text-retro-red" />
          One-Click Campaigns
        </h1>
        <p className="text-gray-600 mt-2">
          Launch coordinated marketing campaigns with a single click. Each campaign generates
          multiple content pieces scheduled across your calendar.
        </p>
      </div>

      {/* Active Job Progress */}
      {activeJobId && jobData && jobData.status === 'processing' && (
        <div className="card-retro bg-retro-navy/5 border-retro-navy">
          <div className="flex items-center gap-4">
            <Loader2 size={24} className="animate-spin text-retro-navy" />
            <div className="flex-1">
              <h3 className="font-heading text-lg uppercase">Generating Campaign...</h3>
              <p className="text-sm text-gray-600">
                {jobData.progress?.completed || 0} of {jobData.progress?.total || 0} content pieces
              </p>
            </div>
            <div className="text-2xl font-display">{jobData.progress?.percentage || 0}%</div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 border border-black">
            <div
              className="h-full bg-retro-navy transition-all duration-500"
              style={{ width: `${jobData.progress?.percentage || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Template Selection */}
      <div>
        <h2 className="font-heading text-xl uppercase mb-4">Choose a Campaign Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`text-left p-4 border-2 transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-black bg-gray-50 shadow-retro'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 ${TEMPLATE_COLORS[template.id]} text-white flex items-center justify-center border-2 border-black`}
                >
                  {TEMPLATE_ICONS[template.id]}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-sm uppercase">{template.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 border border-gray-300">
                      {template.contentCount} pieces
                    </span>
                    <span className="text-xs text-gray-500">
                      {template.beatMix.join(' + ')}
                    </span>
                  </div>
                </div>
                {selectedTemplate?.id === template.id && (
                  <Check size={20} className="text-retro-teal" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Configuration */}
      {selectedTemplate && (
        <div className="card-retro">
          <h2 className="font-heading text-xl uppercase mb-4 flex items-center gap-2">
            <Sparkles className="text-retro-mustard" />
            Configure Your Campaign
          </h2>

          <div className="space-y-4">
            {/* Topic */}
            <div>
              <label className="block font-heading text-sm uppercase mb-2">
                Campaign Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Spring Brake Special, AC Service Promo, Back to School Safety"
                className="input-retro w-full"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be the main theme for all generated content
              </p>
            </div>

            {/* Details */}
            <div>
              <label className="block font-heading text-sm uppercase mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g., 20% off all brake services, valid through March 31st..."
                className="input-retro w-full h-24 resize-none"
                maxLength={500}
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block font-heading text-sm uppercase mb-2">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-retro"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Content will be scheduled starting from this date, spaced 2 days apart
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 border-2 border-gray-200">
              <h4 className="font-heading text-sm uppercase mb-2">Campaign Summary</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Tag size={14} className="text-gray-500" />
                  Template: <strong>{selectedTemplate.name}</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Image size={14} className="text-gray-500" />
                  Content pieces: <strong>{selectedTemplate.contentCount}</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500" />
                  Scheduled dates:{' '}
                  <strong>
                    {startDate
                      ? `Starting ${new Date(startDate).toLocaleDateString()}`
                      : 'Starting today'}
                  </strong>
                </li>
              </ul>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleLaunch}
              disabled={!topic.trim() || launchMutation.isPending}
              className="btn-retro-primary w-full flex items-center justify-center gap-2 py-4"
            >
              {launchMutation.isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Launching...
                </>
              ) : (
                <>
                  <Rocket size={20} />
                  Launch Campaign
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recent Campaigns */}
      {recentCampaigns.length > 0 && (
        <div>
          <h2 className="font-heading text-xl uppercase mb-4 flex items-center gap-2">
            <Clock className="text-gray-500" />
            Recent Campaigns
          </h2>
          <div className="space-y-3">
            {recentCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="card-retro flex flex-col md:flex-row md:items-center gap-4"
              >
                {/* Preview Images */}
                <div className="flex -space-x-3">
                  {campaign.preview.slice(0, 3).map((content, i) => (
                    <div
                      key={content.id}
                      className="w-16 h-16 border-2 border-black bg-gray-100 overflow-hidden"
                      style={{ zIndex: 3 - i }}
                    >
                      {content.thumbnailUrl || content.imageUrl ? (
                        <img
                          src={content.thumbnailUrl || content.imageUrl}
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image size={20} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Campaign Info */}
                <div className="flex-1">
                  <h3 className="font-heading text-sm uppercase">{campaign.name}</h3>
                  <p className="text-xs text-gray-500">
                    {campaign.completedCount} / {campaign.contentCount} pieces •{' '}
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status */}
                <div
                  className={`px-3 py-1 text-xs border-2 border-black ${
                    campaign.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : campaign.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {campaign.status}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {campaign.status === 'completed' && (
                    <button
                      onClick={() => handleDownloadCampaign(campaign.id, campaign.name)}
                      className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                      title="Download All"
                    >
                      <Download size={18} />
                    </button>
                  )}
                  <Link
                    to={`/content?campaign=${campaign.id}`}
                    className="flex items-center gap-1 text-sm text-retro-navy hover:underline"
                  >
                    View Content
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedTemplate && recentCampaigns.length === 0 && (
        <div className="card-retro text-center py-12">
          <Rocket size={48} className="mx-auto mb-4 text-retro-red opacity-50" />
          <h3 className="font-heading text-xl uppercase mb-2">Launch Your First Campaign</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Select a campaign template above to generate coordinated marketing content with AI.
            Each campaign creates multiple content pieces and schedules them to your calendar.
          </p>
        </div>
      )}

      {/* Share Modal */}
      {shareContent && (
        <ShareModal
          isOpen={!!shareContent}
          onClose={() => setShareContent(null)}
          content={shareContent}
        />
      )}
    </div>
  );
}
