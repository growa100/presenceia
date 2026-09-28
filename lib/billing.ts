// Keeps the lead row in sync with Stripe and sends the welcome / notification emails.
import type Stripe from 'stripe'
import { stripe, planFromPrice, stripeTestMode } from './stripe'
import { chf, PLANS, planName, type PlanKey, type Term } from './plans'
import { supabaseAdmin } from './supabase'
import { sendMail } from './mailer'
import { E, emailShell, mailLang } from './email-layout'
import { BOOKING_URL, bookingFor } from './links'
import { magicUrl, normalizeEmail } from './checker-auth'
import { cancelSite, siteUrl } from './sites'

type SubInfo = { plan: PlanKey | null; term: Term | null; status: string; periodEnd: string | null }

function subInfo(sub: Stripe.Subscription): SubInfo {
  const item = sub.items?.data?.[0]
  const end = item?.current_period_end
  const { plan, term } = planFromPrice(item?.price)
  return { plan, term: (sub.metadata?.term as Term) || term, status: sub.status, periodEnd: end ? new Date(end * 1000).toISOString() : null }
}

const ACTIVE = new Set(['active', 'trialing', 'past_due'])

export type CheckoutResult = {
  email: string; isNew: boolean; plan: PlanKey | null; term: Term | null; business: string | null; lang: string
  // Set when the client activated a site we prepared (offer page of <slug>.presenceia.com).
  site?: string | null; phone?: string | null; currency?: string | null; customer?: string | null; subscription?: string | null; livemode?: boolean
}

/** Checkout finished: link the Stripe customer and subscription to the lead. Returns what changed. */
export async function syncCheckout(sessionId: string): Promise<CheckoutResult | null> {
  if (!stripe) return null
  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] })
  if (s.status !== 'complete') return null
  const email = normalizeEmail(s.customer_details?.email || s.customer_email || '')
  if (!email) return null
  const business = s.custom_fields?.find(f => f.key === 'business')?.text?.value?.trim() || null
  const lang = s.metadata?.lang || 'fr'
  const customerId = typeof s.customer === 'string' ? s.customer : s.customer?.id || null

  // One-time purchase: the GEO Boost.
  if (s.mode === 'payment') {
    const { data: lead } = await supabaseAdmin.from('leads').select('business_name, boost_paid_at, stage').eq('email', email).maybeSingle()
    const isNew = !lead?.boost_paid_at
    await supabaseAdmin.from('leads').upsert({
      email,
      ...(customerId ? { stripe_customer_id: customerId } : {}),
      boost_paid_at: lead?.boost_paid_at || new Date().toISOString(),
      ...(lead?.stage !== 'client' ? { stage: 'boost' } : {}),
      ...(!lead?.business_name && business ? { business_name: business } : {}),
      ...(!lead ? { source: 'stripe_checkout', language: lang } : {}),
    }, { onConflict: 'email' })
    if (isNew) await supabaseAdmin.from('client_updates').insert({ email, kind: 'payment', title: 'boost_purchased', body: 'boost' })
    return { email, isNew, plan: 'boost', term: null, business: business || lead?.business_name || null, lang }
  }

  const sub = typeof s.subscription === 'object' ? s.subscription : null
  const info = sub ? subInfo(sub) : { plan: (s.metadata?.plan as PlanKey) || null, term: (s.metadata?.term as Term) || null, status: 'active', periodEnd: null }
  const { data: lead } = await supabaseAdmin.from('leads').select('business_name, stripe_subscription_id').eq('email', email).maybeSingle()
  const isNew = !lead || lead.stripe_subscription_id !== (sub?.id || null)
  await supabaseAdmin.from('leads').upsert({
    email,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub?.id || null,
    plan: info.plan, term: info.term, subscription_status: info.status, current_period_end: info.periodEnd,
    ...(isNew && info.term === 'm12' ? { commitment_until: new Date(Date.now() + 365 * 86400_000).toISOString() } : {}),
    stage: 'client',
    ...(!lead?.business_name && business ? { business_name: business } : {}),
    ...(s.customer_details?.phone ? { phone: s.customer_details.phone } : {}),
    ...(!lead ? { source: 'stripe_checkout', language: lang } : {}),
  }, { onConflict: 'email' })
  const site = s.metadata?.site_slug || null
  if (isNew) {
    await supabaseAdmin.from('client_updates').insert({ email, kind: 'payment', title: 'subscribed', body: info.plan })
    if (site) await supabaseAdmin.from('client_updates').insert({ email, kind: 'site', title: 'site_activated', body: site, link: siteUrl(site) })
  }
  return {
    email, isNew, plan: info.plan, term: info.term, business: business || lead?.business_name || null, lang,
    site, phone: s.customer_details?.phone || null, currency: s.currency || null, customer: customerId,
    subscription: sub?.id || null, livemode: s.livemode,
  }
}

