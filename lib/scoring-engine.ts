import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface BusinessInput {
  businessName: string
  city: string
  category: string
  language: 'fr' | 'de' | 'en' | 'it'
}

export interface PlatformResult {
  platform: string
  platformLabel: string
  appeared: boolean
  position: number | null   // 1=first, 2=second, null=not found
  sentiment: 'positive' | 'neutral' | 'negative' | 'not_found'
  rawResponse: string
  query: string
  score: number             // 0–25 per platform
}

export interface ScoringResult {
  businessName: string
  city: string
  category: string
  overallScore: number      // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  platformResults: PlatformResult[]
  summary: string
  topRecommendations: string[]
  shareOfVoice: number      // % of queries mentioning them
  createdAt: string
}

// ─── Query templates per language ────────────────────────────────────────────
function buildQueries(business: BusinessInput): Record<string, string[]> {
  const { city, category } = business
  const queries: Record<string, string[]> = {
    fr: [
      `Quel est le meilleur ${category} à ${city} ?`,
      `Recommande-moi un bon ${category} à ${city}`,
      `Je cherche un ${category} de confiance à ${city}`,
    ],
    de: [
      `Welcher ist der beste ${category} in ${city}?`,
      `Empfehle mir einen guten ${category} in ${city}`,
      `Ich suche einen zuverlässigen ${category} in ${city}`,
    ],
    en: [
      `Who is the best ${category} in ${city}?`,
      `Can you recommend a good ${category} in ${city}?`,
      `I'm looking for a reliable ${category} in ${city}`,
    ],
    it: [
      `Chi è il miglior ${category} a ${city}?`,
      `Mi raccomandi un buon ${category} a ${city}`,
    ],
  }
  return queries
}

// ─── Score a single platform response ────────────────────────────────────────
function scoreResponse(
  businessName: string,
  response: string,
  query: string,
  platform: string,
  platformLabel: string
): PlatformResult {
  const lower = response.toLowerCase()
  const nameLower = businessName.toLowerCase()

  // Check if business is mentioned
  const appeared = lower.includes(nameLower) ||
    nameLower.split(' ').filter(w => w.length > 3).every(w => lower.includes(w))

  if (!appeared) {
    return {
      platform, platformLabel, appeared: false,
      position: null, sentiment: 'not_found',
      rawResponse: response, query, score: 0
    }
  }

  // Estimate position
  const idx = lower.indexOf(nameLower)
  const textBefore = lower.substring(0, idx)
  const numbersBeforeMatch = (textBefore.match(/\d+\./g) || []).length
  const position = numbersBeforeMatch === 0 ? 1 : numbersBeforeMatch + 1

  // Sentiment detection
  const positiveWords = ['excellent', 'recommande', 'meilleur', 'best', 'top', 'great',
    'highly', 'trusted', 'professional', 'quality', 'beste', 'empfehle', 'ausgezeichnet',
    'ottimo', 'migliore', 'vertrauenswürdig']
  const negativeWords = ['avoid', 'poor', 'bad', 'worst', 'éviter', 'mauvais', 'schlecht']

  const contextWindow = response.substring(Math.max(0, idx - 100), idx + 200).toLowerCase()
  const hasPositive = positiveWords.some(w => contextWindow.includes(w))
  const hasNegative = negativeWords.some(w => contextWindow.includes(w))

  const sentiment = hasNegative ? 'negative' : hasPositive ? 'positive' : 'neutral'

  // Score calculation (max 25 per platform)
  let score = 0
  score += 10  // appeared at all
  score += position === 1 ? 10 : position === 2 ? 6 : position === 3 ? 3 : 1
  score += sentiment === 'positive' ? 5 : sentiment === 'neutral' ? 3 : 0

  return { platform, platformLabel, appeared, position, sentiment, rawResponse: response, query, score }
}

// ─── Query OpenAI GPT-4o ──────────────────────────────────────────────────────
async function queryOpenAI(query: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 400,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful local assistant for Switzerland. Answer concisely with specific business recommendations when asked. Always include business names when recommending.'
        },
        { role: 'user', content: query }
      ]
    })
    return response.choices[0]?.message?.content || ''
  } catch (e) {
    console.error('OpenAI error:', e)
    return ''
  }
}

// ─── Query Claude ─────────────────────────────────────────────────────────────
async function queryClaude(query: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: 'You are a helpful local assistant for Switzerland. Answer concisely with specific business recommendations when asked. Always include business names when recommending.',
      messages: [{ role: 'user', content: query }]
    })
    const block = response.content[0]
    return block.type === 'text' ? block.text : ''
  } catch (e) {
    console.error('Claude error:', e)
    return ''
  }
}

// ─── Query Perplexity ─────────────────────────────────────────────────────────
async function queryPerplexity(query: string): Promise<string> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'system', content: 'You are a helpful local assistant for Switzerland. Provide specific business recommendations with names.' },
          { role: 'user', content: query }
        ],
        max_tokens: 400
      })
    })
    if (!response.ok) return ''
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (e) {
    console.error('Perplexity error:', e)
    return ''
  }
}

// ─── Main scoring function ────────────────────────────────────────────────────
export async function runVisibilityCheck(business: BusinessInput): Promise<ScoringResult> {
  const queries = buildQueries(business)

  // Pick queries for the selected language + always run English
  const langQueries = queries[business.language] || queries['fr']
  const enQueries = business.language !== 'en' ? queries['en'].slice(0, 1) : []
  const allQueries = [...langQueries, ...enQueries]

  const platformResults: PlatformResult[] = []

  // Run all queries across platforms in parallel (batched)
  const mainQuery = allQueries[0]
  const secondQuery = allQueries[1] || allQueries[0]

  const [gptRes1, gptRes2, claudeRes1, claudeRes2] = await Promise.all([
    queryOpenAI(mainQuery),
    queryOpenAI(secondQuery),
    queryClaude(mainQuery),
    queryClaude(secondQuery),
  ])

  // GPT-4o results
  platformResults.push(scoreResponse(business.businessName, gptRes1, mainQuery, 'chatgpt', 'ChatGPT (GPT-4o)'))
  platformResults.push(scoreResponse(business.businessName, gptRes2, secondQuery, 'chatgpt_2', 'ChatGPT (GPT-4o)'))

  // Claude results
  platformResults.push(scoreResponse(business.businessName, claudeRes1, mainQuery, 'claude', 'Claude (Anthropic)'))
  platformResults.push(scoreResponse(business.businessName, claudeRes2, secondQuery, 'claude_2', 'Claude (Anthropic)'))

  // Perplexity (if key available)
  if (process.env.PERPLEXITY_API_KEY) {
    const perpRes = await queryPerplexity(mainQuery)
    platformResults.push(scoreResponse(business.businessName, perpRes, mainQuery, 'perplexity', 'Perplexity AI'))
  }

  // ─── Calculate overall score ─────────────────────────────────────────────
  const maxPossibleScore = platformResults.length * 25
  const totalRaw = platformResults.reduce((sum, r) => sum + r.score, 0)
  const overallScore = Math.min(100, Math.round((totalRaw / maxPossibleScore) * 100))

  // Share of voice
  const appeared = platformResults.filter(r => r.appeared).length
  const shareOfVoice = Math.round((appeared / platformResults.length) * 100)

  // Grade
  const grade = overallScore >= 80 ? 'A'
    : overallScore >= 60 ? 'B'
    : overallScore >= 40 ? 'C'
    : overallScore >= 20 ? 'D'
    : 'F'

  // Summary
  const summaryMap: Record<string, Record<string, string>> = {
    fr: {
      F: `${business.businessName} n'apparaît dans aucune réponse des assistants IA analysés. Vos clients potentiels qui utilisent ChatGPT, Claude ou Perplexity pour trouver un ${business.category} à ${business.city} ne vous trouveront pas.`,
      D: `${business.businessName} a une présence IA très limitée. Vous apparaissez dans quelques réponses, mais vous êtes loin d'être la recommandation principale.`,
      C: `${business.businessName} est parfois mentionné par les IA, mais pas de manière constante. Vos concurrents ont probablement une meilleure visibilité.`,
      B: `${business.businessName} a une bonne présence IA. Vous apparaissez régulièrement dans les recommandations, mais il y a encore de la marge pour devenir la référence.`,
      A: `${business.businessName} est excellemment positionné sur les IA. Vous êtes régulièrement recommandé en premier.`,
    },
    en: {
      F: `${business.businessName} does not appear in any AI assistant responses analyzed. Potential clients using ChatGPT, Claude or Perplexity to find a ${business.category} in ${business.city} will not find you.`,
      D: `${business.businessName} has very limited AI presence. You appear in a few responses but are far from being the primary recommendation.`,
      C: `${business.businessName} is occasionally mentioned by AI, but not consistently. Your competitors likely have better visibility.`,
      B: `${business.businessName} has good AI presence. You appear regularly in recommendations, but there's still room to become the top reference.`,
      A: `${business.businessName} is excellently positioned on AI. You are regularly recommended first.`,
    }
  }

  const lang = business.language === 'de' || business.language === 'it' ? 'en' : business.language
  const summary = (summaryMap[lang] || summaryMap['en'])[grade]

  // Recommendations
  const recs: Record<string, string[]> = {
    fr: [
      `Optimisez votre fiche Google Business Profile avec des descriptions détaillées en ${business.language === 'fr' ? 'français' : 'allemand et français'}`,
      `Créez du contenu structuré (FAQ, pages de services) que les IA peuvent lire et citer`,
      `Inscrivez-vous sur local.ch, search.ch et les annuaires professionnels suisses`,
      `Collectez et répondez à vos avis Google — les IA intègrent le sentiment des avis`,
      `Ajoutez des données structurées Schema.org à votre site web`,
      `Faites-vous citer dans la presse locale et les associations professionnelles cantonales`,
    ],
    en: [
      `Optimize your Google Business Profile with detailed descriptions in multiple languages`,
      `Create structured content (FAQ pages, service pages) that AI can read and cite`,
      `Register on local.ch, search.ch and Swiss professional directories`,
      `Collect and respond to Google reviews — AI incorporates review sentiment`,
      `Add Schema.org structured data markup to your website`,
      `Get cited in local press and cantonal professional associations`,
    ]
  }

  const topRecommendations = (recs[lang] || recs['en']).slice(0, 4)

  // Deduplicate platform results for display (merge same platform)
  const dedupedPlatforms = deduplicatePlatforms(platformResults)

  return {
    businessName: business.businessName,
    city: business.city,
    category: business.category,
    overallScore,
    grade,
    platformResults: dedupedPlatforms,
    summary,
    topRecommendations,
    shareOfVoice,
    createdAt: new Date().toISOString()
  }
}

function deduplicatePlatforms(results: PlatformResult[]): PlatformResult[] {
  const map = new Map<string, PlatformResult>()
  for (const r of results) {
    const key = r.platform.replace(/_\d+$/, '')
    const existing = map.get(key)
    if (!existing || r.score > existing.score) {
      map.set(key, { ...r, platform: key })
    }
  }
  return Array.from(map.values())
}
