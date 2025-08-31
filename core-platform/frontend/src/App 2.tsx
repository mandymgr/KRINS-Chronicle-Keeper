import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  Search, 
  Lightbulb, 
  FileText, 
  BarChart3, 
  Moon, 
  Sun,
  Command,
  Menu,
  X,
  BookOpen,
  MessageCircle,
  Shield,
  LogOut,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SemanticSearch from '@/components/search/SemanticSearch';
import PatternBrowser from '@/components/patterns/PatternBrowser';
import ADRExplorer from '@/components/adr/ADRExplorer';
import { Button } from '@/components/ui/Button';
import { BlogApp } from './components/blog/BlogApp';
import { AdminAuthProvider, AdminDashboard, useAdminAuth } from '@/components/auth/AdminLogin';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LiveActivityFeed from '@/components/ai-team/LiveActivityFeed';


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  {
    id: 'search',
    label: 'Semantic Search',
    icon: <Search className="h-5 w-5" />,
    component: SemanticSearch,
  },
  {
    id: 'patterns',
    label: 'Pattern Discovery',
    icon: <Lightbulb className="h-5 w-5" />,
    component: PatternBrowser,
  },
  {
    id: 'adrs',
    label: 'ADR Explorer',
    icon: <FileText className="h-5 w-5" />,
    component: ADRExplorer,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    component: () => (
      <ProtectedRoute requiredRole="admin">
        <div className="p-8 text-center text-muted-foreground">Analytics dashboard coming soon...</div>
      </ProtectedRoute>
    ),
  },
  {
    id: 'blog',
    label: 'Blog Platform',
    icon: <BookOpen className="h-5 w-5" />,
    component: BlogApp,
  },
  {
    id: 'ai-team',
    label: '🚀 AI Team Dashboard',
    icon: <div className="text-lg">🚀</div>,
    component: () => {
      const AITeamDashboard = React.lazy(() => import('./components/ai-team/AITeamDashboard'));
      return (
        <ProtectedRoute requiredRole="admin" requiredPermission="access:ai-team">
          <React.Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          }>
            <AITeamDashboard />
          </React.Suspense>
        </ProtectedRoute>
      );
    },
  },
  {
    id: 'ai-chat',
    label: '💬 AI Team Chat',
    icon: <MessageCircle className="h-5 w-5" />,
    component: () => {
      const AITeamChat = React.lazy(() => import('./components/ai-team/AITeamChat'));
      return (
        <ProtectedRoute requiredRole="user" requiredPermission="access:ai-team">
          <div className="h-[calc(100vh-12rem)]">
            <React.Suspense fallback={
              <div className="h-full bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
              </div>
            }>
              <AITeamChat />
            </React.Suspense>
          </div>
        </ProtectedRoute>
      );
    },
  },
  {
    id: 'admin',
    label: '🛡️ Admin Panel',
    icon: <Shield className="h-5 w-5" />,
    component: () => (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    id: 'live-activity',
    label: '🔴 Live AI Activity',
    icon: <Activity className="h-5 w-5" />,
    component: () => (
      <div className="h-full">
        <LiveActivityFeed className="h-[calc(100vh-12rem)]" />
      </div>
    ),
  },
];

// Main App Component with Auth
function AppContent() {
  const [activeView, setActiveView] = useState('search');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { user, logout } = useAdminAuth();

  // Initialize theme
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setDarkMode(stored === 'dark' || (!stored && prefersDark));
  }, []);

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // CMD/Ctrl + K for command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
      
      // CMD/Ctrl + B to toggle sidebar
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
      
      // Escape to close command palette
      if (event.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, commandPaletteOpen]);

  const activeNavItem = navItems.find(item => item.id === activeView);
  const ActiveComponent = activeNavItem?.component || SemanticSearch;

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="h-screen bg-background text-foreground flex">
        {/* Sidebar */}
        <aside className={cn(
          "bg-card border-r border-border transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16"
        )}>
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="space-y-1">
                  <h1 className="font-bold text-lg">Dev Memory OS</h1>
                  <p className="text-xs text-muted-foreground">Pattern Discovery</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex-shrink-0"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      activeView === item.id 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground"
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-2 border-t border-border">
            <div className="space-y-1">
              {/* User Info */}
              {user && sidebarOpen && (
                <div className="px-3 py-2 text-xs text-muted-foreground border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-2 mb-1">
                    <Shield className="h-3 w-3" />
                    <span className="font-medium">{user.username}</span>
                    <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1 rounded text-[10px] font-medium uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>
              )}
              
              <Button
                variant="ghost"
                size={sidebarOpen ? "default" : "icon"}
                onClick={toggleTheme}
                className="w-full justify-start"
                title={!sidebarOpen ? (darkMode ? "Switch to light mode" : "Switch to dark mode") : undefined}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {sidebarOpen && (
                  <span className="ml-3">
                    {darkMode ? "Light mode" : "Dark mode"}
                  </span>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size={sidebarOpen ? "default" : "icon"}
                onClick={() => setCommandPaletteOpen(true)}
                className="w-full justify-start"
                title={!sidebarOpen ? "Open command palette (⌘K)" : undefined}
              >
                <Command className="h-4 w-4" />
                {sidebarOpen && (
                  <span className="ml-3">Command palette</span>
                )}
                {sidebarOpen && (
                  <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                    ⌘K
                  </kbd>
                )}
              </Button>

              {/* Logout Button */}
              {user && (
                <Button
                  variant="ghost"
                  size={sidebarOpen ? "default" : "icon"}
                  onClick={logout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  title={!sidebarOpen ? "Logout" : undefined}
                >
                  <LogOut className="h-4 w-4" />
                  {sidebarOpen && <span className="ml-3">Logout</span>}
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">
                  {activeNavItem?.label || 'Semantic Search'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered discovery across patterns, ADRs, and knowledge
                </p>
              </div>
              
              {/* Quick Stats/Status */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>API Connected</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 max-w-7xl mx-auto">
              <ActiveComponent />
            </div>
          </div>
        </main>

        {/* Command Palette Overlay */}
        {commandPaletteOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]">
            <div className="w-full max-w-lg bg-popover border border-border rounded-lg shadow-2xl">
              <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Command className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search commands, patterns, ADRs..."
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="p-2">
                <div className="space-y-1">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Quick Navigation
                  </div>
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-2 py-2 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2 border-t border-border text-xs text-muted-foreground">
                Press <kbd className="kbd">Esc</kbd> to close
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

// Main App wrapper with Auth Provider
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AppContent />
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;