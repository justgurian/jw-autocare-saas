import { useState, useRef } from 'react';
import { Upload, Camera, X, ChevronRight, ImageIcon, User } from 'lucide-react';
import type { CarImage } from '../CarOfDayPage';

interface Step2Props {
  carImage: CarImage | null;
  personImage: CarImage | null;
  onComplete: (car: CarImage, person?: CarImage) => void;
}

export default function Step2_Photos({ carImage: initialCarImage, personImage: initialPersonImage, onComplete }: Step2Props) {
  const [carImage, setCarImage] = useState<CarImage | null>(initialCarImage);
  const [personImage, setPersonImage] = useState<CarImage | null>(initialPersonImage);
  const [isDraggingCar, setIsDraggingCar] = useState(false);
  const [isDraggingPerson, setIsDraggingPerson] = useState(false);

  const carInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<CarImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const [mimeString, base64] = result.split(',');
        const mimeType = mimeString.match(/:(.*?);/)?.[1] || 'image/jpeg';
        resolve({ base64, mimeType });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle car image selection
  const handleCarImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const image = await fileToBase64(file);
    setCarImage(image);
  };

  // Handle person image selection
  const handlePersonImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const image = await fileToBase64(file);
    setPersonImage(image);
  };

  // Drag and drop handlers for car
  const handleCarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCar(true);
  };

  const handleCarDragLeave = () => {
    setIsDraggingCar(false);
  };

  const handleCarDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCar(false);
    const file = e.dataTransfer.files[0];
    if (file) handleCarImageSelect(file);
  };

  // Drag and drop handlers for person
  const handlePersonDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPerson(true);
  };

  const handlePersonDragLeave = () => {
    setIsDraggingPerson(false);
  };

  const handlePersonDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPerson(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePersonImageSelect(file);
  };

  const canContinue = !!carImage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-retro-red/10 rounded-full mb-3">
          <ImageIcon className="text-retro-red" size={32} />
        </div>
        <h2 className="font-heading text-2xl uppercase">Upload Photos</h2>
        <p className="text-gray-600 text-sm mt-1">
          Add a photo of the car, and optionally the owner
        </p>
      </div>

      {/* Car Image Upload - Required */}
      <div>
        <label className="block font-heading text-lg uppercase mb-2">
          Car Photo <span className="text-retro-red">*</span>
        </label>
        <div
          onDragOver={handleCarDragOver}
          onDragLeave={handleCarDragLeave}
          onDrop={handleCarDrop}
          onClick={() => carInputRef.current?.click()}
          className={`relative border-4 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
            isDraggingCar
              ? 'border-retro-red bg-retro-red/5'
              : carImage
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-retro-red hover:bg-gray-50'
          }`}
        >
          {carImage ? (
            <div className="relative">
              <img
                src={`data:${carImage.mimeType};base64,${carImage.base64}`}
                alt="Car"
                className="w-full h-64 object-contain rounded"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCarImage(null);
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-heading uppercase">
                Car Photo Ready
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Upload className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="font-heading text-lg uppercase text-gray-700">
                Drop car photo here
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG up to 10MB
              </p>
            </div>
          )}
          <input
            ref={carInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCarImageSelect(file);
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Person Image Upload - Optional */}
      <div>
        <label className="block font-heading text-lg uppercase mb-2">
          Owner Photo <span className="text-gray-400 text-sm">(Optional)</span>
        </label>
        <div
          onDragOver={handlePersonDragOver}
          onDragLeave={handlePersonDragLeave}
          onDrop={handlePersonDrop}
          onClick={() => personInputRef.current?.click()}
          className={`relative border-4 border-dashed rounded-lg p-4 transition-all cursor-pointer ${
            isDraggingPerson
              ? 'border-retro-red bg-retro-red/5'
              : personImage
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-retro-red hover:bg-gray-50'
          }`}
        >
          {personImage ? (
            <div className="relative flex items-center gap-4">
              <img
                src={`data:${personImage.mimeType};base64,${personImage.base64}`}
                alt="Owner"
                className="w-24 h-24 object-cover rounded-full border-4 border-green-500"
              />
              <div className="flex-1">
                <p className="font-heading uppercase text-green-700">Owner Photo Added</p>
                <p className="text-sm text-gray-500">
                  Will be included in Official and Action Figure assets
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPersonImage(null);
                }}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 py-2">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="text-gray-400" size={32} />
              </div>
              <div className="flex-1">
                <p className="font-heading uppercase text-gray-700">
                  Add Owner Photo
                </p>
                <p className="text-sm text-gray-500">
                  Include the proud owner in the showcase
                </p>
              </div>
              <Camera className="text-gray-400" size={24} />
            </div>
          )}
          <input
            ref={personInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePersonImageSelect(file);
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 p-4 border-2 border-blue-200 rounded">
        <p className="font-heading text-sm uppercase text-blue-800 mb-2">Pro Tips</p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use a clean, well-lit photo of the car</li>
          <li>• Side angle or 3/4 views work best</li>
          <li>• For owner photos, include the car in the background</li>
        </ul>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => onComplete(carImage!, personImage || undefined)}
        disabled={!canContinue}
        className="w-full btn-retro-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to Settings
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
