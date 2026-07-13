import type { Category, Product } from '@/lib/types'

const now = '2026-07-01T12:00:00.000Z'

const heroLifestyle = '/seed/handbags/aria-classic-tote.webp'
const editorialOne = '/seed/handbags/aria-classic-tote.webp'
const editorialTwo = '/seed/handbags/aria-soft-shoulder.webp'
const editorialThree = '/seed/handbags/aria-mini-crossbody.webp'
const editorialFour = '/seed/handbags/aria-evening-clutch.webp'

export const mockMedia = {
  heroLifestyle,
  editorialOne,
  editorialTwo,
  editorialThree,
  editorialFour,
}

export const mockCategories: Category[] = [
  {
    id: 'cat-totes',
    name: 'Tote Bags',
    slug: 'tote-bags',
    description: 'Elegant everyday carries with enough structure for work, travel, and city days.',
    display_order: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'cat-shoulder',
    name: 'Shoulder Bags',
    slug: 'shoulder-bags',
    description: 'Soft silhouettes that sit effortlessly against evening tailoring and polished denim.',
    display_order: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'cat-crossbody',
    name: 'Crossbody',
    slug: 'crossbody-bags',
    description: 'Hands-free pieces for refined everyday movement and travel-light styling.',
    display_order: 3,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'cat-top-handle',
    name: 'Top Handle',
    slug: 'top-handle-bags',
    description: 'Architectural icons with a polished handle for a modern, feminine finish.',
    display_order: 4,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'cat-evening',
    name: 'Evening Bags',
    slug: 'evening-bags',
    description: 'Small statement pieces for dinners, events, and the most elegant invitations.',
    display_order: 5,
    created_at: now,
    updated_at: now,
  },
]

