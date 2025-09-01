import React from 'react';

export const Patterns: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-normal" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>Development Patterns</h1>
      <p style={{color: 'var(--stone-500)'}}>AI coordination and development patterns used by the team.</p>
      
      <div className="grid gap-4">
        <div className="card p-8">
          <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>AI-to-AI Communication Pattern</h3>
          <p style={{color: 'var(--stone-500)', lineHeight: '1.7'}}>MCP protocol for autonomous AI coordination.</p>
        </div>
        
        <div className="card p-8">
          <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>Real-time Performance Monitoring</h3>
          <p style={{color: 'var(--stone-500)', lineHeight: '1.7'}}>Continuous system optimization with autonomous performance specialists.</p>
        </div>
      </div>
    </div>
  );
};