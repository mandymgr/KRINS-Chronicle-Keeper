import { jiraConfig, isJiraEnabled } from '../config';
import { cachedFetch, CACHE_DURATION, generateCacheKey } from '../cache';
import { checkRateLimit } from '../rateLimit';
import { ConfigurationError } from './github';

// Jira API types
interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
      statusCategory: {
        key: string;
        name: string;
      };
    };
    priority?: {
      name: string;
      iconUrl: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
      avatarUrls: Record<string, string>;
    };
    reporter: {
      displayName: string;
      emailAddress: string;
    };
    created: string;
    updated: string;
    resolutiondate?: string;
    timeestimate?: number;
    timeoriginalestimate?: number;
    timespent?: number;
    labels: string[];
    components: Array<{
      name: string;
      description?: string;
    }>;
  };
}

interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  startAt: number;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  lead: {
    displayName: string;
    emailAddress: string;
  };
  issueTypes: Array<{
    id: string;
    name: string;
    description: string;
    iconUrl: string;
  }>;
}

export class JiraIntegration {
  private baseUrl: string;
  private email: string;
  private apiToken: string;
  private projectKey: string;

  constructor() {
    if (!jiraConfig) {
      throw new ConfigurationError('jira', 'Jira integration not properly configured');
    }

    this.baseUrl = jiraConfig.baseUrl;
    this.email = jiraConfig.email;
    this.apiToken = jiraConfig.apiToken;
    this.projectKey = jiraConfig.projectKey;
  }

  private async fetchFromJira<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, string | number>;
    } = {}
  ): Promise<T> {
    // Check rate limit before making request
    const rateLimitResult = checkRateLimit('jira', 'server');
    if (!rateLimitResult.allowed) {
      throw new ConfigurationError(
        'jira',
        'Jira API rate limit exceeded',
        429,
        rateLimitResult.resetTime
      );
    }

    const url = new URL(`${this.baseUrl}/rest/api/3${endpoint}`);
    
    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
      });
    }

    // Create basic auth header
    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');

    const response = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'living-spec-dashboard/1.0.0',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      timeout: 10000,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new ConfigurationError(
          'jira',
          'Jira API authentication failed - check your email and API token',
          401
        );
      }

      if (response.status === 403) {
        throw new ConfigurationError(
          'jira',
          'Jira API access forbidden - check your permissions',
          403
        );
      }

      if (response.status === 404) {
        throw new ConfigurationError(
          'jira',
          `Jira project ${this.projectKey} not found`,
          404
        );
      }

      if (response.status === 429) {
        throw new ConfigurationError(
          'jira',
          'Jira API rate limit exceeded',
          429
        );
      }

      throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchIssues(jql: string, maxResults = 50, startAt = 0): Promise<JiraSearchResponse> {
    if (!isJiraEnabled) {
      throw new ConfigurationError('jira', 'Jira integration is disabled');
    }

    const cacheKey = generateCacheKey('jira:search', {
      jql,
      maxResults,
      startAt,
    });

    const result = await cachedFetch(
      cacheKey,
      () => this.fetchFromJira<JiraSearchResponse>('/search', {
        method: 'POST',
        body: {
          jql,
          maxResults,
          startAt,
          fields: [
            'summary',
            'description',
            'status',
            'priority',
            'assignee',
            'reporter',
            'created',
            'updated',
            'resolutiondate',
            'timeestimate',
            'timeoriginalestimate',
            'timespent',
            'labels',
            'components'
          ]
        }
      }),
      CACHE_DURATION.jira
    );

    return result.data;
  }

  async getActiveIssues(limit = 50): Promise<JiraIssue[]> {
    const jql = `project = ${this.projectKey} AND statusCategory != Done ORDER BY priority DESC, created DESC`;
    const response = await this.searchIssues(jql, limit);
    return response.issues;
  }

  async getRecentIssues(days = 30, limit = 50): Promise<JiraIssue[]> {
    const jql = `project = ${this.projectKey} AND created >= -${days}d ORDER BY created DESC`;
    const response = await this.searchIssues(jql, limit);
    return response.issues;
  }

  async getIssuesByStatus(status: string, limit = 50): Promise<JiraIssue[]> {
    const jql = `project = ${this.projectKey} AND status = "${status}" ORDER BY priority DESC`;
    const response = await this.searchIssues(jql, limit);
    return response.issues;
  }

  async getIssuesByAssignee(assignee: string, limit = 50): Promise<JiraIssue[]> {
    const jql = `project = ${this.projectKey} AND assignee = "${assignee}" AND statusCategory != Done ORDER BY priority DESC`;
    const response = await this.searchIssues(jql, limit);
    return response.issues;
  }

  async getProjectInfo(): Promise<JiraProject> {
    if (!isJiraEnabled) {
      throw new ConfigurationError('jira', 'Jira integration is disabled');
    }

    const cacheKey = generateCacheKey('jira:project', {
      projectKey: this.projectKey,
    });

    const result = await cachedFetch(
      cacheKey,
      () => this.fetchFromJira<JiraProject>(`/project/${this.projectKey}`),
      CACHE_DURATION.releases // Use same cache duration as releases (15 minutes)
    );

    return result.data;
  }

  async getProjectStatistics(): Promise<{
    totalIssues: number;
    openIssues: number;
    inProgressIssues: number;
    doneIssues: number;
    blockedIssues: number;
  }> {
    if (!isJiraEnabled) {
      throw new ConfigurationError('jira', 'Jira integration is disabled');
    }

    const cacheKey = generateCacheKey('jira:stats', {
      projectKey: this.projectKey,
    });

    const result = await cachedFetch(
      cacheKey,
      async () => {
        const [total, open, inProgress, done, blocked] = await Promise.all([
          this.searchIssues(`project = ${this.projectKey}`, 1),
          this.searchIssues(`project = ${this.projectKey} AND statusCategory = "To Do"`, 1),
          this.searchIssues(`project = ${this.projectKey} AND statusCategory = "In Progress"`, 1),
          this.searchIssues(`project = ${this.projectKey} AND statusCategory = Done`, 1),
          this.searchIssues(`project = ${this.projectKey} AND labels = "blocked"`, 1),
        ]);

        return {
          totalIssues: total.total,
          openIssues: open.total,
          inProgressIssues: inProgress.total,
          doneIssues: done.total,
          blockedIssues: blocked.total,
        };
      },
      CACHE_DURATION.jira
    );

    return result.data;
  }

  // Check if Jira integration is healthy
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; message: string }> {
    if (!isJiraEnabled) {
      return { status: 'unhealthy', message: 'Jira integration disabled' };
    }

    try {
      await this.getProjectInfo();
      return { status: 'healthy', message: 'Jira API accessible' };
    } catch (error) {
      if (error instanceof ConfigurationError) {
        if (error.statusCode === 401) {
          return { status: 'unhealthy', message: 'Jira authentication failed' };
        }
        if (error.statusCode === 403) {
          return { status: 'unhealthy', message: 'Jira access forbidden' };
        }
        if (error.statusCode === 404) {
          return { status: 'unhealthy', message: 'Jira project not found' };
        }
        if (error.statusCode === 429) {
          return { status: 'degraded', message: 'Jira API rate limited' };
        }
      }
      return { status: 'degraded', message: 'Jira API temporarily unavailable' };
    }
  }
}

// Export singleton instance
export const jira = isJiraEnabled ? new JiraIntegration() : null;