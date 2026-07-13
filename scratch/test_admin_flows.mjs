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

console.log('Logging in as admin@aria.com...')
const loginRes = await supabase.auth.signInWithPassword({
  email: 'admin@aria.com',
  password: '123456'
})

if (loginRes.error) {
  console.error('Login failed', loginRes.error)
  process.exit(1)
}

console.log('Login success!')

let testCategoryId = null
let testProductId = null
let uploadedFileName = null

try {
  // ============================================
  // TEST 1: CATEGORIES CRUD (RLS Policies check)
  // ============================================
  console.log('\n--- Testing Categories CRUD ---')
  
  const categorySlug = 'test-boutique-collection-' + Date.now()
  console.log('Inserting collection...')
  const insertCatRes = await supabase
    .from('categories')
    .insert([{
      name: 'Test Boutique Collection',
      slug: categorySlug,
      description: 'Feminine boutique test collection description.'
    }])
    .select()

  if (insertCatRes.error) {
    console.error('Category insert FAILED! (RLS Blocker present)', insertCatRes.error)
  } else {
    testCategoryId = insertCatRes.data[0].id
    console.log('Category insert SUCCESS! ID:', testCategoryId)
    
    console.log('Updating collection...')
    const updateCatRes = await supabase
      .from('categories')
      .update({ name: 'Updated Boutique Collection' })
      .eq('id', testCategoryId)
      .select()
      
    if (updateCatRes.error) {
      console.error('Category update FAILED!', updateCatRes.error)
    } else {
      console.log('Category update SUCCESS! New Name:', updateCatRes.data[0].name)
    }
  }

  // ============================================
  // TEST 2: STORAGE IMAGE UPLOAD & PUBLIC URL
  // ============================================
  console.log('\n--- Testing Storage Image Upload ---')
  uploadedFileName = `test-clutch-upload-${Date.now()}.jpg`
  const dummyFileData = Buffer.from('fake jpg data for testing storage upload')

  console.log(`Uploading test file "${uploadedFileName}" to "product-images" bucket...`)
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('product-images')
    .upload(uploadedFileName, dummyFileData, {
      contentType: 'image/jpeg',
      upsert: true
    })

  let publicUrl = ''
  if (uploadErr) {
    console.error('Storage upload FAILED! (Policy blocker present)', uploadErr)
  } else {
    console.log('Storage upload SUCCESS! Path:', uploadData.path)

    const urlResult = supabase.storage
      .from('product-images')
      .getPublicUrl(uploadedFileName)
    
    publicUrl = urlResult.data.publicUrl
    console.log('Generated Public URL:', publicUrl)
  }

  // ============================================
  // TEST 3: PRODUCTS CRUD (only if category and storage succeeded)
  // ============================================
  if (testCategoryId && publicUrl) {
    console.log('\n--- Testing Products CRUD ---')
    
    const productSlug = 'luna-test-clutch-' + Date.now()
    const productPayload = {
      category_id: testCategoryId,
      name: 'Luna Test Clutch',
      slug: productSlug,
      short_description: 'An elegant test leather clutch.',
      description: 'Handcrafted luxury test bag details.',
      price: 250.00,
      sale_price: 199.99,
      image_url: publicUrl,
      images: [publicUrl],
      colors: [
        { name: 'Ivory Cream', hex: '#FDFBF7', stock: 15 },
        { name: 'Onyx Black', hex: '#1A1B15', stock: 8 }
      ],
      material: 'Saffiano leather',
      dimensions: '22 x 15 x 6 cm',
      care_instructions: 'Keep dry, avoid heat.',
      status: 'active',
      is_featured: true
    }

    console.log('Inserting product with storage image...')
    const insertProdRes = await supabase
      .from('products')
      .insert([productPayload])
      .select()

    if (insertProdRes.error) {
      console.error('Product insert FAILED!', insertProdRes.error)
    } else {
      testProductId = insertProdRes.data[0].id
      console.log('Product insert SUCCESS! ID:', testProductId)
      
      console.log('Updating product (changing colors and stock)...')
      const updatedColors = [
        { name: 'Ivory Cream', hex: '#FDFBF7', stock: 20 }, // stock increased
        { name: 'Onyx Black', hex: '#1A1B15', stock: 5 }   // stock decreased
      ]
      
      const updateProdRes = await supabase
        .from('products')
        .update({ colors: updatedColors, price: 245.00 })
        .eq('id', testProductId)
        .select()

      if (updateProdRes.error) {
        console.error('Product update FAILED!', updateProdRes.error)
      } else {
        console.log('Product update SUCCESS!')
        console.log('Persisted Colors:', JSON.stringify(updateProdRes.data[0].colors))
        console.log('Persisted Price:', updateProdRes.data[0].price)
      }
    }
  }

} catch (e) {
  console.error('Exception during flow execution:', e)
} finally {
  // CLEANUP
  console.log('\n--- Cleaning Up Test Records ---')
  if (testProductId) {
    console.log('Deleting test product...')
    const { error: delProdErr } = await supabase.from('products').delete().eq('id', testProductId)
    if (delProdErr) console.error('Product delete FAILED:', delProdErr)
    else console.log('Product delete SUCCESS!')
  }

  if (uploadedFileName) {
    console.log('Deleting test uploaded storage file...')
    const { error: delStorageErr } = await supabase.storage
      .from('product-images')
      .remove([uploadedFileName])
    if (delStorageErr) console.error('Storage file remove FAILED:', delStorageErr)
    else console.log('Storage file remove SUCCESS!')
  }
  
  if (testCategoryId) {
    console.log('Deleting test category...')
    const { error: delCatErr } = await supabase.from('categories').delete().eq('id', testCategoryId)
    if (delCatErr) console.error('Category delete FAILED:', delCatErr)
    else console.log('Category delete SUCCESS!')
  }

  await supabase.auth.signOut()
  console.log('Signed out. Test run finished.')
}
