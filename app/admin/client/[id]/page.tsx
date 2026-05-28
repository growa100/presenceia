'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, RefreshCw, Zap, CheckCircle, XCircle, Clock,
  ExternalLink, Globe, Lock, AlertTriangle, ChevronDown,
  ChevronUp, Copy, Check, Play, ThumbsUp, ThumbsDown,
  BarChart3, FileText, Database, Search, Wifi
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Profile {
  business_name: string; city: string; category: string; website_url: string | null
  google_business_url: string | null; sftp_host: string | null; sftp_user: string | null
  sftp_path: string | null; languages: string[]; target_keywords: string[] | null
  onboarding_completed: boolean
}
interface JobResult {
  schema?: string
  content?: Record<string, { title?: string; content?: string; metaDescription?: string }>
  directories?: Array<{ name: string; status: string; url: string }>
  overallScore?: number; grade?: string; shareOfVoice?: number; summary?: string
  deployed?: boolean; [key: string]: unknown
}
interface Job {
  id: string; job_type: string; status: string; created_at: string
  completed_at: string | null; result: JobResult | null; error: string | null
}
interface Report {
  id: string; period: string; overall_score: number; previous_score: number | null
  grade: string; share_of_voice: number; platform_results: unknown; recommendations: unknown
}
interface ClientDetail {
  user: { id: string; email: string; full_name: string; plan: string; subscription_status: string; created_at: string }
  profile: Profile | null
  jobs: Job[]
  reports: Report[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const gradeColor  = (g: string) => ({ A: 'text-emerald-400', B: 'text-blue-400', C: 'text-amber-400', D: 'text-orange-400', F: 'text-red-400' }[g] || 'text-white/30')
const gradeBg     = (g: string) => ({ A: 'bg-emerald-500/10 border-emerald-500/20', B: 'bg-blue-500/10 border-blue-500/20', C: 'bg-amber-500/10 border-amber-500/20', D: 'bg-orange-500/10 border-orange-500/20', F: 'bg-red-500/10 border-red-500/20' }[g] || 'bg-white/5 border-white/10')
const jobLabel    = (t: string) => ({ schema_gen: 'Schema.org', content_write: 'Contenu IA', directory_submit: 'Annuaires', ai_monitor: 'Monitoring IA', report_gen: 'Rapport' }[t] || t)
const jobIcon     = (t: string) => ({ schema_gen: Database, content_write: FileText, directory_submit: Globe, ai_monitor: Search, report_gen: BarChart3 }[t] || Zap)

const AGENTS: Array<{
  type: string; label: string; desc: string
  requiresSftp: boolean; autoApply: boolean; emoji: string
}> = [
  { type: 'ai_monitor',       label: 'Scanner les IA',        desc: 'Interroge ChatGPT, Claude, Perplexity et calcule le score', requiresSftp: false, autoApply: true,  emoji: '🔍' },
  { type: 'schema_gen',       label: 'Générer Schema.org',    desc: 'Génère le balisage LocalBusiness + FAQ pour les IA',        requiresSftp: false, autoApply: false, emoji: '🏗️' },
  { type: 'content_write',    label: 'Écrire du contenu',     desc: 'Rédige des pages de service optimisées IA en FR/DE',        requiresSftp: false, autoApply: false, emoji: '✍️' },
  { type: 'directory_submit', label: 'Annuaires suisses',     desc: 'Prépare les données NAP pour les 10 annuaires suisses',     requiresSftp: false, autoApply: true,  emoji: '📋' },
]

// ── GEO Checklist ─────────────────────────────────────────────────────────────
function getChecklist(profile: Profile | null, reports: Report[], jobs: Job[]) {
  const lastReport = reports[0]
  const hasSchema   = jobs.some(j => j.job_type === 'schema_gen'       && (j.status === 'completed' || j.status === 'approved'))
  const hasContent  = jobs.some(j => j.job_type === 'content_write'    && (j.status === 'completed' || j.status === 'approved'))
  const hasDirs     = jobs.some(j => j.job_type === 'directory_submit' && (j.status === 'completed' || j.status === 'approved'))
  const hasMonitor  = jobs.some(j => j.job_type === 'ai_monitor'       && j.status === 'completed')

  return [
    { id: 'onboarding',  label: 'Onboarding complété',          ok: !!profile?.onboarding_completed, critical: true,  action: 'Demander au client de compléter le profil' },
    { id: 'website',     label: 'Site web renseigné',            ok: !!profile?.website_url,          critical: true,  action: 'Demander l\'URL du site au client' },
    { id: 'sftp',        label: 'Accès SFTP configuré',          ok: !!profile?.sftp_host,            critical: false, action: 'Demander les identifiants SFTP Infomaniak' },
    { id: 'gbp',         label: 'Google Business Profile',       ok: !!profile?.google_business_url,  critical: true,  action: 'Demander le lien Google Business au client' },
    { id: 'schema',      label: 'Schema.org déployé',            ok: hasSchema,                       critical: true,  action: 'Lancer l\'agent Schema.org ci-dessous' },
    { id: 'content',     label: 'Contenu IA optimisé',           ok: hasContent,                      critical: false, action: 'Lancer l\'agent Contenu IA ci-dessous' },
    { id: 'dirs',        label: 'Annuaires suisses soumis',      ok: hasDirs,                         critical: false, action: 'Lancer l\'agent Annuaires ci-dessous' },
    { id: 'monitor',     label: 'Premier scan IA effectué',      ok: hasMonitor,                      critical: true,  action: 'Lancer l\'agent Scanner les IA ci-dessous' },
    { id: 'keywords',    label: 'Mots-clés cibles définis',      ok: !!(profile?.target_keywords?.length), critical: false, action: 'Ajouter des mots-clés dans le profil' },
  ]
}

// ── Score ring mini ───────────────────────────────────────────────────────────
function MiniRing({ score, grade }: { score: number; grade: string }) {
  const size = 80; const sw = 6; const r = (size - sw) / 2; const circ = 2 * Math.PI * r
  const colors = { A: '#34D399', B: '#60A5FA', C: '#FBBF24', D: '#FB923C', F: '#F87171' }
  const color = colors[grade as keyof typeof colors] || '#6B7280'
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 4px ${color}60)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg leading-none" style={{ color }}>{score}</span>
        <span className="font-mono text-xs text-white/25">{grade}</span>
      </div>
    </div>
  )
}

