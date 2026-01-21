import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Calendar,
  Clock,
  ToggleLeft,
  ToggleRight,
  Facebook,
  Instagram,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Settings,
  Sparkles,
  Target,
  Bell,
} from 'lucide-react';
import api from '../../services/api';

interface AutoPilotSettings {
  enabled: boolean;
  frequency: 'daily' | '3x-week' | 'weekly';
  postingTimes: string[];
  platforms: {
    facebook: boolean;
    instagram: boolean;
  };
  contentTypes: {
    promos: boolean;
    tips: boolean;
    memes: boolean;
    seasonal: boolean;
  };
  autoApprove: boolean;
}

const defaultSettings: AutoPilotSettings = {
  enabled: false,
  frequency: '3x-week',
  postingTimes: ['09:00', '12:00', '17:00'],
  platforms: {
    facebook: true,
    instagram: true,
  },
  contentTypes: {
    promos: true,
    tips: true,
    memes: true,
    seasonal: true,
  },
  autoApprove: false,
};

export default function AutoPilotPage() {
  const [settings, setSettings] = useState<AutoPilotSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);

  useEffect(() => {
    // Fetch current auto-pilot settings
    api
      .get('/settings/auto-pilot')
      .then((res) => {
        if (res.data) {
          setSettings({ ...defaultSettings, ...res.data });
        }
      })
      .catch((err) => console.error('Failed to fetch auto-pilot settings:', err));

    // Fetch connected social accounts
    api
      .get('/social/accounts')
      .then((res) => {
        setConnectedAccounts(res.data?.map((a: { platform: string }) => a.platform) || []);
      })
      .catch((err) => console.error('Failed to fetch social accounts:', err));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.put('/settings/auto-pilot', settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save auto-pilot settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEnabled = () => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateFrequency = (frequency: AutoPilotSettings['frequency']) => {
    setSettings((prev) => ({ ...prev, frequency }));
  };

  const togglePlatform = (platform: 'facebook' | 'instagram') => {
    setSettings((prev) => ({
      ...prev,
      platforms: { ...prev.platforms, [platform]: !prev.platforms[platform] },
    }));
  };

  const toggleContentType = (type: keyof AutoPilotSettings['contentTypes']) => {
    setSettings((prev) => ({
      ...prev,
      contentTypes: { ...prev.contentTypes, [type]: !prev.contentTypes[type] },
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="w-10 h-10 bg-gray-200 flex items-center justify-center border-2 border-black hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide flex items-center gap-3">
            <Zap className="text-retro-mustard" size={28} />
            AUTO-PILOT MODE
          </h1>
          <p className="text-gray-600 mt-1">Set it and forget it! AI posts for you automatically.</p>
        </div>
      </div>

      {/* Main Toggle */}
      <div
        className={`card-retro border-4 ${settings.enabled ? 'border-green-500 bg-green-50' : 'border-black'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                settings.enabled
                  ? 'bg-green-500 border-green-600 text-white'
                  : 'bg-gray-200 border-gray-300 text-gray-500'
              }`}
            >
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl">
                {settings.enabled ? 'AUTO-PILOT IS ON' : 'AUTO-PILOT IS OFF'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {settings.enabled
                  ? 'AI is creating and posting content for you!'
                  : 'Turn on to let AI handle your social media'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleEnabled}
            className={`p-2 transition-colors ${settings.enabled ? 'text-green-600' : 'text-gray-400'}`}
          >
            {settings.enabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
          </button>
        </div>

        {settings.enabled && (
          <div className="mt-6 pt-6 border-t border-green-200 flex items-center gap-3 text-green-700">
            <CheckCircle size={20} />
            <span className="font-medium">Next post scheduled for tomorrow at 9:00 AM</span>
          </div>
        )}
      </div>

      {/* Configuration Sections */}
      <div className={`space-y-6 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Posting Frequency */}
        <div className="card-retro">
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={24} className="text-retro-navy" />
            <h3 className="font-heading text-lg uppercase">How Often Should AI Post?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'daily', label: 'Every Day', desc: '7 posts per week' },
              { value: '3x-week', label: '3 Times a Week', desc: 'Mon, Wed, Fri' },
              { value: 'weekly', label: 'Once a Week', desc: 'Every Monday' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateFrequency(option.value as AutoPilotSettings['frequency'])}
                className={`p-4 border-2 text-left transition-all ${
                  settings.frequency === option.value
                    ? 'border-retro-red bg-retro-red/10'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <p className="font-heading text-sm uppercase">{option.label}</p>
                <p className="text-gray-500 text-xs mt-1">{option.desc}</p>
                {settings.frequency === option.value && (
                  <CheckCircle size={16} className="text-retro-red mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Posting Times */}
        <div className="card-retro">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={24} className="text-retro-navy" />
            <h3 className="font-heading text-lg uppercase">Best Times to Post</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            AI will pick the best time from these options based on when your audience is most active.
          </p>

          <div className="flex flex-wrap gap-3">
            {['07:00', '09:00', '12:00', '15:00', '17:00', '19:00'].map((time) => {
              const isSelected = settings.postingTimes.includes(time);
              const hour = parseInt(time.split(':')[0]);
              const displayTime =
                hour === 0
                  ? '12:00 AM'
                  : hour < 12
                    ? `${hour}:00 AM`
                    : hour === 12
                      ? '12:00 PM'
                      : `${hour - 12}:00 PM`;

              return (
                <button
                  key={time}
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      postingTimes: isSelected
                        ? prev.postingTimes.filter((t) => t !== time)
                        : [...prev.postingTimes, time],
                    }));
                  }}
                  className={`px-4 py-2 border-2 font-medium transition-all ${
                    isSelected
                      ? 'border-retro-teal bg-retro-teal text-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {displayTime}
                </button>
              );
            })}
          </div>
        </div>

        {/* Where to Post */}
        <div className="card-retro">
          <div className="flex items-center gap-3 mb-4">
            <Target size={24} className="text-retro-navy" />
            <h3 className="font-heading text-lg uppercase">Where Should AI Post?</h3>
          </div>

          {connectedAccounts.length === 0 ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">No social accounts connected</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Connect your Facebook or Instagram to enable auto-posting.
                </p>
                <Link
                  to="/settings/social"
                  className="inline-flex items-center gap-2 text-retro-red font-medium text-sm mt-2 hover:underline"
                >
                  <Settings size={14} />
                  Connect Accounts
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => togglePlatform('facebook')}
                disabled={!connectedAccounts.includes('facebook')}
                className={`w-full flex items-center justify-between p-4 border-2 transition-all ${
                  settings.platforms.facebook && connectedAccounts.includes('facebook')
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                } ${!connectedAccounts.includes('facebook') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Facebook size={24} className="text-blue-600" />
                  <span className="font-medium">Facebook</span>
                  {!connectedAccounts.includes('facebook') && (
                    <span className="text-xs text-gray-500">(Not connected)</span>
                  )}
                </div>
                {settings.platforms.facebook && connectedAccounts.includes('facebook') && (
                  <CheckCircle size={20} className="text-blue-600" />
                )}
              </button>

              <button
                onClick={() => togglePlatform('instagram')}
                disabled={!connectedAccounts.includes('instagram')}
                className={`w-full flex items-center justify-between p-4 border-2 transition-all ${
                  settings.platforms.instagram && connectedAccounts.includes('instagram')
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200'
                } ${!connectedAccounts.includes('instagram') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Instagram size={24} className="text-pink-600" />
                  <span className="font-medium">Instagram</span>
                  {!connectedAccounts.includes('instagram') && (
                    <span className="text-xs text-gray-500">(Not connected)</span>
                  )}
                </div>
                {settings.platforms.instagram && connectedAccounts.includes('instagram') && (
                  <CheckCircle size={20} className="text-pink-600" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Content Types */}
        <div className="card-retro">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={24} className="text-retro-navy" />
            <h3 className="font-heading text-lg uppercase">What Kind of Posts?</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Select which types of content AI should create for you.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'promos', label: 'Sale Posts', desc: 'Promote your services' },
              { key: 'tips', label: 'Car Tips', desc: 'Helpful advice' },
              { key: 'memes', label: 'Funny Memes', desc: 'Shareable humor' },
              { key: 'seasonal', label: 'Seasonal', desc: 'Holiday & weather posts' },
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => toggleContentType(type.key as keyof AutoPilotSettings['contentTypes'])}
                className={`p-4 border-2 text-left transition-all ${
                  settings.contentTypes[type.key as keyof AutoPilotSettings['contentTypes']]
                    ? 'border-retro-mustard bg-retro-mustard/10'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-heading text-sm uppercase">{type.label}</p>
                  {settings.contentTypes[type.key as keyof AutoPilotSettings['contentTypes']] && (
                    <CheckCircle size={16} className="text-retro-mustard" />
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-1">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Auto-Approve Setting */}
        <div className="card-retro">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={24} className="text-retro-navy" />
              <div>
                <h3 className="font-heading text-sm uppercase">Auto-Approve Posts?</h3>
                <p className="text-gray-500 text-xs mt-1">
                  {settings.autoApprove
                    ? 'Posts go live without your review'
                    : 'You review each post before it goes live'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettings((prev) => ({ ...prev, autoApprove: !prev.autoApprove }))}
              className={`p-1 transition-colors ${settings.autoApprove ? 'text-green-600' : 'text-gray-400'}`}
            >
              {settings.autoApprove ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>

          {!settings.autoApprove && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600 flex items-start gap-2">
              <AlertCircle size={16} className="text-retro-teal mt-0.5" />
              <span>You'll get a notification to review each post before it goes live.</span>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={18} />
              <span className="font-medium">Settings saved!</span>
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-retro-primary px-8 py-4 text-lg disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-retro-navy text-white p-6 border-4 border-black">
        <h3 className="font-display text-xl mb-3">How Auto-Pilot Works</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-retro-mustard mt-0.5" />
            <span>AI analyzes your brand, services, and past posts</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-retro-mustard mt-0.5" />
            <span>Creates unique content tailored to your shop</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-retro-mustard mt-0.5" />
            <span>Posts at optimal times for maximum engagement</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-retro-mustard mt-0.5" />
            <span>Adapts to seasons, holidays, and local events</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
