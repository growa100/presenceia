// The signed-in client's site(s) prepared by Présence IA, and the steps after payment:
// domain (own / new / later) and legal details. The site lives on the droplet; this route
// proves who the client is and passes the email along (the droplet checks ownership).
//   GET  /api/client/site                                   -> { items: SiteStatus[] }
//   POST /api/client/site  { action: 'check', slug, domain } -> DNS of a domain before choosing it
//   POST /api/client/site  { action: 'suggest', slug, q? }  -> new domain ideas with availability
//   POST /api/client/site  { action: 'domain', slug, mode, domain? }
//   POST /api/client/site  { action: 'legal', slug, legal }
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/checker-auth'
import { cockpitFetch } from '@/lib/cockpit'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const SLUG = /^[a-z0-9][a-z0-9-]{0,80}$/

export async function GET(req: NextRequest) {
  const email = getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const { status, body } = await cockpitFetch(`sites/by-email?email=${encodeURIComponent(email)}`)
    return NextResponse.json(status < 300 ? body : { items: [] }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ items: [], unavailable: true })
  }
}

export async function POST(req: NextRequest) {
  const email = getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  type Body = { action?: string; slug?: string; domain?: string; q?: string; mode?: string; legal?: Record<string, unknown> }
  let b: Body
  try { b = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }
  const slug = String(b?.slug || '')
  if (!SLUG.test(slug)) return NextResponse.json({ error: 'bad_slug' }, { status: 400 })
  const e = encodeURIComponent(email)
  try {
    let r: { status: number; body: { domain?: string; detail?: unknown } | null }
    switch (b.action) {
      case 'check':
        r = await cockpitFetch(`sites/${slug}/domain-check?email=${e}&domain=${encodeURIComponent(String(b.domain || '').slice(0, 253))}`)
        break
      case 'suggest':
        r = await cockpitFetch(`sites/${slug}/domain-suggest?email=${e}${b.q ? `&q=${encodeURIComponent(String(b.q).slice(0, 120))}` : ''}`)
        break
      case 'domain':
        r = await cockpitFetch(`sites/${slug}/domain`, { method: 'POST', body: JSON.stringify({ email, mode: b.mode, domain: b.domain || null }) })
        if (r.status < 300 && b.mode !== 'later') {
          await supabaseAdmin.from('client_updates').insert({
            email, kind: 'site', title: b.mode === 'new' ? 'domain_ordered' : 'domain_chosen', body: r.body?.domain || b.domain || null,
          })
        }
        break
      case 'legal':
        r = await cockpitFetch(`sites/${slug}/legal`, { method: 'POST', body: JSON.stringify({ email, legal: b.legal || {} }) })
        break
      default:
        return NextResponse.json({ error: 'bad_action' }, { status: 400 })
    }
    const detail = typeof r.body?.detail === 'string' ? r.body.detail : null
    return NextResponse.json(r.status < 300 ? r.body : { error: detail || 'failed' }, { status: r.status })
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 502 })
  }
}
