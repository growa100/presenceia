// The report emailed after each check. Plain wording, the AI results as measured, and one next step:
// the free full audit. The PDF of the full report is attached; the client space link logs the visitor in.
import type { ScoringResult } from './scoring-engine'
import { aggregateSources } from './geo/present'
import { escapeHtml as h } from './mailer'
import { E, emailShell, mailLang } from './email-layout'
import { bookingHref } from './links'

type L = 'fr' | 'de' | 'en'

const T = {
  fr: {
    subject: (b: string, m: number, t: number) => `Votre analyse de visibilité IA : ${b} (${m}/${t} assistants)`,
    hello: 'Bonjour,',
    intro: (b: string, c: string, s: string) => `Voici le résultat de l'analyse de ${b} (${c}, ${s}). Nous avons posé la question qu'un client poserait à ChatGPT, Claude, Gemini et Perplexity, avec leur recherche web activée.`,
    score: 'Score', grade: 'note', named: (m: number, t: number) => `Cité par ${m} assistant${m > 1 ? 's' : ''} sur ${t}`,
    per: 'Réponse par assistant', yes: (p: number | null) => p ? `cité, position ${p}` : 'cité', no: 'pas cité',
    instead: 'Recommandés à votre place', sources: 'Les sites sur lesquels les IA se sont appuyées',
    diag: 'Diagnostic', actions: 'Vos 3 actions prioritaires',
    nextTitle: 'Étape suivante : votre audit complet, offert',
    next: 'En 30 minutes avec Antoine, nous passons en revue votre site, votre fiche Google, les annuaires et vos avis, et nous vous remettons un plan d\'action écrit. Sans engagement.',
    cta: 'Réserver mon audit offert', reply: 'Ou répondez simplement à cet email avec vos disponibilités.',
    sign: 'Antoine Pury, Présence IA', why: 'Vous recevez cet email parce que vous avez demandé une analyse sur presenceia.com.',
    pdf: 'Le rapport complet, avec les réponses mot pour mot, est joint en PDF.', space: 'Retrouvez vos analyses et votre suivi dans votre espace client :', spaceCta: 'Ouvrir mon espace client',
  },
  de: {
    subject: (b: string, m: number, t: number) => `Ihre KI-Sichtbarkeitsanalyse: ${b} (${m}/${t} Assistenten)`,
    hello: 'Guten Tag,',
    intro: (b: string, c: string, s: string) => `Hier ist das Ergebnis der Analyse für ${b} (${c}, ${s}). Wir haben ChatGPT, Claude, Gemini und Perplexity die Frage gestellt, die ein Kunde stellen würde, mit aktivierter Websuche.`,
    score: 'Score', grade: 'Note', named: (m: number, t: number) => `Von ${m} von ${t} Assistenten genannt`,
    per: 'Antwort pro Assistent', yes: (p: number | null) => p ? `genannt, Position ${p}` : 'genannt', no: 'nicht genannt',
    instead: 'An Ihrer Stelle empfohlen', sources: 'Websites, auf die sich die KI gestützt hat',
    diag: 'Diagnose', actions: 'Ihre 3 wichtigsten Massnahmen',
    nextTitle: 'Nächster Schritt: Ihr vollständiges Audit, kostenlos',
    next: 'In 30 Minuten mit Antoine prüfen wir Ihre Website, Ihr Google-Profil, Verzeichnisse und Bewertungen und geben Ihnen einen schriftlichen Aktionsplan. Unverbindlich.',
    cta: 'Kostenloses Audit buchen', reply: 'Oder antworten Sie einfach auf diese E-Mail mit Ihren Verfügbarkeiten.',
    sign: 'Antoine Pury, Présence IA', why: 'Sie erhalten diese E-Mail, weil Sie auf presenceia.com eine Analyse angefordert haben.',
    pdf: 'Der vollständige Bericht mit den Antworten im Wortlaut liegt als PDF bei.', space: 'Ihre Analysen und Ihre Begleitung finden Sie im Kundenbereich:', spaceCta: 'Kundenbereich öffnen',
  },
  en: {
    subject: (b: string, m: number, t: number) => `Your AI visibility analysis: ${b} (${m}/${t} assistants)`,
    hello: 'Hello,',
    intro: (b: string, c: string, s: string) => `Here is the analysis for ${b} (${c}, ${s}). We asked ChatGPT, Claude, Gemini and Perplexity the question a customer would ask, with their web search switched on.`,
    score: 'Score', grade: 'grade', named: (m: number, t: number) => `Named by ${m} of ${t} assistants`,
    per: 'Answer per assistant', yes: (p: number | null) => p ? `named, position ${p}` : 'named', no: 'not named',
    instead: 'Recommended instead of you', sources: 'Websites the assistants relied on',
    diag: 'Diagnosis', actions: 'Your 3 priority actions',
    nextTitle: 'Next step: your full audit, free',
    next: 'In 30 minutes with Antoine, we review your website, Google profile, directories and reviews, and give you a written action plan. No commitment.',
    cta: 'Book my free audit', reply: 'Or simply reply to this email with a few times that suit you.',
    sign: 'Antoine Pury, Présence IA', why: 'You receive this email because you requested an analysis on presenceia.com.',
    pdf: 'The full report, with the answers word for word, is attached as a PDF.', space: 'Find your analyses and follow-up in your client area:', spaceCta: 'Open my client area',
  },
}


