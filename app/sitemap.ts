import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://presenceia.com'

  const staticPages = [
    { url: baseUrl,               lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 1.0 },
    { url: `${baseUrl}/blog`,     lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 0.8 },
    { url: `${baseUrl}/login`,    lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${baseUrl}/confidentialite`,  lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.2 },
  ]

  const blogPages = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...blogPages]
}
