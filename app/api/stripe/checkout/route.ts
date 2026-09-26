// Starts a Stripe Checkout for a monthly plan. No account needed: Stripe collects the email,
// and the success page opens the client space for it.
import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail } from '@/lib/checker-auth'
import { isPlanKey } from '@/lib/plans'
import { priceFor, stripe } from '@/lib/stripe'
import { baseUrl } from '@/lib/links'
import { supabaseAdmin } from '@/lib/supabase'

const LABEL = { fr: 'Nom de votre entreprise', de: 'Name Ihres Unternehmens', en: 'Your business name' }

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'payments_unavailable' }, { status: 503 })
  let body: { plan?: string; language?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }
  if (!isPlanKey(body.plan)) return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
  const lang = body.language === 'de' || body.language === 'en' ? body.language : 'fr'
  const base = baseUrl(req)

  // A signed-in client pays with the same customer (one billing history); otherwise prefill the email.
  const email = getSessionEmail(req)
  const { data: lead } = email
    ? await supabaseAdmin.from('leads').select('stripe_customer_id, business_name').eq('email', email).maybeSingle()
    : { data: null }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: await priceFor(body.plan), quantity: 1 }],
      ...(lead?.stripe_customer_id ? { customer: lead.stripe_customer_id } : email ? { customer_email: email } : {}),
      locale: lang,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      custom_fields: [{
        key: 'business', type: 'text', label: { type: 'custom', custom: LABEL[lang] },
        ...(lead?.business_name ? { text: { default_value: lead.business_name.slice(0, 255) } } : {}),
      }],
      subscription_data: { metadata: { plan: body.plan } },
      metadata: { plan: body.plan, lang },
      success_url: `${base}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/#pricing`,
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('[stripe] checkout failed', e)
    return NextResponse.json({ error: 'checkout_failed' }, { status: 502 })
  }
}
