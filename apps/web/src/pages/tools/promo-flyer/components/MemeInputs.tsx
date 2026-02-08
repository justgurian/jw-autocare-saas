import { useQuery } from '@tanstack/react-query';
import { memeApi } from '../../../../services/api';

interface MemeStyle {
  id: string;
  name: string;
  description: string;
  category: string;
  previewEmoji: string;
  topicSuggestions: string[];
}

interface MemeInputsProps {
  styleId: string;
  onStyleIdChange: (v: string) => void;
  topic: string;
  onTopicChange: (v: string) => void;
}

export default function MemeInputs({
  styleId, onStyleIdChange,
  topic, onTopicChange,
}: MemeInputsProps) {
  const { data: stylesData, isLoading } = useQuery({
    queryKey: ['meme-styles'],
    queryFn: () => memeApi.getStyles().then(r => r.data),
  });

  const styles: MemeStyle[] = stylesData?.styles || [];
  const selectedStyle = styles.find(s => s.id === styleId);

  return (
    <div className="space-y-4">
      {/* Meme Style */}
      <div>
        <label className="block font-heading uppercase text-sm mb-2">Meme Style *</label>
        {isLoading ? (
          <div className="h-10 bg-gray-200 animate-pulse" />
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
            {styles.map(style => (
              <button
                key={style.id}
                type="button"
                onClick={() => onStyleIdChange(style.id)}
                className={`p-2 border-2 text-left transition-all ${
                  styleId === style.id
                    ? 'border-retro-red bg-red-50'
                    : 'border-gray-300 bg-white hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{style.previewEmoji}</span>
                  <span className="font-heading text-xs uppercase">{style.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Topic */}
      <div>
        <label className="block font-heading uppercase text-sm mb-2">Topic *</label>
        <input
          type="text"
          placeholder="e.g., Customers who ignore the check engine light"
          value={topic}
          onChange={e => onTopicChange(e.target.value)}
          className="w-full border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:border-retro-red focus:outline-none"
        />
        {/* Topic suggestions */}
        {selectedStyle && selectedStyle.topicSuggestions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedStyle.topicSuggestions.slice(0, 4).map(sug => (
              <button
                key={sug}
                type="button"
                onClick={() => onTopicChange(sug)}
                className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors truncate max-w-[180px]"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
