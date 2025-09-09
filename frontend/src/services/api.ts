import axios from 'axios'
import type {
  ADR,
  ADRCreate,
  DecisionAnalytics,
  DecisionLink,
  Evidence,
  ContextRequest,
  ContextResponse,
  IntelligenceInsight,
  DashboardOverview,
  TrendChartData,
  ComponentDistribution,
  EffectivenessMatrixItem
} from '@/types'

// Check if we're in production without an API backend
const isProductionWithoutAPI = import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL

// API client configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Mock data for production demo
const mockDashboardOverview: DashboardOverview = {
  total_decisions: 42,
  active_decisions: 8,
  completed_decisions: 34,
  decision_velocity: 2.3,
  avg_decision_time: 5.2,
  components_tracked: 12,
  evidence_collected: 156,
  ai_insights_generated: 23,
  period_days: 30,
  trends: {
    decisions: { current: 42, previous: 38, change_percent: 10.5 },
    velocity: { current: 2.3, previous: 2.1, change_percent: 9.5 },
    completion_time: { current: 5.2, previous: 6.1, change_percent: -14.8 }
  },
  health_status: {
    level: 'good',
    score: 0.82,
    components: {
      activity: 0.85,
      confidence: 0.78,
      evidence: 0.88,
      diversity: 0.76
    }
  },
  metrics: {
    consistency_score: 0.84,
    evidence_quality: 0.79,
    decision_impact: 0.91,
    team_alignment: 0.73,
    total_adrs: 42,
    recent_adrs: 8,
    decision_velocity: 2.3,
    status_distribution: {
      accepted: 5,
      proposed: 2,
      superseded: 1,
      deprecated: 0
    },
    average_scores: {
      confidence: 8.2
    },
    component_activity: [
      { component: 'Authentication', count: 3, activity: 0.8, avg_confidence: 8.5 },
      { component: 'API Gateway', count: 2, activity: 0.6, avg_confidence: 7.2 },
      { component: 'Database', count: 4, activity: 0.9, avg_confidence: 9.1 },
      { component: 'Frontend', count: 2, activity: 0.7, avg_confidence: 8.0 },
      { component: 'Infrastructure', count: 1, activity: 0.5, avg_confidence: 6.8 },
      { component: 'Security', count: 2, activity: 0.8, avg_confidence: 8.7 }
    ]
  }
}

