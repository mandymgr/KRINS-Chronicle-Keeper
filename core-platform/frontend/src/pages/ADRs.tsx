import React from 'react';

export const ADRs: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">📋 Architecture Decision Records</h1>
      <p className="text-gray-600">Documenting the revolutionary AI team coordination decisions.</p>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">ADR-001: MCP Protocol for AI Coordination</h3>
          <p className="text-gray-600 mb-2">Decision to use Model Context Protocol for real-time AI-to-AI communication.</p>
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Accepted</span>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">ADR-002: Autonomous Performance Optimization</h3>
          <p className="text-gray-600 mb-2">Implementation of AI specialist for continuous performance monitoring and optimization.</p>
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Accepted</span>
        </div>
      </div>
    </div>
  );
};