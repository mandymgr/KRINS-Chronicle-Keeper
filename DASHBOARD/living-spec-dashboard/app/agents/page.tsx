import React from 'react'
import Sidebar from '@/components/ui/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import AgentStatusCard from '@/components/dashboard/AgentStatusCard'
import { Button } from '@/components/ui/button'
import Stat from '@/components/ui/Stat'

// Extended mock data for all AI agents
const allAgents = [
  {
    id: 'architect',
    name: 'Architect Agent 🏗️',
    role: 'System Architecture & Design Excellence',
    status: 'active' as const,
    lastActivity: '2 min siden',
    tasksCompleted: 12,
    currentTask: 'Analyserer Living Spec Dashboard arkitektur og optimaliserer component struktur'
  },
  {
    id: 'security',
    name: 'Security Agent 🔒',
    role: 'Cybersecurity & Penetration Testing',
    status: 'processing' as const,
    lastActivity: '5 min siden',
    tasksCompleted: 8,
    currentTask: 'Kjører omfattende sikkerhetsscan på alle API endpoints og database tilkoblinger'
  },
  {
    id: 'performance',
    name: 'Performance Agent ⚡',
    role: 'Performance Optimization & Scaling',
    status: 'inactive' as const,
    lastActivity: '1t siden',
    tasksCompleted: 15,
  },
  {
    id: 'product',
    name: 'Product Agent 📱',
    role: 'UX/UI & User Experience Excellence',
    status: 'active' as const,
    lastActivity: '10 min siden',
    tasksCompleted: 9,
    currentTask: 'Optimaliserer Krin designsystem implementering og Netflix-style interface'
  },
  {
    id: 'compliance',
    name: 'Compliance Agent ⚖️',
    role: 'Regulatory Standards & Quality Assurance',
    status: 'active' as const,
    lastActivity: '25 min siden',
    tasksCompleted: 6,
    currentTask: 'Verifiserer GDPR compliance for hukommelsessystem og personvern policies'
  },
  {
    id: 'research',
    name: 'Research Agent 🔬',
    role: 'Innovation & Cutting-edge Technology Research',
    status: 'processing' as const,
    lastActivity: '15 min siden',
    tasksCompleted: 11,
    currentTask: 'Undersøker nye AI patterns for multi-agent coordination og breakthrough innovations'
  },
  {
    id: 'redteam',
    name: 'RedTeam Agent 🔴',
    role: 'Adversarial Testing & Quality Gates',
    status: 'inactive' as const,
    lastActivity: '2t siden',
    tasksCompleted: 4,
  }
]

const sidebarItems = [
  { href: '/', label: 'Oversikt' },
  { href: '/agents', label: 'AI Agenter', active: true },
  { href: '/projects', label: 'Prosjekter' },
  { href: '/insights', label: 'Innsikter' },
  { href: '/memory', label: 'Hukommelse' },
  { href: '/settings', label: 'Innstillinger' }
]

export default function AgentsPage() {
  const activeAgents = allAgents.filter(agent => agent.status === 'active').length
  const processingAgents = allAgents.filter(agent => agent.status === 'processing').length
  const totalTasks = allAgents.reduce((sum, agent) => sum + (agent.tasksCompleted || 0), 0)

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
              AI Agenter
            </h1>
            <p className="editorial-subtitle">
              Komplett oversikt over Krin's Superintelligence Team
            </p>
          </div>

          {/* Agent Statistics */}
          <div className="dashboard-grid">
            <Stat
              label="Totalt Agenter"
              value={allAgents.length}
              change="7 spesialiserte"
              trend="neutral"
            />
            <Stat
              label="Aktive Nå"
              value={activeAgents}
              change={`${processingAgents} prosesserer`}
              trend="up"
            />
            <Stat
              label="Oppgaver Fullført"
              value={totalTasks}
              change="I dag"
              trend="up"
            />
            <Stat
              label="Team Ytelse"
              value="94.2%"
              change="+2.1%"
              trend="up"
            />
          </div>

          {/* Control Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Kontroll</CardTitle>
                  <CardDescription>
                    Administrer og koordiner alle AI-agenter
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Stopp Alle
                  </Button>
                  <Button variant="accent" size="sm">
                    Start Alle
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm">
                  Oppfrisk Status
                </Button>
                <Button variant="ghost" size="sm">
                  Eksporter Logs
                </Button>
                <Button variant="ghost" size="sm">
                  Team Rapport
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* All AI Agents */}
          <div>
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-ink mb-1">
                Alle Agenter
              </h2>
              <p className="text-stone-500">
                Live status for hver spesialist i superintelligence-teamet
              </p>
            </div>

            <div className="dashboard-grid">
              {allAgents.map((agent) => (
                <AgentStatusCard 
                  key={agent.id} 
                  agent={agent} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* Team Performance Insights */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Koordinering</CardTitle>
                <CardDescription>
                  Multi-agent samarbeid og oppgave distribusjon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Arkitektur → Security</span>
                    <span className="text-ai-active text-sm">●  Synkronisert</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Product → Performance</span>
                    <span className="text-ai-processing text-sm">●  Koordinerer</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Research → Compliance</span>
                    <span className="text-ai-active text-sm">●  Synkronisert</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">RedTeam → Alle</span>
                    <span className="text-stone-500 text-sm">●  Standby</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Agent Feed</CardTitle>
                <CardDescription>
                  Real-time aktivitet fra alle agenter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-active rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">🏗️ Architect</p>
                      <p className="text-stone-500">Kompletterte komponetanalyse - Living Spec Dashboard optimalisert</p>
                      <p className="text-xs text-stone-400 mt-1">2 min siden</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-processing rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">🔒 Security</p>
                      <p className="text-stone-500">Sikkerhetsscan startet - 15 endpoints under analyse</p>
                      <p className="text-xs text-stone-400 mt-1">5 min siden</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-active rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">📱 Product</p>
                      <p className="text-stone-500">Krin designsystem tokens implementert perfekt</p>
                      <p className="text-xs text-stone-400 mt-1">10 min siden</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-processing rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">🔬 Research</p>
                      <p className="text-stone-500">Analyserer nye coordination patterns for breakthrough</p>
                      <p className="text-xs text-stone-400 mt-1">15 min siden</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}