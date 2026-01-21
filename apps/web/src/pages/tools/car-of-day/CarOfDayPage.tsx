import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { carOfDayApi, checkInApi, downloadApi } from '../../../services/api';
import {
  Car,
  Star,
  Sparkles,
  Film,
  Download,
  Share2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader,
  ImageIcon,
  User,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from '../../../components/features/ShareModal';

// Step components
import Step1_CarInfo from './components/Step1_CarInfo';
import Step2_Photos from './components/Step2_Photos';
import Step3_Settings from './components/Step3_Settings';
import Step4_Generate from './components/Step4_Generate';

// Types
export interface CarOfDayFormData {
  carYear: string;
  carMake: string;
  carModel: string;
  carColor: string;
  carNickname: string;
  ownerName: string;
  ownerHandle: string;
}

export interface CarImage {
  base64: string;
  mimeType: string;
}

export interface GeneratedAsset {
  id: string;
  type: 'official' | 'comic' | 'action-figure' | 'movie-poster';
  imageUrl: string;
  caption: string;
}

export interface GenerationResult {
  carName: string;
  assets: GeneratedAsset[];
  totalGenerated: number;
}

type AssetType = 'official' | 'comic' | 'action-figure' | 'movie-poster';

const STEPS = [
  { id: 1, name: 'Car Info', icon: Car, description: 'Vehicle Details' },
  { id: 2, name: 'Photos', icon: ImageIcon, description: 'Upload Images' },
  { id: 3, name: 'Settings', icon: Settings, description: 'Asset Options' },
  { id: 4, name: 'Generate', icon: Sparkles, description: 'Create Assets' },
];

const ASSET_TYPES: Array<{
  id: AssetType;
  name: string;
  description: string;
  icon: React.ReactNode;
}> = [
  { id: 'official', name: 'Official', description: 'Clean professional graphic', icon: <Star size={20} /> },
  { id: 'comic', name: 'Comic Book', description: 'Vintage comic cover style', icon: '💥' },
  { id: 'action-figure', name: 'Action Figure', description: 'Toy packaging design', icon: '🧸' },
  { id: 'movie-poster', name: 'Movie Poster', description: 'Hollywood blockbuster', icon: <Film size={20} /> },
];

const initialFormData: CarOfDayFormData = {
  carYear: '',
  carMake: '',
  carModel: '',
  carColor: '',
  carNickname: '',
  ownerName: '',
  ownerHandle: '',
};

export default function CarOfDayPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CarOfDayFormData>(initialFormData);
  const [carImage, setCarImage] = useState<CarImage | null>(null);
  const [personImage, setPersonImage] = useState<CarImage | null>(null);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<AssetType[]>([
    'official',
    'comic',
    'action-figure',
    'movie-poster',
  ]);
  const [generatedResult, setGeneratedResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // Fetch vehicle data for dropdowns
  const { data: vehicleData } = useQuery({
    queryKey: ['check-in-vehicles'],
    queryFn: () => checkInApi.getVehicles().then((res) => res.data),
  });

  // Step 1: Submit car info - move to photos
  const handleCarInfoComplete = () => {
    setCurrentStep(2);
  };

  // Step 2: Photos uploaded - move to settings
  const handlePhotosComplete = (car: CarImage, person?: CarImage) => {
    setCarImage(car);
    if (person) setPersonImage(person);
    setCurrentStep(3);
  };

  // Step 3: Settings confirmed - move to generate
  const handleSettingsComplete = (types: AssetType[]) => {
    setSelectedAssetTypes(types);
    setCurrentStep(4);
  };

  // Step 4: Generate assets
  const handleGenerate = async () => {
    if (!carImage) {
      toast.error('Please upload a car photo first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await carOfDayApi.generate({
        carImage,
        personImage: personImage || undefined,
        carYear: formData.carYear,
        carMake: formData.carMake,
        carModel: formData.carModel,
        carColor: formData.carColor,
        carNickname: formData.carNickname,
        ownerName: formData.ownerName,
        ownerHandle: formData.ownerHandle,
        assetTypes: selectedAssetTypes,
      });

      setGeneratedResult(response.data.data);
      toast.success(`Generated ${response.data.data.totalGenerated} assets!`);

      // Scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate assets');
    } finally {
      setIsLoading(false);
    }
  };

  // Download a single asset
  const handleDownload = async (asset: GeneratedAsset) => {
    try {
      const response = await downloadApi.downloadSingle(asset.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `car-of-day-${asset.type}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  };

  // Download all assets
  const handleDownloadAll = async () => {
    if (!generatedResult) return;

    try {
      const contentIds = generatedResult.assets.map((a) => a.id);
      const response = await downloadApi.downloadBulk(contentIds);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `car-of-day-pack-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  };

  // Share an asset
  const handleShare = (asset: GeneratedAsset) => {
    setSelectedAsset(asset);
    setShowShareModal(true);
  };

  // Reset and start over
  const handleReset = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setCarImage(null);
    setPersonImage(null);
    setSelectedAssetTypes(['official', 'comic', 'action-figure', 'movie-poster']);
    setGeneratedResult(null);
    setSelectedAsset(null);
  };

  // Navigation
  const canGoBack = currentStep > 1 && !generatedResult;
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro flex items-center justify-center gap-3">
          <Star className="text-retro-mustard" />
          Car of the Day
        </h1>
        <p className="text-gray-600 mt-2">
          Generate 4 unique promotional assets showcasing customer vehicles
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
          <Step1_CarInfo
            formData={formData}
            setFormData={setFormData}
            vehicleData={vehicleData}
            onComplete={handleCarInfoComplete}
          />
        )}

        {currentStep === 2 && (
          <Step2_Photos
            carImage={carImage}
            personImage={personImage}
            onComplete={handlePhotosComplete}
          />
        )}

        {currentStep === 3 && (
          <Step3_Settings
            assetTypes={ASSET_TYPES}
            selectedTypes={selectedAssetTypes}
            onComplete={handleSettingsComplete}
          />
        )}

        {currentStep === 4 && (
          <Step4_Generate
            formData={formData}
            carImage={carImage}
            personImage={personImage}
            selectedAssetTypes={selectedAssetTypes}
            assetTypes={ASSET_TYPES}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Generated Results */}
      {generatedResult && (
        <div ref={resultRef} className="space-y-6">
          {/* Results Header */}
          <div className="card-retro text-center">
            <h2 className="font-heading text-2xl uppercase">Your Assets Are Ready!</h2>
            <p className="text-gray-600 mt-2">
              Showcasing: <span className="font-bold">{generatedResult.carName}</span> •{' '}
              {generatedResult.totalGenerated} assets generated
            </p>

            {/* Download All Button */}
            <button
              onClick={handleDownloadAll}
              className="btn-retro-primary mt-4 flex items-center justify-center gap-2 mx-auto"
            >
              <Download size={18} />
              Download All ({generatedResult.totalGenerated})
            </button>
          </div>

          {/* Asset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedResult.assets.map((asset) => {
              const assetInfo = ASSET_TYPES.find((t) => t.id === asset.type);

              return (
                <div key={asset.id} className="card-retro space-y-4">
                  {/* Asset Type Header */}
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <span className="text-xl">{assetInfo?.icon}</span>
                    <div>
                      <h3 className="font-heading text-lg uppercase">{assetInfo?.name}</h3>
                      <p className="text-xs text-gray-500">{assetInfo?.description}</p>
                    </div>
                  </div>

                  {/* Generated Image */}
                  <div className="aspect-[4/5] bg-gray-100 border-4 border-black shadow-retro overflow-hidden">
                    <img
                      src={asset.imageUrl}
                      alt={`${assetInfo?.name} - ${generatedResult.carName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Caption */}
                  <div className="bg-gray-50 p-3 border-2 border-gray-200 rounded">
                    <p className="text-xs text-gray-600 font-heading uppercase mb-1">Caption:</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{asset.caption}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownload(asset)}
                      className="btn-retro-secondary flex items-center justify-center gap-2 text-sm"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      onClick={() => handleShare(asset)}
                      className="btn-retro-primary flex items-center justify-center gap-2 text-sm"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Over */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="btn-retro-outline flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              Start New Car of the Day
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {canGoBack && (
        <div className="flex justify-start">
          <button onClick={handleBack} className="btn-retro-outline flex items-center gap-2">
            <ChevronLeft size={18} />
            Back
          </button>
        </div>
      )}

      {/* Share Modal */}
      {selectedAsset && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: selectedAsset.id,
            title: `Car of the Day - ${ASSET_TYPES.find((t) => t.id === selectedAsset.type)?.name}`,
            imageUrl: selectedAsset.imageUrl,
            caption: selectedAsset.caption,
          }}
        />
      )}
    </div>
  );
}
