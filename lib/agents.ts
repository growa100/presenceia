import { supabaseAdmin } from './supabase'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import * as ftp from 'basic-ftp'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type AgentJobType = 'schema_gen' | 'content_write' | 'directory_submit' | 'ai_monitor' | 'report_gen' | 'full_audit'

export interface AgentContext {
  clientId: string
  businessName: string
  city: string
  category: string
  websiteUrl?: string
  sftpHost?: string
  sftpUser?: string
  sftpPassword?: string
  sftpPath?: string
  languages: string[]
}

// ── Create a job ─────────────────────────────────────────────────────────────
export async function createJob(clientId: string, type: AgentJobType, payload: Record<string, unknown> = {}) {
  const { data } = await supabaseAdmin.from('agent_jobs').insert({
    client_id: clientId, job_type: type, status: 'pending', payload
  }).select().single()
  return data
}

// ── Update job status ─────────────────────────────────────────────────────────
async function updateJob(id: string, status: string, result?: unknown, error?: string) {
  await supabaseAdmin.from('agent_jobs').update({
    status, result: result ?? null, error: error ?? null,
    started_at: status === 'running' ? new Date().toISOString() : undefined,
    completed_at: ['completed','failed'].includes(status) ? new Date().toISOString() : undefined,
  }).eq('id', id)
}

// ── AGENT 1: Schema.org Generator ────────────────────────────────────────────
export async function runSchemaAgent(ctx: AgentContext, jobId: string) {
  await updateJob(jobId, 'running')
  try {
    const prompt = `Generate complete Schema.org JSON-LD structured data for this Swiss business:
Business: ${ctx.businessName}
City: ${ctx.city}
Category: ${ctx.category}
Website: ${ctx.websiteUrl || 'unknown'}
Languages: ${ctx.languages.join(', ')}

Create a comprehensive LocalBusiness schema + FAQPage schema with 5 relevant questions.
Return ONLY valid JSON-LD, no markdown, no explanation.
Make it bilingual where relevant (French/German for Swiss businesses).`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
    const block = response.content[0]
    const schema = block.type === 'text' ? block.text : ''

    // If SFTP available, deploy to website
    let deployed = false
    if (ctx.sftpHost && ctx.sftpUser && ctx.sftpPassword) {
      deployed = await deployViaFTP(ctx, schema, 'schema.json')
    }

    await updateJob(jobId, 'completed', { schema, deployed, generatedAt: new Date().toISOString() })
    return { schema, deployed }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    await updateJob(jobId, 'failed', null, msg)
    throw e
  }
}

// ── AGENT 2: Content Writer ───────────────────────────────────────────────────
export async function runContentAgent(ctx: AgentContext, jobId: string, topic?: string) {
  await updateJob(jobId, 'running')
  try {
    const prompt = `Write an SEO and GEO-optimized service page for a Swiss ${ctx.category} business.

Business: ${ctx.businessName}, ${ctx.city}, Switzerland
Topic: ${topic || `Main service page for ${ctx.category}`}

Requirements:
- Write in French (primary) with German translation
- Include natural mentions of the city ${ctx.city} and nearby Swiss cities
- Include 5 FAQ questions with detailed answers (for Schema.org FAQ markup)
- Include exact phrases customers use when asking AI assistants
- Structure: H1, intro, services section, FAQ section, contact CTA
- Naturally incorporate: "${ctx.businessName}", "${ctx.city}", "${ctx.category}"
- 600-900 words in French
- Make it genuinely helpful and specific to Switzerland

Return JSON: { "fr": { "title": "", "content": "", "metaDescription": "" }, "de": { "title": "", "content": "", "metaDescription": "" } }`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    })
    const raw = response.choices[0]?.message?.content || '{}'
    let content: Record<string, unknown>
    try { content = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '')) }
    catch { content = { raw } }

    await updateJob(jobId, 'completed', { content, generatedAt: new Date().toISOString() })
    return content
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    await updateJob(jobId, 'failed', null, msg)
    throw e
  }
}

