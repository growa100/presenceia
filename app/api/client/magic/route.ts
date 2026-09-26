// Magic link landing: opens the 30-day session and goes to the client space (or `to`).
import { NextRequest, NextResponse } from 'next/server'
import { setSession, verifyMagicToken } from '@/lib/checker-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t') || ''
  const toParam = req.nextUrl.searchParams.get('to') || '/espace-client'
  const to = toParam.startsWith('/') && !toParam.startsWith('//') ? toParam : '/espace-client'
  const email = verifyMagicToken(t)
  if (!email) return NextResponse.redirect(new URL('/espace-client?lien=expire', req.url))

  await supabaseAdmin.from('leads').upsert({ email, source: 'client_space' }, { onConflict: 'email', ignoreDuplicates: true })
  await supabaseAdmin.from('leads').update({ last_login_at: new Date().toISOString() }).eq('email', email)

  const res = NextResponse.redirect(new URL(to, req.url))
  setSession(res, email)
  return res
}
