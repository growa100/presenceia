'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CONTACT } from '@/lib/site-copy'

export type LegalSection = { title: string; body: string[] }

// **bold** inside a paragraph
const rich = (t: string) => t.split(/\*\*(.+?)\*\*/g).map((part, i) => i % 2 ? <strong key={i} className="font-semibold text-ink">{part}</strong> : part)

export default function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  return (
    <div className="page-light min-h-screen">
      <Navbar variant="light" />
      <main className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <Link href="/" className="text-sm text-ink/50 hover:text-ink">← presenceia.com</Link>
        <h1 className="font-display text-4xl md:text-5xl text-ink mt-6">{title}</h1>
        <p className="mt-3 text-sm text-ink/50">{updated}</p>
        <div className="mt-12 space-y-10">
          {sections.map(s => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold text-ink mb-3">{s.title}</h2>
              {s.body.map((p, i) => <p key={i} className="text-ink/70 leading-relaxed mb-3">{rich(p)}</p>)}
            </section>
          ))}
        </div>
        <footer className="mt-20 pt-8 border-t border-line text-sm text-ink/50">
          {CONTACT.company}, {CONTACT.city}, Suisse · <a href={`mailto:${CONTACT.email}`} className="hover:text-ink">{CONTACT.email}</a>
        </footer>
      </main>
    </div>
  )
}
