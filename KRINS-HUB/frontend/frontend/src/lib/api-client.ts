/**
 * FastAPI Backend API Client with TanStack Query Integration
 * Production-ready client with retry logic, error handling, and type safety
 */

import { QueryClient } from '@tanstack/react-query';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 3;

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface SemanticSearchRequest {
  query: string;
  content_types?: string[];
  similarity_threshold?: number;
  max_results?: number;
  search_mode?: 'semantic' | 'keyword' | 'hybrid';
  project_id?: string;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SemanticSearchResponse {
  query: string;
  search_mode: string;
  total_results: number;
  processing_time_ms: number;
  results_by_type: {
    adrs?: SearchResult[];
    patterns?: SearchResult[];
  };
  suggestions: string[];
}

export interface ADR {
  id: string;
  project_id: string;
  number: number;
  title: string;
  status: string;
  problem_statement: string;
  alternatives?: any;
  decision: string;
  rationale?: string;
  evidence?: any;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Pattern {
  id: string;
  name: string;
  category: string;
  description: string;
  when_to_use?: string;
  when_not_to_use?: string;
  context_tags?: string[];
  implementation_examples?: any;
  anti_patterns?: any;
  metrics?: any;
  security_considerations?: string;
  effectiveness_score: number;
  usage_count: number;
  version: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HealthCheck {
  status: string;
  application: string;
  version: string;
  environment: string;
  database: {
    status: string;
    error?: string;
  };
}

// HTTP Client Class
class APIClient {
  private baseURL: string;
  private timeout: number;
  
  constructor(baseURL: string = API_BASE_URL, timeout: number = DEFAULT_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = MAX_RETRIES
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
      ...options,
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, defaultOptions);
        
        // Handle different response types
        const contentType = response.headers.get('content-type');
        let data: any;
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          throw new Error(data?.detail || data?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return {
          data,
          status: response.status,
        };

      } catch (error) {
        console.error(`API request failed (attempt ${attempt}/${retries}):`, error);
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          throw error;
        }
        
        // Retry on network errors and 5xx
        if (attempt === retries) {
          throw new Error(`API request failed after ${retries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Max retries exceeded');
  }

  // Semantic Search Methods
  async semanticSearch(request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    const response = await this.makeRequest<SemanticSearchResponse>('/search/semantic', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    return response.data!;
  }

  async getSearchSuggestions(query: string, limit: number = 10): Promise<Array<{text: string; type: string; id: string}>> {
    const response = await this.makeRequest<Array<{text: string; type: string; id: string}>>(
      `/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    
    return response.data!;
  }

  // ADR Methods
  async getADRs(params?: {
    project_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ADR[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/adrs${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await this.makeRequest<ADR[]>(endpoint);
    
    return response.data!;
  }

  async getADR(id: string): Promise<ADR> {
    const response = await this.makeRequest<ADR>(`/adrs/${id}`);
    return response.data!;
  }

  // Pattern Methods
  async getPatterns(params?: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Pattern[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/patterns${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await this.makeRequest<Pattern[]>(endpoint);
    
    return response.data!;
  }

  async getPattern(id: string): Promise<Pattern> {
    const response = await this.makeRequest<Pattern>(`/patterns/${id}`);
    return response.data!;
  }

  // Health Check
  async healthCheck(): Promise<HealthCheck> {
    const response = await this.makeRequest<HealthCheck>('/health');
    return response.data!;
  }
}

// Default API client instance
export const apiClient = new APIClient();

// TanStack Query Configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query Keys for consistent caching
export const queryKeys = {
  health: ['health'] as const,
  adrs: {
    all: ['adrs'] as const,
    list: (params?: any) => ['adrs', 'list', params] as const,
    detail: (id: string) => ['adrs', 'detail', id] as const,
  },
  patterns: {
    all: ['patterns'] as const,
    list: (params?: any) => ['patterns', 'list', params] as const,
    detail: (id: string) => ['patterns', 'detail', id] as const,
  },
  search: {
    semantic: (request: SemanticSearchRequest) => ['search', 'semantic', request] as const,
    suggestions: (query: string, limit?: number) => ['search', 'suggestions', query, limit] as const,
  },
} as const;