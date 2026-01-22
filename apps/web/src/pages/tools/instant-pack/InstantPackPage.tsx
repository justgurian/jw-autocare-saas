import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { instantPackApi } from '../../../services/api';
import { Package, Zap, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface InstantPackJob {
  status: string;
  total: number;
  completed: number;
  failed: number;
  progress: number;
  content?: Array<{ id: string; imageUrl: string; title: string; theme: string }>;
}

export default function InstantPackPage() {
  const [count, setCount] = useState(5);
  const [jobId, setJobId] = useState<string | null>(null);

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: () => instantPackApi.generate({ count }),
    onSuccess: (res) => {
      setJobId(res.data.jobId);
      toast.success('Generation started!');
    },
    onError: () => {
      toast.error('Failed to start generation');
    },
  });

  // Poll job status
  const { data: jobData } = useQuery<InstantPackJob>({
    queryKey: ['instant-pack-job', jobId],
    queryFn: () => instantPackApi.getJob(jobId!).then(res => res.data),
    enabled: !!jobId,
    refetchInterval: (query) => {
      if (query.state.data?.status === 'completed' || query.state.data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="heading-retro">Instant Pack</h1>
        <p className="text-gray-600 mt-2">
          Generate multiple pieces of content with one click
        </p>
      </div>

      {!jobId ? (
        <div className="card-retro">
          <div className="text-center py-8">
            <Package size={64} className="mx-auto mb-4 text-retro-teal" />
            <h2 className="font-heading text-2xl uppercase mb-4">
              Easy Button Mode
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              AI will automatically pick varied themes and generate
              promotional content for your shop.
            </p>

            {/* Count selector */}
            <div className="mb-8">
              <label className="block font-heading uppercase text-sm mb-4">
                How many pieces?
              </label>
              <div className="flex justify-center gap-4">
                {[5, 10, 15, 20, 30].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCount(num)}
                    className={`w-16 h-16 border-2 border-black font-display text-2xl transition-all ${
                      count === num
                        ? 'bg-retro-red text-white'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="btn-retro-primary text-xl px-12 py-4 flex items-center gap-3 mx-auto"
            >
              <Zap size={24} />
              {generateMutation.isPending ? 'Starting...' : 'Generate Pack'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card-retro">
          <h2 className="font-heading text-xl uppercase mb-4">
            Generation Progress
          </h2>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>{jobData?.completed || 0} of {jobData?.total || count} completed</span>
              <span>{jobData?.progress || 0}%</span>
            </div>
            <div className="progress-retro">
              <div
                className="progress-retro-fill"
                style={{ width: `${jobData?.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <div className={`badge-retro ${
              jobData?.status === 'completed'
                ? 'bg-retro-teal text-white'
                : jobData?.status === 'failed'
                ? 'bg-retro-red text-white'
                : 'bg-retro-mustard text-black'
            }`}>
              {jobData?.status?.toUpperCase() || 'PROCESSING'}
            </div>
          </div>

          {/* Generated content grid */}
          {jobData?.content && jobData.content.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {jobData.content.map((item: { id: string; imageUrl: string; title: string; theme: string }) => (
                <div key={item.id} className="border-2 border-black">
                  <div className="aspect-[4/5] bg-gray-200">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 bg-white">
                    <p className="font-heading text-xs uppercase truncate">{item.theme}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {jobData?.status === 'completed' && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setJobId(null)}
                className="btn-retro-secondary flex items-center gap-2"
              >
                <Check size={20} />
                Generate More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
