import { Filter, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchFilters as SearchFiltersType } from '@/types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: Partial<SearchFiltersType>) => void;
  className?: string;
}

const DEFAULT_FILTERS: SearchFiltersType = {
  contentTypes: ['adrs', 'patterns', 'knowledge'],
  similarityThreshold: 0.7,
  maxResults: 20,
};

export default function SearchFilters({
  filters,
  onFiltersChange,
  className,
}: SearchFiltersProps) {
  const handleContentTypeToggle = (type: 'adrs' | 'patterns' | 'knowledge') => {
    const newContentTypes = filters.contentTypes.includes(type)
      ? filters.contentTypes.filter(t => t !== type)
      : [...filters.contentTypes, type];
    
    onFiltersChange({ contentTypes: newContentTypes });
  };

  const handleSimilarityThresholdChange = (value: number) => {
    onFiltersChange({ similarityThreshold: value });
  };

  const handleMaxResultsChange = (value: number) => {
    onFiltersChange({ maxResults: value });
  };

  const handleDateRangeChange = (range: { start: Date; end: Date } | undefined) => {
    onFiltersChange({ dateRange: range });
  };

  const resetFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const hasNonDefaultFilters = () => {
    return (
      filters.similarityThreshold !== DEFAULT_FILTERS.similarityThreshold ||
      filters.maxResults !== DEFAULT_FILTERS.maxResults ||
      filters.contentTypes.length !== DEFAULT_FILTERS.contentTypes.length ||
      !filters.contentTypes.every(type => DEFAULT_FILTERS.contentTypes.includes(type)) ||
      filters.categories?.length ||
      filters.dateRange
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Search Filters</h3>
        </div>
        
        {hasNonDefaultFilters() && (
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Content Types */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Content Types
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'adrs' as const, label: 'ADRs', description: 'Architecture Decision Records' },
            { key: 'patterns' as const, label: 'Patterns', description: 'Design Patterns' },
            { key: 'knowledge' as const, label: 'Knowledge', description: 'Knowledge Articles' },
          ].map(({ key, label, description }) => (
            <button
              key={key}
              onClick={() => handleContentTypeToggle(key)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors",
                filters.contentTypes.includes(key)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent hover:text-accent-foreground border-border"
              )}
              title={description}
            >
              <span>{label}</span>
              {!filters.contentTypes.includes(key) && (
                <X className="h-3 w-3 opacity-50" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Similarity Threshold */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Similarity Threshold
          </label>
          <span className="text-sm text-muted-foreground">
            {Math.round(filters.similarityThreshold * 100)}%
          </span>
        </div>
        <div className="space-y-1">
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.1"
            value={filters.similarityThreshold}
            onChange={(e) => handleSimilarityThresholdChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>30% (Loose)</span>
            <span>70% (Balanced)</span>
            <span>100% (Exact)</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Higher values return more precise matches, lower values return broader results.
        </p>
      </div>

      {/* Max Results */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Maximum Results
        </label>
        <select
          value={filters.maxResults}
          onChange={(e) => handleMaxResultsChange(parseInt(e.target.value))}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value={5}>5 results</option>
          <option value={10}>10 results</option>
          <option value={20}>20 results</option>
          <option value={50}>50 results</option>
          <option value={100}>100 results</option>
        </select>
      </div>

      {/* Categories Filter (if available) */}
      {filters.categories && filters.categories.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Categories
          </label>
          <div className="flex flex-wrap gap-1">
            {filters.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
              >
                <span>{category}</span>
                <button
                  onClick={() => {
                    const newCategories = filters.categories?.filter(c => c !== category);
                    onFiltersChange({ categories: newCategories });
                  }}
                  className="hover:bg-secondary-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-2 w-2" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      {filters.dateRange && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Date Range
            </label>
            <button
              onClick={() => handleDateRangeChange(undefined)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">From</label>
              <input
                type="date"
                value={filters.dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    handleDateRangeChange({
                      start: new Date(e.target.value),
                      end: filters.dateRange?.end || new Date(),
                    });
                  }
                }}
                className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">To</label>
              <input
                type="date"
                value={filters.dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    handleDateRangeChange({
                      start: filters.dateRange?.start || new Date(),
                      end: new Date(e.target.value),
                    });
                  }
                }}
                className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      )}

      {/* Applied Filters Summary */}
      {hasNonDefaultFilters() && (
        <div className="pt-2 border-t border-border">
          <div className="flex flex-wrap gap-1">
            {filters.similarityThreshold !== DEFAULT_FILTERS.similarityThreshold && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Similarity: {Math.round(filters.similarityThreshold * 100)}%
              </span>
            )}
            {filters.maxResults !== DEFAULT_FILTERS.maxResults && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Max: {filters.maxResults} results
              </span>
            )}
            {filters.contentTypes.length !== DEFAULT_FILTERS.contentTypes.length && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {filters.contentTypes.length} content type{filters.contentTypes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}