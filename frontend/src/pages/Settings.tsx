import React from 'react'
import { StandardLayout, PageHero, ContentSection, ActionGrid } from '@/components/shared/Layout'
import { Settings as SettingsIcon, User, Bell, Palette, Shield, Database, Zap } from 'lucide-react'
import '@/styles/design-system.css'

export function Settings() {
  const stats = [
    { value: '5', label: 'Active Users' },
    { value: '3', label: 'Roles Configured' },
    { value: '12', label: 'System Settings' }
  ]

  const actions = [
    {
      icon: User,
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      onClick: () => console.log('User management clicked')
    },
    {
      icon: Shield,
      title: 'Security Settings',
      description: 'Configure authentication and access control',
      onClick: () => console.log('Security settings clicked')
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Set up alerts and notification preferences',
      onClick: () => console.log('Notifications clicked')
    },
    {
      icon: Palette,
      title: 'Theme & Display',
      description: 'Customize appearance and interface',
      onClick: () => console.log('Theme settings clicked')
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'Export, backup, and data retention settings',
      onClick: () => console.log('Data management clicked')
    },
    {
      icon: Zap,
      title: 'Integrations',
      description: 'Connect with external systems and APIs',
      onClick: () => console.log('Integrations clicked')
    }
  ]

  return (
    <StandardLayout title="KRINS Chronicle Keeper">
      <PageHero 
        subtitle="System Configuration"
        title="Settings Center"
        description="Configure your KRINS Chronicle Keeper experience, manage user access, and customize organizational intelligence preferences."
        stats={stats}
      />

      <ContentSection>
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-4xl) 0',
          marginBottom: 'var(--space-4xl)'
        }}>
          <SettingsIcon style={{
            width: '48px',
            height: '48px',
            margin: '0 auto var(--space-lg)',
            color: 'var(--color-primary)'
          }} />
          <h3 className="display text-xl text-primary" style={{
            marginBottom: 'var(--space-md)'
          }}>
            System Configuration
          </h3>
          <p className="text-base text-secondary" style={{
            maxWidth: '480px',
            margin: '0 auto var(--space-lg)',
            lineHeight: 1.7
          }}>
            Comprehensive settings panel for managing organizational intelligence, 
            user permissions, and system preferences across all KRINS capabilities.
          </p>
        </div>
      </ContentSection>

      <ContentSection title="Configuration Options">
        <ActionGrid actions={actions} />
      </ContentSection>

      <ContentSection title="System Status">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-lg)',
          padding: 'var(--space-2xl)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)'
        }}>
          {[
            { 
              title: 'Authentication', 
              status: 'Active', 
              description: 'JWT-based authentication with role permissions',
              color: '#2c2c2c'
            },
            { 
              title: 'AI Integration', 
              status: 'Ready', 
              description: 'Context provider and pattern analysis operational',
              color: '#2c2c2c'
            },
            { 
              title: 'Decision Tracking', 
              status: 'Enabled', 
              description: 'ADR management and analytics fully configured',
              color: '#2c2c2c'
            }
          ].map((item, index) => (
            <div key={index} style={{
              padding: 'var(--space-lg)',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-sm)'
              }}>
                <h4 className="text-base font-medium text-primary uppercase tracking-wide">
                  {item.title}
                </h4>
                <span style={{
                  fontSize: 'var(--text-xs)',
                  color: item.color,
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wide)',
                  padding: 'var(--space-xs) var(--space-sm)',
                  border: `1px solid ${item.color}`,
                  fontWeight: 'var(--weight-medium)'
                }}>
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-secondary" style={{
                lineHeight: 1.6
              }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </ContentSection>
    </StandardLayout>
  )
}