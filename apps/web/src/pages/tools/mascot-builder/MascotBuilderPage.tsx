import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mascotBuilderApi } from '../../../services/api';
import {
  Palette,
  Loader,
  Sparkles,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_FUR_COLORS = [
  { id: 'tan', name: 'Tan', hex: '#D2B48C' },
  { id: 'brown', name: 'Brown', hex: '#8B4513' },
  { id: 'orange', name: 'Orange', hex: '#FF8C00' },
  { id: 'green', name: 'Green', hex: '#2E8B57' },
  { id: 'blue', name: 'Blue', hex: '#4169E1' },
  { id: 'pink', name: 'Pink', hex: '#FF69B4' },
  { id: 'red', name: 'Red', hex: '#DC143C' },
  { id: 'purple', name: 'Purple', hex: '#8B008B' },
];

const DEFAULT_OUTFIT_COLORS = [
  { id: 'navy', name: 'Navy Blue', hex: '#1A365D' },
  { id: 'red', name: 'Red', hex: '#C53030' },
  { id: 'green', name: 'Green', hex: '#276749' },
  { id: 'black', name: 'Black', hex: '#1A1A1A' },
  { id: 'gray', name: 'Gray', hex: '#718096' },
  { id: 'orange', name: 'Orange', hex: '#DD6B20' },
];

const DEFAULT_EYE_STYLES = [
  { id: 'round', name: 'Round & Friendly' },
  { id: 'sleepy', name: 'Sleepy & Chill' },
  { id: 'wide', name: 'Wide & Surprised' },
  { id: 'confident', name: 'Confident Squint' },
];

const DEFAULT_HAIRSTYLES = [
  { id: 'short-black', name: 'Short Black' },
  { id: 'curly-brown', name: 'Curly Brown' },
  { id: 'mohawk', name: 'Mohawk' },
  { id: 'bald', name: 'Bald' },
  { id: 'ponytail', name: 'Ponytail' },
  { id: 'spiky', name: 'Spiky' },
  { id: 'afro', name: 'Afro' },
  { id: 'buzz-cut', name: 'Buzz Cut' },
];

const DEFAULT_ACCESSORIES = [
  { id: 'none', name: 'None' },
  { id: 'sunglasses', name: 'Sunglasses' },
  { id: 'hard-hat', name: 'Hard Hat' },
  { id: 'bandana', name: 'Bandana' },
  { id: 'cap', name: 'Baseball Cap' },
];

const DEFAULT_OUTFIT_TYPES = [
  { id: 'jumpsuit', name: 'Jumpsuit' },
  { id: 'polo', name: 'Polo Shirt' },
  { id: 'hoodie', name: 'Hoodie' },
  { id: 'hawaiian', name: 'Hawaiian Shirt' },
  { id: 'lab-coat', name: 'Lab Coat' },
  { id: 'vest', name: 'Work Vest' },
  { id: 'apron', name: 'Shop Apron' },
];

const DEFAULT_SEASONAL = [
  { id: 'none', name: 'None' },
  { id: 'santa-hat', name: 'Santa Hat' },
  { id: 'sunglasses', name: 'Sunglasses' },
  { id: 'rain-gear', name: 'Rain Gear' },
  { id: 'bunny-ears', name: 'Bunny Ears' },
  { id: 'flag-cape', name: 'July 4th Cape' },
  { id: 'fall-scarf', name: 'Fall Scarf' },
];

const PERSONALITY_PRESETS = [
  { id: 'hype-man', name: 'The Hype Man', description: 'Over-the-top excited about every service', icon: '🔥', energyLevel: 'maximum', speakingStyle: 'Fast-talking, uses superlatives', defaultCatchphrase: "LET'S GOOOOO! Your car is gonna LOVE this!" },
  { id: 'trusted-expert', name: 'The Trusted Expert', description: 'Calm, knowledgeable, explains clearly', icon: '🔧', energyLevel: 'medium', speakingStyle: 'Measured and confident', defaultCatchphrase: "Here's the deal — we'll take great care of your ride." },
  { id: 'funny-friend', name: 'The Funny Friend', description: 'Makes everything a joke', icon: '😂', energyLevel: 'high', speakingStyle: 'Jokes, puns, playful sarcasm', defaultCatchphrase: "Your car called... it says it misses us!" },
  { id: 'neighborhood-buddy', name: 'The Neighborhood Buddy', description: 'Warm and personal', icon: '🏘️', energyLevel: 'low', speakingStyle: 'Conversational and warm', defaultCatchphrase: "We treat every car like it belongs to family." },
  { id: 'drill-sergeant', name: 'The Drill Sergeant', description: 'Military precision meets mechanics', icon: '🫡', energyLevel: 'high', speakingStyle: 'Short commands, intense', defaultCatchphrase: "DROP AND GIVE ME AN OIL CHANGE, SOLDIER!" },
];

interface Mascot {
  id: string;
  imageUrl: string;
  title: string;
  metadata?: { shirtName?: string };
}

export default function MascotBuilderPage() {
  const queryClient = useQueryClient();
  const [shirtName, setShirtName] = useState('');
  const [furColor, setFurColor] = useState('tan');
  const [eyeStyle, setEyeStyle] = useState('round');
  const [hairstyle, setHairstyle] = useState('short-black');
  const [outfitColor, setOutfitColor] = useState('navy');
  const [accessory, setAccessory] = useState('none');
  const [outfitType, setOutfitType] = useState('jumpsuit');
  const [seasonalAccessory, setSeasonalAccessory] = useState('none');
  const [personalityPreset, setPersonalityPreset] = useState('');
  const [catchphrase, setCatchphrase] = useState('');
  const [energyLevel, setEnergyLevel] = useState('high');
  const [speakingStyle, setSpeakingStyle] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Fetch options from API (with fallback to defaults)
  const { data: optionsData } = useQuery({
    queryKey: ['mascot-options'],
    queryFn: () => mascotBuilderApi.getOptions().then((res) => res.data),
  });

  const options = optionsData?.data;
  const furColors = options?.furColors || DEFAULT_FUR_COLORS;
  const outfitColors = options?.outfitColors || DEFAULT_OUTFIT_COLORS;
  const eyeStyles = options?.eyeStyles || DEFAULT_EYE_STYLES;
  const hairstyles = options?.hairstyles || DEFAULT_HAIRSTYLES;
  const accessories = options?.accessories || DEFAULT_ACCESSORIES;

  // Fetch saved mascots
  const { data: mascotsData } = useQuery({
    queryKey: ['mascots'],
    queryFn: () => mascotBuilderApi.getMascots().then((res) => res.data),
  });

  const mascots: Mascot[] = mascotsData?.data || [];

  // Generate mutation (image gen, not video -- no polling needed)
  const generateMutation = useMutation({
    mutationFn: () =>
      mascotBuilderApi.generate({
        shirtName,
        furColor,
        eyeStyle,
        hairstyle,
        outfitColor,
        outfitType,
        accessory: accessory !== 'none' ? accessory : undefined,
        seasonalAccessory: seasonalAccessory !== 'none' ? seasonalAccessory : undefined,
        personality: personalityPreset ? {
          presetId: personalityPreset,
          catchphrase,
          energyLevel,
          speakingStyle,
        } : undefined,
      }),
    onSuccess: (response) => {
      const data = response.data.data || response.data;
      setGeneratedImage(data.imageUrl);
      queryClient.invalidateQueries({ queryKey: ['mascots'] });
      toast.success('Mascot created!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate mascot');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mascotBuilderApi.deleteMascot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mascots'] });
      toast.success('Mascot deleted');
    },
    onError: () => {
      toast.error('Failed to delete mascot');
    },
  });

  const handleGenerate = () => {
    if (!shirtName.trim()) {
      toast.error('Please enter a name for the shirt');
      return;
    }
    generateMutation.mutate();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro flex items-center justify-center gap-3">
          <Palette className="text-retro-mustard" />
          Mascot Builder
        </h1>
        <p className="text-gray-600 mt-2">Create custom muppet-style puppet characters</p>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Customization */}
        <div className="card-retro space-y-5">
          {/* Shirt Name */}
          <div>
            <label className="block font-heading text-sm uppercase mb-1">Shirt Name *</label>
            <input
              type="text"
              value={shirtName}
              onChange={(e) => setShirtName(e.target.value)}
              placeholder="Enter name for shirt..."
              className="input-retro w-full"
            />
          </div>

          {/* Fur Color */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2">Fur Color</label>
            <div className="flex gap-2 flex-wrap">
              {furColors.map((color: any) => (
                <button
                  key={color.id}
                  onClick={() => setFurColor(color.id)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    furColor === color.id
                      ? 'border-retro-red ring-2 ring-retro-red ring-offset-2'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Eye Style */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2">Eye Style</label>
            <div className="grid grid-cols-2 gap-2">
              {eyeStyles.map((style: any) => (
                <button
                  key={style.id}
                  onClick={() => setEyeStyle(style.id)}
                  className={`py-2 px-3 border-2 font-heading text-xs uppercase transition-all ${
                    eyeStyle === style.id
                      ? 'border-retro-red bg-red-50 text-retro-red'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Hairstyle */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2">Hairstyle</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {hairstyles.map((style: any) => (
                <button
                  key={style.id}
                  onClick={() => setHairstyle(style.id)}
                  className={`py-2 px-2 border-2 font-heading text-xs uppercase transition-all ${
                    hairstyle === style.id
                      ? 'border-retro-red bg-red-50 text-retro-red'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Outfit Color */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2">Outfit Color</label>
            <div className="flex gap-2 flex-wrap">
              {outfitColors.map((color: any) => (
                <button
                  key={color.id}
                  onClick={() => setOutfitColor(color.id)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    outfitColor === color.id
                      ? 'border-retro-red ring-2 ring-retro-red ring-offset-2'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Outfit Type */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2 text-retro-navy">Outfit Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(options?.outfitTypes || DEFAULT_OUTFIT_TYPES).map((type: any) => (
                <button
                  key={type.id}
                  onClick={() => setOutfitType(type.id)}
                  className={`py-2 px-3 border-2 font-heading text-xs uppercase transition-all ${
                    outfitType === type.id
                      ? 'border-retro-red bg-red-50 text-retro-red'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Accessory */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2">Accessory</label>
            <div className="flex gap-2 flex-wrap">
              {accessories.map((acc: any) => (
                <button
                  key={acc.id}
                  onClick={() => setAccessory(acc.id)}
                  className={`py-2 px-3 border-2 font-heading text-xs uppercase transition-all ${
                    accessory === acc.id
                      ? 'border-retro-red bg-red-50 text-retro-red'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {acc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Seasonal Accessory */}
          <div>
            <label className="block font-heading text-sm uppercase mb-2 text-retro-navy">Seasonal Accessory</label>
            <div className="grid grid-cols-2 gap-2">
              {(options?.seasonalAccessories || DEFAULT_SEASONAL).map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => setSeasonalAccessory(item.id)}
                  className={`py-2 px-3 border-2 font-heading text-xs uppercase transition-all ${
                    seasonalAccessory === item.id
                      ? 'border-retro-red bg-red-50 text-retro-red'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div className="border-t-2 border-gray-200 pt-4">
            <label className="block font-heading text-sm uppercase mb-2 text-retro-navy">Personality</label>
            <p className="text-xs text-gray-500 mb-3">How your mascot acts in videos</p>
            <div className="space-y-2">
              {PERSONALITY_PRESETS.map((preset: any) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setPersonalityPreset(preset.id);
                    setCatchphrase(preset.defaultCatchphrase);
                    setEnergyLevel(preset.energyLevel);
                    setSpeakingStyle(preset.speakingStyle);
                  }}
                  className={`w-full py-3 px-4 border-2 text-left transition-all ${
                    personalityPreset === preset.id
                      ? 'border-retro-red bg-red-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{preset.icon}</span>
                    <span className="font-heading text-sm uppercase">{preset.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-7">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Catchphrase */}
          {personalityPreset && (
            <div>
              <label className="block font-heading text-sm uppercase mb-1 text-retro-navy">Catchphrase</label>
              <input
                type="text"
                value={catchphrase}
                onChange={(e) => setCatchphrase(e.target.value)}
                className="input-retro w-full"
                placeholder="Enter your mascot's catchphrase..."
                maxLength={100}
              />
            </div>
          )}

          {/* Energy Level */}
          {personalityPreset && (
            <div>
              <label className="block font-heading text-sm uppercase mb-2 text-retro-navy">Energy Level</label>
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'medium', 'high', 'maximum'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnergyLevel(level)}
                    className={`py-2 px-1 border-2 font-heading text-xs uppercase transition-all ${
                      energyLevel === level
                        ? 'border-retro-red bg-red-50 text-retro-red'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {level === 'maximum' ? 'MAX!' : level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !shirtName.trim()}
            className="w-full btn-retro-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <>
                <Loader className="animate-spin" size={20} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                GENERATE MASCOT
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Preview */}
        <div className="card-retro flex flex-col items-center justify-center min-h-[400px]">
          {generateMutation.isPending ? (
            <div className="text-center space-y-4">
              <Loader className="w-16 h-16 animate-spin text-retro-red mx-auto" />
              <p className="font-heading text-lg uppercase">Creating Your Mascot...</p>
              <p className="text-sm text-gray-500">This usually takes about 15-30 seconds</p>
            </div>
          ) : generatedImage ? (
            <div className="text-center space-y-4 w-full">
              <img
                src={generatedImage}
                alt={`Mascot: ${shirtName}`}
                className="w-full max-w-md mx-auto border-2 border-black shadow-retro"
              />
              <p className="font-heading text-lg uppercase">{shirtName}</p>
            </div>
          ) : (
            <div className="text-center text-gray-400 space-y-3">
              <Palette size={64} className="mx-auto" />
              <p className="font-heading uppercase">Mascot Preview</p>
              <p className="text-sm">Customize your mascot on the left, then hit generate!</p>
              <div className="text-xs text-gray-400 bg-gray-50 p-3 border border-gray-200 max-w-xs mx-auto">
                <p className="font-heading uppercase text-gray-500 mb-1">Current Selection:</p>
                <p>Fur: {furColors.find((c: any) => c.id === furColor)?.name || furColor}</p>
                <p>Eyes: {eyeStyles.find((s: any) => s.id === eyeStyle)?.name || eyeStyle}</p>
                <p>Hair: {hairstyles.find((s: any) => s.id === hairstyle)?.name || hairstyle}</p>
                <p>Outfit: {outfitColors.find((c: any) => c.id === outfitColor)?.name || outfitColor}</p>
                {accessory !== 'none' && (
                  <p>Accessory: {accessories.find((a: any) => a.id === accessory)?.name || accessory}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Mascots Gallery */}
      {mascots.length > 0 && (
        <div className="card-retro">
          <h2 className="font-heading text-lg uppercase mb-4">Saved Mascots</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mascots.map((mascot) => (
              <div key={mascot.id} className="card-retro p-3">
                <img
                  src={mascot.imageUrl}
                  alt={mascot.title}
                  className="w-full aspect-square object-cover border"
                />
                <h4 className="font-heading text-sm mt-2">{mascot.metadata?.shirtName || mascot.title}</h4>
                <button
                  onClick={() => deleteMutation.mutate(mascot.id)}
                  disabled={deleteMutation.isPending}
                  className="text-xs text-red-500 mt-1 flex items-center gap-1 hover:text-red-700"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
