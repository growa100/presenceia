'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, CalendarCheck, Check, CreditCard, FileDown, Loader2, LogOut, Mail, MessageSquareQuote, Phone,
  Radar, RefreshCw, Sparkles, X,
} from 'lucide-react'
import Navbar from './Navbar'
import Turnstile from './Turnstile'
import ResultsPanel from './ResultsPanel'
import AuditRequest from './AuditRequest'
import CheckoutButton from './CheckoutButton'
import { useLang } from './LangProvider'
import { CONTACT } from '@/lib/site-copy'
import { BOOST_COPY, PLANS, PLAN_KEYS, type PlanKey } from '@/lib/plans'
import type { ScoringResult } from '@/lib/scoring-engine'
import type { Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type Analysis = { id: string; business_name: string; city: string; category: string; overall_score: number; grade: string; created_at: string; mentions: number | null; total: number | null }
type Update = { id: string; kind: string; title: string; body: string | null; link: string | null; created_at: string }
type Lead = {
  business_name: string | null; city: string | null; category: string | null; stage: string | null; client_message: string | null
  plan: PlanKey | null; subscription_status: string | null; current_period_end: string | null
  audit_requested_at: string | null; audit_done_at: string | null; boost_paid_at: string | null; hasBilling: boolean
}
type Me = { email: string; left: number; lead: Lead | null; analyses: Analysis[]; updates: Update[]; bookingUrl: string | null; payments: boolean; paymentsTest: boolean }

const L = {
  fr: {
    title: 'Espace client', loginSub: 'Entrez l\'email utilisé pour votre analyse. Nous vous envoyons un lien de connexion, sans mot de passe.',
    email: 'Votre email', send: 'Recevoir mon lien', human: 'Merci de cocher la vérification anti-robot.', err: 'L\'envoi a échoué. Réessayez dans un instant.',
    sent: (e: string) => `Lien envoyé à ${e}. Ouvrez-le sur cet appareil, il est valable 30 minutes.`, other: 'Utiliser un autre email',
    expired: 'Ce lien a expiré. Demandez-en un nouveau ci-dessous.', none: 'Pas encore d\'analyse ?', noneCta: 'Lancer l\'analyse gratuite',
    hello: 'Bonjour', logout: 'Se déconnecter',
    welcome: 'Merci, votre abonnement est actif. Antoine vous contacte sous 24 h (jours ouvrés) pour démarrer. Vous pouvez déjà planifier l\'appel de démarrage.',
    journey: 'Votre parcours', steps: ['Analyse gratuite', 'Audit offert', 'GEO Boost', 'Suivi mensuel'],
    nBoost: ['Passez à l\'action : le GEO Boost', 'Vos concurrents sont recommandés à votre place. En 2 semaines, nous corrigeons ce qui empêche les IA de vous citer.'],
    nBoostPaid: ['Votre GEO Boost est en cours', 'Nous travaillons votre fiche Google, vos annuaires et votre site. Nouvelle analyse sur les 4 IA après 30 jours. Pour garder l\'avance, passez au suivi mensuel.'],
    orAudit: 'Ou d\'abord l\'audit offert (30 min)', boostPaid: (d: string) => `GEO Boost payé le ${d}`, keepUp: 'Suivi mensuel',
    next: 'Prochaine étape',
    nFirst: ['Lancez votre première analyse', 'Découvrez en 60 secondes si ChatGPT, Claude, Gemini et Perplexity recommandent votre entreprise.'],
    nAudit: ['Réservez votre audit offert', '30 minutes avec Antoine : votre site, votre fiche Google, les annuaires et vos avis passés en revue, et un plan d\'action écrit. Sans engagement.'],
    nBooked: ['Votre audit est demandé', 'Choisissez le créneau de 30 minutes qui vous convient, ou attendez l\'appel d\'Antoine (sous 24 h, jours ouvrés).'],
    nBookedNoLink: ['Votre audit est demandé', 'Antoine vous contacte sous 24 h (jours ouvrés) pour fixer les 30 minutes.'],
    nPlan: ['Passez à l\'accompagnement', 'Votre plan d\'action est prêt. Nous pouvons l\'appliquer pour vous, avec un suivi chaque mois.'],
    nClient: ['Votre accompagnement est en cours', 'Nous travaillons vos signaux en ligne. Chaque étape apparaît ci-dessous dans votre suivi.'],
    book: 'Choisir mon créneau', bookPoint: 'Planifier un point avec Antoine', start: 'Lancer l\'analyse', request: 'Demander mon audit', seePlans: 'Voir les offres',
    msg: 'Le mot d\'Antoine',
    analyses: 'Vos analyses', newA: 'Nouvelle analyse', left: (n: number) => n > 50 ? 'Analyses illimitées' : n > 0 ? `${n} analyse gratuite disponible aujourd'hui` : 'Prochaine analyse gratuite demain',
    noA: 'Aucune analyse pour le moment.', view: 'Voir', hide: 'Fermer', pdf: 'PDF', named: (m: number | null, t: number | null) => m === null || t === null ? '' : `cité par ${m}/${t}`,
    follow: 'Suivi', noF: 'Votre suivi apparaîtra ici : audit, plan d\'action, travaux réalisés et rapports mensuels.',
    ev: { audit_requested: 'Audit offert demandé', subscribed: (p: string) => `Abonnement activé : ${p}`, boost_purchased: 'GEO Boost commandé', monthly_analysis: (p: string) => `Analyse mensuelle : ${p}/100` } as Record<string, string | ((p: string) => string)>,
    sub: 'Offres et facturation', plan: 'Offre', status: 'Statut', renew: 'Prochain renouvellement', manage: 'Factures, carte et résiliation',
    statuses: { active: 'Actif', trialing: 'Période d\'essai', past_due: 'Paiement en attente', canceled: 'Résilié', unpaid: 'Impayé', incomplete: 'Incomplet', paused: 'En pause' } as Record<string, string>,
    choose: 'Choisir', perMonth: '/ mois', payNote: 'Paiement sécurisé par Stripe. Mensuel, résiliable en tout temps.', noPay: 'Le paiement en ligne sera bientôt disponible. Écrivez-nous pour démarrer.',
    test: 'Mode test : aucun paiement réel. Carte de test 4242 4242 4242 4242, date future, CVC au choix.',
    contact: 'Votre interlocuteur', contactSub: 'Antoine Pury, fondateur. Il lit et répond lui-même à chaque message.', write: 'Écrire',
    loadErr: 'Impossible de charger votre espace. Réessayez.',
  },
  de: {
    title: 'Kundenbereich', loginSub: 'Geben Sie die E-Mail Ihrer Analyse ein. Wir senden Ihnen einen Anmeldelink, ohne Passwort.',
    email: 'Ihre E-Mail', send: 'Link erhalten', human: 'Bitte bestätigen Sie die Anti-Roboter-Prüfung.', err: 'Senden fehlgeschlagen. Bitte gleich nochmals versuchen.',
    sent: (e: string) => `Link an ${e} gesendet. Öffnen Sie ihn auf diesem Gerät, er ist 30 Minuten gültig.`, other: 'Andere E-Mail verwenden',
    expired: 'Dieser Link ist abgelaufen. Fordern Sie unten einen neuen an.', none: 'Noch keine Analyse?', noneCta: 'Kostenlose Analyse starten',
    hello: 'Guten Tag', logout: 'Abmelden',
    welcome: 'Danke, Ihr Abonnement ist aktiv. Antoine meldet sich innert 24 Stunden (Werktage), um zu starten. Sie können das Startgespräch bereits planen.',
    journey: 'Ihr Weg', steps: ['Kostenlose Analyse', 'Kostenloses Audit', 'GEO Boost', 'Monatliches Monitoring'],
    nBoost: ['Jetzt handeln: der GEO Boost', 'Ihre Mitbewerber werden an Ihrer Stelle empfohlen. In 2 Wochen beheben wir, was die KI daran hindert, Sie zu nennen.'],
    nBoostPaid: ['Ihr GEO Boost läuft', 'Wir arbeiten an Ihrem Google-Profil, Ihren Verzeichnissen und Ihrer Website. Neue Analyse bei den 4 KI nach 30 Tagen. Um vorne zu bleiben: monatliche Begleitung.'],
    orAudit: 'Oder zuerst das kostenlose Audit (30 Min.)', boostPaid: (d: string) => `GEO Boost bezahlt am ${d}`, keepUp: 'Monatliche Begleitung',
    next: 'Nächster Schritt',
    nFirst: ['Starten Sie Ihre erste Analyse', 'Erfahren Sie in 60 Sekunden, ob ChatGPT, Claude, Gemini und Perplexity Ihr Unternehmen empfehlen.'],
    nAudit: ['Buchen Sie Ihr kostenloses Audit', '30 Minuten mit Antoine: Website, Google-Profil, Verzeichnisse und Bewertungen geprüft, dazu ein schriftlicher Aktionsplan. Unverbindlich.'],
    nBooked: ['Ihr Audit ist angefragt', 'Wählen Sie die 30 Minuten, die Ihnen passen, oder warten Sie auf Antoines Anruf (innert 24 Stunden, Werktage).'],
    nBookedNoLink: ['Ihr Audit ist angefragt', 'Antoine meldet sich innert 24 Stunden (Werktage), um die 30 Minuten zu vereinbaren.'],
    nPlan: ['Weiter mit der Begleitung', 'Ihr Aktionsplan ist bereit. Wir setzen ihn für Sie um, mit monatlichem Monitoring.'],
    nClient: ['Ihre Begleitung läuft', 'Wir arbeiten an Ihren Online-Signalen. Jeder Schritt erscheint unten in Ihrem Verlauf.'],
    book: 'Termin wählen', bookPoint: 'Termin mit Antoine planen', start: 'Analyse starten', request: 'Audit anfragen', seePlans: 'Angebote ansehen',
    msg: 'Nachricht von Antoine',
    analyses: 'Ihre Analysen', newA: 'Neue Analyse', left: (n: number) => n > 50 ? 'Unbegrenzte Analysen' : n > 0 ? `${n} kostenlose Analyse heute verfügbar` : 'Nächste kostenlose Analyse morgen',
    noA: 'Noch keine Analyse.', view: 'Ansehen', hide: 'Schliessen', pdf: 'PDF', named: (m: number | null, t: number | null) => m === null || t === null ? '' : `genannt von ${m}/${t}`,
    follow: 'Verlauf', noF: 'Ihr Verlauf erscheint hier: Audit, Aktionsplan, umgesetzte Arbeiten und Monatsberichte.',
    ev: { audit_requested: 'Kostenloses Audit angefragt', subscribed: (p: string) => `Abonnement aktiviert: ${p}`, boost_purchased: 'GEO Boost bestellt', monthly_analysis: (p: string) => `Monatliche Analyse: ${p}/100` } as Record<string, string | ((p: string) => string)>,
    sub: 'Angebote und Rechnungen', plan: 'Angebot', status: 'Status', renew: 'Nächste Verlängerung', manage: 'Rechnungen, Karte und Kündigung',
    statuses: { active: 'Aktiv', trialing: 'Testphase', past_due: 'Zahlung ausstehend', canceled: 'Gekündigt', unpaid: 'Unbezahlt', incomplete: 'Unvollständig', paused: 'Pausiert' } as Record<string, string>,
    choose: 'Wählen', perMonth: '/ Monat', payNote: 'Sichere Zahlung über Stripe. Monatlich, jederzeit kündbar.', noPay: 'Die Online-Zahlung ist bald verfügbar. Schreiben Sie uns, um zu starten.',
    test: 'Testmodus: keine echte Zahlung. Testkarte 4242 4242 4242 4242, Datum in der Zukunft, beliebiger CVC.',
    contact: 'Ihr Ansprechpartner', contactSub: 'Antoine Pury, Gründer. Er liest und beantwortet jede Nachricht selbst.', write: 'Schreiben',
    loadErr: 'Ihr Bereich konnte nicht geladen werden. Bitte erneut versuchen.',
  },
  en: {
    title: 'Client area', loginSub: 'Enter the email you used for your analysis. We send you a sign-in link, no password.',
    email: 'Your email', send: 'Get my link', human: 'Please complete the anti-robot check.', err: 'Sending failed. Please try again in a moment.',
    sent: (e: string) => `Link sent to ${e}. Open it on this device, it is valid for 30 minutes.`, other: 'Use another email',
    expired: 'This link has expired. Ask for a new one below.', none: 'No analysis yet?', noneCta: 'Run the free analysis',
    hello: 'Hello', logout: 'Sign out',
    welcome: 'Thank you, your subscription is active. Antoine will contact you within 24 hours (working days) to get started. You can already schedule the kick-off call.',
    journey: 'Your journey', steps: ['Free analysis', 'Free audit', 'GEO Boost', 'Monthly tracking'],
    nBoost: ['Take action: the GEO Boost', 'Your competitors are recommended instead of you. In 2 weeks, we fix what keeps AI from naming you.'],
    nBoostPaid: ['Your GEO Boost is under way', 'We are working on your Google profile, directories and website. New analysis on the 4 assistants after 30 days. To stay ahead, move to monthly follow-up.'],
    orAudit: 'Or first the free audit (30 min)', boostPaid: (d: string) => `GEO Boost paid on ${d}`, keepUp: 'Monthly follow-up',
    next: 'Next step',
    nFirst: ['Run your first analysis', 'Find out in 60 seconds whether ChatGPT, Claude, Gemini and Perplexity recommend your business.'],
    nAudit: ['Book your free audit', '30 minutes with Antoine: your website, Google profile, directories and reviews reviewed, plus a written action plan. No commitment.'],
    nBooked: ['Your audit is requested', 'Pick the 30 minutes that suit you, or wait for Antoine\'s call (within 24 hours, working days).'],
    nBookedNoLink: ['Your audit is requested', 'Antoine will contact you within 24 hours (working days) to set up the 30 minutes.'],
    nPlan: ['Move to ongoing support', 'Your action plan is ready. We can carry it out for you, with tracking every month.'],
    nClient: ['Your support is under way', 'We are working on your online signals. Each step appears below in your follow-up.'],
    book: 'Choose my time slot', bookPoint: 'Schedule a call with Antoine', start: 'Start the analysis', request: 'Request my audit', seePlans: 'See the offers',
    msg: 'A word from Antoine',
    analyses: 'Your analyses', newA: 'New analysis', left: (n: number) => n > 50 ? 'Unlimited analyses' : n > 0 ? `${n} free analysis available today` : 'Next free analysis tomorrow',
    noA: 'No analysis yet.', view: 'View', hide: 'Close', pdf: 'PDF', named: (m: number | null, t: number | null) => m === null || t === null ? '' : `named by ${m}/${t}`,
    follow: 'Follow-up', noF: 'Your follow-up will appear here: audit, action plan, work done and monthly reports.',
    ev: { audit_requested: 'Free audit requested', subscribed: (p: string) => `Subscription started: ${p}`, boost_purchased: 'GEO Boost ordered', monthly_analysis: (p: string) => `Monthly analysis: ${p}/100` } as Record<string, string | ((p: string) => string)>,
    sub: 'Plans and billing', plan: 'Plan', status: 'Status', renew: 'Next renewal', manage: 'Invoices, card and cancellation',
    statuses: { active: 'Active', trialing: 'Trial', past_due: 'Payment pending', canceled: 'Cancelled', unpaid: 'Unpaid', incomplete: 'Incomplete', paused: 'Paused' } as Record<string, string>,
    choose: 'Choose', perMonth: '/ month', payNote: 'Secure payment by Stripe. Monthly, cancel anytime.', noPay: 'Online payment is coming soon. Write to us to get started.',
    test: 'Test mode: no real payment. Test card 4242 4242 4242 4242, any future date, any CVC.',
    contact: 'Your contact', contactSub: 'Antoine Pury, founder. He reads and answers every message himself.', write: 'Write',
    loadErr: 'Your area could not be loaded. Please try again.',
  },
}
type TT = typeof L.fr

const fmtDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === 'de' ? 'de-CH' : lang === 'en' ? 'en-GB' : 'fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })

// ─── Sign in ──────────────────────────────────────────────────────────────────
function SignIn({ T, lang, expired }: { T: TT; lang: Lang; expired: boolean }) {
  const [email, setEmail] = useState('')
  const [human, setHuman] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')
  const [devLink, setDevLink] = useState('')
  const onHuman = useCallback((t: string | null) => setHuman(t), [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!human) { setError(T.human); return }
    setState('sending')
    try {
      const res = await fetch('/api/client/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: human, language: lang }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error()
      if (j.devLink) setDevLink(j.devLink)
      setState('sent')
    } catch { setState('idle'); setError(T.err) }
  }

  return (
    <div className="max-w-lg mx-auto">
      <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">présence ia</p>
      <h1 className="font-display text-5xl text-ink leading-tight">{T.title}</h1>
      <p className="mt-4 text-ink/65 leading-relaxed">{T.loginSub}</p>
      {expired && state !== 'sent' && <p className="mt-4 text-sm text-brand">{T.expired}</p>}
      <div className="card p-6 md:p-8 mt-8">
        {state === 'sent' ? (
          <div>
            <div className="flex items-start gap-3 text-green-800 bg-green-50 rounded-2xl p-5">
              <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" /><p className="text-sm leading-relaxed">{T.sent(email)}</p>
            </div>
            {devLink && <a href={devLink} className="mt-3 block text-xs font-mono text-brand break-all">{devLink}</a>}
            <button onClick={() => { setState('idle'); setHuman(null) }} className="mt-4 text-sm text-ink/55 underline underline-offset-4">{T.other}</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono mb-1.5 tracking-wider uppercase text-ink/50">{T.email}</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-line focus:outline-none focus:border-brand/60" />
            </div>
            <Turnstile onToken={onHuman} lang={lang} theme="light" />
            {error && <p className="text-sm text-brand">{error}</p>}
            <button type="submit" disabled={state === 'sending'} className="btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold">
              {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} {T.send}
            </button>
          </form>
        )}
      </div>
      <p className="mt-6 text-sm text-ink/55">{T.none} <Link href="/#analyse" className="text-brand font-semibold underline underline-offset-4">{T.noneCta}</Link></p>
    </div>
  )
}

// ─── Dashboard pieces ─────────────────────────────────────────────────────────
function Journey({ T, me }: { T: TT; me: Me }) {
  const l = me.lead
  const subscribed = ['active', 'trialing', 'past_due'].includes(l?.subscription_status || '')
  const done = [
    me.analyses.length > 0,
    !!l?.audit_done_at || l?.stage === 'audit_done' || !!l?.boost_paid_at || subscribed,
    !!l?.boost_paid_at || subscribed,
    subscribed,
  ]
  const current = done.findIndex(d => !d)
  return (
    <div className="card p-6 md:p-8">
      <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand">{T.journey}</p>
      <ol className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {T.steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0',
              done[i] ? 'bg-brand text-white' : i === current ? 'border-2 border-brand text-brand' : 'border border-line text-ink/35')}>
              {done[i] ? <Check className="w-4 h-4" /> : i + 1}
            </span>
            <span className={cn('text-sm', done[i] || i === current ? 'text-ink font-semibold' : 'text-ink/45')}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function NextStep({ T, me, lang }: { T: TT; me: Me; lang: Lang }) {
  const l = me.lead
  const last = me.analyses[0]
  const subscribed = ['active', 'trialing', 'past_due'].includes(l?.subscription_status || '')
  const [showForm, setShowForm] = useState(false)
  const bookBtn = (label: string) => me.bookingUrl && (
    <a href={me.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-brand px-6 py-3.5 rounded-2xl text-sm font-semibold hover:bg-white/90 transition-colors">
      <CalendarCheck className="w-4 h-4" /> {label}
    </a>
  )

  const auditLink = !l?.audit_requested_at && !l?.audit_done_at && last && (showForm ? (
    <div className="rounded-2xl bg-ink p-5 mt-2 w-full">
      <AuditRequest lang={lang} variant="dark" prefill={{ businessName: last.business_name, city: last.city, category: last.category }} />
    </div>
  ) : (
    <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 text-white/90 hover:text-white underline underline-offset-4 px-2 py-3.5 text-sm font-semibold">
      {T.orAudit} <ArrowRight className="w-4 h-4" />
    </button>
  ))
  const B = BOOST_COPY[lang]

  let title: string[], action: React.ReactNode = null, extra: React.ReactNode = null
  if (subscribed) { title = T.nClient; action = bookBtn(T.bookPoint) }
  else if (l?.boost_paid_at) {
    title = T.nBoostPaid
    action = <>
      {bookBtn(T.bookPoint)}
      <CheckoutButton plan="visibility" lang={lang} fallbackHref="#abonnement" className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3.5 rounded-2xl text-sm font-semibold hover:bg-white/10">
        {T.keepUp} · CHF {PLANS.visibility.chf} {T.perMonth}
      </CheckoutButton>
    </>
  } else if (last) {
    title = T.nBoost
    extra = (
      <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2 max-w-3xl">
        {B.items.map(it => <li key={it} className="text-sm text-white/90 flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />{it}</li>)}
      </ul>
    )
    action = <>
      <CheckoutButton plan="boost" lang={lang} fallbackHref="/#pricing" className="inline-flex items-center gap-2 bg-white text-brand px-6 py-3.5 rounded-2xl text-sm font-semibold hover:bg-white/90 transition-colors">
        <Sparkles className="w-4 h-4" /> {B.cta} · CHF {PLANS.boost.chf}
      </CheckoutButton>
      {l?.audit_requested_at ? bookBtn(T.book) : auditLink}
    </>
  } else {
    title = T.nFirst
    action = <Link href="/#analyse" className="inline-flex items-center gap-2 bg-white text-brand px-6 py-3.5 rounded-2xl text-sm font-semibold"><Radar className="w-4 h-4" /> {T.start}</Link>
  }

  return (
    <div className="rounded-3xl bg-brand p-6 md:p-8 text-white">
      <p className="font-mono text-xs tracking-widest uppercase text-white/70">{T.next}</p>
      <h2 className="font-display text-3xl md:text-4xl mt-2">{title[0]}</h2>
      <p className="text-white/85 mt-3 leading-relaxed max-w-2xl">{title[1]}</p>
      {extra}
      {action && <div className="mt-6 flex flex-wrap items-center gap-3">{action}</div>}
      {title === T.nBoost && <p className="mt-3 text-xs text-white/70">{B.note}</p>}
    </div>
  )
}

function Analyses({ T, me, lang }: { T: TT; me: Me; lang: Lang }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<(ScoringResult & { checkId?: string }) | null>(null)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const open = async (id: string) => {
    if (openId === id) { setOpenId(null); setDetail(null); return }
    setOpenId(id); setDetail(null); setLoading(true)
    try {
      const r = await fetch(`/api/client/analysis/${id}`, { cache: 'no-store' })
      if (r.ok) { setDetail(await r.json()); requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })) }
    } finally { setLoading(false) }
  }

  return (
    <div className="card p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-ink">{T.analyses}</h2>
          <p className="text-sm text-ink/50 mt-1">{T.left(me.left)}</p>
        </div>
        <Link href="/#analyse" className={cn('inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold', me.left > 0 ? 'btn-primary' : 'btn-outline')}>
          <RefreshCw className="w-4 h-4" /> {T.newA}
        </Link>
      </div>
      {me.analyses.length === 0 ? <p className="mt-6 text-ink/55">{T.noA}</p> : (
        <ul className="mt-6 divide-y divide-line">
          {me.analyses.map(a => (
            <li key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{a.business_name} <span className="font-normal text-ink/45">· {a.city}</span></p>
                <p className="text-xs font-mono text-ink/45 mt-0.5">{fmtDate(a.created_at, lang)} · {a.category}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-2xl text-ink">{a.overall_score}<span className="text-sm text-ink/40">/100</span></span>
                <span className="text-xs font-mono text-ink/55 w-24">{T.named(a.mentions, a.total)}</span>
                <button onClick={() => open(a.id)} className="btn-outline px-4 py-2 rounded-xl text-sm font-semibold">{openId === a.id ? T.hide : T.view}</button>
                <a href={`/api/client/analysis/${a.id}/pdf?lang=${lang}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand"><FileDown className="w-4 h-4" />{T.pdf}</a>
              </div>
            </li>
          ))}
        </ul>
      )}
      {openId && (
        <div ref={ref} className="mt-6 rounded-3xl bg-ink text-white p-6 md:p-8 relative scroll-mt-24">
          <button onClick={() => { setOpenId(null); setDetail(null) }} className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/15 text-white/60 hover:text-white flex items-center justify-center" aria-label={T.hide}>
            <X className="w-4 h-4" />
          </button>
          {loading || !detail ? <Loader2 className="w-6 h-6 animate-spin text-white/50 mx-auto my-10" /> : <ResultsPanel result={detail} lang={lang} inDialog={false} />}
        </div>
      )}
    </div>
  )
}

function FollowUp({ T, me, lang }: { T: TT; me: Me; lang: Lang }) {
  const title = (u: Update) => {
    const ev = T.ev[u.title]
    if (typeof ev === 'function') return ev(u.body && u.body in PLANS ? PLANS[u.body as PlanKey].name[lang] : u.body || '')
    return ev || u.title
  }
  const system = (u: Update) => u.title in T.ev
  return (
    <div className="card p-6 md:p-8">
      <h2 className="font-display text-3xl text-ink">{T.follow}</h2>
      {me.lead?.client_message && (
        <div className="mt-5 rounded-2xl bg-paper-2 border border-line p-5 flex gap-3">
          <MessageSquareQuote className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
          <div><p className="text-xs font-mono uppercase tracking-widest text-brand">{T.msg}</p><p className="mt-1 text-ink/80 leading-relaxed whitespace-pre-line">{me.lead.client_message}</p></div>
        </div>
      )}
      {me.updates.length === 0 ? <p className="mt-5 text-ink/55">{T.noF}</p> : (
        <ol className="mt-6 relative border-l border-line ml-2 space-y-6">
          {me.updates.map(u => (
            <li key={u.id} className="pl-6 relative">
              <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-brand" />
              <p className="text-xs font-mono text-ink/45">{fmtDate(u.created_at, lang)}</p>
              <p className="font-semibold text-ink mt-0.5">{title(u)}</p>
              {u.body && !system(u) && <p className="text-sm text-ink/70 mt-1 leading-relaxed whitespace-pre-line">{u.body}</p>}
              {u.link && /^https?:\/\//.test(u.link) && <a href={u.link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-brand font-semibold">{u.link.replace(/^https?:\/\/(www\.)?/, '').slice(0, 60)} <ArrowRight className="w-3.5 h-3.5" /></a>}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function Subscription({ T, me, lang }: { T: TT; me: Me; lang: Lang }) {
  const l = me.lead
  const [busy, setBusy] = useState(false)
  const subscribed = !!l?.subscription_status && l.subscription_status !== 'canceled' && !!l.plan && l.plan !== 'boost'
  const B = BOOST_COPY[lang]
  const portal = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/stripe/portal', { method: 'POST' })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j.url) window.location.href = j.url
      else setBusy(false)
    } catch { setBusy(false) }
  }
  const plans = (
    <div className="mt-5 grid md:grid-cols-3 gap-4">
      {PLAN_KEYS.map(k => (
        <div key={k} className={cn('rounded-2xl border p-5 flex flex-col', k === 'visibility' ? 'border-brand bg-brand/[0.03]' : 'border-line')}>
          <p className="font-semibold text-ink">{PLANS[k].name[lang]}</p>
          <p className="mt-2"><span className="font-display text-3xl text-ink">CHF {PLANS[k].chf}</span> <span className="text-sm text-ink/45">{T.perMonth}</span></p>
          <CheckoutButton plan={k} lang={lang} fallbackHref="/#pricing"
            className={cn('mt-4 w-full py-3 rounded-xl text-sm font-semibold', k === 'visibility' ? 'bg-brand text-white hover:bg-brand-2' : 'btn-outline')}>
            {T.choose}
          </CheckoutButton>
        </div>
      ))}
    </div>
  )
  return (
    <div id="abonnement" className="card p-6 md:p-8 scroll-mt-24">
      <h2 className="font-display text-3xl text-ink">{T.sub}</h2>
      {subscribed ? (
        <div className="mt-5">
          <dl className="grid sm:grid-cols-3 gap-4">
            <div><dt className="text-xs font-mono uppercase tracking-wider text-ink/45">{T.plan}</dt><dd className="mt-1 font-semibold text-ink">{l?.plan ? `${PLANS[l.plan].name[lang]} · CHF ${PLANS[l.plan].chf}` : '-'}</dd></div>
            <div><dt className="text-xs font-mono uppercase tracking-wider text-ink/45">{T.status}</dt><dd className="mt-1 font-semibold text-ink">{T.statuses[l?.subscription_status || ''] || l?.subscription_status || '-'}</dd></div>
            <div><dt className="text-xs font-mono uppercase tracking-wider text-ink/45">{T.renew}</dt><dd className="mt-1 font-semibold text-ink">{l?.current_period_end ? fmtDate(l.current_period_end, lang) : '-'}</dd></div>
          </dl>
        </div>
      ) : me.payments ? (
        <>
          {l?.boost_paid_at ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-800 bg-green-50 rounded-xl px-3 py-2"><Check className="w-4 h-4" />{T.boostPaid(fmtDate(l.boost_paid_at, lang))}</p>
          ) : (
            <div className="mt-5 rounded-2xl bg-ink text-white p-6 md:flex md:items-center md:justify-between md:gap-8">
              <div>
                <p className="font-mono text-xs tracking-widest uppercase text-brand-2">{B.price}</p>
                <p className="font-display text-3xl mt-1">{B.title}</p>
                <p className="text-white/70 mt-2 text-sm leading-relaxed max-w-xl">{B.tagline}</p>
              </div>
              <CheckoutButton plan="boost" lang={lang} fallbackHref="/#pricing" className="mt-5 md:mt-0 whitespace-nowrap bg-brand text-white hover:bg-brand-2 px-6 py-3.5 rounded-2xl text-sm font-semibold">
                {B.cta}
              </CheckoutButton>
            </div>
          )}
          <p className="mt-6 text-sm font-semibold text-ink">{T.keepUp}</p>
          {plans}
          <p className="mt-4 text-sm text-ink/50">{T.payNote} <Link href="/#pricing" className="underline underline-offset-4">{T.seePlans}</Link></p>
        </>
      ) : <p className="mt-5 text-ink/60">{T.noPay}</p>}
      {l?.hasBilling && (
        <button onClick={portal} disabled={busy} className="mt-6 btn-outline inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} {T.manage}
        </button>
      )}
      {me.paymentsTest && <p className="mt-4 text-xs font-mono text-amber-700 bg-amber-50 rounded-xl px-3 py-2">{T.test}</p>}
    </div>
  )
}

function Contact({ T, me }: { T: TT; me: Me }) {
  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-brand text-white font-display text-2xl flex items-center justify-center flex-shrink-0">AP</div>
        <div><h2 className="font-display text-2xl text-ink">{T.contact}</h2><p className="text-sm text-ink/60">{T.contactSub}</p></div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {me.bookingUrl && (
          <a href={me.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold">
            <CalendarCheck className="w-4 h-4" /> {T.bookPoint}
          </a>
        )}
        <a href={`mailto:${CONTACT.email}`} className="btn-outline inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold"><Mail className="w-4 h-4" /> {CONTACT.email}</a>
        <a href={CONTACT.phoneHref} className="btn-outline inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold"><Phone className="w-4 h-4" /> {CONTACT.phone}</a>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
async function fetchMe(): Promise<{ me: Me | null; failed: boolean }> {
  try {
    const r = await fetch('/api/client/me', { cache: 'no-store' })
    if (r.status === 401) return { me: null, failed: false }
    if (!r.ok) throw new Error()
    return { me: await r.json(), failed: false }
  } catch {
    return { me: null, failed: true }
  }
}

export default function ClientSpace() {
  const { lang } = useLang()
  const T = L[lang]
  const [me, setMe] = useState<Me | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  // Read once on the client; not rendered before the first fetch, so no hydration mismatch.
  const [flags] = useState(() => {
    if (typeof window === 'undefined') return { welcome: false, expired: false }
    const q = new URLSearchParams(window.location.search)
    return { welcome: q.has('bienvenue'), expired: q.get('lien') === 'expire' }
  })

  useEffect(() => {
    let alive = true
    fetchMe().then(r => { if (alive) { setMe(r.me); setFailed(r.failed) } })
    return () => { alive = false }
  }, [])

  const logout = async () => {
    await fetch('/api/check/session', { method: 'DELETE' })
    window.location.href = '/espace-client'
  }

  return (
    <div className="page-light min-h-screen">
      <Navbar variant="light" />
      <main className="max-w-5xl mx-auto px-6 lg:px-8 pt-28 md:pt-36 pb-24">
        {me === undefined ? (
          <Loader2 className="w-7 h-7 animate-spin text-brand mx-auto mt-20" />
        ) : me === null ? (
          <>
            {failed && <p className="max-w-lg mx-auto mb-6 text-sm text-brand">{T.loadErr}</p>}
            <SignIn T={T} lang={lang} expired={flags.expired} />
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-3">{T.title}</p>
                <h1 className="font-display text-4xl md:text-5xl text-ink leading-tight">{T.hello}{me.lead?.business_name ? `, ${me.lead.business_name}` : ''}</h1>
                <p className="mt-2 text-sm text-ink/50">{me.email}</p>
              </div>
              <button onClick={logout} className="self-start sm:self-auto inline-flex items-center gap-2 text-sm text-ink/55 hover:text-ink"><LogOut className="w-4 h-4" /> {T.logout}</button>
            </div>
            {flags.welcome && (
              <div className="rounded-2xl bg-green-50 text-green-800 p-5 flex gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" /><p className="leading-relaxed">{T.welcome}</p>
              </div>
            )}
            <Journey T={T} me={me} />
            <NextStep T={T} me={me} lang={lang} />
            <Analyses T={T} me={me} lang={lang} />
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
              <FollowUp T={T} me={me} lang={lang} />
              <Contact T={T} me={me} />
            </div>
            <Subscription T={T} me={me} lang={lang} />
          </div>
        )}
      </main>
    </div>
  )
}
