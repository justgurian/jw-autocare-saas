import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  language: 'en' | 'es' | 'both';
  onChange: (language: 'en' | 'es' | 'both') => void;
}

export default function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 font-heading uppercase text-sm">
        <Globe size={16} />
        Language
      </label>

      <div className="flex gap-2">
        <button
          onClick={() => onChange('en')}
          className={`flex-1 py-2 px-3 border-2 text-sm font-heading uppercase transition-all ${
            language === 'en'
              ? 'border-retro-teal bg-teal-50 text-retro-teal'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
          }`}
        >
          English
        </button>
        <button
          onClick={() => onChange('es')}
          className={`flex-1 py-2 px-3 border-2 text-sm font-heading uppercase transition-all ${
            language === 'es'
              ? 'border-retro-teal bg-teal-50 text-retro-teal'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
          }`}
        >
          Spanish
        </button>
        <button
          onClick={() => onChange('both')}
          className={`flex-1 py-2 px-3 border-2 text-sm font-heading uppercase transition-all ${
            language === 'both'
              ? 'border-retro-teal bg-teal-50 text-retro-teal'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
          }`}
        >
          Both
        </button>
      </div>

      <p className="text-xs text-gray-500">
        {language === 'both'
          ? 'Generate captions in both English and Spanish'
          : `Generate caption in ${language === 'en' ? 'English' : 'Spanish'}`}
      </p>
    </div>
  );
}
