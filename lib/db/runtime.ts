import { debugServer } from '@/lib/debug'

const MOCK_DATA_MESSAGE = 'Using ARIA mock data because Supabase is not available.'

let mockDataMessageLogged = false

function isPlaceholder(value: string | undefined | null) {
  if (!value) return true
  const normalized = value.trim().toLowerCase()
  return (
    normalized.includes('your_supabase') ||
    normalized.includes('placeholder') ||
    normalized === 'changeme' ||
    normalized === 'change-me'
  )
}

export function hasValidSupabaseConfig() {
  return !isPlaceholder(process.env.NEXT_PUBLIC_SUPABASE_URL) && !isPlaceholder(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export function isProductionDeployment() {
  return process.env.NODE_ENV === 'production'
}

export function canUseMockFallback() {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
  )
}

export function logMockDataUsage() {
  if (mockDataMessageLogged) return
  mockDataMessageLogged = true
  console.info(MOCK_DATA_MESSAGE)
}

export async function withStoreFallback<T>({
  query,
  fallback,
  scope = 'store.query',
}: {
  query: () => Promise<T>
  fallback: () => T
  scope?: string
}) {
  if (!hasValidSupabaseConfig()) {
    if (!canUseMockFallback()) {
      throw new Error('Supabase is not configured for this environment.')
    }

    logMockDataUsage()
    debugServer(scope, { mode: 'fallback', reason: 'invalid supabase config' })
    return fallback()
  }

  try {
    const result = await query()
    return result
  } catch (error) {
    if (!canUseMockFallback()) {
      throw error
    }

    logMockDataUsage()
    debugServer(scope, {
      mode: 'fallback',
      reason: 'query error',
      error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
    })
    return fallback()
  }
}
