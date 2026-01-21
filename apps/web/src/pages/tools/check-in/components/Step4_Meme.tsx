import { useState, useEffect } from 'react';
import { Wand2, Loader2, Sparkles, ShieldCheck, PlayCircle, Gauge } from 'lucide-react';

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

interface Step4Props {
  formData: CheckInFormData;
  spinResult: SpinResult | null;
  generatedResult: GeneratedResult | null;
  onGenerate: () => void;
  isLoading: boolean;
}

// Fun loading phrases
const LOADING_PHRASES = [
  "Checking your tire pressure...",
  "Scanning for standard issue human features...",
  "Shrinking the engine block to 1/12 scale...",
  "Consulting the official toy blueprint...",
  "Adding that 'New Toy' smell...",
  "Buffing the plastic blister pack...",
  "Securing the winner's prize sticker...",
  "Tony says: 'That's a fine looking collectible!'",
  "Applying high-gloss finish to the car accessory...",
  "Printing the limited edition serial number...",
  "Assembling the display stand...",
  "Quality checking the action figure joints...",
  "Packaging with care and excitement...",
];

export default function Step4_Meme({
  formData,
  spinResult,
  generatedResult,
  onGenerate,
  isLoading,
}: Step4Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Cycle through loading phrases
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Format car name
  const carName = formData.carMake && formData.carModel
    ? `${formData.carYear || ''} ${formData.carMake} ${formData.carModel}`.trim()
    : 'Your Vehicle';

  // If already generated, show nothing (parent shows result)
  if (generatedResult) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-8">
      {/* Magic Wand Icon */}
      <div className="relative">
        <div className="bg-retro-red text-white p-8 rounded-full border-8 border-gray-800 shadow-2xl relative z-10">
          <Wand2 size={64} className={isLoading ? 'animate-pulse' : ''} />
        </div>
        <div className="absolute -inset-4 bg-retro-mustard rounded-full blur-xl opacity-50 animate-pulse" />
      </div>

      {/* Title & Status */}
      <div className="space-y-2">
        <h2 className="text-4xl font-heading uppercase text-gray-800">
          {isLoading ? '3D PRINTING YOUR MEME' : 'READY TO CREATE'}
        </h2>
        <p className="font-heading text-xl text-gray-600 tracking-wider">
          {isLoading ? LOADING_PHRASES[phraseIndex] : 'Your action figure awaits!'}
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white border-4 border-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full space-y-4">
        {/* Customer Info */}
        <div className="border-b-2 border-gray-100 pb-3">
          <p className="text-sm text-gray-500 uppercase">Customer</p>
          <p className="font-heading text-xl text-gray-800">{formData.name}</p>
        </div>

        {/* Vehicle */}
        <div className="border-b-2 border-gray-100 pb-3">
          <p className="text-sm text-gray-500 uppercase">Vehicle</p>
          <p className="font-heading text-lg text-gray-800">{carName}</p>
          {formData.carColor && (
            <p className="text-sm text-gray-600">{formData.carColor}</p>
          )}
        </div>

        {/* Prize */}
        {spinResult && (
          <div className="flex items-center gap-3 text-green-600 border-b-2 border-gray-100 pb-3">
            <ShieldCheck size={24} />
            <div className="text-left">
              <p className="text-sm text-gray-500 uppercase">Prize Won</p>
              <p className="font-heading uppercase tracking-tight">
                {spinResult.prize.label}
              </p>
            </div>
          </div>
        )}

        {/* Validation Code */}
        {spinResult && (
          <div>
            <p className="text-sm text-gray-500 uppercase">Validation Code</p>
            <p className="font-heading text-2xl text-retro-red tracking-wider">
              {spinResult.validationCode}
            </p>
          </div>
        )}
      </div>

      {/* What's Included */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 max-w-sm w-full">
        <p className="font-heading text-sm uppercase text-gray-700 mb-3">
          Your Action Figure Includes:
        </p>
        <ul className="text-sm text-gray-600 space-y-2 text-left">
          <li className="flex items-center gap-2">
            <Sparkles size={14} className="text-retro-mustard" />
            Limited Edition Toy Packaging Design
          </li>
          <li className="flex items-center gap-2">
            <Sparkles size={14} className="text-retro-mustard" />
            Your Photo as an Action Figure
          </li>
          <li className="flex items-center gap-2">
            <Sparkles size={14} className="text-retro-mustard" />
            Miniature {carName} Accessory
          </li>
          <li className="flex items-center gap-2">
            <Sparkles size={14} className="text-retro-mustard" />
            Prize Ticket: {spinResult?.prize.label || 'Your Prize'}
          </li>
          <li className="flex items-center gap-2">
            <Sparkles size={14} className="text-retro-mustard" />
            Unique Validation Code
          </li>
        </ul>
      </div>

      {/* Generate Button */}
      {!isLoading && (
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full max-w-sm bg-gray-800 text-white py-6 px-8 rounded-sm font-heading text-3xl shadow-2xl hover:bg-gray-900 hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
        >
          <PlayCircle size={32} />
          ENGAGE PRINTING PRESS
        </button>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="w-full max-w-sm space-y-4">
          {/* Progress bar */}
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-retro-red animate-pulse" style={{ width: '100%' }}>
              <div className="h-full bg-gradient-to-r from-retro-red via-retro-mustard to-retro-red animate-shimmer" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-gray-600">
            <Loader2 size={24} className="animate-spin text-retro-red" />
            <span className="font-heading">Creating your collectible...</span>
          </div>
        </div>
      )}

      {/* Tech Note */}
      <p className="text-[10px] text-gray-500 font-heading tracking-widest uppercase">
        Gemini 3 Pro Vision Engine Activated
      </p>

      {/* Animation styles */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
