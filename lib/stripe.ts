// Stripe (test mode until the company is live). Products, prices and the founder coupon are created
// on first use with stable ids / lookup keys, so the only configuration is STRIPE_SECRET_KEY and
// STRIPE_WEBHOOK_SECRET. See lib/plans.ts for the offer.
import Stripe from 'stripe'
import { FOUNDER, PLANS, SETUP_CHF, type PlanKey, type Term } from './plans'

const KEY = process.env.STRIPE_SECRET_KEY || ''
export const stripe: Stripe | null = KEY ? new Stripe(KEY) : null
export const stripeTestMode = KEY.startsWith('sk_test_') || KEY.startsWith('rk_test_')

const productId = (key: string) => `pia_${key}`
const cache = new Map<string, string>()

async function ensureProduct(key: string, name: string): Promise<string> {
  if (!stripe) throw new Error('stripe_not_configured')
  const id = productId(key)
  try {
    await stripe.products.retrieve(id)
  } catch {
    await stripe.products.create({ id, name: `Présence IA : ${name}`, metadata: { plan: key } })
  }
  return id
}

async function ensurePrice(lookup: string, make: () => Promise<Stripe.PriceCreateParams>): Promise<string> {
  if (!stripe) throw new Error('stripe_not_configured')
  const hit = cache.get(lookup)
  if (hit) return hit
  const found = await stripe.prices.list({ lookup_keys: [lookup], active: true, limit: 1 })
  const id = found.data[0]?.id || (await stripe.prices.create({ ...(await make()), lookup_key: lookup })).id
  cache.set(lookup, id)
  return id
}

/** Recurring price of a plan for a term (m12 and flex monthly, year yearly), or the one-time Boost. */
export async function priceFor(plan: PlanKey, term: Term = 'm12'): Promise<string> {
  const p = PLANS[plan]
  if (p.once) {
    return ensurePrice(`pia_${plan}_once_chf_${p.once}`, async () => ({
      product: await ensureProduct(plan, p.name.fr), currency: 'chf', unit_amount: p.once! * 100, metadata: { plan },
    }))
  }
  const amount = p.prices![term]
  return ensurePrice(`pia_${plan}_${term}_chf_${amount}`, async () => ({
    product: await ensureProduct(plan, p.name.fr), currency: 'chf', unit_amount: amount * 100,
    recurring: { interval: term === 'year' ? 'year' : 'month' }, metadata: { plan, term },
  }))
}

/** One-time set-up fee, added to the first invoice of a plan taken without commitment. */
export async function setupPrice(): Promise<string> {
  return ensurePrice(`pia_setup_once_chf_${SETUP_CHF}`, async () => ({
    product: await ensureProduct('setup', 'Mise en place'), currency: 'chf', unit_amount: SETUP_CHF * 100, metadata: { plan: 'setup' },
  }))
}

// ─── Founder offer: -30 % for 12 months, first 15 clients ────────────────────────
const FOUNDER_COUPON = `pia_founder_${FOUNDER.percent}_${FOUNDER.months}m`

export async function founderCoupon(): Promise<{ id: string; left: number } | null> {
  if (!stripe) return null
  let c: Stripe.Coupon | null = null
  try {
    c = await stripe.coupons.retrieve(FOUNDER_COUPON)
  } catch {
    const products = await Promise.all(FOUNDER.plans.map(p => ensureProduct(p, PLANS[p].name.fr)))
    c = await stripe.coupons.create({
      id: FOUNDER_COUPON, name: `Offre fondateur -${FOUNDER.percent} %`, percent_off: FOUNDER.percent,
      duration: 'repeating', duration_in_months: FOUNDER.months, max_redemptions: FOUNDER.slots,
      applies_to: { products },
    })
  }
  const left = Math.max(0, (c.max_redemptions ?? FOUNDER.slots) - (c.times_redeemed || 0))
  return c.valid && left > 0 ? { id: c.id, left } : null
}

export function planFromPrice(price: Stripe.Price | string | null | undefined): { plan: PlanKey | null; term: Term | null } {
  if (!price || typeof price === 'string') return { plan: null, term: null }
  const parts = (price.lookup_key || '').split('_')          // pia_<plan>_<term>_chf_<amount>
  const plan = (price.metadata?.plan || parts[1]) as PlanKey
  const term = (price.metadata?.term || parts[2]) as Term
  return {
    plan: plan in PLANS ? plan : null,
    term: term === 'm12' || term === 'year' || term === 'flex' ? term : null,
  }
}

// Customer portal: invoices, card, details. No self-service cancellation (12-month commitments;
// cancellation by email, see /conditions). Our own configuration, the account may be shared.
let portalConfig: string | null = null
const PORTAL_VERSION = '2'
export async function portalConfiguration(base: string): Promise<string | undefined> {
  if (!stripe) return undefined
  if (portalConfig) return portalConfig
  const params = {
    business_profile: { headline: 'Présence IA : factures et moyen de paiement', privacy_policy_url: `${base}/confidentialite`, terms_of_service_url: `${base}/conditions` },
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ['email', 'address', 'name', 'phone', 'tax_id'] as Stripe.BillingPortal.ConfigurationCreateParams.Features.CustomerUpdate.AllowedUpdate[] },
      subscription_cancel: { enabled: false },
    },
    metadata: { app: 'presenceia', version: PORTAL_VERSION },
  }
  const list = await stripe.billingPortal.configurations.list({ active: true, limit: 20 })
  const existing = list.data.find(c => c.metadata?.app === 'presenceia')
  if (existing) {
    if (existing.metadata?.version !== PORTAL_VERSION) await stripe.billingPortal.configurations.update(existing.id, params)
    portalConfig = existing.id
    return portalConfig
  }
  portalConfig = (await stripe.billingPortal.configurations.create(params)).id
  return portalConfig
}

/** True while founder-offer slots remain (defaults to true if Stripe cannot be reached). */
export async function founderOpen(): Promise<boolean> {
  if (!stripe) return false
  try { return !!(await founderCoupon()) } catch { return true }
}
