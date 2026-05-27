import { NextRequest, NextResponse } from 'next/server'
import { runVisibilityCheck, BusinessInput } from '@/lib/scoring-engine'
import { supabaseAdmin } from '@/lib/supabase'

// Simple in-memory rate limiting
const requestLog = new Map<string, number[]>()
const RATE_LIMIT = 5 // per IP per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const reqs = (requestLog.get(ip) || []).filter(t => now - t < hour)
  requestLog.set(ip, reqs)
  if (reqs.length >= RATE_LIMIT) return true
  requestLog.set(ip, [...reqs, now])
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }

  let body: BusinessInput & { email?: string; lang?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { businessName, city, category, language, email } = body

  if (!businessName || !city || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check cache (24h)
  const cacheKey = `${businessName.toLowerCase()}_${city.toLowerCase()}_${category.toLowerCase()}_${language}`
  const { data: cached } = await supabaseAdmin
    .from('visibility_checks')
    .select('*')
    .eq('cache_key', cacheKey)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (cached) {
    return NextResponse.json({ ...cached.result, cached: true })
  }

  // Run the check
  const result = await runVisibilityCheck({ businessName, city, category, language })

  // Store in Supabase
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
    ip_hash: Buffer.from(ip).toString('base64').slice(0, 20)
  })

  // Store lead if email provided
  if (email) {
    await supabaseAdmin.from('leads').upsert({
      email,
      business_name: businessName,
      city,
      category,
      score: result.overallScore,
      grade: result.grade,
      language,
      source: 'visibility_checker'
    }, { onConflict: 'email' })
  }

  return NextResponse.json(result)
}
