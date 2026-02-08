import { useState, useMemo } from 'react';
import { Search, X, Globe, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { streamNdjsonPost } from '../../../services/api';
import RetroLoadingStage from '../../../components/garage/RetroLoadingStage';

// All available services - extracted for search functionality
const ALL_SERVICES = [
  'Oil Change', 'Brake Service', 'Brake Pads', 'Brake Rotors',
  'Engine Repair', 'Engine Diagnostics', 'Check Engine Light',
  'AC Service', 'AC Repair', 'Heater Repair',
  'Tire Service', 'Tire Rotation', 'Wheel Alignment', 'Wheel Balancing',
  'Transmission Service', 'Transmission Repair', 'Transmission Flush',
  'Battery Service', 'Battery Replacement', 'Electrical Repair',
  'Suspension Repair', 'Shocks & Struts', 'Steering Repair',
  'Exhaust Repair', 'Muffler Service', 'Catalytic Converter',
  'Radiator Service', 'Coolant Flush', 'Overheating Repair',
  'Fuel System Service', 'Fuel Injection Cleaning', 'Fuel Pump Repair',
  'Timing Belt', 'Serpentine Belt', 'Belt Replacement',
  'Spark Plugs', 'Tune Up', 'Emissions Testing',
  'State Inspection', 'Pre-Purchase Inspection', 'Fleet Service',
  'Diesel Repair', 'Hybrid Service', 'Electric Vehicle Service',
  'Classic Car Service', 'Performance Upgrades', 'Custom Work',
  'Windshield Repair', 'Wiper Blades', 'Headlight Restoration',
  'Power Steering', 'Clutch Repair', 'Differential Service',
  'Driveshaft Repair', 'CV Joint/Axle', 'Transfer Case Service',
  '4x4 Service', 'Lift Kit Installation', 'Lowering Kits'
];

interface ServicesStepProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  websiteUrl: string;
  onWebsiteUrlChange: (url: string) => void;
  onSpecialsExtracted?: (specials: { title: string; discount: string; description: string }[]) => void;
}

