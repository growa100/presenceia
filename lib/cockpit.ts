import { NextRequest } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

/**
 * Cockpit plumbing.
 * - Admins: role 'admin' in the users table, OR an email listed in
 *   ADMIN_EMAILS (comma-separated; defaults to the founder's address) so
 *   the founder account works without touching the database.
 * - The cockpit data lives in the outreach backend (FastAPI on the
 *   droplet); route handlers call it server-side with the shared key, so
 *   the key never reaches the browser.
 */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'antoinepury@outlook.com,antoinepury@outlook.fr,antoine@presenceia.com')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

export const COCKPIT_API_URL = (process.env.COCKPIT_API_URL || 'https://api.presenceia.com').replace(/\/$/, '')
export const COCKPIT_API_KEY = process.env.COCKPIT_API_KEY || ''

export function isAdminEmail(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}

export async function requireAdmin(req: NextRequest): Promise<{ ok: true; user: any } | { ok: false; status: number; error: string }> {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return { ok: false, status: 401, error: 'Unauthorized' }
  const user = await getUserFromToken(token)
  if (!user) return { ok: false, status: 401, error: 'Unauthorized' }
  if (user.role !== 'admin' && !isAdminEmail(user.email)) return { ok: false, status: 403, error: 'Forbidden' }
  return { ok: true, user }
}

export async function cockpitFetch(path: string, init: RequestInit = {}) {
  if (!COCKPIT_API_KEY) throw new Error('COCKPIT_API_KEY is not configured')
  const res = await fetch(`${COCKPIT_API_URL}/api/presenceia/admin/${path.replace(/^\//, '')}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Cockpit-Key': COCKPIT_API_KEY, ...(init.headers || {}) },
    cache: 'no-store',
  })
  const text = await res.text()
  let body: any = null
  try { body = text ? JSON.parse(text) : null } catch { body = { raw: text } }
  return { status: res.status, body }
}
