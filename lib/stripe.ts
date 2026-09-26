// Stripe (test mode until 41 Labs is live). Products and prices are created on first use with
// stable lookup keys, so the only configuration is STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
import Stripe from 'stripe'
import { PLANS, type PlanKey } from './plans'

const KEY = process.env.STRIPE_SECRET_KEY || ''
export const stripe: Stripe | null = KEY ? new Stripe(KEY) : null
export const stripeTestMode = KEY.startsWith('sk_test_') || KEY.startsWith('rk_test_')

const lookupKey = (plan: PlanKey) => `pia_${plan}_monthly_chf_${PLANS[plan].chf}`
const priceCache = new Map<PlanKey, string>()

export async function priceFor(plan: PlanKey): Promise<string> {
  if (!stripe) throw new Error('stripe_not_configured')
  const hit = priceCache.get(plan)
  if (hit) return hit
  const key = lookupKey(plan)
  const found = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 })
  let id = found.data[0]?.id
  if (!id) {
    const product = await stripe.products.create({
      name: `Présence IA : ${PLANS[plan].name.fr}`,
      metadata: { plan },
    })
    const price = await stripe.prices.create({
      product: product.id, currency: 'chf', unit_amount: PLANS[plan].chf * 100,
      recurring: { interval: 'month' }, lookup_key: key, metadata: { plan },
    })
    id = price.id
  }
  priceCache.set(plan, id)
  return id
}

export function planFromPrice(price: Stripe.Price | string | null | undefined): PlanKey | null {
  if (!price || typeof price === 'string') return null
  const p = price.metadata?.plan || price.lookup_key?.split('_')[1]
  return p === 'site' || p === 'visibility' || p === 'complete' ? p : null
}

// Customer portal (invoices, card, cancellation). Created once if the account has none.
let portalConfig: string | null = null
export async function portalConfiguration(base: string): Promise<string | undefined> {
  if (!stripe) return undefined
  if (portalConfig) return portalConfig
  const list = await stripe.billingPortal.configurations.list({ active: true, limit: 10 })
  // Our own configuration (the Stripe account may be shared with other projects).
  const existing = list.data.find(c => c.metadata?.app === 'presenceia')
  if (existing) { portalConfig = existing.id; return portalConfig }
  const created = await stripe.billingPortal.configurations.create({
    business_profile: { headline: 'Présence IA : votre abonnement', privacy_policy_url: `${base}/confidentialite` },
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ['email', 'address', 'name', 'phone', 'tax_id'] },
      subscription_cancel: { enabled: true, mode: 'at_period_end' },
    },
    metadata: { app: 'presenceia' },
  })
  portalConfig = created.id
  return portalConfig
}
