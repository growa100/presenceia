import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUserFromToken(token)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const [userRes, profileRes, jobsRes, reportsRes] = await Promise.all([
    supabaseAdmin.from('users').select('*').eq('id', id).single(),
    supabaseAdmin.from('client_profiles').select('*').eq('user_id', id).single(),
    supabaseAdmin.from('agent_jobs').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(20),
    supabaseAdmin.from('geo_reports').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(6),
  ])

  return NextResponse.json({
    user: userRes.data,
    profile: profileRes.data,
    jobs: jobsRes.data || [],
    reports: reportsRes.data || [],
  })
}
