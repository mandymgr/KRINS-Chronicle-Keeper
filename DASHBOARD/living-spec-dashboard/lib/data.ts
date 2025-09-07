import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

import type {
  ArchitectureDecisionRecord,
  ChangelogEntry,
  ProjectMetadata,
  KpiMetric,
  RoadmapPhase,
  Task,
  TechStackItem,
  Risk,
  Environment,
  Requirement,
  ServiceLevelObjective,
  GlossaryTerm,
  ExternalLink,
} from './types';

// Base paths for data files
const DATA_DIR = join(process.cwd(), 'data');
const ADR_DIR = join(process.cwd(), 'adrs');
const CHANGELOG_PATH = join(process.cwd(), 'CHANGELOG.md');

/**
 * Load and parse JSON data file
 */
function loadJsonData<T>(filename: string): T {
  try {
    const filePath = join(DATA_DIR, filename);
    const fileContent = readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw new Error(`Failed to load ${filename}`);
  }
}

/**
 * Load project metadata
 */
export function getProjectMetadata(): ProjectMetadata {
  return loadJsonData<ProjectMetadata>('project.json');
}

/**
 * Load KPI metrics
 */
export function getKpiMetrics(): KpiMetric[] {
  const data = loadJsonData<{ kpis: KpiMetric[] }>('project.json');
  return data.kpis || [];
}

/**
 * Load roadmap phases
 */
export function getRoadmapPhases(): RoadmapPhase[] {
  return loadJsonData<RoadmapPhase[]>('roadmap.json');
}

/**
 * Load tasks for Kanban board
 */
export function getTasks(): Task[] {
  return loadJsonData<Task[]>('tasks.json');
}

/**
 * Load tech stack items
 */
export function getTechStack(): TechStackItem[] {
  return loadJsonData<TechStackItem[]>('tech.json');
}

/**
 * Load risks
 */
export function getRisks(): Risk[] {
  return loadJsonData<Risk[]>('risks.json');
}

/**
 * Load environments
 */
export function getEnvironments(): Environment[] {
  try {
    return loadJsonData<Environment[]>('environments.json');
  } catch {
    // Return mock data if file doesn't exist
    return [
      {
        name: 'Production',
        type: 'production',
        url: 'https://app.devmemoryos.com',
        status: 'healthy',
        version: '1.2.3',
        lastDeployed: '2024-01-15T10:30:00Z',
        deployedBy: 'deploy-bot',
        healthCheck: 'https://app.devmemoryos.com/health',
        monitoring: 'https://monitoring.devmemoryos.com',
      },
      {
        name: 'Staging',
        type: 'staging',
        url: 'https://staging.devmemoryos.com',
        status: 'healthy',
        version: '1.3.0-beta.1',
        lastDeployed: '2024-01-16T14:45:00Z',
        deployedBy: 'krin',
        healthCheck: 'https://staging.devmemoryos.com/health',
      },
    ];
  }
}

/**
 * Load requirements
 */
export function getRequirements(): Requirement[] {
  try {
    return loadJsonData<Requirement[]>('requirements.json');
  } catch {
    return [];
  }
}

/**
 * Load SLOs
 */
export function getServiceLevelObjectives(): ServiceLevelObjective[] {
  try {
    return loadJsonData<ServiceLevelObjective[]>('slos.json');
  } catch {
    return [
      {
        id: 'availability',
        name: 'System Availability',
        type: 'availability',
        target: '99.9%',
        measurement: 'HTTP 200 responses / Total HTTP responses',
        current: '99.95%',
        trend: 'meeting',
      },
      {
        id: 'api-latency',
        name: 'API Response Time',
        type: 'latency',
        target: '<200ms',
        measurement: 'P95 response time for API endpoints',
        current: '150ms',
        trend: 'meeting',
      },
    ];
  }
}

/**
 * Load glossary terms
 */
export function getGlossaryTerms(): GlossaryTerm[] {
  try {
    return loadJsonData<GlossaryTerm[]>('glossary.json');
  } catch {
    return [
      {
        term: 'ADR',
        definition: 'Architecture Decision Record - A document that captures an important architectural decision made along with its context and consequences.',
        acronym: 'Architecture Decision Record',
        category: 'Documentation',
        relatedTerms: ['Architecture', 'Documentation'],
      },
      {
        term: 'KPI',
        definition: 'Key Performance Indicator - A measurable value that demonstrates how effectively a company is achieving key business objectives.',
        acronym: 'Key Performance Indicator',
        category: 'Business',
      },
    ];
  }
}

/**
 * Load external links
 */
export function getExternalLinks(): ExternalLink[] {
  try {
    return loadJsonData<ExternalLink[]>('links.json');
  } catch {
    return [
      {
        name: 'GitHub Repository',
        url: 'https://github.com/devmemoryos/living-spec',
        type: 'repository',
        description: 'Main project repository',
        icon: '🐙',
      },
      {
        name: 'Figma Designs',
        url: 'https://figma.com/devmemoryos',
        type: 'design',
        description: 'UI/UX designs and prototypes',
        icon: '🎨',
      },
    ];
  }
}

/**
 * Load and parse all ADR files
 */
