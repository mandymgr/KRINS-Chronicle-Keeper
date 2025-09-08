/**
 * 🚀 Krin's Revolutionary AI Team Coordination Types
 * Model Context Protocol Integration for Real AI-to-AI Communication
 */

/**
 * AI Specialist Roles with specific capabilities
 */
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

/**
 * Task Types for AI Specialist Coordination
 */
export const TaskTypes = {
  CODE_GENERATION: 'code-generation',
  CODE_REVIEW: 'code-review',
  TESTING: 'testing',
  DEPLOYMENT: 'deployment',
  DOCUMENTATION: 'documentation',
  ARCHITECTURE: 'architecture',
  BUG_FIX: 'bug-fix',
  OPTIMIZATION: 'optimization'
};

/**
 * Communication Types between AI Specialists
 */
export const MessageTypes = {
  TASK_ASSIGNMENT: 'task-assignment',
  TASK_COMPLETION: 'task-completion', 
  QUESTION: 'question',
  ANSWER: 'answer',
  COORDINATION: 'coordination',
  STATUS_UPDATE: 'status-update',
  ERROR_REPORT: 'error-report',
  SUCCESS_REPORT: 'success-report'
};

/**
 * Project Context Information
 */
export const ProjectContexts = {
  WEB_APP: 'web-app',
  MOBILE_APP: 'mobile-app',
  API_SERVICE: 'api-service',
  MICROSERVICE: 'microservice',
  LIBRARY: 'library',
  CLI_TOOL: 'cli-tool',
  DESKTOP_APP: 'desktop-app'
};

/**
 * Technology Stacks
 */
export const TechStacks = {
  REACT_TYPESCRIPT: 'react-typescript',
  NODE_EXPRESS: 'node-express',
  PYTHON_FASTAPI: 'python-fastapi',
  NEXT_JS: 'next-js',
  RUST: 'rust',
  GO: 'go',
  JAVA_SPRING: 'java-spring',
  DOTNET: 'dotnet'
};

/**
 * AI Specialist Memory Store Structure
 */
export const createMemoryStore = () => ({
  projects: new Map(),
  patterns: new Map(),
  decisions: new Map(),
  learnings: new Map(),
  collaborations: new Map()
});

/**
 * Task Priority Levels
 */
export const TaskPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Specialist Status Types
 */
export const SpecialistStatus = {
  ACTIVE: 'active',
  BUSY: 'busy',
  IDLE: 'idle',
  OFFLINE: 'offline',
  ERROR: 'error'
};