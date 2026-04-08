'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePlayer } from '@/context/player-context'
import UploadDialog from '@/components/upload-dialog'

export type SongRow = {
  id: string
  dayNumber: number
  title: string | null
  audioUrl: string
  createdAt: Date
}

interface Props {
  songs: SongRow[]
  username: string
  today: number
  hasSubmittedToday: boolean
}

function PlayButton({ song }: { song: SongRow }) {
  const { currentSong, play, pause, resume } = usePlayer()
  const isThisSong = currentSong?.id === song.id
  const isPlaying  = isThisSong && currentSong?.isPlaying

  function handleClick() {
    if (isThisSong && isPlaying)  { pause();  return }
    if (isThisSong && !isPlaying) { resume(); return }
    play({ id: song.id, src: song.audioUrl, title: song.title ?? `Day ${song.dayNumber}`, artistName: '' })
  }

  return (
    <button
      onClick={handleClick}
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
  )
}

export default function DashboardSongList({ songs, username, today, hasSubmittedToday }: Props) {
  const router = useRouter()
  const [uploadOpen, setUploadOpen] = useState(false)

  function formatTitle(song: SongRow): string {
    if (song.title) return song.title
    const d = new Date(song.createdAt)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}${m}${day}_${username}`
  }

  return (
    <>
      {/* Song list */}
      <div>
        {songs.map((song) => (
          <div key={song.id} className="flex items-center justify-between py-2 border-b border-feb-slate/[0.08] last:border-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] text-feb-bluegray font-semibold w-5 flex-shrink-0">
                {song.dayNumber}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/songs/${song.id}`}
                  className="text-sm font-semibold text-feb-slate hover:underline underline-offset-2 decoration-feb-slate/20 truncate block"
                >
                  {formatTitle(song)}
                </Link>
                <span className="text-[10px] text-feb-bluegray">—</span>
              </div>
            </div>
            <PlayButton song={song} />
          </div>
        ))}
      </div>

      {/* Mobile sticky submit CTA */}
      {!hasSubmittedToday && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 md:hidden">
          <button
            onClick={() => setUploadOpen(true)}
            className="w-full bg-feb-gold rounded-lg px-4 py-3 flex items-center justify-between hover:bg-feb-gold-light transition-colors"
          >
            <div>
              <p className="text-sm font-bold text-feb-slate">Submit day {today}</p>
              <p className="text-[10px] text-feb-slate/60">Until midnight your time</p>
            </div>
            <span className="border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-feb-slate block" />
          </button>
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        dayNumber={today}
        date={`February ${today}`}
        onSuccess={() => { setUploadOpen(false); router.refresh() }}
      />
    </>
  )
}
