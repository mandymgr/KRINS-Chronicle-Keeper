import { v4 as uuid } from "uuid";

export class ToolingClient {
  private baseUrl: string;
  private specialistId: string | null = null;

  constructor(url: string) {
    // Convert WebSocket URL to HTTP URL for our MCP-AI-Team REST API
    this.baseUrl = url.replace('ws://', 'http://').replace('/ws', '');
    this.initializeSpecialist();
  }
  
  private async initializeSpecialist() {
    try {
      // Spawn a specialist for tool operations
      const response = await fetch(`${this.baseUrl}/specialists/spawn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'BACKEND', config: { name: 'MCP-Tooling-Specialist' } })
      });
      const result = await response.json();
      if (result.success && result.specialist) {
        this.specialistId = result.specialist.id;
      }
    } catch (error) {
      console.error('Failed to initialize MCP tooling specialist:', error);
    }
  }
  private async call(method: string, params: any = {}, agent?: string): Promise<any> {
    if (!this.specialistId) {
      await this.initializeSpecialist();
      if (!this.specialistId) {
        throw new Error('Failed to initialize MCP tooling specialist');
      }
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/specialists/${this.specialistId}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `Execute ${method} with params: ${JSON.stringify(params)}`,
          type: 'CODE_GENERATION',
          method,
          params,
          agent
        })
      });
      
      const result = await response.json();
      if (result.success) {
        return { result: result.result };
      } else {
        throw new Error(result.error || 'Task execution failed');
      }
    } catch (error) {
      throw new Error(`MCP tooling call failed: ${error}`);
    }
  }
  // Standard MCP tooling methods - now backed by our AI specialist system
  async readFile(path: string, agent?: string) { 
    return this.call("read_file", {path}, agent); 
  }
  
  async writeFile(path: string, content: string, agent?: string, ifNotExists?: boolean, expectedHash?: string) { 
    return this.call("write_file", {path, content, ifNotExists, expectedHash}, agent); 
  }
  
  async searchCode(pattern: string, globs?: string[], agent?: string) { 
    return this.call("search_code", {pattern, globs}, agent); 
  }
  
  async run(cmd: string, args: string[] = [], cwd?: string, agent?: string, timeoutMs?: number) { 
    return this.call("run", {cmd,args,cwd,timeoutMs}, agent); 
  }
  
  async git(subcmd: "add"|"commit"|"status"|"restore", args: string[] = [], cwd?: string, agent?: string) { 
    return this.call("git", {subcmd,args,cwd}, agent); 
  }
  
  async test(framework: "bun"|"vitest"|"jest"="bun", args: string[] = [], cwd?: string, agent?: string) { 
    return this.call("test", {framework,args,cwd}, agent); 
  }
}
