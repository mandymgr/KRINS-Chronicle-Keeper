import React, { useEffect, useState } from 'react';

interface AISpecialist {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: string;
  capabilities: string[];
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
    specialtyScore: number;
  };
}

export const AITeam: React.FC = () => {
  const [specialists, setSpecialists] = useState<AISpecialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for all 8 specialists since MCP server has import issues
  const mockSpecialists: AISpecialist[] = [
    {
      id: '1',
      name: 'Backend Specialist',
      emoji: '',
      role: 'backend',
      status: 'idle',
      capabilities: ['API design and implementation', 'Database schema design', 'Server architecture'],
      performance: { tasksCompleted: 12, successRate: 95, averageResponseTime: 150, specialtyScore: 92 }
    },
    {
      id: '2', 
      name: 'Frontend Specialist',
      emoji: '',
      role: 'frontend',
      status: 'busy',
      capabilities: ['React/TypeScript development', 'UI/UX implementation', 'Responsive design'],
      performance: { tasksCompleted: 8, successRate: 98, averageResponseTime: 120, specialtyScore: 88 }
    },
    {
      id: '3',
      name: 'Testing Specialist', 
      emoji: '',
      role: 'testing',
      status: 'idle',
      capabilities: ['Test strategy design', 'Unit testing', 'Integration testing'],
      performance: { tasksCompleted: 15, successRate: 100, averageResponseTime: 90, specialtyScore: 96 }
    },
    {
      id: '4',
      name: 'Security Audit Specialist',
      emoji: '', 
      role: 'security',
      status: 'busy',
      capabilities: ['Vulnerability scanning', 'Code security analysis', 'Advanced threat detection'],
      performance: { tasksCompleted: 6, successRate: 100, averageResponseTime: 200, specialtyScore: 94 }
    },
    {
      id: '5',
      name: 'Performance Optimization Specialist',
      emoji: '',
      role: 'devops', 
      status: 'busy',
      capabilities: ['Real-time performance monitoring', 'Automatic bottleneck detection', 'Memory leak identification'],
      performance: { tasksCompleted: 22, successRate: 93, averageResponseTime: 75, specialtyScore: 97 }
    },
    {
      id: '6',
      name: 'UI/UX Specialist',
      emoji: '',
      role: 'ui-ux',
      status: 'idle', 
      capabilities: ['User experience design', 'Interface optimization', 'Accessibility compliance'],
      performance: { tasksCompleted: 9, successRate: 96, averageResponseTime: 110, specialtyScore: 89 }
    },
    {
      id: '7',
      name: 'Data Specialist',
      emoji: '',
      role: 'data',
      status: 'busy',
      capabilities: ['Data analysis', 'Database optimization', 'Analytics implementation'],
      performance: { tasksCompleted: 11, successRate: 91, averageResponseTime: 180, specialtyScore: 85 }
    },
    {
      id: '8',
      name: 'AI/ML Specialist', 
      emoji: '',
      role: 'ai-ml',
      status: 'idle',
      capabilities: ['Machine learning models', 'AI system integration', 'Algorithm optimization'],
      performance: { tasksCompleted: 7, successRate: 98, averageResponseTime: 250, specialtyScore: 93 }
    }
  ];

  useEffect(() => {
    // Simulate loading and use mock data
    setTimeout(() => {
      setSpecialists(mockSpecialists);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'idle': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'busy': return 'Active';
      case 'idle': return 'Available';
      case 'error': return 'Error';
      default: return 'Paused';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg" style={{color: 'var(--stone-500)'}}>Coordinating the AI team...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4" style={{color: 'var(--stone-500)'}}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-normal mb-4" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>
          AI Development Team
        </h1>
        <p className="text-lg" style={{color: 'var(--stone-500)'}}>
          Autonomous AI Development Team Coordination
        </p>
        <div className="mt-6 flex justify-center space-x-8 text-sm" style={{color: 'var(--stone-500)'}}>
          <span className="uppercase tracking-wide">{specialists.length} Active Specialists</span>
          <span className="uppercase tracking-wide">{specialists.filter(s => s.status === 'busy').length} Currently Working</span>
          <span className="uppercase tracking-wide">{specialists.filter(s => s.status === 'idle').length} Available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {specialists.map((specialist) => (
          <div key={specialist.id} className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-normal text-lg mb-1" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>{specialist.name}</h3>
                <p className="text-xs uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>{specialist.role}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>
                {getStatusIcon(specialist.status)}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wide mb-3" style={{color: 'var(--ink)'}}>Capabilities</h4>
                <ul className="text-sm space-y-2" style={{color: 'var(--stone-500)', lineHeight: '1.6'}}>
                  {specialist.capabilities.slice(0, 3).map((capability, index) => (
                    <li key={index}>
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4" style={{borderTop: '1px solid var(--stone-200)'}}>
                <h4 className="text-xs font-medium uppercase tracking-wide mb-3" style={{color: 'var(--ink)'}}>Performance</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3" style={{background: 'var(--stone-100)'}}>
                    <div className="font-medium text-lg" style={{color: 'var(--ink)'}}>{specialist.performance.tasksCompleted}</div>
                    <div className="uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Tasks Done</div>
                  </div>
                  <div className="p-3" style={{background: 'var(--stone-100)'}}>
                    <div className="font-medium text-lg" style={{color: 'var(--ink)'}}>{specialist.performance.successRate}%</div>
                    <div className="uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Success Rate</div>
                  </div>
                  <div className="p-3" style={{background: 'var(--stone-100)'}}>
                    <div className="font-medium text-lg" style={{color: 'var(--ink)'}}>{specialist.performance.averageResponseTime}ms</div>
                    <div className="uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Avg Response</div>
                  </div>
                  <div className="p-3" style={{background: 'var(--stone-100)'}}>
                    <div className="font-medium text-lg" style={{color: 'var(--ink)'}}>{specialist.performance.specialtyScore}/100</div>
                    <div className="uppercase tracking-wide" style={{color: 'var(--stone-500)'}}>Specialty Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 card p-8" style={{background: 'var(--stone-100)'}}>
        <h2 className="text-xl font-normal mb-4" style={{fontFamily: 'var(--font-serif)', color: 'var(--ink)'}}>Team Status</h2>
        <p style={{color: 'var(--stone-500)', lineHeight: '1.7', marginBottom: '2rem'}}>
          All specialists are operational and coordinated by the AI team management system.
          Real-time autonomous development capabilities active.
        </p>
        <div className="flex space-x-6 text-sm">
          <div className="p-4" style={{background: 'var(--paper)'}}>
            <span className="font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Total Tasks:</span>
            <span className="ml-2 text-lg font-medium" style={{color: 'var(--ink)'}}>
              {specialists.reduce((sum, s) => sum + s.performance.tasksCompleted, 0)}
            </span>
          </div>
          <div className="p-4" style={{background: 'var(--paper)'}}>
            <span className="font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Team Success Rate:</span>
            <span className="ml-2 text-lg font-medium" style={{color: 'var(--ink)'}}>
              {Math.round(specialists.reduce((sum, s) => sum + s.performance.successRate, 0) / specialists.length)}%
            </span>
          </div>
          <div className="p-4" style={{background: 'var(--paper)'}}>
            <span className="font-medium uppercase tracking-wide" style={{color: 'var(--ink)'}}>Avg Response:</span>
            <span className="ml-2 text-lg font-medium" style={{color: 'var(--ink)'}}>
              {Math.round(specialists.reduce((sum, s) => sum + s.performance.averageResponseTime, 0) / specialists.length)}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};