'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Globe, Server, Database, GitBranch, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface Environment {
  name: string;
  type: 'development' | 'staging' | 'production';
  status: 'healthy' | 'warning' | 'error' | 'maintenance';
  url?: string;
  version?: string;
  lastDeployed?: string;
  buildHash?: string;
  uptime?: string;
  metrics?: {
    responseTime: string;
    errorRate: string;
    uptime: string;
  };
}

interface EnvPanelProps {
  environments: Environment[];
  title?: string;
  className?: string;
  currentBuild?: {
    hash: string;
    timestamp: string;
    branch: string;
    author: string;
  };
}

const typeColors = {
  development: 'bg-blue-100 text-blue-800 border-blue-200',
  staging: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  production: 'bg-green-100 text-green-800 border-green-200',
} as const;

const statusConfig = {
  healthy: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Healthy'
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Warning'
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Error'
  },
  maintenance: {
    icon: <Server className="w-4 h-4" />,
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    label: 'Maintenance'
  },
} as const;

// Mock data for demo purposes
const defaultEnvironments: Environment[] = [
  {
    name: 'Development',
    type: 'development',
    status: 'healthy',
    url: 'http://localhost:3000',
    version: '1.0.0-dev',
    lastDeployed: new Date().toISOString(),
    buildHash: 'abc123d',
    uptime: '2h 30m',
    metrics: {
      responseTime: '120ms',
      errorRate: '0.1%',
      uptime: '99.9%',
    }
  },
  {
    name: 'Staging',
    type: 'staging',
    status: 'healthy',
    url: 'https://staging.example.com',
    version: '1.0.0-rc.1',
    lastDeployed: new Date(Date.now() - 3600000).toISOString(),
    buildHash: 'def456e',
    uptime: '1d 12h',
    metrics: {
      responseTime: '95ms',
      errorRate: '0.0%',
      uptime: '99.95%',
    }
  },
  {
    name: 'Production',
    type: 'production',
    status: 'healthy',
    url: 'https://app.example.com',
    version: '1.0.0',
    lastDeployed: new Date(Date.now() - 86400000).toISOString(),
    buildHash: 'ghi789f',
    uptime: '5d 8h',
    metrics: {
      responseTime: '85ms',
      errorRate: '0.0%',
      uptime: '99.98%',
    }
  }
];

const defaultBuild = {
  hash: 'abc123def456',
  timestamp: new Date().toISOString(),
  branch: 'main',
  author: 'Developer',
};

export function EnvPanel({ 
  environments = defaultEnvironments, 
  title = "Deployment Status", 
  className = "",
  currentBuild = defaultBuild
}: EnvPanelProps) {
  const healthyEnvs = environments.filter(env => env.status === 'healthy').length;
  const totalEnvs = environments.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🚀</span>
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          Environment health and deployment information
        </CardDescription>
        
        {/* Overall Status */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              healthyEnvs === totalEnvs ? 'bg-green-500' : 
              healthyEnvs > 0 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span>{healthyEnvs}/{totalEnvs} Environments Healthy</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Current Build Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <GitBranch className="w-4 h-4" />
              <span>Current Build</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Hash:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {currentBuild.hash.slice(0, 8)}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Branch:</span>
                <Badge variant="outline" size="sm">
                  {currentBuild.branch}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Built:</span>
                <span>{formatDate(currentBuild.timestamp)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Author:</span>
                <span>{currentBuild.author}</span>
              </div>
            </div>
          </div>

          {/* Environment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {environments.map((env) => {
              const statusConfig_ = statusConfig[env.status];
              
              return (
                <Card key={env.name} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{env.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge size="sm" className={typeColors[env.type]}>
                          {env.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge size="sm" className={statusConfig_.color}>
                        <div className="flex items-center space-x-1">
                          {statusConfig_.icon}
                          <span>{statusConfig_.label}</span>
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Version and Build */}
                    {env.version && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Version:</span>
                        <Badge variant="outline" size="sm" className="font-mono">
                          {env.version}
                        </Badge>
                      </div>
                    )}
                    
                    {env.buildHash && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Build:</span>
                        <Badge variant="outline" size="sm" className="font-mono text-xs">
                          {env.buildHash}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Last Deployed */}
                    {env.lastDeployed && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Deployed:</span>
                        <span className="text-xs">{formatDate(env.lastDeployed)}</span>
                      </div>
                    )}
                    
                    {/* Uptime */}
                    {env.uptime && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Uptime:</span>
                        <span className="text-xs">{env.uptime}</span>
                      </div>
                    )}
                    
                    {/* Metrics */}
                    {env.metrics && (
                      <div className="pt-3 border-t border-gray-100">
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Performance</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Response Time:</span>
                            <span>{env.metrics.responseTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Error Rate:</span>
                            <span>{env.metrics.errorRate}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Uptime:</span>
                            <span>{env.metrics.uptime}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Access Link */}
                    {env.url && (
                      <div className="pt-3 border-t border-gray-100">
                        <a
                          href={env.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 w-full py-2 px-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Quick Links */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Quick Links</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href="#"
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Server className="w-3 h-3" />
                <span>Server Logs</span>
              </a>
              <a
                href="#"
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Database className="w-3 h-3" />
                <span>Database</span>
              </a>
              <a
                href="#"
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Clock className="w-3 h-3" />
                <span>Monitoring</span>
              </a>
              <a
                href="#"
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <GitBranch className="w-3 h-3" />
                <span>CI/CD</span>
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}