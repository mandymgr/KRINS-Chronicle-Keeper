/**
 * 👥 Active Teams List Component
 * Displays currently active AI development teams with real-time status
 */

import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  GitPullRequest, 
  CheckCircle, 
  AlertTriangle, 
  Play,
  Pause,
  MoreHorizontal,
  ExternalLink,
  Crown,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';

const ActiveTeamsList = ({ teams = [], isLoading, onRefresh }) => {
  const [expandedTeam, setExpandedTeam] = useState(null);

  const getStatusColor = (status) => {
    const statusColors = {
      'active': 'text-green-400 border-green-500/50',
      'paused': 'text-yellow-400 border-yellow-500/50',
      'completing': 'text-blue-400 border-blue-500/50',
      'failed': 'text-red-400 border-red-500/50',
      'timeout': 'text-orange-400 border-orange-500/50'
    };
    return statusColors[status] || 'text-slate-400 border-slate-500/50';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'active': <Play size={14} />,
      'paused': <Pause size={14} />,
      'completing': <CheckCircle size={14} />,
      'failed': <AlertTriangle size={14} />,
      'timeout': <Clock size={14} />
    };
    return statusIcons[status] || <MoreHorizontal size={14} />;
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const start = new Date(timestamp);
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m ago`;
    }
    return `${diffMins}m ago`;
  };

  const getSpecialistIcon = (role) => {
    const roleIcons = {
      'backend': '⚙️',
      'frontend': '🎨',
      'testing': '🧪',
      'devops': '🚀',
      'security': '🔒',
      'architecture': '🏗️',
      'documentation': '📚',
      'monitoring': '📊'
    };
    return roleIcons[role] || '🤖';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Users size={20} />
            Active AI Teams
            <Badge variant="outline" className="border-slate-600">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 bg-slate-700 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-700 rounded w-16"></div>
                </div>
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-slate-700 rounded w-full mb-3"></div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-8 bg-slate-700 rounded w-16"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Users size={20} />
            Active AI Teams
            <Badge variant="outline" className="border-slate-600">0 Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No Active Teams
            </h3>
            <p className="text-slate-500 mb-4">
              AI teams will appear here when triggered by GitHub events
            </p>
            <Button 
              onClick={onRefresh}
              variant="outline" 
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              <Zap size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} />
            Active AI Teams
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              {teams.length} Active
            </Badge>
          </div>
          <Button 
            onClick={onRefresh}
            variant="ghost" 
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Zap size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
            >
              {/* Team Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {team.repository_url?.split('/').slice(-2).join('/') || 'Unknown Repository'}
                  </h3>
                  <Badge className={`${getStatusColor(team.status)} bg-transparent`}>
                    {getStatusIcon(team.status)}
                    <span className="ml-1 capitalize">{team.status}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock size={14} />
                  {formatTimeAgo(team.started_at)}
                </div>
              </div>

              {/* Trigger Type and Context */}
              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <GitPullRequest size={14} className="text-blue-400" />
                  <span className="text-slate-300 capitalize">
                    {team.trigger_type?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
                
                {team.team_lead && (
                  <div className="flex items-center gap-1">
                    <Crown size={14} className="text-yellow-400" />
                    <span className="text-slate-300 capitalize">
                      {team.team_lead} Lead
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-purple-400" />
                  <span className="text-slate-300">
                    {team.team_size || 0} Specialists
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {team.progress && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">
                      {team.progress.phase || 'Initializing'}
                    </span>
                    <span className="text-slate-300">
                      {team.progress.completion_percentage || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={team.progress.completion_percentage || 0}
                    className={`h-2 ${getProgressColor(team.progress.completion_percentage || 0)}`}
                  />
                </div>
              )}

              {/* Team Specialists */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {team.specialists?.map((specialist, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="border-slate-600 text-slate-300 text-xs"
                    >
                      <span className="mr-1">{getSpecialistIcon(specialist.role || specialist)}</span>
                      {typeof specialist === 'object' ? specialist.role : specialist}
                    </Badge>
                  )) || 
                  // Fallback for teams without detailed specialist info
                  ['backend', 'frontend', 'testing'].map((role, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="border-slate-600 text-slate-300 text-xs"
                    >
                      <span className="mr-1">{getSpecialistIcon(role)}</span>
                      {role}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {team.repository_url && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                      onClick={() => window.open(team.repository_url, '_blank')}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-slate-400 hover:text-white"
                    onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                  >
                    <MoreHorizontal size={14} />
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTeam === team.id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Current Tasks */}
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-2">Current Tasks</h4>
                      {team.progress?.current_tasks?.length > 0 ? (
                        <ul className="space-y-1">
                          {team.progress.current_tasks.slice(0, 3).map((task, index) => (
                            <li key={index} className="text-slate-400 flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                              {task.description || task}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500">No current tasks</p>
                      )}
                    </div>

                    {/* Completed Tasks */}
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-2">Completed Tasks</h4>
                      {team.progress?.completed_tasks?.length > 0 ? (
                        <ul className="space-y-1">
                          {team.progress.completed_tasks.slice(0, 3).map((task, index) => (
                            <li key={index} className="text-slate-400 flex items-center gap-2">
                              <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                              {task.description || task}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500">No completed tasks yet</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Team Info */}
                  {team.context && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-slate-300 mb-2">Context</h4>
                      <p className="text-slate-400 text-sm">
                        {team.context.title || team.context.description || 'No additional context'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveTeamsList;