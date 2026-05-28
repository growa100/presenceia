import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/components/LangProvider'
import Cursor from '@/components/Cursor'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  metadataBase: new URL('https://presenceia.com'),
  title: {
    default: 'Présence IA — Visibilité IA pour les PME suisses',
    template: '%s | Présence IA',
  },
  description: 'Découvrez si votre entreprise apparaît quand vos clients demandent à ChatGPT, Claude ou Perplexity. Score de visibilité IA gratuit en 60 secondes. GEO — Generative Engine Optimization pour les PME suisses.',
  keywords: [
    'GEO', 'Generative Engine Optimization', 'visibilité IA', 'ChatGPT PME suisse',
    'référencement IA Suisse', 'présence IA', 'Claude Perplexity Suisse',
    'SEO IA Suisse', 'PME suisses ChatGPT', 'Schema.org Suisse',
    'visibilité ChatGPT', 'GEO Switzerland', 'AI visibility Switzerland'
  ],
  authors: [{ name: 'Présence IA', url: 'https://presenceia.com' }],
  creator: 'Présence IA GmbH',
  publisher: 'Présence IA GmbH',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CH',
    alternateLocale: ['de_CH', 'en_US'],
    url: 'https://presenceia.com',
    siteName: 'Présence IA',
    title: 'Présence IA — Votre entreprise existe-t-elle pour les IA ?',
    description: 'Quand vos clients demandent à ChatGPT un plombier, un dentiste ou un avocat — apparaissez-vous ? Score gratuit en 60 secondes.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Présence IA — AI Visibility for Swiss SMEs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Présence IA — Be the answer.',
    description: 'GEO — Generative Engine Optimization pour les PME suisses. Score gratuit en 60 secondes.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://presenceia.com',
    languages: {
      'fr-CH': 'https://presenceia.com',
      'de-CH': 'https://presenceia.com',
      'en':    'https://presenceia.com',
    },
  },
  verification: {
    google: 'REPLACE_WITH_YOUR_GOOGLE_VERIFICATION_CODE',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
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
