import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StreakCalendar } from '@/components/streak-calendar'
import DashboardSongList, { SongRow } from '@/components/dashboard-song-list'
import UploadDialogDesktopTrigger from '@/components/upload-dialog-desktop-trigger'

type DayStatus = 'submitted' | 'missed' | 'today' | 'future'

function getChallengeState(now: Date): {
  state: 'pre' | 'active' | 'post'
  today: number
  displayDay: number
  daysInFebruary: number
  year: number
} {
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  const daysInFebruary = new Date(year, 2, 0).getDate()
  if (month < 1) return { state: 'pre', today: 0, displayDay: day, daysInFebruary, year }
  if (month > 1) return { state: 'post', today: daysInFebruary + 1, displayDay: daysInFebruary, daysInFebruary, year }
  const clampedDay = Math.min(day, daysInFebruary)
  return { state: 'active', today: clampedDay, displayDay: clampedDay, daysInFebruary, year }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id: userId, username } = session.user as any

  const songs = await db.song.findMany({
    where: { userId },
    select: { id: true, dayNumber: true, title: true, audioUrl: true, createdAt: true },
    orderBy: { dayNumber: 'desc' },
  }) as SongRow[]

  const { state, today, displayDay, daysInFebruary, year } = getChallengeState(new Date())

  const submittedDays     = new Set(songs.map(s => s.dayNumber))
  const hasSubmittedToday = submittedDays.has(today)
  const isDev = process.env.NODE_ENV === 'development'
  const showSubmitCTA = (state === 'active' && !hasSubmittedToday) || isDev

  const calendarDays = Array.from({ length: daysInFebruary }, (_, i) => {
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
            <span className={`font-serif text-6xl font-bold leading-none ${state === 'active' ? 'text-feb-slate' : 'text-feb-bluegray'}`}>
              {displayDay}
            </span>
            <p className="text-feb-bluegray text-xs mt-1">
              {state === 'pre'
                ? 'februwriters starts February 1'
                : state === 'post'
                ? `februwriters ${year} is complete`
                : `February ${year}`}
            </p>
          </div>

          {/* Desktop submit CTA */}
          {showSubmitCTA && (
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
            <span className="text-[9px] text-feb-gold font-semibold">{submittedDays.size} of {daysInFebruary}</span>
            <span className="text-[9px] text-feb-bluegray">Feb {daysInFebruary}</span>
          </div>
        </div>

        {/* Desktop two-column */}
        <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-8 pb-6">
          {/* Left — calendar */}
          <div>
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-feb-bluegray mb-3">
              February {year}
            </p>
            <StreakCalendar days={calendarDays} year={year} daysInFebruary={daysInFebruary} />
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
              daysInFebruary={daysInFebruary}
              showSubmitCTA={showSubmitCTA}
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
            daysInFebruary={daysInFebruary}
            showSubmitCTA={showSubmitCTA}
          />
        </div>

      </div>
    </main>
  )
}
