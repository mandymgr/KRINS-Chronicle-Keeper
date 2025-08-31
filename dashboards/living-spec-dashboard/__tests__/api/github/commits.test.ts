import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/github/commits/route';
import { NextRequest } from 'next/server';

// Mock the dependencies
vi.mock('@/lib/env', () => ({
  isGitHubEnabled: vi.fn(() => true),
}));

vi.mock('@/lib/rateLimit', () => ({
  rateLimiter: {
    github: {
      apiCheck: vi.fn(() => ({ allowed: true, remainingRequests: 10, resetTime: Date.now() + 3600000 })),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/lib/integrations/github', () => ({
  githubIntegration: {
    getCommits: vi.fn(),
  },
}));

import { isGitHubEnabled } from '@/lib/env';
import { rateLimiter } from '@/lib/rateLimit';
import { githubIntegration } from '@/lib/integrations/github';

describe('/api/github/commits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return commits successfully', async () => {
    const mockCommits = [
      {
        id: 'abc123',
        message: 'Test commit',
        author: { name: 'John Doe', email: 'john@example.com' },
        timestamp: '2024-01-15T10:00:00Z',
        url: 'https://github.com/owner/repo/commit/abc123',
        source: 'github',
      },
    ];

    vi.mocked(githubIntegration.getCommits).mockResolvedValue(mockCommits);

    const request = new NextRequest('http://localhost:3000/api/github/commits');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockCommits);
    expect(data.meta.count).toBe(1);
    expect(data.meta.source).toBe('github');
  });

  it('should return 503 when GitHub integration is disabled', async () => {
    vi.mocked(isGitHubEnabled).mockReturnValue(false);

    const request = new NextRequest('http://localhost:3000/api/github/commits');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('GitHub integration is not enabled');
  });

  it('should return 429 when rate limited', async () => {
    vi.mocked(rateLimiter.github.apiCheck).mockReturnValue({
      allowed: false,
      remainingRequests: 0,
      resetTime: Date.now() + 3600000,
      retryAfter: 3600,
    });

    const request = new NextRequest('http://localhost:3000/api/github/commits');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded');
    expect(data.retryAfter).toBe(3600);
    expect(response.headers.get('Retry-After')).toBe('3600');
  });

  it('should handle query parameters correctly', async () => {
    const mockCommits = [
      {
        id: 'abc123',
        message: 'Test commit',
        author: { name: 'John Doe', email: 'john@example.com' },
        timestamp: '2024-01-15T10:00:00Z',
        url: 'https://github.com/owner/repo/commit/abc123',
        source: 'github',
      },
    ];

    vi.mocked(githubIntegration.getCommits).mockResolvedValue(mockCommits);

    const request = new NextRequest(
      'http://localhost:3000/api/github/commits?since=2024-01-01&author=john&per_page=10'
    );
    const response = await GET(request);

    expect(githubIntegration.getCommits).toHaveBeenCalledWith({
      since: '2024-01-01',
      author: 'john',
      per_page: 10,
    });
    expect(response.status).toBe(200);
  });

  it('should handle integration errors gracefully', async () => {
    const error = new Error('GitHub API error');
    vi.mocked(githubIntegration.getCommits).mockRejectedValue(error);

    const request = new NextRequest('http://localhost:3000/api/github/commits');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});