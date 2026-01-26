import { useState, useRef, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BookOpen, Zap, FileText, Mail, ArrowRight, Copy, Check, Search, Upload, Camera, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

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

interface InvoiceAnalysisResult {
  success: boolean;
  workCompleted: Array<{
    item: string;
    simpleExplanation: string;
    whyNeeded?: string;
    cost?: string;
  }>;
  workRecommended: Array<{
    item: string;
    simpleExplanation: string;
    urgency: 'immediate' | 'soon' | 'can-wait';
    reason?: string;
  }>;
  totalCost?: string;
  summary: string;
  glossary: Array<{
    term: string;
    definition: string;
  }>;
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

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<InvoiceAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Image analysis mutation
  const analyzeImageMutation = useMutation({
    mutationFn: async (imageData: { base64: string; mimeType: string }) => {
      const response = await api.post('/tools/jargon/analyze-image', {
        image: imageData.base64,
        mimeType: imageData.mimeType,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setImageAnalysis(data.result);
      toast.success('Invoice analyzed successfully!');
    },
    onError: () => {
      toast.error('Failed to analyze image. Please try again.');
    },
  });

  // File handling functions
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);

      // Extract base64 and mime type for API
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type;

      analyzeImageMutation.mutate({ base64, mimeType });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearImage = useCallback(() => {
    setUploadedImage(null);
    setImageFile(null);
    setImageAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const getUrgencyIcon = (urgency: 'immediate' | 'soon' | 'can-wait') => {
    switch (urgency) {
      case 'immediate':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'soon':
        return <Clock size={16} className="text-yellow-500" />;
      case 'can-wait':
        return <CheckCircle size={16} className="text-green-500" />;
    }
  };

  const getUrgencyLabel = (urgency: 'immediate' | 'soon' | 'can-wait') => {
    switch (urgency) {
      case 'immediate':
        return 'Needs Attention Now';
      case 'soon':
        return 'Should Address Soon';
      case 'can-wait':
        return 'Can Wait';
    }
  };

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

          {/* Image Upload */}
          <div className="bg-white border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-3 flex items-center gap-2">
              <Camera size={18} />
              Upload Invoice or Receipt
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a photo of your repair invoice or receipt to get a plain-English explanation of the work.
            </p>

            {!uploadedImage ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-retro-red bg-retro-red/5'
                    : 'border-gray-300 hover:border-retro-navy'
                }`}
              >
                <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop an image here, or
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-retro-navy text-white border-2 border-black text-sm hover:bg-retro-navy/90 transition-colors"
                >
                  Choose File
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  Supports JPG, PNG, HEIC up to 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded invoice"
                    className="w-full max-h-64 object-contain border-2 border-black"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-white border-2 border-black hover:bg-red-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Analysis Loading State */}
                {analyzeImageMutation.isPending && (
                  <div className="flex items-center justify-center gap-3 p-6 bg-retro-cream border-2 border-dashed border-retro-navy/30">
                    <div className="animate-spin w-5 h-5 border-2 border-retro-navy border-t-transparent rounded-full" />
                    <span className="text-sm">Analyzing your invoice...</span>
                  </div>
                )}

                {/* Analysis Results */}
                {imageAnalysis && (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="p-4 bg-retro-cream border-2 border-black">
                      <h4 className="font-heading text-sm uppercase mb-2">Summary</h4>
                      <p className="text-sm">{imageAnalysis.summary}</p>
                      {imageAnalysis.totalCost && (
                        <p className="mt-2 font-heading text-lg">
                          Total: {imageAnalysis.totalCost}
                        </p>
                      )}
                    </div>

                    {/* Work Completed */}
                    {imageAnalysis.workCompleted.length > 0 && (
                      <div className="border-2 border-black">
                        <div className="bg-green-600 text-white p-3">
                          <h4 className="font-heading text-sm uppercase flex items-center gap-2">
                            <CheckCircle size={16} />
                            Work Completed
                          </h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {imageAnalysis.workCompleted.map((item, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 border border-gray-200">
                              <div className="flex justify-between items-start">
                                <h5 className="font-heading text-sm">{item.item}</h5>
                                {item.cost && (
                                  <span className="text-sm font-heading text-gray-600">
                                    {item.cost}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mt-1">
                                {item.simpleExplanation}
                              </p>
                              {item.whyNeeded && (
                                <p className="text-xs text-gray-500 mt-1 italic">
                                  Why needed: {item.whyNeeded}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Work Recommended */}
                    {imageAnalysis.workRecommended.length > 0 && (
                      <div className="border-2 border-black">
                        <div className="bg-yellow-500 text-white p-3">
                          <h4 className="font-heading text-sm uppercase flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Recommended Future Work
                          </h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {imageAnalysis.workRecommended.map((item, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 border border-gray-200">
                              <div className="flex justify-between items-start">
                                <h5 className="font-heading text-sm">{item.item}</h5>
                                <span className="flex items-center gap-1 text-xs">
                                  {getUrgencyIcon(item.urgency)}
                                  {getUrgencyLabel(item.urgency)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">
                                {item.simpleExplanation}
                              </p>
                              {item.reason && (
                                <p className="text-xs text-gray-500 mt-1 italic">
                                  Why recommended: {item.reason}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Glossary */}
                    {imageAnalysis.glossary.length > 0 && (
                      <div className="border-2 border-black">
                        <div className="bg-retro-navy text-white p-3">
                          <h4 className="font-heading text-sm uppercase flex items-center gap-2">
                            <BookOpen size={16} />
                            Terms Explained
                          </h4>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {imageAnalysis.glossary.map((item, idx) => (
                            <div key={idx} className="p-2 bg-gray-50 text-sm">
                              <strong>{item.term}:</strong> {item.definition}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            <span className="text-sm text-gray-500 font-heading">OR TYPE TEXT</span>
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
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
