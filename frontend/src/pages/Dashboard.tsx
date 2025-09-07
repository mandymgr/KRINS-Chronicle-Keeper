import { useQuery } from '@tanstack/react-query'
import { 
  TrendingUp, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Brain,
  BarChart3,
  Activity
} from 'lucide-react'
import { analyticsService } from '@/services/api'

export function Dashboard() {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => analyticsService.getDashboardOverview(30),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-secondary-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-secondary-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Failed to Load Dashboard</h3>
        <p className="text-secondary-600">Please try refreshing the page</p>
      </div>
    )
  }

  const { metrics, health_status } = overview!

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-secondary-200 pb-4">
        <h1 className="text-3xl font-bold text-secondary-900">Organizational Intelligence Dashboard</h1>
        <p className="mt-2 text-sm text-secondary-600">
          Monitor decision patterns, track effectiveness, and gain insights into your organization's intelligence.
        </p>
      </div>

      {/* Health Status Banner */}
      <div className={`rounded-lg p-4 border-l-4 ${
        health_status.level === 'excellent' 
          ? 'bg-success-50 border-success-400'
          : health_status.level === 'good'
          ? 'bg-primary-50 border-primary-400'
          : health_status.level === 'moderate'
          ? 'bg-warning-50 border-warning-400'
          : 'bg-error-50 border-error-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className={`h-5 w-5 mr-3 ${
              health_status.level === 'excellent' 
                ? 'text-success-600'
                : health_status.level === 'good'
                ? 'text-primary-600'
                : health_status.level === 'moderate'
                ? 'text-warning-600'
                : 'text-error-600'
            }`} />
            <div>
              <h3 className={`font-medium ${
                health_status.level === 'excellent' 
                  ? 'text-success-900'
                  : health_status.level === 'good'
                  ? 'text-primary-900'
                  : health_status.level === 'moderate'
                  ? 'text-warning-900'
                  : 'text-error-900'
              }`}>
                Organizational Health: {health_status.level.charAt(0).toUpperCase() + health_status.level.slice(1)}
              </h3>
              <p className={`text-sm ${
                health_status.level === 'excellent' 
                  ? 'text-success-700'
                  : health_status.level === 'good'
                  ? 'text-primary-700'
                  : health_status.level === 'moderate'
                  ? 'text-warning-700'
                  : 'text-error-700'
              }`}>
                Score: {health_status.score.toFixed(2)}/1.00
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-secondary-900">{(health_status.score * 100).toFixed(0)}%</div>
            <div className="text-xs text-secondary-600">Health Score</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Decisions"
          value={metrics.total_adrs}
          change={`+${metrics.recent_adrs} this month`}
          icon={FileText}
          color="primary"
        />
        
        <MetricCard
          title="Acceptance Rate"
          value={`${((metrics.status_distribution.accepted || 0) / Math.max(metrics.recent_adrs, 1) * 100).toFixed(0)}%`}
          change="Last 30 days"
          icon={CheckCircle}
          color="success"
        />
        
        <MetricCard
          title="Avg Confidence"
          value={metrics.average_scores.confidence.toFixed(1)}
          change="Scale: 0.0 - 1.0"
          icon={Brain}
          color="primary"
        />
        
        <MetricCard
          title="Decision Velocity"
          value={metrics.decision_velocity}
          change="per week"
          icon={TrendingUp}
          color="warning"
        />
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Decision Status Distribution</h3>
            <p className="card-description">Current status of all decisions</p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {Object.entries(metrics.status_distribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`status-dot ${status}`} />
                    <span className="text-sm font-medium capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary-600">{count}</span>
                    <div className="w-20 bg-secondary-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'accepted' ? 'bg-success-500' :
                          status === 'proposed' ? 'bg-warning-500' :
                          status === 'superseded' ? 'bg-secondary-400' :
                          'bg-error-500'
                        }`}
                        style={{ width: `${(count / Math.max(metrics.recent_adrs, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Component Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Most Active Components</h3>
            <p className="card-description">Components with recent decision activity</p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {metrics.component_activity.slice(0, 6).map((component, index) => (
                <div key={component.component} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary-100 rounded text-primary-600 text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{component.component}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{component.count}</div>
                    <div className="text-xs text-secondary-500">
                      {component.avg_confidence.toFixed(1)} conf
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Health Components Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Health Score Breakdown</h3>
          <p className="card-description">Detailed view of organizational intelligence health components</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <HealthComponent
              title="Activity Level"
              score={health_status.components.activity}
              description="Decision creation velocity"
            />
            <HealthComponent
              title="Confidence Level"
              score={health_status.components.confidence}
              description="Average decision confidence"
            />
            <HealthComponent
              title="Evidence Collection"
              score={health_status.components.evidence}
              description="Follow-up evidence tracking"
            />
            <HealthComponent
              title="Component Diversity"
              score={health_status.components.diversity}
              description="Spread across components"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-description">Common tasks and next steps</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction
              title="Create New ADR"
              description="Document a new architectural decision"
              href="/adrs/new"
              icon={FileText}
            />
            <QuickAction
              title="View Analytics"
              description="Explore decision trends and patterns"
              href="/analytics"
              icon={BarChart3}
            />
            <QuickAction
              title="AI Insights"
              description="Get intelligent recommendations"
              href="/intelligence"
              icon={Brain}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  change: string
  icon: React.ComponentType<any>
  color: 'primary' | 'success' | 'warning' | 'error'
}

function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    success: 'text-success-600 bg-success-100',
    warning: 'text-warning-600 bg-warning-100',
    error: 'text-error-600 bg-error-100',
  }

  return (
    <div className="card">
      <div className="card-content">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-600">{title}</p>
            <p className="text-2xl font-bold text-secondary-900">{value}</p>
            <p className="text-xs text-secondary-500 mt-1">{change}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface HealthComponentProps {
  title: string
  score: number
  description: string
}

function HealthComponent({ title, score, description }: HealthComponentProps) {
  const percentage = Math.round(score * 100)
  const color = score > 0.8 ? 'success' : score > 0.6 ? 'primary' : score > 0.4 ? 'warning' : 'error'
  
  const colorClasses = {
    success: 'text-success-600 bg-success-500',
    primary: 'text-primary-600 bg-primary-500',
    warning: 'text-warning-600 bg-warning-500',
    error: 'text-error-600 bg-error-500',
  }

  return (
    <div className="text-center p-4 rounded-lg border border-secondary-200">
      <div className="flex justify-center mb-2">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2"
              className="text-secondary-200"
            />
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${percentage * 0.75} 100`}
              className={colorClasses[color].split(' ')[1]}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${colorClasses[color].split(' ')[0]}`}>
              {percentage}%
            </span>
          </div>
        </div>
      </div>
      <h4 className="text-sm font-medium text-secondary-900">{title}</h4>
      <p className="text-xs text-secondary-500 mt-1">{description}</p>
    </div>
  )
}

interface QuickActionProps {
  title: string
  description: string
  href: string
  icon: React.ComponentType<any>
}

function QuickAction({ title, description, href, icon: Icon }: QuickActionProps) {
  return (
    <a
      href={href}
      className="block p-4 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-secondary-900 group-hover:text-primary-900">
            {title}
          </h4>
          <p className="text-xs text-secondary-500 mt-1">{description}</p>
        </div>
      </div>
    </a>
  )
}