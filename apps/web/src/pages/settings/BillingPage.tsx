import { useState, useEffect } from 'react';
import { Crown, Check, Loader2, BarChart3, ExternalLink, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingApi } from '../../services/api';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/28EaEQaS2aXM7UZ6SffnO01';

const PLAN_FEATURES = [
  '2,000 images/month',
  'Up to 30 batch size',
  'All content tools',
  'Video generation (50/month)',
  'Jingle generator',
  'Priority support',
];

function usageBarColor(pct: number) {
  if (pct > 90) return 'bg-red-500';
  if (pct > 75) return 'bg-yellow-500';
  return 'bg-green-500';
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subRes, usageRes] = await Promise.all([
        billingApi.getSubscription(),
        billingApi.getUsage(),
      ]);
      setSubscription(subRes.data);
      setUsage(usageRes.data?.usage || usageRes.data);
    } catch (error) {
      console.error('Failed to load billing data:', error);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = subscription?.status === 'active';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-retro-red mx-auto mb-4" />
          <p className="font-heading text-retro-navy">Loading Billing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-retro">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">
          Manage your plan and view usage
        </p>
      </div>

      {/* Plan Card */}
      <div className="max-w-md mx-auto">
        <div className={`card-retro flex flex-col ${hasActiveSubscription ? 'border-retro-red ring-2 ring-retro-red/20' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-retro-mustard" />
            <h3 className="font-heading text-xl uppercase">Bayfiller AI</h3>
          </div>
          <p className="text-3xl font-bold text-retro-navy mb-4">
            $2,000<span className="text-base font-normal text-gray-500">/mo</span>
          </p>
          <ul className="space-y-2 mb-6 flex-1">
            {PLAN_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          {hasActiveSubscription ? (
            <div className="w-full py-3 px-4 border-2 border-green-300 bg-green-50 text-green-800 font-heading uppercase text-sm text-center">
              Active Subscription
            </div>
          ) : (
            <a
              href={STRIPE_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-retro-primary w-full flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Subscribe Now
            </a>
          )}
        </div>
      </div>

      {/* Usage This Month */}
      <div className="card-retro">
        <h2 className="font-heading text-lg uppercase flex items-center gap-2 mb-4">
          <BarChart3 size={20} />
          Usage This Month
        </h2>
        {usage ? (
          <div className="space-y-4">
            {/* Images */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Images</span>
                {usage.images?.limit > 0 ? (
                  <span className="text-gray-500">
                    {usage.images.used} / {usage.images.limit}
                  </span>
                ) : (
                  <span className="text-gray-400">Not available on current plan</span>
                )}
              </div>
              {usage.images?.limit > 0 && (
                <div className="w-full bg-gray-200 h-3 border border-black">
                  <div
                    className={`h-full transition-all ${usageBarColor(Math.round((usage.images.used / usage.images.limit) * 100))}`}
                    style={{ width: `${Math.min(100, Math.round((usage.images.used / usage.images.limit) * 100))}%` }}
                  />
                </div>
              )}
            </div>
            {/* Videos */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Videos</span>
                {usage.videos?.limit > 0 ? (
                  <span className="text-gray-500">
                    {usage.videos.used} / {usage.videos.limit}
                  </span>
                ) : (
                  <span className="text-gray-400">Not available on current plan</span>
                )}
              </div>
              {usage.videos?.limit > 0 && (
                <div className="w-full bg-gray-200 h-3 border border-black">
                  <div
                    className={`h-full transition-all ${usageBarColor(Math.round((usage.videos.used / usage.videos.limit) * 100))}`}
                    style={{ width: `${Math.min(100, Math.round((usage.videos.used / usage.videos.limit) * 100))}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="w-5 h-5" />
            <span>Usage data unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
}
