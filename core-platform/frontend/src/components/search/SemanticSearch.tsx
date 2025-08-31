import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Clock, X, Filter, Sparkles } from 'lucide-react';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { cn, formatKeyboardShortcut, isMetaKey } from '@/lib/utils';
import SearchResults from './SearchResults';
import SearchFilters from './SearchFilters';

interface SemanticSearchProps {
  className?: string;
  autoFocus?: boolean;
  enableAutoSearch?: boolean;
  placeholder?: string;
  onResultClick?: (result: any) => void;
}

export default function SemanticSearch({
  className,
  autoFocus = false,
  enableAutoSearch = true,
  placeholder = "Search ADRs, patterns, and knowledge...",
  onResultClick,
}: SemanticSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    searchState,
    filters,
    performSearch,
    quickSearch,
    updateQuery,
    updateFilters,
    clearResults,
    clearRecentQueries,
    isSearching,
    results,
    error,
    recentQueries,
    hasResults,
    totalResults,
  } = useSemanticSearch({
    enableAutoSearch,
    debounceMs: 300,
    maxRecentQueries: 10,
  });

  // Auto-focus input on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // CMD/Ctrl + K to focus search
      if (isMetaKey(event) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
      
      // Escape to clear search
      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        if (searchState.query) {
          updateQuery('');
        } else {
          inputRef.current?.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchState.query, updateQuery]);

  // Handle input changes and intelligent suggestions
  useEffect(() => {
    const getIntelligentSuggestions = async () => {
      if (searchState.query.length >= 1) {
        try {
          // 🚀 FRONTEND SPECIALIST: Enhanced integration with Backend Specialist's intelligent autocomplete
          const response = await fetch(`http://localhost:3003/api/search/autocomplete/intelligent?q=${encodeURIComponent(searchState.query)}&include_semantic=true&include_trending=true&include_history=true&limit=8`);
          const data = await response.json();
          
          if (data.success && data.suggestions) {
            // Transform Backend Specialist's suggestions into UI-ready format
            const intelligentSuggestions = data.suggestions.map((suggestion: any) => ({
              text: suggestion.text,
              type: suggestion.type,
              matchType: suggestion.match_type,
              score: suggestion.score,
              sources: suggestion.sources,
              icon: suggestion.type === 'adr' ? '📋' : suggestion.type === 'pattern' ? '🎨' : '🔍'
            }));
            
            setSuggestions(intelligentSuggestions.map((s: any) => s.text));
            setShowSuggestions(true);
          } else {
            // Fallback to original quickSearch
            const searchSuggestions = await quickSearch(searchState.query);
            setSuggestions(searchSuggestions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.warn('🎨 Frontend Specialist: Intelligent autocomplete failed, using fallback:', error);
          // Fallback to original system
          const searchSuggestions = await quickSearch(searchState.query);
          setSuggestions(searchSuggestions);
          setShowSuggestions(true);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setActiveSuggestionIndex(-1);
    };

    const timeoutId = setTimeout(getIntelligentSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [searchState.query, quickSearch]);

  const handleInputChange = (value: string) => {
    updateQuery(value);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === 'Enter' && searchState.query.trim()) {
        performSearch(searchState.query);
        setShowSuggestions(false);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        event.preventDefault();
        if (activeSuggestionIndex >= 0) {
          const suggestion = suggestions[activeSuggestionIndex];
          updateQuery(suggestion);
          performSearch(suggestion);
        } else if (searchState.query.trim()) {
          performSearch(searchState.query);
        }
        setShowSuggestions(false);
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    updateQuery(suggestion);
    performSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRecentQueryClick = (query: string) => {
    updateQuery(query);
    performSearch(query);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    updateQuery('');
    clearResults();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };


  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={searchState.query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={(e) => {
              // Delay hiding suggestions to allow clicks
              setTimeout(() => {
                if (!e.currentTarget.contains(document.activeElement)) {
                  setShowSuggestions(false);
                }
              }, 200);
            }}
            placeholder={placeholder}
            className={cn(
              "w-full pl-10 pr-32 py-3 text-sm border border-border rounded-lg",
              "bg-background text-foreground placeholder-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-all duration-200",
              isSearching && "search-glow"
            )}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            {searchState.query && (
              <button
                onClick={handleClear}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors",
                showFilters && "bg-muted text-foreground"
              )}
              title="Search filters"
            >
              <Filter className="h-4 w-4" />
            </button>
            
            <kbd className="kbd hidden sm:inline-flex">
              {formatKeyboardShortcut({ metaKey: true, key: 'K' })}
            </kbd>
          </div>
        </div>

        {/* Enhanced Intelligent Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || recentQueries.length > 0) && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg">
            {/* Live intelligent suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  <span>🚀 AI-Powered Suggestions</span>
                  <div className="ml-auto flex space-x-1">
                    <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Backend Specialist</span>
                  </div>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded flex items-center space-x-2",
                      "hover:bg-accent hover:text-accent-foreground",
                      "transition-colors",
                      index === activeSuggestionIndex && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span className="text-lg">
                      {suggestion.includes('pattern') || suggestion.includes('Pattern') ? '🎨' :
                       suggestion.includes('ADR') || suggestion.includes('adr') ? '📋' : '🔍'}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium">{suggestion}</div>
                      <div className="text-xs text-muted-foreground">AI-Enhanced • Backend Intelligence</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Recent queries */}
            {recentQueries.length > 0 && !searchState.query && (
              <div className="p-2 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>Recent searches</span>
                  </div>
                  <button
                    onClick={clearRecentQueries}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                {recentQueries.slice(0, 5).map((query) => (
                  <button
                    key={query}
                    onClick={() => handleRecentQueryClick(query)}
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Filters */}
      {showFilters && (
        <SearchFilters
          filters={filters}
          onFiltersChange={updateFilters}
          className="border border-border rounded-lg p-4"
        />
      )}

      {/* Search Status */}
      {hasResults && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Found {totalResults} result{totalResults !== 1 ? 's' : ''} 
            {searchState.query && (
              <span> for "{searchState.query}"</span>
            )}
          </span>
          
          {results && (
            <div className="flex items-center space-x-4">
              <span className="text-xs">
                {Math.round((results.results_by_type.adrs?.length || 0) + 
                           (results.results_by_type.patterns?.length || 0) + 
                           (results.results_by_type.knowledge?.length || 0))} results
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            Search failed: {error}
          </p>
        </div>
      )}

      {/* Search Results */}
      {(hasResults || isSearching) && (
        <SearchResults
          results={results || null}
          isLoading={isSearching}
          error={error}
          onResultClick={onResultClick}
          query={searchState.query}
        />
      )}

      {/* Empty State */}
      {!hasResults && !isSearching && !error && searchState.query.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Search Dev Memory OS</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Use natural language to search across ADRs, patterns, and knowledge artifacts. 
              Try searching for concepts, problems, or solutions.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-muted rounded-full text-muted-foreground">
              "authentication patterns"
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-muted-foreground">
              "database decisions"
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-muted-foreground">
              "error handling"
            </span>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!hasResults && !isSearching && !error && searchState.query.length > 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-lg">No results found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your search terms or filters. You can also search with different keywords 
              or check if the content you're looking for exists in the system.
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Adjust Filters
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}