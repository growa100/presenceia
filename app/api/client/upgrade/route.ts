// Upgrade Site -> Visibilité IA from the client space (lib/upgrade.ts).
//   GET  /api/client/upgrade              -> quote: what is paid today, card on file
//   POST /api/client/upgrade {prorationDate} -> { ok, paid } | { needsCard, url } (Stripe page to add a card)
import { after, NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/checker-auth'
import { baseUrl } from '@/lib/links'
import { afterUpgrade, cardSession, quote, upgrade, UpgradeError } from '@/lib/upgrade'

export const dynamic = 'force-dynamic'
export const maxDuration = 300  // the first AI measurement runs after the response

const known = (e: unknown) => e instanceof UpgradeError ? e.message : null

export async function GET(req: NextRequest) {
  const email = getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    return NextResponse.json(await quote(email), { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    const k = known(e)
    if (!k) console.error('[upgrade] quote', e)
    return NextResponse.json({ error: k || 'failed' }, { status: k ? 409 : 502 })
  }
}

export async function POST(req: NextRequest) {
  const email = getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({})) as { prorationDate?: number; card?: boolean }
  const base = baseUrl(req)
  try {
    if (b.card) return NextResponse.json({ needsCard: true, url: await cardSession(email, base) })
    const r = await upgrade(email, Number(b.prorationDate) || undefined)
    if (!r.ok) return NextResponse.json({ needsCard: true, reason: r.reason, url: await cardSession(email, base) })
    const { later } = await afterUpgrade(r.ctx!, r.paid, base)
    after(later)
    return NextResponse.json({ ok: true, paid: r.paid })
  } catch (e) {
    const k = known(e)
    if (!k) console.error('[upgrade] apply', e)
    return NextResponse.json({ error: k || 'failed' }, { status: k ? 409 : 502 })
  }
}
