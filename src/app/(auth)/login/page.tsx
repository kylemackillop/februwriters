'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email or password is incorrect.')
      setLoading(false)
      return
    }

    router.push('/profile')
  }

  return (
    <main className="min-h-screen bg-[#253347] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-[#F3EFE6] text-sm font-light tracking-[0.28em] uppercase mb-3">
            februwriters
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#F3EFE6]">
            Sign in
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#7A8FA3] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-md bg-[#1a2535] border border-[#2d4159] text-[#F3EFE6] text-sm placeholder:text-[#3a4f68] focus:outline-none focus:border-[#C49A1A] transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#7A8FA3] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-md bg-[#1a2535] border border-[#2d4159] text-[#F3EFE6] text-sm placeholder:text-[#3a4f68] focus:outline-none focus:border-[#C49A1A] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-[#c45c3a]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-[#C49A1A] text-[#253347] text-sm font-medium hover:bg-[#d4ae3a] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-[#7A8FA3] mt-6">
          No account?{' '}
          <Link href="/register" className="text-[#C49A1A] hover:text-[#d4ae3a]">
            Register
          </Link>
        </p>
      </div>
    </main>
  )
}
