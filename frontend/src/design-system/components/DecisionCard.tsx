import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { ADRStatusBadge, ADRStatus } from './ADRStatusBadge';
import { Brain, Clock, Users, TrendingUp } from 'lucide-react';

export interface DecisionData {
  id: string;
  title: string;
  status: ADRStatus;
  component: string;
  createdDate: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  stakeholders: string[];
  summary?: string;
}

export interface DecisionCardProps {
  decision: DecisionData;
  onClick?: () => void;
  className?: string;
}

export function DecisionCard({ decision, onClick, className }: DecisionCardProps) {
  const impactColors = {
    low: 'var(--gray-400)',
    medium: 'var(--color-brand-warning)',
    high: 'var(--color-brand-danger)'
  };

  const confidenceColor = decision.confidence > 0.8 
    ? 'var(--color-brand-success)'
    : decision.confidence > 0.6
    ? 'var(--color-brand-warning)'
    : 'var(--color-brand-danger)';

  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className="cursor-pointer transition-all hover:shadow-lg"
        onClick={onClick}
        style={{ borderLeft: `4px solid ${impactColors[decision.impact]}` }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle 
                className="text-lg mb-2 line-clamp-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {decision.title}
              </CardTitle>
              <div className="flex items-center space-x-2 mb-2">
                <ADRStatusBadge status={decision.status} />
                <span 
                  className="text-sm px-2 py-1 rounded-md"
                  style={{ 
                    backgroundColor: 'var(--color-context-highlight)',
                    color: 'var(--gray-700)',
                    fontSize: '0.75rem'
                  }}
                >
                  {decision.component}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {decision.summary && (
            <p 
              className="text-sm mb-4 line-clamp-3"
              style={{ color: 'var(--gray-600)' }}
            >
              {decision.summary}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {/* Confidence Score */}
            <div className="flex items-center space-x-2">
              <Brain 
                className="w-4 h-4"
                style={{ color: confidenceColor }}
              />
              <div>
                <div 
                  className="text-xs font-medium"
                  style={{ color: 'var(--gray-500)' }}
                >
                  Confidence
                </div>
                <div 
                  className="text-sm font-semibold"
                  style={{ color: confidenceColor }}
                >
                  {(decision.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            
            {/* Impact Level */}
            <div className="flex items-center space-x-2">
              <TrendingUp 
                className="w-4 h-4"
                style={{ color: impactColors[decision.impact] }}
              />
              <div>
                <div 
                  className="text-xs font-medium"
                  style={{ color: 'var(--gray-500)' }}
                >
                  Impact
                </div>
                <div 
                  className="text-sm font-semibold capitalize"
                  style={{ color: impactColors[decision.impact] }}
                >
                  {decision.impact}
                </div>
              </div>
            </div>
            
            {/* Date */}
            <div className="flex items-center space-x-2">
              <Clock 
                className="w-4 h-4"
                style={{ color: 'var(--gray-400)' }}
              />
              <div>
                <div 
                  className="text-xs font-medium"
                  style={{ color: 'var(--gray-500)' }}
                >
                  Created
                </div>
                <div 
                  className="text-sm"
                  style={{ color: 'var(--gray-700)' }}
                >
                  {new Date(decision.createdDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* Stakeholders */}
            <div className="flex items-center space-x-2">
              <Users 
                className="w-4 h-4"
                style={{ color: 'var(--gray-400)' }}
              />
              <div>
                <div 
                  className="text-xs font-medium"
                  style={{ color: 'var(--gray-500)' }}
                >
                  Stakeholders
                </div>
                <div 
                  className="text-sm"
                  style={{ color: 'var(--gray-700)' }}
                >
                  {decision.stakeholders.length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}