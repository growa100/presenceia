import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/onboarding', '/api/'],
      },
    ],
    sitemap: 'https://presenceia.com/sitemap.xml',
    host: 'https://presenceia.com',
  }
}
