import React from 'react'
import { StandardLayout, PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { BarChart3, TrendingUp, Target, FileText, Download } from 'lucide-react'
import '@/styles/design-system.css'

export function Analytics() {
  const stats = [
    { value: '247', label: 'Total Decisions' },
    { value: '87%', label: 'Success Rate' },
    { value: '142', label: 'Active Patterns' }
  ]

  const metricsData = [
    {
      title: 'Decision Implementation Rate',
      value: '87%',
      change: '+5% this month',
      description: 'Percentage of accepted decisions that have been successfully implemented'
    },
    {
      title: 'Team Participation',
      value: '94%',
      change: '+12% this quarter',
      description: 'Active participation rate across all team members in decision processes'
    },
    {
      title: 'Decision Confidence',
      value: '8.4/10',
      change: '+0.8 improvement',
      description: 'Average confidence score for architectural decisions'
    },
    {
      title: 'Pattern Recognition',
      value: '142',
      change: '+18 new patterns',
      description: 'AI-identified patterns in decision making processes'
    }
  ]

  const trendsData = [
    {
      title: 'API Architecture Focus',
      description: 'Increasing emphasis on API design patterns and microservices architecture',
      time: 'Last 30 days',
      impact: 'High'
    },
    {
      title: 'Real-time Feature Adoption',
      description: 'Growing trend towards real-time capabilities and WebSocket implementations',
      time: 'Last 60 days', 
      impact: 'Medium'
    },
    {
      title: 'Database Optimization',
      description: 'Focus on performance improvements and semantic search capabilities',
      time: 'Last 90 days',
      impact: 'High'
    }
  ]

  const actions = [
    {
      icon: BarChart3,
      title: 'Generate Report',
      description: 'Export comprehensive analytics report',
      onClick: () => console.log('Generate report clicked')
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Deep dive into decision patterns',
      onClick: () => console.log('Trend analysis clicked')
    },
    {
      icon: Target,
      title: 'Performance Review',
      description: 'Review implementation success rates',
      onClick: () => console.log('Performance review clicked')
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

  return (
    <StandardLayout title="KRINS Chronicle Keeper">
      <PageHero 
        subtitle="Decision Intelligence"
        title="Analytics Dashboard"
        description="Advanced analytics and insights into organizational decision patterns, implementation success rates, and emerging trends."
        stats={stats}
      />

      <ContentSection title="Key Performance Metrics">
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
      </ContentSection>

      <ContentSection title="Decision Trends">
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
      </ContentSection>

      <ContentSection title="Analytics Actions">
        <ActionGrid actions={actions} />
      </ContentSection>
    </StandardLayout>
  )
}