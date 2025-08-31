import { z } from 'zod';

const integrationSchema = z.object({
  // Integration toggles
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
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnvironment() {
  try {
    const env = integrationSchema.parse(process.env);
    
    // Validate GitHub configuration when enabled
    if (env.INTEGRATION_GITHUB === 'on') {
      if (!env.GITHUB_OWNER || !env.GITHUB_REPO || !env.GITHUB_TOKEN) {
        throw new Error(
          'GitHub integration enabled but missing required variables: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN'
        );
      }
    }
    
    // Validate Jira configuration when enabled
    if (env.INTEGRATION_JIRA === 'on') {
      if (!env.JIRA_BASE_URL || !env.JIRA_EMAIL || !env.JIRA_API_TOKEN || !env.JIRA_PROJECT_KEY) {
        throw new Error(
          'Jira integration enabled but missing required variables: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY'
        );
      }
    }
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Environment validation failed: ${errorMessage}`);
    }
    throw error;
  }
}

export const config = validateEnvironment();

export const isGitHubEnabled = config.INTEGRATION_GITHUB === 'on';
export const isJiraEnabled = config.INTEGRATION_JIRA === 'on';

export const gitHubConfig = isGitHubEnabled
  ? {
      owner: config.GITHUB_OWNER!,
      repo: config.GITHUB_REPO!,
      token: config.GITHUB_TOKEN!,
      baseUrl: 'https://api.github.com',
    }
  : null;

export const jiraConfig = isJiraEnabled
  ? {
      baseUrl: config.JIRA_BASE_URL!,
      email: config.JIRA_EMAIL!,
      apiToken: config.JIRA_API_TOKEN!,
      projectKey: config.JIRA_PROJECT_KEY!,
    }
  : null;

export type GitHubConfig = NonNullable<typeof gitHubConfig>;
export type JiraConfig = NonNullable<typeof jiraConfig>;