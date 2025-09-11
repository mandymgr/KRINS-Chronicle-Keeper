import React from 'react'
import { motion } from 'framer-motion'

interface SettingsProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
  metrics: any
  onResetMetrics: () => void
}

const Settings: React.FC<SettingsProps> = ({ 
  isDarkMode, 
  onToggleDarkMode, 
  metrics, 
  onResetMetrics 
}) => {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      
      {/* Appearance Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="trading-card p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">Dark Mode</div>
              <div className="text-sm text-gray-400">Toggle dark/light theme</div>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Performance Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="trading-card p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Performance</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">Reset Metrics</div>
              <div className="text-sm text-gray-400">Clear all performance data</div>
            </div>
            <button
              onClick={onResetMetrics}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">High Performance Mode</div>
              <div className="text-sm text-gray-400">Optimize for speed over visual effects</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* System Information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="trading-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">System Information</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Version:</span>
            <span className="text-white">1.0.0-revolutionary</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Engine:</span>
            <span className="text-white">Rust WASM + Go + React</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Target Performance:</span>
            <span className="text-green-400">1,000,000 TPS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Built by:</span>
            <span className="text-white">Krin & Mandy</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Settings