'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { CheckCircle, Circle, Clock } from 'lucide-react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category?: string;
  author?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  title?: string;
  className?: string;
}

export function Timeline({ items, title = "Timeline", className = "" }: TimelineProps) {
  const getStatusIcon = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'upcoming':
        return <Circle className="w-4 h-4 text-gray-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📅</span>
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          Project timeline and milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="relative flex space-x-4">
              {/* Timeline connector */}
              {index !== items.length - 1 && (
                <div className="absolute top-6 left-2 w-0.5 h-full bg-gray-200" />
              )}
              
              {/* Status icon */}
              <div className="flex-shrink-0 w-4 h-4 mt-1 relative z-10 bg-white">
                {getStatusIcon(item.status)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <span>{formatDate(item.date)}</span>
                      {item.author && (
                        <>
                          <span>•</span>
                          <span>{item.author}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {item.category && (
                      <Badge variant="outline" size="sm">
                        {item.category}
                      </Badge>
                    )}
                    <Badge 
                      size="sm" 
                      className={getStatusColor(item.status)}
                    >
                      {item.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}