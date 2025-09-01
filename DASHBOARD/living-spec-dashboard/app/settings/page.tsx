import React from 'react'
import Sidebar from '@/components/ui/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  { href: '/', label: 'Oversikt' },
  { href: '/agents', label: 'AI Agenter' },
  { href: '/projects', label: 'Prosjekter' },
  { href: '/insights', label: 'Innsikter' },
  { href: '/memory', label: 'Hukommelse' },
  { href: '/settings', label: 'Innstillinger', active: true }
]

const settingsSections = [
  {
    id: 'system',
    title: 'System Konfigurasjon',
    description: 'Grunnleggende systeminnstillinger og preferanser',
    settings: [
      { key: 'dark_mode', label: 'Mørk Modus', value: 'Automatisk', type: 'select' },
      { key: 'language', label: 'Språk', value: 'Norsk (Bokmål)', type: 'select' },
      { key: 'timezone', label: 'Tidssone', value: 'Europe/Oslo', type: 'select' },
      { key: 'refresh_interval', label: 'Oppdateringsintervall', value: '30 sekunder', type: 'select' }
    ]
  },
  {
    id: 'agents',
    title: 'AI Agent Konfigurasjon',
    description: 'Innstillinger for AI-teamet og automatisering',
    settings: [
      { key: 'auto_coordination', label: 'Automatisk Koordinering', value: 'Aktivert', type: 'toggle' },
      { key: 'parallel_processing', label: 'Parallell Prosessering', value: 'Aktivert', type: 'toggle' },
      { key: 'agent_notifications', label: 'Agent Notifikasjoner', value: 'Aktivert', type: 'toggle' },
      { key: 'max_concurrent_tasks', label: 'Maks Samtidige Oppgaver', value: '7', type: 'number' }
    ]
  },
  {
    id: 'security',
    title: 'Sikkerhet & Personvern',
    description: 'Sikkerhetsinnstillinger og personvernkonfigurasjon',
    settings: [
      { key: 'two_factor', label: 'To-faktor Autentisering', value: 'Aktivert', type: 'toggle' },
      { key: 'session_timeout', label: 'Sesjons Timeout', value: '4 timer', type: 'select' },
      { key: 'data_encryption', label: 'Data Kryptering', value: 'AES-256', type: 'info' },
      { key: 'audit_logging', label: 'Audit Logging', value: 'Aktivert', type: 'toggle' }
    ]
  },
  {
    id: 'performance',
    title: 'Ytelse & Optimalisering',
    description: 'Ytelsesinnstillinger og ressursadministrasjon',
    settings: [
      { key: 'cache_duration', label: 'Cache Varighet', value: '1 time', type: 'select' },
      { key: 'compression', label: 'Data Kompresjon', value: 'Aktivert', type: 'toggle' },
      { key: 'memory_limit', label: 'Minnegrense', value: '2GB', type: 'select' },
      { key: 'cpu_threshold', label: 'CPU Terskel', value: '80%', type: 'number' }
    ]
  }
]

