'use client'
import { useState } from 'react'
import Link from 'next/link'
import { RefreshCw, Pause, Play } from 'lucide-react'
import { Card, Kpi, Badge, Spinner, ErrorBox, LineChart, useApi, api, pct, btnLight } from '@/components/cockpit/ui'

type Overview = {
  days: number; generated_at: string
  settings: Record<string, any>; kill_switch_env: boolean
  funnel: Record<string, number | null>
  pipeline: Record<string, number>
  series: Record<string, { day: string; value: number }[]>
  by_sector: Row[]; by_region: Row[]
  mailboxes: { email: string; cap: number; sent_today: number }[]
  replies_by_class: Record<string, number>
}
type Row = { key: string; contacted: number; visited: number; replied: number; won: number; visit_rate: number | null; reply_rate: number | null }

export default function OverviewPage() {
  const [days, setDays] = useState(30)
  const { data, error, loading, reload, setData } = useApi<Overview>(`overview?days=${days}`, [days])
  const [busy, setBusy] = useState(false)

  const togglePause = async (paused: boolean) => {
    if (!data) return
    setBusy(true)
    try {
      const r = await api<{ settings: Record<string, any> }>('settings', { method: 'PUT', body: JSON.stringify({ outreach_paused: paused }) })
      setData({ ...data, settings: r.settings })
    } catch (e: any) { alert(e.message) } finally { setBusy(false) }
  }

  if (error) return <ErrorBox msg={`Cockpit indisponible : ${error}`} />
  if (!data) return <div className="flex items-center gap-3 text-sm text-ink/50"><Spinner /> Chargement…</div>

  const f = data.funnel, p = data.pipeline, s = data.settings
  const paused = !!s.outreach_paused
  const live = data.kill_switch_env && !paused
  const sentToday = data.mailboxes.reduce((a, m) => a + m.sent_today, 0)
  const capToday = Math.min(s.daily_send_cap ?? 0, data.mailboxes.reduce((a, m) => a + (m.cap || 0), 0))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Vue d’ensemble</h1>
          <p className="text-sm text-ink/50 mt-1">
            Prospection automatique · {live ? <Badge tone="green">en marche</Badge> : paused ? <Badge tone="amber">en pause</Badge> : <Badge tone="red">kill switch .env</Badge>}
            <span className="ml-2">{sentToday}/{capToday} emails aujourd’hui · fenêtre {s.send_window}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={days} onChange={e => setDays(+e.target.value)} className="bg-white border border-line rounded-xl px-3 py-2 text-sm">
            {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>{d} jours</option>)}
          </select>
          <button onClick={reload} className={btnLight} title="Rafraîchir"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          <button onClick={() => togglePause(!paused)} disabled={busy || !data.kill_switch_env}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${paused ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'} disabled:opacity-40`}>
            {paused ? <><Play className="w-4 h-4" />Reprendre les envois</> : <><Pause className="w-4 h-4" />Mettre en pause</>}
          </button>
        </div>
      </div>

      {/* Funnel */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi label="Sites prêts" value={f.sites_ready ?? 0} hint={`${p.ready_with_email_not_sent} avec email, pas encore envoyés`} />
        <Kpi label="Prospects contactés" value={f.prospects_contacted ?? 0} hint={`${f.emails_sent} emails (relances incluses)`} />
        <Kpi label="Ont visité leur site" value={f.visited ?? 0} hint={`taux de visite ${pct(f.visit_rate)}`} accent />
        <Kpi label="Ont ouvert l’offre" value={f.offer_viewed ?? 0} hint={`${pct(f.offer_rate)} des contactés`} />
        <Kpi label="Ont répondu" value={f.replied ?? 0} hint={`taux de réponse ${pct(f.reply_rate)}`} />
        <Kpi label="Gagnés" value={f.won ?? 0} hint={`${pct(f.win_rate)} · intéressés, RDV, activés`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Envois et visites par jour" sub="La visite du site remplace le taux d’ouverture : les pixels sont bloqués par Gmail/Outlook, une visite est une preuve d’intérêt réel." className="lg:col-span-2">
          <LineChart series={[
            { name: 'Emails envoyés', color: '#0A0A0F', points: data.series.sent },
            { name: 'Sites visités', color: '#E8372A', points: data.series.visited_sites },
            { name: 'Offre ouverte', color: '#D97706', points: data.series.offer_views },
            { name: 'Réponses', color: '#059669', points: data.series.replies },
          ]} />
        </Card>
        <Card title="Production de sites" sub="Sites générés chaque nuit par les cibles actives.">
          <LineChart height={180} series={[
            { name: 'Sites générés', color: '#2563EB', points: data.series.generated },
            { name: 'Désinscriptions', color: '#9CA3AF', points: data.series.unsubscribed },
          ]} />
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <Stat k="En attente de génération" v={p.pending_generation} />
            <Stat k="Prêts sans email" v={p.ready_without_email} />
            <Stat k="Emails en file" v={p.queued_emails} />
            <Stat k="Envois échoués" v={p.failed_emails} tone={p.failed_emails ? 'red' : undefined} />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Breakdown title="Par secteur" rows={data.by_sector} link={k => `/cockpit/prospects?sector=${encodeURIComponent(k)}`} />
        <Breakdown title="Par région" rows={data.by_region} link={k => `/cockpit/prospects?region=${encodeURIComponent(k)}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Boîtes d’envoi aujourd’hui" sub={`Plafond global ${s.daily_send_cap}/jour · ${s.daily_cap_per_inbox} par boîte par défaut`}>
          <div className="space-y-2">
            {data.mailboxes.map(m => (
              <div key={m.email} className="flex items-center gap-3 text-sm">
                <span className="w-56 truncate font-mono text-xs">{m.email}</span>
                <div className="flex-1 h-2 bg-ink/5 rounded-full overflow-hidden">
                  <div className="h-full bg-ink rounded-full" style={{ width: `${Math.min(100, (100 * m.sent_today) / Math.max(1, m.cap))}%` }} />
                </div>
                <span className="w-14 text-right tabular-nums text-xs text-ink/60">{m.sent_today}/{m.cap}</span>
              </div>
            ))}
            {!data.mailboxes.length && <p className="text-sm text-ink/40">Aucune boîte configurée (PRESENCEIA_INBOXES).</p>}
          </div>
        </Card>
        <Card title="Réponses reçues" sub={`Sur ${data.days} jours, classées automatiquement. Vous répondez à la main depuis Unibox.`}>
          {Object.keys(data.replies_by_class).length ? (
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.replies_by_class).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-2 bg-paper-2 border border-line rounded-xl px-3 py-2 text-sm">
                  <span className="capitalize">{k.replace(/_/g, ' ')}</span><span className="font-bold tabular-nums">{v}</span>
                </span>
              ))}
            </div>
          ) : <p className="text-sm text-ink/40">Aucune réponse sur la période.</p>}
          <p className="text-xs text-ink/40 mt-4">Généré {new Date(data.generated_at).toLocaleString('fr-CH')} · <Link href="/cockpit/direction" className="underline">régler volume et cibles</Link></p>
        </Card>
      </div>
    </div>
  )
}

function Stat({ k, v, tone }: { k: string; v: number; tone?: 'red' }) {
  return (
    <div className="bg-paper-2 rounded-xl px-3 py-2 flex items-center justify-between">
      <span className="text-ink/60">{k}</span><span className={`font-semibold tabular-nums ${tone === 'red' ? 'text-red-600' : ''}`}>{v}</span>
    </div>
  )
}

function Breakdown({ title, rows, link }: { title: string; rows: Row[]; link: (k: string) => string }) {
  return (
    <Card title={title} sub="Contactés → visités → réponses. Le taux de visite dit où l’offre accroche.">
      {rows.length ? (
        <table className="w-full text-sm">
          <thead><tr className="text-[11px] font-mono uppercase tracking-wider text-ink/40 text-left">
            <th className="pb-2 font-normal">{title.replace('Par ', '')}</th><th className="pb-2 font-normal text-right">Contactés</th>
            <th className="pb-2 font-normal text-right">Visites</th><th className="pb-2 font-normal text-right">Réponses</th><th className="pb-2 font-normal text-right">Gagnés</th>
          </tr></thead>
          <tbody>
            {rows.slice(0, 12).map(r => (
              <tr key={r.key} className="border-t border-line">
                <td className="py-2"><Link href={link(r.key)} className="hover:underline capitalize">{r.key || '?'}</Link></td>
                <td className="py-2 text-right tabular-nums">{r.contacted}</td>
                <td className="py-2 text-right tabular-nums">{r.visited} <span className="text-ink/40 text-xs">({pct(r.visit_rate)})</span></td>
                <td className="py-2 text-right tabular-nums">{r.replied} <span className="text-ink/40 text-xs">({pct(r.reply_rate)})</span></td>
                <td className="py-2 text-right tabular-nums font-semibold">{r.won}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p className="text-sm text-ink/40">Rien d’envoyé pour l’instant.</p>}
    </Card>
  )
}
