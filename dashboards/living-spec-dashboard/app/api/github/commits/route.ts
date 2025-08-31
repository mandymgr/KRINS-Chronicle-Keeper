import { NextRequest, NextResponse } from 'next/server';
import { isGitHubEnabled } from '@/lib/config';
import { rateLimitMiddleware, createRateLimitErrorResponse } from '@/lib/rateLimit';
import { getCacheHeaders } from '@/lib/cache';
import { github, ConfigurationError } from '@/lib/integrations/github';

export async function GET(request: NextRequest) {
  try {
    // Check if GitHub integration is enabled
    if (!isGitHubEnabled || !github) {
      return NextResponse.json(
        { error: 'GitHub integration is not enabled' },
        { status: 503 }
      );
    }

    // Apply rate limiting
    const rateLimitResult = rateLimitMiddleware('api:github')(request);
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
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch commits from GitHub
    const commits = await github.getCommits(Math.min(limit, 100)); // Cap at 100

    const response = NextResponse.json({
      data: commits,
      meta: {
        count: commits.length,
        source: 'github',
        limit,
      },
    });

    // Set cache headers
    const cacheHeaders = getCacheHeaders('commits');
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('GitHub commits API error:', error);

    if (error instanceof ConfigurationError) {
      if (error.statusCode === 401) {
        return NextResponse.json(
          { error: 'GitHub authentication failed - check your token' },
          { status: 401 }
        );
      }
      if (error.statusCode === 403) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded or insufficient permissions' },
          { status: 403 }
        );
      }
      if (error.statusCode === 404) {
        return NextResponse.json(
          { error: 'GitHub repository not found' },
          { status: 404 }
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