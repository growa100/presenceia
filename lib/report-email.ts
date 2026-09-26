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
    monthly: (b: string, m: number, t: number) => `Analyse mensuelle : ${b} (${m}/${t} assistants)`, monthlyIntro: (d: string, sc: number, m: number, t: number) => `Voici votre analyse du mois, avec les mêmes questions. Lors de la précédente (${d}), votre score était de ${sc}/100 et ${m} assistant${m > 1 ? 's' : ''} sur ${t} vous citai${m > 1 ? 'ent' : 't'}.`, delta: (d: number) => d > 0 ? `+${d} points depuis la dernière analyse` : d < 0 ? `${d} points depuis la dernière analyse` : 'Stable depuis la dernière analyse', unsub: 'Ne plus recevoir ces analyses',
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
    boostTitle: 'Ou passez directement à l\'action', boostText: 'Le GEO Boost corrige en 2 semaines ce qui empêche les IA de vous citer : fiche Google, annuaires, données structurées, avis. CHF 490, une seule fois.', boostCta: 'Lancer mon GEO Boost',
    pdf: 'Le rapport complet, avec les réponses mot pour mot, est joint en PDF.', space: 'Retrouvez vos analyses et votre suivi dans votre espace client :', spaceCta: 'Ouvrir mon espace client',
  },
  de: {
    monthly: (b: string, m: number, t: number) => `Monatliche Analyse: ${b} (${m}/${t} Assistenten)`, monthlyIntro: (d: string, sc: number, m: number, t: number) => `Hier ist Ihre Analyse des Monats, mit denselben Fragen. Bei der letzten (${d}) lag Ihr Score bei ${sc}/100 und ${m} von ${t} Assistenten nannten Sie.`, delta: (d: number) => d > 0 ? `+${d} Punkte seit der letzten Analyse` : d < 0 ? `${d} Punkte seit der letzten Analyse` : 'Stabil seit der letzten Analyse', unsub: 'Diese Analysen nicht mehr erhalten',
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
    boostTitle: 'Oder direkt handeln', boostText: 'Der GEO Boost behebt in 2 Wochen, was die KI daran hindert, Sie zu nennen: Google-Profil, Verzeichnisse, strukturierte Daten, Bewertungen. CHF 490, einmalig.', boostCta: 'GEO Boost starten',
    pdf: 'Der vollständige Bericht mit den Antworten im Wortlaut liegt als PDF bei.', space: 'Ihre Analysen und Ihre Begleitung finden Sie im Kundenbereich:', spaceCta: 'Kundenbereich öffnen',
  },
  en: {
    monthly: (b: string, m: number, t: number) => `Monthly analysis: ${b} (${m}/${t} assistants)`, monthlyIntro: (d: string, sc: number, m: number, t: number) => `Here is your analysis of the month, with the same questions. Last time (${d}), your score was ${sc}/100 and ${m} of ${t} assistants named you.`, delta: (d: number) => d > 0 ? `+${d} points since the last analysis` : d < 0 ? `${d} points since the last analysis` : 'Stable since the last analysis', unsub: 'Stop receiving these analyses',
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
    boostTitle: 'Or take action now', boostText: 'The GEO Boost fixes in 2 weeks what keeps AI from naming you: Google profile, directories, structured data, reviews. CHF 490, one-time.', boostCta: 'Start my GEO Boost',
    pdf: 'The full report, with the answers word for word, is attached as a PDF.', space: 'Find your analyses and follow-up in your client area:', spaceCta: 'Open my client area',
  },
}


