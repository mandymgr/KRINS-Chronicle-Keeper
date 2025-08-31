'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitCommit, Plus, Bug, Zap, BookOpen, Settings } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description?: string;
  type: 'feature' | 'fix' | 'enhancement' | 'docs' | 'chore' | 'breaking';
  changes?: string[];
  author?: string;
}

interface ChangelogListProps {
  entries: ChangelogEntry[];
  title?: string;
  className?: string;
  maxEntries?: number;
}

const typeConfig = {
  feature: { 
    icon: <Plus className="w-4 h-4" />, 
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Feature'
  },
  fix: { 
    icon: <Bug className="w-4 h-4" />, 
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Fix'
  },
  enhancement: { 
    icon: <Zap className="w-4 h-4" />, 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Enhancement'
  },
  docs: { 
    icon: <BookOpen className="w-4 h-4" />, 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Documentation'
  },
  chore: { 
    icon: <Settings className="w-4 h-4" />, 
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    label: 'Chore'
  },
  breaking: { 
    icon: <GitCommit className="w-4 h-4" />, 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'Breaking Change'
  },
} as const;

export function ChangelogList({ 
  entries, 
  title = "Recent Changes", 
  className = "",
  maxEntries = 10 
}: ChangelogListProps) {
  const displayEntries = entries.slice(0, maxEntries);
  
  const getSemanticVersion = (version: string) => {
    // Parse semantic version to highlight major/minor/patch changes
    const parts = version.replace('v', '').split('.');
    return {
      major: parts[0] || '0',
      minor: parts[1] || '0',
      patch: parts[2] || '0',
    };
  };

  const isRecentEntry = (date: string) => {
    const entryDate = new Date(date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7; // Within last 7 days
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📝</span>
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          Latest project updates and changes ({displayEntries.length} of {entries.length})
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {displayEntries.map((entry, index) => {
            const config = typeConfig[entry.type];
            const semVer = getSemanticVersion(entry.version);
            const isRecent = isRecentEntry(entry.date);
            
            return (
              <div key={index} className="relative">
                {/* Timeline connector */}
                {index !== displayEntries.length - 1 && (
                  <div className="absolute top-12 left-6 w-0.5 h-full bg-gray-200" />
                )}
                
                <div className="flex space-x-4">
                  {/* Version badge and icon */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="mt-2 text-center">
                      <Badge variant="outline" size="sm" className="text-xs font-mono">
                        v{entry.version}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge size="sm" className={config.color}>
                              {config.label}
                            </Badge>
                            {isRecent && (
                              <Badge size="sm" variant="default" className="bg-blue-100 text-blue-800">
                                New
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatDate(entry.date)}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {entry.title}
                          </h4>
                          
                          {entry.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {entry.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Semantic version breakdown */}
                        <div className="text-xs text-gray-400 ml-4">
                          <div className="flex items-center space-x-1">
                            <span className={semVer.major !== '0' ? 'text-red-600 font-bold' : ''}>
                              {semVer.major}
                            </span>
                            <span>.</span>
                            <span className={semVer.minor !== '0' ? 'text-blue-600 font-semibold' : ''}>
                              {semVer.minor}
                            </span>
                            <span>.</span>
                            <span className={semVer.patch !== '0' ? 'text-green-600' : ''}>
                              {semVer.patch}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Detailed changes */}
                      {entry.changes && entry.changes.length > 0 && (
                        <div className="border-t border-gray-100 pt-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Changes:</h5>
                          <ul className="space-y-1">
                            {entry.changes.map((change, changeIndex) => (
                              <li key={changeIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        {entry.author && (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {entry.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{entry.author}</span>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-400">
                          {isRecent && (
                            <span className="inline-flex items-center space-x-1">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              <span>Recent</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {entries.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <GitCommit className="w-12 h-12 mx-auto mb-4" />
              <p>No changelog entries found</p>
            </div>
          )}
          
          {entries.length > maxEntries && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {maxEntries} of {entries.length} entries
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1">
                View all changes →
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}