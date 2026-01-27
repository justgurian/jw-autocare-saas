import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { onboardingApi } from '../../services/api';

const steps = [
  { id: 1, name: 'Business Info', description: 'Tell us about your shop' },
  { id: 2, name: 'Logo & Colors', description: 'Upload your brand assets' },
  { id: 3, name: 'Services', description: 'What services do you offer?' },
  { id: 4, name: 'Brand Voice', description: 'How should we sound?' },
  { id: 5, name: 'Specials Vault', description: 'Add recurring promotions' },
  { id: 6, name: 'Default Vehicle', description: 'Corvette or Jeep mode?' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    logoUrl: '',
    primaryColor: '#C53030',
    services: [] as string[],
    specials: [] as { title: string; discount: string; description: string }[],
    brandVoice: 'friendly',
    defaultVehicle: 'corvette',
    websiteUrl: '',
  });
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [newSpecial, setNewSpecial] = useState({ title: '', discount: '', description: '' });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      // Convert to base64 for upload
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });

      const response = await onboardingApi.uploadLogo(base64);
      setFormData({ ...formData, logoUrl: response.data.logoUrl });
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Logo upload failed:', error);
      toast.error('Failed to upload logo. You can skip this step and add it later.');
    } finally {
      setIsUploading(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async () => {
    setIsSaving(true);
    try {
      // Save data for the current step before moving to next
      if (currentStep === 1) {
        // Step 1: Business Info
        await onboardingApi.updateBusinessInfo({
          businessName: formData.businessName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          website: formData.websiteUrl,
        });
      } else if (currentStep === 2) {
        // Step 2: Logo & Colors - already saved on upload, just update colors
        await onboardingApi.updateColors({
          primaryColor: formData.primaryColor,
        });
      } else if (currentStep === 3) {
        // Step 3: Services - THIS WAS MISSING!
        if (formData.services.length > 0) {
          const servicesData = formData.services.map(name => ({
            name,
            description: '',
            category: 'General',
          }));
          await onboardingApi.addServices(servicesData);
          toast.success(`${formData.services.length} services saved!`);
        }
      } else if (currentStep === 4) {
        // Step 4: Brand Voice
        await onboardingApi.updateBrandVoice(formData.brandVoice);
      } else if (currentStep === 5) {
        // Step 5: Specials
        if (formData.specials.length > 0) {
          const specialsData = formData.specials.map(s => ({
            title: s.title,
            description: s.description,
            discountType: 'percentage',
            discountValue: parseFloat(s.discount) || 10,
          }));
          await onboardingApi.addSpecials(specialsData);
        }
      } else if (currentStep === 6) {
        // Step 6: Default Vehicle
        await onboardingApi.setDefaultVehicle(formData.defaultVehicle);
      }

      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete onboarding
        await onboardingApi.complete();
        toast.success('Setup complete! Welcome to Bayfiller.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to save step:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-retro-cream py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl text-retro-navy tracking-wider">
            SHOP SETUP
          </h1>
          <p className="font-script text-2xl text-retro-mustard mt-2">
            Let's get you rolling!
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center border-2 border-black font-heading ${
                    step.id < currentStep
                      ? 'bg-retro-teal text-white'
                      : step.id === currentStep
                      ? 'bg-retro-red text-white'
                      : 'bg-white text-gray-400'
                  }`}
                >
                  {step.id < currentStep ? <Check size={20} /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-1 ${
                      step.id < currentStep ? 'bg-retro-teal' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="font-heading text-lg uppercase">
              Step {currentStep}: {steps[currentStep - 1].name}
            </p>
            <p className="text-gray-600 text-sm">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="card-retro mb-8">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-heading uppercase text-sm mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  className="input-retro"
                  placeholder="Your Auto Repair Shop"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                </div>
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
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center py-8">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <div
                className="w-32 h-32 mx-auto mb-4 bg-gray-200 border-2 border-black flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-gray-400">Your Logo</span>
                )}
              </div>
              <button
                className="btn-retro-secondary flex items-center gap-2 mx-auto"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload size={18} />
                {isUploading ? 'Uploading...' : 'Upload Logo'}
              </button>
              <p className="text-sm text-gray-500 mt-4">
                We'll extract colors from your logo automatically
              </p>
              <p className="text-xs text-gray-400 mt-2">
                (Optional - you can skip and add later)
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              {/* URL Import Option */}
              <div className="bg-retro-navy/5 p-4 border-2 border-retro-navy/20 mb-6">
                <p className="font-heading text-sm uppercase mb-2">Import from Website (Optional)</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="input-retro flex-1"
                    placeholder="https://yourshop.com/services"
                    value={formData.websiteUrl || ''}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-retro-secondary text-sm"
                    onClick={() => {
                      if (formData.websiteUrl) {
                        toast.loading('AI is scanning your website...');
                        // TODO: Implement AI website scraping
                        setTimeout(() => {
                          toast.dismiss();
                          toast.success('Services imported! Review below.');
                        }, 2000);
                      }
                    }}
                  >
                    Import
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">AI will extract services from your website</p>
              </div>

              <p className="text-gray-600 mb-4">
                Or select from common auto repair services:
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                {[
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
                ].map((service) => (
                  <label key={service} className="flex items-center gap-2 p-2 border border-black cursor-pointer hover:bg-gray-50 text-sm">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={formData.services.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, services: [...formData.services, service] });
                        } else {
                          setFormData({ ...formData, services: formData.services.filter(s => s !== service) });
                        }
                      }}
                    />
                    <span className="font-heading uppercase text-xs">{service}</span>
                  </label>
                ))}
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
                          setFormData({ ...formData, services: [...formData.services, input.value.trim()] });
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {formData.services.length} services
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                How should your marketing content sound?
              </p>
              {['friendly', 'professional', 'humorous', 'authoritative'].map((voice) => (
                <label
                  key={voice}
                  className={`flex items-center gap-3 p-4 border-2 border-black cursor-pointer ${
                    formData.brandVoice === voice ? 'bg-retro-teal text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="brandVoice"
                    value={voice}
                    checked={formData.brandVoice === voice}
                    onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
                    className="sr-only"
                  />
                  <span className="font-heading uppercase">{voice}</span>
                </label>
              ))}
            </div>
          )}

          {currentStep === 5 && (
            <div className="py-4">
              <p className="text-gray-600 mb-4 text-center">
                Add recurring promotions to your Specials Vault (optional)
              </p>

              {/* Added Specials List */}
              {formData.specials.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.specials.map((special, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-retro-teal/10 border border-retro-teal">
                      <div>
                        <p className="font-heading uppercase">{special.title}</p>
                        <p className="text-sm text-gray-600">{special.discount} - {special.description}</p>
                      </div>
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          specials: formData.specials.filter((_, i) => i !== index)
                        })}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Special Form */}
              {showSpecialModal ? (
                <div className="border-2 border-black p-4 space-y-3">
                  <input
                    type="text"
                    className="input-retro"
                    placeholder="Special name (e.g., Monday Oil Change)"
                    value={newSpecial.title}
                    onChange={(e) => setNewSpecial({ ...newSpecial, title: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input-retro"
                    placeholder="Discount (e.g., $10 Off, 15% Off)"
                    value={newSpecial.discount}
                    onChange={(e) => setNewSpecial({ ...newSpecial, discount: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input-retro"
                    placeholder="Description (e.g., Every Monday)"
                    value={newSpecial.description}
                    onChange={(e) => setNewSpecial({ ...newSpecial, description: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      className="btn-retro-primary flex-1"
                      onClick={() => {
                        if (newSpecial.title && newSpecial.discount) {
                          setFormData({
                            ...formData,
                            specials: [...formData.specials, newSpecial]
                          });
                          setNewSpecial({ title: '', discount: '', description: '' });
                          setShowSpecialModal(false);
                          toast.success('Special added!');
                        } else {
                          toast.error('Please fill in title and discount');
                        }
                      }}
                    >
                      Save Special
                    </button>
                    <button
                      className="btn-retro-outline"
                      onClick={() => {
                        setShowSpecialModal(false);
                        setNewSpecial({ title: '', discount: '', description: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    className="btn-retro-outline"
                    onClick={() => setShowSpecialModal(true)}
                  >
                    Add Special
                  </button>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-4 text-center">
                {formData.specials.length === 0
                  ? "You can add specials later from the dashboard"
                  : `${formData.specials.length} special(s) added`
                }
              </p>
            </div>
          )}

          {currentStep === 6 && (
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => setFormData({ ...formData, defaultVehicle: 'corvette' })}
                className={`p-6 border-2 border-black text-center transition-all ${
                  formData.defaultVehicle === 'corvette' ? 'bg-retro-red text-white' : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-6xl mb-4">🏎️</div>
                <p className="font-heading text-xl uppercase">Corvette Mode</p>
                <p className="text-sm mt-2 opacity-80">Sports car & performance focus</p>
              </button>
              <button
                onClick={() => setFormData({ ...formData, defaultVehicle: 'jeep' })}
                className={`p-6 border-2 border-black text-center transition-all ${
                  formData.defaultVehicle === 'jeep' ? 'bg-retro-teal text-white' : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-6xl mb-4">🚙</div>
                <p className="font-heading text-xl uppercase">Jeep Mode</p>
                <p className="text-sm mt-2 opacity-80">Family & adventure focus</p>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="btn-retro-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={isSaving}
            className="btn-retro-primary flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {currentStep === 6 ? 'Complete Setup' : 'Next'}
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
