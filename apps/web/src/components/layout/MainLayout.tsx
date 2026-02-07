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
  Zap,
  Users,
  TrendingUp,
  HelpCircle,
  Film,
  Clapperboard,
  PartyPopper,
  Palette,
  Wand2,
  Music,
  Pin,
  PinOff,
} from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '../features/ThemeToggle';

// All navigation items (flat list for favorites lookup)
const allNavItems = [
  { name: 'Nostalgic Flyers', href: '/tools/promo-flyer', icon: Image, description: '48 retro themes: Comics, Movies, Magazines (1950s-1980s)' },
  { name: 'Batch Generator', href: '/tools/batch-flyer', icon: Image, description: 'Generate multiple flyers at once' },
  { name: 'Funny Meme', href: '/tools/meme-generator', icon: Laugh, description: 'Relatable car memes your customers will share' },
  { name: 'Feature a Car', href: '/tools/car-of-day', icon: Star, description: 'Show off customer cars and build community' },
  { name: 'Week of Posts', href: '/tools/instant-pack', icon: Package, description: 'Generate a whole week of content at once' },
  { name: 'Shop Photographer', href: '/tools/shop-photographer', icon: Camera, description: 'Professional photos without a photographer' },
  { name: 'Make a Video', href: '/tools/video-creator', icon: Video, description: 'Quick promotional videos' },
  { name: 'UGC Creator', href: '/tools/ugc-creator', icon: Film, description: 'Character-based video skits' },
  { name: "Director's Cut", href: '/tools/directors-cut', icon: Clapperboard, description: 'Animate your flyers' },
  { name: 'Celebrations', href: '/tools/celebration', icon: PartyPopper, description: 'Birthday & milestone videos' },
  { name: 'Mascot Builder', href: '/tools/mascot-builder', icon: Palette, description: 'Create custom characters' },
  { name: 'Jingle Generator', href: '/tools/jingle-generator', icon: Music, description: 'AI-generated song jingles' },
  { name: 'Reply to Reviews', href: '/tools/review-reply', icon: MessageSquare, description: 'Professional responses that win customers back' },
  { name: 'Text Customers', href: '/tools/sms-templates', icon: Smartphone, description: 'Reminders and promos that bring people in' },
  { name: 'Explain Repairs', href: '/tools/jargon', icon: BookOpen, description: 'Turn mechanic-speak into words customers understand' },
  { name: 'Write a Blog Post', href: '/tools/blog-generator', icon: FileText, description: 'Help Google find your shop (takes 2 min)' },
  { name: 'Run a Campaign', href: '/tools/campaigns', icon: Rocket, description: 'Multi-week marketing pushes for big results' },
  { name: 'Marketing Calendar', href: '/calendar', icon: Calendar, description: 'See your posting schedule at a glance' },
  { name: 'See What Works', href: '/analytics', icon: BarChart3, description: 'Track which posts bring in customers' },
  { name: 'Shop Profile', href: '/settings/profile', icon: Settings, description: 'Your logo, colors, and contact info' },
  { name: 'Services & Specials', href: '/settings/services', icon: Wrench, description: 'Manage your services, repairs, and specials' },
  { name: 'Social Accounts', href: '/settings/social', icon: Share2, description: 'Connect Facebook, Instagram, etc.' },
  { name: 'Auto-Pilot', href: '/settings/auto-pilot', icon: Rocket, description: 'Set it and forget it - AI posts for you' },
  { name: 'Billing', href: '/settings/billing', icon: CreditCard, description: 'Subscription and payment' },
  { name: 'Staff Cards', href: '/tools/business-cards', icon: CreditCard, description: 'Professional cards for your team' },
  { name: 'Fix Photos', href: '/tools/photo-tuner', icon: Camera, description: 'Make your shop photos look professional' },
  { name: 'Edit Images', href: '/tools/image-editor', icon: Wrench, description: 'Crop, filter, and adjust any image' },
  { name: 'Style Cloner', href: '/tools/style-cloner', icon: Wand2, description: 'Clone any art style into a theme' },
];

