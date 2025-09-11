import { 
  Star, 
  TrendingUp, 
  User, 
  Calendar, 
  Tag, 
  ExternalLink, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn, formatRelativeTime, getCategoryColor, truncateText } from '@/lib/utils';
import type { PatternCardProps } from '@/types';

export default function PatternCard({
  pattern,
  onClick,
  showFullDescription = false,
  className,
}: PatternCardProps) {
  const handleClick = () => {
    onClick?.(pattern);
  };

  const getEffectivenessDisplay = (score?: number) => {
    if (!score) return null;
    
    const roundedScore = Math.round(score);
    const stars = Array.from({ length: 5 }, (_, i) => i < roundedScore);
    
    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {stars.map((filled, index) => (
            <Star
              key={index}
              className={cn(
                "h-3 w-3",
                filled ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {score.toFixed(1)}
        </span>
      </div>
    );
  };

  const getUsageIndicator = (count: number) => {
    if (count === 0) return { icon: AlertCircle, label: 'Unused', color: 'text-red-500' };
    if (count < 5) return { icon: Clock, label: 'Rarely used', color: 'text-yellow-500' };
    if (count < 20) return { icon: TrendingUp, label: 'Often used', color: 'text-blue-500' };
    return { icon: CheckCircle, label: 'Widely adopted', color: 'text-green-500' };
  };

  const description = showFullDescription 
    ? pattern.description 
    : truncateText(pattern.description || '', 120);

  const whenToUse = showFullDescription 
    ? pattern.when_to_use 
    : truncateText(pattern.when_to_use || '', 100);

  const usageInfo = getUsageIndicator(pattern.usage_count);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group p-4 border border-border rounded-lg bg-card hover:shadow-lg transition-all duration-200",
        "cursor-pointer hover:border-primary/30 hover:-translate-y-1",
        showFullDescription ? "flex space-x-4" : "flex flex-col space-y-3",
        className
      )}
    >
      {/* Icon and Header */}
      <div className={cn(
        "flex items-start space-x-3",
        showFullDescription ? "flex-shrink-0" : "w-full"
      )}>
        <div className="flex-shrink-0 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {pattern.name}
          </h3>
          
          {/* Category and Similarity */}
          <div className="flex items-center space-x-2 mt-1">
            <span className={cn(
              "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border",
              getCategoryColor(pattern.category)
            )}>
              {pattern.category}
            </span>
            
            {pattern.similarity !== undefined && pattern.similarity > 0 && (
              <span className="text-xs text-muted-foreground">
                {Math.round(pattern.similarity * 100)}% match
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle external link or detailed view
              console.log('View pattern details:', pattern.url);
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
            title="View details"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "space-y-3",
        showFullDescription ? "flex-1" : "w-full"
      )}>
        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {/* When to Use */}
        {whenToUse && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-foreground">When to use:</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {whenToUse}
            </p>
          </div>
        )}

        {/* Context Tags */}
        {pattern.context_tags && pattern.context_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pattern.context_tags.slice(0, showFullDescription ? 10 : 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
              >
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </span>
            ))}
            {pattern.context_tags.length > (showFullDescription ? 10 : 4) && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{pattern.context_tags.length - (showFullDescription ? 10 : 4)} more
              </span>
            )}
          </div>
        )}

        {/* Metrics */}
        <div className={cn(
          "flex items-center justify-between pt-2 border-t border-border",
          showFullDescription ? "flex-wrap gap-3" : "space-x-3"
        )}>
          {/* Left side - Effectiveness and Usage */}
          <div className="flex items-center space-x-4">
            {/* Effectiveness Score */}
            {pattern.effectiveness_score && (
              <div className="flex items-center space-x-1" title={`Effectiveness: ${pattern.effectiveness_score}/5`}>
                {getEffectivenessDisplay(pattern.effectiveness_score)}
              </div>
            )}

            {/* Usage Count */}
            <div className="flex items-center space-x-1" title={`Used ${pattern.usage_count} times`}>
              <usageInfo.icon className={cn("h-3 w-3", usageInfo.color)} />
              <span className="text-xs text-muted-foreground">
                {pattern.usage_count}
              </span>
            </div>
          </div>

          {/* Right side - Metadata */}
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            {/* Author */}
            {pattern.author_name && (
              <div className="flex items-center space-x-1" title={`Created by ${pattern.author_name}`}>
                <User className="h-3 w-3" />
                <span className="hidden sm:inline">{pattern.author_name}</span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center space-x-1" title={new Date(pattern.created_at).toLocaleDateString()}>
              <Calendar className="h-3 w-3" />
              <span>{formatRelativeTime(pattern.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Additional Actions for Full View */}
        {showFullDescription && (
          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle copy pattern
                navigator.clipboard.writeText(pattern.name);
              }}
              className="px-3 py-1.5 text-xs border border-border rounded hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Copy Name
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle view similar patterns
                console.log('View similar patterns to:', pattern.name);
              }}
              className="px-3 py-1.5 text-xs border border-border rounded hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Similar Patterns
            </button>

            {pattern.url && (
              <a
                href={pattern.url}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors inline-flex items-center space-x-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View Details</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Hover Effects */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}