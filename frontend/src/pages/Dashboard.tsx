import React, { useState, useEffect } from 'react'
import { StandardLayout, PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { FileText, BarChart3, Brain, Loader2, AlertCircle } from 'lucide-react'
import { analyticsService, adrService, intelligenceService } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import '@/styles/design-system.css'
// Test Dashboard JSX

export function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [recentADRs, setRecentADRs] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load dashboard overview, recent ADRs, and insights in parallel
      const [dashboard, adrs, aiInsights] = await Promise.all([
        analyticsService.getDashboardOverview(30),
        adrService.list({ limit: 5 }),
        intelligenceService.getInsights({ limit: 3 }).catch(() => ({ insights: [] }))
      ])
      
      setDashboardData(dashboard)
      setRecentADRs(adrs)
      setInsights(aiInsights.insights || [])
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const stats = dashboardData ? [
    { value: dashboardData.metrics?.total_adrs?.toString() || '0', label: 'Total ADRs' },
    { value: dashboardData.metrics?.recent_adrs?.toString() || '0', label: 'Recent ADRs' },
    { value: Math.round((dashboardData.health_status?.score || 0) * 100) + '%', label: 'Health Score' }
  ] : [
    { value: '0', label: 'Total ADRs' },
    { value: '0', label: 'Recent ADRs' },
    { value: '0%', label: 'Health Score' }
  ]

  // Create activities from recent ADRs and insights
  const activities = [
    ...recentADRs.slice(0, 2).map(adr => ({
      title: `${adr.adr_id}: ${adr.title}`,
      description: adr.context || adr.decision.substring(0, 100) + '...',
      time: new Date(adr.created_at).toLocaleDateString()
    })),
    ...insights.slice(0, 2).map(insight => ({
      title: `AI Insight: ${insight.title}`,
      description: insight.description,
      time: `${insight.insight_type} analysis`
    }))
  ]

  const actions = [
    {
      icon: FileText,
      title: 'View ADRs',
      description: 'Browse architecture decision records',
      onClick: () => navigate('/adrs')
    },
    {
      icon: BarChart3,
      title: 'View Analytics',
      description: 'Explore decision patterns and metrics',
      onClick: () => navigate('/analytics')
    },
    {
      icon: Brain,
      title: 'AI Intelligence',
      description: 'Get intelligent recommendations',
      onClick: () => navigate('/intelligence')
    }
  ]

  // Error state
  if (error) {
    return (
      <StandardLayout title="KRINS Chronicle Keeper">
        <PageHero 
          subtitle="Organizational Intelligence"
          title="Intelligence Dashboard"
          description="Real-time organizational intelligence system for architecture decision tracking and institutional memory."
          stats={stats}
        />
        <ContentSection>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6xl) 0',
            textAlign: 'center'
          }}>
            <AlertCircle style={{
              width: '48px',
              height: '48px',
              color: 'var(--color-error)',
              marginBottom: 'var(--space-lg)'
            }} />
            <h3 className="text-xl text-primary" style={{ marginBottom: 'var(--space-md)' }}>
              Failed to Load Dashboard
            </h3>
            <p className="text-base text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
              {error}
            </p>
            <button 
              onClick={loadDashboardData}
              className="btn"
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-background)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </ContentSection>
      </StandardLayout>
    )
  }

  return (
    <StandardLayout title="KRINS Chronicle Keeper">
      <PageHero 
        subtitle="Organizational Intelligence"
        title="Intelligence Dashboard"
        description="Real-time organizational intelligence system for architecture decision tracking and institutional memory."
        stats={stats}
      />
      
      <ContentSection title="Recent Activity">
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6xl) 0'
          }}>
            <Loader2 style={{
              width: '32px',
              height: '32px',
              color: 'var(--color-primary)',
              marginRight: 'var(--space-md)'
            }} className="animate-spin" />
            <span className="text-base text-secondary">Loading dashboard...</span>
          </div>
        ) : activities.length > 0 ? (
          <DataList 
            items={activities}
            renderItem={(activity, index) => (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 className="text-lg font-regular text-primary uppercase tracking-wide" style={{
                    marginBottom: 'var(--space-sm)'
                  }}>
                    {activity.title}
                  </h3>
                  <p className="text-base text-secondary" style={{
                    lineHeight: 1.7,
                    margin: 0
                  }}>
                    {activity.description}
                  </p>
                </div>
                <time className="text-xs text-tertiary uppercase tracking-wide" style={{
                  whiteSpace: 'nowrap',
                  marginLeft: 'var(--space-xl)'
                }}>
                  {activity.time}
                </time>
              </div>
            )}
          />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-4xl) 0',
            color: 'var(--color-secondary)'
          }}>
            <FileText style={{
              width: '48px',
              height: '48px',
              margin: '0 auto var(--space-lg)',
              color: 'var(--color-tertiary)'
            }} />
            <h3 className="display text-xl text-secondary" style={{
              marginBottom: 'var(--space-md)'
            }}>
              No Recent Activity
            </h3>
            <p className="text-base text-secondary">
              Activity will appear here once you start creating ADRs and generating AI insights.
            </p>
          </div>
        )}
      </ContentSection>
      
      <ContentSection title="Quick Actions">
        <ActionGrid actions={actions} />
      </ContentSection>
    </StandardLayout>
  )
}