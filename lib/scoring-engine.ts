// Présence IA visibility check, engine v2.
// Asks the AI assistants people use (web search on, located in Switzerland) the question a real
// customer would ask, stores the answers verbatim, then measures whether the business is named.
import { askPlatform, platformEnabled, PLATFORM_LABELS, type GeoAnswer, type GeoSource, type PlatformId } from './geo/platforms'
import { analyseAnswers } from './geo/analyst'
import { findMention, quoteExists } from './geo/match'

export const ENGINE_VERSION = 2

export interface BusinessInput {
  businessName: string
  city: string
  category: string
  language: 'fr' | 'de' | 'en' | 'it'
}

export interface PlatformResult {
  id?: string
  platform: string
  platformLabel: string
  model?: string
  appeared: boolean
  position: number | null   // 1 = first recommendation, null = not named
  sentiment: 'positive' | 'neutral' | 'negative' | 'not_found'
  rawResponse: string       // verbatim answer of the assistant
  query: string
  score: number             // 0 to 25
  evidence?: string | null  // exact excerpt where the business is named
  sources?: GeoSource[]
  costUsd?: number
  latencyMs?: number
  error?: string
}

export interface ScoringResult {
  businessName: string
  city: string
  category: string
  overallScore: number      // 0 to 100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  platformResults: PlatformResult[]   // best answer per assistant (for the cards)
  answers?: PlatformResult[]          // every answer, verbatim
  competitors?: { name: string; count: number }[]
  summary: string
  topRecommendations: string[]
  shareOfVoice: number      // % of answers naming the business
  mentions?: number
  totalAnswers?: number
  platformsQueried?: string[]
  platformsSkipped?: string[]
  analystModel?: string | null
  costUsd?: number
  engineVersion?: number
  createdAt: string
}

// ─── Questions a real customer asks ───────────────────────────────────────────
const OTHER = new Set(['autre', 'andere', 'other', 'altro'])

function tradeWord(category: string, lang: string): string {
  const c = category.trim()
  if (OTHER.has(c.toLowerCase())) return { fr: 'entreprise', de: 'Betrieb', en: 'business', it: 'azienda' }[lang] || 'entreprise'
  return lang === 'de' ? c : c.charAt(0).toLowerCase() + c.slice(1)
}

// Grammatical gender, so the question reads like a real customer's ("la meilleure boulangerie",
// "das beste Hotel"). Unknown trades fall back to masculine, which is the most common case.
function frFeminine(t: string): boolean {
  const n = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return /(erie|ie|ique|ance|ence|ure|ade|ette|ere|euse|trice)$/.test(n)
    || ['fiduciaire', 'entreprise', 'agence', 'ecole', 'garderie', 'auto-ecole', 'station', 'maison'].includes(n)
}
function deGender(t: string): 'm' | 'f' | 'n' {
  const n = t.toLowerCase()
  if (['hotel', 'restaurant', 'café', 'cafe', 'büro', 'studio', 'geschäft', 'atelier', 'institut', 'zentrum', 'unternehmen'].includes(n)) return 'n'
  if (/(ei|erie|ie|ung|heit|keit|praxis|garage|schule|kanzlei|apotheke|klinik)$/.test(n)) return 'f'
  return 'm'
}

// Places are asked with "Quel", people with "Qui".
const FR_PLACES = /^(restaurant|h[oô]tel|garage|cabinet|caf[ée]|bar|salon|magasin|atelier|bureau|centre|studio|institut|camping|spa)\b/i

