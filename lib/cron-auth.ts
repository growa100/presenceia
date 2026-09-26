// Vercel crons call with "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set in the project.
import type { NextRequest } from 'next/server'

export function cronAllowed(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return req.headers.get('authorization') === `Bearer ${secret}`
}