export function getArchitectureDecisionRecords(): ArchitectureDecisionRecord[] {
  try {
    const adrFiles = readdirSync(ADR_DIR).filter(file => file.endsWith('.md'));
    
    return adrFiles.map(file => {
      const filePath = join(ADR_DIR, file);
      const fileContent = readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      
      // Extract ID from filename (e.g., "ADR-0001-title.md" -> "ADR-0001")
      const idMatch = file.match(/^(ADR-\d+)/i);
      const id = idMatch ? idMatch[1] : file.replace('.md', '');
      
      return {
        id,
        title: data.title || file.replace('.md', '').replace(/^\w+-\d+-/, '').replace(/-/g, ' '),
        status: data.status || 'proposed',
        date: data.date || new Date().toISOString().split('T')[0],
        context: data.context || '',
        decision: data.decision || '',
        consequences: data.consequences || [],
        alternatives: data.alternatives || [],
        tags: data.tags || [],
        author: data.author || 'Unknown',
        links: data.links || {},
      } as ArchitectureDecisionRecord;
    }).sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error('Error loading ADRs:', error);
    return [];
  }
}

/**
 * Get a specific ADR by ID
 */
export function getAdrById(id: string): ArchitectureDecisionRecord | null {
  const adrs = getArchitectureDecisionRecords();
  return adrs.find(adr => adr.id.toLowerCase() === id.toLowerCase()) || null;
}

/**
 * Get ADR content as markdown
 */
export function getAdrContent(id: string): string {
  try {
    const adrFiles = readdirSync(ADR_DIR);
    const file = adrFiles.find(f => f.toLowerCase().startsWith(id.toLowerCase()));
    
    if (!file) return '';
    
    const filePath = join(ADR_DIR, file);
    return readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Parse changelog entries from CHANGELOG.md
 */
export function getChangelogEntries(limit = 10): ChangelogEntry[] {
  try {
    const changelogContent = readFileSync(CHANGELOG_PATH, 'utf-8');
    const entries: ChangelogEntry[] = [];
    
    // Simple parser for conventional changelog format
    const lines = changelogContent.split('\n');
    let currentEntry: Partial<ChangelogEntry> | null = null;
    
    for (const line of lines) {
      // Version header (e.g., "## [1.2.0] - 2024-01-15")
      const versionMatch = line.match(/^##\s*\[?([^\]]+)\]?\s*-?\s*(\d{4}-\d{2}-\d{2})?/);
      if (versionMatch) {
        if (currentEntry) {
          entries.push(currentEntry as ChangelogEntry);
        }
        currentEntry = {
          version: versionMatch[1] || '',
          date: versionMatch[2] || new Date().toISOString().split('T')[0],
          type: 'feat', // Default type
          title: '',
          description: '',
        };
        continue;
      }
      
      // Entry line (e.g., "- feat: Added new dashboard component")
      const entryMatch = line.match(/^-\s*(\w+):\s*(.+)$/);
      if (entryMatch && currentEntry) {
        currentEntry.type = entryMatch[1] as ChangelogEntry['type'];
        currentEntry.title = entryMatch[2] || '';
      }
      
      // Description continuation
      if (line.trim() && !line.startsWith('#') && !line.startsWith('-') && currentEntry) {
        currentEntry.description = (currentEntry.description || '') + ' ' + line.trim();
      }
    }
    
    if (currentEntry) {
      entries.push(currentEntry as ChangelogEntry);
    }
    
    return entries.slice(0, limit);
  } catch (error) {
    console.error('Error loading changelog:', error);
    return [];
  }
}

/**
 * Get project version from package.json
 */
export function getProjectVersion(): string {
  try {
    const packagePath = join(process.cwd(), 'package.json');
    const packageContent = readFileSync(packagePath, 'utf-8');
    const packageData = JSON.parse(packageContent);
    return packageData.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

/**
 * Get milestones data
 */
export function getMilestones() {
  try {
    return loadJsonData('milestones.json');
  } catch {
    return [
      {
        id: 'mvp',
        title: 'MVP Release',
        description: 'Initial product release with core features',
        owner: 'Development Team',
        dueDate: '2024-03-01T00:00:00Z',
        status: 'in-progress',
        progress: 75,
        tags: ['release', 'mvp'],
        dependencies: ['UI Development', 'Backend API'],
      },
      {
        id: 'beta',
        title: 'Beta Testing Phase',
        description: 'Comprehensive testing with early adopters',
        owner: 'QA Team',
        dueDate: '2024-04-15T00:00:00Z',
        status: 'planned',
        progress: 0,
        tags: ['testing', 'beta'],
        dependencies: ['MVP Release'],
      },
    ];
  }
}

/**
 * Get timeline data
 */
export function getTimeline() {
  try {
    return loadJsonData('timeline.json');
  } catch {
    return [
      {
        id: 'project-start',
        title: 'Project Kickoff',
        description: 'Initial project planning and team assembly',
        date: '2024-01-15T10:00:00Z',
        status: 'completed',
        category: 'planning',
        author: 'Team Lead',
      },
      {
        id: 'architecture',
        title: 'Architecture Design',
        description: 'System architecture and technology decisions',
        date: '2024-01-22T14:00:00Z',
        status: 'completed',
        category: 'design',
        author: 'Tech Lead',
      },
      {
        id: 'development',
        title: 'Development Phase Start',
        description: 'Core development work begins',
        date: '2024-02-01T09:00:00Z',
        status: 'in-progress',
        category: 'development',
        author: 'Development Team',
      },
    ];
  }
}