// Upgrade from the Site plan to Visibilité IA, from the client space, without a call.
// The client sees what is included and what he pays today (Stripe's proration preview), confirms,
// and the card on file pays the difference at once: the subscription item is swapped to the
// Visibilité IA price of the same term, the proration is invoiced now, the billing date and the
// commitment do not change. No card on file, or the bank refuses: a Stripe page to add a card,
// then the upgrade runs on return (app/api/client/upgrade/card). The founder offer applies while
// it lasts, unless the subscription already carries a discount (kept as is).
import type Stripe from 'stripe'
import { stripe, priceFor, setupPrice, founderCoupon, planFromPrice, type Currency } from './stripe'
import { chf, FOUNDER, PLANS, planName, type PlanKey, type Term } from './plans'
import { supabaseAdmin } from './supabase'
import { sendMail } from './mailer'
import { E, emailShell, mailLang, type MailLang } from './email-layout'
import { BOOKING_URL, bookingFor } from './links'
import { magicUrl } from './checker-auth'
import { cockpitFetch } from './cockpit'
import { runVisibilityCheck, ENGINE_VERSION, type BusinessInput } from './scoring-engine'
import { normalize, normalizeName } from './geo/match'

export const TARGET: PlanKey = 'visibility'

export class UpgradeError extends Error {}

type Ctx = {
  email: string; customer: string; sub: Stripe.Subscription; item: Stripe.SubscriptionItem
  term: Term; currency: Currency; lang: MailLang; business: string | null
}

export type Quote = {
  plan: PlanKey; term: Term; currency: Currency
  from: number                 // current recurring amount (per month, or per year for the yearly term)
  to: number                   // Visibilité IA list amount, same term
  toFounder: number | null     // with the founder offer (first months), when it applies
  founderMonths: number
  keepsDiscount: boolean       // the subscription already has a discount: kept, no founder offer on top
  setupFee: number | null      // flex term only, once
  dueToday: number             // what the card pays now (proration + set-up)
  periodEnd: string | null     // current period end (billing date, unchanged)
  card: { brand: string; last4: string } | null
  prorationDate: number
  commitmentUntil: string | null
}

const cents = (n: number | null | undefined) => Math.round(n || 0) / 100

async function context(email: string): Promise<Ctx> {
  if (!stripe) throw new UpgradeError('payments_unavailable')
  const { data: lead } = await supabaseAdmin.from('leads')
    .select('stripe_customer_id, stripe_subscription_id, plan, term, language, business_name').eq('email', email).maybeSingle()
  if (!lead?.stripe_subscription_id || !lead.stripe_customer_id) throw new UpgradeError('no_subscription')
  const sub = await stripe.subscriptions.retrieve(lead.stripe_subscription_id, { expand: ['default_payment_method', 'discounts'] })
  if (!['active', 'trialing'].includes(sub.status)) throw new UpgradeError('not_active')
  if (sub.items.data.length !== 1) throw new UpgradeError('custom_subscription')
  const item = sub.items.data[0]
  const { plan, term } = planFromPrice(item.price)
  if (plan && plan !== 'site') throw new UpgradeError(plan === 'visibility' || plan === 'complete' ? 'already' : 'not_site')
  if (!plan && lead.plan !== 'site') throw new UpgradeError('not_site')
  const t = ((sub.metadata?.term as Term) || term || (lead.term as Term) || 'm12') as Term
  return {
    email, customer: lead.stripe_customer_id, sub, item, term: t,
    currency: sub.currency === 'eur' ? 'eur' : 'chf', lang: mailLang(lead.language), business: lead.business_name || null,
  }
}

async function card(ctx: Ctx): Promise<Stripe.PaymentMethod | null> {
  const pm = ctx.sub.default_payment_method
  if (pm && typeof pm === 'object') return pm
  const c = await stripe!.customers.retrieve(ctx.customer, { expand: ['invoice_settings.default_payment_method'] })
  const d = !c.deleted ? c.invoice_settings?.default_payment_method : null
  return d && typeof d === 'object' ? d : null
}

const cardLabel = (pm: Stripe.PaymentMethod | null) =>
  !pm ? null : pm.card ? { brand: pm.card.brand, last4: pm.card.last4 } : { brand: pm.type, last4: '' }

async function terms(ctx: Ctx) {
  const hasDiscount = (ctx.sub.discounts || []).length > 0
  const [price, setup, founder] = await Promise.all([
    priceFor(TARGET, ctx.term, ctx.currency),
    ctx.term === 'flex' && PLANS[TARGET].setupFlex ? setupPrice(ctx.currency) : Promise.resolve(null),
    hasDiscount ? Promise.resolve(null) : founderCoupon().catch(() => null),
  ])
  return { price, setup, founder, hasDiscount }
}

