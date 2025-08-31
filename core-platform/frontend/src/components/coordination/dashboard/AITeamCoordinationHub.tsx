import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, TrendingUp, Clock, Cpu, Zap, Brain, Globe, MessageSquare, Box } from 'lucide-react';
import { CoordinationCard } from '../ui/CoordinationCard';
import { StatusBadge } from '../ui/StatusBadge';
import { SpecialistCard } from '../ai/SpecialistCard';
import { CommunicationFeed } from '../ai/CommunicationFeed';
import { useWebSocketConnection } from '../../../hooks/useWebSocketConnection';
import { AISpecialist, AIMessage, AIActivity, CoordinationStatus } from '../../../types/coordination.types';

interface SystemMetrics {
  totalActivities: number;
  activeSpecialists: number;
  successRate: number;
  responseTime: number;
  messagesPerMinute: number;
  tasksCompleted: number;
}

export const AITeamCoordinationHub: React.FC = () => {
  const [specialists, setSpecialists] = useState<AISpecialist[]>([]);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [activities, setActivities] = useState<AIActivity[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalActivities: 0,
    activeSpecialists: 0,
    successRate: 98.5,
    responseTime: 67,
    messagesPerMinute: 12,
    tasksCompleted: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);

  // WebSocket connection to MCP Server
  const ws = useWebSocketConnection({
    url: 'ws://localhost:3007/ws', // MCP Server WebSocket port
    reconnectDelay: 3000,
    maxReconnectAttempts: 5
  });

  // Subscribe to WebSocket events
  useEffect(() => {
    // Subscribe to all event types once connected
    if (ws.isConnected && ws.sendMessage) {
      ws.sendMessage({
        type: 'subscribe',
        events: ['activity', 'specialist_update', 'message', 'connection_ack']
      });
    }

    const unsubscribeActivity = ws.onActivity((activity: AIActivity) => {
      setActivities(prev => [activity, ...prev].slice(0, 100)); // Keep last 100
      
      // Update metrics based on activities
      setMetrics(prev => ({
        ...prev,
        totalActivities: prev.totalActivities + 1,
        messagesPerMinute: activities.length // Approximate based on recent activities
      }));
    });

    const unsubscribeMessage = ws.onMessage((message: AIMessage) => {
      setMessages(prev => [message, ...prev].slice(0, 100)); // Keep last 100
    });

    const unsubscribeSpecialist = ws.onSpecialistUpdate((specialist: AISpecialist) => {
      setSpecialists(prev => {
        const existing = prev.findIndex(s => s.id === specialist.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = specialist;
          
          // Update metrics from specialist data
          const totalTasks = updated.reduce((sum, s) => sum + s.performance.tasksCompleted, 0);
          const avgSuccessRate = updated.reduce((sum, s) => sum + s.performance.successRate, 0) / updated.length;
          const avgResponseTime = updated.reduce((sum, s) => sum + s.performance.averageResponseTime, 0) / updated.length;
          
          setMetrics(prev => ({
            ...prev,
            activeSpecialists: updated.length,
            tasksCompleted: totalTasks,
            successRate: avgSuccessRate || 100,
            responseTime: avgResponseTime || 0
          }));
          
          return updated;
        }
        
        const newSpecialists = [...prev, specialist];
        setMetrics(prev => ({
          ...prev,
          activeSpecialists: newSpecialists.length
        }));
        
        return newSpecialists;
      });
    });

    return () => {
      unsubscribeActivity();
      unsubscribeMessage();
      unsubscribeSpecialist();
    };
  }, [ws, activities.length]);

  // Fetch initial data from MCP Server (only once on mount)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch specialists
        const specialistsRes = await fetch('http://localhost:3006/specialists');
        const specialistsData = await specialistsRes.json();
        
        // Fetch coordination status
        const statusRes = await fetch('http://localhost:3006/coordination/status');
        const statusData = await statusRes.json();

        if (specialistsData.success) {
          setSpecialists(specialistsData.specialists);
          
          // Update metrics
          setMetrics(prev => ({
            ...prev,
            activeSpecialists: specialistsData.total,
            tasksCompleted: specialistsData.specialists.reduce((sum: number, s: AISpecialist) => 
              sum + s.performance.tasksCompleted, 0
            )
          }));
        }

        if (statusData.success) {
          const status: CoordinationStatus = statusData.status;
          setMetrics(prev => ({
            ...prev,
            totalActivities: status.performance?.tasksCompleted || 0,
            successRate: status.performance?.success_rate || 100,
            responseTime: status.performance?.average_response_time || 0
          }));
        }

      } catch (error) {
        console.error('Failed to fetch initial AI team data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch once on mount - updates come via WebSocket
    fetchInitialData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="coordination-fade-in p-8 space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          🚀 AI Team Coordination Hub
        </h1>
        <p className="text-xl text-coordination-secondary mb-6">
          Revolutionary autonomous AI specialist collaboration system
        </p>
        
        {/* Connection Status */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              ws.isConnected ? 'bg-green-400 live-indicator' : 'bg-red-400'
            }`} />
            <span className={`text-sm font-medium ${
              ws.isConnected ? 'text-green-400' : 'text-red-400'
            }`}>
              {ws.isConnected ? 'LIVE SYSTEM' : 'DISCONNECTED'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">
              ACTIVE COORDINATION
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">
              PERSISTENT MEMORY
            </span>
          </div>
        </div>
      </motion.div>

      {/* System Metrics */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8"
      >
        <CoordinationCard size="sm" className="text-center">
          <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-coordination-primary">{metrics.totalActivities}</p>
          <p className="text-xs text-coordination-secondary">Total Activities</p>
        </CoordinationCard>
        
        <CoordinationCard size="sm" className="text-center">
          <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-coordination-primary">{metrics.activeSpecialists}</p>
          <p className="text-xs text-coordination-secondary">Active Specialists</p>
        </CoordinationCard>
        
        <CoordinationCard size="sm" className="text-center">
          <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-coordination-primary">{metrics.successRate.toFixed(1)}%</p>
          <p className="text-xs text-coordination-secondary">Success Rate</p>
        </CoordinationCard>
        
        <CoordinationCard size="sm" className="text-center">
          <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-coordination-primary">{Math.round(metrics.responseTime)}ms</p>
          <p className="text-xs text-coordination-secondary">Avg Response</p>
        </CoordinationCard>

        <CoordinationCard size="sm" className="text-center">
          <MessageSquare className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-coordination-primary">{messages.length}</p>
          <p className="text-xs text-coordination-secondary">Messages</p>
        </CoordinationCard>

        <CoordinationCard size="sm" className="text-center">
          <Cpu className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-coordination-primary">{metrics.tasksCompleted}</p>
          <p className="text-xs text-coordination-secondary">Tasks Done</p>
        </CoordinationCard>
      </motion.div>

      {/* AI Specialists Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-coordination-primary flex items-center gap-3">
            <Box className="w-6 h-6 text-blue-400" />
            AI Specialist Team
          </h2>
          <div className="flex items-center gap-4">
            <StatusBadge status="active" />
            <span className="text-sm text-coordination-secondary">
              {specialists.filter(s => s.status === 'active' || s.status === 'busy').length} active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {specialists.map((specialist) => (
            <SpecialistCard
              key={specialist.id}
              specialist={specialist}
              onClick={() => setSelectedSpecialist(
                selectedSpecialist === specialist.id ? null : specialist.id
              )}
              showDetails={selectedSpecialist === specialist.id}
            />
          ))}
        </div>

        {specialists.length === 0 && (
          <CoordinationCard className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No AI specialists active</p>
            <p className="text-sm text-gray-500">
              Specialists will appear here when they come online
            </p>
          </CoordinationCard>
        )}
      </div>

      {/* Communication Feed */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-coordination-primary flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-yellow-400" />
          Live Communication & Activities
        </h2>
        
        <CommunicationFeed 
          messages={messages}
          activities={activities}
          maxItems={50}
        />
      </div>

      {/* WebSocket Connection Status */}
      {ws.error && (
        <CoordinationCard className="border-red-500/50 bg-red-500/10">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-400 rounded-full" />
            <div>
              <p className="text-red-400 font-medium">Connection Error</p>
              <p className="text-sm text-red-300">{ws.error}</p>
            </div>
            <button
              onClick={ws.connect}
              className="ml-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </CoordinationCard>
      )}
    </div>
  );
};

export default AITeamCoordinationHub;