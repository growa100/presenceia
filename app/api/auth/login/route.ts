import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const { data: user } = await supabaseAdmin.from('users').select('*').eq('email', email).single()
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  const token = signToken({ userId: user.id, role: user.role, email: user.email })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, role: user.role, plan: user.plan }, token })
  res.cookies.set('auth_token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 604800 })
  return res
}
