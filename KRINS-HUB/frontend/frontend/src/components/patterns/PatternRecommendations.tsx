import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Target, 
  TrendingUp, 
  Clock,
  Star,
  Users,
  ChevronRight,
  Lightbulb,
  Zap,
  ArrowRight,
  Plus,
  Bookmark,
  Check,
  Eye,
  Play,
  RefreshCw
} from 'lucide-react';
import { usePatternRecommendations } from '@/hooks/usePatternRecommendations';
import { apiClient } from '@/utils/apiClient';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import PatternCard from './PatternCard';

interface RecommendationContext {
  title: string;
  description: string;
  confidence: number;
  reasons: string[];
  type: 'similar_usage' | 'complementary' | 'trending' | 'project_specific' | 'ai_suggested';
}

interface EnhancedPatternRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  effectiveness_score: number;
  usage_count: number;
  confidence_score: number;
  recommendation_context: RecommendationContext;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_impact: 'low' | 'medium' | 'high';
  implementation_time: string;
  related_patterns?: string[];
  success_stories?: number;
}

const RECOMMENDATION_TYPES = {
  similar_usage: {
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    title: 'Teams Like Yours Use'
  },
  complementary: {
    icon: Plus,
    color: 'text-green-500', 
    bgColor: 'bg-green-50 dark:bg-green-950',
    title: 'Works Well With'
  },
  trending: {
    icon: TrendingUp,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    title: 'Trending Now'
  },
  project_specific: {
    icon: Target,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    title: 'Perfect for Your Project'
  },
  ai_suggested: {
    icon: Sparkles,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    title: 'AI Discovered'
  }
};

const MOCK_RECOMMENDATIONS: EnhancedPatternRecommendation[] = [
  {
    id: 'rec-1',
    name: 'Saga Pattern',
    description: 'Manage distributed transactions across microservices with compensating actions',
    category: 'Distributed Systems',
    effectiveness_score: 4.7,
    usage_count: 142,
    confidence_score: 0.92,
    recommendation_context: {
      title: 'Complements your Circuit Breaker usage',
      description: 'Teams using Circuit Breaker often implement Saga for transaction management',
      confidence: 0.92,
      reasons: [
        'Used by 78% of teams with Circuit Breaker',
        'Solves related distributed system challenges',
        'High success rate in similar projects'
      ],
      type: 'complementary'
    },
    tags: ['saga', 'microservices', 'transactions'],
    difficulty: 'advanced',
    estimated_impact: 'high',
    implementation_time: '2-3 weeks',
    success_stories: 89
  },
  {
    id: 'rec-2',
    name: 'CQRS Pattern',
    description: 'Separate read and write operations for better scalability and performance',
    category: 'Architecture',
    effectiveness_score: 4.6,
    usage_count: 98,
    confidence_score: 0.87,
    recommendation_context: {
      title: 'Trending in similar projects',
      description: 'Gaining momentum in data-intensive applications like yours',
      confidence: 0.87,
      reasons: [
        'Usage increased 45% this quarter',
        'High effectiveness in similar domains',
        'Recommended by 3 recent ADRs'
      ],
      type: 'trending'
    },
    tags: ['cqrs', 'architecture', 'scalability'],
    difficulty: 'advanced',
    estimated_impact: 'high',
    implementation_time: '3-4 weeks',
    success_stories: 67
  },
  {
    id: 'rec-3',
    name: 'Event Sourcing',
    description: 'Store all changes as a sequence of events for complete audit trail',
    category: 'Data Management',
    effectiveness_score: 4.8,
    usage_count: 76,
    confidence_score: 0.83,
    recommendation_context: {
      title: 'AI analysis suggests high compatibility',
      description: 'Machine learning identified this as highly relevant based on your codebase',
      confidence: 0.83,
      reasons: [
        'Code patterns match 87% similarity',
        'Addresses audit requirements mentioned',
        'Natural evolution from current architecture'
      ],
      type: 'ai_suggested'
    },
    tags: ['events', 'audit', 'immutability'],
    difficulty: 'advanced',
    estimated_impact: 'medium',
    implementation_time: '4-6 weeks',
    success_stories: 45
  }
];