export function buildQueries(b: BusinessInput): [string, string] {
  const t = tradeWord(b.category, b.language)
  const city = b.city.trim()
  switch (b.language) {
    case 'de': {
      const g = deGender(t)
      const q1 = g === 'f' ? `Welche ist die beste ${t} in ${city}?` : g === 'n' ? `Welches ist das beste ${t} in ${city}?` : `Wer ist der beste ${t} in ${city}?`
      const art = g === 'f' ? 'eine zuverlässige' : g === 'n' ? 'ein zuverlässiges' : 'einen zuverlässigen'
      // Weak nouns take -en in the accusative ("einen Architekten").
      const acc = g === 'm' && /(architekt|fotograf|psychologe|kollege)$/i.test(t) ? t.replace(/e?$/, 'en').replace(/een$/, 'en') : t
      return [q1, `Kannst du mir ${art} ${acc} in ${city} empfehlen?`]
    }
    case 'en': return [`Who is the best ${t} in ${city}?`, `Can you recommend a reliable ${t} in ${city}?`]
    case 'it': return [`Qual è il miglior ${t} a ${city}?`, `Mi consigli un ${t} affidabile a ${city}?`]
    default: {
      const f = frFeminine(t)
      return f
        ? [`Quelle est la meilleure ${t} à ${city} ?`, `Peux-tu me recommander une ${t} de confiance à ${city} ?`]
        : [`${FR_PLACES.test(t) ? 'Quel' : 'Qui'} est le meilleur ${t} à ${city} ?`, `Peux-tu me recommander un ${t} de confiance à ${city} ?`]
    }
  }
}

// Which assistant gets which question: one answer per assistant (Tony, 2026-09-26: about USD 0.13
// per check). The two phrasings are spread so both intents are covered.
const PLAN: [PlatformId, 0 | 1][] = [
  ['chatgpt', 0],
  ['gemini', 1],
  ['claude', 0],
  ['grok', 1],
  ['perplexity', 0],
]

