// After the free analysis: 3 emails (J+2, J+5, J+10) that lead to the GEO Boost, then a monthly
// re-analysis for every lead who has not opted out. Run by Vercel crons (app/api/cron/*).
// Never for opted-out leads or for clients who already bought (Boost or subscription).
import { supabaseAdmin } from './supabase'
import { sendMail } from './mailer'
import { E, emailShell, mailLang, type MailLang } from './email-layout'
import { bookingFor } from './links'
import { magicUrl, unsubscribeToken } from './checker-auth'
import { BOOST_COPY, PLANS } from './plans'
import { runVisibilityCheck, ENGINE_VERSION, type BusinessInput, type ScoringResult } from './scoring-engine'
import { normalize, normalizeName } from './geo/match'
import { buildReportEmail } from './report-email'
import { renderReportPdf, reportFilename } from './report-pdf'
import { aggregateSources } from './geo/present'

const DAY = 86400_000
export const NURTURE_DAYS = [2, 5, 10]
// Only analyses made after the consent notice went live get these emails.
export const NURTURE_START = process.env.NURTURE_START || '2026-09-27T00:00:00Z'

export function unsubscribeUrl(base: string, email: string): string {
  return `${base}/api/client/unsubscribe?t=${encodeURIComponent(unsubscribeToken(email))}`
}
export function boostUrl(base: string, lang: string): string {
  return `${base}/api/stripe/checkout?plan=boost&lang=${lang}`
}

type Ctx = { email: string; lang: MailLang; base: string; r: ScoringResult }

const joinNames = (n: string[], lang: MailLang) =>
  n.length <= 1 ? (n[0] || '') : `${n.slice(0, -1).join(', ')} ${lang === 'de' ? 'und' : lang === 'en' ? 'and' : 'et'} ${n.at(-1)}`

function content(step: number, c: Ctx) {
  const { r, lang } = c
  const b = r.businessName
  const total = r.totalAnswers ?? 4
  const mentions = r.mentions ?? 0
  const comps = (r.competitors || []).slice(0, 3).map(x => x.name)
  const srcs = aggregateSources((r.answers || r.platformResults).filter(a => !a.error), 4).map(s => s.domain)
  const B = BOOST_COPY[lang]
  const fr = lang === 'fr', de = lang === 'de'
  if (step === 1) {
    const who = comps.length ? joinNames(comps, lang) : null
    return {
      subject: fr ? `${b} : qui les IA recommandent à votre place` : de ? `${b}: wen die KI an Ihrer Stelle empfiehlt` : `${b}: who AI recommends instead of you`,
      title: fr ? 'Chaque jour, des clients posent la question' : de ? 'Jeden Tag stellen Kunden diese Frage' : 'Every day, customers ask the question',
      paras: [
        fr ? `Lors de votre analyse, ${mentions} assistant${mentions > 1 ? 's' : ''} sur ${total} citai${mentions > 1 ? 'ent' : 't'} ${b}.` : de ? `Bei Ihrer Analyse nannten ${mentions} von ${total} Assistenten ${b}.` : `In your analysis, ${mentions} of ${total} assistants named ${b}.`,
        ...(who ? [fr ? `À votre place, ils recommandaient ${who}.` : de ? `An Ihrer Stelle empfahlen sie ${who}.` : `Instead, they recommended ${who}.`] : []),
        ...(srcs.length ? [fr ? `Ce qui fait la différence : les sites sur lesquels les IA s'appuient (${srcs.join(', ')}). C'est là que votre présence se joue, et ça se corrige.` : de ? `Den Unterschied machen die Websites, auf die sich die KI stützt (${srcs.join(', ')}). Dort entscheidet sich Ihre Sichtbarkeit, und das lässt sich korrigieren.` : `What makes the difference: the websites AI relies on (${srcs.join(', ')}). That is where your visibility is decided, and it can be fixed.`] : []),
      ],
    }
  }
  if (step === 2) {
    return {
      subject: fr ? `${b} : ce que nous changeons concrètement` : de ? `${b}: was wir konkret ändern` : `${b}: what we change, concretely`,
      title: B.tagline,
      paras: [
        fr ? 'Le GEO Boost, c\'est un travail précis, en deux semaines :' : de ? 'Der GEO Boost ist präzise Arbeit, in zwei Wochen:' : 'The GEO Boost is precise work, in two weeks:',
      ],
      list: B.items,
    }
  }
  return {
    subject: fr ? `${b} : dernier message sur votre analyse` : de ? `${b}: letzte Nachricht zu Ihrer Analyse` : `${b}: last message about your analysis`,
    title: fr ? 'Trois façons d\'avancer' : de ? 'Drei Wege, weiterzukommen' : 'Three ways forward',
    paras: [
      fr ? '1. Le faire vous-même : les 3 actions de votre rapport sont un bon début.' : de ? '1. Selbst machen: Die 3 Massnahmen aus Ihrem Bericht sind ein guter Anfang.' : '1. Do it yourself: the 3 actions in your report are a good start.',
      fr ? `2. Nous le confier : le GEO Boost, CHF ${PLANS.boost.chf}, une seule fois.` : de ? `2. Uns beauftragen: der GEO Boost, CHF ${PLANS.boost.chf}, einmalig.` : `2. Hand it to us: the GEO Boost, CHF ${PLANS.boost.chf}, one-time.`,
      fr ? '3. En parler 20 minutes avec moi, sans engagement.' : de ? '3. 20 Minuten mit mir darüber sprechen, unverbindlich.' : '3. Talk it through with me for 20 minutes, no commitment.',
      fr ? 'Je ne vous relancerai plus. Vous recevrez seulement votre analyse mensuelle.' : de ? 'Ich melde mich nicht mehr, Sie erhalten nur noch Ihre monatliche Analyse.' : 'I will not follow up again. You will only get your monthly analysis.',
    ],
  }
}

export async function sendNurture(step: number, c: Ctx): Promise<boolean> {
  const x = content(step, c)
  const B = BOOST_COPY[c.lang]
  const unsub = unsubscribeUrl(c.base, c.email)
  const space = magicUrl(c.base, c.email, '7d')
  const book = bookingFor(c.email)
  const L = c.lang === 'de' ? { space: 'Meine Analyse ansehen', talk: '20 Minuten sprechen', unsub: 'Keine Tipps mehr erhalten' }
    : c.lang === 'en' ? { space: 'See my analysis', talk: 'Talk for 20 minutes', unsub: 'Stop receiving these tips' }
    : { space: 'Revoir mon analyse', talk: 'En parler 20 minutes', unsub: 'Ne plus recevoir ces conseils' }
  const list = 'list' in x && x.list ? `<ul style="padding-left:18px;margin:0 0 14px;line-height:1.7">${x.list.map(i => `<li>${i.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`).join('')}</ul>` : ''
  const body = E.title(x.title) + x.paras.map(p => E.p(p)).join('') + list +
    E.box(`<p style="margin:0 0 6px;font-weight:600;color:#0A0A0F">${B.title} · ${B.price}</p><p style="margin:0;line-height:1.6">${B.tagline}</p>${E.button(boostUrl(c.base, c.lang), B.cta)}`) +
    `<p style="margin:16px 0 0;font-size:14px;line-height:1.8">${E.link(book, L.talk)} · ${E.link(space, L.space)}</p>` +
    E.signature(c.lang) + `<p style="margin:18px 0 0;font-size:12px">${E.link(unsub, L.unsub)}</p>`
  const text = [x.title, '', ...x.paras, ...('list' in x && x.list ? ['', ...x.list.map(i => `- ${i}`)] : []), '',
    `${B.cta} (${B.price}) : ${boostUrl(c.base, c.lang)}`, `${L.talk} : ${book}`, `${L.space} : ${space}`, '',
    'Antoine Pury, Présence IA', 'antoine@presenceia.com', '', `${L.unsub} : ${unsub}`].join('\n')
  return sendMail({
    to: c.email, subject: x.subject, text,
    html: emailShell({ lang: c.lang, preheader: x.paras[0], body }),
    headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  })
}

type LeadRow = { email: string; language: string | null; nurture_step: number; boost_paid_at: string | null; subscription_status: string | null; stage: string | null }
const isCustomer = (l: LeadRow) => !!l.boost_paid_at || ['active', 'trialing', 'past_due'].includes(l.subscription_status || '')

/** One nurture pass: at most `max` emails. Returns what was sent. */
export async function runNurture(base: string, max = 80): Promise<{ sent: number; checked: number }> {
  const { data: leads } = await supabaseAdmin.from('leads')
    .select('email, language, nurture_step, boost_paid_at, subscription_status, stage')
    .eq('marketing_opt_out', false).lt('nurture_step', NURTURE_DAYS.length).limit(1000)
  let sent = 0, checked = 0
  for (const l of (leads || []) as LeadRow[]) {
    if (sent >= max) break
    if (isCustomer(l)) continue
    checked++
    const { data: last } = await supabaseAdmin.from('visibility_checks').select('result, created_at, language')
      .eq('email', l.email).eq('kind', 'user').order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!last?.result || last.created_at < NURTURE_START) continue
    const age = Date.now() - new Date(last.created_at).getTime()
    const step = l.nurture_step + 1
    if (age < NURTURE_DAYS[l.nurture_step] * DAY) continue
    // Claim the step first, so two runs never send the same email twice.
    const { data: claimed } = await supabaseAdmin.from('leads')
      .update({ nurture_step: step, nurture_last_at: new Date().toISOString() })
      .eq('email', l.email).eq('nurture_step', l.nurture_step).select('email')
    if (!claimed?.length) continue
    const ok = await sendNurture(step, { email: l.email, lang: mailLang(l.language || last.language), base, r: last.result as ScoringResult })
    if (ok) sent++
  }
  return { sent, checked }
}

