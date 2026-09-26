// Starts a Stripe Checkout. Monthly plans come in three terms (lib/plans.ts):
//   m12  = monthly, 12-month commitment, set-up included
//   year = paid yearly (10 months), set-up included
//   flex = monthly, no commitment, + one-time set-up fee (Visibilité IA plans)
// The founder coupon (-30 % for 12 months, first 15 clients) is applied automatically while it lasts.
// POST {plan, term, language} from the site; GET ?plan=&term=&lang= from emails (redirects to Stripe).
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/checker-auth'
import { hasFounder, isPlanKey, isTerm, PLANS, type PlanKey, type Term } from '@/lib/plans'
import { founderCoupon, priceFor, setupPrice, stripe } from '@/lib/stripe'
import { baseUrl } from '@/lib/links'
import { supabaseAdmin } from '@/lib/supabase'

type Lang = 'fr' | 'de' | 'en'
const LABEL = { fr: 'Nom de votre entreprise', de: 'Name Ihres Unternehmens', en: 'Your business name' }
const ACCEPT = {
  fr: (commit: boolean, base: string) => `${commit ? 'Engagement 12 mois. ' : ''}En payant, vous acceptez nos conditions : ${base}/conditions`,
  de: (commit: boolean, base: string) => `${commit ? '12 Monate Laufzeit. ' : ''}Mit der Zahlung akzeptieren Sie unsere Bedingungen: ${base}/conditions`,
  en: (commit: boolean, base: string) => `${commit ? '12-month commitment. ' : ''}By paying, you accept our terms: ${base}/conditions`,
}

async function createSession(req: NextRequest, plan: PlanKey, term: Term, lang: Lang): Promise<string> {
  if (!stripe) throw new Error('payments_unavailable')
  const base = baseUrl(req)
  const email = getSessionEmail(req)
  const { data: lead } = email
    ? await supabaseAdmin.from('leads').select('stripe_customer_id, business_name').eq('email', email).maybeSingle()
    : { data: null }
  const once = !!PLANS[plan].once
  const lineItems: { price: string; quantity: number }[] = [{ price: await priceFor(plan, term), quantity: 1 }]
  if (!once && term === 'flex' && PLANS[plan].setupFlex) lineItems.push({ price: await setupPrice(), quantity: 1 })
  const founder = !once && hasFounder(plan) ? await founderCoupon() : null

  const session = await stripe.checkout.sessions.create({
    mode: once ? 'payment' : 'subscription',
    line_items: lineItems,
    ...(lead?.stripe_customer_id ? { customer: lead.stripe_customer_id } : email ? { customer_email: email } : {}),
    ...(once && !lead?.stripe_customer_id ? { customer_creation: 'always' as const } : {}),
    ...(once
      ? { invoice_creation: { enabled: true }, payment_intent_data: { metadata: { plan } } }
      : { subscription_data: { metadata: { plan, term } } }),
    ...(founder ? { discounts: [{ coupon: founder.id }] } : { allow_promotion_codes: true }),
    locale: lang,
    billing_address_collection: 'auto',
    // Prices are in CHF on the site: charge CHF, no automatic conversion to the visitor's currency.
    adaptive_pricing: { enabled: false },
    custom_fields: [{
      key: 'business', type: 'text', label: { type: 'custom', custom: LABEL[lang] },
      ...(lead?.business_name ? { text: { default_value: lead.business_name.slice(0, 255) } } : {}),
    }],
    custom_text: { submit: { message: ACCEPT[lang](!once && term === 'm12', base) } },
    metadata: { plan, term: once ? 'once' : term, lang },
    success_url: `${base}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/#pricing`,
  })
  if (!session.url) throw new Error('no_url')
  return session.url
}

const langOf = (v: unknown): Lang => (v === 'de' || v === 'en' ? v : 'fr')

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'payments_unavailable' }, { status: 503 })
  let body: { plan?: string; term?: string; language?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }
  if (!isPlanKey(body.plan)) return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
  try {
    return NextResponse.json({ url: await createSession(req, body.plan, isTerm(body.term) ? body.term : 'm12', langOf(body.language)) })
  } catch (e) {
    console.error('[stripe] checkout failed', e)
    return NextResponse.json({ error: 'checkout_failed' }, { status: 502 })
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams
  const plan = q.get('plan'), term = q.get('term')
  const fallback = new URL('/#pricing', req.url)
  if (!stripe || !isPlanKey(plan)) return NextResponse.redirect(fallback, 303)
  try {
    return NextResponse.redirect(await createSession(req, plan, isTerm(term) ? term : 'm12', langOf(q.get('lang'))), 303)
  } catch (e) {
    console.error('[stripe] checkout (GET) failed', e)
    return NextResponse.redirect(fallback, 303)
  }
}