function scoreOf(appeared: boolean, position: number | null, sentiment: PlatformResult['sentiment']): number {
  if (!appeared) return 0
  let s = 10
  s += position === 1 ? 10 : position === 2 ? 6 : position === 3 ? 3 : 1
  s += sentiment === 'positive' ? 5 : sentiment === 'neutral' ? 3 : 0
  return s
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export async function runVisibilityCheck(business: BusinessInput): Promise<ScoringResult> {
  const queries = buildQueries(business)
  const plan = PLAN.filter(([p]) => platformEnabled(p))
  const skipped = (Object.keys(PLATFORM_LABELS) as PlatformId[]).filter(p => !platformEnabled(p))
  if (!plan.length) throw new Error('No AI platform configured')

  const counters: Record<string, number> = {}
  const raw: GeoAnswer[] = await Promise.all(plan.map(([p, qi]) => {
    counters[p] = (counters[p] || 0) + 1
    return askPlatform(`${p}-${counters[p]}`, p, queries[qi], business.city)
  }))

  const ok = raw.filter(a => a.text && !a.error)
  if (!ok.length) throw new Error('All AI platforms failed')

  const analyst = await analyseAnswers(business, ok)

  const answers: PlatformResult[] = raw.map(a => {
    const det = findMention(business.businessName, a.text)
    const an = analyst?.answers.find(x => x.id === a.id)
    let appeared: boolean
    let evidence: string | null = det.matchedText
    if (an) {
      // The analyst decides, but only with evidence that really exists in the answer.
      const verified = !!an.quote && quoteExists(an.quote, a.text)
      appeared = an.mentioned && (verified || det.mentioned)
      if (appeared && verified) evidence = an.quote
    } else {
      appeared = det.mentioned
    }
    const position = appeared ? (an?.rank ?? det.position ?? 1) : null
    const sentiment: PlatformResult['sentiment'] = appeared
      ? (an && an.sentiment !== 'not_found' ? an.sentiment : 'neutral')
      : 'not_found'
    return {
      id: a.id,
      platform: a.platform,
      platformLabel: a.platformLabel,
      model: a.model,
      appeared,
      position,
      sentiment,
      rawResponse: a.text,
      query: a.query,
      score: a.error ? 0 : scoreOf(appeared, position, sentiment),
      evidence: appeared ? evidence : null,
      sources: a.sources,
      costUsd: a.costUsd,
      latencyMs: a.latencyMs,
      ...(a.error ? { error: a.error } : {}),
    }
  })

  const scored = answers.filter(a => !a.error)
  const mentions = scored.filter(a => a.appeared).length
  const overallScore = Math.min(100, Math.round((scored.reduce((s, r) => s + r.score, 0) / (scored.length * 25)) * 100))
  const shareOfVoice = Math.round((mentions / scored.length) * 100)
  const grade = overallScore >= 80 ? 'A' : overallScore >= 60 ? 'B' : overallScore >= 40 ? 'C' : overallScore >= 20 ? 'D' : 'F'

  const queried = Array.from(new Set(scored.map(a => a.platformLabel)))
  const summary = analyst?.diagnosis || templateSummary(business, grade, queried, mentions, scored.length)
  const topRecommendations = analyst?.actions?.length === 3 ? analyst.actions : templateRecs(business.language)

  const costUsd = raw.reduce((s, a) => s + a.costUsd, 0) + (analyst?.costUsd || 0)

  return {
    businessName: business.businessName,
    city: business.city,
    category: business.category,
    overallScore,
    grade,
    platformResults: bestPerPlatform(answers),
    answers,
    competitors: analyst?.competitors || [],
    summary,
    topRecommendations,
    shareOfVoice,
    mentions,
    totalAnswers: scored.length,
    platformsQueried: queried,
    platformsSkipped: skipped.map(p => PLATFORM_LABELS[p]),
    analystModel: analyst?.model || null,
    costUsd: Math.round(costUsd * 10000) / 10000,
    engineVersion: ENGINE_VERSION,
    createdAt: new Date().toISOString(),
  }
}

function bestPerPlatform(results: PlatformResult[]): PlatformResult[] {
  const map = new Map<string, PlatformResult>()
  for (const r of results) {
    const cur = map.get(r.platform)
    if (!cur || (cur.error && !r.error) || (!r.error && r.score > cur.score)) map.set(r.platform, r)
  }
  return Array.from(map.values())
}

// ─── Fallback texts when the analyst call is unavailable ──────────────────────
function templateSummary(b: BusinessInput, grade: string, platforms: string[], mentions: number, total: number): string {
  const list = platforms.join(', ')
  if (b.language === 'de') {
    return mentions === 0
      ? `${b.businessName} wird in keiner der ${total} Antworten genannt (${list}). Kunden, die dort nach einem ${b.category} in ${b.city} fragen, finden Sie nicht.`
      : `${b.businessName} wird in ${mentions} von ${total} Antworten genannt (${list}). Note ${grade}.`
  }
  if (b.language === 'en') {
    return mentions === 0
      ? `${b.businessName} is not named in any of the ${total} answers (${list}). Customers asking these assistants for a ${b.category} in ${b.city} will not find you.`
      : `${b.businessName} is named in ${mentions} of ${total} answers (${list}). Grade ${grade}.`
  }
  return mentions === 0
    ? `${b.businessName} n'est cité dans aucune des ${total} réponses (${list}). Les clients qui demandent à ces assistants un ${b.category.toLowerCase()} à ${b.city} ne vous trouvent pas.`
    : `${b.businessName} est cité dans ${mentions} réponses sur ${total} (${list}). Note ${grade}.`
}

function templateRecs(lang: string): string[] {
  if (lang === 'de') return [
    'Vervollständigen Sie Ihr Google-Unternehmensprofil mit Leistungen, Öffnungszeiten und Fotos',
    'Tragen Sie Ihren Betrieb in local.ch und search.ch mit identischen Kontaktdaten ein',
    'Sammeln Sie regelmässig Google-Bewertungen und beantworten Sie diese',
  ]
  if (lang === 'en') return [
    'Complete your Google Business Profile with services, opening hours and photos',
    'List your business on local.ch and search.ch with identical contact details',
    'Collect Google reviews regularly and reply to them',
  ]
  return [
    'Complétez votre fiche Google Business Profile : services, horaires, photos',
    'Inscrivez-vous sur local.ch et search.ch avec des coordonnées identiques partout',
    'Collectez régulièrement des avis Google et répondez-y',
  ]
}
