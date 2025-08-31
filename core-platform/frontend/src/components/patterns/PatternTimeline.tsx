import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  GitCommit,
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  Activity,
  Zap,
  Award,
  Eye,
  FileText,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface TimelineEvent {
  id: string;
  type: 'pattern_added' | 'pattern_updated' | 'adr_linked' | 'usage_spike' | 'effectiveness_change';
  timestamp: string;
  title: string;
  description: string;
  pattern_id: string;
  pattern_name: string;
  metadata: {
    author?: string;
    version?: string;
    effectiveness_before?: number;
    effectiveness_after?: number;
    usage_count?: number;
    linked_adr?: string;
    impact_level: 'low' | 'medium' | 'high';
  };
}

interface PatternEvolution {
  pattern_id: string;
  pattern_name: string;
  category: string;
  timeline_events: TimelineEvent[];
  effectiveness_trend: {
    timestamp: string;
    score: number;
  }[];
  usage_trend: {
    timestamp: string;
    count: number;
  }[];
}

const EVENT_TYPES = {
  pattern_added: {
    icon: Plus,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    title: 'Pattern Added'
  },
  pattern_updated: {
    icon: GitCommit,
    color: 'text-blue-500', 
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    title: 'Pattern Updated'
  },
  adr_linked: {
    icon: FileText,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
    title: 'ADR Linked'
  },
  usage_spike: {
    icon: TrendingUp,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-800',
    title: 'Usage Spike'
  },
  effectiveness_change: {
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    title: 'Effectiveness Change'
  }
};

const MOCK_TIMELINE_DATA: PatternEvolution[] = [
  {
    pattern_id: '1',
    pattern_name: 'Repository Pattern',
    category: 'Data Access',
    timeline_events: [
      {
        id: 'evt-1',
        type: 'pattern_added',
        timestamp: '2024-01-15T08:00:00Z',
        title: 'Repository Pattern Added',
        description: 'Initial implementation for data access abstraction',
        pattern_id: '1',
        pattern_name: 'Repository Pattern',
        metadata: {
          author: 'Backend Team',
          version: '1.0.0',
          impact_level: 'high'
        }
      },
      {
        id: 'evt-2',
        type: 'adr_linked',
        timestamp: '2024-02-10T14:30:00Z',
        title: 'ADR-005 Linked',
        description: 'Database abstraction decision references this pattern',
        pattern_id: '1',
        pattern_name: 'Repository Pattern',
        metadata: {
          linked_adr: 'ADR-005',
          impact_level: 'medium'
        }
      },
      {
        id: 'evt-3',
        type: 'usage_spike',
        timestamp: '2024-06-20T09:15:00Z',
        title: 'Usage Increased 40%',
        description: 'Multiple teams adopted after microservices migration',
        pattern_id: '1',
        pattern_name: 'Repository Pattern',
        metadata: {
          usage_count: 156,
          impact_level: 'high'
        }
      },
      {
        id: 'evt-4',
        type: 'effectiveness_change',
        timestamp: '2025-01-10T11:00:00Z',
        title: 'Effectiveness Score Updated',
        description: 'Score improved from 4.5 to 4.8 based on recent feedback',
        pattern_id: '1',
        pattern_name: 'Repository Pattern',
        metadata: {
          effectiveness_before: 4.5,
          effectiveness_after: 4.8,
          impact_level: 'medium'
        }
      }
    ],
    effectiveness_trend: [
      { timestamp: '2024-01-15T00:00:00Z', score: 4.2 },
      { timestamp: '2024-04-15T00:00:00Z', score: 4.5 },
      { timestamp: '2024-08-15T00:00:00Z', score: 4.6 },
      { timestamp: '2025-01-10T00:00:00Z', score: 4.8 }
    ],
    usage_trend: [
      { timestamp: '2024-01-15T00:00:00Z', count: 12 },
      { timestamp: '2024-04-15T00:00:00Z', count: 45 },
      { timestamp: '2024-08-15T00:00:00Z', count: 98 },
      { timestamp: '2025-01-10T00:00:00Z', count: 156 }
    ]
  },
  {
    pattern_id: '2',
    pattern_name: 'Circuit Breaker',
    category: 'Resilience',
    timeline_events: [
      {
        id: 'evt-5',
        type: 'pattern_added',
        timestamp: '2024-03-10T12:00:00Z',
        title: 'Circuit Breaker Pattern Added',
        description: 'Implemented for microservice resilience',
        pattern_id: '2',
        pattern_name: 'Circuit Breaker',
        metadata: {
          author: 'Platform Team',
          version: '1.0.0',
          impact_level: 'high'
        }
      },
      {
        id: 'evt-6',
        type: 'pattern_updated',
        timestamp: '2024-07-15T16:20:00Z',
        title: 'Configuration Enhanced',
        description: 'Added adaptive timeout and failure threshold tuning',
        pattern_id: '2',
        pattern_name: 'Circuit Breaker',
        metadata: {
          version: '1.2.0',
          impact_level: 'medium'
        }
      }
    ],
    effectiveness_trend: [
      { timestamp: '2024-03-10T00:00:00Z', score: 4.6 },
      { timestamp: '2024-07-15T00:00:00Z', score: 4.9 }
    ],
    usage_trend: [
      { timestamp: '2024-03-10T00:00:00Z', count: 8 },
      { timestamp: '2024-07-15T00:00:00Z', count: 89 }
    ]
  }
];

