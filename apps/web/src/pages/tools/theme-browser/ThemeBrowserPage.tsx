import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Grid3X3, List, ChevronDown, ChevronUp, Palette, Check } from 'lucide-react';
import { api } from '../../../services/api';

interface ThemeCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

interface Theme {
  id: string;
  name: string;
  category: string;
  shortDescription?: string;
  previewColors?: string[];
  previewUrl?: string;
  compatibleTools: string[];
}

interface ThemesGroupedResponse {
  grouped: Record<string, {
    category: ThemeCategory;
    themes: Theme[];
  }>;
  totalThemes: number;
}

interface CategoriesResponse {
  categories: ThemeCategory[];
  total: number;
}

// Theme card component
function ThemeCard({
  theme,
  isSelected,
  onSelect,
}: {
  theme: Theme;
  isSelected: boolean;
  onSelect: (theme: Theme) => void;
}) {
  return (
    <button
      onClick={() => onSelect(theme)}
      className={`relative p-4 border-2 transition-all text-left w-full ${
        isSelected
          ? 'border-retro-red bg-retro-red/5 shadow-retro'
          : 'border-black hover:border-retro-navy hover:shadow-retro-sm'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-retro-red rounded-full flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
      )}

      {/* Color preview chips */}
      <div className="flex gap-1 mb-3">
        {theme.previewColors?.slice(0, 4).map((color, i) => (
          <div
            key={i}
            className="w-6 h-6 border border-black/20"
            style={{ backgroundColor: color }}
          />
        ))}
        {!theme.previewColors?.length && (
          <div className="w-6 h-6 bg-gray-200 border border-black/20 flex items-center justify-center">
            <Palette size={12} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Theme info */}
      <h3 className="font-heading text-sm uppercase tracking-wide mb-1">{theme.name}</h3>
      <p className="text-xs text-gray-600 line-clamp-2">{theme.shortDescription}</p>

      {/* Compatible tools badges */}
      <div className="flex flex-wrap gap-1 mt-2">
        {theme.compatibleTools.slice(0, 3).map((tool) => (
          <span
            key={tool}
            className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 uppercase"
          >
            {tool.replace('_', ' ')}
          </span>
        ))}
      </div>
    </button>
  );
}

// Category section component
function CategorySection({
  categoryId,
  category,
  themes,
  selectedThemeId,
  onSelectTheme,
  isExpanded,
  onToggleExpand,
}: {
  categoryId: string;
  category: ThemeCategory;
  themes: Theme[];
  selectedThemeId?: string;
  onSelectTheme: (theme: Theme) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const displayThemes = isExpanded ? themes : themes.slice(0, 4);

  return (
    <div className="border-2 border-black bg-white">
      {/* Category header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-4 bg-retro-navy text-white hover:bg-retro-navy/90 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div className="text-left">
            <h2 className="font-heading uppercase tracking-wide">{category.name}</h2>
            <p className="text-xs text-gray-300">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-white/20 px-2 py-0.5 rounded">{themes.length} themes</span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Themes grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={theme.id === selectedThemeId}
              onSelect={onSelectTheme}
            />
          ))}
        </div>

        {/* Show more/less button */}
        {themes.length > 4 && (
          <button
            onClick={onToggleExpand}
            className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:border-retro-navy hover:text-retro-navy transition-colors text-sm"
          >
            {isExpanded ? `Show less` : `Show all ${themes.length} ${category.name} themes`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ThemeBrowserPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<string>();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch themes grouped by category
  const { data: groupedData, isLoading: isLoadingGrouped } = useQuery<ThemesGroupedResponse>({
    queryKey: ['themes', 'grouped'],
    queryFn: async () => {
      const response = await api.get('/themes/grouped');
      return response.data;
    },
  });

  // Fetch categories with counts
  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ['themes', 'categories'],
    queryFn: async () => {
      const response = await api.get('/themes/categories');
      return response.data;
    },
  });

  // Filter themes based on search
  const filteredGrouped = useMemo(() => {
    if (!groupedData?.grouped) return {};

    const query = searchQuery.toLowerCase();
    if (!query && !selectedCategory) return groupedData.grouped;

    const result: typeof groupedData.grouped = {};

    for (const [categoryId, data] of Object.entries(groupedData.grouped)) {
      // Skip if filtering by category and this isn't it
      if (selectedCategory && categoryId !== selectedCategory) continue;

      const filteredThemes = data.themes.filter(
        (theme) =>
          !query ||
          theme.name.toLowerCase().includes(query) ||
          theme.shortDescription?.toLowerCase().includes(query)
      );

      if (filteredThemes.length > 0) {
        result[categoryId] = {
          ...data,
          themes: filteredThemes,
        };
      }
    }

    return result;
  }, [groupedData, searchQuery, selectedCategory]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleSelectTheme = (theme: Theme) => {
    setSelectedThemeId(theme.id === selectedThemeId ? undefined : theme.id);
  };

  const totalFilteredThemes = Object.values(filteredGrouped).reduce(
    (sum, data) => sum + data.themes.length,
    0
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-retro-navy mb-2">Theme Browser</h1>
        <p className="text-gray-600">
          Browse {groupedData?.totalThemes || 0}+ professional themes organized by category
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-black focus:border-retro-red outline-none font-body"
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-3 border-2 border-black bg-white focus:border-retro-red outline-none font-body"
        >
          <option value="">All Categories</option>
          {categoriesData?.categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name} ({cat.count})
            </option>
          ))}
        </select>

        {/* View mode toggle */}
        <div className="flex border-2 border-black">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-retro-navy text-white' : 'bg-white'}`}
          >
            <Grid3X3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-3 border-l-2 border-black ${
              viewMode === 'list' ? 'bg-retro-navy text-white' : 'bg-white'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {totalFilteredThemes} themes
        {searchQuery && ` matching "${searchQuery}"`}
        {selectedCategory && ` in ${categoriesData?.categories.find(c => c.id === selectedCategory)?.name}`}
      </div>

      {/* Loading state */}
      {isLoadingGrouped && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-retro-red border-t-transparent rounded-full" />
        </div>
      )}

      {/* Category sections */}
      {!isLoadingGrouped && (
        <div className="space-y-6">
          {Object.entries(filteredGrouped).map(([categoryId, data]) => (
            <CategorySection
              key={categoryId}
              categoryId={categoryId}
              category={data.category}
              themes={data.themes}
              selectedThemeId={selectedThemeId}
              onSelectTheme={handleSelectTheme}
              isExpanded={expandedCategories.has(categoryId)}
              onToggleExpand={() => toggleCategory(categoryId)}
            />
          ))}
        </div>
      )}

      {/* No results */}
      {!isLoadingGrouped && Object.keys(filteredGrouped).length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300">
          <Palette size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="font-heading text-lg text-gray-600 mb-2">No themes found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Selected theme preview */}
      {selectedThemeId && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t-4 border-black p-4 shadow-retro-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Find selected theme */}
              {(() => {
                const selectedTheme = Object.values(filteredGrouped)
                  .flatMap((d) => d.themes)
                  .find((t) => t.id === selectedThemeId);
                if (!selectedTheme) return null;
                return (
                  <>
                    <div className="flex gap-1">
                      {selectedTheme.previewColors?.slice(0, 4).map((color, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 border border-black"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div>
                      <h3 className="font-heading uppercase">{selectedTheme.name}</h3>
                      <p className="text-sm text-gray-600">{selectedTheme.shortDescription}</p>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedThemeId(undefined)}
                className="px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                Clear
              </button>
              <button className="px-6 py-2 bg-retro-red text-white border-2 border-black shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                Use This Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
