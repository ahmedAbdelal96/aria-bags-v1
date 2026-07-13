import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const text = fs.readFileSync(filePath, 'utf8')
  const env = {}

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
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

function shortFingerprint(value) {
  if (!value) return 'missing'
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

function projectRefFromUrl(url) {
  try {
    const host = new URL(url).hostname
    return host.split('.')[0]
  } catch {
    return 'invalid-url'
  }
}

function safeError(error) {
  if (!error) return null
  return {
    code: error.code ?? null,
    message: error.message ?? 'Unknown error',
    details: error.details ?? null,
    hint: error.hint ?? null,
  }
}

async function runQueries(label, client) {
  const categories = await client.from('categories').select('id, name, slug').order('slug', { ascending: true })
  const products = await client
    .from('products')
    .select('id, name, slug, status, is_featured, images')
    .order('created_at', { ascending: false })
  const activeProducts = await client
    .from('products')
    .select('id, name, slug, status, is_featured')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  const toteCategory = await client
    .from('categories')
    .select('id, name, slug')
    .eq('slug', 'tote-bags')
    .maybeSingle()

  let toteProducts = { data: [], error: null }
  if (toteCategory.data?.id) {
    toteProducts = await client
      .from('products')
      .select('id, name, slug, status, is_featured, category_id')
      .eq('status', 'active')
      .eq('category_id', toteCategory.data.id)
      .order('display_order', { ascending: true })
  }

  return {
    label,
    categories,
    products,
    activeProducts,
    toteCategory,
    toteProducts,
  }
}

function printResult(result) {
  const { label, categories, products, activeProducts, toteCategory, toteProducts } = result
  console.log(`\n[ARIA DIAGNOSE][${label}]`)
  console.log(`categories.count = ${categories.data?.length ?? 0}`)
  console.log(`categories.error = ${JSON.stringify(safeError(categories.error))}`)
  console.log(`products.count = ${products.data?.length ?? 0}`)
  console.log(`products.error = ${JSON.stringify(safeError(products.error))}`)
  console.log(`activeProducts.count = ${activeProducts.data?.length ?? 0}`)
  console.log(`activeProducts.error = ${JSON.stringify(safeError(activeProducts.error))}`)
  console.log(`toteCategory = ${JSON.stringify(toteCategory.data ?? null)}`)
  console.log(`toteCategory.error = ${JSON.stringify(safeError(toteCategory.error))}`)
  console.log(`toteProducts.count = ${toteProducts.data?.length ?? 0}`)
  console.log(`toteProducts.error = ${JSON.stringify(safeError(toteProducts.error))}`)
}

async function main() {
  const envPath = path.join(process.cwd(), '.env.local')
  const env = { ...parseEnvFile(envPath), ...process.env }
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.')
  }

  console.log('[ARIA DIAGNOSE] env')
  console.log(`url.ref = ${projectRefFromUrl(url)}`)
  console.log(`anon.key = ${shortFingerprint(anonKey)}`)
  console.log(`service.key = ${serviceKey ? shortFingerprint(serviceKey) : 'missing'}`)

  const anonClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const anonResult = await runQueries('anon', anonClient)
  printResult(anonResult)

  if (serviceKey) {
    const serviceClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const serviceResult = await runQueries('service', serviceClient)
    printResult(serviceResult)
  } else {
    console.log('\n[ARIA DIAGNOSE][service] skipped (missing SUPABASE_SERVICE_ROLE_KEY)')
  }
}

main().catch((error) => {
  console.error('[ARIA DIAGNOSE] failed')
  console.error(safeError(error))
  process.exitCode = 1
})
