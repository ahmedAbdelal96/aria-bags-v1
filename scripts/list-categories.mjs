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

async function main() {
  const envPath = path.join(process.cwd(), '.env.local')
  const env = { ...parseEnvFile(envPath), ...process.env }
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const client = createClient(url, anonKey)
  const { data: categories, error } = await client.from('categories').select('name, slug')
  if (error) {
    console.error('Error fetching categories:', error)
    return
  }
  console.log('Categories seeded in Supabase:')
  console.log(JSON.stringify(categories, null, 2))
}

main().catch(console.error)
