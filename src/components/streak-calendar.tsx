'use client'

import { useRouter } from 'next/navigation'

export type DayStatus = 'submitted' | 'missed' | 'today' | 'future'

export interface StreakDay {
  day: number
  status: DayStatus
  songSlug?: string
}

interface StreakCalendarProps {
  days: StreakDay[]
  year: number
  showStreakCalendar?: boolean
}

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(14, minmax(0, 1fr))', gap: '3px' }
const CELL = { aspectRatio: '1.8', fontSize: '10px', fontFamily: 'system-ui' }

function cellClasses(status: DayStatus): string {
  const base = 'rounded flex items-center justify-center'
  if (status === 'submitted') return `${base} bg-[#C49A1A] cursor-pointer`
  if (status === 'missed')    return `${base} bg-[#7A8FA3] opacity-30 cursor-default`
  if (status === 'today')     return `${base} border-2 border-[#C49A1A] bg-transparent cursor-pointer`
  return                             `${base} bg-[#253347] opacity-[0.08] cursor-default`
}

const CELL_COLOR: Record<DayStatus, string> = {
  submitted: '#253347',
  missed:    '#7A8FA3',
  today:     '#C49A1A',
  future:    'rgba(37,51,71,0.25)',
}

const LEGEND = [
  { label: 'submitted', bg: '#C49A1A',   border: undefined,  opacity: undefined },
  { label: 'today',     bg: 'transparent', border: '#C49A1A', opacity: undefined },
  { label: 'missed',    bg: '#7A8FA3',   border: undefined,  opacity: 0.3 },
  { label: 'upcoming',  bg: '#253347',   border: undefined,  opacity: 0.08 },
]

export function StreakCalendar({ days, showStreakCalendar = true }: StreakCalendarProps) {
  const router = useRouter()

  if (!showStreakCalendar) return null

  const submitted = days.filter(d => d.status === 'submitted').length
  const missed    = days.filter(d => d.status === 'missed').length
  const remaining = days.filter(d => d.status === 'future').length

  function handleClick(day: StreakDay) {
    if (day.status === 'missed' || day.status === 'future') return
    if (day.status === 'submitted' && day.songSlug) router.push(`/songs/${day.songSlug}`)
    else if (day.status === 'today') router.push(day.songSlug ? `/songs/${day.songSlug}` : '/upload')
  }

  const rows = [days.filter(d => d.day <= 14), days.filter(d => d.day > 14)]

  return (
    <div className="w-full space-y-3">
      <p className="font-mono text-xs text-[#7A8FA3]">
        <span className="text-[#C49A1A]">{submitted}</span>
        {' of 28 days · '}{missed} missed{' · '}{remaining} remaining
      </p>

      <div className="space-y-[3px]">
        {rows.map((row, ri) => (
          <div key={ri} style={GRID}>
            {row.map(day => (
              <div
                key={day.day}
                className={cellClasses(day.status)}
                style={{ ...CELL, color: CELL_COLOR[day.status] }}
                onClick={() => handleClick(day)}
              >
                {day.day}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {LEGEND.map(({ label, bg, border, opacity }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: bg, border: border ? `2px solid ${border}` : undefined, opacity }}
            />
            <span className="text-[10px] text-[#7A8FA3]">{label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
