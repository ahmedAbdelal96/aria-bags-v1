const INTERNAL_PATH_RE = /^\/(?!\/)/

export function sanitizeInternalPath(
  value: string | null | undefined,
  fallback = '/',
) {
  if (!value) return fallback

  const trimmed = value.trim()

  if (!INTERNAL_PATH_RE.test(trimmed)) return fallback

  try {
    const decoded = decodeURIComponent(trimmed)
    return INTERNAL_PATH_RE.test(decoded) ? decoded : fallback
  } catch {
    return fallback
  }
}

export function buildLoginRedirect(nextPath?: string | null) {
  const safeNext = sanitizeInternalPath(nextPath, '/')
  return `/admin/login?next=${encodeURIComponent(safeNext)}`
}
