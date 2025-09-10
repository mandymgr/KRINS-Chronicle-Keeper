import React from 'react'
import { StandardLayout, PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { FileText, BarChart3, Brain } from 'lucide-react'
import '@/styles/design-system.css'

// Eksempel på hvordan man bruker designsystemet
export function ExamplePage() {
  const stats = [
    { value: '24', label: 'Active ADRs' },
    { value: '12', label: 'Team Members' },
    { value: '92%', label: 'Success Rate' }
  ]

  const activities = [
    {
      title: 'ADR-024: API Gateway Strategy',
      description: 'New architecture decision record created for microservices implementation',
      time: '2 minutes ago'
    },
    {
      title: 'Team Review Session',
      description: 'Five members actively reviewing database optimization decisions',
      time: '15 minutes ago'
    },
    {
      title: 'AI Pattern Analysis',
      description: 'Performance patterns identified in authentication service',
      time: '1 hour ago'
    }
  ]

  const actions = [
    {
      icon: FileText,
      title: 'Create ADR',
      description: 'Document new architecture decisions',
      onClick: () => console.log('Create ADR clicked')
    },
    {
      icon: BarChart3,
      title: 'View Analytics',
      description: 'Explore decision patterns and metrics',
      onClick: () => console.log('Analytics clicked')
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Get intelligent recommendations',
      onClick: () => console.log('AI Insights clicked')
    }
  ]

  return (
    <StandardLayout title="KRINS Chronicle Keeper">
      <PageHero 
        subtitle="Organizational Intelligence"
        title="Example Dashboard"
        description="Demonstrasjon av standardisert designsystem for konsistent brukeropplevelse på tvers av hele frontend-plattformen."
        stats={stats}
      />
      
      <ContentSection title="Recent Activity">
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
      </ContentSection>
      
      <ContentSection title="Quick Actions">
        <ActionGrid actions={actions} />
      </ContentSection>
    </StandardLayout>
  )
}