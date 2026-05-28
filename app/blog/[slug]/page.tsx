'use client'
import { useLang } from '@/components/LangProvider'
import Navbar from '@/components/Navbar'
import { blogPosts } from '@/lib/blog-data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { fr, de, enUS } from 'date-fns/locale'
import { use } from 'react'

const dateLocales = { fr, de, en: enUS }

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { lang } = useLang()
  const post = blogPosts.find(p => p.slug === slug)
  if (!post) notFound()

  const content = post.content[lang as 'fr'|'de'|'en']
  const lines = content.split('\n')

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="font-display text-2xl md:text-3xl text-white mt-10 mb-4">{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={i} className="text-white font-semibold text-lg mt-8 mb-3">{line.slice(4)}</h3>
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-white font-semibold mb-3">{line.slice(2,-2)}</p>
      if (line.startsWith('- ')) return <li key={i} className="text-white/60 text-base leading-relaxed mb-2 ml-4 list-disc">{line.slice(2)}</li>
      if (line.startsWith('```')) return <div key={i} />
      if (line.trim() === '') return <div key={i} className="mb-4" />
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return <p key={i} className="text-white/60 text-base leading-relaxed mb-4">{parts.map((p, j) => j%2===1 ? <strong key={j} className="text-white font-semibold">{p}</strong> : p)}</p>
      }
      return <p key={i} className="text-white/60 text-base leading-relaxed mb-4">{line}</p>
    })
  }

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <article className="pt-32 pb-24 max-w-3xl mx-auto px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-sm font-mono mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {lang === 'fr' ? 'Retour au blog' : lang === 'de' ? 'Zurück zum Blog' : 'Back to blog'}
        </Link>

        <div className="mb-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map(tag => (
              <span key={tag} className="font-mono text-xs text-brand/60 bg-brand/8 px-3 py-1 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" />{tag}
              </span>
            ))}
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white leading-tight mb-6">
            {post.title[lang as 'fr'|'de'|'en']}
          </h1>
          <p className="text-white/50 text-lg leading-relaxed mb-6">{post.excerpt[lang as 'fr'|'de'|'en']}</p>
          <div className="flex items-center gap-6 text-xs font-mono text-white/25 border-t border-b border-white/5 py-4">
            <span>{"Équipe Présence IA"}</span>
            <span>{format(new Date(post.date), 'dd MMMM yyyy', { locale: dateLocales[lang as 'fr'|'de'|'en'] ?? enUS })}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime} min</span>
          </div>
        </div>

        <div className="prose-custom">{renderContent(content)}</div>

        <div className="mt-16 glass-light rounded-3xl p-8 border border-white/5 text-center">
          <p className="font-mono text-xs text-brand tracking-widest mb-4">— PRÉSENCE IA</p>
          <h3 className="font-display text-2xl text-white mb-3">
            {lang === 'fr' ? 'Testez votre visibilité IA gratuitement' : lang === 'de' ? 'Testen Sie Ihre KI-Sichtbarkeit kostenlos' : 'Test your AI visibility for free'}
          </h3>
          <Link href="/#checker" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold mt-4">
            {lang === 'fr' ? 'Analyser maintenant' : lang === 'de' ? 'Jetzt analysieren' : 'Analyse now'}
          </Link>
        </div>
      </article>
    </div>
  )
}
