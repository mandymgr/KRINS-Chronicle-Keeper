// KRINS Developer Hub - Code Repository Page
// Real Git integration and code analysis

import { useState, useEffect } from 'react'
import { PageHero, ContentSection, DataList } from '@/components/shared/Layout'
import { HubNavigation } from '../components/HubNavigation'
import { hubApi } from '../api/hubApi'
import type { GitStatus } from '../types/hubTypes'
import { 
  GitBranch,
  GitCommit,
  FileText,
  AlertTriangle,
  Clock
} from 'lucide-react'

export default function CodeRepo() {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [recentCommits, setRecentCommits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadRepoData = async () => {
    try {
      const [status, commits] = await Promise.all([
        hubApi.getGitStatus(),
        hubApi.getRecentCommits(20)
      ])
      
      setGitStatus(status)
      setRecentCommits(commits)
      console.log('✅ Repository data loaded')
    } catch (error) {
      console.error('❌ Failed to load repository data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepoData()
  }, [])

  const stats = [
    { value: gitStatus?.branch || 'unknown', label: 'Current Branch' },
    { value: gitStatus?.files?.total_changes?.toString() || '0', label: 'Changes' },
    { value: gitStatus?.ahead?.toString() || '0', label: 'Commits Ahead' },
    { value: recentCommits.length.toString(), label: 'Recent Commits' }
  ]

  return (
    <>
      <HubNavigation />
      
      <PageHero 
        subtitle="Code Repository"
        title="Git Status & History"
        description="Real Git repository status, commit history, and code changes tracking."
        stats={stats}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          Loading repository data...
        </div>
      ) : (
        <>
          {gitStatus && (
            <ContentSection title="Repository Status">
              <DataList 
                items={[
                  {
                    icon: GitBranch,
                    title: `Branch: ${gitStatus.branch}`,
                    description: `${gitStatus.ahead} ahead, ${gitStatus.behind} behind origin`,
                    details: gitStatus.dirty ? `${gitStatus.files?.total_changes} uncommitted changes` : 'Working directory clean',
                    status: gitStatus.dirty ? 'warning' : 'clean'
                  },
                  {
                    icon: GitCommit,
                    title: 'Last Commit',
                    description: gitStatus.lastCommit.message,
                    details: `${gitStatus.lastCommit.author} - ${gitStatus.lastCommit.hash}`,
                    time: new Date(gitStatus.lastCommit.date).toLocaleDateString()
                  }
                ]}
                renderItem={(item) => (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-lg)'
                  }}>
                    <item.icon size={16} style={{ marginTop: '2px', color: 'var(--color-primary)' }} />
                    <div style={{ flex: 1 }}>
                      <h3 className="text-lg font-regular text-primary uppercase tracking-wide">
                        {item.title}
                      </h3>
                      <p className="text-base text-secondary" style={{ margin: '0 0 var(--space-xs)' }}>
                        {item.description}
                      </p>
                      <p className="text-sm text-tertiary" style={{ margin: 0 }}>
                        {item.details}
                      </p>
                    </div>
                    {item.time && (
                      <span className="text-xs text-tertiary uppercase tracking-wide">
                        {item.time}
                      </span>
                    )}
                  </div>
                )}
              />
            </ContentSection>
          )}

          <ContentSection title="Recent Commits">
            <DataList 
              items={recentCommits}
              renderItem={(commit) => (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 className="text-lg font-regular text-primary" style={{
                      marginBottom: 'var(--space-sm)'
                    }}>
                      {commit.message}
                    </h3>
                    <div style={{
                      display: 'flex',
                      gap: 'var(--space-lg)',
                      alignItems: 'center',
                      marginBottom: 'var(--space-xs)'
                    }}>
                      <span className="text-sm text-secondary">{commit.author}</span>
                      <span className="text-sm text-tertiary font-mono">{commit.hash}</span>
                      {commit.stats && (
                        <span className="text-sm text-tertiary">
                          +{commit.stats.additions} -{commit.stats.deletions}
                        </span>
                      )}
                    </div>
                    {commit.files && commit.files.length > 0 && (
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-tertiary)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        Files: {commit.files.slice(0, 3).join(', ')}
                        {commit.files.length > 3 && ` +${commit.files.length - 3} more`}
                      </div>
                    )}
                  </div>
                  <time className="text-xs text-tertiary uppercase tracking-wide">
                    {new Date(commit.date).toLocaleDateString()}
                  </time>
                </div>
              )}
            />
          </ContentSection>
        </>
      )}
    </>
  )
}