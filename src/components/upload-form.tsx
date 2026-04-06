'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(tz)

const AUDIO_MAX_BYTES   = 70 * 1024 * 1024
const ARTWORK_MAX_BYTES = 3  * 1024 * 1024
const AUDIO_MAX_SECS    = 600

const GENRES = [
  'Folk / Singer-Songwriter', 'Indie Rock', 'Pop', 'Electronic / Synth',
  'Ambient', 'Hip-Hop', 'R&B / Soul', 'Country / Americana',
  'Jazz', 'Classical / Orchestral', 'Blues', 'Punk / Lo-fi',
  'Metal', 'Experimental', 'Comedy / Novelty', 'Instrumental',
]

function fmt(secs: number) {
  return `${Math.floor(secs / 60)}m ${Math.floor(secs % 60)}s`
}
function fmtMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1)
}

async function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const ctx    = new AudioContext()
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const buf = await ctx.decodeAudioData(e.target!.result as ArrayBuffer)
        resolve(buf.duration)
      } catch { reject(new Error('Could not read audio duration')) }
      finally   { ctx.close() }
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsArrayBuffer(file)
  })
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props { userId: string; username: string; timezone: string }

// ─── Component ────────────────────────────────────────────────────────────────

export default function UploadForm({ username, timezone }: Props) {
  const router = useRouter()

  // -- Time --
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(id)
  }, [])

  const dayjsNow  = dayjs(now).tz(timezone)
  const dayNumber = dayjsNow.date()
  const year      = dayjsNow.year()
  const tzDisplay = Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'long' })
    .formatToParts(now).find(p => p.type === 'timeZoneName')?.value ?? timezone
  const midnight     = dayjsNow.add(1, 'day').startOf('day')
  const remainingMs  = midnight.valueOf() - dayjsNow.valueOf()
  const remainingH   = Math.floor(remainingMs / 3_600_000)
  const remainingM   = Math.floor((remainingMs % 3_600_000) / 60_000)
  const isUrgent     = remainingMs < 30 * 60_000
  const deadlineLine = `Day ${dayNumber} closes at midnight ${tzDisplay} · ${remainingH}h ${remainingM}m remaining`

  // -- Audio --
  const [audioFile, setAudioFile]       = useState<File | null>(null)
  const [audioUrl, setAudioUrl]         = useState('')
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioError, setAudioError]     = useState('')
  const [audioUploading, setAudioUploading] = useState(false)
  const [isDragging, setIsDragging]     = useState(false)
  const audioRef = useRef<HTMLInputElement>(null)

  // -- Title --
  const [title, setTitle] = useState('')

  // -- Lyrics --
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [lyrics, setLyrics]         = useState('')

  // -- Genre --
  const [genreOpen, setGenreOpen] = useState(false)
  const [genre, setGenre]         = useState('')

  // -- Artwork --
  const [artworkOpen, setArtworkOpen]     = useState(false)
  const [artworkUrl, setArtworkUrl]       = useState('')
  const [artworkPreview, setArtworkPreview] = useState('')
  const [artworkError, setArtworkError]   = useState('')
  const [artworkUploading, setArtworkUploading] = useState(false)
  const artworkRef = useRef<HTMLInputElement>(null)

  // -- Notes --
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes]         = useState('')

  // -- Visibility --
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const [isDraft, setIsDraft]               = useState(false)

  // -- Submit --
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError]   = useState('')

  const canSubmit = !!audioUrl && !!title.trim() && !audioUploading && submitStatus !== 'uploading'

  // ── Audio handler ──────────────────────────────────────────────────────────

  async function handleAudioFile(file: File) {
    setAudioError('')
    setAudioFile(null)
    setAudioUrl('')
    setAudioDuration(0)

    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
    const validType = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav'].includes(file.type)
    if (!validType && ext !== '.mp3' && ext !== '.wav') {
      setAudioError('Only MP3 and WAV files are accepted.')
      return
    }
    if (file.size > AUDIO_MAX_BYTES) {
      setAudioError(`This file is ${fmtMB(file.size)}MB. The limit is 70MB.`)
      return
    }

    let duration: number
    try { duration = await readAudioDuration(file) }
    catch { setAudioError('Could not read audio file. Make sure it is a valid MP3 or WAV.'); return }

    if (duration > AUDIO_MAX_SECS) {
      setAudioError(`This track is ${fmt(duration)}. Songs must be under 10 minutes.`)
      return
    }

    setAudioFile(file)
    setAudioDuration(duration)
    setAudioUploading(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload/audio', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAudioError(data.message ?? 'Upload failed. Try again.')
        setAudioFile(null)
      } else {
        setAudioUrl(data.url)
        setAudioDuration(data.durationSeconds)
      }
    } catch {
      setAudioError('Upload interrupted. Check your connection and try again.')
      setAudioFile(null)
    }
    setAudioUploading(false)
  }

  // ── Artwork handler ────────────────────────────────────────────────────────

  async function handleArtworkFile(file: File) {
    setArtworkError('')
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setArtworkError('Only JPG and PNG files are accepted.')
      return
    }
    if (file.size > ARTWORK_MAX_BYTES) {
      setArtworkError(`This file is ${fmtMB(file.size)}MB. The limit is 3MB.`)
      return
    }
    setArtworkPreview(URL.createObjectURL(file))
    setArtworkUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload/artwork', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setArtworkError(data.message ?? 'Upload failed. Try again.')
        setArtworkPreview('')
      } else {
        setArtworkUrl(data.url)
      }
    } catch {
      setArtworkError('Upload interrupted. Check your connection and try again.')
      setArtworkPreview('')
    }
    setArtworkUploading(false)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitStatus('uploading')
    setSubmitError('')
    try {
      const res  = await fetch('/api/songs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          audioUrl,
          artworkUrl:      artworkUrl      || undefined,
          lyrics:          lyrics.trim()   || undefined,
          notes:           notes.trim()    || undefined,
          genre:           genre           || undefined,
          durationSeconds: Math.round(audioDuration),
          isPublic:        !isDraft,
          isDraft,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data.error === 'DAY_TAKEN'
          ? `You've already posted a song for Day ${dayNumber}. februwriters allows one song per day.`
          : 'Something went wrong on our end. Your form data is saved. Try again in a moment.'
        setSubmitError(msg)
        setSubmitStatus('error')
        return
      }
      setSubmitStatus('success')
      setTimeout(() => router.push(`/${username}`), 2500)
    } catch {
      setSubmitError('Upload interrupted. Your form data is saved. Check your connection and try again.')
      setSubmitStatus('error')
    }
  }

  // ── Shared input class ─────────────────────────────────────────────────────

  const inputCls = 'w-full px-3 py-2.5 rounded-md bg-[#1a2535] border border-[#2d4159] text-[#F3EFE6] text-sm placeholder:text-[#3a4f68] focus:outline-none focus:border-[#C49A1A] transition-colors'
  const expandTriggerCls = 'text-sm text-[#7A8FA3] hover:text-[#F3EFE6] transition-colors'
  const labelCls = 'text-[10px] font-medium tracking-[0.12em] uppercase text-[#7A8FA3]'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#253347] px-4 py-10">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="text-[10px] font-medium tracking-[0.28em] uppercase text-[#7A8FA3] mb-3">
            februwriters
          </div>
          <p style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#C49A1A', fontSize: '1.125rem' }}>
            Posting for Day {dayNumber} · {dayjsNow.format('MMMM D')}, {year}
          </p>
          <p className={`text-xs mt-1 ${isUrgent ? 'text-[#C49A1A]' : 'text-[#7A8FA3]'}`}>
            {deadlineLine}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Audio upload zone ── */}
          <div>
            <div
              className={[
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragging      ? 'border-[#C49A1A] bg-[#C49A1A]/5' : 'border-[#2d4159] hover:border-[#7A8FA3]',
                audioUploading  ? 'animate-pulse border-[#7A8FA3] cursor-default' : '',
              ].join(' ')}
              onDragOver={(e)  => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={()  => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault(); setIsDragging(false)
                const f = e.dataTransfer.files[0]
                if (f) handleAudioFile(f)
              }}
              onClick={() => { if (!audioUploading) audioRef.current?.click() }}
            >
              <input ref={audioRef} type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioFile(f); e.target.value = '' }} />

              {audioUploading ? (
                <p className="text-[#7A8FA3] text-sm">Uploading…</p>
              ) : audioFile && audioUrl ? (
                <div>
                  <p className="text-[#F3EFE6] text-sm font-medium">{audioFile.name}</p>
                  <p className="text-[#7A8FA3] text-xs mt-1">{fmt(audioDuration)}</p>
                </div>
              ) : (
                <>
                  <p className="text-[#F3EFE6] text-sm">Drop your MP3 or WAV here</p>
                  <p className="text-[#7A8FA3] text-xs mt-1">or click to browse · max 70MB · max 10 minutes</p>
                </>
              )}
            </div>
            {audioError && <p className="text-[#c45c3a] text-xs mt-2">{audioError}</p>}
          </div>

          {/* ── Title ── */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className={labelCls}>Song title</label>
              <span className="text-[10px] text-[#7A8FA3]">{title.length}/64</span>
            </div>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 64))}
              maxLength={64} required placeholder="Untitled" className={inputCls} />
          </div>

          {/* ── Lyrics ── */}
          <div>
            {lyricsOpen ? (
              <>
                <div className="flex justify-between mb-1.5">
                  <span className={labelCls}>Lyrics</span>
                  <div className="flex gap-3">
                    <span className="text-[10px] text-[#7A8FA3]">{lyrics.length}/5000</span>
                    <button type="button" onClick={() => setLyricsOpen(false)} className="text-[10px] text-[#C49A1A] hover:text-[#d4ae3a]">hide</button>
                  </div>
                </div>
                <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value.slice(0, 5000))}
                  maxLength={5000} rows={6} placeholder="Paste your lyrics here…" className={`${inputCls} resize-none`} />
              </>
            ) : (
              <button type="button" onClick={() => setLyricsOpen(true)} className={expandTriggerCls}>
                + Add lyrics{lyrics && <span className="text-[#C49A1A]"> · added</span>}
              </button>
            )}
          </div>

          {/* ── Genre ── */}
          <div>
            {genreOpen ? (
              <>
                <label className={`block mb-1.5 ${labelCls}`}>Genre</label>
                <select value={genre} onChange={(e) => { setGenre(e.target.value); if (e.target.value) setGenreOpen(false) }}
                  className={inputCls}>
                  <option value="">Select a genre…</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </>
            ) : genre ? (
              <p className="text-sm text-[#7A8FA3]">
                Genre: <span className="text-[#F3EFE6]">{genre}</span>{' · '}
                <button type="button" onClick={() => setGenreOpen(true)} className="text-[#C49A1A] hover:text-[#d4ae3a]">change</button>
              </p>
            ) : (
              <button type="button" onClick={() => setGenreOpen(true)} className={expandTriggerCls}>+ Add genre</button>
            )}
          </div>

          {/* ── Artwork ── */}
          <div>
            {artworkOpen ? (
              <>
                <label className={`block mb-1.5 ${labelCls}`}>Artwork</label>
                <input ref={artworkRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkFile(f); e.target.value = '' }} />
                {artworkPreview ? (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={artworkPreview} alt="Artwork preview" className="w-16 h-16 rounded object-cover" />
                    {artworkUploading
                      ? <p className="text-xs text-[#7A8FA3] animate-pulse">Uploading…</p>
                      : <button type="button" onClick={() => artworkRef.current?.click()} className="text-xs text-[#C49A1A] hover:text-[#d4ae3a]">change</button>
                    }
                  </div>
                ) : (
                  <button type="button" onClick={() => artworkRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#2d4159] rounded-lg p-6 text-center text-sm text-[#7A8FA3] hover:border-[#7A8FA3] transition-colors">
                    Click to browse · JPG or PNG · max 3MB
                  </button>
                )}
                {artworkError && <p className="text-[#c45c3a] text-xs mt-1">{artworkError}</p>}
              </>
            ) : artworkUrl ? (
              <p className="text-sm text-[#7A8FA3]">
                Artwork: <span className="text-[#F3EFE6]">uploaded</span>{' · '}
                <button type="button" onClick={() => setArtworkOpen(true)} className="text-[#C49A1A] hover:text-[#d4ae3a]">change</button>
              </p>
            ) : (
              <button type="button" onClick={() => setArtworkOpen(true)} className={expandTriggerCls}>+ Add artwork</button>
            )}
          </div>

          {/* ── Notes ── */}
          <div>
            {notesOpen ? (
              <>
                <div className="flex justify-between mb-1.5">
                  <span className={labelCls}>Notes</span>
                  <button type="button" onClick={() => setNotesOpen(false)} className="text-[10px] text-[#C49A1A] hover:text-[#d4ae3a]">hide</button>
                </div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="A sentence or two — what inspired it, what you tried, etc."
                  className={`${inputCls} resize-none`} />
              </>
            ) : (
              <button type="button" onClick={() => setNotesOpen(true)} className={expandTriggerCls}>
                + Add notes{notes && <span className="text-[#C49A1A]"> · added</span>}
              </button>
            )}
          </div>

          {/* ── Visibility ── */}
          <div>
            {visibilityOpen ? (
              <>
                <label className={`block mb-2 ${labelCls}`}>Visibility</label>
                <div className="space-y-3">
                  {[
                    { label: 'Public — anyone can stream this song', draft: false },
                    { label: 'Draft — counts toward your streak but only you can hear it', draft: true },
                  ].map(({ label, draft }) => (
                    <label key={String(draft)} className="flex items-start gap-3 cursor-pointer">
                      <input type="radio" checked={isDraft === draft}
                        onChange={() => { setIsDraft(draft); setVisibilityOpen(false) }}
                        className="mt-0.5 accent-[#C49A1A]" />
                      <span className="text-sm text-[#F3EFE6]">{label}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#7A8FA3]">
                Visibility: <span className="text-[#F3EFE6]">{isDraft ? 'Draft' : 'Public'}</span>{' · '}
                <button type="button" onClick={() => setVisibilityOpen(true)} className="text-[#C49A1A] hover:text-[#d4ae3a]">change</button>
              </p>
            )}
          </div>

          {/* ── Deadline reminder ── */}
          <p className={`text-xs ${isUrgent ? 'text-[#C49A1A]' : 'text-[#7A8FA3]'}`}>{deadlineLine}</p>

          {/* ── Success bar ── */}
          {submitStatus === 'success' && (
            <div className="rounded-md bg-[#4D7B68]/20 border border-[#4D7B68] px-4 py-3">
              <p className="text-sm text-[#4D7B68]">
                Song posted.{' '}
                <a href={`/${username}`} className="underline">View it on your profile.</a>
              </p>
            </div>
          )}

          {/* ── Error bar ── */}
          {submitStatus === 'error' && (
            <div className="rounded-md bg-[#C49A1A]/10 border border-[#C49A1A]/30 px-4 py-3">
              <p className="text-sm text-[#C49A1A]">{submitError}</p>
            </div>
          )}

          {/* ── Submit ── */}
          <button type="submit" disabled={!canSubmit}
            className="w-full py-3 rounded-md bg-[#C49A1A] text-[#253347] text-sm font-medium hover:bg-[#d4ae3a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {submitStatus === 'uploading' ? 'Posting…' : 'Post song'}
          </button>

        </form>
      </div>
    </main>
  )
}
