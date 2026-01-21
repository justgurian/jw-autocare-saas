import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkInApi, downloadApi } from '../../../services/api';
import {
  ClipboardCheck,
  Camera,
  Trophy,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Download,
  Share2,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from '../../../components/features/ShareModal';

// Step components
import Step1_Data from './components/Step1_Data';
import Step2_Photo from './components/Step2_Photo';
import Step3_Winner from './components/Step3_Winner';
import Step4_Meme from './components/Step4_Meme';

// Types
interface CheckInFormData {
  name: string;
  phone: string;
  carYear: string;
  carMake: string;
  carModel: string;
  carColor: string;
  mileage: string;
  issue: string;
}

interface Prize {
  id: string;
  label: string;
  probability: number;
  description?: string;
}

interface SpinResult {
  prize: Prize;
  validationCode: string;
  submissionId: string;
}

interface GeneratedResult {
  id: string;
  imageUrl: string;
  caption: string;
  validationCode: string;
  prize: string;
}

const STEPS = [
  { id: 1, name: 'Check-In', icon: ClipboardCheck, description: 'Customer Info' },
  { id: 2, name: 'Photo', icon: Camera, description: 'Take a Photo' },
  { id: 3, name: 'Spin', icon: Trophy, description: 'Win a Prize' },
  { id: 4, name: 'Collectible', icon: Sparkles, description: 'Get Your Meme' },
];

const initialFormData: CheckInFormData = {
  name: '',
  phone: '',
  carYear: '',
  carMake: '',
  carModel: '',
  carColor: '',
  mileage: '',
  issue: '',
};

export default function CheckInPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CheckInFormData>(initialFormData);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [personImage, setPersonImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  // Fetch vehicle data
  const { data: vehicleData } = useQuery({
    queryKey: ['check-in-vehicles'],
    queryFn: () => checkInApi.getVehicles().then(res => res.data),
  });

  // Fetch prizes
  const { data: prizeData } = useQuery({
    queryKey: ['check-in-prizes'],
    queryFn: () => checkInApi.getPrizes().then(res => res.data),
  });

  const prizes: Prize[] = prizeData?.prizes || [];

  // Step 1: Submit check-in data
  const handleSubmitCheckIn = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await checkInApi.submit(formData);
      setSubmissionId(response.data.submission.id);
      setCurrentStep(2);
      toast.success('Check-in submitted!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit check-in');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Photo captured - move to spin
  const handlePhotoComplete = (image: { base64: string; mimeType: string }) => {
    setPersonImage(image);
    setCurrentStep(3);
  };

  // Step 3: Spin the wheel
  const handleSpin = async () => {
    if (!submissionId) {
      toast.error('No submission found. Please start over.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await checkInApi.spin(submissionId);
      setSpinResult(response.data.result);
      return response.data.result;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to spin');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // After spin animation completes
  const handleSpinComplete = () => {
    setCurrentStep(4);
  };

  // Step 4: Generate action figure
  const handleGenerate = async () => {
    if (!submissionId || !personImage) {
      toast.error('Missing required data. Please start over.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await checkInApi.generate({
        submissionId,
        personImage,
      });
      setGeneratedResult(response.data.result);
      toast.success('Action figure generated!');

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate');
    } finally {
      setIsLoading(false);
    }
  };

  // Download result
  const handleDownload = async () => {
    if (!generatedResult) return;

    try {
      const response = await downloadApi.downloadSingle(generatedResult.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `action-figure-${formData.name.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  };

  // Reset and start over
  const handleReset = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setSubmissionId(null);
    setPersonImage(null);
    setSpinResult(null);
    setGeneratedResult(null);
  };

  // Navigation
  const canGoBack = currentStep > 1 && !generatedResult;
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro flex items-center justify-center gap-3">
          <Trophy className="text-retro-mustard" />
          Check-In To Win
        </h1>
        <p className="text-gray-600 mt-2">
          Gamified customer check-in with prizes and collectible action figures
        </p>
      </div>

      {/* Step Indicator */}
      <div className="card-retro bg-white">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                      isActive
                        ? 'bg-retro-red border-retro-red text-white'
                        : isComplete
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`font-heading text-sm uppercase ${isActive ? 'text-retro-red' : 'text-gray-500'}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${isComplete ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="card-retro">
        {currentStep === 1 && (
          <Step1_Data
            formData={formData}
            setFormData={setFormData}
            vehicleData={vehicleData}
            onSubmit={handleSubmitCheckIn}
            isLoading={isLoading}
          />
        )}

        {currentStep === 2 && (
          <Step2_Photo
            onPhotoCapture={handlePhotoComplete}
            isLoading={isLoading}
          />
        )}

        {currentStep === 3 && (
          <Step3_Winner
            prizes={prizes}
            onSpin={handleSpin}
            onComplete={handleSpinComplete}
            spinResult={spinResult}
            isLoading={isLoading}
          />
        )}

        {currentStep === 4 && (
          <Step4_Meme
            formData={formData}
            spinResult={spinResult}
            generatedResult={generatedResult}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Result Display */}
      {generatedResult && (
        <div ref={resultRef} className="card-retro space-y-6">
          <h2 className="font-heading text-2xl uppercase text-center">Your Action Figure</h2>

          {/* Generated Image */}
          <div className="aspect-[4/5] max-w-md mx-auto bg-gray-100 border-4 border-black shadow-retro overflow-hidden">
            <img
              src={generatedResult.imageUrl}
              alt="Action Figure"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Validation Code */}
          <div className="bg-green-50 border-2 border-green-500 p-4 text-center">
            <p className="text-sm text-gray-600">Validation Code</p>
            <p className="font-heading text-3xl text-green-700">{generatedResult.validationCode}</p>
            <p className="text-sm text-gray-500 mt-1">Show this to redeem: {generatedResult.prize}</p>
          </div>

          {/* Caption */}
          <div className="bg-white p-4 border-2 border-black">
            <p className="font-heading text-sm uppercase text-gray-600 mb-2">Caption:</p>
            <p className="text-sm text-gray-900">{generatedResult.caption}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleDownload}
              className="btn-retro-secondary flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="btn-retro-primary flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>

          {/* Start Over */}
          <button
            onClick={handleReset}
            className="w-full btn-retro-outline flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Start New Check-In
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      {canGoBack && (
        <div className="flex justify-start">
          <button
            onClick={handleBack}
            className="btn-retro-outline flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        </div>
      )}

      {/* Share Modal */}
      {generatedResult && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: generatedResult.id,
            title: `Action Figure - ${formData.name}`,
            imageUrl: generatedResult.imageUrl,
            caption: generatedResult.caption,
          }}
        />
      )}
    </div>
  );
}
