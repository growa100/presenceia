'use client'
import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CheckCircle2, XCircle, RefreshCw, ArrowRight, ChevronDown, Globe, Mail, Trophy, Quote, Sparkles, FileDown, LayoutDashboard } from 'lucide-react'
import type { ScoringResult, PlatformResult } from '@/lib/scoring-engine'
import type { Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { aggregateSources, answerDomains, cleanAnswer } from '@/lib/geo/present'
import AuditRequest from './AuditRequest'

interface Props { result: ScoringResult & { reportTo?: string; checkId?: string }; lang: Lang; onReset?: () => void; inDialog?: boolean }

const L = {
  fr: {
    named: (m: number, t: number) => m === 0 ? `Aucun des ${t} assistants ne vous cite` : `${m} assistant${m > 1 ? 's' : ''} sur ${t} vous cite${m > 1 ? 'nt' : ''}`,
    q: 'Question posée', answers: 'Ce que les IA répondent à vos clients', answersSub: 'Réponses réelles, obtenues à l\'instant avec la recherche web activée. Texte non modifié.', answersSubPast: 'Réponses réelles, obtenues avec la recherche web activée le jour de l\'analyse. Texte non modifié.',
    yes: (p: number | null) => p ? `Cité, position ${p}` : 'Cité', no: 'Pas cité', more: 'Lire toute la réponse', less: 'Réduire', failed: 'Pas de réponse de cet assistant pour le moment.',
    instead: 'Recommandés à votre place', insteadSub: 'Les entreprises que les IA proposent quand un client cherche votre métier dans votre ville.',
    of: (n: number, t: number) => `${n}/${t}`, sources: 'Où les IA vont chercher', sourcesSub: 'Les sites sur lesquels les assistants se sont appuyés. C\'est là que votre présence se joue.',
    diag: 'Diagnostic', actions: 'Vos 3 actions prioritaires',
    step: 'Étape suivante', auditTitle: 'Votre audit complet, offert', auditSub: 'En 30 minutes avec Antoine : votre site, votre fiche Google, les annuaires et vos avis passés en revue, et un plan d\'action écrit. Sans engagement.',
    auditBullets: ['30 minutes, par téléphone ou visio', 'Plan d\'action écrit, à garder', 'Sans engagement, sans frais'],
    auditCta: 'Réserver mon audit offert', follow: 'Ou directement l\'accompagnement : visibilité IA dès CHF 149 / mois', followLink: 'Voir les offres',
    report: (e: string) => `Rapport complet envoyé à ${e}`, again: 'Analyser une autre entreprise', example: 'exemple', pdf: 'Télécharger le PDF', space: 'Mon espace client',
  },
  de: {
    named: (m: number, t: number) => m === 0 ? `Keiner der ${t} Assistenten nennt Sie` : `${m} von ${t} Assistenten nennen Sie`,
    q: 'Gestellte Frage', answers: 'Was die KI Ihren Kunden antwortet', answersSub: 'Echte Antworten, soeben mit aktivierter Websuche abgerufen. Text unverändert.', answersSubPast: 'Echte Antworten, am Tag der Analyse mit aktivierter Websuche abgerufen. Text unverändert.',
    yes: (p: number | null) => p ? `Genannt, Position ${p}` : 'Genannt', no: 'Nicht genannt', more: 'Ganze Antwort lesen', less: 'Weniger', failed: 'Dieser Assistent hat im Moment nicht geantwortet.',
    instead: 'An Ihrer Stelle empfohlen', insteadSub: 'Die Betriebe, die die KI vorschlägt, wenn ein Kunde Ihren Beruf in Ihrem Ort sucht.',
    of: (n: number, t: number) => `${n}/${t}`, sources: 'Wo die KI sucht', sourcesSub: 'Die Websites, auf die sich die Assistenten gestützt haben. Dort entscheidet sich Ihre Sichtbarkeit.',
    diag: 'Diagnose', actions: 'Ihre 3 wichtigsten Massnahmen',
    step: 'Nächster Schritt', auditTitle: 'Ihr vollständiges Audit, kostenlos', auditSub: 'In 30 Minuten mit Antoine: Website, Google-Profil, Verzeichnisse und Bewertungen geprüft, dazu ein schriftlicher Aktionsplan. Unverbindlich.',
    auditBullets: ['30 Minuten, per Telefon oder Video', 'Schriftlicher Aktionsplan zum Behalten', 'Unverbindlich und kostenlos'],
    auditCta: 'Kostenloses Audit buchen', follow: 'Oder direkt die Begleitung: KI-Sichtbarkeit ab CHF 149 / Monat', followLink: 'Angebote ansehen',
    report: (e: string) => `Vollständiger Bericht an ${e} gesendet`, again: 'Anderes Unternehmen analysieren', example: 'Beispiel', pdf: 'PDF herunterladen', space: 'Mein Kundenbereich',
  },
  en: {
    named: (m: number, t: number) => m === 0 ? `None of the ${t} assistants names you` : `${m} of ${t} assistants name you`,
    q: 'Question asked', answers: 'What AI tells your customers', answersSub: 'Real answers, just obtained with web search switched on. Text unchanged.', answersSubPast: 'Real answers, obtained with web search switched on on the day of the analysis. Text unchanged.',
    yes: (p: number | null) => p ? `Named, position ${p}` : 'Named', no: 'Not named', more: 'Read the full answer', less: 'Show less', failed: 'No answer from this assistant right now.',
    instead: 'Recommended instead of you', insteadSub: 'The businesses AI suggests when a customer looks for your trade in your town.',
    of: (n: number, t: number) => `${n}/${t}`, sources: 'Where AI looks', sourcesSub: 'The websites the assistants relied on. This is where your visibility is decided.',
    diag: 'Diagnosis', actions: 'Your 3 priority actions',
    step: 'Next step', auditTitle: 'Your full audit, free', auditSub: '30 minutes with Antoine: your website, Google profile, directories and reviews reviewed, plus a written action plan. No commitment.',
    auditBullets: ['30 minutes, by phone or video', 'Written action plan to keep', 'No commitment, no cost'],
    auditCta: 'Book my free audit', follow: 'Or go straight to ongoing support: AI visibility from CHF 149 / month', followLink: 'See the offers',
    report: (e: string) => `Full report sent to ${e}`, again: 'Analyse another business', example: 'example', pdf: 'Download the PDF', space: 'My client area',
  },
}

const GRADE = {
  A: { ring: '#38A169', text: '#68D391' }, B: { ring: '#3182CE', text: '#63B3ED' }, C: { ring: '#D69E2E', text: '#F6E05E' },
  D: { ring: '#E8372A', text: '#FC8181' }, F: { ring: '#E8372A', text: '#FC8181' },
}

function Score({ score, grade }: { score: number; grade: string }) {
  const [val, setVal] = useState(0)
  const c = GRADE[grade as keyof typeof GRADE] || GRADE.F
  const size = 148, sw = 10, r = (size - sw) / 2, circ = 2 * Math.PI * r
  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1400, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * score))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.ring} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (val / 100) * circ} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl leading-none" style={{ color: c.text }}>{val}</span>
        <span className="font-mono text-[11px] text-white/35 mt-1">/100 · {grade}</span>
      </div>
    </div>
  )
}

