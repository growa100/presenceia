'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react'
import CheckoutButton from '@/components/CheckoutButton'
import { useFounderLeft } from '@/components/useFounderLeft'
import { OFFER, PLANS, SETUP_CHF, TERMS, chf, founderPrice, hasFounder, price, type MonthlyKey, type Term } from '@/lib/plans'
import { agencyCopy } from '@/lib/agency-copy'
import { siteCopy } from '@/lib/site-copy'
import type { Lang } from '@/lib/i18n'

const L = {
  fr: { save: '2 mois offerts', setup: `+ CHF ${SETUP_CHF} de mise en place`, eq: (n: string) => `soit CHF ${n} / mois`, thenNote: 'puis prix normal dès la 2e année', terms: 'Conditions générales' },
  de: { save: '2 Monate geschenkt', setup: `+ CHF ${SETUP_CHF} Einrichtung`, eq: (n: string) => `also CHF ${n} / Monat`, thenNote: 'danach Normalpreis ab dem 2. Jahr', terms: 'Allgemeine Bedingungen' },
  en: { save: '2 months free', setup: `+ CHF ${SETUP_CHF} set-up`, eq: (n: string) => `that is CHF ${n} / month`, thenNote: 'then regular price from year 2', terms: 'Terms and conditions' },
}

// Pricing section: 3 plans x 3 ways to pay, founder offer on the AI visibility plans.
export default function Pricing({ lang }: { lang: Lang }) {
  const c = siteCopy[lang].pricing
  const a = agencyCopy[lang]
  const O = OFFER[lang]
  const t = L[lang]
  const [term, setTerm] = useState<Term>('m12')
  const founderLeft = useFounderLeft()
  const founderOn = founderLeft === null || founderLeft > 0

  return (
    <section id="pricing" className="py-24 md:py-32 bg-paper-2 border-y border-line">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand mb-4">{c.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink leading-tight">{c.title}</h2>
          <p className="mt-5 text-lg text-ink/65">{c.sub}</p>
        </div>

        {founderOn && (
          <div className="mt-10 mx-auto max-w-3xl rounded-2xl bg-brand/10 text-ink px-5 py-3.5 text-sm text-center flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-brand flex-shrink-0" />
            <span>{O.founder(founderLeft ?? 15)}</span>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <div role="tablist" className="inline-flex rounded-2xl bg-white border border-line p-1">
            {TERMS.map(k => (
              <button key={k} role="tab" aria-selected={term === k} onClick={() => setTerm(k)}
                className={`px-4 md:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${term === k ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink'}`}>
                {O.term[k]}{k === 'year' && <span className={`ml-2 text-xs font-medium ${term === k ? 'text-brand-2' : 'text-brand'}`}>{t.save}</span>}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-center text-sm text-ink/50">{O.termNote[term]}</p>

        <div className="mt-10 grid md:grid-cols-3 gap-6 items-stretch">
          {c.plans.map(plan => {
            const key = plan.key as MonthlyKey
            const popular = 'popular' in plan && !!plan.popular
            const founder = founderOn && hasFounder(key)
            const full = price(key, term)
            const shown = founder ? founderPrice(key, term) : full
            const muted = popular ? 'text-white/50' : 'text-ink/45'
            return (
              <div key={plan.key} className={`relative rounded-3xl p-8 flex flex-col ${popular ? 'bg-ink text-white shadow-2xl md:-my-3' : 'card'}`}>
                {popular && <span className="absolute -top-3 left-8 bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full">{c.popular}</span>}
                <h3 className={`text-xl font-semibold ${popular ? 'text-white' : 'text-ink'}`}>{plan.name}</h3>
                <p className={`mt-1 text-sm ${popular ? 'text-white/60' : 'text-ink/55'}`}>{plan.desc}</p>
                <div className="mt-6">
                  {founder && <p className={`text-sm line-through ${muted}`}>CHF {chf(full)} {O.per[term]}</p>}
                  <div className="flex items-baseline gap-2">
                    <span className={`font-display text-5xl ${popular ? 'text-white' : 'text-ink'}`}>CHF {chf(shown)}</span>
                    <span className={`text-sm ${muted}`}>{O.per[term]}</span>
                  </div>
                  {founder && <p className={`mt-1 text-xs font-semibold ${popular ? 'text-brand-2' : 'text-brand'}`}>{O.founderShort}, {t.thenNote}</p>}
                  {term === 'year' && <p className={`mt-1 text-xs ${muted}`}>{t.eq(chf(Math.round(shown / 12)))}</p>}
                  {term === 'flex' && PLANS[key].setupFlex && <p className={`mt-1 text-xs ${muted}`}>{t.setup}</p>}
                </div>
                <ul className="mt-8 space-y-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm leading-relaxed ${popular ? 'text-white/80' : 'text-ink/70'}`}>
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${popular ? 'text-brand-2' : 'text-brand'}`} />{f}
                    </li>
                  ))}
                </ul>
                <CheckoutButton plan={key} term={term} lang={lang} fallbackHref="/#audit"
                  className={`mt-8 block w-full text-center py-3.5 rounded-xl text-sm font-semibold transition-all ${popular ? 'bg-brand text-white hover:bg-brand-2' : 'btn-outline'}`}>
                  {plan.cta}
                </CheckoutButton>
              </div>
            )
          })}
        </div>

        <div className="mt-8 space-y-2 text-center text-sm text-ink/55">
          <p className="inline-flex w-full items-center justify-center gap-2 font-medium text-ink/75"><ShieldCheck className="w-4 h-4 text-brand" />{O.guarantee}</p>
          <p>{O.anchor}</p>
          <p>{c.secure} <Link href="/conditions" className="underline hover:text-ink">{t.terms}</Link></p>
        </div>

        <div className="mt-10 card p-6 md:p-8 md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h3 className="text-xl font-semibold text-ink">{a.enterprise.title}</h3>
            <p className="mt-2 text-ink/65 leading-relaxed max-w-2xl">{a.enterprise.desc}</p>
          </div>
          <a href="#audit" className="btn-primary mt-5 md:mt-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold whitespace-nowrap">
            {a.enterprise.cta} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
