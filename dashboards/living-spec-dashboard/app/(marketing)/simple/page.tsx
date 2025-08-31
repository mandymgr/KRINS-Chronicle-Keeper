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

export default function SimpleDashboard() {
  // Load all data for the dashboard
  const project = getProjectMetadata();
  const kpis = getKpiMetrics();
  const roadmapPhases = getRoadmapPhases();
  const tasks = getTasks();
  const techStack = getTechStack();
  const risks = getRisks();
  const changelog = getChangelogEntries(5);
  const adrs = getArchitectureDecisionRecords();

  // Calculate some dashboard stats
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const totalTasks = tasks.length;
  const taskProgress = calculateProgress(completedTasks, totalTasks);

  const activeTechCount = techStack.filter(tech => tech.status === 'active').length;
  const highRisks = risks.filter(risk => risk.probability >= 4 || risk.impact >= 4).length;

  const getPhaseColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'default';
      case 'planned':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <header className="mb-12 text-center animate-fade-in">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <h1 className="text-4xl font-bold text-nordic-black dark:text-nordic-off-white">
            {project.name}
          </h1>
          <Badge variant={getPhaseColor(project.phase.toLowerCase())} className="text-lg px-3 py-1">
            {project.phase}
          </Badge>
        </div>
        <p className="text-xl text-nordic-medium-gray max-w-3xl mx-auto text-balance">
          {project.mission}
        </p>
        <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-nordic-medium-gray">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Version:</span>
            <span>{project.version}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Team Lead:</span>
            <span>{project.team.lead}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Expected Launch:</span>
            <span>{project.expectedLaunch ? formatDate(project.expectedLaunch) : 'TBD'}</span>
          </div>
        </div>
      </header>

      {/* KPI Metrics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-nordic-black dark:text-nordic-off-white">
          📊 Key Performance Indicators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense fallback={<div className="animate-pulse bg-nordic-light-gray rounded-2xl h-48"></div>}>
            {kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </Suspense>
        </div>
      </section>

      {/* Project Roadmap */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-nordic-black dark:text-nordic-off-white">
          🗺️ Project Roadmap
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roadmapPhases.map((phase) => (
            <Card key={phase.id} className="animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{phase.name}</CardTitle>
                  <Badge variant={getPhaseColor(phase.status)}>
                    {phase.status.replace('-', ' ')}
                  </Badge>
                </div>
                <CardDescription>{phase.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-nordic-medium-gray">
                    <span className="font-medium">Timeline:</span> {formatDate(phase.startDate)} - {phase.endDate ? formatDate(phase.endDate) : 'Ongoing'}
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm mb-2 block">Milestones:</span>
                    <div className="space-y-2">
                      {phase.milestones.slice(0, 3).map((milestone) => (
                        <div key={milestone.id} className="flex items-center space-x-2 text-sm">
                          <Badge size="sm" className={getStatusColor(milestone.status)}>
                            {milestone.status === 'completed' ? '✓' : milestone.status === 'in-progress' ? '⏳' : '📋'}
                          </Badge>
                          <span className="truncate">{milestone.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm mb-2 block">Exit Criteria:</span>
                    <ul className="text-sm space-y-1">
                      {phase.exitCriteria.slice(0, 2).map((criteria, index) => (
                        <li key={index} className="text-nordic-medium-gray truncate">
                          {criteria}
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

      {/* Quick Stats */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-nordic-ocean mb-2">{taskProgress}%</div>
              <p className="text-sm text-nordic-medium-gray">Tasks Completed</p>
              <p className="text-xs text-nordic-medium-gray">{completedTasks}/{totalTasks} done</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-nordic-success mb-2">{activeTechCount}</div>
              <p className="text-sm text-nordic-medium-gray">Active Technologies</p>
              <p className="text-xs text-nordic-medium-gray">In current stack</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-nordic-error mb-2">{highRisks}</div>
              <p className="text-sm text-nordic-medium-gray">High Priority Risks</p>
              <p className="text-xs text-nordic-medium-gray">Requiring attention</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-nordic-sage mb-2">{project.team.members.length}</div>
              <p className="text-sm text-nordic-medium-gray">Team Members</p>
              <p className="text-xs text-nordic-medium-gray">Active contributors</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Simple Integration Status Notice */}
      <section className="mb-12">
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔌 Integrations
            </CardTitle>
            <CardDescription>
              GitHub and Jira integrations are disabled. This dashboard shows static data.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Recent Activity */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-nordic-black dark:text-nordic-off-white">
          📋 Recent Activity
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Changelog Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📝</span>
                <span>Latest Changes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changelog.map((entry, index) => (
                  <div key={index} className="border-l-2 border-nordic-ocean pl-4 pb-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge size="sm" variant="outline">v{entry.version}</Badge>
                      <span className="text-sm text-nordic-medium-gray">{formatDate(entry.date)}</span>
                    </div>
                    <h4 className="font-medium text-sm">{entry.title}</h4>
                    {entry.description && (
                      <p className="text-sm text-nordic-medium-gray line-clamp-2">{entry.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Architecture Decisions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🏗️</span>
                <span>Architecture Decisions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adrs.slice(0, 5).map((adr) => (
                  <div key={adr.id} className="border-b border-nordic-light-gray last:border-b-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{adr.id}</span>
                      <Badge size="sm" className={getStatusColor(adr.status)}>
                        {adr.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm line-clamp-2">{adr.title}</h4>
                    <p className="text-xs text-nordic-medium-gray mt-1">
                      {formatDate(adr.date)} • {adr.author}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-nordic-medium-gray border-t border-nordic-light-gray pt-8 dark:border-nordic-medium-gray">
        <p>Built with ❤️ by the {project.team.lead} team • Last updated: {formatDate(new Date().toISOString())}</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href={project.contact.repository} className="hover:text-nordic-ocean transition-colors">
            🐙 Repository
          </a>
          <a href={`mailto:${project.contact.email}`} className="hover:text-nordic-ocean transition-colors">
            📧 Contact
          </a>
          {project.contact.slack && (
            <a href="#" className="hover:text-nordic-ocean transition-colors">
              💬 {project.contact.slack}
            </a>
          )}
        </div>
        <div className="mt-4 text-xs">
          <p>🚀 <a href="/" className="text-nordic-ocean hover:underline">Full Dashboard with Integrations</a> | 📊 Simple Dashboard (Current)</p>
        </div>
      </footer>
    </div>
  );
}