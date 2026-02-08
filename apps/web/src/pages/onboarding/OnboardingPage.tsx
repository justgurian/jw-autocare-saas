import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { onboardingApi, promoFlyerApi } from '../../services/api';
import BusinessInfoStep from './components/BusinessInfoStep';
import LogoStep from './components/LogoStep';
import ServicesStep from './components/ServicesStep';
import BrandVoiceStep from './components/BrandVoiceStep';
import SpecialsStep from './components/SpecialsStep';
import CarPreferencesStep from './components/CarPreferencesStep';
import StyleTasteTestStep from './components/StyleTasteTestStep';

const steps = [
  { id: 1, name: 'Business Info', description: 'Tell us about your shop' },
  { id: 2, name: 'Logo & Colors', description: 'Upload your brand assets' },
  { id: 3, name: 'Services', description: 'What services do you offer?' },
  { id: 4, name: 'Brand Voice', description: 'How should we sound?' },
  { id: 5, name: 'Specials Vault', description: 'Add recurring promotions' },
  { id: 6, name: 'Car Preferences', description: 'What cars do your customers drive?' },
  { id: 7, name: 'Style Taste', description: 'Pick your favorite flyer styles' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [serverSpecialIds, setServerSpecialIds] = useState<Set<string>>(new Set());
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
    vehiclePreferences: { lovedMakes: [] as Array<{makeId: string; models?: string[]}>, neverMakes: [] as string[] },
    websiteUrl: '',
    styleFamilyIds: [] as string[],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Restore progress from server on mount
  useEffect(() => {
    async function restoreProgress() {
      try {
        const [statusRes, brandKitRes] = await Promise.allSettled([
          onboardingApi.getStatus(),
          onboardingApi.getBrandKit(),
        ]);

        let restoredStep = 1;
        if (statusRes.status === 'fulfilled') {
          const status = statusRes.value.data;
          // Find the first incomplete step, or resume at currentStep
          const firstIncomplete = status.steps?.find((s: { completed: boolean }) => !s.completed);
          restoredStep = firstIncomplete ? firstIncomplete.step : (status.currentStep || 1);
        }

        if (brandKitRes.status === 'fulfilled') {
          const bk = brandKitRes.value.data;
          setFormData(prev => ({
            ...prev,
            businessName: bk.businessName || prev.businessName,
            phone: bk.phone || prev.phone,
            address: bk.address || prev.address,
            city: bk.city || prev.city,
            state: bk.state || prev.state,
            logoUrl: bk.logoUrl || prev.logoUrl,
            primaryColor: bk.primaryColor || prev.primaryColor,
            brandVoice: bk.brandVoice || prev.brandVoice,
            websiteUrl: bk.website || prev.websiteUrl,
          }));
          if (bk.logoUrl) {
            setLogoPreview(bk.logoUrl);
          }
        }

        setCurrentStep(Math.max(1, Math.min(restoredStep, 7)));
      } catch {
        // If restore fails, start fresh — that's fine
      } finally {
        setIsRestoring(false);
      }
    }
    restoreProgress();
  }, []);

  const handleNext = async () => {
    // Frontend validation before saving
    if (currentStep === 1 && !formData.businessName.trim()) {
      toast.error('Please enter your business name.');
      return;
    }
    if (currentStep === 3 && formData.services.length === 0) {
      toast.error('Please select at least one service before continuing.');
      return;
    }

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
          timezone: formData.timezone,
        });
      } else if (currentStep === 2) {
        // Step 2: Logo & Colors - already saved on upload, just update colors
        await onboardingApi.updateColors({
          primary: formData.primaryColor,
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
        // Step 5: Specials — only send new ones to avoid duplicates
        const newSpecials = formData.specials.filter(s => !serverSpecialIds.has(s.title));
        if (newSpecials.length > 0) {
          const specialsData = newSpecials.map(s => ({
            title: s.title,
            description: s.description,
            discountType: 'percentage',
            discountValue: parseFloat(s.discount) || 10,
          }));
          await onboardingApi.addSpecials(specialsData);
        }
      } else if (currentStep === 6) {
        // Step 6: Car Preferences (optional — skip if nothing selected)
        if (formData.vehiclePreferences.lovedMakes.length > 0 || formData.vehiclePreferences.neverMakes.length > 0) {
          await promoFlyerApi.saveVehiclePreferences(formData.vehiclePreferences);
        }
      } else if (currentStep === 7) {
        // Step 7: Style Taste Test — save preferences (optional), then complete
        if (formData.styleFamilyIds.length > 0) {
          try {
            await promoFlyerApi.savePreferences(formData.styleFamilyIds);
          } catch (prefErr) {
            // Preferences are nice-to-have — don't block completion
            console.warn('Style preferences save failed (non-blocking):', prefErr);
          }
        }
      }

      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step — complete onboarding
        await onboardingApi.complete();
        toast.success('Setup complete! Welcome to Bayfiller.');
        localStorage.setItem('startDashboardTour', 'true');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Failed to save step:', error);
      // Extract the actual server error message
      const serverMsg = error?.response?.data?.message || error?.message || '';
      if (serverMsg.toLowerCase().includes('service')) {
        // Services validation failed — redirect to step 3
        toast.error('Please add at least one service before completing setup.');
        setCurrentStep(3);
      } else if (serverMsg.toLowerCase().includes('business name')) {
        toast.error('Please add your business name before completing setup.');
        setCurrentStep(1);
      } else if (serverMsg) {
        toast.error(serverMsg);
      } else {
        toast.error('Failed to save. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-retro-cream dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin-slow w-12 h-12 border-4 border-retro-red border-t-transparent rounded-full mx-auto mb-3" />
          <p className="font-heading text-retro-navy dark:text-gray-100">Restoring your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-cream dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl text-retro-navy dark:text-gray-100 tracking-wider">
            SHOP SETUP
          </h1>
          <p className="font-heading text-2xl text-retro-mustard mt-2 italic">
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
                      : 'bg-white dark:bg-gray-700 text-gray-400'
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
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="card-retro mb-8">
          {currentStep === 1 && (
            <BusinessInfoStep formData={formData} setFormData={setFormData} />
          )}

          {currentStep === 2 && (
            <LogoStep
              formData={formData}
              setFormData={setFormData}
              logoPreview={logoPreview}
              setLogoPreview={setLogoPreview}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          )}

          {currentStep === 3 && (
            <ServicesStep
              selectedServices={formData.services}
              onServicesChange={(services) => setFormData({ ...formData, services })}
              websiteUrl={formData.websiteUrl}
              onWebsiteUrlChange={(url) => setFormData({ ...formData, websiteUrl: url })}
              onSpecialsExtracted={(specials) => setFormData(prev => ({
                ...prev,
                specials: [...prev.specials, ...specials],
              }))}
            />
          )}

          {currentStep === 4 && (
            <BrandVoiceStep
              selectedVoice={formData.brandVoice}
              onChange={(voice) => setFormData({ ...formData, brandVoice: voice })}
            />
          )}

          {currentStep === 5 && (
            <SpecialsStep
              specials={formData.specials}
              onSpecialsChange={(specials) => setFormData({ ...formData, specials })}
            />
          )}

          {currentStep === 6 && (
            <CarPreferencesStep
              lovedMakes={formData.vehiclePreferences.lovedMakes}
              neverMakes={formData.vehiclePreferences.neverMakes}
              onChange={(loved, never) => setFormData({
                ...formData,
                vehiclePreferences: { lovedMakes: loved, neverMakes: never },
              })}
            />
          )}

          {currentStep === 7 && (
            <StyleTasteTestStep
              selectedFamilies={formData.styleFamilyIds}
              onChange={(families) => setFormData({ ...formData, styleFamilyIds: families })}
            />
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
                {currentStep === 7 ? 'Complete Setup' : 'Next'}
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
