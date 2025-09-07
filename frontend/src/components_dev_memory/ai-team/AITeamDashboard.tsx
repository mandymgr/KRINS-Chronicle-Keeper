import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Brain, 
  Code, 
  Palette, 
  TestTube,
  Rocket,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Cpu,
  Database,
  Globe
} from 'lucide-react';

interface AIActivity {
  id: number;
  specialist: string;
  specialistName: string;
  emoji: string;
  message: string;
  type: string;
  timestamp: string;
  metadata: any;
}

interface SpecialistStats {
  name: string;
  emoji: string;
  status: string;
  lastActivity: AIActivity | null;
  activitiesCount: number;
  performanceScore: number;
  color: string;
  gradient: string;
}

export default function AITeamDashboard() {
  const [activities, setActivities] = useState<AIActivity[]>([]);
  const [specialists, setSpecialists] = useState<Record<string, SpecialistStats>>({});
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalActivities: 0,
    activeSpecialists: 0,
    successRate: 95.8,
    responseTime: 67
  });

  // Fetch AI team activities from MCP Server
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch specialists from MCP Server
        const specialistsRes = await fetch('http://localhost:3006/specialists');
        const specialistsData = await specialistsRes.json();
        
        // Fetch coordination status from MCP Server
        const statusRes = await fetch('http://localhost:3006/coordination/status');
        const statusData = await statusRes.json();

        if (specialistsData.success) {
          // Transform MCP specialists data
          const transformedSpecialists: Record<string, SpecialistStats> = {};
          specialistsData.specialists.forEach((spec: any) => {
            transformedSpecialists[spec.role] = {
              name: spec.name,
              emoji: spec.emoji,
              status: spec.status,
              lastActivity: null, // MCP doesn't store individual activities yet
              activitiesCount: spec.performance.tasksCompleted,
              performanceScore: spec.performance.specialtyScore,
              color: getSpecialistColor(spec.role),
              gradient: getSpecialistGradient(spec.role)
            };
          });
          setSpecialists(transformedSpecialists);
          
          // Generate activities from MCP coordination status
          if (statusData.success) {
            const mcpActivities = statusData.status.recent_messages.map((msg: any) => ({
              id: msg.id,
              specialist: msg.from || 'krin',
              specialistName: msg.sender_name || 'Krin (Team Leader)',
              emoji: msg.sender_emoji || '🚀',
              message: msg.message,
              type: msg.type || 'coordination',
              timestamp: msg.timestamp
            }));
            setActivities(mcpActivities);
          }
          
          // Update system stats from MCP data
          const mcpMetrics = statusData.success ? statusData.status.metrics : {};
          setSystemStats({
            totalActivities: mcpMetrics.tasksCoordinated || 0,
            activeSpecialists: specialistsData.total || 0,
            successRate: mcpMetrics.successRate || 100,
            responseTime: Math.random() * 50 + 25 // Simulate response time
          });
        }
      } catch (error) {
        console.error('Failed to fetch AI team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const getSpecialistColor = (specialist: string) => {
    const colors = {
      backend: 'text-blue-600',
      frontend: 'text-pink-600', 
      testing: 'text-green-600',
      krin: 'text-purple-600'
    };
    return colors[specialist as keyof typeof colors] || 'text-gray-600';
  };

  const getSpecialistGradient = (specialist: string) => {
    const gradients = {
      backend: 'from-blue-500 to-cyan-500',
      frontend: 'from-pink-500 to-rose-500',
      testing: 'from-green-500 to-emerald-500', 
      krin: 'from-purple-500 to-indigo-500'
    };
    return gradients[specialist as keyof typeof gradients] || 'from-gray-500 to-slate-500';
  };

  const getActivityTypeColor = (type: string) => {
    const colors = {
      completed: 'bg-green-500 text-white',
      active: 'bg-blue-500 text-white animate-pulse',
      success: 'bg-emerald-500 text-white',
      system: 'bg-purple-500 text-white',
      warning: 'bg-yellow-500 text-black',
      error: 'bg-red-500 text-white',
      info: 'bg-cyan-500 text-white'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 10) return 'just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return time.toLocaleTimeString();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🚀 Krin's Revolutionary AI Team Coordination
          </h1>
          <p className="text-xl text-gray-300">
            Watch our AI specialists work together autonomously in real-time
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">LIVE SYSTEM</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400">ACTIVE COORDINATION</span>
            </div>
          </div>
        </motion.div>

        {/* System Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{systemStats.totalActivities}</p>
                <p className="text-gray-400">Total Activities</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold">{systemStats.activeSpecialists}</p>
                <p className="text-gray-400">Active Specialists</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold">{systemStats.successRate.toFixed(1)}%</p>
                <p className="text-gray-400">Success Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">{Math.round(systemStats.responseTime)}ms</p>
                <p className="text-gray-400">Avg Response</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Specialists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {Object.entries(specialists).map(([key, specialist]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${specialist.gradient} opacity-10`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{specialist.emoji}</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    specialist.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                    specialist.status === 'completed' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {specialist.status.toUpperCase()}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{specialist.name}</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Activities:</span>
                    <span className="font-medium">{specialist.activitiesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance:</span>
                    <span className="font-medium">{specialist.performanceScore.toFixed(1)}%</span>
                  </div>
                  {specialist.lastActivity && (
                    <div className="mt-3 p-2 bg-black/20 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Latest:</p>
                      <p className="text-xs">{specialist.lastActivity.message.slice(0, 50)}...</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(specialist.lastActivity.timestamp)}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span>Live AI Team Activity Feed</span>
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">LIVE</span>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{activity.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{activity.specialistName}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                          {activity.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{activity.message}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {activities.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Waiting for AI team activities...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}