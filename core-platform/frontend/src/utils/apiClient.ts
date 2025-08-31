import type {
  SemanticSearchRequest,
  SemanticSearchResponse,
  PatternRecommendationResponse,
  SimilarADRsResponse,
  SearchAnalyticsResponse,
  APIConfig,
  APIError,
} from '@/types';

class DevMemoryOSAPI {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(config: Partial<APIConfig> = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3003';
    this.timeout = config.timeout || 10000;
    this.retries = config.retries || 2;
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Check for API-level errors
      if (!data.success && data.error) {
        const apiError: APIError = {
          code: data.code || 'API_ERROR',
          message: data.error,
          details: data,
        };
        throw apiError;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }

      // Retry logic for network errors
      if (attempt < this.retries && this.isRetriableError(error)) {
        console.warn(`Request failed, retrying (${attempt}/${this.retries}):`, error);
        await this.delay(1000 * attempt);
        return this.fetchWithRetry<T>(url, options, attempt + 1);
      }

      throw error;
    }
  }

  private isRetriableError(error: unknown): boolean {
    if (error instanceof TypeError) {
      // Network errors are often TypeError
      return true;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('connection') ||
        message.includes('fetch')
      );
    }

    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    services: {
      database: boolean;
      embeddings: boolean;
      api: boolean;
    };
    uptime: number;
  }> {
    return this.fetchWithRetry('/health');
  }

  // Semantic search
  async semanticSearch(request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    const startTime = performance.now();
    
    try {
      const response = await this.fetchWithRetry<SemanticSearchResponse>(
        '/api/search/semantic',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      const duration = performance.now() - startTime;
      console.log(`Semantic search completed in ${duration.toFixed(2)}ms`);

      return response;
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  // Find similar ADRs
  async findSimilarADRs(
    adrId: string,
    options: {
      similarity_threshold?: number;
      max_results?: number;
      include_same_project?: boolean;
    } = {}
  ): Promise<SimilarADRsResponse> {
    const params = new URLSearchParams();
    if (options.similarity_threshold !== undefined) {
      params.append('similarity_threshold', options.similarity_threshold.toString());
    }
    if (options.max_results !== undefined) {
      params.append('max_results', options.max_results.toString());
    }
    if (options.include_same_project !== undefined) {
      params.append('include_same_project', options.include_same_project.toString());
    }

    const queryString = params.toString();
    const url = `/api/search/similar/${adrId}${queryString ? `?${queryString}` : ''}`;

    return this.fetchWithRetry<SimilarADRsResponse>(url);
  }

  // Get pattern recommendations
  async getPatternRecommendations(options: {
    query?: string;
    context_tags?: string[];
    category?: string;
    similarity_threshold?: number;
    max_results?: number;
    min_effectiveness_score?: number;
  } = {}): Promise<PatternRecommendationResponse> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const url = `/api/patterns/recommend${queryString ? `?${queryString}` : ''}`;

    return this.fetchWithRetry<PatternRecommendationResponse>(url);
  }

  // Get search analytics
  async getSearchAnalytics(options: {
    project_id?: string;
    days?: number;
  } = {}): Promise<SearchAnalyticsResponse> {
    const params = new URLSearchParams();
    
    if (options.project_id) {
      params.append('project_id', options.project_id);
    }
    if (options.days !== undefined) {
      params.append('days', options.days.toString());
    }

    const queryString = params.toString();
    const url = `/api/search/analytics${queryString ? `?${queryString}` : ''}`;

    return this.fetchWithRetry<SearchAnalyticsResponse>(url);
  }

  // Quick search suggestions (lightweight search for autocomplete)
  async getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
    if (query.length < 2) return [];

    try {
      const response = await this.semanticSearch({
        query,
        max_results: limit,
        similarity_threshold: 0.5,
      });

      // Extract titles/names as suggestions
      const suggestions: string[] = [];
      
      response.results_by_type.adrs?.forEach(adr => {
        if (adr.title && !suggestions.includes(adr.title)) {
          suggestions.push(adr.title);
        }
      });

      response.results_by_type.patterns?.forEach(pattern => {
        if (pattern.name && !suggestions.includes(pattern.name)) {
          suggestions.push(pattern.name);
        }
      });

      return suggestions.slice(0, limit);
    } catch (error) {
      console.warn('Failed to get search suggestions:', error);
      return [];
    }
  }

  // Batch operations
  async batchSearch(queries: string[]): Promise<SemanticSearchResponse[]> {
    const promises = queries.map(query =>
      this.semanticSearch({ query })
        .catch(error => {
          console.warn(`Batch search failed for query "${query}":`, error);
          return null;
        })
    );

    const results = await Promise.all(promises);
    return results.filter((result): result is SemanticSearchResponse => result !== null);
  }

  // Utility method to test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  // Get API info
  async getAPIInfo(): Promise<{
    name: string;
    version: string;
    description: string;
    endpoints: Record<string, any>;
  }> {
    return this.fetchWithRetry('/');
  }
}

// Create singleton instance
export const apiClient = new DevMemoryOSAPI();

// Export class for custom instances
export default DevMemoryOSAPI;