import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUserFromToken(token)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data: clients } = await supabaseAdmin.from('users').select('*, client_profiles(*)').eq('role', 'client').order('created_at', { ascending: false })
  const { data: leads } = await supabaseAdmin.from('leads').select('*').order('created_at', { ascending: false }).limit(50)
  const { data: checks } = await supabaseAdmin.from('visibility_checks').select('id, business_name, city, overall_score, grade, created_at').order('created_at', { ascending: false }).limit(20)
  return NextResponse.json({ clients: clients || [], leads: leads || [], recentChecks: checks || [] })
}
