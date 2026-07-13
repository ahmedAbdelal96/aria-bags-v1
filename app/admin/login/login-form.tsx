'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { debugClient } from '@/lib/debug'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      const userId = data.user?.id
      if (!userId) {
        throw new Error('We could not sign you in right now. Please try again.')
      }

      debugClient('auth.user', {
        userId,
        email: data.user?.email ?? null,
      })

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, is_admin')
        .eq('id', userId)
        .maybeSingle()

      debugClient('auth.profile', {
        profileFound: Boolean(profile),
        profileId: profile?.id ?? null,
        profileEmail: profile?.email ?? null,
        profileIsAdmin: profile?.is_admin ?? null,
      })

      if (profileError) {
        debugClient('auth.adminCheckError', {
          code: profileError.code ?? null,
          message: profileError.message ?? null,
          details: profileError.details ?? null,
          hint: profileError.hint ?? null,
        })
        throw profileError
      }

      if (!profile?.is_admin) {
        await supabase.auth.signOut()
        debugClient('auth.redirect', {
          reason: 'not_admin',
          nextPath,
          userId,
          profileId: profile?.id ?? null,
          profileEmail: profile?.email ?? null,
        })
        setError('You do not have admin access.')
        return
      }

      debugClient('auth.redirect', {
        reason: 'admin',
        nextPath,
        userId,
      })
      router.replace(nextPath)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : ''
      if (/invalid login credentials/i.test(message)) {
        setError('Invalid email or password.')
      } else if (/email.*not.*confirmed/i.test(message)) {
        setError('Invalid email or password.')
      } else if (message === 'You do not have admin access.') {
        setError(message)
      } else {
        setError('We could not sign you in right now. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-admin-bg p-6 md:p-10 font-sans">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-admin-primary bg-admin-primary/10 px-2.5 py-0.5 rounded">
              ARIA Admin
            </span>
            <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight text-admin-text">Store login</h1>
            <p className="mt-2 text-sm text-admin-muted-text">
              Admin access for store management only. Customers check out as guests.
            </p>
          </div>

          <Card className="border-admin-border bg-admin-card shadow-md rounded-2xl">
            <CardHeader className="pb-3 border-b border-admin-border/60">
              <CardTitle className="font-sans text-xl font-bold text-admin-text">Sign in</CardTitle>
              <CardDescription className="text-xs text-admin-muted-text">
                Enter your admin credentials to continue to dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-admin-text">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@aria.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 border-admin-border bg-admin-card rounded-lg focus:ring-admin-primary focus:border-admin-primary"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold text-admin-text">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 border-admin-border bg-admin-card rounded-lg focus:ring-admin-primary focus:border-admin-primary"
                    />
                  </div>
                  {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
                  <Button type="submit" disabled={isLoading} className="w-full h-10 rounded-lg bg-admin-primary text-white hover:bg-admin-primary-hover border-0 shadow-sm font-semibold text-sm cursor-pointer transition-colors">
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>
                <div className="mt-5 flex flex-col items-center gap-2.5 text-center text-xs text-admin-muted-text border-t border-admin-border/50 pt-4">
                  <p>Admin accounts are created manually by the store owner.</p>
                  <Link href="/" className="font-semibold text-admin-primary hover:underline">
                    Back to storefront
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