export default function PatternTimeline() {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('6m');
  const [viewMode, setViewMode] = useState<'timeline' | 'trends'>('timeline');
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Flatten all events and sort by timestamp
  const allEvents = MOCK_TIMELINE_DATA
    .flatMap(pattern => pattern.timeline_events)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  useEffect(() => {
    setFilteredEvents(selectedPattern 
      ? allEvents.filter(event => event.pattern_id === selectedPattern)
      : allEvents.slice(0, 10) // Show latest 10 events when no pattern selected
    );
  }, [selectedPattern]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const EventCard = ({ event }: { event: TimelineEvent }) => {
    const eventConfig = EVENT_TYPES[event.type];
    const EventIcon = eventConfig.icon;

    return (
      <div className="flex space-x-4 group">
        <div className="flex flex-col items-center">
          <div className={cn(
            "p-2 rounded-full border-2",
            eventConfig.bgColor,
            eventConfig.borderColor
          )}>
            <EventIcon className={cn("h-4 w-4", eventConfig.color)} />
          </div>
          <div className="w-px h-8 bg-border" />
        </div>
        
        <div className="flex-1 pb-8">
          <div className={cn(
            "bg-card border rounded-lg p-4 transition-all duration-200",
            "hover:shadow-md hover:scale-[1.01] group-hover:border-primary/30"
          )}>
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={cn("text-xs font-medium uppercase tracking-wider", eventConfig.color)}>
                    {eventConfig.title}
                  </span>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    event.metadata.impact_level === 'high' && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                    event.metadata.impact_level === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                    event.metadata.impact_level === 'low' && "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  )}>
                    {event.metadata.impact_level.toUpperCase()}
                  </div>
                </div>
                <h4 className="font-medium text-foreground">{event.title}</h4>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
              <time className="text-xs text-muted-foreground flex-shrink-0">
                {formatDate(event.timestamp)}
              </time>
            </div>

            {/* Event Metadata */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{event.pattern_name}</span>
                {event.metadata.author && (
                  <span>by {event.metadata.author}</span>
                )}
                {event.metadata.version && (
                  <span className="px-2 py-0.5 bg-muted rounded text-xs">
                    v{event.metadata.version}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>

            {/* Special metadata for specific event types */}
            {event.type === 'effectiveness_change' && event.metadata.effectiveness_before && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>Effectiveness Score</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">{event.metadata.effectiveness_before}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-medium text-green-600">{event.metadata.effectiveness_after}</span>
                  </div>
                </div>
              </div>
            )}

            {event.type === 'usage_spike' && event.metadata.usage_count && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>Current Usage</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{event.metadata.usage_count} teams</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TrendsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_TIMELINE_DATA.map(pattern => (
          <div key={pattern.pattern_id} className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{pattern.pattern_name}</h3>
                <p className="text-sm text-muted-foreground">{pattern.category}</p>
              </div>
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Simple effectiveness trend visualization */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Effectiveness Score</span>
                  <span className="font-medium">
                    {pattern.effectiveness_trend[pattern.effectiveness_trend.length - 1].score}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(pattern.effectiveness_trend[pattern.effectiveness_trend.length - 1].score / 5) * 100}%` 
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Usage Growth</span>
                  <span className="font-medium">
                    {pattern.usage_trend[pattern.usage_trend.length - 1].count} teams
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((pattern.usage_trend[pattern.usage_trend.length - 1].count / 200) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Pattern Evolution Timeline</h3>
            <p className="text-muted-foreground text-sm">Track how patterns have evolved and been adopted</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            <Clock className="h-4 w-4 mr-1" />
            Timeline
          </Button>
          <Button
            variant={viewMode === 'trends' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('trends')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Trends
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Pattern:</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto">
          <Button
            variant={selectedPattern === null ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedPattern(null)}
          >
            All Patterns
          </Button>
          {MOCK_TIMELINE_DATA.map(pattern => (
            <Button
              key={pattern.pattern_id}
              variant={selectedPattern === pattern.pattern_id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPattern(pattern.pattern_id)}
              className="flex-shrink-0"
            >
              {pattern.pattern_name}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'timeline' ? (
        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            <div className="space-y-0">
              {filteredEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <EventCard event={event} />
                  {index < filteredEvents.length - 1 && (
                    <div className="ml-6 -mt-4 mb-4">
                      <div className="w-px h-4 bg-border" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-lg">No timeline events</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No events found for the selected pattern and time range.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <TrendsView />
      )}

      {/* Insights Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-green-500 rounded-lg flex-shrink-0">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-2 flex-1">
            <h4 className="font-semibold text-green-900 dark:text-green-100">
              Pattern Evolution Insights
            </h4>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Repository Pattern shows the strongest adoption trend with 40% usage increase in the last 6 months.
              Circuit Breaker effectiveness improved significantly after configuration enhancements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}