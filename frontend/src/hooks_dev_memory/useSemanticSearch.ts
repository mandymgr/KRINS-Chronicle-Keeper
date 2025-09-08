import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';
import { debounce, getStoredValue, setStoredValue } from '@/lib/utils';
import type {
  SemanticSearchRequest,
  SemanticSearchResponse,
  SearchState,
  SearchFilters,
} from '@/types';

interface UseSemanticSearchOptions {
  enableAutoSearch?: boolean;
  debounceMs?: number;
  cacheResults?: boolean;
  maxRecentQueries?: number;
}

export function useSemanticSearch(options: UseSemanticSearchOptions = {}) {
  const {
    enableAutoSearch = false,
    debounceMs = 300,
    cacheResults = true,
    maxRecentQueries = 10,
  } = options;

  const queryClient = useQueryClient();
  
  // Local state
  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    query: '',
    results: null,
    error: null,
    recentQueries: getStoredValue('recentSearchQueries', []),
  });

  const [filters, setFilters] = useState<SearchFilters>({
    contentTypes: ['adrs', 'patterns', 'knowledge'],
    similarityThreshold: 0.7,
    maxResults: 20,
  });

  // Search mutation for manual searches
  const searchMutation = useMutation({
    mutationFn: async (request: SemanticSearchRequest): Promise<SemanticSearchResponse> => {
      setSearchState(prev => ({ ...prev, isSearching: true, error: null }));
      return apiClient.semanticSearch(request);
    },
    onSuccess: (data, variables) => {
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        results: data,
        error: null,
      }));

      // Add to recent queries
      if (variables.query && variables.query.trim()) {
        addToRecentQueries(variables.query.trim());
      }

      // Cache results if enabled
      if (cacheResults) {
        queryClient.setQueryData(['semantic-search', variables], data);
      }
    },
    onError: (error) => {
      console.error('Semantic search error:', error);
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    },
  });

  // Auto-search query for real-time search as user types
  const autoSearchQuery = useQuery({
    queryKey: ['semantic-search-auto', searchState.query, filters],
    queryFn: async () => {
      if (!searchState.query.trim() || searchState.query.length < 2) {
        return null;
      }

      const request: SemanticSearchRequest = {
        query: searchState.query.trim(),
        content_types: filters.contentTypes,
        similarity_threshold: filters.similarityThreshold,
        max_results: filters.maxResults,
      };

      return apiClient.semanticSearch(request);
    },
    enabled: enableAutoSearch && !!searchState.query && searchState.query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (enableAutoSearch) {
        setSearchState(prev => ({ ...prev, query }));
      }
    }, debounceMs),
    [enableAutoSearch, debounceMs]
  );

  // Manual search function
  const performSearch = useCallback(
    async (query: string, customFilters?: Partial<SearchFilters>) => {
      if (!query.trim()) return;

      const searchFilters = customFilters ? { ...filters, ...customFilters } : filters;
      
      const request: SemanticSearchRequest = {
        query: query.trim(),
        content_types: searchFilters.contentTypes,
        similarity_threshold: searchFilters.similarityThreshold,
        max_results: searchFilters.maxResults,
      };

      await searchMutation.mutateAsync(request);
    },
    [filters, searchMutation]
  );

  // Quick search function for suggestions
  const quickSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2) return [];

      try {
        const suggestions = await apiClient.getSearchSuggestions(query, 5);
        return suggestions;
      } catch (error) {
        console.warn('Quick search failed:', error);
        return [];
      }
    },
    []
  );

  // Update search query
  const updateQuery = useCallback(
    (query: string) => {
      setSearchState(prev => ({ ...prev, query }));
      
      if (enableAutoSearch) {
        debouncedSearch(query);
      }
    },
    [enableAutoSearch, debouncedSearch]
  );

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    },
    []
  );

  // Add query to recent queries
  const addToRecentQueries = useCallback(
    (query: string) => {
      setSearchState(prev => {
        const filtered = prev.recentQueries.filter(q => q !== query);
        const updated = [query, ...filtered].slice(0, maxRecentQueries);
        
        // Persist to local storage
        setStoredValue('recentSearchQueries', updated);
        
        return {
          ...prev,
          recentQueries: updated,
        };
      });
    },
    [maxRecentQueries]
  );

  // Clear recent queries
  const clearRecentQueries = useCallback(() => {
    setSearchState(prev => ({ ...prev, recentQueries: [] }));
    setStoredValue('recentSearchQueries', []);
  }, []);

  // Clear search results
  const clearResults = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      results: null,
      error: null,
      query: '',
    }));
    queryClient.removeQueries({ queryKey: ['semantic-search-auto'] });
  }, [queryClient]);

  // Get cached search results
  const getCachedResults = useCallback(
    (query: string, searchFilters?: SearchFilters) => {
      const request: SemanticSearchRequest = {
        query: query.trim(),
        content_types: searchFilters?.contentTypes || filters.contentTypes,
        similarity_threshold: searchFilters?.similarityThreshold || filters.similarityThreshold,
        max_results: searchFilters?.maxResults || filters.maxResults,
      };

      return queryClient.getQueryData<SemanticSearchResponse>(['semantic-search', request]);
    },
    [queryClient, filters]
  );

  // Effect to handle auto-search results
  useEffect(() => {
    if (autoSearchQuery.data && enableAutoSearch) {
      setSearchState(prev => ({
        ...prev,
        results: autoSearchQuery.data,
        isSearching: autoSearchQuery.isFetching,
        error: autoSearchQuery.error ? 
          (autoSearchQuery.error instanceof Error ? autoSearchQuery.error.message : 'Auto-search failed') : 
          null,
      }));
    }
  }, [autoSearchQuery.data, autoSearchQuery.isFetching, autoSearchQuery.error, enableAutoSearch]);

  // Effect to handle auto-search loading state
  useEffect(() => {
    if (enableAutoSearch) {
      setSearchState(prev => ({
        ...prev,
        isSearching: autoSearchQuery.isFetching,
      }));
    }
  }, [autoSearchQuery.isFetching, enableAutoSearch]);

  return {
    // State
    searchState,
    filters,
    
    // Actions
    performSearch,
    quickSearch,
    updateQuery,
    updateFilters,
    clearResults,
    clearRecentQueries,
    
    // Utilities
    getCachedResults,
    addToRecentQueries,
    
    // Loading states
    isSearching: searchState.isSearching || searchMutation.isPending,
    isAutoSearching: enableAutoSearch && autoSearchQuery.isFetching,
    
    // Data
    results: searchState.results || (enableAutoSearch ? autoSearchQuery.data : null),
    error: searchState.error,
    recentQueries: searchState.recentQueries,
    
    // Query info
    hasResults: !!(searchState.results || autoSearchQuery.data),
    totalResults: (searchState.results || autoSearchQuery.data)?.total_results || 0,
  };
}