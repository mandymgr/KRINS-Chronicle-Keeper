// KRINS Developer Hub - Type Definitions
// Hub-specific TypeScript interfaces and types

export interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  description: string
  details?: string
  uptime?: string
  lastChecked?: string
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'error'
  services: ServiceStatus[]
  metrics: {
    cpu?: number
    memory?: number
    disk?: number
  }
}

export interface DockerService {
  name: string
  image: string
  state: 'running' | 'stopped' | 'restarting' | 'exited'
  status: string
  ports?: string[]
  cpu?: number
  memory?: number
  restarts: number
}

export interface GitStatus {
  branch: string
  dirty: boolean
  ahead: number
  behind: number
  lastCommit: {
    hash: string
    message: string
    author: string
    date: string
  }
}

export interface BuildHealth {
  typescript: {
    errors: number
    warnings: number
    lastCheck: string
  }
  tests: {
    passed: number
    failed: number
    duration: number
    coverage?: number
    lastRun: string
  }
  lint: {
    errors: number
    warnings: number
    lastCheck: string
  }
}

export interface AIContextMetrics {
  totalGenerated: number
  averageRelevance: number
  lastGenerated?: {
    query: string
    relevance: number
    timestamp: string
    tokens: number
  }
}

export interface MCPServerStatus {
  name: string
  online: boolean
  latency?: number
  lastResponse?: string
  capabilities?: string[]
}

export interface DevelopmentMetrics {
  velocity: {
    commitsPerDay: number[]
    linesPerDay: number[]
    period: string
  }
  quality: {
    errorTrend: number[]
    coverageTrend: number[]
    period: string
  }
}

export interface CommandResult {
  success: boolean
  output: string
  error?: string
  duration: number
  timestamp: string
}

export interface HubCommand {
  id: string
  name: string
  description: string
  category: 'docker' | 'git' | 'build' | 'ai' | 'adr' | 'system'
  command: string
  requiresAuth?: boolean
  dangerous?: boolean
}

export interface ADRSummary {
  id: string
  title: string
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded'
  component: string
  created: string
  lastModified: string
  referenceCount: number
}

export interface QuickAction {
  id: string
  icon: React.ComponentType<any>
  title: string
  description: string
  category: string
  onClick: () => void | Promise<void>
  disabled?: boolean
  loading?: boolean
}

export interface WorkflowEntry {
  id: string
  type: 'build' | 'commit' | 'learning' | 'incident' | 'milestone'
  title: string
  description?: string
  timestamp: string
  author?: string
  metadata?: Record<string, any>
}

export interface HubConfig {
  projectName: string
  apiBaseUrl: string
  enabledFeatures: string[]
  refreshIntervals: {
    systemHealth: number
    gitStatus: number
    buildHealth: number
  }
  theme: {
    primaryColor?: string
    logo?: string
  }
}

// API Response Types
export interface HubApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// Component Props Types
export interface StatusCardProps {
  title: string
  status: ServiceStatus['status']
  value?: string | number
  description?: string
  trend?: 'up' | 'down' | 'stable'
  onClick?: () => void
}

export interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    direction: 'up' | 'down'
    label: string
  }
  chart?: number[]
}

export interface CommandPaletteItem {
  id: string
  title: string
  description: string
  category: string
  keywords: string[]
  action: () => void | Promise<void>
  icon?: React.ComponentType<any>
}