export function buildReportEmail(r: ScoringResult, language: string, opts: { spaceUrl?: string; pdf?: boolean; boostUrl?: string; previous?: { score: number; mentions: number; total: number; date: string }; unsubscribeUrl?: string } = {}): { subject: string; text: string; html: string } {
  const lang = mailLang(language)
  const t = T[lang as L]
  const AUDIT_URL = bookingHref(lang, r.businessName)
  const answers = (r.answers || r.platformResults).filter(a => !a.error)
  const total = r.totalAnswers ?? answers.length
  const mentions = r.mentions ?? answers.filter(a => a.appeared).length
  const comps = (r.competitors || []).slice(0, 6)
  const srcs = aggregateSources(answers, 6)

  const text = [
    t.hello, '', opts.previous ? t.monthlyIntro(opts.previous.date, opts.previous.score, opts.previous.mentions, opts.previous.total) : t.intro(r.businessName, r.city, r.category), '',
    `${t.score} : ${r.overallScore}/100 (${t.grade} ${r.grade}). ${t.named(mentions, total)}.`, '',
    `${t.per} :`, ...answers.map(a => `- ${a.platformLabel} : ${a.appeared ? t.yes(a.position) : t.no}`), '',
    ...(comps.length ? [`${t.instead} :`, ...comps.map(c => `- ${c.name} (${c.count}/${total})`), ''] : []),
    ...(srcs.length ? [`${t.sources} : ${srcs.map(s => s.domain).join(', ')}`, ''] : []),
    `${t.diag} :`, r.summary, '',
    `${t.actions} :`, ...r.topRecommendations.map((a, i) => `${i + 1}. ${a}`), '',
    t.nextTitle, t.next, `${t.cta} : ${AUDIT_URL}`, t.reply, '',
    ...(opts.boostUrl ? [t.boostTitle, t.boostText, `${t.boostCta} : ${opts.boostUrl}`, ''] : []),
    ...(opts.pdf ? [t.pdf, ''] : []),
    ...(opts.spaceUrl ? [`${t.space} ${opts.spaceUrl}`, ''] : []),
    t.sign, 'antoine@presenceia.com', '', t.why,
  ].join('\n').replace(/ : /g, language === 'fr' ? ' : ' : ': ')

  const row = (label: string, value: string, ok: boolean) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #E6E1D6;color:#0A0A0F;font-weight:600">${h(label)}</td><td style="padding:8px 0;border-bottom:1px solid #E6E1D6;text-align:right;color:${ok ? '#2F855A' : '#E8372A'};font-weight:600">${h(value)}</td></tr>`
  const section = (title: string, body: string) =>
    `<h3 style="font-family:Georgia,serif;font-weight:400;font-size:20px;color:#0A0A0F;margin:28px 0 10px">${h(title)}</h3>${body}`

  const body = `<p style="margin:0 0 12px">${h(t.hello)}</p>
<p style="margin:0 0 20px;line-height:1.6">${h(opts.previous ? t.monthlyIntro(opts.previous.date, opts.previous.score, opts.previous.mentions, opts.previous.total) : t.intro(r.businessName, r.city, r.category))}</p>
<div style="background:#0A0A0F;color:#fff;border-radius:16px;padding:20px 24px">
<div style="font-family:Georgia,serif;font-size:44px;line-height:1">${r.overallScore}<span style="font-size:16px;color:#9a9aab">/100</span> <span style="font-size:14px;background:#E8372A;border-radius:99px;padding:3px 10px;vertical-align:middle">${h(t.grade)} ${h(r.grade)}</span></div>
<div style="margin-top:8px;color:#c9c9d6">${h(t.named(mentions, total))}</div>${opts.previous ? `<div style="margin-top:4px;color:${r.overallScore >= opts.previous.score ? '#9AE6B4' : '#FC8181'}">${h(t.delta(r.overallScore - opts.previous.score))}</div>` : ''}
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
${opts.boostUrl ? E.box(`<p style="margin:0 0 8px;font-family:Georgia,serif;font-size:18px;color:#0A0A0F">${h(t.boostTitle)}</p><p style="margin:0;line-height:1.6">${h(t.boostText)}</p>${E.buttonDark(opts.boostUrl, t.boostCta)}`) : ''}
${opts.pdf ? E.small(t.pdf) : ''}
${opts.spaceUrl ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#6B6B80">${h(t.space)} ${E.link(opts.spaceUrl, t.spaceCta)}</p>` : ''}
${E.signature(lang)}`
  const unsub = opts.unsubscribeUrl ? `<p style="margin:18px 0 0;font-size:12px;color:#8a8a99">${E.link(opts.unsubscribeUrl, t.unsub)}</p>` : ''
  const html = emailShell({ lang, body: body + unsub, why: t.why, preheader: t.named(mentions, total) })

  const fullText = opts.unsubscribeUrl ? `${text}\n\n${t.unsub} : ${opts.unsubscribeUrl}` : text
  return { subject: opts.previous ? t.monthly(r.businessName, mentions, total) : t.subject(r.businessName, mentions, total), text: fullText, html }
}
