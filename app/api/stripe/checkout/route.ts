// Starts a Stripe Checkout: GEO Boost (one-time) or a monthly plan. No account needed: Stripe
// collects the email, and the success page opens the client space for it.
// POST {plan, language} from the site; GET ?plan=boost&lang=fr from emails (redirects to Stripe).
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/checker-auth'
import { isPlanKey, PLANS, type PlanKey } from '@/lib/plans'
import { priceFor, stripe } from '@/lib/stripe'
import { baseUrl } from '@/lib/links'
import { supabaseAdmin } from '@/lib/supabase'

const LABEL = { fr: 'Nom de votre entreprise', de: 'Name Ihres Unternehmens', en: 'Your business name' }
type Lang = 'fr' | 'de' | 'en'

async function createSession(req: NextRequest, plan: PlanKey, lang: Lang): Promise<string> {
  if (!stripe) throw new Error('payments_unavailable')
  const base = baseUrl(req)
  // A signed-in client pays with the same customer (one billing history); otherwise prefill the email.
  const email = getSessionEmail(req)
  const { data: lead } = email
    ? await supabaseAdmin.from('leads').select('stripe_customer_id, business_name').eq('email', email).maybeSingle()
    : { data: null }
  const once = !!PLANS[plan].once
  const session = await stripe.checkout.sessions.create({
    mode: once ? 'payment' : 'subscription',
    line_items: [{ price: await priceFor(plan), quantity: 1 }],
    ...(lead?.stripe_customer_id ? { customer: lead.stripe_customer_id } : email ? { customer_email: email } : {}),
    ...(once && !lead?.stripe_customer_id ? { customer_creation: 'always' as const } : {}),
    ...(once ? { invoice_creation: { enabled: true }, payment_intent_data: { metadata: { plan } } } : { subscription_data: { metadata: { plan } } }),
    locale: lang,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    // Prices are in CHF on the site: charge CHF, no automatic conversion to the visitor's currency.
    adaptive_pricing: { enabled: false },
    custom_fields: [{
      key: 'business', type: 'text', label: { type: 'custom', custom: LABEL[lang] },
      ...(lead?.business_name ? { text: { default_value: lead.business_name.slice(0, 255) } } : {}),
    }],
    metadata: { plan, lang },
    success_url: `${base}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/${once ? 'espace-client' : '#pricing'}`,
  })
  if (!session.url) throw new Error('no_url')
  return session.url
}

const langOf = (v: unknown): Lang => (v === 'de' || v === 'en' ? v : 'fr')

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'payments_unavailable' }, { status: 503 })
  let body: { plan?: string; language?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }
  if (!isPlanKey(body.plan)) return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
  try {
    return NextResponse.json({ url: await createSession(req, body.plan, langOf(body.language)) })
  } catch (e) {
    console.error('[stripe] checkout failed', e)
    return NextResponse.json({ error: 'checkout_failed' }, { status: 502 })
  }
}

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get('plan')
  const fallback = new URL('/espace-client', req.url)
  if (!stripe || !isPlanKey(plan)) return NextResponse.redirect(fallback, 303)
  try {
    return NextResponse.redirect(await createSession(req, plan, langOf(req.nextUrl.searchParams.get('lang'))), 303)
  } catch (e) {
    console.error('[stripe] checkout (GET) failed', e)
    return NextResponse.redirect(fallback, 303)
  }
}
