// Name normalisation and deterministic mention detection.
// Goal: "Garage Dupont Sàrl" must match "garage dupont", "Dupont SA", "GARAGE DUPONT".

const LEGAL_FORMS = new Set([
  'sarl', 'sa', 'gmbh', 'ag', 'sagl', 'snc', 'sas', 'ltd', 'llc', 'inc', 'cie', 'co', 'kg', 'eg',
])

// Words that describe the trade, not the business. They are kept for the full-phrase match
// but ignored when we look for the distinctive part of the name.
const GENERIC_WORDS = new Set([
  'le', 'la', 'les', 'l', 'de', 'du', 'des', 'd', 'et', 'en', 'au', 'aux', 'chez',
  'the', 'and', 'of', 'und', 'der', 'die', 'das', 'von', 'zum', 'zur', 'im', 'di', 'del', 'della', 'e',
  'garage', 'carrosserie', 'restaurant', 'hotel', 'cafe', 'bar', 'boulangerie', 'boucherie',
  'cabinet', 'atelier', 'bureau', 'agence', 'studio', 'centre', 'center', 'institut', 'clinique',
  'plomberie', 'sanitaire', 'electricite', 'electricien', 'plombier', 'menuiserie', 'peinture',
  'fiduciaire', 'immobilier', 'immobiliere', 'architecture', 'architecte', 'avocat', 'avocats', 'etude',
  'dentaire', 'medical', 'services', 'service', 'group', 'groupe', 'swiss', 'suisse', 'schweiz',
  'praxis', 'kanzlei', 'treuhand', 'elektro', 'sanitar',
])

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, ' ')
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function normalizeName(name: string): string {
  return normalize(name)
    .split(' ')
    .filter(w => !LEGAL_FORMS.has(w))
    .join(' ')
}

export function distinctiveTokens(name: string): string[] {
  return normalizeName(name)
    .split(' ')
    .filter(w => w.length >= 3 && !GENERIC_WORDS.has(w))
}

export interface MentionMatch {
  mentioned: boolean
  matchedText: string | null  // the original line where it matched
  position: number | null     // 1-based rank in a list, estimated
}

// Split an answer into lines/sentences, keep the original text for evidence.
function segments(text: string): string[] {
  return text
    .split(/\n+|(?<=[a-zà-ÿ)\]*][.!?])\s+(?=[A-ZÀ-Ý*#])/)
    .map(s => s.trim())
    .filter(Boolean)
}

function isListItem(line: string): boolean {
  return /^\s*(?:\d+[.)]|[-*•]|#{1,4})\s+/.test(line)
}

export function findMention(businessName: string, answer: string): MentionMatch {
  const full = normalizeName(businessName)
  const tokens = distinctiveTokens(businessName)
  const segs = segments(answer)
  let listIndex = 0

  for (const seg of segs) {
    const n = ` ${normalize(seg)} `
    const num = seg.match(/^\s*(\d+)[.)]\s+/)
    if (num) listIndex = Number(num[1])
    else if (isListItem(seg)) listIndex++
    const fullHit = full.length >= 3 && n.includes(` ${full} `)
    const tokenHit = tokens.length > 0 && tokens.every(t => n.includes(` ${t} `))
    if (fullHit || tokenHit) {
      return { mentioned: true, matchedText: seg.slice(0, 300), position: Math.max(1, listIndex) }
    }
  }
  return { mentioned: false, matchedText: null, position: null }
}

// Used to check that a quote returned by the analyst model really exists in the answer.
export function quoteExists(quote: string, answer: string): boolean {
  const q = normalize(quote)
  return q.length >= 3 && normalize(answer).includes(q)
}
