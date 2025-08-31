'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, Clock, Calendar, User, Target } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'planned';
  progress: number; // 0-100
  tags: string[];
  dependencies?: string[];
  blockers?: string[];
}

interface MilestoneListProps {
  milestones: Milestone[];
  title?: string;
  className?: string;
  showProgress?: boolean;
}

const statusColors = {
  completed: 'bg-green-100 text-green-800 border-green-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  planned: 'bg-gray-100 text-gray-600 border-gray-200',
} as const;

const statusIcons = {
  completed: <CheckCircle className="w-4 h-4 text-green-600" />,
  'in-progress': <Clock className="w-4 h-4 text-blue-600" />,
  planned: <Circle className="w-4 h-4 text-gray-400" />,
} as const;

export function MilestoneList({ 
  milestones, 
  title = "Project Milestones", 
  className = "",
  showProgress = true 
}: MilestoneListProps) {
  const sortedMilestones = [...milestones].sort((a, b) => {
    // Sort by status (in-progress first, then planned, then completed)
    const statusOrder = { 'in-progress': 0, planned: 1, completed: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const milestoneStats = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'completed').length,
    inProgress: milestones.filter(m => m.status === 'in-progress').length,
    planned: milestones.filter(m => m.status === 'planned').length,
    overdue: milestones.filter(m => 
      m.status !== 'completed' && new Date(m.dueDate) < new Date()
    ).length,
  };

  const averageProgress = milestones.reduce((acc, m) => acc + m.progress, 0) / milestones.length;

  const isOverdue = (milestone: Milestone) => {
    return milestone.status !== 'completed' && new Date(milestone.dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🎯</span>
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          Key project milestones and delivery targets
        </CardDescription>
        
        {/* Milestone Statistics */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>{milestoneStats.completed} Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>{milestoneStats.inProgress} In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>{milestoneStats.planned} Planned</span>
          </div>
          {milestoneStats.overdue > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>{milestoneStats.overdue} Overdue</span>
            </div>
          )}
        </div>

        {showProgress && (
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{Math.round(averageProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${averageProgress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {sortedMilestones.map((milestone) => {
            const daysUntilDue = getDaysUntilDue(milestone.dueDate);
            const overdue = isOverdue(milestone);
            
            return (
              <div 
                key={milestone.id} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  overdue 
                    ? 'border-red-200 bg-red-50' 
                    : milestone.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : milestone.status === 'in-progress'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {statusIcons[milestone.status]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge size="sm" className={statusColors[milestone.status]}>
                      {milestone.status.replace('-', ' ')}
                    </Badge>
                    {overdue && (
                      <Badge size="sm" variant="destructive">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {showProgress && milestone.status !== 'completed' && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs text-gray-600">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tags */}
                {milestone.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {milestone.tags.map(tag => (
                      <Badge key={tag} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Blockers */}
                {milestone.blockers && milestone.blockers.length > 0 && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center space-x-1 mb-1">
                      <Target className="w-3 h-3 text-red-600" />
                      <span className="text-xs font-medium text-red-800">Blockers:</span>
                    </div>
                    <ul className="text-xs text-red-700 space-y-1">
                      {milestone.blockers.map((blocker, index) => (
                        <li key={index}>• {blocker}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dependencies */}
                {milestone.dependencies && milestone.dependencies.length > 0 && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center space-x-1 mb-1">
                      <Target className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Dependencies:</span>
                    </div>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {milestone.dependencies.map((dep, index) => (
                        <li key={index}>• {dep}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{milestone.owner}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(milestone.dueDate)}</span>
                    {milestone.status !== 'completed' && (
                      <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        ({daysUntilDue > 0 ? `${daysUntilDue} days left` : 
                          daysUntilDue === 0 ? 'Due today' : 
                          `${Math.abs(daysUntilDue)} days overdue`})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {milestones.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-4" />
              <p>No milestones defined yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}