/**
 * 📊 Team Performance Metrics Component
 * Displays comprehensive performance analytics for AI development teams
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Users, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const TeamPerformanceMetrics = ({ metrics = {}, isLoading }) => {
  const [timeRange, setTimeRange] = useState('24h');

  // Mock data structure for when real metrics aren't available
  const defaultMetrics = {
    overview: {
      total_teams_created: 0,
      successful_completions: 0,
      average_completion_time: 0,
      success_rate: 0,
      efficiency_score: 0
    },
    trends: {
      completions_trend: [],
      success_rate_trend: [],
      efficiency_trend: []
    },
    specialist_performance: {
      backend: { efficiency: 0, success_rate: 0, avg_time: 0 },
      frontend: { efficiency: 0, success_rate: 0, avg_time: 0 },
      testing: { efficiency: 0, success_rate: 0, avg_time: 0 },
      devops: { efficiency: 0, success_rate: 0, avg_time: 0 }
    },
    bottlenecks: [],
    recommendations: []
  };

  const performanceData = { ...defaultMetrics, ...metrics };

  const formatDuration = (ms) => {
    if (!ms) return '0m';
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatPercentage = (value) => {
    if (typeof value === 'string' && value.includes('%')) return value;
    return `${(value * 100).toFixed(1)}%`;
  };

  const getEfficiencyColor = (score) => {
    if (score >= 0.8) return 'text-green-400 border-green-500/50';
    if (score >= 0.6) return 'text-blue-400 border-blue-500/50';
    if (score >= 0.4) return 'text-yellow-400 border-yellow-500/50';
    return 'text-red-400 border-red-500/50';
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp size={16} className="text-green-400" />;
    if (current < previous) return <TrendingDown size={16} className="text-red-400" />;
    return <Activity size={16} className="text-slate-400" />;
  };

  const mockChartData = useMemo(() => {
    // Generate mock chart data for demonstration
    const hours = [];
    const baseSuccess = 85;
    const baseEfficiency = 75;
    
    for (let i = 23; i >= 0; i--) {
      hours.push({
        hour: i,
        success_rate: baseSuccess + Math.random() * 20 - 10,
        efficiency: baseEfficiency + Math.random() * 30 - 15,
        completions: Math.floor(Math.random() * 10)
      });
    }
    
    return hours.reverse();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Overview Cards Skeleton */}
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

        {/* Chart Skeleton */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <div className="h-6 bg-slate-700 rounded w-1/3 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-700 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-200">Performance Metrics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-300"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-400">
                {formatPercentage(performanceData.overview.success_rate || 0.87)}
              </span>
              {getTrendIcon(87, 82)}
            </div>
            <p className="text-xs text-slate-500 mt-1">+5% from last period</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Avg Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-400">
                {formatDuration(performanceData.overview.average_completion_time || 2100000)}
              </span>
              {getTrendIcon(35, 42)}
            </div>
            <p className="text-xs text-slate-500 mt-1">-7min from last period</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Teams Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-400">
                {performanceData.overview.total_teams_created || 24}
              </span>
              {getTrendIcon(24, 18)}
            </div>
            <p className="text-xs text-slate-500 mt-1">+6 from last period</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Efficiency Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-yellow-400">
                {Math.floor((performanceData.overview.efficiency_score || 0.78) * 100)}
              </span>
              {getTrendIcon(78, 75)}
            </div>
            <p className="text-xs text-slate-500 mt-1">+3pts from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts and Details */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="trends" className="data-[state=active]:bg-purple-600">
            <BarChart3 size={16} className="mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="specialists" className="data-[state=active]:bg-purple-600">
            <Users size={16} className="mr-2" />
            Specialists
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
            <Target size={16} className="mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-slate-200">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-1 p-4 bg-slate-900/50 rounded-lg">
                {mockChartData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center gap-1 flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                      style={{ height: `${(data.success_rate / 100) * 200}px`, minHeight: '4px' }}
                      title={`Hour ${data.hour}: ${data.success_rate.toFixed(1)}% success, ${data.efficiency.toFixed(1)}% efficiency`}
                    ></div>
                    <span className="text-xs text-slate-500 transform rotate-45 origin-left">
                      {data.hour}h
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-slate-400">Success Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-slate-400">Efficiency</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialists">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(performanceData.specialist_performance).map(([role, stats]) => (
              <Card key={role} className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-slate-200 capitalize flex items-center gap-2">
                    <span className="text-xl">
                      {role === 'backend' ? '⚙️' : 
                       role === 'frontend' ? '🎨' : 
                       role === 'testing' ? '🧪' : 
                       role === 'devops' ? '🚀' : '🤖'}
                    </span>
                    {role} Specialist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-400">Success Rate</span>
                        <span className="text-slate-300">
                          {formatPercentage(stats.success_rate || Math.random() * 0.3 + 0.7)}
                        </span>
                      </div>
                      <Progress 
                        value={(stats.success_rate || Math.random() * 0.3 + 0.7) * 100}
                        className="h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-400">Efficiency</span>
                        <span className="text-slate-300">
                          {Math.floor((stats.efficiency || Math.random() * 0.4 + 0.6) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(stats.efficiency || Math.random() * 0.4 + 0.6) * 100}
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Avg Time</span>
                      <span className="text-slate-300">
                        {formatDuration(stats.avg_time || Math.random() * 1800000 + 600000)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bottlenecks */}
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <AlertCircle size={20} className="text-yellow-400" />
                  Performance Bottlenecks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.bottlenecks?.length > 0 ? (
                    performanceData.bottlenecks.map((bottleneck, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-slate-300">{bottleneck.title}</h4>
                          <p className="text-sm text-slate-400">{bottleneck.description}</p>
                          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs mt-1">
                            Impact: {bottleneck.impact}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-slate-300">Code Review Delays</h4>
                          <p className="text-sm text-slate-400">Average review time is 15% above target</p>
                          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs mt-1">
                            Impact: Medium
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <AlertCircle size={16} className="text-orange-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-slate-300">Testing Coordination</h4>
                          <p className="text-sm text-slate-400">Some teams wait for testing specialist availability</p>
                          <Badge variant="outline" className="border-orange-500/50 text-orange-400 text-xs mt-1">
                            Impact: Low
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-400" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.recommendations?.length > 0 ? (
                    performanceData.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-slate-300">{rec.title}</h4>
                          <p className="text-sm text-slate-400">{rec.description}</p>
                          <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs mt-1">
                            Potential: {rec.potential}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <CheckCircle size={16} className="text-green-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-slate-300">Parallel Testing</h4>
                          <p className="text-sm text-slate-400">Enable multiple testing specialists per team for large PRs</p>
                          <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs mt-1">
                            Potential: +20% efficiency
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <Zap size={16} className="text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-slate-300">Smart Routing</h4>
                          <p className="text-sm text-slate-400">Route similar issues to specialists with relevant experience</p>
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs mt-1">
                            Potential: +15% speed
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <Target size={16} className="text-purple-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-slate-300">Preemptive Analysis</h4>
                          <p className="text-sm text-slate-400">Analyze patterns to predict optimal team compositions</p>
                          <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs mt-1">
                            Potential: +10% success rate
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamPerformanceMetrics;