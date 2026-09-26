import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { runVisibilityCheck, BusinessInput, ENGINE_VERSION } from '@/lib/scoring-engine'
import { normalize, normalizeName } from '@/lib/geo/match'
import { supabaseAdmin } from '@/lib/supabase'
import { clientIp, freeChecksLeft, getSessionEmail, isUnlimited } from '@/lib/checker-auth'

// Grounded answers take 10 to 30 s; they run in parallel, then one analysis call.
export const maxDuration = 90

const RATE_LIMIT = Number(process.env.GEO_RATE_LIMIT || 3)      // fresh checks per IP per 24 h (several emails, same machine)
const DAILY_CAP = Number(process.env.GEO_DAILY_CAP || 200)      // fresh checks per 24 h, all visitors (about USD 9 max)
const CACHE_HOURS = Number(process.env.GEO_CACHE_HOURS || 168)  // AI answers move slowly; a week keeps repeat checks free
const LANGS = new Set(['fr', 'de', 'en', 'it'])

function hashIp(ip: string): string {
  return createHash('sha256').update(`${ip}|${process.env.IP_HASH_SALT || 'presenceia'}`).digest('hex').slice(0, 20)
}

export async function POST(req: NextRequest) {
  // Only visitors who passed the human check and confirmed their email (see /api/check/start and /verify).
  const sessionEmail = getSessionEmail(req)
  if (!sessionEmail) return NextResponse.json({ error: 'login_required' }, { status: 401 })
  const unlimited = isUnlimited(sessionEmail)
  const ip = clientIp(req)
  const ipHash = hashIp(ip)

  let body: Partial<BusinessInput> & { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const businessName = String(body.businessName || '').trim().slice(0, 120)
  const city = String(body.city || '').trim().slice(0, 80)
  const category = String(body.category || '').trim().slice(0, 60)
  const language = (LANGS.has(String(body.language)) ? body.language : 'fr') as BusinessInput['language']
  const email = sessionEmail

  if (businessName.length < 2 || city.length < 2 || category.length < 2) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Cache (7 days by default) on the normalised name, so "Garage Dupont Sàrl" and "garage dupont" share it.
  const cacheKey = `v${ENGINE_VERSION}_${normalizeName(businessName)}_${normalize(city)}_${normalize(category)}_${language}`
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const cacheSince = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString()
  const { data: cached } = await supabaseAdmin
    .from('visibility_checks')
    .select('result')
    .eq('cache_key', cacheKey)
    .gte('created_at', cacheSince)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (cached?.result) {
    if (email) await saveLead(email, businessName, city, category, language, cached.result)
    return NextResponse.json({ ...cached.result, cached: true })
  }

  // Limits on fresh (paid) checks, counted in the database so they survive serverless cold starts:
  // 1 per email per 24 h, a few per IP per 24 h, and a global daily cap on the API budget.
  if (!unlimited) {
    const [left, { count: ipCount }, { count: dayCount }] = await Promise.all([
      freeChecksLeft(sessionEmail),
      supabaseAdmin.from('visibility_checks').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since24h),
      supabaseAdmin.from('visibility_checks').select('id', { count: 'exact', head: true }).gte('created_at', since24h),
    ])
    if (left <= 0) return NextResponse.json({ error: 'daily_limit' }, { status: 429 })
    if ((ipCount || 0) >= RATE_LIMIT) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    if ((dayCount || 0) >= DAILY_CAP) return NextResponse.json({ error: 'busy' }, { status: 429 })
  }

  let result
  try {
    result = await runVisibilityCheck({ businessName, city, category, language })
  } catch (e) {
    console.error('[check] failed:', e)
    return NextResponse.json({ error: 'analysis_failed' }, { status: 502 })
  }

  await supabaseAdmin.from('visibility_checks').insert({
    cache_key: cacheKey,
    business_name: businessName,
    city,
    category,
    language,
    email: email || null,
    overall_score: result.overallScore,
    grade: result.grade,
    result,
    ip_hash: ipHash,
  })

  if (email) await saveLead(email, businessName, city, category, language, result)

  return NextResponse.json(result)
}

async function saveLead(email: string, businessName: string, city: string, category: string, language: string, result: { overallScore: number; grade: string }) {
  await supabaseAdmin.from('leads').upsert({
    email,
    business_name: businessName,
    city,
    category,
    score: result.overallScore,
    grade: result.grade,
    language,
    source: 'visibility_checker',
  }, { onConflict: 'email' })
}
