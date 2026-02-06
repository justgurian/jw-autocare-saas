interface BrandVoiceStepProps {
  selectedVoice: string;
  onChange: (voice: string) => void;
}

export default function BrandVoiceStep({ selectedVoice, onChange }: BrandVoiceStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-4">
        How should your marketing content sound?
      </p>
      {['friendly', 'professional', 'humorous', 'authoritative'].map((voice) => (
        <label
          key={voice}
          className={`flex items-center gap-3 p-4 border-2 border-black cursor-pointer ${
            selectedVoice === voice ? 'bg-retro-teal text-white' : 'hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name="brandVoice"
            value={voice}
            checked={selectedVoice === voice}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <span className="font-heading uppercase">{voice}</span>
        </label>
      ))}
    </div>
  );
}
