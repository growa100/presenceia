// Client space sign-in: human check, then a 30-minute magic link by email. Any email can ask:
// a new visitor lands on an empty space that invites them to run the free analysis.
import { NextRequest, NextResponse } from 'next/server'
import { clientIp, isValidEmail, magicUrl, normalizeEmail, verifyHuman } from '@/lib/checker-auth'
import { sendMail } from '@/lib/mailer'
import { E, emailShell, mailLang } from '@/lib/email-layout'
import { baseUrl } from '@/lib/links'

const M = {
  fr: { s: 'Votre lien de connexion Présence IA', t: 'Votre espace client', b: 'Cliquez sur le bouton pour ouvrir votre espace client : vos analyses, votre suivi et vos rendez-vous. Le lien est valable 30 minutes.', cta: 'Ouvrir mon espace client', ign: 'Si vous n\'avez rien demandé, ignorez simplement ce message.' },
  de: { s: 'Ihr Anmeldelink für Présence IA', t: 'Ihr Kundenbereich', b: 'Klicken Sie auf die Schaltfläche, um Ihren Kundenbereich zu öffnen: Analysen, Begleitung und Termine. Der Link ist 30 Minuten gültig.', cta: 'Kundenbereich öffnen', ign: 'Falls Sie nichts angefordert haben, ignorieren Sie diese Nachricht.' },
  en: { s: 'Your Présence IA sign-in link', t: 'Your client area', b: 'Click the button to open your client area: your analyses, follow-up and appointments. The link is valid for 30 minutes.', cta: 'Open my client area', ign: 'If you did not ask for it, simply ignore this message.' },
}

export async function POST(req: NextRequest) {
  let body: { email?: string; turnstileToken?: string; language?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const email = normalizeEmail(body.email || '')
  if (!isValidEmail(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  if (!(await verifyHuman(body.turnstileToken, clientIp(req)))) {
    return NextResponse.json({ error: 'human_check_failed' }, { status: 403 })
  }

  const lang = mailLang(body.language)
  const m = M[lang]
  const link = magicUrl(baseUrl(req), email, '30m')
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'production') {
    console.log(`[client] DEV magic link for ${email}: ${link}`)
    return NextResponse.json({ ok: true, devLink: link })
  }
  const sent = await sendMail({
    to: email, subject: m.s,
    text: `${m.t}\n\n${m.b}\n\n${link}\n\n${m.ign}\n\nPrésence IA, 41 Labs GmbH, Zug`,
    html: emailShell({ lang, preheader: m.b, body: E.title(m.t) + E.p(m.b) + E.button(link, m.cta) + E.small(m.ign) }),
  })
  if (!sent) return NextResponse.json({ error: 'email_failed' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
