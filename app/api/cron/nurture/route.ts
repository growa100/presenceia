// Daily: J+2 / J+5 / J+10 emails after the free analysis (lib/nurture.ts).
import { NextRequest, NextResponse } from 'next/server'
import { cronAllowed } from '@/lib/cron-auth'
import { runNurture } from '@/lib/nurture'
import { baseUrl } from '@/lib/links'

export const maxDuration = 120

export async function GET(req: NextRequest) {
  if (!cronAllowed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const out = await runNurture(baseUrl())
  console.log('[cron] nurture', out)
  return NextResponse.json(out)
}
