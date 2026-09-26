// The offer (validated by Tony, 2026-09-26). Prices in CHF.
//   Site                        99/month (12 months) · 990/year · 129/month without commitment
//   Visibilité IA (the core)   249/month (12 months) · 2'490/year · 290/month + 490 set-up without commitment
//   Visibilité IA + Assistant  390/month (12 months) · 3'900/year · 450/month + 490 set-up without commitment
//   Sur mesure                  from 690/month, quoted after the free audit (not sold online)
//   GEO Boost (set-up alone)   890 one-time, on request only (not on the public pricing)
// Founder offer: -30 % for the first 12 months, first 15 clients on Visibilité IA (with or without assistant).
// Guarantee (see /conditions art. 6): if the AI visibility score has not improved 90 days after set-up, the next month is free.
export type MonthlyKey = 'site' | 'visibility' | 'complete'
export type PlanKey = MonthlyKey | 'boost'
export type Term = 'm12' | 'year' | 'flex'
export const PLAN_KEYS: MonthlyKey[] = ['site', 'visibility', 'complete']
export const TERMS: Term[] = ['m12', 'year', 'flex']
export const SETUP_CHF = 490
export const CUSTOM_FROM_CHF = 690
export const FOUNDER = { percent: 30, months: 12, slots: 15, plans: ['visibility', 'complete'] as PlanKey[] }

type L3 = Record<'fr' | 'de' | 'en', string>
export const PLANS: Record<PlanKey, { name: L3; prices?: Record<Term, number>; setupFlex?: number; once?: number }> = {
  site: { name: { fr: 'Site web', de: 'Website', en: 'Website' }, prices: { m12: 99, year: 990, flex: 129 } },
  visibility: { name: { fr: 'Visibilité IA', de: 'KI-Sichtbarkeit', en: 'AI visibility' }, prices: { m12: 249, year: 2490, flex: 290 }, setupFlex: SETUP_CHF },
  complete: { name: { fr: 'Visibilité IA + Assistant', de: 'KI-Sichtbarkeit + Assistent', en: 'AI visibility + Assistant' }, prices: { m12: 390, year: 3900, flex: 450 }, setupFlex: SETUP_CHF },
  boost: { name: { fr: 'GEO Boost', de: 'GEO Boost', en: 'GEO Boost' }, once: 890 },
}

export const isPlanKey = (v: unknown): v is PlanKey => typeof v === 'string' && v in PLANS
export const isTerm = (v: unknown): v is Term => v === 'm12' || v === 'year' || v === 'flex'
export const isMonthly = (p: PlanKey): p is MonthlyKey => !!PLANS[p].prices
export const planName = (p: string | null | undefined, lang: 'fr' | 'de' | 'en') => (p && p in PLANS ? PLANS[p as PlanKey].name[lang] : p || '')

/** Price for display: per month for m12/flex, per year for year. */
export const price = (p: MonthlyKey, t: Term) => PLANS[p].prices![t]
export const founderPrice = (p: MonthlyKey, t: Term) => Math.round(price(p, t) * (100 - FOUNDER.percent)) / 100   // exact, as Stripe bills it (174.30)
export const hasFounder = (p: PlanKey) => FOUNDER.plans.includes(p)

/** Swiss-style thousands: 2'490 */
export const chf = (n: number) => n.toLocaleString('de-CH', Number.isInteger(n) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/’/g, "'")

