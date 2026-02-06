interface BrandVoiceStepProps {
  selectedVoice: string;
  onChange: (voice: string) => void;
}

const voiceOptions = [
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Hey neighbor! Warm, casual, conversational',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Clear, confident, trustworthy expertise',
  },
  {
    value: 'humorous',
    label: 'Humorous',
    description: 'Puns, jokes, personality \u2014 stands out in the feed',
  },
  {
    value: 'authoritative',
    label: 'Authoritative',
    description: 'Expert confidence meets technical knowledge',
  },
];

export default function BrandVoiceStep({ selectedVoice, onChange }: BrandVoiceStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-4">
        How should your marketing content sound?
      </p>
      {voiceOptions.map((voice) => (
        <label
          key={voice.value}
          className={`flex items-start gap-3 p-4 border-2 border-black cursor-pointer ${
            selectedVoice === voice.value ? 'bg-retro-teal text-white' : 'hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name="brandVoice"
            value={voice.value}
            checked={selectedVoice === voice.value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <div>
            <span className="font-heading uppercase block">{voice.label}</span>
            <span className={`text-sm ${
              selectedVoice === voice.value ? 'text-white/80' : 'text-gray-500'
            }`}>
              {voice.description}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
}
