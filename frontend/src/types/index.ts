// Core ADR types
export interface ADR {
  id: number
  adr_id: string
  title: string
  status: 'proposed' | 'accepted' | 'superseded' | 'deprecated'
  context: string
  decision: string
  consequences: string
  component: string
  decision_date: string
  created_at: string
  updated_at: string
  confidence_score?: number
  complexity_score?: number
  actionability_score?: number
  tags: string[]
}

export interface ADRCreate {
  title: string
  status: 'proposed' | 'accepted' | 'superseded' | 'deprecated'
  context: string
  decision: string
  consequences: string
  component: string
  decision_date?: string
  confidence_score?: number
  complexity_score?: number
  actionability_score?: number
  tags?: string[]
}

// Decision analytics types
export interface DecisionAnalytics {
  total_adrs: number
  status_distribution: Record<string, number>
  average_confidence: number
  average_complexity: number
  average_actionability: number
  recent_activity: number
  top_components: ComponentActivity[]
  trend_analysis: TrendAnalysis
}

export interface ComponentActivity {
  component: string
  count: number
  avg_confidence: number
}

export interface TrendAnalysis {
  weekly_creation: WeeklyTrend[]
  growth_rate: number
}

export interface WeeklyTrend {
  week: string
  count: number
}

// Decision links and relationships
export interface DecisionLink {
  id: number
  from_adr: string
  to_adr: string
  relationship_type: 'extends' | 'supersedes' | 'conflicts' | 'depends' | 'influences'
  strength: number
  description?: string
  created_at: string
  from_details?: {
    title: string
    component: string
  }
  to_details?: {
    title: string
    component: string
  }
}

// Evidence types
export interface Evidence {
  id: number
  adr_id: string
  evidence_type: 'metric' | 'feedback' | 'outcome' | 'observation'
  description: string
  value_before?: number
  value_after?: number
  metric_unit?: string
  collection_date: string
  confidence_level: number
  created_at: string
  impact?: {
    absolute_change: number
    percent_change: number
    improvement: boolean
  }
}

// AI Intelligence types
export interface ContextRequest {
  ai_system: string
  context_type: 'code-generation' | 'architecture-review' | 'troubleshooting' | 'optimization'
  query: string
  include_patterns?: boolean
  include_decisions?: boolean
  include_runbooks?: boolean
  relevance_threshold?: number
}

export interface ContextResponse {
  context_id: string
  ai_system: string
  context_type: string
  query: string
  generated_context: string
  relevance_score: number
  sources: ContextSource[]
  metadata: ContextMetadata
  created_at: string
}

export interface ContextSource {
  type: 'adr' | 'patterns' | 'runbooks'
  id: string
  title: string
  relevance: number
}

export interface ContextMetadata {
  total_sources: number
  context_length: number
  generation_timestamp: string
  filters: {
    include_patterns: boolean
    include_decisions: boolean
    include_runbooks: boolean
  }
}

// Intelligence insights
export interface IntelligenceInsight {
  insight_type: 'pattern' | 'anomaly' | 'trend' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact_level: 'low' | 'medium' | 'high' | 'critical'
  data_sources: string[]
  suggested_actions: string[]
}

// Dashboard and analytics types
export interface DashboardOverview {
  period_days: number
  generated_at: string
  metrics: DashboardMetrics
  health_status: HealthStatus
}

export interface DashboardMetrics {
  total_adrs: number
  recent_adrs: number
  status_distribution: Record<string, number>
  average_scores: {
    confidence: number
    complexity: number
    actionability: number
  }
  component_activity: ComponentActivity[]
  decision_velocity: number
  evidence_coverage: number
  health_score: number
}

export interface HealthStatus {
  score: number
  level: 'excellent' | 'good' | 'moderate' | 'needs_attention'
  components: {
    activity: number
    confidence: number
    evidence: number
    diversity: number
  }
}

// Chart data types
export interface TrendChartData {
  period: string
  decision_count: number
  avg_confidence: number
  accepted_count: number
  proposed_count: number
  acceptance_rate: number
}

export interface ComponentDistribution {
  component: string
  decision_count: number
  percentage: number
  avg_confidence: number
  avg_complexity: number
  accepted_count: number
  acceptance_rate: number
  evidence_coverage: number
}

export interface EffectivenessMatrixItem {
  adr_id: string
  title: string
  component: string
  status: string
  confidence_score: number
  complexity_score: number
  actionability_score: number
  effectiveness_score: number
  evidence_count: number
  success_rate: number
  link_count: number
  quadrant: string
  age_days: number
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  has_more: boolean
}

// UI state types
export interface FilterState {
  status?: string
  component?: string
  dateRange?: [string, string]
  search?: string
}

export interface SortState {
  field: string
  direction: 'asc' | 'desc'
}

// Form types
export interface SearchFormData {
  query: string
  filters: FilterState
}

export interface ADRFormData extends Omit<ADRCreate, 'tags'> {
  tags: string // Comma-separated string for form handling
}

// Navigation types
export interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<any>
  badge?: number
}

// Theme and settings
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  defaultView: 'dashboard' | 'adrs' | 'analytics'
  autoRefresh: boolean
  refreshInterval: number
  notificationsEnabled: boolean
}