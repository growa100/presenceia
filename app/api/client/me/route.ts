// Everything the client space shows, for the signed-in email only.
import { NextRequest, NextResponse } from 'next/server'
import { freeChecksLeft, getSessionEmail } from '@/lib/checker-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { bookingFor } from '@/lib/links'
import { stripe, stripeTestMode } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const email = getSessionEmail(req)
  if (!email) return NextResponse.json({ email: null }, { status: 401 })

  const [left, lead, checks, updates] = await Promise.all([
    freeChecksLeft(email),
    supabaseAdmin.from('leads')
      .select('business_name, city, category, stage, client_message, plan, subscription_status, current_period_end, audit_requested_at, audit_done_at, boost_paid_at, stripe_customer_id')
      .eq('email', email).maybeSingle(),
    supabaseAdmin.from('visibility_checks')
      .select('id, business_name, city, category, overall_score, grade, created_at, mentions:result->mentions, total:result->totalAnswers')
      .eq('email', email).order('created_at', { ascending: false }).limit(30),
    supabaseAdmin.from('client_updates').select('id, kind, title, body, link, created_at')
      .eq('email', email).order('created_at', { ascending: false }).limit(50),
  ])

  const l = lead.data
  return NextResponse.json({
    email, left,
    lead: l ? { ...l, stripe_customer_id: undefined, hasBilling: !!l.stripe_customer_id } : null,
    analyses: checks.data || [],
    updates: updates.data || [],
    bookingUrl: bookingFor(email),
    payments: !!stripe, paymentsTest: stripeTestMode,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