/** What the client would pay, from Stripe (nothing changes). */
export async function quote(email: string): Promise<Quote> {
  const ctx = await context(email)
  const { price, setup, founder, hasDiscount } = await terms(ctx)
  const prorationDate = Math.floor(Date.now() / 1000)
  const preview = await stripe!.invoices.createPreview({
    customer: ctx.customer,
    subscription: ctx.sub.id,
    subscription_details: { items: [{ id: ctx.item.id, price }], proration_behavior: 'always_invoice', proration_date: prorationDate },
    ...(founder ? { discounts: [{ coupon: founder.id }] } : {}),
    ...(setup ? { invoice_items: [{ price: setup }] } : {}),
  })
  // With always_invoice the preview is the invoice created now; if it ever carries the next period
  // too, keep only the proration and the set-up lines.
  const lines = preview.lines?.data || []
  const nextPeriod = lines.some(l => l.parent?.subscription_item_details && !l.parent.subscription_item_details.proration)
  const due = !nextPeriod ? preview.amount_due : lines
    .filter(l => l.parent?.subscription_item_details?.proration || l.parent?.type === 'invoice_item_details')
    .reduce((s, l) => s + l.amount - (l.discount_amounts || []).reduce((a, d) => a + d.amount, 0), 0)
  const to = PLANS[TARGET].prices![ctx.term]
  const { data: lead } = await supabaseAdmin.from('leads').select('commitment_until').eq('email', email).maybeSingle()
  const end = ctx.item.current_period_end
  return {
    plan: TARGET, term: ctx.term, currency: ctx.currency,
    from: cents(ctx.item.price.unit_amount), to,
    toFounder: founder ? Math.round(to * (100 - FOUNDER.percent)) / 100 : null,
    founderMonths: FOUNDER.months,
    keepsDiscount: hasDiscount,
    setupFee: setup ? PLANS[TARGET].setupFlex! : null,
    dueToday: cents(Math.max(0, due)),
    periodEnd: end ? new Date(end * 1000).toISOString() : null,
    card: cardLabel(await card(ctx)),
    prorationDate,
    commitmentUntil: lead?.commitment_until || null,
  }
}

export type UpgradeResult = { ok: true; paid: number } | { ok: false; needsCard: true; reason: string }

/** Swap the plan and charge the difference now. On a card problem nothing changes (needsCard). */
export async function upgrade(email: string, prorationDate?: number): Promise<UpgradeResult & { ctx?: Ctx }> {
  const ctx = await context(email)
  const { price, setup, founder } = await terms(ctx)
  const now = Math.floor(Date.now() / 1000)
  const pd = prorationDate && prorationDate <= now && now - prorationDate < 3600 ? prorationDate : now
  try {
    const updated = await stripe!.subscriptions.update(ctx.sub.id, {
      items: [{ id: ctx.item.id, price }],
      proration_behavior: 'always_invoice',
      proration_date: pd,
      payment_behavior: 'error_if_incomplete',
      ...(founder ? { discounts: [{ coupon: founder.id }] } : {}),
      ...(setup ? { add_invoice_items: [{ price: setup }] } : {}),
      metadata: { ...(ctx.sub.metadata || {}), plan: TARGET, term: ctx.term, upgraded_from: 'site', upgraded_at: new Date().toISOString() },
      expand: ['latest_invoice'],
    })
    const inv = updated.latest_invoice && typeof updated.latest_invoice === 'object' ? updated.latest_invoice : null
    return { ok: true, paid: cents(inv?.amount_paid), ctx }
  } catch (e) {
    const err = e as { type?: string; code?: string; message?: string }
    if (err?.type === 'StripeCardError' || err?.code === 'invoice_payment_intent_requires_action' || /payment method|payment_method|requires_action|authentication/i.test(err?.message || '')) {
      return { ok: false, needsCard: true, reason: err.code || 'card' }
    }
    throw e
  }
}

/** Stripe page to add (and authenticate) a card, then back to run the upgrade. */
export async function cardSession(email: string, base: string): Promise<string> {
  const ctx = await context(email)
  const s = await stripe!.checkout.sessions.create({
    mode: 'setup',
    customer: ctx.customer,
    currency: ctx.currency,
    locale: ctx.lang,
    setup_intent_data: { metadata: { purpose: 'upgrade', plan: TARGET, subscription: ctx.sub.id } },
    metadata: { purpose: 'upgrade', plan: TARGET },
    success_url: `${base}/api/client/upgrade/card?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/espace-client?upgrade=cancel`,
  })
  if (!s.url) throw new UpgradeError('no_url')
  return s.url
}

