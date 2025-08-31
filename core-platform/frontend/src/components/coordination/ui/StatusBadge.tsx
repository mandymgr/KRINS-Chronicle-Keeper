import React from 'react';
import { CheckCircle, Clock, Globe, Shield, AlertTriangle, XCircle, Minus, Loader } from 'lucide-react';
import { StatusBadgeProps, StatusType } from '../../../types/coordination.types';

const statusConfigs = {
  active: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    textColor: '#10b981',
    icon: CheckCircle,
    className: 'status-active'
  },
  ready: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)', 
    textColor: '#3b82f6',
    icon: Clock,
    className: 'status-ready'
  },
  connected: {
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    textColor: '#06b6d4',
    icon: Globe,
    className: 'status-ready'
  },
  protected: {
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    textColor: '#8b5cf6',
    icon: Shield,
    className: 'status-ready'
  },
  warning: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    textColor: '#f59e0b',
    icon: AlertTriangle,
    className: 'status-busy'
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    textColor: '#ef4444',
    icon: XCircle,
    className: 'status-error'
  },
  inactive: {
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    textColor: '#6b7280',
    icon: Minus,
    className: 'status-error'
  },
  loading: {
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.1)',
    textColor: '#eab308',
    icon: Loader,
    className: 'status-busy'
  },
  busy: {
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    textColor: '#f97316',
    icon: Loader,
    className: 'status-busy'
  },
  idle: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    textColor: '#3b82f6',
    icon: Clock,
    className: 'status-ready'
  },
  offline: {
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    textColor: '#6b7280',
    icon: XCircle,
    className: 'status-error'
  }
} as const;

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const config = statusConfigs[status] || statusConfigs.inactive; // Fallback to inactive if status is unknown
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm', 
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${sizeClasses[size]} ${config.className} ${className}
      `}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor
      }}
    >
      {showIcon && Icon && (
        <Icon 
          className={`w-4 h-4 ${status === 'loading' || status === 'busy' ? 'animate-spin' : ''}`} 
        />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;