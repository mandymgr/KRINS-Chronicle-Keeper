import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  Star,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface PatternMetrics {
  totalPatterns: number;
  activePatterns: number;
  averageUsage: number;
  averageEffectiveness: number;
  adoptionRate: number;
  lastUpdated: string;
  topCategories: Array<{
    name: string;
    usage: number;
    count: number;
  }>;
}

interface Pattern {
  id: string;
  name: string;
  category: string;
  usageCount: number;
  successRate: number;
  effectiveness: number;
  teamAdoption: number;
  lastUsed: string;
}

interface TrendPoint {
  timestamp: string;
  totalUsage: number;
  activePatterns: number;
  averageEffectiveness: number;
}

interface AnalyticsData {
  timestamp: string;
  metrics: PatternMetrics;
  patterns: Pattern[];
  trends: TrendPoint[];
  categories: Array<{
    name: string;
    usage: number;
    count: number;
  }>;
}

export default function PatternAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAnalyticsData();
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadAnalyticsData = async () => {
    try {
      // In a real implementation, this would call the pattern analytics API
      // For now, we'll simulate the data
      const simulatedData = generateSimulatedAnalytics();
      setAnalyticsData(simulatedData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSimulatedAnalytics = (): AnalyticsData => {
    const categories = [
      { name: 'backend', usage: 156, count: 8 },
      { name: 'frontend', usage: 134, count: 6 },
      { name: 'security', usage: 89, count: 4 },
      { name: 'performance', usage: 67, count: 3 },
      { name: 'testing', usage: 45, count: 2 }
    ];

    const patterns = [
      {
        id: 'api-rate-limiting',
        name: 'API Rate Limiting',
        category: 'backend',
        usageCount: 45,
        successRate: 94,
        effectiveness: 92,
        teamAdoption: 4,
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'component-composition',
        name: 'Component Composition',
        category: 'frontend',
        usageCount: 38,
        successRate: 89,
        effectiveness: 87,
        teamAdoption: 3,
        lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'authentication-service',
        name: 'Authentication Service',
        category: 'security',
        usageCount: 32,
        successRate: 96,
        effectiveness: 95,
        teamAdoption: 5,
        lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];

    const trends = Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (20 - i) * 5 * 60 * 1000).toISOString(),
      totalUsage: 400 + Math.sin(i * 0.3) * 50 + Math.random() * 20,
      activePatterns: 15 + Math.floor(Math.random() * 3),
      averageEffectiveness: 85 + Math.random() * 10
    }));

    return {
      timestamp: new Date().toISOString(),
      metrics: {
        totalPatterns: 23,
        activePatterns: 18,
        averageUsage: 421,
        averageEffectiveness: 89.2,
        adoptionRate: 78,
        lastUpdated: new Date().toISOString(),
        topCategories: categories
      },
      patterns,
      trends,
      categories
    };
  };

  const getTrendDirection = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (change > 2) return { direction: 'up', color: 'text-green-400', icon: ArrowUp };
    if (change < -2) return { direction: 'down', color: 'text-red-400', icon: ArrowDown };
    return { direction: 'stable', color: 'text-gray-400', icon: Minus };
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const { metrics, patterns, trends } = analyticsData;
  const latestTrend = trends[trends.length - 1];
  const previousTrend = trends[trends.length - 2];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                📊 Pattern Analytics Dashboard
              </h1>
              <p className="text-gray-300 text-lg">
                Real-time insights into pattern usage, adoption, and effectiveness
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-300">
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </span>
              </div>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  autoRefresh 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/50 hover:bg-gray-400/20'
                }`}
              >
                {autoRefresh ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            Last updated: {formatTimeAgo(metrics.lastUpdated)}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Patterns</p>
                <p className="text-3xl font-bold">{metrics.totalPatterns}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-4 text-sm text-gray-300">
              {metrics.activePatterns} active patterns
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Avg Usage</p>
                <p className="text-3xl font-bold">{Math.round(metrics.averageUsage)}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              {previousTrend && (() => {
                const trend = getTrendDirection(latestTrend.totalUsage, previousTrend.totalUsage);
                const TrendIcon = trend.icon;
                return (
                  <>
                    <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                    <span className={`text-sm ${trend.color}`}>
                      {trend.direction === 'stable' ? 'Stable' : `${trend.direction === 'up' ? '+' : ''}${Math.round(((latestTrend.totalUsage - previousTrend.totalUsage) / previousTrend.totalUsage) * 100)}%`}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Effectiveness</p>
                <p className="text-3xl font-bold">{Math.round(metrics.averageEffectiveness)}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.averageEffectiveness}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Adoption Rate</p>
                <p className="text-3xl font-bold">{metrics.adoptionRate}%</p>
              </div>
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="mt-4 text-sm text-gray-300">
              {Math.round(metrics.totalPatterns * metrics.adoptionRate / 100)} adopted patterns
            </div>
          </div>
        </motion.div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Top Performing Patterns */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-400" />
                <span>Top Performing Patterns</span>
              </h2>
              <span className="text-sm text-gray-400">By effectiveness</span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {patterns.map((pattern, index) => (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{pattern.name}</p>
                        <p className="text-sm text-gray-400 capitalize">{pattern.category}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">{pattern.effectiveness}%</span>
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${pattern.effectiveness}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {pattern.usageCount} uses • {pattern.teamAdoption} teams
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Zap className="w-6 h-6 text-blue-400" />
                <span>Category Performance</span>
              </h2>
              <span className="text-sm text-gray-400">Usage distribution</span>
            </div>

            <div className="space-y-4">
              {metrics.topCategories.map((category, index) => {
                const maxUsage = Math.max(...metrics.topCategories.map(c => c.usage));
                const percentage = (category.usage / maxUsage) * 100;
                
                return (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{category.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium">{category.usage} uses</span>
                        <div className="text-xs text-gray-500">{category.count} patterns</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      ></motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Usage Trends */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span>Usage Trends</span>
            </h2>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Real-time data</span>
            </div>
          </div>

          <div className="h-64 flex items-end space-x-2">
            {trends.slice(-12).map((trend, index) => {
              const maxUsage = Math.max(...trends.map(t => t.totalUsage));
              const height = (trend.totalUsage / maxUsage) * 100;
              
              return (
                <motion.div
                  key={trend.timestamp}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg min-h-[4px] hover:from-purple-400 hover:to-blue-400 transition-all cursor-pointer"
                  title={`Usage: ${Math.round(trend.totalUsage)} at ${new Date(trend.timestamp).toLocaleTimeString()}`}
                ></motion.div>
              );
            })}
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-400">
            Last 12 data points (6 minutes)
          </div>
        </motion.div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  );
}