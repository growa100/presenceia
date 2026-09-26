// Stripe customer portal: invoices, payment method, cancellation. Signed-in clients only.
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/checker-auth'
import { portalConfiguration, stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { baseUrl } from '@/lib/links'

export async function POST(req: NextRequest) {
  const email = getSessionEmail(req)
  if (!email) return NextResponse.json({ error: 'login_required' }, { status: 401 })
  if (!stripe) return NextResponse.json({ error: 'payments_unavailable' }, { status: 503 })
  const { data: lead } = await supabaseAdmin.from('leads').select('stripe_customer_id').eq('email', email).maybeSingle()
  if (!lead?.stripe_customer_id) return NextResponse.json({ error: 'no_billing' }, { status: 404 })
  const base = baseUrl(req)
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: lead.stripe_customer_id,
      return_url: `${base}/espace-client`,
      configuration: await portalConfiguration(base),
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('[stripe] portal failed', e)
    return NextResponse.json({ error: 'portal_failed' }, { status: 502 })
  }
}
