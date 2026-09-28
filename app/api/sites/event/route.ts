// Events from the droplet about a client's site, turned into client emails (all client-facing
// email goes out from here, with the usual layout). Authenticated with the shared cockpit key.
//   site_live        { email, slug, url, business }
//   dns_reminder     { email, slug, domain, business, records, provider }
//   contact_message  { email, slug, business, visitor_name, visitor_email, message }
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { COCKPIT_API_KEY } from '@/lib/cockpit'
import { E, emailShell, mailLang, type MailLang } from '@/lib/email-layout'
import { magicUrl, normalizeEmail } from '@/lib/checker-auth'
import { baseUrl } from '@/lib/links'
import { sendMail } from '@/lib/mailer'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const T = {
  fr: {
    liveS: (u: string) => `Votre site est en ligne : ${u.replace('https://', '')}`, liveT: 'Votre site est en ligne',
    liveB: 'Votre nom de domaine pointe maintenant vers votre nouveau site, avec un certificat de sécurité (https). L\'ancienne adresse de prévisualisation redirige vers lui.',
    liveCta: 'Voir mon site', liveNext: 'Une correction (texte, photo, horaires) ? Répondez à cet email, c\'est compris dans votre abonnement.',
    remS: (d: string) => `Il reste un réglage pour mettre votre site en ligne sur ${d}`, remT: 'Plus qu\'un réglage',
    remB: (d: string, p: string) => `Votre site est prêt, mais ${d} ne pointe pas encore vers lui. Chez ${p}, dans la zone DNS de ${d}, il faut ces enregistrements :`,
    remNote: 'Ne touchez pas aux enregistrements MX : vos emails continuent de fonctionner comme avant. Si vous ne savez pas où faire ce réglage, répondez à cet email : nous le faisons ensemble en 10 minutes.',
    remCta: 'Voir les instructions', provider: 'votre fournisseur',
    msgS: (n: string) => `Nouveau message depuis votre site : ${n}`, msgT: 'Nouveau message depuis votre site',
    msgB: 'Un visiteur vous a écrit via le formulaire de contact. Répondez directement à cet email pour lui répondre.',
    from: 'De', email: 'Email', message: 'Message',
  },
  de: {
    liveS: (u: string) => `Ihre Website ist online: ${u.replace('https://', '')}`, liveT: 'Ihre Website ist online',
    liveB: 'Ihre Domain zeigt jetzt auf Ihre neue Website, mit Sicherheitszertifikat (https). Die alte Vorschau-Adresse leitet dorthin weiter.',
    liveCta: 'Meine Website ansehen', liveNext: 'Eine Korrektur (Text, Foto, Öffnungszeiten)? Antworten Sie auf diese E-Mail, das ist im Abonnement inbegriffen.',
    remS: (d: string) => `Noch eine Einstellung, damit Ihre Website auf ${d} online geht`, remT: 'Nur noch eine Einstellung',
    remB: (d: string, p: string) => `Ihre Website ist bereit, aber ${d} zeigt noch nicht darauf. Bei ${p}, in der DNS-Zone von ${d}, braucht es diese Einträge:`,
    remNote: 'Ändern Sie die MX-Einträge nicht: Ihre E-Mails funktionieren weiter wie bisher. Wenn Sie nicht wissen, wo das geht, antworten Sie auf diese E-Mail: wir machen es gemeinsam in 10 Minuten.',
    remCta: 'Anleitung ansehen', provider: 'Ihrem Anbieter',
    msgS: (n: string) => `Neue Nachricht über Ihre Website: ${n}`, msgT: 'Neue Nachricht über Ihre Website',
    msgB: 'Ein Besucher hat Ihnen über das Kontaktformular geschrieben. Antworten Sie direkt auf diese E-Mail.',
    from: 'Von', email: 'E-Mail', message: 'Nachricht',
  },
  en: {
    liveS: (u: string) => `Your website is live: ${u.replace('https://', '')}`, liveT: 'Your website is live',
    liveB: 'Your domain now points to your new website, with a security certificate (https). The old preview address redirects to it.',
    liveCta: 'See my website', liveNext: 'A correction (text, photo, opening hours)? Reply to this email, it is included in your subscription.',
    remS: (d: string) => `One setting left to put your website live on ${d}`, remT: 'One setting left',
    remB: (d: string, p: string) => `Your website is ready, but ${d} does not point to it yet. At ${p}, in the DNS zone of ${d}, these records are needed:`,
    remNote: 'Do not touch the MX records: your email keeps working as before. If you are not sure where to do this, reply to this email and we will do it together in 10 minutes.',
    remCta: 'See the instructions', provider: 'your provider',
    msgS: (n: string) => `New message from your website: ${n}`, msgT: 'New message from your website',
    msgB: 'A visitor wrote to you through the contact form. Reply to this email to answer them.',
    from: 'From', email: 'Email', message: 'Message',
  },
}

