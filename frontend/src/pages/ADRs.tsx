import React, { useState } from 'react'
import { FileText, Plus, Search, Settings, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  DecisionCard,
  ADRStatusBadge,
  IntelligenceInsights,
  EditorialLayout,
  type DecisionData,
  type Insight
} from '@/design-system'
import ADRForm from '@/components_dev_memory/forms/ADRForm'

// Mock data for demonstration
const mockDecisions: DecisionData[] = [
  {
    id: '001',
    title: 'Use React Query for API State Management',
    status: 'accepted',
    component: 'frontend/state',
    createdDate: '2024-12-01',
    confidence: 0.9,
    impact: 'high',
    stakeholders: ['Frontend Team', 'Architecture Review Board'],
    summary: 'Adopt React Query for managing server state, replacing custom hooks and Redux for API calls.'
  },
  {
    id: '002', 
    title: 'Implement PostgreSQL with pgvector for Semantic Search',
    status: 'proposed',
    component: 'backend/database',
    createdDate: '2024-12-05',
    confidence: 0.75,
    impact: 'high',
    stakeholders: ['Backend Team', 'Data Team', 'Product'],
    summary: 'Add pgvector extension to enable semantic search capabilities across organizational knowledge.'
  },
  {
    id: '003',
    title: 'Migrate from REST to GraphQL API',
    status: 'rejected',
    component: 'backend/api', 
    createdDate: '2024-11-15',
    confidence: 0.4,
    impact: 'medium',
    stakeholders: ['Backend Team', 'Frontend Team'],
    summary: 'Evaluation concluded that REST APIs meet current needs and GraphQL migration costs outweigh benefits.'
  },
  {
    id: '004',
    title: 'Adopt WebSocket for Real-time Decision Updates',
    status: 'accepted',
    component: 'platform/realtime',
    createdDate: '2024-11-28',
    confidence: 0.85,
    impact: 'medium',
    stakeholders: ['Full Stack Team', 'DevOps'],
    summary: 'Enable real-time collaboration with WebSocket integration for live decision tracking.'
  }
];

const mockInsights: Insight[] = [
  {
    id: 'insight-1',
    type: 'recommendation',
    title: 'Consider API Rate Limiting Implementation',
    description: 'Based on recent decisions about API architecture, implementing rate limiting would improve system stability.',
    confidence: 0.82,
    priority: 'medium',
    actionable: true,
    relatedDecisions: ['001', '004']
  },
  {
    id: 'insight-2',
    type: 'trend',
    title: 'Increasing Focus on Real-time Features',
    description: 'Analysis shows growing emphasis on real-time capabilities across recent architectural decisions.',
    confidence: 0.91,
    priority: 'low',
    actionable: false,
    relatedDecisions: ['004']
  }
];

export function ADRs() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowCreateForm(false)}
            className="mb-4"
          >
            ← Back to ADRs
          </Button>
        </div>
        <ADRForm 
          onSuccess={() => {
            setShowCreateForm(false)
            // Here we would normally refetch the ADR list
          }} 
        />
      </div>
    )
  }

  const filteredDecisions = mockDecisions.filter(decision => {
    const matchesSearch = decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         decision.component.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || decision.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div 
      className="min-h-screen"
      style={{ background: 'var(--color-intelligence-bg)', color: 'var(--gray-800)' }}
    >
      <EditorialLayout>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 
            className="text-5xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brand-primary)' }}
          >
            📋 Architecture Decision Records
          </h1>
          <p 
            className="text-xl max-w-3xl mx-auto mb-8"
            style={{ color: 'var(--gray-600)' }}
          >
            Manage and track all architectural decisions across your organization with intelligent insights and real-time collaboration.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={() => setShowCreateForm(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create New ADR
            </Button>
          </div>
        </motion.div>

        {/* AI Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <IntelligenceInsights insights={mockInsights} />
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--gray-400)' }} />
                  <input
                    type="text"
                    placeholder="Search ADRs by title or component..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--gray-300)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--gray-0)',
                      color: 'var(--gray-800)'
                    }}
                  />
                </div>
                
                <div className="flex space-x-2">
                  {['all', 'proposed', 'accepted', 'rejected', 'superseded'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        selectedFilter === filter ? '' : ''
                      }`}
                      style={{
                        backgroundColor: selectedFilter === filter 
                          ? 'var(--color-brand-primary)' 
                          : 'var(--gray-100)',
                        color: selectedFilter === filter 
                          ? 'white' 
                          : 'var(--gray-700)',
                        borderRadius: 'var(--radius-lg)'
                      }}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Decision Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredDecisions.map((decision, index) => (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <DecisionCard
                decision={decision}
                onClick={() => {
                  // Navigate to decision detail page
                  console.log('Navigate to decision:', decision.id);
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {filteredDecisions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--gray-400)' }} />
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--gray-700)' }}
            >
              No decisions found
            </h3>
            <p className="mb-6" style={{ color: 'var(--gray-600)' }}>
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first architectural decision record to get started.'
              }
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First ADR
            </Button>
          </motion.div>
        )}
      </EditorialLayout>
    </div>
  );
}