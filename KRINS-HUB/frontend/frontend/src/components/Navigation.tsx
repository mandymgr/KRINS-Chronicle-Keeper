import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav style={{background: 'var(--paper)', borderBottom: '1px solid var(--stone-200)'}} className="shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <span className="text-lg font-normal" style={{color: 'var(--ink)', fontFamily: 'var(--font-serif)'}}>Dev Memory OS</span>
          </Link>
          
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-white' 
                  : 'hover:bg-stone-100'
              }`}
              style={{
                backgroundColor: isActive('/') ? 'var(--accent)' : 'transparent',
                color: isActive('/') ? 'var(--accent-ink)' : 'var(--stone-500)'
              }}
            >
              🏠 Home
            </Link>
            
            <Link
              to="/ai-team"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/ai-team') 
                  ? 'text-white' 
                  : 'hover:bg-stone-100'
              }`}
              style={{
                backgroundColor: isActive('/ai-team') ? 'var(--accent)' : 'transparent',
                color: isActive('/ai-team') ? 'var(--accent-ink)' : 'var(--stone-500)'
              }}
            >
              AI Team
            </Link>
            
            <Link
              to="/patterns"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/patterns') 
                  ? 'text-white' 
                  : 'hover:bg-stone-100'
              }`}
              style={{
                backgroundColor: isActive('/patterns') ? 'var(--accent)' : 'transparent',
                color: isActive('/patterns') ? 'var(--accent-ink)' : 'var(--stone-500)'
              }}
            >
              Patterns
            </Link>
            
            <Link
              to="/adrs"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/adrs') 
                  ? 'text-white' 
                  : 'hover:bg-stone-100'
              }`}
              style={{
                backgroundColor: isActive('/adrs') ? 'var(--accent)' : 'transparent',
                color: isActive('/adrs') ? 'var(--accent-ink)' : 'var(--stone-500)'
              }}
            >
              📋 ADRs
            </Link>
            
            <Link
              to="/search"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/search') 
                  ? 'text-white' 
                  : 'hover:bg-stone-100'
              }`}
              style={{
                backgroundColor: isActive('/search') ? 'var(--accent)' : 'transparent',
                color: isActive('/search') ? 'var(--accent-ink)' : 'var(--stone-500)'
              }}
            >
              Search
            </Link>
            
            <Link
              to="/development"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/development')
                  ? 'bg-accent text-accent-ink'
                  : 'hover:bg-stone-100'
              }`}
              style={{
                backgroundColor: isActive('/development') ? 'var(--accent)' : 'transparent',
                color: isActive('/development') ? 'var(--accent-ink)' : 'var(--stone-500)'
              }}
            >
              Development
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};