import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  Zap
} from 'lucide-react';

export interface Insight {
  id: string;
  type: 'recommendation' | 'warning' | 'trend' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  relatedDecisions?: string[];
}

export interface IntelligenceInsightsProps {
  insights: Insight[];
  className?: string;
}

const insightConfig = {
  recommendation: {
    icon: Lightbulb,
    color: 'var(--color-ai-primary)',
    bgColor: 'var(--color-ai-primary)',
    emoji: '💡'
  },
  warning: {
    icon: AlertTriangle,
    color: 'var(--color-brand-warning)',
    bgColor: 'var(--color-brand-warning)', 
    emoji: '⚠️'
  },
  trend: {
    icon: TrendingUp,
    color: 'var(--color-brand-success)',
    bgColor: 'var(--color-brand-success)',
    emoji: '📈'
  },
  opportunity: {
    icon: Target,
    color: 'var(--color-brand-accent)',
    bgColor: 'var(--color-brand-accent)',
    emoji: '🎯'
  }
};

export function IntelligenceInsights({ insights, className }: IntelligenceInsightsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain 
              className="w-6 h-6"
              style={{ color: 'var(--color-ai-primary)' }}
            />
          </motion.div>
          <span style={{ color: 'var(--color-ai-primary)' }}>
            AI Intelligence Insights
          </span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap 
              className="w-4 h-4"
              style={{ color: 'var(--color-brand-warning)' }}
            />
          </motion.div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div 
              className="text-center py-8"
              style={{ color: 'var(--gray-500)' }}
            >
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No insights available at the moment.</p>
              <p className="text-sm mt-1">Check back as decisions are analyzed.</p>
            </div>
          ) : (
            insights.map((insight, index) => {
              const config = insightConfig[insight.type];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-4 border-l-4"
                  style={{ 
                    borderLeftColor: config.color,
                    transition: 'all 0.2s ease'
                  }}
                  whileHover={{ 
                    scale: 1.01,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <motion.div 
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${config.bgColor}20`,
                        color: config.color
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 
                          className="text-sm font-semibold"
                          style={{ color: 'var(--gray-800)' }}
                        >
                          {config.emoji} {insight.title}
                        </h4>
                        
                        <div className="flex items-center space-x-2">
                          {insight.actionable && (
                            <motion.span 
                              className="text-xs px-2 py-1 rounded-full"
                              style={{ 
                                backgroundColor: 'var(--color-brand-success)',
                                color: 'white'
                              }}
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              Actionable
                            </motion.span>
                          )}
                          
                          <span 
                            className={`text-xs px-2 py-1 rounded-full ${
                              insight.priority === 'high' ? '' :
                              insight.priority === 'medium' ? '' : ''
                            }`}
                            style={{
                              backgroundColor: insight.priority === 'high' 
                                ? 'var(--color-brand-danger)'
                                : insight.priority === 'medium'
                                ? 'var(--color-brand-warning)'
                                : 'var(--gray-400)',
                              color: 'white'
                            }}
                          >
                            {insight.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <p 
                        className="text-sm mb-3"
                        style={{ color: 'var(--gray-600)' }}
                      >
                        {insight.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--gray-500)' }}
                          >
                            Confidence:
                          </span>
                          <div className="flex items-center space-x-1">
                            <div 
                              className="w-16 h-2 rounded-full"
                              style={{ backgroundColor: 'var(--gray-200)' }}
                            >
                              <motion.div
                                className="h-2 rounded-full"
                                style={{ 
                                  backgroundColor: insight.confidence > 0.8 
                                    ? 'var(--color-brand-success)'
                                    : insight.confidence > 0.6
                                    ? 'var(--color-brand-warning)'
                                    : 'var(--color-brand-danger)',
                                  width: `${insight.confidence * 100}%`
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${insight.confidence * 100}%` }}
                                transition={{ delay: 0.5, duration: 1 }}
                              />
                            </div>
                            <span 
                              className="text-xs font-medium"
                              style={{ color: 'var(--gray-700)' }}
                            >
                              {(insight.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        
                        {insight.relatedDecisions && insight.relatedDecisions.length > 0 && (
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--gray-500)' }}
                          >
                            {insight.relatedDecisions.length} related decision{insight.relatedDecisions.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}