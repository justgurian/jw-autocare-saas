import { useRef } from 'react';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { onboardingApi } from '../../../services/api';

interface FormData {
  businessName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  logoUrl: string;
  primaryColor: string;
  services: string[];
  specials: { title: string; discount: string; description: string }[];
  brandVoice: string;
  vehiclePreferences: { lovedMakes: Array<{makeId: string; models?: string[]}>; neverMakes: string[] };
  websiteUrl: string;
  styleFamilyIds: string[];
  timezone: string;
}

interface LogoStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  logoPreview: string | null;
  setLogoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LogoStep({
  formData,
  setFormData,
  logoPreview,
  setLogoPreview,
  isUploading,
  setIsUploading,
}: LogoStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
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
  );
}
