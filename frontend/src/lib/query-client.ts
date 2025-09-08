import { QueryClient } from '@tanstack/react-query';

// Create a query client with optimized settings for Chronicle-Keeper
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long inactive data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in older versions)
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && (error as any).message?.includes('HTTP 4')) {
          return false;
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch behavior
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true,    // Refetch when connection is restored
      refetchOnMount: true,        // Refetch when component mounts if data is stale
    },
    mutations: {
      // Retry mutations once on network errors
      retry: (failureCount, error) => {
        if (error && (error as any).message?.includes('HTTP 4')) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

// Prefetch commonly used queries
export const prefetchCommonQueries = async () => {
  try {
    // Prefetch ADRs list
    await queryClient.prefetchQuery({
      queryKey: ['adrs'],
      queryFn: () => import('@/lib/api-client').then(({ default: apiClient }) => apiClient.getADRs()),
      staleTime: 2 * 60 * 1000, // 2 minutes for ADRs
    });

    // Prefetch system health
    await queryClient.prefetchQuery({
      queryKey: ['system-health'],
      queryFn: () => import('@/lib/api-client').then(({ default: apiClient }) => apiClient.checkSystemHealth()),
      staleTime: 30 * 1000, // 30 seconds for health checks
    });
  } catch (error) {
    console.warn('Failed to prefetch common queries:', error);
  }
};

// Query key factories for consistent key management
export const queryKeys = {
  all: ['krins-chronicle'] as const,
  
  // ADRs
  adrs: () => [...queryKeys.all, 'adrs'] as const,
  adr: (id: string) => [...queryKeys.adrs(), id] as const,
  adrSearch: (query: string) => [...queryKeys.adrs(), 'search', query] as const,
  
  // Semantic Search
  semanticSearch: (query: string, filters?: any) => 
    [...queryKeys.all, 'semantic-search', query, filters] as const,
  suggestions: (query: string) => 
    [...queryKeys.all, 'suggestions', query] as const,
  
  // Patterns
  patterns: () => [...queryKeys.all, 'patterns'] as const,
  pattern: (id: string) => [...queryKeys.patterns(), id] as const,
  patternSearch: (query: string, filters?: any) => 
    [...queryKeys.patterns(), 'search', query, filters] as const,
  patternRecommendations: (id: string) => 
    [...queryKeys.patterns(), id, 'recommendations'] as const,
  
  // Analytics
  analytics: () => [...queryKeys.all, 'analytics'] as const,
  decisionAnalytics: () => [...queryKeys.analytics(), 'decisions'] as const,
  
  // Intelligence
  intelligence: () => [...queryKeys.all, 'intelligence'] as const,
  context: (query: string, type: string) => 
    [...queryKeys.intelligence(), 'context', query, type] as const,
  
  // System
  health: () => [...queryKeys.all, 'health'] as const,
  systemHealth: () => [...queryKeys.health(), 'system'] as const,
};

// Invalidation helpers
export const invalidateQueries = {
  adrs: () => queryClient.invalidateQueries({ queryKey: queryKeys.adrs() }),
  patterns: () => queryClient.invalidateQueries({ queryKey: queryKeys.patterns() }),
  analytics: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics() }),
  health: () => queryClient.invalidateQueries({ queryKey: queryKeys.health() }),
  all: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
};

export default queryClient;