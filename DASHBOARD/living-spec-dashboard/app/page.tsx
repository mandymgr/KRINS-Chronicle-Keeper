import React from 'react'
import Sidebar from '@/components/ui/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Stat from '@/components/ui/Stat'
import AgentStatusCard from '@/components/dashboard/AgentStatusCard'
import { Button } from '@/components/ui/button'

// Mock data for AI agents
const mockAgents = [
  {
    id: 'architect',
    name: 'Architect Agent',
    role: 'System Architecture & Design',
    status: 'active' as const,
    lastActivity: '2 min siden',
    tasksCompleted: 12,
    currentTask: 'Analyserer Living Spec Dashboard arkitektur'
  },
  {
    id: 'security',
    name: 'Security Agent',
    role: 'Cybersecurity & Penetration Testing',
    status: 'processing' as const,
    lastActivity: '5 min siden',
    tasksCompleted: 8,
    currentTask: 'Kjører sikkerhetsscan på API endpoints'
  },
  {
    id: 'performance',
    name: 'Performance Agent',
    role: 'Performance Optimization',
    status: 'inactive' as const,
    lastActivity: '1t siden',
    tasksCompleted: 15,
  },
  {
    id: 'product',
    name: 'Product Agent',
    role: 'UX/UI & User Experience',
    status: 'active' as const,
    lastActivity: '10 min siden',
    tasksCompleted: 9,
    currentTask: 'Optimaliserer Krin designsystem implementering'
  }
]

const sidebarItems = [
  { href: '/', label: 'Oversikt', active: true },
  { href: '/agents', label: 'AI Agenter' },
  { href: '/projects', label: 'Prosjekter' },
  { href: '/insights', label: 'Innsikter' },
  { href: '/memory', label: 'Hukommelse' },
  { href: '/settings', label: 'Innstillinger' }
]

export default function DashboardPage() {
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
              Oversikt
            </h1>
            <p className="editorial-subtitle">
              Live status for AI-team koordinering og systemytelse
            </p>
          </div>

          {/* KPI Stats */}
          <div className="dashboard-grid">
            <Stat
              label="Aktive Agenter"
              value="4/7"
              change="+2"
              trend="up"
            />
            <Stat
              label="Oppgaver I dag"
              value="23"
              change="+15"
              trend="up"
            />
            <Stat
              label="System Ytelse"
              value="98.5%"
              change="Normal"
              trend="neutral"
            />
            <Stat
              label="Hukommelse Brukt"
              value="1.2GB"
              change="85%"
              trend="neutral"
            />
          </div>

          {/* AI Agents Status */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl text-ink mb-1">
                  AI Agenter
                </h2>
                <p className="text-stone-500">
                  Live status for Krin's Superintelligence Team
                </p>
              </div>
              <Button variant="outline" size="sm">
                Oppfrisk Status
              </Button>
            </div>

            <div className="dashboard-grid">
              {mockAgents.map((agent) => (
                <AgentStatusCard 
                  key={agent.id} 
                  agent={agent} 
                />
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Systemhelse</CardTitle>
                <CardDescription>
                  Live metriker fra alle komponenter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">RAG System</span>
                    <span className="text-ai-active text-sm">●  Operativ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PostgreSQL</span>
                    <span className="text-ai-active text-sm">●  Operativ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Socket.IO</span>
                    <span className="text-ai-processing text-sm">●  Synkroniserer</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bundle Manager</span>
                    <span className="text-ai-active text-sm">●  Operativ</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Siste Aktivitet</CardTitle>
                <CardDescription>
                  Nylige handlinger fra AI-teamet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-active rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Architect Agent</p>
                      <p className="text-stone-500">Fullførte arkitektur analyse av dashboard komponenter</p>
                      <p className="text-xs text-stone-400 mt-1">2 minutter siden</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-processing rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Security Agent</p>
                      <p className="text-stone-500">Startet sikkerhetsscan av nye API endpoints</p>
                      <p className="text-xs text-stone-400 mt-1">5 minutter siden</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-active rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Product Agent</p>
                      <p className="text-stone-500">Implementerte Krin designsystem tokens</p>
                      <p className="text-xs text-stone-400 mt-1">10 minutter siden</p>
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