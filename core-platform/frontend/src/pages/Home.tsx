import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🧠 Dev Memory OS
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Revolutionary AI Team Coordination System
        </p>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">🚀 World's First Autonomous AI Development Team</h2>
          <p className="text-lg mb-6">
            Experience the future of software development with Krin's AI Team Coordinator 
            managing 8 specialized AI agents working together autonomously.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm">Backend</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm">Frontend</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">🧪</div>
              <div className="text-sm">Testing</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="text-sm">Security</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm">Performance</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">✨</div>
              <div className="text-sm">UI/UX</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm">Data</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl mb-2">🤖</div>
              <div className="text-sm">AI/ML</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">🧠 AI Team Dashboard</h3>
          <p className="text-gray-600 mb-4">
            Monitor all 8 AI specialists in real-time, track performance metrics, 
            and watch autonomous development in action.
          </p>
          <a href="/ai-team" className="text-blue-600 hover:text-blue-700 font-medium">
            View Team Status →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">📝 Architecture Decisions</h3>
          <p className="text-gray-600 mb-4">
            Browse ADRs (Architecture Decision Records) documenting the 
            revolutionary design decisions behind the AI coordination system.
          </p>
          <a href="/adrs" className="text-blue-600 hover:text-blue-700 font-medium">
            Explore ADRs →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">🔍 Pattern Search</h3>
          <p className="text-gray-600 mb-4">
            Search through development patterns, best practices, and 
            AI coordination strategies used by the team.
          </p>
          <a href="/search" className="text-blue-600 hover:text-blue-700 font-medium">
            Search Patterns →
          </a>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-3">
          ✅ System Status: All AI Specialists Active
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>
            <span className="font-medium">🧠 Krin Coordinator:</span> Online & Managing
          </div>
          <div>
            <span className="font-medium">⚡ Performance Specialist:</span> Real-time Monitoring
          </div>
          <div>
            <span className="font-medium">🛡️ Security Specialist:</span> Continuous Scanning
          </div>
          <div>
            <span className="font-medium">🎨 Frontend Specialist:</span> UI Optimization
          </div>
        </div>
      </div>
    </div>
  );
};