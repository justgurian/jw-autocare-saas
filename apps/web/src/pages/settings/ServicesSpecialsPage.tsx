import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Zap, Globe, FileText, Wrench, Star, Plus, Pencil, Trash2,
  Loader2, X, Check, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';
import { servicesApi, specialsApi, brandKitApi } from '../../services/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  category: string;
  isSpecialty: boolean;
}

interface Special {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'bogo';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ImportedService {
  name: string;
  description: string;
  priceRange: string;
  category: string;
  selected: boolean;
}

interface ImportedSpecial {
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'bogo';
  discountValue: number;
  selected: boolean;
}

interface ImportResult {
  businessInfo: Record<string, string>;
  services: ImportedService[];
  specials: ImportedSpecial[];
  talkingPoints: string[];
}

const CATEGORIES = [
  'Maintenance', 'Brakes', 'Tires', 'AC/Heating', 'Engine',
  'Transmission', 'Electrical', 'Body', 'Inspection', 'Other',
];

const CATEGORY_COLORS: Record<string, string> = {
  Maintenance: 'bg-green-100 text-green-800',
  Brakes: 'bg-red-100 text-red-800',
  Tires: 'bg-blue-100 text-blue-800',
  'AC/Heating': 'bg-cyan-100 text-cyan-800',
  Engine: 'bg-orange-100 text-orange-800',
  Transmission: 'bg-purple-100 text-purple-800',
  Electrical: 'bg-yellow-100 text-yellow-800',
  Body: 'bg-pink-100 text-pink-800',
  Inspection: 'bg-indigo-100 text-indigo-800',
  Other: 'bg-gray-100 text-gray-800',
};

// ── Smart Import Section ───────────────────────────────────────────────────

function SmartImportSection({ onImportComplete }: { onImportComplete: () => void }) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const queryClient = useQueryClient();

  const handleScan = async () => {
    if (!websiteUrl.trim()) return;
    setImporting(true);
    try {
      const res = await brandKitApi.importWebsite({ url: websiteUrl.trim() });
      const data = res.data;
      setImportResult({
        businessInfo: data.businessInfo || {},
        services: (data.services || []).map((s: any) => ({ ...s, selected: true })),
        specials: (data.specials || []).map((s: any) => ({ ...s, selected: true })),
        talkingPoints: data.talkingPoints || [],
      });
      setShowReviewModal(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to scan website');
    } finally {
      setImporting(false);
    }
  };

  const handleExtract = async () => {
    if (!pastedText.trim()) return;
    setImporting(true);
    try {
      const res = await brandKitApi.importWebsite({ pastedText: pastedText.trim() });
      const data = res.data;
      setImportResult({
        businessInfo: data.businessInfo || {},
        services: (data.services || []).map((s: any) => ({ ...s, selected: true })),
        specials: (data.specials || []).map((s: any) => ({ ...s, selected: true })),
        talkingPoints: data.talkingPoints || [],
      });
      setShowReviewModal(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to extract data');
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importResult) return;
    setImporting(true);
    try {
      await brandKitApi.importConfirm({
        businessInfo: importResult.businessInfo,
        services: importResult.services.filter((s) => s.selected),
        specials: importResult.specials.filter((s) => s.selected),
        talkingPoints: importResult.talkingPoints,
      });
      toast.success('Import successful! Your services and specials have been added.');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['specials'] });
      setShowReviewModal(false);
      setImportResult(null);
      setWebsiteUrl('');
      setPastedText('');
      onImportComplete();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to confirm import');
    } finally {
      setImporting(false);
    }
  };

  const updateServiceField = (index: number, field: string, value: any) => {
    if (!importResult) return;
    const updated = [...importResult.services];
    (updated[index] as any)[field] = value;
    setImportResult({ ...importResult, services: updated });
  };

  const updateSpecialField = (index: number, field: string, value: any) => {
    if (!importResult) return;
    const updated = [...importResult.specials];
    (updated[index] as any)[field] = value;
    setImportResult({ ...importResult, specials: updated });
  };

  const updateBusinessField = (key: string, value: string) => {
    if (!importResult) return;
    setImportResult({
      ...importResult,
      businessInfo: { ...importResult.businessInfo, [key]: value },
    });
  };

