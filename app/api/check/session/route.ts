// Who is the visitor, and how many free checks are left today.
import { NextRequest, NextResponse } from 'next/server'
import { freeChecksLeft, getSessionEmail } from '@/lib/checker-auth'

export async function GET(req: NextRequest) {
  const email = getSessionEmail(req)
  if (!email) return NextResponse.json({ email: null, left: 0 })
  return NextResponse.json({ email, left: await freeChecksLeft(email) })
}
