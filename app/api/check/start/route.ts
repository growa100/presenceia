// Step 1 of the free check: human check + send a 6-digit code to the visitor's email.
import { NextRequest, NextResponse } from 'next/server'
import { clientIp, createChallenge, isValidEmail, normalizeEmail, sendCode, verifyHuman } from '@/lib/checker-auth'

export async function POST(req: NextRequest) {
  let body: { email?: string; turnstileToken?: string; language?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const email = normalizeEmail(body.email || '')
  if (!isValidEmail(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  if (!(await verifyHuman(body.turnstileToken, clientIp(req)))) {
    return NextResponse.json({ error: 'human_check_failed' }, { status: 403 })
  }

  const { code, challenge } = createChallenge(email)
  const sent = await sendCode(email, code, body.language || 'fr')
  if (!sent) return NextResponse.json({ error: 'email_failed' }, { status: 502 })

  return NextResponse.json({
    challenge,
    // Local dev only, so the flow can be tested without an email provider.
    ...(process.env.NODE_ENV !== 'production' && !process.env.RESEND_API_KEY ? { devCode: code } : {}),
  })
}
