// Core project types for Living Spec Dashboard

export interface ProjectMetadata {
  name: string;
  shortDescription: string;
  mission: string;
  phase: 'Discovery' | 'Build' | 'Scale' | 'Maintain';
  version: string;
  startDate: string;
  expectedLaunch?: string;
  team: {
    lead: string;
    members: string[];
    stakeholders: string[];
  };
  contact: {
    email: string;
    slack?: string;
    repository: string;
  };
}

export interface KpiMetric {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  target?: number | string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  description: string;
  icon: string;
  category: 'business' | 'technical' | 'user';
  lastUpdated: string;
}

export interface RoadmapPhase {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'planned';
  startDate: string;
  endDate?: string;
  milestones: Milestone[];
  exitCriteria: string[];
  description: string;
  color: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'at-risk' | 'blocked' | 'planned';
  progress: number; // 0-100
  dependencies?: string[];
  tags: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'done';
  owner: string;
  estimate: number; // story points or hours
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  createdDate: string;
  updatedDate: string;
  dueDate?: string;
  blockers?: string[];
}

export interface TechStackItem {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'observability' | 'design' | 'testing';
  version?: string;
  description: string;
  status: 'active' | 'planned' | 'deprecated' | 'research';
  logo?: string;
  documentation?: string;
  reasoning?: string; // why we chose this
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'business' | 'resource' | 'timeline' | 'external';
  probability: 1 | 2 | 3 | 4 | 5; // 1=very low, 5=very high
  impact: 1 | 2 | 3 | 4 | 5; // 1=very low, 5=very high
  owner: string;
  status: 'identified' | 'mitigating' | 'monitoring' | 'resolved';
  mitigation: string;
  contingency?: string;
  identifiedDate: string;
  lastReviewed: string;
}

export interface ArchitectureDecisionRecord {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'deprecated' | 'superseded';
  date: string;
  context: string;
  decision: string;
  consequences: string[];
  alternatives?: string[];
  links?: {
    supersedes?: string;
    supersededBy?: string;
    related?: string[];
  };
  tags: string[];
  author: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'breaking';
  title: string;
  description?: string;
  author?: string;
  pr?: string;
  issues?: string[];
}

export interface Environment {
  name: string;
  type: 'development' | 'staging' | 'production' | 'testing';
  url: string;
  status: 'healthy' | 'warning' | 'error' | 'maintenance';
  version: string;
  lastDeployed: string;
  deployedBy: string;
  healthCheck?: string;
  monitoring?: string;
}

export interface Requirement {
  id: string;
  title: string;
  type: 'functional' | 'non-functional' | 'constraint';
  priority: 'must' | 'should' | 'could' | 'wont';
  description: string;
  acceptanceCriteria: string[];
  status: 'draft' | 'approved' | 'implemented' | 'tested' | 'rejected';
  stakeholder: string;
  testCases?: string[];
}

export interface ServiceLevelObjective {
  id: string;
  name: string;
  type: 'availability' | 'latency' | 'throughput' | 'error-rate';
  target: string; // e.g., "99.9%" or "<100ms" or ">1000/s"
  measurement: string;
  current?: string;
  trend: 'meeting' | 'at-risk' | 'breaching';
  alerting?: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  acronym?: string;
  category: string;
  relatedTerms?: string[];
  examples?: string[];
}

export interface ExternalLink {
  name: string;
  url: string;
  type: 'repository' | 'design' | 'documentation' | 'monitoring' | 'project-management' | 'other';
  description: string;
  icon?: string;
}