'use client'
import { useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import type { PlanKey, Term } from '@/lib/plans'

// Sends the visitor straight to Stripe Checkout for a plan and a way to pay (12 months, yearly, no commitment). If online payment is not
// available, falls back to `fallbackHref` (contact section).
export default function CheckoutButton({ plan, term = 'm12', lang, className, children, fallbackHref = '/#activer' }:
  { plan: PlanKey; term?: Term; lang: string; className?: string; children: ReactNode; fallbackHref?: string }) {
  const [busy, setBusy] = useState(false)
  const go = async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan, term, language: lang }),
      })
      const j = await res.json().catch(() => ({}))
      window.location.href = res.ok && j.url ? j.url : fallbackHref
    } catch {
      window.location.href = fallbackHref
    }
  }
  return (
    <button type="button" onClick={go} disabled={busy} className={className} aria-busy={busy}>
      {busy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : children}
    </button>
  )
}
