import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export function StandardLayout({ children, title = 'KRINS Chronicle Keeper' }: LayoutProps) {
  const { state, logout } = useAuth()

  return (
    <div className="dashboard-container" style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--color-background)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      overflow: 'auto'
    }}>
      {/* Standard Header */}
      <header className="header">
        <div className="header-content container">
          {/* Logo */}
          <div className="logo">
            <div className="logo-icon"></div>
            <div className="logo-text">{title}</div>
          </div>
          
          {/* User Status */}
          {state.user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--weight-semibold)',
                  letterSpacing: 'var(--tracking-wide)',
                  marginBottom: '2px'
                }}>{state.user.name}</div>
                <div style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--color-secondary)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase',
                  fontWeight: 'var(--weight-regular)'
                }}>
                  {state.user.role}
                </div>
              </div>
              <button 
                className="btn btn-primary"
                onClick={logout}
              >
                <LogOut size={12} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {children}
      </main>
    </div>
  )
}

export function PageHero({ 
  subtitle, 
  title, 
  description, 
  stats 
}: {
  subtitle: string
  title: string
  description?: string
  stats?: Array<{ value: string; label: string }>
}) {
  return (
    <section className="hero section">
      <div className="hero-subtitle">{subtitle}</div>
      <h1 className="hero-title">{title}</h1>
      {description && <p className="hero-description">{description}</p>}
      
      {stats && (
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function ContentSection({ 
  title, 
  children, 
  className = 'section' 
}: { 
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      {title && (
        <h2 className="display text-2xl text-primary font-regular" style={{
          marginBottom: 'var(--space-5xl)',
          textAlign: 'center'
        }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}

export function DataList({ 
  items, 
  renderItem 
}: { 
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
}) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="list-item">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}

export function ActionGrid({ actions }: { 
  actions: Array<{
    icon: React.ComponentType<any>
    title: string
    description: string
    onClick?: () => void
  }>
}) {
  return (
    <div className="action-grid">
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <button
            key={index}
            className="btn action-item"
            onClick={action.onClick}
          >
            <Icon className="action-icon" />
            <h3 className="action-title">{action.title}</h3>
            <p className="action-description">{action.description}</p>
          </button>
        )
      })}
    </div>
  )
}