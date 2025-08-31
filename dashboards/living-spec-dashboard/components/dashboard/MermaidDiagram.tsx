'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
  title?: string;
  description?: string;
  fallbackImage?: string;
  className?: string;
}

type MermaidAPI = {
  initialize: (config: any) => void;
  render: (id: string, definition: string) => Promise<{ svg: string; bindFunctions?: (element: Element) => void }>;
};

export function MermaidDiagram({ 
  chart, 
  title = "Architecture Diagram", 
  description = "System architecture overview",
  fallbackImage,
  className = "" 
}: MermaidDiagramProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);

  const renderDiagram = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Dynamic import of mermaid
      const mermaid = await import('mermaid');
      const mermaidAPI = mermaid.default as MermaidAPI;
      
      // Initialize mermaid with configuration
      mermaidAPI.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 14,
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
        },
        gantt: {
          titleTopMargin: 25,
          barHeight: 20,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 11,
        },
      });

      // Generate unique ID for this diagram
      const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Render the diagram
      const result = await mermaidAPI.render(diagramId, chart);
      setSvg(result.svg);
      setIsLoading(false);

    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    renderDiagram();
  }, [chart, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const renderFallback = () => {
    if (fallbackImage) {
      return (
        <div className="text-center py-8">
          <img 
            src={fallbackImage} 
            alt={title}
            className="max-w-full h-auto mx-auto rounded-lg border border-gray-200"
          />
          <p className="text-sm text-gray-500 mt-2">
            Fallback diagram image
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Diagram Unavailable
        </h3>
        <p className="text-gray-600 mb-4">
          Unable to render the Mermaid diagram
        </p>
        {error && (
          <details className="text-left bg-red-50 border border-red-200 rounded p-3 mb-4">
            <summary className="cursor-pointer text-red-800 font-medium">
              Error Details
            </summary>
            <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap">
              {error}
            </pre>
          </details>
        )}
        <button
          onClick={handleRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>🏗️</span>
              <span>{title}</span>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            {isLoading && (
              <Badge variant="outline" className="animate-pulse">
                Rendering...
              </Badge>
            )}
            {error && (
              <Badge variant="destructive">
                Error
              </Badge>
            )}
            {svg && !isLoading && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Rendered
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div ref={containerRef}>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Rendering diagram...</span>
            </div>
          )}
          
          {error && !svg && renderFallback()}
          
          {svg && !isLoading && (
            <div className="mermaid-container">
              <div 
                dangerouslySetInnerHTML={{ __html: svg }}
                className="flex justify-center"
              />
            </div>
          )}
        </div>
        
        {/* Diagram source */}
        <details className="mt-6 bg-gray-50 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700 select-none">
            View Diagram Source
          </summary>
          <pre className="mt-2 text-xs text-gray-600 bg-white rounded border p-3 overflow-x-auto">
            {chart}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}