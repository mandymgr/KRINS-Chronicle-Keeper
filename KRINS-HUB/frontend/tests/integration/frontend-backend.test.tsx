/**
 * FRONTEND INTEGRATION TESTING WITH BACKEND API
 * 
 * Tests React components integration with Backend API
 * Validates user journey: Search → Results → Pattern Discovery
 * Ensures proper error handling and loading states
 */

import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Import components to test
import { SemanticSearch } from '@/components/search/SemanticSearch';
import { SearchResults } from '@/components/search/SearchResults';
import { PatternBrowser } from '@/components/patterns/PatternBrowser';
import { ADRExplorer } from '@/components/adr/ADRExplorer';
import App from '@/App';

// Import hooks for direct testing
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { usePatternRecommendations } from '@/hooks/usePatternRecommendations';

// Test utilities
import { createTestWrapper, mockSearchResponse, waitForApiCall } from '../utils/test-helpers';

describe('🎨 Frontend-Backend Integration Tests', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(() => {
    user = userEvent.setup();
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('🔍 Semantic Search Component Integration', () => {
    it('should perform search and display results', async () => {
      const TestComponent = () => {
        const searchHook = useSemanticSearch({ enableAutoSearch: false });
        
        return (
          <div>
            <input
              data-testid="search-input"
              value={searchHook.searchState.query}
              onChange={(e) => searchHook.updateQuery(e.target.value)}
            />
            <button
              data-testid="search-button"
              onClick={() => searchHook.performSearch(searchHook.searchState.query)}
              disabled={searchHook.isSearching}
            >
              {searchHook.isSearching ? 'Searching...' : 'Search'}
            </button>
            
            {searchHook.error && (
              <div data-testid="search-error">{searchHook.error}</div>
            )}
            
            {searchHook.results && (
              <div data-testid="search-results">
                <div data-testid="total-results">{searchHook.totalResults}</div>
                <div data-testid="adrs-count">
                  {searchHook.results.results_by_type.adrs?.length || 0}
                </div>
                <div data-testid="patterns-count">
                  {searchHook.results.results_by_type.patterns?.length || 0}
                </div>
              </div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      // Enter search query
      await user.type(searchInput, 'authentication patterns');
      expect(searchInput).toHaveValue('authentication patterns');

      // Click search button
      await user.click(searchButton);

      // Should show loading state
      expect(screen.getByText('Searching...')).toBeInTheDocument();

      // Wait for results
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Verify results are displayed
      const totalResults = screen.getByTestId('total-results');
      expect(parseInt(totalResults.textContent || '0')).toBeGreaterThan(0);
    });

    it('should handle search errors gracefully', async () => {
      // Mock API to return error
      const mockError = new Error('Search service temporarily unavailable');
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(mockError);

      const TestComponent = () => {
        const searchHook = useSemanticSearch();
        
        React.useEffect(() => {
          searchHook.performSearch('test query that will fail');
        }, []);

        return (
          <div>
            {searchHook.error && (
              <div data-testid="error-message">{searchHook.error}</div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    it('should support auto-search with debouncing', async () => {
      const TestComponent = () => {
        const searchHook = useSemanticSearch({ 
          enableAutoSearch: true,
          debounceMs: 100
        });
        
        return (
          <div>
            <input
              data-testid="auto-search-input"
              value={searchHook.searchState.query}
              onChange={(e) => searchHook.updateQuery(e.target.value)}
            />
            {searchHook.isAutoSearching && (
              <div data-testid="auto-searching">Auto-searching...</div>
            )}
            {searchHook.results && (
              <div data-testid="auto-results">
                Found {searchHook.totalResults} results
              </div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      const input = screen.getByTestId('auto-search-input');

      // Type query character by character
      await user.type(input, 'api design');

      // Should trigger auto-search after debounce
      await waitFor(() => {
        expect(screen.getByTestId('auto-results')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('🎯 Pattern Browser Component Integration', () => {
    it('should load and display pattern recommendations', async () => {
      const TestComponent = () => {
        const patternHook = usePatternRecommendations({
          query: 'microservices architecture',
          autoLoad: true
        });

        return (
          <div>
            {patternHook.isLoading && (
              <div data-testid="patterns-loading">Loading patterns...</div>
            )}
            {patternHook.error && (
              <div data-testid="patterns-error">{patternHook.error}</div>
            )}
            {patternHook.recommendations && (
              <div data-testid="pattern-recommendations">
                {patternHook.recommendations.map(pattern => (
                  <div key={pattern.id} data-testid={`pattern-${pattern.id}`}>
                    <h3>{pattern.name}</h3>
                    <p>Category: {pattern.category}</p>
                    <p>Effectiveness: {pattern.effectiveness_score}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      // Should show loading initially
      expect(screen.getByTestId('patterns-loading')).toBeInTheDocument();

      // Wait for recommendations to load
      await waitFor(() => {
        expect(screen.getByTestId('pattern-recommendations')).toBeInTheDocument();
      });

      // Should display pattern details
      const patterns = screen.getAllByTestId(/pattern-/);
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should handle pattern filtering by category', async () => {
      const TestComponent = () => {
        const [selectedCategory, setSelectedCategory] = React.useState<string>('Architecture');
        const patternHook = usePatternRecommendations({
          category: selectedCategory,
          autoLoad: true
        });

        return (
          <div>
            <select 
              data-testid="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Architecture">Architecture</option>
              <option value="Security">Security</option>
              <option value="Performance">Performance</option>
            </select>
            
            {patternHook.recommendations && (
              <div data-testid="filtered-patterns">
                {patternHook.recommendations.map(pattern => (
                  <div key={pattern.id} data-testid={`pattern-category-${pattern.category}`}>
                    {pattern.name} - {pattern.category}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      // Wait for initial results
      await waitFor(() => {
        expect(screen.getByTestId('filtered-patterns')).toBeInTheDocument();
      });

      // Change category filter
      const categoryFilter = screen.getByTestId('category-filter');
      await user.selectOptions(categoryFilter, 'Security');

      // Should filter patterns by category
      await waitFor(() => {
        const patterns = screen.getAllByTestId(/pattern-category-/);
        patterns.forEach(pattern => {
          expect(pattern).toHaveTextContent('Security');
        });
      });
    });
  });

  describe('📚 ADR Explorer Component Integration', () => {
    it('should search and display similar ADRs', async () => {
      const TestComponent = () => {
        const [selectedADRId, setSelectedADRId] = React.useState<string>('');
        const [similarADRs, setSimilarADRs] = React.useState<any[]>([]);
        const [isLoading, setIsLoading] = React.useState(false);

        const findSimilarADRs = async (adrId: string) => {
          setIsLoading(true);
          try {
            const result = await import('@/utils/apiClient').then(module => 
              module.apiClient.findSimilarADRs(adrId, { max_results: 5 })
            );
            setSimilarADRs(result.similar_adrs);
          } catch (error) {
            console.error('Failed to find similar ADRs:', error);
          } finally {
            setIsLoading(false);
          }
        };

        return (
          <div>
            <input
              data-testid="adr-id-input"
              value={selectedADRId}
              onChange={(e) => setSelectedADRId(e.target.value)}
              placeholder="Enter ADR ID"
            />
            <button
              data-testid="find-similar-button"
              onClick={() => findSimilarADRs(selectedADRId)}
              disabled={!selectedADRId || isLoading}
            >
              {isLoading ? 'Finding...' : 'Find Similar ADRs'}
            </button>
            
            {similarADRs.length > 0 && (
              <div data-testid="similar-adrs">
                {similarADRs.map(adr => (
                  <div key={adr.id} data-testid={`similar-adr-${adr.id}`}>
                    <h4>{adr.title}</h4>
                    <p>Similarity: {adr.similarity}</p>
                    <p>Project: {adr.project_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      const adrIdInput = screen.getByTestId('adr-id-input');
      const findButton = screen.getByTestId('find-similar-button');

      // Enter ADR ID
      await user.type(adrIdInput, 'adr-001');
      await user.click(findButton);

      // Should show loading state
      expect(screen.getByText('Finding...')).toBeInTheDocument();

      // Wait for similar ADRs
      await waitFor(() => {
        expect(screen.getByTestId('similar-adrs')).toBeInTheDocument();
      });

      // Verify similar ADRs are displayed
      const similarADRs = screen.getAllByTestId(/similar-adr-/);
      expect(similarADRs.length).toBeGreaterThan(0);
    });
  });

  describe('🔄 Complete User Journey Integration', () => {
    it('should complete full search-to-discovery journey', async () => {
      const TestApp = () => {
        const searchHook = useSemanticSearch();
        const [selectedPattern, setSelectedPattern] = React.useState<any>(null);

        return (
          <div>
            {/* Search Interface */}
            <div data-testid="search-section">
              <input
                data-testid="main-search-input"
                value={searchHook.searchState.query}
                onChange={(e) => searchHook.updateQuery(e.target.value)}
                placeholder="Search patterns, ADRs, and knowledge..."
              />
              <button
                data-testid="main-search-button"
                onClick={() => searchHook.performSearch(searchHook.searchState.query)}
              >
                Search
              </button>
            </div>

            {/* Loading State */}
            {searchHook.isSearching && (
              <div data-testid="search-loading">Searching...</div>
            )}

            {/* Search Results */}
            {searchHook.results && (
              <div data-testid="search-results-section">
                <h3>Search Results ({searchHook.totalResults} found)</h3>
                
                {/* Patterns Results */}
                {searchHook.results.results_by_type.patterns?.length > 0 && (
                  <div data-testid="patterns-section">
                    <h4>Patterns</h4>
                    {searchHook.results.results_by_type.patterns.map(pattern => (
                      <div 
                        key={pattern.id} 
                        data-testid={`result-pattern-${pattern.id}`}
                        className="cursor-pointer"
                        onClick={() => setSelectedPattern(pattern)}
                      >
                        <h5>{pattern.name}</h5>
                        <p>Similarity: {pattern.similarity}</p>
                        <p>Category: {pattern.category}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ADRs Results */}
                {searchHook.results.results_by_type.adrs?.length > 0 && (
                  <div data-testid="adrs-section">
                    <h4>ADRs</h4>
                    {searchHook.results.results_by_type.adrs.map(adr => (
                      <div key={adr.id} data-testid={`result-adr-${adr.id}`}>
                        <h5>{adr.title}</h5>
                        <p>Similarity: {adr.similarity}</p>
                        <p>Project: {adr.project_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pattern Detail View */}
            {selectedPattern && (
              <div data-testid="pattern-detail">
                <h3>Pattern Details: {selectedPattern.name}</h3>
                <p>Category: {selectedPattern.category}</p>
                <p>Effectiveness Score: {selectedPattern.effectiveness_score}</p>
                <p>Usage Count: {selectedPattern.usage_count}</p>
                <button
                  data-testid="apply-pattern-button"
                  onClick={() => {
                    // Simulate pattern application
                    alert(`Applied pattern: ${selectedPattern.name}`);
                  }}
                >
                  Apply This Pattern
                </button>
              </div>
            )}

            {/* Error Handling */}
            {searchHook.error && (
              <div data-testid="search-error" className="error">
                Error: {searchHook.error}
              </div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestApp />
        </QueryClientProvider>
      );

      // STEP 1: User enters search query
      const searchInput = screen.getByTestId('main-search-input');
      const searchButton = screen.getByTestId('main-search-button');

      await user.type(searchInput, 'microservices communication patterns');
      await user.click(searchButton);

      // STEP 2: Loading state should appear
      expect(screen.getByTestId('search-loading')).toBeInTheDocument();

      // STEP 3: Results should appear
      await waitFor(() => {
        expect(screen.getByTestId('search-results-section')).toBeInTheDocument();
      });

      // STEP 4: Should show both patterns and ADRs
      const resultsSection = screen.getByTestId('search-results-section');
      expect(resultsSection).toHaveTextContent('Search Results');

      // STEP 5: User can click on a pattern for details
      const patternElements = screen.getAllByTestId(/result-pattern-/);
      if (patternElements.length > 0) {
        await user.click(patternElements[0]);

        // STEP 6: Pattern details should appear
        await waitFor(() => {
          expect(screen.getByTestId('pattern-detail')).toBeInTheDocument();
        });

        // STEP 7: User can apply the pattern
        const applyButton = screen.getByTestId('apply-pattern-button');
        expect(applyButton).toBeInTheDocument();
      }
    });

    it('should handle network errors gracefully throughout journey', async () => {
      // Mock network failure
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      const TestApp = () => {
        const searchHook = useSemanticSearch();

        React.useEffect(() => {
          searchHook.performSearch('test query');
        }, []);

        return (
          <div>
            {searchHook.error && (
              <div data-testid="network-error">
                Network error occurred: {searchHook.error}
              </div>
            )}
            {searchHook.isSearching && (
              <div data-testid="still-loading">Still searching...</div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestApp />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('network-error')).toBeInTheDocument();
      });
    });
  });

  describe('♿ Accessibility and UX Integration', () => {
    it('should support keyboard navigation', async () => {
      const TestComponent = () => {
        const searchHook = useSemanticSearch();

        return (
          <div>
            <input
              data-testid="keyboard-search-input"
              value={searchHook.searchState.query}
              onChange={(e) => searchHook.updateQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchHook.performSearch(searchHook.searchState.query);
                }
              }}
            />
            {searchHook.results && (
              <div data-testid="keyboard-results">
                Results available
              </div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      const input = screen.getByTestId('keyboard-search-input');
      
      // Focus input and type
      input.focus();
      await user.type(input, 'accessibility test');
      
      // Press Enter to search
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('keyboard-results')).toBeInTheDocument();
      });
    });

    it('should provide proper ARIA labels and roles', async () => {
      const AccessibleSearchComponent = () => {
        const searchHook = useSemanticSearch();

        return (
          <div role="main" aria-label="Pattern and ADR Search">
            <label htmlFor="accessible-search">Search patterns and ADRs:</label>
            <input
              id="accessible-search"
              data-testid="accessible-search-input"
              value={searchHook.searchState.query}
              onChange={(e) => searchHook.updateQuery(e.target.value)}
              aria-describedby="search-help"
            />
            <div id="search-help">Enter keywords to search for patterns and ADRs</div>
            
            <button
              data-testid="accessible-search-button"
              onClick={() => searchHook.performSearch(searchHook.searchState.query)}
              aria-describedby="search-status"
            >
              Search
            </button>
            
            <div id="search-status" aria-live="polite">
              {searchHook.isSearching ? 'Searching...' : ''}
              {searchHook.results ? `Found ${searchHook.totalResults} results` : ''}
            </div>

            {searchHook.results && (
              <div role="region" aria-label="Search Results" data-testid="accessible-results">
                {searchHook.results.results_by_type.patterns?.map(pattern => (
                  <article key={pattern.id} aria-labelledby={`pattern-title-${pattern.id}`}>
                    <h3 id={`pattern-title-${pattern.id}`}>{pattern.name}</h3>
                    <p>Category: {pattern.category}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <AccessibleSearchComponent />
        </QueryClientProvider>
      );

      // Verify ARIA structure
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Pattern and ADR Search');
      expect(screen.getByLabelText('Search patterns and ADRs:')).toBeInTheDocument();
      expect(screen.getByText('Enter keywords to search for patterns and ADRs')).toBeInTheDocument();

      // Perform search to test results accessibility
      const input = screen.getByTestId('accessible-search-input');
      const button = screen.getByTestId('accessible-search-button');

      await user.type(input, 'accessibility patterns');
      await user.click(button);

      await waitFor(() => {
        const resultsRegion = screen.queryByRole('region');
        if (resultsRegion) {
          expect(resultsRegion).toHaveAttribute('aria-label', 'Search Results');
        }
      });
    });
  });

  describe('🎯 Cross-browser Compatibility', () => {
    it('should handle different fetch implementations', async () => {
      // Mock different fetch behaviors
      const originalFetch = global.fetch;
      
      // Test with minimal fetch response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          query: 'test',
          total_results: 1,
          results_by_type: { adrs: [], patterns: [] },
          timestamp: new Date().toISOString()
        })
      });

      const TestComponent = () => {
        const searchHook = useSemanticSearch();
        
        React.useEffect(() => {
          searchHook.performSearch('cross-browser test');
        }, []);

        return (
          <div>
            {searchHook.results && (
              <div data-testid="cross-browser-results">
                Query: {searchHook.results.query}
              </div>
            )}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('cross-browser-results')).toBeInTheDocument();
      });

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });
});