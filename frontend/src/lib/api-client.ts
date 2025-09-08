/**
 * API Client Configuration for Chronicle-Keeper
 * Handles communication with both FastAPI backend and Node.js semantic search
 */

interface APIConfig {
  fastapi_url: string;
  semantic_url: string;
  timeout: number;
  retry_attempts: number;
}

class APIClient {
  private config: APIConfig;

  constructor(config?: Partial<APIConfig>) {
    this.config = {
      fastapi_url: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      semantic_url: process.env.REACT_APP_SEMANTIC_URL || 'http://localhost:3003',
      timeout: 10000, // 10 seconds
      retry_attempts: 3,
      ...config,
    };
  }

  private async request<T>(
    url: string, 
    options: RequestInit = {},
    useSemanticAPI = false
  ): Promise<T> {
    const baseURL = useSemanticAPI ? this.config.semantic_url : this.config.fastapi_url;
    const fullURL = `${baseURL}${url}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: defaultHeaders,
      signal: AbortSignal.timeout(this.config.timeout),
    };

    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retry_attempts; attempt++) {
      try {
        const response = await fetch(fullURL, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text() as unknown as T;
        }
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof TypeError || (error as any).name === 'AbortError') {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retry_attempts) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }

  // FastAPI Backend Methods (main Chronicle-Keeper API)
  
  async getADRs(): Promise<any> {
    return this.request('/api/v1/adrs');
  }

  async getADR(id: string): Promise<any> {
    return this.request(`/api/v1/adrs/${id}`);
  }

  async searchADRs(query: string): Promise<any> {
    return this.request(`/api/v1/adrs/search?q=${encodeURIComponent(query)}`);
  }

  async createADR(adr: any): Promise<any> {
    return this.request('/api/v1/adrs', {
      method: 'POST',
      body: JSON.stringify(adr),
    });
  }

  async updateADR(id: string, adr: any): Promise<any> {
    return this.request(`/api/v1/adrs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adr),
    });
  }

  async deleteADR(id: string): Promise<any> {
    return this.request(`/api/v1/adrs/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getAnalytics(): Promise<any> {
    return this.request('/api/v1/analytics');
  }

  async getDecisionAnalytics(): Promise<any> {
    return this.request('/api/v1/analytics/decisions');
  }

  // Intelligence endpoints  
  async generateContext(query: string, contextType: string = 'general'): Promise<any> {
    return this.request('/api/v1/intelligence/context', {
      method: 'POST',
      body: JSON.stringify({ query, context_type: contextType }),
    });
  }

  // Node.js Semantic Search Backend Methods

  async semanticSearch(request: {
    query: string;
    content_types?: string[];
    similarity_threshold?: number;
    max_results?: number;
  }): Promise<any> {
    return this.request('/api/search/semantic', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true);
  }

  async getSearchSuggestions(query: string, limit: number = 5): Promise<any> {
    return this.request(
      `/api/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`,
      {},
      true
    );
  }

  async getPatterns(filters: any = {}): Promise<any> {
    const params = new URLSearchParams(filters);
    return this.request(`/api/patterns?${params.toString()}`, {}, true);
  }

  async searchPatterns(query: string, filters: any = {}): Promise<any> {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.request(`/api/patterns/search?${params.toString()}`, {}, true);
  }

  async getPatternRecommendations(patternId: string): Promise<any> {
    return this.request(`/api/patterns/${patternId}/recommendations`, {}, true);
  }

  async processEmbeddings(options: {
    type?: string;
    adr_directory?: string;
    force_reprocess?: boolean;
  } = {}): Promise<any> {
    return this.request('/api/embeddings/process', {
      method: 'POST',
      body: JSON.stringify(options),
    }, true);
  }

  async getEmbeddingJob(jobId: string): Promise<any> {
    return this.request(`/api/embeddings/jobs/${jobId}`, {}, true);
  }

  // Health check methods
  async checkFastAPIHealth(): Promise<any> {
    try {
      return await this.request('/health');
    } catch (error) {
      return { status: 'unhealthy', error: (error as Error).message };
    }
  }

  async checkSemanticAPIHealth(): Promise<any> {
    try {
      return await this.request('/health', {}, true);
    } catch (error) {
      return { status: 'unhealthy', error: (error as Error).message };
    }
  }

  async checkSystemHealth(): Promise<{
    fastapi: any;
    semantic: any;
    overall_status: 'healthy' | 'degraded' | 'unhealthy';
  }> {
    const [fastapi, semantic] = await Promise.all([
      this.checkFastAPIHealth(),
      this.checkSemanticAPIHealth(),
    ]);

    let overall_status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (fastapi.status !== 'healthy' && semantic.status !== 'healthy') {
      overall_status = 'unhealthy';
    } else if (fastapi.status !== 'healthy' || semantic.status !== 'healthy') {
      overall_status = 'degraded';
    }

    return {
      fastapi,
      semantic,
      overall_status,
    };
  }
}

// Create singleton instance
const apiClient = new APIClient();

export default apiClient;
export { APIClient };
export type { APIConfig };