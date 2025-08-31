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
import { CalendarDays, Users, Target, Zap, Shield, Database, Code, TestTube2, Layers, GitBranch, TrendingUp, AlertTriangle, CheckCircle, Clock, Star, Activity, Cpu, HardDrive, Network } from 'lucide-react';

export default function UltimateDashboard() {
  // Last all data for comprehensive dashboard
  const project = getProjectMetadata();
  const kpis = getKpiMetrics();
  const roadmapPhases = getRoadmapPhases();
  const tasks = getTasks();
  const techStack = getTechStack();
  const risks = getRisks();
  const changelog = getChangelogEntries(10);
  const adrs = getArchitectureDecisionRecords();

  // Comprehensive statistics calculations
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const backlogTasks = tasks.filter(task => task.status === 'backlog').length;
  const totalTasks = tasks.length;
  const taskProgress = calculateProgress(completedTasks, totalTasks);

  const activeTech = techStack.filter(tech => tech.status === 'active');
  const plannedTech = techStack.filter(tech => tech.status === 'planned');
  
  const highRisks = risks.filter(risk => risk.probability >= 4 || risk.impact >= 4);
  const mediumRisks = risks.filter(risk => (risk.probability === 3 && risk.impact >= 3) || (risk.impact === 3 && risk.probability >= 3));
  const lowRisks = risks.filter(risk => risk.probability < 3 && risk.impact < 3);

  const completedPhases = roadmapPhases.filter(phase => phase.status === 'completed');
  const inProgressPhases = roadmapPhases.filter(phase => phase.status === 'in-progress');

  // Team statistics
  const totalTeamMembers = project.team.members.length;
  const totalStakeholders = project.team.stakeholders.length;

  // Technology categories
  const frontendTech = techStack.filter(tech => tech.category === 'frontend');
  const backendTech = techStack.filter(tech => tech.category === 'backend');
  const databaseTech = techStack.filter(tech => tech.category === 'database');
  const devopsTech = techStack.filter(tech => tech.category === 'devops');
  const testingTech = techStack.filter(tech => tech.category === 'testing');
  const designTech = techStack.filter(tech => tech.category === 'design');
  const observabilityTech = techStack.filter(tech => tech.category === 'observability');

  const getPhaseColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'default';
      case 'planned': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskLevel = (risk: any) => {
    const score = risk.probability * risk.impact;
    if (score >= 16) return { level: 'Kritisk', color: 'bg-red-500', textColor: 'text-red-700' };
    if (score >= 12) return { level: 'Høy', color: 'bg-orange-500', textColor: 'text-orange-700' };
    if (score >= 6) return { level: 'Middels', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { level: 'Lav', color: 'bg-green-500', textColor: 'text-green-700' };
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-[1400px]">
      {/* Ultimate Header with Comprehensive Project Information */}
      <header className="mb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nordic-ocean/5 via-nordic-sage/5 to-nordic-forest/5 p-12 border border-nordic-light-gray/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-nordic-ocean to-nordic-sage flex items-center justify-center text-white text-2xl font-bold">
                  {project.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-nordic-black dark:text-nordic-off-white mb-2">
                    {project.name}
                  </h1>
                  <p className="text-xl text-nordic-medium-gray mb-4 max-w-4xl">
                    {project.mission}
                  </p>
                  <div className="flex items-center space-x-4">
                    <Badge variant={getPhaseColor(project.phase.toLowerCase())} className="text-lg px-4 py-2">
                      🚀 {project.phase}
                    </Badge>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      📦 v{project.version}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Project Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="flex items-center space-x-3">
                <CalendarDays className="w-5 h-5 text-nordic-ocean" />
                <div>
                  <p className="text-sm font-medium text-nordic-medium-gray">Prosjektstart</p>
                  <p className="font-semibold">{formatDate(project.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-nordic-sage" />
                <div>
                  <p className="text-sm font-medium text-nordic-medium-gray">Forventet lansering</p>
                  <p className="font-semibold">{project.expectedLaunch ? formatDate(project.expectedLaunch) : 'TBD'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-nordic-forest" />
                <div>
                  <p className="text-sm font-medium text-nordic-medium-gray">Teamleder</p>
                  <p className="font-semibold">{project.team.lead}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-nordic-error" />
                <div>
                  <p className="text-sm font-medium text-nordic-medium-gray">Repository</p>
                  <p className="font-semibold">GitHub</p>
                </div>
              </div>
            </div>

            {/* Quick Project Health Overview */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-white/50 dark:bg-nordic-black/20 rounded-xl border">
                <div className="text-2xl font-bold text-nordic-ocean">{taskProgress}%</div>
                <p className="text-sm text-nordic-medium-gray">Oppgaver fullført</p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-nordic-black/20 rounded-xl border">
                <div className="text-2xl font-bold text-nordic-success">{activeTech.length}</div>
                <p className="text-sm text-nordic-medium-gray">Aktive teknologier</p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-nordic-black/20 rounded-xl border">
                <div className="text-2xl font-bold text-nordic-forest">{totalTeamMembers}</div>
                <p className="text-sm text-nordic-medium-gray">Teammedlemmer</p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-nordic-black/20 rounded-xl border">
                <div className="text-2xl font-bold text-nordic-sage">{completedPhases.length}/{roadmapPhases.length}</div>
                <p className="text-sm text-nordic-medium-gray">Faser fullført</p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-nordic-black/20 rounded-xl border">
                <div className="text-2xl font-bold text-nordic-warning">{highRisks.length}</div>
                <p className="text-sm text-nordic-medium-gray">Høy-risiko elementer</p>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-nordic-black/20 rounded-xl border">
                <div className="text-2xl font-bold text-nordic-error">{adrs.length}</div>
                <p className="text-sm text-nordic-medium-gray">Arkitekturbeslutninger</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Comprehensive KPI Dashboard */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nordic-ocean to-nordic-sage flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
                📊 Nøkkelytelsesmålinger (KPIs)
              </h2>
              <p className="text-nordic-medium-gray">Omfattende prosjektmålinger og trender</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Suspense fallback={<div className="animate-pulse bg-nordic-light-gray rounded-2xl h-48"></div>}>
            {kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </Suspense>
        </div>
      </section>

      {/* Comprehensive Team & Stakeholder Information */}
      <section className="mb-16">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nordic-forest to-nordic-sage flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
              👥 Team og Interessenter
            </h2>
            <p className="text-nordic-medium-gray">Komplett oversikt over prosjektteam og interessenter</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Core Team */}
          <Card className="border-2 border-nordic-light-gray">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-nordic-forest text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span>Kjerneteam ({totalTeamMembers} medlemmer)</span>
              </CardTitle>
              <CardDescription>Direkte prosjektmedarbeidere med daglig involering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.team.members.map((member, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-xl border border-nordic-light-gray bg-gradient-to-r from-white to-nordic-light-gray/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nordic-ocean to-nordic-sage text-white flex items-center justify-center font-medium">
                      {member.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{member}</p>
                      <p className="text-sm text-nordic-medium-gray">
                        {member.includes('Lead') ? 'Teknisk leder og koordinator' :
                         member.includes('Product') ? 'Produkteier og design' :
                         member.includes('Claude') ? 'AI utviklingsassistent' :
                         member.includes('Frontend') ? 'Frontend spesialist' :
                         member.includes('Backend') ? 'Backend spesialist' :
                         member.includes('Testing') ? 'Testing spesialist' : 'Teammedlem'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stakeholders */}
          <Card className="border-2 border-nordic-light-gray">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-nordic-sage text-white flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <span>Interessenter ({totalStakeholders} grupper)</span>
              </CardTitle>
              <CardDescription>Eksterne parter med interesse i prosjektet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.team.stakeholders.map((stakeholder, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-xl border border-nordic-light-gray bg-gradient-to-r from-white to-nordic-light-gray/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nordic-sage to-nordic-forest text-white flex items-center justify-center font-medium">
                      {stakeholder.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{stakeholder}</p>
                      <p className="text-sm text-nordic-medium-gray">
                        {stakeholder.includes('Development') ? 'Brukerbase og hovedmålgruppe' :
                         stakeholder.includes('Project') ? 'Prosjektledelse og koordinering' :
                         stakeholder.includes('Engineering') ? 'Teknisk ledelse og strategi' :
                         stakeholder.includes('Product') ? 'Produktstrategi og prioritering' : 'Interessent'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mt-8 border-2 border-nordic-ocean/20 bg-gradient-to-r from-nordic-ocean/5 to-nordic-sage/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-nordic-ocean text-white flex items-center justify-center">
                <Network className="w-4 h-4" />
              </div>
              <span>Kontaktinformasjon og Kommunikasjonskanaler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                  📧
                </div>
                <div>
                  <p className="font-semibold">E-post</p>
                  <p className="text-sm text-nordic-medium-gray">{project.contact.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center">
                  💬
                </div>
                <div>
                  <p className="font-semibold">Slack Kanal</p>
                  <p className="text-sm text-nordic-medium-gray">{project.contact.slack}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 text-white flex items-center justify-center">
                  🐙
                </div>
                <div>
                  <p className="font-semibold">Repository</p>
                  <p className="text-sm text-nordic-medium-gray break-all">{project.contact.repository}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Detailed Roadmap with Timeline */}
      <section className="mb-16">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nordic-sage to-nordic-forest flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
              🗺️ Detaljert Prosjektveiplanering
            </h2>
            <p className="text-nordic-medium-gray">Omfattende timeline med milepæler og exitkriterier</p>
          </div>
        </div>

        <div className="space-y-8">
          {roadmapPhases.map((phase, index) => (
            <Card key={phase.id} className={`border-2 ${phase.status === 'completed' ? 'border-green-200 bg-green-50/30' : phase.status === 'in-progress' ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'}`}>
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg ${phase.status === 'completed' ? 'bg-green-500' : phase.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{phase.name}</CardTitle>
                      <CardDescription className="text-lg mt-1">{phase.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={getPhaseColor(phase.status)} className="text-lg px-4 py-2">
                    {phase.status === 'completed' ? '✅ Fullført' : 
                     phase.status === 'in-progress' ? '🔄 Pågår' : '📋 Planlagt'}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-6 mt-4 text-sm text-nordic-medium-gray">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="w-4 h-4" />
                    <span className="font-medium">Tidsperiode:</span>
                    <span>{formatDate(phase.startDate)} - {phase.endDate ? formatDate(phase.endDate) : 'Pågående'}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Milestones */}
                <div>
                  <h4 className="font-bold text-lg mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-nordic-ocean" />
                    <span>Milepæler ({phase.milestones.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {phase.milestones.map((milestone) => (
                      <div key={milestone.id} className="p-4 rounded-xl border border-nordic-light-gray bg-white/50">
                        <div className="flex items-center justify-between mb-3">
                          <Badge size="sm" className={getStatusColor(milestone.status)}>
                            {milestone.status === 'completed' ? '✅' : milestone.status === 'in-progress' ? '🔄' : '📋'}
                          </Badge>
                          <span className="text-sm text-nordic-medium-gray">{milestone.progress}%</span>
                        </div>
                        <h5 className="font-semibold mb-2">{milestone.title}</h5>
                        <p className="text-sm text-nordic-medium-gray mb-3">{milestone.description}</p>
                        <div className="flex items-center justify-between text-xs text-nordic-medium-gray">
                          <span>Ansvarlig: {milestone.owner}</span>
                          <span>Frist: {formatDate(milestone.dueDate)}</span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-nordic-ocean h-2 rounded-full" style={{width: `${milestone.progress}%`}}></div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {milestone.tags.map((tag) => (
                            <Badge key={tag} variant="outline" size="sm" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exit Criteria */}
                <div>
                  <h4 className="font-bold text-lg mb-4 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-nordic-success" />
                    <span>Exitkriterier</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.exitCriteria.map((criteria, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 border">
                        <span className="text-lg">{criteria.includes('✅') ? '✅' : criteria.includes('🔄') ? '🔄' : '⏳'}</span>
                        <span className="text-sm">{criteria.replace(/^(✅|🔄|⏳)\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comprehensive Task Management Dashboard */}
      <section className="mb-16">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nordic-forest to-nordic-ocean flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
              📋 Omfattende Oppgavestyring
            </h2>
            <p className="text-nordic-medium-gray">Detaljert oversikt over alle prosjektoppgaver og status</p>
          </div>
        </div>

        {/* Task Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <Card className="text-center border-green-200 bg-green-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{completedTasks}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Fullført</p>
              <div className="mt-2">
                <div className="w-full bg-green-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${(completedTasks / totalTasks) * 100}%`}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-blue-200 bg-blue-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{inProgressTasks}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Pågående</p>
              <div className="mt-2">
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(inProgressTasks / totalTasks) * 100}%`}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center border-yellow-200 bg-yellow-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{todoTasks}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Å gjøre</p>
              <div className="mt-2">
                <div className="w-full bg-yellow-100 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(todoTasks / totalTasks) * 100}%`}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center border-gray-200 bg-gray-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-600 mb-2">{backlogTasks}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Backlog</p>
              <div className="mt-2">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-gray-500 h-2 rounded-full" style={{width: `${(backlogTasks / totalTasks) * 100}%`}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center border-nordic-ocean/20 bg-nordic-ocean/5">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-nordic-ocean mb-2">{taskProgress}%</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Totalt fremgang</p>
              <div className="mt-2">
                <div className="w-full bg-nordic-light-gray rounded-full h-2">
                  <div className="bg-nordic-ocean h-2 rounded-full" style={{width: `${taskProgress}%`}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Task Lists by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* High Priority & In Progress Tasks */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <span>Høy Prioritet & Pågående Oppgaver</span>
              </CardTitle>
              <CardDescription>Oppgaver som krever umiddelbar oppmerksomhet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tasks
                  .filter(task => task.priority === 'high' || task.status === 'in-progress')
                  .map((task) => (
                    <div key={task.id} className="p-4 rounded-xl border border-nordic-light-gray bg-gradient-to-r from-white to-blue-50/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" size="sm" className="font-mono text-xs">
                            {task.id}
                          </Badge>
                          {getPriorityIcon(task.priority)}
                          <Badge size="sm" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-nordic-medium-gray">{task.estimate}h</span>
                      </div>
                      <h4 className="font-semibold mb-2">{task.title}</h4>
                      <p className="text-sm text-nordic-medium-gray mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between text-xs text-nordic-medium-gray">
                        <span>Ansvarlig: {task.owner}</span>
                        {task.dueDate && <span>Frist: {formatDate(task.dueDate)}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline" size="sm" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {task.blockers && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            Blokkert: {task.blockers.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span>Nylig Fullførte Oppgaver</span>
              </CardTitle>
              <CardDescription>Siste oppgaver som er ferdigstilt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tasks
                  .filter(task => task.status === 'done')
                  .slice(0, 5)
                  .map((task) => (
                    <div key={task.id} className="p-4 rounded-xl border border-nordic-light-gray bg-gradient-to-r from-white to-green-50/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" size="sm" className="font-mono text-xs">
                            {task.id}
                          </Badge>
                          <Badge size="sm" className="bg-green-500 text-white">
                            ✅ {task.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-nordic-medium-gray">{task.estimate}h</span>
                      </div>
                      <h4 className="font-semibold mb-2">{task.title}</h4>
                      <p className="text-sm text-nordic-medium-gray mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between text-xs text-nordic-medium-gray">
                        <span>Fullført av: {task.owner}</span>
                        <span>Sist oppdatert: {formatDate(task.updatedDate)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline" size="sm" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comprehensive Technology Stack Analysis */}
      <section className="mb-16">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
              💻 Omfattende Teknologistakk-analyse
            </h2>
            <p className="text-nordic-medium-gray">Detaljert oversikt over alle teknologier og verktøy</p>
          </div>
        </div>

        {/* Technology Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center border-green-200 bg-green-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{activeTech.length}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Aktive Teknologier</p>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200 bg-blue-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{plannedTech.length}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Planlagte Teknologier</p>
            </CardContent>
          </Card>
          <Card className="text-center border-purple-200 bg-purple-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{frontendTech.length + backendTech.length}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Kjerneteknologier</p>
            </CardContent>
          </Card>
          <Card className="text-center border-orange-200 bg-orange-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">{devopsTech.length + testingTech.length}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">DevOps & Testing</p>
            </CardContent>
          </Card>
        </div>

        {/* Technology Categories */}
        <div className="space-y-8">
          {/* Frontend Technologies */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span>Frontend Teknologier ({frontendTech.length})</span>
              </CardTitle>
              <CardDescription>Brukergrensesnitt og klientside teknologier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {frontendTech.map((tech) => (
                  <div key={tech.id} className="p-4 rounded-xl border border-nordic-light-gray bg-gradient-to-r from-white to-blue-50/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{tech.logo}</span>
                        <div>
                          <h4 className="font-semibold">{tech.name}</h4>
                          <p className="text-sm text-nordic-medium-gray">v{tech.version}</p>
                        </div>
                      </div>
                      <Badge variant={tech.status === 'active' ? 'default' : 'secondary'}>
                        {tech.status === 'active' ? '✅ Aktiv' : '📋 Planlagt'}
                      </Badge>
                    </div>
                    <p className="text-sm text-nordic-medium-gray mb-3">{tech.description}</p>
                    <div className="text-xs text-nordic-medium-gray bg-gray-50 p-2 rounded">
                      <strong>Begrunnelse:</strong> {tech.reasoning}
                    </div>
                    <div className="mt-2">
                      <a href={tech.documentation} className="text-xs text-nordic-ocean hover:underline">
                        📖 Dokumentasjon
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Backend Technologies */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <span>Backend & Database Teknologier ({backendTech.length + databaseTech.length})</span>
              </CardTitle>
              <CardDescription>Serverside logikk og datalagring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...backendTech, ...databaseTech].map((tech) => (
                  <div key={tech.id} className="p-4 rounded-xl border border-nordic-light-gray bg-gradient-to-r from-white to-green-50/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{tech.logo}</span>
                        <div>
                          <h4 className="font-semibold">{tech.name}</h4>
                          <p className="text-sm text-nordic-medium-gray">v{tech.version}</p>
                        </div>
                      </div>
                      <Badge variant={tech.status === 'active' ? 'default' : 'secondary'}>
                        {tech.status === 'active' ? '✅ Aktiv' : '📋 Planlagt'}
                      </Badge>
                    </div>
                    <p className="text-sm text-nordic-medium-gray mb-3">{tech.description}</p>
                    <div className="text-xs text-nordic-medium-gray bg-gray-50 p-2 rounded">
                      <strong>Begrunnelse:</strong> {tech.reasoning}
                    </div>
                    <div className="mt-2">
                      <a href={tech.documentation} className="text-xs text-nordic-ocean hover:underline">
                        📖 Dokumentasjon
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* DevOps & Testing Technologies */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                  <TestTube2 className="w-4 h-4" />
                </div>
                <span>DevOps, Testing & Observability ({devopsTech.length + testingTech.length + observabilityTech.length})</span>
              </CardTitle>
              <CardDescription>Deployment, testing og overvåkning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...devopsTech, ...testingTech, ...observabilityTech].map((tech) => (
                  <div key={tech.id} className="p-4 rounded-xl border border-nordic-light-gray bg-gradient-to-r from-white to-purple-50/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{tech.logo}</span>
                        <div>
                          <h4 className="font-semibold">{tech.name}</h4>
                          <p className="text-sm text-nordic-medium-gray">v{tech.version}</p>
                        </div>
                      </div>
                      <Badge variant={tech.status === 'active' ? 'default' : 'secondary'}>
                        {tech.status === 'active' ? '✅ Aktiv' : '📋 Planlagt'}
                      </Badge>
                    </div>
                    <p className="text-sm text-nordic-medium-gray mb-3">{tech.description}</p>
                    <div className="text-xs text-nordic-medium-gray bg-gray-50 p-2 rounded">
                      <strong>Begrunnelse:</strong> {tech.reasoning}
                    </div>
                    <div className="mt-2">
                      <a href={tech.documentation} className="text-xs text-nordic-ocean hover:underline">
                        📖 Dokumentasjon
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Design Technologies */}
          <Card className="border-2 border-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500 text-white flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <span>Design & UX Verktøy ({designTech.length})</span>
              </CardTitle>
              <CardDescription>Design, prototyping og brukeropplevelse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {designTech.map((tech) => (
                  <div key={tech.id} className="p-4 rounded-xl border border-nordic-light-gray bg-gradient-to-r from-white to-pink-50/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{tech.logo}</span>
                        <div>
                          <h4 className="font-semibold">{tech.name}</h4>
                          <p className="text-sm text-nordic-medium-gray">v{tech.version}</p>
                        </div>
                      </div>
                      <Badge variant={tech.status === 'active' ? 'default' : 'secondary'}>
                        {tech.status === 'active' ? '✅ Aktiv' : '📋 Planlagt'}
                      </Badge>
                    </div>
                    <p className="text-sm text-nordic-medium-gray mb-3">{tech.description}</p>
                    <div className="text-xs text-nordic-medium-gray bg-gray-50 p-2 rounded">
                      <strong>Begrunnelse:</strong> {tech.reasoning}
                    </div>
                    <div className="mt-2">
                      <a href={tech.documentation} className="text-xs text-nordic-ocean hover:underline">
                        📖 Dokumentasjon
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comprehensive Risk Management */}
      <section className="mb-16">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
              ⚠️ Omfattende Risikostyring
            </h2>
            <p className="text-nordic-medium-gray">Detaljert risikoanalyse med mitigerings- og beredskapsplaner</p>
          </div>
        </div>

        {/* Risk Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center border-red-200 bg-red-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600 mb-2">{highRisks.length}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Høy Risiko</p>
            </CardContent>
          </Card>
          <Card className="text-center border-yellow-200 bg-yellow-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{mediumRisks.length}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Middels Risiko</p>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200 bg-green-50/30">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{lowRisks.length}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Lav Risiko</p>
            </CardContent>
          </Card>
          <Card className="text-center border-nordic-ocean/20 bg-nordic-ocean/5">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-nordic-ocean mb-2">{risks.length}</div>
              <p className="text-sm text-nordic-medium-gray font-medium">Totale Risikoer</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Risk Analysis */}
        <div className="space-y-6">
          {risks.map((risk) => {
            const riskLevel = getRiskLevel(risk);
            return (
              <Card key={risk.id} className={`border-2 ${riskLevel.color === 'bg-red-500' ? 'border-red-200 bg-red-50/20' : riskLevel.color === 'bg-orange-500' ? 'border-orange-200 bg-orange-50/20' : riskLevel.color === 'bg-yellow-500' ? 'border-yellow-200 bg-yellow-50/20' : 'border-green-200 bg-green-50/20'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl ${riskLevel.color} text-white flex items-center justify-center font-bold`}>
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{risk.title}</CardTitle>
                        <CardDescription className="text-lg mt-1">{risk.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`${riskLevel.textColor} font-bold text-lg px-3 py-1`}>
                        {riskLevel.level}
                      </Badge>
                      <p className="text-sm text-nordic-medium-gray mt-1">{risk.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                    <div className="text-center p-3 bg-white/50 rounded-lg border">
                      <div className="text-2xl font-bold text-nordic-ocean">{risk.probability}</div>
                      <p className="text-xs text-nordic-medium-gray">Sannsynlighet</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg border">
                      <div className="text-2xl font-bold text-nordic-error">{risk.impact}</div>
                      <p className="text-xs text-nordic-medium-gray">Påvirkning</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">{risk.probability * risk.impact}</div>
                      <p className="text-xs text-nordic-medium-gray">Risikoscore</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg border">
                      <div className="text-sm font-bold">{risk.category}</div>
                      <p className="text-xs text-nordic-medium-gray">Kategori</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg border">
                      <Badge className={getStatusColor(risk.status)}>
                        {risk.status === 'mitigating' ? '🛠️ Mitigerer' :
                         risk.status === 'monitoring' ? '👁️ Overvåker' :
                         risk.status === 'identified' ? '🔍 Identifisert' : risk.status}
                      </Badge>
                      <p className="text-xs text-nordic-medium-gray">Status</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mitigation Strategy */}
                    <div className="p-4 bg-white/50 rounded-xl border">
                      <h4 className="font-bold text-lg mb-3 flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span>Mitigeringsstrategi</span>
                      </h4>
                      <p className="text-sm text-nordic-medium-gray">{risk.mitigation}</p>
                    </div>

                    {/* Contingency Plan */}
                    <div className="p-4 bg-white/50 rounded-xl border">
                      <h4 className="font-bold text-lg mb-3 flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <span>Beredskapsplan</span>
                      </h4>
                      <p className="text-sm text-nordic-medium-gray">{risk.contingency}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-nordic-medium-gray bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Ansvarlig:</span>
                        <span>{risk.owner}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Identifisert:</span>
                        <span>{formatDate(risk.identifiedDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Sist vurdert:</span>
                      <span>{formatDate(risk.lastReviewed)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Comprehensive Project Activity & Documentation */}
      <section className="mb-16">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
              📚 Prosjektdokumentasjon og Aktivitet
            </h2>
            <p className="text-nordic-medium-gray">Omfattende oversikt over endringer og arkitekturbeslutninger</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Comprehensive Changelog */}
          <Card className="border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                  <GitBranch className="w-4 h-4" />
                </div>
                <span>Detaljert Endringslogg</span>
              </CardTitle>
              <CardDescription>Siste endringer med utførlig informasjon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {changelog.map((entry, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-6 pb-6 relative">
                    <div className="absolute w-4 h-4 bg-indigo-500 rounded-full -left-2 top-0"></div>
                    
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge size="sm" variant="outline" className="font-mono">
                        v{entry.version}
                      </Badge>
                      <span className="text-sm text-nordic-medium-gray">{formatDate(entry.date)}</span>
                      <Badge size="sm" className={getStatusColor(entry.type)}>
                        {entry.type === 'feature' ? '✨ Feature' :
                         entry.type === 'fix' ? '🐛 Fix' :
                         entry.type === 'enhancement' ? '⚡ Enhancement' :
                         entry.type === 'docs' ? '📚 Docs' : entry.type}
                      </Badge>
                    </div>
                    
                    <h4 className="font-bold text-lg mb-2">{entry.title}</h4>
                    {entry.description && (
                      <p className="text-sm text-nordic-medium-gray mb-3">{entry.description}</p>
                    )}
                    
                    {entry.changes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Detaljerte endringer:</h5>
                        <ul className="text-sm text-nordic-medium-gray space-y-1">
                          {entry.changes.map((change, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <span className="text-indigo-500">•</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.author && (
                      <div className="mt-3 flex items-center space-x-2 text-xs text-nordic-medium-gray">
                        <span>av</span>
                        <span className="font-medium">{entry.author}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Architecture Decision Records */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span>Arkitekturbeslutninger (ADRs)</span>
              </CardTitle>
              <CardDescription>Kritiske tekniske beslutninger og begrunnelser</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {adrs.map((adr) => (
                  <div key={adr.id} className="p-4 rounded-xl border border-nordic-light-gray bg-gradient-to-r from-white to-purple-50/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" size="sm" className="font-mono text-xs">
                          {adr.id}
                        </Badge>
                        <Badge size="sm" className={getStatusColor(adr.status)}>
                          {adr.status === 'accepted' ? '✅ Akseptert' :
                           adr.status === 'proposed' ? '🔄 Foreslått' :
                           adr.status === 'deprecated' ? '⚠️ Avviklet' : adr.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-nordic-medium-gray">{formatDate(adr.date)}</span>
                    </div>
                    
                    <h4 className="font-bold mb-2">{adr.title}</h4>
                    <p className="text-sm text-nordic-medium-gray mb-3 line-clamp-3">{adr.context}</p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <h5 className="font-medium text-sm mb-1">Beslutning:</h5>
                      <p className="text-sm text-nordic-medium-gray">{adr.decision}</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <h5 className="font-medium text-sm mb-1">Konsekvenser:</h5>
                      <p className="text-sm text-nordic-medium-gray">{adr.consequences}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-nordic-medium-gray">
                      <div className="flex items-center space-x-2">
                        <span>Forfatter:</span>
                        <span className="font-medium">{adr.author}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {adr.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" size="sm" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Integration & API Information */}
      <section className="mb-16">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
              🔌 Integrasjoner og API-arkitektur
            </h2>
            <p className="text-nordic-medium-gray">Omfattende oversikt over eksterne koblinger og API-design</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Integration Status */}
          <Card className="border-2 border-cyan-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
                <span>Integrasjonsstatus</span>
              </CardTitle>
              <CardDescription>Eksterne tjenester og koplinger</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-xl bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center">
                        🐙
                      </div>
                      <div>
                        <h4 className="font-semibold">GitHub Integration</h4>
                        <p className="text-sm text-nordic-medium-gray">Commits, releases, milestones</p>
                      </div>
                    </div>
                    <Badge variant="destructive">🔴 Deaktivert</Badge>
                  </div>
                  <p className="text-sm text-nordic-medium-gray bg-white p-2 rounded">
                    <strong>Status:</strong> API-token ikke konfigurert. Dashbordet viser statiske data.
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        🎫
                      </div>
                      <div>
                        <h4 className="font-semibold">Jira Integration</h4>
                        <p className="text-sm text-nordic-medium-gray">Issues, projects, statistics</p>
                      </div>
                    </div>
                    <Badge variant="destructive">🔴 Deaktivert</Badge>
                  </div>
                  <p className="text-sm text-nordic-medium-gray bg-white p-2 rounded">
                    <strong>Status:</strong> API-tilgang ikke konfigurert. Bruker mock data.
                  </p>
                </div>

                <div className="p-4 border border-green-200 rounded-xl bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nordic-ocean to-nordic-sage text-white flex items-center justify-center">
                        📊
                      </div>
                      <div>
                        <h4 className="font-semibold">Dashboard Core</h4>
                        <p className="text-sm text-nordic-medium-gray">KPIs, tasks, roadmap</p>
                      </div>
                    </div>
                    <Badge variant="default">🟢 Aktiv</Badge>
                  </div>
                  <p className="text-sm text-nordic-medium-gray bg-white p-2 rounded">
                    <strong>Status:</strong> Alle kjernefunksjoner operasjonelle med lokal data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Architecture Overview */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <span>API Arkitektur</span>
              </CardTitle>
              <CardDescription>REST endpoints og dataflyt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">GitHub API Endpoints</h4>
                  <div className="space-y-1 text-xs font-mono">
                    <div>GET /api/github/commits</div>
                    <div>GET /api/github/releases</div>
                    <div>GET /api/github/milestones</div>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Jira API Endpoints</h4>
                  <div className="space-y-1 text-xs font-mono">
                    <div>GET /api/jira/issues</div>
                    <div>POST /api/jira/issues (JQL)</div>
                    <div>GET /api/jira/project</div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Core Dashboard APIs</h4>
                  <div className="space-y-1 text-xs font-mono">
                    <div>GET /api/integrations/health</div>
                    <div>GET /api/data/[resource]</div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Rate Limiting</h4>
                  <div className="text-sm space-y-1">
                    <div>• GitHub: 5000/time</div>
                    <div>• Jira: 100/min</div>
                    <div>• API Routes: 30/min</div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Caching Strategy</h4>
                  <div className="text-sm space-y-1">
                    <div>• Commits: 5min cache</div>
                    <div>• Issues: 3min cache</div>
                    <div>• Project: 30min cache</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Performance & Security Metrics */}
      <section className="mb-16">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
              🛡️ Ytelse og Sikkerhetsmålinger
            </h2>
            <p className="text-nordic-medium-gray">Detaljerte målinger for systemytelse og sikkerhet</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Performance Metrics */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-green-600" />
                <span className="text-lg">Ytelse</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">1.2s</div>
                <p className="text-sm text-nordic-medium-gray">Dashboard lastetid</p>
                <div className="mt-2">
                  <div className="w-full bg-green-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: "85%"}}></div>
                  </div>
                  <p className="text-xs text-nordic-medium-gray mt-1">Mål: &lt;2.0s</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <p className="text-sm text-nordic-medium-gray">Cache hit rate</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Freshness */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                <span className="text-lg">Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">2.5min</div>
                <p className="text-sm text-nordic-medium-gray">Gjennomsnittlig dataalder</p>
                <div className="mt-2">
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: "75%"}}></div>
                  </div>
                  <p className="text-xs text-nordic-medium-gray mt-1">Mål: &lt;5min</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">99.8%</div>
                <p className="text-sm text-nordic-medium-gray">Data nøyaktighet</p>
              </div>
            </CardContent>
          </Card>

          {/* Security Metrics */}
          <Card className="border-2 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span className="text-lg">Sikkerhet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">0.2%</div>
                <p className="text-sm text-nordic-medium-gray">API feilrate</p>
                <div className="mt-2">
                  <div className="w-full bg-red-100 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: "20%"}}></div>
                  </div>
                  <p className="text-xs text-nordic-medium-gray mt-1">Mål: &lt;1.0%</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">A+</div>
                <p className="text-sm text-nordic-medium-gray">Sikkerhetsrating</p>
              </div>
            </CardContent>
          </Card>

          {/* User Experience */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-600" />
                <span className="text-lg">Brukertilfredshet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">4.6/5.0</div>
                <p className="text-sm text-nordic-medium-gray">Gjennomsnittsvurdering</p>
                <div className="mt-2">
                  <div className="w-full bg-purple-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: "92%"}}></div>
                  </div>
                  <p className="text-xs text-nordic-medium-gray mt-1">Mål: &gt;4.5</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">78%</div>
                <p className="text-sm text-nordic-medium-gray">Team adoption</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer with Comprehensive Information */}
      <footer className="bg-gradient-to-r from-nordic-light-gray/20 to-nordic-sage/10 border-t-2 border-nordic-light-gray pt-12 pb-8 rounded-t-3xl">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-nordic-black dark:text-nordic-off-white mb-4">
            🚀 Dev Memory OS - Living Spec Dashboard
          </h3>
          <p className="text-lg text-nordic-medium-gray mb-6 max-w-3xl mx-auto">
            Revolusjonerende visuelt prosjektoversiktssystem for utviklingsteam som transformerer hvordan team sporer, visualiserer og kommuniserer prosjektstatus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-nordic-ocean to-nordic-sage rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              📊
            </div>
            <h4 className="font-bold mb-2">Realtids KPIer</h4>
            <p className="text-sm text-nordic-medium-gray">Live metrikksporing med intelligente trender og varsler</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-nordic-sage to-nordic-forest rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              🗺️
            </div>
            <h4 className="font-bold mb-2">Interaktiv Roadmap</h4>
            <p className="text-sm text-nordic-medium-gray">Dynamisk prosjekttimeline med detaljerte milepæler</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-nordic-forest to-nordic-ocean rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              🤖
            </div>
            <h4 className="font-bold mb-2">AI-drevet Innsikt</h4>
            <p className="text-sm text-nordic-medium-gray">Maskinlæring for prosjekthelsevurdering</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              🔗
            </div>
            <h4 className="font-bold mb-2">Sømløse Integrasjoner</h4>
            <p className="text-sm text-nordic-medium-gray">GitHub, Jira og andre verktøy i ett dashboard</p>
          </div>
        </div>

        <div className="border-t border-nordic-light-gray pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-nordic-medium-gray">
                Bygget med ❤️ av <strong>{project.team.lead}</strong> teamet
              </p>
              <p className="text-sm text-nordic-medium-gray">
                Sist oppdatert: {formatDate(new Date().toISOString())} • v{project.version}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href={project.contact.repository} className="flex items-center space-x-2 text-nordic-ocean hover:text-nordic-sage transition-colors">
                <span>🐙</span>
                <span>Repository</span>
              </a>
              <a href={`mailto:${project.contact.email}`} className="flex items-center space-x-2 text-nordic-ocean hover:text-nordic-sage transition-colors">
                <span>📧</span>
                <span>Kontakt</span>
              </a>
              {project.contact.slack && (
                <a href="#" className="flex items-center space-x-2 text-nordic-ocean hover:text-nordic-sage transition-colors">
                  <span>💬</span>
                  <span>{project.contact.slack}</span>
                </a>
              )}
            </div>
          </div>
          
          <div className="text-center mt-6 pt-6 border-t border-nordic-light-gray/50">
            <div className="flex justify-center items-center space-x-8 text-sm">
              <a href="/" className="text-nordic-ocean hover:underline transition-colors">
                🏠 Hjem
              </a>
              <a href="/simple" className="text-nordic-ocean hover:underline transition-colors">
                📊 Enkel Dashboard
              </a>
              <a href="/enhanced" className="text-nordic-ocean hover:underline transition-colors">
                ⚡ Forbedret Dashboard
              </a>
              <a href="/norsk" className="text-nordic-ocean hover:underline transition-colors">
                🇳🇴 Norsk Dashboard
              </a>
              <span className="text-nordic-sage font-semibold">
                🚀 Ultimate Dashboard (Aktiv)
              </span>
            </div>
            <p className="text-xs text-nordic-medium-gray mt-4">
              Dette er den mest omfattende dashboardet med all tilgjengelig prosjektinformasjon og detaljert analyse.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}