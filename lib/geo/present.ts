// Display helpers shared by the results panel and the report email.
// They only strip formatting (markdown, citation markers, tracking parameters):
// the words of each AI answer are never changed.
import type { GeoSource } from './platforms'

export function cleanAnswer(text: string): string {
  return (text || '')
    .replace(/\(\[([^\]]+)\]\((https?:[^)]+)\)\)/g, '($1)')      // ([suncar.ch](https://...)) -> (suncar.ch)
    .replace(/\[\[(\d+)\]\]\([^)]+\)/g, '')                        // [[1]](https://...) Grok citations
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '$1')              // [text](url) -> text
    .replace(/\[(\d+)\](\[\d+\])*/g, '')                           // [1][7] Perplexity markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, '$1$2')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[*•]\s+/gm, '- ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const AGGREGATORS = /vertexaisearch|googleusercontent|google\.com\/url|grounding-api/

export function domainOf(s: GeoSource): string | null {
  try {
    const host = new URL(s.url).hostname.replace(/^www\./, '')
    if (AGGREGATORS.test(s.url)) {
      // Gemini gives redirect links; its title is the real domain.
      const t = (s.title || '').trim().toLowerCase().replace(/^www\./, '')
      return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(t) ? t : null
    }
    return host
  } catch {
    return null
  }
}

/** Websites the assistants relied on, with how many answers cited each. */
export function aggregateSources(answers: { sources?: GeoSource[] }[], max = 8): { domain: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const a of answers) {
    const seen = new Set<string>()
    for (const s of a.sources || []) {
      const d = domainOf(s)
      if (d && !seen.has(d)) { seen.add(d); counts.set(d, (counts.get(d) || 0) + 1) }
    }
  }
  return [...counts.entries()].map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain)).slice(0, max)
}

export function answerDomains(sources: GeoSource[] | undefined, max = 4): string[] {
  const out: string[] = []
  for (const s of sources || []) {
    const d = domainOf(s)
    if (d && !out.includes(d)) out.push(d)
    if (out.length >= max) break
  }
  return out
}