export function buildReportEmail(r: ScoringResult, language: string, opts: { spaceUrl?: string; pdf?: boolean } = {}): { subject: string; text: string; html: string } {
  const lang = mailLang(language)
  const t = T[lang as L]
  const AUDIT_URL = bookingHref(lang, r.businessName)
  const answers = (r.answers || r.platformResults).filter(a => !a.error)
  const total = r.totalAnswers ?? answers.length
  const mentions = r.mentions ?? answers.filter(a => a.appeared).length
  const comps = (r.competitors || []).slice(0, 6)
  const srcs = aggregateSources(answers, 6)

  const text = [
    t.hello, '', t.intro(r.businessName, r.city, r.category), '',
    `${t.score} : ${r.overallScore}/100 (${t.grade} ${r.grade}). ${t.named(mentions, total)}.`, '',
    `${t.per} :`, ...answers.map(a => `- ${a.platformLabel} : ${a.appeared ? t.yes(a.position) : t.no}`), '',
    ...(comps.length ? [`${t.instead} :`, ...comps.map(c => `- ${c.name} (${c.count}/${total})`), ''] : []),
    ...(srcs.length ? [`${t.sources} : ${srcs.map(s => s.domain).join(', ')}`, ''] : []),
    `${t.diag} :`, r.summary, '',
    `${t.actions} :`, ...r.topRecommendations.map((a, i) => `${i + 1}. ${a}`), '',
    t.nextTitle, t.next, `${t.cta} : ${AUDIT_URL}`, t.reply, '',
    ...(opts.pdf ? [t.pdf, ''] : []),
    ...(opts.spaceUrl ? [`${t.space} ${opts.spaceUrl}`, ''] : []),
    t.sign, 'antoine@presenceia.com', '', t.why,
  ].join('\n').replace(/ : /g, language === 'fr' ? ' : ' : ': ')

  const row = (label: string, value: string, ok: boolean) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #E6E1D6;color:#0A0A0F;font-weight:600">${h(label)}</td><td style="padding:8px 0;border-bottom:1px solid #E6E1D6;text-align:right;color:${ok ? '#2F855A' : '#E8372A'};font-weight:600">${h(value)}</td></tr>`
  const section = (title: string, body: string) =>
    `<h3 style="font-family:Georgia,serif;font-weight:400;font-size:20px;color:#0A0A0F;margin:28px 0 10px">${h(title)}</h3>${body}`

  const body = `<p style="margin:0 0 12px">${h(t.hello)}</p>
<p style="margin:0 0 20px;line-height:1.6">${h(t.intro(r.businessName, r.city, r.category))}</p>
<div style="background:#0A0A0F;color:#fff;border-radius:16px;padding:20px 24px">
<div style="font-family:Georgia,serif;font-size:44px;line-height:1">${r.overallScore}<span style="font-size:16px;color:#9a9aab">/100</span> <span style="font-size:14px;background:#E8372A;border-radius:99px;padding:3px 10px;vertical-align:middle">${h(t.grade)} ${h(r.grade)}</span></div>
<div style="margin-top:8px;color:#c9c9d6">${h(t.named(mentions, total))}</div>
</div>
${section(t.per, `<table style="width:100%;border-collapse:collapse;font-size:14px">${answers.map(a => row(a.platformLabel, a.appeared ? t.yes(a.position) : t.no, a.appeared)).join('')}</table>`)}
${comps.length ? section(t.instead, `<ul style="padding-left:18px;margin:0;line-height:1.8">${comps.map(c => `<li><strong>${h(c.name)}</strong> <span style="color:#6B6B80">(${c.count}/${total})</span></li>`).join('')}</ul>`) : ''}
${srcs.length ? section(t.sources, `<p style="margin:0;line-height:1.8;color:#6B6B80">${srcs.map(s => h(s.domain)).join(' · ')}</p>`) : ''}
${section(t.diag, `<p style="margin:0;line-height:1.6">${h(r.summary)}</p>`)}
${section(t.actions, `<ol style="padding-left:18px;margin:0;line-height:1.6">${r.topRecommendations.map(a => `<li style="margin-bottom:8px">${h(a)}</li>`).join('')}</ol>`)}
${E.box(`<p style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;color:#0A0A0F">${h(t.nextTitle)}</p>
<p style="margin:0;line-height:1.6">${h(t.next)}</p>
${E.button(AUDIT_URL, t.cta)}
<p style="margin:0;font-size:13px;color:#6B6B80">${h(t.reply)}</p>`)}
${opts.pdf ? E.small(t.pdf) : ''}
${opts.spaceUrl ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#6B6B80">${h(t.space)} ${E.link(opts.spaceUrl, t.spaceCta)}</p>` : ''}
${E.signature(lang)}`
  const html = emailShell({ lang, body, why: t.why, preheader: t.named(mentions, total) })

  return { subject: t.subject(r.businessName, mentions, total), text, html }
}
