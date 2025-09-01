import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';
import { debounce } from '@/lib/utils';
import type {
  PatternRecommendation,
  PatternRecommendationResponse,
} from '@/types';

interface UsePatternRecommendationsOptions {
  enableAutoRecommendations?: boolean;
  debounceMs?: number;
  defaultCategory?: string;
  defaultSimilarityThreshold?: number;
  defaultMaxResults?: number;
  max_results?: number;
  defaultMinEffectivenessScore?: number;
}

interface PatternFilters {
  query?: string;
  contextTags: string[];
  category?: string;
  similarityThreshold: number;
  maxResults: number;
  minEffectivenessScore?: number;
}

export function usePatternRecommendations(options: UsePatternRecommendationsOptions = {}) {
  const {
    enableAutoRecommendations = false,
    debounceMs = 300,
    defaultCategory,
    defaultSimilarityThreshold = 0.6,
    defaultMaxResults = 10,
    defaultMinEffectivenessScore = 2.0,
  } = options;

  const queryClient = useQueryClient();

  // State for pattern filters and recommendations
  const [filters, setFilters] = useState<PatternFilters>({
    query: '',
    contextTags: [],
    category: defaultCategory,
    similarityThreshold: defaultSimilarityThreshold,
    maxResults: defaultMaxResults,
    minEffectivenessScore: defaultMinEffectivenessScore,
  });

  const [recommendations, setRecommendations] = useState<PatternRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query for getting pattern recommendations
  const recommendationsQuery = useQuery({
    queryKey: ['pattern-recommendations', filters],
    queryFn: async (): Promise<PatternRecommendationResponse> => {
      const options = {
        query: filters.query || undefined,
        context_tags: filters.contextTags.length > 0 ? filters.contextTags : undefined,
        category: filters.category || undefined,
        similarity_threshold: filters.similarityThreshold,
        max_results: filters.maxResults,
        min_effectiveness_score: filters.minEffectivenessScore,
      };

      return apiClient.getPatternRecommendations(options);
    },
    enabled: enableAutoRecommendations || !!filters.query,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Manual recommendation mutation
  const getRecommendationsMutation = useMutation({
    mutationFn: async (customFilters: Partial<PatternFilters> = {}) => {
      setIsLoading(true);
      setError(null);

      const requestFilters = { ...filters, ...customFilters };
      
      const options = {
        query: requestFilters.query || undefined,
        context_tags: requestFilters.contextTags.length > 0 ? requestFilters.contextTags : undefined,
        category: requestFilters.category || undefined,
        similarity_threshold: requestFilters.similarityThreshold,
        max_results: requestFilters.maxResults,
        min_effectiveness_score: requestFilters.minEffectivenessScore,
      };

      return apiClient.getPatternRecommendations(options);
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations);
      setIsLoading(false);
      setError(null);
    },
    onError: (error) => {
      console.error('Pattern recommendations error:', error);
      setIsLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to get recommendations');
    },
  });

  // Debounced query update for auto-recommendations
  const debouncedUpdateQuery = useCallback(
    debounce((query: string) => {
      if (enableAutoRecommendations) {
        setFilters(prev => ({ ...prev, query }));
      }
    }, debounceMs),
    [enableAutoRecommendations, debounceMs]
  );

  // Update query
  const updateQuery = useCallback(
    (query: string) => {
      if (enableAutoRecommendations) {
        debouncedUpdateQuery(query);
      } else {
        setFilters(prev => ({ ...prev, query }));
      }
    },
    [enableAutoRecommendations, debouncedUpdateQuery]
  );

  // Update context tags
  const updateContextTags = useCallback((tags: string[]) => {
    setFilters(prev => ({ ...prev, contextTags: tags }));
  }, []);

  // Add context tag
  const addContextTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      contextTags: prev.contextTags.includes(tag) 
        ? prev.contextTags 
        : [...prev.contextTags, tag],
    }));
  }, []);

  // Remove context tag
  const removeContextTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      contextTags: prev.contextTags.filter(t => t !== tag),
    }));
  }, []);

  // Update category
  const updateCategory = useCallback((category: string | undefined) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  // Update similarity threshold
  const updateSimilarityThreshold = useCallback((threshold: number) => {
    setFilters(prev => ({ ...prev, similarityThreshold: threshold }));
  }, []);

  // Update max results
  const updateMaxResults = useCallback((maxResults: number) => {
    setFilters(prev => ({ ...prev, maxResults }));
  }, []);

  // Update minimum effectiveness score
  const updateMinEffectivenessScore = useCallback((score: number | undefined) => {
    setFilters(prev => ({ ...prev, minEffectivenessScore: score }));
  }, []);

  // Get recommendations manually
  const getRecommendations = useCallback(
    async (customFilters?: Partial<PatternFilters>) => {
      await getRecommendationsMutation.mutateAsync(customFilters);
    },
    [getRecommendationsMutation]
  );

  // Get recommendations by context (for smart suggestions)
  const getRecommendationsByContext = useCallback(
    async (contextTags: string[], query?: string) => {
      try {
        const response = await apiClient.getPatternRecommendations({
          context_tags: contextTags,
          query,
          max_results: 5,
          similarity_threshold: 0.5, // Lower threshold for broader suggestions
        });

        return response.recommendations;
      } catch (error) {
        console.error('Context-based recommendations error:', error);
        return [];
      }
    },
    []
  );

  // Get trending patterns
  const getTrendingPatterns = useCallback(async () => {
    try {
      const response = await apiClient.getPatternRecommendations({
        max_results: 10,
        min_effectiveness_score: 3.0, // Higher effectiveness for trending
      });

      // Sort by usage count and effectiveness score
      const trending = response.recommendations.sort((a, b) => {
        const aScore = (a.usage_count || 0) * (a.effectiveness_score || 1);
        const bScore = (b.usage_count || 0) * (b.effectiveness_score || 1);
        return bScore - aScore;
      });

      return trending;
    } catch (error) {
      console.error('Trending patterns error:', error);
      return [];
    }
  }, []);

  // Clear recommendations
  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
    setFilters(prev => ({ ...prev, query: '' }));
    queryClient.removeQueries({ queryKey: ['pattern-recommendations'] });
  }, [queryClient]);

  // Get all available categories
  const getAvailableCategories = useCallback(async () => {
    try {
      const response = await apiClient.getPatternRecommendations({
        max_results: 1000, // Large number to get all patterns
      });

      const categories = new Set<string>();
      response.recommendations.forEach(pattern => {
        if (pattern.category) {
          categories.add(pattern.category);
        }
      });

      return Array.from(categories).sort();
    } catch (error) {
      console.error('Get categories error:', error);
      return [];
    }
  }, []);

  // Get all available context tags
  const getAvailableContextTags = useCallback(async () => {
    try {
      const response = await apiClient.getPatternRecommendations({
        max_results: 1000, // Large number to get all patterns
      });

      const tags = new Set<string>();
      response.recommendations.forEach(pattern => {
        pattern.context_tags.forEach(tag => tags.add(tag));
      });

      return Array.from(tags).sort();
    } catch (error) {
      console.error('Get context tags error:', error);
      return [];
    }
  }, []);

  // Effect to update recommendations when auto-recommendations query changes
  useEffect(() => {
    if (recommendationsQuery.data && enableAutoRecommendations) {
      setRecommendations(recommendationsQuery.data.recommendations);
      setError(null);
    }
  }, [recommendationsQuery.data, enableAutoRecommendations]);

  // Effect to handle loading states
  useEffect(() => {
    setIsLoading(
      recommendationsQuery.isFetching || 
      getRecommendationsMutation.isPending
    );
  }, [recommendationsQuery.isFetching, getRecommendationsMutation.isPending]);

  // Effect to handle errors
  useEffect(() => {
    if (recommendationsQuery.error && enableAutoRecommendations) {
      setError(
        recommendationsQuery.error instanceof Error 
          ? recommendationsQuery.error.message 
          : 'Failed to get auto-recommendations'
      );
    }
  }, [recommendationsQuery.error, enableAutoRecommendations]);

  return {
    // State
    recommendations: recommendations.length > 0 ? recommendations : (recommendationsQuery.data?.recommendations || []),
    filters,
    isLoading,
    error,
    
    // Actions
    updateQuery,
    updateContextTags,
    addContextTag,
    removeContextTag,
    updateCategory,
    updateSimilarityThreshold,
    updateMaxResults,
    updateMinEffectivenessScore,
    getRecommendations,
    getRecommendationsByContext,
    getTrendingPatterns,
    clearRecommendations,
    refetch: recommendationsQuery.refetch,
    
    // Utilities
    getAvailableCategories,
    getAvailableContextTags,
    
    // Computed properties
    hasRecommendations: recommendations.length > 0 || (recommendationsQuery.data?.recommendations.length || 0) > 0,
    totalRecommendations: recommendations.length || recommendationsQuery.data?.total_found || 0,
    
    // Query states
    isAutoRecommending: enableAutoRecommendations && recommendationsQuery.isFetching,
  };
}