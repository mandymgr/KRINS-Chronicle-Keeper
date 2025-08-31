import { NextRequest, NextResponse } from 'next/server';
import { isGitHubEnabled, isJiraEnabled } from '@/lib/env';
import { rateLimiter } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import { githubIntegration } from '@/lib/integrations/github';
import { jiraIntegration } from '@/lib/integrations/jira';
import type { IntegrationStatus } from '@/lib/integrations';

export async function GET(request: NextRequest) {
  const clientId = request.ip || 'anonymous';
  
  try {
    // Basic API rate limiting for health checks
    const rateLimit = rateLimiter.check('api:health', clientId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimit.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '60',
          },
        }
      );
    }

    const integrations: IntegrationStatus[] = [];
    const healthChecks = [];

    // GitHub health check
    if (isGitHubEnabled()) {
      healthChecks.push(
        githubIntegration.healthCheck().then(health => ({
          name: 'github' as const,
          enabled: true,
          healthy: health.healthy,
          lastCheck: new Date().toISOString(),
          nextCheck: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
          errorCount: health.healthy ? 0 : 1,
          lastError: health.error,
          rateLimit: health.rateLimit ? {
            remaining: health.rateLimit.remaining,
            resetTime: health.rateLimit.reset,
          } : undefined,
        }))
      );
    } else {
      integrations.push({
        name: 'github',
        enabled: false,
        healthy: false,
        lastCheck: new Date().toISOString(),
        nextCheck: new Date().toISOString(),
        errorCount: 0,
      });
    }

    // Jira health check
    if (isJiraEnabled()) {
      healthChecks.push(
        jiraIntegration.healthCheck().then(health => ({
          name: 'jira' as const,
          enabled: true,
          healthy: health.healthy,
          lastCheck: new Date().toISOString(),
          nextCheck: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
          errorCount: health.healthy ? 0 : 1,
          lastError: health.error,
        }))
      );
    } else {
      integrations.push({
        name: 'jira',
        enabled: false,
        healthy: false,
        lastCheck: new Date().toISOString(),
        nextCheck: new Date().toISOString(),
        errorCount: 0,
      });
    }

    // Wait for all health checks to complete
    const healthResults = await Promise.allSettled(healthChecks);
    
    healthResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        integrations.push(result.value);
      } else {
        // Handle failed health checks
        const integrationName = index === 0 ? 'github' : 'jira';
        integrations.push({
          name: integrationName as 'github' | 'jira',
          enabled: true,
          healthy: false,
          lastCheck: new Date().toISOString(),
          nextCheck: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          errorCount: 1,
          lastError: result.reason?.message || 'Health check failed',
        });
      }
    });

    // Overall system health
    const enabledIntegrations = integrations.filter(i => i.enabled);
    const healthyIntegrations = integrations.filter(i => i.enabled && i.healthy);
    const overallHealth = enabledIntegrations.length === 0 ? 'no-integrations' :
      healthyIntegrations.length === enabledIntegrations.length ? 'healthy' :
      healthyIntegrations.length > 0 ? 'degraded' : 'unhealthy';

    logger.info('Integration health check completed', {
      clientId,
      overallHealth,
      enabledCount: enabledIntegrations.length,
      healthyCount: healthyIntegrations.length,
    });

    return NextResponse.json({
      status: overallHealth,
      timestamp: new Date().toISOString(),
      integrations,
      summary: {
        total: integrations.length,
        enabled: enabledIntegrations.length,
        healthy: healthyIntegrations.length,
        degraded: enabledIntegrations.length - healthyIntegrations.length,
      },
    });

  } catch (error) {
    logger.error('Health check API error', error as Error, { clientId });

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      integrations: [],
      summary: {
        total: 0,
        enabled: 0,
        healthy: 0,
        degraded: 0,
      },
    }, { status: 500 });
  }
}