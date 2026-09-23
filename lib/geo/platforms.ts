/* eslint-disable @typescript-eslint/no-explicit-any */
// Grounded (web-search enabled) queries to the AI assistants people actually use.
// Every answer is stored exactly as returned: text, cited sources, model, cost.

export type PlatformId = 'chatgpt' | 'claude' | 'gemini' | 'grok' | 'perplexity'

export interface GeoSource { url: string; title?: string }

export interface GeoAnswer {
  id: string
  platform: PlatformId
  platformLabel: string
  model: string
  query: string
  text: string
  sources: GeoSource[]
  searches: number
  latencyMs: number
  costUsd: number
  error?: string
}

export const MODELS = {
  chatgpt: process.env.GEO_OPENAI_MODEL || 'gpt-5.6-luna',
  claude: process.env.GEO_CLAUDE_MODEL || 'claude-haiku-4-5',
  gemini: process.env.GEO_GEMINI_MODEL || 'gemini-3.5-flash-lite',
  grok: process.env.GEO_GROK_MODEL || 'grok-4.3',
  perplexity: process.env.GEO_PERPLEXITY_MODEL || 'sonar',
}

export const PLATFORM_LABELS: Record<PlatformId, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  grok: 'Grok',
  perplexity: 'Perplexity',
}

export function platformEnabled(p: PlatformId): boolean {
  const key = {
    chatgpt: 'OPENAI_API_KEY', claude: 'ANTHROPIC_API_KEY', gemini: 'GEMINI_API_KEY',
    grok: 'XAI_API_KEY', perplexity: 'PERPLEXITY_API_KEY',
  }[p]
  return !!process.env[key] && process.env[`GEO_DISABLE_${p.toUpperCase()}`] !== '1'
}

// USD per 1M tokens (input, output) and per search/request. Conservative list prices, Sept 2026.
const PRICES: { prefix: string; in: number; out: number; perSearch: number; perRequest?: number }[] = [
  { prefix: 'gpt-5.6-luna', in: 0.20, out: 1.20, perSearch: 0.01 },
  { prefix: 'gpt-5.6-terra', in: 1.00, out: 6.00, perSearch: 0.01 },
  { prefix: 'claude-haiku', in: 1, out: 5, perSearch: 0.01 },
  { prefix: 'claude-sonnet', in: 2, out: 10, perSearch: 0.01 },
  { prefix: 'claude-opus', in: 5, out: 25, perSearch: 0.01 },
  { prefix: 'gemini-3.5-flash-lite', in: 0.30, out: 2.50, perSearch: 0.014 },
  { prefix: 'gemini-3.1-flash-lite', in: 0.25, out: 1.50, perSearch: 0.014 },
  { prefix: 'gemini', in: 1.50, out: 9.00, perSearch: 0.014 },
  { prefix: 'grok-4.3', in: 1.25, out: 2.50, perSearch: 0.005 },
  { prefix: 'grok', in: 2, out: 6, perSearch: 0.005 },
  { prefix: 'sonar-pro', in: 3, out: 15, perSearch: 0, perRequest: 0.006 },
  { prefix: 'sonar', in: 1, out: 1, perSearch: 0, perRequest: 0.005 },
]

export function estimateCost(model: string, inTok: number, outTok: number, searches: number): number {
  const p = PRICES.find(x => model.startsWith(x.prefix))
  if (!p) return 0
  return (inTok * p.in + outTok * p.out) / 1e6 + searches * p.perSearch + (p.perRequest || 0)
}

const TIMEOUT_MS = Number(process.env.GEO_PLATFORM_TIMEOUT_MS || 40000)

function dedupeSources(list: GeoSource[]): GeoSource[] {
  const seen = new Set<string>()
  return list.filter(s => {
    if (!s.url || seen.has(s.url)) return false
    seen.add(s.url)
    return true
  }).slice(0, 12)
}

