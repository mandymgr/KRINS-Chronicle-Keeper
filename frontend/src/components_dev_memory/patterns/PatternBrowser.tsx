import React, { useState, useEffect } from 'react';
import { Grid, List, Search, Filter, TrendingUp, Star, Clock, Tag, ChevronDown } from 'lucide-react';
import { usePatternRecommendations } from '@/hooks/usePatternRecommendations';
import { cn, groupBy, getCategoryColor } from '@/lib/utils';
import PatternCard from './PatternCard';
import type { PatternRecommendation, SortOption } from '@/types';

interface PatternBrowserProps {
  className?: string;
  onPatternClick?: (pattern: PatternRecommendation) => void;
  enableSearch?: boolean;
  defaultView?: 'grid' | 'list';
}

const SORT_OPTIONS: { value: SortOption['field']; label: string; icon: React.ReactNode }[] = [
  { value: 'effectiveness_score', label: 'Effectiveness', icon: <Star className="h-4 w-4" /> },
  { value: 'usage_count', label: 'Usage', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'created_at', label: 'Date', icon: <Clock className="h-4 w-4" /> },
  { value: 'similarity', label: 'Similarity', icon: <Search className="h-4 w-4" /> },
];

export default function PatternBrowser({
  className,
  onPatternClick,
  enableSearch = true,
  defaultView = 'grid',
}: PatternBrowserProps) {
  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [sortBy, setSortBy] = useState<SortOption>({ field: 'effectiveness_score', direction: 'desc' });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Available categories and tags
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Use pattern recommendations hook
  const {
    recommendations,
    filters,
    isLoading,
    error,
    updateQuery,
    updateCategory,
    updateContextTags,
    updateMaxResults,
    getTrendingPatterns,
    getAvailableCategories,
    getAvailableContextTags,
    hasRecommendations,
  } = usePatternRecommendations({
    enableAutoRecommendations: true,
    defaultMaxResults: 50,
  });

  // Load initial data and available options
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categories, tags] = await Promise.all([
          getAvailableCategories(),
          getAvailableContextTags(),
        ]);
        
        setAvailableCategories(categories);
        setAvailableTags(tags);

        // Load trending patterns initially
        await getTrendingPatterns();
      } catch (error) {
        console.error('Failed to load initial pattern data:', error);
      }
    };

    loadInitialData();
  }, [getAvailableCategories, getAvailableContextTags, getTrendingPatterns]);

  // Handle search
  useEffect(() => {
    updateQuery(searchQuery);
  }, [searchQuery, updateQuery]);

  // Handle category filter
  useEffect(() => {
    updateCategory(selectedCategory || undefined);
  }, [selectedCategory, updateCategory]);

  // Handle tag filters
  useEffect(() => {
    updateContextTags(selectedTags);
  }, [selectedTags, updateContextTags]);

  // Sort and filter patterns
  const sortedPatterns = React.useMemo(() => {
    let filtered = [...recommendations];

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string | Date = 0;
      let bValue: number | string | Date = 0;

      switch (sortBy.field) {
        case 'effectiveness_score':
          aValue = a.effectiveness_score || 0;
          bValue = b.effectiveness_score || 0;
          break;
        case 'usage_count':
          aValue = a.usage_count || 0;
          bValue = b.usage_count || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'similarity':
          aValue = a.similarity || 0;
          bValue = b.similarity || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortBy.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortBy.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [recommendations, sortBy]);

  // Group patterns by category for better organization
  const groupedPatterns = React.useMemo(() => {
    if (!selectedCategory && viewMode === 'grid') {
      return groupBy(sortedPatterns, pattern => pattern.category || 'Uncategorized');
    }
    return { 'All Patterns': sortedPatterns };
  }, [sortedPatterns, selectedCategory, viewMode]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSortChange = (field: SortOption['field']) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pattern Library</h1>
          <p className="text-muted-foreground">
            Discover and explore proven design patterns and best practices
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'grid' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'list' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {enableSearch && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patterns by name, description, or context..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center space-x-2 px-3 py-1.5 border border-border rounded-lg text-sm transition-colors",
                showFilters 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Filter className="h-3 w-3" />
              <span>Filters</span>
              <ChevronDown className={cn("h-3 w-3 transition-transform", showFilters && "rotate-180")} />
            </button>

            {/* Sort Options */}
            <div className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    "flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors",
                    sortBy.field === option.value
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {option.icon}
                  <span>{option.label}</span>
                  {sortBy.field === option.value && (
                    <span className="ml-1">
                      {sortBy.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active Filters Count */}
            {(selectedCategory || selectedTags.length > 0 || searchQuery) && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {(selectedCategory ? 1 : 0) + selectedTags.length + (searchQuery ? 1 : 0)} filter(s) applied
                </span>
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-border rounded-lg bg-card">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Context Tags</label>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={cn(
                        "inline-flex items-center px-2 py-1 text-xs rounded-full border transition-colors",
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent hover:text-accent-foreground border-border"
                      )}
                    >
                      <Tag className="h-2 w-2 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Limit */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Results Limit</label>
                <select
                  value={filters.maxResults}
                  onChange={(e) => updateMaxResults(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
                >
                  <option value={20}>20 results</option>
                  <option value={50}>50 results</option>
                  <option value={100}>100 results</option>
                  <option value={200}>200 results</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      {hasRecommendations && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {sortedPatterns.length} pattern{sortedPatterns.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="p-4 border border-border rounded-lg">
              <div className="space-y-3">
                <div className="w-3/4 h-4 bg-muted rounded loading-skeleton" />
                <div className="w-full h-3 bg-muted rounded loading-skeleton" />
                <div className="w-2/3 h-3 bg-muted rounded loading-skeleton" />
                <div className="flex space-x-2">
                  <div className="w-12 h-6 bg-muted rounded-full loading-skeleton" />
                  <div className="w-16 h-6 bg-muted rounded-full loading-skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            Failed to load patterns: {error}
          </p>
        </div>
      )}

      {/* Pattern Results */}
      {!isLoading && !error && hasRecommendations && (
        <div className="space-y-8">
          {Object.entries(groupedPatterns).map(([categoryName, patterns]) => (
            <div key={categoryName} className="space-y-4">
              {Object.keys(groupedPatterns).length > 1 && (
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold">{categoryName}</h2>
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full border",
                    getCategoryColor(categoryName)
                  )}>
                    {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                  : "space-y-3"
              )}>
                {patterns.map((pattern) => (
                  <PatternCard
                    key={pattern.id}
                    pattern={pattern}
                    onClick={onPatternClick}
                    showFullDescription={viewMode === 'list'}
                    className={cn(
                      "pattern-card",
                      viewMode === 'list' && "flex-row"
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && !hasRecommendations && (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-lg">No patterns found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery || selectedCategory || selectedTags.length > 0
                ? "Try adjusting your search criteria or filters to find patterns."
                : "No patterns are available in the system yet."}
            </p>
          </div>
          {(searchQuery || selectedCategory || selectedTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}