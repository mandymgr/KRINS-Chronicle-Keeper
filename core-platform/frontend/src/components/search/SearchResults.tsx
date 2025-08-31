import React from 'react';
import { FileText, Lightbulb, BookOpen, ExternalLink, Calendar, User, Hash, TrendingUp } from 'lucide-react';
import { cn, formatRelativeTime, formatSimilarityScore, getSimilarityColorClass, truncateText, highlightSearchTerms } from '@/lib/utils';
import type { SemanticSearchResponse, ADRResult, PatternResult, KnowledgeResult } from '@/types';

interface SearchResultsProps {
  results: SemanticSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  onResultClick?: (result: ADRResult | PatternResult | KnowledgeResult) => void;
  query: string;
  className?: string;
}

interface ResultCardProps {
  result: ADRResult | PatternResult | KnowledgeResult;
  query: string;
  onClick?: (result: ADRResult | PatternResult | KnowledgeResult) => void;
}

function ResultCard({ result, query, onClick }: ResultCardProps) {
  const handleClick = () => {
    onClick?.(result);
  };

  const getResultIcon = () => {
    switch (result.type) {
      case 'adr':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'pattern':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'knowledge':
        return <BookOpen className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTitle = () => {
    if (result.type === 'adr') {
      return (result as ADRResult).title;
    } else if (result.type === 'pattern') {
      return (result as PatternResult).name;
    } else {
      return (result as KnowledgeResult).title;
    }
  };

  const getDescription = () => {
    if (result.type === 'adr') {
      return (result as ADRResult).problem_statement;
    } else if (result.type === 'pattern') {
      return (result as PatternResult).description;
    }
    return null;
  };

  const getMetadata = () => {
    const metadata: Array<{ label: string; value: string; icon: React.ReactNode }> = [];

    if (result.type === 'adr') {
      const adr = result as ADRResult;
      if (adr.project_name) {
        metadata.push({
          label: 'Project',
          value: adr.project_name,
          icon: <Hash className="h-3 w-3" />
        });
      }
      if (adr.status) {
        metadata.push({
          label: 'Status',
          value: adr.status,
          icon: <TrendingUp className="h-3 w-3" />
        });
      }
    } else if (result.type === 'pattern') {
      const pattern = result as PatternResult;
      if (pattern.category) {
        metadata.push({
          label: 'Category',
          value: pattern.category,
          icon: <Hash className="h-3 w-3" />
        });
      }
      if (pattern.effectiveness_score) {
        metadata.push({
          label: 'Effectiveness',
          value: `${pattern.effectiveness_score}/5`,
          icon: <TrendingUp className="h-3 w-3" />
        });
      }
      if (pattern.author_name) {
        metadata.push({
          label: 'Author',
          value: pattern.author_name,
          icon: <User className="h-3 w-3" />
        });
      }
    }

    return metadata;
  };

  const title = getTitle();
  const description = getDescription();
  const metadata = getMetadata();

  return (
    <div
      className={cn(
        "group p-4 border border-border rounded-lg hover:shadow-md transition-all duration-200",
        "bg-card hover:bg-accent/50 cursor-pointer",
        onClick && "hover:-translate-y-0.5"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getResultIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 
              className="text-sm font-medium text-card-foreground group-hover:text-accent-foreground line-clamp-2"
              dangerouslySetInnerHTML={{ 
                __html: highlightSearchTerms(title, query) 
              }}
            />
            
            {/* Similarity Score */}
            <div className={cn(
              "flex-shrink-0 ml-2 px-2 py-1 text-xs font-medium rounded-full border",
              getSimilarityColorClass(result.similarity)
            )}>
              {formatSimilarityScore(result.similarity)}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p 
              className="text-sm text-muted-foreground mb-2 line-clamp-2"
              dangerouslySetInnerHTML={{ 
                __html: highlightSearchTerms(truncateText(description, 150), query) 
              }}
            />
          )}

          {/* Metadata */}
          {metadata.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {metadata.map((meta, index) => (
                <div key={index} className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {meta.icon}
                  <span>{meta.label}:</span>
                  <span className="font-medium">{meta.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatRelativeTime(result.created_at)}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-muted-foreground group-hover:text-accent-foreground">
              <span>View details</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="p-4 border border-border rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-muted rounded loading-skeleton" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="w-3/4 h-4 bg-muted rounded loading-skeleton" />
                <div className="w-12 h-6 bg-muted rounded-full loading-skeleton" />
              </div>
              <div className="w-full h-3 bg-muted rounded loading-skeleton" />
              <div className="w-2/3 h-3 bg-muted rounded loading-skeleton" />
              <div className="flex justify-between items-center pt-1">
                <div className="w-20 h-3 bg-muted rounded loading-skeleton" />
                <div className="w-16 h-3 bg-muted rounded loading-skeleton" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultsSection({ 
  title, 
  results, 
  icon, 
  query, 
  onResultClick 
}: {
  title: string;
  results: (ADRResult | PatternResult | KnowledgeResult)[];
  icon: React.ReactNode;
  query: string;
  onResultClick?: (result: ADRResult | PatternResult | KnowledgeResult) => void;
}) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 pb-2 border-b border-border">
        {icon}
        <h2 className="font-medium text-sm">
          {title} ({results.length})
        </h2>
      </div>
      <div className="space-y-3">
        {results.map((result) => (
          <ResultCard
            key={result.id}
            result={result}
            query={query}
            onClick={onResultClick}
          />
        ))}
      </div>
    </div>
  );
}

export default function SearchResults({
  results,
  isLoading,
  error,
  onResultClick,
  query,
  className,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4 bg-destructive/10 border border-destructive/20 rounded-lg", className)}>
        <p className="text-sm text-destructive">
          Failed to load search results: {error}
        </p>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { results_by_type } = results;

  return (
    <div className={cn("space-y-6", className)}>
      {/* ADRs */}
      <ResultsSection
        title="Architecture Decision Records"
        results={results_by_type.adrs || []}
        icon={<FileText className="h-4 w-4 text-blue-500" />}
        query={query}
        onResultClick={onResultClick}
      />

      {/* Patterns */}
      <ResultsSection
        title="Patterns"
        results={results_by_type.patterns || []}
        icon={<Lightbulb className="h-4 w-4 text-yellow-500" />}
        query={query}
        onResultClick={onResultClick}
      />

      {/* Knowledge */}
      <ResultsSection
        title="Knowledge Articles"
        results={results_by_type.knowledge || []}
        icon={<BookOpen className="h-4 w-4 text-green-500" />}
        query={query}
        onResultClick={onResultClick}
      />

      {/* No results message */}
      {results_by_type.adrs?.length === 0 && 
       results_by_type.patterns?.length === 0 && 
       results_by_type.knowledge?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No results found for your search query.
          </p>
        </div>
      )}
    </div>
  );
}