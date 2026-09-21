import { Metadata } from 'next'
import { blogPosts } from '@/lib/blog-data'
import BlogPostClient from './BlogPostClient'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find(p => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title.fr,
    description: post.excerpt.fr,
    keywords: post.tags,
    openGraph: {
      title: post.title.fr,
      description: post.excerpt.fr,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author ?? 'Équipe Présence IA'],
      images: post.image ? [{ url: post.image, width: 1200, height: 820 }] : undefined,
      tags: post.tags,
    },
    alternates: { canonical: `https://presenceia.com/blog/${slug}` },
  }
}

export async function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = blogPosts.find(p => p.slug === slug)
  if (!post) notFound()
  return <BlogPostClient post={post} />
}
