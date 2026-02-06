import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../services/api';
import { BarChart3, Clock, Zap, TrendingUp, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  // Fetch analytics data
  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.getOverview().then(res => res.data),
  });

  const { data: timeSaved } = useQuery({
    queryKey: ['analytics-time-saved'],
    queryFn: () => analyticsApi.getTimeSaved().then(res => res.data),
  });

  const { data: contentStats } = useQuery({
    queryKey: ['analytics-content-stats'],
    queryFn: () => analyticsApi.getContentStats().then(res => res.data),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="heading-retro">Command Center</h1>
          <p className="text-gray-600 mt-2">
            Your marketing performance at a glance
          </p>
        </div>

        <button onClick={() => toast('Export coming soon!')} className="btn-retro-outline flex items-center gap-2">
          <Download size={20} />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-retro">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-retro-red text-white flex items-center justify-center border-2 border-black">
              <Zap size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm uppercase">Total Content</p>
              <p className="font-display text-4xl">{overview?.overview?.totalContent || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-retro">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-retro-teal text-white flex items-center justify-center border-2 border-black">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm uppercase">This Month</p>
              <p className="font-display text-4xl">{overview?.overview?.contentThisMonth || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-retro">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-retro-mustard text-white flex items-center justify-center border-2 border-black">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm uppercase">Hours Saved</p>
              <p className="font-display text-4xl">{timeSaved?.totalHours || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-retro">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-retro-navy text-white flex items-center justify-center border-2 border-black">
              <BarChart3 size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm uppercase">Value Saved</p>
              <p className="font-display text-4xl">${timeSaved?.valueSaved || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Content by Tool */}
        <div className="card-retro">
          <h2 className="font-heading text-xl uppercase mb-6">Content by Tool</h2>
          <div className="space-y-4">
            {overview?.contentByTool?.map((item: { tool: string; count: number }) => (
              <div key={item.tool}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-heading uppercase">{item.tool.replace('_', ' ')}</span>
                  <span>{item.count}</span>
                </div>
                <div className="progress-retro h-4">
                  <div
                    className="progress-retro-fill"
                    style={{
                      width: `${Math.min(100, (item.count / (overview?.overview?.totalContent || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">
                No data yet. Generate some content to see stats!
              </p>
            )}
          </div>
        </div>

        {/* Time Saved Breakdown */}
        <div className="card-retro">
          <h2 className="font-heading text-xl uppercase mb-6">Time Saved Breakdown</h2>
          <div className="space-y-4">
            {timeSaved?.breakdown?.map((item: { tool: string; hoursSaved: number; count: number }) => (
              <div key={item.tool} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black">
                <div>
                  <p className="font-heading uppercase">{item.tool.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-500">{item.count} items</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-retro-teal">{item.hoursSaved}h</p>
                  <p className="text-sm text-gray-500">saved</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">
                No data yet. Start creating content!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Content */}
      <div className="card-retro">
        <h2 className="font-heading text-xl uppercase mb-6">Recent Activity</h2>
        {contentStats?.recentContent?.length > 0 ? (
          <div className="space-y-3">
            {contentStats.recentContent.map((item: { id: string; title: string; tool: string; theme: string; createdAt: string }) => (
              <div key={item.id} className="flex items-center justify-between p-4 border-2 border-black hover:bg-gray-50">
                <div>
                  <p className="font-heading">{item.title || 'Untitled'}</p>
                  <p className="text-sm text-gray-500">
                    {item.tool.replace('_', ' ')} • {item.theme}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No recent activity. Create your first content piece!
          </p>
        )}
      </div>
    </div>
  );
}
