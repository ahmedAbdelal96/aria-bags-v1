import { sanitizeInternalPath } from '@/lib/auth/redirect'
import { LoginForm } from './login-form'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = sanitizeInternalPath(params?.next, '/admin')

  return <LoginForm nextPath={nextPath} />
}
