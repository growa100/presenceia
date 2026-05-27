'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Loader2, ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { t, type Lang } from '@/lib/translations'
import { ScoringResult } from '@/lib/scoring-engine'
import ResultsPanel from './ResultsPanel'

const schema = z.object({
  businessName: z.string().min(2),
  city: z.string().min(2),
  category: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  language: z.enum(['fr', 'de', 'en', 'it']),
})
type FormData = z.infer<typeof schema>

const STEPS = {
  fr: ['Interrogation de ChatGPT…', 'Interrogation de Claude…', 'Interrogation de Perplexity…', 'Calcul de votre score…'],
  en: ['Querying ChatGPT…', 'Querying Claude…', 'Querying Perplexity…', 'Calculating your score…'],
}

export default function CheckerForm() {
  const [lang, setLang] = useState<Lang>('fr')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<ScoringResult | null>(null)
  const [error, setError] = useState('')
  const tr = t[lang]

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { language: 'fr' }
  })

  const selectedCategory = watch('category')

  const simulateSteps = async () => {
    for (let i = 0; i < 4; i++) {
      setStep(i)
      await new Promise(r => setTimeout(r, 800))
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    setResult(null)
    setStep(0)

    const stepPromise = simulateSteps()

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, language: lang })
      })
      await stepPromise
      if (!res.ok) throw new Error('Analysis failed')
      const json = await res.json()
      setResult(json)
    } catch (e) {
      setError(lang === 'fr' ? 'Erreur lors de l\'analyse. Réessayez.' : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return <ResultsPanel result={result} lang={lang} onReset={() => setResult(null)} />
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Language switcher */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Globe className="w-4 h-4 text-gray-400" />
        {(['fr', 'de', 'en', 'it'] as Lang[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-all',
              lang === l
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Business name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {tr.form_name}
          </label>
          <input
            {...register('businessName')}
            placeholder={tr.form_name_placeholder}
            className={cn(
              'w-full px-4 py-3.5 rounded-xl border text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
              'transition-all duration-200 text-sm bg-white shadow-sm',
              errors.businessName ? 'border-red-300' : 'border-gray-200'
            )}
          />
        </div>

        {/* City + Category row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {tr.form_city}
            </label>
            <input
              {...register('city')}
              placeholder={tr.form_city_placeholder}
              className={cn(
                'w-full px-4 py-3.5 rounded-xl border text-gray-900 placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
                'transition-all duration-200 text-sm bg-white shadow-sm',
                errors.city ? 'border-red-300' : 'border-gray-200'
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {tr.form_category}
            </label>
            <div className="relative">
              <select
                {...register('category')}
                className={cn(
                  'w-full px-4 py-3.5 rounded-xl border text-gray-900 appearance-none',
                  'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
                  'transition-all duration-200 text-sm bg-white shadow-sm cursor-pointer',
                  !selectedCategory ? 'text-gray-400' : '',
                  errors.category ? 'border-red-300' : 'border-gray-200'
                )}
                defaultValue=""
              >
                <option value="" disabled>Sélectionner…</option>
                {tr.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {tr.form_email}
            <span className="font-normal text-gray-400 ml-1">(optionnel)</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder={tr.form_email_placeholder}
            className={cn(
              'w-full px-4 py-3.5 rounded-xl border text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
              'transition-all duration-200 text-sm bg-white shadow-sm',
              'border-gray-200'
            )}
          />
          <p className="text-xs text-gray-400 mt-1.5 ml-1">
            {lang === 'fr' ? '🔒 Jamais de spam. Uniquement votre rapport.' : '🔒 No spam. Your report only.'}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
              <span className="text-sm font-medium text-gray-700">{STEPS[lang === 'fr' ? 'fr' : 'en'][step]}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-700"
                style={{ width: `${((step + 1) / 4) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1.5">
              {STEPS[lang === 'fr' ? 'fr' : 'en'].map((s, i) => (
                <div key={i} className={cn('w-2 h-2 rounded-full', i <= step ? 'bg-red-500' : 'bg-gray-200')} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full py-4 px-6 rounded-xl font-semibold text-white text-sm',
            'flex items-center justify-center gap-2.5',
            'transition-all duration-200',
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 shadow-red hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
          )}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />{tr.form_analyzing}</>
            : <><Search className="w-4 h-4" />{tr.form_submit}</>
          }
        </button>

        <p className="text-center text-xs text-gray-400">
          {lang === 'fr'
            ? '✓ Gratuit · ✓ Sans engagement · ✓ Résultat en ~30 secondes'
            : '✓ Free · ✓ No commitment · ✓ Result in ~30 seconds'}
        </p>
      </form>
    </div>
  )
}
