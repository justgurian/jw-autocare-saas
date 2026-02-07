import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useFavoritesStore } from '../../stores/favorites.store';
import {
  Home,
  Image,
  Package,
  Rocket,
  Calendar,
  BarChart3,
  Settings,
  Share2,
  LogOut,
  Menu,
  X,
  Laugh,
  Trophy,
  Star,
  Video,
  MessageSquare,
  Wrench,
  BookOpen,
  Smartphone,
  FileText,
  CreditCard,
  Camera,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Film,
  Clapperboard,
  PartyPopper,
  Palette,
  Wand2,
  Music,
  Pin,
  PinOff,
  FolderOpen,
  Briefcase,
  Search,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import ThemeToggle from '../features/ThemeToggle';
import { useTourStore } from '../../stores/tour.store';

// All navigation items (flat list for favorites lookup + dashboard recently used)
export const allNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Your command center' },
  { name: 'My Creations', href: '/content', icon: FolderOpen, description: 'Browse your generated content' },
  { name: 'Nostalgic Flyers', href: '/tools/promo-flyer', icon: Image, description: '48 retro themes' },
  { name: 'Batch Generator', href: '/tools/batch-flyer', icon: Image, description: 'Multiple flyers at once' },
  { name: 'Style Sampler', href: '/tools/style-sampler', icon: Palette, description: 'Compare all 10 style families' },
  { name: 'Now Hiring', href: '/tools/hiring-flyer', icon: Briefcase, description: 'Professional hiring flyers' },
  { name: 'Funny Meme', href: '/tools/meme-generator', icon: Laugh, description: 'Shareable car memes' },
  { name: 'Feature a Car', href: '/tools/car-of-day', icon: Star, description: 'Customer car showcase' },
  { name: 'Shop Photographer', href: '/tools/shop-photographer', icon: Camera, description: 'Professional shop photos' },
  { name: 'Staff Cards', href: '/tools/business-cards', icon: CreditCard, description: 'Team business cards' },
  { name: 'Make a Video', href: '/tools/video-creator', icon: Video, description: 'Quick promotional videos' },
  { name: 'UGC Creator', href: '/tools/ugc-creator', icon: Film, description: 'Character-based video skits' },
  { name: "Director's Cut", href: '/tools/directors-cut', icon: Clapperboard, description: 'Animate your flyers' },
  { name: 'Celebrations', href: '/tools/celebration', icon: PartyPopper, description: 'Birthday & milestone videos' },
  { name: 'Jingle Generator', href: '/tools/jingle-generator', icon: Music, description: 'AI-generated jingles' },
  { name: 'Reply to Reviews', href: '/tools/review-reply', icon: MessageSquare, description: 'Win customers back' },
  { name: 'Text Customers', href: '/tools/sms-templates', icon: Smartphone, description: 'Service reminders' },
  { name: 'Explain Repairs', href: '/tools/jargon', icon: BookOpen, description: 'Customer-friendly explanations' },
  { name: 'Write a Blog Post', href: '/tools/blog-generator', icon: FileText, description: 'SEO content for Google' },
  { name: 'Run a Campaign', href: '/tools/campaigns', icon: Rocket, description: 'Multi-week marketing pushes' },
  { name: 'Week of Posts', href: '/tools/instant-pack', icon: Package, description: '7 days of content' },
  { name: 'Marketing Calendar', href: '/calendar', icon: Calendar, description: 'Posting schedule' },
  { name: 'See What Works', href: '/analytics', icon: BarChart3, description: 'Track performance' },
  { name: 'Auto-Pilot', href: '/settings/auto-pilot', icon: Rocket, description: 'AI posts for you' },
  { name: 'Fix Photos', href: '/tools/photo-tuner', icon: Camera, description: 'Professional photo enhancement' },
  { name: 'Edit Images', href: '/tools/image-editor', icon: Wrench, description: 'Crop, filter, adjust' },
  { name: 'Style Cloner', href: '/tools/style-cloner', icon: Wand2, description: 'Clone any art style' },
  { name: 'Mascot Builder', href: '/tools/mascot-builder', icon: Palette, description: 'Custom characters' },
  { name: 'Check In & Win', href: '/tools/check-in', icon: Trophy, description: 'Customer photo experience' },
  { name: 'Shop Profile', href: '/settings/profile', icon: Settings, description: 'Logo, colors, contact info' },
  { name: 'Services & Specials', href: '/settings/services', icon: Wrench, description: 'Manage offerings' },
  { name: 'Social Accounts', href: '/settings/social', icon: Share2, description: 'Connect platforms' },
  { name: 'Billing', href: '/settings/billing', icon: CreditCard, description: 'Subscription and payment' },
];

