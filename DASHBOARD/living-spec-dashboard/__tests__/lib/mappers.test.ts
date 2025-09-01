import { describe, it, expect } from 'vitest';
import {
  mapGitHubCommit,
  mapGitHubRelease,
  mapGitHubMilestone,
  mapJiraIssue,
  mapJiraProject,
  filterRecentCommits,
  filterActiveIssues,
  aggregateIssuesByStatus,
} from '@/lib/mappers';
import type {
  GitHubCommit,
  GitHubRelease,
  GitHubMilestone,
  JiraIssue,
  JiraProject,
} from '@/lib/integrations';

describe('Mappers', () => {
  describe('GitHub mappers', () => {
    it('should map GitHub commit correctly', () => {
      const githubCommit: GitHubCommit = {
        sha: 'abc123',
        commit: {
          author: {
            name: 'John Doe',
            email: 'john@example.com',
            date: '2024-01-15T10:00:00Z',
          },
          message: 'Fix authentication bug',
        },
        author: {
          login: 'johndoe',
          avatar_url: 'https://avatar.url',
        },
        html_url: 'https://github.com/owner/repo/commit/abc123',
      };

      const mapped = mapGitHubCommit(githubCommit);

      expect(mapped).toEqual({
        id: 'abc123',
        message: 'Fix authentication bug',
        author: {
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://avatar.url',
        },
        timestamp: '2024-01-15T10:00:00Z',
        url: 'https://github.com/owner/repo/commit/abc123',
        source: 'github',
      });
    });

    it('should map GitHub release correctly', () => {
      const githubRelease: GitHubRelease = {
        id: 123,
        tag_name: 'v1.0.0',
        name: 'First Release',
        body: 'Initial stable release',
        draft: false,
        prerelease: false,
        created_at: '2024-01-15T10:00:00Z',
        published_at: '2024-01-15T11:00:00Z',
        author: {
          login: 'johndoe',
          avatar_url: 'https://avatar.url',
        },
        html_url: 'https://github.com/owner/repo/releases/tag/v1.0.0',
      };

      const mapped = mapGitHubRelease(githubRelease);

      expect(mapped).toEqual({
        id: '123',
        version: 'v1.0.0',
        name: 'First Release',
        description: 'Initial stable release',
        isDraft: false,
        isPrerelease: false,
        createdAt: '2024-01-15T10:00:00Z',
        publishedAt: '2024-01-15T11:00:00Z',
        author: {
          name: 'johndoe',
          avatar: 'https://avatar.url',
        },
        url: 'https://github.com/owner/repo/releases/tag/v1.0.0',
        source: 'github',
      });
    });

    it('should map GitHub milestone correctly', () => {
      const githubMilestone: GitHubMilestone = {
        id: 456,
        number: 1,
        title: 'Version 1.0',
        description: 'First major release',
        state: 'open',
        open_issues: 3,
        closed_issues: 7,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        due_on: '2024-02-01T00:00:00Z',
        html_url: 'https://github.com/owner/repo/milestone/1',
      };

      const mapped = mapGitHubMilestone(githubMilestone);

      expect(mapped).toEqual({
        id: '456',
        title: 'Version 1.0',
        description: 'First major release',
        state: 'open',
        progress: {
          open: 3,
          closed: 7,
          total: 10,
          percentage: 70,
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        dueDate: '2024-02-01T00:00:00Z',
        url: 'https://github.com/owner/repo/milestone/1',
        source: 'github',
      });
    });
  });

  describe('Jira mappers', () => {
    it('should map Jira issue correctly', () => {
      const jiraIssue: JiraIssue = {
        id: '12345',
        key: 'TEST-123',
        fields: {
          summary: 'Test issue',
          description: 'This is a test issue',
          status: {
            name: 'In Progress',
            statusCategory: {
              key: 'inprogress',
              name: 'In Progress',
            },
          },
          priority: {
            name: 'High',
            iconUrl: 'https://icon.url',
          },
          assignee: {
            displayName: 'Jane Doe',
            emailAddress: 'jane@example.com',
            avatarUrls: {
              '48x48': 'https://avatar.url',
            },
          },
          reporter: {
            displayName: 'John Doe',
            emailAddress: 'john@example.com',
            avatarUrls: {
              '48x48': 'https://avatar.url',
            },
          },
          created: '2024-01-15T10:00:00Z',
          updated: '2024-01-15T11:00:00Z',
          resolutiondate: null,
          labels: ['bug', 'frontend'],
          components: [
            { name: 'UI' },
            { name: 'Authentication' },
          ],
        },
      };

      const mapped = mapJiraIssue(jiraIssue);

      expect(mapped).toEqual({
        id: '12345',
        key: 'TEST-123',
        title: 'Test issue',
        description: 'This is a test issue',
        status: {
          name: 'In Progress',
          category: 'inprogress',
        },
        priority: {
          name: 'High',
          level: 'high',
          icon: 'https://icon.url',
        },
        assignee: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          avatar: 'https://avatar.url',
        },
        reporter: {
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://avatar.url',
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z',
        resolvedAt: null,
        labels: ['bug', 'frontend'],
        components: ['UI', 'Authentication'],
        url: `${process.env.JIRA_BASE_URL}/browse/TEST-123`,
        source: 'jira',
      });
    });

    it('should map Jira project correctly', () => {
      const jiraProject: JiraProject = {
        id: '10001',
        key: 'TEST',
        name: 'Test Project',
        description: 'A test project',
        lead: {
          displayName: 'Project Lead',
          emailAddress: 'lead@example.com',
        },
        issueTypes: [
          {
            id: '1',
            name: 'Bug',
            description: 'Bug issue type',
            iconUrl: 'https://bug-icon.url',
          },
          {
            id: '2',
            name: 'Story',
            description: 'Story issue type',
            iconUrl: 'https://story-icon.url',
          },
        ],
        url: 'https://jira.example.com/projects/TEST',
      };

      const mapped = mapJiraProject(jiraProject);

      expect(mapped).toEqual({
        id: '10001',
        key: 'TEST',
        name: 'Test Project',
        description: 'A test project',
        lead: {
          name: 'Project Lead',
          email: 'lead@example.com',
        },
        issueTypes: [
          {
            id: '1',
            name: 'Bug',
            description: 'Bug issue type',
            icon: 'https://bug-icon.url',
          },
          {
            id: '2',
            name: 'Story',
            description: 'Story issue type',
            icon: 'https://story-icon.url',
          },
        ],
        url: 'https://jira.example.com/projects/TEST',
        source: 'jira',
      });
    });
  });

  describe('Filter helpers', () => {
    it('should filter recent commits', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const old = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000); // 35 days ago

      const commits = [
        {
          id: '1',
          message: 'Recent commit',
          timestamp: recent.toISOString(),
          author: { name: 'John', email: 'john@example.com' },
          url: 'https://example.com/1',
          source: 'github' as const,
        },
        {
          id: '2',
          message: 'Old commit',
          timestamp: old.toISOString(),
          author: { name: 'Jane', email: 'jane@example.com' },
          url: 'https://example.com/2',
          source: 'github' as const,
        },
      ];

      const filtered = filterRecentCommits(commits, 30);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter active issues', () => {
      const issues = [
        {
          id: '1',
          key: 'TEST-1',
          title: 'Active issue',
          status: { name: 'In Progress', category: 'inprogress' as const },
          priority: { name: 'High', level: 'high' as const },
          reporter: { name: 'John', email: 'john@example.com' },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          labels: [],
          components: [],
          url: 'https://example.com/1',
          source: 'jira' as const,
        },
        {
          id: '2',
          key: 'TEST-2',
          title: 'Completed issue',
          status: { name: 'Done', category: 'done' as const },
          priority: { name: 'Medium', level: 'medium' as const },
          reporter: { name: 'Jane', email: 'jane@example.com' },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          labels: [],
          components: [],
          url: 'https://example.com/2',
          source: 'jira' as const,
        },
      ];

      const active = filterActiveIssues(issues);
      expect(active).toHaveLength(1);
      expect(active[0].key).toBe('TEST-1');
    });
  });

  describe('Aggregation helpers', () => {
    it('should aggregate issues by status', () => {
      const issues = [
        {
          status: { category: 'todo' as const },
        } as any,
        {
          status: { category: 'inprogress' as const },
        } as any,
        {
          status: { category: 'todo' as const },
        } as any,
        {
          status: { category: 'done' as const },
        } as any,
      ];

      const aggregated = aggregateIssuesByStatus(issues);

      expect(aggregated).toEqual({
        todo: 2,
        inprogress: 1,
        done: 1,
      });
    });
  });
});