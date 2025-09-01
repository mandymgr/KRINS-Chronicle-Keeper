import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
})

const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['600', '700'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Living Spec Dashboard - Dev Memory OS',
  description: 'Revolutionary Visual Project Overview Dashboard for AI Team Coordination',
  keywords: ['dashboard', 'AI', 'team coordination', 'dev memory os', 'living specification'],
  authors: [{ name: 'Krin & Mandy - Dev Memory OS Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-screen bg-ivory text-ink font-sans antialiased">
        <div className="flex h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}