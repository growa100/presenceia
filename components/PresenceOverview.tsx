'use client'
// Client space, top: the client's online presence at a glance (the "cockpit"). The website we
// made (screenshot, status, address), its real visitors, the Google rating, the AI visibility
// score, and the signals that make the site readable by Google and AI assistants.
// Data: /api/client/site (droplet, one entry per site) and /api/client/me (analyses).
import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, CalendarCheck, Check, Circle, ExternalLink, FileDown, Globe, Loader2, Lock, Mail, Radar, Sparkles, Star, X as XIcon } from 'lucide-react'
import type { Lang } from '@/lib/i18n'
import { OFFER, PLANS, chf, isMonthly, price, type PlanKey, type Term } from '@/lib/plans'
import { CONTACT } from '@/lib/site-copy'
import type { ScoringResult } from '@/lib/scoring-engine'
import { cn } from '@/lib/utils'
import type { Site } from './SiteSetup'
import { setupItem } from './UpgradeSheet'

type Analysis = { id: string; business_name: string; city: string; overall_score: number; created_at: string; mentions: number | null; total: number | null }
type Update = { id: string; kind: string; title: string; body: string | null; created_at: string }

const L = {
  fr: {
    label: 'Votre présence en ligne', site: 'Votre site web',
    st: { live: 'En ligne', pending: 'Mise en ligne en cours', temp: 'En ligne, adresse provisoire', todo: 'À finaliser', cancelled: 'Abonnement terminé' },
    view: 'Voir le site', manage: 'Réglages', since: (d: string) => `Client depuis le ${d}`, liveSince: (d: string) => `En ligne depuis le ${d}`,
    nextDomain: 'Prochaine étape : choisir votre nom de domaine.', nextDns: 'En attente du réglage DNS chez votre fournisseur.', nextLegal: 'Il reste vos informations légales à compléter.',
    finish: 'Terminer', shotPending: 'Aperçu en préparation',
    visits: 'Visites', last30: '30 derniers jours', people: (n: number) => `${n} ${n > 1 ? 'personnes' : 'personne'}`, pages: (n: number) => `${n} pages vues`,
    trend: (p: number) => `${p > 0 ? '+' : ''}${p} % vs les 30 jours d'avant`, first: 'Premières mesures en cours',
    firstSub: 'Nous comptons les vraies personnes, sans les robots ni vos propres visites depuis cet espace.',
    google: 'Note Google', reviews: (n: number) => `${n} avis`, onGoogle: 'Voir sur Google', noGoogle: 'Fiche Google non trouvée.',
    googleSub: 'Affichée sur votre site, c\'est l\'un des premiers signaux de confiance pour les IA.',
    ai: 'Visibilité IA', aiSub: (m: number | null, t: number | null) => m === null || t === null ? '' : `Cité par ${m} assistant${m > 1 ? 's' : ''} sur ${t}`,
    aiNone: 'Pas encore mesurée', aiNoneSub: (b: string) => `ChatGPT, Gemini, Claude et Perplexity recommandent-ils ${b} ? Réponse en 60 secondes.`,
    measure: 'Mesurer maintenant', remeasure: 'Refaire la mesure', aiMore: 'Être recommandé par les IA', measured: (d: string) => `Mesure du ${d}`,
    signals: 'Ce que Google et les IA voient', signalsSub: 'Tout ce qui rend votre site lisible par les moteurs et les assistants IA.',
    sig: {
      domain: 'Nom de domaine à votre nom', https: 'Connexion sécurisée (https)', mobile: 'Adapté au mobile', schema: 'Données structurées Schema.org',
      llms: 'Fichier llms.txt pour les assistants IA', sitemap: 'Plan du site pour Google', legal: 'Mentions légales et confidentialité',
    } as Record<string, string>,
    fix: { domain: 'Choisir', legal: 'Compléter' } as Record<string, string>,
    upgrade: 'Passer à Visibilité IA', upgradeSub: 'Mise en place en 2 semaines, puis suivi chaque mois. Vous payez seulement la différence.', ask: 'Une question ? Parler à Antoine',
    prog: 'Visibilité IA', active: 'Programme actif', progSince: (d: string) => `Programme démarré le ${d}`, nextM: (d: string) => `Prochaine mesure : ${d}`,
    firstPending: 'Première mesure en cours', firstPendingSub: 'ChatGPT, Gemini, Claude et Perplexity sont interrogés sur votre métier et votre ville. Le résultat s\'affiche ici dans quelques minutes.',
    delta: (n: number, d: string) => `${n > 0 ? '+' : ''}${n} point${Math.abs(n) > 1 ? 's' : ''} depuis le ${d}`, oneMeasure: 'La courbe se construit avec les mesures mensuelles.',
    assistants: 'Par assistant', cited: (p: number | null) => p ? `cité, n° ${p}` : 'cité', notCited: 'pas cité', instead: 'Les IA recommandent à votre place',
    details: 'Réponses détaillées', report: 'Rapport PDF', program: 'Votre programme', setupL: 'Mise en place (2 semaines)', monthlyL: 'Chaque mois',
    latest: 'Derniers travaux', custom: 'Un besoin sur mesure ? Plusieurs adresses, secteur très concurrentiel, lancement : parlons-en.', strategy: 'Point stratégie (30 min)', write: 'Écrire à Antoine',
    plan: (p: string, a: string, per: string) => `${p} · ${a} ${per}`, perMonth: '/ mois', perYear: '/ an',
  },
  de: {
    label: 'Ihre Online-Präsenz', site: 'Ihre Website',
    st: { live: 'Online', pending: 'Wird aufgeschaltet', temp: 'Online, provisorische Adresse', todo: 'Abzuschliessen', cancelled: 'Abonnement beendet' },
    view: 'Website ansehen', manage: 'Einstellungen', since: (d: string) => `Kunde seit ${d}`, liveSince: (d: string) => `Online seit ${d}`,
    nextDomain: 'Nächster Schritt: Ihre Domain wählen.', nextDns: 'Wartet auf die DNS-Einstellung bei Ihrem Anbieter.', nextLegal: 'Ihre rechtlichen Angaben fehlen noch.',
    finish: 'Abschliessen', shotPending: 'Vorschau wird erstellt',
    visits: 'Besuche', last30: 'Letzte 30 Tage', people: (n: number) => `${n} ${n > 1 ? 'Personen' : 'Person'}`, pages: (n: number) => `${n} Seitenaufrufe`,
    trend: (p: number) => `${p > 0 ? '+' : ''}${p} % gegenüber den 30 Tagen davor`, first: 'Erste Messungen laufen',
    firstSub: 'Wir zählen echte Personen, ohne Roboter und ohne Ihre eigenen Besuche aus diesem Bereich.',
    google: 'Google-Bewertung', reviews: (n: number) => `${n} Bewertungen`, onGoogle: 'Auf Google ansehen', noGoogle: 'Kein Google-Profil gefunden.',
    googleSub: 'Auf Ihrer Website sichtbar: eines der ersten Vertrauenssignale für die KI.',
    ai: 'KI-Sichtbarkeit', aiSub: (m: number | null, t: number | null) => m === null || t === null ? '' : `Von ${m} von ${t} Assistenten genannt`,
    aiNone: 'Noch nicht gemessen', aiNoneSub: (b: string) => `Empfehlen ChatGPT, Gemini, Claude und Perplexity ${b}? Antwort in 60 Sekunden.`,
    measure: 'Jetzt messen', remeasure: 'Neu messen', aiMore: 'Von der KI empfohlen werden', measured: (d: string) => `Messung vom ${d}`,
    signals: 'Was Google und die KI sehen', signalsSub: 'Alles, was Ihre Website für Suchmaschinen und KI-Assistenten lesbar macht.',
    sig: {
      domain: 'Domain auf Ihren Namen', https: 'Sichere Verbindung (https)', mobile: 'Für Mobilgeräte optimiert', schema: 'Strukturierte Daten Schema.org',
      llms: 'Datei llms.txt für KI-Assistenten', sitemap: 'Sitemap für Google', legal: 'Impressum und Datenschutz',
    } as Record<string, string>,
    fix: { domain: 'Wählen', legal: 'Ergänzen' } as Record<string, string>,
    upgrade: 'Zu KI-Sichtbarkeit wechseln', upgradeSub: 'Einrichtung in 2 Wochen, danach monatliche Begleitung. Sie bezahlen nur die Differenz.', ask: 'Eine Frage? Mit Antoine sprechen',
    prog: 'KI-Sichtbarkeit', active: 'Programm aktiv', progSince: (d: string) => `Programm gestartet am ${d}`, nextM: (d: string) => `Nächste Messung: ${d}`,
    firstPending: 'Erste Messung läuft', firstPendingSub: 'ChatGPT, Gemini, Claude und Perplexity werden zu Ihrem Fach und Ihrem Ort befragt. Das Ergebnis erscheint hier in wenigen Minuten.',
    delta: (n: number, d: string) => `${n > 0 ? '+' : ''}${n} Punkte seit ${d}`, oneMeasure: 'Die Kurve entsteht mit den monatlichen Messungen.',
    assistants: 'Pro Assistent', cited: (p: number | null) => p ? `genannt, Nr. ${p}` : 'genannt', notCited: 'nicht genannt', instead: 'Die KI empfiehlt an Ihrer Stelle',
    details: 'Detaillierte Antworten', report: 'PDF-Bericht', program: 'Ihr Programm', setupL: 'Einrichtung (2 Wochen)', monthlyL: 'Jeden Monat',
    latest: 'Letzte Arbeiten', custom: 'Ein massgeschneidertes Anliegen? Mehrere Standorte, starke Konkurrenz, Lancierung: sprechen wir darüber.', strategy: 'Strategiegespräch (30 Min.)', write: 'Antoine schreiben',
    plan: (p: string, a: string, per: string) => `${p} · ${a} ${per}`, perMonth: '/ Monat', perYear: '/ Jahr',
  },
  en: {
    label: 'Your online presence', site: 'Your website',
    st: { live: 'Live', pending: 'Going live', temp: 'Live, temporary address', todo: 'To finish', cancelled: 'Subscription ended' },
    view: 'See the website', manage: 'Settings', since: (d: string) => `Client since ${d}`, liveSince: (d: string) => `Live since ${d}`,
    nextDomain: 'Next step: choose your domain name.', nextDns: 'Waiting for the DNS setting at your provider.', nextLegal: 'Your legal details are still missing.',
    finish: 'Finish', shotPending: 'Preview on its way',
    visits: 'Visits', last30: 'Last 30 days', people: (n: number) => `${n} ${n > 1 ? 'people' : 'person'}`, pages: (n: number) => `${n} page views`,
    trend: (p: number) => `${p > 0 ? '+' : ''}${p} % vs the previous 30 days`, first: 'First measurements under way',
    firstSub: 'We count real people, without robots or your own visits from this space.',
    google: 'Google rating', reviews: (n: number) => `${n} reviews`, onGoogle: 'See on Google', noGoogle: 'No Google profile found.',
    googleSub: 'Shown on your website, it is one of the first trust signals for AI.',
    ai: 'AI visibility', aiSub: (m: number | null, t: number | null) => m === null || t === null ? '' : `Named by ${m} of ${t} assistants`,
    aiNone: 'Not measured yet', aiNoneSub: (b: string) => `Do ChatGPT, Gemini, Claude and Perplexity recommend ${b}? Answer in 60 seconds.`,
    measure: 'Measure now', remeasure: 'Measure again', aiMore: 'Get recommended by AI', measured: (d: string) => `Measured on ${d}`,
    signals: 'What Google and AI see', signalsSub: 'Everything that makes your website readable by search engines and AI assistants.',
    sig: {
      domain: 'Domain name in your name', https: 'Secure connection (https)', mobile: 'Mobile friendly', schema: 'Schema.org structured data',
      llms: 'llms.txt file for AI assistants', sitemap: 'Sitemap for Google', legal: 'Legal notice and privacy',
    } as Record<string, string>,
    fix: { domain: 'Choose', legal: 'Complete' } as Record<string, string>,
    upgrade: 'Move to AI visibility', upgradeSub: 'Set-up in 2 weeks, then monthly follow-up. You only pay the difference.', ask: 'A question? Talk to Antoine',
    prog: 'AI visibility', active: 'Programme active', progSince: (d: string) => `Programme started on ${d}`, nextM: (d: string) => `Next measurement: ${d}`,
    firstPending: 'First measurement under way', firstPendingSub: 'ChatGPT, Gemini, Claude and Perplexity are being asked about your trade and your town. The result shows here within a few minutes.',
    delta: (n: number, d: string) => `${n > 0 ? '+' : ''}${n} point${Math.abs(n) > 1 ? 's' : ''} since ${d}`, oneMeasure: 'The curve builds up with the monthly measurements.',
    assistants: 'Per assistant', cited: (p: number | null) => p ? `named, #${p}` : 'named', notCited: 'not named', instead: 'AI recommends instead of you',
    details: 'Detailed answers', report: 'PDF report', program: 'Your programme', setupL: 'Set-up (2 weeks)', monthlyL: 'Every month',
    latest: 'Latest work', custom: 'Something tailored? Several locations, a very competitive sector, a launch: let us talk.', strategy: 'Strategy call (30 min)', write: 'Write to Antoine',
    plan: (p: string, a: string, per: string) => `${p} · ${a} ${per}`, perMonth: '/ month', perYear: '/ year',
  },
}
type TT = typeof L.fr

