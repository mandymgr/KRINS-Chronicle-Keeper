import React, { useState } from 'react'
import { FileText, Plus, Search, Settings, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components_dev_memory/ui/Card'
import { Button } from '@/components_dev_memory/ui/Button'
import { Input } from '@/components_dev_memory/ui/Input'
import { Badge } from '@/components_dev_memory/ui/Badge'
import ADRForm from '@/components_dev_memory/forms/ADRForm'

export function ADRs() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Architecture Decision Records</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage and track all architectural decisions across your organization.
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New ADR
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ADRs by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ADR List/Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Example ADR Cards */}
        <ADRCard
          id="ADR-001"
          title="Use PostgreSQL for primary database"
          status="accepted"
          date="2024-03-15"
          author="John Doe"
          tags={["database", "architecture", "postgres"]}
          description="Decision to use PostgreSQL as our primary database system for improved performance and ACID compliance."
        />
        
        <ADRCard
          id="ADR-002"
          title="Implement microservices architecture"
          status="proposed"
          date="2024-03-18"
          author="Jane Smith"
          tags={["architecture", "microservices", "scalability"]}
          description="Proposal to migrate from monolithic architecture to microservices for better scalability and maintainability."
        />
        
        <ADRCard
          id="ADR-003"
          title="Use Docker for containerization"
          status="accepted"
          date="2024-03-10"
          author="Mike Johnson"
          tags={["deployment", "docker", "containerization"]}
          description="Decision to standardize on Docker for application containerization across all environments."
        />
        
        {/* Coming Soon Card */}
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-2">Dynamic ADR Loading</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Real ADR data integration coming soon
              </p>
              <Badge variant="secondary">In Development</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Total ADRs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success-600">8</div>
              <div className="text-sm text-muted-foreground">Accepted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning-600">3</div>
              <div className="text-sm text-muted-foreground">Proposed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-muted-foreground">1</div>
              <div className="text-sm text-muted-foreground">Superseded</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ADRCardProps {
  id: string
  title: string
  status: 'proposed' | 'accepted' | 'superseded' | 'deprecated'
  date: string
  author: string
  tags: string[]
  description: string
}

function ADRCard({ id, title, status, date, author, tags, description }: ADRCardProps) {
  const statusVariant = {
    accepted: 'default' as const,
    proposed: 'secondary' as const,
    superseded: 'outline' as const,
    deprecated: 'destructive' as const,
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {id}
              </Badge>
              <Badge variant={statusVariant[status]} className="text-xs capitalize">
                {status}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight mb-1">
              {title}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Meta information */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>By {author}</span>
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}