function Highlighted({ text, evidence }: { text: string; evidence?: string | null }) {
  const ev = evidence ? cleanAnswer(evidence) : ''
  const i = ev ? text.indexOf(ev) : -1
  if (i < 0) return <>{text}</>
  return <>{text.slice(0, i)}<mark className="bg-brand/25 text-white rounded px-0.5">{ev}</mark>{text.slice(i + ev.length)}</>
}

function AnswerCard({ a, T }: { a: PlatformResult; T: typeof L.fr }) {
  const [open, setOpen] = useState(false)
  const text = useMemo(() => cleanAnswer(a.rawResponse), [a.rawResponse])
  const long = text.length > 420
  const shown = open || !long ? text : text.slice(0, 420).replace(/\s+\S*$/, '') + '…'
  const domains = answerDomains(a.sources)
  return (
    <div className={cn('rounded-2xl border p-5', a.appeared ? 'border-green-500/25 bg-green-500/[0.04]' : 'border-white/10 bg-white/[0.02]')}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-white font-semibold">{a.platformLabel}</span>
        <span className={cn('inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full', a.appeared ? 'bg-green-500/15 text-green-300' : 'bg-brand/15 text-red-300')}>
          {a.appeared ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {a.appeared ? T.yes(a.position) : T.no}
        </span>
      </div>
      <p className="mt-3 text-xs font-mono text-white/35">{T.q} : « {a.query} »</p>
      {a.error || !text ? (
        <p className="mt-3 text-sm text-white/40">{T.failed}</p>
      ) : (
        <>
          <div className="mt-3 flex gap-2.5">
            <Quote className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line"><Highlighted text={shown} evidence={a.evidence} /></p>
          </div>
          {long && (
            <button onClick={() => setOpen(!open)} className="mt-2 ml-6 text-xs font-mono text-brand hover:text-brand-2 inline-flex items-center gap-1">
              {open ? T.less : T.more} <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
            </button>
          )}
          {domains.length > 0 && (
            <div className="mt-3 ml-6 flex flex-wrap gap-1.5">
              {domains.map(d => <span key={d} className="text-[11px] font-mono text-white/40 border border-white/10 rounded-full px-2 py-0.5">{d}</span>)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function ResultsPanel({ result, lang, onReset, inDialog = true }: Props) {
  const T = L[lang]
  const answers = (result.answers?.length ? result.answers : result.platformResults)
  const ok = answers.filter(a => !a.error)
  const total = result.totalAnswers ?? ok.length
  const mentions = result.mentions ?? ok.filter(a => a.appeared).length
  const comps = (result.competitors || []).slice(0, 6)
  const sources = aggregateSources(ok, 8)
  const [showAudit, setShowAudit] = useState(false)

  return (
    <div className="space-y-8">
      {/* Score */}
      <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
        <Score score={result.overallScore} grade={result.grade} />
        <div>
          <p className="text-white/40 text-xs font-mono uppercase tracking-widest">{result.city} · {result.category}</p>
          <h3 className="text-white font-semibold text-2xl mt-1">{result.businessName}</h3>
          <p className={cn('mt-2 text-lg font-display', mentions === 0 ? 'text-red-300' : 'text-white')}>{T.named(mentions, total)}</p>
          <div className="mt-3 flex gap-1.5">
            {ok.map(a => (
              <span key={a.id || a.platform} title={a.platformLabel}
                className={cn('h-1.5 w-10 rounded-full', a.appeared ? 'bg-green-400' : 'bg-white/10')} />
            ))}
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="font-mono text-xs text-brand tracking-widest uppercase mb-2">{T.diag}</p>
        <p className="text-white/75 leading-relaxed">{result.summary}</p>
      </div>

      {/* Answers */}
      <div>
        <h4 className="font-display text-2xl text-white">{T.answers}</h4>
        <p className="text-sm text-white/40 mt-1 mb-4">{inDialog ? T.answersSub : T.answersSubPast}</p>
        <div className="space-y-3">
          {answers.map((a, i) => <AnswerCard key={a.id || i} a={a} T={T} />)}
        </div>
      </div>

      {/* Competitors */}
      {comps.length > 0 && (
        <div>
          <h4 className="font-display text-2xl text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-gold" />{T.instead}</h4>
          <p className="text-sm text-white/40 mt-1 mb-4">{T.insteadSub}</p>
          <div className="space-y-2">
            {comps.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-sm text-white/80 w-1/2 truncate">{c.name}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gold/70 rounded-full" style={{ width: `${Math.min(100, (c.count / Math.max(1, total)) * 100)}%` }} />
                </div>
                <span className="text-xs font-mono text-white/40 w-8 text-right">{T.of(c.count, total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div>
          <h4 className="font-display text-2xl text-white flex items-center gap-2"><Globe className="w-5 h-5 text-white/50" />{T.sources}</h4>
          <p className="text-sm text-white/40 mt-1 mb-4">{T.sourcesSub}</p>
          <div className="flex flex-wrap gap-2">
            {sources.map(s => (
              <span key={s.domain} className="text-xs font-mono text-white/70 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                {s.domain} <span className="text-white/30">· {s.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div>
        <h4 className="font-display text-2xl text-white">{T.actions}</h4>
        <div className="mt-4 space-y-3">
          {result.topRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-brand/15 text-brand font-mono text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <p className="text-white/70 text-sm leading-relaxed pt-1">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel: free audit, then accompaniment */}
      <div id="audit-offer" className="rounded-3xl bg-brand p-6 md:p-8">
        <p className="font-mono text-xs tracking-widest uppercase text-white/70">{T.step}</p>
        <h4 className="font-display text-3xl text-white mt-2">{T.auditTitle}</h4>
        <p className="text-white/85 mt-3 leading-relaxed">{T.auditSub}</p>
        <ul className="mt-4 space-y-1.5">
          {T.auditBullets.map(b => <li key={b} className="text-sm text-white/90 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{b}</li>)}
        </ul>
        {!showAudit ? (
          <button onClick={() => setShowAudit(true)} className="mt-6 inline-flex items-center gap-2 bg-white text-brand px-6 py-3.5 rounded-2xl text-sm font-semibold hover:bg-white/90 transition-colors">
            <Sparkles className="w-4 h-4" /> {T.auditCta} <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="mt-6 rounded-2xl bg-ink p-5">
            <AuditRequest lang={lang} variant="dark" prefill={{ businessName: result.businessName, city: result.city, category: result.category }} />
          </div>
        )}
        <p className="mt-5 text-sm text-white/80">
          {T.follow}{' '}
          {inDialog ? (
            <Dialog.Close asChild>
              <a href="#pricing" className="underline underline-offset-4 font-semibold text-white">{T.followLink}</a>
            </Dialog.Close>
          ) : (
            <a href="#abonnement" className="underline underline-offset-4 font-semibold text-white">{T.followLink}</a>
          )}
        </p>
      </div>

      {result.checkId && (
        <div className="flex flex-wrap gap-3">
          <a href={`/api/client/analysis/${result.checkId}/pdf?lang=${lang}`} className="inline-flex items-center gap-2 text-sm font-semibold text-white border border-white/15 hover:border-white/40 rounded-xl px-4 py-2.5 transition-colors">
            <FileDown className="w-4 h-4" /> {T.pdf}
          </a>
          {inDialog && (
            <a href="/espace-client" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/30 rounded-xl px-4 py-2.5 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> {T.space}
            </a>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono">
        {result.reportTo ? <span className="text-white/40 inline-flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{T.report(result.reportTo)}</span> : <span />}
        {onReset && (
          <button onClick={onReset} className="text-white/30 hover:text-white/60 inline-flex items-center gap-2 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />{T.again}
          </button>
        )}
      </div>
    </div>
  )
}
