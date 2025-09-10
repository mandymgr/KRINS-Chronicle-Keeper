import React, { useState } from 'react'
import { StandardLayout, PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { FileText, Plus, Search } from 'lucide-react'
import '@/styles/design-system.css'

// Mock data for demonstration
const mockDecisions = [
  {
    id: 'ADR-001',
    title: 'Use React Query for API State Management',
    status: 'Accepted',
    component: 'frontend/state',
    createdDate: '2024-12-01',
    summary: 'Adopt React Query for managing server state, replacing custom hooks and Redux for API calls.',
    confidence: '90%',
    impact: 'High'
  },
  {
    id: 'ADR-002', 
    title: 'Implement PostgreSQL with pgvector for Semantic Search',
    status: 'Proposed',
    component: 'backend/database',
    createdDate: '2024-12-05',
    summary: 'Add pgvector extension to enable semantic search capabilities across organizational knowledge.',
    confidence: '75%',
    impact: 'High'
  },
  {
    id: 'ADR-003',
    title: 'Migrate from REST to GraphQL API',
    status: 'Rejected',
    component: 'backend/api', 
    createdDate: '2024-11-15',
    summary: 'Evaluation concluded that REST APIs meet current needs and GraphQL migration costs outweigh benefits.',
    confidence: '40%',
    impact: 'Medium'
  },
  {
    id: 'ADR-004',
    title: 'Adopt WebSocket for Real-time Decision Updates',
    status: 'Accepted',
    component: 'platform/realtime',
    createdDate: '2024-11-28',
    summary: 'Enable real-time collaboration with WebSocket integration for live decision tracking.',
    confidence: '85%',
    impact: 'Medium'
  }
]

export function ADRs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const stats = [
    { value: '4', label: 'Total ADRs' },
    { value: '2', label: 'Accepted' },
    { value: '75%', label: 'Confidence Rate' }
  ]

  const filteredDecisions = mockDecisions.filter(decision => {
    const matchesSearch = decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         decision.component.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
                         decision.status.toLowerCase() === selectedFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const actions = [
    {
      icon: Plus,
      title: 'Create New ADR',
      description: 'Document a new architecture decision',
      onClick: () => console.log('Create ADR clicked')
    },
    {
      icon: Search,
      title: 'Search ADRs',
      description: 'Find specific decisions or patterns',
      onClick: () => console.log('Search clicked')
    },
    {
      icon: FileText,
      title: 'Generate Report',
      description: 'Export decision analytics report',
      onClick: () => console.log('Report clicked')
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return '#2c2c2c'
      case 'proposed': return '#959595'
      case 'rejected': return '#c0c0c0'
      default: return '#959595'
    }
  }

  return (
    <StandardLayout title="KRINS Chronicle Keeper">
      <PageHero 
        subtitle="Architecture Decisions"
        title="Decision Records"
        description="Manage and track all architectural decisions across your organization with intelligent insights and real-time collaboration."
        stats={stats}
      />

      {/* Search and Filter Section */}
      <ContentSection>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-4xl)',
          padding: 'var(--space-2xl)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)'
        }}>
          <div style={{
            position: 'relative',
            flex: 1
          }}>
            <Search style={{
              position: 'absolute',
              left: 'var(--space-md)',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: 'var(--color-secondary)'
            }} />
            <input
              type="text"
              placeholder="Search ADRs by title or component..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 'var(--space-3xl)',
                paddingRight: 'var(--space-md)',
                paddingTop: 'var(--space-sm)',
                paddingBottom: 'var(--space-sm)',
                border: '1px solid var(--color-border-medium)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-primary)',
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>
          
          <div style={{
            display: 'flex',
            gap: 'var(--space-xs)',
            flexWrap: 'wrap'
          }}>
            {['all', 'accepted', 'proposed', 'rejected'].map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className="btn"
                style={{
                  padding: 'var(--space-xs) var(--space-md)',
                  fontSize: 'var(--text-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wide)',
                  backgroundColor: selectedFilter === filter 
                    ? 'var(--color-primary)' 
                    : 'transparent',
                  color: selectedFilter === filter 
                    ? 'var(--color-background)' 
                    : 'var(--color-secondary)',
                  border: '1px solid var(--color-border-medium)'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Architecture Decisions">
        <DataList 
          items={filteredDecisions}
          renderItem={(decision, index) => (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 'var(--space-md)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    <h3 className="text-lg font-regular text-primary uppercase tracking-wide">
                      {decision.id}: {decision.title}
                    </h3>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      color: getStatusColor(decision.status),
                      textTransform: 'uppercase',
                      letterSpacing: 'var(--tracking-wide)',
                      padding: 'var(--space-xs) var(--space-sm)',
                      border: `1px solid ${getStatusColor(decision.status)}`,
                      fontWeight: 'var(--weight-medium)'
                    }}>
                      {decision.status}
                    </span>
                  </div>
                  <p className="text-base text-secondary" style={{
                    lineHeight: 1.7,
                    margin: 0,
                    marginBottom: 'var(--space-sm)'
                  }}>
                    {decision.summary}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-lg)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-tertiary)'
                  }}>
                    <span>Component: {decision.component}</span>
                    <span>Impact: {decision.impact}</span>
                    <span>Confidence: {decision.confidence}</span>
                  </div>
                </div>
                <time className="text-xs text-tertiary uppercase tracking-wide" style={{
                  whiteSpace: 'nowrap',
                  marginLeft: 'var(--space-xl)'
                }}>
                  {decision.createdDate}
                </time>
              </div>
            </div>
          )}
        />
        
        {filteredDecisions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-6xl) 0',
            color: 'var(--color-secondary)'
          }}>
            <FileText style={{
              width: '48px',
              height: '48px',
              margin: '0 auto var(--space-lg)',
              color: 'var(--color-tertiary)'
            }} />
            <h3 className="display text-xl text-secondary" style={{
              marginBottom: 'var(--space-md)'
            }}>
              No decisions found
            </h3>
            <p className="text-base text-secondary">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first architectural decision record to get started.'
              }
            </p>
          </div>
        )}
      </ContentSection>
      
      <ContentSection title="Quick Actions">
        <ActionGrid actions={actions} />
      </ContentSection>
    </StandardLayout>
  )
}