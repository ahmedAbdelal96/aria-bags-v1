import { createClient } from '@/lib/supabase/server'
import { debugServer, debugSupabaseResult } from '@/lib/debug'
import type { Profile } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

export interface AdminAuthState {
  user: User | null
  profile: Profile | null
  isAdmin: boolean
}

/**
 * Server-side admin guard used by protected admin routes.
 *
 * This protects the app layer only. Database-level RLS still must be enabled
 * before production so data access stays secure even if a route is bypassed.
 */
export async function getAdminAuthState(): Promise<AdminAuthState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  debugServer('auth.user', {
    userId: user?.id ?? null,
    email: user?.email ?? null,
    hasUser: Boolean(user),
  })

  if (!user) {
    return { user: null, profile: null, isAdmin: false }
  }

  const profileResult = await supabase
    .from('profiles')
    .select('id, email, is_admin, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle()

  debugSupabaseResult('auth.profile', profileResult)

  const { data: profile, error } = profileResult

  if (error) {
    debugServer('auth.adminCheckError', {
      code: error.code ?? null,
      message: error.message ?? null,
      details: error.details ?? null,
      hint: error.hint ?? null,
    })
  }

  const normalizedProfile = profile
    ? ({
        id: profile.id,
        email: profile.email,
        is_admin: profile.is_admin,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      } satisfies Profile)
    : null

  return {
    user,
    profile: normalizedProfile,
    isAdmin: normalizedProfile?.is_admin === true,
  }
}
