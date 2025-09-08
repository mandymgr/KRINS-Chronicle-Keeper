import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface SemanticSearchRequest {
  query: string;
  content_types?: string[];
  similarity_threshold?: number;
  max_results?: number;
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

interface SearchState {
  isSearching: boolean;
  query: string;
  results: SearchResult[] | null;
  error: string | null;
  recentQueries: string[];
}

interface SearchFilters {
  contentTypes: string[];
  similarityThreshold: number;
  maxResults: number;
}

interface UseSemanticSearchOptions {
  enableAutoSearch?: boolean;
  debounceMs?: number;
  cacheResults?: boolean;
  maxRecentQueries?: number;
}

const RECENT_QUERIES_KEY = 'recentSearchQueries';

export function useSemanticSearchReal(options: UseSemanticSearchOptions = {}) {
  const {
    enableAutoSearch = false,
    debounceMs = 300,
    cacheResults = true,
    maxRecentQueries = 10,
  } = options;

  const queryClient = useQueryClient();

  // Load recent queries from localStorage
  const loadRecentQueries = (): string[] => {
    try {
      const stored = localStorage.getItem(RECENT_QUERIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save recent queries to localStorage
  const saveRecentQueries = (queries: string[]) => {
    try {
      localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(queries));
    } catch (error) {
      console.warn('Failed to save recent queries:', error);
    }
  };

  // Local state
  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    query: '',
    results: null,
    error: null,
    recentQueries: loadRecentQueries(),
  });

  const [filters, setFilters] = useState<SearchFilters>({
    contentTypes: ['adrs', 'patterns', 'knowledge'],
    similarityThreshold: 0.7,
    maxResults: 20,
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (request: SemanticSearchRequest): Promise<SearchResponse> => {
      setSearchState(prev => ({ ...prev, isSearching: true, error: null }));
      return apiClient.semanticSearch(request);
    },
    onSuccess: (data, variables) => {
      const newRecentQueries = [
        variables.query,
        ...searchState.recentQueries.filter(q => q !== variables.query)
      ].slice(0, maxRecentQueries);

      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        results: data.results,
        error: null,
        recentQueries: newRecentQueries,
      }));

      saveRecentQueries(newRecentQueries);

      // Cache results if enabled
      if (cacheResults) {
        queryClient.setQueryData(['semantic-search', variables.query], data);
      }
    },
    onError: (error) => {
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    },
  });

  // Suggestions query
  const suggestionsQuery = useQuery({
    queryKey: ['search-suggestions', searchState.query],
    queryFn: () => apiClient.getSearchSuggestions(searchState.query),
    enabled: searchState.query.length >= 2,
    staleTime: 30000, // 30 seconds
    select: (data) => data.suggestions || [],
  });

  // Auto-search effect with debouncing
  React.useEffect(() => {
    if (!enableAutoSearch || searchState.query.length < 3) return;

    const timeoutId = setTimeout(() => {
      performSearch(searchState.query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchState.query, filters, enableAutoSearch, debounceMs]);

  // Main search function
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      clearResults();
      return;
    }

    searchMutation.mutate({
      query: query.trim(),
      content_types: filters.contentTypes,
      similarity_threshold: filters.similarityThreshold,
      max_results: filters.maxResults,
    });
  }, [filters, searchMutation]);

  // Quick search for suggestions/autocomplete
  const quickSearch = useCallback(async (query: string): Promise<string[]> => {
    if (query.length < 2) return [];
    
    try {
      const data = await apiClient.getSearchSuggestions(query, 5);
      return data.suggestions || [];
    } catch (error) {
      console.warn('Quick search failed:', error);
      return [];
    }
  }, []);

  // Update query
  const updateQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Re-search if we have results and query
    if (searchState.results && searchState.query.trim()) {
      performSearch(searchState.query);
    }
  }, [filters, searchState, performSearch]);

  // Clear results
  const clearResults = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      results: null,
      error: null,
    }));
    searchMutation.reset();
  }, [searchMutation]);

  // Clear recent queries
  const clearRecentQueries = useCallback(() => {
    setSearchState(prev => ({ ...prev, recentQueries: [] }));
    saveRecentQueries([]);
  }, []);

  // Retry search
  const retrySearch = useCallback(() => {
    if (searchState.query.trim()) {
      performSearch(searchState.query);
    }
  }, [searchState.query, performSearch]);

  return {
    // State
    searchState,
    filters,
    isSearching: searchState.isSearching,
    results: searchState.results || [],
    error: searchState.error,
    recentQueries: searchState.recentQueries,
    hasResults: (searchState.results?.length || 0) > 0,
    totalResults: searchState.results?.length || 0,

    // Suggestions
    suggestions: suggestionsQuery.data || [],
    isSuggestionsLoading: suggestionsQuery.isLoading,

    // Actions
    performSearch,
    quickSearch,
    updateQuery,
    updateFilters,
    clearResults,
    clearRecentQueries,
    retrySearch,

    // Raw mutation for advanced usage
    searchMutation,
  };
}