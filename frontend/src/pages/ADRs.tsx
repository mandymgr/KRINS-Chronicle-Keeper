import { FileText, Plus, Search } from 'lucide-react'

export function ADRs() {
  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Architecture Decision Records</h1>
            <p className="mt-2 text-sm text-secondary-600">
              Manage and track all architectural decisions across your organization.
            </p>
          </div>
          <button className="btn btn-primary h-10 px-4">
            <Plus className="h-4 w-4 mr-2" />
            New ADR
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">ADR Management Coming Soon</h3>
              <p className="text-secondary-600 mb-4">
                Full ADR management interface is being integrated.
              </p>
              <div className="flex items-center space-x-2 text-sm text-secondary-500">
                <Search className="h-4 w-4" />
                <span>Search, create, edit, and link decisions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}