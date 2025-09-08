/**
 * 🌐 Coordination Graph Component
 * Visualizes AI-to-AI communication and coordination patterns
 */

import React from 'react';
import { Network, MessageCircle, Users, Activity, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

const CoordinationGraph = ({ stats = {}, isLoading }) => {
  // Mock coordination data for visualization
  const mockStats = {
    active_sessions: 3,
    total_messages: 247,
    coordination_efficiency: 0.87,
    message_types: {
      coordination: 45,
      pattern_sync: 32,
      status_update: 28,
      error_report: 8,
      completion: 12
    },
    communication_flow: [
      { from: 'backend', to: 'frontend', count: 23, type: 'api_spec' },
      { from: 'frontend', to: 'testing', count: 18, type: 'component_ready' },
      { from: 'testing', to: 'backend', count: 15, type: 'test_results' },
      { from: 'devops', to: 'backend', count: 12, type: 'deployment_ready' },
      { from: 'architecture', to: 'backend', count: 10, type: 'pattern_guidance' }
    ]
  };

  const coordinationData = { ...mockStats, ...stats };

  const getSpecialistColor = (specialist) => {
    const colors = {
      backend: '#f97316', // orange
      frontend: '#3b82f6', // blue  
      testing: '#10b981', // green
      devops: '#8b5cf6', // purple
      architecture: '#f59e0b', // amber
      security: '#ef4444' // red
    };
    return colors[specialist] || '#64748b';
  };

  const getMessageTypeColor = (type) => {
    const colors = {
      coordination: 'bg-purple-500',
      pattern_sync: 'bg-blue-500',
      status_update: 'bg-green-500',
      error_report: 'bg-red-500',
      completion: 'bg-yellow-500'
    };
    return colors[type] || 'bg-slate-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <div className="h-6 bg-slate-700 rounded w-1/3 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-slate-700 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Coordination Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Network className="text-purple-400" size={20} />
              <span className="text-2xl font-bold text-white">
                {coordinationData.active_sessions}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageCircle className="text-blue-400" size={20} />
              <span className="text-2xl font-bold text-white">
                {coordinationData.total_messages}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="text-yellow-400" size={20} />
              <span className="text-2xl font-bold text-white">
                {Math.floor(coordinationData.coordination_efficiency * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Avg Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="text-green-400" size={20} />
              <span className="text-2xl font-bold text-white">1.2s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Coordination Visualization */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Network size={20} />
            AI Coordination Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Coordination Graph */}
            <div className="flex items-center justify-center min-h-96">
              <svg
                width="100%"
                height="400"
                viewBox="0 0 800 400"
                className="overflow-visible"
              >
                {/* Central coordination hub */}
                <circle
                  cx="400"
                  cy="200"
                  r="40"
                  fill="#8b5cf6"
                  stroke="#a855f7"
                  strokeWidth="2"
                />
                <text
                  x="400"
                  y="206"
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  Pattern
                  <tspan x="400" dy="12">Bridge</tspan>
                </text>

                {/* Specialist nodes */}
                {[
                  { name: 'Backend', x: 200, y: 100, color: '#f97316' },
                  { name: 'Frontend', x: 600, y: 100, color: '#3b82f6' },
                  { name: 'Testing', x: 200, y: 300, color: '#10b981' },
                  { name: 'DevOps', x: 600, y: 300, color: '#8b5cf6' },
                  { name: 'Architecture', x: 400, y: 60, color: '#f59e0b' }
                ].map((specialist, index) => (
                  <g key={index}>
                    <circle
                      cx={specialist.x}
                      cy={specialist.y}
                      r="30"
                      fill={specialist.color}
                      fillOpacity="0.8"
                      stroke={specialist.color}
                      strokeWidth="2"
                    />
                    <text
                      x={specialist.x}
                      y={specialist.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {specialist.name}
                    </text>
                    
                    {/* Connection lines to central hub */}
                    <line
                      x1={specialist.x}
                      y1={specialist.y}
                      x2="400"
                      y2="200"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeOpacity="0.6"
                      strokeDasharray="4,4"
                    />
                  </g>
                ))}

                {/* Communication flow indicators */}
                {coordinationData.communication_flow.map((flow, index) => {
                  const positions = {
                    backend: { x: 200, y: 100 },
                    frontend: { x: 600, y: 100 },
                    testing: { x: 200, y: 300 },
                    devops: { x: 600, y: 300 },
                    architecture: { x: 400, y: 60 }
                  };
                  
                  const fromPos = positions[flow.from];
                  const toPos = positions[flow.to];
                  
                  if (!fromPos || !toPos) return null;
                  
                  return (
                    <g key={index}>
                      <line
                        x1={fromPos.x}
                        y1={fromPos.y}
                        x2={toPos.x}
                        y2={toPos.y}
                        stroke="#22d3ee"
                        strokeWidth="3"
                        strokeOpacity="0.7"
                        markerEnd="url(#arrowhead)"
                      />
                      <circle
                        cx={(fromPos.x + toPos.x) / 2}
                        cy={(fromPos.y + toPos.y) / 2}
                        r="8"
                        fill="#22d3ee"
                        fillOpacity="0.8"
                      />
                      <text
                        x={(fromPos.x + toPos.x) / 2}
                        y={(fromPos.y + toPos.y) / 2 + 3}
                        textAnchor="middle"
                        fill="white"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {flow.count}
                      </text>
                    </g>
                  );
                })}

                {/* Arrow marker definition */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#22d3ee"
                    />
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-cyan-400"></div>
                <span className="text-slate-400">Active Communication</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-slate-500 border-dashed"></div>
                <span className="text-slate-400">Available Connection</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Types and Communication Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Types */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-200">Message Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(coordinationData.message_types).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${getMessageTypeColor(type)}`}></div>
                    <span className="text-slate-300 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Communication Flow Details */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-200">Top Communication Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coordinationData.communication_flow.map((flow, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getSpecialistColor(flow.from) }}
                      ></div>
                      <span className="text-sm text-slate-300 capitalize">{flow.from}</span>
                    </div>
                    <span className="text-slate-500">→</span>
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getSpecialistColor(flow.to) }}
                      ></div>
                      <span className="text-sm text-slate-300 capitalize">{flow.to}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{flow.count}</div>
                    <div className="text-xs text-slate-500 capitalize">
                      {flow.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Activity size={20} />
            Live Coordination Activity
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              <Activity size={12} className="mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[
              { time: '14:23:45', from: 'Backend', to: 'Frontend', message: 'API endpoint specifications updated', type: 'coordination' },
              { time: '14:23:42', from: 'Testing', to: 'Backend', message: 'Unit tests passing for user service', type: 'status_update' },
              { time: '14:23:38', from: 'DevOps', to: 'All', message: 'Staging environment ready for deployment', type: 'status_update' },
              { time: '14:23:35', from: 'Frontend', to: 'Testing', message: 'Component implementation completed', type: 'completion' },
              { time: '14:23:30', from: 'Architecture', to: 'Backend', message: 'Database pattern synchronized', type: 'pattern_sync' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 text-sm p-2 hover:bg-slate-900/50 rounded">
                <span className="text-slate-500 font-mono">{activity.time}</span>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getSpecialistColor(activity.from.toLowerCase()) }}
                  ></div>
                  <span className="text-slate-300">{activity.from}</span>
                </div>
                <span className="text-slate-500">→</span>
                <span className="text-slate-300">{activity.to}</span>
                <span className="text-slate-400 flex-1">{activity.message}</span>
                <div className={`w-2 h-2 rounded ${getMessageTypeColor(activity.type)}`}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinationGraph;