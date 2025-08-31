import React from 'react';

export const Patterns: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">📝 Development Patterns</h1>
      <p className="text-gray-600">AI coordination and development patterns used by Krin's team.</p>
      
      <div className="grid gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">🤖 AI-to-AI Communication Pattern</h3>
          <p className="text-gray-600">Revolutionary MCP protocol for autonomous AI coordination.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">⚡ Real-time Performance Monitoring</h3>
          <p className="text-gray-600">Continuous system optimization with autonomous performance specialists.</p>
        </div>
      </div>
    </div>
  );
};