// Copy shared by the site, the client space and the emails.
export const OFFER = {
  fr: {
    term: { m12: '12 mois', year: 'Annuel', flex: 'Sans engagement' } as Record<Term, string>,
    termNote: { m12: 'Engagement 12 mois, mise en place offerte', year: 'Payé à l\'année : 2 mois offerts, mise en place offerte', flex: `Résiliable chaque mois, mise en place CHF ${SETUP_CHF}` } as Record<Term, string>,
    per: { m12: '/ mois', year: '/ an', flex: '/ mois' } as Record<Term, string>,
    founder: (left: number) => `Offre fondateur : -${FOUNDER.percent} % la première année pour les ${FOUNDER.slots} premiers clients Visibilité IA. Encore ${left} place${left > 1 ? 's' : ''}.`,
    founderShort: `-${FOUNDER.percent} % la 1re année`,
    guarantee: 'Garantie 90 jours : si votre score de visibilité IA n\'a pas progressé, le mois suivant est offert.',
    anchor: 'Pour comparaison, une agence SEO facture en général CHF 900 à 2\'000 par mois.',
    title: 'Visibilité IA', tagline: 'Nous corrigeons ce qui empêche les IA de vous recommander, puis nous entretenons votre présence chaque mois.',
    setup: ['Mise en place en 2 semaines : fiche Google, annuaires (local.ch, search.ch, votre métier), données structurées et FAQ, méthode avis'],
    monthly: ['Analyse mensuelle sur ChatGPT, Gemini, Claude et Perplexity, avec rapport', '4 publications Google par mois', 'Un nouveau contenu par mois qui répond à vos clients', 'Suivi des annuaires et des avis', 'Votre site inclus si vous en avez besoin'],
    cta: 'Démarrer Visibilité IA', custom: `Entreprise établie, plusieurs sites ou secteur très concurrentiel ? Programme sur mesure dès CHF ${CUSTOM_FROM_CHF} / mois, après l'audit offert.`,
    terms: 'Conditions', from: 'dès',
  },
  de: {
    term: { m12: '12 Monate', year: 'Jährlich', flex: 'Ohne Bindung' } as Record<Term, string>,
    termNote: { m12: '12 Monate Laufzeit, Einrichtung geschenkt', year: 'Jährlich bezahlt: 2 Monate geschenkt, Einrichtung geschenkt', flex: `Monatlich kündbar, Einrichtung CHF ${SETUP_CHF}` } as Record<Term, string>,
    per: { m12: '/ Monat', year: '/ Jahr', flex: '/ Monat' } as Record<Term, string>,
    founder: (left: number) => `Gründerangebot: -${FOUNDER.percent} % im ersten Jahr für die ${FOUNDER.slots} ersten KI-Sichtbarkeit-Kunden. Noch ${left} Plätze.`,
    founderShort: `-${FOUNDER.percent} % im 1. Jahr`,
    guarantee: '90-Tage-Garantie: Hat sich Ihr KI-Sichtbarkeitsscore nicht verbessert, ist der folgende Monat geschenkt.',
    anchor: 'Zum Vergleich: Eine SEO-Agentur verrechnet meist CHF 900 bis 2\'000 pro Monat.',
    title: 'KI-Sichtbarkeit', tagline: 'Wir beheben, was die KI daran hindert, Sie zu empfehlen, und pflegen Ihre Präsenz jeden Monat.',
    setup: ['Einrichtung in 2 Wochen: Google-Profil, Verzeichnisse (local.ch, search.ch, Ihre Branche), strukturierte Daten und FAQ, Bewertungsmethode'],
    monthly: ['Monatliche Analyse bei ChatGPT, Gemini, Claude und Perplexity, mit Bericht', '4 Google-Beiträge pro Monat', 'Ein neuer Inhalt pro Monat, der Kundenfragen beantwortet', 'Kontrolle der Verzeichnisse und Bewertungen', 'Ihre Website inklusive, falls nötig'],
    cta: 'KI-Sichtbarkeit starten', custom: `Etabliertes Unternehmen, mehrere Standorte oder starke Konkurrenz? Massgeschneidertes Programm ab CHF ${CUSTOM_FROM_CHF} / Monat, nach dem kostenlosen Audit.`,
    terms: 'Bedingungen', from: 'ab',
  },
  en: {
    term: { m12: '12 months', year: 'Yearly', flex: 'No commitment' } as Record<Term, string>,
    termNote: { m12: '12-month commitment, set-up included', year: 'Paid yearly: 2 months free, set-up included', flex: `Cancel any month, set-up CHF ${SETUP_CHF}` } as Record<Term, string>,
    per: { m12: '/ month', year: '/ year', flex: '/ month' } as Record<Term, string>,
    founder: (left: number) => `Founder offer: -${FOUNDER.percent} % for the first year for our first ${FOUNDER.slots} AI visibility clients. ${left} spot${left > 1 ? 's' : ''} left.`,
    founderShort: `-${FOUNDER.percent} % the 1st year`,
    guarantee: '90-day guarantee: if your AI visibility score has not improved, the following month is free.',
    anchor: 'For comparison, an SEO agency usually charges CHF 900 to 2,000 a month.',
    title: 'AI visibility', tagline: 'We fix what keeps AI from recommending you, then look after your presence every month.',
    setup: ['Set-up in 2 weeks: Google profile, directories (local.ch, search.ch, your trade), structured data and FAQ, reviews method'],
    monthly: ['Monthly analysis on ChatGPT, Gemini, Claude and Perplexity, with report', '4 Google posts a month', 'One new piece of content a month answering your customers', 'Directories and reviews follow-up', 'Your website included if you need one'],
    cta: 'Start AI visibility', custom: `Established business, several locations or a very competitive sector? Tailored programme from CHF ${CUSTOM_FROM_CHF} / month, after the free audit.`,
    terms: 'Terms', from: 'from',
  },
}

