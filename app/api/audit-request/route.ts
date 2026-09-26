// Request for the free full audit (30-minute call + written plan). No AI cost, so it is open to
// verified visitors (session from the free check) and to others after a human check.
// Antoine gets the request by email; a verified visitor gets a confirmation.
import { NextRequest, NextResponse, after } from 'next/server'
import { clientIp, getSessionEmail, isValidEmail, normalizeEmail, verifyHuman } from '@/lib/checker-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { sendMail, escapeHtml as h } from '@/lib/mailer'

const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n)

const CONFIRM = {
  fr: { s: 'Votre audit Présence IA est demandé', b: (n: string) => `Bonjour,\n\nMerci, votre demande d'audit complet pour ${n} est bien reçue. Antoine vous contacte sous 24 h (jours ouvrés) pour fixer les 30 minutes qui vous conviennent.\n\nD'ici là, vous pouvez répondre à cet email pour ajouter une information.\n\nAntoine Pury, Présence IA\nantoine@presenceia.com` },
  de: { s: 'Ihre Présence IA Audit-Anfrage', b: (n: string) => `Guten Tag,\n\nDanke, Ihre Anfrage für ein vollständiges Audit für ${n} ist eingegangen. Antoine meldet sich innert 24 Stunden (Werktage), um die 30 Minuten zu vereinbaren.\n\nSie können auf diese E-Mail antworten, um etwas zu ergänzen.\n\nAntoine Pury, Présence IA\nantoine@presenceia.com` },
  en: { s: 'Your Présence IA audit request', b: (n: string) => `Hello,\n\nThank you, your request for a full audit of ${n} is in. Antoine will contact you within 24 hours (working days) to set up the 30 minutes.\n\nYou can reply to this email to add anything.\n\nAntoine Pury, Présence IA\nantoine@presenceia.com` },
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const sessionEmail = getSessionEmail(req)
  const email = sessionEmail || normalizeEmail(String(body.email || ''))
  if (!isValidEmail(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  if (!sessionEmail && !(await verifyHuman(String(body.turnstileToken || ''), clientIp(req)))) {
    return NextResponse.json({ error: 'human_check_failed' }, { status: 403 })
  }

  const lang = (['fr', 'de', 'en'].includes(String(body.language)) ? body.language : 'fr') as 'fr' | 'de' | 'en'
  const r = {
    businessName: clip(body.businessName, 120), city: clip(body.city, 80), category: clip(body.category, 60),
    contactName: clip(body.contactName, 100), phone: clip(body.phone, 40), website: clip(body.website, 200), message: clip(body.message, 1500),
  }
  if (r.businessName.length < 2) return NextResponse.json({ error: 'missing_business' }, { status: 400 })

  // Last check for this email, to give Antoine context.
  const { data: last } = await supabaseAdmin.from('visibility_checks')
    .select('business_name, city, overall_score, grade, created_at, result')
    .eq('email', email).order('created_at', { ascending: false }).limit(1).maybeSingle()
  const lastLine = last ? `Dernière analyse : ${last.business_name}, ${last.city}, ${last.overall_score}/100 (note ${last.grade}), cité par ${last.result?.mentions ?? '?'}/${last.result?.totalAnswers ?? '?'} assistants, le ${String(last.created_at).slice(0, 10)}` : 'Pas encore d\'analyse avec cet email.'

  // Lead: keep existing notes, append the request.
  const { data: lead } = await supabaseAdmin.from('leads').select('notes').eq('email', email).maybeSingle()
  const note = `[${new Date().toISOString().slice(0, 10)}] Audit demandé : ${r.businessName}, ${r.city}${r.phone ? `, tel ${r.phone}` : ''}${r.website ? `, site ${r.website}` : ''}${r.message ? `, message : ${r.message}` : ''}`
  await supabaseAdmin.from('leads').upsert({
    email, business_name: r.businessName, city: r.city, category: r.category || null, language: lang,
    source: 'audit_request', notes: [lead?.notes, note].filter(Boolean).join('\n'),
  }, { onConflict: 'email' })

  const lines = [
    `Entreprise : ${r.businessName}`, `Ville : ${r.city}`, `Secteur : ${r.category || '-'}`,
    `Contact : ${r.contactName || '-'}`, `Email : ${email}${sessionEmail ? ' (vérifié par code)' : ' (non vérifié)'}`,
    `Téléphone : ${r.phone || '-'}`, `Site : ${r.website || '-'}`, `Langue : ${lang}`, '', `Message : ${r.message || '-'}`, '', lastLine,
  ]
  after(async () => {
    await sendMail({
      to: 'antoine@presenceia.com', replyTo: email,
      subject: `Audit demandé : ${r.businessName} (${r.city})`,
      text: lines.join('\n'),
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">${lines.map(l => h(l) || '&nbsp;').join('<br>')}</div>`,
    })
    if (sessionEmail) {
      const c = CONFIRM[lang]
      await sendMail({ to: email, subject: c.s, text: c.b(r.businessName) })
    }
  })

  return NextResponse.json({ ok: true })
}
