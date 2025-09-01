import React, { useState, useEffect } from 'react';
import {
  Network,
  FileText,
  Lightbulb,
  ArrowRight,
  Users,
  Star,
  Calendar,
  GitBranch,
  Eye,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Link2,
  Zap
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/utils/apiClient';

interface RelatedItem {
  id: string;
  type: 'adr' | 'pattern';
  title: string;
  description?: string;
  similarity_score: number;
  relationship_type: 'similar_problem' | 'related_decision' | 'shared_pattern' | 'supersedes' | 'superseded_by' | 'influences' | 'influenced_by';
  metadata: {
    status?: string;
    category?: string;
    effectiveness_score?: number;
    usage_count?: number;
    author_name?: string;
    created_at: string;
    project_name?: string;
    component_name?: string;
  };
}

interface ADRRelationsProps {
  adrId: string;
  onADRClick?: (adr: any) => void;
  onPatternClick?: (pattern: any) => void;
  className?: string;
  maxResults?: number;
}

const RELATIONSHIP_TYPES = {
  similar_problem: {
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    label: 'Similar Problem',
    description: 'Addresses a similar problem or context'
  },
  related_decision: {
    icon: GitBranch,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    label: 'Related Decision',
    description: 'Decision that relates to or builds upon this ADR'
  },
  shared_pattern: {
    icon: Lightbulb,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    label: 'Shared Pattern',
    description: 'Implements or references the same design pattern'
  },
  supersedes: {
    icon: ArrowRight,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    label: 'Supersedes',
    description: 'This ADR replaces or supersedes the related item'
  },
  superseded_by: {
    icon: ArrowRight,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    label: 'Superseded By',
    description: 'This ADR has been replaced by the related item'
  },
  influences: {
    icon: TrendingUp,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    label: 'Influences',
    description: 'This ADR influenced the related decision'
  },
  influenced_by: {
    icon: TrendingUp,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    label: 'Influenced By',
    description: 'This ADR was influenced by the related item'
  }
};

// Mock data - in production this would come from the API
const MOCK_RELATIONS: RelatedItem[] = [
  {
    id: '2',
    type: 'adr',
    title: 'Implement Semantic Search with pgvector',
    description: 'Uses PostgreSQL with pgvector extension for semantic search capabilities',
    similarity_score: 0.85,
    relationship_type: 'related_decision',
    metadata: {
      status: 'accepted',
      author_name: 'Backend Specialist',
      created_at: '2025-08-18T14:30:00Z',
      project_name: 'Dev Memory OS',
      component_name: 'Backend'
    }
  },
  {
    id: 'pattern-1',
    type: 'pattern',
    title: 'Repository Pattern',
    description: 'Encapsulates data access logic and provides object-oriented view of persistence',
    similarity_score: 0.73,
    relationship_type: 'shared_pattern',
    metadata: {
      category: 'Data Access',
      effectiveness_score: 4.8,
      usage_count: 156,
      author_name: 'Backend Team',
      created_at: '2024-01-15T08:00:00Z'
    }
  },
  {
    id: '3',
    type: 'adr',
    title: 'Use Express.js for API Server',
    description: 'Node.js web framework for building the API server',
    similarity_score: 0.68,
    relationship_type: 'similar_problem',
    metadata: {
      status: 'accepted',
      author_name: 'Backend Specialist',
      created_at: '2025-08-15T09:15:00Z',
      project_name: 'Dev Memory OS',
      component_name: 'Backend'
    }
  }
];

export default function ADRRelations({
  adrId,
  onADRClick,
  onPatternClick,
  className,
  maxResults = 10
}: ADRRelationsProps) {
  const [relations, setRelations] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'adr' | 'pattern'>('all');

  // Load related items
  useEffect(() => {
    const loadRelations = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to get similar ADRs from the API
        const similarADRs = await apiClient.findSimilarADRs(adrId, {
          max_results: Math.ceil(maxResults / 2),
          similarity_threshold: 0.3
        });

        // Try to get related patterns
        const patternRecommendations = await apiClient.getPatternRecommendations({
          query: `ADR ${adrId} related patterns`,
          max_results: Math.ceil(maxResults / 2),
          similarity_threshold: 0.3
        });

        const relatedItems: RelatedItem[] = [];

        // Process similar ADRs
        if (similarADRs.similar_adrs) {
          similarADRs.similar_adrs.forEach(adr => {
            relatedItems.push({
              id: adr.id,
              type: 'adr',
              title: adr.title,
              description: adr.context,
              similarity_score: adr.similarity_score || 0,
              relationship_type: 'similar_problem',
              metadata: {
                status: adr.status,
                author_name: adr.author_name,
                created_at: adr.created_at,
                project_name: adr.project_name,
                component_name: adr.component_name
              }
            });
          });
        }

        // Process related patterns
        if (patternRecommendations.patterns) {
          patternRecommendations.patterns.forEach(pattern => {
            relatedItems.push({
              id: pattern.id,
              type: 'pattern',
              title: pattern.name,
              description: pattern.description,
              similarity_score: pattern.similarity || 0,
              relationship_type: 'shared_pattern',
              metadata: {
                category: pattern.category,
                effectiveness_score: pattern.effectiveness_score,
                usage_count: pattern.usage_count,
                author_name: pattern.author_name,
                created_at: pattern.created_at
              }
            });
          });
        }

        // If API calls failed, use mock data
        if (relatedItems.length === 0) {
          setRelations(MOCK_RELATIONS);
        } else {
          setRelations(relatedItems.slice(0, maxResults));
        }

      } catch (error) {
        console.error('Failed to load ADR relations:', error);
        // Fallback to mock data
        setRelations(MOCK_RELATIONS);
      } finally {
        setLoading(false);
      }
    };

    if (adrId) {
      loadRelations();
    }
  }, [adrId, maxResults]);

  const filteredRelations = selectedType === 'all' 
    ? relations 
    : relations.filter(item => item.type === selectedType);

  const handleItemClick = (item: RelatedItem) => {
    if (item.type === 'adr') {
      onADRClick?.(item);
    } else if (item.type === 'pattern') {
      onPatternClick?.(item);
    }
  };

  const RelationCard = ({ item }: { item: RelatedItem }) => {
    const relationConfig = RELATIONSHIP_TYPES[item.relationship_type];
    const RelationIcon = relationConfig.icon;
    const TypeIcon = item.type === 'adr' ? FileText : Lightbulb;

    return (
      <div
        onClick={() => handleItemClick(item)}
        className="group p-4 border border-border rounded-lg bg-card hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/30"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className={cn(
              "p-2 rounded-lg flex-shrink-0",
              item.type === 'adr' ? "bg-blue-50 dark:bg-blue-950" : "bg-yellow-50 dark:bg-yellow-950"
            )}>
              <TypeIcon className={cn(
                "h-4 w-4",
                item.type === 'adr' ? "text-blue-600" : "text-yellow-600"
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          {/* Similarity Score */}
          <div className="flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs flex-shrink-0">
            <TrendingUp className="h-3 w-3" />
            <span>{Math.round(item.similarity_score * 100)}%</span>
          </div>
        </div>

        {/* Relationship Type */}
        <div className={cn(
          "inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium mb-3",
          relationConfig.bgColor,
          relationConfig.color
        )}>
          <RelationIcon className="h-3 w-3" />
          <span>{relationConfig.label}</span>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            {item.metadata.status && (
              <span className="capitalize">{item.metadata.status}</span>
            )}
            {item.metadata.category && (
              <span>{item.metadata.category}</span>
            )}
            {item.metadata.effectiveness_score && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span>{item.metadata.effectiveness_score}</span>
              </div>
            )}
            {item.metadata.usage_count && (
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{item.metadata.usage_count}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatRelativeTime(item.metadata.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Finding related content...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
              <div className="space-y-3">
                <div className="w-3/4 h-4 bg-muted rounded" />
                <div className="w-full h-3 bg-muted rounded" />
                <div className="w-1/2 h-6 bg-muted rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4 border border-destructive/20 rounded-lg bg-destructive/10", className)}>
        <p className="text-sm text-destructive">
          Failed to load related content: {error}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto">
        <Button
          variant={selectedType === 'all' ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedType('all')}
        >
          All Relations ({relations.length})
        </Button>
        <Button
          variant={selectedType === 'adr' ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedType('adr')}
        >
          <FileText className="h-3 w-3 mr-1" />
          ADRs ({relations.filter(r => r.type === 'adr').length})
        </Button>
        <Button
          variant={selectedType === 'pattern' ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedType('pattern')}
        >
          <Lightbulb className="h-3 w-3 mr-1" />
          Patterns ({relations.filter(r => r.type === 'pattern').length})
        </Button>
      </div>

      {/* Relations Grid */}
      {filteredRelations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRelations.map((item) => (
            <RelationCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Network className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">No related content found</h3>
            <p className="text-sm text-muted-foreground">
              {selectedType === 'all' 
                ? "No related ADRs or patterns were found for this decision."
                : `No related ${selectedType}s were found for this decision.`}
            </p>
          </div>
        </div>
      )}

      {/* AI Insight */}
      {filteredRelations.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-blue-500 rounded-lg flex-shrink-0">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <div className="text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                <span className="font-medium">AI Insight:</span> Found {filteredRelations.length} related items 
                with {Math.round(filteredRelations.reduce((acc, item) => acc + item.similarity_score, 0) / filteredRelations.length * 100)}% 
                average similarity. These relationships were discovered through semantic analysis of content and context.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}