async function postJson(url: string, headers: Record<string, string>, body: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`)
  return JSON.parse(text)
}

// ─── OpenAI-style Responses API (OpenAI and xAI share the format) ────────────
function parseResponsesApi(data: any): { text: string; sources: GeoSource[]; searches: number } {
  let text = ''
  const sources: GeoSource[] = []
  let searches = 0
  for (const item of data.output || []) {
    if (item.type === 'web_search_call') searches++
    if (item.type === 'message') {
      for (const c of item.content || []) {
        if (c.type === 'output_text') {
          text += (text ? '\n' : '') + (c.text || '')
          for (const a of c.annotations || []) {
            if (a.url) sources.push({ url: a.url, title: a.title })
          }
        }
      }
    }
  }
  for (const u of data.citations || []) {
    if (typeof u === 'string') sources.push({ url: u })
    else if (u?.url) sources.push({ url: u.url, title: u.title })
  }
  return { text: text || data.output_text || '', sources, searches }
}

async function askChatGPT(query: string, city: string) {
  const model = MODELS.chatgpt
  const data = await postJson('https://api.openai.com/v1/responses',
    { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    {
      model,
      input: query,
      tools: [{
        type: 'web_search',
        search_context_size: 'low',
        user_location: { type: 'approximate', country: 'CH', city },
      }],
      max_output_tokens: 2000,
    })
  const p = parseResponsesApi(data)
  return { ...p, model: data.model || model, costUsd: estimateCost(model, data.usage?.input_tokens || 0, data.usage?.output_tokens || 0, Math.max(1, p.searches)) }
}

async function askGrok(query: string) {
  const model = MODELS.grok
  const data = await postJson('https://api.x.ai/v1/responses',
    { Authorization: `Bearer ${process.env.XAI_API_KEY}` },
    { model, input: [{ role: 'user', content: query }], tools: [{ type: 'web_search' }], max_output_tokens: 2000 })
  const p = parseResponsesApi(data)
  const searches = data.usage?.server_side_tool_usage_details?.web_search_calls ?? p.searches
  return { ...p, searches, model: data.model || model, costUsd: estimateCost(model, data.usage?.input_tokens || 0, data.usage?.output_tokens || 0, Math.max(1, searches)) }
}

async function askClaude(query: string, city: string) {
  const model = MODELS.claude
  const data = await postJson('https://api.anthropic.com/v1/messages',
    { 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
    {
      model,
      max_tokens: 1500,
      messages: [{ role: 'user', content: query }],
      tools: [{
        type: 'web_search_20250305', name: 'web_search', max_uses: 2,
        user_location: { type: 'approximate', country: 'CH', city },
      }],
    })
  const blocks: any[] = data.content || []
  const lastResultIdx = blocks.map(b => b.type).lastIndexOf('web_search_tool_result')
  const answerBlocks = blocks.slice(lastResultIdx + 1).filter(b => b.type === 'text')
  const text = (answerBlocks.length ? answerBlocks : blocks.filter(b => b.type === 'text')).map(b => b.text).join('')
  const sources: GeoSource[] = []
  for (const b of blocks) {
    for (const c of b.citations || []) if (c.url) sources.push({ url: c.url, title: c.title })
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content) if (r.url) sources.push({ url: r.url, title: r.title })
    }
  }
  const searches = data.usage?.server_tool_use?.web_search_requests || 0
  return { text, sources, searches, model: data.model || model, costUsd: estimateCost(model, data.usage?.input_tokens || 0, data.usage?.output_tokens || 0, searches) }
}

async function askGemini(query: string) {
  const model = MODELS.gemini
  const data = await postJson(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
    { contents: [{ role: 'user', parts: [{ text: query }] }], tools: [{ google_search: {} }] })
  const cand = data.candidates?.[0]
  const text = (cand?.content?.parts || []).filter((p: any) => p.text && !p.thought).map((p: any) => p.text).join('')
  const gm = cand?.groundingMetadata || {}
  const sources: GeoSource[] = (gm.groundingChunks || []).map((c: any) => ({ url: c.web?.uri, title: c.web?.title }))
  const searches = gm.webSearchQueries?.length ? 1 : 0 // billed per grounded request, not per query
  const u = data.usageMetadata || {}
  const outTok = (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0)
  return { text, sources, searches, model: data.modelVersion || model, costUsd: estimateCost(model, u.promptTokenCount || 0, outTok, searches) }
}

async function askPerplexity(query: string) {
  const model = MODELS.perplexity
  const data = await postJson('https://api.perplexity.ai/chat/completions',
    { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}` },
    {
      model,
      messages: [{ role: 'user', content: query }],
      web_search_options: { search_context_size: 'low', user_location: { country: 'CH' } },
    })
  const text = data.choices?.[0]?.message?.content || ''
  const sources: GeoSource[] = [
    ...(data.search_results || []).map((r: any) => ({ url: r.url, title: r.title })),
    ...(data.citations || []).map((u: string) => ({ url: u })),
  ]
  const reported = data.usage?.cost?.total_cost
  const cost = typeof reported === 'number' ? reported
    : estimateCost(model, data.usage?.prompt_tokens || 0, data.usage?.completion_tokens || 0, 0)
  return { text, sources, searches: 1, model: data.model || model, costUsd: cost }
}

const ASK: Record<PlatformId, (q: string, city: string) => Promise<{ text: string; sources: GeoSource[]; searches: number; model: string; costUsd: number }>> = {
  chatgpt: askChatGPT, claude: askClaude, gemini: askGemini, grok: askGrok, perplexity: askPerplexity,
}

export async function askPlatform(id: string, platform: PlatformId, query: string, city: string): Promise<GeoAnswer> {
  const t0 = Date.now()
  const base = { id, platform, platformLabel: PLATFORM_LABELS[platform], query }
  try {
    const r = await ASK[platform](query, city)
    return {
      ...base, model: r.model, text: r.text.trim(), sources: dedupeSources(r.sources),
      searches: r.searches, latencyMs: Date.now() - t0, costUsd: r.costUsd,
      ...(r.text.trim() ? {} : { error: 'empty answer' }),
    }
  } catch (e) {
    console.error(`[geo] ${platform} failed:`, e)
    return {
      ...base, model: MODELS[platform], text: '', sources: [], searches: 0,
      latencyMs: Date.now() - t0, costUsd: 0, error: e instanceof Error ? e.message.slice(0, 200) : 'error',
    }
  }
}
