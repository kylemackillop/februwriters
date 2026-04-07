'use client'

import { createContext, useContext, useState } from 'react'

export interface PlayerState {
  id: string
  src: string
  title: string
  artistName: string
  isPlaying: boolean
}

interface PlayerContextValue {
  currentSong: PlayerState | null
  play:        (song: Omit<PlayerState, 'isPlaying'>) => void
  pause:       () => void
  resume:      () => void
  stop:        () => void
  setIsPlaying:(val: boolean) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setSong] = useState<PlayerState | null>(null)

  function play(song: Omit<PlayerState, 'isPlaying'>) {
    setSong({ ...song, isPlaying: true })
  }
  function pause()  { setSong(s => s ? { ...s, isPlaying: false } : null) }
  function resume() { setSong(s => s ? { ...s, isPlaying: true  } : null) }
  function stop()   { setSong(null) }
  function setIsPlaying(val: boolean) {
    setSong(s => s ? { ...s, isPlaying: val } : null)
  }

  return (
    <PlayerContext.Provider value={{ currentSong, play, pause, resume, stop, setIsPlaying }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider')
  return ctx
}
