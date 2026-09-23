'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLang } from './LangProvider'
import { type Lang } from '@/lib/i18n'
import { ScoringResult } from '@/lib/scoring-engine'
import ResultsPanel from './ResultsPanel'

const schema = z.object({
  businessName: z.string().min(2),
  city: z.string().min(2),
  category: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

// All assistants are queried in parallel with web search, then the answers are analysed.
const STEPS: Record<Lang, string[]> = {
  fr: ['Questions posées à ChatGPT, Claude, Gemini, Grok et Perplexity…', 'Recherche web des assistants en cours…', 'Lecture des réponses…', 'Calcul de votre score…'],
  de: ['Fragen an ChatGPT, Claude, Gemini, Grok und Perplexity…', 'Websuche der Assistenten läuft…', 'Antworten werden gelesen…', 'Score wird berechnet…'],
  en: ['Asking ChatGPT, Claude, Gemini, Grok and Perplexity…', 'Assistants are searching the web…', 'Reading the answers…', 'Calculating your score…'],
}
const STEP_AT_MS = [0, 6000, 18000, 28000]

const CATEGORIES: Record<Lang, string[]> = {
  fr: ['Plombier', 'Électricien', 'Dentiste', 'Médecin généraliste', 'Avocat', 'Fiduciaire', 'Restaurant', 'Hôtel', 'Agent immobilier', 'Architecte', 'Carrossier', 'Autre'],
  de: ['Klempner', 'Elektriker', 'Zahnarzt', 'Hausarzt', 'Anwalt', 'Treuhänder', 'Restaurant', 'Hotel', 'Immobilienmakler', 'Architekt', 'Carrosserie', 'Andere'],
  en: ['Plumber', 'Electrician', 'Dentist', 'GP', 'Lawyer', 'Fiduciary', 'Restaurant', 'Hotel', 'Real Estate', 'Architect', 'Garage', 'Other'],
}

const LABELS = {
  fr: { name: 'Nom de l\'entreprise', city: 'Ville', cat: 'Secteur', email: 'Email', emailSub: 'Pour recevoir le rapport complet', submit: 'Analyser ma présence IA', analyzing: 'Analyse en cours…', placeholder_name: 'Ex: Plomberie Dupont', placeholder_city: 'Ex: Sion, Genève…', select: 'Sélectionner…', privacy: '🔒 Jamais de spam.' },
  de: { name: 'Unternehmensname', city: 'Stadt', cat: 'Branche', email: 'E-Mail', emailSub: 'Für den vollständigen Bericht', submit: 'KI-Präsenz analysieren', analyzing: 'Analyse läuft…', placeholder_name: 'z.B. Klempner Müller', placeholder_city: 'z.B. Sion, Genf…', select: 'Auswählen…', privacy: '🔒 Kein Spam.' },
  en: { name: 'Business name', city: 'City', cat: 'Category', email: 'Email', emailSub: 'To receive the full report', submit: 'Analyse my AI presence', analyzing: 'Analysing…', placeholder_name: 'e.g. Dupont Plumbing', placeholder_city: 'e.g. Sion, Geneva…', select: 'Select…', privacy: '🔒 No spam ever.' },
}

export default function CheckerForm() {
  const { lang } = useLang()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<ScoringResult | null>(null)
  const [error, setError] = useState('')
  const L = LABELS[lang]

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const cat = watch('category')

  const startSteps = () => {
    const timers = STEP_AT_MS.map((ms, i) => setTimeout(() => setStep(i), ms))
    return () => timers.forEach(clearTimeout)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true); setError(''); setResult(null); setStep(0)
    const stopSteps = startSteps()
    try {
      const res = await fetch('/api/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, language: lang })
      })
      if (res.status === 429) throw new Error('rate')
      if (!res.ok) throw new Error()
      setResult(await res.json())
    } catch (e) {
      const rate = e instanceof Error && e.message === 'rate'
      setError(rate
        ? (lang === 'fr' ? 'Limite d\'analyses atteinte pour le moment. Réessayez dans une heure ou écrivez à antoine@presenceia.com.' : lang === 'de' ? 'Analyse-Limit vorübergehend erreicht. Bitte in einer Stunde erneut versuchen oder an antoine@presenceia.com schreiben.' : 'Analysis limit reached for now. Try again in an hour or write to antoine@presenceia.com.')
        : (lang === 'fr' ? 'Erreur d\'analyse. Veuillez réessayer.' : lang === 'de' ? 'Analysefehler. Bitte erneut versuchen.' : 'Analysis error. Please try again.'))
    } finally { stopSteps(); setLoading(false) }
  }

  if (result) return <ResultsPanel result={result} lang={lang} onReset={() => setResult(null)} />

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Business name */}
      <div>
        <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">{L.name}</label>
        <input {...register('businessName')} placeholder={L.placeholder_name}
          className={cn('input-dark w-full px-4 py-3.5 rounded-xl text-sm', errors.businessName && 'border-brand/50')} />
      </div>

      {/* City + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">{L.city}</label>
          <input {...register('city')} placeholder={L.placeholder_city}
            className={cn('input-dark w-full px-4 py-3.5 rounded-xl text-sm', errors.city && 'border-brand/50')} />
        </div>
        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">{L.cat}</label>
          <div className="relative">
            <select {...register('category')} defaultValue=""
              className={cn('input-dark w-full px-4 py-3.5 rounded-xl text-sm appearance-none cursor-pointer', !cat && 'text-white/30', errors.category && 'border-brand/50')}>
              <option value="" disabled>{L.select}</option>
              {CATEGORIES[lang].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">
          {L.email} <span className="text-white/20 normal-case">(optionnel)</span>
        </label>
        <input {...register('email')} type="email" placeholder={L.emailSub}
          className="input-dark w-full px-4 py-3.5 rounded-xl text-sm" />
        <p className="text-xs text-white/20 font-mono mt-1.5 ml-1">{L.privacy}</p>
      </div>

      {/* Progress */}
      {loading && (
        <div className="glass-light rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-4 h-4 text-brand animate-spin" />
            <span className="text-sm text-white/60 font-mono">{STEPS[lang][step]}</span>
          </div>
          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full transition-all duration-700" style={{ width: `${((step+1)/4)*100}%` }} />
          </div>
        </div>
      )}

      {error && <div className="text-brand text-sm font-mono bg-brand/10 px-4 py-3 rounded-xl border border-brand/20">{error}</div>}

      {/* Submit */}
      <button type="submit" disabled={loading}
        className={cn('btn-primary w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5', loading && 'opacity-50 cursor-not-allowed pointer-events-none')}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{L.analyzing}</> : <><Search className="w-4 h-4" />{L.submit}</>}
      </button>

      <p className="text-center text-xs font-mono text-white/20">
        {lang === 'fr' ? '✓ GRATUIT · ✓ SANS ENGAGEMENT · ✓ 30 SECONDES' :
         lang === 'de' ? '✓ KOSTENLOS · ✓ UNVERBINDLICH · ✓ 30 SEKUNDEN' :
         '✓ FREE · ✓ NO COMMITMENT · ✓ 30 SECONDS'}
      </p>
    </form>
  )
}
