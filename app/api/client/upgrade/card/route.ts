// Back from the Stripe page where the client added a card for the upgrade: that card becomes the
// subscription's, then the upgrade runs (lib/upgrade.ts) and the client space opens on the result.
import { after, NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/checker-auth'
import { baseUrl } from '@/lib/links'
import { afterUpgrade, upgrade, adoptCardFrom } from '@/lib/upgrade'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const base = baseUrl(req)
  const email = getSessionEmail(req)
  const sessionId = req.nextUrl.searchParams.get('session_id') || ''
  const to = (q: string) => NextResponse.redirect(new URL(`/espace-client?${q}`, base), 303)
  if (!email) return to('lien=expire')
  try {
    await adoptCardFrom(email, sessionId)
    const r = await upgrade(email)
    if (!r.ok) return to(`upgrade=failed&reason=${encodeURIComponent(r.reason)}`)
    const { later } = await afterUpgrade(r.ctx!, r.paid, base)
    after(later)
    return to('upgraded=visibility')
  } catch (e) {
    console.error('[upgrade] card return', e)
    return to('upgrade=failed')
  }
}
