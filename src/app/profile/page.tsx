import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const { name, email, username, timezone } = session.user as any

  return (
    <main className="min-h-screen bg-[#253347] px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#C49A1A] mb-8">
          februwriters
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#F3EFE6] mb-8">
          {name}
        </h1>
        <div className="space-y-4">
          {[
            { label: 'Username', value: `@${username}` },
            { label: 'Email',    value: email },
            { label: 'Timezone', value: timezone },
          ].map(({ label, value }) => (
            <div key={label} className="border-b border-[#2d4159] pb-4">
              <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#7A8FA3] mb-1">
                {label}
              </div>
              <div className="text-[#F3EFE6] text-sm">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
