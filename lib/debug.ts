type DebugData = Record<string, unknown> | unknown[] | string | number | boolean | null | undefined

const CLIENT_DEBUG_ENABLED = process.env.NEXT_PUBLIC_ARIA_DEBUG === 'true'
const SERVER_DEBUG_ENABLED =
  process.env.ARIA_SERVER_DEBUG === 'true' || process.env.NEXT_PUBLIC_ARIA_DEBUG === 'true'

const SENSITIVE_KEYS = [
  'access_token',
  'anon',
  'authorization',
  'cookie',
  'cookies',
  'password',
  'refresh_token',
  'secret',
  'service',
  'session',
  'token',
]

function prefix(scope: string) {
  return `[ARIA DEBUG][${scope}]`
}

function isSensitiveKey(key: string) {
  const normalized = key.toLowerCase()
  return SENSITIVE_KEYS.some((needle) => normalized.includes(needle))
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (value == null) return value
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (depth >= 2) {
    return Array.isArray(value) ? `[array:${value.length}]` : '[object]'
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1))
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        result[key] = '[redacted]'
        continue
      }
      if (entry instanceof Error) {
        result[key] = {
          name: entry.name,
          message: entry.message,
          stack: entry.stack ? '[redacted]' : undefined,
        }
        continue
      }
      result[key] = sanitizeValue(entry, depth + 1)
    }
    return result
  }

  return String(value)
}

export function isClientDebug() {
  return CLIENT_DEBUG_ENABLED
}

export function isServerDebug() {
  return SERVER_DEBUG_ENABLED
}

export function debugClient(scope: string, data?: DebugData) {
  if (!CLIENT_DEBUG_ENABLED) return
  if (data === undefined) {
    console.info(prefix(scope))
    return
  }

  console.info(prefix(scope), sanitizeValue(data))
}

export function debugServer(scope: string, data?: DebugData) {
  if (!SERVER_DEBUG_ENABLED) return
  if (data === undefined) {
    console.info(prefix(scope))
    return
  }

  console.info(prefix(scope), sanitizeValue(data))
}

export function debugSupabaseResult(scope: string, result: {
  data?: unknown
  error?: unknown
  count?: number | null
  status?: number | null
}) {
  if (!SERVER_DEBUG_ENABLED) return

  const payload: Record<string, unknown> = {
    status: result.status ?? null,
    count: result.count ?? null,
  }

  if (Array.isArray(result.data)) {
    payload.dataCount = result.data.length
    payload.dataType = 'array'
  } else if (result.data && typeof result.data === 'object') {
    payload.dataType = 'object'
    payload.dataKeys = Object.keys(result.data as Record<string, unknown>).slice(0, 12)
  } else if (result.data != null) {
    payload.dataType = typeof result.data
  }

  if (result.error) {
    const error = result.error as Record<string, unknown> & { message?: string; code?: string }
    payload.error = {
      code: typeof error.code === 'string' ? error.code : undefined,
      message: typeof error.message === 'string' ? error.message : 'Unknown error',
      hint: typeof error.hint === 'string' ? error.hint : undefined,
      details: typeof error.details === 'string' ? error.details : undefined,
    }
  }

  console.info(prefix(scope), sanitizeValue(payload))
}
