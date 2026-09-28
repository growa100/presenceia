// Founder marker for visit tracking. The cockpit layout calls this once per load:
// it sets a cookie on .presenceia.com (sent to every generated site, logged by nginx)
// and returns a signed pixel URL on api.presenceia.com that records the founder's
// IPv4 (the sites are IPv4-only). Both keep his own previews out of the prospect
// visit counts (backend: app/services/presenceia_visits.py).
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { COCKPIT_API_KEY, COCKPIT_API_URL, requireAdmin } from '@/lib/cockpit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!COCKPIT_API_KEY) return NextResponse.json({ url: null })
  const ts = Math.floor(Date.now() / 1000)
  const sig = crypto.createHmac('sha256', COCKPIT_API_KEY).update(`mark:${ts}`).digest('hex')
  const res = NextResponse.json({ url: `${COCKPIT_API_URL}/api/presenceia/admin/mark?ts=${ts}&sig=${sig}` })
  if (req.nextUrl.hostname.endsWith('presenceia.com')) {
    res.cookies.set('pia_admin', '1', {
      domain: '.presenceia.com', path: '/', maxAge: 365 * 86400, secure: true, httpOnly: true, sameSite: 'lax',
    })
  }
  return res
}
