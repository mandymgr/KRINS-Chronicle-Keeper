import { gitHubConfig, isGitHubEnabled } from '../config';
import { cachedFetch, CACHE_DURATION, generateCacheKey } from '../cache';
import { checkRateLimit } from '../rateLimit';

// GitHub API types
export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author?: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

export interface GitHubRelease {
  id: number;
  name: string;
  tag_name: string;
  published_at: string;
  created_at: string;
  html_url: string;
  body?: string;
  prerelease: boolean;
  draft: boolean;
  assets?: Array<{
    name: string;
    browser_download_url: string;
    download_count: number;
  }>;
}

export interface GitHubMilestone {
  id: number;
  title: string;
  description?: string;
  state: 'open' | 'closed';
  due_on?: string;
  closed_at?: string;
  created_at: string;
  html_url: string;
  open_issues: number;
  closed_issues: number;
}

export class ConfigurationError extends Error {
  constructor(
    public integration: string,
    message: string,
    public statusCode?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class GitHubIntegration {
  private baseUrl: string;
  private owner: string;
  private repo: string;
  private token: string;

  constructor() {
    if (!gitHubConfig) {
      throw new ConfigurationError('github', 'GitHub integration not properly configured');
    }

    this.baseUrl = gitHubConfig.baseUrl;
    this.owner = gitHubConfig.owner;
    this.repo = gitHubConfig.repo;
    this.token = gitHubConfig.token;
  }

  private async fetchFromGitHub<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<T> {
    // Check rate limit before making request
    const rateLimitResult = checkRateLimit('github', 'server');
    if (!rateLimitResult.allowed) {
      throw new ConfigurationError(
        'github',
        'GitHub API rate limit exceeded',
        429,
        rateLimitResult.resetTime
      );
    }

    const url = new URL(`${this.baseUrl}/repos/${this.owner}/${this.repo}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'living-spec-dashboard/1.0.0',
      },
      timeout: 10000,
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new ConfigurationError(
          'github',
          'GitHub API rate limit exceeded or insufficient permissions',
          403
        );
      }
      
      if (response.status === 401) {
        throw new ConfigurationError(
          'github',
          'GitHub API authentication failed - check your token',
          401
        );
      }

      if (response.status === 404) {
        throw new ConfigurationError(
          'github',
          `GitHub repository ${this.owner}/${this.repo} not found`,
          404
        );
      }

      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCommits(limit = 50): Promise<GitHubCommit[]> {
    if (!isGitHubEnabled) {
      throw new ConfigurationError('github', 'GitHub integration is disabled');
    }

    const cacheKey = generateCacheKey('github:commits', {
      owner: this.owner,
      repo: this.repo,
      limit,
    });

    const result = await cachedFetch(
      cacheKey,
      () => this.fetchFromGitHub<GitHubCommit[]>('/commits', { per_page: limit }),
      CACHE_DURATION.commits
    );

    return result.data;
  }

  async getReleases(limit = 20): Promise<GitHubRelease[]> {
    if (!isGitHubEnabled) {
      throw new ConfigurationError('github', 'GitHub integration is disabled');
    }

    const cacheKey = generateCacheKey('github:releases', {
      owner: this.owner,
      repo: this.repo,
      limit,
    });

    const result = await cachedFetch(
      cacheKey,
      () => this.fetchFromGitHub<GitHubRelease[]>('/releases', { per_page: limit }),
      CACHE_DURATION.releases
    );

    return result.data;
  }

  async getMilestones(): Promise<GitHubMilestone[]> {
    if (!isGitHubEnabled) {
      throw new ConfigurationError('github', 'GitHub integration is disabled');
    }

    const cacheKey = generateCacheKey('github:milestones', {
      owner: this.owner,
      repo: this.repo,
    });

    const result = await cachedFetch(
      cacheKey,
      () => this.fetchFromGitHub<GitHubMilestone[]>('/milestones', { 
        state: 'all',
        sort: 'due_on',
        direction: 'desc'
      }),
      CACHE_DURATION.milestones
    );

    return result.data;
  }

  async getRepositoryInfo() {
    if (!isGitHubEnabled) {
      throw new ConfigurationError('github', 'GitHub integration is disabled');
    }

    const cacheKey = generateCacheKey('github:repo', {
      owner: this.owner,
      repo: this.repo,
    });

    const result = await cachedFetch(
      cacheKey,
      () => this.fetchFromGitHub(''),
      CACHE_DURATION.releases // Use same cache duration as releases
    );

    return result.data;
  }

  // Check if GitHub integration is healthy
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; message: string }> {
    if (!isGitHubEnabled) {
      return { status: 'unhealthy', message: 'GitHub integration disabled' };
    }

    try {
      await this.fetchFromGitHub('', {});
      return { status: 'healthy', message: 'GitHub API accessible' };
    } catch (error) {
      if (error instanceof ConfigurationError) {
        if (error.statusCode === 403) {
          return { status: 'degraded', message: 'GitHub API rate limited' };
        }
        if (error.statusCode === 401) {
          return { status: 'unhealthy', message: 'GitHub authentication failed' };
        }
        if (error.statusCode === 404) {
          return { status: 'unhealthy', message: 'GitHub repository not found' };
        }
      }
      return { status: 'degraded', message: 'GitHub API temporarily unavailable' };
    }
  }
}

// Export singleton instance
export const github = isGitHubEnabled ? new GitHubIntegration() : null;