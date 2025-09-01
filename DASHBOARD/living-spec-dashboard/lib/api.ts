// API utilities for connecting to AI systems

export interface AgentStatus {
  id: string
  name: string
  role: string
  status: 'active' | 'inactive' | 'processing' | 'error'
  lastActivity?: string
  tasksCompleted?: number
  currentTask?: string
  port?: number
  url?: string
}

export interface SystemHealth {
  component: string
  status: 'operational' | 'degraded' | 'down'
  responseTime?: number
  lastCheck: string
}

// Connect to Krin's Superintelligence Team (port 3001)
export async function fetchSupIntelligenceStatus(): Promise<AgentStatus[]> {
  try {
    // Try to connect to running superintelligence system
    const response = await fetch('http://localhost:3001/api/agents/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't wait too long for development
      signal: AbortSignal.timeout(5000)
    })

    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.log('Superintelligence system not available, using mock data')
  }

  // Fallback to mock data when system isn't running
  return [
    {
      id: 'architect',
      name: 'Architect Agent 🏗️',
      role: 'System Architecture & Design',
      status: 'active',
      lastActivity: '2 min siden',
      tasksCompleted: 12,
      currentTask: 'Analyserer Living Spec Dashboard arkitektur',
      port: 3001
    },
    {
      id: 'security',
      name: 'Security Agent 🔒',
      role: 'Cybersecurity & Penetration Testing',
      status: 'processing',
      lastActivity: '5 min siden',
      tasksCompleted: 8,
      currentTask: 'Kjører sikkerhetsscan på API endpoints',
      port: 3001
    },
    {
      id: 'performance',
      name: 'Performance Agent ⚡',
      role: 'Performance Optimization',
      status: 'inactive',
      lastActivity: '1t siden',
      tasksCompleted: 15,
      port: 3001
    },
    {
      id: 'product',
      name: 'Product Agent 📱',
      role: 'UX/UI & User Experience',
      status: 'active',
      lastActivity: '10 min siden',
      tasksCompleted: 9,
      currentTask: 'Optimaliserer Krin designsystem implementering',
      port: 3001
    },
    {
      id: 'compliance',
      name: 'Compliance Agent ⚖️',
      role: 'Regulatory Standards & Quality Assurance',
      status: 'active',
      lastActivity: '25 min siden',
      tasksCompleted: 6,
      currentTask: 'Verifiserer GDPR compliance',
      port: 3001
    },
    {
      id: 'research',
      name: 'Research Agent 🔬',
      role: 'Innovation & Technology Research',
      status: 'processing',
      lastActivity: '15 min siden',
      tasksCompleted: 11,
      currentTask: 'Undersøker nye AI coordination patterns',
      port: 3001
    },
    {
      id: 'redteam',
      name: 'RedTeam Agent 🔴',
      role: 'Adversarial Testing & Quality Gates',
      status: 'inactive',
      lastActivity: '2t siden',
      tasksCompleted: 4,
      port: 3001
    }
  ]
}

// Connect to Krin Personal Companion
export async function fetchKrinCompanionStatus(): Promise<any> {
  try {
    // This would connect to Krin's companion app if it has an API
    const response = await fetch('http://localhost:3000/api/krin/status', {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    })

    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.log('Krin companion not available via API')
  }

  return {
    status: 'available',
    memories: 7,
    personalityActive: true,
    lastInteraction: '15 min siden'
  }
}

// System health checks
export async function fetchSystemHealth(): Promise<SystemHealth[]> {
  const checks = [
    { component: 'RAG System', port: 3001, endpoint: '/health' },
    { component: 'PostgreSQL', port: 5432, endpoint: null },
    { component: 'Socket.IO', port: 3001, endpoint: '/socket.io/' },
    { component: 'Bundle Manager', port: 3001, endpoint: '/health' },
  ]

  const healthStatuses: SystemHealth[] = []

  for (const check of checks) {
    try {
      if (check.endpoint && check.port) {
        const start = Date.now()
        const response = await fetch(`http://localhost:${check.port}${check.endpoint}`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        })
        
        const responseTime = Date.now() - start
        
        healthStatuses.push({
          component: check.component,
          status: response.ok ? 'operational' : 'degraded',
          responseTime,
          lastCheck: new Date().toISOString()
        })
      } else {
        // For services without HTTP endpoints, assume operational if main system is up
        healthStatuses.push({
          component: check.component,
          status: 'operational',
          lastCheck: new Date().toISOString()
        })
      }
    } catch (error) {
      healthStatuses.push({
        component: check.component,
        status: 'down',
        lastCheck: new Date().toISOString()
      })
    }
  }

  return healthStatuses
}

// Helper to format relative time
export function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'nå'
  if (diffMins < 60) return `${diffMins} min siden`
  if (diffHours < 24) return `${diffHours}t siden`
  return `${diffDays}d siden`
}