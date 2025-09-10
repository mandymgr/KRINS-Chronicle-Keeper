import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  BarChart3, 
  Brain, 
  Settings,
  Menu,
  X,
  Palette,
  User,
  LogOut,
  Shield,
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeSelector } from '@/design-system/components/ThemeSelector'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'ADRs', href: '/adrs', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Intelligence', href: '/intelligence', icon: Brain },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--gray-50)' }}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-opacity-75 transition-opacity ease-linear duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0'
        }`} onClick={() => setSidebarOpen(false)} style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }} />

        <div className={`relative flex-1 flex flex-col max-w-xs w-full glass-card transform transition ease-in-out duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent currentPath={location.pathname} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent currentPath={location.pathname} />
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 glass-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <button
            type="button"
            className="px-4 border-r border-secondary-200 text-secondary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gray-800)' }}>
                {navigation.find(item => item.href === location.pathname)?.name || 'KRINS Chronicle Keeper'}
              </h1>
            </div>
            
            <div className="ml-4 flex items-center space-x-4 md:ml-6">
              {/* Health indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-gentle" />
                <span className="text-sm text-secondary-600">System Healthy</span>
              </div>
              
              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ currentPath }: { currentPath: string }) {
  return (
    <div 
      className="flex-1 flex flex-col min-h-0 glass-card" 
      style={{ 
        borderRight: '1px solid var(--glass-border)',
        borderRadius: '0'
      }}
    >
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-accent))',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 
                className="text-lg font-bold"
                style={{ 
                  fontFamily: 'var(--font-display)', 
                  color: 'var(--gray-800)' 
                }}
              >
                KRINS
              </h2>
              <p 
                className="text-xs"
                style={{ color: 'var(--gray-500)' }}
              >
                Chronicle Keeper
              </p>
            </div>
          </div>
        </div>
        
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = currentPath === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-primary-500' : 'text-secondary-400 group-hover:text-secondary-500'
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="flex-shrink-0 border-t p-4" style={{ borderTopColor: 'var(--gray-200)' }}>
        {/* Theme Selector */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Palette className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--gray-600)' }}>
              Theme
            </span>
          </div>
          <ThemeSelector className="scale-90" />
        </div>
        
        {/* AI Assistant Status */}
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--gray-200)' }}
          >
            <span 
              className="text-xs font-medium"
              style={{ color: 'var(--gray-600)' }}
            >
              AI
            </span>
          </div>
          <div>
            <p 
              className="text-sm font-medium"
              style={{ color: 'var(--gray-800)' }}
            >
              AI Assistant
            </p>
            <p 
              className="text-xs"
              style={{ color: 'var(--gray-500)' }}
            >
              Online & Ready
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { state, logout } = useAuth()

  if (!state.user) return null

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'architect': return 'bg-blue-100 text-blue-800'  
      case 'developer': return 'bg-green-100 text-green-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'System Admin'
      case 'architect': return 'Architect'
      case 'developer': return 'Developer'
      case 'viewer': return 'Viewer'
      default: return role
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {state.user.avatar ? (
            <img
              className="w-8 h-8 rounded-full"
              src={state.user.avatar}
              alt={state.user.name}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{state.user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{state.user.department}</p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {state.user.avatar ? (
                  <img
                    className="w-10 h-10 rounded-full"
                    src={state.user.avatar}
                    alt={state.user.name}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{state.user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{state.user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(state.user.role)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {getRoleName(state.user.role)}
                    </span>
                    {state.user.department && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {state.user.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <div className="mb-2 px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Permissions
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {state.user.permissions.slice(0, 3).map(permission => (
                    <span key={permission} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                      {permission.split(':')[1] || permission}
                    </span>
                  ))}
                  {state.user.permissions.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{state.user.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="w-3 h-3" />
                <span>Session expires in 8 hours</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}