/** Direct link to Stripe Checkout for the core offer (Visibilité IA, 12 months). Used in emails and the PDF. */
export const offerUrl = (base: string, lang: string) => `${base}/api/stripe/checkout?plan=visibility&term=m12&lang=${lang}`

/** The core offer pitched after a free analysis (results page, report email, PDF, nurture emails). */
export function offerPitch(lang: 'fr' | 'de' | 'en', founder: boolean) {
  const full = chf(price('visibility', 'm12')), low = chf(founderPrice('visibility', 'm12'))
  if (lang === 'de') return {
    title: 'Oder direkt handeln',
    price: founder ? `CHF ${low} / Monat im 1. Jahr (Gründerangebot, statt ${full})` : `CHF ${full} / Monat, Einrichtung geschenkt`,
    text: `KI-Sichtbarkeit behebt in 2 Wochen, was die KI daran hindert, Sie zu nennen (Google-Profil, Verzeichnisse, strukturierte Daten, Bewertungen), und begleitet Ihre Präsenz danach jeden Monat. ${founder ? `CHF ${low} pro Monat im ersten Jahr mit dem Gründerangebot, statt ${full}.` : `CHF ${full} pro Monat über 12 Monate, Einrichtung geschenkt.`} 90-Tage-Garantie.`,
    cta: 'KI-Sichtbarkeit starten',
  }
  if (lang === 'en') return {
    title: 'Or take action now',
    price: founder ? `CHF ${low} / month the 1st year (founder offer, instead of ${full})` : `CHF ${full} / month, set-up included`,
    text: `AI visibility fixes in 2 weeks what keeps AI from naming you (Google profile, directories, structured data, reviews), then looks after your presence every month. ${founder ? `CHF ${low} a month the first year with the founder offer, instead of ${full}.` : `CHF ${full} a month over 12 months, set-up included.`} 90-day guarantee.`,
    cta: 'Start AI visibility',
  }
  return {
    title: 'Ou passez directement à l\'action',
    price: founder ? `CHF ${low} / mois la 1re année (offre fondateur, au lieu de ${full})` : `CHF ${full} / mois, mise en place offerte`,
    text: `Visibilité IA corrige en 2 semaines ce qui empêche les IA de vous citer (fiche Google, annuaires, données structurées, avis), puis suit votre présence chaque mois. ${founder ? `CHF ${low} par mois la première année avec l'offre fondateur, au lieu de ${full}.` : `CHF ${full} par mois sur 12 mois, mise en place offerte.`} Garantie 90 jours.`,
    cta: 'Démarrer Visibilité IA',
  }
}
