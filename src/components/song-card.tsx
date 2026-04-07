'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import AudioPlayer from '@/components/audio-player'

interface SongCardProps {
  day: number
  date: string
  title: string
  artistName: string
  audioSrc: string
  duration?: number
  showArtist?: boolean
}

export default function SongCard({
  date,
  title,
  artistName,
  audioSrc,
  duration,
  showArtist = false,
}: SongCardProps) {
  return (
    <Card className="bg-white border-feb-bluegray/20">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <div>
          <p className="text-feb-slate text-sm font-medium">{title}</p>
          <p className="text-feb-bluegray text-xs">{date}</p>
          {showArtist && (
            <p className="text-feb-bluegray text-xs">{artistName}</p>
          )}
        </div>
        <button className="w-9 h-9 rounded-full bg-feb-gold flex items-center justify-center flex-shrink-0 hover:bg-feb-gold-light transition-colors">
          <span className="border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-feb-slate ml-0.5 block" />
        </button>
      </CardHeader>
      <CardContent className="pt-0">
        <AudioPlayer src={audioSrc} duration={duration} />
      </CardContent>
    </Card>
  )
}
