// Integration types for external APIs
export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  author: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

export interface GitHubMilestone {
  id: number;
  number: number;
  title: string;
  description: string;
  state: 'open' | 'closed';
  open_issues: number;
  closed_issues: number;
  created_at: string;
  updated_at: string;
  due_on: string | null;
  html_url: string;
}

export interface JiraIssue {
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
    priority: {
      name: string;
      iconUrl: string;
    };
    assignee: {
      displayName: string;
      emailAddress: string;
      avatarUrls: {
        '48x48': string;
      };
    } | null;
    reporter: {
      displayName: string;
      emailAddress: string;
      avatarUrls: {
        '48x48': string;
      };
    };
    created: string;
    updated: string;
    resolutiondate: string | null;
    labels: string[];
    components: Array<{
      name: string;
    }>;
  };
}

export interface JiraProject {
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
  url: string;
}

// Domain types (internal representations)
export interface Commit {
  id: string;
  message: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  timestamp: string;
  url: string;
  source: 'github';
}

export interface Release {
  id: string;
  version: string;
  name: string;
  description: string;
  isDraft: boolean;
  isPrerelease: boolean;
  createdAt: string;
  publishedAt: string;
  author: {
    name: string;
    avatar?: string;
  };
  url: string;
  source: 'github';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  state: 'open' | 'closed';
  progress: {
    open: number;
    closed: number;
    total: number;
    percentage: number;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  url: string;
  source: 'github';
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: {
    name: string;
    category: 'todo' | 'inprogress' | 'done';
  };
  priority: {
    name: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    icon?: string;
  };
  assignee?: {
    name: string;
    email: string;
    avatar?: string;
  };
  reporter: {
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  labels: string[];
  components: string[];
  url: string;
  source: 'jira';
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description?: string;
  lead: {
    name: string;
    email: string;
  };
  issueTypes: Array<{
    id: string;
    name: string;
    description: string;
    icon?: string;
  }>;
  url: string;
  source: 'jira';
}

// Integration status and health
export interface IntegrationStatus {
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

// Error types
export class IntegrationError extends Error {
  constructor(
    message: string,
    public integration: string,
    public statusCode?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export class RateLimitError extends IntegrationError {
  constructor(
    integration: string,
    retryAfter: number,
    message = 'Rate limit exceeded'
  ) {
    super(message, integration, 429, retryAfter);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends IntegrationError {
  constructor(
    integration: string,
    message = 'Authentication failed'
  ) {
    super(message, integration, 401);
    this.name = 'AuthenticationError';
  }
}

export class ConfigurationError extends IntegrationError {
  constructor(
    integration: string,
    message = 'Invalid configuration'
  ) {
    super(message, integration);
    this.name = 'ConfigurationError';
  }
}