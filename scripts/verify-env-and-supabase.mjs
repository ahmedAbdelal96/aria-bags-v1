import fs from 'fs'
import path from 'path'
import process from 'process'
import { createClient } from '@supabase/supabase-js'

const root = process.cwd()
const envPath = path.join(root, '.env.local')

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  const content = fs.readFileSync(filePath, 'utf8')
  const result = {}

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const eqIndex = line.indexOf('=')
    if (eqIndex === -1) continue

    const key = line.slice(0, eqIndex).trim()
    let value = line.slice(eqIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    result[key] = value
  }

  return result
}

function isPlaceholder(value) {
  if (!value) return true
  const normalized = value.trim().toLowerCase()
  return (
    normalized.includes('your_supabase') ||
    normalized.includes('placeholder') ||
    normalized === 'changeme' ||
    normalized === 'change-me'
  )
}

function print(label, value) {
  console.log(`${label}: ${value}`)
}

const env = {
  ...readEnvFile(envPath),
  ...process.env,
}

let failed = false

if (!fs.existsSync(envPath)) {
  print('env', '.env.local is missing')
  failed = true
}

const url = env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (isPlaceholder(url)) {
  print('env', 'NEXT_PUBLIC_SUPABASE_URL is missing or placeholder')
  failed = true
}

if (isPlaceholder(anonKey)) {
  print('env', 'NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or placeholder')
  failed = true
}

if (failed) {
  process.exitCode = 1
  process.exit()
}

const clientKey = !isPlaceholder(serviceKey) ? serviceKey : anonKey
const clientLabel = !isPlaceholder(serviceKey) ? 'service role' : 'anon'
const supabase = createClient(url, clientKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function getCount(table, query = '*', filters = []) {
  let request = supabase.from(table).select(query, { count: 'exact', head: true })

  for (const filter of filters) {
    const [method, ...args] = filter
    request = request[method](...args)
  }

  const { count, error } = await request

  if (error) {
    throw error
  }

  return count ?? 0
}

try {
  const categoriesCount = await getCount('categories')
  const productsCount = await getCount('products')
  const activeProductsCount = await getCount('products', 'id', [['eq', 'status', 'active']])
  const featuredProductsCount = await getCount('products', 'id', [['eq', 'is_featured', true]])

  print('client', clientLabel)
  print('categories', categoriesCount)
  print('products', productsCount)
  print('active_products', activeProductsCount)
  print('featured_products', featuredProductsCount)

  if (clientLabel === 'anon') {
    print('note', 'Add SUPABASE_SERVICE_ROLE_KEY to get unrestricted product counts under RLS.')
  }
} catch (error) {
  console.error('supabase verification failed')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
