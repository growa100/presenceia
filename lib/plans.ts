// What is sold online (Stripe Checkout). Prices in CHF, same as the site.
// - GEO Boost: one-time pack, the natural first purchase after the free analysis.
// - Monthly plans: site / site + AI visibility (also the follow-up after a Boost) / all inclusive.
// The tailored programme (from CHF 299 / month) is quoted after the free audit, not sold here.
export type MonthlyKey = 'site' | 'visibility' | 'complete'
export type PlanKey = MonthlyKey | 'boost'
export const PLAN_KEYS: MonthlyKey[] = ['site', 'visibility', 'complete']
export const BOOST: PlanKey = 'boost'

type L3 = Record<'fr' | 'de' | 'en', string>
export const PLANS: Record<PlanKey, { chf: number; once?: boolean; name: L3 }> = {
  boost: { chf: 490, once: true, name: { fr: 'GEO Boost', de: 'GEO Boost', en: 'GEO Boost' } },
  site: { chf: 99, name: { fr: 'Site web', de: 'Website', en: 'Website' } },
  visibility: { chf: 149, name: { fr: 'Site + Visibilité IA', de: 'Website + KI-Sichtbarkeit', en: 'Website + AI visibility' } },
  complete: { chf: 229, name: { fr: 'Tout compris', de: 'Alles inklusive', en: 'All inclusive' } },
}

export const isPlanKey = (v: unknown): v is PlanKey => typeof v === 'string' && v in PLANS
export const isMonthly = (p: PlanKey): p is MonthlyKey => !PLANS[p].once

// The GEO Boost, in plain words (site, client space, emails).
export const BOOST_COPY = {
  fr: {
    title: 'GEO Boost', tagline: 'En 2 semaines, nous corrigeons ce qui empêche les IA de vous recommander.',
    items: ['Fiche Google optimisée (catégories, services, photos, questions)', 'Inscription et cohérence sur local.ch, search.ch et les annuaires de votre métier',
      'Données structurées et FAQ pour que les IA comprennent votre site', 'Méthode simple pour obtenir plus d\'avis clients',
      'Nouvelle analyse sur les 4 IA après 30 jours : avant / après'],
    price: 'CHF 490, une seule fois', cta: 'Lancer mon GEO Boost', note: 'Paiement unique, sans abonnement. Suivi mensuel en option (CHF 149 / mois).',
  },
  de: {
    title: 'GEO Boost', tagline: 'In 2 Wochen beheben wir, was die KI daran hindert, Sie zu empfehlen.',
    items: ['Optimiertes Google-Profil (Kategorien, Leistungen, Fotos, Fragen)', 'Eintrag und einheitliche Angaben auf local.ch, search.ch und den Verzeichnissen Ihrer Branche',
      'Strukturierte Daten und FAQ, damit die KI Ihre Website versteht', 'Einfache Methode für mehr Kundenbewertungen',
      'Neue Analyse bei den 4 KI nach 30 Tagen: vorher / nachher'],
    price: 'CHF 490, einmalig', cta: 'Meinen GEO Boost starten', note: 'Einmalige Zahlung, kein Abo. Monatliche Begleitung optional (CHF 149 / Monat).',
  },
  en: {
    title: 'GEO Boost', tagline: 'In 2 weeks, we fix what keeps AI from recommending you.',
    items: ['Optimised Google profile (categories, services, photos, questions)', 'Listing and consistent details on local.ch, search.ch and your trade\'s directories',
      'Structured data and FAQ so AI understands your website', 'A simple method to get more customer reviews',
      'New analysis on the 4 assistants after 30 days: before / after'],
    price: 'CHF 490, one-time', cta: 'Start my GEO Boost', note: 'One-time payment, no subscription. Monthly follow-up optional (CHF 149 / month).',
  },
}
