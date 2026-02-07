import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../../services/api';
import { Download, Share2, Image as ImageIcon, Video, Search, X } from 'lucide-react';
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

const TOOL_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'flyers', label: 'Flyers', tools: ['promo_flyer', 'batch_flyer', 'hiring_flyer', 'style_sampler'] },
  { id: 'videos', label: 'Videos', tools: ['video_creator', 'ugc_creator', 'directors_cut', 'celebration'] },
  { id: 'memes', label: 'Memes', tools: ['meme_generator', 'car_of_day'] },
  { id: 'writing', label: 'Writing', tools: ['blog_generator', 'sms_template', 'review_reply', 'jargon'] },
  { id: 'photos', label: 'Photos', tools: ['shop_photographer', 'photo_tuner', 'image_editor', 'style_cloner', 'business_cards'] },
];

type SortOrder = 'newest' | 'oldest';

export default function ContentGalleryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['content-gallery'],
    queryFn: () => contentApi.getAll().then((res) => res.data),
  });

  const [videoModalFlyerId, setVideoModalFlyerId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const contents: ContentItem[] = data?.content || data?.items || data || [];
  const videoModalItem = contents.find((c) => c.id === videoModalFlyerId);

  // Filter, search, and sort
  const filteredContents = useMemo(() => {
    let result = [...contents];

    // Filter by tool category
    if (activeFilter !== 'all') {
      const filter = TOOL_FILTERS.find((f) => f.id === activeFilter);
      if (filter && filter.tools) {
        const tools = filter.tools;
        result = result.filter((item) => tools.includes(item.tool));
      }
    }

    // Search by title
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          (item.title || '').toLowerCase().includes(query) ||
          (item.themeName || '').toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [contents, activeFilter, searchQuery, sortOrder]);

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
    <div className="space-y-6">
      <div>
        <h1 className="heading-retro">Content Gallery</h1>
        <p className="text-gray-600 mt-2">
          {filteredContents.length === contents.length
            ? `${contents.length} items`
            : `Showing ${filteredContents.length} of ${contents.length} items`}
        </p>
      </div>

      {/* Search + Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your content..."
            className="input-retro pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="select-retro w-full sm:w-48"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {TOOL_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 text-xs font-heading uppercase tracking-wide border-2 border-black transition-all ${
              activeFilter === filter.id
                ? 'bg-retro-red text-white shadow-retro-sm'
                : 'bg-white text-retro-navy hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {filteredContents.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredContents.map((item) => (
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
      ) : (
        <div className="card-retro border-2 border-black text-center py-12">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-heading text-lg text-retro-navy mb-2">No results found</p>
          <p className="text-gray-500 text-sm">
            {searchQuery
              ? `No content matching "${searchQuery}"${activeFilter !== 'all' ? ` in ${TOOL_FILTERS.find(f => f.id === activeFilter)?.label}` : ''}`
              : `No content in ${TOOL_FILTERS.find(f => f.id === activeFilter)?.label || 'this category'}`}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
            className="btn-retro-secondary inline-block mt-4 text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

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
