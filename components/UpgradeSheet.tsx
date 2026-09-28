'use client'
// Client space: from the Site plan to Visibilité IA in one step. What is included, what changes in
// the price, what is paid today (Stripe proration preview), the card that pays; one button.
// No card, or the bank refuses: a Stripe page to add a card, then back here (lib/upgrade.ts).
import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowRight, CalendarCheck, Check, CreditCard, Loader2, ShieldCheck, Sparkles, X } from 'lucide-react'
import type { Lang } from '@/lib/i18n'
import { FOUNDER, OFFER, chf, type Term } from '@/lib/plans'
import { cn } from '@/lib/utils'

type Quote = {
  plan: string; term: Term; currency: 'chf' | 'eur'; from: number; to: number; toFounder: number | null; founderMonths: number
  keepsDiscount: boolean; setupFee: number | null; dueToday: number; periodEnd: string | null
  card: { brand: string; last4: string } | null; prorationDate: number; commitmentUntil: string | null
}
export type UpgradeState = 'closed' | 'open' | 'done' | 'failed'

const L = {
  fr: {
    label: 'Visibilité IA', title: 'Faites-vous recommander par les IA',
    sub: 'Votre site est en ligne. Maintenant, faisons en sorte que ChatGPT, Gemini, Claude et Perplexity vous citent quand un client cherche votre métier.',
    included: 'Ce qui est inclus', setupLabel: 'Mise en place', monthlyLabel: 'Chaque mois',
    now: 'Aujourd\'hui', site: 'Site web', with: 'Avec Visibilité IA', siteIncluded: 'site inclus',
    founder: (m: number) => `Offre fondateur : -${FOUNDER.percent} % les ${m} premiers mois`, keeps: 'Votre remise actuelle est conservée.',
    diff: 'Vous payez la différence', setup: 'Mise en place, une fois', dueToday: 'À payer aujourd\'hui',
    prorata: (d: string) => `Au prorata jusqu'au ${d}, votre date de facturation habituelle.`, then: (a: string) => `Ensuite ${a}.`,
    card: (b: string, l: string) => `Payé avec ${b.toUpperCase()}${l ? ` •••• ${l}` : ''}`, noCard: 'Vous ajoutez votre carte à l\'étape suivante (page sécurisée Stripe).',
    confirm: (a: string) => `Confirmer et payer ${a}`, confirmFree: 'Confirmer', addCard: 'Ajouter une carte et confirmer',
    commit: (d: string) => `Votre engagement ne change pas (jusqu'au ${d}).`, commitNone: 'Votre date de facturation ne change pas.',
    question: 'Une question avant ? Parler 15 min avec Antoine', terms: 'Conditions',
    doneT: 'Bienvenue dans Visibilité IA', doneB: 'C\'est parti. Voici la suite :',
    doneSteps: [
      'Première mesure de votre visibilité IA : elle apparaît dans votre cockpit dans quelques minutes.',
      'Antoine démarre la mise en place sous 24 h (jours ouvrés) : fiche Google, annuaires, données structurées, avis.',
      'Chaque mois : nouvelle mesure et rapport, ici et par email.',
    ],
    doneBook: 'Réserver l\'appel de démarrage (facultatif)', doneCta: 'Voir mon cockpit', doneMail: 'Un email de confirmation vous a été envoyé.',
    failT: 'Le paiement n\'est pas passé', failB: 'Rien n\'a changé sur votre abonnement. Vous pouvez réessayer avec une autre carte.', retry: 'Réessayer avec une carte',
    errs: { already: 'Visibilité IA est déjà active.', not_site: 'Cette mise à niveau est prévue pour la formule Site web.', not_active: 'Votre abonnement n\'est pas actif : écrivez-nous.', no_subscription: 'Connectez-vous avec l\'adresse utilisée pour le paiement.', custom_subscription: 'Votre abonnement est personnalisé : écrivez-nous.' } as Record<string, string>,
    err: 'Une erreur est survenue. Réessayez, ou écrivez-nous.',
  },
  de: {
    label: 'KI-Sichtbarkeit', title: 'Lassen Sie sich von der KI empfehlen',
    sub: 'Ihre Website ist online. Jetzt sorgen wir dafür, dass ChatGPT, Gemini, Claude und Perplexity Sie nennen, wenn jemand Ihr Fach sucht.',
    included: 'Inbegriffen', setupLabel: 'Einrichtung', monthlyLabel: 'Jeden Monat',
    now: 'Heute', site: 'Website', with: 'Mit KI-Sichtbarkeit', siteIncluded: 'Website inbegriffen',
    founder: (m: number) => `Gründerangebot: -${FOUNDER.percent} % in den ersten ${m} Monaten`, keeps: 'Ihr aktueller Rabatt bleibt bestehen.',
    diff: 'Sie bezahlen die Differenz', setup: 'Einrichtung, einmalig', dueToday: 'Heute zu bezahlen',
    prorata: (d: string) => `Anteilig bis ${d}, Ihrem üblichen Rechnungsdatum.`, then: (a: string) => `Danach ${a}.`,
    card: (b: string, l: string) => `Bezahlt mit ${b.toUpperCase()}${l ? ` •••• ${l}` : ''}`, noCard: 'Sie erfassen Ihre Karte im nächsten Schritt (sichere Stripe-Seite).',
    confirm: (a: string) => `Bestätigen und ${a} bezahlen`, confirmFree: 'Bestätigen', addCard: 'Karte erfassen und bestätigen',
    commit: (d: string) => `Ihre Laufzeit ändert sich nicht (bis ${d}).`, commitNone: 'Ihr Rechnungsdatum ändert sich nicht.',
    question: 'Vorher eine Frage? 15 Min. mit Antoine sprechen', terms: 'Bedingungen',
    doneT: 'Willkommen bei der KI-Sichtbarkeit', doneB: 'Los geht\'s. So geht es weiter:',
    doneSteps: [
      'Erste Messung Ihrer KI-Sichtbarkeit: in wenigen Minuten in Ihrem Cockpit.',
      'Antoine startet die Einrichtung innert 24 Stunden (Werktage): Google-Profil, Verzeichnisse, strukturierte Daten, Bewertungen.',
      'Jeden Monat: neue Messung und Bericht, hier und per E-Mail.',
    ],
    doneBook: 'Startgespräch buchen (freiwillig)', doneCta: 'Mein Cockpit ansehen', doneMail: 'Sie haben eine Bestätigung per E-Mail erhalten.',
    failT: 'Die Zahlung ist nicht durchgegangen', failB: 'An Ihrem Abonnement hat sich nichts geändert. Sie können es mit einer anderen Karte erneut versuchen.', retry: 'Mit einer Karte erneut versuchen',
    errs: { already: 'KI-Sichtbarkeit ist bereits aktiv.', not_site: 'Dieses Upgrade gilt für das Website-Abonnement.', not_active: 'Ihr Abonnement ist nicht aktiv: schreiben Sie uns.', no_subscription: 'Melden Sie sich mit der Adresse an, mit der bezahlt wurde.', custom_subscription: 'Ihr Abonnement ist individuell: schreiben Sie uns.' } as Record<string, string>,
    err: 'Ein Fehler ist aufgetreten. Bitte erneut versuchen oder uns schreiben.',
  },
  en: {
    label: 'AI visibility', title: 'Get recommended by AI',
    sub: 'Your website is live. Now let us make ChatGPT, Gemini, Claude and Perplexity name you when a customer looks for your trade.',
    included: 'What is included', setupLabel: 'Set-up', monthlyLabel: 'Every month',
    now: 'Today', site: 'Website', with: 'With AI visibility', siteIncluded: 'website included',
    founder: (m: number) => `Founder offer: -${FOUNDER.percent} % for the first ${m} months`, keeps: 'Your current discount is kept.',
    diff: 'You pay the difference', setup: 'Set-up, once', dueToday: 'Due today',
    prorata: (d: string) => `Prorated until ${d}, your usual billing date.`, then: (a: string) => `Then ${a}.`,
    card: (b: string, l: string) => `Paid with ${b.toUpperCase()}${l ? ` •••• ${l}` : ''}`, noCard: 'You add your card at the next step (secure Stripe page).',
    confirm: (a: string) => `Confirm and pay ${a}`, confirmFree: 'Confirm', addCard: 'Add a card and confirm',
    commit: (d: string) => `Your commitment does not change (until ${d}).`, commitNone: 'Your billing date does not change.',
    question: 'A question first? Talk to Antoine for 15 min', terms: 'Terms',
    doneT: 'Welcome to AI visibility', doneB: 'Here we go. What happens next:',
    doneSteps: [
      'First measurement of your AI visibility: in your cockpit within a few minutes.',
      'Antoine starts the set-up within 24 hours (working days): Google profile, directories, structured data, reviews.',
      'Every month: a new measurement and a report, here and by email.',
    ],
    doneBook: 'Book the kick-off call (optional)', doneCta: 'See my cockpit', doneMail: 'A confirmation email is on its way.',
    failT: 'The payment did not go through', failB: 'Nothing changed on your subscription. You can try again with another card.', retry: 'Try again with a card',
    errs: { already: 'AI visibility is already on.', not_site: 'This upgrade is for the Website plan.', not_active: 'Your subscription is not active: write to us.', no_subscription: 'Sign in with the address used for the payment.', custom_subscription: 'Your subscription is custom: write to us.' } as Record<string, string>,
    err: 'Something went wrong. Please try again, or write to us.',
  },
}