const SIGNALS = ['domain', 'https', 'mobile', 'schema', 'llms', 'sitemap', 'legal'] as const

const fmt = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === 'de' ? 'de-CH' : lang === 'en' ? 'en-GB' : 'fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })

const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function state(site: Site, t: TT): { label: string; tone: 'green' | 'amber' | 'grey'; next: string | null; target: string } {
  if (site.status === 'cancelled') return { label: t.st.cancelled, tone: 'grey', next: null, target: 'site-setup' }
  if (site.status === 'live') return { label: t.st.live, tone: 'green', next: site.legal_done ? null : t.nextLegal, target: 'site-legal' }
  if (site.status === 'domain_pending') return { label: t.st.pending, tone: 'amber', next: site.domain_mode === 'existing' ? t.nextDns : null, target: 'site-domain' }
  if (site.domain_mode === 'later') return { label: t.st.temp, tone: 'amber', next: site.legal_done ? null : t.nextLegal, target: site.legal_done ? 'site-domain' : 'site-legal' }
  return { label: t.st.todo, tone: 'amber', next: t.nextDomain, target: 'site-domain' }
}

function Dot({ tone }: { tone: 'green' | 'amber' | 'grey' }) {
  const c = tone === 'green' ? 'bg-emerald-400' : tone === 'amber' ? 'bg-amber-400' : 'bg-white/40'
  return (
    <span className="relative flex w-2.5 h-2.5">
      {tone === 'green' && <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping', c)} />}
      <span className={cn('relative inline-flex rounded-full w-2.5 h-2.5', c)} />
    </span>
  )
}

const tile = 'rounded-2xl bg-white/[0.04] border border-white/10 p-5 md:p-6'
const tileLabel = 'font-mono text-[11px] tracking-[0.2em] uppercase text-white/45'

// ─── Website ───────────────────────────────────────────────────────────────────
function SiteTile({ site, t, lang }: { site: Site; t: TT; lang: Lang }) {
  const s = state(site, t)
  const url = site.live_url || site.preview_url
  const plan = site.plan && site.plan in PLANS ? site.plan as PlanKey : null
  const term = (site.term === 'm12' || site.term === 'year' || site.term === 'flex' ? site.term : 'm12') as Term
  const amount = plan === 'site' && isMonthly(plan) ? price(plan, term) : null
  const cur = site.market === 'FR' ? '€' : 'CHF'
  return (
    <div className={cn(tile, 'p-0 md:p-0 overflow-hidden flex flex-col')}>
      <a href={url} target="_blank" rel="noreferrer" className="block relative bg-gradient-to-br from-[#f7f5f0] to-[#ece8e0] aspect-[16/10] group">
        {site.preview_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={site.preview_image} alt={site.business_name || ''} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink/40">
            <Globe className="w-10 h-10" />
            <span className="font-mono text-xs uppercase tracking-widest">{t.shotPending}</span>
          </div>
        )}
      </a>
      <div className="p-5 md:p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-3">
          <p className={tileLabel}>{t.site}</p>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/85"><Dot tone={s.tone} />{s.label}</span>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 font-display text-2xl md:text-3xl text-white hover:text-white/80 break-all">
          {site.status === 'live' && <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />}{host(url)}
        </a>
        <p className="mt-1 text-sm text-white/50">
          {[plan && amount !== null ? t.plan(PLANS[plan].name[lang], `${cur} ${chf(amount)}`, term === 'year' ? t.perYear : t.perMonth) : plan ? PLANS[plan].name[lang] : null,
            site.live_at ? t.liveSince(fmt(site.live_at, lang)) : site.claimed_at ? t.since(fmt(site.claimed_at, lang)) : null].filter(Boolean).join(' · ')}
        </p>
        {s.next && (
          <button onClick={() => goTo(s.target)} className="mt-4 text-left rounded-xl bg-amber-400/10 border border-amber-400/25 px-4 py-3 text-sm text-amber-100 flex items-center justify-between gap-3">
            <span>{s.next}</span><span className="font-semibold whitespace-nowrap inline-flex items-center gap-1">{t.finish}<ArrowRight className="w-4 h-4" /></span>
          </button>
        )}
        <div className="flex-1" />
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90">
            {t.view}<ExternalLink className="w-4 h-4" />
          </a>
          <button onClick={() => goTo('site-setup')} className="inline-flex items-center gap-2 border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:border-white/50">
            {t.manage}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Visitors ──────────────────────────────────────────────────────────────────
function Spark({ series }: { series: { day: string; visits: number }[] }) {
  const max = Math.max(1, ...series.map(d => d.visits))
  const w = 300, h = 56, gap = 2, bw = (w - gap * (series.length - 1)) / series.length
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14" preserveAspectRatio="none" aria-hidden>
      {series.map((d, i) => {
        const bh = d.visits ? Math.max(3, (d.visits / max) * h) : 1.5
        return <rect key={d.day} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} rx={1.5}
          className={d.visits ? 'fill-brand' : 'fill-white/15'} />
      })}
    </svg>
  )
}

