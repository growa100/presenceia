'use client'
import { Suspense, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ExternalLink, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, Badge, Spinner, ErrorBox, useApi, fmtDate, inputCls, btnLight } from '@/components/cockpit/ui'

type Prospect = {
  id: string; business_name: string; city: string; canton: string; sector: string; market: string
  email: string | null; phone: string | null; google_rating: number | null; google_reviews: number | null
  generated_site_slug: string | null; generated_site_url: string | null; site_status: string; outreach_status: string
  generated_at: string | null; sent_at: string | null; claimed_at: string | null
  visits: number; offer_views: number; first_visited_at: string | null; last_visited_at: string | null
  followup_j4_sent_at: string | null; followup_j8_sent_at: string | null
  email_meta: { from_account?: string; last_status?: string; steps?: number; unsubscribed?: boolean }
}
type Page = { page: number; per_page: number; total: number; items: Prospect[] }

const STATUS_TONE: Record<string, 'gray' | 'green' | 'red' | 'amber' | 'blue' | 'brand'> = {
  not_sent: 'gray', sent: 'blue', replied: 'amber', interested: 'green', demo_booked: 'green', not_interested: 'red',
}
const STATUS_LABEL: Record<string, string> = {
  not_sent: 'pas envoyé', sent: 'envoyé', replied: 'a répondu', interested: 'intéressé', demo_booked: 'RDV', not_interested: 'pas intéressé',
}

export default function ProspectsPage() {
  return <Suspense fallback={<Spinner />}><Prospects /></Suspense>
}

function Prospects() {
  const sp = useSearchParams(); const router = useRouter(); const pathname = usePathname()
  const get = (k: string) => sp.get(k) || ''
  const [q, setQ] = useState(get('q'))
  const page = Math.max(1, +(get('page') || 1))

  const qs = new URLSearchParams()
  for (const k of ['status', 'site_status', 'sector', 'region', 'visited', 'q']) if (get(k)) qs.set(k, get(k))
  qs.set('page', String(page)); qs.set('per_page', '50')
  const { data, error, loading } = useApi<Page>(`prospects?${qs.toString()}`, [qs.toString()])

  const setParam = (k: string, v: string) => {
    const n = new URLSearchParams(sp.toString())
    if (v) n.set(k, v); else n.delete(k)
    if (k !== 'page') n.delete('page')
    router.push(`${pathname}?${n.toString()}`)
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Prospects</h1>
          <p className="text-sm text-ink/50 mt-1">{data ? `${data.total} entreprises` : '…'} · un site généré par prospect, un email par site.</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); setParam('q', q) }} className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Nom d’entreprise" className={`${inputCls} pl-9 w-64`} />
          </div>
          <button className={btnLight}>Chercher</button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <Sel label="Statut" value={get('status')} onChange={v => setParam('status', v)} options={Object.entries(STATUS_LABEL)} />
        <Sel label="Site" value={get('site_status')} onChange={v => setParam('site_status', v)} options={[['ready', 'prêt'], ['pending', 'en attente'], ['failed', 'échoué']]} />
        <Sel label="Visite" value={get('visited')} onChange={v => setParam('visited', v)} options={[['true', 'a visité'], ['false', 'jamais visité']]} />
        <input value={get('sector')} onChange={e => setParam('sector', e.target.value)} placeholder="Secteur" className={`${inputCls} w-36`} />
        <input value={get('region')} onChange={e => setParam('region', e.target.value)} placeholder="Canton / ville" className={`${inputCls} w-36`} />
        {(get('status') || get('site_status') || get('visited') || get('sector') || get('region') || get('q')) && (
          <button onClick={() => router.push(pathname)} className="text-sm text-ink/50 underline px-2">effacer</button>
        )}
      </div>

      {error && <ErrorBox msg={error} />}
      <Card className="!p-0 overflow-x-auto">
        <table className="w-full text-sm min-w-[980px]">
          <thead>
            <tr className="text-[11px] font-mono uppercase tracking-wider text-ink/40 text-left border-b border-line">
              {['Entreprise', 'Lieu', 'Secteur', 'Google', 'Site', 'Email', 'Statut', 'Visites', 'Envoyé le', 'Boîte'].map(h => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && !data && <tr><td colSpan={10} className="px-4 py-10 text-center"><Spinner /></td></tr>}
            {data?.items.map(p => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper-2/60 align-top">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.business_name}</div>
                  {p.claimed_at && <Badge tone="green">activé</Badge>}
                </td>
                <td className="px-4 py-3 text-ink/70">{p.city}{p.canton ? <span className="text-ink/40"> · {p.canton}</span> : null}</td>
                <td className="px-4 py-3 text-ink/70 capitalize">{p.sector}</td>
                <td className="px-4 py-3 text-ink/70 tabular-nums">{p.google_rating ? `${p.google_rating} ★ (${p.google_reviews ?? 0})` : '—'}</td>
                <td className="px-4 py-3">
                  {p.generated_site_slug ? (
                    <a href={p.generated_site_url || `https://${p.generated_site_slug}.presenceia.com`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-ink hover:underline">
                      {p.generated_site_slug}<ExternalLink className="w-3 h-3 text-ink/40" />
                    </a>
                  ) : <Badge tone={p.site_status === 'failed' ? 'red' : 'gray'}>{p.site_status}</Badge>}
                </td>
                <td className="px-4 py-3">
                  {p.email ? <span className="font-mono text-xs">{p.email}</span> : <span className="text-ink/30">aucun</span>}
                  {p.email_meta?.unsubscribed && <div><Badge tone="red">désinscrit</Badge></div>}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[p.outreach_status] || 'gray'}>{STATUS_LABEL[p.outreach_status] || p.outreach_status}</Badge>
                  {p.email_meta?.steps ? <div className="text-[11px] text-ink/40 mt-1">{p.email_meta.steps} email{p.email_meta.steps > 1 ? 's' : ''}{p.email_meta.last_status === 'failed' ? ' · échec' : ''}</div> : null}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {p.visits > 0 ? (
                    <div>
                      <span className="font-semibold text-brand">{p.visits}</span>
                      {p.offer_views > 0 && <span className="text-ink/60"> · offre ×{p.offer_views}</span>}
                      <div className="text-[11px] text-ink/40">{fmtDate(p.last_visited_at)}</div>
                    </div>
                  ) : <span className="text-ink/30">—</span>}
                </td>
                <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                  {fmtDate(p.sent_at)}
                  {p.followup_j4_sent_at && <div className="text-[11px] text-ink/40">J+4 {fmtDate(p.followup_j4_sent_at)}</div>}
                  {p.followup_j8_sent_at && <div className="text-[11px] text-ink/40">J+8 {fmtDate(p.followup_j8_sent_at)}</div>}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-ink/50">{p.email_meta?.from_account || '—'}</td>
              </tr>
            ))}
            {data && !data.items.length && <tr><td colSpan={10} className="px-4 py-10 text-center text-ink/40">Aucun prospect avec ces filtres.</td></tr>}
          </tbody>
        </table>
      </Card>

      {data && pages > 1 && (
        <div className="flex items-center justify-end gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setParam('page', String(page - 1))} className={btnLight}><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-ink/60">page {page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setParam('page', String(page + 1))} className={btnLight}><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  )
}

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="bg-white border border-line rounded-xl px-3 py-2 text-sm">
      <option value="">{label} : tous</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}
