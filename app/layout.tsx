import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/components/LangProvider'
import Cursor from '@/components/Cursor'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Présence IA — Be the answer.',
  description: 'GEO — Generative Engine Optimization pour les PME suisses. Apparaissez quand vos clients demandent à ChatGPT, Claude ou Perplexity.',
  keywords: 'GEO, visibilité IA, ChatGPT, PME suisses, référencement IA, Suisse',
  openGraph: {
    title: 'Présence IA — Be the answer.',
    description: 'Quand vos clients demandent aux IA — vous devez être la réponse.',
    type: 'website',
    locale: 'fr_CH',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LangProvider>
          <Cursor />
          <ScrollReveal />
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
