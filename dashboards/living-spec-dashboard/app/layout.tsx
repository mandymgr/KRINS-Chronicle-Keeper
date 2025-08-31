import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dev Memory OS - Living Spec Dashboard',
  description: 'Revolutionary visual project overview system for development teams',
  keywords: ['dashboard', 'project-overview', 'living-spec', 'development', 'team-collaboration'],
  authors: [{ name: 'Krin & Mandy', url: 'https://devmemoryos.com' }],
  openGraph: {
    title: 'Dev Memory OS - Living Spec Dashboard',
    description: 'Revolutionary visual project overview system for development teams',
    url: 'https://living-spec.devmemoryos.com',
    siteName: 'Dev Memory OS',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dev Memory OS - Living Spec Dashboard',
    description: 'Revolutionary visual project overview system for development teams',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#4A6FA5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="living-spec-theme"
        >
          <div className="min-h-screen bg-gradient-to-br from-nordic-off-white to-nordic-mist dark:from-nordic-black dark:to-nordic-charcoal">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}