  const removeTalkingPoint = (index: number) => {
    if (!importResult) return;
    setImportResult({
      ...importResult,
      talkingPoints: importResult.talkingPoints.filter((_, i) => i !== index),
    });
  };

  return (
    <>
      <div className="border-4 border-black shadow-retro bg-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-retro-mustard border-2 border-black">
            <Zap size={24} className="text-retro-navy" />
          </div>
          <div>
            <h2 className="font-heading text-xl uppercase text-retro-navy">Smart Import</h2>
            <p className="text-gray-600 text-sm">
              Import your services and specials from your website or paste your info
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Scan Website */}
          <div className="border-2 border-gray-200 p-4 bg-retro-cream/50">
            <label className="font-heading text-sm uppercase text-retro-navy flex items-center gap-2 mb-2">
              <Globe size={16} />
              Scan Your Website
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="input-retro w-full mb-3"
              placeholder="https://yourshop.com"
              disabled={importing}
            />
            <button
              onClick={handleScan}
              disabled={importing || !websiteUrl.trim()}
              className="w-full bg-retro-red text-white font-heading uppercase py-3 px-4 border-2 border-black shadow-retro hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {importing ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
              Scan
            </button>
          </div>

          {/* Paste Info */}
          <div className="border-2 border-gray-200 p-4 bg-retro-cream/50">
            <label className="font-heading text-sm uppercase text-retro-navy flex items-center gap-2 mb-2">
              <FileText size={16} />
              Paste Your Info
            </label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="input-retro w-full mb-3 min-h-[80px] resize-y"
              placeholder="Paste your services list, menu, or any business info here..."
              disabled={importing}
            />
            <button
              onClick={handleExtract}
              disabled={importing || !pastedText.trim()}
              className="w-full bg-retro-red text-white font-heading uppercase py-3 px-4 border-2 border-black shadow-retro hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {importing ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              Extract
            </button>
          </div>
        </div>

