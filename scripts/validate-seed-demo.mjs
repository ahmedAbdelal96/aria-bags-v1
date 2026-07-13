import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sqlPath = path.join(root, 'supabase', 'seed-demo-handbags.sql')
const imageDir = path.join(root, 'public', 'seed', 'handbags')

const expectedImages = [
  'aria-classic-tote.webp',
  'aria-soft-shoulder.webp',
  'aria-mini-crossbody.webp',
  'aria-evening-clutch.webp',
  'aria-everyday-hobo.webp',
  'aria-work-satchel.webp',
  'aria-quilted-chain.webp',
  'aria-bucket-bag.webp',
  'aria-top-handle.webp',
  'aria-weekend-shopper.webp',
  'aria-phone-bag.webp',
  'aria-nude-shoulder.webp',
]

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

assert(fs.existsSync(sqlPath), `Missing SQL seed file: ${sqlPath}`)
assert(fs.existsSync(imageDir), `Missing demo image directory: ${imageDir}`)

const sql = fs.readFileSync(sqlPath, 'utf8')
for (const fileName of expectedImages) {
  const fullPath = path.join(imageDir, fileName)
  assert(fs.existsSync(fullPath), `Missing demo image: ${fullPath}`)
  assert(sql.includes(fileName), `Seed SQL does not reference ${fileName}`)
}

const expectedCategories = [
  'new-arrivals',
  'everyday-bags',
  'work-bags',
  'evening-bags',
  'crossbody-bags',
  'tote-bags',
  'shoulder-bags',
]
for (const slug of expectedCategories) {
  assert(sql.includes(`'${slug}'`), `Expected category slug in seed SQL: ${slug}`)
}

const productMatches = new Set(sql.match(/aria-[a-z0-9-]+\.webp/g) ?? [])
assert(productMatches.size === 12, 'Expected exactly 12 product image references')

console.log('Seed demo package looks good.')
console.log(`Validated ${expectedImages.length} images and ${sqlPath}`)
