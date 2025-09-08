/**
 * 🤖 KRINS AI Team Dashboard
 * Revolutionary dashboard for monitoring autonomous AI development teams
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  GitPullRequest, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Brain,
  Network,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import ActiveTeamsList from './AITeamDashboard/ActiveTeamsList';
import TeamPerformanceMetrics from './AITeamDashboard/TeamPerformanceMetrics';
import CoordinationGraph from './AITeamDashboard/CoordinationGraph';
import PatternInsights from './AITeamDashboard/PatternInsights';

const AITeamDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    overview: {
      active_teams: 0,
      total_specialists: 0,
      sessions_today: 0,
      success_rate: 0,
      avg_completion_time: 0
    },
    active_teams: [],
    recent_activities: [],
    performance_metrics: {},
    coordination_stats: {},
    pattern_insights: {}
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch data from multiple endpoints
      const responses = await Promise.allSettled([
        fetch('/api/ai-teams/overview'),
        fetch('/api/ai-teams/active'),
        fetch('/api/ai-teams/activities'),
        fetch('/api/ai-teams/performance'),
        fetch('/api/coordination/stats'),
        fetch('/api/patterns/insights')
      ]);

      const [overviewRes, activeTeamsRes, activitiesRes, performanceRes, coordinationRes, patternsRes] = responses;

      const newDashboardData = { ...dashboardData };

      if (overviewRes.status === 'fulfilled' && overviewRes.value.ok) {
        newDashboardData.overview = await overviewRes.value.json();
      }

      if (activeTeamsRes.status === 'fulfilled' && activeTeamsRes.value.ok) {
        newDashboardData.active_teams = await activeTeamsRes.value.json();
      }

      if (activitiesRes.status === 'fulfilled' && activitiesRes.value.ok) {
        newDashboardData.recent_activities = await activitiesRes.value.json();
      }

      if (performanceRes.status === 'fulfilled' && performanceRes.value.ok) {
        newDashboardData.performance_metrics = await performanceRes.value.json();
      }

      if (coordinationRes.status === 'fulfilled' && coordinationRes.value.ok) {
        newDashboardData.coordination_stats = await coordinationRes.value.json();
      }

      if (patternsRes.status === 'fulfilled' && patternsRes.value.ok) {
        newDashboardData.pattern_insights = await patternsRes.value.json();
      }

      setDashboardData(newDashboardData);
      setError(null);

    } catch (err) {
      setError(`Failed to fetch dashboard data: ${err.message}`);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatSuccessRate = (rate) => {
    if (typeof rate === 'string' && rate.includes('%')) return rate;
    return `${(rate * 100).toFixed(1)}%`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <Card className="max-w-md mx-auto mt-20 border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle size={20} />
              Dashboard Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🤖 AI Team Command Center
            </h1>
            <p className="text-slate-400 mt-1">
              Revolutionary autonomous AI development teams in action
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              <Activity size={14} className="mr-1" />
              Live
            </Badge>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-300"
            >
              <option value={10000}>10s refresh</option>
              <option value={30000}>30s refresh</option>
              <option value={60000}>1m refresh</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-purple-500/50 bg-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="text-purple-400" size={20} />
                <span className="text-2xl font-bold text-white">
                  {isLoading ? '...' : dashboardData.overview.active_teams}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/50 bg-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">AI Specialists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Brain className="text-blue-400" size={20} />
                <span className="text-2xl font-bold text-white">
                  {isLoading ? '...' : dashboardData.overview.total_specialists}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/50 bg-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Sessions Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="text-green-400" size={20} />
                <span className="text-2xl font-bold text-white">
                  {isLoading ? '...' : dashboardData.overview.sessions_today}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50 bg-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-yellow-400" size={20} />
                <span className="text-2xl font-bold text-white">
                  {isLoading ? '...' : formatSuccessRate(dashboardData.overview.success_rate)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-500/50 bg-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Avg Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="text-pink-400" size={20} />
                <span className="text-2xl font-bold text-white">
                  {isLoading ? '...' : formatDuration(dashboardData.overview.avg_completion_time)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="teams" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="teams" className="data-[state=active]:bg-purple-600">
              <Users size={16} className="mr-2" />
              Active Teams
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600">
              <TrendingUp size={16} className="mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="coordination" className="data-[state=active]:bg-purple-600">
              <Network size={16} className="mr-2" />
              Coordination
            </TabsTrigger>
            <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-600">
              <Brain size={16} className="mr-2" />
              Pattern Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActiveTeamsList 
                  teams={dashboardData.active_teams} 
                  isLoading={isLoading}
                  onRefresh={fetchDashboardData}
                />
              </div>
              <div>
                <Card className="border-slate-700 bg-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {isLoading ? (
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-slate-700 rounded w-3/4 mb-1"></div>
                              <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                            </div>
                          ))}
                        </div>
                      ) : dashboardData.recent_activities.length > 0 ? (
                        dashboardData.recent_activities.slice(0, 6).map((activity, index) => (
                          <div key={index} className="pb-2 border-b border-slate-700 last:border-b-0">
                            <div className="flex items-start gap-2">
                              <Activity size={12} className="text-purple-400 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-300 truncate">
                                  {activity.message || activity.description}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : 'Just now'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">No recent activities</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <TeamPerformanceMetrics 
              metrics={dashboardData.performance_metrics}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="coordination" className="space-y-4">
            <CoordinationGraph 
              stats={dashboardData.coordination_stats}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <PatternInsights 
              insights={dashboardData.pattern_insights}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AITeamDashboard;