        {importing && (
          <div className="mt-4 text-center py-4">
            <Loader2 size={32} className="animate-spin text-retro-red mx-auto mb-2" />
            <p className="font-heading text-retro-navy text-sm">AI is analyzing your business...</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && importResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-retro w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-retro-navy text-white p-4 flex items-center justify-between border-b-4 border-black z-10">
              <h3 className="font-heading text-lg uppercase">Review Imported Data</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Business Info */}
              {Object.keys(importResult.businessInfo).length > 0 && (
                <div>
                  <h4 className="font-heading text-sm uppercase text-retro-navy mb-3 flex items-center gap-2">
                    <Globe size={16} />
                    Business Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(importResult.businessInfo).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs font-semibold uppercase text-gray-500">{key}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateBusinessField(key, e.target.value)}
                          className="input-retro w-full text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {importResult.services.length > 0 && (
                <div>
                  <h4 className="font-heading text-sm uppercase text-retro-navy mb-3 flex items-center gap-2">
                    <Wrench size={16} />
                    Services ({importResult.services.filter((s) => s.selected).length} selected)
                  </h4>
                  <div className="border-2 border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 text-left w-10"></th>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left hidden md:table-cell">Description</th>
                          <th className="p-2 text-left w-28">Price</th>
                          <th className="p-2 text-left w-32">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.services.map((svc, i) => (
                          <tr key={i} className={`border-t ${!svc.selected ? 'opacity-50' : ''}`}>
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={svc.selected}
                                onChange={(e) => updateServiceField(i, 'selected', e.target.checked)}
                                className="w-4 h-4"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={svc.name}
                                onChange={(e) => updateServiceField(i, 'name', e.target.value)}
                                className="w-full border border-gray-200 px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2 hidden md:table-cell">
                              <input
                                type="text"
                                value={svc.description}
                                onChange={(e) => updateServiceField(i, 'description', e.target.value)}
                                className="w-full border border-gray-200 px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={svc.priceRange}
                                onChange={(e) => updateServiceField(i, 'priceRange', e.target.value)}
                                className="w-full border border-gray-200 px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={svc.category}
                                onChange={(e) => updateServiceField(i, 'category', e.target.value)}
                                className="w-full border border-gray-200 px-2 py-1 text-sm"
                              >
                                {CATEGORIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Specials */}
              {importResult.specials.length > 0 && (
                <div>
                  <h4 className="font-heading text-sm uppercase text-retro-navy mb-3 flex items-center gap-2">
                    <Star size={16} />
                    Specials ({importResult.specials.filter((s) => s.selected).length} selected)
                  </h4>
                  <div className="border-2 border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 text-left w-10"></th>
                          <th className="p-2 text-left">Title</th>
                          <th className="p-2 text-left hidden md:table-cell">Description</th>
                          <th className="p-2 text-left w-28">Type</th>
                          <th className="p-2 text-left w-20">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.specials.map((sp, i) => (
                          <tr key={i} className={`border-t ${!sp.selected ? 'opacity-50' : ''}`}>
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={sp.selected}
                                onChange={(e) => updateSpecialField(i, 'selected', e.target.checked)}
                                className="w-4 h-4"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={sp.title}
                                onChange={(e) => updateSpecialField(i, 'title', e.target.value)}
                                className="w-full border border-gray-200 px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2 hidden md:table-cell">
                              <input
                                type="text"
                                value={sp.description}
                                onChange={(e) => updateSpecialField(i, 'description', e.target.value)}
                                className="w-full border border-gray-200 px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={sp.discountType}
                                onChange={(e) => updateSpecialField(i, 'discountType', e.target.value)}
                                className="w-full border border-gray-200 px-2 py-1 text-sm"
                              >
                                <option value="percentage">% Off</option>
                                <option value="fixed">$ Off</option>
                                <option value="bogo">BOGO</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={sp.discountValue}
                                onChange={(e) => updateSpecialField(i, 'discountValue', Number(e.target.value))}
                                className="w-full border border-gray-200 px-2 py-1 text-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Talking Points */}
              {importResult.talkingPoints.length > 0 && (
                <div>
                  <h4 className="font-heading text-sm uppercase text-retro-navy mb-3">
                    Talking Points
                  </h4>
                  <div className="space-y-2">
                    {importResult.talkingPoints.map((tp, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 border border-gray-200">
                        <Check size={16} className="text-green-600 flex-shrink-0" />
                        <span className="flex-1 text-sm">{tp}</span>
                        <button
                          onClick={() => removeTalkingPoint(i)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-6 py-3 font-heading uppercase border-2 border-black hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="bg-retro-red text-white font-heading uppercase px-6 py-3 border-2 border-black shadow-retro hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {importing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Import Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Service Form ───────────────────────────────────────────────────────────

function ServiceForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Partial<Service>;
  onSubmit: (data: Omit<Service, 'id'>) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [priceRange, setPriceRange] = useState(initial?.priceRange || '');
  const [category, setCategory] = useState(initial?.category || 'Maintenance');
  const [isSpecialty, setIsSpecialty] = useState(initial?.isSpecialty || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), priceRange, category, isSpecialty });
  };

  return (
    <form onSubmit={handleSubmit} className="border-2 border-gray-200 p-4 bg-retro-cream/30 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-retro w-full"
            placeholder="Oil Change"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">Price Range</label>
          <input
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="input-retro w-full"
            placeholder="$39.99 - $59.99"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-gray-500">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-retro w-full min-h-[60px] resize-y"
          placeholder="Describe this service..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-retro w-full"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 pt-5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSpecialty}
              onChange={(e) => setIsSpecialty(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-retro-red"></div>
            <span className="ml-2 text-sm font-medium">Specialty Service</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border-2 border-black font-heading text-sm uppercase hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="bg-retro-red text-white px-4 py-2 border-2 border-black font-heading text-sm uppercase shadow-retro hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {initial ? 'Save' : 'Add Service'}
        </button>
      </div>
    </form>
  );
}

// ── Special Form ───────────────────────────────────────────────────────────

function SpecialForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Partial<Special>;
  onSubmit: (data: Omit<Special, 'id'>) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [discountType, setDiscountType] = useState<Special['discountType']>(initial?.discountType || 'percentage');
  const [discountValue, setDiscountValue] = useState(initial?.discountValue ?? 0);
  const [startDate, setStartDate] = useState(initial?.startDate?.slice(0, 10) || '');
  const [endDate, setEndDate] = useState(initial?.endDate?.slice(0, 10) || '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), discountType, discountValue, startDate, endDate, isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="border-2 border-gray-200 p-4 bg-retro-cream/30 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-retro w-full"
            placeholder="Spring Brake Special"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as Special['discountType'])}
              className="input-retro w-full"
            >
              <option value="percentage">% Off</option>
              <option value="fixed">$ Off</option>
              <option value="bogo">BOGO</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Value</label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="input-retro w-full"
              min={0}
            />
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-gray-500">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-retro w-full min-h-[60px] resize-y"
          placeholder="Describe this special offer..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-retro w-full"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-retro w-full"
          />
        </div>
        <div className="flex items-center gap-3 pt-5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            <span className="ml-2 text-sm font-medium">{isActive ? 'Active' : 'Inactive'}</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border-2 border-black font-heading text-sm uppercase hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="bg-retro-red text-white px-4 py-2 border-2 border-black font-heading text-sm uppercase shadow-retro hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {initial ? 'Save' : 'Add Special'}
        </button>
      </div>
    </form>
  );
}

// ── Delete Confirmation ────────────────────────────────────────────────────

function DeleteConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black shadow-retro p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle size={24} className="text-retro-red" />
          <h3 className="font-heading text-lg uppercase">Confirm Delete</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border-2 border-black font-heading text-sm uppercase hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-retro-red text-white px-4 py-2 border-2 border-black font-heading text-sm uppercase shadow-retro hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Services Management Section ────────────────────────────────────────────

function ServicesSection() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [expanded, setExpanded] = useState(true);

  const { data: servicesRaw, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await servicesApi.getAll();
      const d = res.data;
      return Array.isArray(d) ? d : d?.data || [];
    },
  });
  const services: Service[] = servicesRaw || [];

  const createMutation = useMutation({
    mutationFn: (data: Omit<Service, 'id'>) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setShowForm(false);
      toast.success('Service added!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add service'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Service, 'id'> }) => servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setEditingId(null);
      toast.success('Service updated!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update service'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDeleteTarget(null);
      toast.success('Service deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete service'),
  });

  const formatDiscount = (svc: Service) => svc.priceRange || '';

  return (
    <div className="border-4 border-black shadow-retro bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-retro-navy text-white"
      >
        <div className="flex items-center gap-3">
          <Wrench size={22} />
          <h2 className="font-heading text-lg uppercase">Your Services</h2>
          <span className="bg-white/20 text-sm px-2 py-0.5 rounded">{services.length}</span>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setShowForm(true); setEditingId(null); }}
              className="bg-retro-mustard text-retro-navy font-heading uppercase px-4 py-2 border-2 border-black shadow-retro hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Add Service
            </button>
          </div>

          {showForm && !editingId && (
            <ServiceForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setShowForm(false)}
              submitting={createMutation.isPending}
            />
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 size={28} className="animate-spin text-retro-red mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 bg-gray-50">
              <Wrench size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-heading text-sm uppercase">No services yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Add your first service or use Smart Import above!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((svc) =>
                editingId === svc.id ? (
                  <ServiceForm
                    key={svc.id}
                    initial={svc}
                    onSubmit={(data) => updateMutation.mutate({ id: svc.id, data })}
                    onCancel={() => setEditingId(null)}
                    submitting={updateMutation.isPending}
                  />
                ) : (
                  <div
                    key={svc.id}
                    className="flex items-start justify-between p-4 border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading text-retro-navy">{svc.name}</span>
                        <span className={`text-xs px-2 py-0.5 font-semibold rounded ${CATEGORY_COLORS[svc.category] || CATEGORY_COLORS.Other}`}>
                          {svc.category}
                        </span>
                        {svc.isSpecialty && (
                          <span className="text-xs bg-retro-mustard/30 text-retro-navy px-2 py-0.5 font-semibold rounded">
                            Specialty
                          </span>
                        )}
                      </div>
                      {svc.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{svc.description}</p>
                      )}
                      {svc.priceRange && (
                        <p className="text-sm font-semibold text-retro-navy mt-1">{svc.priceRange}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={() => { setEditingId(svc.id); setShowForm(false); }}
                        className="p-2 text-gray-400 hover:text-retro-navy hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(svc)}
                        className="p-2 text-gray-400 hover:text-retro-red hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Specials Management Section ────────────────────────────────────────────

function SpecialsSection() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Special | null>(null);
  const [expanded, setExpanded] = useState(true);

  const { data: specialsRaw, isLoading } = useQuery({
    queryKey: ['specials'],
    queryFn: async () => {
      const res = await specialsApi.getAll();
      const d = res.data;
      return Array.isArray(d) ? d : d?.data || [];
    },
  });
  const specials: Special[] = specialsRaw || [];

  const createMutation = useMutation({
    mutationFn: (data: Omit<Special, 'id'>) => specialsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specials'] });
      setShowForm(false);
      toast.success('Special added!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add special'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Special, 'id'> }) => specialsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specials'] });
      setEditingId(null);
      toast.success('Special updated!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update special'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => specialsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specials'] });
      setDeleteTarget(null);
      toast.success('Special deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete special'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      specialsApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specials'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update special'),
  });

  const formatBadge = (sp: Special) => {
    if (sp.discountType === 'percentage') return `${sp.discountValue}% OFF`;
    if (sp.discountType === 'fixed') return `$${sp.discountValue} OFF`;
    return 'BOGO';
  };

  return (
    <div className="border-4 border-black shadow-retro bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-retro-navy text-white"
      >
        <div className="flex items-center gap-3">
          <Star size={22} />
          <h2 className="font-heading text-lg uppercase">Your Specials</h2>
          <span className="bg-white/20 text-sm px-2 py-0.5 rounded">{specials.length}</span>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setShowForm(true); setEditingId(null); }}
              className="bg-retro-mustard text-retro-navy font-heading uppercase px-4 py-2 border-2 border-black shadow-retro hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Add Special
            </button>
          </div>

          {showForm && !editingId && (
            <SpecialForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setShowForm(false)}
              submitting={createMutation.isPending}
            />
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 size={28} className="animate-spin text-retro-red mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Loading specials...</p>
            </div>
          ) : specials.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 bg-gray-50">
              <Star size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-heading text-sm uppercase">No specials yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Add a special offer or use Smart Import!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {specials.map((sp) =>
                editingId === sp.id ? (
                  <SpecialForm
                    key={sp.id}
                    initial={sp}
                    onSubmit={(data) => updateMutation.mutate({ id: sp.id, data })}
                    onCancel={() => setEditingId(null)}
                    submitting={updateMutation.isPending}
                  />
                ) : (
                  <div
                    key={sp.id}
                    className={`flex items-start justify-between p-4 border-2 transition-colors ${
                      sp.isActive ? 'border-gray-200 hover:border-gray-300' : 'border-gray-200 bg-gray-50 opacity-70'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading text-retro-navy">{sp.title}</span>
                        <span className="text-xs bg-retro-red text-white px-2 py-0.5 font-bold rounded">
                          {formatBadge(sp)}
                        </span>
                        {!sp.isActive && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 font-semibold rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      {sp.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{sp.description}</p>
                      )}
                      {(sp.startDate || sp.endDate) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {sp.startDate && `From ${new Date(sp.startDate).toLocaleDateString()}`}
                          {sp.startDate && sp.endDate && ' - '}
                          {sp.endDate && `Until ${new Date(sp.endDate).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <label className="relative inline-flex items-center cursor-pointer mr-2">
                        <input
                          type="checkbox"
                          checked={sp.isActive}
                          onChange={(e) =>
                            toggleActiveMutation.mutate({ id: sp.id, isActive: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                      <button
                        onClick={() => { setEditingId(sp.id); setShowForm(false); }}
                        className="p-2 text-gray-400 hover:text-retro-navy hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(sp)}
                        className="p-2 text-gray-400 hover:text-retro-red hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ServicesSpecialsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="heading-retro">Services & Specials</h1>
        <p className="text-gray-600 mt-2">
          Manage your shop's services and special offers. These power your AI-generated marketing content.
        </p>
      </div>

      <SmartImportSection onImportComplete={() => {}} />
      <ServicesSection />
      <SpecialsSection />
    </div>
  );
}