// ── Job result viewer ─────────────────────────────────────────────────────────
function JobCard({ job, onApprove, onReject }: { job: Job; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const needsReview = job.status === 'completed' && (job.job_type === 'schema_gen' || job.job_type === 'content_write')
  const Icon = jobIcon(job.job_type)

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const statusConfig = {
    pending:   { color: 'text-white/30',     bg: 'bg-white/5',          label: 'En attente' },
    running:   { color: 'text-blue-400',     bg: 'bg-blue-500/10',      label: 'En cours…'  },
    completed: { color: 'text-amber-400',    bg: 'bg-amber-500/10',     label: needsReview ? 'À valider' : 'Terminé' },
    approved:  { color: 'text-emerald-400',  bg: 'bg-emerald-500/10',   label: 'Approuvé'   },
    rejected:  { color: 'text-red-400',      bg: 'bg-red-500/10',       label: 'Rejeté'     },
    failed:    { color: 'text-red-400',      bg: 'bg-red-500/10',       label: 'Échec'      },
  }[job.status] || { color: 'text-white/30', bg: 'bg-white/5', label: job.status }

  return (
    <div className={`rounded-2xl border transition-all ${needsReview ? 'border-amber-500/25 bg-amber-500/5' : 'border-white/5 bg-white/2'}`}>
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
          {job.status === 'running' ? <RefreshCw className={`w-4 h-4 ${statusConfig.color} animate-spin`} /> : <Icon className={`w-4 h-4 ${statusConfig.color}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white/80 text-sm font-medium">{jobLabel(job.job_type)}</p>
            {needsReview && <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">Révision requise</span>}
          </div>
          <p className="font-mono text-xs text-white/25">{new Date(job.created_at).toLocaleString('fr-CH')}</p>
        </div>
        <span className={`font-mono text-xs px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>{statusConfig.label}</span>
        {job.result && (open ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />)}
      </div>

      {open && job.result && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3">

          {/* Schema result */}
          {job.job_type === 'schema_gen' && job.result.schema && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-xs text-white/30 uppercase tracking-widest">Schema.org généré</p>
                <button onClick={() => copy(job.result!.schema as string)} className="flex items-center gap-1.5 text-xs font-mono text-white/30 hover:text-brand transition-colors">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <pre className="bg-black/30 rounded-xl p-4 text-xs text-emerald-300/80 overflow-auto max-h-64 font-mono leading-relaxed border border-white/5">
                {String(job.result.schema).slice(0, 1200)}{String(job.result.schema).length > 1200 ? '\n…' : ''}
              </pre>
              <p className="font-mono text-xs text-white/20 mt-2">
                {job.result.deployed ? '✓ Déployé via SFTP' : 'Non déployé (SFTP non configuré ou approbation requise)'}
              </p>
            </div>
          )}

          {/* Content result */}
          {job.job_type === 'content_write' && job.result.content && (
            <div>
              <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-2">Contenu généré</p>
              <div className="space-y-3">
                {['fr', 'de'].map(l => {
                  const c = (job.result!.content as Record<string, unknown>)[l] as { title?: string; content?: string; metaDescription?: string } | undefined
                  if (!c) return null
                  return (
                    <div key={l} className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-brand">{l.toUpperCase()}</span>
                        <button onClick={() => copy(JSON.stringify(c, null, 2))} className="flex items-center gap-1 text-xs text-white/20 hover:text-white transition-colors"><Copy className="w-3 h-3" />Copier</button>
                      </div>
                      <p className="text-white/70 text-sm font-semibold mb-1">{c.title}</p>
                      <p className="text-white/30 text-xs font-mono mb-2">{c.metaDescription}</p>
                      <p className="text-white/40 text-xs leading-relaxed line-clamp-4">{c.content}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Directory result */}
          {job.job_type === 'directory_submit' && job.result.directories && (
            <div>
              <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-3">Annuaires</p>
              <div className="grid grid-cols-2 gap-2">
                {(job.result.directories as Array<{ name: string; status: string; url: string }>).map((d) => (
                  <div key={d.name} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 border border-white/5">
                    <span className="text-white/60 text-xs">{d.name}</span>
                    <span className={`font-mono text-xs ${d.status === 'submitted' ? 'text-emerald-400' : d.status === 'manual_required' ? 'text-amber-400' : 'text-white/25'}`}>
                      {d.status === 'submitted' ? '✓' : d.status === 'manual_required' ? '⚠ Manuel' : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitor result */}
          {job.job_type === 'ai_monitor' && job.result.overallScore !== undefined && (
            <div className="flex items-center gap-6">
              <MiniRing score={job.result.overallScore as number} grade={job.result.grade as string} />
              <div>
                <p className="text-white/60 text-sm mb-1">Score: <span className="text-white font-semibold">{job.result.overallScore as number}/100</span></p>
                <p className="text-white/40 text-xs">Part de voix: <span className="text-white/70">{job.result.shareOfVoice as number}%</span></p>
                <p className="text-white/40 text-xs mt-1">{job.result.summary as string}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {job.error && <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20"><p className="text-red-400 text-xs font-mono">{job.error}</p></div>}

          {/* Approve / Reject buttons */}
          {needsReview && (
            <div className="flex gap-3 pt-2">
              <button onClick={() => onApprove(job.id)}
                className="flex items-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                <ThumbsUp className="w-4 h-4" />Approuver & Déployer
              </button>
              <button onClick={() => onReject(job.id)}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 px-4 py-2 rounded-xl text-sm font-medium transition-all">
                <ThumbsDown className="w-4 h-4" />Rejeter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [data, setData] = useState<ClientDetail | null>(null)
  const [launching, setLaunching] = useState<string | null>(null)

  const load = () => {
    fetch(`/api/admin/client/${id}`)
      .then(r => { if (r.status === 401 || r.status === 403) router.push('/login'); return r.json() })
      .then(setData)
  }
  useEffect(() => { load() }, [id])

  const launchAgent = async (jobType: string) => {
    setLaunching(jobType)
    await fetch('/api/admin/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: id, jobType })
    })
    setTimeout(() => { setLaunching(null); load() }, 3000)
  }

  const reviewAction = async (jobId: string, action: 'approve' | 'reject') => {
    await fetch('/api/admin/agents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, action })
    })
    load()
  }

  if (!data) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <RefreshCw className="w-5 h-5 text-brand animate-spin" />
    </div>
  )

  const { user, profile, jobs, reports } = data
  const lastReport = reports[0]
  const prevReport = reports[1]
  const checklist = getChecklist(profile, reports, jobs)
  const okCount = checklist.filter(c => c.ok).length
  const criticalMissing = checklist.filter(c => !c.ok && c.critical)
  const hasSftp = !!profile?.sftp_host
  const pendingReview = jobs.filter(j => j.status === 'completed' && (j.job_type === 'schema_gen' || j.job_type === 'content_write'))

  return (
    <div className="min-h-screen bg-ink">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Admin
        </Link>
        <span className="text-white/10">/</span>
        <span className="text-white/80 text-sm font-medium">{profile?.business_name || user.email}</span>
        {profile?.city && <span className="text-white/30 text-sm">{profile.city}</span>}
        <div className="flex items-center gap-2 ml-auto">
          {pendingReview.length > 0 && (
            <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full animate-pulse">
              {pendingReview.length} en attente de validation
            </span>
          )}
          <button onClick={load} className="p-2 text-white/30 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pt-20 px-6 pb-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">

          {/* ── LEFT COLUMN ───────────────────────────────────────────── */}
          <div className="col-span-4 space-y-5">

            {/* Score card */}
            <div className="glass-light rounded-3xl p-6 border border-white/5">
              <p className="font-mono text-xs text-white/25 tracking-widest mb-4">SCORE ACTUEL</p>
              <div className="flex items-center gap-5">
                {lastReport ? (
                  <>
                    <MiniRing score={lastReport.overall_score} grade={lastReport.grade} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-display text-4xl ${gradeColor(lastReport.grade)}`}>{lastReport.overall_score}</span>
                        <span className="text-white/25 text-sm">/100</span>
                        {prevReport && (
                          <div className="flex items-center gap-1 ml-2">
                            {lastReport.overall_score > prevReport.overall_score
                              ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                              : lastReport.overall_score < prevReport.overall_score
                              ? <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                              : <Minus className="w-3.5 h-3.5 text-white/25" />}
                            <span className={`font-mono text-xs ${lastReport.overall_score > prevReport.overall_score ? 'text-emerald-400' : lastReport.overall_score < prevReport.overall_score ? 'text-red-400' : 'text-white/25'}`}>
                              {lastReport.overall_score > prevReport.overall_score ? '+' : ''}{lastReport.overall_score - prevReport.overall_score}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${gradeBg(lastReport.grade)} ${gradeColor(lastReport.grade)}`}>Grade {lastReport.grade}</span>
                      <p className="font-mono text-xs text-white/20 mt-2">Part de voix: {lastReport.share_of_voice}%</p>
                      <p className="font-mono text-xs text-white/20">{lastReport.period}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 text-center py-4">
                    <p className="text-white/25 text-sm font-mono">Pas encore scanné</p>
                    <p className="text-white/15 text-xs mt-1">Lancez le scanner IA →</p>
                  </div>
                )}
              </div>
            </div>

            {/* Client info */}
            <div className="glass-light rounded-3xl p-6 border border-white/5">
              <p className="font-mono text-xs text-white/25 tracking-widest mb-4">PROFIL CLIENT</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Email',    value: user.email },
                  { label: 'Plan',     value: user.plan,                 highlight: true },
                  { label: 'Statut',   value: user.subscription_status },
                  { label: 'Ville',    value: profile?.city || '—' },
                  { label: 'Secteur',  value: profile?.category || '—' },
                  { label: 'Langues',  value: profile?.languages?.join(', ') || '—' },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/4 last:border-0">
                    <span className="font-mono text-xs text-white/25">{label}</span>
                    <span className={`text-xs font-medium ${highlight ? 'text-brand capitalize' : 'text-white/60'}`}>{value}</span>
                  </div>
                ))}
              </div>
              {profile?.website_url && (
                <a href={profile.website_url} target="_blank" rel="noopener"
                  className="flex items-center gap-2 mt-4 text-xs text-white/30 hover:text-brand transition-colors font-mono">
                  <ExternalLink className="w-3.5 h-3.5" />{profile.website_url}
                </a>
              )}
            </div>

            {/* Access status */}
            <div className="glass-light rounded-3xl p-6 border border-white/5">
              <p className="font-mono text-xs text-white/25 tracking-widest mb-4">ACCÈS DISPONIBLES</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Site web',         ok: !!profile?.website_url,          desc: profile?.website_url || 'Non renseigné' },
                  { label: 'Google Business',  ok: !!profile?.google_business_url,  desc: 'Lien GBP' },
                  { label: 'SFTP / Infomaniak', ok: hasSftp,                        desc: hasSftp ? `${profile?.sftp_host}` : 'Non configuré — déploiement désactivé' },
                ].map(({ label, ok, desc }) => (
                  <div key={label} className={`flex items-start gap-3 p-3 rounded-xl border ${ok ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-white/2 border-white/5'}`}>
                    <div className={`mt-0.5 flex-shrink-0 ${ok ? 'text-emerald-400' : 'text-white/15'}`}>
                      {ok ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${ok ? 'text-white/70' : 'text-white/25'}`}>{label}</p>
                      <p className="font-mono text-xs text-white/20 mt-0.5 truncate max-w-[180px]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score history */}
            {reports.length > 1 && (
              <div className="glass-light rounded-3xl p-6 border border-white/5">
                <p className="font-mono text-xs text-white/25 tracking-widest mb-4">HISTORIQUE</p>
                <div className="space-y-2">
                  {reports.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between">
                      <span className="font-mono text-xs text-white/30">{r.period}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand/60 rounded-full transition-all" style={{ width: `${r.overall_score}%` }} />
                        </div>
                        <span className={`font-mono text-xs font-bold w-8 text-right ${gradeColor(r.grade)}`}>{r.overall_score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────────────────── */}
          <div className="col-span-8 space-y-5">

            {/* GEO Checklist */}
            <div className="glass-light rounded-3xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-mono text-xs text-white/25 tracking-widest mb-1">CHECKLIST GEO</p>
                  <p className="text-white font-semibold">{okCount}/{checklist.length} éléments complétés</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full transition-all duration-700" style={{ width: `${(okCount / checklist.length) * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs text-white/40">{Math.round((okCount / checklist.length) * 100)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {checklist.map(item => (
                  <div key={item.id} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${item.ok ? 'bg-emerald-500/5 border-emerald-500/10' : item.critical ? 'bg-red-500/5 border-red-500/15' : 'bg-white/2 border-white/5'}`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {item.ok
                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                        : item.critical
                        ? <AlertTriangle className="w-4 h-4 text-red-400" />
                        : <Clock className="w-4 h-4 text-white/20" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.ok ? 'text-white/60 line-through' : item.critical ? 'text-white/80' : 'text-white/50'}`}>{item.label}</p>
                      {!item.ok && <p className="font-mono text-xs text-white/25 mt-0.5">{item.action}</p>}
                    </div>
                    {item.critical && !item.ok && (
                      <span className="font-mono text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full flex-shrink-0">Critique</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Agent launcher */}
            <div className="glass-light rounded-3xl p-6 border border-white/5">
              <p className="font-mono text-xs text-white/25 tracking-widest mb-5">AGENTS IA</p>
              <div className="grid grid-cols-2 gap-3">
                {AGENTS.map(agent => {
                  const isRunning = launching === agent.type
                  const lastJob = jobs.find(j => j.job_type === agent.type)
                  const needsDeploy = !hasSftp && !agent.autoApply
                  const statusDot = lastJob ? {
                    completed: '🟡', approved: '🟢', failed: '🔴', running: '🔵', pending: '⚪', rejected: '⚫'
                  }[lastJob.status] || '⚪' : '⚪'

                  return (
                    <div key={agent.type} className={`rounded-2xl p-4 border transition-all ${isRunning ? 'border-brand/30 bg-brand/5' : 'border-white/5 bg-white/2 hover:border-white/12 hover:bg-white/4'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{agent.emoji}</span>
                        <div className="flex items-center gap-2">
                          {needsDeploy && (
                            <div title="SFTP requis pour déploiement" className="text-amber-400/60">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {lastJob && <span title={`Dernier: ${lastJob.status}`} className="text-base leading-none">{statusDot}</span>}
                        </div>
                      </div>
                      <p className="text-white/80 text-sm font-semibold mb-1">{agent.label}</p>
                      <p className="text-white/30 text-xs leading-relaxed mb-4">{agent.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${agent.autoApply ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {agent.autoApply ? 'Auto' : 'Révision requise'}
                        </span>
                        <button
                          onClick={() => launchAgent(agent.type)}
                          disabled={isRunning || !profile?.onboarding_completed}
                          className="flex items-center gap-1.5 btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                          {isRunning ? <><RefreshCw className="w-3 h-3 animate-spin" />En cours</> : <><Play className="w-3 h-3" />Lancer</>}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {!profile?.onboarding_completed && (
                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/8 border border-amber-500/15 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Le client doit compléter l'onboarding avant de lancer des agents.
                </div>
              )}
            </div>

            {/* Job history */}
            <div className="glass-light rounded-3xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <p className="font-mono text-xs text-white/25 tracking-widest">HISTORIQUE DES AGENTS</p>
                {pendingReview.length > 0 && (
                  <span className="font-mono text-xs text-amber-400">{pendingReview.length} en attente</span>
                )}
              </div>
              {jobs.length === 0 ? (
                <p className="text-white/20 text-sm font-mono text-center py-6">Aucun agent lancé pour ce client.</p>
              ) : (
                <div className="space-y-2">
                  {jobs.map(job => (
                    <JobCard key={job.id} job={job} onApprove={(id) => reviewAction(id, 'approve')} onReject={(id) => reviewAction(id, 'reject')} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fix missing imports used inline
function TrendingUp({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> }
function TrendingDown({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg> }
function Minus({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="5" y1="12" x2="19" y2="12"/></svg> }
