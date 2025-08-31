import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { CoordinationSidebar } from './CoordinationSidebar';
import { CoordinationButton } from '../ui/CoordinationButton';

interface CoordinationLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const CoordinationLayout: React.FC<CoordinationLayoutProps> = ({
  children,
  activeSection,
  onSectionChange
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="coordination-layout coordination-gradient-bg">
      {/* Sidebar */}
      <CoordinationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
      
      {/* Main Content */}
      <div className={`coordination-main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 backdrop-blur p-4 border-b border-coordination bg-coordination-card">
          <div className="flex items-center justify-between">
            <CoordinationButton
              variant="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </CoordinationButton>
            <h1 className="text-lg font-medium text-coordination-primary">
              AI Team Coordination
            </h1>
            <div className="w-10" />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="relative min-h-screen">
          {children}
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default CoordinationLayout;