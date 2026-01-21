import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    logoUrl: '',
    primaryColor: '#C53030',
    services: [] as string[],
    brandVoice: 'friendly',
    defaultVehicle: 'corvette',
  });

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      toast.success('Setup complete! Welcome to JW Auto Care AI.');
      navigate('/dashboard');
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
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 border-2 border-black flex items-center justify-center">
                <span className="text-gray-400">Your Logo</span>
              </div>
              <button className="btn-retro-secondary">Upload Logo</button>
              <p className="text-sm text-gray-500 mt-4">
                We'll extract colors from your logo automatically
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Select the services your shop offers:
              </p>
              {['Oil Change', 'Brake Service', 'Engine Repair', 'AC Service', 'Tire Service', 'Transmission'].map((service) => (
                <label key={service} className="flex items-center gap-3 p-3 border-2 border-black cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={formData.services.includes(service)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, services: [...formData.services, service] });
                      } else {
                        setFormData({ ...formData, services: formData.services.filter(s => s !== service) });
                      }
                    }}
                  />
                  <span className="font-heading uppercase">{service}</span>
                </label>
              ))}
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
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Add recurring promotions to your Specials Vault (optional)
              </p>
              <button className="btn-retro-outline">Add Special</button>
              <p className="text-sm text-gray-500 mt-4">
                You can add specials later from the dashboard
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
            className="btn-retro-primary flex items-center gap-2"
          >
            {currentStep === 6 ? 'Complete Setup' : 'Next'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
