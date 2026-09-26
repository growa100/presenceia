// Step 2 of the free check: the visitor types the code, gets a 30-day session and becomes a lead.
import { NextRequest, NextResponse } from 'next/server'
import { setSession, verifyChallenge } from '@/lib/checker-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let body: { challenge?: string; code?: string; language?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const email = verifyChallenge(body.challenge || '', body.code || '')
  if (!email) return NextResponse.json({ error: 'invalid_code' }, { status: 401 })

  // Verified email = lead. Never overwrite what a previous check stored for this email.
  await supabaseAdmin.from('leads').upsert(
    { email, language: body.language || 'fr', source: 'visibility_checker' },
    { onConflict: 'email', ignoreDuplicates: true },
  )

  const res = NextResponse.json({ email })
  setSession(res, email)
  return res
}