/** "Mise en place en 2 semaines : fiche Google, ..." -> "Fiche Google, ..." (the label says the rest). */
export const setupItem = (x: string) => { const r = x.replace(/^[^:]+:\s*/, ''); return r.charAt(0).toUpperCase() + r.slice(1) }

const fmt = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === 'de' ? 'de-CH' : lang === 'en' ? 'en-GB' : 'fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })

export default function UpgradeSheet({ state, onState, lang, bookingUrl, onUpgraded }: {
  state: UpgradeState; onState: (s: UpgradeState) => void; lang: Lang; bookingUrl: string | null; onUpgraded: () => void
}) {
  const t = L[lang] || L.fr
  const O = OFFER[lang]
  const [q, setQ] = useState<Quote | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const open = state !== 'closed'

  useEffect(() => {
    if (state !== 'open' && state !== 'failed') return
    let alive = true
    fetch('/api/client/upgrade', { cache: 'no-store' }).then(async r => {
      const j = await r.json().catch(() => ({}))
      if (!alive) return
      if (r.ok) { setQ(j as Quote); setErr(null) } else setErr(t.errs[j.error] || t.err)
    }).catch(() => { if (alive) setErr(t.err) })
    return () => { alive = false }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const cur = q?.currency === 'eur' ? '€' : 'CHF'
  const money = (n: number) => `${cur} ${chf(n)}`
  const per = q?.term === 'year' ? O.per.year : O.per.m12
  const target = q ? (q.toFounder ?? q.to) : 0
  const diff = q ? Math.round((target - q.from) * 100) / 100 : 0

  const confirm = async (withCard = false) => {
    if (!q) return
    setBusy(true); setErr(null)
    try {
      const r = await fetch('/api/client/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prorationDate: q.prorationDate, card: withCard }) })
      const j = await r.json().catch(() => ({}))
      if (j.url) { window.location.href = j.url; return }
      if (r.ok && j.ok) { onState('done'); onUpgraded() } else setErr(t.errs[j.error] || t.err)
    } catch { setErr(t.err) }
    setBusy(false)
  }

  const needsCard = !!q && q.dueToday > 0 && !q.card
  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onState('closed') }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm" />
        <Dialog.Content aria-describedby={undefined}
          className={cn('fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1.5rem)] max-h-[92vh] overflow-y-auto rounded-3xl bg-paper text-ink shadow-2xl focus:outline-none',
            state === 'done' ? 'max-w-2xl' : 'max-w-4xl')}>
          <Dialog.Close className="absolute top-4 right-4 w-9 h-9 rounded-full border border-line bg-white text-ink/60 hover:text-ink flex items-center justify-center z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30" aria-label="Fermer">
            <X className="w-4 h-4" />
          </Dialog.Close>

          {state === 'done' ? (
            <div className="p-6 md:p-10 max-w-2xl">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center"><Check className="w-6 h-6" /></div>
              <Dialog.Title className="mt-4 font-display text-4xl leading-tight">{t.doneT}</Dialog.Title>
              <p className="mt-2 text-ink/65">{t.doneB}</p>
              <ol className="mt-5 space-y-3">
                {t.doneSteps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-sm leading-relaxed"><span className="w-6 h-6 rounded-full bg-brand text-white text-xs font-mono flex items-center justify-center flex-shrink-0">{i + 1}</span>{s}</li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-ink/50">{t.doneMail}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Dialog.Close className="btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold">{t.doneCta}<ArrowRight className="w-4 h-4" /></Dialog.Close>
                {bookingUrl && <a href={bookingUrl} target="_blank" rel="noreferrer" className="btn-outline inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold"><CalendarCheck className="w-4 h-4" />{t.doneBook}</a>}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1.1fr_1fr] md:grid-rows-[auto_1fr]">
              {/* Phone: title, then the price and the button, then the details. */}
              <div className="p-6 pb-2 md:p-10 md:pb-0 md:col-start-1 md:row-start-1">
                <p className="font-mono text-xs tracking-[0.25em] uppercase text-brand">{t.label}</p>
                <Dialog.Title className="mt-2 pr-10 font-display text-4xl md:text-[2.6rem] leading-[1.05]">{t.title}</Dialog.Title>
                <p className="mt-3 text-ink/65 leading-relaxed">{t.sub}</p>
              </div>
              <div className="p-6 pt-4 md:p-10 md:pt-6 md:col-start-1 md:row-start-2 order-last md:order-none">
                <p className="text-xs font-mono uppercase tracking-widest text-ink/45">{t.setupLabel}</p>
                <ul className="mt-2 space-y-2">{O.setup.map(x => <li key={x} className="flex gap-2.5 text-sm leading-relaxed"><Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />{setupItem(x)}</li>)}</ul>
                <p className="mt-5 text-xs font-mono uppercase tracking-widest text-ink/45">{t.monthlyLabel}</p>
                <ul className="mt-2 space-y-2">{O.monthly.map(x => <li key={x} className="flex gap-2.5 text-sm leading-relaxed"><Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />{x}</li>)}</ul>
                <p className="mt-5 flex gap-2.5 text-sm text-ink/70 leading-relaxed"><ShieldCheck className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />{O.guarantee}</p>
              </div>

              <div className="bg-ink text-white p-6 md:p-10 md:pt-16 m-3 rounded-2xl md:m-0 md:rounded-none md:rounded-r-3xl md:col-start-2 md:row-start-1 md:row-span-2 flex flex-col">
                {state === 'failed' && (
                  <div className="mb-5 rounded-2xl bg-amber-400/10 border border-amber-400/30 p-4 text-sm">
                    <p className="font-semibold text-amber-200">{t.failT}</p><p className="mt-1 text-white/70">{t.failB}</p>
                  </div>
                )}
                {!q && !err && <Loader2 className="w-6 h-6 animate-spin text-white/50 my-10 mx-auto" />}
                {err && !q && <p className="text-sm text-amber-200">{err}</p>}
                {q && (
                  <>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-baseline justify-between gap-4 text-white/55">
                        <span>{t.now} · {t.site}</span><span>{money(q.from)} {per}</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-semibold">{t.with} <span className="font-normal text-white/50">({t.siteIncluded})</span></span>
                        <span className="text-right">
                          {q.toFounder !== null && <span className="block text-xs text-white/40 line-through">{money(q.to)}</span>}
                          <span className="font-semibold whitespace-nowrap">{money(target)} {per}</span>
                        </span>
                      </div>
                      {q.toFounder !== null && <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-2"><Sparkles className="w-3.5 h-3.5" />{t.founder(q.founderMonths)}</p>}
                      {q.keepsDiscount && <p className="text-xs text-white/50">{t.keeps}</p>}
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-3 border-t border-white/10">
                        <span className="font-semibold">{t.diff}</span><span className="font-display text-3xl whitespace-nowrap">+{money(diff)}<span className="text-sm text-white/50"> {per}</span></span>
                      </div>
                      {q.setupFee !== null && (
                        <div className="flex items-baseline justify-between gap-4 text-white/70"><span>{t.setup}</span><span>{money(q.setupFee)}</span></div>
                      )}
                    </div>

                    <div className="mt-6 rounded-2xl bg-white/[0.06] border border-white/10 p-4">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-sm text-white/70">{t.dueToday}</span>
                        <span className="font-display text-4xl whitespace-nowrap">{money(q.dueToday)}</span>
                      </div>
                      {q.periodEnd && <p className="mt-1 text-xs text-white/50 leading-relaxed">{t.prorata(fmt(q.periodEnd, lang))} {t.then(`${money(target)} ${per}`)}</p>}
                      <p className="mt-3 text-xs text-white/60 inline-flex items-center gap-2"><CreditCard className="w-4 h-4" />{q.card ? t.card(q.card.brand, q.card.last4) : t.noCard}</p>
                    </div>

                    <button onClick={() => confirm(needsCard || state === 'failed')} disabled={busy}
                      className={cn('mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-semibold bg-brand text-white hover:bg-brand-2 transition-colors', busy && 'opacity-70')}>
                      {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : state === 'failed' ? t.retry : needsCard ? t.addCard : q.dueToday > 0 ? t.confirm(money(q.dueToday)) : t.confirmFree}
                    </button>
                    {err && <p className="mt-3 text-sm text-amber-200">{err}</p>}
                    <p className="mt-3 text-xs text-white/45 leading-relaxed">
                      {q.term === 'm12' && q.commitmentUntil && new Date(q.commitmentUntil) > new Date() ? t.commit(fmt(q.commitmentUntil, lang)) : t.commitNone}{' '}
                      <a href="/conditions" target="_blank" className="underline underline-offset-2">{t.terms}</a>
                    </p>
                  </>
                )}
                <div className="flex-1" />
                {bookingUrl && (
                  <a href={bookingUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
                    <CalendarCheck className="w-4 h-4" />{t.question}
                  </a>
                )}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
