import { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  GitBranch, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Activity
} from 'lucide-react';
import { cn, formatRelativeTime, getStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ADR {
  id: string;
  title: string;
  project_name?: string;
  component_name?: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  problem_statement?: string;
  decision?: string;
  consequences?: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  superceded_by?: string;
}

interface ADRExplorerProps {
  className?: string;
  onADRClick?: (adr: ADR) => void;
}

const STATUS_ICONS = {
  proposed: AlertTriangle,
  accepted: CheckCircle,
  deprecated: XCircle,
  superseded: GitBranch,
};

const STATUS_COLORS = {
  proposed: 'text-yellow-500',
  accepted: 'text-green-500',  
  deprecated: 'text-red-500',
  superseded: 'text-blue-500',
};

// Mock data for demonstration - in real app this would come from API
const mockADRs: ADR[] = [
  {
    id: '1',
    title: 'Use React for Frontend Framework',
    project_name: 'Dev Memory OS',
    component_name: 'Frontend',
    status: 'accepted',
    problem_statement: 'We need to choose a frontend framework for our pattern discovery interface that provides good developer experience, performance, and maintainability.',
    decision: 'We will use React with TypeScript for the frontend framework, combined with Vite for build tooling and TailwindCSS for styling.',
    consequences: 'Positive: Fast development, large ecosystem, excellent TypeScript support. Negative: Learning curve for team members unfamiliar with React.',
    created_at: '2025-08-20T10:00:00Z',
    updated_at: '2025-08-20T10:00:00Z',
    author_name: 'Frontend Specialist',
  },
  {
    id: '2', 
    title: 'Implement Semantic Search with pgvector',
    project_name: 'Dev Memory OS',
    component_name: 'Backend',
    status: 'accepted',
    problem_statement: 'Users need to be able to search through ADRs and patterns using natural language queries rather than exact keyword matches.',
    decision: 'We will implement semantic search using OpenAI embeddings stored in PostgreSQL with the pgvector extension.',
    consequences: 'Positive: Natural language search capabilities, better user experience. Negative: Additional complexity, dependency on OpenAI API.',
    created_at: '2025-08-18T14:30:00Z',
    updated_at: '2025-08-18T14:30:00Z', 
    author_name: 'Backend Specialist',
  },
  {
    id: '3',
    title: 'Use Express.js for API Server',
    project_name: 'Dev Memory OS',
    component_name: 'Backend',
    status: 'accepted',
    problem_statement: 'We need a Node.js web framework for building the API server that handles semantic search and pattern recommendations.',
    decision: 'We will use Express.js as our web framework due to its simplicity, maturity, and extensive ecosystem.',
    consequences: 'Positive: Quick development, well-documented, large community. Negative: Minimal structure may require additional architectural decisions.',
    created_at: '2025-08-15T09:15:00Z',
    updated_at: '2025-08-15T09:15:00Z',
    author_name: 'Backend Specialist',
  },
  {
    id: '4',
    title: 'Implement Dark/Light Mode Toggle',
    project_name: 'Dev Memory OS',
    component_name: 'Frontend',
    status: 'proposed',
    problem_statement: 'Developers often prefer dark mode interfaces, especially when working in low-light conditions or for extended periods.',
    decision: 'We will implement a dark/light mode toggle that persists user preference in localStorage and respects system preferences.',
    consequences: 'Positive: Better user experience, reduced eye strain. Negative: Additional CSS complexity, need to test all components in both modes.',
    created_at: '2025-08-25T16:00:00Z',
    updated_at: '2025-08-25T16:00:00Z',
    author_name: 'Frontend Specialist',
  },
];

export default function ADRExplorer({ className, onADRClick }: ADRExplorerProps) {
  const [adrs] = useState<ADR[]>(mockADRs);
  const [filteredAdrs, setFilteredAdrs] = useState<ADR[]>(mockADRs);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Filter ADRs based on search and filters
  useEffect(() => {
    let filtered = adrs;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(adr => adr.status === selectedStatus);
    }

    // Filter by project
    if (selectedProject !== 'all') {
      filtered = filtered.filter(adr => adr.project_name === selectedProject);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(adr => 
        adr.title.toLowerCase().includes(query) ||
        adr.problem_statement?.toLowerCase().includes(query) ||
        adr.decision?.toLowerCase().includes(query) ||
        adr.component_name?.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredAdrs(filtered);
  }, [adrs, selectedStatus, selectedProject, searchQuery]);

  // Get unique projects and statuses
  const projects = Array.from(new Set(adrs.map(adr => adr.project_name).filter(Boolean)));
  const statuses = Array.from(new Set(adrs.map(adr => adr.status)));

  const handleADRClick = (adr: ADR) => {
    onADRClick?.(adr);
  };

  const StatusIcon = ({ status }: { status: ADR['status'] }) => {
    const IconComponent = STATUS_ICONS[status];
    return <IconComponent className={cn("h-4 w-4", STATUS_COLORS[status])} />;
  };

  const ADRCard = ({ adr, showTimeline = false }: { adr: ADR; showTimeline?: boolean }) => (
    <div
      onClick={() => handleADRClick(adr)}
      className={cn(
        "group p-4 border border-border rounded-lg bg-card hover:shadow-lg transition-all duration-200 cursor-pointer",
        "hover:border-primary/30 hover:-translate-y-0.5",
        showTimeline && "relative ml-8"
      )}
    >
      {/* Timeline connector */}
      {showTimeline && (
        <div className="absolute -left-8 top-6 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-sm" />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon status={adr.status} />
          <span className={cn(
            "px-2 py-1 text-xs font-medium rounded-full border",
            getStatusColor(adr.status)
          )}>
            {adr.status.charAt(0).toUpperCase() + adr.status.slice(1)}
          </span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {formatRelativeTime(adr.created_at)}
        </div>
      </div>

      <h3 className="font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
        {adr.title}
      </h3>

      {adr.problem_statement && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {adr.problem_statement}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-3">
          {adr.project_name && (
            <div className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>{adr.project_name}</span>
            </div>
          )}
          
          {adr.component_name && (
            <div className="flex items-center space-x-1">
              <GitBranch className="h-3 w-3" />
              <span>{adr.component_name}</span>
            </div>
          )}
        </div>

        {adr.author_name && (
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{adr.author_name}</span>
          </div>
        )}
      </div>
    </div>
  );

  const TimelineView = () => (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      
      <div className="space-y-6">
        {filteredAdrs.map((adr) => (
          <div key={adr.id} className="relative">
            <ADRCard adr={adr} showTimeline={true} />
          </div>
        ))}
      </div>
    </div>
  );

  const ListView = () => (
    <div className="grid gap-4">
      {filteredAdrs.map(adr => (
        <ADRCard key={adr.id} adr={adr} />
      ))}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ADR Explorer</h1>
          <p className="text-muted-foreground">
            Browse and explore Architecture Decision Records with timeline view
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Timeline
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <FileText className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ADRs by title, problem, or decision..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border rounded bg-background text-foreground"
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border rounded bg-background text-foreground"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(selectedStatus !== 'all' || selectedProject !== 'all' || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStatus('all');
                setSelectedProject('all');
                setSearchQuery('');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Showing {filteredAdrs.length} ADR{filteredAdrs.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
        </span>

        {/* Status Distribution */}
        <div className="flex items-center space-x-4 text-xs">
          {statuses.map(status => {
            const count = filteredAdrs.filter(adr => adr.status === status).length;
            return (
              <div key={status} className="flex items-center space-x-1">
                <StatusIcon status={status as ADR['status']} />
                <span className="capitalize">{status}: {count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADR Content */}
      {filteredAdrs.length > 0 ? (
        viewMode === 'timeline' ? <TimelineView /> : <ListView />
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-lg">No ADRs found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery || selectedStatus !== 'all' || selectedProject !== 'all'
                ? "Try adjusting your search criteria or filters to find ADRs."
                : "No Architecture Decision Records are available yet."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}