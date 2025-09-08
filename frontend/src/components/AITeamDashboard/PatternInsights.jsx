/**
 * 🧠 Pattern Insights Component
 * Displays AI-discovered patterns and code insights
 */

import React, { useState } from 'react';
import { 
  Brain, 
  Code2, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Search,
  Filter,
  Star,
  GitBranch,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const PatternInsights = ({ insights = {}, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock pattern insights data
  const mockInsights = {
    total_patterns_discovered: 47,
    patterns_this_week: 8,
    reusability_score: 0.84,
    top_categories: ['api-endpoint', 'database-model', 'auth-middleware'],
    recent_patterns: [
      {
        id: 1,
        name: 'JWT Authentication Service',
        type: 'auth-middleware',
        language: 'typescript',
        reusability_score: 0.92,
        usage_count: 12,
        description: 'Reusable JWT authentication service with refresh tokens',
        tags: ['authentication', 'jwt', 'security'],
        discovered_at: '2024-01-15T10:30:00Z',
        code_snippet: 'class AuthService {\n  async validateToken(token: string) {\n    // Implementation\n  }\n}'
      },
      {
        id: 2,
        name: 'API Response Handler',
        type: 'api-endpoint',
        language: 'javascript',
        reusability_score: 0.88,
        usage_count: 18,
        description: 'Standardized API response format with error handling',
        tags: ['api', 'response', 'error-handling'],
        discovered_at: '2024-01-15T09:15:00Z',
        code_snippet: 'function apiResponse(data, error = null) {\n  return { success: !error, data, error };\n}'
      },
      {
        id: 3,
        name: 'Database Connection Pool',
        type: 'database-model',
        language: 'python',
        reusability_score: 0.85,
        usage_count: 6,
        description: 'Optimized database connection pooling pattern',
        tags: ['database', 'connection', 'optimization'],
        discovered_at: '2024-01-15T08:45:00Z',
        code_snippet: 'class DatabasePool:\n    def __init__(self, max_connections=10):\n        # Implementation\n        pass'
      }
    ],
    pattern_trends: {
      'api-endpoint': { count: 15, trend: '+23%' },
      'database-model': { count: 12, trend: '+8%' },
      'auth-middleware': { count: 10, trend: '+15%' },
      'validation-schema': { count: 8, trend: '-5%' },
      'error-handler': { count: 6, trend: '+12%' }
    },
    recommendations: [
      {
        title: 'Extract Common Authentication Pattern',
        description: 'Multiple teams are implementing similar auth patterns. Consider creating a shared library.',
        impact: 'High',
        patterns_affected: 5
      },
      {
        title: 'Standardize Error Handling',
        description: 'Inconsistent error handling patterns detected across services.',
        impact: 'Medium',
        patterns_affected: 8
      }
    ]
  };

  const patternData = { ...mockInsights, ...insights };

  const getPatternIcon = (type) => {
    const icons = {
      'api-endpoint': <GitBranch size={16} className="text-blue-400" />,
      'database-model': <Database size={16} className="text-green-400" />,
      'auth-middleware': <Shield size={16} className="text-orange-400" />,
      'validation-schema': <Target size={16} className="text-purple-400" />,
      'error-handler': <Zap size={16} className="text-red-400" />,
      'config-pattern': <Code2 size={16} className="text-yellow-400" />
    };
    return icons[type] || <Code2 size={16} className="text-slate-400" />;
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      java: 'bg-red-500',
      go: 'bg-cyan-500',
      rust: 'bg-orange-500'
    };
    return colors[language] || 'bg-slate-500';
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const time = new Date(timestamp);
    const diffHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const filteredPatterns = patternData.recent_patterns?.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLanguage = selectedLanguage === 'all' || pattern.language === selectedLanguage;
    const matchesCategory = selectedCategory === 'all' || pattern.type === selectedCategory;
    
    return matchesSearch && matchesLanguage && matchesCategory;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-slate-700 bg-slate-800/50">
              <CardHeader className="pb-2">
                <div className="h-4 bg-slate-700 rounded w-2/3 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-700 rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pattern Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Brain className="text-purple-400" size={20} />
              <span className="text-2xl font-bold text-white">
                {patternData.total_patterns_discovered}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-400" size={20} />
              <span className="text-2xl font-bold text-white">
                +{patternData.patterns_this_week}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Reusability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-400" size={20} />
              <span className="text-2xl font-bold text-white">
                {Math.floor(patternData.reusability_score * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Code2 className="text-blue-400" size={20} />
              <span className="text-lg font-bold text-white">
                {patternData.top_categories?.[0]?.replace('-', ' ') || 'API'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-600">
            <Code2 size={16} className="mr-2" />
            Discovered Patterns
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-purple-600">
            <TrendingUp size={16} className="mr-2" />
            Pattern Trends
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-purple-600">
            <Lightbulb size={16} className="mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          {/* Filters */}
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patterns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-300 w-64"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-slate-400" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-300"
                  >
                    <option value="all">All Languages</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-300"
                >
                  <option value="all">All Categories</option>
                  <option value="api-endpoint">API Endpoints</option>
                  <option value="database-model">Database Models</option>
                  <option value="auth-middleware">Auth Middleware</option>
                  <option value="validation-schema">Validation</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Pattern List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredPatterns.map((pattern) => (
              <Card key={pattern.id} className="border-slate-700 bg-slate-800/50 hover:border-purple-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getPatternIcon(pattern.type)}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{pattern.name}</h3>
                        <p className="text-slate-400 text-sm">{pattern.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Star size={14} className="text-yellow-400" />
                        <span className="text-sm font-medium text-white">
                          {Math.floor(pattern.reusability_score * 100)}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Used {pattern.usage_count} times
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      <div className={`w-2 h-2 rounded-full mr-1 ${getLanguageColor(pattern.language)}`}></div>
                      {pattern.language}
                    </Badge>
                    
                    <Badge variant="outline" className="border-slate-600 text-slate-300 capitalize">
                      {pattern.type.replace('-', ' ')}
                    </Badge>
                    
                    <span className="text-xs text-slate-500">
                      Discovered {formatTimeAgo(pattern.discovered_at)}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pattern.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-purple-500/50 text-purple-300 text-xs"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Code Snippet */}
                  {pattern.code_snippet && (
                    <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                      <pre className="text-sm text-slate-300 overflow-x-auto">
                        <code>{pattern.code_snippet}</code>
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPatterns.length === 0 && (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardContent className="text-center py-8">
                <Brain size={48} className="text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">
                  No patterns found
                </h3>
                <p className="text-slate-500">
                  Try adjusting your search criteria or filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Pattern Category Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(patternData.pattern_trends).map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPatternIcon(category)}
                      <div>
                        <div className="font-medium text-slate-300 capitalize">
                          {category.replace('-', ' ')}
                        </div>
                        <div className="text-sm text-slate-500">
                          {data.count} patterns discovered
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        data.trend.includes('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {data.trend}
                      </div>
                      <div className="text-xs text-slate-500">vs last period</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {patternData.recommendations?.map((rec, index) => (
              <Card key={index} className="border-slate-700 bg-slate-800/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="text-yellow-400" size={20} />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{rec.title}</h3>
                        <p className="text-slate-400">{rec.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        rec.impact === 'High' ? 'border-red-500/50 text-red-400' :
                        rec.impact === 'Medium' ? 'border-yellow-500/50 text-yellow-400' :
                        'border-green-500/50 text-green-400'
                      }`}
                    >
                      {rec.impact} Impact
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      Affects {rec.patterns_affected} patterns
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!patternData.recommendations || patternData.recommendations.length === 0) && (
              <Card className="border-slate-700 bg-slate-800/50">
                <CardContent className="text-center py-8">
                  <Lightbulb size={48} className="text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">
                    No recommendations available
                  </h3>
                  <p className="text-slate-500">
                    Pattern analysis is ongoing. Check back later for insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatternInsights;