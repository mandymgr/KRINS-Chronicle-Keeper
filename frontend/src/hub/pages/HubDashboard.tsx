// KRINS Developer Hub - Main Dashboard
// Real system monitoring with live data - NO MOCK DATA

import { useState, useEffect } from 'react'
import { PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { HubNavigation, HubQuickActions } from '../components/HubNavigation'
import { hubApi } from '../api/hubApi'
import type { SystemHealth, DockerService, GitStatus, BuildHealth, MCPServerStatus } from '../types/hubTypes'
import { 
  CheckCircle,
  XCircle,
  AlertCircle,
  Server,
  GitBranch,
  Code,
  Brain,
  Play,
  Square,
  RefreshCw,
  Terminal,
  FileText,
  Settings
} from 'lucide-react'

export default function HubDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [dockerServices, setDockerServices] = useState<DockerService[]>([])
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [buildHealth, setBuildHealth] = useState<BuildHealth | null>(null)
  const [mcpStatus, setMcpStatus] = useState<MCPServerStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Load real system data
  const loadSystemData = async () => {
    setLoading(true)
    try {
      console.log('🔄 Loading real system data...')
      
      const [health, docker, git, build, mcp] = await Promise.allSettled([
        hubApi.getSystemHealth(),
        hubApi.getDockerStatus(),
        hubApi.getGitStatus(),
        hubApi.getBuildHealth(),
        hubApi.getMCPServerStatus()
      ])

      if (health.status === 'fulfilled') {
        setSystemHealth(health.value)
        console.log('✅ System health loaded:', health.value)
      } else {
        console.error('❌ Failed to load system health:', health.reason)
      }

      if (docker.status === 'fulfilled') {
        setDockerServices(docker.value)
        console.log('✅ Docker services loaded:', docker.value.length, 'services')
      } else {
        console.error('❌ Failed to load Docker services:', docker.reason)
      }

      if (git.status === 'fulfilled') {
        setGitStatus(git.value)
        console.log('✅ Git status loaded:', git.value.branch)
      } else {
        console.error('❌ Failed to load Git status:', git.reason)
      }

      if (build.status === 'fulfilled') {
        setBuildHealth(build.value)
        console.log('✅ Build health loaded')
      } else {
        console.error('❌ Failed to load build health:', build.reason)
      }

      if (mcp.status === 'fulfilled') {
        setMcpStatus(mcp.value)
        console.log('✅ MCP status loaded:', mcp.value.length, 'servers')
      } else {
        console.error('❌ Failed to load MCP status:', mcp.reason)
      }
      
      setLastRefresh(new Date())
    } catch (error) {
      console.error('💥 Error loading system data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount and refresh every 30 seconds
  useEffect(() => {
    loadSystemData()
    const interval = setInterval(loadSystemData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate system stats
  const stats = [
    { 
      value: dockerServices.filter(s => s.state === 'running').length.toString(), 
      label: 'Running Services' 
    },
    { 
      value: gitStatus?.files?.total_changes?.toString() || '0', 
      label: 'Uncommitted Changes' 
    },
    { 
      value: buildHealth?.typescript?.errors?.toString() || '0', 
      label: 'TypeScript Errors' 
    },
    { 
      value: mcpStatus.filter(s => s.online).length.toString(), 
      label: 'AI Servers Online' 
    }
  ]

  // Status icon helper
  const getStatusIcon = (status: 'healthy' | 'warning' | 'error' | 'unknown', size = 16) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={size} style={{ color: '#10b981' }} />
      case 'warning': return <AlertCircle size={size} style={{ color: '#f59e0b' }} />
      case 'error': return <XCircle size={size} style={{ color: '#ef4444' }} />
      default: return <AlertCircle size={size} style={{ color: 'var(--color-tertiary)' }} />
    }
  }

  // Real executable actions
  const quickActions = [
    {
      icon: Play,
      title: 'Start All Services',
      description: 'Start all Docker Compose services',
      onClick: async () => {
        console.log('🚀 Starting all Docker services...')
        try {
          for (const service of dockerServices.filter(s => s.state !== 'running')) {
            await hubApi.startDockerService(service.name)
            console.log(`✅ Started ${service.name}`)
          }
          await loadSystemData() // Refresh after starting
        } catch (error) {
          console.error('❌ Failed to start services:', error)
        }
      }
    },
    {
      icon: Code,
      title: 'Run Type Check',
      description: 'Execute TypeScript type checking',
      onClick: async () => {
        console.log('🔍 Running TypeScript check...')
        try {
          const result = await hubApi.runTypeCheck()
          console.log('TypeScript check result:', result)
          await loadSystemData() // Refresh build health
        } catch (error) {
          console.error('❌ TypeScript check failed:', error)
        }
      }
    },
    {
      icon: GitBranch,
      title: 'Git Status',
      description: 'Refresh Git repository status',
      onClick: async () => {
        console.log('📊 Refreshing Git status...')
        try {
          const status = await hubApi.getGitStatus()
          setGitStatus(status)
          console.log('✅ Git status refreshed:', status)
        } catch (error) {
          console.error('❌ Failed to refresh Git status:', error)
        }
      }
    },
    {
      icon: Brain,
      title: 'AI Context Demo',
      description: 'Test AI context generation',
      onClick: async () => {
        console.log('🧠 Running AI context demo...')
        try {
          const context = await hubApi.generateAIContext('system health check', 'mixed')
          console.log('✅ AI Context generated:', context)
        } catch (error) {
          console.error('❌ AI context generation failed:', error)
        }
      }
    },
    {
      icon: FileText,
      title: 'Create ADR',
      description: 'Create new Architecture Decision Record',
      onClick: () => {
        // TODO: Open ADR creation modal
        console.log('📝 Opening ADR creation modal...')
      }
    },
    {
      icon: RefreshCw,
      title: 'Refresh All',
      description: 'Refresh all system data',
      onClick: loadSystemData
    }
  ]

  return (
    <>
      <HubNavigation />
      
      <PageHero 
        subtitle="Developer Hub"
        title="System Command Center"
        description="Real-time monitoring and control of your development environment. All data is live - no mock information."
        stats={stats}
      />
      
      {/* Last Refresh Info */}
      <div style={{ 
        textAlign: 'center', 
        color: 'var(--color-tertiary)', 
        fontSize: 'var(--text-xs)',
        marginBottom: 'var(--space-4xl)'
      }}>
        Last refreshed: {lastRefresh.toLocaleTimeString()} 
        {loading && ' (updating...)'}
      </div>

      <ContentSection title="System Health">
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--color-secondary)', padding: 'var(--space-xl)' }}>
            Loading real system data...
          </div>
        ) : (
          <DataList 
            items={[
              {
                title: 'Docker Services',
                status: dockerServices.length > 0 ? 'healthy' : 'error',
                description: `${dockerServices.filter(s => s.state === 'running').length}/${dockerServices.length} services running`,
                details: dockerServices.map(s => `${s.name}: ${s.state}`).join(', ') || 'No services found'
              },
              {
                title: 'Git Repository',
                status: gitStatus ? (gitStatus.dirty ? 'warning' : 'healthy') : 'error',
                description: gitStatus ? `Branch: ${gitStatus.branch}, ${gitStatus.files?.total_changes || 0} changes` : 'Git not available',
                details: gitStatus?.lastCommit?.message || 'No commit info'
              },
              {
                title: 'Build System',
                status: buildHealth ? (buildHealth.typescript.errors > 0 ? 'error' : 'healthy') : 'unknown',
                description: buildHealth ? `${buildHealth.typescript.errors} TS errors, ${buildHealth.tests.passed}/${buildHealth.tests.passed + buildHealth.tests.failed} tests passing` : 'Build status unknown',
                details: buildHealth ? `Last check: ${buildHealth.typescript.lastCheck}` : 'No build info'
              },
              {
                title: 'AI Systems',
                status: mcpStatus.length > 0 ? (mcpStatus.every(s => s.online) ? 'healthy' : 'warning') : 'error',
                description: `${mcpStatus.filter(s => s.online).length}/${mcpStatus.length} MCP servers online`,
                details: mcpStatus.map(s => `${s.name}: ${s.online ? 'online' : 'offline'}`).join(', ') || 'No MCP servers'
              }
            ]}
            renderItem={(item) => (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-lg)'
              }}>
                <div style={{ marginTop: '2px' }}>
                  {getStatusIcon(item.status)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    <h3 className="text-lg font-regular text-primary uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <span 
                      className={`text-xs uppercase tracking-wide font-medium`}
                      style={{ 
                        color: item.status === 'healthy' ? '#10b981' :
                               item.status === 'warning' ? '#f59e0b' :
                               item.status === 'error' ? '#ef4444' :
                               'var(--text-tertiary)'
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-base text-secondary" style={{ lineHeight: 1.7, margin: 0 }}>
                    {item.description}
                  </p>
                  <p className="text-sm text-tertiary" style={{ 
                    lineHeight: 1.6, 
                    margin: 0, 
                    marginTop: 'var(--space-xs)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)'
                  }}>
                    {item.details}
                  </p>
                </div>
              </div>
            )}
          />
        )}
      </ContentSection>
      
      <ContentSection title="Quick Actions">
        <ActionGrid actions={quickActions} />
      </ContentSection>
      
      <HubQuickActions />
    </>
  )
}