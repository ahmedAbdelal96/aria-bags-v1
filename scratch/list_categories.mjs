import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

let supabaseUrl = ''
let supabaseKey = ''

try {
  const envText = fs.readFileSync('.env.local', 'utf8')
  envText.split('\n').forEach(line => {
    const parts = line.split('=')
    if (parts[0] === 'NEXT_PUBLIC_SUPABASE_URL') {
      supabaseUrl = parts[1].trim().replace(/['"]/g, '')
    }
    if (parts[0] === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
      supabaseKey = parts[1].trim().replace(/['"]/g, '')
    }
  })
} catch (e) {
  console.error('Could not read .env.local', e)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const [categoriesRes, productsRes] = await Promise.all([
  supabase.from('categories').select('*'),
  supabase.from('products').select('id, name, category_id')
])

if (categoriesRes.error || productsRes.error) {
  console.error(categoriesRes.error || productsRes.error)
} else {
  const cats = categoriesRes.data
  const prods = productsRes.data

  console.log('Category Product Count:')
  cats.forEach(c => {
    const count = prods.filter(p => p.category_id === c.id).length
    const linkedProds = prods.filter(p => p.category_id === c.id).map(p => p.name).join(', ')
    console.log(`- "${c.name}" (Slug: "${c.slug}", ID: "${c.id}"): ${count} products [${linkedProds}]`)
  })
}
