import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function SongPage({ params }: { params: { id: string } }) {
  const song = await db.song.findUnique({
    where: { slug: params.id },
    include: { user: { select: { username: true, name: true } } },
  })

  if (!song) notFound()

  const minutes = Math.floor(song.durationSeconds / 60)
  const seconds = String(song.durationSeconds % 60).padStart(2, '0')

  return (
    <main className="min-h-screen bg-feb-linen">
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-12">
        <Link href="/dashboard" className="text-xs text-feb-bluegray hover:text-feb-slate transition-colors">
          ← dashboard
        </Link>

        <div className="mt-8">
          <p className="text-xs text-feb-bluegray uppercase tracking-widest mb-1">
            Day {song.dayNumber} · {minutes}:{seconds}
          </p>
          <h1 className="font-serif text-4xl font-bold text-feb-slate leading-tight">
            {song.title}
          </h1>
          <p className="text-feb-bluegray text-sm mt-2">
            {song.user.name ?? song.user.username}
          </p>
        </div>

        <div className="mt-8">
          <audio controls src={song.audioUrl} className="w-full" />
        </div>

        {song.lyrics && (
          <div className="mt-10">
            <p className="text-xs text-feb-bluegray uppercase tracking-widest mb-3">Lyrics</p>
            <pre className="text-feb-slate text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {song.lyrics}
            </pre>
          </div>
        )}

        {song.notes && (
          <div className="mt-8 pb-16">
            <p className="text-xs text-feb-bluegray uppercase tracking-widest mb-3">Notes</p>
            <p className="text-feb-slate text-sm leading-relaxed">{song.notes}</p>
          </div>
        )}
      </div>
    </main>
  )
}
