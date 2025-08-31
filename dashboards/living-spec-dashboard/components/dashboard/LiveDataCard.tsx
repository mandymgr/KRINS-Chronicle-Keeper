'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, GitCommit, Tag, Target, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface GitHubData {
  commits: Array<{
    id: string;
    message: string;
    author: { name: string; avatar?: string };
    timestamp: string;
    url: string;
  }>;
  releases: Array<{
    id: string;
    version: string;
    name: string;
    publishedAt: string;
    url: string;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    state: 'open' | 'closed';
    progress: { percentage: number; total: number; closed: number };
    url: string;
  }>;
}

interface JiraData {
  issues: Array<{
    id: string;
    key: string;
    title: string;
    status: { name: string; category: 'todo' | 'inprogress' | 'done' };
    priority: { name: string; level: 'low' | 'medium' | 'high' | 'critical' };
    assignee?: { name: string; avatar?: string };
    url: string;
  }>;
}

export function LiveDataCard() {
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [jiraData, setJiraData] = useState<JiraData | null>(null);
  const [loading, setLoading] = useState({ github: false, jira: false });
  const [errors, setErrors] = useState({ github: '', jira: '' });

  const fetchGitHubData = async () => {
    try {
      setLoading(prev => ({ ...prev, github: true }));
      
      // Fetch recent commits, releases, and open milestones in parallel
      const [commitsRes, releasesRes, milestonesRes] = await Promise.all([
        fetch('/api/github/commits?per_page=5'),
        fetch('/api/github/releases?per_page=3'),
        fetch('/api/github/milestones?state=open&per_page=3'),
      ]);

      const commits = commitsRes.ok ? await commitsRes.json() : { data: [] };
      const releases = releasesRes.ok ? await releasesRes.json() : { data: [] };
      const milestones = milestonesRes.ok ? await milestonesRes.json() : { data: [] };

      setGithubData({
        commits: commits.data || [],
        releases: releases.data || [],
        milestones: milestones.data || [],
      });
      
      setErrors(prev => ({ ...prev, github: '' }));
    } catch (err) {
      setErrors(prev => ({ 
        ...prev, 
        github: err instanceof Error ? err.message : 'Failed to fetch GitHub data' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, github: false }));
    }
  };

  const fetchJiraData = async () => {
    try {
      setLoading(prev => ({ ...prev, jira: true }));
      
      // Fetch active issues
      const response = await fetch('/api/jira/issues?filter=active&maxResults=5');
      
      if (response.ok) {
        const result = await response.json();
        setJiraData({
          issues: result.data || [],
        });
        setErrors(prev => ({ ...prev, jira: '' }));
      } else {
        const error = await response.json();
        setErrors(prev => ({ 
          ...prev, 
          jira: error.error || 'Failed to fetch Jira data' 
        }));
      }
    } catch (err) {
      setErrors(prev => ({ 
        ...prev, 
        jira: err instanceof Error ? err.message : 'Failed to fetch Jira data' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, jira: false }));
    }
  };

  useEffect(() => {
    fetchGitHubData();
    fetchJiraData();
    
    // Refresh every 10 minutes
    const interval = setInterval(() => {
      fetchGitHubData();
      fetchJiraData();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'todo': return 'secondary';
      case 'inprogress': return 'default';
      case 'done': return 'outline';
      default: return 'secondary';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* GitHub Integration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <div>
                <CardTitle>GitHub Activity</CardTitle>
                <CardDescription>Recent commits, releases, and milestones</CardDescription>
              </div>
            </div>
            <Button 
              onClick={fetchGitHubData} 
              size="sm" 
              variant="ghost"
              disabled={loading.github}
            >
              <RefreshCw className={`h-4 w-4 ${loading.github ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {errors.github ? (
            <div className="flex items-center gap-2 text-red-600 py-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{errors.github}</span>
            </div>
          ) : githubData ? (
            <div className="space-y-6">
              {/* Recent Commits */}
              {githubData.commits.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <GitCommit className="h-4 w-4" />
                    Recent Commits
                  </h4>
                  <div className="space-y-2">
                    {githubData.commits.slice(0, 3).map((commit) => (
                      <div key={commit.id} className="flex items-start gap-3 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{commit.message.split('\n')[0]}</p>
                          <p className="text-gray-500">
                            {commit.author.name} • {formatTimeAgo(commit.timestamp)}
                          </p>
                        </div>
                        <Link href={commit.url} target="_blank">
                          <ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Releases */}
              {githubData.releases.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4" />
                    Latest Releases
                  </h4>
                  <div className="space-y-2">
                    {githubData.releases.slice(0, 2).map((release) => (
                      <div key={release.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{release.version}</p>
                          <p className="text-gray-500">{formatTimeAgo(release.publishedAt)}</p>
                        </div>
                        <Link href={release.url} target="_blank">
                          <ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Milestones */}
              {githubData.milestones.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4" />
                    Active Milestones
                  </h4>
                  <div className="space-y-2">
                    {githubData.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{milestone.title}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-nordic-ocean h-1 rounded-full" 
                                style={{ width: `${milestone.progress.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {milestone.progress.closed}/{milestone.progress.total}
                            </span>
                          </div>
                        </div>
                        <Link href={milestone.url} target="_blank">
                          <ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {githubData.commits.length === 0 && githubData.releases.length === 0 && githubData.milestones.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent GitHub activity</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jira Integration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <div>
                <CardTitle>Jira Issues</CardTitle>
                <CardDescription>Active issues and their status</CardDescription>
              </div>
            </div>
            <Button 
              onClick={fetchJiraData} 
              size="sm" 
              variant="ghost"
              disabled={loading.jira}
            >
              <RefreshCw className={`h-4 w-4 ${loading.jira ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {errors.jira ? (
            <div className="flex items-center gap-2 text-red-600 py-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{errors.jira}</span>
            </div>
          ) : jiraData ? (
            <div className="space-y-4">
              {jiraData.issues.length > 0 ? (
                jiraData.issues.map((issue) => (
                  <div key={issue.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link 
                          href={issue.url} 
                          target="_blank"
                          className="font-medium text-nordic-ocean hover:underline text-sm"
                        >
                          {issue.key}
                        </Link>
                        <Badge variant={getPriorityColor(issue.priority.level)} size="sm">
                          {issue.priority.name}
                        </Badge>
                        <Badge variant={getStatusColor(issue.status.category)} size="sm">
                          {issue.status.name}
                        </Badge>
                      </div>
                      <p className="text-sm truncate mb-1">{issue.title}</p>
                      {issue.assignee && (
                        <p className="text-xs text-gray-500">
                          Assigned to {issue.assignee.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No active issues found</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}