/** Return from the card page: that card becomes the one of the subscription. */
export async function adoptCardFrom(email: string, sessionId: string): Promise<void> {
  const ctx = await context(email)
  const s = await stripe!.checkout.sessions.retrieve(sessionId, { expand: ['setup_intent'] })
  const cust = typeof s.customer === 'string' ? s.customer : s.customer?.id
  if (s.mode !== 'setup' || s.status !== 'complete' || cust !== ctx.customer) throw new UpgradeError('bad_session')
  const si = s.setup_intent && typeof s.setup_intent === 'object' ? s.setup_intent : null
  const pm = si?.payment_method ? (typeof si.payment_method === 'string' ? si.payment_method : si.payment_method.id) : null
  if (!pm) throw new UpgradeError('no_card')
  await stripe!.customers.update(ctx.customer, { invoice_settings: { default_payment_method: pm } })
  await stripe!.subscriptions.update(ctx.sub.id, { default_payment_method: pm })
}

// ─── After a successful upgrade ───────────────────────────────────────────────────

const U = {
  fr: {
    s: 'Visibilité IA est activée', t: 'Bienvenue dans Visibilité IA',
    b: 'Merci ! Votre abonnement passe à Visibilité IA, votre site reste inclus. Voici la suite :',
    steps: [
      'Première mesure de votre visibilité sur ChatGPT, Gemini, Claude et Perplexity : elle apparaît dans votre espace dans quelques minutes.',
      'Antoine démarre la mise en place sous 24 h (jours ouvrés) : fiche Google, annuaires, données structurées, méthode avis.',
      'Chaque mois : une nouvelle mesure et un rapport, dans votre espace et par email.',
    ],
    book: 'Un besoin particulier ? Vous pouvez réserver un appel de 30 minutes avec Antoine :', bookCta: 'Réserver un appel', cta: 'Ouvrir mon cockpit',
  },
  de: {
    s: 'KI-Sichtbarkeit ist aktiviert', t: 'Willkommen bei der KI-Sichtbarkeit',
    b: 'Danke! Ihr Abonnement wechselt zur KI-Sichtbarkeit, Ihre Website bleibt inbegriffen. So geht es weiter:',
    steps: [
      'Erste Messung Ihrer Sichtbarkeit bei ChatGPT, Gemini, Claude und Perplexity: in wenigen Minuten in Ihrem Bereich.',
      'Antoine startet die Einrichtung innert 24 Stunden (Werktage): Google-Profil, Verzeichnisse, strukturierte Daten, Bewertungsmethode.',
      'Jeden Monat: eine neue Messung und ein Bericht, im Kundenbereich und per E-Mail.',
    ],
    book: 'Ein besonderes Anliegen? Sie können ein 30-minütiges Gespräch mit Antoine buchen:', bookCta: 'Gespräch buchen', cta: 'Mein Cockpit öffnen',
  },
  en: {
    s: 'AI visibility is on', t: 'Welcome to AI visibility',
    b: 'Thank you! Your subscription moves to AI visibility, your website stays included. What happens next:',
    steps: [
      'First measurement of your visibility on ChatGPT, Gemini, Claude and Perplexity: in your space within a few minutes.',
      'Antoine starts the set-up within 24 hours (working days): Google profile, directories, structured data, reviews method.',
      'Every month: a new measurement and a report, in your space and by email.',
    ],
    book: 'Something specific in mind? You can book a 30-minute call with Antoine:', bookCta: 'Book a call', cta: 'Open my cockpit',
  },
}

/** Right after a paid upgrade: the client space shows it at once (the webhook syncs the plan too).
 *  Returns the rest (droplet, emails, first AI measurement), to run after the response. */
export async function afterUpgrade(ctx: Ctx, paid: number, base: string): Promise<{ later: () => Promise<void> }> {
  const email = ctx.email
  await supabaseAdmin.from('leads').update({ plan: TARGET, term: ctx.term, stage: 'client' }).eq('email', email)
  await supabaseAdmin.from('client_updates').insert({ email, kind: 'payment', title: 'upgraded', body: TARGET })
  return { later: () => notifyAndMeasure(ctx, paid, base) }
}

