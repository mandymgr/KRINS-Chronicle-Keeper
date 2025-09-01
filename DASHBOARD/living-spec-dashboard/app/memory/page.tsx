import React from 'react'
import Sidebar from '@/components/ui/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Stat from '@/components/ui/Stat'

const memoryEntries = [
  {
    id: 'krin-personality',
    title: 'Krin Personalitet & Designsystem',
    content: 'Komplett implementering av Krin Bun UI designsystem med Kinfolk/RUM-inspirert typografi. Premium Inter + Playfair Display fonts integrert.',
    category: 'Design',
    importance: 'critical',
    timestamp: '2 min siden',
    tags: ['UI/UX', 'Typography', 'Krin', 'Editorial']
  },
  {
    id: 'ai-coordination',
    title: 'Multi-Agent Koordinering',
    content: 'Superintelligence Team med 7 spesialiserte AI-agenter: Architect, Security, Performance, Product, Compliance, Research, RedTeam. Optimal samarbeidspatterns etablert.',
    category: 'Architecture',
    importance: 'high',
    timestamp: '15 min siden',
    tags: ['AI', 'Coordination', 'Team', 'Architecture']
  },
  {
    id: 'dashboard-implementation',
    title: 'Living Spec Dashboard Arkitektur',
    content: 'Next.js 14 med Bun runtime, Tailwind CSS med custom tokens, TypeScript med strenge konfigurasjoner. Real-time agent status og system monitoring.',
    category: 'Implementation',
    importance: 'high',
    timestamp: '1 time siden',
    tags: ['Next.js', 'Bun', 'TypeScript', 'Dashboard']
  },
  {
    id: 'security-patterns',
    title: 'Sikkerhetsmønstre & Best Practices',
    content: 'Security Agent implementerte zero-trust prinsipper, API endpoint scanning, og real-time vulnerability detection. 98% sikkerheitsdekning oppnådd.',
    category: 'Security',
    importance: 'critical',
    timestamp: '2 timer siden',
    tags: ['Security', 'Zero-Trust', 'API', 'Monitoring']
  },
  {
    id: 'performance-optimization',
    title: 'Ytelsesoptimaliseringer',
    content: 'Bundle-optimalisering ga 12% ytelsesgevinst, reduserte lastetid med 800ms og minnebruk med 15%. Performance Agent etablerte kontinuerlig monitoring.',
    category: 'Performance',
    importance: 'medium',
    timestamp: '4 timer siden',
    tags: ['Performance', 'Bundle', 'Optimization', 'Monitoring']
  }
]

const sidebarItems = [
  { href: '/', label: 'Oversikt' },
  { href: '/agents', label: 'AI Agenter' },
  { href: '/projects', label: 'Prosjekter' },
  { href: '/insights', label: 'Innsikter' },
  { href: '/memory', label: 'Hukommelse', active: true },
  { href: '/settings', label: 'Innstillinger' }
]

function getImportanceColor(importance: string) {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[importance as keyof typeof colors] || colors.medium
}

function getCategoryIcon(category: string) {
  const icons = {
    Design: '🎨',
    Architecture: '🏗️',
    Implementation: '⚡',
    Security: '🔒',
    Performance: '📊'
  }
  return icons[category as keyof typeof icons] || '📝'
}

export default function MemoryPage() {
  const totalEntries = memoryEntries.length
  const criticalEntries = memoryEntries.filter(e => e.importance === 'critical').length
  const todayEntries = memoryEntries.filter(e => e.timestamp.includes('min') || e.timestamp.includes('time')).length
  
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
              Hukommelse
            </h1>
            <p className="editorial-subtitle">
              Krin's kollektive hukommelse og læring fra alle prosjekter
            </p>
          </div>

          {/* Memory Statistics */}
          <div className="dashboard-grid">
            <Stat
              label="Totale Minner"
              value={totalEntries}
              change="Akkumulert kunnskap"
              trend="neutral"
            />
            <Stat
              label="Kritiske Innsikter"
              value={criticalEntries}
              change="Høy prioritet"
              trend="up"
            />
            <Stat
              label="I dag Lagret"
              value={todayEntries}
              change="Nye lærdommer"
              trend="up"
            />
            <Stat
              label="Hukommelse Kapasitet"
              value="1.2GB"
              change="85% utnyttet"
              trend="neutral"
            />
          </div>

          {/* Memory Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hukommelse Administrasjon</CardTitle>
                  <CardDescription>
                    Søk, organisér og administrer kollektiv kunnskap
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Søk Minner
                  </Button>
                  <Button variant="outline" size="sm">
                    Eksporter
                  </Button>
                  <Button variant="accent" size="sm">
                    Nytt Minne
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm">
                  Filtrer etter Kategori
                </Button>
                <Button variant="ghost" size="sm">
                  Sorter etter Relevans
                </Button>
                <Button variant="ghost" size="sm">
                  Semantisk Søk
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Memory Entries */}
          <div>
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-ink mb-1">
                Kollektiv Hukommelse
              </h2>
              <p className="text-stone-500">
                Organisert kunnskap og lærdommer fra alle AI-agenter
              </p>
            </div>

            <div className="space-y-4">
              {memoryEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getCategoryIcon(entry.category)}</span>
                          <CardTitle className="text-lg">{entry.title}</CardTitle>
                        </div>
                        <CardDescription className="text-base leading-relaxed">
                          {entry.content}
                        </CardDescription>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-md text-xs font-medium border ${getImportanceColor(entry.importance)} ml-4`}>
                        {entry.importance === 'critical' ? 'Kritisk' :
                         entry.importance === 'high' ? 'Høy' :
                         entry.importance === 'medium' ? 'Middels' : 'Lav'}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="kicker mb-1">Kategori</div>
                          <div className="text-sm font-medium text-ink">{entry.category}</div>
                        </div>
                        <div>
                          <div className="kicker mb-1">Lagret</div>
                          <div className="text-sm text-stone-600">{entry.timestamp}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Memory Analytics */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kunnskaps Kategorier</CardTitle>
                <CardDescription>
                  Fordeling av lagret kunnskap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">🎨 Design & UX</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-stone-200 rounded-full h-2">
                        <div className="bg-ai-active h-2 rounded-full" style={{ width: '85%' }}/>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">🏗️ Arkitektur</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-stone-200 rounded-full h-2">
                        <div className="bg-ai-processing h-2 rounded-full" style={{ width: '72%' }}/>
                      </div>
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">🔒 Sikkerhet</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-stone-200 rounded-full h-2">
                        <div className="bg-ai-active h-2 rounded-full" style={{ width: '94%' }}/>
                      </div>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">📊 Ytelse</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-stone-200 rounded-full h-2">
                        <div className="bg-ai-processing h-2 rounded-full" style={{ width: '68%' }}/>
                      </div>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Semantisk Søk</CardTitle>
                <CardDescription>
                  AI-drevet kunnskaps gjenfinning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-active rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">RAG-system Integration</p>
                      <p className="text-stone-500">Semantisk søk gjennom hele hukommelsesbasen</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-processing rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Automatisk Kategorisering</p>
                      <p className="text-stone-500">AI klassifiserer og organiserer nye minner</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-active rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Intelligent Sammendrag</p>
                      <p className="text-stone-500">Automatisk generering av konsise sammendrag</p>
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