// Back from Stripe Checkout: sync the subscription, sign the payer in, open the client space.
import { NextRequest, NextResponse, after } from 'next/server'
import { setSession } from '@/lib/checker-auth'
import { sendWelcome, syncCheckout } from '@/lib/billing'
import { baseUrl } from '@/lib/links'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('session_id') || ''
  const fail = NextResponse.redirect(new URL('/espace-client', req.url))
  if (!stripe || !/^cs_[A-Za-z0-9_]+$/.test(id)) return fail
  try {
    // Only fresh sessions sign in (the id is in the address bar and browser history).
    const s = await stripe.checkout.sessions.retrieve(id)
    if (s.status !== 'complete' || Date.now() / 1000 - s.created > 3 * 3600) return fail
    const r = await syncCheckout(id)
    if (!r) return fail
    // The webhook sends the welcome emails; without a webhook (local, preview), send them here.
    if (r.isNew && !process.env.STRIPE_WEBHOOK_SECRET) {
      const base = baseUrl(req)
      after(() => sendWelcome({ ...r, base }))
    }
    const res = NextResponse.redirect(new URL('/espace-client?bienvenue=1', req.url))
    setSession(res, r.email)
    return res
  } catch (e) {
    console.error('[stripe] success failed', e)
    return fail
  }
}
