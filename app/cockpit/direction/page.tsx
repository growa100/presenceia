'use client'
import { useEffect, useState } from 'react'
import { Plus, Play, Trash2, Save, MapPin } from 'lucide-react'
import { Card, Badge, Toggle, Spinner, ErrorBox, useApi, api, pct, inputCls, btnDark, btnLight } from '@/components/cockpit/ui'

type Target = {
  id: string; market: string; country: string; region_kind: 'canton' | 'city'; region: string
  lat: number | null; lng: number | null; radius_m: number; sector: string; queries: string[] | null
  priority: number; active: boolean; daily_quota: number; leads_found: number
  last_run_at: string | null; last_run_note: string | null; notes: string | null
  stats: { leads: number; sites: number; contacted: number; visited: number; replied: number }
}
type TargetsRes = { items: Target[]; known_cantons: string[]; known_fr_regions: string[]; known_sectors: string[] }
type SettingsRes = { settings: Record<string, any>; kill_switch_env: boolean }

const COUNTRIES: [string, string][] = [['CH', 'Suisse'], ['FR', 'France'], ['DE', 'Allemagne'], ['BE', 'Belgique'], ['LU', 'Luxembourg'], ['IT', 'Italie'], ['ES', 'Espagne'], ['GB', 'Royaume-Uni'], ['US', 'États-Unis'], ['CA', 'Canada']]