// 8 clean navigation groups
const navigationGroups = [
  {
    id: 'home',
    name: 'Home',
    icon: Home,
    description: 'Dashboard and content',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Your command center' },
      { name: 'My Creations', href: '/content', icon: FolderOpen, description: 'Browse your generated content' },
    ],
  },
  {
    id: 'flyers',
    name: 'Flyers & Images',
    icon: Image,
    description: 'Marketing graphics',
    items: [
      { name: 'Nostalgic Flyers', href: '/tools/promo-flyer', icon: Image, description: '48 retro themes' },
      { name: 'Batch Generator', href: '/tools/batch-flyer', icon: Image, description: 'Multiple flyers at once' },
      { name: 'Style Sampler', href: '/tools/style-sampler', icon: Palette, description: 'Compare all 10 style families' },
      { name: 'Now Hiring', href: '/tools/hiring-flyer', icon: Briefcase, description: 'Professional hiring flyers' },
      { name: 'Funny Meme', href: '/tools/meme-generator', icon: Laugh, description: 'Shareable car memes' },
      { name: 'Feature a Car', href: '/tools/car-of-day', icon: Star, description: 'Customer car showcase' },
      { name: 'Shop Photographer', href: '/tools/shop-photographer', icon: Camera, description: 'Professional shop photos' },
      { name: 'Staff Cards', href: '/tools/business-cards', icon: CreditCard, description: 'Team business cards' },
    ],
  },
  {
    id: 'video',
    name: 'Video & Audio',
    icon: Video,
    description: 'Video content and jingles',
    items: [
      { name: 'Make a Video', href: '/tools/video-creator', icon: Video, description: 'Quick promotional videos' },
      { name: 'UGC Creator', href: '/tools/ugc-creator', icon: Film, description: 'Character-based video skits' },
      { name: "Director's Cut", href: '/tools/directors-cut', icon: Clapperboard, description: 'Animate your flyers' },
      { name: 'Celebrations', href: '/tools/celebration', icon: PartyPopper, description: 'Birthday & milestone videos' },
      { name: 'Jingle Generator', href: '/tools/jingle-generator', icon: Music, description: 'AI-generated jingles' },
    ],
  },
  {
    id: 'writing',
    name: 'Writing & Outreach',
    icon: FileText,
    description: 'Text, reviews, and blogs',
    items: [
      { name: 'Reply to Reviews', href: '/tools/review-reply', icon: MessageSquare, description: 'Win customers back' },
      { name: 'Text Customers', href: '/tools/sms-templates', icon: Smartphone, description: 'Service reminders' },
      { name: 'Explain Repairs', href: '/tools/jargon', icon: BookOpen, description: 'Customer-friendly explanations' },
      { name: 'Write a Blog Post', href: '/tools/blog-generator', icon: FileText, description: 'SEO content for Google' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: TrendingUp,
    description: 'Campaigns and analytics',
    items: [
      { name: 'Run a Campaign', href: '/tools/campaigns', icon: Rocket, description: 'Multi-week marketing pushes' },
      { name: 'Week of Posts', href: '/tools/instant-pack', icon: Package, description: '7 days of content' },
      { name: 'Marketing Calendar', href: '/calendar', icon: Calendar, description: 'Posting schedule' },
      { name: 'See What Works', href: '/analytics', icon: BarChart3, description: 'Track performance' },
      { name: 'Auto-Pilot', href: '/settings/auto-pilot', icon: Rocket, description: 'AI posts for you' },
    ],
  },
  {
    id: 'utilities',
    name: 'Edit & Utilities',
    icon: Wrench,
    description: 'Photo tools and style',
    items: [
      { name: 'Fix Photos', href: '/tools/photo-tuner', icon: Camera, description: 'Professional photo enhancement' },
      { name: 'Edit Images', href: '/tools/image-editor', icon: Wrench, description: 'Crop, filter, adjust' },
      { name: 'Style Cloner', href: '/tools/style-cloner', icon: Wand2, description: 'Clone any art style' },
      { name: 'Mascot Builder', href: '/tools/mascot-builder', icon: Palette, description: 'Custom characters' },
    ],
  },
  {
    id: 'instore',
    name: 'In-Store',
    icon: Trophy,
    description: 'On-site customer experiences',
    items: [
      { name: 'Check In & Win', href: '/tools/check-in', icon: Trophy, description: 'Customer photo experience' },
    ],
  },
  {
    id: 'settings',
    name: 'My Shop',
    icon: Settings,
    description: 'Profile and billing',
    items: [
      { name: 'Shop Profile', href: '/settings/profile', icon: Settings, description: 'Logo, colors, contact info' },
      { name: 'Services & Specials', href: '/settings/services', icon: Wrench, description: 'Manage offerings' },
      { name: 'Social Accounts', href: '/settings/social', icon: Share2, description: 'Connect platforms' },
      { name: 'Billing', href: '/settings/billing', icon: CreditCard, description: 'Subscription and payment' },
    ],
  },
];

const SIDEBAR_GROUPS_KEY = 'bayfiller-sidebar-groups';
const DEFAULT_EXPANDED = ['home', 'flyers'];

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_GROUPS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_EXPANDED;
    } catch {
      return DEFAULT_EXPANDED;
    }
  });

  // Persist expanded groups
  useEffect(() => {
    localStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  // Sidebar search
  const [sidebarSearch, setSidebarSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered search results (flat list)
  const searchResults = useMemo(() => {
    if (!sidebarSearch.trim()) return [];
    const query = sidebarSearch.toLowerCase();
    return allNavItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [sidebarSearch]);

  // "New" badge: shows on tools user hasn't visited yet
  const { hasVisitedTool, markToolVisited, addRecentTool } = useTourStore();
  const isNewTool = (href: string) => !hasVisitedTool(href);

  const handleNavClick = (href: string) => {
    setSidebarOpen(false);
    markToolVisited(href);
    addRecentTool(href);
    setSidebarSearch('');
  };

  const handleLogout = async () => {
    await logout();
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const isItemActive = (href: string) => location.pathname === href;
  const isGroupActive = (items: typeof navigationGroups[0]['items']) =>
    items.some((item) => location.pathname === item.href);

  // Resolve favorite items from flat list
  const favoriteItems = favorites
    .map((href) => allNavItems.find((item) => item.href === href))
    .filter(Boolean) as typeof allNavItems;

  return (
    <div className="min-h-screen bg-retro-cream">
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-retro-navy text-white border border-black shadow-retro rounded-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full bg-retro-navy text-white border-r border-black/20 flex flex-col overflow-hidden">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/dashboard" className="block">
              <img
                src="/bayfiller-logo.png"
                alt="Bayfiller"
                className="w-full max-w-[220px] h-auto mx-auto"
              />
              <p className="font-heading text-white text-base text-center -mt-16 uppercase tracking-wide">We Keep Your Bays Full</p>
            </Link>
          </div>

          {/* Sidebar Search */}
          <div className="px-4 pt-3 pb-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Find a tool... (⌘K)"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm pl-9 pr-3 py-2 focus:outline-none focus:border-retro-mustard transition-colors"
              />
              {sidebarSearch && (
                <button
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav data-tour="sidebar-nav" className="flex-1 overflow-y-auto py-2">
            {/* Search Results (flat list) */}
            {sidebarSearch.trim() ? (
              <div className="py-1">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`flex items-center gap-3 px-5 py-2.5 transition-all ${
                        isItemActive(item.href)
                          ? 'bg-retro-red text-white'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <item.icon size={16} className="shrink-0 text-retro-mustard" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm block leading-tight">{item.name}</span>
                        <p className="text-[10px] text-gray-500 leading-tight truncate">{item.description}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-5 py-6 text-center">
                    <p className="text-sm text-gray-400">No tools matching "{sidebarSearch}"</p>
                  </div>
                )}
              </div>
            ) : (
            <>
            {/* Favorites Section */}
            {favoriteItems.length > 0 && (
              <div className="mb-1">
                <div className="px-5 py-2 flex items-center gap-2">
                  <Pin size={14} className="text-retro-mustard" />
                  <span className="font-heading text-xs uppercase tracking-wider text-retro-mustard">
                    Favorites
                  </span>
                </div>
                <div className="py-1">
                  {favoriteItems.map((item) => (
                    <div key={item.href} className="group relative flex items-center">
                      <Link
                        to={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`flex-1 flex items-center gap-3 px-5 py-2 pl-10 transition-all ${
                          isItemActive(item.href)
                            ? 'bg-retro-red text-white border-l-4 border-retro-mustard'
                            : 'hover:bg-white/10 border-l-4 border-transparent'
                        }`}
                      >
                        <item.icon size={16} />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                      <button
                        onClick={() => removeFavorite(item.href)}
                        className="px-2 py-1 mr-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity"
                        title="Remove from favorites"
                      >
                        <PinOff size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mx-5 border-b border-white/10 mb-1" />
              </div>
            )}

            {/* Navigation Groups */}
            {navigationGroups.map((group) => (
              <div key={group.id} className="mb-0.5">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-5 py-2.5 text-left transition-all ${
                    isGroupActive(group.items) ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <group.icon size={18} className="text-retro-mustard" />
                    <div>
                      <span className="font-heading text-xs uppercase tracking-wide">
                        {group.name}
                      </span>
                      <p className="text-[10px] text-gray-500 font-normal normal-case leading-tight">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </button>

                {/* Group Items */}
                {expandedGroups.includes(group.id) && (
                  <div className="bg-black/20 py-0.5">
                    {group.items.map((item) => (
                      <div key={item.href} className="group relative flex items-center">
                        <Link
                          to={item.href}
                          onClick={() => handleNavClick(item.href)}
                          className={`flex-1 flex items-center gap-3 px-5 py-2 pl-11 transition-all ${
                            isItemActive(item.href)
                              ? 'bg-retro-red text-white border-l-4 border-retro-mustard'
                              : 'hover:bg-white/10 border-l-4 border-transparent'
                          }`}
                        >
                          <item.icon size={16} className="shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="text-sm block leading-tight">{item.name}</span>
                            <p className="text-[10px] text-gray-500 leading-tight truncate">{item.description}</p>
                          </div>
                          {isNewTool(item.href) && (
                            <span className="ml-auto shrink-0 px-1.5 py-0.5 text-[9px] font-bold bg-retro-red text-white rounded-full uppercase">
                              New
                            </span>
                          )}
                        </Link>

                        {/* Pin/unpin button */}
                        <button
                          onClick={() =>
                            isFavorite(item.href)
                              ? removeFavorite(item.href)
                              : addFavorite(item.href)
                          }
                          className={`px-2 py-1 mr-2 transition-opacity shrink-0 ${
                            isFavorite(item.href)
                              ? 'text-retro-mustard opacity-100'
                              : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white'
                          }`}
                          title={isFavorite(item.href) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {isFavorite(item.href) ? <PinOff size={14} /> : <Pin size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            </>
            )}
          </nav>

          {/* User info, theme toggle & logout */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="mb-3">
              <p className="font-heading text-sm truncate">{user?.tenant.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="mb-3">
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-retro-red hover:bg-red-700 transition-colors rounded-lg text-sm font-medium"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
