import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Clock, X, Filter, Sparkles } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface SemanticSearchProps {
  className?: string;
  autoFocus?: boolean;
  enableAutoSearch?: boolean;
  placeholder?: string;
  onResultClick?: (result: any) => void;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'adr' | 'pattern' | 'knowledge';
  similarity: number;
  project_name?: string;
  component_name?: string;
  created_at: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  processing_time: number;
}

interface SearchFilters {
  contentTypes: string[];
  similarityThreshold: number;
  maxResults: number;
}

// API functions for semantic search
const performSemanticSearch = async (query: string, filters: SearchFilters): Promise<SearchResponse> => {
  const response = await fetch('/api/search/semantic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      content_types: filters.contentTypes,
      similarity_threshold: filters.similarityThreshold,
      max_results: filters.maxResults,
    }),
  });

  if (!response.ok) {
    throw new Error('Semantic search failed');
  }

  return response.json();
};

const getSearchSuggestions = async (query: string): Promise<string[]> => {
  if (query.length < 2) return [];
  
  const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`);
  if (!response.ok) return [];
  
  const data = await response.json();
  return data.suggestions || [];
};

export default function SemanticSearch({
  className,
  autoFocus = false,
  enableAutoSearch = true,
  placeholder = "Search ADRs, patterns, and knowledge...",
  onResultClick,
}: SemanticSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    contentTypes: ['adrs', 'patterns', 'knowledge'],
    similarityThreshold: 0.7,
    maxResults: 20,
  });

  // Auto-focus input on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }

    // Load recent queries from localStorage
    const stored = localStorage.getItem('recentSearchQueries');
    if (stored) {
      try {
        setRecentQueries(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to load recent queries:', e);
      }
    }
  }, [autoFocus]);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: (searchQuery: string) => performSemanticSearch(searchQuery, filters),
    onSuccess: (data, variables) => {
      // Add to recent queries
      const newRecentQueries = [variables, ...recentQueries.filter(q => q !== variables)].slice(0, 10);
      setRecentQueries(newRecentQueries);
      localStorage.setItem('recentSearchQueries', JSON.stringify(newRecentQueries));
    },
  });

  // Get suggestions
  const { data: suggestionsData = [] } = useQuery({
    queryKey: ['suggestions', query],
    queryFn: () => getSearchSuggestions(query),
    enabled: query.length >= 2,
    staleTime: 30000, // 30 seconds
  });

  useEffect(() => {
    setSuggestions(suggestionsData);
    setShowSuggestions(query.length >= 2 && suggestionsData.length > 0);
    setActiveSuggestionIndex(-1);
  }, [suggestionsData, query]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // CMD/Ctrl + K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
      
      // Escape to clear search or blur
      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        if (query) {
          setQuery('');
          searchMutation.reset();
        } else {
          inputRef.current?.blur();
        }
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (enableAutoSearch && value.trim().length >= 3) {
      const timeoutId = setTimeout(() => {
        searchMutation.mutate(value.trim());
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      searchMutation.mutate(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
        event.preventDefault();
        const selectedSuggestion = suggestions[activeSuggestionIndex];
        setQuery(selectedSuggestion);
        searchMutation.mutate(selectedSuggestion);
        setShowSuggestions(false);
      }
    } else if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    searchMutation.mutate(suggestion);
    setShowSuggestions(false);
  };

  const clearResults = () => {
    setQuery('');
    searchMutation.reset();
    setShowSuggestions(false);
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Re-search if we have a query
    if (query.trim() && searchMutation.data) {
      searchMutation.mutate(query.trim());
    }
  };

  const results = searchMutation.data?.results || [];
  const isSearching = searchMutation.isPending;
  const hasResults = results.length > 0;
  const error = searchMutation.error;

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-10 pr-12 py-3 text-sm border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : query ? (
            <button
              onClick={clearResults}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => selectSuggestion(suggestion)}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-accent",
                index === activeSuggestionIndex && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2">
                <Search className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters Toggle */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-muted-foreground">
          {isSearching && "Searching..."}
          {searchMutation.data && !isSearching && (
            `Found ${searchMutation.data.total} results in ${searchMutation.data.processing_time.toFixed(2)}ms`
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Filter className="h-3 w-3" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-accent/50 border border-border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content Types</label>
              <div className="space-y-2">
                {['adrs', 'patterns', 'knowledge'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.contentTypes.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.contentTypes, type]
                          : filters.contentTypes.filter(t => t !== type);
                        updateFilters({ contentTypes: newTypes });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Similarity Threshold: {filters.similarityThreshold}
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.1"
                value={filters.similarityThreshold}
                onChange={(e) => updateFilters({ similarityThreshold: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Less Strict</span>
                <span>More Strict</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Max Results</label>
              <select
                value={filters.maxResults}
                onChange={(e) => updateFilters({ maxResults: parseInt(e.target.value) })}
                className="w-full px-3 py-1 text-sm border border-border rounded bg-background"
              >
                <option value={10}>10 results</option>
                <option value={20}>20 results</option>
                <option value={50}>50 results</option>
                <option value={100}>100 results</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            Search failed: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      )}

      {/* Results */}
      {hasResults && !isSearching && (
        <div className="mt-6 space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => onResultClick?.(result)}
              className="p-4 border border-border rounded-lg hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground hover:text-primary">
                      {result.title}
                    </h3>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full font-medium",
                      result.type === 'adr' && "bg-blue-100 text-blue-700",
                      result.type === 'pattern' && "bg-green-100 text-green-700",
                      result.type === 'knowledge' && "bg-purple-100 text-purple-700"
                    )}>
                      {result.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                    {result.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {result.project_name && (
                      <span>Project: {result.project_name}</span>
                    )}
                    {result.component_name && (
                      <span>Component: {result.component_name}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>{(result.similarity * 100).toFixed(0)}% match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Queries */}
      {!query && !hasResults && recentQueries.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentQueries.slice(0, 5).map((recentQuery) => (
              <button
                key={recentQuery}
                onClick={() => {
                  setQuery(recentQuery);
                  searchMutation.mutate(recentQuery);
                }}
                className="px-3 py-1 text-sm bg-accent hover:bg-accent/80 rounded-full transition-colors"
              >
                {recentQuery}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}