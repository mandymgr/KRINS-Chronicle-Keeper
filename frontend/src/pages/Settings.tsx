import { Settings as SettingsIcon, User, Bell, Palette } from 'lucide-react'

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-4">
        <h1 className="text-3xl font-bold text-secondary-900">Settings</h1>
        <p className="mt-2 text-sm text-secondary-600">
          Configure your KRINS Chronicle Keeper experience and preferences.
        </p>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <SettingsIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Settings Panel Coming Soon</h3>
              <p className="text-secondary-600 mb-4">
                User preferences and system configuration options are being integrated.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center space-x-2 text-sm text-secondary-500">
                  <User className="h-4 w-4" />
                  <span>User Profile</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary-500">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary-500">
                  <Palette className="h-4 w-4" />
                  <span>Theme & Display</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}