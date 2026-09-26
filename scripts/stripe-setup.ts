// Creates (or finds) every Présence IA product, price and the founder coupon in Stripe, and prints them.
// npx tsx --env-file=.env.local scripts/stripe-setup.ts   (run once per Stripe account / mode)
import { founderCoupon, priceFor, setupPrice, stripe, stripeTestMode } from '../lib/stripe'
import { PLAN_KEYS, PLANS, TERMS } from '../lib/plans'

async function main() {
  if (!stripe) throw new Error('STRIPE_SECRET_KEY missing in .env.local')
  console.log(stripeTestMode ? 'Stripe TEST mode' : 'Stripe LIVE mode')
  for (const k of PLAN_KEYS) {
    for (const t of TERMS) console.log(`${k} ${t}: CHF ${PLANS[k].prices![t]} -> ${await priceFor(k, t)}`)
  }
  console.log(`boost once: CHF ${PLANS.boost.once} -> ${await priceFor('boost')}`)
  console.log(`setup: -> ${await setupPrice()}`)
  console.log(`founder coupon: ${JSON.stringify(await founderCoupon())}`)
}
main().catch(e => { console.error(e.message || e); process.exit(1) })
