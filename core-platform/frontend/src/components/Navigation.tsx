import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-bold text-gray-900">Dev Memory OS</span>
          </Link>
          
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏠 Home
            </Link>
            
            <Link
              to="/ai-team"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/ai-team') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 AI Team
            </Link>
            
            <Link
              to="/patterns"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/patterns') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Patterns
            </Link>
            
            <Link
              to="/adrs"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/adrs') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 ADRs
            </Link>
            
            <Link
              to="/search"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/search') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔍 Search
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};