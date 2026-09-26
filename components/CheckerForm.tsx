'use client'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Loader2, ChevronDown, Mail, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLang } from './LangProvider'
import { type Lang } from '@/lib/i18n'
import { ScoringResult } from '@/lib/scoring-engine'
import ResultsPanel from './ResultsPanel'
import Turnstile from './Turnstile'

const schema = z.object({
  businessName: z.string().min(2),
  city: z.string().min(2),
  category: z.string().min(2),
  email: z.string().optional(),
})
type FormData = z.infer<typeof schema>

// All assistants are queried in parallel with web search, then the answers are analysed.
const STEPS: Record<Lang, string[]> = {
  fr: ['Questions posées à ChatGPT, Claude, Gemini et Perplexity…', 'Recherche web des assistants en cours…', 'Lecture des réponses…', 'Calcul de votre score…'],
  de: ['Fragen an ChatGPT, Claude, Gemini und Perplexity…', 'Websuche der Assistenten läuft…', 'Antworten werden gelesen…', 'Score wird berechnet…'],
  en: ['Asking ChatGPT, Claude, Gemini and Perplexity…', 'Assistants are searching the web…', 'Reading the answers…', 'Calculating your score…'],
}
const STEP_AT_MS = [0, 4000, 10000, 15000]

const CATEGORIES: Record<Lang, string[]> = {
  fr: ['Plombier', 'Électricien', 'Dentiste', 'Médecin généraliste', 'Avocat', 'Fiduciaire', 'Restaurant', 'Hôtel', 'Agent immobilier', 'Architecte', 'Carrossier', 'Autre'],
  de: ['Klempner', 'Elektriker', 'Zahnarzt', 'Hausarzt', 'Anwalt', 'Treuhänder', 'Restaurant', 'Hotel', 'Immobilienmakler', 'Architekt', 'Carrosserie', 'Andere'],
  en: ['Plumber', 'Electrician', 'Dentist', 'GP', 'Lawyer', 'Fiduciary', 'Restaurant', 'Hotel', 'Real Estate', 'Architect', 'Garage', 'Other'],
}

