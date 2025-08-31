/**
 * 🤖 AI Team System Types and Enums
 */

import { randomUUID } from 'crypto';

// Specialist Role Types
export const SpecialistRoles = {
  BACKEND: 'backend',
  FRONTEND: 'frontend',
  TESTING: 'testing',
  DEVOPS: 'devops',
  SECURITY: 'security',
  UI_UX: 'ui-ux',
  DATA: 'data',
  AI_ML: 'ai-ml'
};

// Specialist Status Types
export const SpecialistStatus = {
  IDLE: 'idle',
  BUSY: 'busy',
  ERROR: 'error',
  OFFLINE: 'offline'
};

// Task Types
export const TaskTypes = {
  CODE_GENERATION: 'code-generation',
  CODE_REVIEW: 'code-review',
  TESTING: 'testing',
  DEPLOYMENT: 'deployment',
  DOCUMENTATION: 'documentation',
  ARCHITECTURE: 'architecture',
  BUG_FIX: 'bug-fix',
  OPTIMIZATION: 'optimization',
  SECURITY_AUDIT: 'security-audit',
  PERFORMANCE_OPTIMIZATION: 'performance-optimization',
  REFACTORING: 'refactoring'
};

// Message Types for Specialist Communication
export const MessageTypes = {
  COORDINATION: 'coordination',
  QUESTION: 'question',
  ANSWER: 'answer',
  COLLABORATION: 'collaboration',
  STATUS_UPDATE: 'status-update',
  TASK_ASSIGNMENT: 'task-assignment',
  TASK_COMPLETION: 'task-completion'
};

// Priority Levels
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Project Status Types
export const ProjectStatus = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Create memory store for specialists
 */
export function createMemoryStore() {
  return {
    projects: new Map(),
    patterns: new Map(),
    decisions: new Map(),
    learnings: new Map(),
    collaborations: new Map(),
    metrics: new Map()
  };
}

/**
 * Task interface structure
 */
export function createTask(config = {}) {
  return {
    id: config.id || randomUUID(),
    type: config.type || TaskTypes.CODE_GENERATION,
    description: config.description || '',
    priority: config.priority || TaskPriority.MEDIUM,
    assignee: config.assignee || null,
    status: 'pending',
    createdAt: new Date(),
    deadline: config.deadline || null,
    dependencies: config.dependencies || [],
    techStack: config.techStack || [],
    complexity: config.complexity || 'medium',
    metadata: config.metadata || {}
  };
}

/**
 * Project interface structure
 */
export function createProject(config = {}) {
  return {
    id: config.id || randomUUID(),
    name: config.name || 'Untitled Project',
    description: config.description || '',
    status: ProjectStatus.PLANNING,
    tasks: config.tasks || [],
    specialists: config.specialists || [],
    startDate: config.startDate || new Date(),
    deadline: config.deadline || null,
    techStack: config.techStack || [],
    patterns: config.patterns || [],
    metadata: config.metadata || {}
  };
}

export default {
  SpecialistRoles,
  SpecialistStatus,
  TaskTypes,
  MessageTypes,
  TaskPriority,
  ProjectStatus,
  createMemoryStore,
  createTask,
  createProject
};