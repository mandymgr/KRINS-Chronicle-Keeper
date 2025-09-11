// KRINS Developer Hub - Mock API for Development
// Simulates real backend responses with actual system data where possible

import type { 
  SystemHealth, 
  DockerService, 
  GitStatus, 
  BuildHealth, 
  MCPServerStatus,
  CommandResult,
  HubApiResponse 
} from '../types/hubTypes'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock response wrapper
const mockResponse = <T>(data: T): HubApiResponse<T> => ({
  success: true,
  data,
  error: null,
  timestamp: new Date().toISOString()
})

export class MockHubApi {
  
  async getSystemHealth(): Promise<SystemHealth> {
    await delay(500)
    console.log('🏥 Mock: Getting system health...')
    
    const health: SystemHealth = {
      status: 'healthy',
      uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
      memory: {
        free: 8192,
        total: 16384,
        usage: Math.floor(Math.random() * 80) + 10 // 10-90% usage
      },
      cpu: {
        load: (Math.random() * 2).toFixed(2),
        cores: 8
      },
      disk: {
        total: '500GB',
        used: '320GB', 
        available: '180GB',
        usage: '64%'
      },
      services: {
        nodejs_processes: Math.floor(Math.random() * 5) + 1
      }
    }
    
    console.log('✅ Mock: System health retrieved')
    return health
  }
  
  async getDockerStatus(): Promise<DockerService[]> {
    await delay(300)
    console.log('🐳 Mock: Getting Docker services...')
    
    const services: DockerService[] = [
      {
        name: 'krins-frontend',
        state: 'running',
        status: 'Up 2 hours',
        ports: ['5173:5173']
      },
      {
        name: 'krins-postgres',
        state: 'running', 
        status: 'Up 1 day',
        ports: ['5433:5432']
      },
      {
        name: 'krins-redis',
        state: Math.random() > 0.7 ? 'exited' : 'running',
        status: 'Up 3 hours',
        ports: ['6379:6379']
      }
    ]
    
    console.log(`✅ Mock: Found ${services.length} Docker services`)
    return services
  }
  
  async getGitStatus(): Promise<GitStatus> {
    await delay(200)
    console.log('📊 Mock: Getting Git status...')
    
    const status: GitStatus = {
      branch: 'dev',
      dirty: Math.random() > 0.5,
      files: {
        total_changes: Math.floor(Math.random() * 10),
        modified: Math.floor(Math.random() * 5),
        added: Math.floor(Math.random() * 3),
        deleted: Math.floor(Math.random() * 2)
      },
      lastCommit: {
        hash: 'a1b2c3d',
        message: '🎨 KINFOLK DESIGNSYSTEM - Hub functionality'
      }
    }
    
    console.log(`✅ Mock: Git status - ${status.branch}, ${status.files.total_changes} changes`)
    return status
  }
  
  async getBuildHealth(): Promise<BuildHealth> {
    await delay(400)
    console.log('🔍 Mock: Checking build health...')
    
    const health: BuildHealth = {
      typescript: {
        errors: Math.floor(Math.random() * 3), // 0-2 errors
        status: Math.random() > 0.8 ? 'error' : 'healthy',
        lastCheck: new Date().toISOString()
      },
      tests: {
        passed: Math.floor(Math.random() * 50) + 20,
        failed: Math.floor(Math.random() * 3),
        total: 0,
        lastRun: new Date().toISOString()
      }
    }
    
    health.tests.total = health.tests.passed + health.tests.failed
    
    console.log(`✅ Mock: Build health - ${health.typescript.errors} TS errors`)
    return health
  }
  
  async getMCPServerStatus(): Promise<MCPServerStatus[]> {
    await delay(250)
    console.log('🧠 Mock: Checking MCP servers...')
    
    const servers: MCPServerStatus[] = [
      {
        name: 'filesystem',
        online: true,
        description: 'File system access',
        lastPing: new Date().toISOString(),
        uptime: Math.floor(Math.random() * 3600)
      },
      {
        name: 'ai-team-coordinator', 
        online: Math.random() > 0.3,
        description: 'AI team coordination',
        lastPing: new Date().toISOString(),
        uptime: Math.floor(Math.random() * 1800)
      },
      {
        name: 'everything',
        online: true,
        description: 'Everything demo server',
        lastPing: new Date().toISOString(),
        uptime: Math.floor(Math.random() * 7200)
      }
    ]
    
    const onlineCount = servers.filter(s => s.online).length
    console.log(`✅ Mock: MCP status - ${onlineCount}/${servers.length} online`)
    return servers
  }
  
  async startDockerService(serviceName: string): Promise<CommandResult> {
    await delay(1000)
    console.log(`🚀 Mock: Starting service ${serviceName}...`)
    
    const result: CommandResult = {
      success: Math.random() > 0.1, // 90% success rate
      exitCode: Math.random() > 0.1 ? 0 : 1,
      output: `Starting ${serviceName}...\n${serviceName} started successfully`,
      error: Math.random() > 0.9 ? `Failed to start ${serviceName}` : ''
    }
    
    console.log(`✅ Mock: Service ${serviceName} ${result.success ? 'started' : 'failed'}`)
    return result
  }
  
  async runTypeCheck(): Promise<CommandResult> {
    await delay(2000)
    console.log('🔍 Mock: Running TypeScript check...')
    
    const result: CommandResult = {
      success: Math.random() > 0.3, // 70% success rate
      exitCode: Math.random() > 0.3 ? 0 : 1,
      output: 'Checking TypeScript files...\nType checking complete',
      error: Math.random() > 0.7 ? 'Found 2 type errors' : ''
    }
    
    console.log(`✅ Mock: TypeScript check ${result.success ? 'passed' : 'failed'}`)
    return result
  }
  
  async generateAIContext(query: string, scope: string): Promise<any> {
    await delay(1500)
    console.log(`🧠 Mock: Generating AI context for "${query}" (${scope})`)
    
    const context = {
      query,
      scope,
      files_analyzed: [
        'src/components/Layout.tsx',
        'src/hub/pages/HubDashboard.tsx',
        'docs/adr/ADR-0001-architecture.md'
      ],
      context_generated: true,
      timestamp: new Date().toISOString(),
      project_info: {
        name: 'krins-chronicle-keeper-frontend',
        version: '3.0.0',
        dependencies: 45
      }
    }
    
    console.log('✅ Mock: AI context generated')
    return context
  }
}

// Export singleton instance
export const mockHubApi = new MockHubApi()