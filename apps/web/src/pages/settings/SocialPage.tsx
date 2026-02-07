import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { socialApi } from '../../services/api';
import {
  Link2,
  Facebook,
  Instagram,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Construction,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram';
  accountName: string;
  accountUsername?: string;
  accountAvatar?: string;
  pageName?: string;
  connectedAt: string;
}

const PLATFORM_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
};

const PLATFORM_COLORS = {
  facebook: 'bg-blue-600',
  instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500',
};

export default function SocialPage() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Show toast based on URL params (from OAuth callback)
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'connected') {
      toast.success('Social account connected successfully!');
      // Clear the URL params
      window.history.replaceState({}, '', '/settings/social');
    } else if (error) {
      toast.error(`Failed to connect account: ${error.replace(/_/g, ' ')}`);
      window.history.replaceState({}, '', '/settings/social');
    }
  }, [searchParams]);

  // Fetch connected accounts
  const { data, isLoading } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => socialApi.getAccounts().then((res) => res.data),
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: (accountId: string) => socialApi.disconnectAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast.success('Account disconnected');
    },
    onError: () => {
      toast.error('Failed to disconnect account');
    },
  });

  // Connect to Facebook/Instagram
  const handleConnect = async () => {
    try {
      const response = await socialApi.getAuthUrl('facebook');
      const { authUrl } = response.data;
      window.location.href = authUrl;
    } catch {
      toast.error('Failed to initiate connection');
    }
  };

  const accounts: SocialAccount[] = data?.accounts || [];
  const facebookAccounts = accounts.filter((a) => a.platform === 'facebook');
  const instagramAccounts = accounts.filter((a) => a.platform === 'instagram');

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="heading-retro flex items-center gap-3">
          <Link2 className="text-retro-teal" />
          Social Media Connections
        </h1>
        <p className="text-gray-600 mt-2">
          Connect your Facebook and Instagram accounts to share content directly from Bayfiller.
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-retro-mustard/20 border-2 border-retro-mustard p-4 flex items-start gap-3">
        <Construction size={20} className="text-retro-mustard mt-0.5 shrink-0" />
        <div>
          <p className="font-heading text-sm uppercase text-retro-navy">Social media connections are coming soon!</p>
          <p className="text-sm text-gray-700 mt-1">
            For now, download your content and share it directly.
          </p>
          <Link
            to="/content"
            className="inline-flex items-center gap-2 text-retro-red font-medium text-sm mt-2 hover:underline"
          >
            <Download size={14} />
            Go to Content Gallery
          </Link>
        </div>
      </div>

      {/* Connect Button (disabled) */}
      <div className="card-retro">
        <h2 className="font-heading text-lg uppercase mb-4">Connect New Account</h2>
        <p className="text-gray-600 text-sm mb-4">
          Click below to connect your Facebook Page and Instagram Business account.
          You'll be redirected to Facebook to authorize the connection.
        </p>
        <button
          disabled
          className="btn-retro-primary flex items-center gap-2 opacity-50 cursor-not-allowed"
        >
          <Facebook size={20} />
          Connect Facebook & Instagram
          <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">Coming Soon</span>
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Note: Instagram posting requires an Instagram Business account connected to a Facebook Page.
        </p>
      </div>

      {/* Connected Accounts */}
      {isLoading ? (
        <div className="card-retro text-center py-8">
          <Loader2 size={32} className="animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">Loading accounts...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="card-retro text-center py-12">
          <Link2 size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-heading text-lg uppercase mb-2">No Connected Accounts</h3>
          <p className="text-gray-600">
            Connect your Facebook Page to start sharing content directly to social media.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Facebook Accounts */}
          {facebookAccounts.length > 0 && (
            <div>
              <h3 className="font-heading text-sm uppercase mb-3 flex items-center gap-2">
                <Facebook size={16} className="text-blue-600" />
                Facebook Pages
              </h3>
              <div className="space-y-3">
                {facebookAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onDisconnect={() => disconnectMutation.mutate(account.id)}
                    isDisconnecting={disconnectMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Instagram Accounts */}
          {instagramAccounts.length > 0 && (
            <div>
              <h3 className="font-heading text-sm uppercase mb-3 flex items-center gap-2">
                <Instagram size={16} className="text-pink-500" />
                Instagram Accounts
              </h3>
              <div className="space-y-3">
                {instagramAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onDisconnect={() => disconnectMutation.mutate(account.id)}
                    isDisconnecting={disconnectMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="card-retro bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Connect your Facebook Page (required for Instagram too)</li>
              <li>Generate content using our AI tools</li>
              <li>Click "Share" on any content to post immediately or schedule</li>
              <li>View scheduled posts in the Calendar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountCard({
  account,
  onDisconnect,
  isDisconnecting,
}: {
  account: SocialAccount;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}) {
  const Icon = PLATFORM_ICONS[account.platform];

  return (
    <div className="flex items-center gap-4 p-4 border-2 border-gray-200 bg-white">
      {/* Avatar */}
      <div className={`w-12 h-12 ${PLATFORM_COLORS[account.platform]} rounded-full flex items-center justify-center text-white overflow-hidden`}>
        {account.accountAvatar ? (
          <img src={account.accountAvatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icon size={24} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{account.accountName || account.pageName}</p>
          <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
        </div>
        {account.accountUsername && (
          <p className="text-sm text-gray-500">@{account.accountUsername}</p>
        )}
        <p className="text-xs text-gray-400">
          Connected {new Date(account.connectedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <button
        onClick={onDisconnect}
        disabled={isDisconnecting}
        className="p-2 text-red-500 hover:bg-red-50 transition-colors"
        title="Disconnect"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
