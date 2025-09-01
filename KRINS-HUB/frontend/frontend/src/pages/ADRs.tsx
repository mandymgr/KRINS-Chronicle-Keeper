import React from 'react';

export const ADRs: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-normal" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>Architecture Decision Records</h1>
      <p style={{color: 'var(--stone-500)'}}>Documenting AI team coordination decisions.</p>
      
      <div className="space-y-4">
        <div className="card p-8">
          <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>ADR-001: MCP Protocol for AI Coordination</h3>
          <p style={{color: 'var(--stone-500)', lineHeight: '1.7', marginBottom: '1rem'}}>Decision to use Model Context Protocol for AI-to-AI communication.</p>
          <span className="text-xs font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Accepted</span>
        </div>
        
        <div className="card p-8">
          <h3 className="text-lg font-normal mb-4" style={{fontFamily: 'var(--font-serif)'}}>ADR-002: Autonomous Performance Optimization</h3>
          <p style={{color: 'var(--stone-500)', lineHeight: '1.7', marginBottom: '1rem'}}>Implementation of AI specialist for continuous performance monitoring and optimization.</p>
          <span className="text-xs font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Accepted</span>
        </div>
      </div>
    </div>
  );
};