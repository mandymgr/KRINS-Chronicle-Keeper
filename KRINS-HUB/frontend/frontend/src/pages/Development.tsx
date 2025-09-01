import React from 'react';

export const Development: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Pipeline Status */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-3.5xl font-normal" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)', marginBottom: '2rem'}}>
          Development Pipeline
        </h1>
        <p style={{color: 'var(--stone-500)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 4rem'}}>
          Real-time development status and deployment pipeline overview
        </p>
      </div>

      {/* Deployment Commands */}
      <div className="card p-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-normal mb-8" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>Workspace Commands</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6" style={{background: 'var(--stone-100)'}}>
            <div className="text-sm font-medium uppercase tracking-wide mb-2" style={{color: 'var(--ink)'}}>MCP Adapter</div>
            <code className="text-sm" style={{color: 'var(--stone-500)', fontFamily: 'monospace'}}>bun run mcp:adapter</code>
            <p className="text-xs mt-2" style={{color: 'var(--stone-500)'}}>Start standard MCP adapter (STDIN/STDOUT)</p>
          </div>
          
          <div className="p-6" style={{background: 'var(--stone-100)'}}>
            <div className="text-sm font-medium uppercase tracking-wide mb-2" style={{color: 'var(--ink)'}}>AI Team</div>
            <code className="text-sm" style={{color: 'var(--stone-500)', fontFamily: 'monospace'}}>bun run ai:mcp-team</code>
            <p className="text-xs mt-2" style={{color: 'var(--stone-500)'}}>Start AI team coordination system</p>
          </div>
          
          <div className="p-6" style={{background: 'var(--stone-100)'}}>
            <div className="text-sm font-medium uppercase tracking-wide mb-2" style={{color: 'var(--ink)'}}>Deployment</div>
            <code className="text-sm" style={{color: 'var(--stone-500)', fontFamily: 'monospace'}}>bun run deploy:mcp-ai-team</code>
            <p className="text-xs mt-2" style={{color: 'var(--stone-500)'}}>Level 4 canary deployment with rollback</p>
          </div>
          
          <div className="p-6" style={{background: 'var(--stone-100)'}}>
            <div className="text-sm font-medium uppercase tracking-wide mb-2" style={{color: 'var(--ink)'}}>Security</div>
            <code className="text-sm" style={{color: 'var(--stone-500)', fontFamily: 'monospace'}}>bun run secops:scan</code>
            <p className="text-xs mt-2" style={{color: 'var(--stone-500)'}}>Security gates scanning with gitleaks/trivy</p>
          </div>
        </div>
      </div>

      {/* Current ADRs */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-normal mb-8" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>Recent Architecture Decisions</h2>
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-normal" style={{fontFamily: 'var(--font-serif)'}}>ADR-0016: Domain Packs Architecture</h3>
              <span className="text-xs uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Active</span>
            </div>
            <p style={{color: 'var(--stone-500)', lineHeight: '1.7'}}>Modular architecture system for scalable development patterns</p>
          </div>
          
          <div className="card p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-normal" style={{fontFamily: 'var(--font-serif)'}}>ADR-0015: MiFID GDPR Compliance Engine</h3>
              <span className="text-xs uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Planning</span>
            </div>
            <p style={{color: 'var(--stone-500)', lineHeight: '1.7'}}>Financial compliance and data protection implementation</p>
          </div>
          
          <div className="card p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-normal" style={{fontFamily: 'var(--font-serif)'}}>ADR-0014: Docker Production Monitoring</h3>
              <span className="text-xs uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Deployed</span>
            </div>
            <p style={{color: 'var(--stone-500)', lineHeight: '1.7'}}>Production monitoring and health check implementation</p>
          </div>
        </div>
      </div>

      {/* Development Patterns */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-normal mb-8" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>Development Patterns</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-8">
            <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>CI/CD Gate Pattern</h3>
            <p style={{color: 'var(--stone-500)', lineHeight: '1.7', marginBottom: '1rem'}}>
              Automated quality gates with security scanning and deployment pipelines
            </p>
            <div className="text-sm font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Active</div>
          </div>
          
          <div className="card p-8">
            <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>ADR-Driven Development</h3>
            <p style={{color: 'var(--stone-500)', lineHeight: '1.7', marginBottom: '1rem'}}>
              Architecture decision records as foundation for development workflow
            </p>
            <div className="text-sm font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Implemented</div>
          </div>
          
          <div className="card p-8">
            <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>API Rate Limiting Pattern</h3>
            <p style={{color: 'var(--stone-500)', lineHeight: '1.7', marginBottom: '1rem'}}>
              Intelligent rate limiting with adaptive throttling mechanisms
            </p>
            <div className="text-sm font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Testing</div>
          </div>
          
          <div className="card p-8">
            <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>Runbook-Driven Operations</h3>
            <p style={{color: 'var(--stone-500)', lineHeight: '1.7', marginBottom: '1rem'}}>
              Operational procedures as code with automated execution
            </p>
            <div className="text-sm font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Operational</div>
          </div>
        </div>
      </div>
    </div>
  );
};