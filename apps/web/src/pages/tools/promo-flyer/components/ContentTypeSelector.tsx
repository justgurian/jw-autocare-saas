import { Wrench, Tag, Briefcase, Laugh, PenLine } from 'lucide-react';

export type ContentType = 'service' | 'special' | 'hiring' | 'meme' | 'custom';

interface ServiceItem {
  id: string;
  name: string;
  description?: string;
}

interface SpecialItem {
  id: string;
  name: string;
  description?: string;
  discountText?: string;
}

interface ContentTypeSelectorProps {
  contentType: ContentType;
  onContentTypeChange: (type: ContentType) => void;
  // Service mode
  services: ServiceItem[];
  selectedServiceId: string | null;
  onServiceSelect: (service: ServiceItem | null) => void;
  // Special mode
  specials: SpecialItem[];
  selectedSpecialId: string | null;
  onSpecialSelect: (special: SpecialItem | null) => void;
}

const CONTENT_TYPES = [
  { id: 'service' as const, label: 'Service', icon: Wrench, desc: 'Promote a service' },
  { id: 'special' as const, label: 'Special', icon: Tag, desc: 'Advertise a deal' },
  { id: 'hiring' as const, label: 'Hiring', icon: Briefcase, desc: 'Now hiring flyer' },
  { id: 'meme' as const, label: 'Meme', icon: Laugh, desc: 'Funny car meme' },
  { id: 'custom' as const, label: 'Custom', icon: PenLine, desc: 'Write your own' },
];

export default function ContentTypeSelector({
  contentType, onContentTypeChange,
  services, selectedServiceId, onServiceSelect,
  specials, selectedSpecialId, onSpecialSelect,
}: ContentTypeSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Content Type Pills */}
      <div className="flex flex-wrap gap-2">
        {CONTENT_TYPES.map(ct => {
          const Icon = ct.icon;
          return (
            <button
              key={ct.id}
              type="button"
              onClick={() => onContentTypeChange(ct.id)}
              className={`flex items-center gap-1.5 py-2 px-3 border-2 text-sm transition-all ${
                contentType === ct.id
                  ? 'border-retro-red bg-red-50 text-retro-red'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
              }`}
            >
              <Icon size={14} />
              <span className="font-heading uppercase">{ct.label}</span>
            </button>
          );
        })}
      </div>

      {/* Service Dropdown */}
      {contentType === 'service' && (
        <div>
          <label className="block font-heading uppercase text-xs text-gray-500 mb-1.5">
            Pick a Service
          </label>
          {services.length === 0 ? (
            <p className="text-sm text-gray-400">No services configured. Go to Shop Profile to add services.</p>
          ) : (
            <select
              value={selectedServiceId || ''}
              onChange={e => {
                const svc = services.find(s => s.id === e.target.value);
                onServiceSelect(svc || null);
              }}
              className="w-full border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:border-retro-red focus:outline-none"
            >
              <option value="">Choose a service...</option>
              {services.map(svc => (
                <option key={svc.id} value={svc.id}>{svc.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Special Dropdown */}
      {contentType === 'special' && (
        <div>
          <label className="block font-heading uppercase text-xs text-gray-500 mb-1.5">
            Pick a Special
          </label>
          {specials.length === 0 ? (
            <p className="text-sm text-gray-400">No active specials. Go to Shop Profile to add specials.</p>
          ) : (
            <select
              value={selectedSpecialId || ''}
              onChange={e => {
                const sp = specials.find(s => s.id === e.target.value);
                onSpecialSelect(sp || null);
              }}
              className="w-full border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:border-retro-red focus:outline-none"
            >
              <option value="">Choose a special...</option>
              {specials.map(sp => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}{sp.discountText ? ` — ${sp.discountText}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