// Request interceptor for auth (if needed in future)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// ADR endpoints
export const adrService = {
  // List ADRs with optional filtering
  list: async (params?: {
    skip?: number
    limit?: number
    status?: string
    component?: string
  }): Promise<ADR[]> => {
    const response = await api.get('/adrs', { params })
    return response.data
  },

  // Get specific ADR
  get: async (adrId: string): Promise<ADR> => {
    const response = await api.get(`/adrs/${adrId}`)
    return response.data
  },

  // Create new ADR
  create: async (adr: ADRCreate): Promise<ADR> => {
    const response = await api.post('/adrs', adr)
    return response.data
  },

  // Update ADR
  update: async (adrId: string, updates: Partial<ADRCreate>): Promise<ADR> => {
    const response = await api.put(`/adrs/${adrId}`, updates)
    return response.data
  },

  // Delete ADR
  delete: async (adrId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/adrs/${adrId}`)
    return response.data
  },

  // Semantic search
  search: async (params: {
    query: string
    limit?: number
    threshold?: number
  }): Promise<{
    query: string
    results: Array<{
      adr_id: string
      title: string
      component: string
      status: string
      relevance_score: number
      snippet: string
    }>
    total: number
  }> => {
    const response = await api.get('/adrs/search/semantic', { params })
    return response.data
  },
}

// Decision management endpoints
export const decisionService = {
  // Get comprehensive analytics
  getAnalytics: async (days: number = 30): Promise<DecisionAnalytics> => {
    const response = await api.get('/decisions/analytics', { params: { days } })
    return response.data
  },

  // Get decision links
  getLinks: async (params?: {
    adr_id?: string
    relationship_type?: string
  }): Promise<{
    links: DecisionLink[]
    total: number
    filters: any
  }> => {
    const response = await api.get('/decisions/links', { params })
    return response.data
  },

  // Create decision link
  createLink: async (link: Omit<DecisionLink, 'id' | 'created_at' | 'from_details' | 'to_details'>): Promise<DecisionLink> => {
    const response = await api.post('/decisions/links', link)
    return response.data
  },

  // Get evidence for ADR
  getEvidence: async (adrId: string): Promise<{
    adr_id: string
    evidence: Evidence[]
    total: number
    summary: {
      total_evidence: number
      evidence_types: string[]
      avg_confidence: number
    }
  }> => {
    const response = await api.get(`/decisions/evidence/${adrId}`)
    return response.data
  },

  // Add evidence
  addEvidence: async (evidence: Omit<Evidence, 'id' | 'created_at' | 'impact'>): Promise<Evidence> => {
    const response = await api.post('/decisions/evidence', evidence)
    return response.data
  },

  // Analyze decision effectiveness
  analyzeEffectiveness: async (adrId: string): Promise<{
    adr_id: string
    title: string
    status: string
    effectiveness_score: number
    metrics: any
    scores: any
    recommendation: string
  }> => {
    const response = await api.get(`/decisions/effectiveness/${adrId}`)
    return response.data
  },
}

// Intelligence endpoints
export const intelligenceService = {
  // Generate AI context
  generateContext: async (request: ContextRequest): Promise<ContextResponse> => {
    const response = await api.post('/intelligence/context', request)
    return response.data
  },

  // Get context by ID
  getContext: async (contextId: string): Promise<ContextResponse> => {
    const response = await api.get(`/intelligence/context/${contextId}`)
    return response.data
  },

  // Get intelligence insights
  getInsights: async (params?: {
    insight_type?: string
    impact_level?: string
    limit?: number
  }): Promise<{
    insights: IntelligenceInsight[]
    total: number
    generated_at: string
    filters: any
  }> => {
    const response = await api.get('/intelligence/insights', { params })
    return response.data
  },

  // Perform comprehensive analysis
  analyzeOrganization: async (params: {
    analysis_type: 'health' | 'trends' | 'effectiveness' | 'gaps'
    period_days?: number
  }): Promise<any> => {
    const response = await api.post('/intelligence/analyze', null, { params })
    return response.data
  },
}

// Analytics endpoints
export const analyticsService = {
  // Dashboard overview
  getDashboardOverview: async (days: number = 30): Promise<DashboardOverview> => {
    if (isProductionWithoutAPI) {
      console.log('📊 Using mock data for dashboard overview (no API backend)')
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return { ...mockDashboardOverview, period_days: days }
    }
    const response = await api.get('/analytics/dashboard/overview', { params: { days } })
    return response.data
  },

  // Decision trends
  getDecisionTrends: async (params: {
    days?: number
    granularity?: 'day' | 'week' | 'month'
  }): Promise<{
    period_days: number
    granularity: string
    trend_direction: string
    data: TrendChartData[]
    summary: any
  }> => {
    const response = await api.get('/analytics/charts/decision-trends', { params })
    return response.data
  },

  // Component distribution
  getComponentDistribution: async (params?: {
    days?: number
    top_n?: number
  }): Promise<{
    period_days: number
    total_decisions: number
    components_shown: number
    data: ComponentDistribution[]
    insights: any
  }> => {
    const response = await api.get('/analytics/charts/component-distribution', { params })
    return response.data
  },

  // Effectiveness matrix
  getEffectivenessMatrix: async (days: number = 90): Promise<{
    period_days: number
    total_decisions: number
    data: EffectivenessMatrixItem[]
    quadrants: Record<string, number>
    insights: any
  }> => {
    const response = await api.get('/analytics/charts/effectiveness-matrix', { params: { days } })
    return response.data
  },

  // Comprehensive report
  getComprehensiveReport: async (params?: {
    days?: number
    include_recommendations?: boolean
  }): Promise<any> => {
    const response = await api.get('/analytics/reports/comprehensive', { params })
    return response.data
  },
}

// Health check
export const healthService = {
  check: async (): Promise<{
    status: string
    timestamp: string
    version: string
    database: string
    services: Record<string, string>
  }> => {
    const response = await api.get('/health')
    return response.data
  },
}

export default api