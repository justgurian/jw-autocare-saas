import { useRef, useState, useCallback } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface PhotoUploadProps {
  photoBase64: string | null;
  onPhotoChange: (base64: string | null) => void;
  label?: string;
  hint?: string;
  maxSizeMB?: number;
}

export default function PhotoUpload({
  photoBase64,
  onPhotoChange,
  label = 'Upload a Photo',
  hint = 'JPG, PNG, or WebP — max 10MB',
  maxSizeMB = 10,
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be under ${maxSizeMB}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(reader.result as string);
    reader.readAsDataURL(file);
  }, [maxSizeMB, onPhotoChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  if (photoBase64) {
    return (
      <div className="relative inline-block">
        <img
          src={photoBase64}
          alt="Uploaded photo"
          className="w-32 h-40 object-cover border-2 border-black rounded-lg"
        />
        <button
          type="button"
          onClick={() => {
            onPhotoChange(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-retro-red text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
        >
          <X size={14} />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 text-xs text-gray-500 hover:text-retro-red transition-colors flex items-center gap-1"
        >
          <Camera size={12} /> Change
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full p-6 border-2 border-dashed rounded-lg transition-all text-center ${
          isDragging
            ? 'border-retro-red bg-red-50 dark:bg-retro-red/10'
            : 'border-gray-300 hover:border-retro-red hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
      >
        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="font-heading text-sm uppercase">{label}</p>
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      </button>
    </div>
  );
}
