'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, TrendingUp, Search, LogOut, RefreshCw, Mail, BarChart3 } from 'lucide-react'

interface AdminData {
  clients: Array<{ id: string; email: string; full_name: string; plan: string; subscription_status: string; created_at: string; client_profiles: Array<{ business_name: string; city: string; category: string }> }>
  leads: Array<{ id: string; email: string; business_name: string; city: string; score: number; grade: string; created_at: string }>
  recentChecks: Array<{ id: string; business_name: string; city: string; overall_score: number; grade: string; created_at: string }>
}

const gradeColors: Record<string, string> = { A: 'text-green-400 bg-green-500/10', B: 'text-blue-400 bg-blue-500/10', C: 'text-yellow-400 bg-yellow-500/10', D: 'text-red-400 bg-red-500/10', F: 'text-gray-400 bg-gray-500/10' }

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [tab, setTab] = useState<'clients'|'leads'|'checks'>('clients')

  useEffect(() => {
    fetch('/api/admin/clients').then(r => { if (r.status === 401 || r.status === 403) router.push('/login'); return r.json() }).then(setData).catch(() => router.push('/login'))
  }, [router])

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }

  if (!data) return <div className="min-h-screen bg-ink flex items-center justify-center"><RefreshCw className="w-6 h-6 text-brand animate-spin" /></div>

  return (
    <div className="min-h-screen bg-ink">
      <div className="fixed left-0 top-0 bottom-0 w-64 glass-dark border-r border-white/5 z-40 flex flex-col p-6">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 bg-brand rounded-sm flex items-center justify-center"><span className="text-white font-black text-sm">+</span></div>
          <span className="font-sans font-bold text-white">présence<span className="text-brand">ia</span></span>
          <span className="font-mono text-xs text-brand bg-brand/10 px-2 py-0.5 rounded-full ml-1">ADMIN</span>
        </Link>
        <nav className="space-y-1 flex-1">
          {[
            { icon: Users, label: 'Clients', key: 'clients', count: data.clients.length },
            { icon: Mail, label: 'Leads', key: 'leads', count: data.leads.length },
            { icon: Search, label: 'Analyses', key: 'checks', count: data.recentChecks.length },
          ].map(({ icon: Icon, label, key, count }) => (
            <button key={key} onClick={() => setTab(key as typeof tab)} className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab===key ? 'bg-brand/15 text-brand' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <div className="flex items-center gap-3"><Icon className="w-4 h-4" />{label}</div>
              <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded-full">{count}</span>
            </button>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white transition-colors w-full">
          <LogOut className="w-4 h-4" />Déconnexion
        </button>
      </div>

      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-3xl text-white mb-1">Administration</h1>
              <p className="text-white/40 text-sm font-mono">{data.clients.length} clients · {data.leads.length} leads · {data.recentChecks.length} analyses récentes</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-light rounded-2xl p-6 border border-white/5 text-center">
              <p className="font-display text-4xl text-white mb-1">{data.clients.length}</p>
              <p className="font-mono text-xs text-white/30">Clients actifs</p>
            </div>
            <div className="glass-light rounded-2xl p-6 border border-white/5 text-center">
              <p className="font-display text-4xl text-white mb-1">{data.leads.length}</p>
              <p className="font-mono text-xs text-white/30">Leads capturés</p>
            </div>
            <div className="glass-light rounded-2xl p-6 border border-white/5 text-center">
              <p className="font-display text-4xl text-white mb-1">{data.recentChecks.length}</p>
              <p className="font-mono text-xs text-white/30">Analyses récentes</p>
            </div>
          </div>

          {/* Content */}
          <div className="glass-light rounded-3xl p-6 border border-white/5">
            {tab === 'clients' && (
              <div>
                <h2 className="text-white font-semibold mb-5 flex items-center gap-2"><Users className="w-4 h-4 text-brand" />Clients</h2>
                <div className="space-y-3">
                  {data.clients.length === 0 ? <p className="text-white/25 text-sm font-mono">Aucun client pour l'instant.</p> :
                    data.clients.map(c => (
                      <div key={c.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-white/80 text-sm font-medium">{c.full_name || c.email}</p>
                          <p className="font-mono text-xs text-white/30">{c.email} · {c.client_profiles?.[0]?.business_name || 'Pas de profil'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-brand bg-brand/10 px-2 py-1 rounded-full capitalize">{c.plan}</span>
                          <span className={`font-mono text-xs px-2 py-1 rounded-full ${c.subscription_status==='active'?'text-green-400 bg-green-500/10':'text-white/30 bg-white/5'}`}>{c.subscription_status}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {tab === 'leads' && (
              <div>
                <h2 className="text-white font-semibold mb-5 flex items-center gap-2"><Mail className="w-4 h-4 text-brand" />Leads</h2>
                <div className="space-y-3">
                  {data.leads.map(l => (
                    <div key={l.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white/80 text-sm">{l.business_name} · {l.city}</p>
                        <p className="font-mono text-xs text-white/30">{l.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-xs font-bold px-2 py-1 rounded-full ${gradeColors[l.grade] || gradeColors['F']}`}>
                          {l.score}/100 · {l.grade}
                        </span>
                        <a href={`mailto:${l.email}?subject=Votre analyse IA — Présence IA`} className="text-white/20 hover:text-brand transition-colors"><Mail className="w-4 h-4" /></a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'checks' && (
              <div>
                <h2 className="text-white font-semibold mb-5 flex items-center gap-2"><Search className="w-4 h-4 text-brand" />Analyses récentes</h2>
                <div className="space-y-3">
                  {data.recentChecks.map(c => (
                    <div key={c.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white/80 text-sm">{c.business_name} · {c.city}</p>
                        <p className="font-mono text-xs text-white/30">{new Date(c.created_at).toLocaleDateString('fr-CH')}</p>
                      </div>
                      <span className={`font-mono text-xs font-bold px-2 py-1 rounded-full ${gradeColors[c.grade] || gradeColors['F']}`}>
                        {c.overall_score}/100 · {c.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
