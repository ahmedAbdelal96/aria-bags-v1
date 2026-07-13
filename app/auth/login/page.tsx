import { redirect } from 'next/navigation'
import { sanitizeInternalPath } from '@/lib/auth/redirect'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = sanitizeInternalPath(params?.next, '/admin')
  redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`)
}
