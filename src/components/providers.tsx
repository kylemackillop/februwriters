'use client'

import { SessionProvider } from 'next-auth/react'
import { PlayerProvider } from '@/context/player-context'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <SessionProvider>{children}</SessionProvider>
    </PlayerProvider>
  )
}
