// Shared layout for every automated email (code, magic link, report, audit, payment).
// Same look as the site: paper background, white card, brand red, serif headings.
import { escapeHtml as h } from './mailer'

export type MailLang = 'fr' | 'de' | 'en'
export const mailLang = (l: unknown): MailLang => (l === 'de' || l === 'en' ? l : 'fr')

const C = { paper: '#FAF8F3', line: '#E6E1D6', ink: '#0A0A0F', text: '#2A2A38', muted: '#6B6B80', brand: '#E8372A', ok: '#2F855A' }
const SERIF = 'Georgia,\'Times New Roman\',serif'

const FOOT = {
  fr: 'Présence IA, Sion',
  de: 'Présence IA, Sitten (Sion)',
  en: 'Présence IA, Sion, Switzerland',
}

/** Wraps body HTML in the branded shell. `preheader` is the grey preview line in the inbox. */
export function emailShell(o: { lang: MailLang; body: string; preheader?: string; why?: string }): string {
  return `<!doctype html><html lang="${o.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;background:${C.paper};font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:${C.text}">
${o.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${h(o.preheader)}</div>` : ''}
<div style="max-width:600px;margin:0 auto;padding:32px 20px">
<p style="font-weight:700;color:${C.ink};font-size:17px;margin:0 0 24px;letter-spacing:-0.2px">présence<span style="color:${C.brand}">ia</span></p>
<div style="background:#fff;border:1px solid ${C.line};border-radius:20px;padding:28px">
${o.body}
</div>
<p style="font-size:12px;line-height:1.6;color:#8a8a99;margin:16px 4px">${o.why ? `${h(o.why)}<br>` : ''}${h(FOOT[o.lang])} · <a href="https://presenceia.com" style="color:#8a8a99">presenceia.com</a></p>
</div></body></html>`
}

// ─── Building blocks (all text is escaped) ───────────────────────────────────
export const E = {
  p: (t: string, style = '') => `<p style="margin:0 0 14px;line-height:1.6;${style}">${h(t)}</p>`,
  small: (t: string) => `<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:${C.muted}">${h(t)}</p>`,
  title: (t: string) => `<h1 style="font-family:${SERIF};font-weight:400;font-size:26px;line-height:1.25;color:${C.ink};margin:0 0 14px">${h(t)}</h1>`,
  h2: (t: string) => `<h2 style="font-family:${SERIF};font-weight:400;font-size:20px;color:${C.ink};margin:28px 0 10px">${h(t)}</h2>`,
  button: (href: string, label: string) =>
    `<p style="margin:20px 0"><a href="${h(href)}" style="display:inline-block;background:${C.brand};color:#fff;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:12px">${h(label)}</a></p>`,
  link: (href: string, label: string) => `<a href="${h(href)}" style="color:${C.brand}">${h(label)}</a>`,
  code: (code: string) =>
    `<div style="margin:18px 0;background:${C.ink};border-radius:16px;padding:22px;text-align:center"><span style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:34px;letter-spacing:10px;color:#fff;font-weight:600">${h(code)}</span></div>`,
  box: (inner: string) => `<div style="margin-top:24px;background:${C.paper};border:1px solid ${C.line};border-radius:16px;padding:22px">${inner}</div>`,
  rows: (rows: [string, string][]) =>
    `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows.map(([k, v]) =>
      `<tr><td style="padding:7px 12px 7px 0;border-bottom:1px solid ${C.line};color:${C.muted};vertical-align:top;white-space:nowrap">${h(k)}</td><td style="padding:7px 0;border-bottom:1px solid ${C.line};color:${C.ink}">${h(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>`,
  signature: (lang: MailLang) =>
    `<p style="margin:26px 0 0;line-height:1.6">${lang === 'de' ? 'Freundliche Grüsse' : lang === 'en' ? 'Best regards' : 'Belle journée'},<br><strong style="color:${C.ink}">Antoine Pury</strong>, Présence IA<br><a href="mailto:antoine@presenceia.com" style="color:${C.brand}">antoine@presenceia.com</a></p>`,
  colors: C,
  serif: SERIF,
}
