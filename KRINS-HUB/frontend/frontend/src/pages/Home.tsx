import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="editorial-title" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: '3.5rem', marginBottom: '2rem'}}>
          Dev Memory OS
        </h1>
        <p className="editorial-subtitle" style={{color: 'var(--stone-500)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 4rem'}}>
          AI Team Coordination System
        </p>
        <div className="card p-12" style={{background: 'var(--accent)', color: 'var(--accent-ink)'}}>
          <h2 style={{fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 'normal', marginBottom: '1.5rem'}}>Autonomous AI Development Team</h2>
          <p className="text-base mb-8 leading-relaxed">
            A coordination system managing eight specialized AI agents 
            working together autonomously across the development lifecycle.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-center mt-8">
            <div className="p-4 border-r border-white border-opacity-20">
              <div className="text-xs font-medium uppercase tracking-wider">Backend</div>
            </div>
            <div className="p-4 border-r border-white border-opacity-20">
              <div className="text-xs font-medium uppercase tracking-wider">Frontend</div>
            </div>
            <div className="p-4 border-r border-white border-opacity-20">
              <div className="text-xs font-medium uppercase tracking-wider">Testing</div>
            </div>
            <div className="p-4">
              <div className="text-xs font-medium uppercase tracking-wider">Security</div>
            </div>
            <div className="p-4 border-r border-white border-opacity-20">
              <div className="text-xs font-medium uppercase tracking-wider">Performance</div>
            </div>
            <div className="p-4 border-r border-white border-opacity-20">
              <div className="text-xs font-medium uppercase tracking-wider">Design</div>
            </div>
            <div className="p-4 border-r border-white border-opacity-20">
              <div className="text-xs font-medium uppercase tracking-wider">Data</div>
            </div>
            <div className="p-4">
              <div className="text-xs font-medium uppercase tracking-wider">Intelligence</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="card p-8">
          <h3 className="text-xl font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>AI Team Dashboard</h3>
          <p className="text-base leading-relaxed mb-6" style={{color: 'var(--stone-500)'}}>
            Monitor all eight AI specialists in real-time, track performance metrics, 
            and observe autonomous development processes.
          </p>
          <a href="/ai-team" className="text-sm uppercase tracking-wide font-medium" style={{color: 'var(--ink)'}}>
            View Team Status
          </a>
        </div>

        <div className="card p-8">
          <h3 className="text-xl font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>Architecture Decisions</h3>
          <p className="text-base leading-relaxed mb-6" style={{color: 'var(--stone-500)'}}>
            Browse Architecture Decision Records documenting the 
            design decisions behind the AI coordination system.
          </p>
          <a href="/adrs" className="text-sm uppercase tracking-wide font-medium" style={{color: 'var(--ink)'}}>
            Explore ADRs
          </a>
        </div>

        <div className="card p-8">
          <h3 className="text-xl font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>Pattern Search</h3>
          <p className="text-base leading-relaxed mb-6" style={{color: 'var(--stone-500)'}}>
            Search through development patterns, best practices, and 
            AI coordination strategies used by the team.
          </p>
          <a href="/search" className="text-sm uppercase tracking-wide font-medium" style={{color: 'var(--ink)'}}>
            Search Patterns
          </a>
        </div>
      </div>

      {/* Development Pipeline Status */}
      <div className="mt-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-normal mb-8" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>Development Pipeline</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card p-8">
            <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>MCP Protocol</h3>
            <p style={{color: 'var(--stone-500)', lineHeight: '1.7', marginBottom: '1rem'}}>
              Standard MCP compliance with Level 4 deployment pipeline
            </p>
            <div className="text-sm font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Active</div>
          </div>
          
          <div className="card p-8">
            <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>Security Gates</h3>
            <p style={{color: 'var(--stone-500)', lineHeight: '1.7', marginBottom: '1rem'}}>
              Automated gitleaks and trivy security scanning
            </p>
            <div className="text-sm font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Operational</div>
          </div>
          
          <div className="card p-8">
            <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>Hybrid System</h3>
            <p style={{color: 'var(--stone-500)', lineHeight: '1.7', marginBottom: '1rem'}}>
              AI Team Coordination with Docker containerization
            </p>
            <div className="text-sm font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Deployed</div>
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="mt-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-normal mb-8" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>Active Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <h4 className="text-sm font-medium uppercase tracking-wide mb-2" style={{color: 'var(--ink)'}}>Trading Platform</h4>
            <p className="text-sm mb-3" style={{color: 'var(--stone-500)'}}>Rust/WASM orderbook engine</p>
            <div className="text-xs uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>In Development</div>
          </div>
          
          <div className="card p-6">
            <h4 className="text-sm font-medium uppercase tracking-wide mb-2" style={{color: 'var(--ink)'}}>Domain Packs</h4>
            <p className="text-sm mb-3" style={{color: 'var(--stone-500)'}}>Modular architecture system</p>
            <div className="text-xs uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Architecture</div>
          </div>
          
          <div className="card p-6">
            <h4 className="text-sm font-medium uppercase tracking-wide mb-2" style={{color: 'var(--ink)'}}>Compliance Engine</h4>
            <p className="text-sm mb-3" style={{color: 'var(--stone-500)'}}>GDPR/MiFID implementation</p>
            <div className="text-xs uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Planning</div>
          </div>
          
          <div className="card p-6">
            <h4 className="text-sm font-medium uppercase tracking-wide mb-2" style={{color: 'var(--ink)'}}>Real-time Dashboard</h4>
            <p className="text-sm mb-3" style={{color: 'var(--stone-500)'}}>Live data visualization</p>
            <div className="text-xs uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Testing</div>
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="mt-16 card p-12 max-w-6xl mx-auto" style={{background: 'var(--stone-100)'}}>
        <h2 className="text-2xl font-normal mb-8" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>System Architecture</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <div className="text-lg font-medium mb-2" style={{color: 'var(--ink)'}}>Layer 1</div>
            <div className="text-sm uppercase tracking-wide mb-3" style={{color: 'var(--stone-500)'}}>Standard MCP Interface</div>
            <p className="text-sm" style={{color: 'var(--stone-500)', lineHeight: '1.6'}}>JSON-RPC bridge for industry compliance</p>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-medium mb-2" style={{color: 'var(--ink)'}}>Layer 2</div>
            <div className="text-sm uppercase tracking-wide mb-3" style={{color: 'var(--stone-500)'}}>AI Team Coordination</div>
            <p className="text-sm" style={{color: 'var(--stone-500)', lineHeight: '1.6'}}>WebSocket real-time coordination</p>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-medium mb-2" style={{color: 'var(--ink)'}}>Layer 3</div>
            <div className="text-sm uppercase tracking-wide mb-3" style={{color: 'var(--stone-500)'}}>Deployment Pipeline</div>
            <p className="text-sm" style={{color: 'var(--stone-500)', lineHeight: '1.6'}}>Docker containerization with security</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 text-center" style={{background: 'var(--paper)'}}>
            <div className="font-medium mb-1" style={{color: 'var(--ink)'}}>16</div>
            <div className="uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Active ADRs</div>
          </div>
          <div className="p-3 text-center" style={{background: 'var(--paper)'}}>
            <div className="font-medium mb-1" style={{color: 'var(--ink)'}}>7+</div>
            <div className="uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Dev Patterns</div>
          </div>
          <div className="p-3 text-center" style={{background: 'var(--paper)'}}>
            <div className="font-medium mb-1" style={{color: 'var(--ink)'}}>5</div>
            <div className="uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>AI Specialists</div>
          </div>
          <div className="p-3 text-center" style={{background: 'var(--paper)'}}>
            <div className="font-medium mb-1" style={{color: 'var(--ink)'}}>3</div>
            <div className="uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Deploy Modes</div>
          </div>
        </div>
      </div>

      <div className="card p-8" style={{background: 'var(--stone-100)', border: '1px solid var(--stone-200)'}}>
        <h2 className="text-xl font-normal mb-6" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>
          System Status
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Coordinator:</span>
            <span className="ml-2" style={{color: 'var(--stone-500)'}}>Active</span>
          </div>
          <div>
            <span className="font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Performance:</span>
            <span className="ml-2" style={{color: 'var(--stone-500)'}}>Monitoring</span>
          </div>
          <div>
            <span className="font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Security:</span>
            <span className="ml-2" style={{color: 'var(--stone-500)'}}>Scanning</span>
          </div>
          <div>
            <span className="font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Frontend:</span>
            <span className="ml-2" style={{color: 'var(--stone-500)'}}>Optimizing</span>
          </div>
        </div>
      </div>
    </div>
  );
};