export interface KpiMetric {
  id: string
  name: string
  value: number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  unit?: string
  description?: string
  icon?: string
  category?: string
}

export interface AISpecialist {
  id: string
  name: string
  role: string
  status: 'active' | 'processing' | 'inactive'
  lastActivity?: string
  currentTask?: string
}

export interface ActivityLog {
  id: string
  specialist: string
  action: string
  timestamp: Date
  details?: string
}