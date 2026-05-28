'use client'
import { useLang } from '@/components/LangProvider'
import Navbar from '@/components/Navbar'
import CheckerForm from '@/components/CheckerForm'
import { blogPosts } from '@/lib/blog-data'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, CheckCircle, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { fr, de, enUS } from 'date-fns/locale'

const dateLocales = { fr, de, en: enUS }

export default function Home() {
  const { t, lang } = useLang()

  return (
    <div className="relative min-h-screen bg-ink">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">

        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid bg-grid opacity-100 pointer-events-none" />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-brand/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24">

          {/* Badge */}
          <div className="flex items-center gap-3 mb-10">
            <div className="inline-flex items-center gap-2 border border-brand/30 bg-brand/8 text-brand text-xs font-mono font-medium px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 bg-brand rounded-full pulse-dot" />
              {t.hero.badge}
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-8 max-w-5xl">
            <span className="text-white/30 block">{t.hero.h1a}</span>
            <span className="text-white italic block">{t.hero.h1b}</span>
            <span className="text-brand block">{t.hero.h1c}</span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed font-light">
            {t.hero.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <a href="#checker" className="btn-primary inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-semibold">
              {t.hero.cta1}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#how" className="btn-ghost inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-medium">
              {t.hero.cta2}
            </a>
          </div>

          {/* Floating platform tags */}
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'ChatGPT', color: '#10A37F' },
              { name: 'Claude', color: '#CC785C' },
              { name: 'Perplexity', color: '#8B5CF6' },
              { name: 'Gemini', color: '#4285F4' },
              { name: 'Copilot', color: '#0078D4' },
            ].map(({ name, color }) => (
              <div key={name} className="flex items-center gap-2 glass-light px-4 py-2 rounded-full text-xs font-mono text-white/60">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="text-xs font-mono tracking-widest uppercase">{t.hero.scroll}</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ── TICKER ──────────────────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-ink-2 py-5 overflow-hidden">
        <div className="marquee-inner flex gap-12 whitespace-nowrap">
          {[...t.ticker, ...t.ticker].map((item, i) => (
            <div key={i} className="flex items-center gap-4 text-white/20 text-sm font-mono uppercase tracking-widest flex-shrink-0">
              <span className="w-1 h-1 bg-brand rounded-full" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-ink-2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-3xl overflow-hidden">
            {t.stats.map((stat, i) => (
              <div key={i} className="reveal bg-ink-2 p-8 md:p-12 group hover:bg-ink-3 transition-colors" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="font-display text-4xl md:text-5xl text-white mb-3 group-hover:text-brand transition-colors">{stat.value}</div>
                <div className="text-white/40 text-sm leading-relaxed">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how" className="py-32 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid opacity-50 pointer-events-none" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-20">
            <div className="reveal">
              <p className="font-mono text-xs text-brand tracking-[0.3em] uppercase mb-5">— Process</p>
              <h2 className="font-display text-4xl md:text-6xl text-white max-w-3xl leading-tight">{t.how.title}</h2>
            </div>
            <p className="reveal delay-2 text-white/40 text-lg mt-6 max-w-2xl">{t.how.sub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.how.steps.map((step, i) => (
              <div key={i} className={`reveal delay-${i + 1} glass-light rounded-3xl p-8 group hover:bg-white/6 transition-all duration-300 border border-white/5 hover:border-brand/20`}>
                <div className="flex items-start justify-between mb-6">
                  <span className="font-mono text-xs text-brand/60 tracking-widest">{step.n}</span>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand/30 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-brand transition-colors" />
                  </div>
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHECKER ─────────────────────────────────────────────────────── */}
      <section id="checker" className="py-32 bg-ink-2 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-brand/20" />

        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <p className="font-mono text-xs text-brand tracking-[0.3em] uppercase mb-5">— Free tool</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">AI Visibility Score™</h2>
            <p className="text-white/40 text-base">
              {lang === 'fr' ? 'Entrez vos informations. Résultat en 30 secondes.' :
               lang === 'de' ? 'Geben Sie Ihre Informationen ein. Ergebnis in 30 Sekunden.' :
               'Enter your details. Result in 30 seconds.'}
            </p>
          </div>

          <div className="reveal delay-2 glass-dark rounded-3xl p-8 md:p-10 border border-white/8">
            <CheckerForm />
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-32 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <p className="font-mono text-xs text-brand tracking-[0.3em] uppercase mb-5">— Pricing</p>
            <h2 className="font-display text-4xl md:text-6xl text-white mb-4">{t.pricing.title}</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">{t.pricing.sub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.pricing.plans.map((plan, i) => (
              <div key={i} className={`reveal delay-${i + 1} relative rounded-3xl p-8 border flex flex-col transition-all duration-300 ${
                (plan as any).popular
                  ? 'bg-brand border-brand/50 glow-red'
                  : 'glass-light border-white/8 hover:border-white/15'
              }`}>
                {(plan as any).popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-brand text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    ⭐ {lang === 'fr' ? 'Plus populaire' : lang === 'de' ? 'Am beliebtesten' : 'Most popular'}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-bold mb-1 ${(plan as any).popular ? 'text-white' : 'text-white'}`}>{plan.name}</h3>
                  <p className={`text-sm ${(plan as any).popular ? 'text-white/70' : 'text-white/40'}`}>{plan.desc}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`font-display text-5xl ${(plan as any).popular ? 'text-white' : 'text-white'}`}>CHF {plan.price}</span>
                  <span className={`text-sm ${(plan as any).popular ? 'text-white/60' : 'text-white/30'}`}>{t.pricing.mo}</span>
                </div>
                <p className={`text-xs font-mono mb-8 ${(plan as any).popular ? 'text-white/50' : 'text-white/25'}`}>
                  + CHF {plan.setup} {t.pricing.setup}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${(plan as any).popular ? 'text-white/70' : 'text-brand/60'}`} />
                      <span className={`leading-relaxed ${(plan as any).popular ? 'text-white/80' : 'text-white/50'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={`mailto:hello@presenceia.com?subject=${plan.name}`}
                  className={`block text-center py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    (plan as any).popular
                      ? 'bg-white text-brand hover:bg-white/90'
                      : 'btn-primary'
                  }`}>
                  {plan.cta} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ────────────────────────────────────────────────────────── */}
      <section id="blog" className="py-32 bg-ink-2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16">
            <div className="reveal">
              <p className="font-mono text-xs text-brand tracking-[0.3em] uppercase mb-5">— Insights</p>
              <h2 className="font-display text-4xl md:text-5xl text-white">{t.blog.title}</h2>
              <p className="text-white/40 text-lg mt-3 max-w-xl">{t.blog.sub}</p>
            </div>
            <Link href="/blog" className="hidden md:flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors reveal">
              {lang === 'fr' ? 'Tous les articles' : lang === 'de' ? 'Alle Artikel' : 'All articles'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className={`reveal delay-${i+1} group glass-light rounded-3xl p-7 border border-white/5 hover:border-white/12 transition-all duration-300 hover:-translate-y-1 flex flex-col`}>
                <div className="flex items-center gap-3 mb-5">
                  {post.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="font-mono text-xs text-brand/60 bg-brand/8 px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <h3 className="text-white font-semibold text-base leading-snug mb-3 group-hover:text-white/90 flex-1">
                  {post.title[lang as 'fr'|'de'|'en']}
                </h3>
                <p className="text-white/35 text-sm leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt[lang as 'fr'|'de'|'en']}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-white/25 font-mono">
                    <span>{format(new Date(post.date), 'dd MMM yyyy', { locale: dateLocales[lang as 'fr'|'de'|'en'] ?? enUS })}</span>
                    <span>·</span>
                    <span>{post.readingTime} min</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-brand transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-40 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/3 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="reveal">
            <p className="font-mono text-xs text-brand tracking-[0.3em] uppercase mb-8">— Act now</p>
            <h2 className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight">
              {t.cta_section.title}
            </h2>
            <p className="text-white/40 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              {t.cta_section.sub}
            </p>
            <a href="#checker"
              className="btn-primary inline-flex items-center gap-3 px-8 py-5 rounded-2xl text-base font-semibold">
              <Zap className="w-5 h-5" />
              {t.cta_section.btn}
            </a>
            <p className="text-white/20 text-xs font-mono mt-6 tracking-wider">
              {lang === 'fr' ? 'GRATUIT · SANS ENGAGEMENT · 60 SECONDES' :
               lang === 'de' ? 'KOSTENLOS · UNVERBINDLICH · 60 SEKUNDEN' :
               'FREE · NO COMMITMENT · 60 SECONDS'}
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-ink-2 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-brand rounded-sm flex items-center justify-center">
                <span className="text-white font-black text-xs">+</span>
              </div>
              <span className="font-sans font-bold text-white/80">présence<span className="text-brand">ia</span></span>
              <span className="text-white/20 text-sm">— Zug</span>
            </div>
            <p className="font-mono text-xs text-white/20 tracking-wider">{t.footer.tagline}</p>
            <p className="text-white/20 text-xs">{t.footer.rights}</p>
          </div>
        </div>
      </footer>

      {/* Homepage structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Organization', '@id': 'https://presenceia.com/#organization', name: 'Présence IA', url: 'https://presenceia.com', description: 'GEO — Generative Engine Optimization pour les PME suisses.', address: { '@type': 'PostalAddress', addressLocality: 'Zug', addressCountry: 'CH' }, areaServed: 'CH', knowsLanguage: ['fr', 'de', 'en', 'it'] },
          { '@type': 'WebSite', '@id': 'https://presenceia.com/#website', url: 'https://presenceia.com', name: 'Présence IA', publisher: { '@id': 'https://presenceia.com/#organization' } },
          { '@type': 'SoftwareApplication', name: 'AI Visibility Checker', applicationCategory: 'BusinessApplication', offers: { '@type': 'Offer', price: '0', priceCurrency: 'CHF' } }
        ]
      })}} />
    </div>
  )
}
