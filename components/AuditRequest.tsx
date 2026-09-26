'use client'
import { useCallback, useEffect, useState } from 'react'
import { CalendarCheck, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lang } from '@/lib/i18n'
import Turnstile from './Turnstile'

// Request for the free full audit (30 min + written plan). Used in the results popup (dark)
// and on the homepage (light). Visitors who confirmed their email skip the human check.

const L = {
  fr: {
    business: 'Entreprise', city: 'Ville', name: 'Votre nom', phone: 'Téléphone', website: 'Site web (si vous en avez un)', email: 'Votre email',
    message: 'Ce que vous aimeriez améliorer (optionnel)', submit: 'Réserver mon audit offert',
    done: 'C\'est noté. Antoine vous contacte sous 24 h (jours ouvrés) pour fixer les 30 minutes.',
    err: 'L\'envoi a échoué. Réessayez ou écrivez à antoine@presenceia.com.', human: 'Merci de cocher la vérification anti-robot.',
  },
  de: {
    business: 'Unternehmen', city: 'Ort', name: 'Ihr Name', phone: 'Telefon', website: 'Website (falls vorhanden)', email: 'Ihre E-Mail',
    message: 'Was Sie verbessern möchten (optional)', submit: 'Kostenloses Audit buchen',
    done: 'Notiert. Antoine meldet sich innert 24 Stunden (Werktage), um die 30 Minuten zu vereinbaren.',
    err: 'Senden fehlgeschlagen. Bitte erneut versuchen oder an antoine@presenceia.com schreiben.', human: 'Bitte bestätigen Sie die Anti-Roboter-Prüfung.',
  },
  en: {
    business: 'Business', city: 'Town', name: 'Your name', phone: 'Phone', website: 'Website (if you have one)', email: 'Your email',
    message: 'What you would like to improve (optional)', submit: 'Book my free audit',
    done: 'Noted. Antoine will contact you within 24 hours (working days) to set up the 30 minutes.',
    err: 'Sending failed. Try again or write to antoine@presenceia.com.', human: 'Please complete the anti-robot check.',
  },
}

type Prefill = { businessName?: string; city?: string; category?: string }

export default function AuditRequest({ lang, variant = 'light', prefill }: { lang: Lang; variant?: 'light' | 'dark'; prefill?: Prefill }) {
  const T = L[lang]
  const dark = variant === 'dark'
  const [f, setF] = useState({ businessName: prefill?.businessName || '', city: prefill?.city || '', contactName: '', phone: '', website: '', email: '', message: '' })
  const [session, setSession] = useState<string | null | undefined>(undefined)
  const [human, setHuman] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const onHuman = useCallback((t: string | null) => setHuman(t), [])

  useEffect(() => {
    fetch('/api/check/session', { cache: 'no-store' }).then(r => r.json()).then(j => setSession(j.email || null)).catch(() => setSession(null))
  }, [])

  const input = cn('w-full px-4 py-3 rounded-xl text-sm', dark ? 'input-dark' : 'bg-white border border-line focus:outline-none focus:border-brand/60')
  const label = cn('block text-xs font-mono mb-1.5 tracking-wider uppercase', dark ? 'text-white/40' : 'text-ink/50')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!session && !human) { setError(T.human); return }
    setState('sending')
    try {
      const res = await fetch('/api/audit-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, category: prefill?.category, language: lang, turnstileToken: human }),
      })
      if (!res.ok) throw new Error()
      setState('done')
    } catch { setState('error'); setError(T.err) }
  }

  if (state === 'done') {
    return (
      <div className={cn('flex items-start gap-3 rounded-2xl p-5', dark ? 'bg-green-500/10 text-green-300' : 'bg-green-50 text-green-800')}>
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /><p className="text-sm leading-relaxed">{T.done}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={label}>{T.business}</label><input required minLength={2} value={f.businessName} onChange={e => setF({ ...f, businessName: e.target.value })} className={input} /></div>
        <div><label className={label}>{T.city}</label><input required value={f.city} onChange={e => setF({ ...f, city: e.target.value })} className={input} /></div>
        <div><label className={label}>{T.name}</label><input value={f.contactName} onChange={e => setF({ ...f, contactName: e.target.value })} className={input} autoComplete="name" /></div>
        <div><label className={label}>{T.phone}</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className={input} autoComplete="tel" inputMode="tel" /></div>
      </div>
      <div><label className={label}>{T.website}</label><input value={f.website} onChange={e => setF({ ...f, website: e.target.value })} className={input} placeholder="www.…" /></div>
      {session === null && (
        <div><label className={label}>{T.email}</label><input required type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={input} autoComplete="email" /></div>
      )}
      <div><label className={label}>{T.message}</label><textarea rows={3} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} className={input} /></div>
      {session === null && <Turnstile onToken={onHuman} lang={lang} theme={dark ? 'dark' : 'light'} />}
      {error && <p className="text-sm text-brand">{error}</p>}
      <button type="submit" disabled={state === 'sending' || session === undefined}
        className={cn('btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-semibold', state === 'sending' && 'opacity-60 pointer-events-none')}>
        {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />} {T.submit}
      </button>
    </form>
  )
}
