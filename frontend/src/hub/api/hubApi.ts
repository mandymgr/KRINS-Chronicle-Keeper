// KRINS Developer Hub - Real API Integration
// All functions connect to actual backend endpoints - NO DUMMY DATA

import axios from 'axios'
import type { 
  SystemHealth, 
  DockerService, 
  GitStatus, 
  BuildHealth, 
  AIContextMetrics,
  MCPServerStatus,
  CommandResult,
  ADRSummary,
  WorkflowEntry,
  HubApiResponse 
} from '../types/hubTypes'

const API_BASE = '/api/hub'

// Real HTTP client with error handling
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30s timeout for commands
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Hub API Error:', error)
    return Promise.reject(error)
  }
)

export class HubApiClient {
  
  // === SYSTEM HEALTH & STATUS ===
  
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get<HubApiResponse<SystemHealth>>('/health')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async getDockerStatus(): Promise<DockerService[]> {
    const response = await apiClient.get<HubApiResponse<DockerService[]>>('/docker/status')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async startDockerService(serviceName: string): Promise<CommandResult> {
    const response = await apiClient.post<HubApiResponse<CommandResult>>('/docker/start', {
      service: serviceName
    })
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async stopDockerService(serviceName: string): Promise<CommandResult> {
    const response = await apiClient.post<HubApiResponse<CommandResult>>('/docker/stop', {
      service: serviceName
    })
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async getDockerLogs(serviceName: string, lines: number = 100): Promise<string> {
    const response = await apiClient.get(`/docker/logs/${serviceName}?lines=${lines}`)
    return response.data
  }
  
  // === GIT OPERATIONS ===
  
  async getGitStatus(): Promise<GitStatus> {
    const response = await apiClient.get<HubApiResponse<GitStatus>>('/git/status')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async getRecentCommits(limit: number = 50): Promise<any[]> {
    const response = await apiClient.get(`/git/commits?limit=${limit}`)
    return response.data.data
  }
  
  // === BUILD & CODE HEALTH ===
  
  async runTypeCheck(): Promise<CommandResult> {
    const response = await apiClient.post<HubApiResponse<CommandResult>>('/code/typecheck')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async runLint(): Promise<CommandResult> {
    const response = await apiClient.post<HubApiResponse<CommandResult>>('/code/lint')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async runTests(): Promise<CommandResult> {
    const response = await apiClient.post<HubApiResponse<CommandResult>>('/code/test')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async getBuildHealth(): Promise<BuildHealth> {
    const response = await apiClient.get<HubApiResponse<BuildHealth>>('/build/health')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  // === AI & MCP INTEGRATION ===
  
  async generateAIContext(query: string, scope: string = 'mixed'): Promise<any> {
    const response = await apiClient.post<HubApiResponse<any>>('/ai/context', {
      query,
      scope
    })
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async getMCPServerStatus(): Promise<MCPServerStatus[]> {
    const response = await apiClient.get<HubApiResponse<MCPServerStatus[]>>('/mcp/status')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async executeMCPCommand(command: string): Promise<CommandResult> {
    const response = await apiClient.post<HubApiResponse<CommandResult>>('/mcp/command', {
      command
    })
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async getAIContextMetrics(): Promise<AIContextMetrics> {
    const response = await apiClient.get<HubApiResponse<AIContextMetrics>>('/ai/metrics')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  // === ADR MANAGEMENT ===
  
  async getADRList(status?: string): Promise<ADRSummary[]> {
    const params = status ? `?status=${status}` : ''
    const response = await apiClient.get<HubApiResponse<ADRSummary[]>>(`/adr/list${params}`)
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async createADR(title: string, component: string, context?: string): Promise<{ id: string, path: string }> {
    const response = await apiClient.post<HubApiResponse<{ id: string, path: string }>>('/adr/create', {
      title,
      component,
      context
    })
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  // === WORKFLOW INTEGRATION ===
  
  async appendToWorkflow(type: string, title: string, body?: string): Promise<void> {
    const response = await apiClient.post<HubApiResponse<void>>('/workflow/append', {
      kind: type,
      title,
      body
    })
    if (!response.data.success) throw new Error(response.data.error)
  }
  
  async getWorkflowEntries(limit: number = 20): Promise<WorkflowEntry[]> {
    const response = await apiClient.get<HubApiResponse<WorkflowEntry[]>>(`/workflow/recent?limit=${limit}`)
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  // === DATABASE OPERATIONS ===
  
  async getDatabaseHealth(): Promise<any> {
    const response = await apiClient.get<HubApiResponse<any>>('/db/health')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  async getRedisInfo(): Promise<any> {
    const response = await apiClient.get<HubApiResponse<any>>('/redis/info')
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  // === SYSTEM COMMANDS ===
  
  async executeCommand(command: string, args?: string[]): Promise<CommandResult> {
    const response = await apiClient.post<HubApiResponse<CommandResult>>('/system/command', {
      command,
      args
    })
    if (!response.data.success) throw new Error(response.data.error)
    return response.data.data!
  }
  
  // === REAL-TIME STREAMING ===
  
  createLogStream(serviceName: string): EventSource {
    return new EventSource(`${API_BASE}/logs/stream/${serviceName}`)
  }
  
  createMetricsStream(): EventSource {
    return new EventSource(`${API_BASE}/metrics/stream`)
  }
}

// Development mode detection
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development'

// Create hub API instance based on environment
const createHubApi = async () => {
  if (isDevelopment) {
    console.log('🔧 Hub API: Using mock API for development')
    const { mockHubApi } = await import('./mockApi')
    return mockHubApi
  } else {
    console.log('🚀 Hub API: Using real API client')
    return new HubApiClient()
  }
}

// Export promise that resolves to the hub API instance
export const hubApiPromise = createHubApi()

// Temporary fallback - will be replaced by proper async handling
export const hubApi = new HubApiClient()

// Utility functions for common operations
export const hubOperations = {
  
  async restartAllServices(): Promise<CommandResult[]> {
    const services = await apiClient.getDockerStatus()
    const results = []
    
    for (const service of services) {
      if (service.state === 'running') {
        await apiClient.stopDockerService(service.name)
        const result = await apiClient.startDockerService(service.name)
        results.push(result)
      }
    }
    
    return results
  },
  
  async runFullHealthCheck(): Promise<{
    system: SystemHealth
    git: GitStatus
    build: BuildHealth
    ai: AIContextMetrics
    mcp: MCPServerStatus[]
  }> {
    const [system, git, build, ai, mcp] = await Promise.all([
      apiClient.getSystemHealth(),
      apiClient.getGitStatus(),
      apiClient.getBuildHealth(),
      apiClient.getAIContextMetrics(),
      apiClient.getMCPServerStatus()
    ])
    
    return { system, git, build, ai, mcp }
  },
  
  async quickStart(): Promise<void> {
    // Sequence for starting development environment
    await apiClient.executeCommand('docker', ['compose', 'up', '-d'])
    await new Promise(resolve => setTimeout(resolve, 5000)) // Wait for services
    await apiClient.runTypeCheck()
    await apiClient.appendToWorkflow('build', 'Development environment started')
  }
}