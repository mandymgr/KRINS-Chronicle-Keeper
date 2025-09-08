import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Layers, 
  Code2, 
  Database, 
  Globe, 
  Loader2,
  AlertTriangle,
  Star,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface Pattern {
  id: string;
  name: string;
  description: string;
  category: string;
  language: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  usage_count: number;
  rating: number;
  tags: string[];
  code_snippet?: string;
  documentation_url?: string;
  example_url?: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  project_context?: string;
}

interface PatternResponse {
  patterns: Pattern[];
  total: number;
  categories: string[];
  languages: string[];
}

interface PatternFilters {
  category: string;
  language: string;
  complexity: string;
  tags: string[];
  minRating: number;
}

interface PatternBrowserProps {
  className?: string;
  onPatternSelect?: (pattern: Pattern) => void;
}

const COMPLEXITY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

const CATEGORY_ICONS = {
  architecture: Layers,
  backend: Database,
  frontend: Globe,
  integration: Code2,
  default: Code2,
};

// API functions
const fetchPatterns = async (filters: Partial<PatternFilters> = {}): Promise<PatternResponse> => {
  const params = new URLSearchParams();
  
  if (filters.category && filters.category !== 'all') {
    params.append('category', filters.category);
  }
  if (filters.language && filters.language !== 'all') {
    params.append('language', filters.language);
  }
  if (filters.complexity && filters.complexity !== 'all') {
    params.append('complexity', filters.complexity);
  }
  if (filters.minRating && filters.minRating > 0) {
    params.append('min_rating', filters.minRating.toString());
  }

  const response = await fetch(`/api/patterns?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch patterns');
  }
  
  return response.json();
};

const searchPatterns = async (query: string, filters: Partial<PatternFilters> = {}): Promise<PatternResponse> => {
  const params = new URLSearchParams({ q: query });
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/patterns/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to search patterns');
  }
  
  return response.json();
};

const getPatternRecommendations = async (patternId: string): Promise<Pattern[]> => {
  const response = await fetch(`/api/patterns/${patternId}/recommendations`);
  if (!response.ok) {
    throw new Error('Failed to get recommendations');
  }
  
  const data = await response.json();
  return data.recommendations || [];
};

export default function PatternBrowser({ className, onPatternSelect }: PatternBrowserProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<PatternFilters>({
    category: 'all',
    language: 'all',
    complexity: 'all',
    tags: [],
    minRating: 0,
  });

  // Main patterns query
  const { 
    data: patternsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['patterns', filters, searchQuery],
    queryFn: () => searchQuery.trim() 
      ? searchPatterns(searchQuery, filters)
      : fetchPatterns(filters),
    retry: 3,
    retryDelay: 1000,
  });

  // Recommendations query
  const { data: recommendations = [] } = useQuery({
    queryKey: ['pattern-recommendations', selectedPatternId],
    queryFn: () => selectedPatternId ? getPatternRecommendations(selectedPatternId) : Promise.resolve([]),
    enabled: !!selectedPatternId,
  });

  const patterns = patternsData?.patterns || [];
  const categories = patternsData?.categories || [];
  const languages = patternsData?.languages || [];
  const total = patternsData?.total || 0;

  const handlePatternClick = (pattern: Pattern) => {
    setSelectedPatternId(pattern.id);
    onPatternSelect?.(pattern);
  };

  const updateFilters = (newFilters: Partial<PatternFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      language: 'all', 
      complexity: 'all',
      tags: [],
      minRating: 0,
    });
    setSearchQuery('');
  };

  const getUniqueValues = (key: keyof Pattern): string[] => {
    return Array.from(new Set(patterns.map(p => p[key] as string).filter(Boolean)));
  };

  if (error) {
    return (
      <div className={cn("p-6 bg-background border border-border rounded-lg", className)}>
        <div className="text-center text-red-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load patterns</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An error occurred while fetching patterns'}
          </p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pattern Library</h2>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading...' : `${total} patterns available`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          {(filters.category !== 'all' || filters.language !== 'all' || filters.complexity !== 'all' || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search patterns by name, description, or context..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-accent/50 border border-border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category} className="capitalize">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={filters.language}
                onChange={(e) => updateFilters({ language: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
              >
                <option value="all">All Languages</option>
                {languages.map(language => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Complexity</label>
              <select
                value={filters.complexity}
                onChange={(e) => updateFilters({ complexity: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Min Rating: {filters.minRating}/5
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => updateFilters({ minRating: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Any</span>
                <span>5★</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading patterns...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && patterns.length === 0 && (
        <div className="text-center p-8">
          <Code2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No patterns found</h3>
          <p className="text-muted-foreground">
            {searchQuery.trim() 
              ? `No patterns match "${searchQuery}" with current filters`
              : 'No patterns available with current filters'
            }
          </p>
        </div>
      )}

      {/* Patterns Grid */}
      {!isLoading && patterns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patterns.map((pattern) => {
            const CategoryIcon = CATEGORY_ICONS[pattern.category] || CATEGORY_ICONS.default;
            
            return (
              <div
                key={pattern.id}
                onClick={() => handlePatternClick(pattern)}
                className="group p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {pattern.name}
                      </h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {pattern.category} • {pattern.language}
                      </p>
                    </div>
                  </div>
                  
                  {pattern.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-muted-foreground">{pattern.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {pattern.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full font-medium",
                      COMPLEXITY_COLORS[pattern.complexity]
                    )}>
                      {pattern.complexity}
                    </span>
                    
                    {pattern.usage_count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{pattern.usage_count}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {pattern.documentation_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(pattern.documentation_url, '_blank');
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {pattern.code_snippet && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(pattern.code_snippet!);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {pattern.tags && pattern.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {pattern.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 text-xs bg-secondary rounded-full text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {pattern.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-muted-foreground">
                        +{pattern.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations */}
      {selectedPatternId && recommendations.length > 0 && (
        <div className="mt-8 p-6 bg-accent/30 border border-border rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recommended Patterns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map(pattern => (
              <div
                key={pattern.id}
                onClick={() => handlePatternClick(pattern)}
                className="p-4 bg-background border border-border rounded-lg hover:shadow-md cursor-pointer transition-all"
              >
                <h4 className="font-semibold text-sm mb-2">{pattern.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {pattern.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground capitalize">
                    {pattern.category}
                  </span>
                  {pattern.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{pattern.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}