import React, { useState, useEffect } from 'react'
import { StandardLayout, PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { BarChart3, TrendingUp, Target, FileText, Download, Loader2, AlertCircle } from 'lucide-react'
import { analyticsService, decisionService } from '@/services/api'
import { DashboardOverview, DecisionAnalytics } from '@/types'
import '@/styles/design-system.css'
// Fixed JSX conditional rendering structure
// Test change to trigger HMR

export function Analytics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null)
  const [decisionAnalytics, setDecisionAnalytics] = useState<DecisionAnalytics | null>(null)

  // Load analytics data on component mount
  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load dashboard overview and decision analytics in parallel
      const [dashboard, analytics] = await Promise.all([
        analyticsService.getDashboardOverview(30),
        decisionService.getAnalytics(30)
      ])
      
      setDashboardData(dashboard)
      setDecisionAnalytics(analytics)
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Compute stats for hero section
  const heroStats = dashboardData ? [
    { value: dashboardData.metrics?.total_adrs?.toString() || '0', label: 'Total Decisions' },
    { value: Math.round((dashboardData.metrics?.evidence_coverage || 0) * 100) + '%', label: 'Evidence Coverage' },
    { value: Math.round((dashboardData.health_status?.score || 0) * 100) + '%', label: 'Health Score' }
  ] : [
    { value: '0', label: 'Total Decisions' },
    { value: '0%', label: 'Evidence Coverage' },
    { value: '0%', label: 'Health Score' }
  ]

  // Compute metrics data from real analytics
  const metricsData = dashboardData && decisionAnalytics ? [
    {
      title: 'Decision Velocity',
      value: dashboardData.metrics?.decision_velocity?.toFixed(1) || '0',
      change: dashboardData.trends?.velocity ? 
        `${dashboardData.trends.velocity.change_percent > 0 ? '+' : ''}${dashboardData.trends.velocity.change_percent.toFixed(1)}% this period` : 
        'No trend data',
      description: 'Average number of decisions made per week'
    },
    {
      title: 'Average Confidence',
      value: `${(decisionAnalytics.average_confidence || 0).toFixed(1)}/10`,
      change: 'Updated in real-time',
      description: 'Average confidence score across all architectural decisions'
    },
    {
      title: 'Implementation Health',
      value: Math.round((dashboardData.health_status?.score || 0) * 100) + '%',
      change: `Level: ${dashboardData.health_status?.level || 'unknown'}`,
      description: 'Overall health of decision implementation and tracking'
    },
    {
      title: 'Active Components',
      value: dashboardData.metrics?.component_activity?.length?.toString() || '0',
      change: `${decisionAnalytics.recent_activity || 0} recent`,
      description: 'Number of components with active decision-making'
    }
  ] : []

  // Convert component activity to trends data
  const trendsData = dashboardData?.metrics?.component_activity?.slice(0, 5).map((comp, index) => ({
    title: `${comp.component} Component Activity`,
    description: `${comp.count} decisions with ${(comp.avg_confidence || 0).toFixed(1)} average confidence`,
    time: `${comp.activity ? Math.round(comp.activity * 100) + '% activity' : 'Activity unknown'}`,
    impact: comp.count >= 3 ? 'High' : comp.count >= 1 ? 'Medium' : 'Low'
  })) || []

  const actions = [
    {
      icon: BarChart3,
      title: 'Generate Report',
      description: 'Export comprehensive analytics report',
      onClick: async () => {
        try {
          const report = await analyticsService.getComprehensiveReport({ 
            days: 30, 
            include_recommendations: true 
          })
          console.log('Generated report:', report)
          // TODO: Download or display report
        } catch (err) {
          console.error('Failed to generate report:', err)
        }
      }
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'View detailed decision trends',
      onClick: async () => {
        try {
          const trends = await analyticsService.getDecisionTrends({ 
            days: 90, 
            granularity: 'week' 
          })
          console.log('Trend analysis:', trends)
          // TODO: Navigate to detailed trends view
        } catch (err) {
          console.error('Failed to load trends:', err)
        }
      }
    },
    {
      icon: Target,
      title: 'Refresh Analytics',
      description: 'Reload analytics data from backend',
      onClick: loadAnalyticsData
    }
  ]

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return '#2c2c2c'
      case 'medium': return '#959595'
      case 'low': return '#c0c0c0'
      default: return '#959595'
    }
  }

  // Error state
  if (error) {
    return (
      <StandardLayout title="KRINS Chronicle Keeper">
        <PageHero 
          subtitle="Decision Intelligence"
          title="Analytics Dashboard"
          description="Advanced analytics and insights into organizational decision patterns, implementation success rates, and emerging trends."
          stats={heroStats}
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
              Failed to Load Analytics
            </h3>
            <p className="text-base text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
              {error}
            </p>
            <button 
              onClick={loadAnalyticsData}
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
        subtitle="Decision Intelligence"
        title="Analytics Dashboard"
        description="Advanced analytics and insights into organizational decision patterns, implementation success rates, and emerging trends."
        stats={heroStats}
      />

      <ContentSection title="Key Performance Metrics">
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
            <span className="text-base text-secondary">Loading analytics...</span>
          </div>
        ) : metricsData.length > 0 ? (
          <DataList 
            items={metricsData}
            renderItem={(metric, index) => (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'var(--space-lg)',
                  marginBottom: 'var(--space-sm)'
                }}>
                  <h3 className="text-lg font-regular text-primary uppercase tracking-wide">
                    {metric.title}
                  </h3>
                  <span className="display text-2xl text-primary" style={{
                    fontWeight: 'var(--weight-regular)'
                  }}>
                    {metric.value}
                  </span>
                </div>
                <p className="text-base text-secondary" style={{
                  lineHeight: 1.7,
                  margin: 0,
                  marginBottom: 'var(--space-xs)'
                }}>
                  {metric.description}
                </p>
                <div className="text-sm text-tertiary" style={{
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wide)'
                }}>
                  {metric.change}
                </div>
              </div>
            </div>
          )}
        />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-4xl) 0',
            color: 'var(--color-secondary)'
          }}>
            <BarChart3 style={{
              width: '48px',
              height: '48px',
              margin: '0 auto var(--space-lg)',
              color: 'var(--color-tertiary)'
            }} />
            <h3 className="display text-xl text-secondary" style={{
              marginBottom: 'var(--space-md)'
            }}>
              No Metrics Available
            </h3>
            <p className="text-base text-secondary">
              Performance metrics will appear here once analytics data is available.
            </p>
          </div>
        )}
      </ContentSection>

      <ContentSection title="Component Activity Trends">
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4xl) 0'
          }}>
            <Loader2 style={{
              width: '24px',
              height: '24px',
              color: 'var(--color-primary)',
              marginRight: 'var(--space-sm)'
            }} className="animate-spin" />
            <span className="text-sm text-secondary">Loading trends...</span>
          </div>
        ) : trendsData.length > 0 ? (
          <DataList 
            items={trendsData}
            renderItem={(trend, index) => (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  marginBottom: 'var(--space-sm)'
                }}>
                  <h3 className="text-lg font-regular text-primary uppercase tracking-wide">
                    {trend.title}
                  </h3>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: getImpactColor(trend.impact),
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wide)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    border: `1px solid ${getImpactColor(trend.impact)}`,
                    fontWeight: 'var(--weight-medium)'
                  }}>
                    {trend.impact} Impact
                  </span>
                </div>
                <p className="text-base text-secondary" style={{
                  lineHeight: 1.7,
                  margin: 0
                }}>
                  {trend.description}
                </p>
              </div>
              <time className="text-xs text-tertiary uppercase tracking-wide" style={{
                whiteSpace: 'nowrap',
                marginLeft: 'var(--space-xl)'
              }}>
                {trend.time}
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
            <BarChart3 style={{
              width: '48px',
              height: '48px',
              margin: '0 auto var(--space-lg)',
              color: 'var(--color-tertiary)'
            }} />
            <h3 className="display text-xl text-secondary" style={{
              marginBottom: 'var(--space-md)'
            }}>
              No Activity Data
            </h3>
            <p className="text-base text-secondary">
              Component activity data will appear here once decisions are tracked across different components.
            </p>
          </div>
        )}
      </ContentSection>

      <ContentSection title="Analytics Actions">
        <ActionGrid actions={actions} />
      </ContentSection>
    </StandardLayout>
  )
}