import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'
import { getMockCategoryBySlug, mockCategories } from '@/lib/mock-data'
import { withStoreFallback } from '@/lib/db/runtime'
import { debugServer, debugSupabaseResult } from '@/lib/debug'

function sortCategories(categories: Category[]) {
  return [...categories].sort((a, b) => a.display_order - b.display_order)
}

export async function getCategories(): Promise<Category[]> {
  return withStoreFallback({
    scope: 'homepage.categories',
    query: async () => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })

      debugSupabaseResult('homepage.categories', { data, error })
      if (error) throw error
      debugServer('homepage.categories.count', { count: data?.length ?? 0 })
      return data || []
    },
    fallback: () => sortCategories(mockCategories),
  })
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return withStoreFallback({
    scope: 'category.categoryResult',
    query: async () => {
      debugServer('category.requestedSlug', { slug })
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      debugSupabaseResult('category.categoryResult', { data, error })
      if (error && error.code !== 'PGRST116') throw error
      return data || null
    },
    fallback: () => getMockCategoryBySlug(slug),
  })
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').insert([category]).select().single()

  if (error) throw error
  return data
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single()

  if (error) throw error
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) throw error
}