async function notifyAndMeasure(ctx: Ctx, paid: number, base: string): Promise<void> {
  const email = ctx.email
  const slug = ctx.sub.metadata?.site_slug || null
  let site: { city?: string | null; sector?: string | null; business_name?: string | null } = {}
  if (slug) {
    try {
      await cockpitFetch(`sites/${slug}/plan`, { method: 'POST', body: JSON.stringify({ plan: TARGET, term: ctx.term, paid, currency: ctx.currency }) })
      const r = await cockpitFetch(`sites/${slug}/prospect`)
      if (r.status < 300) site = r.body || {}
    } catch (e) { console.error('[upgrade] droplet', e) }
  }
  const lang = ctx.lang
  const u = U[lang]
  const space = magicUrl(base, email, '7d', `/espace-client?lang=${lang}`)
  const book = bookingFor(email)
  await sendMail({
    to: email, subject: u.s,
    text: [u.b, '', ...u.steps.map((s, i) => `${i + 1}. ${s}`), '', space, '', BOOKING_URL ? `${u.book} ${book}` : '', '', 'Antoine Pury, Présence IA'].join('\n'),
    html: emailShell({ lang, preheader: u.b, body:
      E.title(u.t) + E.p(u.b) + u.steps.map((s, i) => E.p(`${i + 1}. ${s}`)).join('') + E.button(space, u.cta) +
      (BOOKING_URL ? E.box(E.p(u.book, 'margin:0 0 12px') + E.buttonDark(book, u.bookCta)) : '') + E.signature(lang) }),
  })
  const cur = ctx.currency.toUpperCase()
  const per = ctx.term === 'year' ? '/ an' : '/ mois'
  const who = ctx.business || site.business_name || email
  await sendMail({
    to: 'antoine@presenceia.com', replyTo: email,
    subject: `Upgrade Visibilité IA : ${who}`,
    text: `${who}\n${email}\nSite web -> ${planName(TARGET, 'fr')} (${cur} ${chf(PLANS[TARGET].prices![ctx.term])} ${per}, liste)\nPayé aujourd'hui : ${cur} ${chf(paid)}\nMise en place à démarrer.`,
    html: emailShell({ lang: 'fr', body: E.title('Upgrade vers Visibilité IA') +
      E.rows([['Entreprise', who], ['Email', email], ['Formule', `${planName(TARGET, 'fr')}, ${cur} ${chf(PLANS[TARGET].prices![ctx.term])} ${per} (prix liste)`],
        ['Payé aujourd\'hui', `${cur} ${chf(paid)}`], ...(slug ? [['Site', `https://${slug}.presenceia.com`] as [string, string]] : [])]) +
      E.p('Mise en place à démarrer : fiche Google, annuaires, données structurées et FAQ, méthode avis.') +
      E.button(`mailto:${email}`, 'Écrire au client') }),
  })
  // First measurement (about a minute): the AI cockpit shows it; the guarantee compares with it.
  await runBaseline(email, lang, { business: ctx.business || site.business_name || null, city: site.city || null, sector: site.sector || null })
}

/** The starting measurement of a Visibilité IA client (guarantee, /conditions art. 6): the business of his
 *  latest analysis, else what we know from his site. Skipped without a name and a town. */
export async function runBaseline(email: string, lang: MailLang, hints: { business: string | null; city: string | null; sector: string | null }): Promise<void> {
  try {
    const { data: last } = await supabaseAdmin.from('visibility_checks').select('business_name, city, category, language')
      .eq('email', email).order('created_at', { ascending: false }).limit(1).maybeSingle()
    const input: BusinessInput = {
      businessName: last?.business_name || hints.business || '',
      city: last?.city || hints.city || '',
      category: last?.category || hints.sector || 'Autre',
      language: (['fr', 'de', 'en', 'it'].includes(last?.language) ? last!.language : lang) as BusinessInput['language'],
    }
    if (!input.businessName || !input.city) return
    const result = await runVisibilityCheck(input)
    const cacheKey = `v${ENGINE_VERSION}_${normalizeName(input.businessName)}_${normalize(input.city)}_${normalize(input.category)}_${input.language}`
    await supabaseAdmin.from('visibility_checks').insert({
      cache_key: cacheKey, business_name: input.businessName, city: input.city, category: input.category, language: input.language,
      email, overall_score: result.overallScore, grade: result.grade, result, kind: 'baseline',
    })
    await supabaseAdmin.from('client_updates').insert({ email, kind: 'report', title: 'baseline_analysis', body: `${result.overallScore}`, link: '/espace-client' })
  } catch (e) { console.error('[baseline]', e) }
}
