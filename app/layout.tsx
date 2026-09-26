import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/components/LangProvider'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  metadataBase: new URL('https://presenceia.com'),
  title: {
    default: 'Présence IA, votre entreprise recommandée par ChatGPT, Gemini et Google',
    template: '%s | Présence IA',
  },
  description: 'Agence suisse de visibilité IA. Nous mesurons ce que ChatGPT, Gemini, Claude et Perplexity disent de votre entreprise, puis vous rendons visible et recommandé, sur les IA comme sur Google. Analyse gratuite en 20 secondes, audit complet offert, accompagnement dès CHF 149 par mois.',
  keywords: [
    'site web artisan', 'site web PME suisse', 'création site web Valais', 'site web garage', 'site web plombier',
    'GEO', 'Generative Engine Optimization', 'visibilité IA', 'ChatGPT PME suisse',
    'référencement IA Suisse', 'présence IA', 'Claude Perplexity Suisse',
    'SEO IA Suisse', 'PME suisses ChatGPT', 'Schema.org Suisse',
    'visibilité ChatGPT', 'GEO Switzerland', 'AI visibility Switzerland'
  ],
  authors: [{ name: 'Antoine Pury', url: 'https://presenceia.com' }],
  creator: '41 Labs GmbH',
  publisher: '41 Labs GmbH',
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
    title: 'Présence IA, votre entreprise recommandée par les IA',
    description: 'Analyse gratuite de votre visibilité sur ChatGPT, Gemini, Claude et Perplexity. Audit complet offert, accompagnement dès CHF 149 par mois.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Présence IA, votre entreprise recommandée par les IA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Présence IA, votre entreprise recommandée par les IA',
    description: 'Analyse gratuite de votre visibilité IA en 20 secondes. Audit complet offert.',
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
          <ScrollReveal />
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
