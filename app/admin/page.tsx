'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Mail, Search, LogOut, RefreshCw, TrendingUp, TrendingDown, Minus, ExternalLink, ChevronRight } from 'lucide-react'

interface Client {
  id: string
  email: string
  full_name: string
  plan: string
  subscription_status: string
  created_at: string
  client_profiles: Array<{
    business_name: string
    city: string
    category: string
    onboarding_completed: boolean
    sftp_host: string | null
    website_url: string | null
  }>
}
interface Lead {
  id: string; email: string; business_name: string; city: string
  score: number; grade: string; created_at: string; contacted: boolean
}
interface Check {
  id: string; business_name: string; city: string
  overall_score: number; grade: string; created_at: string
}
interface AdminData { clients: Client[]; leads: Lead[]; recentChecks: Check[] }

const gradeColor = (g: string) => ({ A: 'text-emerald-400', B: 'text-blue-400', C: 'text-amber-400', D: 'text-orange-400', F: 'text-red-400' }[g] || 'text-white/30')
const gradeBg = (g: string) => ({ A: 'bg-emerald-500/10 border-emerald-500/20', B: 'bg-blue-500/10 border-blue-500/20', C: 'bg-amber-500/10 border-amber-500/20', D: 'bg-orange-500/10 border-orange-500/20', F: 'bg-red-500/10 border-red-500/20' }[g] || 'bg-white/5 border-white/10')
const planColor = (p: string) => ({ starter: 'text-white/50', growth: 'text-blue-400', domination: 'text-brand' }[p] || 'text-white/30')

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [tab, setTab] = useState<'clients' | 'leads' | 'checks'>('clients')
  const [search, setSearch] = useState('')

  const load = () => {
    fetch('/api/admin/clients')
      .then(r => { if (r.status === 401 || r.status === 403) router.push('/login'); return r.json() })
      .then(setData).catch(() => router.push('/login'))
  }
  useEffect(() => { load() }, [])

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }

  if (!data) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <RefreshCw className="w-5 h-5 text-brand animate-spin" />
    </div>
  )

  const filteredClients = data.clients.filter(c =>
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.client_profiles?.[0]?.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.client_profiles?.[0]?.city?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredLeads = data.leads.filter(l =>
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.business_name?.toLowerCase().includes(search.toLowerCase())
  )

  const activeClients = data.clients.filter(c => c.subscription_status === 'active').length
  const mrr = data.clients.filter(c => c.subscription_status === 'active').reduce((sum, c) => sum + ({ starter: 299, growth: 599, domination: 1199 }[c.plan] || 0), 0)

  return (
    <div className="min-h-screen bg-ink flex">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="fixed left-0 top-0 bottom-0 w-60 glass-dark border-r border-white/5 z-40 flex flex-col p-5">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-6 h-6 bg-brand rounded-sm flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xs">+</span>
          </div>
          <span className="font-sans font-bold text-white text-sm">présence<span className="text-brand">ia</span></span>
          <span className="font-mono text-xs text-brand bg-brand/10 px-1.5 py-0.5 rounded ml-auto">ADMIN</span>
        </Link>

        <nav className="space-y-0.5 flex-1">
          {([
            { key: 'clients', icon: Users,  label: 'Clients',  count: data.clients.length },
            { key: 'leads',   icon: Mail,   label: 'Leads',    count: data.leads.length },
            { key: 'checks',  icon: Search, label: 'Analyses', count: data.recentChecks.length },
          ] as const).map(({ key, icon: Icon, label, count }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === key ? 'bg-brand/15 text-brand' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <div className="flex items-center gap-2.5"><Icon className="w-4 h-4" />{label}</div>
              <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${tab === key ? 'bg-brand/20 text-brand' : 'bg-white/5 text-white/25'}`}>{count}</span>
            </button>
          ))}
        </nav>

        {/* MRR widget */}
        <div className="glass-light rounded-2xl p-4 border border-white/5 mb-4">
          <p className="font-mono text-xs text-white/25 mb-1">MRR EST.</p>
          <p className="font-display text-2xl text-white">CHF {mrr.toLocaleString()}</p>
          <p className="font-mono text-xs text-white/25 mt-1">{activeClients} clients actifs</p>
        </div>

        <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-colors w-full">
          <LogOut className="w-4 h-4" />Déconnexion
        </button>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="ml-60 flex-1 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl text-white">
                {tab === 'clients' ? 'Clients' : tab === 'leads' ? 'Leads' : 'Analyses gratuites'}
              </h1>
              <p className="text-white/30 text-sm font-mono mt-1">
                {tab === 'clients' ? `${data.clients.length} comptes · CHF ${mrr.toLocaleString()} MRR` :
                 tab === 'leads'   ? `${data.leads.length} leads capturés` :
                 `${data.recentChecks.length} analyses récentes`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={load} className="p-2 text-white/30 hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="input-dark px-4 py-2 rounded-xl text-sm w-52"
              />
            </div>
          </div>

          {/* ── CLIENTS TAB ──────────────────────────────────────────────── */}
          {tab === 'clients' && (
            <div className="space-y-3">
              {filteredClients.length === 0 ? (
                <div className="glass-light rounded-3xl p-12 border border-white/5 text-center">
                  <p className="text-white/25 font-mono text-sm">Aucun client pour l'instant.</p>
                </div>
              ) : filteredClients.map(client => {
                const profile = client.client_profiles?.[0]
                const hasSftp = !!profile?.sftp_host
                const hasWebsite = !!profile?.website_url
                const onboarded = !!profile?.onboarding_completed

                return (
                  <Link key={client.id} href={`/admin/client/${client.id}`}
                    className="group glass-light rounded-2xl border border-white/5 hover:border-white/12 transition-all duration-200 p-5 flex items-center gap-5 hover:-translate-y-0.5 block">

                    {/* Left: identity */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-white font-semibold text-sm truncate">
                          {profile?.business_name || client.full_name || client.email}
                        </p>
                        {profile?.city && (
                          <span className="font-mono text-xs text-white/30 flex-shrink-0">{profile.city}</span>
                        )}
                        {profile?.category && (
                          <span className="font-mono text-xs text-white/20 flex-shrink-0 hidden md:block">{profile.category}</span>
                        )}
                      </div>
                      <p className="text-white/30 text-xs font-mono truncate">{client.email}</p>
                    </div>

                    {/* Middle: access indicators */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <AccessBadge ok={onboarded}     label="Onboarding" />
                      <AccessBadge ok={hasWebsite}    label="Website" />
                      <AccessBadge ok={hasSftp}       label="SFTP" />
                    </div>

                    {/* Right: plan + status + arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`font-mono text-xs capitalize font-semibold ${planColor(client.plan)}`}>
                        {client.plan}
                      </span>
                      <span className={`font-mono text-xs px-2.5 py-1 rounded-full border ${client.subscription_status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-white/25 bg-white/5 border-white/5'}`}>
                        {client.subscription_status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* ── LEADS TAB ────────────────────────────────────────────────── */}
          {tab === 'leads' && (
            <div className="glass-light rounded-3xl border border-white/5 overflow-hidden">
              {filteredLeads.length === 0 ? (
                <div className="p-12 text-center"><p className="text-white/25 font-mono text-sm">Aucun lead pour l'instant.</p></div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Entreprise', 'Email', 'Score', 'Ville', 'Date', 'Action'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-mono text-xs text-white/25 tracking-widest">{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead, i) => (
                      <tr key={lead.id} className={`border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors ${i % 2 === 0 ? '' : 'bg-white/1'}`}>
                        <td className="px-5 py-3.5">
                          <p className="text-white/80 text-sm font-medium">{lead.business_name || '—'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-white/40 text-xs font-mono">{lead.email}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full border ${gradeBg(lead.grade)} ${gradeColor(lead.grade)}`}>
                            {lead.score}/100 · {lead.grade}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-white/30 text-xs">{lead.city || '—'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-mono text-xs text-white/20">{new Date(lead.created_at).toLocaleDateString('fr-CH')}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <a href={`mailto:${lead.email}?subject=Votre score de visibilité IA — Présence IA&body=Bonjour,%0A%0AJ'ai analysé la présence IA de ${encodeURIComponent(lead.business_name || 'votre entreprise')} et votre score est de ${lead.score}/100 (grade ${lead.grade}).%0A%0AJe peux vous aider à l'améliorer. Êtes-vous disponible pour un appel de 15 minutes ?%0A%0ACordialement`}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-brand hover:text-brand/80 transition-colors bg-brand/8 px-3 py-1.5 rounded-lg">
                            <Mail className="w-3 h-3" />Contacter
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── CHECKS TAB ───────────────────────────────────────────────── */}
          {tab === 'checks' && (
            <div className="glass-light rounded-3xl border border-white/5 overflow-hidden">
              {data.recentChecks.length === 0 ? (
                <div className="p-12 text-center"><p className="text-white/25 font-mono text-sm">Aucune analyse pour l'instant.</p></div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Entreprise', 'Ville', 'Score', 'Grade', 'Date'].map(h => (
                        <th key={h} className="text-left px-5 py-3 font-mono text-xs text-white/25 tracking-widest">{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentChecks.map((c, i) => (
                      <tr key={c.id} className={`border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors ${i % 2 === 0 ? '' : 'bg-white/1'}`}>
                        <td className="px-5 py-3.5"><p className="text-white/80 text-sm">{c.business_name}</p></td>
                        <td className="px-5 py-3.5"><p className="text-white/30 text-xs">{c.city}</p></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-brand rounded-full" style={{ width: `${c.overall_score}%` }} />
                            </div>
                            <span className="font-mono text-xs text-white/50">{c.overall_score}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${gradeBg(c.grade)} ${gradeColor(c.grade)}`}>{c.grade}</span>
                        </td>
                        <td className="px-5 py-3.5"><p className="font-mono text-xs text-white/20">{new Date(c.created_at).toLocaleDateString('fr-CH')}</p></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AccessBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono transition-colors ${ok ? 'bg-emerald-500/8 border-emerald-500/15 text-emerald-400' : 'bg-white/3 border-white/5 text-white/20'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-white/15'}`} />
      {label}
    </div>
  )
}
