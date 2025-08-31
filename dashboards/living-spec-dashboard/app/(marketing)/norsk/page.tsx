import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/KpiCard';
import {
  getProjectMetadata,
  getKpiMetrics,
  getRoadmapPhases,
  getTasks,
  getTechStack,
  getRisks,
  getChangelogEntries,
  getArchitectureDecisionRecords,
} from '@/lib/data';
import { formatDate, getStatusColor, calculateProgress } from '@/lib/utils';

export default function NorskDashboard() {
  // Last inn alle data for dashboardet
  const project = getProjectMetadata();
  const kpis = getKpiMetrics();
  const roadmapPhases = getRoadmapPhases();
  const tasks = getTasks();
  const techStack = getTechStack();
  const risks = getRisks();
  const changelog = getChangelogEntries(5);
  const adrs = getArchitectureDecisionRecords();

  // Beregn omfattende statistikker
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const totalTasks = tasks.length;
  const taskProgress = calculateProgress(completedTasks, totalTasks);

  const activeTech = techStack.filter(tech => tech.status === 'active');
  const plannedTech = techStack.filter(tech => tech.status === 'planned');
  const deprecatedTech = techStack.filter(tech => tech.status === 'deprecated');

  const highRisks = risks.filter(risk => risk.probability >= 4 || risk.impact >= 4);
  const mediumRisks = risks.filter(risk => (risk.probability === 3 || risk.impact === 3) && !highRisks.includes(risk));
  const lowRisks = risks.filter(risk => risk.probability <= 2 && risk.impact <= 2);

  const completedPhases = roadmapPhases.filter(phase => phase.status === 'completed');
  const currentPhase = roadmapPhases.find(phase => phase.status === 'in-progress');

  const getPhaseColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'default';
      case 'planned': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '✅ Ferdig';
      case 'in-progress': return '🚀 Aktiv';
      case 'planned': return '📋 Planlagt';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Forbedret hode */}
      <header className="mb-12 text-center animate-fade-in">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="text-6xl">🚀</div>
          <div>
            <h1 className="text-5xl font-bold text-nordic-black dark:text-nordic-off-white">
              {project.name}
            </h1>
            <div className="flex items-center justify-center space-x-3 mt-2">
              <Badge variant={getPhaseColor(project.phase.toLowerCase())} className="text-lg px-4 py-2">
                Fase: {project.phase === 'Build' ? 'Bygging' : project.phase}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                v{project.version}
              </Badge>
            </div>
          </div>
        </div>
        
        <p className="text-xl text-nordic-medium-gray max-w-4xl mx-auto text-balance leading-relaxed mb-8">
          Revolusjonere hvordan utviklingsteam sporer, visualiserer og kommuniserer prosjektstatus gjennom intelligente, sanntids dashbord som eliminerer informasjonssiloer og akselererer beslutningstaking.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-sm">
          <div className="flex flex-col items-center p-4 bg-nordic-mist dark:bg-nordic-charcoal rounded-lg">
            <span className="font-semibold text-nordic-ocean">Teamleder</span>
            <span className="text-lg">{project.team.lead}</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-nordic-mist dark:bg-nordic-charcoal rounded-lg">
            <span className="font-semibold text-nordic-ocean">Forventet lansering</span>
            <span className="text-lg">{project.expectedLaunch ? formatDate(project.expectedLaunch) : 'Ikke bestemt'}</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-nordic-mist dark:bg-nordic-charcoal rounded-lg">
            <span className="font-semibold text-nordic-ocean">Teamstørrelse</span>
            <span className="text-lg">{project.team.members.length} medlemmer</span>
          </div>
        </div>
      </header>

      {/* Forbedret KPI-seksjon */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
            📊 Ytelsesdashboard
          </h2>
          <Badge variant="outline" className="text-sm">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Suspense fallback={<div className="animate-pulse bg-nordic-light-gray rounded-2xl h-48"></div>}>
            {kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </Suspense>
        </div>
      </section>

      {/* Forbedret fremgangsoversikt */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-nordic-black dark:text-nordic-off-white">
          🎯 Prosjektfremgangsoversikt
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{taskProgress}%</div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Oppgaver fullført</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${taskProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                {completedTasks} fullført • {inProgressTasks} pågående • {totalTasks - completedTasks - inProgressTasks} ventende
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-green-600 mb-2">{activeTech.length}</div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Aktive teknologier</p>
              <div className="flex justify-center space-x-1 mt-3">
                <Badge size="sm" variant="outline" className="text-xs">{activeTech.length} Aktiv</Badge>
                <Badge size="sm" variant="outline" className="text-xs">{plannedTech.length} Planlagt</Badge>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                {deprecatedTech.length} utdaterte teknologier
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-amber-600 mb-2">{highRisks.length}</div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Høyprioritet risikoer</p>
              <div className="flex justify-center space-x-1 mt-3">
                <Badge size="sm" className="bg-red-100 text-red-800 text-xs">{highRisks.length} Høy</Badge>
                <Badge size="sm" className="bg-yellow-100 text-yellow-800 text-xs">{mediumRisks.length} Middels</Badge>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                {lowRisks.length} lavrisiko risikoer sporet
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">{completedPhases.length}/{roadmapPhases.length}</div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Faser fullført</p>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(completedPhases.length / roadmapPhases.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">
                Nåværende: {currentPhase?.name === 'Foundation & MVP' ? 'Grunnlag & MVP' : 
                           currentPhase?.name === 'Enhanced Features' ? 'Utvidede funksjoner' :
                           currentPhase?.name === 'Production & Scale' ? 'Produksjon & Skalering' :
                           currentPhase?.name || 'Planlegging'}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Forbedret veikart */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-nordic-black dark:text-nordic-off-white">
          🗺️ Utviklingsveiplan
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roadmapPhases.map((phase, index) => (
            <Card key={phase.id} className={`animate-slide-up hover:shadow-lg transition-all duration-300 ${
              phase.status === 'completed' ? 'border-green-200 bg-green-50 dark:bg-green-900/10' :
              phase.status === 'in-progress' ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10 ring-2 ring-blue-200' :
              'border-gray-200 bg-gray-50 dark:bg-gray-900/10'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-nordic-ocean text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg">
                      {phase.name === 'Foundation & MVP' ? 'Grunnlag & MVP' :
                       phase.name === 'Enhanced Features' ? 'Utvidede funksjoner' :
                       phase.name === 'Production & Scale' ? 'Produksjon & skalering' :
                       phase.name}
                    </CardTitle>
                  </div>
                  <Badge variant={getPhaseColor(phase.status)}>
                    {getStatusText(phase.status)}
                  </Badge>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {phase.description === 'Establish core dashboard infrastructure and basic visualizations' ? 
                   'Etabler kjernedashboard-infrastruktur og grunnleggende visualiseringer' :
                   phase.description === 'Add advanced features, integrations, and user customization options' ?
                   'Legg til avanserte funksjoner, integrasjoner og brukertilpasningsalternativer' :
                   phase.description === 'Deploy to production, scale infrastructure, and monitor performance' ?
                   'Distribuer til produksjon, skaler infrastruktur og overvåk ytelse' :
                   phase.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-nordic-medium-gray mb-2">
                      <span className="font-semibold">📅 Tidslinje:</span>
                    </div>
                    <div className="text-sm">
                      {formatDate(phase.startDate)} → {phase.endDate ? formatDate(phase.endDate) : 'Pågående'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 text-sm font-semibold mb-3">
                      <span>🎯 Hovedmilepæler:</span>
                    </div>
                    <div className="space-y-2">
                      {phase.milestones.slice(0, 3).map((milestone) => (
                        <div key={milestone.id} className="flex items-start space-x-3 text-sm">
                          <Badge size="sm" className={`${getStatusColor(milestone.status)} flex-shrink-0 mt-0.5`}>
                            {milestone.status === 'completed' ? '✅' : 
                             milestone.status === 'in-progress' ? '🔄' : '⏳'}
                          </Badge>
                          <div>
                            <p className="font-medium">
                              {milestone.title === 'Core Dashboard Framework' ? 'Kjernedashboard rammeverk' :
                               milestone.title === 'KPI Visualization System' ? 'KPI visualiseringssystem' :
                               milestone.title === 'User Authentication & Access Control' ? 'Brukerauthentisering & tilgangskontroll' :
                               milestone.title === 'Data Integration Pipeline' ? 'Data integrasjonspipeline' :
                               milestone.title === 'GitHub & GitLab Integration' ? 'GitHub & GitLab integrasjon' :
                               milestone.title === 'Slack & Teams Notifications' ? 'Slack & Teams varsler' :
                               milestone.title === 'Custom Dashboard Builder' ? 'Tilpasset dashboard builder' :
                               milestone.title === 'Advanced Analytics & Reporting' ? 'Avansert analyse & rapportering' :
                               milestone.title === 'Production Deployment' ? 'Produksjonsdistribusjon' :
                               milestone.title === 'Performance Monitoring' ? 'Ytelseovervåking' :
                               milestone.title === 'Auto-scaling Infrastructure' ? 'Auto-skalering infrastruktur' :
                               milestone.title === 'User Onboarding & Documentation' ? 'Brukeropplæring & dokumentasjon' :
                               milestone.title}
                            </p>
                            <p className="text-xs text-nordic-medium-gray">{milestone.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 text-sm font-semibold mb-3">
                      <span>✨ Suksesskriterier:</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {phase.exitCriteria.slice(0, 3).map((criteria, idx) => (
                        <li key={idx} className="text-nordic-medium-gray flex items-start space-x-2">
                          <span className="text-nordic-ocean font-medium">•</span>
                          <span>{criteria.replace(/^✅\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Teaminformasjon */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-nordic-black dark:text-nordic-off-white">
          👥 Team & interessenter
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🚀</span>
                <span>Kjerneteam</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.team.members.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-nordic-mist dark:bg-nordic-charcoal">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-nordic-ocean text-white font-bold">
                      {member.split(' ')[0][0]}
                    </div>
                    <div>
                      <p className="font-medium">{member.split(' (')[0]}</p>
                      {member.includes('(') && (
                        <p className="text-xs text-nordic-medium-gray">
                          {member.includes('Tech Lead') ? 'Teknisk leder & AI-koordinator' :
                           member.includes('Product Owner') ? 'Produkteier & design' :
                           member.includes('AI Development Assistant') ? 'AI utviklingsassistent' :
                           member.includes('Frontend Specialist') ? 'Frontend spesialist AI' :
                           member.includes('Backend Specialist') ? 'Backend spesialist AI' :
                           member.includes('Testing Specialist') ? 'Test spesialist AI' :
                           member.split('(')[1]?.replace(')', '')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Nøkkelinteressenter</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.team.stakeholders.map((stakeholder, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-nordic-mist dark:bg-nordic-charcoal">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-nordic-sage text-white font-bold">
                      {stakeholder[0]}
                    </div>
                    <p className="font-medium">
                      {stakeholder === 'Development Teams' ? 'Utviklingsteam' :
                       stakeholder === 'Project Managers' ? 'Prosjektledere' :
                       stakeholder === 'Engineering Leadership' ? 'Teknisk ledelse' :
                       stakeholder === 'Product Organizations' ? 'Produktorganisasjoner' :
                       stakeholder}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Nylig aktivitet med mer detaljer */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-nordic-black dark:text-nordic-off-white">
          📋 Nylig aktivitet & beslutninger
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Forbedret endringslogg */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📝</span>
                <span>Siste oppdateringer</span>
              </CardTitle>
              <CardDescription>Nylige endringer og forbedringer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changelog.map((entry, index) => (
                  <div key={index} className="border-l-4 border-nordic-ocean pl-4 pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge size="sm" variant="outline" className="font-mono">v{entry.version}</Badge>
                      <span className="text-sm text-nordic-medium-gray">{formatDate(entry.date)}</span>
                    </div>
                    <h4 className="font-semibold text-base">{entry.title}</h4>
                    {entry.description && (
                      <p className="text-sm text-nordic-medium-gray mt-1 leading-relaxed">{entry.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Forbedrede arkitekturbeslutninger */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🏗️</span>
                <span>Arkitekturbeslutninger</span>
              </CardTitle>
              <CardDescription>Viktige tekniske beslutninger og begrunnelse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adrs.slice(0, 4).map((adr) => (
                  <div key={adr.id} className="border-b border-nordic-light-gray last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium text-nordic-ocean">{adr.id}</span>
                      <Badge size="sm" className={getStatusColor(adr.status)}>
                        {adr.status === 'accepted' ? 'Godkjent' :
                         adr.status === 'proposed' ? 'Foreslått' :
                         adr.status === 'rejected' ? 'Avvist' :
                         adr.status}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{adr.title}</h4>
                    <p className="text-xs text-nordic-medium-gray">
                      Av {adr.author} • {formatDate(adr.date)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Integrasjonsstatus merknad */}
      <section className="mb-12">
        <Card className="border-dashed border-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔌</span>
              <span>Sanntidsintegrasjoner tilgjengelig</span>
            </CardTitle>
            <CardDescription className="text-base">
              Dette dashboardet støtter sanntidsdata fra GitHub og Jira. Viser for øyeblikket statisk demonstrasjonsdata.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white dark:bg-gray-800 border">
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-medium">GitHub-integrasjon</p>
                  <p className="text-sm text-gray-600">Sanntids commits, utgivelser, milepæler</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white dark:bg-gray-800 border">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-medium">Jira-integrasjon</p>
                  <p className="text-sm text-gray-600">Sanntids saker og prosjektdata</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Forbedret bunntekst */}
      <footer className="text-center border-t border-nordic-light-gray pt-8 dark:border-nordic-medium-gray">
        <div className="mb-6">
          <p className="text-lg font-medium mb-2">Bygget med ❤️ av {project.team.lead}-teamet</p>
          <p className="text-sm text-nordic-medium-gray">Sist oppdatert: {formatDate(new Date().toISOString())}</p>
        </div>
        
        <div className="flex justify-center space-x-8 mb-6">
          <a href={project.contact.repository} className="flex items-center space-x-2 hover:text-nordic-ocean transition-colors">
            <span className="text-xl">🐙</span>
            <span>Repository</span>
          </a>
          <a href={`mailto:${project.contact.email}`} className="flex items-center space-x-2 hover:text-nordic-ocean transition-colors">
            <span className="text-xl">📧</span>
            <span>Kontakt</span>
          </a>
          {project.contact.slack && (
            <a href="#" className="flex items-center space-x-2 hover:text-nordic-ocean transition-colors">
              <span className="text-xl">💬</span>
              <span>{project.contact.slack}</span>
            </a>
          )}
        </div>
        
        <div className="text-sm text-nordic-medium-gray">
          <p className="mb-2">🚀 <a href="/enhanced" className="text-nordic-ocean hover:underline">Utvidet Dashboard</a> | 📋 <a href="/simple" className="text-nordic-ocean hover:underline">Enkel versjon</a></p>
          <p>🇳🇴 Norsk Dashboard (Gjeldende) | 🇺🇸 <a href="/enhanced" className="text-nordic-ocean hover:underline">English Version</a></p>
        </div>
      </footer>
    </div>
  );
}