const L = {
  fr: {
    name: 'Nom de l\'entreprise', city: 'Ville', cat: 'Secteur', email: 'Votre email', select: 'Sélectionner…',
    placeholder_name: 'Ex: Plomberie Dupont', placeholder_city: 'Ex: Sion, Genève…', placeholder_email: 'vous@entreprise.ch',
    emailNote: 'Nous vous envoyons un code pour confirmer votre email. Une analyse gratuite par jour.',
    submit: 'Recevoir mon code', run: 'Analyser ma présence IA', analyzing: 'Analyse en cours…',
    codeTitle: 'Entrez le code reçu par email', codeSent: (e: string) => `Code envoyé à ${e}. Vérifiez aussi vos spams.`,
    codeCta: 'Valider et lancer l\'analyse', back: 'Modifier', connected: (e: string) => `Connecté : ${e}`,
    left0: 'Vous avez utilisé votre analyse gratuite du jour. Revenez demain ou écrivez à antoine@presenceia.com pour une analyse complète.',
    errors: {
      invalid_email: 'Adresse email invalide.', human_check_failed: 'La vérification anti-robot a échoué. Rechargez la page et réessayez.',
      email_failed: 'L\'envoi du code a échoué. Réessayez dans un instant.', invalid_code: 'Code incorrect ou expiré.',
      daily_limit: 'Vous avez utilisé votre analyse gratuite du jour. Revenez demain.', rate_limited: 'Trop d\'analyses depuis cette connexion aujourd\'hui. Revenez demain.',
      busy: 'Le service est très sollicité aujourd\'hui. Réessayez demain ou écrivez à antoine@presenceia.com.',
      login_required: 'Votre session a expiré. Confirmez à nouveau votre email.', generic: 'Erreur d\'analyse. Veuillez réessayer.',
    },
    footer: '✓ GRATUIT · ✓ SANS ENGAGEMENT · ✓ 20 SECONDES',
  },
  de: {
    name: 'Unternehmensname', city: 'Ort', cat: 'Branche', email: 'Ihre E-Mail', select: 'Auswählen…',
    placeholder_name: 'z.B. Sanitär Müller', placeholder_city: 'z.B. Sitten, Zürich…', placeholder_email: 'sie@firma.ch',
    emailNote: 'Wir senden Ihnen einen Code zur Bestätigung Ihrer E-Mail. Eine kostenlose Analyse pro Tag.',
    submit: 'Code erhalten', run: 'KI-Präsenz analysieren', analyzing: 'Analyse läuft…',
    codeTitle: 'Geben Sie den Code aus der E-Mail ein', codeSent: (e: string) => `Code an ${e} gesendet. Prüfen Sie auch den Spam-Ordner.`,
    codeCta: 'Bestätigen und Analyse starten', back: 'Ändern', connected: (e: string) => `Angemeldet: ${e}`,
    left0: 'Sie haben Ihre kostenlose Analyse für heute genutzt. Kommen Sie morgen wieder oder schreiben Sie an antoine@presenceia.com.',
    errors: {
      invalid_email: 'Ungültige E-Mail-Adresse.', human_check_failed: 'Die Anti-Roboter-Prüfung ist fehlgeschlagen. Seite neu laden und erneut versuchen.',
      email_failed: 'Der Code konnte nicht gesendet werden. Bitte gleich nochmals versuchen.', invalid_code: 'Falscher oder abgelaufener Code.',
      daily_limit: 'Sie haben Ihre kostenlose Analyse für heute genutzt. Kommen Sie morgen wieder.', rate_limited: 'Zu viele Analysen von dieser Verbindung heute. Kommen Sie morgen wieder.',
      busy: 'Der Dienst ist heute stark ausgelastet. Bitte morgen erneut versuchen oder an antoine@presenceia.com schreiben.',
      login_required: 'Ihre Sitzung ist abgelaufen. Bitte bestätigen Sie Ihre E-Mail erneut.', generic: 'Analysefehler. Bitte erneut versuchen.',
    },
    footer: '✓ KOSTENLOS · ✓ UNVERBINDLICH · ✓ 20 SEKUNDEN',
  },
  en: {
    name: 'Business name', city: 'Town', cat: 'Category', email: 'Your email', select: 'Select…',
    placeholder_name: 'e.g. Dupont Plumbing', placeholder_city: 'e.g. Sion, Geneva…', placeholder_email: 'you@company.ch',
    emailNote: 'We send you a code to confirm your email. One free analysis per day.',
    submit: 'Get my code', run: 'Analyse my AI presence', analyzing: 'Analysing…',
    codeTitle: 'Enter the code we emailed you', codeSent: (e: string) => `Code sent to ${e}. Check your spam folder too.`,
    codeCta: 'Confirm and start the analysis', back: 'Change', connected: (e: string) => `Signed in: ${e}`,
    left0: 'You have used today\'s free analysis. Come back tomorrow or write to antoine@presenceia.com for a full audit.',
    errors: {
      invalid_email: 'Invalid email address.', human_check_failed: 'The anti-robot check failed. Reload the page and try again.',
      email_failed: 'The code could not be sent. Try again in a moment.', invalid_code: 'Wrong or expired code.',
      daily_limit: 'You have used today\'s free analysis. Come back tomorrow.', rate_limited: 'Too many analyses from this connection today. Come back tomorrow.',
      busy: 'The service is very busy today. Try again tomorrow or write to antoine@presenceia.com.',
      login_required: 'Your session expired. Please confirm your email again.', generic: 'Analysis error. Please try again.',
    },
    footer: '✓ FREE · ✓ NO COMMITMENT · ✓ 20 SECONDS',
  },
}

type Phase = 'form' | 'code' | 'running'
type ErrKey = keyof typeof L.fr.errors

