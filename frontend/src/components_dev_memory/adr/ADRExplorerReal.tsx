import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  User, 
  GitBranch, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Activity,
  Loader2
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

// API functions for fetching ADRs
const fetchADRs = async (): Promise<ADR[]> => {
  const response = await fetch('/api/v1/adrs');
  if (!response.ok) {
    throw new Error('Failed to fetch ADRs');
  }
  const data = await response.json();
  return data.adrs || data; // Handle different response formats
};

const searchADRs = async (query: string): Promise<ADR[]> => {
  if (!query.trim()) return [];
  
  const response = await fetch(`/api/v1/adrs/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search ADRs');
  }
  const data = await response.json();
  return data.results || data;
};

export default function ADRExplorer({ className, onADRClick }: ADRExplorerProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [filteredAdrs, setFilteredAdrs] = useState<ADR[]>([]);

  // Fetch all ADRs
  const { data: adrs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adrs'],
    queryFn: fetchADRs,
    retry: 3,
    retryDelay: 1000,
  });

  // Search ADRs when query changes
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['adrs', 'search', searchQuery],
    queryFn: () => searchADRs(searchQuery),
    enabled: searchQuery.trim().length > 2, // Only search with 3+ characters
    retry: 2,
  });

  // Filter and sort ADRs
  useEffect(() => {
    const dataToFilter = searchQuery.trim().length > 2 ? searchResults : adrs;
    let filtered = [...dataToFilter];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(adr => adr.status === selectedStatus);
    }

    // Filter by project
    if (selectedProject !== 'all') {
      filtered = filtered.filter(adr => adr.project_name === selectedProject);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredAdrs(filtered);
  }, [adrs, searchResults, selectedStatus, selectedProject, searchQuery]);

  // Get unique projects and statuses from actual data
  const projects = Array.from(new Set(adrs.map(adr => adr.project_name).filter(Boolean)));
  const statuses = Array.from(new Set(adrs.map(adr => adr.status)));

  const handleADRClick = (adr: ADR) => {
    onADRClick?.(adr);
  };

  const isLoadingData = isLoading || isSearching;

  if (error) {
    return (
      <div className={cn("p-6 bg-background border border-border rounded-lg", className)}>
        <div className="text-center text-red-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load ADRs</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An error occurred while fetching ADRs'}
          </p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Architecture Decision Records</h2>
          <p className="text-muted-foreground">
            {isLoadingData ? 'Loading...' : `${filteredAdrs.length} ADRs found`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Timeline
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ADRs by title, problem, or decision..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status} className="capitalize">
                {status}
              </option>
            ))}
          </select>
          
          {projects.length > 0 && (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoadingData && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading ADRs...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoadingData && filteredAdrs.length === 0 && (
        <div className="text-center p-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No ADRs found</h3>
          <p className="text-muted-foreground">
            {searchQuery.trim() 
              ? `No ADRs match your search "${searchQuery}"`
              : 'No Architecture Decision Records available yet'
            }
          </p>
        </div>
      )}

      {/* ADRs List */}
      {!isLoadingData && filteredAdrs.length > 0 && (
        <div className="space-y-4">
          {filteredAdrs.map((adr) => {
            const StatusIcon = STATUS_ICONS[adr.status];
            return (
              <div
                key={adr.id}
                onClick={() => handleADRClick(adr)}
                className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex-shrink-0 mt-1", STATUS_COLORS[adr.status])}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {adr.title}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatRelativeTime(adr.created_at)}
                      </span>
                    </div>
                    
                    {(adr.project_name || adr.component_name) && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {adr.project_name && (
                          <span className="bg-secondary px-2 py-1 rounded-full">
                            {adr.project_name}
                          </span>
                        )}
                        {adr.component_name && (
                          <span className="bg-secondary px-2 py-1 rounded-full">
                            {adr.component_name}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {adr.problem_statement && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        <strong>Problem:</strong> {adr.problem_statement}
                      </p>
                    )}
                    
                    {adr.decision && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        <strong>Decision:</strong> {adr.decision}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {adr.author_name && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{adr.author_name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium capitalize",
                        adr.status === 'accepted' && "bg-green-100 text-green-700",
                        adr.status === 'proposed' && "bg-yellow-100 text-yellow-700", 
                        adr.status === 'deprecated' && "bg-red-100 text-red-700",
                        adr.status === 'superseded' && "bg-blue-100 text-blue-700"
                      )}>
                        {adr.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}