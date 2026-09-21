import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword, signToken } from '@/lib/auth'
import { isAdminEmail } from '@/lib/cockpit'

export async function POST(req: NextRequest) {
  const { email, password, fullName } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const { data: existing } = await supabaseAdmin.from('users').select('id').eq('email', email).single()
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  const hash = await hashPassword(password)
  const role = isAdminEmail(email) ? 'admin' : 'client'
  const { data: user, error } = await supabaseAdmin.from('users').insert({ email, password_hash: hash, full_name: fullName, role }).select().single()
  if (error || !user) return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  const token = signToken({ userId: user.id, role: user.role, email: user.email })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, role: user.role }, token })
  res.cookies.set('auth_token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 604800 })
  return res
}
