// Daily: re-analyse a few leads whose last analysis is 30+ days old, email the change (lib/nurture.ts).
import { NextRequest, NextResponse } from 'next/server'
import { cronAllowed } from '@/lib/cron-auth'
import { runRetests } from '@/lib/nurture'
import { baseUrl } from '@/lib/links'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  if (!cronAllowed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const out = await runRetests(baseUrl())
  console.log('[cron] retest', out)
  return NextResponse.json(out)
}
