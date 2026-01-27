import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Building2, Phone, Mail, Globe, MapPin, Palette,
  MessageSquare, Tag, Star, Users, Target, Plus, X,
  Save, Loader2, CheckCircle, AlertCircle, Camera
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface ProfileData {
  businessName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  tagline: string;
  brandVoice: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  specialties: string[];
  uniqueSellingPoints: string[];
  targetDemographics: string;
  targetPainPoints: string;
  defaultVehicle: 'corvette' | 'jeep';
}

interface Completion {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
  suggestions: string[];
}

const SPECIALTY_OPTIONS = [
  'Domestic Vehicles', 'Import Vehicles', 'European Cars', 'Asian Makes',
  'Diesel Engines', 'Hybrid/Electric', 'Classic Cars', 'Performance Vehicles',
  'Fleet Services', 'Trucks & SUVs', 'Transmission', 'Brake Systems',
  'AC & Heating', 'Engine Repair', 'Diagnostics', 'Oil & Lube',
  'Tires & Alignment', 'Suspension', 'Electrical Systems', 'State Inspection'
];

const BRAND_VOICE_OPTIONS = [
  { value: 'friendly', label: 'Friendly & Approachable', desc: 'Warm, welcoming, like talking to a neighbor' },
  { value: 'professional', label: 'Professional & Trustworthy', desc: 'Reliable, experienced, confidence-inspiring' },
  { value: 'technical', label: 'Technical & Expert', desc: 'Detailed, knowledgeable, educational' },
  { value: 'neighborhood', label: 'Neighborhood & Family', desc: 'Community-focused, family-owned feel' },
  { value: 'humorous', label: 'Fun & Humorous', desc: 'Lighthearted, memorable, personality-driven' },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [usps, setUsps] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newUsp, setNewUsp] = useState('');
  const [activeTab, setActiveTab] = useState<'business' | 'brand' | 'audience'>('business');

  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<ProfileData>();

  const primaryColor = watch('primaryColor');
  const secondaryColor = watch('secondaryColor');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/brand-kit/profile');
      const { brandKit, completion: comp } = response.data;

      if (brandKit) {
        // Set form values
        Object.keys(brandKit).forEach(key => {
          if (key !== 'specialties' && key !== 'uniqueSellingPoints') {
            setValue(key as keyof ProfileData, brandKit[key] || '');
          }
        });

        setSpecialties(brandKit.specialties || []);
        setUsps(brandKit.uniqueSellingPoints || []);
      }

      setCompletion(comp);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileData) => {
    setSaving(true);
    try {
      const response = await api.put('/brand-kit/profile', {
        ...data,
        specialties,
        uniqueSellingPoints: usps,
      });

      setCompletion(response.data.completion);
      toast.success('Profile saved successfully!');
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty && !specialties.includes(newSpecialty)) {
      setSpecialties([...specialties, newSpecialty]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (spec: string) => {
    setSpecialties(specialties.filter(s => s !== spec));
  };

  const addUsp = () => {
    if (newUsp && !usps.includes(newUsp)) {
      setUsps([...usps, newUsp]);
      setNewUsp('');
    }
  };

  const removeUsp = (index: number) => {
    setUsps(usps.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-retro-red mx-auto mb-4" />
          <p className="font-heading text-retro-navy">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with Completion */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="heading-retro">Business Profile</h1>
          <p className="text-gray-600 mt-2">
            Complete your profile to personalize all AI-generated content
          </p>
        </div>

        {/* Completion Badge */}
        {completion && (
          <div className="card-retro p-4 flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke={completion.percentage >= 80 ? '#059669' : completion.percentage >= 50 ? '#d97706' : '#dc2626'}
                  strokeWidth="6"
                  strokeDasharray={`${completion.percentage * 1.76} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                {completion.percentage}%
              </span>
            </div>
            <div>
              <p className="font-heading text-sm uppercase">Profile Complete</p>
              {completion.suggestions.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Next: {completion.suggestions[0]}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Banner */}
      {completion && completion.percentage < 100 && completion.suggestions.length > 0 && (
        <div className="bg-retro-mustard/20 border-2 border-retro-mustard p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-retro-mustard flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Complete your profile for better AI content</p>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              {completion.suggestions.map((suggestion, i) => (
                <li key={i}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b-2 border-gray-200">
        {[
          { id: 'business', label: 'Business Info', icon: Building2 },
          { id: 'brand', label: 'Brand Identity', icon: Palette },
          { id: 'audience', label: 'Target Audience', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-heading text-sm uppercase border-b-4 -mb-0.5 transition-colors ${
              activeTab === tab.id
                ? 'border-retro-red text-retro-red'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Info Tab */}
        {activeTab === 'business' && (
          <div className="card-retro space-y-6">
            <h2 className="font-heading text-lg uppercase flex items-center gap-2">
              <Building2 size={20} />
              Business Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-retro">Business Name *</label>
                <input
                  {...register('businessName', { required: 'Business name is required' })}
                  className="input-retro"
                  placeholder="Your Shop Name"
                />
                {errors.businessName && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>
                )}
              </div>

              <div>
                <label className="label-retro">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('phone')}
                    className="input-retro pl-10"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="label-retro">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    className="input-retro pl-10"
                    placeholder="info@jwautocare.com"
                  />
                </div>
              </div>

              <div>
                <label className="label-retro">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('website')}
                    className="input-retro pl-10"
                    placeholder="https://jwautocare.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label-retro">Street Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  {...register('address')}
                  className="input-retro pl-10"
                  placeholder="123 Main Street"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="label-retro">City</label>
                <input
                  {...register('city')}
                  className="input-retro"
                  placeholder="Phoenix"
                />
              </div>
              <div>
                <label className="label-retro">State</label>
                <input
                  {...register('state')}
                  className="input-retro"
                  placeholder="AZ"
                />
              </div>
              <div>
                <label className="label-retro">ZIP Code</label>
                <input
                  {...register('zipCode')}
                  className="input-retro"
                  placeholder="85001"
                />
              </div>
            </div>

            {/* Specialties */}
            <div>
              <label className="label-retro flex items-center gap-2">
                <Star size={16} />
                Shop Specialties
              </label>
              <p className="text-sm text-gray-500 mb-3">
                What types of vehicles or services do you specialize in?
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {specialties.map((spec) => (
                  <span
                    key={spec}
                    className="badge-retro bg-retro-teal text-white flex items-center gap-1"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(spec)}
                      className="hover:bg-white/20 rounded p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <select
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  className="input-retro flex-1"
                >
                  <option value="">Select a specialty...</option>
                  {SPECIALTY_OPTIONS.filter(s => !specialties.includes(s)).map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addSpecialty}
                  disabled={!newSpecialty}
                  className="btn-retro-secondary flex items-center gap-1"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Brand Identity Tab */}
        {activeTab === 'brand' && (
          <div className="card-retro space-y-6">
            <h2 className="font-heading text-lg uppercase flex items-center gap-2">
              <Palette size={20} />
              Brand Identity
            </h2>

            {/* Tagline */}
            <div>
              <label className="label-retro flex items-center gap-2">
                <Tag size={16} />
                Tagline / Slogan
              </label>
              <input
                {...register('tagline')}
                className="input-retro"
                placeholder="Your Trusted Neighborhood Auto Shop"
              />
              <p className="text-sm text-gray-500 mt-1">
                A catchy phrase that represents your business
              </p>
            </div>

            {/* Brand Voice */}
            <div>
              <label className="label-retro flex items-center gap-2">
                <MessageSquare size={16} />
                Brand Voice
              </label>
              <p className="text-sm text-gray-500 mb-3">
                How should your marketing content sound?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BRAND_VOICE_OPTIONS.map((voice) => (
                  <label
                    key={voice.value}
                    className={`p-4 border-2 cursor-pointer transition-all ${
                      watch('brandVoice') === voice.value
                        ? 'border-retro-red bg-retro-red/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('brandVoice')}
                      value={voice.value}
                      className="sr-only"
                    />
                    <p className="font-semibold">{voice.label}</p>
                    <p className="text-sm text-gray-500">{voice.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="label-retro">Brand Colors</label>
              <p className="text-sm text-gray-500 mb-3">
                These colors will be incorporated into your generated content
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Primary</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      {...register('primaryColor')}
                      className="w-12 h-12 border-2 border-black cursor-pointer"
                    />
                    <input
                      {...register('primaryColor')}
                      className="input-retro flex-1 uppercase"
                      placeholder="#C53030"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Secondary</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      {...register('secondaryColor')}
                      className="w-12 h-12 border-2 border-black cursor-pointer"
                    />
                    <input
                      {...register('secondaryColor')}
                      className="input-retro flex-1 uppercase"
                      placeholder="#2C7A7B"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      {...register('accentColor')}
                      className="w-12 h-12 border-2 border-black cursor-pointer"
                    />
                    <input
                      {...register('accentColor')}
                      className="input-retro flex-1 uppercase"
                      placeholder="#D69E2E"
                    />
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              {(primaryColor || secondaryColor) && (
                <div className="mt-4 p-4 border-2 border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Preview:</p>
                  <div className="flex gap-2">
                    {primaryColor && (
                      <div
                        className="w-16 h-16 border-2 border-black flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Aa
                      </div>
                    )}
                    {secondaryColor && (
                      <div
                        className="w-16 h-16 border-2 border-black flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        Aa
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Unique Selling Points */}
            <div>
              <label className="label-retro flex items-center gap-2">
                <CheckCircle size={16} />
                What Makes You Unique?
              </label>
              <p className="text-sm text-gray-500 mb-3">
                List the things that set your shop apart from competitors
              </p>

              <div className="space-y-2 mb-3">
                {usps.map((usp, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 p-3 border-2 border-gray-200"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="flex-1">{usp}</span>
                    <button
                      type="button"
                      onClick={() => removeUsp(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={newUsp}
                  onChange={(e) => setNewUsp(e.target.value)}
                  className="input-retro flex-1"
                  placeholder="e.g., Same-day service available"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUsp())}
                />
                <button
                  type="button"
                  onClick={addUsp}
                  disabled={!newUsp}
                  className="btn-retro-secondary flex items-center gap-1"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>

            {/* Default Vehicle */}
            <div>
              <label className="label-retro">Default Vehicle Style</label>
              <p className="text-sm text-gray-500 mb-3">
                Vehicle style used in generated images when not specified
              </p>
              <div className="flex gap-4">
                <label className={`flex-1 p-4 border-2 cursor-pointer text-center ${
                  watch('defaultVehicle') === 'corvette'
                    ? 'border-retro-red bg-retro-red/5'
                    : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    {...register('defaultVehicle')}
                    value="corvette"
                    className="sr-only"
                  />
                  <span className="text-4xl">🏎️</span>
                  <p className="font-semibold mt-2">Classic Corvette</p>
                  <p className="text-sm text-gray-500">Sports car feel</p>
                </label>
                <label className={`flex-1 p-4 border-2 cursor-pointer text-center ${
                  watch('defaultVehicle') === 'jeep'
                    ? 'border-retro-red bg-retro-red/5'
                    : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    {...register('defaultVehicle')}
                    value="jeep"
                    className="sr-only"
                  />
                  <span className="text-4xl">🚙</span>
                  <p className="font-semibold mt-2">Rugged Jeep</p>
                  <p className="text-sm text-gray-500">Adventure feel</p>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Target Audience Tab */}
        {activeTab === 'audience' && (
          <div className="card-retro space-y-6">
            <h2 className="font-heading text-lg uppercase flex items-center gap-2">
              <Users size={20} />
              Target Audience
            </h2>
            <p className="text-gray-500">
              Help AI create content that resonates with your ideal customers
            </p>

            <div>
              <label className="label-retro flex items-center gap-2">
                <Users size={16} />
                Who Are Your Typical Customers?
              </label>
              <textarea
                {...register('targetDemographics')}
                className="input-retro min-h-[100px]"
                placeholder="e.g., Families with multiple vehicles, commuters, small business owners with fleet vehicles, classic car enthusiasts..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Describe age groups, occupations, vehicle types, etc.
              </p>
            </div>

            <div>
              <label className="label-retro flex items-center gap-2">
                <Target size={16} />
                What Problems Do They Face?
              </label>
              <textarea
                {...register('targetPainPoints')}
                className="input-retro min-h-[100px]"
                placeholder="e.g., Worried about being overcharged, need reliable transportation for work, don't have time to wait for repairs..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Understanding pain points helps create compelling marketing
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-retro-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
