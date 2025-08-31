import React, { useState } from 'react';
import { 
  Box, 
  Cpu, 
  Globe, 
  Users, 
  Archive, 
  Shield, 
  Rocket, 
  Terminal, 
  FileText, 
  Search, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Settings 
} from 'lucide-react';
import { useCoordinationTheme } from '../../../contexts/CoordinationThemeContext';
import { CoordinationButton } from '../ui/CoordinationButton';
import { StatusBadge } from '../ui/StatusBadge';
import { NavigationSection, StatusItem } from '../../../types/coordination.types';

interface CoordinationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const navigationSections: NavigationSection[] = [
  { 
    id: 'coordination-overview', 
    title: 'AI Team Coordination', 
    icon: Box,
    description: 'Live AI specialist collaboration and task management',
    status: 'active'
  },
  { 
    id: 'ai-communication', 
    title: 'AI Communication Hub', 
    icon: Cpu,
    description: 'Real-time inter-AI messaging and knowledge sharing',
    status: 'connected',
    isNew: true
  },
  { 
    id: 'realtime-hub', 
    title: 'Real-time Activity Hub', 
    icon: Globe,
    description: 'Live coordination events and team synchronization',
    status: 'active'
  },
  { 
    id: 'team-optimization', 
    title: 'Team Performance', 
    icon: Users,
    description: 'AI specialist metrics and optimization insights',
    status: 'ready'
  },
  { 
    id: 'memory-management', 
    title: 'Memory Management', 
    icon: Archive,
    description: 'Persistent AI memory and knowledge retention',
    status: 'protected'
  },
  { 
    id: 'session-coordination', 
    title: 'Session Coordination', 
    icon: Shield,
    description: 'Cross-session continuity and state management',
    status: 'ready'
  },
  { 
    id: 'performance-metrics', 
    title: 'Performance Analytics', 
    icon: Rocket,
    description: 'Advanced metrics and team coordination analysis',
    status: 'warning',
    badge: 'BETA'
  },
  { 
    id: 'api-documentation', 
    title: 'MCP API Documentation', 
    icon: Terminal,
    description: 'Model Context Protocol integration and endpoints',
    status: 'ready'
  },
  { 
    id: 'session-logs', 
    title: 'Coordination Logs', 
    icon: FileText,
    description: 'Detailed AI team activity logs and debugging',
    status: 'active'
  }
];

const systemStatus: StatusItem[] = [
  { label: 'AI Team Coordinator', status: 'active', value: 'Krin' },
  { label: 'WebSocket Hub', status: 'connected', value: 'Live' },
  { label: 'Memory Service', status: 'active' },
  { label: 'Active Specialists', status: 'ready', value: '5' },
  { label: 'Task Queue', status: 'active', value: '12' },
  { label: 'Session State', status: 'protected' }
];

export const CoordinationSidebar: React.FC<CoordinationSidebarProps> = ({
  isOpen,
  onClose,
  activeSection,
  onSectionChange
}) => {
  const { isDarkTheme, toggleTheme } = useCoordinationTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = navigationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div className={`coordination-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-coordination">
        <div>
          <h1 className="text-2xl font-bold text-coordination-primary">
            🚀 AI Team Coordination
          </h1>
          <p className="text-sm text-coordination-secondary mt-1">
            Revolutionary Multi-AI System
          </p>
        </div>
        <CoordinationButton 
          variant="icon" 
          onClick={onClose}
          className="lg:hidden"
        >
          <X className="w-6 h-6" />
        </CoordinationButton>
      </div>
      
      {/* Navigation */}
      <nav className="p-6">
        <p className="text-sm text-coordination-secondary mb-6 leading-relaxed">
          Advanced AI team coordination system with persistent memory, 
          real-time collaboration, and autonomous task management across specialists.
        </p>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-coordination-secondary" />
          <input
            type="text"
            placeholder="Search coordination features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full border rounded-lg pl-10 pr-4 py-2 text-sm transition-colors 
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              bg-coordination-card border-coordination text-coordination-primary
              placeholder-coordination-secondary
            "
          />
        </div>

        {/* Navigation Links */}
        <div className="space-y-2 mb-8">
          {filteredSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`
                flex items-start gap-3 px-4 py-3 rounded-lg transition-all group relative
                ${activeSection === section.id
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                  : section.isDisabled
                  ? 'text-slate-600 cursor-not-allowed opacity-50'
                  : 'text-coordination-secondary hover:text-coordination-primary hover:bg-slate-700/30'
                }
              `}
              onClick={(e) => {
                e.preventDefault();
                if (!section.isDisabled) {
                  handleSectionClick(section.id);
                }
              }}
            >
              <section.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{section.title}</span>
                  {section.isNew && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-500 text-white rounded">
                      NEW
                    </span>
                  )}
                  {section.badge && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-slate-600 text-white rounded">
                      {section.badge}
                    </span>
                  )}
                </div>
                <div className={`text-xs mt-1 ${
                  activeSection === section.id 
                    ? 'text-blue-300/80' 
                    : 'text-coordination-secondary'
                }`}>
                  {section.description}
                </div>
                {section.status && (
                  <div className="mt-2">
                    <StatusBadge status={section.status} size="sm" />
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Status Card */}
        <div className="coordination-card coordination-card-sm mb-6">
          <h3 className="text-sm font-medium text-coordination-secondary mb-3 flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            System Status
          </h3>
          <div className="space-y-2 text-xs">
            {systemStatus.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-coordination-secondary">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-coordination-secondary font-medium">{item.value}</span>
                  )}
                  <StatusBadge status={item.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="border-t border-coordination pt-6">
          <h3 className="text-sm font-medium text-coordination-secondary mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Coordination Settings
          </h3>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-coordination-primary">Theme</span>
            <CoordinationButton
              variant="icon"
              onClick={toggleTheme}
              className="flex items-center gap-2 text-coordination-secondary hover:text-coordination-primary"
            >
              {isDarkTheme ? (
                <>
                  <Sun className="w-4 h-4 text-orange-400" />
                  <span className="text-xs">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-500" />
                  <span className="text-xs">Dark</span>
                </>
              )}
            </CoordinationButton>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CoordinationSidebar;