import { Sparkles, Wand2 } from 'lucide-react';
import NostalgicThemeGrid from '../../../../components/features/NostalgicThemeGrid';
import VehiclePicker from '../../../../components/features/VehiclePicker';
import LanguageToggle from '../../../../components/features/LanguageToggle';
import PackSelector from '../../../../components/features/PackSelector';

type PackType = 'variety-3' | 'variety-5' | 'week-7' | 'era' | 'style';

interface FormData {
  message: string;
  subject: string;
  details: string;
  themeId: string;
  vehicleId: string | null;
  language: 'en' | 'es' | 'both';
}

interface ContentStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export function ContentStep({ formData, setFormData }: ContentStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block font-heading uppercase text-sm mb-2">
          Main Message *
        </label>
        <input
          type="text"
          className="input-retro"
          placeholder="e.g., 20% OFF Oil Changes!"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>
      <div>
        <label className="block font-heading uppercase text-sm mb-2">
          Subject/Service *
        </label>
        <input
          type="text"
          className="input-retro"
          placeholder="e.g., Full Synthetic Oil Change"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />
      </div>
      <div>
        <label className="block font-heading uppercase text-sm mb-2">
          Additional Details
        </label>
        <textarea
          className="input-retro min-h-[80px]"
          placeholder="e.g., Includes filter, up to 5 quarts..."
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
        />
      </div>
    </div>
  );
}

interface StyleStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  useNostalgicThemes: boolean;
  setUseNostalgicThemes: (value: boolean) => void;
  themesData: {
    brandStyles?: {
      id: string;
      name: string;
      category: string;
      shortDescription?: string;
      previewColors?: string[];
    }[];
  } | undefined;
  onSurpriseMe: () => void;
}

export function StyleStep({
  formData,
  setFormData,
  useNostalgicThemes,
  setUseNostalgicThemes,
  themesData,
  onSurpriseMe,
}: StyleStepProps) {
  return (
    <div className="space-y-4">
      {/* Theme Type Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setUseNostalgicThemes(true)}
          className={`flex-1 py-2 px-3 border-2 flex items-center justify-center gap-2 transition-all ${
            useNostalgicThemes
              ? 'border-retro-red bg-red-50 text-retro-red'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
          }`}
        >
          <Sparkles size={16} />
          <span className="text-sm font-heading uppercase">Nostalgic</span>
        </button>
        <button
          onClick={() => setUseNostalgicThemes(false)}
          className={`flex-1 py-2 px-3 border-2 flex items-center justify-center gap-2 transition-all ${
            !useNostalgicThemes
              ? 'border-retro-red bg-red-50 text-retro-red'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
          }`}
        >
          <Wand2 size={16} />
          <span className="text-sm font-heading uppercase">Classic</span>
        </button>
      </div>

      {useNostalgicThemes ? (
        <NostalgicThemeGrid
          selectedThemeId={formData.themeId}
          onSelectTheme={(themeId) => setFormData({ ...formData, themeId })}
          onSurpriseMe={onSurpriseMe}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
          {themesData?.brandStyles?.map((style: {
            id: string;
            name: string;
            category: string;
            shortDescription?: string;
            previewColors?: string[];
          }) => (
            <button
              key={style.id}
              onClick={() => setFormData({ ...formData, themeId: style.id })}
              className={`p-4 border-2 text-left transition-all ${
                formData.themeId === style.id
                  ? 'border-retro-red bg-red-50 shadow-retro'
                  : 'border-gray-300 hover:border-gray-500 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-heading uppercase text-sm">{style.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{style.shortDescription}</p>
                </div>
                {style.previewColors && style.previewColors.length > 0 && (
                  <div className="flex gap-1">
                    {style.previewColors.slice(0, 4).map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-sm border border-black/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface OptionsStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  packType: PackType | null;
  setPackType: (type: PackType | null) => void;
  packEra: string | null;
  setPackEra: (era: string | null) => void;
  packStyle: string | null;
  setPackStyle: (style: string | null) => void;
}

export function OptionsStep({
  formData,
  setFormData,
  packType,
  setPackType,
  packEra,
  setPackEra,
  packStyle,
  setPackStyle,
}: OptionsStepProps) {
  return (
    <div className="space-y-6">
      <VehiclePicker
        selectedVehicleId={formData.vehicleId}
        onSelectVehicle={(vehicleId) => setFormData({ ...formData, vehicleId })}
      />

      <LanguageToggle
        language={formData.language}
        onChange={(language) => setFormData({ ...formData, language })}
      />

      <PackSelector
        selectedPack={packType}
        onSelectPack={setPackType}
        selectedEra={packEra}
        onSelectEra={setPackEra}
        selectedStyle={packStyle}
        onSelectStyle={setPackStyle}
      />
    </div>
  );
}

interface GenerateStepProps {
  formData: FormData;
  packType: PackType | null;
  packEra: string | null;
  packStyle: string | null;
}

export function GenerateStep({ formData, packType, packEra, packStyle }: GenerateStepProps) {
  return (
    <div className="text-center py-8">
      <Wand2 size={48} className="mx-auto mb-4 text-retro-red" />
      <p className="font-heading text-lg uppercase mb-2">Ready to Generate!</p>
      <p className="text-gray-600 mb-4">
        {packType
          ? `Create ${packType === 'variety-3' ? 3 : packType === 'variety-5' ? 5 : packType === 'week-7' ? 7 : 4} flyers`
          : 'Create your custom flyer'}
      </p>
      <div className="text-left bg-gray-50 p-4 border-2 border-black mb-4 text-sm">
        <p><strong>Message:</strong> {formData.message}</p>
        <p><strong>Subject:</strong> {formData.subject}</p>
        <p><strong>Theme:</strong> {formData.themeId}</p>
        {formData.vehicleId && (
          <p><strong>Vehicle:</strong> {formData.vehicleId === 'random' ? 'Random' : formData.vehicleId}</p>
        )}
        <p><strong>Language:</strong> {formData.language === 'both' ? 'English & Spanish' : formData.language === 'es' ? 'Spanish' : 'English'}</p>
        {packType && (
          <p><strong>Pack:</strong> {packType}{packEra ? ` (${packEra})` : ''}{packStyle ? ` (${packStyle})` : ''}</p>
        )}
      </div>
    </div>
  );
}
