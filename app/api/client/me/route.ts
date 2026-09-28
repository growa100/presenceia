// Everything the client space shows, for the signed-in email only.
import { NextRequest, NextResponse } from 'next/server'
import { freeChecksLeft, getSessionEmail } from '@/lib/checker-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { bookingFor } from '@/lib/links'
import { stripe, stripeTestMode } from '@/lib/stripe'
import { isAdminEmail } from '@/lib/cockpit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const email = getSessionEmail(req)
  if (!email) return NextResponse.json({ email: null }, { status: 401 })

  const [left, lead, checks, updates] = await Promise.all([
    freeChecksLeft(email),
    supabaseAdmin.from('leads')
      .select('*')
      .eq('email', email).maybeSingle(),
    supabaseAdmin.from('visibility_checks')
      .select('id, business_name, city, category, overall_score, grade, created_at, mentions:result->mentions, total:result->totalAnswers')
      .eq('email', email).order('created_at', { ascending: false }).limit(30),
    supabaseAdmin.from('client_updates').select('id, kind, title, body, link, created_at')
      .eq('email', email).order('created_at', { ascending: false }).limit(50),
  ])

  const l = lead.data
  // The discount on the subscription (founder offer), so the billing card shows what is really paid.
  let discount: { percent: number; end: string | null } | null = null
  if (stripe && l?.stripe_subscription_id && ['active', 'trialing', 'past_due'].includes(l.subscription_status || '')) {
    try {
      const sub = await Promise.race([
        stripe.subscriptions.retrieve(l.stripe_subscription_id, { expand: ['discounts.source.coupon'] }),
        new Promise<null>(r => setTimeout(() => r(null), 2500)),
      ])
      for (const d of sub?.discounts || []) {
        const c = typeof d === 'object' && typeof d.source?.coupon === 'object' ? d.source.coupon : null
        if (c?.percent_off) { discount = { percent: c.percent_off, end: typeof d === 'object' && d.end ? new Date(d.end * 1000).toISOString() : null }; break }
      }
    } catch { /* billing card falls back to list prices */ }
  }
  return NextResponse.json({
    email, left,
    lead: l ? {
      business_name: l.business_name, city: l.city, category: l.category, stage: l.stage, client_message: l.client_message,
      plan: l.plan, term: l.term ?? null, commitment_until: l.commitment_until ?? null,
      subscription_status: l.subscription_status, current_period_end: l.current_period_end,
      audit_requested_at: l.audit_requested_at, audit_done_at: l.audit_done_at, boost_paid_at: l.boost_paid_at,
      hasBilling: !!l.stripe_customer_id, discount,
    } : null,
    analyses: checks.data || [],
    updates: updates.data || [],
    bookingUrl: bookingFor(email),
    payments: !!stripe, paymentsTest: stripeTestMode, isAdmin: isAdminEmail(email),
  }, { headers: { 'Cache-Control': 'no-store' } })
}