export default function CheckerForm() {
  const { lang } = useLang()
  const T = L[lang]
  const [phase, setPhase] = useState<Phase>('form')
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<ScoringResult | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [session, setSession] = useState<{ email: string | null; left: number } | null>(null)
  const [human, setHuman] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<{ token: string; email: string } | null>(null)
  const [code, setCode] = useState('')
  const [pending, setPending] = useState<FormData | null>(null)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const cat = watch('category')
  const onHuman = useCallback((t: string | null) => setHuman(t), [])

  const refreshSession = useCallback(async () => {
    try {
      const r = await fetch('/api/check/session', { cache: 'no-store' })
      setSession(await r.json())
    } catch { setSession({ email: null, left: 0 }) }
  }, [])
  useEffect(() => { refreshSession() }, [refreshSession])

  const showError = (k: string) => setError(T.errors[(k in T.errors ? k : 'generic') as ErrKey])

  const runCheck = async (data: FormData) => {
    setPhase('running'); setError(''); setStep(0)
    const timers = STEP_AT_MS.map((ms, i) => setTimeout(() => setStep(i), ms))
    try {
      const res = await fetch('/api/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: data.businessName, city: data.city, category: data.category, language: lang }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (json.error === 'login_required') { setSession({ email: null, left: 0 }); setPhase('form') } else setPhase('form')
        showError(json.error || 'generic')
        return
      }
      setResult(json)
      refreshSession()
    } catch {
      setPhase('form'); showError('generic')
    } finally { timers.forEach(clearTimeout) }
  }

  const onSubmit = async (data: FormData) => {
    setError('')
    if (session?.email) {
      if (session.left <= 0) { setError(T.left0); return }
      return runCheck(data)
    }
    const email = (data.email || '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { showError('invalid_email'); return }
    if (!human) { showError('human_check_failed'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/check/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: human, language: lang }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { showError(json.error || 'generic'); return }
      setPending(data)
      setChallenge({ token: json.challenge, email })
      if (json.devCode) setCode(json.devCode)
      setPhase('code')
    } catch { showError('generic') } finally { setBusy(false) }
  }

  const onVerify = async () => {
    if (!challenge || !pending) return
    setError(''); setBusy(true)
    try {
      const res = await fetch('/api/check/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge: challenge.token, code, language: lang }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { showError(json.error || 'generic'); return }
      setSession({ email: json.email, left: 1 })
      reset(pending) // the form re-mounts after the code step: keep what the visitor typed
      await runCheck(pending)
    } catch { showError('generic') } finally { setBusy(false) }
  }

  if (result) return <ResultsPanel result={result} lang={lang} onReset={() => { setResult(null); setPhase('form') }} />

  const errorBox = error && <div className="text-brand text-sm font-mono bg-brand/10 px-4 py-3 rounded-xl border border-brand/20">{error}</div>

  if (phase === 'code' && challenge) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 text-white">
          <Mail className="w-5 h-5 text-brand" />
          <span className="font-semibold">{T.codeTitle}</span>
        </div>
        <p className="text-sm text-white/50">{T.codeSent(challenge.email)}</p>
        <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric" autoComplete="one-time-code" placeholder="123456" autoFocus
          className="input-dark w-full px-4 py-4 rounded-xl text-2xl tracking-[0.5em] text-center font-mono" />
        {errorBox}
        <button type="button" onClick={onVerify} disabled={busy || code.length !== 6}
          className={cn('btn-primary w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5', (busy || code.length !== 6) && 'opacity-50 pointer-events-none')}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}{T.codeCta}
        </button>
        <button type="button" onClick={() => { setPhase('form'); setCode(''); setError('') }}
          className="w-full text-xs font-mono text-white/30 hover:text-white/60">{T.back}</button>
      </div>
    )
  }

  const running = phase === 'running'
  const loggedIn = !!session?.email

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">{T.name}</label>
        <input {...register('businessName')} placeholder={T.placeholder_name}
          className={cn('input-dark w-full px-4 py-3.5 rounded-xl text-sm', errors.businessName && 'border-brand/50')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">{T.city}</label>
          <input {...register('city')} placeholder={T.placeholder_city}
            className={cn('input-dark w-full px-4 py-3.5 rounded-xl text-sm', errors.city && 'border-brand/50')} />
        </div>
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">{T.cat}</label>
          <div className="relative">
            <select {...register('category')} defaultValue=""
              className={cn('input-dark w-full px-4 py-3.5 rounded-xl text-sm appearance-none cursor-pointer', !cat && 'text-white/30', errors.category && 'border-brand/50')}>
              <option value="" disabled>{T.select}</option>
              {CATEGORIES[lang].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>
      </div>

      {loggedIn ? (
        <p className="text-xs font-mono text-white/40 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-green-400" />{T.connected(session!.email!)}
          <button type="button" className="underline hover:text-white/70"
            onClick={async () => { await fetch('/api/check/session', { method: 'DELETE' }); setError(''); setHuman(null); refreshSession() }}>
            {T.back}
          </button>
        </p>
      ) : (
        <>
          <div>
            <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">{T.email}</label>
            <input {...register('email')} type="email" placeholder={T.placeholder_email} autoComplete="email"
              className="input-dark w-full px-4 py-3.5 rounded-xl text-sm" />
            <p className="text-xs text-white/30 font-mono mt-1.5 ml-1">{T.emailNote}</p>
          </div>
          {session && <Turnstile onToken={onHuman} lang={lang} />}
        </>
      )}

      {running && (
        <div className="glass-light rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-4 h-4 text-brand animate-spin" />
            <span className="text-sm text-white/60 font-mono">{STEPS[lang][step]}</span>
          </div>
          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full transition-all duration-700" style={{ width: `${((step + 1) / 4) * 100}%` }} />
          </div>
        </div>
      )}

      {errorBox}

      <button type="submit" disabled={running || busy}
        className={cn('btn-primary w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5', (running || busy) && 'opacity-50 cursor-not-allowed pointer-events-none')}>
        {running ? <><Loader2 className="w-4 h-4 animate-spin" />{T.analyzing}</>
          : busy ? <Loader2 className="w-4 h-4 animate-spin" />
          : loggedIn ? <><Search className="w-4 h-4" />{T.run}</>
          : <><Mail className="w-4 h-4" />{T.submit}</>}
      </button>

      <p className="text-center text-xs font-mono text-white/20">{T.footer}</p>
    </form>
  )
}
