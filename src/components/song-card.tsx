'use client'

import { Card, CardHeader } from '@/components/ui/card'
import { usePlayer } from '@/context/player-context'

interface SongCardProps {
  day: number
  date: string
  title: string
  artistName: string
  audioSrc: string
  duration?: number
  showArtist?: boolean
  onClick?: () => void
}

export default function SongCard({
  date,
  title,
  artistName,
  audioSrc,
  showArtist = false,
  onClick,
}: SongCardProps) {
  const { play } = usePlayer()

  function handlePlay() {
    play({ src: audioSrc, title, artistName })
    onClick?.()
  }

  return (
    <Card className="bg-white border-feb-bluegray/20">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <p className="text-feb-slate text-sm font-medium">{title}</p>
          <p className="text-feb-bluegray text-xs">{date}</p>
          {showArtist && (
            <p className="text-feb-bluegray text-xs">{artistName}</p>
          )}
        </div>
        <button
          onClick={handlePlay}
          className="w-9 h-9 rounded-full bg-feb-gold flex items-center justify-center flex-shrink-0 hover:bg-feb-gold-light transition-colors"
        >
          <span className="border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-feb-slate ml-0.5 block" />
        </button>
      </CardHeader>
    </Card>
  )
}
