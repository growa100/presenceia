import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createJob, runSchemaAgent, runContentAgent, runDirectoryAgent, runMonitorAgent, AgentJobType } from '@/lib/agents'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUserFromToken(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { jobType, topic } = await req.json() as { jobType: AgentJobType; topic?: string }
  const { data: profile } = await supabaseAdmin.from('client_profiles').select('*').eq('user_id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Complete onboarding first.' }, { status: 400 })
  const ctx = { clientId: user.id, businessName: profile.business_name, city: profile.city, category: profile.category, websiteUrl: profile.website_url, sftpHost: profile.sftp_host, sftpUser: profile.sftp_user, sftpPassword: profile.sftp_password_encrypted, sftpPath: profile.sftp_path, languages: profile.languages || ['fr'] }
  const job = await createJob(user.id, jobType)
  if (!job) return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  switch (jobType) {
    case 'schema_gen': runSchemaAgent(ctx, job.id).catch(console.error); break
    case 'content_write': runContentAgent(ctx, job.id, topic).catch(console.error); break
    case 'directory_submit': runDirectoryAgent(ctx, job.id).catch(console.error); break
    case 'ai_monitor': runMonitorAgent(ctx, job.id).catch(console.error); break
  }
  return NextResponse.json({ jobId: job.id, status: 'started' })
}
