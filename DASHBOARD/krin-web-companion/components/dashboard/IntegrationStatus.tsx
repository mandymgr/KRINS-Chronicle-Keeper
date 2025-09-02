'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface IntegrationStatus {
  name: 'github' | 'jira';
  enabled: boolean;
  healthy: boolean;
  lastCheck: string;
  nextCheck: string;
  errorCount: number;
  lastError?: string;
  rateLimit?: {
    remaining: number;
    resetTime: string;
  };
}

interface IntegrationHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'no-integrations' | 'error';
  timestamp: string;
  integrations: IntegrationStatus[];
  summary: {
    total: number;
    enabled: number;
    healthy: number;
    degraded: number;
  };
}

export function IntegrationStatus() {
  const [healthData, setHealthData] = useState<IntegrationHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/health');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setHealthData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch integration status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'no-integrations':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (enabled: boolean, healthy: boolean) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    if (!enabled) return 'secondary';
    return healthy ? 'default' : 'destructive';
  };

  const getIntegrationIcon = (name: string) => {
    switch (name) {
      case 'github':
        return '📦';
      case 'jira':
        return '🎯';
      default:
        return '🔌';
    }
  };

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Integration Status Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={fetchHealthStatus} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && !healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Integration Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!healthData) {
    return null;
  }

  const { status, integrations, summary } = healthData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <CardTitle>Integration Status</CardTitle>
          </div>
          <Button 
            onClick={fetchHealthStatus} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          {summary.enabled} of {summary.total} integrations enabled • {summary.healthy} healthy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div 
              key={integration.name} 
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {getIntegrationIcon(integration.name)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium capitalize">{integration.name}</h3>
                    <Badge>
                      {!integration.enabled ? 'Disabled' : 
                       integration.healthy ? 'Healthy' : 'Unhealthy'}
                    </Badge>
                  </div>
                  {integration.lastError && (
                    <p className="text-sm text-red-600 mt-1">{integration.lastError}</p>
                  )}
                  {integration.rateLimit && (
                    <p className="text-xs text-gray-500">
                      Rate limit: {integration.rateLimit.remaining} remaining
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Last check:</p>
                <p>{new Date(integration.lastCheck).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          
          {status === 'no-integrations' && (
            <div className="text-center py-6 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">No integrations enabled</p>
              <p className="text-sm">Enable GitHub or Jira integrations to see live data</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}