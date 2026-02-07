import { useState, useMemo } from 'react';
import { Globe } from 'lucide-react';

interface FormData {
  businessName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  logoUrl: string;
  primaryColor: string;
  services: string[];
  specials: { title: string; discount: string; description: string }[];
  brandVoice: string;
  vehiclePreferences: { lovedMakes: Array<{makeId: string; models?: string[]}>; neverMakes: string[] };
  websiteUrl: string;
  styleFamilyIds: string[];
  timezone: string;
}

interface BusinessInfoStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

// Common US timezones at the top for convenience
const POPULAR_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
];

export default function BusinessInfoStep({ formData, setFormData }: BusinessInfoStepProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const showError = (field: string) => touched[field] && !formData[field as keyof FormData];

  // Build timezone list: popular US timezones first, then all others
  const timezoneOptions = useMemo(() => {
    try {
      const all: string[] = (Intl as any).supportedValuesOf('timeZone');
      const popular = POPULAR_TIMEZONES.filter((tz: string) => all.includes(tz));
      const rest = all.filter((tz: string) => !POPULAR_TIMEZONES.includes(tz));
      return { popular, rest };
    } catch {
      return { popular: POPULAR_TIMEZONES, rest: [] as string[] };
    }
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-heading uppercase text-sm mb-2">
          Business Name *
        </label>
        <input
          type="text"
          className={`input-retro ${showError('businessName') ? 'border-retro-red ring-2 ring-retro-red/30' : ''}`}
          placeholder="Your Auto Repair Shop"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, businessName: true }))}
        />
        {showError('businessName') && (
          <p className="text-retro-red text-xs mt-1 font-medium">Business name is required</p>
        )}
      </div>
      <div>
        <label className="block font-heading uppercase text-sm mb-2">
          Phone
        </label>
        <input
          type="tel"
          className="input-retro"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <p className="text-gray-400 text-xs mt-1">Shown on your flyers for customers to call</p>
      </div>
      <div>
        <label className="block font-heading uppercase text-sm mb-2">
          Street Address
        </label>
        <input
          type="text"
          className="input-retro"
          placeholder="123 Main Street"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-heading uppercase text-sm mb-2">
            City
          </label>
          <input
            type="text"
            className="input-retro"
            placeholder="Phoenix"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-heading uppercase text-sm mb-2">
            State
          </label>
          <input
            type="text"
            className="input-retro"
            placeholder="AZ"
            maxLength={2}
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
          />
        </div>
      </div>
      <div>
        <label className="block font-heading uppercase text-sm mb-2 flex items-center gap-2">
          <Globe size={14} />
          Timezone
        </label>
        <select
          className="input-retro"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
        >
          <optgroup label="Common (US)">
            {timezoneOptions.popular.map((tz: string) => (
              <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
            ))}
          </optgroup>
          {timezoneOptions.rest.length > 0 && (
            <optgroup label="All Timezones">
              {timezoneOptions.rest.map((tz: string) => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </optgroup>
          )}
        </select>
        <p className="text-gray-400 text-xs mt-1">Auto-detected from your browser. Used for scheduling posts.</p>
      </div>
    </div>
  );
}
