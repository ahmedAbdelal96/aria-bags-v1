import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

const routes = ['/', '/collections', '/new-arrivals', '/about']

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: new Date(), changeFrequency: route === '/' ? 'daily' : 'weekly', priority: route === '/' ? 1 : 0.8 }))
}
