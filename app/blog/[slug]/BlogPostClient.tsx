'use client'
import { useLang } from '@/components/LangProvider'
import Navbar from '@/components/Navbar'
import { BlogPost } from '@/lib/blog-data'
import Link from 'next/link'
import { ArrowLeft, Clock, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { fr, de, enUS } from 'date-fns/locale'

const dateLocales = { fr, de, en: enUS }

export default function BlogPostClient({ post }: { post: BlogPost }) {
  const { lang } = useLang()
  const content = post.content[lang as 'fr'|'de'|'en']

  const renderContent = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let inCodeBlock = false

    lines.forEach((line, i) => {
      if (line.startsWith('```')) { inCodeBlock = !inCodeBlock; return }
      if (inCodeBlock) {
        elements.push(<code key={i} className="block font-mono text-xs text-ink/80 bg-paper-2 px-4 py-1">{line}</code>)
        return
      }
      const img = line.match(/^!\[(.*?)\]\((.*?)\)$/)
      if (img) {
        elements.push(
          <figure key={i} className="my-10 -mx-2 md:-mx-10">
            <img src={img[2]} alt={img[1]} className="w-full h-auto rounded-3xl" loading="lazy" />
            {img[1] && <figcaption className="mt-3 text-center text-xs font-mono text-ink/45">{img[1]}</figcaption>}
          </figure>
        )
        return
      }
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="my-8 border-l-2 border-brand pl-6 font-display text-2xl md:text-3xl text-ink leading-snug">
            {line.slice(2)}
          </blockquote>
        )
        return
      }
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        elements.push(<p key={i} className="text-ink/45 text-sm italic leading-relaxed mt-8">{line.slice(1, -1)}</p>)
        return
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="font-display text-2xl md:text-3xl text-ink mt-12 mb-5">{line.slice(3)}</h2>)
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-ink font-semibold text-lg mt-8 mb-3">{line.slice(4)}</h3>)
      } else if (line.startsWith('- ')) {
        const parts = line.slice(2).split(/\*\*(.*?)\*\*/g)
        elements.push(
          <li key={i} className="text-ink/75 text-lg leading-relaxed mb-2 ml-4 list-disc">
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-ink font-semibold">{p}</strong> : p)}
          </li>
        )
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="mb-3" />)
      } else if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        elements.push(
          <p key={i} className="text-ink/75 text-lg leading-relaxed mb-5">
            {parts.map((p, j) => j % 2 === 1
              ? <strong key={j} className="text-ink font-semibold">{p}</strong>
              : p)}
          </p>
        )
      } else {
        elements.push(<p key={i} className="text-ink/75 text-lg leading-relaxed mb-5">{line}</p>)
      }
    })
    return elements
  }

  return (
    <div className="page-light min-h-screen">
      <Navbar variant="light" />
      <article className="pt-32 pb-24 max-w-3xl mx-auto px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-ink/50 hover:text-ink text-sm font-mono mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {lang === 'fr' ? 'Retour au blog' : lang === 'de' ? 'Zurück zum Blog' : 'Back to blog'}
        </Link>

        <div className="mb-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map(tag => (
              <span key={tag} className="font-mono text-xs text-brand bg-brand/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Tag className="w-3 h-3" />{tag}
              </span>
            ))}
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-ink leading-tight mb-6">
            {post.title[lang as 'fr'|'de'|'en']}
          </h1>
          <p className="text-ink/65 text-xl leading-relaxed mb-6">
            {post.excerpt[lang as 'fr'|'de'|'en']}
          </p>
          <div className="flex items-center gap-6 text-xs font-mono text-ink/50 border-t border-b border-line py-4">
            <span>{post.author ?? 'Équipe Présence IA'}</span>
            <span>{format(new Date(post.date), 'dd MMMM yyyy', { locale: dateLocales[lang as 'fr'|'de'|'en'] ?? enUS })}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{post.readingTime} min</span>
          </div>
        </div>

        <div className="space-y-0">{renderContent(content)}</div>

        {/* Article structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title[lang as 'fr'|'de'|'en'],
          description: post.excerpt[lang as 'fr'|'de'|'en'],
          datePublished: post.date,
          author: post.author ? { '@type': 'Person', name: post.author, url: 'https://presenceia.com' } : { '@type': 'Organization', name: 'Présence IA', url: 'https://presenceia.com' },
          publisher: { '@type': 'Organization', name: 'Présence IA', url: 'https://presenceia.com' },
          keywords: post.tags.join(', '),
        })}} />

        <div className="mt-16 card p-8 text-center">
          <p className="font-mono text-xs text-brand tracking-widest mb-4">— PRÉSENCE IA</p>
          <h3 className="font-display text-2xl text-ink mb-3">
            {lang === 'fr' ? 'Testez votre visibilité IA gratuitement' : lang === 'de' ? 'Testen Sie Ihre KI-Sichtbarkeit kostenlos' : 'Test your AI visibility for free'}
          </h3>
          <Link href="/#checker" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold mt-4">
            {lang === 'fr' ? 'Analyser maintenant →' : lang === 'de' ? 'Jetzt analysieren →' : 'Analyse now →'}
          </Link>
        </div>
      </article>
    </div>
  )
}
