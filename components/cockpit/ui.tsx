'use client'
import { useEffect, useState, useCallback } from 'react'

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/cockpit/${path.replace(/^\//, '')}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = body?.error || body?.detail || `HTTP ${res.status}`
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return body as T
}

export function useApi<T = any>(path: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const reload = useCallback(() => {
    if (!path) return
    setLoading(true)
    api<T>(path).then(d => { setData(d); setError(null) }).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [path, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { reload() }, [reload])
  return { data, error, loading, reload, setData }
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

export function Card({ title, sub, right, children, className = '' }: {
  title?: string; sub?: string; right?: React.ReactNode; children: React.ReactNode; className?: string
}) {
  return (
    <section className={`bg-white border border-line rounded-2xl p-5 ${className}`}>
      {(title || right) && (
        <header className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
            {sub && <p className="text-xs text-ink/50 mt-0.5">{sub}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  )
}

export function Kpi({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: string; accent?: boolean }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <p className="text-[11px] font-mono uppercase tracking-wider text-ink/45">{label}</p>
      <p className={`text-3xl font-bold mt-2 tabular-nums ${accent ? 'text-brand' : 'text-ink'}`}>{value}</p>
      {hint && <p className="text-xs text-ink/50 mt-1">{hint}</p>}
    </div>
  )
}

export function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray' | 'green' | 'red' | 'amber' | 'blue' | 'brand' }) {
  const map = {
    gray: 'bg-ink/5 text-ink/60', green: 'bg-emerald-50 text-emerald-700', red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700', blue: 'bg-blue-50 text-blue-700', brand: 'bg-brand/10 text-brand',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap ${map[tone]}`}>{children}</span>
}

export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-40 ${on ? 'bg-emerald-500' : 'bg-ink/20'}`}>
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

export function Spinner() {
  return <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
}

export function ErrorBox({ msg }: { msg: string }) {
  return <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{msg}</div>
}

export const inputCls = 'w-full bg-paper-2 border border-line rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/40'
export const btnCls = 'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40'
export const btnDark = `${btnCls} bg-ink text-white hover:bg-ink-3`
export const btnLight = `${btnCls} bg-white border border-line text-ink hover:bg-paper-2`

export function pct(v: number | null | undefined) {
  return v == null ? '—' : `${v.toFixed(1)} %`
}
export function fmtDate(s?: string | null) {
  if (!s) return '—'
  const d = new Date(s)
  return d.toLocaleDateString('fr-CH', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })
}
export function fmtDay(s?: string | null) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('fr-CH', { day: '2-digit', month: 'short' })
}

/* ------------------------------------------------------------------ */
/* Chart (SVG, no dependency)                                          */
/* ------------------------------------------------------------------ */

export type Series = { name: string; color: string; points: { day: string; value: number }[] }

export function LineChart({ series, height = 220 }: { series: Series[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const n = series[0]?.points.length || 0
  if (!n) return <p className="text-sm text-ink/40">Pas encore de données.</p>
  const W = 800, H = height, padL = 36, padR = 12, padT = 12, padB = 28
  const max = Math.max(1, ...series.flatMap(s => s.points.map(p => p.value)))
  const x = (i: number) => padL + (i * (W - padL - padR)) / Math.max(1, n - 1)
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max)
  const ticks = [0, Math.ceil(max / 2), max]
  const days = series[0].points.map(p => p.day)
  const labelEvery = Math.max(1, Math.round(n / 8))

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none"
        onMouseLeave={() => setHover(null)}
        onMouseMove={e => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
          const px = ((e.clientX - r.left) / r.width) * W
          const i = Math.round(((px - padL) / (W - padL - padR)) * (n - 1))
          setHover(Math.min(n - 1, Math.max(0, i)))
        }}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#E6E1D6" strokeWidth="1" />
            <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#8a8a8a">{t}</text>
          </g>
        ))}
        {days.map((d, i) => (i % labelEvery === 0 || i === n - 1) && (
          <text key={d} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#8a8a8a">{fmtDay(d)}</text>
        ))}
        {series.map(s => {
          const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {hover != null && <circle cx={x(hover)} cy={y(s.points[hover].value)} r="3.5" fill={s.color} />}
            </g>
          )
        })}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="#0A0A0F" strokeOpacity="0.15" strokeDasharray="3 3" />}
      </svg>
      {hover != null && (
        <div className="absolute top-2 right-2 bg-ink text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg">
          <div className="font-mono text-white/60 mb-1">{fmtDay(days[hover])}</div>
          {series.map(s => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-white/80">{s.name}</span>
              <span className="ml-auto font-semibold tabular-nums">{s.points[hover].value}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {series.map(s => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-xs text-ink/60">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />{s.name}
          </span>
        ))}
      </div>
    </div>
  )
}