export const mockProducts: Product[] = [
  {
    id: 'bag-aria-01',
    category_id: 'cat-totes',
    name: 'The Sienna Tote',
    slug: 'sienna-tote',
    short_description: 'A sculpted tote in smooth leather with a structured silhouette and generous interior.',
    description:
      'Designed for women who like their essentials organized without sacrificing elegance. The Sienna Tote balances a clean architectural line with soft leather and a polished metallic clasp.',
    price: 320,
    sale_price: 285,
    image_url: editorialOne,
    images: [
      editorialOne,
      editorialTwo,
      editorialFour,
    ],
    colors: [
      { name: 'Onyx Black', hex: '#111111', stock: 6 },
      { name: 'Champagne', hex: '#d9c7a1', stock: 4 },
      { name: 'Ivory Mist', hex: '#f3ead7', stock: 2 },
    ],
    material: 'Full-grain leather',
    dimensions: '38 x 28 x 14 cm',
    care_instructions: 'Store in the dust bag and avoid prolonged direct sunlight.',
    status: 'active',
    is_featured: true,
    file_url: null,
    file_size: null,
    file_type: null,
    is_instant_download: false,
    is_paid_product: false,
    download_file_path: null,
    file_size_bytes: null,
    views: 124,
    downloads: 0,
    display_order: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'bag-aria-02',
    category_id: 'cat-shoulder',
    name: 'Maison Shoulder',
    slug: 'maison-shoulder',
    short_description: 'A softly curved shoulder bag with an effortless evening-ready drape.',
    description:
      'Maison Shoulder brings a relaxed silhouette into the luxury space through a polished strap, minimal hardware, and a supple body that works from brunch to black-tie dinners.',
    price: 265,
    sale_price: null,
    image_url: editorialTwo,
    images: [editorialTwo, editorialThree],
    colors: [
      { name: 'Midnight', hex: '#101316', stock: 7 },
      { name: 'Mocha', hex: '#7b5e47', stock: 3 },
    ],
    material: 'Pebbled leather',
    dimensions: '30 x 20 x 9 cm',
    care_instructions: 'Wipe gently with a soft dry cloth after use.',
    status: 'active',
    is_featured: true,
    file_url: null,
    file_size: null,
    file_type: null,
    is_instant_download: false,
    is_paid_product: false,
    download_file_path: null,
    file_size_bytes: null,
    views: 98,
    downloads: 0,
    display_order: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'bag-aria-03',
    category_id: 'cat-crossbody',
    name: 'Noir Crossbody',
    slug: 'noir-crossbody',
    short_description: 'A compact crossbody with an elevated chain detail and refined closure.',
    description:
      'The Noir Crossbody is the polished everyday piece that moves from errands to dinner without looking casual. Lightweight proportions and a considered strap keep it sleek on the body.',
    price: 210,
    sale_price: 180,
    image_url: editorialThree,
    images: [editorialThree, editorialFour],
    colors: [
      { name: 'Black Pearl', hex: '#1b1b1d', stock: 8 },
      { name: 'Rose Dust', hex: '#d8b7b2', stock: 5 },
      { name: 'Warm Taupe', hex: '#b79a80', stock: 4 },
    ],
    material: 'Smooth calf leather',
    dimensions: '24 x 16 x 7 cm',
    care_instructions: 'Keep away from oils and perfume; store flat when not in use.',
    status: 'active',
    is_featured: false,
    file_url: null,
    file_size: null,
    file_type: null,
    is_instant_download: false,
    is_paid_product: false,
    download_file_path: null,
    file_size_bytes: null,
    views: 82,
    downloads: 0,
    display_order: 3,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'bag-aria-04',
    category_id: 'cat-top-handle',
    name: 'Aurora Top Handle',
    slug: 'aurora-top-handle',
    short_description: 'A compact top-handle bag with a sculptural shape and statement clasp.',
    description:
      'Aurora Top Handle is tailored for occasions when the bag should feel like jewelry. Its compact body, ornate lock, and rigid handle create a poised editorial profile.',
    price: 295,
    sale_price: null,
    image_url: editorialFour,
    images: [editorialFour, editorialOne],
    colors: [
      { name: 'Burgundy', hex: '#5d2031', stock: 2 },
      { name: 'Café', hex: '#7d5c45', stock: 4 },
    ],
    material: 'Italian leather',
    dimensions: '26 x 18 x 10 cm',
    care_instructions: 'Avoid heavy moisture and let the bag rest in its dust bag.',
    status: 'active',
    is_featured: true,
    file_url: null,
    file_size: null,
    file_type: null,
    is_instant_download: false,
    is_paid_product: false,
    download_file_path: null,
    file_size_bytes: null,
    views: 76,
    downloads: 0,
    display_order: 4,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'bag-aria-05',
    category_id: 'cat-evening',
    name: 'Luna Evening Clutch',
    slug: 'luna-evening-clutch',
    short_description: 'A small clutch with a satin-like sheen and elegant wristlet chain.',
    description:
      'Luna Evening Clutch is designed for dinners and formal events where softness and shine matter. It carries just the essentials while adding a quiet metallic finish to the look.',
    price: 185,
    sale_price: 160,
    image_url: editorialTwo,
    images: [editorialTwo, editorialThree],
    colors: [
      { name: 'Pearl', hex: '#f0e7d8', stock: 5 },
      { name: 'Gold Dust', hex: '#c7b06b', stock: 3 },
    ],
    material: 'Satin finish leather',
    dimensions: '22 x 13 x 5 cm',
    care_instructions: 'Handle gently and avoid sharp objects or abrasives.',
    status: 'active',
    is_featured: false,
    file_url: null,
    file_size: null,
    file_type: null,
    is_instant_download: false,
    is_paid_product: false,
    download_file_path: null,
    file_size_bytes: null,
    views: 60,
    downloads: 0,
    display_order: 5,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'bag-aria-06',
    category_id: 'cat-totes',
    name: 'Muse Work Tote',
    slug: 'muse-work-tote',
    short_description: 'A refined work tote with a wide opening and subtle hardware details.',
    description:
      'Muse Work Tote is the daily bag that still feels couture-adjacent. With room for a laptop, notebook, and beauty pouch, it stays structured while moving through a busy week.',
    price: 340,
    sale_price: null,
    image_url: editorialOne,
    images: [editorialOne, editorialFour],
    colors: [
      { name: 'Espresso', hex: '#4a3528', stock: 6 },
      { name: 'Stone', hex: '#c5b8a8', stock: 4 },
    ],
    material: 'Supple leather',
    dimensions: '40 x 29 x 15 cm',
    care_instructions: 'Condition occasionally and keep away from direct heat.',
    status: 'active',
    is_featured: false,
    file_url: null,
    file_size: null,
    file_type: null,
    is_instant_download: false,
    is_paid_product: false,
    download_file_path: null,
    file_size_bytes: null,
    views: 91,
    downloads: 0,
    display_order: 6,
    created_at: now,
    updated_at: now,
  },
]

export function getMockCategoryBySlug(slug: string) {
  return mockCategories.find((category) => category.slug === slug) ?? null
}

export function getMockProductBySlug(slug: string) {
  return mockProducts.find((product) => product.slug === slug) ?? null
}

export function getMockProductsByCategoryId(categoryId: string) {
  return mockProducts
    .filter((product) => product.category_id === categoryId)
    .sort((a, b) => a.display_order - b.display_order)
}

export function getMockProductsByCategorySlug(slug: string) {
  const category = getMockCategoryBySlug(slug)
  if (!category) return []
  return getMockProductsByCategoryId(category.id)
}

export function getMockFeaturedProducts(limit = 8) {
  return mockProducts
    .filter((product) => product.is_featured && product.status === 'active')
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, limit)
}

export function getMockNewArrivals(limit = 8) {
  return [...mockProducts]
    .filter((product) => product.status === 'active')
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || a.display_order - b.display_order)
    .slice(0, limit)
}
