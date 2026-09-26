// Keeps the lead row in sync with Stripe and sends the welcome / notification emails.
import type Stripe from 'stripe'
import { stripe, planFromPrice, stripeTestMode } from './stripe'
import { PLANS, type PlanKey } from './plans'
import { supabaseAdmin } from './supabase'
import { sendMail } from './mailer'
import { E, emailShell, mailLang } from './email-layout'
import { BOOKING_URL } from './links'
import { magicUrl, normalizeEmail } from './checker-auth'

type SubInfo = { plan: PlanKey | null; status: string; periodEnd: string | null }

function subInfo(sub: Stripe.Subscription): SubInfo {
  const item = sub.items?.data?.[0]
  const end = item?.current_period_end
  return { plan: planFromPrice(item?.price), status: sub.status, periodEnd: end ? new Date(end * 1000).toISOString() : null }
}

const ACTIVE = new Set(['active', 'trialing', 'past_due'])

/** Checkout finished: link the Stripe customer and subscription to the lead. Returns what changed. */
export async function syncCheckout(sessionId: string): Promise<{ email: string; isNew: boolean; plan: PlanKey | null; business: string | null; lang: string } | null> {
  if (!stripe) return null
  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] })
  if (s.status !== 'complete') return null
  const email = normalizeEmail(s.customer_details?.email || s.customer_email || '')
  if (!email) return null
  const sub = typeof s.subscription === 'object' ? s.subscription : null
  const info = sub ? subInfo(sub) : { plan: (s.metadata?.plan as PlanKey) || null, status: 'active', periodEnd: null }
  const business = s.custom_fields?.find(f => f.key === 'business')?.text?.value?.trim() || null
  const lang = s.metadata?.lang || 'fr'

  const { data: lead } = await supabaseAdmin.from('leads').select('business_name, stripe_subscription_id').eq('email', email).maybeSingle()
  const isNew = !lead || lead.stripe_subscription_id !== (sub?.id || null)
  await supabaseAdmin.from('leads').upsert({
    email,
    stripe_customer_id: typeof s.customer === 'string' ? s.customer : s.customer?.id || null,
    stripe_subscription_id: sub?.id || null,
    plan: info.plan, subscription_status: info.status, current_period_end: info.periodEnd,
    stage: 'client',
    ...(!lead?.business_name && business ? { business_name: business } : {}),
    ...(s.customer_details?.phone ? { phone: s.customer_details.phone } : {}),
    ...(!lead ? { source: 'stripe_checkout', language: lang } : {}),
  }, { onConflict: 'email' })
  if (isNew) {
    await supabaseAdmin.from('client_updates').insert({ email, kind: 'payment', title: 'subscribed', body: info.plan })
  }
  return { email, isNew, plan: info.plan, business: business || lead?.business_name || null, lang }
}

/** Subscription created, changed, paused or cancelled. */
export async function syncSubscription(sub: Stripe.Subscription) {
  const info = subInfo(sub)
  const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const patch = {
    stripe_subscription_id: sub.id, plan: info.plan, subscription_status: info.status, current_period_end: info.periodEnd,
    stage: ACTIVE.has(info.status) ? 'client' : 'paused',
  }
  const { data } = await supabaseAdmin.from('leads').update(patch).eq('stripe_customer_id', customer).select('email')
  if (data?.length || !stripe) return
  // Checkout not synced yet: find the lead by the customer's email.
  const c = await stripe.customers.retrieve(customer)
  const email = !c.deleted ? normalizeEmail(c.email || '') : ''
  if (email) await supabaseAdmin.from('leads').upsert({ email, stripe_customer_id: customer, ...patch }, { onConflict: 'email' })
}

const W = {
  fr: { s: 'Bienvenue chez Présence IA', t: 'Bienvenue, votre accompagnement démarre', b: (p: string) => `Merci pour votre confiance. Votre abonnement « ${p} » est actif.`, next: 'Antoine vous contacte sous 24 h (jours ouvrés) pour lancer le travail. Vous pouvez aussi choisir directement le créneau de l\'appel de démarrage :', book: 'Planifier l\'appel de démarrage', space: 'Dans votre espace client : votre suivi, vos analyses, vos factures.', cta: 'Ouvrir mon espace client' },
  de: { s: 'Willkommen bei Présence IA', t: 'Willkommen, Ihre Begleitung startet', b: (p: string) => `Danke für Ihr Vertrauen. Ihr Abonnement «${p}» ist aktiv.`, next: 'Antoine meldet sich innert 24 Stunden (Werktage), um zu starten. Sie können den Termin für das Startgespräch auch direkt wählen:', book: 'Startgespräch planen', space: 'In Ihrem Kundenbereich: Begleitung, Analysen, Rechnungen.', cta: 'Kundenbereich öffnen' },
  en: { s: 'Welcome to Présence IA', t: 'Welcome, your support starts now', b: (p: string) => `Thank you for your trust. Your "${p}" subscription is active.`, next: 'Antoine will contact you within 24 hours (working days) to get started. You can also pick the time of the kick-off call right away:', book: 'Schedule the kick-off call', space: 'In your client area: follow-up, analyses, invoices.', cta: 'Open my client area' },
}

export async function sendWelcome(o: { email: string; plan: PlanKey | null; business: string | null; lang: string; base: string }) {
  const lang = mailLang(o.lang)
  const w = W[lang]
  const planName = o.plan ? PLANS[o.plan].name[lang] : 'Présence IA'
  const space = magicUrl(o.base, o.email, '7d')
  await sendMail({
    to: o.email, subject: w.s,
    text: [w.b(planName), '', w.next, BOOKING_URL || 'antoine@presenceia.com', '', w.space, space, '', 'Antoine Pury, Présence IA', 'antoine@presenceia.com'].join('\n'),
    html: emailShell({ lang, preheader: w.b(planName), body:
      E.title(w.t) + E.p(w.b(planName)) + E.p(w.next) + (BOOKING_URL ? E.button(BOOKING_URL, w.book) : '') +
      E.box(E.p(w.space, 'margin:0') + E.button(space, w.cta)) + E.signature(lang) }),
  })
  const price = o.plan ? `CHF ${PLANS[o.plan].chf} / mois` : ''
  await sendMail({
    to: 'antoine@presenceia.com', replyTo: o.email,
    subject: `${stripeTestMode ? '[TEST] ' : ''}Nouvel abonnement : ${o.business || o.email} (${planName})`,
    text: `${o.business || '-'}\n${o.email}\n${planName} ${price}`,
    html: emailShell({ lang: 'fr', body: E.title(`Nouvel abonnement${stripeTestMode ? ' (test)' : ''}`) +
      E.rows([['Entreprise', o.business || '-'], ['Email', o.email], ['Offre', `${planName} ${price}`], ['Langue', lang]]) +
      E.button(`mailto:${o.email}`, 'Écrire au client') }),
  })
}