function VisitsTile({ site, t }: { site: Site; t: TT }) {
  const st = site.stats
  const young = !st || (st.visits === 0 && st.prev_visits === 0)
  const pct = st && st.prev_visits > 0 ? Math.round(((st.visits - st.prev_visits) / st.prev_visits) * 100) : null
  return (
    <div className={tile}>
      <div className="flex items-center justify-between gap-3">
        <p className={tileLabel}>{t.visits}</p>
        <span className="text-xs text-white/40">{t.last30}</span>
      </div>
      {young ? (
        <>
          <p className="mt-3 font-display text-2xl text-white">{t.first}</p>
          <p className="mt-2 text-sm text-white/55 leading-relaxed">{t.firstSub}</p>
        </>
      ) : (
        <>
          <p className="mt-2 font-display text-5xl text-white leading-none">{st!.visits}</p>
          <p className="mt-2 text-sm text-white/55">{t.people(st!.visitors)} · {t.pages(st!.page_views)}</p>
          {pct !== null && <p className={cn('mt-1 text-xs font-semibold', pct >= 0 ? 'text-emerald-400' : 'text-amber-300')}>{t.trend(pct)}</p>}
          <div className="mt-4"><Spark series={st!.series} /></div>
        </>
      )}
    </div>
  )
}