function getSettingInput(setting: any) {
  switch (setting.type) {
    case 'toggle':
      return (
        <div className="flex items-center">
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
            setting.value === 'Aktivert' ? 'bg-ai-active' : 'bg-stone-300'
          }`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              setting.value === 'Aktivert' ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </div>
          <span className="ml-3 text-sm text-ink">{setting.value}</span>
        </div>
      )
    case 'select':
      return (
        <select className="px-3 py-2 border border-stone-200 rounded-md bg-white text-ink focus:ring-2 focus:ring-ai-active focus:border-transparent">
          <option value={setting.value}>{setting.value}</option>
        </select>
      )
    case 'number':
      return (
        <input 
          type="number" 
          defaultValue={setting.value}
          className="px-3 py-2 border border-stone-200 rounded-md bg-white text-ink focus:ring-2 focus:ring-ai-active focus:border-transparent w-24"
        />
      )
    case 'info':
      return (
        <span className="px-3 py-2 bg-stone-100 text-stone-700 rounded-md text-sm font-medium">
          {setting.value}
        </span>
      )
    default:
      return (
        <input 
          type="text" 
          defaultValue={setting.value}
          className="px-3 py-2 border border-stone-200 rounded-md bg-white text-ink focus:ring-2 focus:ring-ai-active focus:border-transparent"
        />
      )
  }
}

export default function SettingsPage() {
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
              Innstillinger
            </h1>
            <p className="editorial-subtitle">
              Konfigurer systemet og personaliser din opplevelse
            </p>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Administrasjon</CardTitle>
                  <CardDescription>
                    Hurtighandlinger og systemverktøy
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Eksporter Konfigurasjon
                  </Button>
                  <Button variant="outline" size="sm">
                    System Rapport
                  </Button>
                  <Button variant="accent" size="sm">
                    Lagre Endringer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="ghost" size="sm" className="justify-start">
                  🔄 Restart Agenter
                </Button>
                <Button variant="ghost" size="sm" className="justify-start">
                  📊 Ytelsesrapport
                </Button>
                <Button variant="ghost" size="sm" className="justify-start">
                  🔒 Sikkerhetsscan
                </Button>
                <Button variant="ghost" size="sm" className="justify-start">
                  💾 Backup System
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingsSections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription className="text-base">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {section.settings.map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-b-0">
                        <div className="flex-1">
                          <div className="font-medium text-ink mb-1">
                            {setting.label}
                          </div>
                          {setting.key === 'data_encryption' && (
                            <div className="text-sm text-stone-500">
                              Kryptering av alle data i transit og hvile
                            </div>
                          )}
                          {setting.key === 'auto_coordination' && (
                            <div className="text-sm text-stone-500">
                              Tillat AI-agenter å koordinere automatisk
                            </div>
                          )}
                          {setting.key === 'parallel_processing' && (
                            <div className="text-sm text-stone-500">
                              Kjør flere oppgaver samtidig for bedre ytelse
                            </div>
                          )}
                          {setting.key === 'two_factor' && (
                            <div className="text-sm text-stone-500">
                              Ekstra sikkerhetslag for pålogging
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-6">
                          {getSettingInput(setting)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Informasjon</CardTitle>
              <CardDescription>
                Tekniske detaljer og systemstatus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="kicker mb-2">Version</div>
                  <div className="font-medium text-ink">Living Spec v2.1.0</div>
                </div>
                <div>
                  <div className="kicker mb-2">Runtime</div>
                  <div className="font-medium text-ink">Bun v1.2.21</div>
                </div>
                <div>
                  <div className="kicker mb-2">Next.js</div>
                  <div className="font-medium text-ink">v14.2.32</div>
                </div>
                <div>
                  <div className="kicker mb-2">Database</div>
                  <div className="font-medium text-ink">PostgreSQL 15</div>
                </div>
                <div>
                  <div className="kicker mb-2">Oppetid</div>
                  <div className="font-medium text-ink">7 dager, 14t</div>
                </div>
                <div>
                  <div className="kicker mb-2">CPU Bruk</div>
                  <div className="font-medium text-ink">23%</div>
                </div>
                <div>
                  <div className="kicker mb-2">Minnebruk</div>
                  <div className="font-medium text-ink">1.2GB / 4GB</div>
                </div>
                <div>
                  <div className="kicker mb-2">Disk Bruk</div>
                  <div className="font-medium text-ink">8.4GB / 50GB</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Utviklerverktøy</CardTitle>
              <CardDescription>
                Verktøy for debugging og systemutvikling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-ink">Debug Modus</div>
                    <div className="text-sm text-stone-500">Aktiver detaljert logging og feilsøking</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-6 rounded-full p-1 bg-stone-300">
                      <div className="w-4 h-4 rounded-full bg-white" />
                    </div>
                    <span className="ml-3 text-sm text-ink">Deaktivert</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-ink">API Logging</div>
                    <div className="text-sm text-stone-500">Logg alle API-forespørsler og responser</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-6 rounded-full p-1 bg-ai-active">
                      <div className="w-4 h-4 rounded-full bg-white translate-x-6" />
                    </div>
                    <span className="ml-3 text-sm text-ink">Aktivert</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" size="sm">
                    Vis Logger
                  </Button>
                  <Button variant="outline" size="sm">
                    Eksporter Logs
                  </Button>
                  <Button variant="outline" size="sm">
                    System Diagnostikk
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}