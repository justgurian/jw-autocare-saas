import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

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
}

export default function ServicesStep({
  selectedServices,
  onServicesChange,
  websiteUrl,
  onWebsiteUrlChange,
}: ServicesStepProps) {
  const [serviceSearch, setServiceSearch] = useState('');

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
      <div className="bg-retro-navy/5 p-4 border-2 border-retro-navy/20 mb-6">
        <p className="font-heading text-sm uppercase mb-2">Import from Website (Optional)</p>
        <div className="flex gap-2">
          <input
            type="url"
            className="input-retro flex-1"
            placeholder="https://yourshop.com/services"
            value={websiteUrl || ''}
            onChange={(e) => onWebsiteUrlChange(e.target.value)}
          />
          <button
            type="button"
            className="btn-retro-secondary text-sm"
            onClick={() => {
              if (websiteUrl) {
                toast('Website import coming soon! For now, select your services below.', { icon: '🚧' });
              }
            }}
          >
            Import
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">AI will extract services from your website</p>
      </div>

      {/* Search Bar for Services */}
      <div className="sticky top-0 bg-white z-10 pb-4">
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
          <span className="text-gray-600">
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
      {!serviceSearch && (
        <div className="flex flex-wrap gap-2 pb-2">
          <button
            type="button"
            className="text-xs px-3 py-1 border border-retro-navy text-retro-navy hover:bg-retro-navy hover:text-white transition-colors"
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
            className="text-xs px-3 py-1 border border-retro-navy text-retro-navy hover:bg-retro-navy hover:text-white transition-colors"
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
      )}

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
                  : 'border-black hover:bg-gray-50'
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