function authorized(req: NextRequest): boolean {
  const k = req.headers.get('x-cockpit-key') || ''
  if (!COCKPIT_API_KEY || k.length !== COCKPIT_API_KEY.length) return false
  return crypto.timingSafeEqual(Buffer.from(k), Buffer.from(COCKPIT_API_KEY))
}

async function langFor(email: string): Promise<MailLang> {
  const { data } = await supabaseAdmin.from('leads').select('language').eq('email', email).maybeSingle()
  return mailLang(data?.language)
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  type Ev = {
    event?: string; email?: string; url?: string; domain?: string; provider?: { label?: string } | null
    records?: unknown; visitor_name?: string; visitor_email?: string; message?: string
  }
  let b: Ev
  try { b = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }
  const email = normalizeEmail(String(b?.email || ''))
  if (!email) return NextResponse.json({ error: 'no_email' }, { status: 400 })
  const lang = await langFor(email)
  const t = T[lang]
  const base = baseUrl(req)

  if (b.event === 'site_live') {
    const url = String(b.url || '')
    await supabaseAdmin.from('client_updates').insert({ email, kind: 'site', title: 'site_live', body: url, link: url })
    const ok = await sendMail({
      to: email, subject: t.liveS(url),
      text: [t.liveB, '', url, '', t.liveNext, '', 'Antoine Pury, Présence IA'].join('\n'),
      html: emailShell({ lang, preheader: t.liveB, body: E.title(t.liveT) + E.p(t.liveB) + E.button(url, t.liveCta) + E.small(t.liveNext) + E.signature(lang) }),
    })
    return NextResponse.json({ ok })
  }

  if (b.event === 'dns_reminder') {
    const domain = String(b.domain || '')
    const prov = String(b.provider?.label || t.provider)
    const records: { type: string; host: string; value: string }[] = Array.isArray(b.records) ? b.records : []
    const rows = records.map(r => [`${r.type} ${r.host === '@' ? domain : `${r.host}.${domain}`}`, r.value] as [string, string])
    const space = magicUrl(base, email, '7d')
    const ok = await sendMail({
      to: email, subject: t.remS(domain),
      text: [t.remB(domain, prov), ...rows.map(([k, v]) => `${k} -> ${v}`), '', t.remNote, '', space, '', 'Antoine Pury, Présence IA'].join('\n'),
      html: emailShell({ lang, preheader: t.remT, body:
        E.title(t.remT) + E.p(t.remB(domain, prov)) + E.rows(rows) + E.small(t.remNote) + E.button(space, t.remCta) + E.signature(lang) }),
    })
    return NextResponse.json({ ok })
  }

  if (b.event === 'contact_message') {
    const name = String(b.visitor_name || '').slice(0, 200), from = normalizeEmail(String(b.visitor_email || ''))
    const msg = String(b.message || '').slice(0, 5000)
    const ok = await sendMail({
      to: email, replyTo: from || undefined, subject: t.msgS(name || from),
      text: [t.msgB, '', `${t.from}: ${name}`, `${t.email}: ${from}`, '', msg].join('\n'),
      html: emailShell({ lang, preheader: msg.slice(0, 120), body:
        E.title(t.msgT) + E.p(t.msgB) + E.rows([[t.from, name], [t.email, from], [t.message, msg]]) }),
    })
    return NextResponse.json({ ok })
  }

  return NextResponse.json({ error: 'unknown_event' }, { status: 400 })
}
