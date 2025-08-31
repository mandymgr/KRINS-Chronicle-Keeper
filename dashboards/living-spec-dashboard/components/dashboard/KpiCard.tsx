'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatNumber, getTrendDisplay } from '@/lib/utils';
import type { KpiMetric } from '@/lib/types';

interface KpiCardProps {
  kpi: KpiMetric;
  className?: string;
}

export function KpiCard({ kpi, className }: KpiCardProps) {
  const { icon: trendIcon, color: trendColor } = getTrendDisplay(kpi.trend);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'technical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'user':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
      return formatNumber(value);
    }
    return value;
  };

  return (
    <Card className={cn('group transition-all hover:scale-105', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl" role="img" aria-label={kpi.name}>
            {kpi.icon}
          </span>
          <Badge
            variant="outline"
            className={cn('text-xs', getCategoryColor(kpi.category))}
          >
            {kpi.category}
          </Badge>
        </div>
        <div className={cn('flex items-center space-x-1', trendColor)}>
          <span className="text-lg">{trendIcon}</span>
          {kpi.trendPercentage && (
            <span className="text-sm font-medium">
              {kpi.trend === 'up' ? '+' : kpi.trend === 'down' ? '-' : ''}
              {kpi.trendPercentage}%
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <CardTitle className="text-lg font-medium text-nordic-dark-gray dark:text-nordic-light-gray mb-2">
          {kpi.name}
        </CardTitle>
        
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
              {formatValue(kpi.value)}
            </span>
            {kpi.unit && (
              <span className="text-lg text-nordic-medium-gray">
                {kpi.unit}
              </span>
            )}
          </div>
          
          {kpi.target && (
            <div className="flex items-center space-x-2 text-sm text-nordic-medium-gray">
              <span>Target:</span>
              <span className="font-medium">{formatValue(kpi.target)}{kpi.unit}</span>
            </div>
          )}
          
          <p className="text-sm text-nordic-medium-gray line-clamp-2">
            {kpi.description}
          </p>
          
          <div className="flex justify-between items-center text-xs text-nordic-medium-gray pt-2 border-t border-nordic-light-gray dark:border-nordic-medium-gray">
            <span>Last updated</span>
            <span>
              {new Date(kpi.lastUpdated).toLocaleString('nb-NO', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}