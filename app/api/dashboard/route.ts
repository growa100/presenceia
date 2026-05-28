import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUserFromToken(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [profile, jobs, reports] = await Promise.all([
    supabaseAdmin.from('client_profiles').select('*').eq('user_id', user.id).single(),
    supabaseAdmin.from('agent_jobs').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('geo_reports').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(6),
  ])
  return NextResponse.json({ user: { id: user.id, email: user.email, fullName: user.full_name, plan: user.plan, subscriptionStatus: user.subscription_status }, profile: profile.data, recentJobs: jobs.data || [], reports: reports.data || [] })
}
