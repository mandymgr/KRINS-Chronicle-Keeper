import type {
  GitHubCommit,
  GitHubRelease,
  GitHubMilestone,
  JiraIssue,
  JiraProject,
  Commit,
  Release,
  Milestone,
  Issue,
  Project,
} from './integrations';

// GitHub to domain mappers
export function mapGitHubCommit(githubCommit: GitHubCommit): Commit {
  return {
    id: githubCommit.sha,
    message: githubCommit.commit.message,
    author: {
      name: githubCommit.commit.author.name,
      email: githubCommit.commit.author.email,
      avatar: githubCommit.author?.avatar_url,
    },
    timestamp: githubCommit.commit.author.date,
    url: githubCommit.html_url,
    source: 'github',
  };
}

export function mapGitHubRelease(githubRelease: GitHubRelease): Release {
  return {
    id: githubRelease.id.toString(),
    version: githubRelease.tag_name,
    name: githubRelease.name || githubRelease.tag_name,
    description: githubRelease.body || '',
    isDraft: githubRelease.draft,
    isPrerelease: githubRelease.prerelease,
    createdAt: githubRelease.created_at,
    publishedAt: githubRelease.published_at,
    author: {
      name: githubRelease.author.login,
      avatar: githubRelease.author.avatar_url,
    },
    url: githubRelease.html_url,
    source: 'github',
  };
}

export function mapGitHubMilestone(githubMilestone: GitHubMilestone): Milestone {
  const total = githubMilestone.open_issues + githubMilestone.closed_issues;
  const percentage = total > 0 ? Math.round((githubMilestone.closed_issues / total) * 100) : 0;

  return {
    id: githubMilestone.id.toString(),
    title: githubMilestone.title,
    description: githubMilestone.description || '',
    state: githubMilestone.state,
    progress: {
      open: githubMilestone.open_issues,
      closed: githubMilestone.closed_issues,
      total,
      percentage,
    },
    createdAt: githubMilestone.created_at,
    updatedAt: githubMilestone.updated_at,
    dueDate: githubMilestone.due_on,
    url: githubMilestone.html_url,
    source: 'github',
  };
}

// Jira to domain mappers
export function mapJiraIssue(jiraIssue: JiraIssue): Issue {
  // Map Jira status categories to our simplified categories
  const getStatusCategory = (statusCategory: string): 'todo' | 'inprogress' | 'done' => {
    switch (statusCategory.toLowerCase()) {
      case 'new':
      case 'todo':
        return 'todo';
      case 'indeterminate':
      case 'inprogress':
        return 'inprogress';
      case 'done':
        return 'done';
      default:
        return 'todo';
    }
  };

  // Map Jira priority names to our priority levels
  const getPriorityLevel = (priorityName: string): 'low' | 'medium' | 'high' | 'critical' => {
    const name = priorityName.toLowerCase();
    if (name.includes('blocker') || name.includes('critical')) return 'critical';
    if (name.includes('major') || name.includes('high')) return 'high';
    if (name.includes('minor') || name.includes('medium')) return 'medium';
    return 'low';
  };

  return {
    id: jiraIssue.id,
    key: jiraIssue.key,
    title: jiraIssue.fields.summary,
    description: jiraIssue.fields.description,
    status: {
      name: jiraIssue.fields.status.name,
      category: getStatusCategory(jiraIssue.fields.status.statusCategory.key),
    },
    priority: {
      name: jiraIssue.fields.priority.name,
      level: getPriorityLevel(jiraIssue.fields.priority.name),
      icon: jiraIssue.fields.priority.iconUrl,
    },
    assignee: jiraIssue.fields.assignee ? {
      name: jiraIssue.fields.assignee.displayName,
      email: jiraIssue.fields.assignee.emailAddress,
      avatar: jiraIssue.fields.assignee.avatarUrls['48x48'],
    } : undefined,
    reporter: {
      name: jiraIssue.fields.reporter.displayName,
      email: jiraIssue.fields.reporter.emailAddress,
      avatar: jiraIssue.fields.reporter.avatarUrls['48x48'],
    },
    createdAt: jiraIssue.fields.created,
    updatedAt: jiraIssue.fields.updated,
    resolvedAt: jiraIssue.fields.resolutiondate,
    labels: jiraIssue.fields.labels,
    components: jiraIssue.fields.components.map(c => c.name),
    url: `${process.env.JIRA_BASE_URL}/browse/${jiraIssue.key}`,
    source: 'jira',
  };
}

export function mapJiraProject(jiraProject: JiraProject): Project {
  return {
    id: jiraProject.id,
    key: jiraProject.key,
    name: jiraProject.name,
    description: jiraProject.description,
    lead: {
      name: jiraProject.lead.displayName,
      email: jiraProject.lead.emailAddress,
    },
    issueTypes: jiraProject.issueTypes.map(issueType => ({
      id: issueType.id,
      name: issueType.name,
      description: issueType.description,
      icon: issueType.iconUrl,
    })),
    url: jiraProject.url,
    source: 'jira',
  };
}

// Batch mappers
export function mapGitHubCommits(commits: GitHubCommit[]): Commit[] {
  return commits.map(mapGitHubCommit);
}

export function mapGitHubReleases(releases: GitHubRelease[]): Release[] {
  return releases.map(mapGitHubRelease);
}

export function mapGitHubMilestones(milestones: GitHubMilestone[]): Milestone[] {
  return milestones.map(mapGitHubMilestone);
}

export function mapJiraIssues(issues: JiraIssue[]): Issue[] {
  return issues.map(mapJiraIssue);
}

// Filter helpers
export function filterRecentCommits(commits: Commit[], days = 30): Commit[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return commits.filter(commit => new Date(commit.timestamp) >= cutoff);
}

export function filterActiveIssues(issues: Issue[]): Issue[] {
  return issues.filter(issue => issue.status.category !== 'done');
}

export function filterCompletedIssues(issues: Issue[]): Issue[] {
  return issues.filter(issue => issue.status.category === 'done');
}

export function filterHighPriorityIssues(issues: Issue[]): Issue[] {
  return issues.filter(issue => 
    issue.priority.level === 'high' || issue.priority.level === 'critical'
  );
}

// Aggregation helpers
export function aggregateIssuesByStatus(issues: Issue[]): Record<string, number> {
  return issues.reduce((acc, issue) => {
    const status = issue.status.category;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function aggregateIssuesByPriority(issues: Issue[]): Record<string, number> {
  return issues.reduce((acc, issue) => {
    const priority = issue.priority.level;
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function aggregateCommitsByAuthor(commits: Commit[]): Record<string, number> {
  return commits.reduce((acc, commit) => {
    const author = commit.author.name;
    acc[author] = (acc[author] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}