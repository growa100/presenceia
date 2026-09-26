'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BarChart3, Check, ChevronDown, FileSearch, Globe2, Mail, MapPin, MessageSquareQuote, Phone, ShieldCheck, Sparkles, Star, CalendarCheck, Radar } from 'lucide-react'
import { useLang } from '@/components/LangProvider'
import Navbar from '@/components/Navbar'
import AnalysisDialog from '@/components/AnalysisDialog'
import AiAnswerMock from '@/components/AiAnswerMock'
import AuditRequest from '@/components/AuditRequest'
import CheckoutButton from '@/components/CheckoutButton'
import { PLAN_KEYS } from '@/lib/plans'
import { agencyCopy } from '@/lib/agency-copy'
import { CONTACT, SHOWCASE, siteCopy } from '@/lib/site-copy'
import type { Lang } from '@/lib/i18n'

const mailto = (subject: string, body: string) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export default function Home() {
  const { lang } = useLang()
  const c = siteCopy[lang]
  const a = agencyCopy[lang]
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="page-light min-h-screen">
      <Navbar variant="light" />

      {/* ── HERO: AI visibility first ─────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <div className="absolute -top-40 right-[-10%] w-[520px] h-[520px] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-10 items-center">
          <div>
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-6">{c.hero.eyebrow}</p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-[4.6rem] leading-[1.02] text-ink">
              {c.hero.h1a}<br />
              <span className="italic text-brand">{c.hero.h1b}</span>
            </h1>
            <p className="mt-7 text-lg md:text-xl text-ink/70 max-w-xl leading-relaxed">{c.hero.sub}</p>

            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <a href="#analyse" className="btn-primary inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-semibold">
                <Sparkles className="w-4 h-4" /> {c.hero.cta1}
              </a>
              <a href="#parcours" className="btn-outline inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-medium">
                {c.hero.cta2} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <p className="mt-3 text-xs text-ink/45">{c.checker.note}</p>

            <a href="#activer" className="mt-8 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors">
              <Mail className="w-4 h-4 text-brand" />
              <span>{c.hero.received} <span className="underline underline-offset-4 decoration-brand/50">{c.hero.receivedLink}</span></span>
            </a>
          </div>
          <AiAnswerMock />
        </div>
        <AnalysisDialog title={c.checker.title} sub={c.checker.sub} />
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────────── */}
      <div className="border-y border-line bg-paper-2">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex flex-wrap gap-x-8 gap-y-2">
          {c.trust.map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-ink/70">
              <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── WHY NOW ────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{a.shift.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink max-w-3xl leading-tight">{a.shift.title}</h2>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {a.shift.points.map((p, i) => {
              const Icon = [MessageSquareQuote, Globe2, Radar][i] || Sparkles
              return (
                <div key={p.title} className="card p-8">
                  <div className="w-11 h-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6"><Icon className="w-5 h-5" /></div>
                  <h3 className="text-xl font-semibold text-ink mb-3">{p.title}</h3>
                  <p className="text-ink/65 leading-relaxed">{p.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── JOURNEY: analysis -> audit -> accompaniment ────────────────────── */}
      <section id="parcours" className="py-24 md:py-32 bg-paper-2 border-y border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{a.journey.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink max-w-3xl leading-tight">{a.journey.title}</h2>
          <div className="mt-14 grid md:grid-cols-3 gap-6 relative">
            {a.journey.steps.map((step, i) => {
              const dark = i === 2
              const Icon = [Sparkles, FileSearch, BarChart3][i]
              return (
                <div key={step.title} className={`relative rounded-3xl p-8 flex flex-col ${dark ? 'bg-ink text-white shadow-2xl' : 'card'}`}>
                  <div className="flex items-center justify-between">
                    <span className="w-11 h-11 rounded-full bg-brand text-white font-display text-2xl flex items-center justify-center">{i + 1}</span>
                    <Icon className={`w-5 h-5 ${dark ? 'text-brand-2' : 'text-brand'}`} />
                  </div>
                  <span className={`mt-6 font-mono text-[11px] tracking-widest uppercase ${dark ? 'text-white/50' : 'text-ink/45'}`}>{step.tag}</span>
                  <h3 className={`mt-2 text-xl lg:text-2xl font-semibold break-words ${dark ? 'text-white' : 'text-ink'}`}>{step.title}</h3>
                  <p className={`mt-3 leading-relaxed flex-1 ${dark ? 'text-white/70' : 'text-ink/65'}`}>{step.desc}</p>
                  <a href={step.href} className={`mt-7 inline-flex items-center gap-2 text-sm font-semibold ${dark ? 'text-brand-2' : 'text-brand'}`}>
                    {step.cta} <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BAND: the free analysis ─────────────────────────────────────── */}
      <section id="checker" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-ink text-white p-8 md:p-12 md:flex md:items-center md:justify-between md:gap-12">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/25 blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-5xl leading-tight max-w-2xl">{a.band.title}</h2>
              <p className="mt-4 text-white/65 max-w-xl">{a.band.sub}</p>
            </div>
            <div className="relative mt-8 md:mt-0 flex-shrink-0">
              <a href="#analyse" className="btn-primary inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-base font-semibold">
                <Sparkles className="w-4 h-4" /> {a.band.cta}
              </a>
              <p className="mt-3 text-xs text-white/45 text-center">{c.checker.note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────────── */}
      <section id="services" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{a.services.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink max-w-3xl leading-tight">{a.services.title}</h2>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {a.services.items.map((item, i) => {
              const Icon = [Radar, Globe2, MapPin, FileSearch, Star, BarChart3][i] || Check
              return (
                <div key={item.title} className="card p-7 hover:-translate-y-1 hover:border-brand/40 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                  <h3 className="mt-5 font-semibold text-ink text-lg">{item.title}</h3>
                  <p className="mt-2 text-ink/65 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FREE FULL AUDIT ──────────────────────────────────────────────────── */}
      <section id="audit" className="py-24 md:py-32 bg-paper-2 border-y border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{a.audit.eyebrow}</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink leading-tight">{a.audit.title}</h2>
            <p className="mt-5 text-lg text-ink/65 leading-relaxed">{a.audit.sub}</p>
            <ul className="mt-8 space-y-3">
              {a.audit.bullets.map(b => (
                <li key={b} className="flex items-start gap-3 text-ink/75">
                  <span className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>{b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand text-white font-display text-xl flex items-center justify-center">AP</div>
              <div><p className="font-semibold text-ink">{c.founder.name}</p><p className="text-sm text-ink/55">{c.founder.role}</p></div>
            </div>
          </div>
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 text-ink font-semibold"><CalendarCheck className="w-5 h-5 text-brand" />{a.audit.eyebrow}</div>
            <AuditRequest lang={lang} variant="light" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{a.sites.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink max-w-3xl leading-tight">{a.sites.title}</h2>
          <p className="mt-5 text-lg text-ink/65 max-w-2xl">{c.how.title}</p>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {c.how.steps.map(step => (
              <div key={step.n} className="card p-8">
                <div className="w-11 h-11 rounded-full bg-brand text-white font-display text-2xl flex items-center justify-center mb-6">{step.n}</div>
                <h3 className="text-xl font-semibold text-ink mb-3">{step.title}</h3>
                <p className="text-ink/65 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXAMPLES ─────────────────────────────────────────────────────── */}
      <section id="exemples" className="py-24 md:py-32 bg-paper-2 border-y border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{c.examples.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink max-w-3xl leading-tight">{c.examples.title}</h2>
          <p className="mt-5 text-lg text-ink/65 max-w-2xl">{c.examples.sub}</p>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SHOWCASE.map(site => (
              <a key={site.slug} href={`https://${site.slug}.presenceia.com`} target="_blank" rel="noopener"
                className="card group p-6 flex flex-col hover:-translate-y-1 hover:border-brand/40 transition-all duration-300">
                <span className="font-mono text-xs tracking-widest uppercase text-ink/50">{site.sector[lang as Lang]} · {site.city}</span>
                <span className="mt-3 text-xl font-semibold text-ink">{site.name}</span>
                <span className="mt-1 text-sm text-ink/45 truncate">{site.slug}.presenceia.com</span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  {c.examples.open} <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── INCLUDED ─────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{c.included.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink max-w-3xl leading-tight">{c.included.title}</h2>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            {c.included.items.map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink text-lg">{item.title}</h3>
                  <p className="mt-1.5 text-ink/65 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 md:py-32 bg-paper-2 border-y border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{c.pricing.eyebrow}</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink leading-tight">{c.pricing.title}</h2>
            <p className="mt-5 text-lg text-ink/65">{c.pricing.sub}</p>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6 items-stretch">
            {c.pricing.plans.map((plan, i) => {
              const popular = 'popular' in plan && plan.popular
              return (
                <div key={plan.name} className={`relative rounded-3xl p-8 flex flex-col ${popular ? 'bg-ink text-white shadow-2xl md:-my-3' : 'card'}`}>
                  {popular && (
                    <span className="absolute -top-3 left-8 bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full">{c.pricing.popular}</span>
                  )}
                  <h3 className={`text-xl font-semibold ${popular ? 'text-white' : 'text-ink'}`}>{plan.name}</h3>
                  <p className={`mt-1 text-sm ${popular ? 'text-white/60' : 'text-ink/55'}`}>{plan.desc}</p>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className={`font-display text-5xl ${popular ? 'text-white' : 'text-ink'}`}>CHF {plan.price}</span>
                    <span className={`text-sm ${popular ? 'text-white/50' : 'text-ink/45'}`}>{c.pricing.mo}</span>
                  </div>
                  <ul className="mt-8 space-y-3 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm leading-relaxed ${popular ? 'text-white/80' : 'text-ink/70'}`}>
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${popular ? 'text-brand-2' : 'text-brand'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <CheckoutButton plan={PLAN_KEYS[i]} lang={lang} className={`mt-8 block w-full text-center py-3.5 rounded-xl text-sm font-semibold transition-all ${popular ? 'bg-brand text-white hover:bg-brand-2' : 'btn-outline'}`}>
                    {plan.cta}
                  </CheckoutButton>
                </div>
              )
            })}
          </div>
          <p className="mt-6 text-center text-sm text-ink/50 inline-flex w-full items-center justify-center gap-2"><ShieldCheck className="w-4 h-4 text-brand" />{c.pricing.secure}</p>
          <div className="mt-10 card p-6 md:p-8 md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <h3 className="text-xl font-semibold text-ink">{a.enterprise.title}</h3>
              <p className="mt-2 text-ink/65 leading-relaxed max-w-2xl">{a.enterprise.desc}</p>
            </div>
            <a href="#audit" className="btn-primary mt-5 md:mt-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold whitespace-nowrap">
              {a.enterprise.cta} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── FOUNDER ──────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="card p-8 md:p-12 md:flex md:items-start md:gap-12">
            <div className="flex-shrink-0 mb-8 md:mb-0">
              <div className="w-20 h-20 rounded-full bg-brand text-white font-display text-3xl flex items-center justify-center">AP</div>
            </div>
            <div>
              <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-3">{c.founder.eyebrow}</p>
              <p className="text-xl md:text-2xl text-ink leading-relaxed font-display">“{c.founder.text}”</p>
              <p className="mt-6 font-semibold text-ink">{c.founder.name}</p>
              <p className="text-sm text-ink/55">{c.founder.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 md:py-32 bg-paper-2 border-y border-line">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{c.faq.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink leading-tight">{c.faq.title}</h2>
          <div className="mt-12 divide-y divide-line border-y border-line">
            {c.faq.items.map((item, i) => {
              const open = openFaq === i
              return (
                <div key={item.q}>
                  <button onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open}
                    className="w-full flex items-start justify-between gap-6 py-6 text-left">
                    <span className="text-lg font-semibold text-ink">{item.q}</span>
                    <ChevronDown className={`w-5 h-5 text-brand flex-shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && <p className="pb-6 -mt-2 text-ink/70 leading-relaxed">{item.a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── ACTIVATE (contact) ───────────────────────────────────────────── */}
      <section id="activer" className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{c.activate.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-6xl text-ink leading-tight">{c.activate.title}</h2>
          <p className="mt-6 text-lg text-ink/65 max-w-2xl mx-auto">{c.activate.sub}</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a href={CONTACT.phoneHref} className="btn-primary inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-semibold">
              <Phone className="w-4 h-4" /> {c.activate.call} · {CONTACT.phone}
            </a>
            <a href={mailto(c.activate.emailSubject, c.activate.emailBody)} className="btn-outline inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-medium">
              <Mail className="w-4 h-4" /> {c.activate.email}
            </a>
          </div>
          <p className="mt-4 text-sm text-ink/50">{c.activate.reply}</p>
          <div className="mt-14 card p-6 md:p-8 text-left md:flex md:items-center md:justify-between md:gap-8">
            <p className="text-ink/70 leading-relaxed">{c.activate.none}</p>
            <a href={mailto(c.activate.noneSubject, c.activate.noneBody)} className="mt-4 md:mt-0 inline-flex items-center gap-2 text-brand font-semibold whitespace-nowrap">
              {c.activate.noneSubject} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-line py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-brand rounded-sm inline-flex items-center justify-center text-white text-xs font-black">+</span>
              <span className="font-bold text-ink">présence<span className="text-brand">ia</span></span>
            </div>
            <p className="mt-2 text-sm text-ink/55">{c.footer.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/60">
            <a href={`mailto:${CONTACT.email}`} className="hover:text-ink">{CONTACT.email}</a>
            <a href={CONTACT.phoneHref} className="hover:text-ink">{CONTACT.phone}</a>
            <Link href="/blog" className="hover:text-ink">{c.nav.blog}</Link>
            <Link href="/mentions-legales" className="hover:text-ink">{c.footer.legal}</Link>
            <Link href="/confidentialite" className="hover:text-ink">{c.footer.privacy}</Link>
          </div>
          <p className="text-xs text-ink/45">{c.footer.rights}</p>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Organization', '@id': 'https://presenceia.com/#organization', name: 'Présence IA', founder: { '@type': 'Person', name: CONTACT.owner }, url: 'https://presenceia.com', email: CONTACT.email, telephone: CONTACT.phone, address: { '@type': 'PostalAddress', streetAddress: CONTACT.street, postalCode: CONTACT.zip, addressLocality: CONTACT.city, addressRegion: 'VS', addressCountry: 'CH' }, areaServed: 'Worldwide', knowsLanguage: ['fr', 'de', 'en'] },
          { '@type': 'WebSite', '@id': 'https://presenceia.com/#website', url: 'https://presenceia.com', name: 'Présence IA', publisher: { '@id': 'https://presenceia.com/#organization' } },
          { '@type': 'Service', name: 'Site web professionnel pour PME', provider: { '@id': 'https://presenceia.com/#organization' }, areaServed: 'Worldwide', offers: [
            { '@type': 'Offer', name: 'Site web', price: '99', priceCurrency: 'CHF', priceSpecification: { '@type': 'UnitPriceSpecification', price: '99', priceCurrency: 'CHF', unitText: 'MONTH' } },
            { '@type': 'Offer', name: 'Site + Visibilité IA', price: '149', priceCurrency: 'CHF' },
            { '@type': 'Offer', name: 'Tout compris', price: '229', priceCurrency: 'CHF' },
          ] },
          { '@type': 'Service', name: 'Visibilité IA (GEO) pour PME', serviceType: 'Generative Engine Optimization', provider: { '@id': 'https://presenceia.com/#organization' }, areaServed: 'Worldwide', description: 'Mesure et amélioration de la visibilité d\'une entreprise dans les réponses de ChatGPT, Gemini, Claude et Perplexity : analyse gratuite, audit complet offert, accompagnement mensuel.' },
          { '@type': 'FAQPage', mainEntity: c.faq.items.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) },
        ],
      })}} />
    </div>
  )
}
