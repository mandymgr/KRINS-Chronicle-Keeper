import { z } from 'zod';

// Environment schema with strict validation
const envSchema = z.object({
  // Integration feature flags
  INTEGRATION_GITHUB: z.enum(['on', 'off']).default('off'),
  INTEGRATION_JIRA: z.enum(['on', 'off']).default('off'),
  
  // GitHub configuration
  GITHUB_OWNER: z.string().optional(),
  GITHUB_REPO: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  
  // Jira configuration
  JIRA_BASE_URL: z.string().url().optional(),
  JIRA_EMAIL: z.string().email().optional(),
  JIRA_API_TOKEN: z.string().optional(),
  JIRA_PROJECT_KEY: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('Environment validation failed:', result.error.issues);
    throw new Error('Invalid environment configuration');
  }
  
  return result.data;
}

// Validate integration-specific requirements
function validateIntegrationConfig(env: Env): void {
  if (env.INTEGRATION_GITHUB === 'on') {
    if (!env.GITHUB_OWNER || !env.GITHUB_REPO || !env.GITHUB_TOKEN) {
      throw new Error(
        'GitHub integration enabled but missing required configuration: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN'
      );
    }
    console.log(`GitHub integration active: ${env.GITHUB_OWNER}/${env.GITHUB_REPO}`);
  }
  
  if (env.INTEGRATION_JIRA === 'on') {
    if (!env.JIRA_BASE_URL || !env.JIRA_EMAIL || !env.JIRA_API_TOKEN || !env.JIRA_PROJECT_KEY) {
      throw new Error(
        'Jira integration enabled but missing required configuration: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY'
      );
    }
    console.log(`Jira integration active: ${env.JIRA_BASE_URL}/projects/${env.JIRA_PROJECT_KEY}`);
  }
  
  // Log active integrations (without secrets)
  const activeIntegrations = [];
  if (env.INTEGRATION_GITHUB === 'on') activeIntegrations.push('GitHub');
  if (env.INTEGRATION_JIRA === 'on') activeIntegrations.push('Jira');
  
  if (activeIntegrations.length === 0) {
    console.log('No external integrations active - using local data sources');
  } else {
    console.log(`Active integrations: ${activeIntegrations.join(', ')}`);
  }
}

// Initialize and export validated environment
let env: Env;
try {
  env = parseEnv();
  validateIntegrationConfig(env);
} catch (error) {
  console.error('Environment initialization failed:', error);
  // In development, continue with default values for graceful degradation
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using default environment values for development');
    env = {
      INTEGRATION_GITHUB: 'off',
      INTEGRATION_JIRA: 'off',
      NODE_ENV: 'development',
    };
  } else {
    throw error;
  }
}

export { env };

// Utility functions for checking integration status
export const isGitHubEnabled = () => env.INTEGRATION_GITHUB === 'on';
export const isJiraEnabled = () => env.INTEGRATION_JIRA === 'on';

// Configuration objects (safe to use in application)
export const gitHubConfig = env.INTEGRATION_GITHUB === 'on' ? {
  owner: env.GITHUB_OWNER!,
  repo: env.GITHUB_REPO!,
  token: env.GITHUB_TOKEN!,
  baseUrl: 'https://api.github.com',
} : null;

export const jiraConfig = env.INTEGRATION_JIRA === 'on' ? {
  baseUrl: env.JIRA_BASE_URL!,
  email: env.JIRA_EMAIL!,
  token: env.JIRA_API_TOKEN!,
  projectKey: env.JIRA_PROJECT_KEY!,
} : null;