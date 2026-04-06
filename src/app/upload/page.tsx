import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import UploadForm from '@/components/upload-form'

export default async function UploadPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id, username, timezone } = session.user as any

  return <UploadForm userId={id} username={username} timezone={timezone} />
}
