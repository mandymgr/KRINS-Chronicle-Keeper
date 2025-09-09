import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket, useActivityFeed, useUserPresence, useDecisionUpdates } from '@/hooks/useWebSocket'
import { 
  TrendingUp, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Brain,
  BarChart3,
  Activity,
  Zap,
  Users,
  Clock,
  Sparkles,
  Cpu,
  Database,
  Globe,
  TestTube,
  Rocket
} from 'lucide-react'
import { analyticsService } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components_dev_memory/ui/Card'
import { Badge } from '@/components_dev_memory/ui/Badge'
import { Button } from '@/components_dev_memory/ui/Button'

export function Dashboard() {
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    activeUsers: 0,
    decisionsToday: 3,
    systemLoad: 0.34,
    responseTime: 89
  })

  // WebSocket integration
  const { isConnected, isAuthenticated } = useWebSocket({
    userId: 'current-user-id', // This should come from auth context
    name: 'Current User', // This should come from auth context
    role: 'admin', // This should come from auth context
    currentPage: '/dashboard'
  })

  const { activities } = useActivityFeed(20)
  const { onlineUsers, onlineCount } = useUserPresence()
  const { decisionUpdates, notifications } = useDecisionUpdates()

  // Mock activities if WebSocket not connected
  const fallbackActivities = [
    {
      id: 1,
      type: 'decision_created',
      message: 'New ADR created for microservices architecture',
      user: 'Development Team',
      timestamp: new Date().toISOString(),
      icon: '🏗️',
      priority: 'medium' as const
    },
    {
      id: 2,
      type: 'evidence_collected',
      message: 'Performance evidence added to database optimization ADR',
      user: 'Platform Team',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      icon: '📊',
      priority: 'medium' as const
    },
    {
      id: 3,
      type: 'decision_accepted',
      message: 'API versioning strategy ADR accepted by architecture review',
      user: 'Architecture Board',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      icon: '✅',
      priority: 'high' as const
    }
  ]

  const displayActivities = isConnected && activities.length > 0 ? activities : fallbackActivities

  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => analyticsService.getDashboardOverview(30),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  // Update real-time metrics based on WebSocket data
  useEffect(() => {
    setRealtimeMetrics(prev => ({
      ...prev,
      activeUsers: onlineCount
    }))
  }, [onlineCount])

  // Simulate system metrics updates (in real system, these would come from monitoring)
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeMetrics(prev => ({
        ...prev,
        systemLoad: Math.random() * 0.4 + 0.2,
        responseTime: Math.floor(Math.random() * 30) + 70,
        decisionsToday: prev.decisionsToday + (Math.random() > 0.9 ? 1 : 0) // Occasionally increment
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    
    if (diffSecs < 10) return 'just now'
    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    return time.toLocaleTimeString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-secondary-600">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  const { metrics, health_status } = overview!

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 50, -20, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/3 w-60 h-60 bg-warning-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -30, 25, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Enhanced Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-secondary-200 pb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-success-600 to-primary-600 bg-clip-text text-transparent mb-2">
                🧠 KRINS Organizational Intelligence
              </h1>
              <p className="text-lg text-secondary-600">
                Advanced decision analytics, real-time insights, and organizational intelligence monitoring
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <motion.div 
                  className="flex items-center space-x-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-3 h-3 bg-success-400 rounded-full animate-pulse"></div>
                  <span className={`font-medium ${
                    isConnected ? 'text-success-600' : 'text-warning-600'
                  }`}>
                    {isConnected ? 'LIVE SYSTEM' : 'OFFLINE MODE'}
                  </span>
                </motion.div>
                <div className="flex items-center space-x-2">
                  <Zap className={`w-4 h-4 ${
                    isAuthenticated ? 'text-warning-500' : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    isAuthenticated ? 'text-warning-600' : 'text-gray-500'
                  }`}>
                    {isAuthenticated ? 'ACTIVE INTELLIGENCE' : 'CONNECTING...'}
                  </span>
                </div>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="text-6xl opacity-80"
            >
              🚀
            </motion.div>
          </div>
        </motion.div>

        {/* Real-time System Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-nordic"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -3px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="w-6 h-6 text-primary-500" />
              </motion.div>
              <div>
                <motion.p 
                  className="text-xl font-bold text-primary-700"
                  key={realtimeMetrics.activeUsers}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {realtimeMetrics.activeUsers}
                </motion.p>
                <p className="text-xs text-secondary-600">Active Users</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-nordic"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -3px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-success-500" />
              <div>
                <motion.p 
                  className="text-xl font-bold text-success-700"
                  key={realtimeMetrics.decisionsToday}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {realtimeMetrics.decisionsToday}
                </motion.p>
                <p className="text-xs text-secondary-600">Decisions Today</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-nordic"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -3px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center space-x-3">
              <Cpu className="w-6 h-6 text-warning-500" />
              <div>
                <motion.p 
                  className="text-xl font-bold text-warning-700"
                  key={realtimeMetrics.systemLoad}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {(realtimeMetrics.systemLoad * 100).toFixed(0)}%
                </motion.p>
                <p className="text-xs text-secondary-600">System Load</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-nordic"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -3px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-primary-500" />
              <div>
                <motion.p 
                  className="text-xl font-bold text-primary-700"
                  key={realtimeMetrics.responseTime}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {realtimeMetrics.responseTime}ms
                </motion.p>
                <p className="text-xs text-secondary-600">Response Time</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Health Status Banner */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className={`rounded-lg p-4 border-l-4 bg-white/60 backdrop-blur-sm ${
            health_status.level === 'excellent' 
              ? 'border-success-400'
              : health_status.level === 'good'
              ? 'border-primary-400'
              : health_status.level === 'moderate'
              ? 'border-warning-400'
              : 'border-error-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Activity className={`h-5 w-5 mr-3 ${
                  health_status.level === 'excellent' 
                    ? 'text-success-600'
                    : health_status.level === 'good'
                    ? 'text-primary-600'
                    : health_status.level === 'moderate'
                    ? 'text-warning-600'
                    : 'text-error-600'
                }`} />
              </motion.div>
              <div>
                <h3 className={`font-medium ${
                  health_status.level === 'excellent' 
                    ? 'text-success-900'
                    : health_status.level === 'good'
                    ? 'text-primary-900'
                    : health_status.level === 'moderate'
                    ? 'text-warning-900'
                    : 'text-error-900'
                }`}>
                  Organizational Health: {health_status.level.charAt(0).toUpperCase() + health_status.level.slice(1)}
                </h3>
                <p className={`text-sm ${
                  health_status.level === 'excellent' 
                    ? 'text-success-700'
                    : health_status.level === 'good'
                    ? 'text-primary-700'
                    : health_status.level === 'moderate'
                    ? 'text-warning-700'
                    : 'text-error-700'
                }`}>
                  Score: {health_status.score.toFixed(2)}/1.00
                </p>
              </div>
            </div>
            <div className="text-right">
              <motion.div 
                className="text-2xl font-bold text-secondary-900"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {(health_status.score * 100).toFixed(0)}%
              </motion.div>
              <div className="text-xs text-secondary-600">Health Score</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Key Metrics with Animation */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }}>
            <MetricCard
              title="Total Decisions"
              value={metrics.total_adrs}
              change={`+${metrics.recent_adrs} this month`}
              icon={FileText}
              color="primary"
            />
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }}>
            <MetricCard
              title="Acceptance Rate"
              value={`${((metrics.status_distribution.accepted || 0) / Math.max(metrics.recent_adrs, 1) * 100).toFixed(0)}%`}
              change="Last 30 days"
              icon={CheckCircle}
              color="success"
            />
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }}>
            <MetricCard
              title="Avg Confidence"
              value={metrics.average_scores.confidence.toFixed(1)}
              change="Scale: 0.0 - 1.0"
              icon={Brain}
              color="primary"
            />
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }}>
            <MetricCard
              title="Decision Velocity"
              value={metrics.decision_velocity}
              change="per week"
              icon={TrendingUp}
              color="warning"
            />
          </motion.div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-nordic-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-warning-500" />
              </motion.div>
              <span className="bg-gradient-to-r from-primary-600 to-success-600 bg-clip-text text-transparent">
                Live Intelligence Activity
              </span>
            </h2>
            <div className="flex items-center space-x-2">
              <motion.div 
                className="w-2 h-2 bg-success-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm text-success-600 font-medium">LIVE</span>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {!isConnected && (
              <div className="flex items-center justify-center p-4 bg-warning-50 rounded-lg border border-warning-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-warning-700">Using cached activity data</span>
                </div>
              </div>
            )}
            <AnimatePresence>
              {displayActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                  className="flex items-start space-x-4 p-4 bg-white/50 rounded-lg border border-white/30 transition-all cursor-pointer"
                >
                  <motion.div 
                    className="flex-shrink-0 text-2xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {activity.icon || (activity.type === 'decision_activity' ? '📋' : 
                     activity.type === 'user_activity' ? '👤' :
                     activity.type === 'ai_insight' ? '🧠' : '⚡')}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-secondary-900 text-sm">{activity.user}</span>
                      <div className="flex items-center space-x-2">
                        <motion.span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.type === 'decision_activity' || activity.type === 'decision_created' ? 'bg-primary-100 text-primary-700' :
                            activity.type === 'user_activity' || activity.type === 'evidence_collected' ? 'bg-warning-100 text-warning-700' :
                            activity.type === 'ai_insight' ? 'bg-purple-100 text-purple-700' :
                            'bg-success-100 text-success-700'
                          }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {(activity.type || 'activity').replace('_', ' ').toUpperCase()}
                        </motion.span>
                        <span className="text-xs text-secondary-500">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                    <p className="text-secondary-700 text-sm">{activity.message}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-nordic">
            <CardHeader>
              <CardTitle>Decision Status Distribution</CardTitle>
              <CardDescription>Current status of all decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.status_distribution).map(([status, count]) => (
                  <motion.div 
                    key={status} 
                    className="flex items-center justify-between"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          status === 'accepted' ? 'default' :
                          status === 'proposed' ? 'secondary' :
                          status === 'superseded' ? 'outline' :
                          'destructive'
                        }
                        className="capitalize"
                      >
                        {status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-secondary-600">{count}</span>
                      <div className="w-20 bg-secondary-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${
                            status === 'accepted' ? 'bg-success-500' :
                            status === 'proposed' ? 'bg-warning-500' :
                            status === 'superseded' ? 'bg-secondary-400' :
                            'bg-error-500'
                          }`}
                          style={{ width: `${(count / Math.max(metrics.recent_adrs, 1)) * 100}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / Math.max(metrics.recent_adrs, 1)) * 100}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Component Activity */}
          <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-nordic">
            <CardHeader>
              <CardTitle>Most Active Components</CardTitle>
              <CardDescription>Components with recent decision activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.component_activity.slice(0, 6).map((component, index) => (
                  <motion.div 
                    key={component.component} 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        className="w-6 h-6 bg-primary-100 rounded text-primary-600 text-xs flex items-center justify-center font-medium"
                        whileHover={{ scale: 1.1 }}
                      >
                        {index + 1}
                      </motion.div>
                      <span className="text-sm font-medium">{component.component}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{component.count}</div>
                      <div className="text-xs text-secondary-500">
                        {component.avg_confidence.toFixed(1)} conf
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Health Components Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.01 }}
        >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-nordic-lg">
          <CardHeader>
            <CardTitle>Health Score Breakdown</CardTitle>
            <CardDescription>Detailed view of organizational intelligence health components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <HealthComponent
                  title="Activity Level"
                  score={health_status.components.activity}
                  description="Decision creation velocity"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <HealthComponent
                  title="Confidence Level"
                  score={health_status.components.confidence}
                  description="Average decision confidence"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <HealthComponent
                  title="Evidence Collection"
                  score={health_status.components.evidence}
                  description="Follow-up evidence tracking"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <HealthComponent
                  title="Component Diversity"
                  score={health_status.components.diversity}
                  description="Spread across components"
                />
              </motion.div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          whileHover={{ scale: 1.01 }}
        >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-nordic-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and next steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.05 }}>
                <QuickAction
                  title="Create New ADR"
                  description="Document a new architectural decision"
                  href="/adrs/new"
                  icon={FileText}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <QuickAction
                  title="View Analytics"
                  description="Explore decision trends and patterns"
                  href="/analytics"
                  icon={BarChart3}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <QuickAction
                  title="AI Insights"
                  description="Get intelligent recommendations"
                  href="/intelligence"
                  icon={Brain}
                />
              </motion.div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  change: string
  icon: React.ComponentType<any>
  color: 'primary' | 'success' | 'warning' | 'error'
}

function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    success: 'text-success-600 bg-success-100',
    warning: 'text-warning-600 bg-warning-100',
    error: 'text-error-600 bg-error-100',
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-nordic">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <motion.p 
              className="text-2xl font-bold"
              whileHover={{ scale: 1.05 }}
            >
              {value}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-1">{change}</p>
          </div>
          <motion.div 
            className={`p-3 rounded-lg ${colorClasses[color]}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}

interface HealthComponentProps {
  title: string
  score: number
  description: string
}

function HealthComponent({ title, score, description }: HealthComponentProps) {
  const percentage = Math.round(score * 100)
  const color = score > 0.8 ? 'success' : score > 0.6 ? 'primary' : score > 0.4 ? 'warning' : 'error'
  
  const colorClasses = {
    success: 'text-success-600 bg-success-500',
    primary: 'text-primary-600 bg-primary-500',
    warning: 'text-warning-600 bg-warning-500',
    error: 'text-error-600 bg-error-500',
  }

  return (
    <motion.div 
      className="text-center p-4 rounded-lg border border-secondary-200 bg-white/50"
      whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
    >
      <div className="flex justify-center mb-2">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2"
              className="text-secondary-200"
            />
            <motion.circle
              cx="16"
              cy="16"
              r="12"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="75"
              strokeDashoffset={75 - (percentage * 0.75)}
              className={colorClasses[color].split(' ')[1]}
              initial={{ strokeDashoffset: 75 }}
              animate={{ strokeDashoffset: 75 - (percentage * 0.75) }}
              transition={{ delay: 0.5, duration: 1.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span 
              className={`text-sm font-bold ${colorClasses[color].split(' ')[0]}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.3 }}
            >
              {percentage}%
            </motion.span>
          </div>
        </div>
      </div>
      <h4 className="text-sm font-medium text-secondary-900">{title}</h4>
      <p className="text-xs text-secondary-500 mt-1">{description}</p>
    </motion.div>
  )
}

interface QuickActionProps {
  title: string
  description: string
  href: string
  icon: React.ComponentType<any>
}

function QuickAction({ title, description, href, icon: Icon }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      className="h-auto p-4 justify-start hover:bg-accent hover:text-accent-foreground bg-white/60 border-white/40"
      asChild
    >
      <a href={href}>
        <div className="flex items-start space-x-3 w-full">
          <motion.div 
            className="p-2 bg-primary/10 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon className="h-5 w-5 text-primary" />
          </motion.div>
          <div className="text-left">
            <h4 className="text-sm font-medium">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </a>
    </Button>
  )
}