// Data mappers for external API integrations to internal types

import type { GitHubCommit, GitHubRelease, GitHubMilestone } from '../integrations/github';
import type { JiraIssue, JiraProject } from '../integrations/jira';
import type { 
  ChangelogEntry, 
  Milestone, 
  Task, 
  Risk, 
  ProjectMetadata,
  Environment,
  KpiMetric,
} from '../types';

// GitHub to Internal Type Mappers

export function mapGitHubCommitsToChangelog(commits: GitHubCommit[]): ChangelogEntry[] {
  return commits.map(commit => ({
    version: commit.sha.substring(0, 8), // Use short SHA as version
    date: commit.commit.author.date,
    type: inferCommitType(commit.commit.message),
    title: commit.commit.message.split('\n')[0],
    description: commit.commit.message.split('\n').slice(1).join('\n').trim() || undefined,
    author: commit.author?.login || commit.commit.author.name,
    pr: extractPRNumber(commit.commit.message),
  }));
}

export function mapGitHubReleasesToEnvironments(releases: GitHubRelease[]): Environment[] {
  return releases.map(release => ({
    name: release.name || release.tag_name,
    type: release.prerelease ? 'staging' : 'production',
    url: release.html_url,
    status: 'healthy', // Default status - would need actual health checks
    version: release.tag_name,
    lastDeployed: release.published_at,
    deployedBy: 'GitHub Actions', // Assumption
    healthCheck: undefined,
    monitoring: undefined,
  }));
}

export function mapGitHubMilestonesToMilestones(milestones: GitHubMilestone[]): Milestone[] {
  return milestones.map(milestone => ({
    id: milestone.id.toString(),
    title: milestone.title,
    description: milestone.description || '',
    owner: 'GitHub', // Default - GitHub doesn't have specific owners
    dueDate: milestone.due_on || new Date().toISOString(),
    status: mapGitHubMilestoneState(milestone.state),
    progress: calculateMilestoneProgress(milestone.open_issues, milestone.closed_issues),
    dependencies: [],
    tags: ['github', 'milestone'],
  }));
}

// Jira to Internal Type Mappers

export function mapJiraIssuesToTasks(issues: JiraIssue[]): Task[] {
  return issues.map(issue => ({
    id: issue.key,
    title: issue.fields.summary,
    description: issue.fields.description || '',
    status: mapJiraStatusToTaskStatus(issue.fields.status.name),
    owner: issue.fields.assignee?.displayName || issue.fields.reporter.displayName,
    estimate: issue.fields.timeoriginalestimate ? 
      Math.round(issue.fields.timeoriginalestimate / 3600) : // Convert seconds to hours
      0,
    priority: mapJiraPriority(issue.fields.priority?.name),
    tags: [
      ...issue.fields.labels,
      ...issue.fields.components.map(c => c.name),
    ],
    createdDate: issue.fields.created,
    updatedDate: issue.fields.updated,
    dueDate: issue.fields.resolutiondate || undefined,
    blockers: issue.fields.labels.includes('blocked') ? ['blocked'] : [],
  }));
}

export function mapJiraIssuesToRisks(issues: JiraIssue[]): Risk[] {
  return issues
    .filter(issue => 
      issue.fields.labels.includes('risk') || 
      issue.fields.labels.includes('blocker') ||
      issue.fields.priority?.name === 'Critical'
    )
    .map(issue => ({
      id: issue.key,
      title: issue.fields.summary,
      description: issue.fields.description || '',
      category: inferRiskCategory(issue.fields.labels, issue.fields.components),
      probability: mapJiraPriorityToProbability(issue.fields.priority?.name),
      impact: mapJiraLabelsToImpact(issue.fields.labels),
      owner: issue.fields.assignee?.displayName || issue.fields.reporter.displayName,
      status: mapJiraStatusToRiskStatus(issue.fields.status.name),
      mitigation: extractMitigationFromDescription(issue.fields.description),
      identifiedDate: issue.fields.created,
      lastReviewed: issue.fields.updated,
    }));
}

export function mapJiraProjectToMetadata(
  project: JiraProject,
  statistics: any
): Partial<ProjectMetadata> {
  return {
    name: project.name,
    shortDescription: project.description || '',
    phase: inferProjectPhase(statistics),
    contact: {
      email: project.lead.emailAddress,
      repository: `jira:${project.key}`,
    },
    team: {
      lead: project.lead.displayName,
      members: [], // Would need additional API calls to get all members
      stakeholders: [],
    },
  };
}

// Create KPI metrics from integration data
export function createIntegrationKpis(
  githubData?: { commits: GitHubCommit[]; releases: GitHubRelease[] },
  jiraData?: { issues: JiraIssue[]; statistics: any }
): KpiMetric[] {
  const kpis: KpiMetric[] = [];

  if (githubData) {
    kpis.push(
      {
        id: 'github-commits',
        name: 'Recent Commits',
        value: githubData.commits.length,
        unit: 'commits',
        trend: 'stable',
        description: 'Number of commits in the last month',
        icon: 'git-commit',
        category: 'technical',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'github-releases',
        name: 'Recent Releases',
        value: githubData.releases.length,
        unit: 'releases',
        trend: 'stable',
        description: 'Number of releases deployed',
        icon: 'rocket',
        category: 'technical',
        lastUpdated: new Date().toISOString(),
      }
    );
  }

  if (jiraData) {
    kpis.push(
      {
        id: 'jira-active-issues',
        name: 'Active Issues',
        value: jiraData.statistics.openIssues + jiraData.statistics.inProgressIssues,
        unit: 'issues',
        trend: 'stable',
        description: 'Currently active Jira issues',
        icon: 'alert-circle',
        category: 'business',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'jira-completion-rate',
        name: 'Completion Rate',
        value: Math.round((jiraData.statistics.doneIssues / jiraData.statistics.totalIssues) * 100),
        unit: '%',
        trend: 'up',
        description: 'Percentage of completed issues',
        icon: 'check-circle',
        category: 'business',
        lastUpdated: new Date().toISOString(),
      }
    );
  }

  return kpis;
}

