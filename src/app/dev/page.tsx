'use client'

import { useState } from 'react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge }    from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import SongCard from '@/components/song-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StreakCalendar } from '@/components/streak-calendar'
import AudioPlayer from '@/components/audio-player'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Demo data for StreakCalendar ─────────────────────────────────────────────

const DEMO_DAYS = [
  ...Array.from({ length: 8 },  (_, i) => ({ day: i + 1,  status: 'submitted' as const, songSlug: `song-feb-${i + 1}` })),
  { day: 9, status: 'missed' as const },
  ...Array.from({ length: 13 }, (_, i) => ({ day: i + 10, status: 'submitted' as const, songSlug: `song-feb-${i + 10}` })),
  { day: 23, status: 'today' as const },
  ...Array.from({ length: 5 },  (_, i) => ({ day: i + 24, status: 'future' as const })),
]

// ─── StreakGrid (legacy inline) ───────────────────────────────────────────────

type DayState = 'submitted' | 'missed' | 'today' | 'upcoming'

function dayState(day: number): DayState {
  if (day < 14)  return 'submitted'
  if (day < 18)  return 'missed'
  if (day === 18) return 'today'
  return 'upcoming'
}

const dayLabel: Record<DayState, string> = {
  submitted: 'Submitted',
  missed:    'Missed',
  today:     'Today',
  upcoming:  'Upcoming',
}

function StreakGrid() {
  const days = Array.from({ length: 28 }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(day => {
        const state = dayState(day)
        return (
          <div
            key={day}
            title={`Day ${day} — ${dayLabel[state]}`}
            className={[
              'aspect-square rounded flex items-center justify-center text-[10px] font-medium select-none',
              state === 'submitted' && 'bg-feb-gold text-feb-slate',
              state === 'missed'    && 'bg-feb-slate-mid text-feb-bluegray line-through',
              state === 'today'     && 'bg-transparent border-2 border-feb-gold text-feb-gold',
              state === 'upcoming'  && 'bg-feb-slate-mid/40 text-feb-bluegray/50',
            ].filter(Boolean).join(' ')}
          >
            {day}
          </div>
        )
      })}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[10px] font-medium tracking-[0.14em] uppercase text-feb-bluegray border-b border-feb-bluegray/20 pb-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <main className="min-h-screen bg-feb-linen px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-12">

        {/* Header */}
        <div>
          <div className="text-[10px] font-medium tracking-[0.28em] uppercase text-feb-gold mb-2">
            februwriters
          </div>
          <h1 className="text-feb-slate text-2xl font-bold">
            Component Showcase
          </h1>
          <p className="text-feb-bluegray text-sm mt-1">
            Development reference — not a production page.
          </p>
        </div>

        {/* Buttons */}
        <Section title="Button">
          <div className="flex flex-wrap gap-3">
            <Button className="bg-feb-gold text-feb-slate hover:bg-feb-gold-light">Gold (primary)</Button>
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        {/* Input */}
        <Section title="Input">
          <div className="space-y-3 max-w-sm">
            <Input placeholder="Email address" type="email" />
            <Input placeholder="Password" type="password" />
            <Input placeholder="Disabled" disabled />
          </div>
        </Section>

        {/* Textarea */}
        <Section title="Textarea">
          <div className="max-w-sm">
            <Textarea placeholder="Write something…" rows={4} />
          </div>
        </Section>

        {/* Badge */}
        <Section title="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-feb-gold text-feb-slate hover:bg-feb-gold-light">
              Gold
            </Badge>
          </div>
        </Section>

        {/* Card */}
        <Section title="Card">
          <div className="flex flex-wrap gap-4">
            <div className="w-72">
              <SongCard
                day={14}
                date="February 14 · 2:34"
                title="Untitled Sketch"
                artistName="kylemackillop"
                audioSrc="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                showArtist={false}
              />
            </div>
            <div className="w-72">
              <SongCard
                day={7}
                date="February 7 · 1:52"
                title="Morning Loop"
                artistName="kylemackillop"
                audioSrc="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                showArtist={true}
              />
            </div>
          </div>
        </Section>

        {/* Avatar */}
        <Section title="Avatar">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
              <AvatarFallback className="bg-feb-gold text-feb-slate font-medium">
                KM
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-feb-gold text-feb-slate font-medium">
                KM
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-feb-slate-mid text-feb-bluegray">
                ?
              </AvatarFallback>
            </Avatar>
          </div>
        </Section>

        {/* Dialog */}
        <Section title="Dialog">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="bg-feb-slate-dark border-feb-slate-mid text-feb-linen">
              <DialogHeader>
                <DialogTitle className="text-feb-linen">Submit today's song</DialogTitle>
                <DialogDescription className="text-feb-bluegray">
                  Upload your recording for day 18. You can replace it until midnight.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <Input placeholder="Title (optional)" className="bg-feb-slate border-feb-slate-mid text-feb-linen" />
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  className="text-feb-linen/80 hover:text-feb-linen"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-feb-gold text-feb-slate hover:bg-feb-gold-light"
                  onClick={() => setDialogOpen(false)}
                >
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        {/* Dropdown Menu */}
        <Section title="Dropdown Menu">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline">Open Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-feb-slate-dark border-feb-slate-mid text-feb-linen">
              <DropdownMenuItem className="focus:bg-feb-slate-mid focus:text-feb-linen">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-feb-slate-mid focus:text-feb-linen">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-feb-slate-mid" />
              <DropdownMenuItem className="text-destructive focus:bg-feb-slate-mid">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        {/* Audio Player */}
        <Section title="Audio Player">
          <div className="max-w-sm bg-white border border-feb-bluegray/20 rounded-lg px-4 py-3">
            <AudioPlayer src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
          </div>
        </Section>

        {/* StreakCalendar component */}
        <Section title="StreakCalendar component">
          <StreakCalendar days={DEMO_DAYS} year={2026} />
        </Section>

        {/* Streak Grid (inline legacy reference) */}
        <Section title="StreakGrid — inline reference">
          <div className="space-y-3">
            <StreakGrid />
            <div className="flex gap-4 text-[10px] text-feb-bluegray">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-feb-gold inline-block" />
                Submitted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-feb-slate-mid inline-block" />
                Missed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm border-2 border-feb-gold inline-block" />
                Today
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-feb-slate-mid/40 inline-block" />
                Upcoming
              </span>
            </div>
          </div>
        </Section>

      </div>
    </main>
  )
}
