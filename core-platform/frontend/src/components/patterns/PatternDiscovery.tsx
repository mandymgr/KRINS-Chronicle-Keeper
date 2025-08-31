import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Star, 
  Clock, 
  Users, 
  Filter,
  Grid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Bookmark,
  Check,
  Eye,
  Download,
  Share2,
  MoreHorizontal,
  Zap,
  Award,
  Target
} from 'lucide-react';
import { usePatternRecommendations } from '@/hooks/usePatternRecommendations';
import { apiClient } from '@/utils/apiClient';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import PatternCard from './PatternCard';
import PatternRecommendations from './PatternRecommendations';
import PatternTimeline from './PatternTimeline';

interface Pattern {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  effectiveness_score: number;
  usage_count: number;
  last_used: string;
  created_at: string;
  thumbnail?: string;
  author?: string;
  examples?: any[];
  related_adrs?: string[];
}

interface PatternCollection {
  title: string;
  subtitle: string;
  patterns: Pattern[];
  type: 'trending' | 'recommended' | 'recent' | 'categories' | 'bookmarked';
  category?: string;
}

const MOCK_PATTERNS: Pattern[] = [
  {
    id: '1',
    name: 'Repository Pattern',
    description: 'Encapsulates data access logic and provides a more object-oriented view of the persistence layer',
    category: 'Data Access',
    tags: ['repository', 'data', 'architecture'],
    difficulty: 'intermediate',
    effectiveness_score: 4.8,
    usage_count: 156,
    last_used: '2025-08-27T10:00:00Z',
    created_at: '2024-01-15T08:00:00Z',
    author: 'Backend Team',
    examples: [],
    related_adrs: ['adr-001', 'adr-005']
  },
  {
    id: '2', 
    name: 'Circuit Breaker',
    description: 'Prevents cascading failures by monitoring service health and failing fast when needed',
    category: 'Resilience',
    tags: ['resilience', 'error-handling', 'microservices'],
    difficulty: 'advanced',
    effectiveness_score: 4.9,
    usage_count: 89,
    last_used: '2025-08-26T14:30:00Z',
    created_at: '2024-03-10T12:00:00Z',
    author: 'Platform Team',
    examples: [],
    related_adrs: ['adr-012', 'adr-018']
  },
  {
    id: '3',
    name: 'Observer Pattern',
    description: 'Define a subscription mechanism to notify multiple objects about events',
    category: 'Behavioral',
    tags: ['observer', 'events', 'decoupling'],
    difficulty: 'beginner',
    effectiveness_score: 4.6,
    usage_count: 203,
    last_used: '2025-08-28T09:15:00Z',
    created_at: '2023-11-20T16:45:00Z',
    author: 'Frontend Team',
    examples: [],
    related_adrs: ['adr-003', 'adr-007']
  }
];

export default function PatternDiscovery() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedPatterns, setBookmarkedPatterns] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<PatternCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredPattern, setFeaturedPattern] = useState<Pattern | null>(null);

  const { recommendations, isLoading: recommendationsLoading } = usePatternRecommendations({
    max_results: 6,
  });

  // Load pattern collections
  useEffect(() => {
    const loadPatternCollections = async () => {
      try {
        setLoading(true);
        
        // Get trending patterns
        const trendingResponse = await apiClient.getPatternRecommendations({
          category: 'trending',
          max_results: 12
        });

        // Get recent patterns
        const recentResponse = await apiClient.getPatternRecommendations({
          max_results: 8
        });

        // Create collections
        const newCollections: PatternCollection[] = [
          {
            title: 'Trending Patterns',
            subtitle: 'Most popular patterns this week',
            patterns: trendingResponse.patterns || MOCK_PATTERNS.slice(0, 3),
            type: 'trending'
          },
          {
            title: 'Recommended for You',
            subtitle: 'Based on your recent searches and usage',
            patterns: recommendations?.patterns || MOCK_PATTERNS.slice(1, 4),
            type: 'recommended'
          },
          {
            title: 'Recently Added',
            subtitle: 'Fresh patterns from the community',
            patterns: recentResponse.patterns || MOCK_PATTERNS,
            type: 'recent'
          },
          {
            title: 'Data Access Patterns',
            subtitle: 'Repository, DAO, and data layer patterns',
            patterns: MOCK_PATTERNS.filter(p => p.category === 'Data Access'),
            type: 'categories',
            category: 'Data Access'
          },
          {
            title: 'Resilience Patterns',
            subtitle: 'Circuit breaker, retry, and fault tolerance',
            patterns: MOCK_PATTERNS.filter(p => p.category === 'Resilience'),
            type: 'categories',
            category: 'Resilience'
          }
        ];

        setCollections(newCollections);
        setFeaturedPattern(MOCK_PATTERNS[0]);
      } catch (error) {
        console.error('Failed to load pattern collections:', error);
        // Fallback to mock data
        setCollections([
          {
            title: 'Featured Patterns',
            subtitle: 'Discover proven solutions',
            patterns: MOCK_PATTERNS,
            type: 'trending'
          }
        ]);
        setFeaturedPattern(MOCK_PATTERNS[0]);
      } finally {
        setLoading(false);
      }
    };

    loadPatternCollections();
  }, [recommendations]);

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

  const PatternRow = ({ collection }: { collection: PatternCollection }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{collection.title}</h2>
          <p className="text-muted-foreground text-sm">{collection.subtitle}</p>
        </div>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>
      
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
          {collection.patterns.map((pattern) => (
            <div key={pattern.id} className="flex-shrink-0 w-80">
              <PatternCard 
                pattern={pattern}
                isBookmarked={bookmarkedPatterns.has(pattern.id)}
                onBookmark={() => toggleBookmark(pattern.id)}
                variant="netflix"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const FeaturedPattern = ({ pattern }: { pattern: Pattern }) => (
    <div className="relative h-96 rounded-lg overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      
      <div className="absolute bottom-0 left-0 p-8 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <span className="text-yellow-500 font-medium">Featured Pattern</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">{pattern.name}</h1>
          <p className="text-muted-foreground max-w-2xl">{pattern.description}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="font-medium">{pattern.effectiveness_score}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{pattern.usage_count} uses</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground capitalize">{pattern.difficulty}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Play className="h-4 w-4 mr-2" />
            Explore Pattern
          </Button>
          <Button variant="outline" size="lg">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            variant="ghost" 
            size="lg"
            onClick={() => toggleBookmark(pattern.id)}
          >
            {bookmarkedPatterns.has(pattern.id) ? (
              <Check className="h-4 w-4 mr-2 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4 mr-2" />
            )}
            {bookmarkedPatterns.has(pattern.id) ? 'Bookmarked' : 'Bookmark'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-96 bg-muted rounded-lg" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 bg-muted rounded w-64" />
            <div className="flex space-x-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="w-80 h-48 bg-muted rounded-lg flex-shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-muted")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Featured Pattern Hero */}
      {featuredPattern && <FeaturedPattern pattern={featuredPattern} />}

      {/* Pattern Collections */}
      <div className="space-y-12">
        {collections.map((collection, index) => (
          <PatternRow key={`${collection.type}-${index}`} collection={collection} />
        ))}
      </div>

      {/* AI Recommendations Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold">AI Recommendations</h2>
        </div>
        <PatternRecommendations />
      </div>

      {/* Pattern Evolution Timeline */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Pattern Evolution</h2>
        <PatternTimeline />
      </div>
    </div>
  );
}