// Grouped navigation — consolidated from 5 groups to 3
const navigationGroups = [
  {
    id: 'create',
    name: 'Create',
    icon: Zap,
    description: 'Images, videos, and content',
    items: [
      { name: 'Nostalgic Flyers', href: '/tools/promo-flyer', icon: Image, description: '48 retro themes: Comics, Movies, Magazines (1950s-1980s)' },
      { name: 'Batch Generator', href: '/tools/batch-flyer', icon: Image, description: 'Generate multiple flyers at once' },
      { name: 'Funny Meme', href: '/tools/meme-generator', icon: Laugh, description: 'Relatable car memes your customers will share' },
      { name: 'Feature a Car', href: '/tools/car-of-day', icon: Star, description: 'Show off customer cars and build community' },
      { name: 'Week of Posts', href: '/tools/instant-pack', icon: Package, description: 'Generate a whole week of content at once' },
      { name: 'Shop Photographer', href: '/tools/shop-photographer', icon: Camera, description: 'Professional photos without a photographer' },
      { name: 'Make a Video', href: '/tools/video-creator', icon: Video, description: 'Quick promotional videos' },
      { name: 'UGC Creator', href: '/tools/ugc-creator', icon: Film, description: 'Character-based video skits' },
      { name: "Director's Cut", href: '/tools/directors-cut', icon: Clapperboard, description: 'Animate your flyers' },
      { name: 'Celebrations', href: '/tools/celebration', icon: PartyPopper, description: 'Birthday & milestone videos' },
      { name: 'Mascot Builder', href: '/tools/mascot-builder', icon: Palette, description: 'Create custom characters' },
      { name: 'Jingle Generator', href: '/tools/jingle-generator', icon: Music, description: 'AI-generated song jingles' },
    ],
  },
  {
    id: 'engage',
    name: 'Engage',
    icon: Users,
    description: 'Customers, marketing, and growth',
    items: [
      { name: 'Reply to Reviews', href: '/tools/review-reply', icon: MessageSquare, description: 'Professional responses that win customers back' },
      { name: 'Text Customers', href: '/tools/sms-templates', icon: Smartphone, description: 'Reminders and promos that bring people in' },
      { name: 'Explain Repairs', href: '/tools/jargon', icon: BookOpen, description: 'Turn mechanic-speak into words customers understand' },
      { name: 'Write a Blog Post', href: '/tools/blog-generator', icon: FileText, description: 'Help Google find your shop (takes 2 min)' },
      { name: 'Run a Campaign', href: '/tools/campaigns', icon: Rocket, description: 'Multi-week marketing pushes for big results' },
      { name: 'Marketing Calendar', href: '/calendar', icon: Calendar, description: 'See your posting schedule at a glance' },
      { name: 'See What Works', href: '/analytics', icon: BarChart3, description: 'Track which posts bring in customers' },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'Shop info and account',
    items: [
      { name: 'Shop Profile', href: '/settings/profile', icon: Settings, description: 'Your logo, colors, and contact info' },
      { name: 'Services & Specials', href: '/settings/services', icon: Wrench, description: 'Manage your services, repairs, and specials' },
      { name: 'Social Accounts', href: '/settings/social', icon: Share2, description: 'Connect Facebook, Instagram, etc.' },
      { name: 'Auto-Pilot', href: '/settings/auto-pilot', icon: Rocket, description: 'Set it and forget it - AI posts for you' },
      { name: 'Billing', href: '/settings/billing', icon: CreditCard, description: 'Subscription and payment' },
      { name: 'Staff Cards', href: '/tools/business-cards', icon: CreditCard, description: 'Professional cards for your team' },
      { name: 'Fix Photos', href: '/tools/photo-tuner', icon: Camera, description: 'Make your shop photos look professional' },
      { name: 'Edit Images', href: '/tools/image-editor', icon: Wrench, description: 'Crop, filter, and adjust any image' },
      { name: 'Style Cloner', href: '/tools/style-cloner', icon: Wand2, description: 'Clone any art style into a theme' },
    ],
  },
];

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['create']);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

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

          {/* Dashboard Link */}
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-5 py-4 font-heading text-lg transition-all border-b border-white/10 ${
              location.pathname === '/dashboard'
                ? 'bg-retro-red text-white'
                : 'hover:bg-white/10'
            }`}
          >
            <Home size={24} />
            <span>Home</span>
          </Link>

          {/* CHECK IN AND WIN - Special Featured Button */}
          <div className="p-4 border-b border-white/10">
            <Link
              to="/tools/check-in"
              onClick={() => setSidebarOpen(false)}
              className={`block w-full p-4 text-center transition-all rounded-lg border-2 ${
                location.pathname === '/tools/check-in'
                  ? 'bg-retro-mustard border-yellow-300 text-retro-navy'
                  : 'bg-gradient-to-r from-retro-mustard to-yellow-400 border-yellow-500 text-retro-navy hover:scale-[1.02]'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Trophy size={28} className="animate-bounce" />
                <div className="text-left">
                  <span className="font-display text-lg block leading-tight">CHECK IN & WIN</span>
                  <span className="text-xs opacity-80">Customer photo experience</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
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
                        onClick={() => setSidebarOpen(false)}
                        className={`flex-1 flex items-center gap-3 px-5 py-2.5 pl-10 transition-all ${
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
              <div key={group.id} className="mb-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-left transition-all ${
                    isGroupActive(group.items) ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <group.icon size={20} className="text-retro-mustard" />
                    <div>
                      <span className="font-heading text-sm uppercase tracking-wide">
                        {group.name}
                      </span>
                      <p className="text-xs text-gray-400 font-normal normal-case">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown size={18} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </button>

                {/* Group Items */}
                {expandedGroups.includes(group.id) && (
                  <div className="bg-black/20 py-1">
                    {group.items.map((item) => (
                      <div key={item.href} className="group relative flex items-center">
                        <Link
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          onMouseEnter={() => setShowTooltip(item.href)}
                          onMouseLeave={() => setShowTooltip(null)}
                          className={`flex-1 flex items-center gap-3 px-5 py-2.5 pl-12 transition-all ${
                            isItemActive(item.href)
                              ? 'bg-retro-red text-white border-l-4 border-retro-mustard'
                              : 'hover:bg-white/10 border-l-4 border-transparent'
                          }`}
                        >
                          <item.icon size={18} />
                          <span className="text-sm">{item.name}</span>
                        </Link>

                        {/* Pin/unpin button */}
                        <button
                          onClick={() =>
                            isFavorite(item.href)
                              ? removeFavorite(item.href)
                              : addFavorite(item.href)
                          }
                          className={`px-2 py-1 mr-2 transition-opacity ${
                            isFavorite(item.href)
                              ? 'text-retro-mustard opacity-100'
                              : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white'
                          }`}
                          title={isFavorite(item.href) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {isFavorite(item.href) ? <PinOff size={14} /> : <Pin size={14} />}
                        </button>

                        {/* Tooltip */}
                        {showTooltip === item.href && (
                          <div className="absolute left-full top-0 ml-2 z-50 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700">
                            <p className="font-medium mb-1">{item.name}</p>
                            <p className="text-gray-300">{item.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
