// One stored analysis (full result), for its owner.
import { NextRequest, NextResponse } from 'next/server'
import { loadOwnAnalysis } from '@/lib/client-analysis'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const r = await loadOwnAnalysis(req, (await params).id)
  if (r.status !== 200) return NextResponse.json({ error: r.status === 401 ? 'login_required' : 'not_found' }, { status: r.status })
  return NextResponse.json({ ...r.data.result, checkId: r.data.id }, { headers: { 'Cache-Control': 'no-store' } })
}
