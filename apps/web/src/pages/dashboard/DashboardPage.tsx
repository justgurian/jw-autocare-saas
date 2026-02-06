import { useAuthStore } from '../../stores/auth.store';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, contentApi } from '../../services/api';
import {
  MessageSquare,
  Bell,
  Calendar,
  CheckCircle,
  ArrowRight,
  Gift,
} from 'lucide-react';
import PushToStartButton from '../../components/features/PushToStartButton';
import EasyVideoButton from '../../components/features/EasyVideoButton';
import SmartSuggestions from './components/SmartSuggestions';
import MarketingScoreCard from './components/MarketingScoreCard';
import ThemeShowcase from './components/ThemeShowcase';
import WeeklyThemeDrop from '../../components/features/WeeklyThemeDrop';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.getOverview().then(res => res.data),
  });
  const { data: contentData } = useQuery({
    queryKey: ['recent-content'],
    queryFn: () => contentApi.getAll({ limit: 4 }).then(res => res.data),
  });

  const stats = {
    contentGenerated: overview?.contentGenerated || 0,
    postsScheduled: overview?.postsScheduled || 0,
    reviewsReplied: overview?.reviewsReplied || 0,
  };
  const recentContent: Array<{ id: string; title: string; imageUrl: string }> = contentData?.items || [];

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header - Simple and Friendly */}
      <div className="text-center pt-4">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-retro-navy">
          Hey, {user?.firstName || user?.tenant.name?.split(' ')[0] || 'Boss'}! 👋
        </h1>
        <p className="text-gray-600 mt-2 text-lg">What do you want to do today?</p>
      </div>

      {/* Weekly Style Drop Banner */}
      <WeeklyThemeDrop onTryStyle={() => navigate('/tools/promo-flyer')} />

      {/* MAGIC BUTTONS - Big, Bold, One-Tap Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* The Easy Button + Easy Video - Side by Side */}
        <div className="col-span-1 md:col-span-2 card-retro bg-gradient-to-br from-gray-50 to-gray-100">
          <PushToStartButton size="hero" />
        </div>
        <div className="col-span-1 card-retro bg-gradient-to-br from-gray-50 to-gray-100">
          <EasyVideoButton size="default" />
        </div>

        {/* Remind My Customers */}
        <Link
          to="/tools/sms-templates"
          className="group bg-retro-teal text-white p-6 md:p-8 border-4 border-black shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Bell size={28} className="group-hover:animate-bounce" />
            </div>
            <div>
              <h3 className="font-display text-xl md:text-2xl">REMIND CUSTOMERS</h3>
              <p className="text-white/70 text-sm mt-1">Send service reminders</p>
            </div>
          </div>
        </Link>

        {/* Reply to a Review */}
        <Link
          to="/tools/review-reply"
          className="group bg-retro-navy text-white p-6 md:p-8 border-4 border-black shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare size={28} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-display text-xl md:text-2xl">REPLY TO REVIEW</h3>
              <p className="text-white/70 text-sm mt-1">Win customers back</p>
            </div>
          </div>
        </Link>

        {/* Plan the Week */}
        <Link
          to="/tools/instant-pack"
          className="group bg-retro-mustard text-retro-navy p-6 md:p-8 border-4 border-black shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-black/10 rounded-full flex items-center justify-center">
              <Calendar size={28} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h3 className="font-display text-xl md:text-2xl">PLAN MY WEEK</h3>
              <p className="text-retro-navy/70 text-sm mt-1">Generate 7 days of posts</p>
            </div>
          </div>
        </Link>
      </div>

      {/* NOSTALGIC THEMES SHOWCASE - The Star Feature! */}
      <ThemeShowcase />

      {/* Marketing Score Gamification */}
      <MarketingScoreCard stats={stats} />

      {/* Smart AI Suggestions */}
      <SmartSuggestions />

      {/* Quick Stats - Simplified */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-retro text-center py-6">
          <p className="font-display text-3xl md:text-4xl text-retro-red">{stats.contentGenerated}</p>
          <p className="text-gray-500 text-sm uppercase mt-1">Posts Created</p>
        </div>
        <div className="card-retro text-center py-6">
          <p className="font-display text-3xl md:text-4xl text-retro-teal">{stats.postsScheduled}</p>
          <p className="text-gray-500 text-sm uppercase mt-1">Scheduled</p>
        </div>
        <div className="card-retro text-center py-6">
          <p className="font-display text-3xl md:text-4xl text-retro-mustard">{stats.reviewsReplied}</p>
          <p className="text-gray-500 text-sm uppercase mt-1">Reviews Replied</p>
        </div>
      </div>

      {/* Recent Creations */}
      {recentContent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl uppercase">Your Recent Posts</h2>
            <Link to="/tools/promo-flyer" className="text-retro-red text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              See All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentContent.map((content) => (
              <div
                key={content.id}
                className="aspect-square bg-gray-100 border-2 border-black overflow-hidden"
              >
                {content.imageUrl ? (
                  <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Gift size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State for New Users */}
      {recentContent.length === 0 && (
        <div className="card-retro bg-retro-cream text-center py-12">
          <div className="w-20 h-20 bg-retro-mint mx-auto flex items-center justify-center border-4 border-black mb-4">
            <Gift size={40} className="text-retro-navy" />
          </div>
          <h3 className="font-display text-2xl mb-2">Ready to Start?</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Hit the big red button above to create your first post. It only takes one tap!
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-retro-red">
            <CheckCircle size={18} />
            <span className="font-medium">No design skills needed</span>
          </div>
        </div>
      )}
    </div>
  );
}
