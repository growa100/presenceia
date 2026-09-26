// Public: founder offer slots left (shown on the pricing section and in the client space).
import { NextResponse } from 'next/server'
import { founderCoupon, stripe } from '@/lib/stripe'
import { FOUNDER } from '@/lib/plans'

export const revalidate = 300

export async function GET() {
  if (!stripe) return NextResponse.json({ founderLeft: FOUNDER.slots, payments: false })
  try {
    const c = await founderCoupon()
    return NextResponse.json({ founderLeft: c?.left ?? 0, payments: true })
  } catch {
    return NextResponse.json({ founderLeft: 0, payments: true })
  }
}
