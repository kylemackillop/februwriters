import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StreakCalendar } from '@/components/streak-calendar'
import DashboardSongList, { SongRow } from '@/components/dashboard-song-list'
import UploadDialogDesktopTrigger from '@/components/upload-dialog-desktop-trigger'

type DayStatus = 'submitted' | 'missed' | 'today' | 'future'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id: userId, username } = session.user as any

  const songs = await db.song.findMany({
    where: { userId },
    select: { id: true, dayNumber: true, title: true, audioUrl: true, createdAt: true },
    orderBy: { dayNumber: 'desc' },
  }) as SongRow[]

  const now   = new Date()
  const today = Math.min(now.getDate(), 28)
  const currentYear  = now.getFullYear()
  const currentMonth = 'February'

  const submittedDays     = new Set(songs.map(s => s.dayNumber))
  const hasSubmittedToday = submittedDays.has(today)

  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const day = i + 1
    let status: DayStatus
    if (submittedDays.has(day))  status = 'submitted'
    else if (day === today)      status = 'today'
    else if (day < today)        status = 'missed'
    else                         status = 'future'
    return { day, status }
  })

  return (
    <main className="min-h-screen bg-feb-linen pb-32">
      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {/* Hero */}
        <div className="pt-4 pb-3 md:pt-6 flex items-end justify-between">
          <div>
            <span className="font-serif text-6xl font-bold text-feb-slate leading-none">{today}</span>
            <p className="text-feb-bluegray text-xs mt-1">{currentMonth} {currentYear}</p>
          </div>

          {/* Desktop submit CTA */}
          {!hasSubmittedToday && (
            <div className="hidden lg:flex">
              <UploadDialogDesktopTrigger today={today} />
            </div>
          )}
        </div>

        {/* Mobile calendar strip */}
        <div className="block lg:hidden mb-3">
          <div className="flex gap-0.5">
            {calendarDays.map(({ day, status }) => (
              <div
                key={day}
                className={[
                  'flex-1 h-1 rounded-full',
                  status === 'submitted' && 'bg-feb-gold',
                  status === 'today'     && 'bg-feb-slate/15 border border-feb-gold',
                  status === 'future'    && 'bg-feb-slate/10',
                  status === 'missed'    && 'bg-feb-slate/20',
                ].filter(Boolean).join(' ')}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-feb-bluegray">Feb 1</span>
            <span className="text-[9px] text-feb-gold font-semibold">{submittedDays.size} of 28</span>
            <span className="text-[9px] text-feb-bluegray">Feb 28</span>
          </div>
        </div>

        {/* Desktop two-column */}
        <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-8 pb-6">
          {/* Left — calendar */}
          <div>
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-feb-bluegray mb-3">
              {currentMonth} {currentYear}
            </p>
            <StreakCalendar days={calendarDays} year={currentYear} />
          </div>

          {/* Right — song list */}
          <div>
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-feb-bluegray mb-3">
              Songs · {songs.length} tracks
            </p>
            <DashboardSongList
              songs={songs}
              username={username ?? ''}
              today={today}
              hasSubmittedToday={hasSubmittedToday}
            />
          </div>
        </div>

        {/* Mobile/tablet song list */}
        <div className="block lg:hidden">
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-feb-bluegray mb-3">
            Songs · {songs.length} tracks
          </p>
          <DashboardSongList
            songs={songs}
            username={username ?? ''}
            today={today}
            hasSubmittedToday={hasSubmittedToday}
          />
        </div>

      </div>
    </main>
  )
}
