import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="container mx-auto px-6 py-16 max-w-2xl text-center">
      <Card className="border-2 border-dashed border-nordic-medium-gray">
        <CardHeader>
          <div className="text-6xl mb-4">🔍</div>
          <CardTitle className="text-4xl font-bold text-nordic-black dark:text-nordic-off-white mb-2">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-lg">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-nordic-medium-gray">
              Don't worry! You can navigate back to the dashboard or explore our documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  🏠 Back to Dashboard
                </Button>
              </Link>
              <Link href="/adrs/ADR-0001-vector-database-selection">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  📚 View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <footer className="mt-12 text-sm text-nordic-medium-gray">
        <p>
          Having trouble? Contact us at{' '}
          <a href="mailto:team@devmemoryos.com" className="text-nordic-ocean hover:underline">
            team@devmemoryos.com
          </a>
        </p>
      </footer>
    </div>
  );
}