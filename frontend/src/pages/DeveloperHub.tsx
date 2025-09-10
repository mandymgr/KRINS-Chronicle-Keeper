import React, { useState, useEffect } from 'react'
import { StandardLayout, PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { 
  Database, 
  Server, 
  Brain, 
  Palette, 
  GitBranch, 
  Terminal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Code,
  Layers
} from 'lucide-react'
import '@/styles/design-system.css'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  description: string
  details?: string
}

interface SystemMetric {
  label: string
  value: string
  trend?: 'up' | 'down' | 'stable'
}

export function DeveloperHub() {
  const [systemHealth, setSystemHealth] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)

  const stats: SystemMetric[] = [
    { value: '8', label: 'Active Services' },
    { value: '3', label: 'AI Systems' },  
    { value: '5', label: 'Frontend Pages' },
    { value: '99%', label: 'Uptime' }
  ]

  // Mock system status - in real implementation this would fetch from APIs
  useEffect(() => {
    const mockSystemStatus: ServiceStatus[] = [
      {
        name: 'PostgreSQL + pgvector',
        status: 'healthy',
        description: 'Database operational with semantic search',
        details: 'Port 5433, 12 tables, pgvector extension active'
      },
      {
        name: 'Redis Cache',
        status: 'healthy', 
        description: 'Caching layer operational',
        details: 'Port 6380, memory usage: 45MB'
      },
      {
        name: 'FastAPI Backend',
        status: 'warning',
        description: 'Backend services running',
        details: 'Port 8000, 4 API groups, needs restart'
      },
      {
        name: 'React Frontend',
        status: 'healthy',
        description: 'Frontend serving correctly',
        details: 'Port 3000, Vite dev server, hot reload active'
      },
      {
        name: 'Krin Personal Companion',
        status: 'healthy',
        description: 'AI companion with memory database',
        details: 'SQLite operational, 4 active memories'
      },
      {
        name: 'MCP Team Coordination',
        status: 'healthy',
        description: 'AI team coordination system',
        details: '5 specialists available, Claude Code integration'
      },
      {
        name: 'Unified AI Context',
        status: 'healthy',
        description: 'Personal + organizational intelligence',
        details: 'Context generation operational'
      },
      {
        name: 'Design System',
        status: 'healthy',
        description: 'Kinfolk-inspired component system',
        details: 'StandardLayout, PageHero, ContentSection active'
      }
    ]

    setTimeout(() => {
      setSystemHealth(mockSystemStatus)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} style={{ color: 'var(--success)' }} />
      case 'warning': return <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
      case 'error': return <XCircle size={16} style={{ color: 'var(--error)' }} />
      default: return <AlertCircle size={16} style={{ color: 'var(--text-tertiary)' }} />
    }
  }

  const developmentActions = [
    {
      icon: Database,
      title: 'Start Docker Stack',
      description: 'Launch PostgreSQL, Redis, and all services',
      onClick: () => console.log('Starting Docker services...')
    },
    {
      icon: Brain,
      title: 'AI Systems Demo',
      description: 'Test unified AI intelligence capabilities',
      onClick: () => console.log('Running AI demo...')
    },
    {
      icon: Terminal,
      title: 'MCP Commands',
      description: 'Execute intelligent development commands',
      onClick: () => console.log('Opening MCP interface...')
    },
    {
      icon: Palette,
      title: 'Design System',
      description: 'View component library and patterns',
      onClick: () => console.log('Opening design system...')
    },
    {
      icon: Code,
      title: 'Code Analysis',
      description: 'Run comprehensive codebase analysis',
      onClick: () => console.log('Starting code analysis...')
    },
    {
      icon: Activity,
      title: 'System Monitoring',
      description: 'Real-time performance and health metrics',
      onClick: () => console.log('Opening monitoring dashboard...')
    }
  ]

  const capabilities = [
    {
      title: 'DECISION_MANAGEMENT',
      description: 'Advanced ADR tracking, decision analytics, evidence collection',
      files: '5 TypeScript files, decision-tracker.ts (17KB)',
      time: 'Last updated: 3 hours ago'
    },
    {
      title: 'AI_INTEGRATION',
      description: 'Unified AI systems, Krin companion, MCP team coordination',
      files: '15+ components, context-provider.ts, adr-parser.ts',
      time: 'Last updated: 1 hour ago'
    },
    {
      title: 'Frontend React App',
      description: 'Kinfolk-inspired design system with 5 main pages',
      files: 'Dashboard, ADRs, Analytics, Intelligence, Settings',
      time: 'Last updated: 30 minutes ago'
    },
    {
      title: 'Docker Infrastructure', 
      description: 'Production-ready containerization with health monitoring',
      files: 'docker-compose.yml, PostgreSQL, Redis, FastAPI',
      time: 'Last updated: 2 hours ago'
    }
  ]

  return (
    <StandardLayout title="KRINS Chronicle Keeper">
      <PageHero 
        subtitle="Internal Development"
        title="Master Developer Hub"
        description="Complete system overview, health monitoring, and development tools for KRINS-Chronicle-Keeper organizational intelligence platform."
        stats={stats}
      />
      
      <ContentSection title="System Health & Services">
        {loading ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 'var(--space-xl)',
            color: 'var(--text-secondary)'
          }}>
            Loading system status...
          </div>
        ) : (
          <DataList 
            items={systemHealth}
            renderItem={(service, index) => (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-lg)'
              }}>
                <div style={{ marginTop: '2px' }}>
                  {getStatusIcon(service.status)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    <h3 className="text-lg font-regular text-primary uppercase tracking-wide">
                      {service.name}
                    </h3>
                    <span 
                      className={`text-xs uppercase tracking-wide font-medium`}
                      style={{ 
                        color: service.status === 'healthy' ? 'var(--success)' :
                               service.status === 'warning' ? 'var(--warning)' :
                               service.status === 'error' ? 'var(--error)' :
                               'var(--text-tertiary)'
                      }}
                    >
                      {service.status}
                    </span>
                  </div>
                  <p className="text-base text-secondary" style={{ lineHeight: 1.7, margin: 0 }}>
                    {service.description}
                  </p>
                  {service.details && (
                    <p className="text-sm text-tertiary" style={{ 
                      lineHeight: 1.6, 
                      margin: 0, 
                      marginTop: 'var(--space-xs)',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {service.details}
                    </p>
                  )}
                </div>
              </div>
            )}
          />
        )}
      </ContentSection>

      <ContentSection title="System Capabilities">
        <DataList 
          items={capabilities}
          renderItem={(capability, index) => (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <h3 className="text-lg font-regular text-primary uppercase tracking-wide" style={{
                  marginBottom: 'var(--space-sm)'
                }}>
                  {capability.title}
                </h3>
                <p className="text-base text-secondary" style={{
                  lineHeight: 1.7,
                  margin: 0,
                  marginBottom: 'var(--space-xs)'
                }}>
                  {capability.description}
                </p>
                <p className="text-sm text-tertiary" style={{
                  lineHeight: 1.6,
                  margin: 0,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {capability.files}
                </p>
              </div>
              <time className="text-xs text-tertiary uppercase tracking-wide" style={{
                whiteSpace: 'nowrap',
                marginLeft: 'var(--space-xl)'
              }}>
                {capability.time}
              </time>
            </div>
          )}
        />
      </ContentSection>
      
      <ContentSection title="Development Tools">
        <ActionGrid actions={developmentActions} />
      </ContentSection>
    </StandardLayout>
  )
}