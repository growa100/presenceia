// Public URLs used in emails and the client space.
import type { NextRequest } from 'next/server'

/** Origin of the current deployment (preview or production), for links in emails. */
export function baseUrl(req?: NextRequest): string {
  if (req) return req.nextUrl.origin
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://presenceia.com').replace(/\/$/, '')
}

// Antoine's Google Calendar booking page (30-minute free audit). Until it is set, booking falls back to email.
export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || ''

export function bookingHref(lang: string, business?: string): string {
  if (BOOKING_URL) return BOOKING_URL
  const s = lang === 'de' ? 'Audit buchen' : lang === 'en' ? 'Book my audit' : 'Réserver mon audit'
  return `mailto:antoine@presenceia.com?subject=${encodeURIComponent(business ? `${s} : ${business}` : s)}`
}
