'use client'
import { useState, useEffect } from 'react'
import { useLang } from './LangProvider'
import { type Lang } from '@/lib/i18n'
import { siteCopy } from '@/lib/site-copy'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

type Variant = 'dark' | 'light'

/**
 * `variant="light"` is the homepage (cream background, conversion page);
 * `dark` (default) keeps the original look for blog / login / dashboard.
 */
export default function Navbar({ variant = 'dark' }: { variant?: Variant }) {
  const { lang, setLang, t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const light = variant === 'light'
  const c = siteCopy[lang].nav

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const links = light
    ? [
        { href: '/#parcours', label: c.journey },
        { href: '/#services', label: c.services },
        { href: '/#exemples', label: c.examples },
        { href: '/#pricing', label: c.pricing },
        { href: '/#faq', label: c.faq },
        { href: '/blog', label: c.blog },
      ]
    : [
        { href: '/#how', label: t.nav.how },
        { href: '/#pricing', label: t.nav.pricing },
        { href: '/blog', label: t.nav.blog },
      ]
  const cta = light ? { href: '/#analyse', label: c.cta } : { href: '/#analyse', label: t.nav.cta }
  const loginLabel = light ? c.login : t.nav.login

  const shell = light
    ? (scrolled ? 'bg-paper/90 backdrop-blur border-b border-line' : 'bg-transparent')
    : (scrolled ? 'glass-dark border-b border-white/5' : 'bg-transparent')
  const linkCls = light ? 'text-ink/60 hover:text-ink' : 'text-white/50 hover:text-white'
  const brandText = light ? 'text-ink' : 'text-cream'
  const langBox = light ? 'bg-ink/5' : 'bg-white/5'
  const langIdle = light ? 'text-ink/50 hover:text-ink' : 'text-white/40 hover:text-white/70'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${shell}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 bg-brand rounded-sm opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center gap-px">
                <div className="w-1.5 h-1 bg-white rounded-sm" />
                <div className="flex gap-px">
                  <div className="w-1 h-1.5 bg-white rounded-sm" />
                  <div className="w-1 h-1.5 bg-white rounded-sm" />
                </div>
                <div className="w-1.5 h-1 bg-white rounded-sm" />
              </div>
            </div>
            <span className={`font-sans font-bold text-base tracking-tight ${brandText}`}>
              présence<span className="text-brand">ia</span>
            </span>
          </Link>

          <div className={`hidden ${light ? 'lg:flex gap-6' : 'md:flex gap-8'} items-center`}>
            {links.map(l => (
              <Link key={l.href} href={l.href} className={`text-sm font-medium whitespace-nowrap transition-colors ${linkCls}`}>{l.label}</Link>
            ))}
          </div>

          <div className={`hidden ${light ? 'lg:flex' : 'md:flex'} items-center gap-4`}>
            <div className={`flex items-center gap-1 rounded-full px-2 py-1 ${langBox}`}>
              {(['fr', 'de', 'en'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-all ${lang === l ? 'bg-brand text-white' : langIdle}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <Link href="/login" className={`text-xs font-semibold px-4 py-2 rounded-full ${light ? 'btn-outline' : 'btn-ghost'}`}>{loginLabel}</Link>
            <Link href={cta.href} className="btn-primary text-xs font-semibold px-5 py-2.5 rounded-full whitespace-nowrap">{cta.label}</Link>
          </div>

          <button onClick={() => setOpen(!open)} className={`${light ? 'lg:hidden' : 'md:hidden'} p-2 ${light ? 'text-ink' : 'text-white/70'}`} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className={`${light ? 'lg:hidden' : 'md:hidden'} rounded-2xl p-4 mb-4 space-y-1 border ${light ? 'bg-paper border-line shadow-xl' : 'glass-dark border-white/5'}`}>
            <div className="flex gap-2 px-3 pb-3">
              {(['fr', 'de', 'en'] as Lang[]).map(l => (
                <button key={l} onClick={() => { setLang(l); setOpen(false) }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${lang === l ? 'bg-brand text-white' : light ? 'bg-ink/5 text-ink/70' : 'bg-white/5 text-white/60'}`}>
                  {l === 'fr' ? 'Français' : l === 'de' ? 'Deutsch' : 'English'}
                </button>
              ))}
            </div>
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`block text-sm px-3 py-2.5 rounded-lg ${light ? 'text-ink/80 hover:bg-ink/5' : 'text-white/60 hover:text-white'}`}>{l.label}</Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className={`block text-sm px-3 py-2.5 ${light ? 'text-ink/60' : 'text-white/50'}`}>{loginLabel}</Link>
            <Link href={cta.href} onClick={() => setOpen(false)} className="btn-primary block text-center text-sm font-semibold px-4 py-3 rounded-xl mt-2">{cta.label}</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