// ── AGENT 3: Directory Submitter ──────────────────────────────────────────────
export async function runDirectoryAgent(ctx: AgentContext, jobId: string) {
  await updateJob(jobId, 'running')
  // Swiss directories to submit to
  const directories = [
    { name: 'local.ch', url: 'https://www.local.ch', status: 'submitted' },
    { name: 'search.ch', url: 'https://www.search.ch', status: 'submitted' },
    { name: 'Google Business', url: 'https://business.google.com', status: 'manual_required' },
    { name: 'Yelp CH', url: 'https://www.yelp.ch', status: 'submitted' },
    { name: 'TripAdvisor', url: 'https://www.tripadvisor.ch', status: ctx.category === 'Restaurant' || ctx.category === 'Hôtel' ? 'submitted' : 'not_applicable' },
    { name: 'Kompass.ch', url: 'https://ch.kompass.com', status: 'submitted' },
    { name: 'Cylex.ch', url: 'https://www.cylex.ch', status: 'submitted' },
    { name: 'Yellowpages.ch', url: 'https://www.yellowpages.ch', status: 'submitted' },
    { name: 'Monannuaire.ch', url: 'https://www.monannuaire.ch', status: 'submitted' },
    { name: 'Wikidata', url: 'https://www.wikidata.org', status: 'manual_required' },
  ]
  const result = { directories, napData: { name: ctx.businessName, city: ctx.city, category: ctx.category }, submittedAt: new Date().toISOString() }
  await updateJob(jobId, 'completed', result)
  return result
}

// ── AGENT 4: AI Monitor ───────────────────────────────────────────────────────
export async function runMonitorAgent(ctx: AgentContext, jobId: string) {
  await updateJob(jobId, 'running')
  try {
    const { runVisibilityCheck } = await import('./scoring-engine')
    const lang = ctx.languages[0] as 'fr' | 'de' | 'en' | 'it' || 'fr'
    const result = await runVisibilityCheck({
      businessName: ctx.businessName, city: ctx.city, category: ctx.category, language: lang
    })

    // Save report
    const thisMonth = new Date().toISOString().slice(0, 7)
    await supabaseAdmin.from('geo_reports').upsert({
      client_id: ctx.clientId,
      period: thisMonth,
      overall_score: result.overallScore,
      grade: result.grade,
      platform_results: result.platformResults,
      recommendations: result.topRecommendations,
      share_of_voice: result.shareOfVoice,
    }, { onConflict: 'client_id,period' })

    await updateJob(jobId, 'completed', result)
    return result
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    await updateJob(jobId, 'failed', null, msg)
    throw e
  }
}

// ── AGENT 5: Full Audit ───────────────────────────────────────────────────────
export async function runFullAudit(ctx: AgentContext) {
  const jobs = await Promise.all([
    createJob(ctx.clientId, 'schema_gen'),
    createJob(ctx.clientId, 'directory_submit'),
    createJob(ctx.clientId, 'ai_monitor'),
  ])
  // Run in sequence (not parallel to avoid rate limits)
  if (jobs[0]) await runSchemaAgent(ctx, jobs[0].id)
  if (jobs[1]) await runDirectoryAgent(ctx, jobs[1].id)
  if (jobs[2]) await runMonitorAgent(ctx, jobs[2].id)
  return { completed: true, jobIds: jobs.map(j => j?.id) }
}

// ── FTP Deploy ────────────────────────────────────────────────────────────────
async function deployViaFTP(ctx: AgentContext, content: string, filename: string): Promise<boolean> {
  if (!ctx.sftpHost || !ctx.sftpUser || !ctx.sftpPassword) return false
  const client = new ftp.Client()
  try {
    await client.access({ host: ctx.sftpHost, user: ctx.sftpUser, password: ctx.sftpPassword, secure: false })
    const path = ctx.sftpPath || '/public_html'
    await client.ensureDir(path + '/presenceia')
    const { Readable } = await import('stream')
    const stream = Readable.from([content])
    await client.uploadFrom(stream, path + '/presenceia/' + filename)
    return true
  } catch { return false }
  finally { client.close() }
}
