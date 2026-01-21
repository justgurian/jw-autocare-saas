import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FileText,
  Lightbulb,
  ListOrdered,
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { api } from '../../../services/api';

interface BlogCategory {
  id: string;
  name: string;
  description: string;
  exampleTopics: string[];
}

interface BlogIdea {
  title: string;
  category: string;
  description: string;
  targetKeywords: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  seasonalRelevance?: string;
}

interface BlogOutline {
  title: string;
  sections: Array<{
    heading: string;
    points: string[];
  }>;
  estimatedWordCount: number;
}

interface BlogSection {
  type: string;
  content: string;
  items?: string[];
}

interface BlogResult {
  title: string;
  introduction: string;
  sections: BlogSection[];
  conclusion: string;
  callToAction?: string;
  seo: {
    title: string;
    metaDescription: string;
    focusKeyword: string;
    secondaryKeywords: string[];
    slug: string;
    readingTime: number;
  };
  wordCount: number;
  htmlContent: string;
  markdownContent: string;
}

type GenerationStep = 'ideas' | 'outline' | 'generate';
type BlogLength = 'short' | 'medium' | 'long';
type ContentTone = 'educational' | 'conversational' | 'professional' | 'friendly';

export default function BlogGeneratorPage() {
  const [step, setStep] = useState<GenerationStep>('ideas');
  const [selectedCategory, setSelectedCategory] = useState<string>('maintenance-tips');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<BlogIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<BlogIdea | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [length, setLength] = useState<BlogLength>('medium');
  const [tone, setTone] = useState<ContentTone>('conversational');
  const [outline, setOutline] = useState<BlogOutline | null>(null);
  const [blog, setBlog] = useState<BlogResult | null>(null);
  const [copied, setCopied] = useState<'html' | 'markdown' | null>(null);
  const [showSEOPanel, setShowSEOPanel] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery<{ categories: BlogCategory[] }>({
    queryKey: ['blog-generator', 'categories'],
    queryFn: async () => {
      const response = await api.get('/tools/blog-generator/categories');
      return response.data;
    },
  });

  // Fetch keyword suggestions when category changes
  const { data: keywordsData } = useQuery<{ keywords: string[] }>({
    queryKey: ['blog-generator', 'keywords', selectedCategory],
    queryFn: async () => {
      const response = await api.get(`/tools/blog-generator/keywords/${selectedCategory}`);
      return response.data;
    },
    enabled: !!selectedCategory,
  });

  // Generate ideas mutation
  const ideasMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tools/blog-generator/ideas', {
        category: selectedCategory,
        count: 5,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setIdeas(data.ideas);
    },
  });

  // Generate outline mutation
  const outlineMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tools/blog-generator/outline', {
        topic: selectedIdea?.title || customTopic,
        category: selectedCategory,
        targetKeywords,
        length,
        tone,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setOutline(data.outline);
      setStep('outline');
    },
  });

  // Generate full blog mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tools/blog-generator/generate', {
        topic: selectedIdea?.title || customTopic,
        category: selectedCategory,
        targetKeywords,
        length,
        tone,
        includeCallToAction: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setBlog(data.blog);
      setStep('generate');
    },
  });

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !targetKeywords.includes(keywordInput.trim())) {
      setTargetKeywords([...targetKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setTargetKeywords(targetKeywords.filter((k) => k !== keyword));
  };

  const handleCopy = async (type: 'html' | 'markdown') => {
    if (blog) {
      const content = type === 'html' ? blog.htmlContent : blog.markdownContent;
      await navigator.clipboard.writeText(content);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleDownload = (type: 'html' | 'markdown') => {
    if (blog) {
      const content = type === 'html' ? blog.htmlContent : blog.markdownContent;
      const extension = type === 'html' ? 'html' : 'md';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${blog.seo.slug}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-retro-navy mb-2">Blog Generator</h1>
        <p className="text-gray-600">
          Create SEO-optimized blog content for your auto shop website
        </p>
      </div>

      {/* Step Progress */}
      <div className="bg-white border-2 border-black p-4 mb-6">
        <div className="flex items-center justify-between">
          {[
            { id: 'ideas', label: 'Get Ideas', icon: Lightbulb },
            { id: 'outline', label: 'Create Outline', icon: ListOrdered },
            { id: 'generate', label: 'Generate Blog', icon: FileText },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => setStep(s.id as GenerationStep)}
                className={`flex items-center gap-2 px-4 py-2 border-2 ${
                  step === s.id
                    ? 'border-retro-red bg-retro-red/5'
                    : 'border-gray-200 hover:border-retro-navy'
                }`}
              >
                <s.icon size={18} />
                <span className="font-heading text-sm">{s.label}</span>
              </button>
              {i < 2 && <div className="w-8 h-0.5 bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Selection */}
          <div className="bg-white border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-3">Select Category</h3>
            <div className="space-y-2">
              {categoriesData?.categories.map((category) => (
                <div key={category.id} className="border-2 border-black">
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setExpandedCategory(expandedCategory === category.id ? null : category.id);
                    }}
                    className={`w-full p-3 flex items-center justify-between ${
                      selectedCategory === category.id ? 'bg-retro-navy/5' : ''
                    }`}
                  >
                    <div className="text-left">
                      <span className="font-heading">{category.name}</span>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                    {expandedCategory === category.id ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  {expandedCategory === category.id && (
                    <div className="border-t-2 border-black bg-gray-50 p-3">
                      <p className="text-xs text-gray-500 mb-2">Example topics:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.exampleTopics.map((topic) => (
                          <button
                            key={topic}
                            onClick={() => setCustomTopic(topic)}
                            className="text-xs px-2 py-1 bg-white border border-gray-300 hover:border-retro-navy"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ideas Step */}
          {step === 'ideas' && (
            <div className="bg-white border-2 border-black p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-sm uppercase">Topic Ideas</h3>
                <button
                  onClick={() => ideasMutation.mutate()}
                  disabled={ideasMutation.isPending}
                  className="px-4 py-2 bg-retro-navy text-white text-sm flex items-center gap-2 hover:bg-retro-navy/90 disabled:opacity-50"
                >
                  {ideasMutation.isPending ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Lightbulb size={14} />
                  )}
                  Generate Ideas
                </button>
              </div>

              {ideas.length > 0 ? (
                <div className="space-y-2">
                  {ideas.map((idea, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedIdea(idea);
                        setCustomTopic(idea.title);
                        setTargetKeywords(idea.targetKeywords);
                      }}
                      className={`w-full p-4 text-left border-2 transition-all ${
                        selectedIdea?.title === idea.title
                          ? 'border-retro-red bg-retro-red/5'
                          : 'border-gray-200 hover:border-retro-navy'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-heading">{idea.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded ${getDifficultyColor(idea.difficulty)}`}>
                          {idea.difficulty}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {idea.targetKeywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 bg-gray-100 text-xs">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb size={32} className="mx-auto mb-2 opacity-30" />
                  <p>Click "Generate Ideas" to get topic suggestions</p>
                </div>
              )}

              {/* Custom Topic */}
              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                  Or Enter Custom Topic
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => {
                    setCustomTopic(e.target.value);
                    setSelectedIdea(null);
                  }}
                  placeholder="e.g., How to Prepare Your Car for Winter"
                  className="w-full px-3 py-2 border-2 border-black"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                  Target Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    placeholder="Add keyword..."
                    className="flex-1 px-3 py-2 border-2 border-black text-sm"
                  />
                  <button
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-gray-100 border-2 border-black text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {targetKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-1 bg-retro-navy/10 text-sm flex items-center gap-1"
                    >
                      {kw}
                      <button
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {/* Suggested Keywords */}
                {keywordsData?.keywords && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Suggested:</p>
                    <div className="flex flex-wrap gap-1">
                      {keywordsData.keywords.slice(0, 6).map((kw) => (
                        <button
                          key={kw}
                          onClick={() => {
                            if (!targetKeywords.includes(kw)) {
                              setTargetKeywords([...targetKeywords, kw]);
                            }
                          }}
                          disabled={targetKeywords.includes(kw)}
                          className="text-xs px-2 py-0.5 bg-gray-50 border border-gray-200 hover:border-retro-navy disabled:opacity-50"
                        >
                          + {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => outlineMutation.mutate()}
                disabled={!customTopic.trim() || outlineMutation.isPending}
                className="w-full py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 font-heading uppercase flex items-center justify-center gap-2"
              >
                {outlineMutation.isPending ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <ListOrdered size={16} />
                )}
                Create Outline
              </button>
            </div>
          )}

          {/* Outline Step */}
          {step === 'outline' && outline && (
            <div className="bg-white border-2 border-black p-4 space-y-4">
              <h3 className="font-heading text-sm uppercase">Blog Outline</h3>

              <div className="p-4 bg-retro-cream border-2 border-dashed border-retro-navy/30">
                <h2 className="font-display text-xl mb-4">{outline.title}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Estimated: {outline.estimatedWordCount} words
                </p>
                <div className="space-y-4">
                  {outline.sections.map((section, i) => (
                    <div key={i}>
                      <h3 className="font-heading">{section.heading}</h3>
                      <ul className="ml-4 mt-1 text-sm text-gray-600 space-y-1">
                        {section.points.map((point, j) => (
                          <li key={j}>• {point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => outlineMutation.mutate()}
                  disabled={outlineMutation.isPending}
                  className="flex-1 py-2 border-2 border-black flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <RefreshCw size={16} />
                  Regenerate
                </button>
                <button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="flex-1 py-3 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 font-heading uppercase flex items-center justify-center gap-2"
                >
                  {generateMutation.isPending ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  Generate Full Blog
                </button>
              </div>
            </div>
          )}

          {/* Generated Blog */}
          {step === 'generate' && blog && (
            <div className="bg-white border-2 border-black p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-sm uppercase">Generated Blog</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy('markdown')}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-retro-navy"
                  >
                    {copied === 'markdown' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'markdown' ? 'Copied!' : 'Copy MD'}
                  </button>
                  <button
                    onClick={() => handleCopy('html')}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-retro-navy"
                  >
                    {copied === 'html' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'html' ? 'Copied!' : 'Copy HTML'}
                  </button>
                </div>
              </div>

              {/* Blog Preview */}
              <div className="p-6 bg-white border-2 border-gray-200 max-h-[600px] overflow-y-auto prose prose-sm">
                <h1 className="text-2xl font-display mb-4">{blog.title}</h1>
                <p className="text-gray-500 text-sm mb-4">
                  {blog.wordCount} words • {blog.seo.readingTime} min read
                </p>
                <p className="mb-4">{blog.introduction}</p>
                {blog.sections.map((section, i) => (
                  <div key={i} className="mb-4">
                    {section.type === 'heading' && (
                      <h2 className="text-xl font-heading mt-6 mb-2">{section.content}</h2>
                    )}
                    {section.type === 'paragraph' && <p>{section.content}</p>}
                    {section.type === 'list' && (
                      <>
                        <h3 className="font-heading mb-2">{section.content}</h3>
                        <ul className="list-disc ml-4">
                          {section.items?.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ))}
                <p className="mt-6">{blog.conclusion}</p>
                {blog.callToAction && (
                  <div className="mt-6 p-4 bg-retro-cream border-l-4 border-retro-red">
                    <strong>{blog.callToAction}</strong>
                  </div>
                )}
              </div>

              {/* Download Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload('markdown')}
                  className="flex-1 py-2 border-2 border-black flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <Download size={16} />
                  Download .md
                </button>
                <button
                  onClick={() => handleDownload('html')}
                  className="flex-1 py-2 border-2 border-black flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <Download size={16} />
                  Download .html
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Settings */}
          <div className="bg-white border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-3">Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                  Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['short', 'medium', 'long'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLength(l)}
                      className={`py-2 border-2 text-sm capitalize ${
                        length === l
                          ? 'border-retro-red bg-retro-red/5'
                          : 'border-black hover:border-retro-navy'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {length === 'short' && '300-500 words'}
                  {length === 'medium' && '600-900 words'}
                  {length === 'long' && '1000-1500 words'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-heading uppercase text-gray-600 mb-1">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as ContentTone)}
                  className="w-full px-3 py-2 border-2 border-black"
                >
                  <option value="conversational">Conversational</option>
                  <option value="educational">Educational</option>
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEO Panel */}
          {blog && (
            <div className="bg-white border-2 border-black">
              <button
                onClick={() => setShowSEOPanel(!showSEOPanel)}
                className="w-full p-4 flex items-center justify-between bg-retro-navy text-white"
              >
                <span className="font-heading flex items-center gap-2">
                  <Search size={16} />
                  SEO Details
                </span>
                {showSEOPanel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showSEOPanel && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-heading uppercase text-gray-600">
                      Meta Title
                    </label>
                    <p className="text-sm">{blog.seo.title}</p>
                    <span className={`text-xs ${blog.seo.title.length <= 60 ? 'text-green-600' : 'text-red-600'}`}>
                      {blog.seo.title.length}/60 chars
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-heading uppercase text-gray-600">
                      Meta Description
                    </label>
                    <p className="text-sm">{blog.seo.metaDescription}</p>
                    <span className={`text-xs ${blog.seo.metaDescription.length <= 160 ? 'text-green-600' : 'text-red-600'}`}>
                      {blog.seo.metaDescription.length}/160 chars
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-heading uppercase text-gray-600">
                      URL Slug
                    </label>
                    <code className="text-sm bg-gray-100 px-2 py-1 block">
                      /blog/{blog.seo.slug}
                    </code>
                  </div>

                  <div>
                    <label className="block text-xs font-heading uppercase text-gray-600">
                      Focus Keyword
                    </label>
                    <span className="px-2 py-1 bg-retro-red/10 text-sm inline-block">
                      {blog.seo.focusKeyword}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-heading uppercase text-gray-600">
                      Secondary Keywords
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {blog.seo.secondaryKeywords.map((kw) => (
                        <span key={kw} className="px-2 py-0.5 bg-gray-100 text-xs">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="bg-retro-cream border-2 border-black p-4">
            <h3 className="font-heading text-sm uppercase mb-2">SEO Tips</h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Use your focus keyword in the title and first paragraph</li>
              <li>• Keep titles under 60 characters for search results</li>
              <li>• Meta descriptions should be 150-160 characters</li>
              <li>• Include internal links to your services pages</li>
              <li>• Add relevant images with alt text</li>
              <li>• Publish consistently for better rankings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
