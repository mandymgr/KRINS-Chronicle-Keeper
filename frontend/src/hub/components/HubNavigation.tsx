// KRINS Developer Hub - Navigation Component
// Elegant Kinfolk-style navigation for Hub sections

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Server, 
  GitBranch, 
  FileText, 
  Brain, 
  Settings,
  BarChart3,
  GitCommit,
  Activity
} from 'lucide-react'

interface NavItem {
  path: string
  title: string
  description: string
  icon: React.ComponentType<any>
  badge?: string
}

const hubNavItems: NavItem[] = [
  {
    path: '/hub',
    title: 'Dashboard',
    description: 'System overview and health',
    icon: Home
  },
  {
    path: '/hub/systems',
    title: 'Systems',
    description: 'Docker, database, services',
    icon: Server
  },
  {
    path: '/hub/code',
    title: 'Repository',
    description: 'Git status, commits, files',
    icon: GitBranch
  },
  {
    path: '/hub/decisions',
    title: 'Decisions',
    description: 'ADR management and analytics',
    icon: FileText
  },
  {
    path: '/hub/intelligence',
    title: 'AI Intelligence',
    description: 'Context, MCP, pattern mining',
    icon: Brain
  },
  {
    path: '/hub/workflow',
    title: 'Workflow',
    description: 'Process automation and tracking',
    icon: GitCommit
  },
  {
    path: '/hub/operations',
    title: 'Operations',
    description: 'Commands, logs, emergency tools',
    icon: Settings
  },
  {
    path: '/hub/insights',
    title: 'Insights',
    description: 'Velocity, quality, optimization',
    icon: BarChart3
  }
]

export function HubNavigation() {
  const location = useLocation()
  
  return (
    <nav style={{
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      marginBottom: 'var(--space-6xl)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{
        padding: '0 var(--space-3xl)',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'flex',
          gap: 0,
          minWidth: 'fit-content'
        }}>
          {hubNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
                           (item.path === '/hub' && location.pathname === '/hub/')
            
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 'var(--space-xl) var(--space-lg)',
                  textDecoration: 'none',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-secondary)',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'all var(--transition-base)',
                  minWidth: '120px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-primary)'
                    e.currentTarget.style.borderBottomColor = 'var(--color-border-medium)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-secondary)'
                    e.currentTarget.style.borderBottomColor = 'transparent'
                  }
                }}
              >
                <Icon 
                  size={16} 
                  style={{ 
                    marginBottom: 'var(--space-xs)',
                    color: 'inherit'
                  }} 
                />
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-medium)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase',
                  marginBottom: '2px'
                }}>
                  {item.title}
                </span>
                <span style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-tertiary)',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  maxWidth: '100px'
                }}>
                  {item.description}
                </span>
                
                {item.badge && (
                  <div style={{
                    position: 'absolute',
                    top: 'var(--space-sm)',
                    right: 'var(--space-sm)',
                    background: 'var(--color-primary)',
                    color: 'var(--color-background)',
                    fontSize: 'var(--text-xs)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 'var(--weight-medium)'
                  }}>
                    {item.badge}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// Quick Actions Navigation
export function HubQuickActions() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--space-xl)',
      right: 'var(--space-xl)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)',
      zIndex: 100
    }}>
      <button
        className="btn btn-primary"
        style={{
          background: 'var(--color-primary)',
          color: 'var(--color-background)',
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-medium)'
        }}
        onClick={() => {
          // TODO: Open command palette
          console.log('Command palette')
        }}
        title="Command Palette (⌘K)"
      >
        <Activity size={16} />
      </button>
    </div>
  )
}