import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdrById, getAdrContent } from '@/lib/data';
import { formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';

interface AdrPageProps {
  params: {
    slug: string;
  };
}

export default function AdrPage({ params }: AdrPageProps) {
  const adr = getAdrById(params.slug);
  const content = getAdrContent(params.slug);
  
  if (!adr) {
    notFound();
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Navigation */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* ADR Header */}
      <header className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <h1 className="text-3xl font-bold text-nordic-black dark:text-nordic-off-white">
            {adr.title}
          </h1>
          <Badge className={getStatusColor(adr.status)}>
            {adr.status.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-nordic-medium-gray">
          <div className="flex items-center space-x-2">
            <span className="font-medium">ID:</span>
            <span>{adr.id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Date:</span>
            <span>{formatDate(adr.date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Author:</span>
            <span>{adr.author}</span>
          </div>
        </div>
        
        {adr.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {adr.tags.map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* ADR Content */}
      <div className="grid gap-8">
        {/* Context */}
        {adr.context && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔍</span>
                <span>Context</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{adr.context}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Decision */}
        {adr.decision && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>✅</span>
                <span>Decision</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{adr.decision}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consequences */}
        {adr.consequences && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>⚖️</span>
                <span>Consequences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{adr.consequences}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alternatives */}
        {adr.alternatives && adr.alternatives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔄</span>
                <span>Alternatives Considered</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {adr.alternatives.map((alternative, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-nordic-medium-gray mt-0.5">•</span>
                    <span>{alternative}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Links */}
        {(adr.links?.supersedes || adr.links?.supersededBy || (adr.links?.related && adr.links.related.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔗</span>
                <span>Related Decisions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adr.links.supersedes && (
                  <div>
                    <span className="font-medium text-sm text-nordic-medium-gray">Supersedes:</span>
                    <p className="mt-1">{adr.links.supersedes}</p>
                  </div>
                )}
                {adr.links.supersededBy && (
                  <div>
                    <span className="font-medium text-sm text-nordic-medium-gray">Superseded by:</span>
                    <p className="mt-1">{adr.links.supersededBy}</p>
                  </div>
                )}
                {adr.links.related && adr.links.related.length > 0 && (
                  <div>
                    <span className="font-medium text-sm text-nordic-medium-gray">Related:</span>
                    <ul className="mt-1 space-y-1">
                      {adr.links.related.map((related, index) => (
                        <li key={index} className="text-nordic-ocean hover:underline cursor-pointer">
                          {related}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Raw Content (if available) */}
        {content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📄</span>
                <span>Raw Content</span>
              </CardTitle>
              <CardDescription>
                Original markdown content for this ADR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-nordic-mist dark:bg-nordic-charcoal p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {content}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-nordic-light-gray dark:border-nordic-medium-gray text-center text-sm text-nordic-medium-gray">
        <p>
          ADR {adr.id} • Created {formatDate(adr.date)} by {adr.author} • Status: {adr.status.toUpperCase()}
        </p>
      </footer>
    </div>
  );
}