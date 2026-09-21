import { NextRequest, NextResponse } from 'next/server'
import { cockpitFetch, requireAdmin } from '@/lib/cockpit'

/** Authenticated proxy: /api/cockpit/<path>?query → backend /api/presenceia/admin/<path>?query */
async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { path } = await ctx.params
  const qs = req.nextUrl.search || ''
  const method = req.method
  const init: RequestInit = { method }
  if (method !== 'GET' && method !== 'DELETE') init.body = await req.text()
  try {
    const { status, body } = await cockpitFetch(path.join('/') + qs, init)
    return NextResponse.json(body, { status })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'cockpit backend unreachable' }, { status: 502 })
  }
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
