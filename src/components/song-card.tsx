'use client'

import { Card, CardHeader } from '@/components/ui/card'
import { usePlayer } from '@/context/player-context'

interface SongCardProps {
  id: string
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
  id,
  date,
  title,
  artistName,
  audioSrc,
  showArtist = false,
  onClick,
}: SongCardProps) {
  const { currentSong, play, pause, resume } = usePlayer()

  const isThisSong = currentSong?.id === id
  const isPlaying  = isThisSong && currentSong?.isPlaying

  function handlePlay() {
    if (isThisSong && isPlaying)  { pause();  return }
    if (isThisSong && !isPlaying) { resume(); return }
    play({ id, src: audioSrc, title, artistName })
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
          className={
            isPlaying
              ? 'w-9 h-9 rounded-full bg-feb-gold flex items-center justify-center flex-shrink-0 hover:bg-feb-gold-light transition-colors'
              : 'w-9 h-9 rounded-full bg-feb-slate flex items-center justify-center flex-shrink-0 hover:bg-feb-slate-mid transition-colors'
          }
        >
          {isPlaying ? (
            <div className="flex gap-[3px]">
              <div className="w-[3px] h-3 bg-feb-slate rounded-sm" />
              <div className="w-[3px] h-3 bg-feb-slate rounded-sm" />
            </div>
          ) : (
            <span className="border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-feb-gold ml-0.5 block" />
          )}
        </button>
      </CardHeader>
    </Card>
  )
}
