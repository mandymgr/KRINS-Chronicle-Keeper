import React from 'react'
import Sidebar from '@/components/ui/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Stat from '@/components/ui/Stat'

const projects = [
  {
    id: 'living-spec-dashboard',
    name: 'Living Spec Dashboard',
    description: 'AI-team koordinering og systemytelse dashboard',
    status: 'active' as const,
    progress: 85,
    team: ['Architect', 'Product', 'Security'],
    lastUpdated: '2 min siden',
    priority: 'critical'
  },
  {
    id: 'krin-superintelligence',
    name: 'Krin Superintelligence Team',
    description: 'Multi-agent AI koordinasjonssystem',
    status: 'active' as const,
    progress: 92,
    team: ['Research', 'Architect', 'Performance'],
    lastUpdated: '15 min siden',
    priority: 'high'
  },
  {
    id: 'dev-memory-os',
    name: 'Dev Memory OS',
    description: 'Dokumentasjonsdrevet utviklingsplattform',
    status: 'maintenance' as const,
    progress: 78,
    team: ['Product', 'Compliance'],
    lastUpdated: '1t siden',
    priority: 'medium'
  },
  {
    id: 'rag-system',
    name: 'RAG Search System',
    description: 'Semantisk søk og kunnskapsbase',
    status: 'planning' as const,
    progress: 45,
    team: ['Research', 'Security'],
    lastUpdated: '3t siden',
    priority: 'low'
  }
]

const sidebarItems = [
  { href: '/', label: 'Oversikt' },
  { href: '/agents', label: 'AI Agenter' },
  { href: '/projects', label: 'Prosjekter', active: true },
  { href: '/insights', label: 'Innsikter' },
  { href: '/memory', label: 'Hukommelse' },
  { href: '/settings', label: 'Innstillinger' }
]

function getStatusColor(status: string) {
  const colors = {
    active: 'bg-ai-active/10 text-ai-active border-ai-active/20',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
    planning: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300'
  }
  return colors[status as keyof typeof colors] || colors.planning
}

function getPriorityColor(priority: string) {
  const colors = {
    critical: 'text-red-600',
    high: 'text-orange-600', 
    medium: 'text-blue-600',
    low: 'text-stone-600'
  }
  return colors[priority as keyof typeof colors] || colors.medium
}

export default function ProjectsPage() {
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
  
  return (
    <>
      <Sidebar 
        title="Living Spec Dashboard" 
        items={sidebarItems} 
      />
      
      <main className="flex-1 p-8 overflow-auto bg-ivory">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="editorial-title">
              Prosjekter
            </h1>
            <p className="editorial-subtitle">
              Oversikt over alle aktive og planlagte prosjekter
            </p>
          </div>

          {/* Project Statistics */}
          <div className="dashboard-grid">
            <Stat
              label="Totale Prosjekter"
              value={projects.length}
              change="4 aktive"
              trend="neutral"
            />
            <Stat
              label="Aktive Prosjekter"
              value={activeProjects}
              change={`${projects.length - activeProjects} planlagt`}
              trend="up"
            />
            <Stat
              label="Gjennomsnittlig Fremgang"
              value={`${totalProgress}%`}
              change="+12% denne uken"
              trend="up"
            />
            <Stat
              label="Team Kapasitet"
              value="94%"
              change="Optimal load"
              trend="neutral"
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prosjekt Administrasjon</CardTitle>
                  <CardDescription>
                    Administrer alle prosjekter og team-tildelinger
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Eksporter Rapport
                  </Button>
                  <Button variant="accent" size="sm">
                    Nytt Prosjekt
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Projects Grid */}
          <div>
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-ink mb-1">
                Alle Prosjekter
              </h2>
              <p className="text-stone-500">
                Status og fremgang for hvert prosjekt
              </p>
            </div>

            <div className="dashboard-grid">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status === 'active' ? 'Aktiv' :
                         project.status === 'maintenance' ? 'Vedlikehold' :
                         project.status === 'planning' ? 'Planlegging' : 'Fullført'}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="kicker">Fremgang</span>
                          <span className="text-sm font-medium text-ink">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2">
                          <div 
                            className="bg-ai-active h-2 rounded-full transition-all" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Team & Info */}
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <div className="kicker mb-1">Team</div>
                          <div className="flex flex-wrap gap-1">
                            {project.team.map((member, idx) => (
                              <span key={idx} className="px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-md">
                                {member}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="kicker mb-1">Prioritet</div>
                            <div className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority === 'critical' ? 'Kritisk' :
                               project.priority === 'high' ? 'Høy' :
                               project.priority === 'medium' ? 'Middels' : 'Lav'}
                            </div>
                          </div>
                          
                          <div>
                            <div className="kicker mb-1">Sist oppdatert</div>
                            <div className="text-sm text-stone-600">{project.lastUpdated}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}