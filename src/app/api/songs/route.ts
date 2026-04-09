import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: userId, username, timezone: userTimezone } = session.user as any

  const now = dayjs().tz(userTimezone)
  const dayNumber = now.date()
  const month     = now.month() // 0-indexed: 1 = February
  const year      = now.year()

  if (month !== 1 && process.env.UPLOAD_ALWAYS_OPEN !== 'true') {
    return NextResponse.json(
      { error: 'Songs can only be posted during February.' },
      { status: 400 }
    )
  }

  const existing = await db.song.findUnique({
    where: { userId_dayNumber_year: { userId, dayNumber, year } },
  })

  let body: {
    title: string
    audioUrl: string
    artworkUrl?: string
    lyrics?: string
    notes?: string
    genre?: string
    durationSeconds: number
    isPublic: boolean
    isDraft: boolean
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const { title, audioUrl, artworkUrl, lyrics, notes, genre, durationSeconds, isPublic, isDraft } = body

  if (!title?.trim() || !audioUrl || typeof durationSeconds !== 'number') {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // Slug: globally unique because username is unique
  const baseSlug = `${username}-day${dayNumber}-${year}`
  let slug = baseSlug
  let attempt = 0
  while (attempt < 5) {
    const taken = await db.song.findUnique({ where: { slug } })
    if (!taken) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  try {
    const song = existing
      ? await db.song.update({
          where: { id: existing.id },
          data: {
            title: title.trim().slice(0, 64),
            audioUrl,
            artworkUrl: artworkUrl ?? null,
            lyrics:     lyrics?.trim()  || null,
            notes:      notes?.trim()   || null,
            genre:      genre           || null,
            durationSeconds,
            isPublic:   isPublic  ?? true,
            isDraft:    isDraft   ?? false,
          },
        })
      : await db.song.create({
          data: {
            title: title.trim().slice(0, 64),
            slug,
            audioUrl,
            artworkUrl: artworkUrl ?? null,
            lyrics:     lyrics?.trim()  || null,
            notes:      notes?.trim()   || null,
            genre:      genre           || null,
            durationSeconds,
            dayNumber,
            year,
            isPublic:   isPublic  ?? true,
            isDraft:    isDraft   ?? false,
            userId,
          },
        })

    return NextResponse.json({ slug: song.slug }, { status: existing ? 200 : 201 })
  } catch (err) {
    console.error('[songs POST]', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
