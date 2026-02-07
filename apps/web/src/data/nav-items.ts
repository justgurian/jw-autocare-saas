/**
 * Navigation items and groups — extracted to avoid circular dependencies.
 * Imported by MainLayout (sidebar nav) and DashboardPage (recently used tools).
 */
import {
  Home,
  Image,
  Package,
  Rocket,
  Calendar,
  BarChart3,
  Settings,
  Share2,
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
  TrendingUp,
  Film,
  Clapperboard,
  PartyPopper,
  Palette,
  Wand2,
  Music,
  FolderOpen,
  Briefcase,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export interface NavigationGroup {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  items: NavItem[];
}

// All navigation items (flat list for favorites lookup + dashboard recently used)
export const allNavItems: NavItem[] = [
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
export const navigationGroups: NavigationGroup[] = [
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
