import type { Metadata } from 'next'
import Providers from '@/components/providers'
import Nav from '@/components/nav'
import MiniPlayer from '@/components/mini-player'
import './globals.css'

export const metadata: Metadata = {
  title: 'Februwriters',
  description: 'The discipline challenge.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <Providers>
          <Nav />
          <main className="min-h-screen bg-feb-linen">
            {children}
          </main>
          <MiniPlayer />
        </Providers>
      </body>
    </html>
  )
}
