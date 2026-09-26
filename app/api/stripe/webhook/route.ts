// Stripe webhook: checkout completed, subscription changes. Endpoint: /api/stripe/webhook
// Events: checkout.session.completed, customer.subscription.created/updated/deleted
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sendWelcome, syncCheckout, syncSubscription } from '@/lib/billing'
import { baseUrl } from '@/lib/links'

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  const raw = await req.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(raw, req.headers.get('stripe-signature') || '', secret)
  } catch {
    return NextResponse.json({ error: 'bad_signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const r = await syncCheckout(event.data.object.id)
        // With a webhook configured, the welcome emails are sent here only (never by the success page).
        if (r) await sendWelcome({ ...r, base: baseUrl(req) })
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(event.data.object)
        break
    }
  } catch (e) {
    console.error('[stripe] webhook', event.type, e)
    return NextResponse.json({ error: 'handler_failed' }, { status: 500 })
  }
  return NextResponse.json({ received: true })
}
