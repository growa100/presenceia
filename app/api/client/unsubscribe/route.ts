// One-click opt-out from the tips and monthly analysis emails (not from transactional ones).
// GET = link in the email, POST = mail clients' one-click (List-Unsubscribe-Post).
import { NextRequest, NextResponse } from 'next/server'
import { verifyUnsubscribeToken } from '@/lib/checker-auth'
import { supabaseAdmin } from '@/lib/supabase'

async function optOut(req: NextRequest): Promise<boolean> {
  const email = verifyUnsubscribeToken(req.nextUrl.searchParams.get('t') || '')
  if (!email) return false
  await supabaseAdmin.from('leads').update({ marketing_opt_out: true }).eq('email', email)
  return true
}

export async function POST(req: NextRequest) {
  return (await optOut(req)) ? new NextResponse(null, { status: 200 }) : new NextResponse(null, { status: 400 })
}

export async function GET(req: NextRequest) {
  const ok = await optOut(req)
  const page = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Présence IA</title></head>
<body style="margin:0;background:#FAF8F3;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#2A2A38">
<div style="max-width:520px;margin:80px auto;padding:0 20px"><p style="font-weight:700;color:#0A0A0F">présence<span style="color:#E8372A">ia</span></p>
<div style="background:#fff;border:1px solid #E6E1D6;border-radius:20px;padding:28px"><h1 style="font-family:Georgia,serif;font-weight:400;font-size:24px;color:#0A0A0F;margin:0 0 10px">
${ok ? 'C’est noté.' : 'Lien expiré'}</h1><p style="line-height:1.6;margin:0">${ok
    ? 'Vous ne recevrez plus nos conseils ni l’analyse mensuelle. Votre espace client reste accessible sur presenceia.com.'
    : 'Ce lien n’est plus valable. Écrivez « stop » à antoine@presenceia.com et nous vous retirons de la liste.'}</p></div></div></body></html>`
  return new NextResponse(page, { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
