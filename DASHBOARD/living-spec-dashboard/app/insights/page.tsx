import React from 'react'
import Sidebar from '@/components/ui/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Stat from '@/components/ui/Stat'

const insights = [
  {
    id: 'team-coordination',
    title: 'AI Team Koordinering Analyse',
    summary: 'Architect og Security Agent viser optimal samarbeid med 98% synkronisering',
    category: 'Performance',
    impact: 'high',
    timestamp: '2 timer siden',
    metrics: {
      efficiency: '+15%',
      coordination: '98%',
      bottlenecks: '2 identifisert'
    }
  },
  {
    id: 'security-patterns',
    title: 'Sikkerhetsmønstre Oppdagelse',
    summary: 'Nye sårbarheter oppdaget i 3 API endpoints - Security Agent har implementert fixes',
    category: 'Security',
    impact: 'critical',
    timestamp: '4 timer siden',
    metrics: {
      vulnerabilities: '3 løst',
      coverage: '94%',
      response_time: '< 2 min'
    }
  },
  {
    id: 'performance-optimization',
    title: 'Systemytelse Optimalisering',
    summary: 'Performance Agent identifiserte 12% ytelsesgevinst gjennom bundle optimalisering',
    category: 'Optimization',
    impact: 'medium',
    timestamp: '6 timer siden',
    metrics: {
      improvement: '+12%',
      load_time: '-800ms',
      memory: '-15%'
    }
  },
  {
    id: 'user-experience',
    title: 'Brukeropplevelse Innsikter',
    summary: 'Product Agent analyserte interaksjonsmønstre og foreslår 5 UX forbedringer',
    category: 'UX',
    impact: 'medium',
    timestamp: '8 timer siden',
    metrics: {
      satisfaction: '+8%',
      completion: '92%',
      suggestions: '5 aktive'
    }
  }
]

const sidebarItems = [
  { href: '/', label: 'Oversikt' },
  { href: '/agents', label: 'AI Agenter' },
  { href: '/projects', label: 'Prosjekter' },
  { href: '/insights', label: 'Innsikter', active: true },
  { href: '/memory', label: 'Hukommelse' },
  { href: '/settings', label: 'Innstillinger' }
]

function getImpactColor(impact: string) {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[impact as keyof typeof colors] || colors.medium
}

function getCategoryColor(category: string) {
  const colors = {
    Performance: 'bg-green-100 text-green-800',
    Security: 'bg-red-100 text-red-800', 
    Optimization: 'bg-blue-100 text-blue-800',
    UX: 'bg-purple-100 text-purple-800'
  }
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export default function InsightsPage() {
  const criticalInsights = insights.filter(i => i.impact === 'critical').length
  const totalInsights = insights.length
  
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
              Innsikter
            </h1>
            <p className="editorial-subtitle">
              AI-genererte analyser og anbefalinger fra teamet
            </p>
          </div>

          {/* Insights Statistics */}
          <div className="dashboard-grid">
            <Stat
              label="Totale Innsikter"
              value={totalInsights}
              change="24t periode"
              trend="neutral"
            />
            <Stat
              label="Kritiske Funn"
              value={criticalInsights}
              change="Løst innen 2 min"
              trend="up"
            />
            <Stat
              label="Team Effektivitet"
              value="98.5%"
              change="+15% fra innsikter"
              trend="up"
            />
            <Stat
              label="Autonom Løsningsrate"
              value="87%"
              change="AI-drevet optimalisering"
              trend="up"
            />
          </div>

          {/* Insights Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Innsikt Administrasjon</CardTitle>
                  <CardDescription>
                    Generer nye analyser og eksporter rapporter
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Generer Rapport
                  </Button>
                  <Button variant="accent" size="sm">
                    Ny Analyse
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Live Insights Feed */}
          <div>
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-ink mb-1">
                Live Innsikter
              </h2>
              <p className="text-stone-500">
                Real-time analyser og anbefalinger fra AI-teamet
              </p>
            </div>

            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(insight.category)}`}>
                            {insight.category}
                          </span>
                        </div>
                        <CardDescription className="text-base leading-relaxed">
                          {insight.summary}
                        </CardDescription>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-md text-xs font-medium border ${getImpactColor(insight.impact)} ml-4`}>
                        {insight.impact === 'critical' ? 'Kritisk' :
                         insight.impact === 'high' ? 'Høy' :
                         insight.impact === 'medium' ? 'Middels' : 'Lav'}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      {/* Metrics */}
                      <div className="flex gap-6">
                        {Object.entries(insight.metrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="kicker mb-1">
                              {key === 'efficiency' ? 'Effektivitet' :
                               key === 'coordination' ? 'Koordinering' :
                               key === 'bottlenecks' ? 'Flaskehalser' :
                               key === 'vulnerabilities' ? 'Sårbarheter' :
                               key === 'coverage' ? 'Dekning' :
                               key === 'response_time' ? 'Responstid' :
                               key === 'improvement' ? 'Forbedring' :
                               key === 'load_time' ? 'Lastetid' :
                               key === 'memory' ? 'Minne' :
                               key === 'satisfaction' ? 'Tilfredshet' :
                               key === 'completion' ? 'Fullføring' :
                               key === 'suggestions' ? 'Forslag' : key}
                            </div>
                            <div className="font-medium text-ink">{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Timestamp */}
                      <div className="text-right">
                        <div className="kicker mb-1">Generert</div>
                        <div className="text-sm text-stone-600">{insight.timestamp}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trendanalyse</CardTitle>
                <CardDescription>
                  Systemytelse over tid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Team Koordinering</span>
                    <div className="flex items-center gap-2">
                      <span className="text-ai-active text-sm">📈</span>
                      <span className="text-sm font-medium">+15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sikkerhetshendelser</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-sm">📉</span>
                      <span className="text-sm font-medium">-67%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Systemresponstid</span>
                    <div className="flex items-center gap-2">
                      <span className="text-ai-active text-sm">📈</span>
                      <span className="text-sm font-medium">+22%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prediktive Anbefalinger</CardTitle>
                <CardDescription>
                  AI-drevne forbedringer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-active rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Skaleringsoptimalisering</p>
                      <p className="text-stone-500">Performance Agent foreslår container-optimalisering for 25% bedre responstid</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-processing rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Sikkerhetsforbedring</p>
                      <p className="text-stone-500">Security Agent anbefaler implementering av zero-trust arkitektur</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ai-active rounded-full mt-2"></div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">UX Optimalisering</p>
                      <p className="text-stone-500">Product Agent identifiserte 3 områder for bedre brukeropplevelse</p>
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