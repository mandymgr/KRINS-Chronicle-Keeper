import { NextRequest, NextResponse } from 'next/server';
import { isJiraEnabled } from '@/lib/config';
import { rateLimitMiddleware, createRateLimitErrorResponse } from '@/lib/rateLimit';
import { getCacheHeaders } from '@/lib/cache';
import { jira, ConfigurationError } from '@/lib/integrations/jira';

export async function GET(request: NextRequest) {
  try {
    // Check if Jira integration is enabled
    if (!isJiraEnabled || !jira) {
      return NextResponse.json(
        { error: 'Jira integration is not enabled' },
        { status: 503 }
      );
    }

    // Apply rate limiting
    const rateLimitResult = rateLimitMiddleware('api:jira')(request);
    if (!rateLimitResult.allowed) {
      return createRateLimitErrorResponse({
        allowed: false,
        limit: parseInt(rateLimitResult.headers['X-RateLimit-Limit']),
        remaining: 0,
        resetTime: new Date(rateLimitResult.headers['X-RateLimit-Reset']).getTime(),
      });
    }

    // Get project info and statistics
    const [projectInfo, projectStats] = await Promise.all([
      jira.getProjectInfo(),
      jira.getProjectStatistics(),
    ]);

    const response = NextResponse.json({
      data: {
        ...projectInfo,
        statistics: projectStats,
      },
      meta: {
        source: 'jira',
      },
    });

    // Set cache headers (use releases cache duration for project info)
    const cacheHeaders = getCacheHeaders('releases');
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('Jira project API error:', error);

    if (error instanceof ConfigurationError) {
      if (error.statusCode === 401) {
        return NextResponse.json(
          { error: 'Jira authentication failed - check your credentials' },
          { status: 401 }
        );
      }
      if (error.statusCode === 403) {
        return NextResponse.json(
          { error: 'Jira access forbidden - check your permissions' },
          { status: 403 }
        );
      }
      if (error.statusCode === 404) {
        return NextResponse.json(
          { error: 'Jira project not found' },
          { status: 404 }
        );
      }
      if (error.statusCode === 429) {
        return NextResponse.json(
          { error: 'Jira API rate limit exceeded' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}