export default function ServicesStep({
  selectedServices,
  onServicesChange,
  websiteUrl,
  onWebsiteUrlChange,
  onSpecialsExtracted,
}: ServicesStepProps) {
  const [serviceSearch, setServiceSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const [discoveredPages, setDiscoveredPages] = useState<string[]>([]);
  const [importError, setImportError] = useState('');

  // Custom phase messages for the tachometer during website import
  const importPhaseMessages: Record<number, string[]> = {
    0: ['Warming up the engine...', 'Connecting to your website...', 'Turning the ignition...'],
    1: ['Scanning the shop front...', 'Reading your homepage...', 'Looking for service menus...'],
    2: ['Flipping through the service menu...', 'Checking the specials board...', 'Reading the fine print...'],
    3: ['AI mechanic is under the hood...', 'Extracting services & specials...', 'Almost done...'],
  };

  const handleImportWebsite = async () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL first');
      return;
    }
    // Auto-add https:// if user omitted protocol
    let normalizedUrl = websiteUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
      onWebsiteUrlChange(normalizedUrl);
    }
    setIsImporting(true);
    setImportError('');
    setLiveMessage('');
    setDiscoveredPages([]);

    try {
      await streamNdjsonPost('/brand-kit/import-website', { url: normalizedUrl }, (event: any) => {
        if (event.type === 'progress') {
          setLiveMessage(event.message || '');
        } else if (event.type === 'pages_found') {
          setDiscoveredPages(event.pages || []);
          setLiveMessage(`Found ${(event.pages || []).length} pages to explore`);
        } else if (event.type === 'result' && event.success) {
          // Process extracted data
          const extracted = event.extracted || {};

          // Extract services — API may return strings or {name, description} objects
          const rawServices: any[] = extracted.services || [];
          const extractedServices: string[] = rawServices.map((svc: any) =>
            typeof svc === 'string' ? svc : (svc.name || String(svc))
          );
          if (extractedServices.length > 0) {
            const matched: string[] = [];
            const custom: string[] = [];
            for (const svc of extractedServices) {
              const found = ALL_SERVICES.find(s => s.toLowerCase() === svc.toLowerCase());
              if (found) {
                matched.push(found);
              } else {
                custom.push(svc);
              }
            }
            const merged = [...new Set([...selectedServices, ...matched, ...custom])];
            onServicesChange(merged);

            const pageLabel = event.pageCount && event.pageCount > 1 ? ` from ${event.pageCount} pages` : '';
            toast.success(`Found ${extractedServices.length} services${pageLabel}!`);
          } else {
            toast('No services found. Try adding them manually below.', { icon: '🔍' });
          }

          // Extract specials if available
          const extractedSpecials = extracted.specials || [];
          if (extractedSpecials.length > 0 && onSpecialsExtracted) {
            const mapped = extractedSpecials.map((s: any) => ({
              title: s.title || s.name || '',
              discount: String(s.discountValue || s.discount || '10'),
              description: s.description || '',
            }));
            onSpecialsExtracted(mapped);
            toast.success(`Also found ${mapped.length} specials!`);
          }

          setIsImporting(false);
        } else if (event.type === 'error') {
          setImportError(event.message || "Couldn't read that website.");
          setIsImporting(false);
        }
      });

      // Stream ended without a result/error event
      if (isImporting) {
        setIsImporting(false);
      }
    } catch {
      setImportError("Couldn't connect to the server. Try again or add services manually.");
      setIsImporting(false);
    }
  };

  // Filter services based on search - memoized for performance
  const filteredServices = useMemo(() => {
    if (!serviceSearch.trim()) return ALL_SERVICES;
    const searchLower = serviceSearch.toLowerCase();
    return ALL_SERVICES.filter(service =>
      service.toLowerCase().includes(searchLower)
    );
  }, [serviceSearch]);

  // Helper to highlight matching text
  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) return text;
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(searchLower);
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="bg-retro-mustard text-retro-navy">{text.slice(index, index + search.length)}</span>
        {text.slice(index + search.length)}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* URL Import Option */}
      {isImporting ? (
        /* ─── Importing: Full animated loading experience ─── */
        <div className="bg-retro-navy/5 dark:bg-gray-700/30 p-6 border-2 border-retro-teal/40 dark:border-retro-teal/30 mb-6">
          <RetroLoadingStage
            isLoading={isImporting}
            estimatedDuration={25000}
            size="md"
            showExhaust
            phaseMessages={importPhaseMessages}
          />

          {/* Live status from NDJSON stream */}
          {liveMessage && (
            <p className="text-center text-sm text-retro-teal dark:text-retro-teal font-heading uppercase mt-2 animate-pulse">
              {liveMessage}
            </p>
          )}

          {/* Discovered page badges */}
          {discoveredPages.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {discoveredPages.map((page) => (
                <span
                  key={page}
                  className="text-xs px-2 py-1 bg-retro-teal/10 dark:bg-retro-teal/20 border border-retro-teal/30 text-retro-teal font-heading uppercase"
                >
                  {page}
                </span>
              ))}
            </div>
          )}

          {/* Cancel button */}
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
              onClick={() => setIsImporting(false)}
            >
              Skip &mdash; I'll add services manually
            </button>
          </div>
        </div>
      ) : (
        /* ─── Idle: URL input + Import button ─── */
        <div className="bg-retro-navy/5 dark:bg-gray-700/30 p-4 border-2 border-retro-navy/20 dark:border-gray-600 mb-6">
          <p className="font-heading text-sm uppercase mb-2">
            <Globe size={16} className="inline mr-1" />
            Import from Website (Optional)
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              className="input-retro flex-1"
              placeholder="www.yourshop.com"
              value={websiteUrl || ''}
              onChange={(e) => onWebsiteUrlChange(e.target.value)}
            />
            <button
              type="button"
              className="btn-retro-secondary text-sm disabled:opacity-50"
              onClick={handleImportWebsite}
              disabled={!websiteUrl}
            >
              Import
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            AI will scan multiple pages to find services, specials, and more
          </p>

          {/* Error state */}
          {importError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 dark:text-red-400">{importError}</p>
                  <p className="text-red-500 dark:text-red-500 text-xs mt-1">
                    You can add services manually below instead.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Bar for Services */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="input-retro pl-10 pr-10"
            placeholder="Search services... (e.g., brake, oil, transmission)"
            value={serviceSearch}
            onChange={(e) => setServiceSearch(e.target.value)}
          />
          {serviceSearch && (
            <button
              onClick={() => setServiceSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {serviceSearch
              ? `Showing ${filteredServices.length} of ${ALL_SERVICES.length} services`
              : `${ALL_SERVICES.length} services available`}
          </span>
          <span className="font-heading text-retro-teal">
            {selectedServices.length} selected
          </span>
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2 pb-2">
          <button
            type="button"
            className="text-xs px-3 py-1 border border-retro-navy dark:border-retro-teal text-retro-navy dark:text-retro-teal hover:bg-retro-navy dark:hover:bg-retro-teal hover:text-white transition-colors"
            onClick={() => {
              const common = ['Oil Change', 'Brake Service', 'Tire Service', 'AC Service', 'Engine Diagnostics', 'Battery Service'];
              const newServices = [...new Set([...selectedServices, ...common])];
              onServicesChange(newServices);
              toast.success('Common services added!');
            }}
          >
            + Common Services
          </button>
          <button
            type="button"
            className="text-xs px-3 py-1 border border-retro-navy dark:border-retro-teal text-retro-navy dark:text-retro-teal hover:bg-retro-navy dark:hover:bg-retro-teal hover:text-white transition-colors"
            onClick={() => {
              onServicesChange([...ALL_SERVICES]);
              toast.success('All services selected!');
            }}
          >
            Select All
          </button>
          {selectedServices.length > 0 && (
            <button
              type="button"
              className="text-xs px-3 py-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              onClick={() => {
                onServicesChange([]);
                toast.success('All services cleared');
              }}
            >
              Clear All
            </button>
          )}
        </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto">
        {filteredServices.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <p className="font-heading">No services match "{serviceSearch}"</p>
            <p className="text-sm mt-1">Try a different search or add it as a custom service below</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <label
              key={service}
              className={`flex items-center gap-2 p-2 border cursor-pointer text-sm transition-all ${
                selectedServices.includes(service)
                  ? 'border-retro-teal bg-retro-teal/10 border-2'
                  : 'border-black dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="checkbox"
                className="w-4 h-4 accent-retro-teal"
                checked={selectedServices.includes(service)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onServicesChange([...selectedServices, service]);
                  } else {
                    onServicesChange(selectedServices.filter(s => s !== service));
                  }
                }}
              />
              <span className="font-heading uppercase text-xs">
                {highlightMatch(service, serviceSearch)}
              </span>
            </label>
          ))
        )}
      </div>

      {/* Custom service input */}
      <div className="mt-4 pt-4 border-t border-gray-300">
        <p className="font-heading text-sm uppercase mb-2">Add Custom Service</p>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-retro flex-1"
            placeholder="Enter custom service..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  onServicesChange([...selectedServices, input.value.trim()]);
                  input.value = '';
                  toast.success('Custom service added!');
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
