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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50');
    const days = parseInt(searchParams.get('days') || '30');
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');

    let issues;

    // Handle pre-defined filters
    switch (filter) {
      case 'active':
        issues = await jira.getActiveIssues(Math.min(limit, 100));
        break;
      case 'recent':
        issues = await jira.getRecentIssues(days, Math.min(limit, 100));
        break;
      case 'status':
        if (!status) {
          return NextResponse.json(
            { error: 'Status parameter required when using status filter' },
            { status: 400 }
          );
        }
        issues = await jira.getIssuesByStatus(status, Math.min(limit, 100));
        break;
      case 'assignee':
        if (!assignee) {
          return NextResponse.json(
            { error: 'Assignee parameter required when using assignee filter' },
            { status: 400 }
          );
        }
        issues = await jira.getIssuesByAssignee(assignee, Math.min(limit, 100));
        break;
      default:
        issues = await jira.getActiveIssues(Math.min(limit, 100));
    }

    const response = NextResponse.json({
      data: issues,
      meta: {
        count: issues.length,
        source: 'jira',
        filter,
        limit,
      },
    });

    // Set cache headers
    const cacheHeaders = getCacheHeaders('jira');
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('Jira issues API error:', error);

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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { jql, startAt = 0, maxResults = 50 } = body;

    if (!jql) {
      return NextResponse.json(
        { error: 'JQL query is required' },
        { status: 400 }
      );
    }

    const result = await jira.searchIssues(jql, Math.min(maxResults, 100), startAt);

    const response = NextResponse.json({
      data: result.issues,
      meta: {
        count: result.issues.length,
        total: result.total,
        startAt: result.startAt,
        maxResults: result.maxResults,
        source: 'jira',
      },
    });

    // Set rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('Jira custom search API error:', error);

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