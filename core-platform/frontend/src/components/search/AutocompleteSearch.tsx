import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Clock,
  Sparkles,
  TrendingUp,
  FileText,
  Lightbulb,
  User,
  Tag,
  ArrowRight,
  X,
  Loader2,
  Command,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/utils/apiClient';
import { Button } from '@/components/ui/Button';

interface Suggestion {
  id: string;
  type: 'query' | 'pattern' | 'adr' | 'tag' | 'recent';
  value: string;
  label: string;
  description?: string;
  metadata?: {
    category?: string;
    effectiveness_score?: number;
    usage_count?: number;
    author?: string;
  };
}

interface AutocompleteSearchProps {
  placeholder?: string;
  className?: string;
  onSelect?: (suggestion: Suggestion) => void;
  onSearch?: (query: string) => void;
  enableRecentQueries?: boolean;
  maxSuggestions?: number;
  debounceMs?: number;
  autoFocus?: boolean;
}

const SUGGESTION_TYPES = {
  query: {
    icon: Search,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    label: 'Search'
  },
  pattern: {
    icon: Lightbulb,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    label: 'Pattern'
  },
  adr: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    label: 'ADR'
  },
  tag: {
    icon: Tag,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    label: 'Tag'
  },
  recent: {
    icon: Clock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    label: 'Recent'
  }
};

