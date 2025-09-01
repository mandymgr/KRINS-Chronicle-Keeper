import React, { useState } from 'react';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-normal" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>Search System</h1>
      <p style={{color: 'var(--stone-500)'}}>Search through AI patterns, ADRs, and development knowledge.</p>
      
      <div className="card p-8">
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patterns, ADRs, or AI coordination strategies..."
            className="w-full px-4 py-3 border border-stone-200 rounded-sm focus:outline-none focus:border-ink"
            style={{borderColor: 'var(--stone-200)', color: 'var(--ink)'}}
          />
        </div>
        
        <div className="space-y-3">
          <div className="p-4 border-b" style={{borderColor: 'var(--stone-200)'}}>
            <h4 className="font-medium text-sm uppercase tracking-wide mb-2" style={{color: 'var(--ink)'}}>AI Performance Optimization Pattern</h4>
            <p className="text-sm leading-relaxed" style={{color: 'var(--stone-500)'}}>Real-time monitoring and autonomous optimization</p>
          </div>
          
          <div className="p-4 border-b" style={{borderColor: 'var(--stone-200)'}}>
            <h4 className="font-medium text-sm uppercase tracking-wide mb-2" style={{color: 'var(--ink)'}}>MCP Communication Protocol</h4>
            <p className="text-sm leading-relaxed" style={{color: 'var(--stone-500)'}}>AI-to-AI coordination system</p>
          </div>
        </div>
      </div>
    </div>
  );
};