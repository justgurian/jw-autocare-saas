import { useState } from 'react';
import { Mic, MicOff, CheckCircle, Loader2, ChevronRight } from 'lucide-react';

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

interface VehicleData {
  makes: string[];
  models: Record<string, string[]>;
  years: number[];
  colors: string[];
}

interface Step1Props {
  formData: CheckInFormData;
  setFormData: React.Dispatch<React.SetStateAction<CheckInFormData>>;
  vehicleData?: VehicleData;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function Step1_Data({
  formData,
  setFormData,
  vehicleData,
  onSubmit,
  isLoading,
}: Step1Props) {
  const [isListening, setIsListening] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Reset model if make changes
      if (name === 'carMake') {
        newData.carModel = '';
      }
      return newData;
    });
  };

  const toggleSpeech = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setFormData((prev) => ({
          ...prev,
          issue: prev.issue ? prev.issue + ' ' + text : text,
        }));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  };

  const currentMake = formData.carMake;
  const modelsForMake = currentMake && vehicleData?.models[currentMake]
    ? [...vehicleData.models[currentMake]].sort()
    : [];

  // Generate a random repair order number
  const repairOrderNumber = Math.floor(Math.random() * 9000) + 1000;

  return (
    <div className="space-y-6">
      {/* Repair Order Card */}
      <div className="bg-[#FFFBF0] border-4 border-gray-800 p-6 shadow-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b-2 border-gray-800 pb-3">
          <h2 className="text-3xl font-heading uppercase text-retro-red">REPAIR ORDER</h2>
          <div className="text-right">
            <span className="font-heading text-lg text-gray-500">NO. {repairOrderNumber}</span>
            <p className="text-xs font-heading tracking-wider text-gray-400">SCOTTSDALE, AZ</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block font-heading text-sm uppercase text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Type Name Here"
              className="w-full bg-white/60 border-b-2 border-gray-800 focus:outline-none focus:border-retro-red px-2 h-10 text-base"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-heading text-sm uppercase text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(480) 555-0123"
              className="w-full bg-white/60 border-b-2 border-gray-800 focus:outline-none focus:border-retro-red px-2 h-10 text-base"
            />
          </div>

          {/* Year & Color Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-heading text-sm uppercase text-gray-700 mb-1">
                Car Year
              </label>
              <select
                name="carYear"
                value={formData.carYear}
                onChange={handleChange}
                className="w-full bg-white/60 border-b-2 border-gray-800 focus:outline-none focus:border-retro-red px-2 h-10 text-sm appearance-none cursor-pointer"
              >
                <option value="">Select Year</option>
                {vehicleData?.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-heading text-sm uppercase text-gray-700 mb-1">
                Car Color
              </label>
              <select
                name="carColor"
                value={formData.carColor}
                onChange={handleChange}
                className="w-full bg-white/60 border-b-2 border-gray-800 focus:outline-none focus:border-retro-red px-2 h-10 text-sm appearance-none cursor-pointer"
              >
                <option value="">Select Color</option>
                {vehicleData?.colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Make & Model Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-heading text-sm uppercase text-gray-700 mb-1">
                Car Make
              </label>
              <select
                name="carMake"
                value={formData.carMake}
                onChange={handleChange}
                className="w-full bg-white/60 border-b-2 border-gray-800 focus:outline-none focus:border-retro-red px-2 h-10 text-sm appearance-none cursor-pointer"
              >
                <option value="">Select Make</option>
                {vehicleData?.makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-heading text-sm uppercase text-gray-700 mb-1">
                Car Model
              </label>
              <select
                name="carModel"
                value={formData.carModel}
                onChange={handleChange}
                disabled={!currentMake}
                className="w-full bg-white/60 border-b-2 border-gray-800 focus:outline-none focus:border-retro-red px-2 h-10 text-sm disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="">Select Model</option>
                {modelsForMake.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                {currentMake && <option value="Other">Other...</option>}
              </select>
            </div>
          </div>

          {/* Mileage */}
          <div>
            <label className="block font-heading text-sm uppercase text-gray-700 mb-1">
              Mileage
            </label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="Current Odometer Reading"
              className="w-full bg-white/60 border-b-2 border-gray-800 focus:outline-none focus:border-retro-red px-2 h-10 text-base"
            />
          </div>

          {/* Issue Description with Voice Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-heading text-sm uppercase text-gray-700">
                Symptoms / Work Requested
              </label>
              <button
                type="button"
                onClick={toggleSpeech}
                className={`p-1.5 rounded-full transition-colors shadow-sm ${
                  isListening
                    ? 'bg-retro-red text-white animate-pulse'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title="Use Voice Input"
              >
                {isListening ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            </div>
            <textarea
              name="issue"
              rows={3}
              value={formData.issue}
              onChange={handleChange}
              placeholder={
                isListening
                  ? 'Listening... Speak now!'
                  : 'e.g., Oil change, brake squeal, AC not cold...'
              }
              className="w-full bg-white/60 border-2 border-gray-800 rounded-sm p-2 focus:outline-none focus:border-retro-red text-sm leading-tight resize-none"
            />
          </div>
        </div>

        {/* Encrypted Badge */}
        <div className="mt-6 flex items-center justify-center text-green-700 bg-green-50/50 py-2 rounded border border-green-100">
          <CheckCircle size={18} className="mr-2" />
          <span className="font-heading text-sm tracking-wider uppercase">
            Encrypted Service Check-In
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={isLoading || !formData.name.trim()}
        className="w-full btn-retro-primary py-4 flex items-center justify-center gap-2 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={24} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Continue to Photo
            <ChevronRight size={24} />
          </>
        )}
      </button>

      {/* Info Note */}
      <p className="text-xs text-center text-gray-500 uppercase tracking-wider">
        This data is used to personalize your action figure collectible.
      </p>
    </div>
  );
}
