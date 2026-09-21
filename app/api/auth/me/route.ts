import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { isAdminEmail } from '@/lib/cockpit'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ user: null }, { status: 401 })
  const user = await getUserFromToken(token)
  if (!user) return NextResponse.json({ user: null }, { status: 401 })
  const role = user.role === 'admin' || isAdminEmail(user.email) ? 'admin' : user.role
  return NextResponse.json({ user: { id: user.id, email: user.email, role, plan: user.plan } })
}
