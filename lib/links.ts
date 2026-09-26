// Public URLs used in emails and the client space.
import type { NextRequest } from 'next/server'

/** Origin of the current deployment (preview or production), for links in emails. */
export function baseUrl(req?: NextRequest): string {
  if (req) return req.nextUrl.origin
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://presenceia.com').replace(/\/$/, '')
}

// Antoine's Calendly booking page (30-minute free audit). Public link, so it lives in the code;
// NEXT_PUBLIC_BOOKING_URL can override it.
export const DEFAULT_BOOKING_URL = 'https://calendly.com/antoine-pury-41labs/parlons-de-votre-situation-concretement'
export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || DEFAULT_BOOKING_URL

/** Booking link with the email already filled in (Calendly reads ?email=), one field less for the client. */
export function bookingFor(email?: string | null): string {
  if (!email || !BOOKING_URL.includes('calendly.com')) return BOOKING_URL
  return `${BOOKING_URL}${BOOKING_URL.includes('?') ? '&' : '?'}email=${encodeURIComponent(email)}`
}

export function bookingHref(lang: string, business?: string): string {
  if (BOOKING_URL) return BOOKING_URL
  const s = lang === 'de' ? 'Audit buchen' : lang === 'en' ? 'Book my audit' : 'Réserver mon audit'
  return `mailto:antoine@presenceia.com?subject=${encodeURIComponent(business ? `${s} : ${business}` : s)}`
}
