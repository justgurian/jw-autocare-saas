import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  MessageSquare,
  Bell,
  Sparkles,
  TrendingUp,
  Sun,
  Snowflake,
  Leaf,
  CloudRain,
  Calendar,
  Trophy,
  Star,
  CheckCircle,
  ArrowRight,
  Clock,
  Target,
  Gift,
} from 'lucide-react';
import api, { promoFlyerApi } from '../../services/api';

// Smart AI suggestions based on day/season
function getSmartSuggestions(): Array<{
  title: string;
  description: string;
  action: string;
  href: string;
  icon: typeof Zap;
  priority: 'high' | 'medium' | 'low';
}> {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const month = now.getMonth();
  const hour = now.getHours();

  const suggestions: Array<{
    title: string;
    description: string;
    action: string;
    href: string;
    icon: typeof Zap;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Day-based suggestions
  if (dayOfWeek === 1) {
    // Monday
    suggestions.push({
      title: 'Monday Motivation',
      description: "Start the week strong! Post a motivational message or a special deal to kick off Monday.",
      action: 'Create Monday Post',
      href: '/tools/promo-flyer',
      icon: Sun,
      priority: 'high',
    });
  } else if (dayOfWeek === 5) {
    // Friday
    suggestions.push({
      title: 'Weekend Ready?',
      description: "Remind customers to get their car checked before the weekend!",
      action: 'Send Weekend Reminder',
      href: '/tools/sms-templates',
      icon: Bell,
      priority: 'high',
    });
  } else if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend
    suggestions.push({
      title: 'Plan Next Week',
      description: "Use the quiet time to schedule posts for the whole week ahead.",
      action: 'Plan My Week',
      href: '/tools/instant-pack',
      icon: Calendar,
      priority: 'medium',
    });
  }

  // Season-based suggestions
  if (month >= 11 || month <= 1) {
    // Winter
    suggestions.push({
      title: 'Winter Car Care',
      description: "Cold weather is here! Remind customers about battery checks, antifreeze, and winter tires.",
      action: 'Create Winter Post',
      href: '/tools/promo-flyer',
      icon: Snowflake,
      priority: 'high',
    });
  } else if (month >= 2 && month <= 4) {
    // Spring
    suggestions.push({
      title: 'Spring Tune-Up Time',
      description: "Perfect time to promote AC checks, alignment, and spring maintenance specials.",
      action: 'Create Spring Post',
      href: '/tools/promo-flyer',
      icon: Leaf,
      priority: 'high',
    });
  } else if (month >= 5 && month <= 7) {
    // Summer
    suggestions.push({
      title: 'Road Trip Season',
      description: "Vacation season! Push pre-trip inspections and AC services.",
      action: 'Create Summer Post',
      href: '/tools/promo-flyer',
      icon: Sun,
      priority: 'high',
    });
  } else {
    // Fall
    suggestions.push({
      title: 'Fall Prep Special',
      description: "Time for brake checks, heating system inspections, and winterizing.",
      action: 'Create Fall Post',
      href: '/tools/promo-flyer',
      icon: CloudRain,
      priority: 'medium',
    });
  }

  // Time-based suggestions
  if (hour >= 7 && hour <= 9) {
    suggestions.push({
      title: 'Good Morning Post',
      description: "Great time to post! People check social media in the morning.",
      action: 'Post Now',
      href: '/tools/promo-flyer',
      icon: Sun,
      priority: 'medium',
    });
  } else if (hour >= 12 && hour <= 13) {
    suggestions.push({
      title: 'Lunch Break Post',
      description: "People scroll during lunch - perfect time to reach them!",
      action: 'Post Now',
      href: '/tools/promo-flyer',
      icon: Clock,
      priority: 'medium',
    });
  }

  // Always suggest review replies
  suggestions.push({
    title: 'Check Your Reviews',
    description: "Responding to reviews builds trust and brings customers back.",
    action: 'Reply to Reviews',
    href: '/tools/review-reply',
    icon: MessageSquare,
    priority: 'low',
  });

  // Sort by priority and return top 3
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 3);
}

