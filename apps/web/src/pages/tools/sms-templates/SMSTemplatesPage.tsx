import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../../../services/api';

interface SMSTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  characterCount: number;
  segmentCount: number;
}

interface SMSCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

interface SMSResult {
  message: string;
  characterCount: number;
  segmentCount: number;
  variables: Record<string, string>;
}

interface ComplianceResult {
  isCompliant: boolean;
  issues: string[];
  suggestions: string[];
}

type GenerationMode = 'template' | 'ai' | 'optimize';

export default function SMSTemplatesPage() {
  const [mode, setMode] = useState<GenerationMode>('template');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [aiContext, setAiContext] = useState('');
  const [aiCategory, setAiCategory] = useState('promotion');
  const [aiTone, setAiTone] = useState<'friendly' | 'professional' | 'urgent'>('friendly');
  const [customMessage, setCustomMessage] = useState('');
  const [optimizeGoal, setOptimizeGoal] = useState<'shorter' | 'clearer' | 'urgent'>('shorter');
  const [result, setResult] = useState<SMSResult | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Fetch categories
  const { data: categoriesData } = useQuery<{ categories: SMSCategory[] }>({
    queryKey: ['sms-templates', 'categories'],
    queryFn: async () => {
      const response = await api.get('/tools/sms-templates/categories');
      return response.data;
    },
  });

  // Fetch all templates
  const { data: templatesData } = useQuery<{ templates: SMSTemplate[] }>({
    queryKey: ['sms-templates'],
    queryFn: async () => {
      const response = await api.get('/tools/sms-templates');
      return response.data;
    },
  });

  // Fill template mutation
  const fillMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tools/sms-templates/fill', {
        templateId: selectedTemplate?.id,
        variables,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data.result);
      checkComplianceMutation.mutate(data.result.message);
    },
  });

  // Generate AI message mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tools/sms-templates/generate', {
        category: aiCategory,
        context: aiContext,
        tone: aiTone,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data.result);
      checkComplianceMutation.mutate(data.result.message);
    },
  });

  // Optimize message mutation
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tools/sms-templates/optimize', {
        message: customMessage,
        goal: optimizeGoal,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data.result);
      checkComplianceMutation.mutate(data.result.message);
    },
  });

  // Check compliance mutation
  const checkComplianceMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await api.post('/tools/sms-templates/compliance', { message });
      return response.data;
    },
    onSuccess: (data) => {
      setCompliance(data.result);
    },
  });

  const handleTemplateSelect = (template: SMSTemplate) => {
    setSelectedTemplate(template);
    // Initialize variables
    const initialVars: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialVars[v] = '';
    });
    setVariables(initialVars);
    setResult(null);
    setCompliance(null);
  };

  const handleFillTemplate = () => {
    if (!selectedTemplate) return;
    fillMutation.mutate();
  };

  const handleGenerateAI = () => {
    if (!aiContext.trim()) return;
    generateMutation.mutate();
  };

  const handleOptimize = () => {
    if (!customMessage.trim()) return;
    optimizeMutation.mutate();
  };

  const handleCopy = () => {
    if (result?.message) {
      navigator.clipboard.writeText(result.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSegmentColor = (segments: number) => {
    if (segments === 1) return 'text-green-600';
    if (segments === 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const templatesByCategory = (category: string) => {
    return templatesData?.templates.filter((t) => t.category === category) || [];
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-retro-navy mb-2">SMS Templates</h1>
        <p className="text-gray-600">
          Create effective SMS marketing messages for your auto shop customers
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="bg-white border-2 border-black mb-6">
        <div className="flex border-b-2 border-black">
          {[
            { id: 'template', name: 'Use Template', icon: MessageSquare },
            { id: 'ai', name: 'AI Generate', icon: Sparkles },
            { id: 'optimize', name: 'Optimize', icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id as GenerationMode);
                setResult(null);
                setCompliance(null);
              }}
              className={`flex-1 py-3 flex items-center justify-center gap-2 font-heading uppercase text-sm transition-colors ${
                mode === tab.id
                  ? 'bg-retro-navy text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Template Mode */}
          {mode === 'template' && (
            <div className="space-y-6">
              {/* Category List */}
              <div className="space-y-2">
                <h3 className="font-heading text-sm uppercase text-gray-600">Select Category</h3>
                {categoriesData?.categories.map((category) => (
                  <div key={category.id} className="border-2 border-black">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                      className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="text-left">
                        <span className="font-heading">{category.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({category.count})</span>
                        <p className="text-xs text-gray-500">{category.description}</p>
                      </div>
                      {expandedCategory === category.id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {expandedCategory === category.id && (
                      <div className="border-t-2 border-black bg-gray-50 p-3 space-y-2">
                        {templatesByCategory(category.id).map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`w-full p-3 text-left border-2 transition-all ${
                              selectedTemplate?.id === template.id
                                ? 'border-retro-red bg-retro-red/5'
                                : 'border-gray-200 hover:border-retro-navy bg-white'
                            }`}
                          >
                            <div className="font-heading text-sm">{template.name}</div>
                            <div className="text-xs text-gray-600 mt-1 truncate">
                              {template.template}
                            </div>
                            <div className="flex gap-2 mt-2">
                              {template.variables.map((v) => (
                                <span
                                  key={v}
                                  className="px-2 py-0.5 bg-retro-navy/10 text-xs rounded"
                                >
                                  {'{' + v + '}'}
                                </span>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Variable Inputs */}
              {selectedTemplate && (
                <div className="space-y-4">
                  <h3 className="font-heading text-sm uppercase text-gray-600">
                    Fill Variables
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                          {variable}
                        </label>
                        <input
                          type="text"
                          value={variables[variable] || ''}
                          onChange={(e) =>
                            setVariables({ ...variables, [variable]: e.target.value })
                          }
                          placeholder={`Enter ${variable}...`}
                          className="w-full px-3 py-2 border-2 border-black text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleFillTemplate}
                    disabled={fillMutation.isPending}
                    className="w-full py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 font-heading uppercase"
                  >
                    {fillMutation.isPending ? 'Generating...' : 'Generate Message'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Generation Mode */}
          {mode === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                  Category
                </label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black"
                >
                  {categoriesData?.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                  Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['friendly', 'professional', 'urgent'] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setAiTone(tone)}
                      className={`py-2 border-2 text-sm capitalize ${
                        aiTone === tone
                          ? 'border-retro-red bg-retro-red/5'
                          : 'border-black hover:border-retro-navy'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                  Context / Details
                </label>
                <textarea
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  placeholder="Describe what you want to communicate... e.g., 'Remind customers about our winter tire special - 20% off all tire services through January'"
                  className="w-full h-32 px-3 py-2 border-2 border-black resize-none"
                />
              </div>

              <button
                onClick={handleGenerateAI}
                disabled={generateMutation.isPending || !aiContext.trim()}
                className="w-full py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 font-heading uppercase flex items-center justify-center gap-2"
              >
                {generateMutation.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          )}

          {/* Optimize Mode */}
          {mode === 'optimize' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                  Your Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Paste your existing SMS message here to optimize it..."
                  className="w-full h-32 px-3 py-2 border-2 border-black resize-none"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{customMessage.length} characters</span>
                  <span className={getSegmentColor(Math.ceil(customMessage.length / 160))}>
                    {Math.ceil(customMessage.length / 160)} segment(s)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                  Optimization Goal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'shorter', label: 'Make Shorter' },
                    { id: 'clearer', label: 'Make Clearer' },
                    { id: 'urgent', label: 'Make Urgent' },
                  ] as const).map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setOptimizeGoal(goal.id)}
                      className={`py-2 border-2 text-sm ${
                        optimizeGoal === goal.id
                          ? 'border-retro-red bg-retro-red/5'
                          : 'border-black hover:border-retro-navy'
                      }`}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleOptimize}
                disabled={optimizeMutation.isPending || !customMessage.trim()}
                className="w-full py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 font-heading uppercase flex items-center justify-center gap-2"
              >
                {optimizeMutation.isPending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Optimize Message
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white border-2 border-black p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading uppercase">Generated Message</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-retro-navy"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="p-4 bg-retro-cream border-2 border-dashed border-retro-navy/30 mb-4">
            <p className="text-lg">{result.message}</p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500">Characters:</span>{' '}
              <span className={result.characterCount <= 160 ? 'text-green-600' : 'text-yellow-600'}>
                {result.characterCount}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Segments:</span>{' '}
              <span className={getSegmentColor(result.segmentCount)}>
                {result.segmentCount}
              </span>
            </div>
          </div>

          {/* Compliance Check */}
          {compliance && (
            <div className={`mt-4 p-4 border-2 ${
              compliance.isCompliant ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {compliance.isCompliant ? (
                  <>
                    <Check size={18} className="text-green-600" />
                    <span className="font-heading text-green-700">Message looks good!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} className="text-yellow-600" />
                    <span className="font-heading text-yellow-700">Review suggested</span>
                  </>
                )}
              </div>

              {compliance.issues.length > 0 && (
                <ul className="text-sm text-yellow-800 space-y-1 mb-2">
                  {compliance.issues.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              )}

              {compliance.suggestions.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {compliance.suggestions.map((suggestion, i) => (
                    <li key={i}>💡 {suggestion}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button className="flex-1 py-2 bg-retro-navy text-white border-2 border-black flex items-center justify-center gap-2 hover:bg-retro-navy/90">
              <Send size={16} />
              Send Now
            </button>
            <button className="flex-1 py-2 border-2 border-black flex items-center justify-center gap-2 hover:bg-gray-50">
              <Clock size={16} />
              Schedule
            </button>
          </div>
        </div>
      )}

      {/* Tips Sidebar */}
      <div className="bg-retro-cream border-2 border-black p-4">
        <h3 className="font-heading text-sm uppercase mb-3">SMS Best Practices</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Keep messages under 160 characters for single-segment delivery</li>
          <li>• Include your shop name for brand recognition</li>
          <li>• Add a clear call-to-action (reply, call, click)</li>
          <li>• Personalize with customer name when possible</li>
          <li>• Send during business hours (9 AM - 6 PM local)</li>
          <li>• Include opt-out instructions for marketing messages</li>
        </ul>
      </div>
    </div>
  );
}