export default function AutocompleteSearch({
  placeholder = "Search patterns, ADRs, and knowledge...",
  className,
  onSelect,
  onSearch,
  enableRecentQueries = true,
  maxSuggestions = 8,
  debounceMs = 200,
  autoFocus = false,
}: AutocompleteSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent queries from localStorage
  useEffect(() => {
    if (enableRecentQueries) {
      try {
        const stored = localStorage.getItem('autocomplete-recent-queries');
        if (stored) {
          setRecentQueries(JSON.parse(stored).slice(0, 5));
        }
      } catch (error) {
        console.warn('Failed to load recent queries:', error);
      }
    }
  }, [enableRecentQueries]);

  // Save recent queries to localStorage
  const saveRecentQuery = useCallback((queryText: string) => {
    if (!enableRecentQueries || !queryText.trim()) return;

    setRecentQueries(prev => {
      const newQueries = [queryText, ...prev.filter(q => q !== queryText)].slice(0, 5);
      try {
        localStorage.setItem('autocomplete-recent-queries', JSON.stringify(newQueries));
      } catch (error) {
        console.warn('Failed to save recent queries:', error);
      }
      return newQueries;
    });
  }, [enableRecentQueries]);

  // Fetch suggestions from the API
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Get semantic search suggestions
      const results = await apiClient.semanticSearch({
        query: searchQuery,
        max_results: maxSuggestions,
        similarity_threshold: 0.3
      });

      const newSuggestions: Suggestion[] = [];

      // Add pattern suggestions
      if (results.results_by_type.patterns) {
        results.results_by_type.patterns.slice(0, 3).forEach((pattern, index) => {
          newSuggestions.push({
            id: `pattern-${pattern.id || index}`,
            type: 'pattern',
            value: pattern.name,
            label: pattern.name,
            description: pattern.description?.slice(0, 80) + '...',
            metadata: {
              category: pattern.category,
              effectiveness_score: pattern.effectiveness_score,
              usage_count: pattern.usage_count
            }
          });
        });
      }

      // Add ADR suggestions
      if (results.results_by_type.adrs) {
        results.results_by_type.adrs.slice(0, 3).forEach((adr, index) => {
          newSuggestions.push({
            id: `adr-${adr.id || index}`,
            type: 'adr',
            value: adr.title,
            label: adr.title,
            description: adr.context?.slice(0, 80) + '...',
            metadata: {
              author: adr.author_name
            }
          });
        });
      }

      // Add query suggestions (smart completions)
      const querySuggestions = await apiClient.getSearchSuggestions(searchQuery, 2);
      querySuggestions.forEach((suggestion, index) => {
        if (suggestion !== searchQuery) {
          newSuggestions.push({
            id: `query-${index}`,
            type: 'query',
            value: suggestion,
            label: suggestion
          });
        }
      });

      setSuggestions(newSuggestions.slice(0, maxSuggestions));
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [maxSuggestions]);

  // Debounced suggestion fetching
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, debounceMs);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions, debounceMs]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalSuggestions = suggestions.length + (query.length === 0 ? recentQueries.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < totalSuggestions - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : totalSuggestions - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const allItems = query.length === 0 
            ? [...recentQueries.map(q => ({ value: q, type: 'recent' as const })), ...suggestions]
            : suggestions;
          
          const selected = allItems[selectedIndex];
          if (selected) {
            handleSelection(selected.value, selected.type || 'query');
          }
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion selection
  const handleSelection = (value: string, type: string) => {
    setQuery(value);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    saveRecentQuery(value);
    
    const suggestion: Suggestion = {
      id: `selected-${Date.now()}`,
      type: type as Suggestion['type'],
      value,
      label: value
    };
    
    onSelect?.(suggestion);
  };

  // Handle search execution
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsOpen(false);
    setSelectedIndex(-1);
    saveRecentQuery(searchQuery);
    onSearch?.(searchQuery);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay closing to allow suggestion clicks
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 200);
  };

  // Clear input
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const SuggestionItem = ({ suggestion, index, isSelected }: { 
    suggestion: Suggestion; 
    index: number; 
    isSelected: boolean;
  }) => {
    const typeConfig = SUGGESTION_TYPES[suggestion.type];
    const Icon = typeConfig.icon;

    return (
      <button
        className={cn(
          "w-full flex items-start space-x-3 px-4 py-3 text-left hover:bg-accent",
          "transition-colors rounded-lg",
          isSelected && "bg-accent"
        )}
        onClick={() => handleSelection(suggestion.value, suggestion.type)}
        onMouseEnter={() => setSelectedIndex(index)}
      >
        <div className={cn(
          "flex-shrink-0 p-1.5 rounded",
          typeConfig.bgColor
        )}>
          <Icon className={cn("h-3 w-3", typeConfig.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-foreground truncate">
              {suggestion.label}
            </span>
            {suggestion.metadata?.effectiveness_score && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{suggestion.metadata.effectiveness_score}</span>
              </div>
            )}
          </div>
          {suggestion.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {suggestion.description}
            </p>
          )}
          <div className="flex items-center space-x-2 mt-1">
            <span className={cn("text-xs font-medium", typeConfig.color)}>
              {typeConfig.label}
            </span>
            {suggestion.metadata?.category && (
              <span className="text-xs text-muted-foreground">
                • {suggestion.metadata.category}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  const showRecentQueries = query.length === 0 && recentQueries.length > 0 && enableRecentQueries;
  const totalSuggestions = suggestions.length + (showRecentQueries ? recentQueries.length : 0);

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10 py-3 text-sm border border-border rounded-lg",
            "bg-background text-foreground placeholder-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200"
          )}
        />
        
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (totalSuggestions > 0 || isLoading) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {isLoading && suggestions.length === 0 && (
            <div className="p-4 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Searching...</p>
            </div>
          )}

          {/* Recent Queries */}
          {showRecentQueries && (
            <div className="p-2 border-b border-border">
              <div className="flex items-center space-x-2 px-2 py-1 text-xs text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                <span>Recent searches</span>
              </div>
              {recentQueries.map((recentQuery, index) => (
                <button
                  key={`recent-${index}`}
                  className={cn(
                    "w-full flex items-center space-x-2 px-2 py-2 text-left text-sm rounded",
                    "hover:bg-accent transition-colors",
                    selectedIndex === index && "bg-accent"
                  )}
                  onClick={() => handleSelection(recentQuery, 'recent')}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{recentQuery}</span>
                </button>
              ))}
            </div>
          )}

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              {!showRecentQueries && (
                <div className="flex items-center space-x-2 px-2 py-1 text-xs text-muted-foreground mb-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Smart suggestions</span>
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={suggestion.id}
                  suggestion={suggestion}
                  index={showRecentQueries ? index + recentQueries.length : index}
                  isSelected={selectedIndex === (showRecentQueries ? index + recentQueries.length : index)}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="p-2 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Command className="h-3 w-3" />
                <span>Use ↑↓ to navigate, Enter to select</span>
              </div>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}