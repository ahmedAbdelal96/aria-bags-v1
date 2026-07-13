import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const text = fs.readFileSync(filePath, 'utf8')
  const env = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

const IMAGE_MAP = {
  'onyx-classic-tote': '/seed/handbags/aria-classic-tote.webp',
  'luna-mini-crossbody': '/seed/handbags/aria-mini-crossbody.webp',
  'aurora-shoulder-bag': '/seed/handbags/aria-soft-shoulder.webp',
  'etoile-evening-clutch': '/seed/handbags/aria-evening-clutch.webp',
  'mira-city-backpack': '/seed/handbags/aria-work-satchel.webp',
  'sienna-structured-tote': '/seed/handbags/aria-classic-tote.webp',
}

function hasUnsplash(value) {
  return typeof value === 'string' && value.includes('images.unsplash.com')
}

function normalizeImages(images) {
  if (Array.isArray(images)) return images
  if (typeof images === 'string' && images.length > 0) return [images]
  return []
}

async function main() {
  const env = { ...parseEnv(path.join(process.cwd(), '.env.local')), ...process.env }
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  }

  const client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: products, error } = await client
    .from('products')
    .select('id, name, slug, status, image_url, images')
    .order('created_at', { ascending: false })

  if (error) throw error

  const rowsToFix = (products || []).filter((row) =>
    hasUnsplash(row.image_url) || normalizeImages(row.images).some(hasUnsplash),
  )

  console.log(`[ARIA CLEANUP] products with Unsplash images: ${rowsToFix.length}`)

  for (const row of rowsToFix) {
    const localImage = IMAGE_MAP[row.slug] ?? '/seed/handbags/aria-classic-tote.webp'
    const nextImages = [localImage]

    const { error: updateError } = await client
      .from('products')
      .update({
        image_url: localImage,
        images: nextImages,
      })
      .eq('id', row.id)

    if (updateError) {
      throw updateError
    }

    console.log(`[ARIA CLEANUP] updated ${row.slug} -> ${localImage}`)
  }

  const { data: remaining, error: verifyError } = await client
    .from('products')
    .select('id, name, slug, status, image_url, images')
    .order('created_at', { ascending: false })

  if (verifyError) throw verifyError

  const remainingUnsplash = (remaining || []).filter((row) =>
    hasUnsplash(row.image_url) || normalizeImages(row.images).some(hasUnsplash),
  )

  console.log(`[ARIA CLEANUP] remaining Unsplash rows: ${remainingUnsplash.length}`)
}

main().catch((error) => {
  console.error('[ARIA CLEANUP] failed')
  console.error(error?.message ?? error)
  process.exitCode = 1
})
