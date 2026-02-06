import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contentApi } from '../../services/api';
import { Download, Share2, Edit3, Trash2, ArrowLeft, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface ContentDetail {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string;
  captionSpanish?: string;
  theme?: string;
  themeName?: string;
  tool: string;
  createdAt: string;
}

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['content-detail', id],
    queryFn: () => contentApi.getOne(id!).then((res) => res.data),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => contentApi.delete(id!),
    onSuccess: () => {
      toast.success('Content deleted');
      queryClient.invalidateQueries({ queryKey: ['content-gallery'] });
      navigate('/content');
    },
    onError: () => {
      toast.error('Failed to delete content');
    },
  });

  const content: ContentDetail | undefined = data?.content || data;

  const handleDownload = async () => {
    if (!id) return;
    try {
      const res = await contentApi.download(id, 'png');
      const url = typeof res.data === 'string' ? res.data : window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-${id}.png`;
      a.click();
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/content/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleCopyCaption = () => {
    if (content?.caption) {
      navigator.clipboard.writeText(content.caption);
      setCopied(true);
      toast.success('Caption copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        <div className="card-retro border-2 border-black animate-pulse">
          <div className="aspect-video bg-gray-200" />
          <div className="p-6 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="font-heading text-xl text-retro-navy mb-4">Content not found</p>
        <Link to="/content" className="btn-retro-primary">
          Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/content"
        className="inline-flex items-center gap-2 font-heading text-sm uppercase text-retro-navy hover:text-retro-red transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Gallery
      </Link>

      {/* Image */}
      <div className="card-retro border-2 border-black overflow-hidden">
        {content.imageUrl ? (
          <img
            src={content.imageUrl}
            alt={content.title || 'Content'}
            className="w-full max-h-[600px] object-contain bg-gray-50"
          />
        ) : (
          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400">No image available</p>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="card-retro border-2 border-black p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl uppercase">
              {content.title || 'Untitled'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {(content.themeName || content.theme) && (
                <span className="px-3 py-1 bg-retro-teal text-white text-xs font-heading uppercase border-2 border-black">
                  {content.themeName || content.theme}
                </span>
              )}
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-heading uppercase border-2 border-black">
                {content.tool?.replace('_', ' ') || 'Content'}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(content.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Caption */}
        {content.caption && (
          <div className="bg-gray-50 border-2 border-black p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-heading text-sm uppercase text-gray-500">Caption</p>
              <button
                onClick={handleCopyCaption}
                className="flex items-center gap-1 text-xs font-heading uppercase text-retro-teal hover:text-retro-navy transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-gray-700">{content.caption}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="btn-retro-primary flex items-center gap-2"
          >
            <Download size={18} />
            Download
          </button>
          <button
            onClick={handleShare}
            className="btn-retro-outline flex items-center gap-2"
          >
            <Share2 size={18} />
            Share
          </button>
          <Link
            to={`/tools/image-editor?contentId=${id}`}
            className="btn-retro-outline flex items-center gap-2"
          >
            <Edit3 size={18} />
            Edit Image
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="btn-retro-outline flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={18} />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
