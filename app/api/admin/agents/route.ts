import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createJob, runSchemaAgent, runContentAgent, runDirectoryAgent, runMonitorAgent, AgentJobType } from '@/lib/agents'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await getUserFromToken(token)
  if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { clientId, jobType, topic } = await req.json() as { clientId: string; jobType: AgentJobType; topic?: string }

  const { data: profile } = await supabaseAdmin.from('client_profiles').select('*').eq('user_id', clientId).single()
  if (!profile) return NextResponse.json({ error: 'Client has no profile' }, { status: 400 })

  const ctx = {
    clientId,
    businessName: profile.business_name,
    city: profile.city,
    category: profile.category,
    websiteUrl: profile.website_url,
    sftpHost: profile.sftp_host,
    sftpUser: profile.sftp_user,
    sftpPassword: profile.sftp_password_encrypted,
    sftpPath: profile.sftp_path,
    languages: profile.languages || ['fr'],
  }

  const job = await createJob(clientId, jobType)
  if (!job) return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })

  // Fire async
  switch (jobType) {
    case 'schema_gen':      runSchemaAgent(ctx, job.id).catch(console.error); break
    case 'content_write':   runContentAgent(ctx, job.id, topic).catch(console.error); break
    case 'directory_submit':runDirectoryAgent(ctx, job.id).catch(console.error); break
    case 'ai_monitor':      runMonitorAgent(ctx, job.id).catch(console.error); break
  }

  return NextResponse.json({ jobId: job.id, status: 'started' })
}

// Approve a job result for deployment
export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await getUserFromToken(token)
  if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { jobId, action } = await req.json() as { jobId: string; action: 'approve' | 'reject' }

  const { data: job } = await supabaseAdmin.from('agent_jobs').select('*').eq('id', jobId).single()
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  if (action === 'approve') {
    // If schema job + sftp available, deploy now
    if (job.job_type === 'schema_gen' && job.result?.schema) {
      const { data: profile } = await supabaseAdmin.from('client_profiles').select('*').eq('user_id', job.client_id).single()
      if (profile?.sftp_host) {
        const ctx = { clientId: job.client_id, businessName: profile.business_name, city: profile.city, category: profile.category, sftpHost: profile.sftp_host, sftpUser: profile.sftp_user, sftpPassword: profile.sftp_password_encrypted, sftpPath: profile.sftp_path, languages: profile.languages || ['fr'] }
        const { deployViaFTP } = await import('@/lib/agents') as any
        if (deployViaFTP) await deployViaFTP(ctx, job.result.schema, 'schema.json').catch(console.error)
      }
    }
    await supabaseAdmin.from('agent_jobs').update({ status: 'approved', result: { ...job.result, approvedAt: new Date().toISOString(), approvedBy: admin.email } }).eq('id', jobId)
  } else {
    await supabaseAdmin.from('agent_jobs').update({ status: 'rejected' }).eq('id', jobId)
  }

  return NextResponse.json({ ok: true })
}
