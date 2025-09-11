import React, { useState, useEffect } from 'react'
import { StandardLayout, PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { Brain, Lightbulb, Target, Zap, Search, FileText, Loader2, AlertCircle } from 'lucide-react'
import { intelligenceService } from '@/services/api'
import { IntelligenceInsight } from '@/types'
import '@/styles/design-system.css'

export function Intelligence() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsights] = useState<IntelligenceInsight[]>([])
  const [patterns, setPatterns] = useState<any[]>([])
  const [contextGeneration, setContextGeneration] = useState<any>(null)

  // Load intelligence data on component mount
  useEffect(() => {
    loadIntelligenceData()
  }, [])

  const loadIntelligenceData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load insights and analyze organization in parallel
      const [insightsData, organizationAnalysis] = await Promise.all([
        intelligenceService.getInsights({ limit: 10 }),
        intelligenceService.analyzeOrganization({ 
          analysis_type: 'health',
          period_days: 30 
        })
      ])
      
      setInsights(insightsData.insights || [])
      
      // Extract patterns from organization analysis
      if (organizationAnalysis.patterns) {
        setPatterns(organizationAnalysis.patterns)
      }
      
    } catch (err) {
      console.error('Failed to load intelligence data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load intelligence data')
    } finally {
      setLoading(false)
    }
  }

  // Generate AI context for testing
  const generateTestContext = async () => {
    try {
      const contextRequest = {
        ai_system: 'krins-frontend-demo',
        context_type: 'architecture-review' as const,
        query: 'Analyze current system architecture and provide recommendations',
        include_patterns: true,
        include_decisions: true,
        include_runbooks: false
      }
      
      const response = await intelligenceService.generateContext(contextRequest)
      setContextGeneration(response)
      console.log('Generated context:', response)
    } catch (err) {
      console.error('Failed to generate context:', err)
    }
  }

  // Compute stats from real data
  const heroStats = [
    { value: insights.length.toString(), label: 'AI Insights' },
    { value: patterns.length.toString(), label: 'Patterns Found' },
    { value: insights.length > 0 ? 
      Math.round(insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length) + '%' : 
      '0%', 
      label: 'Avg Confidence' 
    }
  ]

  const actions = [
    {
      icon: Brain,
      title: 'Generate AI Context',
      description: 'Create context for AI development systems',
      onClick: generateTestContext
    },
    {
      icon: Lightbulb,
      title: 'Refresh Insights',
      description: 'Reload intelligence analysis from backend',
      onClick: loadIntelligenceData
    },
    {
      icon: Target,
      title: 'Analyze Trends',
      description: 'Run comprehensive trend analysis',
      onClick: async () => {
        try {
          const analysis = await intelligenceService.analyzeOrganization({ 
            analysis_type: 'trends',
            period_days: 90 
          })
          console.log('Trend analysis:', analysis)
          // TODO: Display results in modal or navigate to detailed view
        } catch (err) {
          console.error('Failed to analyze trends:', err)
        }
      }
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

  // Error state
  if (error) {
    return (
      <StandardLayout title="KRINS Chronicle Keeper">
        <PageHero 
          subtitle="Artificial Intelligence"
          title="Intelligence Center"
          description="AI-powered insights and context generation for organizational intelligence, pattern recognition, and decision support."
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
              Failed to Load Intelligence Data
            </h3>
            <p className="text-base text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
              {error}
            </p>
            <button 
              onClick={loadIntelligenceData}
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
        subtitle="Artificial Intelligence"
        title="Intelligence Center"
        description="AI-powered insights and context generation for organizational intelligence, pattern recognition, and decision support."
        stats={heroStats}
      />

      <ContentSection title="AI-Generated Insights">
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
            <span className="text-base text-secondary">Loading AI insights...</span>
          </div>
        ) : insights.length > 0 ? (
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
                    color: getPriorityColor(insight.impact_level),
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wide)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    border: `1px solid ${getPriorityColor(insight.impact_level)}`,
                    fontWeight: 'var(--weight-medium)'
                  }}>
                    {insight.impact_level}
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
                    {insight.insight_type}
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
                  <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                  <span>Sources: {insight.data_sources.join(', ')}</span>
                  {insight.suggested_actions.length > 0 && (
                    <span>Actions: {insight.suggested_actions.length}</span>
                  )}
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
            <Brain style={{
              width: '48px',
              height: '48px',
              margin: '0 auto var(--space-lg)',
              color: 'var(--color-tertiary)'
            }} />
            <h3 className="display text-xl text-secondary" style={{
              marginBottom: 'var(--space-md)'
            }}>
              No AI Insights Available
            </h3>
            <p className="text-base text-secondary">
              AI insights will appear here once the system analyzes your organizational data and decision patterns.
            </p>
          </div>
        )}
      </ContentSection>

      <ContentSection title="Decision Patterns">
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
            <span className="text-sm text-secondary">Analyzing patterns...</span>
          </div>
        ) : patterns.length > 0 ? (
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
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-4xl) 0',
            color: 'var(--color-secondary)'
          }}>
            <Target style={{
              width: '48px',
              height: '48px',
              margin: '0 auto var(--space-lg)',
              color: 'var(--color-tertiary)'
            }} />
            <h3 className="display text-xl text-secondary" style={{
              marginBottom: 'var(--space-md)'
            }}>
              No Patterns Detected
            </h3>
            <p className="text-base text-secondary">
              Decision patterns will appear here once the AI analyzes enough organizational data to identify trends.
            </p>
          </div>
        )}
      </ContentSection>

      {/* Show generated context if available */}
      {contextGeneration && (
        <ContentSection title="Generated AI Context">
          <div style={{
            padding: 'var(--space-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            marginBottom: 'var(--space-lg)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-md)'
            }}>
              <h4 className="text-lg text-primary uppercase tracking-wide">
                Context ID: {contextGeneration.context_id}
              </h4>
              <span className="text-sm text-secondary">
                Relevance: {Math.round(contextGeneration.relevance_score * 100)}%
              </span>
            </div>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontSize: 'var(--text-sm)',
              lineHeight: 1.6,
              color: 'var(--color-secondary)',
              margin: 0,
              fontFamily: 'var(--font-mono)'
            }}>
              {contextGeneration.generated_context}
            </pre>
          </div>
        </ContentSection>
      )}

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