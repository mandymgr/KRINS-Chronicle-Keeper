// KRINS Developer Hub - Systems Page
// Real Docker, Database, and Service monitoring

import { useState, useEffect } from 'react'
import { PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { HubNavigation } from '../components/HubNavigation'
import { hubApi } from '../api/hubApi'
import type { DockerService, SystemHealth } from '../types/hubTypes'
import { 
  Server,
  Play,
  Square,
  RotateCcw,
  Database,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function Systems() {
  const [dockerServices, setDockerServices] = useState<DockerService[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadSystemsData = async () => {
    setLoading(true)
    try {
      const [services, health] = await Promise.all([
        hubApi.getDockerStatus(),
        hubApi.getSystemHealth()
      ])
      
      setDockerServices(services)
      setSystemHealth(health)
      console.log('✅ Systems data loaded:', services.length, 'services')
    } catch (error) {
      console.error('❌ Failed to load systems data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSystemsData()
    const interval = setInterval(loadSystemsData, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const handleServiceAction = async (serviceName: string, action: 'start' | 'stop') => {
    setActionLoading(`${action}-${serviceName}`)
    try {
      console.log(`${action === 'start' ? '🚀' : '🛑'} ${action}ing service ${serviceName}...`)
      
      if (action === 'start') {
        await hubApi.startDockerService(serviceName)
      } else {
        await hubApi.stopDockerService(serviceName)
      }
      
      // Refresh services after action
      setTimeout(loadSystemsData, 2000)
      console.log(`✅ Service ${serviceName} ${action}ed successfully`)
    } catch (error) {
      console.error(`❌ Failed to ${action} service ${serviceName}:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const getServiceStatusIcon = (state: string) => {
    switch (state) {
      case 'running': return <CheckCircle size={16} style={{ color: '#10b981' }} />
      case 'stopped': return <XCircle size={16} style={{ color: '#ef4444' }} />
      case 'restarting': return <RotateCcw size={16} style={{ color: '#f59e0b' }} />
      default: return <AlertCircle size={16} style={{ color: 'var(--color-tertiary)' }} />
    }
  }

  const systemActions = [
    {
      icon: Play,
      title: 'Start All Services',
      description: 'Start all stopped Docker services',
      onClick: async () => {
        for (const service of dockerServices.filter(s => s.state !== 'running')) {
          await handleServiceAction(service.name, 'start')
        }
      }
    },
    {
      icon: Square,
      title: 'Stop All Services', 
      description: 'Stop all running Docker services',
      onClick: async () => {
        for (const service of dockerServices.filter(s => s.state === 'running')) {
          await handleServiceAction(service.name, 'stop')
        }
      }
    },
    {
      icon: RotateCcw,
      title: 'Restart All',
      description: 'Restart all Docker services',
      onClick: async () => {
        for (const service of dockerServices) {
          if (service.state === 'running') {
            await handleServiceAction(service.name, 'stop')
            await new Promise(resolve => setTimeout(resolve, 2000))
            await handleServiceAction(service.name, 'start')
          }
        }
      }
    },
    {
      icon: Database,
      title: 'Database Health',
      description: 'Check PostgreSQL and Redis status',
      onClick: async () => {
        try {
          const [dbHealth, redisInfo] = await Promise.all([
            hubApi.getDatabaseHealth(),
            hubApi.getRedisInfo()
          ])
          console.log('Database health:', dbHealth)
          console.log('Redis info:', redisInfo)
        } catch (error) {
          console.error('Failed to check database health:', error)
        }
      }
    }
  ]

  const stats = [
    { 
      value: dockerServices.filter(s => s.state === 'running').length.toString(), 
      label: 'Running Services' 
    },
    { 
      value: dockerServices.filter(s => s.state === 'stopped').length.toString(), 
      label: 'Stopped Services' 
    },
    { 
      value: systemHealth?.metrics?.cpu?.toFixed(1) || '0', 
      label: 'CPU Usage %' 
    },
    { 
      value: systemHealth?.metrics?.memory?.toFixed(1) || '0', 
      label: 'Memory Usage %' 
    }
  ]

  return (
    <>
      <HubNavigation />
      
      <PageHero 
        subtitle="Systems Management"
        title="Docker & Services"
        description="Real-time monitoring and control of Docker services, databases, and system resources."
        stats={stats}
      />

      <ContentSection title="Docker Services">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
            Loading Docker services...
          </div>
        ) : (
          <DataList 
            items={dockerServices}
            renderItem={(service) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-lg)',
                  flex: 1
                }}>
                  <div style={{ marginTop: '2px' }}>
                    {getServiceStatusIcon(service.state)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 className="text-lg font-regular text-primary uppercase tracking-wide" style={{
                      marginBottom: 'var(--space-sm)'
                    }}>
                      {service.name}
                    </h3>
                    <p className="text-base text-secondary" style={{
                      lineHeight: 1.7,
                      margin: 0,
                      marginBottom: 'var(--space-xs)'
                    }}>
                      Image: {service.image} | Status: {service.status}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: 'var(--space-lg)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-tertiary)'
                    }}>
                      <span>CPU: {service.cpu}%</span>
                      <span>Memory: {service.memory} MB</span>
                      <span>Restarts: {service.restarts}</span>
                      {service.ports && service.ports.length > 0 && (
                        <span>Ports: {service.ports.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  {service.state === 'running' ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleServiceAction(service.name, 'stop')}
                      disabled={actionLoading === `stop-${service.name}`}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: 'var(--space-xs) var(--space-sm)',
                        fontSize: 'var(--text-xs)',
                        cursor: actionLoading === `stop-${service.name}` ? 'wait' : 'pointer'
                      }}
                    >
                      <Square size={12} />
                      {actionLoading === `stop-${service.name}` ? 'Stopping...' : 'Stop'}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleServiceAction(service.name, 'start')}
                      disabled={actionLoading === `start-${service.name}`}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: 'var(--space-xs) var(--space-sm)',
                        fontSize: 'var(--text-xs)',
                        cursor: actionLoading === `start-${service.name}` ? 'wait' : 'pointer'
                      }}
                    >
                      <Play size={12} />
                      {actionLoading === `start-${service.name}` ? 'Starting...' : 'Start'}
                    </button>
                  )}
                </div>
              </div>
            )}
          />
        )}
      </ContentSection>

      <ContentSection title="System Actions">
        <ActionGrid actions={systemActions} />
      </ContentSection>
    </>
  )
}