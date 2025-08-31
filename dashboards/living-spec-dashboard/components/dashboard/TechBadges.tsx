'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export interface Technology {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'design' | 'testing' | 'observability';
  version?: string;
  description?: string;
  status: 'active' | 'planned' | 'deprecated' | 'evaluating';
  logo?: string;
  documentation?: string;
  reasoning?: string;
}

interface TechBadgesProps {
  technologies: Technology[];
  title?: string;
  className?: string;
  groupByCategory?: boolean;
}

const categoryColors = {
  frontend: 'bg-blue-50 border-blue-200 text-blue-800',
  backend: 'bg-green-50 border-green-200 text-green-800',
  database: 'bg-purple-50 border-purple-200 text-purple-800',
  devops: 'bg-orange-50 border-orange-200 text-orange-800',
  design: 'bg-pink-50 border-pink-200 text-pink-800',
  testing: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  observability: 'bg-gray-50 border-gray-200 text-gray-800',
} as const;

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  planned: 'bg-blue-100 text-blue-800 border-blue-200',
  deprecated: 'bg-red-100 text-red-800 border-red-200',
  evaluating: 'bg-yellow-100 text-yellow-800 border-yellow-200',
} as const;

const categoryLabels = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps',
  design: 'Design',
  testing: 'Testing',
  observability: 'Observability',
} as const;

export function TechBadges({ 
  technologies, 
  title = "Technology Stack", 
  className = "",
  groupByCategory = true 
}: TechBadgesProps) {
  const activeTech = technologies.filter(tech => tech.status === 'active');
  const plannedTech = technologies.filter(tech => tech.status === 'planned');
  
  const renderTech = (tech: Technology) => (
    <div 
      key={tech.id} 
      className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          {tech.logo && (
            <span className="text-2xl" title={tech.name}>
              {tech.logo}
            </span>
          )}
          <div>
            <h4 className="font-semibold text-sm text-gray-900">
              {tech.name}
            </h4>
            {tech.version && (
              <p className="text-xs text-gray-500">v{tech.version}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {tech.documentation && (
            <a
              href={tech.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
              title="View documentation"
            >
              <ExternalLink className="w-3 h-3 text-gray-500" />
            </a>
          )}
          <Badge size="sm" className={statusColors[tech.status]}>
            {tech.status}
          </Badge>
        </div>
      </div>
      
      {tech.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {tech.description}
        </p>
      )}
      
      {tech.reasoning && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
          <strong>Why:</strong> {tech.reasoning}
        </div>
      )}
    </div>
  );

  if (groupByCategory) {
    const categories = Object.keys(categoryLabels) as (keyof typeof categoryLabels)[];
    const techByCategory = categories.reduce((acc, category) => {
      acc[category] = technologies.filter(tech => tech.category === category);
      return acc;
    }, {} as Record<keyof typeof categoryLabels, Technology[]>);

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💻</span>
            <span>{title}</span>
          </CardTitle>
          <CardDescription>
            Technologies and tools used in the project
          </CardDescription>
          
          {/* Summary stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>{activeTech.length} Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>{plannedTech.length} Planned</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-8">
            {categories.map(category => {
              const categoryTech = techByCategory[category];
              if (categoryTech.length === 0) return null;
              
              return (
                <div key={category}>
                  <div className="flex items-center space-x-2 mb-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {categoryLabels[category]}
                    </h3>
                    <Badge variant="outline" size="sm">
                      {categoryTech.length}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTech.map(renderTech)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>💻</span>
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          Technologies and tools used in the project
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technologies.map(renderTech)}
        </div>
      </CardContent>
    </Card>
  );
}