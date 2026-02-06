import { Link } from 'react-router-dom';
import {
  Zap,
  Sun,
  Snowflake,
  Leaf,
  CloudRain,
  Calendar,
  Bell,
  MessageSquare,
  Clock,
  Target,
  ArrowRight,
} from 'lucide-react';

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

export default function SmartSuggestions() {
  const suggestions = getSmartSuggestions();

  return (
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
  );
}
