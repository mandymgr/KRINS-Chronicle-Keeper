import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Brain, Zap } from 'lucide-react';
import { CoordinationCard } from '../ui/CoordinationCard';
import { StatusBadge } from '../ui/StatusBadge';
import { SpecialistCardProps } from '../../../types/coordination.types';

const getSpecialistGradient = (role: string) => {
  const gradients = {
    backend: 'from-blue-500 to-cyan-500',
    frontend: 'from-pink-500 to-rose-500',
    testing: 'from-green-500 to-emerald-500', 
    devops: 'from-purple-500 to-indigo-500',
    security: 'from-red-500 to-orange-500',
    ai_ml: 'from-violet-500 to-purple-500',
    ui_ux: 'from-pink-500 to-yellow-500',
    data: 'from-cyan-500 to-blue-500'
  };
  return gradients[role as keyof typeof gradients] || 'from-gray-500 to-slate-500';
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

export const SpecialistCard: React.FC<SpecialistCardProps> = ({
  specialist,
  onClick,
  showDetails = true,
  className = ''
}) => {
  const gradient = getSpecialistGradient(specialist.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <CoordinationCard 
        className="ai-specialist-card cursor-pointer group relative overflow-hidden"
        onClick={onClick}
      >
        {/* Background Gradient */}
        <div className={`ai-specialist-gradient bg-gradient-to-br ${gradient}`} />
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{specialist.emoji}</span>
            <div>
              <h3 className="font-bold text-lg text-coordination-primary">
                {specialist.name}
              </h3>
              <p className="text-sm text-coordination-secondary capitalize">
                {specialist.role.replace('_', ' ')} Specialist
              </p>
            </div>
          </div>
          <StatusBadge status={specialist.status} />
        </div>

        {/* Performance Metrics */}
        <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-coordination-secondary">Tasks</span>
            </div>
            <p className="text-xl font-bold text-coordination-primary">
              {specialist.performance.tasksCompleted}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-coordination-secondary">Success</span>
            </div>
            <p className="text-xl font-bold text-coordination-primary">
              {specialist.performance.successRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Detailed Stats */}
        {showDetails && (
          <div className="relative z-10 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-coordination-secondary">Response Time:</span>
              <span className="font-medium text-coordination-primary">
                {Math.round(specialist.performance.averageResponseTime)}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-coordination-secondary">Specialty Score:</span>
              <span className="font-medium text-coordination-primary">
                {specialist.performance.specialtyScore.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-coordination-secondary">Active Tasks:</span>
              <span className="font-medium text-coordination-primary">
                {specialist.current_tasks.length}
              </span>
            </div>
          </div>
        )}

        {/* Memory Stats */}
        <div className="relative z-10 mt-4 p-3 bg-black/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-coordination-secondary">Memory Items</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="font-medium text-coordination-primary">
                {specialist.memory_items.learnings}
              </p>
              <p className="text-coordination-secondary">Learnings</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-coordination-primary">
                {specialist.memory_items.patterns}
              </p>
              <p className="text-coordination-secondary">Patterns</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-coordination-primary">
                {specialist.memory_items.collaborations}
              </p>
              <p className="text-coordination-secondary">Collabs</p>
            </div>
          </div>
        </div>

        {/* Capabilities Preview */}
        <div className="relative z-10 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-coordination-secondary">Top Capabilities:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {specialist.capabilities.slice(0, 3).map((capability, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded"
              >
                {capability}
              </span>
            ))}
            {specialist.capabilities.length > 3 && (
              <span className="px-2 py-1 text-xs bg-slate-600/50 text-slate-400 rounded">
                +{specialist.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Hover Effect Indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
      </CoordinationCard>
    </motion.div>
  );
};

export default SpecialistCard;