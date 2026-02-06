import {
  Trophy,
  Star,
  Calendar,
  MessageSquare,
} from 'lucide-react';

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

interface MarketingScoreCardProps {
  stats: { contentGenerated: number; postsScheduled: number; reviewsReplied: number };
}

export default function MarketingScoreCard({ stats }: MarketingScoreCardProps) {
  const marketingScore = calculateMarketingScore(stats);

  return (
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
  );
}
