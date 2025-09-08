import { BarChart3, TrendingUp, PieChart } from 'lucide-react'

export function Analytics() {
  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-4">
        <h1 className="text-3xl font-bold text-secondary-900">Decision Analytics</h1>
        <p className="mt-2 text-sm text-secondary-600">
          Advanced analytics and insights into organizational decision patterns.
        </p>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Advanced Analytics Coming Soon</h3>
              <p className="text-secondary-600 mb-4">
                Rich visualization dashboards are being integrated.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center space-x-2 text-sm text-secondary-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>Decision Trends</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary-500">
                  <PieChart className="h-4 w-4" />
                  <span>Component Distribution</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary-500">
                  <BarChart3 className="h-4 w-4" />
                  <span>Effectiveness Matrix</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}