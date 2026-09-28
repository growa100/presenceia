// Sites prepared for prospects (generated and hosted on the droplet, <slug>.presenceia.com).
// The offer page of such a site sends the prospect to /api/stripe/checkout with the site signed
// by the droplet (same shared key as the cockpit). After payment the droplet is told to hand the
// site over (banner off, follow-ups stopped); the client then picks a domain in the client space.
import crypto from 'crypto'
import { COCKPIT_API_KEY, cockpitFetch } from './cockpit'
import type { Currency } from './stripe'

export type SiteLink = { slug: string; business: string; currency: Currency }

/** Checks the signature added by the droplet (GET /api/presenceia/checkout). Valid 6 hours. */
export function verifySiteLink(q: URLSearchParams): SiteLink | null {
  const slug = q.get('site') || '', biz = q.get('biz') || '', cur = q.get('cur') || 'chf', ts = Number(q.get('ts') || 0), sig = q.get('sig') || ''
  if (!slug || !COCKPIT_API_KEY || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug) || (cur !== 'chf' && cur !== 'eur')) return null
  if (!ts || Math.abs(Date.now() / 1000 - ts) > 6 * 3600) return null
  const good = crypto.createHmac('sha256', COCKPIT_API_KEY).update(`site:${slug}:${biz}:${cur}:${ts}`).digest('hex')
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null
  return { slug, business: biz, currency: cur }
}

export const siteUrl = (slug: string) => `https://${slug}.presenceia.com`

/** Hand the site over to the client. Idempotent on the droplet (called by the webhook and the success page). */
export async function claimSite(o: {
  slug: string; email: string; plan: string | null; term: string | null; business: string | null; phone?: string | null
  currency?: string | null; customer?: string | null; subscription?: string | null; livemode: boolean
}): Promise<boolean> {
  try {
    const { status, body } = await cockpitFetch('sites/claim', {
      method: 'POST',
      body: JSON.stringify({
        slug: o.slug, email: o.email, plan: o.plan, term: o.term, business: o.business, phone: o.phone || null,
        currency: o.currency || 'chf', stripe_customer_id: o.customer || null, stripe_subscription_id: o.subscription || null,
        livemode: o.livemode,
      }),
    })
    if (status >= 300) console.error('[sites] claim failed', status, body)
    return status < 300
  } catch (e) {
    console.error('[sites] claim error', e)
    return false
  }
}

export async function cancelSite(slug: string): Promise<void> {
  try { await cockpitFetch(`sites/${slug}/cancel`, { method: 'POST' }) } catch (e) { console.error('[sites] cancel error', e) }
}
