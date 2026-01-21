import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BookOpen, Zap, FileText, Mail, ArrowRight, Copy, Check, Search } from 'lucide-react';
import { api } from '../../../services/api';

interface TranslationMode {
  id: string;
  name: string;
  description: string;
}

interface JargonResult {
  original: string;
  translated: string;
  keyTerms?: Array<{
    term: string;
    explanation: string;
    analogy?: string;
  }>;
}

interface DictionaryTerm {
  term: string;
  simple: string;
  explanation: string;
  analogy?: string;
}

const modeIcons: Record<string, React.ReactNode> = {
  simplify: <Zap size={18} />,
  explain: <BookOpen size={18} />,
  estimate: <FileText size={18} />,
  email: <Mail size={18} />,
};

export default function JargonPage() {
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState('simplify');
  const [result, setResult] = useState<JargonResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDictionary, setShowDictionary] = useState(false);

  // Fetch available modes
  const { data: modesData } = useQuery<{ modes: TranslationMode[] }>({
    queryKey: ['jargon', 'modes'],
    queryFn: async () => {
      const response = await api.get('/tools/jargon/modes');
      return response.data;
    },
  });

  // Fetch dictionary
  const { data: dictionaryData } = useQuery<{ terms: DictionaryTerm[] }>({
    queryKey: ['jargon', 'dictionary'],
    queryFn: async () => {
      const response = await api.get('/tools/jargon/dictionary');
      return response.data;
    },
  });

  // Translation mutation
  const translateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tools/jargon/translate', {
        text: inputText,
        mode: selectedMode,
        includeAnalogy: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data.result);
    },
  });

  const handleTranslate = () => {
    if (!inputText.trim()) return;
    translateMutation.mutate();
  };

  const handleCopy = () => {
    if (result?.translated) {
      navigator.clipboard.writeText(result.translated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter dictionary terms
  const filteredTerms = dictionaryData?.terms.filter(
    (t) =>
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-retro-navy mb-2">Jargon Translator</h1>
        <p className="text-gray-600">
          Convert technical auto repair language into customer-friendly explanations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Input/Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Selection */}
          <div className="bg-white border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-3">Translation Mode</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {modesData?.modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-3 border-2 flex flex-col items-center gap-2 transition-all ${
                    selectedMode === mode.id
                      ? 'border-retro-red bg-retro-red/5'
                      : 'border-black hover:border-retro-navy'
                  }`}
                >
                  {modeIcons[mode.id]}
                  <span className="text-sm font-heading">{mode.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="bg-white border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-3">Technical Text</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your technical repair description here... e.g., 'The vehicle requires replacement of the timing belt, water pump, and tensioner. The CV joints also show signs of wear.'"
              className="w-full h-40 p-3 border-2 border-black focus:border-retro-red outline-none resize-none"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">{inputText.length} characters</span>
              <button
                onClick={handleTranslate}
                disabled={!inputText.trim() || translateMutation.isPending}
                className="px-6 py-2 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {translateMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Translating...
                  </>
                ) : (
                  <>
                    Translate
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output */}
          {result && (
            <div className="bg-white border-2 border-black p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-heading text-sm uppercase">Customer-Friendly Version</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-retro-navy"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-retro-cream border-2 border-dashed border-retro-navy/30">
                <p className="whitespace-pre-wrap">{result.translated}</p>
              </div>

              {/* Key Terms */}
              {result.keyTerms && result.keyTerms.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-heading text-xs uppercase text-gray-600 mb-2">
                    Key Terms Explained
                  </h4>
                  <div className="space-y-2">
                    {result.keyTerms.map((term) => (
                      <div
                        key={term.term}
                        className="p-3 bg-gray-50 border border-gray-200 text-sm"
                      >
                        <strong className="capitalize">{term.term}:</strong>{' '}
                        {term.explanation}
                        {term.analogy && (
                          <span className="text-gray-500 italic"> ({term.analogy})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Dictionary */}
        <div className="space-y-4">
          <div className="bg-white border-2 border-black">
            <button
              onClick={() => setShowDictionary(!showDictionary)}
              className="w-full p-4 flex items-center justify-between bg-retro-navy text-white"
            >
              <span className="font-heading">Term Dictionary</span>
              <BookOpen size={18} />
            </button>

            {showDictionary && (
              <div className="p-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border-2 border-black text-sm"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredTerms?.map((term) => (
                    <div
                      key={term.term}
                      className="p-3 border-2 border-gray-200 hover:border-retro-navy cursor-pointer transition-colors"
                      onClick={() => setInputText((prev) => prev + ' ' + term.term)}
                    >
                      <h4 className="font-heading text-sm capitalize">{term.term}</h4>
                      <p className="text-xs text-gray-600 mt-1">{term.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Examples */}
          <div className="bg-white border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-3">Quick Examples</h3>
            <div className="space-y-2">
              {[
                'The timing belt shows signs of wear and needs replacement.',
                'Your brake pads are at 20% and the rotors need resurfacing.',
                'The alternator is failing and not charging the battery properly.',
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(example)}
                  className="w-full p-2 text-left text-sm border-2 border-dashed border-gray-300 hover:border-retro-navy hover:bg-gray-50 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-retro-cream border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-2">Tips</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>Use "Simplify" for quick, easy-to-understand translations</li>
              <li>Use "Explain" when customers want more detail</li>
              <li>Use "Estimate" for professional repair quotes</li>
              <li>Use "Email" for customer communications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
