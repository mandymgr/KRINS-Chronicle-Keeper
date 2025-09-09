import React from 'react';
import { Badge } from './Badge';

export type ADRStatus = 'proposed' | 'accepted' | 'rejected' | 'superseded' | 'draft';

export interface ADRStatusBadgeProps {
  status: ADRStatus;
  className?: string;
}

const statusConfig = {
  proposed: {
    variant: 'secondary' as const,
    label: 'Proposed',
    emoji: '💭'
  },
  accepted: {
    variant: 'default' as const,
    label: 'Accepted',
    emoji: '✅'
  },
  rejected: {
    variant: 'destructive' as const,
    label: 'Rejected',
    emoji: '❌'
  },
  superseded: {
    variant: 'outline' as const,
    label: 'Superseded',
    emoji: '🔄'
  },
  draft: {
    variant: 'outline' as const,
    label: 'Draft',
    emoji: '📝'
  }
};

export function ADRStatusBadge({ status, className }: ADRStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <Badge variant={config.variant} className={className}>
      <span className="flex items-center space-x-1">
        <span>{config.emoji}</span>
        <span>{config.label}</span>
      </span>
    </Badge>
  );
}