// ─── Google ────────────────────────────────────────────────────────────────────
function GoogleTile({ site, t }: { site: Site; t: TT }) {
  const g = site.google
  const r = g?.rating ?? null
  return (
    <div className={tile}>
      <p className={tileLabel}>{t.google}</p>
      {g && r !== null ? (
        <>
          <div className="mt-2 flex items-end gap-3">
            <span className="font-display text-5xl text-white leading-none">{r.toFixed(1).replace('.', ',')}</span>
            <span className="pb-1 flex">
              {[0, 1, 2, 3, 4].map(i => (
                <Star key={i} className={cn('w-4 h-4', r >= i + 0.75 ? 'fill-amber-400 text-amber-400' : r >= i + 0.25 ? 'fill-amber-400/50 text-amber-400' : 'text-white/25')} />
              ))}
            </span>
          </div>
          {g.reviews ? <p className="mt-2 text-sm text-white/55">{t.reviews(g.reviews)}</p> : null}
          <p className="mt-3 text-xs text-white/45 leading-relaxed">{t.googleSub}</p>
          {g.url && <a href={g.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-white/80">{t.onGoogle}<ArrowUpRight className="w-4 h-4" /></a>}
        </>
      ) : <p className="mt-3 text-sm text-white/55">{t.noGoogle}</p>}
    </div>
  )
}

// ─── AI visibility ─────────────────────────────────────────────────────────────
function AiTile({ site, analyses, bookingUrl, t, lang, onUpgrade }: { site: Site; analyses: Analysis[]; bookingUrl: string | null; t: TT; lang: Lang; onUpgrade?: () => void }) {
  const a = analyses[0]
  const biz = site.business_name || ''
  const measureHref = `/?b=${encodeURIComponent(biz)}&v=${encodeURIComponent(site.city || '')}#analyse`
  const score = a ? Math.max(0, Math.min(100, a.overall_score)) : 0
  const R = 34, C = 2 * Math.PI * R
  return (
    <div className={tile}>
      <p className={tileLabel}>{t.ai}</p>
      {a ? (
        <div className="mt-3 flex items-center gap-5">
          <svg viewBox="0 0 80 80" className="w-20 h-20 flex-shrink-0 -rotate-90" aria-hidden>
            <circle cx="40" cy="40" r={R} className="fill-none stroke-white/10" strokeWidth="7" />
            <circle cx="40" cy="40" r={R} className="fill-none stroke-brand" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * C} ${C}`} />
          </svg>
          <div>
            <p className="font-display text-4xl text-white leading-none">{score}<span className="text-base text-white/40">/100</span></p>
            <p className="mt-1.5 text-sm text-white/55">{t.aiSub(a.mentions, a.total)}</p>
            <p className="text-xs text-white/40 mt-0.5">{t.measured(fmt(a.created_at, lang))}</p>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 font-display text-2xl text-white">{t.aiNone}</p>
          <p className="mt-2 text-sm text-white/55 leading-relaxed">{t.aiNoneSub(biz)}</p>
        </>
      )}
      {onUpgrade ? (
        <div className="mt-5 rounded-xl bg-brand/10 border border-brand/30 p-4">
          <p className="text-sm text-white/80 leading-relaxed">{t.upgradeSub}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button onClick={onUpgrade} className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-2">
              <Sparkles className="w-4 h-4" />{t.upgrade}
            </button>
            <a href={measureHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/75 hover:text-white">
              <Radar className="w-4 h-4" />{a ? t.remeasure : t.measure}
            </a>
          </div>
          {bookingUrl && <a href={bookingUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white"><CalendarCheck className="w-3.5 h-3.5" />{t.ask}</a>}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href={measureHref} className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-2">
            <Radar className="w-4 h-4" />{a ? t.remeasure : t.measure}
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Signals ───────────────────────────────────────────────────────────────────
function SignalsTile({ site, t }: { site: Site; t: TT }) {
  const sig = site.signals || {}
  const done = SIGNALS.filter(k => sig[k]).length
  return (
    <div className={tile}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={tileLabel}>{t.signals}</p>
          <p className="mt-1.5 text-sm text-white/55 leading-relaxed max-w-md">{t.signalsSub}</p>
        </div>
        <span className="font-display text-3xl text-white whitespace-nowrap">{done}<span className="text-base text-white/40">/{SIGNALS.length}</span></span>
      </div>
      <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {SIGNALS.map(k => (
          <li key={k} className="flex items-start gap-2.5 text-sm">
            {sig[k]
              ? <span className="mt-px w-5 h-5 rounded-full bg-emerald-400/15 text-emerald-400 flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5" /></span>
              : <Circle className="mt-px w-5 h-5 text-amber-400/70 flex-shrink-0" />}
            <span className="min-w-0">
              <span className={sig[k] ? 'text-white/85' : 'text-white/60'}>{t.sig[k]}</span>
              {!sig[k] && t.fix[k] && site.status !== 'cancelled' && (
                <button onClick={() => goTo(k === 'legal' ? 'site-legal' : 'site-domain')} className="block mt-0.5 text-xs font-semibold text-amber-300 hover:text-amber-200">{t.fix[k]} →</button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── AI visibility programme (Visibilité IA clients) ──────────────────────────
const sameBiz = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

function History({ points }: { points: { at: string; score: number }[] }) {
  const w = 320, h = 90, pad = 6
  const xs = points.map((_, i) => points.length === 1 ? w / 2 : pad + (i * (w - 2 * pad)) / (points.length - 1))
  const ys = points.map(p => h - pad - (Math.max(0, Math.min(100, p.score)) / 100) * (h - 2 * pad))
  const line = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24" preserveAspectRatio="none" aria-hidden>
      {[25, 50, 75].map(g => <line key={g} x1={0} x2={w} y1={h - pad - (g / 100) * (h - 2 * pad)} y2={h - pad - (g / 100) * (h - 2 * pad)} className="stroke-white/10" strokeDasharray="3 4" />)}
      {points.length > 1 && <path d={`${line} L${xs.at(-1)},${h} L${xs[0]},${h} Z`} className="fill-brand/15" />}
      {points.length > 1 && <path d={line} className="fill-none stroke-brand" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r={3.5} className="fill-white" vectorEffect="non-scaling-stroke" />)}
    </svg>
  )
}

function AiProgram({ site, analyses, pending, t, lang }: { site: Site; analyses: Analysis[]; pending: boolean; t: TT; lang: Lang }) {
  const latest = analyses[0]
  const mine = latest ? analyses.filter(a => sameBiz(a.business_name, latest.business_name)) : []
  const points = [...mine].reverse().map(a => ({ at: a.created_at, score: a.overall_score }))
  const first = mine.at(-1)
  const [detail, setDetail] = useState<ScoringResult | null>(null)
  useEffect(() => {
    if (!latest) return
    let alive = true
    fetch(`/api/client/analysis/${latest.id}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(d => { if (alive) setDetail(d) }).catch(() => {})
    return () => { alive = false }
  }, [latest?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const next = latest ? new Date(new Date(latest.created_at).getTime() + 30 * 86400_000).toISOString() : null
  const score = latest ? Math.max(0, Math.min(100, latest.overall_score)) : 0
  const R = 40, C = 2 * Math.PI * R
  const competitors = (detail?.competitors || []).slice(0, 6)
  const byPlatform = detail?.platformResults || []
  return (
    <div className={tile}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className={tileLabel}>{t.prog}</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300"><Dot tone="green" />{t.active}</span>
        </div>
        {next && <span className="text-xs text-white/45">{t.nextM(fmt(next, lang))}</span>}
      </div>
      {!latest ? (
        <div className="mt-4 flex items-start gap-4">
          {pending ? <Loader2 className="w-8 h-8 text-brand animate-spin flex-shrink-0" /> : <Radar className="w-8 h-8 text-brand flex-shrink-0" />}
          <div>
            <p className="font-display text-2xl text-white">{pending ? t.firstPending : t.aiNone}</p>
            <p className="mt-1 text-sm text-white/55 leading-relaxed max-w-xl">{pending ? t.firstPendingSub : t.aiNoneSub(site.business_name || '')}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 grid md:grid-cols-[auto_1fr] gap-6 items-center">
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 96 96" className="w-24 h-24 flex-shrink-0 -rotate-90" aria-hidden>
                <circle cx="48" cy="48" r={R} className="fill-none stroke-white/10" strokeWidth="8" />
                <circle cx="48" cy="48" r={R} className="fill-none stroke-brand" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(score / 100) * C} ${C}`} />
              </svg>
              <div>
                <p className="font-display text-5xl text-white leading-none">{score}<span className="text-lg text-white/40">/100</span></p>
                <p className="mt-1.5 text-sm text-white/55">{t.aiSub(latest.mentions, latest.total)}</p>
                {first && first.id !== latest.id
                  ? <p className={cn('text-xs font-semibold mt-0.5', score - first.overall_score >= 0 ? 'text-emerald-400' : 'text-amber-300')}>{t.delta(score - first.overall_score, fmt(first.created_at, lang))}</p>
                  : <p className="text-xs text-white/40 mt-0.5">{t.measured(fmt(latest.created_at, lang))}</p>}
              </div>
            </div>
            <div>
              <History points={points} />
              {points.length < 2 && <p className="text-xs text-white/40">{t.oneMeasure}</p>}
            </div>
          </div>
          {byPlatform.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-mono uppercase tracking-widest text-white/40">{t.assistants}</p>
              <ul className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {byPlatform.map(p => (
                  <li key={p.platform} className={cn('rounded-xl border px-3 py-2.5', p.appeared ? 'border-emerald-400/30 bg-emerald-400/[0.06]' : 'border-white/10 bg-white/[0.03]')}>
                    <p className="text-sm font-semibold text-white">{p.platformLabel}</p>
                    <p className={cn('text-xs mt-0.5 inline-flex items-center gap-1', p.appeared ? 'text-emerald-300' : 'text-white/45')}>
                      {p.appeared ? <Check className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />}{p.appeared ? t.cited(p.position) : t.notCited}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {competitors.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-mono uppercase tracking-widest text-white/40">{t.instead}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {competitors.map(c => <span key={c.name} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75">{c.name}{c.count > 1 ? <span className="text-white/40"> ×{c.count}</span> : null}</span>)}
              </div>
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button onClick={() => goTo('analyses')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-white/80">{t.details}<ArrowRight className="w-4 h-4" /></button>
            <a href={`/api/client/analysis/${latest.id}/pdf?lang=${lang}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/75 hover:text-white"><FileDown className="w-4 h-4" />{t.report}</a>
          </div>
        </>
      )}
    </div>
  )
}

function ProgramTile({ since, updates, bookingUrl, t, lang }: { since: string | null; updates: Update[]; bookingUrl: string | null; t: TT; lang: Lang }) {
  const O = OFFER[lang]
  const work = updates.filter(u => u.kind === 'work').slice(0, 3)
  return (
    <div className={tile}>
      <p className={tileLabel}>{t.program}</p>
      {since && <p className="mt-1.5 text-sm text-white/55">{t.progSince(fmt(since, lang))}</p>}
      <p className="mt-4 text-xs font-mono uppercase tracking-widest text-white/40">{t.setupL}</p>
      <ul className="mt-2 space-y-1.5">{O.setup.map(x => <li key={x} className="flex gap-2 text-sm text-white/80 leading-relaxed"><Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />{setupItem(x)}</li>)}</ul>
      <p className="mt-4 text-xs font-mono uppercase tracking-widest text-white/40">{t.monthlyL}</p>
      <ul className="mt-2 space-y-1.5">{O.monthly.slice(0, 4).map(x => <li key={x} className="flex gap-2 text-sm text-white/80 leading-relaxed"><Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />{x}</li>)}</ul>
      {work.length > 0 && (
        <>
          <p className="mt-4 text-xs font-mono uppercase tracking-widest text-white/40">{t.latest}</p>
          <ul className="mt-2 space-y-1.5">{work.map(u => <li key={u.id} className="text-sm text-white/75"><span className="text-white/40 text-xs">{fmt(u.created_at, lang)} · </span>{u.title}</li>)}</ul>
        </>
      )}
      <div className="mt-5 rounded-xl bg-white/[0.05] border border-white/10 p-4">
        <p className="text-sm text-white/70 leading-relaxed">{t.custom}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          {bookingUrl && <a href={bookingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-ink px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90"><CalendarCheck className="w-4 h-4" />{t.strategy}</a>}
          <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/75 hover:text-white"><Mail className="w-4 h-4" />{t.write}</a>
        </div>
      </div>
    </div>
  )
}

// ─── The panel ─────────────────────────────────────────────────────────────────
export default function PresenceOverview({ sites, analyses, updates, plan, bookingUrl, lang, onUpgrade, pending }: {
  sites: Site[]; analyses: Analysis[]; updates: Update[]; plan: string | null; bookingUrl: string | null; lang: Lang
  onUpgrade: () => void; pending: boolean
}) {
  const t = L[lang] || L.fr
  if (!sites.length) return null
  const vis = (p: string | null | undefined) => p === 'visibility' || p === 'complete'
  return (
    <section className="rounded-3xl bg-ink text-white p-5 md:p-8 space-y-5">
      <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand">{t.label}</p>
      {sites.map(site => {
        const program = vis(plan) || vis(site.plan)
        const since = updates.find(u => u.title === 'upgraded')?.created_at || (program ? site.claimed_at || null : null)
        return (
          <div key={site.slug} className="space-y-5">
            <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5">
              <SiteTile site={site} t={t} lang={lang} />
              <div className="grid gap-5 content-start">
                <VisitsTile site={site} t={t} />
                <GoogleTile site={site} t={t} />
              </div>
            </div>
            {program ? (
              <>
                <AiProgram site={site} analyses={analyses} pending={pending} t={t} lang={lang} />
                <div className="grid lg:grid-cols-[1fr_1.35fr] gap-5">
                  <ProgramTile since={since} updates={updates} bookingUrl={bookingUrl} t={t} lang={lang} />
                  <SignalsTile site={site} t={t} />
                </div>
              </>
            ) : (
              <div className="grid lg:grid-cols-[1fr_1.35fr] gap-5">
                <AiTile site={site} analyses={analyses} bookingUrl={bookingUrl} t={t} lang={lang}
                  onUpgrade={site.status !== 'cancelled' && (plan === 'site' || site.plan === 'site') ? onUpgrade : undefined} />
                <SignalsTile site={site} t={t} />
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