/** Subscription created, changed, paused or cancelled. */
export async function syncSubscription(sub: Stripe.Subscription) {
  const info = subInfo(sub)
  const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const patch = {
    stripe_subscription_id: sub.id, plan: info.plan, term: info.term, subscription_status: info.status, current_period_end: info.periodEnd,
    stage: ACTIVE.has(info.status) ? 'client' : 'paused',
  }
  // A site plan that ends: the droplet flags the site (the founder decides whether to take it down).
  if (sub.status === 'canceled' && sub.metadata?.site_slug) await cancelSite(sub.metadata.site_slug)
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

const WS = {
  fr: {
    s: (b: string | null) => `Votre site est activé${b ? ` : ${b}` : ''}`, t: 'Merci, votre site est à vous',
    b: (p: string) => `Votre abonnement « ${p} » est actif. Le bandeau d'aperçu a été retiré de votre site.`,
    next: 'Dernière étape, deux minutes : choisissez où le mettre en ligne (votre nom de domaine actuel, un nouveau, ou plus tard) et vérifiez vos informations légales.',
    cta: 'Choisir mon nom de domaine',
    visibility: 'Pour Visibilité IA, Antoine vous contacte sous 24 h (jours ouvrés) pour lancer la mise en place. Vous pouvez aussi choisir directement le créneau :',
    changes: 'Une correction sur le site (texte, photo, horaires) ? Répondez simplement à cet email.',
  },
  de: {
    s: (b: string | null) => `Ihre Website ist aktiviert${b ? `: ${b}` : ''}`, t: 'Danke, die Website gehört Ihnen',
    b: (p: string) => `Ihr Abonnement «${p}» ist aktiv. Das Vorschau-Banner wurde von Ihrer Website entfernt.`,
    next: 'Letzter Schritt, zwei Minuten: Wählen Sie, wo sie online geht (Ihre bestehende Domain, eine neue oder später) und prüfen Sie Ihre Angaben fürs Impressum.',
    cta: 'Meine Domain wählen',
    visibility: 'Für die KI-Sichtbarkeit meldet sich Antoine innert 24 Stunden (Werktage), um die Einrichtung zu starten. Sie können den Termin auch direkt wählen:',
    changes: 'Eine Korrektur auf der Website (Text, Foto, Öffnungszeiten)? Antworten Sie einfach auf diese E-Mail.',
  },
  en: {
    s: (b: string | null) => `Your website is activated${b ? `: ${b}` : ''}`, t: 'Thank you, the website is yours',
    b: (p: string) => `Your "${p}" subscription is active. The preview banner has been removed from your website.`,
    next: 'Last step, two minutes: choose where it goes live (your current domain, a new one, or later) and check your legal details.',
    cta: 'Choose my domain',
    visibility: 'For AI visibility, Antoine will contact you within 24 hours (working days) to start the set-up. You can also pick the time right away:',
    changes: 'A correction on the website (text, photo, opening hours)? Just reply to this email.',
  },
}

const WB = {
  fr: { s: 'Votre GEO Boost démarre', t: 'Merci, votre GEO Boost démarre', b: 'Votre paiement est bien reçu. Nous avons besoin de 20 minutes avec vous pour lancer le travail (accès à votre fiche Google, vos photos, vos services).', next: 'Choisissez le créneau qui vous convient :', book: 'Planifier le lancement', space: 'Suivez chaque étape du Boost dans votre espace client.', cta: 'Ouvrir mon espace client' },
  de: { s: 'Ihr GEO Boost startet', t: 'Danke, Ihr GEO Boost startet', b: 'Ihre Zahlung ist eingegangen. Wir brauchen 20 Minuten mit Ihnen, um zu starten (Zugang zu Ihrem Google-Profil, Fotos, Leistungen).', next: 'Wählen Sie den passenden Termin:', book: 'Start planen', space: 'Verfolgen Sie jeden Schritt im Kundenbereich.', cta: 'Kundenbereich öffnen' },
  en: { s: 'Your GEO Boost is starting', t: 'Thank you, your GEO Boost is starting', b: 'Your payment is in. We need 20 minutes with you to get started (access to your Google profile, photos, services).', next: 'Pick the time that suits you:', book: 'Schedule the kick-off', space: 'Follow each step of the Boost in your client area.', cta: 'Open my client area' },
}

export async function sendWelcome(o: { email: string; plan: PlanKey | null; term?: Term | null; business: string | null; lang: string; base: string; site?: string | null; currency?: string | null }) {
  const lang = mailLang(o.lang)
  const name = o.plan ? planName(o.plan, lang) : 'Présence IA'
  const space = magicUrl(o.base, o.email, '7d')
  const book = bookingFor(o.email)
  const once = !!(o.plan && PLANS[o.plan].once)
  if (o.site) {
    // Site activated from its offer page: the next step is the domain, in the client space.
    const ws = WS[lang]
    const extra = o.plan && o.plan !== 'site' ? ws.visibility : ''
    await sendMail({
      to: o.email, subject: ws.s(o.business),
      text: [ws.b(name), '', ws.next, space, '', extra, ws.changes, '', 'Antoine Pury, Présence IA', 'antoine@presenceia.com'].filter(x => x !== undefined).join('\n'),
      html: emailShell({ lang, preheader: ws.b(name), body:
        E.title(ws.t) + E.p(ws.b(name)) + E.p(ws.next) + E.button(space, ws.cta) +
        (extra ? E.p(extra) + (BOOKING_URL ? E.buttonDark(book, W[lang].book) : '') : '') +
        E.small(ws.changes) + E.signature(lang) }),
    })
  } else {
  const w = once
    ? { ...WB[lang], b: (_plan: string) => WB[lang].b }
    : W[lang]
  await sendMail({
    to: o.email, subject: w.s,
    text: [w.b(name), '', w.next, BOOKING_URL ? book : 'antoine@presenceia.com', '', w.space, space, '', 'Antoine Pury, Présence IA', 'antoine@presenceia.com'].join('\n'),
    html: emailShell({ lang, preheader: w.b(name), body:
      E.title(w.t) + E.p(w.b(name)) + E.p(w.next) + (BOOKING_URL ? E.button(book, w.book) : '') +
      E.box(E.p(w.space, 'margin:0') + E.button(space, w.cta)) + E.signature(lang) }),
  })
  }
  const p = o.plan ? PLANS[o.plan] : null
  const cur = (o.currency || 'chf').toUpperCase()
  const price = !p ? '' : p.once ? `${cur} ${chf(p.once)} (une fois)` : o.term && p.prices ? `${cur} ${chf(p.prices[o.term])} ${o.term === 'year' ? '/ an' : '/ mois'} (${o.term === 'm12' ? '12 mois' : o.term === 'year' ? 'annuel' : 'sans engagement'})` : ''
  const kind = once ? 'Nouveau GEO Boost' : o.site ? 'Site activé' : 'Nouvel abonnement'
  await sendMail({
    to: 'antoine@presenceia.com', replyTo: o.email,
    subject: `${stripeTestMode ? '[TEST] ' : ''}${kind} : ${o.business || o.email} (${name})`,
    text: `${o.business || '-'}\n${o.email}\n${name} ${price}`,
    html: emailShell({ lang: 'fr', body: E.title(`${kind}${stripeTestMode ? ' (test)' : ''}`) +
      E.rows([['Entreprise', o.business || '-'], ['Email', o.email], ['Offre', `${name} ${price}`], ['Langue', lang],
        ...(o.site ? [['Site', siteUrl(o.site)] as [string, string]] : [])]) +
      E.button(`mailto:${o.email}`, 'Écrire au client') }),
  })
}
