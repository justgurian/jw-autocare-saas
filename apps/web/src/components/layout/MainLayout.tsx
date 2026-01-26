import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
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
} from 'lucide-react';
import { useState } from 'react';

// Grouped navigation with plain English names and helpful descriptions
const navigationGroups = [
  {
    id: 'quick-post',
    name: 'Quick Post',
    icon: Zap,
    description: 'Create social media content in seconds',
    items: [
      {
        name: 'Make Sale Posts',
        href: '/tools/batch-flyer',
        icon: Image,
        description: 'Generate 1-30 eye-catching flyers in minutes',
      },
      {
        name: 'Funny Meme',
        href: '/tools/meme-generator',
        icon: Laugh,
        description: 'Relatable car memes your customers will share',
      },
      {
        name: 'Feature a Car',
        href: '/tools/car-of-day',
        icon: Star,
        description: 'Show off customer cars and build community',
      },
      {
        name: 'Make a Video',
        href: '/tools/video-creator',
        icon: Video,
        description: 'Short videos that grab attention on social media',
      },
      {
        name: 'Week of Posts',
        href: '/tools/instant-pack',
        icon: Package,
        description: 'Generate a whole week of content at once',
      },
    ],
  },
  {
    id: 'customers',
    name: 'Talk to Customers',
    icon: Users,
    description: 'Keep customers coming back',
    items: [
      {
        name: 'Reply to Reviews',
        href: '/tools/review-reply',
        icon: MessageSquare,
        description: 'Professional responses that win customers back',
      },
      {
        name: 'Text Customers',
        href: '/tools/sms-templates',
        icon: Smartphone,
        description: 'Reminders and promos that bring people in',
      },
      {
        name: 'Explain Repairs',
        href: '/tools/jargon',
        icon: BookOpen,
        description: 'Turn mechanic-speak into words customers understand',
      },
    ],
  },
  {
    id: 'grow',
    name: 'Grow Your Shop',
    icon: TrendingUp,
    description: 'Long-term marketing that brings new customers',
    items: [
      {
        name: 'Write a Blog Post',
        href: '/tools/blog-generator',
        icon: FileText,
        description: 'Help Google find your shop (takes 2 min)',
      },
      {
        name: 'Run a Campaign',
        href: '/tools/campaigns',
        icon: Rocket,
        description: 'Multi-week marketing pushes for big results',
      },
      {
        name: 'Marketing Calendar',
        href: '/calendar',
        icon: Calendar,
        description: 'See your posting schedule at a glance',
      },
      {
        name: 'See What Works',
        href: '/analytics',
        icon: BarChart3,
        description: 'Track which posts bring in customers',
      },
    ],
  },
  {
    id: 'settings',
    name: 'My Shop',
    icon: Settings,
    description: 'Your shop info and settings',
    items: [
      {
        name: 'Shop Profile',
        href: '/settings/profile',
        icon: Settings,
        description: 'Your logo, colors, and contact info',
      },
      {
        name: 'Social Accounts',
        href: '/settings/social',
        icon: Share2,
        description: 'Connect Facebook, Instagram, etc.',
      },
      {
        name: 'Auto-Pilot',
        href: '/settings/auto-pilot',
        icon: Rocket,
        description: 'Set it and forget it - AI posts for you',
      },
      {
        name: 'Staff Cards',
        href: '/tools/business-cards',
        icon: CreditCard,
        description: 'Professional cards for your team',
      },
      {
        name: 'Fix Photos',
        href: '/tools/photo-tuner',
        icon: Camera,
        description: 'Make your shop photos look professional',
      },
      {
        name: 'Edit Images',
        href: '/tools/image-editor',
        icon: Wrench,
        description: 'Crop, filter, and adjust any image',
      },
    ],
  },
];

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['quick-post', 'customers']);
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

  return (
    <div className="min-h-screen bg-retro-cream">
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-retro-navy text-white border-2 border-black shadow-retro rounded-lg"
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
        <div className="h-full bg-retro-navy text-white border-r-4 border-black flex flex-col overflow-hidden">
          {/* Logo */}
          <div className="p-5 border-b-4 border-black bg-retro-navy">
            <Link to="/dashboard" className="block">
              <h1 className="font-display text-2xl tracking-wider">JW AUTO CARE</h1>
              <p className="font-script text-retro-mustard text-sm">AI Marketing Made Easy</p>
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
              className={`block w-full p-4 text-center transition-all border-4 ${
                location.pathname === '/tools/check-in'
                  ? 'bg-retro-mustard border-yellow-300 text-retro-navy'
                  : 'bg-gradient-to-r from-retro-mustard to-yellow-400 border-yellow-500 text-retro-navy hover:scale-105'
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

          {/* Navigation Groups */}
          <nav className="flex-1 overflow-y-auto py-2">
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
                      <div key={item.href} className="relative">
                        <Link
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          onMouseEnter={() => setShowTooltip(item.href)}
                          onMouseLeave={() => setShowTooltip(null)}
                          className={`flex items-center gap-3 px-5 py-3 pl-12 transition-all ${
                            isItemActive(item.href)
                              ? 'bg-retro-red text-white border-l-4 border-retro-mustard'
                              : 'hover:bg-white/10 border-l-4 border-transparent'
                          }`}
                        >
                          <item.icon size={18} />
                          <span className="text-sm">{item.name}</span>
                          <HelpCircle
                            size={14}
                            className="ml-auto text-gray-500 hover:text-white opacity-0 group-hover:opacity-100"
                          />
                        </Link>

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

          {/* User info & logout */}
          <div className="p-4 border-t-4 border-black bg-black/20">
            <div className="mb-3">
              <p className="font-heading text-sm truncate">{user?.tenant.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-retro-red hover:bg-red-700 transition-colors rounded text-sm font-medium"
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
