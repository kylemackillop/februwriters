'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Nav() {
  const { data: session, status } = useSession()

  return (
    <nav className="w-full bg-feb-slate px-6 flex items-center justify-between" style={{ height: 56 }}>
      <Link
        href="/"
        className="font-serif text-lg font-bold tracking-tight text-feb-gold"
      >
        februwriters
      </Link>

      {status === 'loading' ? null : session ? (
        <div className="flex items-center gap-6">
          <span className="text-feb-linen text-sm">
            {(session.user as any)?.name ?? (session.user as any)?.username}
          </span>
          <button
            onClick={() => signOut()}
            className="text-feb-bluegray text-sm hover:text-feb-linen transition-colors"
          >
            sign out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <Link href="/login"    className="text-feb-bluegray text-sm hover:text-feb-linen transition-colors">log in</Link>
          <Link href="/register" className="text-feb-bluegray text-sm hover:text-feb-linen transition-colors">register</Link>
        </div>
      )}
    </nav>
  )
}
