import React from 'react'
import { StandardLayout, PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { Brain, Lightbulb, Target, Zap, Search, FileText } from 'lucide-react'
import '@/styles/design-system.css'

export function Intelligence() {
  const stats = [
    { value: '47', label: 'AI Insights' },
    { value: '23', label: 'Patterns Found' },
    { value: '91%', label: 'Accuracy Rate' }
  ]

  const insights = [
    {
      title: 'API Rate Limiting Recommendation',
      description: 'Based on recent decisions about API architecture, implementing rate limiting would improve system stability and security.',
      confidence: '92%',
      priority: 'High',
      type: 'Security',
      relatedDecisions: ['ADR-001', 'ADR-004']
    },
    {
      title: 'Database Performance Pattern',
      description: 'Analysis shows consistent focus on database optimization. Consider implementing connection pooling across services.',
      confidence: '87%', 
      priority: 'Medium',
      type: 'Performance',
      relatedDecisions: ['ADR-002']
    },
    {
      title: 'Real-time Architecture Trend',
      description: 'Growing emphasis on real-time features suggests need for event-driven architecture patterns.',
      confidence: '95%',
      priority: 'High',
      type: 'Architecture',
      relatedDecisions: ['ADR-004']
    }
  ]

  const patterns = [
    {
      title: 'Microservices Migration Pattern',
      description: 'Consistent movement towards microservices architecture with emphasis on API gateways',
      occurrences: '8 decisions',
      strength: 'Strong'
    },
    {
      title: 'Performance-First Decisions',
      description: 'Team consistently prioritizes performance considerations in architectural choices',
      occurrences: '12 decisions', 
      strength: 'Very Strong'
    },
    {
      title: 'Technology Evaluation Process',
      description: 'Structured approach to evaluating new technologies with confidence scoring',
      occurrences: '15 decisions',
      strength: 'Strong'
    }
  ]

  const actions = [
    {
      icon: Brain,
      title: 'Generate Context',
      description: 'Create AI context for development tasks',
      onClick: () => console.log('Generate context clicked')
    },
    {
      icon: Lightbulb,
      title: 'Find Insights',
      description: 'Discover new patterns and recommendations',
      onClick: () => console.log('Find insights clicked')
    },
    {
      icon: Target,
      title: 'Pattern Analysis',
      description: 'Deep dive into decision patterns',
      onClick: () => console.log('Pattern analysis clicked')
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#2c2c2c'
      case 'medium': return '#959595'
      case 'low': return '#c0c0c0'
      default: return '#959595'
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case 'very strong': return '#2c2c2c'
      case 'strong': return '#959595'
      case 'moderate': return '#c0c0c0'
      default: return '#959595'
    }
  }

  return (
    <StandardLayout title="KRINS Chronicle Keeper">
      <PageHero 
        subtitle="Artificial Intelligence"
        title="Intelligence Center"
        description="AI-powered insights and context generation for organizational intelligence, pattern recognition, and decision support."
        stats={stats}
      />

      <ContentSection title="AI-Generated Insights">
        <DataList 
          items={insights}
          renderItem={(insight, index) => (
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
                    {insight.title}
                  </h3>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: getPriorityColor(insight.priority),
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wide)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    border: `1px solid ${getPriorityColor(insight.priority)}`,
                    fontWeight: 'var(--weight-medium)'
                  }}>
                    {insight.priority}
                  </span>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wide)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    border: '1px solid var(--color-border-medium)',
                    fontWeight: 'var(--weight-regular)'
                  }}>
                    {insight.type}
                  </span>
                </div>
                <p className="text-base text-secondary" style={{
                  lineHeight: 1.7,
                  margin: 0,
                  marginBottom: 'var(--space-sm)'
                }}>
                  {insight.description}
                </p>
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-lg)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-tertiary)'
                }}>
                  <span>Confidence: {insight.confidence}</span>
                  <span>Related: {insight.relatedDecisions.join(', ')}</span>
                </div>
              </div>
            </div>
          )}
        />
      </ContentSection>

      <ContentSection title="Decision Patterns">
        <DataList 
          items={patterns}
          renderItem={(pattern, index) => (
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
                    {pattern.title}
                  </h3>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: getStrengthColor(pattern.strength),
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wide)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    border: `1px solid ${getStrengthColor(pattern.strength)}`,
                    fontWeight: 'var(--weight-medium)'
                  }}>
                    {pattern.strength}
                  </span>
                </div>
                <p className="text-base text-secondary" style={{
                  lineHeight: 1.7,
                  margin: 0
                }}>
                  {pattern.description}
                </p>
              </div>
              <div className="text-xs text-tertiary uppercase tracking-wide" style={{
                whiteSpace: 'nowrap',
                marginLeft: 'var(--space-xl)',
                textAlign: 'right'
              }}>
                {pattern.occurrences}
              </div>
            </div>
          )}
        />
      </ContentSection>

      <ContentSection title="AI Capabilities">
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-4xl) 0',
          marginBottom: 'var(--space-4xl)'
        }}>
          <Brain style={{
            width: '48px',
            height: '48px',
            margin: '0 auto var(--space-lg)',
            color: 'var(--color-primary)'
          }} />
          <h3 className="display text-xl text-primary" style={{
            marginBottom: 'var(--space-md)'
          }}>
            Advanced AI Integration
          </h3>
          <p className="text-base text-secondary" style={{
            maxWidth: '480px',
            margin: '0 auto var(--space-lg)',
            lineHeight: 1.7
          }}>
            Leverage organizational intelligence to generate context for AI systems, 
            identify patterns in decision-making, and provide actionable insights.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-lg)',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            {[
              { icon: Brain, title: 'Context Generation', desc: 'AI-ready organizational context' },
              { icon: Lightbulb, title: 'Pattern Recognition', desc: 'Identify decision patterns' },
              { icon: Target, title: 'Predictive Insights', desc: 'Forecast decision outcomes' }
            ].map((capability, index) => {
              const Icon = capability.icon
              return (
                <div key={index} style={{
                  textAlign: 'center',
                  padding: 'var(--space-lg)'
                }}>
                  <Icon style={{
                    width: '24px',
                    height: '24px',
                    margin: '0 auto var(--space-md)',
                    color: 'var(--color-primary)'
                  }} />
                  <h4 className="text-sm font-medium text-primary uppercase tracking-wide" style={{
                    marginBottom: 'var(--space-xs)'
                  }}>
                    {capability.title}
                  </h4>
                  <p className="text-xs text-secondary">
                    {capability.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Intelligence Actions">
        <ActionGrid actions={actions} />
      </ContentSection>
    </StandardLayout>
  )
}