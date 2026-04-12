@AGENTS.md

# Februwriters — Claude Code Reference

## What this project is
A web platform for a month-long songwriting discipline challenge. Participants post one original song per day throughout February. The challenge runs annually. The platform is being built for 2027 targeting global participation.

Core positioning: "The Discipline Challenge" — personal completion over group volume.

## Repo
~/Documents/GitHub/februwriters
https://github.com/kylemackillop/februwriters

## Stack
- Next.js 16.2.1, TypeScript, Turbopack
- Tailwind v4 — NO tailwind.config.ts. All tokens in src/app/globals.css using `@theme inline` and oklch colors
- shadcn/ui — Default style, Slate base, CSS variables
- Prisma 7 with @prisma/adapter-pg — DB URL configured in prisma.config.ts (not schema.prisma)
- PostgreSQL via Railway
- Auth.js v5 beta — Credentials provider only, no OAuth
- Cloudinary — audio and image storage, cloud name ds7uf0l8g
- Howler.js — audio playback in MiniPlayer only
- dayjs with utc + timezone plugins

## Key environment variables
### Local (.env)
- DATABASE_URL — public Railway URL (interchange.proxy.rlwy.net)
- AUTH_SECRET
- AUTH_URL
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ds7uf0l8g
- NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=februwriters-audio
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- UPLOAD_ALWAYS_OPEN=true (bypasses February gate for dev testing)

### Railway staging
Same as above plus PORT (injected by Railway automatically).
Do NOT add CLOUDINARY_URL — it breaks the build.

## Running migrations
```
npm run db:migrate
```
Uses `npx @dotenvx/dotenvx run -- prisma migrate dev` internally. dotenvx must load before Prisma due to ES module hoisting.

## npm scripts
- `db:migrate` — run migrations
- `db:generate` — regenerate Prisma client
- `db:studio` — open Prisma Studio
- `db:push` — push schema without migration file

## File structure
```
src/auth.ts                                       Auth.js config
src/lib/db.ts                                     Prisma singleton with PrismaPg adapter
src/context/player-context.tsx                    PlayerContext (tracks currentSong by id, not src)
src/components/providers.tsx                      SessionProvider client wrapper
src/components/ui/                                shadcn primitives
src/components/nav.tsx                            Site navigation
src/components/mini-player.tsx                    Fixed bottom audio player (Howler instance lives here)
src/components/streak-calendar.tsx                28/29-day February grid
src/components/dashboard-song-list.tsx            Client component — song rows + mobile submit CTA
src/components/upload-dialog.tsx                  Cloudinary XHR upload + POST /api/songs
src/components/upload-dialog-desktop-trigger.tsx  Desktop CTA wrapper (client, useState)
src/app/globals.css                               Tailwind v4 tokens and brand colors
src/app/page.tsx                                  Redirects to /dashboard if authed, /login if not
src/app/(auth)/login/page.tsx                     Login page
src/app/(auth)/register/page.tsx                  Register page
src/app/api/register/route.ts                     Registration endpoint (NOT under /api/auth/ — Auth.js owns that prefix)
src/app/api/songs/route.ts                        POST: upserts song for the day
src/app/api/upload/audio/route.ts                 Audio upload helper (streams to Cloudinary)
src/app/api/upload/artwork/route.ts               Artwork upload helper
src/app/dashboard/page.tsx                        Auth-required artist dashboard (server component)
src/app/songs/[id]/page.tsx                       Individual song page — [id] param is the song slug
src/app/dev/page.tsx                              Component showcase
prisma/schema.prisma                              Database schema
prisma.config.ts                                  Prisma datasource config (reads DATABASE_URL)
```

## Routes
- `/dashboard` — auth required, artist's own view
- `/songs/[id]` — individual song page, public, `[id]` is song slug
- `/[username]` — public artist profile (not yet built)
- `/dev` — component showcase

## Brand colors (defined in src/app/globals.css)
| Token | Hex | Use |
|---|---|---|
| feb-slate | #253347 | Primary dark, backgrounds |
| feb-slate-dark | #1a2535 | Deeper dark (inputs) |
| feb-slate-mid | #2d4159 | Borders on dark surfaces |
| feb-gold | #C49A1A | Primary accent, submit CTAs |
| feb-gold-light | #d4ae3a | Hover state for gold |
| feb-linen | #F3EFE6 | Page background |
| feb-bluegray | #7A8FA3 | Muted text, secondary labels |
| feb-sage | #4D7B68 | Secondary accent |

## Typography
- `font-serif` — Georgia 700, editorial display (day numbers, song titles, wordmark)
- System UI — all functional UI text

## Key product rules
- Songs only uploadable during February unless `UPLOAD_ALWAYS_OPEN=true`
- Songs API derives `dayNumber` server-side from user's stored timezone (dayjs)
- Uploading a second song on the same day replaces the first (upsert, not 409)
- Song slug format: `{username}-day{dayNumber}-{year}`
- Untitled songs display as `YYYYMMDD_username` — this formatting lives in `dashboard-song-list.tsx`, not the API
- Cloudinary `resource_type` must be `"video"` for audio files
- Duration comes from Cloudinary response (`res.duration`), stored as `durationSeconds` integer
- Leap year detection: `new Date(year, 2, 0).getDate()`

## Dashboard state logic (getChallengeState in dashboard/page.tsx)
Returns: `state` (pre/active/post), `today` (feb day number or sentinel), `displayDay` (safe for rendering), `daysInFebruary`, `year`.

- `today` in post-state is `daysInFebruary + 1` — this sentinel marks all non-submitted days as missed in the calendar loop
- `displayDay` is always safe to render in the hero (shows `daysInFebruary` in post-state, not the sentinel)
- `showSubmitCTA = (active && !hasSubmittedToday) || isDev || uploadAlwaysOpen`
- Pass `dialogDay` (not `today`) to dialogs — `dialogDay = active ? today : daysInFebruary`

## Audio playback
Howler.js instance lives in `MiniPlayer`. `PlayerContext` tracks `currentSong` by `id` (not `src` URL). Play is triggered from `PlayButton` via `usePlayer()`. No next/prev queue in MVP.

## What is NOT built yet
- `/[username]` public profile page
- Groups
- Search
- Admin console
- Email verification
- Song detail page design (currently bare `<audio>` element + metadata)
- Mini player queue system

## Deployment
Staging: https://februwriters-staging.up.railway.app
Auto-deploys on push to `main`. Railway injects PORT (8080).
