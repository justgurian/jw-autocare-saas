import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../../services/api';
import { Download, Share2, Image as ImageIcon, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import VideoFromFlyerModal from '../../components/features/VideoFromFlyerModal';

interface ContentItem {
  id: string;
  title: string;
  imageUrl: string;
  theme?: string;
  themeName?: string;
  tool: string;
  createdAt: string;
}

export default function ContentGalleryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['content-gallery'],
    queryFn: () => contentApi.getAll().then((res) => res.data),
  });

  const [videoModalFlyerId, setVideoModalFlyerId] = useState<string | null>(null);

  const contents: ContentItem[] = data?.content || data?.items || data || [];
  const videoModalItem = contents.find((c) => c.id === videoModalFlyerId);

  const handleDownload = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/content/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="heading-retro">Content Gallery</h1>
          <p className="text-gray-600 mt-2">All your generated content in one place</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="card-retro border-2 border-black animate-pulse"
            >
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!contents.length) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="heading-retro">Content Gallery</h1>
          <p className="text-gray-600 mt-2">All your generated content in one place</p>
        </div>
        <div className="card-retro border-2 border-black text-center py-16">
          <ImageIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="font-heading text-xl text-retro-navy mb-2">No content yet</p>
          <p className="text-gray-500">
            Hit the Easy Button to create your first!
          </p>
          <Link
            to="/tools/promo-flyer"
            className="btn-retro-primary inline-block mt-6"
          >
            Create Content
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-retro">Content Gallery</h1>
        <p className="text-gray-600 mt-2">
          All your generated content in one place ({contents.length} items)
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {contents.map((item) => (
          <Link
            key={item.id}
            to={`/content/${item.id}`}
            className="card-retro border-2 border-black hover:shadow-retro-lg transition-shadow overflow-hidden"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title || 'Content'}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                <ImageIcon size={48} className="text-gray-300" />
              </div>
            )}
            <div className="p-3">
              <p className="font-heading text-sm truncate">
                {item.title || 'Untitled'}
              </p>
              {(item.themeName || item.theme) && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-retro-teal text-white text-xs font-heading uppercase">
                  {item.themeName || item.theme}
                </span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-1 mt-3">
                <button
                  onClick={(e) => handleDownload(item.id, e)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 border-2 border-black text-xs font-heading uppercase hover:bg-retro-navy hover:text-white transition-colors"
                >
                  <Download size={14} />
                  Save
                </button>
                <button
                  onClick={(e) => handleShare(item.id, e)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 border-2 border-black text-xs font-heading uppercase hover:bg-retro-teal hover:text-white transition-colors"
                >
                  <Share2 size={14} />
                  Share
                </button>
                {item.tool !== 'video_creator' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setVideoModalFlyerId(item.id);
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 border-2 border-black text-xs font-heading uppercase hover:bg-retro-red hover:text-white transition-colors"
                    title="Turn into Video"
                  >
                    <Video size={14} />
                  </button>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Video From Flyer Modal */}
      {videoModalFlyerId && videoModalItem && (
        <VideoFromFlyerModal
          isOpen={!!videoModalFlyerId}
          onClose={() => setVideoModalFlyerId(null)}
          flyerId={videoModalFlyerId}
          flyerTitle={videoModalItem.title}
          flyerImageUrl={videoModalItem.imageUrl}
        />
      )}
    </div>
  );
}
