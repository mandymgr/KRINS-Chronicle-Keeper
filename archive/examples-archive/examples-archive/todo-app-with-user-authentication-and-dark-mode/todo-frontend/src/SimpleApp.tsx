import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const SimpleApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false); // Default to light theme
  const [activeSection, setActiveSection] = useState('todo-overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    document.body.classList.add('coordination-developer-system');
    
    const savedTheme = localStorage.getItem('coordination-theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
    }
    
    return () => {
      document.body.classList.remove('coordination-developer-system');
    };
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem('coordination-theme', newTheme ? 'dark' : 'light');
  };

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputText.trim(),
        completed: false
      }]);
      setInputText('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const pendingCount = totalCount - completedCount;

  const sections = [
    { 
      id: 'todo-overview', 
      title: 'Todo Overview', 
      icon: '🎯',
      description: 'Task management and productivity tracking'
    },
    { 
      id: 'task-analytics', 
      title: 'Task Analytics', 
      icon: '📊',
      description: 'Performance metrics and completion insights'
    },
    { 
      id: 'ai-suggestions', 
      title: 'AI Suggestions', 
      icon: '✨',
      description: 'AI-powered task optimization and recommendations'
    },
    { 
      id: 'productivity-hub', 
      title: 'Productivity Hub', 
      icon: '⚡',
      description: 'Focus modes and productivity enhancement'
    }
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>
        {`
          body.coordination-developer-system {
            padding-top: 0 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .coordination-gradient-bg {
            background: ${isDarkTheme 
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
            };
          }
          
          .coordination-card {
            background: ${isDarkTheme 
              ? 'rgba(30, 41, 59, 0.8)'
              : 'rgba(255, 255, 255, 0.9)'
            };
            border: 1px solid ${isDarkTheme 
              ? 'rgba(71, 85, 105, 0.5)'
              : 'rgba(203, 213, 225, 0.8)'
            };
            backdrop-filter: blur(12px);
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          
          .coordination-card:hover {
            transform: translateY(-2px);
            box-shadow: ${isDarkTheme 
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            };
          }
          
          .coordination-sidebar {
            background: ${isDarkTheme 
              ? 'linear-gradient(180deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
            };
            border-right: 1px solid ${isDarkTheme 
              ? 'rgba(71, 85, 105, 0.5)'
              : 'rgba(203, 213, 225, 0.8)'
            };
          }
          
          .coordination-accent {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          }
          
          .coordination-accent-secondary {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }

          .professional-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: inherit;
            line-height: 1;
            vertical-align: middle;
          }
        `}
      </style>
      
      <div className="min-h-screen flex coordination-gradient-bg">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 coordination-sidebar transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkTheme ? 'border-slate-600/50' : 'border-slate-300/50'
          }`}>
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkTheme ? 'text-white' : 'text-slate-900'
              }`} style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
                Claude Code Todo
              </h1>
              <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                Advanced Multi-Terminal Todo System
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`lg:hidden p-2 rounded-lg ${
                isDarkTheme 
                  ? 'hover:bg-slate-700/50 text-slate-300' 
                  : 'hover:bg-slate-200/50 text-slate-700'
              } transition-colors`}
            >
              <span className="professional-icon text-xl">✕</span>
            </button>
          </div>

          
          <nav className="p-6">
            <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'} mb-6 leading-relaxed`}>
              Comprehensive task management system with AI intelligence and beautiful Nordic design.
            </p>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 professional-icon text-sm ${
                  isDarkTheme ? 'text-slate-500' : 'text-slate-400'
                }`}>🔍</span>
                <input
                  type="text"
                  placeholder="Search features and tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full border rounded-lg pl-10 pr-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDarkTheme 
                      ? 'bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-500' 
                      : 'bg-white/50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2 mb-8">
              {filteredSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-all group ${
                    activeSection === section.id
                      ? isDarkTheme 
                        ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                        : 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : isDarkTheme
                        ? 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="professional-icon text-lg mt-0.5 flex-shrink-0">{section.icon}</span>
                  <div className="min-w-0">
                    <div className="font-medium">{section.title}</div>
                    <div className={`text-xs mt-1 ${
                      activeSection === section.id
                        ? isDarkTheme ? 'text-blue-300/80' : 'text-blue-600/80'
                        : isDarkTheme ? 'text-slate-500' : 'text-slate-500'
                    }`}>
                      {section.description}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="coordination-card p-4 mb-6">
              <h3 className={`text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'} mb-3`}>
                System Status
              </h3>
              <div className="space-y-2 text-xs">
                <div className={`flex justify-between ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Total Tasks</span>
                  <span className="text-blue-400 font-medium">{totalCount}</span>
                </div>
                <div className={`flex justify-between ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Completed</span>
                  <span className="text-green-400 font-medium">{completedCount}</span>
                </div>
                <div className={`flex justify-between ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Pending</span>
                  <span className="text-orange-400 font-medium">{pendingCount}</span>
                </div>
                <div className={`flex justify-between ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>AI Engine</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className={`border-t pt-6 ${isDarkTheme ? 'border-slate-600/50' : 'border-slate-300/50'}`}>
              <h3 className={`text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'} mb-4 flex items-center gap-2`}>
                <span className="professional-icon text-base">⚙️</span>
                Developer Settings
              </h3>
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between py-2">
                <span className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Theme</span>
                <button
                  onClick={handleThemeToggle}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    isDarkTheme 
                      ? 'hover:bg-slate-700/50 text-slate-300' 
                      : 'hover:bg-slate-200/50 text-slate-700'
                  }`}
                  title={isDarkTheme ? 'Switch to Light' : 'Switch to Dark'}
                >
                  <span className="professional-icon text-base">
                    {isDarkTheme ? '☀️' : '🌙'}
                  </span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-80' : 'ml-0'
        }`}>
          {/* Mobile Header */}
          <div className={`lg:hidden sticky top-0 z-40 backdrop-blur p-4 border-b ${
            isDarkTheme 
              ? 'bg-slate-900/90 border-slate-600/50 text-white' 
              : 'bg-white/90 border-slate-300/50 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkTheme 
                    ? 'hover:bg-slate-700/50' 
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <span className="professional-icon text-xl">☰</span>
              </button>
              <h1 className="text-lg font-medium">Claude Code Todo</h1>
              <div className="w-10" />
            </div>
          </div>

          {/* Content Sections */}
          <main className="relative">
            {activeSection === 'todo-overview' && (
              <section id="todo-overview" className="p-8 min-h-screen">
                <div className="max-w-7xl mx-auto">
                  {/* Hero Section - Like Claude Code Coordination */}
                  <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 coordination-accent rounded-2xl flex items-center justify-center mb-4">
                          <span className="professional-icon text-4xl text-white">🎯</span>
                        </div>
                        <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
                          <span className="professional-icon text-2xl">✨</span>
                        </div>
                      </div>
                    </div>
                    
                    <h1 className={`text-5xl font-bold mb-6 ${
                      isDarkTheme ? 'text-white' : 'text-slate-900'
                    }`}>
                      Revolutionary Todo System
                    </h1>
                    
                    <p className={`text-xl leading-relaxed max-w-3xl mx-auto mb-8 ${
                      isDarkTheme ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Advanced AI-powered task management with Nordic design excellence, 
                      intelligent insights, and seamless collaboration features.
                    </p>

                    <div className="flex justify-center gap-4 mt-8">
                      <button className="coordination-accent text-white px-8 py-3 rounded-lg font-semibold cursor-pointer border-none shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2">
                        Get Started
                        <span className="professional-icon">→</span>
                      </button>
                      <button className={`border px-8 py-3 rounded-lg font-semibold cursor-pointer bg-transparent transition-all duration-300 ${
                        isDarkTheme 
                          ? 'border-slate-600 text-slate-300 hover:bg-slate-700/30' 
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100/50'
                      }`}>
                        View Documentation
                      </button>
                    </div>
                  </div>

                  {/* Add Todo Section - Coordinated Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
                    <div className="coordination-card p-6 col-span-full max-w-2xl mx-auto">
                      <div className="mb-4">
                        <h3 className={`text-lg font-semibold flex items-center gap-2 mb-2 ${
                          isDarkTheme ? 'text-white' : 'text-slate-900'
                        }`}>
                          <span className="professional-icon text-lg">➕</span>
                          Add New Task
                        </h3>
                        <p className={`text-sm ${
                          isDarkTheme ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          Create and manage your revolutionary tasks
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                          placeholder="What needs to be done?"
                          className={`flex-1 px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                            isDarkTheme 
                              ? 'bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-500' 
                              : 'bg-white/50 border-slate-300 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                        <button
                          onClick={addTodo}
                          className="coordination-accent text-white px-6 py-3 rounded-lg font-semibold cursor-pointer border-none shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 text-sm"
                        >
                          Add Task
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Todos List - Coordinated Grid */}
                  <div className="max-w-4xl mx-auto">
                    {todos.length === 0 ? (
                      <div className="coordination-card p-12 text-center">
                        <div className={`mb-4 flex justify-center ${
                          isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          <span className="professional-icon text-6xl">🎯</span>
                        </div>
                        <h3 className={`text-2xl font-semibold mb-3 ${
                          isDarkTheme ? 'text-white' : 'text-slate-900'
                        }`}>
                          Ready for Revolutionary Development
                        </h3>
                        <p className={isDarkTheme ? 'text-slate-400' : 'text-slate-600'}>
                          Create your first task above to begin coordinated productivity
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {todos.map(todo => (
                          <div key={todo.id} className="coordination-card p-5 flex items-center gap-4 cursor-pointer">
                            <button
                              onClick={() => toggleTodo(todo.id)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs transition-all duration-200 ${
                                todo.completed 
                                  ? 'border-green-500 bg-green-500 text-white' 
                                  : 'border-gray-500 bg-transparent'
                              }`}
                            >
                              {todo.completed && <span className="professional-icon text-white">✓</span>}
                            </button>
                            
                            <span className={`flex-1 transition-all duration-200 ${
                              todo.completed 
                                ? isDarkTheme 
                                  ? 'text-gray-500 line-through' 
                                  : 'text-gray-400 line-through'
                                : isDarkTheme 
                                  ? 'text-white' 
                                  : 'text-slate-900'
                            }`}>
                              {todo.text}
                            </span>
                            
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="p-2 rounded-md bg-transparent border-none text-red-500 cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-200"
                            >
                              <span className="professional-icon text-sm">🗑️</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Other sections */}
            {activeSection === 'task-analytics' && (
              <section id="task-analytics" className="p-8 min-h-screen">
                <div className="max-w-7xl mx-auto text-center pt-32">
                  <div className="coordination-card p-12 max-w-2xl mx-auto">
                    <div className={`text-6xl mb-6 ${
                      isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      📊
                    </div>
                    <h2 className={`text-3xl font-bold mb-4 ${
                      isDarkTheme ? 'text-white' : 'text-slate-900'
                    }`}>
                      Task Analytics
                    </h2>
                    <p className={isDarkTheme ? 'text-slate-400' : 'text-slate-600'}>
                      Advanced analytics and insights coming soon...
                    </p>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'ai-suggestions' && (
              <section id="ai-suggestions" className="p-8 min-h-screen">
                <div className="max-w-7xl mx-auto text-center pt-32">
                  <div className="coordination-card p-12 max-w-2xl mx-auto">
                    <div className={`text-6xl mb-6 ${
                      isDarkTheme ? 'text-green-400' : 'text-green-600'
                    }`}>
                      ✨
                    </div>
                    <h2 className={`text-3xl font-bold mb-4 ${
                      isDarkTheme ? 'text-white' : 'text-slate-900'
                    }`}>
                      AI Suggestions
                    </h2>
                    <p className={isDarkTheme ? 'text-slate-400' : 'text-slate-600'}>
                      AI-powered recommendations and optimizations coming soon...
                    </p>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'productivity-hub' && (
              <section id="productivity-hub" className="p-8 min-h-screen">
                <div className="max-w-7xl mx-auto text-center pt-32">
                  <div className="coordination-card p-12 max-w-2xl mx-auto">
                    <div className={`text-6xl mb-6 ${
                      isDarkTheme ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      ⚡
                    </div>
                    <h2 className={`text-3xl font-bold mb-4 ${
                      isDarkTheme ? 'text-white' : 'text-slate-900'
                    }`}>
                      Productivity Hub
                    </h2>
                    <p className={isDarkTheme ? 'text-slate-400' : 'text-slate-600'}>
                      Focus modes and productivity features coming soon...
                    </p>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default SimpleApp;