// Helper functions

function inferCommitType(message: string): ChangelogEntry['type'] {
  const msg = message.toLowerCase();
  if (msg.startsWith('feat') || msg.startsWith('feature')) return 'feat';
  if (msg.startsWith('fix') || msg.startsWith('bug')) return 'fix';
  if (msg.startsWith('docs')) return 'docs';
  if (msg.startsWith('style')) return 'style';
  if (msg.startsWith('refactor')) return 'refactor';
  if (msg.startsWith('test')) return 'test';
  if (msg.includes('breaking') || msg.includes('!:')) return 'breaking';
  return 'chore';
}

function extractPRNumber(message: string): string | undefined {
  const match = message.match(/\(#(\d+)\)|\s#(\d+)/);
  return match ? match[1] || match[2] : undefined;
}

function mapGitHubMilestoneState(state: 'open' | 'closed'): Milestone['status'] {
  return state === 'closed' ? 'completed' : 'in-progress';
}

function calculateMilestoneProgress(openIssues: number, closedIssues: number): number {
  const total = openIssues + closedIssues;
  return total > 0 ? Math.round((closedIssues / total) * 100) : 0;
}

function mapJiraStatusToTaskStatus(status: string): Task['status'] {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('done') || statusLower.includes('complete')) return 'done';
  if (statusLower.includes('progress') || statusLower.includes('active')) return 'in-progress';
  if (statusLower.includes('todo') || statusLower.includes('ready')) return 'todo';
  return 'backlog';
}

function mapJiraPriority(priority?: string): Task['priority'] {
  if (!priority) return 'medium';
  const priorityLower = priority.toLowerCase();
  if (priorityLower.includes('critical') || priorityLower.includes('highest')) return 'critical';
  if (priorityLower.includes('high')) return 'high';
  if (priorityLower.includes('low') || priorityLower.includes('lowest')) return 'low';
  return 'medium';
}

function mapJiraStatusToRiskStatus(status: string): Risk['status'] {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('done') || statusLower.includes('resolved')) return 'resolved';
  if (statusLower.includes('progress')) return 'mitigating';
  if (statusLower.includes('review') || statusLower.includes('monitor')) return 'monitoring';
  return 'identified';
}

function inferRiskCategory(labels: string[], components: any[]): Risk['category'] {
  const allTags = [...labels, ...components.map(c => c.name.toLowerCase())];
  
  if (allTags.some(tag => tag.includes('tech') || tag.includes('code'))) return 'technical';
  if (allTags.some(tag => tag.includes('business') || tag.includes('market'))) return 'business';
  if (allTags.some(tag => tag.includes('resource') || tag.includes('team'))) return 'resource';
  if (allTags.some(tag => tag.includes('time') || tag.includes('deadline'))) return 'timeline';
  if (allTags.some(tag => tag.includes('external') || tag.includes('vendor'))) return 'external';
  
  return 'technical'; // Default
}

function mapJiraPriorityToProbability(priority?: string): Risk['probability'] {
  if (!priority) return 3;
  const priorityLower = priority.toLowerCase();
  if (priorityLower.includes('critical') || priorityLower.includes('highest')) return 5;
  if (priorityLower.includes('high')) return 4;
  if (priorityLower.includes('medium')) return 3;
  if (priorityLower.includes('low')) return 2;
  return 1;
}

function mapJiraLabelsToImpact(labels: string[]): Risk['impact'] {
  const labelStr = labels.join(' ').toLowerCase();
  if (labelStr.includes('critical') || labelStr.includes('severe')) return 5;
  if (labelStr.includes('high') || labelStr.includes('major')) return 4;
  if (labelStr.includes('medium') || labelStr.includes('moderate')) return 3;
  if (labelStr.includes('low') || labelStr.includes('minor')) return 2;
  return 1;
}

function extractMitigationFromDescription(description?: string): string {
  if (!description) return 'No mitigation strategy defined';
  
  // Look for mitigation section in description
  const mitigationMatch = description.match(/(?:mitigation|solution|fix)[:\-\s]*(.*?)(?:\n\n|$)/i);
  if (mitigationMatch) {
    return mitigationMatch[1].trim();
  }
  
  // Return first paragraph as mitigation
  const firstParagraph = description.split('\n\n')[0];
  return firstParagraph.length > 200 
    ? firstParagraph.substring(0, 200) + '...' 
    : firstParagraph;
}

function inferProjectPhase(statistics: any): ProjectMetadata['phase'] {
  const completionRate = statistics.doneIssues / statistics.totalIssues;
  
  if (completionRate < 0.25) return 'Discovery';
  if (completionRate < 0.75) return 'Build';
  if (completionRate < 0.95) return 'Scale';
  return 'Maintain';
}

// Export all mappers
export const mappers = {
  github: {
    commitsToChangelog: mapGitHubCommitsToChangelog,
    releasesToEnvironments: mapGitHubReleasesToEnvironments,
    milestonesToMilestones: mapGitHubMilestonesToMilestones,
  },
  jira: {
    issuesToTasks: mapJiraIssuesToTasks,
    issuesToRisks: mapJiraIssuesToRisks,
    projectToMetadata: mapJiraProjectToMetadata,
  },
  combined: {
    createIntegrationKpis,
  },
};