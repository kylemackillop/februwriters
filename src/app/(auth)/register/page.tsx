'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '', timezone: ''
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        const text = await res.text()
        throw new Error(`Unexpected response (${res.status}): ${text.slice(0, 200)}`)
      }

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        setLoading(false)
        return
      }

      router.push('/login?registered=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#253347] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-[#F3EFE6] text-sm font-light tracking-[0.28em] uppercase mb-3">
            februwriters
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#F3EFE6]">
            Create account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Name',     field: 'name',     type: 'text',     placeholder: 'Your name' },
            { label: 'Username', field: 'username', type: 'text',     placeholder: 'no spaces, lowercase' },
            { label: 'Email',    field: 'email',    type: 'email',    placeholder: 'you@example.com' },
            { label: 'Password', field: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#7A8FA3] mb-2">
                {label}
              </label>
              <input
                type={type}
                value={form[field as keyof typeof form]}
                onChange={e => set(field, e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-md bg-[#1a2535] border border-[#2d4159] text-[#F3EFE6] text-sm placeholder:text-[#3a4f68] focus:outline-none focus:border-[#C49A1A] transition-colors"
                placeholder={placeholder}
              />
            </div>
          ))}

          {error && (
            <p className="text-sm text-[#c45c3a]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-[#C49A1A] text-[#253347] text-sm font-medium hover:bg-[#d4ae3a] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-[#7A8FA3] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#C49A1A] hover:text-[#d4ae3a]">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