export default function DirectionPage() {
  const targets = useApi<TargetsRes>('targets')
  const settings = useApi<SettingsRes>('settings')
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Direction</h1>
        <p className="text-sm text-ink/50 mt-1">
          Où l’on cherche des entreprises (Google Maps), et à quel rythme. Chaque nuit à 01:30 le robot prend les cibles actives par priorité,
          trouve des entreprises, génère leur site, et les emails partent dans la fenêtre d’envoi. Tout le reste est automatique.
        </p>
      </div>
      {targets.error && <ErrorBox msg={targets.error} />}
      {targets.data ? <Targets res={targets.data} reload={targets.reload} /> : !targets.error && <Spinner />}
      {settings.data ? <Settings res={settings.data} reload={settings.reload} /> : settings.error ? <ErrorBox msg={settings.error} /> : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Targets                                                             */
/* ------------------------------------------------------------------ */

function Targets({ res, reload }: { res: TargetsRes; reload: () => void }) {
  const [open, setOpen] = useState(res.items.length === 0)
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const patch = async (t: Target, body: Partial<Target>) => {
    setBusy(t.id); setErr(null)
    try { await api(`targets/${t.id}`, { method: 'PATCH', body: JSON.stringify(body) }); reload() }
    catch (e: any) { setErr(e.message) } finally { setBusy(null) }
  }
  const remove = async (t: Target) => {
    if (!confirm(`Supprimer la cible ${t.sector} · ${t.region} ? Les prospects déjà trouvés sont conservés.`)) return
    setBusy(t.id)
    try { await api(`targets/${t.id}`, { method: 'DELETE' }); reload() } catch (e: any) { setErr(e.message) } finally { setBusy(null) }
  }
  const run = async (t: Target) => {
    setBusy(t.id); setErr(null)
    try { await api(`targets/${t.id}/run`, { method: 'POST' }); alert(`Recherche lancée pour ${t.sector} · ${t.region}. Les sites apparaissent dans Prospects d’ici quelques minutes.`) }
    catch (e: any) { setErr(e.message) } finally { setBusy(null) }
  }

  const active = res.items.filter(t => t.active)
  const quotaPerNight = active.reduce((a, t) => a + t.daily_quota, 0)

  return (
    <Card title="Cibles : régions × secteurs" sub={`${active.length} cible${active.length > 1 ? 's' : ''} active${active.length > 1 ? 's' : ''} · jusqu’à ${quotaPerNight} nouvelles entreprises par nuit si toutes tournent`}
      right={<button onClick={() => setOpen(o => !o)} className={btnDark}><Plus className="w-4 h-4" />Nouvelle cible</button>}>
      {err && <div className="mb-4"><ErrorBox msg={err} /></div>}
      {open && <NewTarget res={res} onDone={() => { setOpen(false); reload() }} />}

      {res.items.length ? (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-[11px] font-mono uppercase tracking-wider text-ink/40 text-left border-b border-line">
                <th className="py-2 font-normal">Actif</th><th className="py-2 font-normal">Secteur</th><th className="py-2 font-normal">Région</th>
                <th className="py-2 font-normal">Priorité</th><th className="py-2 font-normal">Quota/nuit</th>
                <th className="py-2 font-normal text-right">Trouvés</th><th className="py-2 font-normal text-right">Contactés</th>
                <th className="py-2 font-normal text-right">Visites</th><th className="py-2 font-normal text-right">Réponses</th>
                <th className="py-2 font-normal">Dernier run</th><th className="py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {res.items.map(t => (
                <tr key={t.id} className={`border-b border-line last:border-0 ${t.active ? '' : 'opacity-50'}`}>
                  <td className="py-3 pr-3"><Toggle on={t.active} disabled={busy === t.id} onChange={v => patch(t, { active: v })} /></td>
                  <td className="py-3 pr-3 font-medium capitalize">{t.sector}{res.known_sectors.includes(t.sector) ? '' : <span className="ml-1 text-[10px] text-ink/40">(libre)</span>}</td>
                  <td className="py-3 pr-3">
                    <span className="inline-flex items-center gap-1">
                      {t.region_kind === 'city' && <MapPin className="w-3 h-3 text-ink/40" />}
                      {t.region}
                      <span className="text-ink/40 text-xs">· {t.country}{t.region_kind === 'city' ? ` · ${Math.round(t.radius_m / 1000)} km` : ''}</span>
                    </span>
                    {t.region_kind === 'city' && !t.lat && <div className="text-[10px] text-red-600">non géolocalisée</div>}
                  </td>
                  <td className="py-3 pr-3">
                    <select value={t.priority} disabled={busy === t.id} onChange={e => patch(t, { priority: +e.target.value })} className="bg-white border border-line rounded-lg px-2 py-1 text-sm">
                      {[5, 4, 3, 2, 1].map(p => <option key={p} value={p}>{p === 5 ? '5 · max' : p === 1 ? '1 · min' : p}</option>)}
                    </select>
                  </td>
                  <td className="py-3 pr-3">
                    <input type="number" min={1} max={60} defaultValue={t.daily_quota} disabled={busy === t.id}
                      onBlur={e => { const v = +e.target.value; if (v && v !== t.daily_quota) patch(t, { daily_quota: v }) }}
                      className="w-16 bg-white border border-line rounded-lg px-2 py-1 text-sm tabular-nums" />
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">{t.stats.leads}<span className="text-ink/40 text-xs"> ({t.stats.sites} sites)</span></td>
                  <td className="py-3 pr-3 text-right tabular-nums">{t.stats.contacted}</td>
                  <td className="py-3 pr-3 text-right tabular-nums">{t.stats.visited} <span className="text-ink/40 text-xs">({pct(t.stats.contacted ? (100 * t.stats.visited) / t.stats.contacted : null)})</span></td>
                  <td className="py-3 pr-3 text-right tabular-nums">{t.stats.replied} <span className="text-ink/40 text-xs">({pct(t.stats.contacted ? (100 * t.stats.replied) / t.stats.contacted : null)})</span></td>
                  <td className="py-3 pr-3 text-xs text-ink/60">
                    {t.last_run_at ? new Date(t.last_run_at).toLocaleString('fr-CH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : <Badge>jamais</Badge>}
                    {t.last_run_note && <div className="text-[10px] text-ink/40 max-w-[180px] truncate" title={t.last_run_note}>{t.last_run_note}</div>}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button onClick={() => run(t)} disabled={busy === t.id} title="Chercher maintenant" className={`${btnLight} !px-2.5`}><Play className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(t)} disabled={busy === t.id} title="Supprimer" className={`${btnLight} !px-2.5 ml-1 hover:!bg-red-50 hover:!text-red-600`}><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !open && <p className="text-sm text-ink/40">Aucune cible. Ajoutez-en une : le robot ne cherche rien tant que la liste est vide.</p>}
    </Card>
  )
}

function NewTarget({ res, onDone }: { res: TargetsRes; onDone: () => void }) {
  const [kind, setKind] = useState<'canton' | 'city'>('canton')
  const [country, setCountry] = useState('CH')
  const [region, setRegion] = useState('')
  const [sector, setSector] = useState(res.known_sectors[0] || '')
  const [freeSector, setFreeSector] = useState(false)
  const [radius, setRadius] = useState(20)
  const [priority, setPriority] = useState(3)
  const [quota, setQuota] = useState(10)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => { if (country !== 'CH' && kind === 'canton') setKind('city') }, [country, kind])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null)
    try {
      await api('targets', {
        method: 'POST',
        body: JSON.stringify({
          market: country, country, region_kind: kind, region: region.trim(), sector: sector.trim(),
          radius_m: radius * 1000, priority, daily_quota: quota, active: true, notes: notes || null,
        }),
      })
      onDone()
    } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="bg-paper-2 border border-line rounded-2xl p-4 mb-5 grid md:grid-cols-6 gap-3 items-end">
      <Field label="Pays">
        <select value={country} onChange={e => setCountry(e.target.value)} className={inputCls}>
          {COUNTRIES.map(([c, l]) => <option key={c} value={c}>{l}</option>)}
        </select>
      </Field>
      <Field label="Type de zone">
        <select value={kind} onChange={e => setKind(e.target.value as any)} className={inputCls}>
          <option value="canton" disabled={country !== 'CH'}>Canton (CH)</option>
          <option value="city">Ville + rayon</option>
        </select>
      </Field>
      <Field label={kind === 'canton' ? 'Canton' : 'Ville'} className="md:col-span-2">
        {kind === 'canton' ? (
          <select value={region} onChange={e => setRegion(e.target.value)} className={inputCls} required>
            <option value="">Choisir…</option>
            {res.known_cantons.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <input value={region} onChange={e => setRegion(e.target.value)} placeholder="Lyon, Annecy, Munich…" className={inputCls} required list="fr-regions" />
        )}
        <datalist id="fr-regions">{res.known_fr_regions.map(r => <option key={r} value={r} />)}</datalist>
      </Field>
      {kind === 'city' && (
        <Field label={`Rayon : ${radius} km`}>
          <input type="range" min={5} max={100} step={5} value={radius} onChange={e => setRadius(+e.target.value)} className="w-full accent-ink" />
        </Field>
      )}
      <Field label="Secteur" className="md:col-span-2">
        {freeSector ? (
          <input value={sector} onChange={e => setSector(e.target.value)} placeholder="ex. physiothérapeute" className={inputCls} required />
        ) : (
          <select value={sector} onChange={e => setSector(e.target.value)} className={inputCls}>
            {res.known_sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <button type="button" onClick={() => { setFreeSector(f => !f); setSector('') }} className="text-[11px] text-ink/50 underline mt-1">
          {freeSector ? 'choisir dans la liste' : 'secteur libre (Google Maps)'}
        </button>
      </Field>
      <Field label="Priorité">
        <select value={priority} onChange={e => setPriority(+e.target.value)} className={inputCls}>
          {[5, 4, 3, 2, 1].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Quota / nuit">
        <input type="number" min={1} max={60} value={quota} onChange={e => setQuota(+e.target.value)} className={inputCls} />
      </Field>
      <Field label="Note (optionnel)" className="md:col-span-3">
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="pourquoi cette cible" className={inputCls} />
      </Field>
      <div className="md:col-span-6 flex items-center gap-3">
        <button type="submit" disabled={busy} className={btnDark}><Plus className="w-4 h-4" />{busy ? 'Ajout…' : 'Ajouter la cible'}</button>
        {err && <span className="text-sm text-red-600">{err}</span>}
        <span className="text-xs text-ink/40 ml-auto">Un secteur libre utilise le texte tel quel comme recherche Google Maps.</span>
      </div>
    </form>
  )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] font-mono uppercase tracking-wider text-ink/45 mb-1">{label}</span>
      {children}
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

const FIELDS: { key: string; label: string; hint: string; type: 'int' | 'float' | 'text' }[] = [
  { key: 'daily_send_cap', label: 'Emails par jour (total)', hint: 'Plafond global toutes boîtes confondues. Montez par paliers (24 → 50 → 100 → 200).', type: 'int' },
  { key: 'daily_cap_per_inbox', label: 'Emails par boîte et par jour', hint: 'Défaut par boîte ; une boîte peut avoir son propre cap dans PRESENCEIA_INBOXES.', type: 'int' },
  { key: 'sends_per_beat', label: 'Emails par battement', hint: 'Combien d’emails partent à chaque tour du planificateur (toutes les quelques minutes). 1 = étalé, naturel.', type: 'int' },
  { key: 'send_window', label: 'Fenêtre d’envoi (UTC)', hint: 'Format HH:MM-HH:MM. 08:00-17:00 UTC = 10h–19h en Suisse l’été.', type: 'text' },
  { key: 'daily_site_target', label: 'Sites générés par nuit', hint: 'Combien de sites le générateur produit chaque nuit, pris dans les prospects trouvés.', type: 'int' },
  { key: 'targeting_runs_per_night', label: 'Cibles travaillées par nuit', hint: 'Le robot prend les N cibles actives les plus prioritaires (puis les moins récentes).', type: 'int' },
  { key: 'min_google_rating', label: 'Note Google minimum', hint: 'On n’envoie pas de site aux entreprises en dessous (elles sont moins réceptives).', type: 'float' },
]

function Settings({ res, reload }: { res: SettingsRes; reload: () => void }) {
  const [form, setForm] = useState<Record<string, any>>(res.settings)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => setForm(res.settings), [res.settings])

  const save = async () => {
    setBusy(true); setMsg(null)
    try {
      const body: Record<string, any> = {}
      for (const f of FIELDS) body[f.key] = f.type === 'text' ? String(form[f.key]) : Number(form[f.key])
      await api('settings', { method: 'PUT', body: JSON.stringify(body) })
      setMsg('Enregistré. Pris en compte dans la minute.'); reload()
    } catch (e: any) { setMsg(e.message) } finally { setBusy(false) }
  }

  return (
    <Card title="Volume et rythme" sub={res.kill_switch_env ? 'Ces réglages s’appliquent sans redéploiement.' : 'Kill switch actif dans le .env du serveur : rien ne part tant que PRESENCEIA_OUTREACH_ENABLED n’est pas à true.'}
      right={<button onClick={save} disabled={busy} className={btnDark}><Save className="w-4 h-4" />{busy ? 'Enregistrement…' : 'Enregistrer'}</button>}>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-ink/45 mb-1">{f.label}</label>
            <input value={form[f.key] ?? ''} type={f.type === 'text' ? 'text' : 'number'} step={f.type === 'float' ? 0.1 : 1} min={0}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })} className={inputCls} />
            <p className="text-xs text-ink/45 mt-1">{f.hint}</p>
          </div>
        ))}
        <div className="flex items-center gap-3 self-end pb-6">
          <Toggle on={!form.outreach_paused} onChange={async v => {
            setForm({ ...form, outreach_paused: !v })
            try { await api('settings', { method: 'PUT', body: JSON.stringify({ outreach_paused: !v }) }); reload() } catch (e: any) { setMsg(e.message) }
          }} />
          <div>
            <div className="text-sm font-medium">{form.outreach_paused ? 'Envois en pause' : 'Envois actifs'}</div>
            <div className="text-xs text-ink/45">La génération de sites continue ; seuls les emails s’arrêtent.</div>
          </div>
        </div>
      </div>
      {msg && <p className={`text-sm mt-4 ${msg.startsWith('Enregistré') ? 'text-emerald-700' : 'text-red-600'}`}>{msg}</p>}
    </Card>
  )
}
