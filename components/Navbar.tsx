'use client'
import { useState, useEffect } from 'react'
import { useLang } from './LangProvider'
import { type Lang } from '@/lib/i18n'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-dark border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Swiss cross tiny */}
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
            <span className="font-sans font-700 text-base text-cream tracking-tight">
              présence<span className="text-brand">ia</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how" className="text-sm text-white/50 hover:text-white transition-colors font-medium">{t.nav.how}</Link>
            <Link href="#pricing" className="text-sm text-white/50 hover:text-white transition-colors font-medium">{t.nav.pricing}</Link>
            <Link href="/blog" className="text-sm text-white/50 hover:text-white transition-colors font-medium">{t.nav.blog}</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Lang switcher */}
            <div className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-1">
              {(['fr','de','en'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-all ${lang === l ? 'bg-brand text-white' : 'text-white/40 hover:text-white/70'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <Link href="/login" className="btn-ghost text-xs font-semibold px-4 py-2 rounded-full">{t.nav.login}</Link>
            <Link href="#checker" className="btn-primary text-xs font-semibold px-5 py-2.5 rounded-full">{t.nav.cta}</Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-white/70 p-2">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden glass-dark rounded-2xl p-4 mb-4 space-y-3 border border-white/5">
            {(['fr','de','en'] as Lang[]).map(l => (
              <button key={l} onClick={() => { setLang(l); setOpen(false) }}
                className={`block w-full text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${lang === l ? 'text-brand bg-brand/10' : 'text-white/60 hover:text-white'}`}>
                {l === 'fr' ? 'Français' : l === 'de' ? 'Deutsch' : 'English'}
              </button>
            ))}
            <hr className="border-white/5" />
            <Link href="#how" className="block text-sm text-white/60 hover:text-white px-3 py-2" onClick={() => setOpen(false)}>{t.nav.how}</Link>
            <Link href="#pricing" className="block text-sm text-white/60 hover:text-white px-3 py-2" onClick={() => setOpen(false)}>{t.nav.pricing}</Link>
            <Link href="/blog" className="block text-sm text-white/60 hover:text-white px-3 py-2" onClick={() => setOpen(false)}>{t.nav.blog}</Link>
            <Link href="#checker" className="btn-primary block text-center text-sm font-semibold px-4 py-3 rounded-xl mt-2" onClick={() => setOpen(false)}>{t.nav.cta}</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