// ─── Monthly re-analysis ───────────────────────────────────────────────────────

/** Re-runs the analysis for leads whose last one is 30+ days old and emails the result with the change. */
export async function runRetests(base: string, max = Number(process.env.GEO_RETEST_PER_DAY || 3), budgetMs = 200_000): Promise<{ done: number; errors: number }> {
  const t0 = Date.now()
  const cutoff = new Date(Date.now() - 30 * DAY).toISOString()
  const { data: leads } = await supabaseAdmin.from('leads')
    .select('email, language, boost_paid_at, subscription_status, last_retest_at, stage, nurture_step')
    .eq('marketing_opt_out', false)
    .or(`last_retest_at.is.null,last_retest_at.lt.${cutoff}`)
    .limit(500)
  let done = 0, errors = 0
  for (const l of (leads || []) as (LeadRow & { last_retest_at: string | null })[]) {
    if (done >= max || Date.now() - t0 > budgetMs) break
    const { data: last } = await supabaseAdmin.from('visibility_checks')
      .select('business_name, city, category, language, overall_score, result, created_at, kind')
      .eq('email', l.email).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!last?.result || last.created_at > cutoff) continue          // analysed less than 30 days ago
    const { data: firstUser } = await supabaseAdmin.from('visibility_checks').select('created_at')
      .eq('email', l.email).eq('kind', 'user').gte('created_at', NURTURE_START).limit(1).maybeSingle()
    if (!firstUser) continue                                           // no analysis since the consent notice
    // Claim first (two runs never analyse the same lead twice).
    const { data: claimed } = await supabaseAdmin.from('leads').update({ last_retest_at: new Date().toISOString() })
      .eq('email', l.email).select('email')
    if (!claimed?.length) continue
    const language = (['fr', 'de', 'en', 'it'].includes(last.language) ? last.language : 'fr') as BusinessInput['language']
    try {
      const result = await runVisibilityCheck({ businessName: last.business_name, city: last.city, category: last.category, language })
      const cacheKey = `v${ENGINE_VERSION}_${normalizeName(last.business_name)}_${normalize(last.city)}_${normalize(last.category)}_${language}`
      const { data: row } = await supabaseAdmin.from('visibility_checks').insert({
        cache_key: cacheKey, business_name: last.business_name, city: last.city, category: last.category, language,
        email: l.email, overall_score: result.overallScore, grade: result.grade, result, kind: 'retest',
      }).select('id').maybeSingle()
      const prev = last.result as ScoringResult
      const lang = mailLang(l.language || language)
      const locale = lang === 'de' ? 'de-CH' : lang === 'en' ? 'en-GB' : 'fr-CH'
      let pdf: Buffer | null = null
      try { pdf = await renderReportPdf(result, lang, bookingFor(l.email)) } catch (e) { console.error('[retest] pdf', e) }
      const mail = buildReportEmail(result, lang, {
        pdf: !!pdf, spaceUrl: magicUrl(base, l.email, '7d'),
        boostUrl: isCustomer(l) ? undefined : boostUrl(base, lang),
        unsubscribeUrl: unsubscribeUrl(base, l.email),
        previous: {
          score: last.overall_score ?? prev.overallScore, mentions: prev.mentions ?? 0, total: prev.totalAnswers ?? 4,
          date: new Date(last.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'long' }),
        },
      })
      await sendMail({
        to: l.email, ...mail,
        ...(pdf ? { attachments: [{ filename: reportFilename(result), content: pdf }] } : {}),
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl(base, l.email)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      })
      await supabaseAdmin.from('client_updates').insert({ email: l.email, kind: 'report', title: 'monthly_analysis', body: `${result.overallScore}`, link: row?.id ? `/espace-client` : null })
      done++
    } catch (e) {
      console.error('[retest] failed', l.email, e)
      errors++
    }
  }
  return { done, errors }
}
