import { useState } from 'react';
import { Sparkles, Tag, Wrench, PenLine, Plus, X, Lightbulb } from 'lucide-react';

interface ContentItem {
  id: string;
  type: 'service' | 'special';
  name: string;
  isSelected: boolean;
  reason?: string;
}

interface CustomContent {
  message: string;
  subject: string;
  details?: string;
}

interface Suggestion {
  id: string;
  type: string;
  serviceId?: string;
  specialId?: string;
  serviceName?: string;
  specialName?: string;
  reason: string;
  priority: number;
}

interface ContentSelectorProps {
  selectedContent: ContentItem[];
  onContentChange: (content: ContentItem[]) => void;
  customContent: CustomContent[];
  onCustomContentChange: (content: CustomContent[]) => void;
  suggestions?: {
    seasonal: Suggestion[];
    trending: Suggestion[];
    rotation: Suggestion[];
    contentSuggestions: Array<{
      serviceId?: string;
      specialId?: string;
      name: string;
      isPreSelected: boolean;
      reason: string;
    }>;
  };
}

export default function ContentSelector({
  selectedContent,
  onContentChange,
  customContent,
  onCustomContentChange,
  suggestions,
}: ContentSelectorProps) {
  const [activeTab, setActiveTab] = useState<'suggested' | 'custom'>('suggested');
  const [newCustom, setNewCustom] = useState<CustomContent>({ message: '', subject: '' });

  const toggleContent = (id: string) => {
    onContentChange(
      selectedContent.map(c =>
        c.id === id ? { ...c, isSelected: !c.isSelected } : c
      )
    );
  };

  const addCustomContent = () => {
    if (!newCustom.message.trim() || !newCustom.subject.trim()) return;
    onCustomContentChange([...customContent, newCustom]);
    setNewCustom({ message: '', subject: '' });
  };

  const removeCustomContent = (index: number) => {
    onCustomContentChange(customContent.filter((_, i) => i !== index));
  };

  const selectedCount = selectedContent.filter(c => c.isSelected).length + customContent.length;

  const services = selectedContent.filter(c => c.type === 'service');
  const specials = selectedContent.filter(c => c.type === 'special');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg uppercase mb-4">What do you want to promote?</h2>
        <p className="text-gray-600 text-sm mb-6">
          Select services, specials, or add custom content. AI will create unique captions for each.
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex border-2 border-black">
        <button
          onClick={() => setActiveTab('suggested')}
          className={`flex-1 py-3 font-heading uppercase text-sm flex items-center justify-center gap-2 ${
            activeTab === 'suggested'
              ? 'bg-retro-navy text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Sparkles size={16} />
          AI Suggestions
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-3 font-heading uppercase text-sm flex items-center justify-center gap-2 border-l-2 border-black ${
            activeTab === 'custom'
              ? 'bg-retro-navy text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <PenLine size={16} />
          Custom Content
        </button>
      </div>

      {/* Suggested Content */}
      {activeTab === 'suggested' && (
        <div className="space-y-6">
          {/* Smart Suggestions Banner */}
          {suggestions?.seasonal && suggestions.seasonal.length > 0 && (
            <div className="bg-gradient-to-r from-retro-teal/10 to-retro-red/10 border-2 border-dashed border-retro-teal/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={18} className="text-retro-teal" />
                <h3 className="font-heading text-sm uppercase">Smart Suggestions</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.seasonal.slice(0, 3).map(s => (
                  <span
                    key={s.id}
                    className="px-3 py-1 bg-white border border-retro-teal/30 text-sm flex items-center gap-1"
                  >
                    {s.serviceName || s.specialName}
                    <span className="text-xs text-gray-500">- {s.reason}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specials Section */}
          {specials.length > 0 && (
            <div>
              <h3 className="font-heading text-sm uppercase mb-3 flex items-center gap-2">
                <Tag size={16} className="text-retro-red" />
                Active Specials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {specials.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleContent(item.id)}
                    className={`p-3 border-2 text-left transition-all flex items-center gap-3 ${
                      item.isSelected
                        ? 'border-retro-red bg-red-50'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 border-2 flex items-center justify-center ${
                        item.isSelected
                          ? 'border-retro-red bg-retro-red text-white'
                          : 'border-gray-400'
                      }`}
                    >
                      {item.isSelected && <span className="text-xs">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm truncate">{item.name}</p>
                      {item.reason && (
                        <p className="text-xs text-gray-500 truncate">{item.reason}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Services Section */}
          {services.length > 0 && (
            <div>
              <h3 className="font-heading text-sm uppercase mb-3 flex items-center gap-2">
                <Wrench size={16} className="text-retro-navy" />
                Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {services.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleContent(item.id)}
                    className={`p-3 border-2 text-left transition-all flex items-center gap-3 ${
                      item.isSelected
                        ? 'border-retro-navy bg-blue-50'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 border-2 flex items-center justify-center ${
                        item.isSelected
                          ? 'border-retro-navy bg-retro-navy text-white'
                          : 'border-gray-400'
                      }`}
                    >
                      {item.isSelected && <span className="text-xs">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm truncate">{item.name}</p>
                      {item.reason && (
                        <p className="text-xs text-gray-500 truncate">{item.reason}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedContent.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No services or specials found.</p>
              <p className="text-sm mt-1">Add some in your brand kit settings, or use custom content.</p>
            </div>
          )}
        </div>
      )}

      {/* Custom Content */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          {/* Existing Custom Items */}
          {customContent.map((item, index) => (
            <div
              key={index}
              className="p-4 border-2 border-gray-300 bg-gray-50 relative"
            >
              <button
                onClick={() => removeCustomContent(index)}
                className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"
              >
                <X size={16} />
              </button>
              <p className="font-heading text-sm">{item.message}</p>
              <p className="text-sm text-gray-600 mt-1">Service: {item.subject}</p>
              {item.details && (
                <p className="text-xs text-gray-500 mt-1">{item.details}</p>
              )}
            </div>
          ))}

          {/* Add New Custom Content */}
          <div className="border-2 border-dashed border-gray-300 p-4 space-y-4">
            <h3 className="font-heading text-sm uppercase">Add Custom Content</h3>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Headline / Message</label>
              <input
                type="text"
                value={newCustom.message}
                onChange={(e) => setNewCustom({ ...newCustom, message: e.target.value })}
                placeholder="e.g., Summer Special - 20% Off!"
                className="w-full p-3 border-2 border-black focus:border-retro-red outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Service / Subject</label>
              <input
                type="text"
                value={newCustom.subject}
                onChange={(e) => setNewCustom({ ...newCustom, subject: e.target.value })}
                placeholder="e.g., AC Service"
                className="w-full p-3 border-2 border-black focus:border-retro-red outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Additional Details (optional)</label>
              <textarea
                value={newCustom.details || ''}
                onChange={(e) => setNewCustom({ ...newCustom, details: e.target.value })}
                placeholder="e.g., Includes freon recharge and filter replacement"
                className="w-full p-3 border-2 border-black focus:border-retro-red outline-none h-20 resize-none"
              />
            </div>

            <button
              onClick={addCustomContent}
              disabled={!newCustom.message.trim() || !newCustom.subject.trim()}
              className="w-full py-3 border-2 border-black bg-retro-navy text-white font-heading uppercase hover:bg-retro-navy/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Content
            </button>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      <div className="bg-retro-cream border-2 border-dashed border-retro-navy/30 p-4">
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm">Selected Content:</span>
          <span className="font-display text-lg text-retro-navy">{selectedCount}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          AI will create unique variations for each flyer
        </p>
      </div>
    </div>
  );
}
