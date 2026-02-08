import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { mascotBuilderApi } from '../../../services/api';
import {
  Camera,
  PenLine,
  Wrench,
  Rocket,
  Loader2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoUpload from '../../../components/features/PhotoUpload';

// ─── Style definitions ─────────────────────────────────────────
const ALL_STYLES = [
  { id: 'muppet', name: 'Muppet', icon: '🧸' },
  { id: 'sports', name: 'Sports', icon: '🏈' },
  { id: 'cartoon', name: 'Cartoon', icon: '🎨' },
  { id: 'retro', name: 'Retro', icon: '🏆' },
  { id: 'anime', name: 'Anime', icon: '🎌' },
  { id: 'cgi', name: 'CGI', icon: '💻' },
  { id: 'mascot-bot', name: 'Robot', icon: '🤖' },
  { id: 'superhero', name: 'Superhero', icon: '🦸' },
  { id: 'caricature', name: 'Caricature', icon: '🎭' },
  { id: 'lego', name: 'LEGO', icon: '🧱' },
  { id: 'pixel-art', name: 'Pixel Art', icon: '👾' },
  { id: 'claymation', name: 'Claymation', icon: '🎬' },
] as const;

const PERSONALITY_PRESETS = [
  { id: 'hype-man', name: 'The Hype Man', icon: '🔥' },
  { id: 'trusted-expert', name: 'The Trusted Expert', icon: '🔧' },
  { id: 'funny-friend', name: 'The Funny Friend', icon: '😂' },
  { id: 'neighborhood-buddy', name: 'The Neighborhood Buddy', icon: '🏘️' },
  { id: 'drill-sergeant', name: 'The Drill Sergeant', icon: '🫡' },
];

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

const DEFAULT_OUTFIT_TYPES = [
  { id: 'jumpsuit', name: 'Jumpsuit' },
  { id: 'polo', name: 'Polo Shirt' },
  { id: 'hoodie', name: 'Hoodie' },
  { id: 'hawaiian', name: 'Hawaiian Shirt' },
  { id: 'lab-coat', name: 'Lab Coat' },
  { id: 'vest', name: 'Work Vest' },
  { id: 'apron', name: 'Shop Apron' },
];

// ─── Types ─────────────────────────────────────────────────────
type CreationMode = 'photo' | 'describe' | 'build';

interface MascotResult {
  id: string;
  style: string;
  styleName: string;
  imageUrl: string;
  status: 'pending' | 'loading' | 'done' | 'error';
  saved: boolean;
  error?: string;
}

interface Mascot {
  id: string;
  imageUrl: string;
  title: string;
  metadata?: { shirtName?: string; mascotName?: string; mascotStyle?: string };
  mascotName?: string;
  mascotStyle?: string;
  shirtName?: string;
}

// ─── Component ─────────────────────────────────────────────────
export default function MascotBuilderPage() {
  const queryClient = useQueryClient();

  // Creation mode
  const [mode, setMode] = useState<CreationMode>('photo');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // Build mode options
  const [furColor, setFurColor] = useState('tan');
  const [eyeStyle, setEyeStyle] = useState('round');
  const [hairstyle, setHairstyle] = useState('short-black');
  const [outfitColor, setOutfitColor] = useState('navy');

  // Shared customize
  const [shirtName, setShirtName] = useState('');
  const [mascotName, setMascotName] = useState('');
  const [outfitType, setOutfitType] = useState('jumpsuit');
  const [accessory, setAccessory] = useState('none');
  const [personalityId, setPersonalityId] = useState('');

  // Results
  const [results, setResults] = useState<MascotResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Fetch saved mascots
  const { data: mascotsData } = useQuery({
    queryKey: ['mascot-list'],
    queryFn: () => mascotBuilderApi.getMascots().then((res) => res.data),
  });

  const mascots: Mascot[] = mascotsData?.data || [];

  // ─── Handlers ──────────────────────────────────────────────
  const toggleStyle = (styleId: string) => {
    setSelectedStyles((prev) => {
      if (prev.includes(styleId)) {
        return prev.filter((s) => s !== styleId);
      }
      if (prev.length >= 4) {
        toast.error('Max 4 styles at once');
        return prev;
      }
      return [...prev, styleId];
    });
  };

  const canGenerate =
    shirtName.trim().length > 0 &&
    selectedStyles.length > 0 &&
    (mode !== 'photo' || photoBase64 !== null) &&
    (mode !== 'describe' || description.trim().length > 0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const initialResults: MascotResult[] = selectedStyles.map((s) => ({
      id: `mascot-${Date.now()}-${s}`,
      style: s,
      styleName: ALL_STYLES.find((st) => st.id === s)?.name || s,
      imageUrl: '',
      status: 'loading' as const,
      saved: false,
    }));
    setResults(initialResults);

    try {
      const res = await mascotBuilderApi.generateV2({
        mode,
        photoBase64: mode === 'photo' ? photoBase64! : undefined,
        description: mode === 'describe' ? description : undefined,
        styles: selectedStyles,
        shirtName,
        mascotName: mascotName || undefined,
        furColor: mode === 'build' ? furColor : undefined,
        eyeStyle: mode === 'build' ? eyeStyle : undefined,
        hairstyle: mode === 'build' ? hairstyle : undefined,
        outfitType: outfitType || undefined,
        outfitColor: mode === 'build' ? outfitColor : undefined,
        accessory: accessory !== 'none' ? accessory : undefined,
        personality: personalityId ? { presetId: personalityId } : undefined,
      });

      const apiResults = res.data.results || res.data.data?.results || [];
      setResults((prev) =>
        prev.map((r, i) => {
          const apiResult = apiResults[i];
          if (apiResult) {
            return {
              ...r,
              status: 'done' as const,
              imageUrl: apiResult.imageUrl,
              id: apiResult.id,
              saved: true,
            };
          }
          return { ...r, status: 'error' as const, error: 'No result returned' };
        }),
      );
      toast.success('Mascots generated!');
      queryClient.invalidateQueries({ queryKey: ['mascot-list'] });
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Generation failed';
      setResults((prev) =>
        prev.map((r) => ({ ...r, status: 'error' as const, error: msg })),
      );
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteMascot = async (id: string) => {
    try {
      await mascotBuilderApi.deleteMascot(id);
      queryClient.invalidateQueries({ queryKey: ['mascot-list'] });
      toast.success('Mascot deleted');
    } catch {
      toast.error('Failed to delete mascot');
    }
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro flex items-center justify-center gap-3">
          <Palette className="text-retro-mustard" />
          Mascot Builder
        </h1>
        <p className="text-gray-600 mt-2">Create your shop's signature character</p>
      </div>

      {/* ─── Mode Selector ─────────────────────────────────── */}
      <div className="card-retro">
        <h2 className="font-heading text-sm uppercase mb-3">How do you want to start?</h2>
        <div className="grid grid-cols-3 gap-3">
          <ModeButton
            active={mode === 'photo'}
            onClick={() => setMode('photo')}
            icon={<Camera size={22} />}
            label="Upload Photo"
            desc="From a real person"
          />
          <ModeButton
            active={mode === 'describe'}
            onClick={() => setMode('describe')}
            icon={<PenLine size={22} />}
            label="Describe"
            desc="Write what you see"
          />
          <ModeButton
            active={mode === 'build'}
            onClick={() => setMode('build')}
            icon={<Wrench size={22} />}
            label="Build"
            desc="Pick every detail"
          />
        </div>

        {/* Mode-specific content */}
        <div className="mt-4">
          {mode === 'photo' && (
            <PhotoUpload
              photoBase64={photoBase64}
              onPhotoChange={setPhotoBase64}
              label="Upload a reference photo"
              hint="We'll turn this person into a mascot character"
            />
          )}

          {mode === 'describe' && (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your mascot: A big friendly guy with a red beard, always smiling, looks like a lumberjack who fixes cars..."
              className="input-retro w-full h-28 resize-none"
              maxLength={500}
            />
          )}

          {mode === 'build' && (
            <div className="space-y-4">
              {/* Fur/Body Color */}
              <div>
                <label className="block font-heading text-xs uppercase mb-2">Fur / Body Color</label>
                <div className="flex gap-2 flex-wrap">
                  {furColors.map((color: any) => (
                    <button
                      key={color.id}
                      onClick={() => setFurColor(color.id)}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
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
                <label className="block font-heading text-xs uppercase mb-2">Eye Style</label>
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
                <label className="block font-heading text-xs uppercase mb-2">Hairstyle</label>
                <div className="grid grid-cols-4 gap-2">
                  {hairstyles.map((style: any) => (
                    <button
                      key={style.id}
                      onClick={() => setHairstyle(style.id)}
                      className={`py-2 px-1 border-2 font-heading text-[10px] uppercase transition-all ${
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
                <label className="block font-heading text-xs uppercase mb-2">Outfit Color</label>
                <div className="flex gap-2 flex-wrap">
                  {outfitColors.map((color: any) => (
                    <button
                      key={color.id}
                      onClick={() => setOutfitColor(color.id)}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
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
            </div>
          )}
        </div>
      </div>

      {/* ─── Style Picker ──────────────────────────────────── */}
      <div className="card-retro">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-sm uppercase">Pick Your Styles (1-4)</h2>
          <span className="text-xs text-gray-500">
            {selectedStyles.length} of 4 selected
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {ALL_STYLES.map((style) => {
            const isSelected = selectedStyles.includes(style.id);
            return (
              <button
                key={style.id}
                onClick={() => toggleStyle(style.id)}
                className={`p-3 border-2 text-center transition-all ${
                  isSelected
                    ? 'border-retro-red bg-red-50 text-retro-red'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
                }`}
              >
                <span className="text-2xl block">{style.icon}</span>
                <span className="font-heading text-[10px] uppercase block mt-1">
                  {style.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Customize ─────────────────────────────────────── */}
      <div className="card-retro space-y-4">
        <h2 className="font-heading text-sm uppercase">Customize</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name on Shirt */}
          <div>
            <label className="block font-heading text-xs uppercase mb-1">
              Name on Shirt <span className="text-retro-red">*</span>
            </label>
            <input
              type="text"
              value={shirtName}
              onChange={(e) => setShirtName(e.target.value)}
              placeholder="MIKE"
              className="input-retro w-full"
              maxLength={20}
            />
          </div>

          {/* Mascot Name */}
          <div>
            <label className="block font-heading text-xs uppercase mb-1">
              Mascot Name <span className="text-gray-400 text-[10px]">(optional)</span>
            </label>
            <input
              type="text"
              value={mascotName}
              onChange={(e) => setMascotName(e.target.value)}
              placeholder="Wrench Willie"
              className="input-retro w-full"
              maxLength={30}
            />
          </div>

          {/* Outfit Type */}
          <div>
            <label className="block font-heading text-xs uppercase mb-1">Outfit</label>
            <select
              value={outfitType}
              onChange={(e) => setOutfitType(e.target.value)}
              className="select-retro w-full"
            >
              {DEFAULT_OUTFIT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Personality */}
          <div>
            <label className="block font-heading text-xs uppercase mb-1">Personality</label>
            <select
              value={personalityId}
              onChange={(e) => setPersonalityId(e.target.value)}
              className="select-retro w-full"
            >
              <option value="">None</option>
              {PERSONALITY_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Generate Button ───────────────────────────────── */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="w-full btn-retro-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Generating...
          </>
        ) : (
          <>
            <Rocket size={20} />
            Generate {selectedStyles.length || ''} Mascot
            {selectedStyles.length > 1 ? 's' : ''}
          </>
        )}
      </button>

      {/* ─── Results Grid ──────────────────────────────────── */}
      {results.length > 0 && (
        <div className="card-retro">
          <h2 className="font-heading text-sm uppercase mb-3">Results</h2>
          <div className="grid grid-cols-2 gap-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="card-retro p-3 flex flex-col items-center"
              >
                {result.status === 'loading' && (
                  <div className="w-full aspect-square flex items-center justify-center bg-gray-50">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                  </div>
                )}

                {result.status === 'error' && (
                  <div className="w-full aspect-square flex flex-col items-center justify-center bg-gray-50 text-center p-3">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                    <p className="text-xs text-red-500">{result.error}</p>
                  </div>
                )}

                {result.status === 'done' && (
                  <img
                    src={result.imageUrl}
                    alt={`${result.styleName} mascot`}
                    className="w-full aspect-square object-cover border border-gray-200"
                  />
                )}

                <div className="mt-2 flex items-center gap-2 w-full">
                  <span className="text-lg">
                    {ALL_STYLES.find((s) => s.id === result.style)?.icon}
                  </span>
                  <span className="font-heading text-xs uppercase flex-1">
                    {result.styleName}
                  </span>
                  {result.status === 'done' && result.saved && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── My Saved Mascots ──────────────────────────────── */}
      <div className="card-retro">
        <h2 className="font-heading text-sm uppercase mb-3">My Saved Mascots</h2>
        {mascots.length === 0 ? (
          <p className="text-sm text-gray-500">No mascots saved yet</p>
        ) : (
          <div className="flex overflow-x-auto gap-3 pb-2">
            {mascots.map((mascot) => {
              const name =
                mascot.mascotName || mascot.metadata?.mascotName || mascot.shirtName || mascot.metadata?.shirtName || mascot.title;
              const styleId = mascot.mascotStyle || mascot.metadata?.mascotStyle || 'muppet';
              const styleDef = ALL_STYLES.find((s) => s.id === styleId);
              return (
                <div
                  key={mascot.id}
                  className="flex-shrink-0 w-24 text-center"
                >
                  <img
                    src={mascot.imageUrl}
                    alt={name}
                    className="w-24 h-32 object-cover border border-gray-200 rounded"
                  />
                  <p className="font-heading text-[10px] uppercase mt-1 truncate">
                    {name}
                  </p>
                  {styleDef && (
                    <span className="text-xs">
                      {styleDef.icon} {styleDef.name}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteMascot(mascot.id)}
                    className="text-xs text-red-500 mt-1 flex items-center gap-1 mx-auto hover:text-red-700"
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function ModeButton({
  active,
  onClick,
  icon,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 border-2 text-center transition-all ${
        active
          ? 'border-retro-red bg-red-50 text-retro-red'
          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
      }`}
    >
      <div className="flex justify-center mb-1">{icon}</div>
      <span className="font-heading text-xs uppercase block">{label}</span>
      <span className="text-[10px] text-gray-500 block mt-1">{desc}</span>
    </button>
  );
}
