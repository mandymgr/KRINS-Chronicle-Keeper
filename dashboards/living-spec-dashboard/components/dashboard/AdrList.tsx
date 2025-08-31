'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ExternalLink, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface ArchitectureDecisionRecord {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  date: string;
  author: string;
  context: string;
  decision: string;
  consequences: string;
  tags?: string[];
  slug?: string;
}

interface AdrListProps {
  adrs: ArchitectureDecisionRecord[];
  title?: string;
  className?: string;
  maxItems?: number;
  showDetails?: boolean;
}

const statusConfig = {
  proposed: {
    icon: <Clock className="w-4 h-4" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Proposed'
  },
  accepted: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Accepted'
  },
  deprecated: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'Deprecated'
  },
  superseded: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    label: 'Superseded'
  },
} as const;

export function AdrList({ 
  adrs, 
  title = "Architecture Decisions", 
  className = "",
  maxItems = 10,
  showDetails = false 
}: AdrListProps) {
  const displayAdrs = adrs.slice(0, maxItems);
  
  const adrStats = {
    total: adrs.length,
    accepted: adrs.filter(adr => adr.status === 'accepted').length,
    proposed: adrs.filter(adr => adr.status === 'proposed').length,
    deprecated: adrs.filter(adr => adr.status === 'deprecated').length,
    superseded: adrs.filter(adr => adr.status === 'superseded').length,
  };

  const sortedAdrs = [...displayAdrs].sort((a, b) => {
    // Sort by status priority (proposed > accepted > deprecated > superseded)
    const statusOrder = { proposed: 0, accepted: 1, deprecated: 2, superseded: 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    // Then by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getAdrUrl = (adr: ArchitectureDecisionRecord) => {
    return `/adrs/${adr.slug || adr.id.toLowerCase()}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🏗️</span>
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          Architectural decisions and design rationale
        </CardDescription>
        
        {/* ADR Statistics */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>{adrStats.accepted} Accepted</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>{adrStats.proposed} Proposed</span>
          </div>
          {adrStats.deprecated > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>{adrStats.deprecated} Deprecated</span>
            </div>
          )}
          {adrStats.superseded > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>{adrStats.superseded} Superseded</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {sortedAdrs.map((adr) => {
            const config = statusConfig[adr.status];
            
            return (
              <div key={adr.id} className="group">
                <Link 
                  href={getAdrUrl(adr)}
                  className="block p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-0.5">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" size="sm" className="font-mono text-xs">
                            {adr.id}
                          </Badge>
                          <Badge size="sm" className={config.color}>
                            <div className="flex items-center space-x-1">
                              {config.icon}
                              <span>{config.label}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {adr.title}
                        </h4>
                        
                        {showDetails && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                            {adr.context}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {adr.tags && adr.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {adr.tags.slice(0, 4).map(tag => (
                        <Badge key={tag} variant="outline" size="sm" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {adr.tags.length > 4 && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          +{adr.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Decision Preview */}
                  {showDetails && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <h5 className="font-medium text-sm text-gray-700 mb-1">Decision:</h5>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {adr.decision}
                      </p>
                    </div>
                  )}
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>{adr.author}</span>
                      <span>•</span>
                      <span>{formatDate(adr.date)}</span>
                    </div>
                    
                    <span className="group-hover:text-blue-500 transition-colors">
                      View details →
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
          
          {adrs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>No architecture decisions recorded yet</p>
              <p className="text-sm mt-2">
                ADRs help document important architectural decisions and their rationale
              </p>
            </div>
          )}
          
          {adrs.length > maxItems && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Showing {maxItems} of {adrs.length} decisions
              </p>
              <Link 
                href="/adrs"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all ADRs →
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}