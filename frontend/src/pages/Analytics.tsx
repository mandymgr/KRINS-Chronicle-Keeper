import { BarChart3, TrendingUp, PieChart, Activity, Target, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components_dev_memory/ui/Card'
import { Badge } from '@/components_dev_memory/ui/Badge'
import { Button } from '@/components_dev_memory/ui/Button'

export function Analytics() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Decision Analytics</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Advanced analytics and insights into organizational decision patterns.
            </p>
          </div>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Decisions"
          value="247"
          change="+12 this month"
          trend="up"
          icon={Target}
        />
        <MetricCard
          title="Active Components"
          value="34"
          change="+3 new components"
          trend="up"
          icon={Activity}
        />
        <MetricCard
          title="Average Velocity"
          value="5.2"
          change="decisions/week"
          trend="stable"
          icon={TrendingUp}
        />
        <MetricCard
          title="Decision Makers"
          value="18"
          change="active contributors"
          trend="stable"
          icon={Users}
        />
      </div>

      {/* Analytics Dashboards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decision Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Decision Trends</span>
            </CardTitle>
            <CardDescription>
              Monthly decision creation and resolution patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Trend Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Interactive charts showing decision velocity over time
                </p>
                <Badge variant="secondary">Integration Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Component Distribution</span>
            </CardTitle>
            <CardDescription>
              Decision distribution across system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PieChart className="h-8 w-8 text-success-600" />
                </div>
                <h3 className="font-medium mb-2">Distribution Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Visual breakdown of decisions by component
                </p>
                <Badge variant="secondary">Integration Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Effectiveness Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Effectiveness Matrix</span>
            </CardTitle>
            <CardDescription>
              Decision quality and impact analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-warning-600" />
                </div>
                <h3 className="font-medium mb-2">Impact Assessment</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quality vs impact matrix for all decisions
                </p>
                <Badge variant="secondary">Integration Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Timeline Analysis</span>
            </CardTitle>
            <CardDescription>
              Decision lifecycle and aging patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">Lifecycle Tracking</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Time-based analysis of decision evolution
                </p>
                <Badge variant="secondary">Integration Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Status */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">
                Advanced Analytics Integration
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Rich visualization dashboards with Recharts integration are being implemented to provide deep insights into organizational decision patterns.
              </p>
              <div className="flex space-x-2">
                <Badge variant="outline">Charts Library Ready</Badge>
                <Badge variant="outline">Data Pipeline Active</Badge>
                <Badge variant="secondary">UI Integration Pending</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: React.ComponentType<any>
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  const trendColors = {
    up: 'text-success-600',
    down: 'text-error-600',
    stable: 'text-muted-foreground'
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className={`text-xs mt-1 flex items-center space-x-1 ${trendColors[trend]}`}>
              <span>{trendIcons[trend]}</span>
              <span>{change}</span>
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}