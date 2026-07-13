import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import { normalizeProduct } from '@/lib/product'
import {
  getMockFeaturedProducts,
  getMockNewArrivals,
  getMockProductBySlug,
  getMockProductsByCategorySlug,
  mockProducts,
} from '@/lib/mock-data'
import { withStoreFallback } from '@/lib/db/runtime'
import { getCategoryBySlug } from '@/lib/db/categories'
import { debugServer, debugSupabaseResult } from '@/lib/debug'

function sortByDisplayOrder(products: Product[]) {
  return [...products].sort((a, b) => a.display_order - b.display_order)
}

function mockProductsByCategoryId(categoryId?: string) {
  if (!categoryId) {
    return sortByDisplayOrder(mockProducts.filter((product) => product.status === 'active'))
  }

  return sortByDisplayOrder(
    mockProducts.filter((product) => product.status === 'active' && product.category_id === categoryId),
  )
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  return withStoreFallback({
    scope: 'homepage.products',
    query: async () => {
      const supabase = await createClient()
      let query = supabase.from('products').select('*').eq('status', 'active')
      debugServer('homepage.products.filter', { status: 'active', category_id: categoryId ?? null })

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query.order('display_order', { ascending: true })
      debugSupabaseResult('homepage.products', { data, error })
      if (error) throw error
      debugServer('homepage.newArrivals.count', { count: data?.length ?? 0 })
      return (data || []).map((row) => normalizeProduct(row as Record<string, unknown>))
    },
    fallback: () => mockProductsByCategoryId(categoryId),
  })
}

export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  return withStoreFallback({
    scope: 'category.products',
    query: async () => {
      debugServer('category.products.filter', { category_slug: slug, status: 'active' })
      const category = await getCategoryBySlug(slug)
      if (!category) return []
      const products = await getProducts(category.id)
      debugServer('category.productsCount', { slug, count: products.length })
      return products
    },
    fallback: () => getMockProductsByCategorySlug(slug),
  })
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return withStoreFallback({
    scope: 'homepage.featuredProducts',
    query: async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(limit)

      debugSupabaseResult('homepage.featuredProducts', { data, error })
      if (error) throw error
      debugServer('homepage.featuredProducts.count', { count: data?.length ?? 0 })
      return (data || []).map((row) => normalizeProduct(row as Record<string, unknown>))
    },
    fallback: () => getMockFeaturedProducts(limit),
  })
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return withStoreFallback({
    scope: 'homepage.newArrivals',
    query: async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit)

      debugSupabaseResult('homepage.newArrivals', { data, error })
      if (error) throw error
      debugServer('homepage.newArrivals.count', { count: data?.length ?? 0 })
      return (data || []).map((row) => normalizeProduct(row as Record<string, unknown>))
    },
    fallback: () => getMockNewArrivals(limit),
  })
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return withStoreFallback({
    query: async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      return data ? normalizeProduct(data as Record<string, unknown>) : null
    },
    fallback: () => getMockProductBySlug(slug),
  })
}

export async function getProductById(id: string): Promise<Product | null> {
  return withStoreFallback({
    query: async () => {
      const supabase = await createClient()
      const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      return data ? normalizeProduct(data as Record<string, unknown>) : null
    },
    fallback: () => mockProducts.find((product) => product.id === id) ?? null,
  })
}

export async function createProduct(
  product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'views' | 'downloads'>,
): Promise<Product> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').insert([product]).select().single()

  if (error) throw error
  return normalizeProduct(data as Record<string, unknown>)
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()

  if (error) throw error
  return normalizeProduct(data as Record<string, unknown>)
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) throw error
}

export async function incrementProductViews(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('increment_product_views', { product_id: id })

  if (error && error.code !== 'PGRST204') throw error
}

export async function getAllProductsAdmin(filters?: { status?: string; search?: string }): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase.from('products').select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map((row) => normalizeProduct(row as Record<string, unknown>))
}
