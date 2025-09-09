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
  Palette
} from 'lucide-react'
import { useState } from 'react'
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
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* Health indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-gentle" />
                <span className="text-sm text-secondary-600">System Healthy</span>
              </div>
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