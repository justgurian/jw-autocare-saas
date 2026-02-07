import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '../../services/api';
import {
  X,
  Share2,
  Download,
  Facebook,
  Instagram,
  Calendar,
  Send,
  Clock,
  CheckCircle,
  Loader2,
  Link2,
  Copy,
  Check,
  Smartphone,
  Construction,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import FocusTrap from '../garage/FocusTrap';
import { useFileDownload } from '../../hooks/useFileDownload';
import { useClipboard } from '../../hooks/useClipboard';
import type { SocialAccount } from '../../types/content';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    title?: string;
    imageUrl?: string;
    caption?: string;
  };
}

export default function ShareModal({ isOpen, onClose, content }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'share' | 'download'>('share');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [caption, setCaption] = useState(content.caption || '');
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const queryClient = useQueryClient();
  const downloadFile = useFileDownload();
  const [copied, handleCopyCaption] = useClipboard('Caption copied!');

  // Fetch connected accounts
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => socialApi.getAccounts().then((res) => res.data),
    enabled: isOpen,
  });

  // Post now mutation
  const postMutation = useMutation({
    mutationFn: () =>
      socialApi.postNow({
        contentId: content.id,
        accountIds: selectedAccounts,
        caption,
      }),
    onSuccess: (res) => {
      const results = res.data.results;
      const successCount = results.filter((r: any) => r.success).length;
      const failCount = results.filter((r: any) => !r.success).length;

      if (successCount > 0) {
        toast.success(`Posted to ${successCount} account(s)!`);
      }
      if (failCount > 0) {
        toast.error(`Failed to post to ${failCount} account(s)`);
      }

      queryClient.invalidateQueries({ queryKey: ['content'] });
      onClose();
    },
    onError: () => {
      toast.error('Failed to post content');
    },
  });

  // Schedule mutation
  const scheduleMutation = useMutation({
    mutationFn: () => {
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      return socialApi.schedulePost({
        contentId: content.id,
        accountIds: selectedAccounts,
        caption,
        scheduledFor,
      });
    },
    onSuccess: () => {
      toast.success('Posts scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['social-scheduled'] });
      onClose();
    },
    onError: () => {
      toast.error('Failed to schedule posts');
    },
  });

  // Handle download
  const handleDownload = () => {
    downloadFile(content.id, content.title || content.id);
  };

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  const accounts: SocialAccount[] = accountsData?.accounts || [];
  const hasAccounts = accounts.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <FocusTrap>
      <div className="bg-white border-4 border-black shadow-retro-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black bg-gray-50">
          <h2 id="share-modal-title" className="font-heading text-lg uppercase flex items-center gap-2">
            <Share2 size={20} />
            Share Content
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            {content.imageUrl && (
              <img
                src={content.imageUrl}
                alt={content.title}
                className="w-24 h-24 object-cover border-2 border-gray-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{content.title || 'Untitled Content'}</p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {content.caption?.substring(0, 100)}
                {(content.caption?.length || 0) > 100 ? '...' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-black">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-3 font-heading text-sm uppercase ${
              activeTab === 'share' ? 'bg-retro-navy text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Share to Social
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-3 font-heading text-sm uppercase ${
              activeTab === 'download' ? 'bg-retro-navy text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Download
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'share' ? (
            <div className="space-y-4">
              {/* Coming Soon message for direct social posting */}
              <div className="bg-retro-mustard/20 border-2 border-retro-mustard p-4 flex items-start gap-3">
                <Construction size={18} className="text-retro-mustard mt-0.5 shrink-0" />
                <div>
                  <p className="font-heading text-xs uppercase text-retro-navy">Direct posting coming soon</p>
                  <p className="text-sm text-gray-700 mt-1">
                    For now, download your content and share it directly to any platform.
                  </p>
                </div>
              </div>

              {/* Native Share (Web Share API) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && content.imageUrl && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(content.imageUrl!);
                      const blob = await response.blob();
                      const file = new File([blob], `${content.title || 'bayfiller-content'}.png`, { type: blob.type });
                      await navigator.share({
                        title: content.title || 'Check this out!',
                        text: caption || content.caption || '',
                        files: [file],
                      });
                    } catch (err: any) {
                      if (err?.name !== 'AbortError') {
                        // Fallback: share without file
                        try {
                          await navigator.share({
                            title: content.title || 'Check this out!',
                            text: caption || content.caption || '',
                          });
                        } catch {
                          // User cancelled
                        }
                      }
                    }
                  }}
                  className="w-full p-4 border-2 border-retro-teal bg-retro-teal/5 hover:bg-retro-teal/10 transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-retro-teal text-white flex items-center justify-center rounded-full">
                    <Smartphone size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Share via Phone</p>
                    <p className="text-sm text-gray-500">iMessage, WhatsApp, Facebook, Instagram & more</p>
                  </div>
                </button>
              )}

              {/* Download as fallback for social sharing */}
              <button
                onClick={handleDownload}
                className="w-full p-4 border-2 border-gray-200 hover:border-black transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-retro-navy text-white flex items-center justify-center">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium">Download & Share Manually</p>
                  <p className="text-sm text-gray-500">Save image, then post to any platform</p>
                </div>
              </button>

              {/* Caption for easy copy */}
              <div>
                <label className="block font-heading text-sm uppercase mb-2">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="input-retro w-full h-24 resize-none"
                  maxLength={2200}
                  placeholder="Write your caption..."
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{caption.length}/2200</span>
                  <button
                    onClick={() => handleCopyCaption(caption)}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Native Share (Web Share API) - also in download tab */}
              {typeof navigator !== 'undefined' && 'share' in navigator && content.imageUrl && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(content.imageUrl!);
                      const blob = await response.blob();
                      const file = new File([blob], `${content.title || 'bayfiller-content'}.png`, { type: blob.type });
                      await navigator.share({
                        title: content.title || 'Check this out!',
                        text: caption || content.caption || '',
                        files: [file],
                      });
                    } catch (err: any) {
                      if (err?.name !== 'AbortError') {
                        try {
                          await navigator.share({
                            title: content.title || 'Check this out!',
                            text: caption || content.caption || '',
                          });
                        } catch {
                          // User cancelled
                        }
                      }
                    }
                  }}
                  className="w-full p-4 border-2 border-retro-teal bg-retro-teal/5 hover:bg-retro-teal/10 transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-retro-teal text-white flex items-center justify-center rounded-full">
                    <Smartphone size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Share via Phone</p>
                    <p className="text-sm text-gray-500">iMessage, WhatsApp, Facebook & more</p>
                  </div>
                </button>
              )}

              <button
                onClick={handleDownload}
                className="w-full p-4 border-2 border-gray-200 hover:border-black transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-retro-teal text-white flex items-center justify-center">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium">Download Image</p>
                  <p className="text-sm text-gray-500">Save as PNG file</p>
                </div>
              </button>

              <button
                onClick={() => handleCopyCaption(caption)}
                className="w-full p-4 border-2 border-gray-200 hover:border-black transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-retro-mustard text-white flex items-center justify-center">
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </div>
                <div className="text-left">
                  <p className="font-medium">Copy Caption</p>
                  <p className="text-sm text-gray-500">Copy caption to clipboard</p>
                </div>
              </button>

              {content.imageUrl && (
                <a
                  href={content.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-4 border-2 border-gray-200 hover:border-black transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-retro-navy text-white flex items-center justify-center">
                    <Link2 size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Open Image URL</p>
                    <p className="text-sm text-gray-500">View full-size image</p>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      </FocusTrap>
    </div>
  );
}
