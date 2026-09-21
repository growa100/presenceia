'use client'
import { useLang } from '@/components/LangProvider'
import Navbar from '@/components/Navbar'
import { blogPosts } from '@/lib/blog-data'
import { siteCopy } from '@/lib/site-copy'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr, de, enUS } from 'date-fns/locale'

const dateLocales = { fr, de, en: enUS }
const COPY = {
  fr: { title: 'Cas réels, méthodes, coulisses.', sub: 'Ce que nous apprenons en construisant des sites que les IA recommandent.' },
  de: { title: 'Fälle, Methoden, Einblicke.', sub: 'Was wir lernen, während wir Websites bauen, die KIs empfehlen.' },
  en: { title: 'Real cases, methods, behind the scenes.', sub: 'What we learn building websites that AIs recommend.' },
}

export default function BlogPage() {
  const { lang } = useLang()
  const L = lang as 'fr' | 'de' | 'en'
  const c = COPY[L]
  return (
    <div className="page-light min-h-screen">
      <Navbar variant="light" />
      <div className="pt-32 pb-24 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="mb-14">
          <p className="font-mono text-xs text-brand tracking-[0.25em] uppercase mb-4">{siteCopy[L].nav.blog}</p>
          <h1 className="font-display text-5xl md:text-6xl text-ink mb-4">{c.title}</h1>
          <p className="text-ink/60 text-lg max-w-xl">{c.sub}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="card group overflow-hidden flex flex-col hover:-translate-y-1 hover:border-brand/40 transition-all duration-300">
              {post.image && (
                <div className="aspect-[3/2] bg-paper-2 overflow-hidden">
                  <img src={post.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="p-7 flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="font-mono text-xs text-brand bg-brand/10 px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <h2 className="text-ink font-semibold text-lg leading-snug mb-3 flex-1">{post.title[L]}</h2>
                <p className="text-ink/60 text-sm leading-relaxed mb-6 line-clamp-3">{post.excerpt[L]}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink/45">
                    {format(new Date(post.date), 'dd MMM yyyy', { locale: dateLocales[L] ?? enUS })} · {post.readingTime} min
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-ink/30 group-hover:text-brand transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
