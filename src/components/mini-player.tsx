'use client'

import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import { usePlayer } from '@/context/player-context'

export default function MiniPlayer() {
  const { currentSong, pause, resume, setIsPlaying } = usePlayer()

  const howlRef  = useRef<Howl | null>(null)
  const [seek,     setSeek]     = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted,    setMuted]    = useState(false)
  const [volume,   setVolume]   = useState(1)

  // Create / replace Howl when src changes
  useEffect(() => {
    howlRef.current?.unload()
    howlRef.current = null
    setSeek(0)
    setDuration(0)

    if (!currentSong) return

    const howl = new Howl({
      src: [currentSong.src],
      html5: true,
      volume,
      onload()      { setDuration(howl.duration()) },
      onplay()      { setIsPlaying(true) },
      onpause()     { setIsPlaying(false) },
      onstop()      { setIsPlaying(false); setSeek(0) },
      onend()       { setIsPlaying(false); setSeek(0) },
      onloaderror() { setIsPlaying(false) },
      onplayerror() { setIsPlaying(false) },
    })
    howlRef.current = howl
    if (currentSong.isPlaying) howl.play()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.src])

  // Sync play/pause state with Howl (for pause/resume calls that don't change src)
  useEffect(() => {
    const h = howlRef.current
    if (!h) return
    if (currentSong?.isPlaying) { if (!h.playing()) h.play()  }
    else                        { if ( h.playing()) h.pause() }
  }, [currentSong?.isPlaying])

  // Scrubber tick
  useEffect(() => {
    if (!currentSong?.isPlaying) return
    const id = setInterval(() => {
      const h = howlRef.current
      if (h && h.duration()) setSeek(h.seek() / h.duration())
    }, 250)
    return () => clearInterval(id)
  }, [currentSong?.isPlaying])

  // Volume / mute sync
  useEffect(() => { howlRef.current?.volume(muted ? 0 : volume) }, [muted, volume])

  function handleScrub(e: React.MouseEvent<HTMLDivElement>) {
    const h = howlRef.current
    if (!h) return
    const pos = Math.min(1, Math.max(0, e.nativeEvent.offsetX / e.currentTarget.offsetWidth))
    h.seek(pos * h.duration())
    setSeek(pos)
  }

  if (!currentSong) return null

  const isPlaying = currentSong.isPlaying

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-feb-slate border-t border-feb-slate-mid z-50">

      {/* Scrubber — sits absolute at the top of the bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-feb-slate-mid cursor-pointer"
        onClick={handleScrub}
      >
        <div className="h-full bg-feb-gold" style={{ width: `${seek * 100}%` }} />
      </div>

      {/* Three-zone grid */}
      <div className="grid grid-cols-3 items-center w-full h-full">

        {/* Left — title + artist */}
        <div className="min-w-0 px-4">
          <p className="text-feb-linen text-sm font-medium truncate">{currentSong.title}</p>
          <p className="text-feb-bluegray text-xs truncate">{currentSong.artistName}</p>
        </div>

        {/* Center — play / pause */}
        <div className="flex justify-center px-4">
          <button
            onClick={isPlaying ? pause : resume}
            className="w-9 h-9 rounded-full bg-feb-gold flex items-center justify-center flex-shrink-0 hover:bg-feb-gold-light transition-colors"
          >
            {isPlaying ? (
              <div className="flex gap-[3px]">
                <div className="w-[3px] h-3 bg-feb-slate rounded-sm" />
                <div className="w-[3px] h-3 bg-feb-slate rounded-sm" />
              </div>
            ) : (
              <span className="border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-feb-slate ml-0.5 block" />
            )}
          </button>
        </div>

        {/* Right — mute toggle (mobile) + volume slider (desktop) */}
        <div className="flex justify-end items-center gap-3 px-4">
          {/* Mute toggle (mobile) */}
          <button
            onClick={() => setMuted(m => !m)}
            className="block md:hidden text-feb-bluegray hover:text-feb-linen transition-colors"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            <span className="flex items-center gap-[2px]">
              <span className="w-[5px] h-[8px] bg-current rounded-[1px] inline-block" />
              <span className="inline-block" style={{
                width: 0, height: 0,
                borderTop:    '4px solid transparent',
                borderBottom: '4px solid transparent',
                borderLeft:   '6px solid currentColor',
              }} />
              {muted && (
                <span className="absolute w-[14px] h-[1.5px] bg-current rotate-45 -ml-3" />
              )}
            </span>
          </button>

          {/* Volume slider (desktop) */}
          <input
            type="range"
            min="0" max="1" step="0.01"
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              setVolume(v)
              if (v > 0) setMuted(false)
            }}
            className="hidden md:block w-24 accent-[#C49A1A]"
          />
        </div>

      </div>
    </div>
  )
}
