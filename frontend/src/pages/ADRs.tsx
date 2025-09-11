import React, { useState, useEffect } from 'react'
import { StandardLayout, PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import { FileText, Plus, Search, AlertCircle, Loader2 } from 'lucide-react'
import { adrService } from '@/services/api'
import { ADR } from '@/types'
import '@/styles/design-system.css'
// Test JSX structure

export function ADRs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [adrs, setAdrs] = useState<ADR[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    proposed: 0,
    avgConfidence: 0
  })

  // Load ADRs on component mount
  useEffect(() => {
    loadADRs()
  }, [])

  const loadADRs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load ADRs and stats in parallel
      const [adrsData, statsData] = await Promise.all([
        adrService.list({ limit: 100 }), // Get all ADRs for now
        adrService.getStats ? adrService.getStats() : Promise.resolve(null)
      ])
      
      setAdrs(adrsData)
      
      // Calculate stats from data if API doesn't provide them
      if (statsData) {
        setStats({
          total: statsData.total,
          accepted: statsData.byStatus?.accepted || 0,
          proposed: statsData.byStatus?.proposed || 0,
          avgConfidence: Math.round((statsData.averageConfidence || 0) * 10) / 10
        })
      } else {
        // Fallback: calculate stats from loaded data
        const accepted = adrsData.filter(adr => adr.status === 'accepted').length
        const proposed = adrsData.filter(adr => adr.status === 'proposed').length
        const avgConf = adrsData.reduce((sum, adr) => sum + (adr.confidence_score || 0), 0) / adrsData.length
        
        setStats({
          total: adrsData.length,
          accepted,
          proposed,
          avgConfidence: Math.round(avgConf * 10) / 10
        })
      }
    } catch (err) {
      console.error('Failed to load ADRs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load ADRs')
    } finally {
      setLoading(false)
    }
  }

  const filteredDecisions = adrs.filter(adr => {
    const matchesSearch = adr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         adr.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         adr.adr_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
                         adr.status.toLowerCase() === selectedFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const heroStats = [
    { value: stats.total.toString(), label: 'Total ADRs' },
    { value: stats.accepted.toString(), label: 'Accepted' },
    { value: `${stats.avgConfidence}`, label: 'Avg Confidence' }
  ]

  const actions = [
    {
      icon: Plus,
      title: 'Create New ADR',
      description: 'Document a new architecture decision',
      onClick: () => {
        // TODO: Navigate to ADR creation page
        console.log('Navigate to ADR creation')
      }
    },
    {
      icon: Search,
      title: 'Semantic Search',
      description: 'Find decisions using AI-powered search',
      onClick: async () => {
        if (searchQuery.trim()) {
          try {
            const results = await adrService.search({ 
              query: searchQuery, 
              limit: 20 
            })
            console.log('Search results:', results)
            // TODO: Display search results in modal or navigate to search page
          } catch (err) {
            console.error('Search failed:', err)
          }
        }
      }
    },
    {
      icon: FileText,
      title: 'Refresh Data',
      description: 'Reload ADRs from backend',
      onClick: loadADRs
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return '#2c2c2c'
      case 'proposed': return '#959595'
      case 'rejected': return '#c0c0c0'
      case 'superseded': return '#808080'
      case 'deprecated': return '#a0a0a0'
      default: return '#959595'
    }
  }

  // Error state
  if (error) {
    return (
      <StandardLayout title="KRINS Chronicle Keeper">
        <PageHero 
          subtitle="Architecture Decisions"
          title="Decision Records"
          description="Manage and track all architectural decisions across your organization with intelligent insights and real-time collaboration."
          stats={heroStats}
        />
        <ContentSection>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6xl) 0',
            textAlign: 'center'
          }}>
            <AlertCircle style={{
              width: '48px',
              height: '48px',
              color: 'var(--color-error)',
              marginBottom: 'var(--space-lg)'
            }} />
            <h3 className="text-xl text-primary" style={{ marginBottom: 'var(--space-md)' }}>
              Failed to Load ADRs
            </h3>
            <p className="text-base text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
              {error}
            </p>
            <button 
              onClick={loadADRs}
              className="btn"
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-background)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </ContentSection>
      </StandardLayout>
    )
  }

  return (
    <StandardLayout title="KRINS Chronicle Keeper">
      <PageHero 
        subtitle="Architecture Decisions"
        title="Decision Records"
        description="Manage and track all architectural decisions across your organization with intelligent insights and real-time collaboration."
        stats={heroStats}
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
            {['all', 'accepted', 'proposed', 'rejected', 'superseded', 'deprecated'].map(filter => (
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
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6xl) 0'
          }}>
            <Loader2 style={{
              width: '32px',
              height: '32px',
              color: 'var(--color-primary)',
              marginRight: 'var(--space-md)'
            }} className="animate-spin" />
            <span className="text-base text-secondary">Loading ADRs...</span>
          </div>
        ) : (
          <DataList 
            items={filteredDecisions}
            renderItem={(adr, index) => (
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
                        {adr.adr_id}: {adr.title}
                      </h3>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        color: getStatusColor(adr.status),
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--tracking-wide)',
                        padding: 'var(--space-xs) var(--space-sm)',
                        border: `1px solid ${getStatusColor(adr.status)}`,
                        fontWeight: 'var(--weight-medium)'
                      }}>
                        {adr.status}
                      </span>
                    </div>
                    <p className="text-base text-secondary" style={{
                      lineHeight: 1.7,
                      margin: 0,
                      marginBottom: 'var(--space-sm)'
                    }}>
                      {adr.context || adr.decision.substring(0, 200) + (adr.decision.length > 200 ? '...' : '')}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: 'var(--space-lg)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-tertiary)'
                    }}>
                      <span>Component: {adr.component}</span>
                      {adr.confidence_score && (
                        <span>Confidence: {Math.round(adr.confidence_score * 10)}/10</span>
                      )}
                      {adr.complexity_score && (
                        <span>Complexity: {Math.round(adr.complexity_score * 10)}/10</span>
                      )}
                      {adr.tags.length > 0 && (
                        <span>Tags: {adr.tags.slice(0, 3).join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <time className="text-xs text-tertiary uppercase tracking-wide" style={{
                    whiteSpace: 'nowrap',
                    marginLeft: 'var(--space-xl)'
                  }}>
                    {new Date(adr.decision_date || adr.created_at).toLocaleDateString()}
                  </time>
                </div>
              </div>
            )}
          />
        )}
        
        {!loading && filteredDecisions.length === 0 && (
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
                : adrs.length === 0 
                  ? 'No ADRs found in the system. Check if the backend is running and ADR files exist in docs/adr/'
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