// Calculate marketing score
function calculateMarketingScore(stats: { contentGenerated: number; postsScheduled: number; reviewsReplied: number }): {
  score: number;
  level: string;
  nextLevel: string;
  pointsToNext: number;
} {
  const points = stats.contentGenerated * 10 + stats.postsScheduled * 15 + stats.reviewsReplied * 20;

  if (points >= 500) {
    return { score: points, level: 'Marketing Pro', nextLevel: 'Marketing Legend', pointsToNext: 1000 - points };
  } else if (points >= 200) {
    return { score: points, level: 'Rising Star', nextLevel: 'Marketing Pro', pointsToNext: 500 - points };
  } else if (points >= 50) {
    return { score: points, level: 'Getting Started', nextLevel: 'Rising Star', pointsToNext: 200 - points };
  } else {
    return { score: points, level: 'Newcomer', nextLevel: 'Getting Started', pointsToNext: 50 - points };
  }
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState({ contentGenerated: 0, postsScheduled: 0, reviewsReplied: 0 });
  const [recentContent, setRecentContent] = useState<Array<{ id: string; title: string; imageUrl: string }>>([]);

  const suggestions = getSmartSuggestions();
  const marketingScore = calculateMarketingScore(stats);

  useEffect(() => {
    // Fetch analytics overview
    api
      .get('/analytics/overview')
      .then((res) => {
        setStats({
          contentGenerated: res.data.contentGenerated || 0,
          postsScheduled: res.data.postsScheduled || 0,
          reviewsReplied: res.data.reviewsReplied || 0,
        });
      })
      .catch((err) => console.error('Failed to fetch stats:', err));

    // Fetch recent content
    api
      .get('/content', { params: { limit: 4 } })
      .then((res) => {
        setRecentContent(res.data.items || []);
      })
      .catch((err) => console.error('Failed to fetch content:', err));
  }, []);

  // Magic Button: One-tap instant post generation
  const handleInstantPost = async () => {
    setIsGenerating(true);
    try {
      const response = await promoFlyerApi.instant();
      if (response.data?.id) {
        navigate(`/tools/promo-flyer?preview=${response.data.id}`);
      }
    } catch (error) {
      console.error('Instant generation failed:', error);
      // Fallback to the tool page
      navigate('/tools/promo-flyer');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header - Simple and Friendly */}
      <div className="text-center pt-4">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-retro-navy">
          Hey, {user?.firstName || user?.tenant.name?.split(' ')[0] || 'Boss'}! 👋
        </h1>
        <p className="text-gray-600 mt-2 text-lg">What do you want to do today?</p>
      </div>

      {/* MAGIC BUTTONS - Big, Bold, One-Tap Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Post Something Now - THE PRIMARY ACTION */}
        <button
          onClick={handleInstantPost}
          disabled={isGenerating}
          className="col-span-1 md:col-span-3 group relative overflow-hidden bg-gradient-to-r from-retro-red to-red-600 text-white p-8 md:p-10 border-4 border-black shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
              {isGenerating ? (
                <div className="animate-spin">
                  <Sparkles size={40} />
                </div>
              ) : (
                <Zap size={40} className="group-hover:scale-110 transition-transform" />
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="font-display text-2xl md:text-4xl tracking-wide">
                {isGenerating ? 'CREATING YOUR POST...' : 'POST SOMETHING NOW'}
              </h2>
              <p className="text-white/80 text-lg mt-2">
                {isGenerating
                  ? 'AI is creating something awesome for you'
                  : 'One tap = ready-to-share social media post'}
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -right-5 -top-5 w-20 h-20 bg-white/5 rounded-full" />
        </button>

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

      {/* Marketing Score Gamification */}
      <div className="card-retro bg-gradient-to-br from-purple-900 to-indigo-900 text-white border-4 border-black">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10 flex items-center justify-center border-4 border-yellow-400">
              <div className="text-center">
                <Trophy size={32} className="mx-auto text-yellow-400 mb-1" />
                <p className="font-display text-3xl md:text-4xl">{marketingScore.score}</p>
                <p className="text-xs text-white/60 uppercase">Points</p>
              </div>
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 text-xs font-bold uppercase tracking-wide border-2 border-black whitespace-nowrap">
              {marketingScore.level}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-2xl md:text-3xl tracking-wide mb-2">YOUR MARKETING SCORE</h3>
            <p className="text-white/70 mb-4">
              Keep posting to level up! You need <span className="text-yellow-400 font-bold">{marketingScore.pointsToNext} more points</span> to
              reach {marketingScore.nextLevel}.
            </p>

            {/* Progress bar */}
            <div className="w-full bg-white/20 h-4 border-2 border-white/30 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-500"
                style={{
                  width: `${Math.min(100, (marketingScore.score / (marketingScore.score + marketingScore.pointsToNext)) * 100)}%`,
                }}
              />
            </div>

            {/* How to earn points */}
            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Star size={14} className="text-yellow-400" />
                <span>+10 per post</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Calendar size={14} className="text-yellow-400" />
                <span>+15 per scheduled</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MessageSquare size={14} className="text-yellow-400" />
                <span>+20 per review reply</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart AI Suggestions */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-retro-red text-white flex items-center justify-center border-2 border-black">
            <Target size={20} />
          </div>
          <h2 className="font-heading text-xl uppercase">AI Suggests For You</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((suggestion, index) => (
            <Link
              key={index}
              to={suggestion.href}
              className="card-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 flex items-center justify-center border-2 border-black ${
                    suggestion.priority === 'high'
                      ? 'bg-retro-red text-white'
                      : suggestion.priority === 'medium'
                        ? 'bg-retro-mustard text-retro-navy'
                        : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <suggestion.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-sm uppercase flex items-center gap-2">
                    {suggestion.title}
                    {suggestion.priority === 'high' && (
                      <span className="bg-retro-red text-white text-xs px-2 py-0.5">HOT</span>
                    )}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{suggestion.description}</p>
                  <p className="text-retro-red font-medium text-sm mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                    {suggestion.action}
                    <ArrowRight size={14} />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

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
            <Link to="/content" className="text-retro-red text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              See All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentContent.map((content) => (
              <Link
                key={content.id}
                to={`/content/${content.id}`}
                className="aspect-square bg-gray-100 border-2 border-black overflow-hidden hover:scale-105 transition-transform"
              >
                {content.imageUrl ? (
                  <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Gift size={32} />
                  </div>
                )}
              </Link>
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
