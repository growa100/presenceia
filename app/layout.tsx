import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Présence IA — Visibilité IA pour les PME suisses',
  description: 'Découvrez si votre entreprise apparaît quand un client cherche vos services sur ChatGPT, Claude ou Perplexity. Score gratuit en 60 secondes.',
  keywords: 'visibilité IA, GEO, ChatGPT, PME suisses, présence digitale, référencement IA',
  openGraph: {
    title: 'Présence IA — Votre entreprise existe-t-elle pour les IA ?',
    description: 'Score de visibilité IA gratuit pour les PME suisses. Découvrez si ChatGPT vous recommande.',
    type: 'website',
    locale: 'fr_CH',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
