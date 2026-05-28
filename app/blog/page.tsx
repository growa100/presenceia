'use client'
import { useLang } from '@/components/LangProvider'
import Navbar from '@/components/Navbar'
import { blogPosts } from '@/lib/blog-data'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr, de, enUS } from 'date-fns/locale'

const dateLocales = { fr, de, en: enUS }

export default function BlogPage() {
  const { lang, t } = useLang()
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 reveal">
          <p className="font-mono text-xs text-brand tracking-[0.3em] uppercase mb-5">— Blog</p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-4">{t.blog.title}</h1>
          <p className="text-white/40 text-lg max-w-xl">{t.blog.sub}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className={`reveal delay-${i+1} group glass-light rounded-3xl p-7 border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 flex flex-col`}>
              <div className="flex flex-wrap gap-2 mb-5">
                {post.tags.slice(0,2).map(tag => (
                  <span key={tag} className="font-mono text-xs text-brand/60 bg-brand/8 px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <h2 className="text-white font-semibold text-base leading-snug mb-3 flex-1">{post.title[lang as 'fr'|'de'|'en']}</h2>
              <p className="text-white/35 text-sm leading-relaxed mb-6 line-clamp-3">{post.excerpt[lang as 'fr'|'de'|'en']}</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-white/25">
                  {format(new Date(post.date), 'dd MMM yyyy', { locale: dateLocales[lang as 'fr'|'de'|'en'] ?? enUS })} · {post.readingTime} min
                </span>
                <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-brand transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
