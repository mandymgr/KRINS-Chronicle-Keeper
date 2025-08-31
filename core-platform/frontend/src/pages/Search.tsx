import React, { useState } from 'react';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">🔍 Search System</h1>
      <p className="text-gray-600">Search through AI patterns, ADRs, and development knowledge.</p>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patterns, ADRs, or AI coordination strategies..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="space-y-3">
          <div className="p-3 border border-gray-200 rounded">
            <h4 className="font-semibold">AI Performance Optimization Pattern</h4>
            <p className="text-sm text-gray-600">Real-time monitoring and autonomous optimization...</p>
          </div>
          
          <div className="p-3 border border-gray-200 rounded">
            <h4 className="font-semibold">MCP Communication Protocol</h4>
            <p className="text-sm text-gray-600">Revolutionary AI-to-AI coordination system...</p>
          </div>
        </div>
      </div>
    </div>
  );
};