import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  console.log('[POST /api/register] handler hit')
  try {
    const { name, username, email, password, timezone } = await req.json()

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (username.length < 3 || !/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username must be lowercase letters, numbers, or underscores.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })

    if (existing) {
      return NextResponse.json(
        { error: existing.email === email ? 'Email already registered.' : 'Username taken.' },
        { status: 409 }
      )
    }

    const passwordHash = await hash(password, 12)

    await db.user.create({
      data: {
        name,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        timezone: timezone ?? 'UTC',
      },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
