import React from 'react'
import { motion } from 'framer-motion'

interface MetricsData {
  fps?: number
  latency?: number
  memory?: number
  orderLatency?: number
  throughput?: number
  activeConnections?: number
}

interface PerformanceMetricsProps {
  metrics: MetricsData
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  const formatNumber = (num: number | undefined, decimals = 0, suffix = '') => {
    if (num === undefined) return 'N/A'
    return num.toFixed(decimals) + suffix
  }

  const formatBytes = (bytes: number | undefined) => {
    if (!bytes) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]
  }

  const getPerformanceColor = (value: number | undefined, thresholds: [number, number]) => {
    if (value === undefined) return 'text-gray-400'
    if (value <= thresholds[0]) return 'text-green-400'
    if (value <= thresholds[1]) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getLatencyColor = (latency: number | undefined) => {
    return getPerformanceColor(latency, [10, 50]) // < 10ms good, < 50ms warning, > 50ms bad
  }

  const getFpsColor = (fps: number | undefined) => {
    if (!fps) return 'text-gray-400'
    if (fps >= 50) return 'text-green-400'
    if (fps >= 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  const metricItems = [
    {
      label: 'FPS',
      value: formatNumber(metrics.fps, 0),
      color: getFpsColor(metrics.fps),
      icon: '📊',
      description: 'UI Frames per Second'
    },
    {
      label: 'Latency',
      value: formatNumber(metrics.latency, 1, 'ms'),
      color: getLatencyColor(metrics.latency),
      icon: '⚡',
      description: 'WebSocket Latency'
    },
    {
      label: 'Memory',
      value: formatBytes(metrics.memory),
      color: getPerformanceColor(metrics.memory, [100 * 1024 * 1024, 500 * 1024 * 1024]), // 100MB, 500MB
      icon: '🧠',
      description: 'Memory Usage'
    },
    {
      label: 'Order Latency',
      value: formatNumber(metrics.orderLatency, 2, 'ms'),
      color: getLatencyColor(metrics.orderLatency),
      icon: '🎯',
      description: 'Order Processing Time'
    },
    {
      label: 'Throughput',
      value: formatNumber(metrics.throughput, 0, '/s'),
      color: 'text-blue-400',
      icon: '🚀',
      description: 'Orders per Second'
    },
    {
      label: 'Connections',
      value: formatNumber(metrics.activeConnections, 0),
      color: 'text-purple-400',
      icon: '🔗',
      description: 'Active WebSocket Connections'
    }
  ]

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Performance Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {metricItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-gray-700/50 rounded-lg p-3 flex flex-col justify-between hover:bg-gray-700/70 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{item.icon}</span>
              <span className="text-xs text-gray-400">{item.label}</span>
            </div>
            
            <div className={`text-lg font-bold ${item.color} font-mono`}>
              {item.value}
            </div>
            
            <div className="text-xs text-gray-500 mt-1 truncate" title={item.description}>
              {item.description}
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Status */}
      <div className="bg-gray-700/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">System Status</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Operational</span>
          </div>
        </div>

        {/* Performance Bars */}
        <div className="space-y-2">
          {/* CPU Usage (simulated) */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">CPU</span>
            <span className="text-gray-300">34%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1.5">
            <motion.div 
              className="bg-green-400 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '34%' }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </div>

          {/* Memory Usage */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">RAM</span>
            <span className="text-gray-300">
              {metrics.memory ? Math.floor((metrics.memory / (1024 * 1024 * 1024)) * 100) : 45}%
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1.5">
            <motion.div 
              className="bg-yellow-400 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: metrics.memory 
                  ? `${Math.floor((metrics.memory / (1024 * 1024 * 1024)) * 100)}%`
                  : '45%'
              }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />
          </div>

          {/* Network */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Network</span>
            <span className="text-gray-300">12%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1.5">
            <motion.div 
              className="bg-blue-400 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '12%' }}
              transition={{ duration: 0.8, delay: 0.9 }}
            />
          </div>
        </div>
      </div>

      {/* Performance Target */}
      <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-3 border border-green-700/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-400">🎯 Performance Target</span>
          <span className="text-xs text-green-400">1M TPS</span>
        </div>
        
        <div className="text-xs text-gray-300 space-y-1">
          <div className="flex justify-between">
            <span>Target Latency:</span>
            <span>&lt; 1ms</span>
          </div>
          <div className="flex justify-between">
            <span>Current Status:</span>
            <span className={
              (metrics.latency && metrics.latency < 10) 
                ? 'text-green-400' 
                : 'text-yellow-400'
            }>
              {(metrics.latency && metrics.latency < 10) ? '✅ Excellent' : '⚠️ Good'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceMetrics