/* eslint-disable @typescript-eslint/no-explicit-any */
// One call to a strong model that reads the raw answers and returns structured facts
// plus a short diagnosis. It never rewrites the answers: those stay stored verbatim.
import type { GeoAnswer } from './platforms'
import { estimateCost } from './platforms'

export interface AnalystAnswer {
  id: string
  mentioned: boolean
  rank: number | null
  sentiment: 'positive' | 'neutral' | 'negative' | 'not_found'
  quote: string | null
}

export interface AnalystResult {
  answers: AnalystAnswer[]
  competitors: { name: string; count: number }[]
  diagnosis: string
  actions: string[]
  model: string
  costUsd: number
}

// Haiku since 2026-09-26 (cost); Sonnet 5 wrote slightly richer diagnoses at twice the price.
const ANALYST_MODEL = process.env.GEO_ANALYST_MODEL || 'claude-haiku-4-5'
const FALLBACK_MODEL = ANALYST_MODEL === 'claude-haiku-4-5' ? 'claude-sonnet-5' : 'claude-haiku-4-5'

const LANG_NAME: Record<string, string> = { fr: 'French', de: 'German', en: 'English', it: 'Italian' }

const TOOL = {
  name: 'report',
  description: 'Structured analysis of AI assistant answers for one business.',
  input_schema: {
    type: 'object',
    properties: {
      answers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            mentioned: { type: 'boolean', description: 'True only if the answer names this exact business (spelling variants and legal forms allowed).' },
            rank: { type: ['integer', 'null'], description: 'Position among the businesses recommended in that answer, 1 = first. Null if not mentioned.' },
            sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'not_found'] },
            quote: { type: ['string', 'null'], description: 'Exact substring of the answer where the business is named, max 200 chars. Null if not mentioned.' },
          },
          required: ['id', 'mentioned', 'rank', 'sentiment', 'quote'],
        },
      },
      competitors: {
        type: 'array',
        description: 'Other businesses of the same trade named in the answers, most frequent first, max 8.',
        items: {
          type: 'object',
          properties: { name: { type: 'string' }, count: { type: 'integer', description: 'Number of answers naming it.' } },
          required: ['name', 'count'],
        },
      },
      diagnosis: { type: 'string', description: '3 to 5 short factual sentences.' },
      actions: { type: 'array', items: { type: 'string' }, description: 'Exactly 3 prioritised actions, one sentence each.' },
    },
    required: ['answers', 'competitors', 'diagnosis', 'actions'],
  },
}

function noEmDash(s: string): string {
  return s.replace(/\s*—\s*/g, ', ').replace(/\s+–\s+/g, ', ')
}

export async function analyseAnswers(
  business: { businessName: string; city: string; category: string; language: string },
  answers: GeoAnswer[],
): Promise<AnalystResult | null> {
  const usable = answers.filter(a => a.text)
  if (!usable.length || !process.env.ANTHROPIC_API_KEY) return null

  const lang = LANG_NAME[business.language] || 'French'
  const block = usable.map(a =>
    `<answer id="${a.id}" assistant="${a.platformLabel}" question="${a.query.replace(/"/g, "'")}">\n${a.text.slice(0, 2500)}\n` +
    (a.sources.length ? `Sources cited: ${a.sources.slice(0, 8).map(s => s.title || s.url).join(' | ')}\n` : '') +
    `</answer>`).join('\n\n')

  const prompt = `You analyse how AI assistants answer a local customer's question in Switzerland.

Business checked: "${business.businessName}", trade: ${business.category}, city: ${business.city}.

Below are the real answers, verbatim, from AI assistants with web search enabled.

${block}

Fill the report tool. Rules:
- Base everything strictly on these answers and their sources. Never invent a fact, a review, a ranking or a business.
- "mentioned" is true only if the answer clearly names this business. A similar but different business is not a mention.
- "quote" must be copied exactly from the answer text.
- Competitors: businesses named in the answers other than the one checked, with how many answers name each.
- Diagnosis in ${lang}, 3 to 5 short sentences, addressed to the owner ("vous" in French, "Sie" in German): how many of the ${usable.length} answers name the business, which competitors the assistants recommend instead, and which kinds of sources the assistants rely on (directories, review sites, press, own websites), based on the sources cited.
- Actions in ${lang}: exactly 3, concrete, ordered by impact, specific to what these answers and sources show (for example which directory or review platform to be present on). No generic marketing advice.
- You do not know the business's current website, listings or reviews. Never state that it is absent from a directory, has no website or has few reviews; phrase actions as checks or steps ("assurez-vous d'être présent sur local.ch").
- Write flawless ${lang} with every accent and umlaut (é, è, à, ç, ä, ö, ü). Text without accents is unacceptable.
- Plain, sober tone. Never use the em dash character. No exclamation marks.`

  for (const model of [ANALYST_MODEL, FALLBACK_MODEL]) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          tools: [TOOL],
          tool_choice: { type: 'tool', name: 'report' },
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(Number(process.env.GEO_ANALYST_TIMEOUT_MS || 30000)),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
      const data = await res.json()
      const raw = (data.content || []).find((b: any) => b.type === 'tool_use')?.input
      if (!raw) throw new Error('no tool_use block')
      // Some models return array fields as JSON strings: normalise before use.
      const input: any = { ...raw }
      for (const k of ['answers', 'competitors', 'actions']) {
        if (typeof input[k] === 'string') { try { input[k] = JSON.parse(input[k]) } catch { input[k] = [] } }
        if (!Array.isArray(input[k])) input[k] = []
      }
      return {
        answers: (input.answers || []).map((a: any) => ({
          id: String(a.id), mentioned: !!a.mentioned, rank: typeof a.rank === 'number' ? a.rank : null,
          sentiment: a.sentiment || (a.mentioned ? 'neutral' : 'not_found'), quote: a.quote || null,
        })),
        competitors: (input.competitors || []).slice(0, 8).map((c: any) => ({ name: noEmDash(String(c.name)), count: Number(c.count) || 1 })),
        diagnosis: noEmDash(String(input.diagnosis || '')),
        actions: (input.actions || []).slice(0, 3).map((s: any) => noEmDash(String(s))),
        model: data.model || model,
        costUsd: estimateCost(model, data.usage?.input_tokens || 0, data.usage?.output_tokens || 0, 0),
      }
    } catch (e) {
      console.error(`[geo] analyst ${model} failed:`, e)
    }
  }
  return null
}
