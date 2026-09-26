// Creates (or finds) the Présence IA products and monthly CHF prices in Stripe, and prints them.
// npx tsx --env-file=.env.local scripts/stripe-setup.ts
import { priceFor, stripe, stripeTestMode } from '../lib/stripe'
import { PLAN_KEYS, PLANS } from '../lib/plans'

async function main() {
  if (!stripe) throw new Error('STRIPE_SECRET_KEY missing in .env.local')
  console.log(stripeTestMode ? 'Stripe TEST mode' : 'Stripe LIVE mode')
  for (const k of PLAN_KEYS) {
    const id = await priceFor(k)
    const p = await stripe.prices.retrieve(id, { expand: ['product'] })
    const name = typeof p.product === 'object' && 'name' in p.product ? p.product.name : p.product
    console.log(`${k}: ${name}, CHF ${(p.unit_amount || 0) / 100} / ${p.recurring?.interval}, ${id}`)
  }
  console.log(`Expected: ${PLAN_KEYS.map(k => `${k} CHF ${PLANS[k].chf}`).join(', ')}`)
}
main().catch(e => { console.error(e.message || e); process.exit(1) })
