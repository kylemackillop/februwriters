'use client'

import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'

interface AudioPlayerProps {
  src: string
  duration?: number
}

function fmtTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function AudioPlayer({ src, duration: durationProp }: AudioPlayerProps) {
  const howlRef = useRef<Howl | null>(null)

  const [playing,  setPlaying]  = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [seek,     setSeek]     = useState(0)
  const [duration, setDuration] = useState(durationProp ?? 0)

  // Mount / unmount
  useEffect(() => {
    const howl = new Howl({
      src: [src],
      html5: true,
      onload() {
        setLoading(false)
        setDuration(howl.duration())
      },
      onplay()  { setPlaying(true) },
      onpause() { setPlaying(false) },
      onstop()  { setPlaying(false); setSeek(0) },
      onend()   { setPlaying(false); setSeek(0) },
      onloaderror() { setError(true); setLoading(false) },
      onplayerror() { setError(true); setLoading(false) },
    })
    howlRef.current = howl
    return () => { howl.unload() }
  }, [src])

  // Scrubber tick
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      const h = howlRef.current
      if (h && h.duration()) setSeek(h.seek() / h.duration())
    }, 250)
    return () => clearInterval(id)
  }, [playing])

  function toggle() {
    const h = howlRef.current
    if (!h || error || loading) return
    playing ? h.pause() : h.play()
  }

  function handleScrub(e: React.MouseEvent<HTMLDivElement>) {
    const h = howlRef.current
    if (!h || error || loading) return
    const pos = Math.min(1, Math.max(0, e.nativeEvent.offsetX / e.currentTarget.offsetWidth))
    h.seek(pos * h.duration())
    setSeek(pos)
  }

  if (error) {
    return <div className="text-[10px] text-feb-bluegray">audio unavailable</div>
  }

  const elapsed = seek * duration

  return (
    <div className="flex items-center gap-3 w-full">

      {/* Play / pause button */}
      <button
        onClick={toggle}
        disabled={loading || error}
        className="w-8 h-8 rounded-full bg-feb-gold text-feb-slate flex items-center justify-center flex-shrink-0 hover:bg-feb-gold-light transition-colors disabled:opacity-40"
      >
        {loading ? (
          // Spinner
          <div className="w-3 h-3 border-2 border-feb-slate/30 border-t-feb-slate rounded-full animate-spin" />
        ) : playing ? (
          // Pause — two vertical bars
          <div className="flex gap-[3px]">
            <div className="w-[3px] h-3 bg-feb-slate rounded-sm" />
            <div className="w-[3px] h-3 bg-feb-slate rounded-sm" />
          </div>
        ) : (
          // Play — CSS triangle
          <div
            style={{
              width: 0, height: 0,
              borderTop:    '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft:   '8px solid currentColor',
              marginLeft: 2,
            }}
          />
        )}
      </button>

      {/* Scrubber */}
      <div
        className="flex-1 h-1 bg-feb-slate-mid/40 rounded-full cursor-pointer relative"
        onClick={handleScrub}
      >
        <div
          className="h-full bg-feb-gold rounded-full"
          style={{ width: `${seek * 100}%` }}
        />
      </div>

      {/* Time */}
      <span className="text-[10px] text-feb-bluegray font-mono flex-shrink-0 w-8 text-right">
        {fmtTime(elapsed)}
      </span>

    </div>
  )
}
