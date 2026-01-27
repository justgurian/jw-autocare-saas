import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  User,
  Building2,
  Palette,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  X,
  QrCode,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../../services/api';

interface CardStyle {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  features: string[];
}

interface CardResult {
  frontImageUrl: string;
  backImageUrl?: string;
  printReadyPdfUrl: string;
}

type CardOrientation = 'horizontal' | 'vertical';
type FormStep = 'staff' | 'shop' | 'style' | 'preview';

export default function BusinessCardsPage() {
  const [step, setStep] = useState<FormStep>('staff');
  const [staffName, setStaffName] = useState('');
  const [staffTitle, setStaffTitle] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState('');

  const [shopName, setShopName] = useState('');
  const [shopTagline, setShopTagline] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopWebsite, setShopWebsite] = useState('');
  const [shopAddress, setShopAddress] = useState('');

  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [orientation, setOrientation] = useState<CardOrientation>('horizontal');
  const [includeQR, setIncludeQR] = useState(false);
  const [includeBack, setIncludeBack] = useState(true);

  const [result, setResult] = useState<CardResult | null>(null);
  const [showCerts, setShowCerts] = useState(false);

  // Fetch card styles
  const { data: stylesData } = useQuery<{ styles: CardStyle[] }>({
    queryKey: ['business-cards', 'styles'],
    queryFn: async () => {
      const response = await api.get('/tools/business-cards/styles');
      return response.data;
    },
  });

  // Fetch common titles
  const { data: titlesData } = useQuery<{ titles: string[] }>({
    queryKey: ['business-cards', 'titles'],
    queryFn: async () => {
      const response = await api.get('/tools/business-cards/titles');
      return response.data;
    },
  });

  // Fetch certifications
  const { data: certsData } = useQuery<{ certifications: string[] }>({
    queryKey: ['business-cards', 'certifications'],
    queryFn: async () => {
      const response = await api.get('/tools/business-cards/certifications');
      return response.data;
    },
  });

  // Generate card mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tools/business-cards/generate', {
        staff: {
          name: staffName,
          title: staffTitle,
          email: staffEmail,
          phone: staffPhone,
          certifications,
          specialties,
        },
        shop: {
          name: shopName,
          tagline: shopTagline,
          phone: shopPhone,
          website: shopWebsite,
          address: shopAddress,
        },
        style: selectedStyle,
        orientation,
        includeQR,
        includeBackDesign: includeBack,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data.result);
      setStep('preview');
    },
  });

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()]);
      setSpecialtyInput('');
    }
  };

  const toggleCertification = (cert: string) => {
    if (certifications.includes(cert)) {
      setCertifications(certifications.filter((c) => c !== cert));
    } else {
      setCertifications([...certifications, cert]);
    }
  };

  const canProceedToShop = staffName.trim() && staffTitle.trim();
  const canProceedToStyle = shopName.trim() && shopPhone.trim();

  const selectedStyleData = stylesData?.styles.find((s) => s.id === selectedStyle);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-retro-navy mb-2">Business Cards</h1>
        <p className="text-gray-600">
          Create professional business cards for your auto shop team
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-2 border-black p-4 mb-6">
        <div className="flex items-center justify-between">
          {[
            { id: 'staff', label: 'Staff Info', icon: User },
            { id: 'shop', label: 'Shop Info', icon: Building2 },
            { id: 'style', label: 'Style', icon: Palette },
            { id: 'preview', label: 'Preview', icon: CreditCard },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => {
                  if (s.id === 'staff' || (s.id === 'shop' && canProceedToShop) ||
                      (s.id === 'style' && canProceedToShop && canProceedToStyle) ||
                      (s.id === 'preview' && result)) {
                    setStep(s.id as FormStep);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 border-2 transition-all ${
                  step === s.id
                    ? 'border-retro-red bg-retro-red/5'
                    : 'border-gray-200 hover:border-retro-navy'
                }`}
              >
                <s.icon size={18} />
                <span className="font-heading text-sm hidden sm:inline">{s.label}</span>
              </button>
              {i < 3 && <div className="w-4 sm:w-8 h-0.5 bg-gray-300 mx-1 sm:mx-2" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Staff Info Step */}
          {step === 'staff' && (
            <div className="bg-white border-2 border-black p-6 space-y-4">
              <h3 className="font-heading uppercase mb-4">Staff Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 border-2 border-black"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                    Job Title *
                  </label>
                  <select
                    value={staffTitle}
                    onChange={(e) => setStaffTitle(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black"
                  >
                    <option value="">Select title...</option>
                    {titlesData?.titles.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                    <option value="custom">Custom...</option>
                  </select>
                  {staffTitle === 'custom' && (
                    <input
                      type="text"
                      onChange={(e) => setStaffTitle(e.target.value)}
                      placeholder="Enter custom title"
                      className="w-full px-3 py-2 border-2 border-black mt-2"
                    />
                  )}
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="john@autoshop.com"
                    className="w-full px-3 py-2 border-2 border-black"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                    Direct Phone
                  </label>
                  <input
                    type="tel"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border-2 border-black"
                  />
                </div>
              </div>

              {/* Certifications */}
              <div>
                <button
                  onClick={() => setShowCerts(!showCerts)}
                  className="flex items-center justify-between w-full py-2 text-left"
                >
                  <span className="text-xs font-heading uppercase text-gray-600">
                    Certifications ({certifications.length} selected)
                  </span>
                  {showCerts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showCerts && (
                  <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-gray-50 border-2 border-gray-200">
                    {certsData?.certifications.map((cert) => (
                      <button
                        key={cert}
                        onClick={() => toggleCertification(cert)}
                        className={`p-2 text-left text-sm border-2 transition-all ${
                          certifications.includes(cert)
                            ? 'border-retro-red bg-retro-red/5'
                            : 'border-gray-200 hover:border-retro-navy'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {certifications.includes(cert) && <Check size={14} className="text-retro-red" />}
                          <span>{cert}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                  Specialties
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialty()}
                    placeholder="Add specialty..."
                    className="flex-1 px-3 py-2 border-2 border-black text-sm"
                  />
                  <button
                    onClick={handleAddSpecialty}
                    className="px-4 py-2 bg-gray-100 border-2 border-black"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-1 bg-retro-navy/10 text-sm flex items-center gap-1"
                    >
                      {spec}
                      <button
                        onClick={() => setSpecialties(specialties.filter((s) => s !== spec))}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('shop')}
                disabled={!canProceedToShop}
                className="w-full py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 font-heading uppercase"
              >
                Next: Shop Info
              </button>
            </div>
          )}

          {/* Shop Info Step */}
          {step === 'shop' && (
            <div className="bg-white border-2 border-black p-6 space-y-4">
              <h3 className="font-heading uppercase mb-4">Shop Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Your Shop Name"
                    className="w-full px-3 py-2 border-2 border-black"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={shopTagline}
                    onChange={(e) => setShopTagline(e.target.value)}
                    placeholder="Your Trusted Auto Care Experts"
                    className="w-full px-3 py-2 border-2 border-black"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                    Main Phone *
                  </label>
                  <input
                    type="tel"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    placeholder="(555) 987-6543"
                    className="w-full px-3 py-2 border-2 border-black"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={shopWebsite}
                    onChange={(e) => setShopWebsite(e.target.value)}
                    placeholder="www.jwautocare.com"
                    className="w-full px-3 py-2 border-2 border-black"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    placeholder="123 Main St, Anytown, USA"
                    className="w-full px-3 py-2 border-2 border-black"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('staff')}
                  className="flex-1 py-2 border-2 border-black hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('style')}
                  disabled={!canProceedToStyle}
                  className="flex-1 py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 font-heading uppercase"
                >
                  Next: Choose Style
                </button>
              </div>
            </div>
          )}

          {/* Style Selection Step */}
          {step === 'style' && (
            <div className="bg-white border-2 border-black p-6 space-y-6">
              <h3 className="font-heading uppercase mb-4">Choose Your Style</h3>

              {/* Orientation */}
              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-2">
                  Orientation
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOrientation('horizontal')}
                    className={`flex-1 p-4 border-2 flex flex-col items-center gap-2 ${
                      orientation === 'horizontal'
                        ? 'border-retro-red bg-retro-red/5'
                        : 'border-black hover:border-retro-navy'
                    }`}
                  >
                    <div className="w-20 h-12 border-2 border-current" />
                    <span className="text-sm">Horizontal</span>
                  </button>
                  <button
                    onClick={() => setOrientation('vertical')}
                    className={`flex-1 p-4 border-2 flex flex-col items-center gap-2 ${
                      orientation === 'vertical'
                        ? 'border-retro-red bg-retro-red/5'
                        : 'border-black hover:border-retro-navy'
                    }`}
                  >
                    <div className="w-12 h-20 border-2 border-current" />
                    <span className="text-sm">Vertical</span>
                  </button>
                </div>
              </div>

              {/* Style Grid */}
              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-2">
                  Card Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {stylesData?.styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-4 text-left border-2 transition-all ${
                        selectedStyle === style.id
                          ? 'border-retro-red bg-retro-red/5'
                          : 'border-gray-200 hover:border-retro-navy'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {Object.values(style.colors).slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <h4 className="font-heading text-sm">{style.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{style.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeQR}
                    onChange={(e) => setIncludeQR(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <QrCode size={16} />
                  <span className="text-sm">Include QR Code</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBack}
                    onChange={(e) => setIncludeBack(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <RotateCcw size={16} />
                  <span className="text-sm">Include Back Design</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('shop')}
                  className="flex-1 py-2 border-2 border-black hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="flex-1 py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 font-heading uppercase flex items-center justify-center gap-2"
                >
                  {generateMutation.isPending ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Generate Card
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && result && (
            <div className="bg-white border-2 border-black p-6 space-y-6">
              <h3 className="font-heading uppercase mb-4">Your Business Card</h3>

              {/* Card Preview */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-heading uppercase text-gray-600 mb-2">Front</p>
                  <div className={`border-2 border-black bg-gray-100 flex items-center justify-center ${
                    orientation === 'horizontal' ? 'aspect-[7/4]' : 'aspect-[4/7] max-w-xs mx-auto'
                  }`}>
                    {result.frontImageUrl ? (
                      <img
                        src={result.frontImageUrl}
                        alt="Card Front"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-8 text-center">
                        <CreditCard size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="font-heading text-lg">{staffName}</p>
                        <p className="text-sm text-gray-500">{staffTitle}</p>
                        <p className="text-sm mt-4">{shopName}</p>
                        <p className="text-xs text-gray-500">{shopPhone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {includeBack && (
                  <div>
                    <p className="text-xs font-heading uppercase text-gray-600 mb-2">Back</p>
                    <div className={`border-2 border-black bg-gray-100 flex items-center justify-center ${
                      orientation === 'horizontal' ? 'aspect-[7/4]' : 'aspect-[4/7] max-w-xs mx-auto'
                    }`}>
                      {result.backImageUrl ? (
                        <img
                          src={result.backImageUrl}
                          alt="Card Back"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="p-8 text-center">
                          <p className="font-heading text-lg">{shopName}</p>
                          {shopTagline && <p className="text-sm text-gray-500 italic">{shopTagline}</p>}
                          {shopAddress && <p className="text-xs text-gray-500 mt-4">{shopAddress}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('style')}
                  className="flex-1 py-2 border-2 border-black flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <RefreshCw size={16} />
                  Regenerate
                </button>
                <button
                  className="flex-1 py-3 bg-retro-navy text-white border-2 border-black flex items-center justify-center gap-2 hover:bg-retro-navy/90"
                >
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Card Summary */}
          <div className="bg-white border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-3">Card Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span>{staffName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Title:</span>
                <span>{staffTitle || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shop:</span>
                <span>{shopName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Style:</span>
                <span className="capitalize">{selectedStyle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Orientation:</span>
                <span className="capitalize">{orientation}</span>
              </div>
            </div>
          </div>

          {/* Selected Style Preview */}
          {selectedStyleData && (
            <div className="bg-white border-2 border-black p-4">
              <h3 className="font-heading text-sm uppercase mb-3">Selected Style</h3>
              <div
                className="p-4 border-2 border-black mb-3"
                style={{ backgroundColor: selectedStyleData.colors.background }}
              >
                <p
                  className="font-bold text-lg"
                  style={{ color: selectedStyleData.colors.primary }}
                >
                  {selectedStyleData.name}
                </p>
                <p
                  className="text-sm"
                  style={{ color: selectedStyleData.colors.secondary }}
                >
                  {selectedStyleData.description}
                </p>
              </div>
              <div className="flex gap-2">
                {Object.entries(selectedStyleData.colors).slice(0, 4).map(([name, color]) => (
                  <div key={name} className="text-center">
                    <div
                      className="w-8 h-8 rounded border border-gray-300 mx-auto"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-gray-500 capitalize">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-retro-cream border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-2">Card Tips</h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Keep information minimal and readable</li>
              <li>• Include only essential contact details</li>
              <li>• Certifications build trust with customers</li>
              <li>• QR codes can link to your booking page</li>
              <li>• Order print-ready PDFs at 300 DPI</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
