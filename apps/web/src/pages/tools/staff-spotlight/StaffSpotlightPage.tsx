import { useState } from 'react';
import { Loader2, Download, Share2, Sparkles, RotateCcw, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoUpload from '../../../components/features/PhotoUpload';
import { staffSpotlightApi } from '../../../services/api';

const ALL_FORMATS = [
  { id: 'trading-card', name: 'Trading Card', icon: '\uD83C\uDCCF', description: 'Collectible card with stats' },
  { id: 'superhero', name: 'Superhero', icon: '\uD83E\uDDB8', description: 'Comic book hero transformation' },
  { id: 'action-figure', name: 'Action Figure', icon: '\uD83D\uDCE6', description: 'Toy box packaging' },
  { id: 'movie-poster', name: 'Movie Poster', icon: '\uD83C\uDFAC', description: 'Cinematic blockbuster poster' },
  { id: 'magazine-cover', name: 'Magazine Cover', icon: '\uD83D\uDCF0', description: 'Pro magazine feature' },
  { id: 'wanted-poster', name: 'Wanted Poster', icon: '\uD83E\uDD20', description: 'Old West style humor' },
  { id: 'employee-month', name: 'Employee of the Month', icon: '\uD83C\uDFC6', description: 'Gold-framed spotlight' },
  { id: 'comic-strip', name: 'Comic Strip', icon: '\uD83D\uDCAC', description: '4-panel comic story' },
  { id: 'sports-card', name: 'Sports Card', icon: '\uD83C\uDFC8', description: 'NFL/NBA draft card style' },
  { id: 'album-cover', name: 'Album Cover', icon: '\uD83C\uDFB5', description: 'Music album parody' },
];

const POSITION_OPTIONS = [
  'Lead Technician',
  'Service Advisor',
  'Shop Owner',
  'Master Mechanic',
  'Lube Tech',
  'Apprentice',
  'Parts Manager',
  'Shop Manager',
];

const SPECIALTY_CHIPS = [
  'Engine Diagnostics',
  'Transmission',
  'Electrical',
  'Brakes',
  'Suspension',
  'A/C & Heating',
  'Hybrid/EV',
  'Performance Tuning',
];

const MAX_FORMATS = 4;
const MAX_CERTIFICATIONS = 10;

interface SpotlightResult {
  id: string;
  format: string;
  formatName: string;
  imageUrl: string;
  status: 'loading' | 'done' | 'error';
  error?: string;
}

export default function StaffSpotlightPage() {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [position, setPosition] = useState('');
  const [customPosition, setCustomPosition] = useState('');
  const [yearsExperience, setYearsExperience] = useState<number | ''>('');
  const [specialty, setSpecialty] = useState('');
  const [funFact, setFunFact] = useState('');
  const [nickname, setNickname] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [results, setResults] = useState<SpotlightResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev => {
      if (prev.includes(id)) return prev.filter(f => f !== id);
      if (prev.length >= MAX_FORMATS) {
        toast.error(`Max ${MAX_FORMATS} formats`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const addCertification = () => {
    const val = certInput.trim();
    if (!val) return;
    if (certifications.length >= MAX_CERTIFICATIONS) {
      toast.error(`Max ${MAX_CERTIFICATIONS} certifications`);
      return;
    }
    if (certifications.includes(val)) {
      toast.error('Already added');
      return;
    }
    setCertifications(prev => [...prev, val]);
    setCertInput('');
  };

  const removeCertification = (cert: string) => {
    setCertifications(prev => prev.filter(c => c !== cert));
  };

  const resolvedPosition = position === 'Custom' ? customPosition : position;
  const canGenerate = photoBase64 && staffName.trim() && selectedFormats.length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);

    const initialResults: SpotlightResult[] = selectedFormats.map(f => ({
      id: `spot-${Date.now()}-${f}`,
      format: f,
      formatName: ALL_FORMATS.find(fmt => fmt.id === f)?.name || f,
      imageUrl: '',
      status: 'loading' as const,
    }));
    setResults(initialResults);

    try {
      const res = await staffSpotlightApi.generate({
        photoBase64: photoBase64!,
        staffName,
        position: resolvedPosition || undefined,
        yearsExperience: yearsExperience !== '' ? Number(yearsExperience) : undefined,
        specialty: specialty || undefined,
        funFact: funFact || undefined,
        nickname: nickname || undefined,
        certifications: certifications.length > 0 ? certifications : undefined,
        formats: selectedFormats,
      });

      const apiResults = res.data.results || [];
      setResults(prev =>
        prev.map((r, i) => {
          const apiResult = apiResults[i];
          if (apiResult && apiResult.imageUrl) {
            return { ...r, status: 'done', imageUrl: apiResult.imageUrl, id: apiResult.id };
          }
          return { ...r, status: 'error', error: apiResult?.error || 'No result' };
        }),
      );
      toast.success('Spotlights generated!');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Generation failed';
      setResults(prev => prev.map(r => ({ ...r, status: 'error', error: msg })));
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (result: SpotlightResult) => {
    try {
      const a = document.createElement('a');
      a.href = result.imageUrl;
      a.download = `${staffName}-${result.format}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleShare = (result: SpotlightResult) => {
    const url = `${window.location.origin}/content/${result.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-retro text-4xl sm:text-5xl">STAFF SPOTLIGHT</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Turn your team into scroll-stopping content
        </p>
      </div>

      {/* Upload Photo */}
      <div className="card-retro p-5">
        <h3 className="font-heading text-sm uppercase text-gray-500 dark:text-gray-400 mb-3">
          Upload a Photo
        </h3>
        <PhotoUpload
          photoBase64={photoBase64}
          onPhotoChange={setPhotoBase64}
          label="Drop a staff photo here"
          hint="JPG, PNG, or WebP -- max 10MB"
        />
      </div>

      {/* Staff Info */}
      <div className="card-retro p-5 space-y-4">
        <h3 className="font-heading text-sm uppercase text-gray-500 dark:text-gray-400">
          Staff Info
        </h3>

        {/* Name */}
        <div>
          <label className="block font-heading uppercase text-sm mb-1.5">Name *</label>
          <input
            type="text"
            className="input-retro"
            placeholder="e.g., Mike Rodriguez"
            value={staffName}
            onChange={e => setStaffName(e.target.value)}
          />
        </div>

        {/* Position */}
        <div>
          <label className="block font-heading uppercase text-sm mb-1.5">Position</label>
          <select
            className="select-retro"
            value={position}
            onChange={e => setPosition(e.target.value)}
          >
            <option value="">Select position...</option>
            {POSITION_OPTIONS.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="Custom">Custom...</option>
          </select>
          {position === 'Custom' && (
            <input
              type="text"
              className="input-retro mt-2"
              placeholder="Enter custom position"
              value={customPosition}
              onChange={e => setCustomPosition(e.target.value)}
            />
          )}
        </div>

        {/* Years Experience */}
        <div>
          <label className="block font-heading uppercase text-sm mb-1.5">Years Experience</label>
          <input
            type="number"
            className="input-retro"
            placeholder="e.g., 12"
            min={0}
            max={50}
            value={yearsExperience}
            onChange={e => setYearsExperience(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        {/* Specialty */}
        <div>
          <label className="block font-heading uppercase text-sm mb-1.5">Specialty</label>
          <input
            type="text"
            className="input-retro"
            placeholder="e.g., Engine Diagnostics"
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {SPECIALTY_CHIPS.map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => setSpecialty(chip)}
                className={`text-xs px-3 py-1 border transition-all ${
                  specialty === chip
                    ? 'border-retro-red bg-red-50 text-retro-red'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Fun Fact */}
        <div>
          <label className="block font-heading uppercase text-sm mb-1.5">Fun Fact</label>
          <input
            type="text"
            className="input-retro"
            placeholder="Can identify any engine by sound"
            value={funFact}
            onChange={e => setFunFact(e.target.value)}
          />
        </div>

        {/* Nickname */}
        <div>
          <label className="block font-heading uppercase text-sm mb-1.5">
            Hero Name / Nickname{' '}
            <span className="text-gray-400 font-normal normal-case">(optional)</span>
          </label>
          <input
            type="text"
            className="input-retro"
            placeholder="The Brake Whisperer"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
          />
        </div>

        {/* Certifications */}
        <div>
          <label className="block font-heading uppercase text-sm mb-1.5">Certifications</label>
          {certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {certifications.map(cert => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-red-50 border border-retro-red text-retro-red"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCertification(cert)}
                    className="hover:text-red-700"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              className="input-retro flex-1"
              placeholder="e.g., ASE Master"
              value={certInput}
              onChange={e => setCertInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCertification();
                }
              }}
            />
            <button
              type="button"
              onClick={addCertification}
              disabled={!certInput.trim() || certifications.length >= MAX_CERTIFICATIONS}
              className="btn-retro-primary px-4 py-2 flex items-center gap-1 text-sm"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {certifications.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {certifications.length} of {MAX_CERTIFICATIONS}
            </p>
          )}
        </div>
      </div>

      {/* Format Picker */}
      <div className="card-retro p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-sm uppercase text-gray-500 dark:text-gray-400">
            Pick Your Formats
          </h3>
          <span className="text-xs text-gray-400">
            {selectedFormats.length} of {MAX_FORMATS} selected
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ALL_FORMATS.map(fmt => {
            const isSelected = selectedFormats.includes(fmt.id);
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => toggleFormat(fmt.id)}
                className={`p-3 border-2 text-left transition-all ${
                  isSelected
                    ? 'border-retro-red bg-red-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <span className="text-2xl block mb-1">{fmt.icon}</span>
                <span className="font-heading text-xs uppercase block">{fmt.name}</span>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{fmt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="w-full btn-retro-primary flex items-center justify-center gap-2 py-4 text-lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Generate {selectedFormats.length > 1
              ? `${selectedFormats.length} Spotlights`
              : selectedFormats.length === 1
              ? '1 Spotlight'
              : 'Spotlights'}
          </>
        )}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="card-retro p-5">
          <h3 className="font-heading text-sm uppercase text-gray-500 dark:text-gray-400 mb-4">
            Results
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {results.map(result => (
              <div
                key={result.id}
                className="card-retro p-3 flex flex-col"
              >
                {result.status === 'loading' && (
                  <div className="aspect-[4/5] flex items-center justify-center bg-gray-50">
                    <Loader2 className="animate-spin text-retro-red" size={32} />
                  </div>
                )}

                {result.status === 'error' && (
                  <div className="aspect-[4/5] flex flex-col items-center justify-center bg-gray-50 p-3 text-center">
                    <p className="text-xs text-red-600 mb-2">{result.error}</p>
                    <button
                      onClick={handleGenerate}
                      className="text-xs flex items-center gap-1 text-retro-red hover:text-red-700"
                    >
                      <RotateCcw size={12} /> Retry
                    </button>
                  </div>
                )}

                {result.status === 'done' && (
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={result.imageUrl}
                      alt={`${staffName} - ${result.formatName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="mt-2">
                  <span
                    className="inline-block text-[10px] font-heading uppercase px-2 py-0.5 bg-gray-100 border border-gray-200"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    {result.formatName}
                  </span>
                </div>

                {result.status === 'done' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDownload(result)}
                      className="flex-1 text-xs flex items-center justify-center gap-1 py-1.5 border border-gray-300 hover:border-retro-red hover:text-retro-red transition-colors"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <Download size={12} /> Save
                    </button>
                    <button
                      onClick={() => handleShare(result)}
                      className="flex-1 text-xs flex items-center justify-center gap-1 py-1.5 border border-gray-300 hover:border-retro-red hover:text-retro-red transition-colors"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <Share2 size={12} /> Share
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
