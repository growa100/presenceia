'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, TrendingUp, BarChart3, Settings, LogOut, Play, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react'

interface DashboardData {
  user: { email: string; fullName: string; plan: string; subscriptionStatus: string }
  profile: { business_name: string; city: string; category: string; onboarding_completed: boolean } | null
  recentJobs: Array<{ id: string; job_type: string; status: string; created_at: string; result?: Record<string, unknown> }>
  reports: Array<{ period: string; overall_score: number; grade: string; share_of_voice: number }>
}

const jobTypeLabels: Record<string, string> = { schema_gen: 'Génération Schema.org', content_write: 'Rédaction contenu', directory_submit: 'Soumission annuaires', ai_monitor: 'Monitoring IA', report_gen: 'Rapport mensuel' }
const statusIcons: Record<string, React.ReactNode> = { completed: <CheckCircle className="w-4 h-4 text-green-400" />, pending: <Clock className="w-4 h-4 text-yellow-400" />, running: <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />, failed: <XCircle className="w-4 h-4 text-red-400" /> }
const gradeColors: Record<string, string> = { A: 'text-green-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-red-400', F: 'text-gray-400' }

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [runningJob, setRunningJob] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r => { if (r.status === 401) router.push('/login'); return r.json() }).then(setData).catch(() => router.push('/login'))
  }, [router])

  const runAgent = async (type: string) => {
    setRunningJob(type)
    await fetch('/api/agents/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobType: type }) })
    setTimeout(() => { setRunningJob(null); fetch('/api/dashboard').then(r=>r.json()).then(setData) }, 5000)
  }

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }

  if (!data) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-brand animate-spin" />
    </div>
  )

  const latestReport = data.reports[0]

  return (
    <div className="min-h-screen bg-ink">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 glass-dark border-r border-white/5 z-40 flex flex-col p-6">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 bg-brand rounded-sm flex items-center justify-center"><span className="text-white font-black text-sm">+</span></div>
          <span className="font-sans font-bold text-white">présence<span className="text-brand">ia</span></span>
        </Link>
        <nav className="space-y-1 flex-1">
          {[
            { icon: BarChart3, label: 'Dashboard', href: '/dashboard', active: true },
            { icon: TrendingUp, label: 'Rapports', href: '/dashboard/reports', active: false },
            { icon: Zap, label: 'Agents IA', href: '/dashboard/agents', active: false },
            { icon: Settings, label: 'Paramètres', href: '/dashboard/settings', active: false },
          ].map(({ icon: Icon, label, href, active }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-brand/15 text-brand' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-colors w-full">
          <LogOut className="w-4 h-4" />Se déconnecter
        </button>
      </div>

      {/* Main */}
      <div className="ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-3xl text-white mb-1">Bonjour, {data.user.fullName?.split(' ')[0] || data.user.email} 👋</h1>
              <p className="text-white/40 text-sm font-mono">Plan <span className="text-brand capitalize">{data.user.plan}</span> · {data.user.subscriptionStatus}</p>
            </div>
            {!data.profile?.onboarding_completed && (
              <Link href="/onboarding" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" />Compléter l'onboarding
              </Link>
            )}
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-light rounded-2xl p-6 border border-white/5">
              <p className="font-mono text-xs text-white/30 mb-3 tracking-widest">SCORE IA</p>
              <div className="flex items-end gap-2">
                <span className={`font-display text-5xl ${gradeColors[latestReport?.grade || 'F']}`}>{latestReport?.overall_score ?? '—'}</span>
                <span className="text-white/30 text-sm mb-1">/100</span>
              </div>
              <p className="text-xs text-white/25 font-mono mt-2">{latestReport?.period || 'Pas encore analysé'}</p>
            </div>
            <div className="glass-light rounded-2xl p-6 border border-white/5">
              <p className="font-mono text-xs text-white/30 mb-3 tracking-widest">GRADE</p>
              <span className={`font-display text-5xl ${gradeColors[latestReport?.grade || 'F']}`}>{latestReport?.grade || '—'}</span>
              <p className="text-xs text-white/25 font-mono mt-2">A → F scale</p>
            </div>
            <div className="glass-light rounded-2xl p-6 border border-white/5">
              <p className="font-mono text-xs text-white/30 mb-3 tracking-widest">PART DE VOIX IA</p>
              <span className="font-display text-5xl text-white">{latestReport?.share_of_voice ?? '—'}<span className="text-2xl text-white/30">%</span></span>
              <p className="text-xs text-white/25 font-mono mt-2">Des requêtes IA</p>
            </div>
          </div>

          {/* Agent actions */}
          <div className="glass-light rounded-3xl p-6 border border-white/5 mb-8">
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2"><Zap className="w-4 h-4 text-brand" />Agents IA</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: 'schema_gen', label: 'Générer Schema.org', emoji: '🏗️' },
                { type: 'content_write', label: 'Écrire du contenu', emoji: '✍️' },
                { type: 'directory_submit', label: 'Annuaires suisses', emoji: '📋' },
                { type: 'ai_monitor', label: 'Scan IA maintenant', emoji: '🔍' },
              ].map(({ type, label, emoji }) => (
                <button key={type} onClick={() => runAgent(type)} disabled={!!runningJob || !data.profile?.onboarding_completed}
                  className="glass-dark border border-white/5 hover:border-brand/30 rounded-xl p-4 text-left transition-all disabled:opacity-40 group">
                  <span className="text-2xl mb-2 block">{emoji}</span>
                  <span className="text-white/70 text-xs font-medium group-hover:text-white transition-colors">{label}</span>
                  {runningJob === type && <RefreshCw className="w-3 h-3 text-brand animate-spin mt-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Recent jobs */}
          <div className="glass-light rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold mb-5">Activité récente</h2>
            {data.recentJobs.length === 0 ? (
              <p className="text-white/25 text-sm font-mono">Aucune activité. Lancez un agent ci-dessus.</p>
            ) : (
              <div className="space-y-3">
                {data.recentJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      {statusIcons[job.status] || <Clock className="w-4 h-4 text-white/20" />}
                      <div>
                        <p className="text-white/70 text-sm">{jobTypeLabels[job.job_type] || job.job_type}</p>
                        <p className="font-mono text-xs text-white/25">{new Date(job.created_at).toLocaleDateString('fr-CH')}</p>
                      </div>
                    </div>
                    <span className={`font-mono text-xs px-2 py-1 rounded-full ${job.status==='completed'?'bg-green-500/10 text-green-400':job.status==='running'?'bg-blue-500/10 text-blue-400':job.status==='failed'?'bg-red-500/10 text-red-400':'bg-white/5 text-white/30'}`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
