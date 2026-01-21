import { useState, useRef } from 'react';
import { Camera, Upload, RefreshCcw, Check, ChevronRight } from 'lucide-react';

interface Step2Props {
  onPhotoCapture: (image: { base64: string; mimeType: string }) => void;
  isLoading: boolean;
}

export default function Step2_Photo({ onPhotoCapture, isLoading }: Step2Props) {
  const [mode, setMode] = useState<'camera' | 'upload' | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setMode('camera');
    setCapturedImage(null);
    setImageData(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1024 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied', err);
      alert('Camera access was denied. Please use the upload option instead.');
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);

      const dataUrl = canvasRef.current.toDataURL('image/png');
      setCapturedImage(dataUrl);

      // Extract base64 data
      const base64 = dataUrl.split(',')[1];
      setImageData({ base64, mimeType: 'image/png' });

      // Stop camera
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);

      // Extract base64 data
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type || 'image/png';
      setImageData({ base64, mimeType });
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setImageData(null);
    setMode(null);
  };

  const handleContinue = () => {
    if (imageData) {
      onPhotoCapture(imageData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="font-heading text-2xl uppercase text-gray-800">Smile for Your Action Figure!</h2>
        <p className="text-gray-600 mt-2">
          Take a selfie or upload a photo to be transformed into a collectible action figure
        </p>
      </div>

      {/* Mode Selection */}
      {!mode && !capturedImage && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={startCamera}
            className="p-8 border-4 border-gray-800 rounded-lg bg-white hover:bg-red-50 transition-all flex flex-col items-center gap-3 group"
          >
            <Camera
              size={48}
              className="text-retro-red group-hover:scale-110 transition-transform"
            />
            <span className="font-heading uppercase text-xl">Take Photo</span>
            <span className="text-xs text-gray-500">Use your camera</span>
          </button>
          <button
            onClick={() => {
              setMode('upload');
              fileInputRef.current?.click();
            }}
            className="p-8 border-4 border-gray-800 rounded-lg bg-white hover:bg-blue-50 transition-all flex flex-col items-center gap-3 group"
          >
            <Upload
              size={48}
              className="text-blue-600 group-hover:scale-110 transition-transform"
            />
            <span className="font-heading uppercase text-xl">Upload</span>
            <span className="text-xs text-gray-500">Choose from device</span>
          </button>
        </div>
      )}

      {/* Camera View */}
      {mode === 'camera' && !capturedImage && (
        <div className="relative border-4 border-gray-800 rounded-lg overflow-hidden bg-black aspect-[3/4] max-w-md mx-auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <button
            onClick={takePhoto}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-gray-800 p-4 rounded-full shadow-2xl border-4 border-gray-800 hover:scale-110 active:scale-95 transition-all"
          >
            <Camera size={32} />
          </button>
          {/* Face guide overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-60 border-2 border-white/50 rounded-full opacity-50" />
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && !capturedImage && (
        <div className="border-4 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Upload size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Click to select a photo or drag and drop</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-retro-secondary"
          >
            Choose Photo
          </button>
        </div>
      )}

      {/* Captured/Uploaded Image Preview */}
      {capturedImage && (
        <div className="space-y-4">
          <div className="relative border-4 border-retro-red rounded-lg overflow-hidden aspect-[3/4] max-w-md mx-auto shadow-2xl">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full">
              <Check size={20} />
            </div>
          </div>

          <div className="flex gap-4 max-w-md mx-auto">
            <button
              onClick={handleRetake}
              className="flex-1 btn-retro-outline flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} />
              Retake
            </button>
            <button
              onClick={handleContinue}
              disabled={isLoading || !imageData}
              className="flex-1 btn-retro-primary flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Tips */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
        <p className="font-heading text-sm uppercase text-gray-700 mb-2">Photo Tips:</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>- Face the camera directly with good lighting</li>
          <li>- Neutral or smiling expression works best</li>
          <li>- Plain background recommended</li>
          <li>- This will be transformed into an action figure style</li>
        </ul>
      </div>
    </div>
  );
}