export default function PatternRecommendations() {
  const [recommendations, setRecommendations] = useState<EnhancedPatternRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [bookmarkedPatterns, setBookmarkedPatterns] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const { 
    recommendations: apiRecommendations, 
    isLoading: apiLoading,
    refetch 
  } = usePatternRecommendations({
    max_results: 6,
    min_effectiveness_score: 4.0
  });

  // Load recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        
        // In production, this would come from the API
        // For now, use mock data with some API integration
        setRecommendations(MOCK_RECOMMENDATIONS);
        
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        setRecommendations(MOCK_RECOMMENDATIONS);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [apiRecommendations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      // In production, would refetch recommendations here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate refresh
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleBookmark = (patternId: string) => {
    setBookmarkedPatterns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patternId)) {
        newSet.delete(patternId);
      } else {
        newSet.add(patternId);
      }
      return newSet;
    });
  };

  const filteredRecommendations = selectedType 
    ? recommendations.filter(r => r.recommendation_context.type === selectedType)
    : recommendations;

  const RecommendationCard = ({ recommendation }: { recommendation: EnhancedPatternRecommendation }) => {
    const typeConfig = RECOMMENDATION_TYPES[recommendation.recommendation_context.type];
    const TypeIcon = typeConfig.icon;

    return (
      <div className="group relative bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        {/* Confidence Badge */}
        <div className="absolute top-4 right-4">
          <div className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
            typeConfig.bgColor,
            typeConfig.color
          )}>
            <TypeIcon className="h-3 w-3" />
            <span>{Math.round(recommendation.confidence_score * 100)}%</span>
          </div>
        </div>

        {/* Pattern Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Brain className={cn("h-4 w-4", typeConfig.color)} />
              <span className={cn("text-xs font-medium uppercase tracking-wider", typeConfig.color)}>
                {typeConfig.title}
              </span>
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {recommendation.name}
            </h3>
            <p className="text-muted-foreground text-sm">
              {recommendation.description}
            </p>
          </div>

          {/* Recommendation Context */}
          <div className={cn("p-4 rounded-lg", typeConfig.bgColor)}>
            <h4 className="font-medium text-sm mb-2">{recommendation.recommendation_context.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {recommendation.recommendation_context.description}
            </p>
            <div className="space-y-1">
              {recommendation.recommendation_context.reasons.slice(0, 2).map((reason, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div className={cn("w-1 h-1 rounded-full", typeConfig.color.replace('text-', 'bg-'))} />
                  <span className="text-muted-foreground">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span>{recommendation.effectiveness_score}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{recommendation.usage_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{recommendation.implementation_time}</span>
              </div>
            </div>
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              recommendation.estimated_impact === 'high' && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
              recommendation.estimated_impact === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", 
              recommendation.estimated_impact === 'low' && "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
            )}>
              {recommendation.estimated_impact.toUpperCase()} IMPACT
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Button size="sm" className="flex-1">
                <Play className="h-3 w-3 mr-1" />
                Explore
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleBookmark(recommendation.id)}
            >
              {bookmarkedPatterns.has(recommendation.id) ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading || apiLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-48 animate-pulse" />
          <div className="h-8 bg-muted rounded w-20 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Smart Recommendations</h3>
            <p className="text-muted-foreground text-sm">AI-powered pattern suggestions for your project</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto">
        <Button
          variant={selectedType === null ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedType(null)}
        >
          All Recommendations
        </Button>
        {Object.entries(RECOMMENDATION_TYPES).map(([type, config]) => {
          const count = recommendations.filter(r => r.recommendation_context.type === type).length;
          const Icon = config.icon;
          
          if (count === 0) return null;
          
          return (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="flex-shrink-0"
            >
              <Icon className="h-3 w-3 mr-1" />
              {config.title} ({count})
            </Button>
          );
        })}
      </div>

      {/* Recommendations Grid */}
      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-lg">No recommendations available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We're analyzing your patterns and usage to provide personalized recommendations. 
              Check back soon!
            </p>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Recommendations
          </Button>
        </div>
      )}

      {/* AI Insight Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-2 flex-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              AI Insights
            </h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Our AI analyzed your project structure, recent decisions, and team patterns to generate 
              these recommendations. Confidence scores indicate how well each pattern matches your needs.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Learn More About AI Recommendations
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}