import { Car, ChevronRight } from 'lucide-react';
import type { CarOfDayFormData } from '../CarOfDayPage';

interface Step1Props {
  formData: CarOfDayFormData;
  setFormData: (data: CarOfDayFormData | ((prev: CarOfDayFormData) => CarOfDayFormData)) => void;
  vehicleData?: {
    makes: string[];
    models: Record<string, string[]>;
    years: string[];
    colors: string[];
  };
  onComplete: () => void;
}

export default function Step1_CarInfo({ formData, setFormData, vehicleData, onComplete }: Step1Props) {
  const handleChange = (field: keyof CarOfDayFormData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Reset model if make changes
      if (field === 'carMake') {
        updated.carModel = '';
      }

      return updated;
    });
  };

  const availableModels = formData.carMake && vehicleData?.models
    ? vehicleData.models[formData.carMake] || []
    : [];

  const canContinue = formData.carMake || formData.carNickname;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-retro-red/10 rounded-full mb-3">
          <Car className="text-retro-red" size={32} />
        </div>
        <h2 className="font-heading text-2xl uppercase">Vehicle Information</h2>
        <p className="text-gray-600 text-sm mt-1">
          Tell us about the car you're showcasing today
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Year */}
        <div>
          <label className="block font-heading text-sm uppercase mb-1">Year</label>
          <select
            value={formData.carYear}
            onChange={(e) => handleChange('carYear', e.target.value)}
            className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red"
          >
            <option value="">Select Year</option>
            {vehicleData?.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Make */}
        <div>
          <label className="block font-heading text-sm uppercase mb-1">Make *</label>
          <select
            value={formData.carMake}
            onChange={(e) => handleChange('carMake', e.target.value)}
            className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red"
          >
            <option value="">Select Make</option>
            {vehicleData?.makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block font-heading text-sm uppercase mb-1">Model</label>
          <select
            value={formData.carModel}
            onChange={(e) => handleChange('carModel', e.target.value)}
            className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red"
            disabled={!formData.carMake}
          >
            <option value="">Select Model</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block font-heading text-sm uppercase mb-1">Color</label>
          <select
            value={formData.carColor}
            onChange={(e) => handleChange('carColor', e.target.value)}
            className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red"
          >
            <option value="">Select Color</option>
            {vehicleData?.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nickname - Full Width */}
      <div className="bg-retro-mustard/10 p-4 border-2 border-retro-mustard rounded">
        <label className="block font-heading text-sm uppercase mb-1">
          Car Nickname (Optional)
        </label>
        <input
          type="text"
          value={formData.carNickname}
          onChange={(e) => handleChange('carNickname', e.target.value)}
          placeholder="e.g., 'The Beast', 'Midnight Runner', 'Old Faithful'"
          className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red"
        />
        <p className="text-xs text-gray-600 mt-1">
          A cool nickname makes for better comic and movie poster titles!
        </p>
      </div>

      {/* Owner Section */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-heading text-lg uppercase mb-3">Owner Information (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-heading text-sm uppercase mb-1">Owner Name</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => handleChange('ownerName', e.target.value)}
              placeholder="John Smith"
              className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red"
            />
          </div>
          <div>
            <label className="block font-heading text-sm uppercase mb-1">Social Handle</label>
            <input
              type="text"
              value={formData.ownerHandle}
              onChange={(e) => handleChange('ownerHandle', e.target.value)}
              placeholder="@johnscars"
              className="w-full p-3 border-2 border-black rounded focus:ring-2 focus:ring-retro-red focus:border-retro-red"
            />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={onComplete}
        disabled={!canContinue}
        className="w-full btn-retro-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to Photos
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
