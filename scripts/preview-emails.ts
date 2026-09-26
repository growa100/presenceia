// Writes the nurture emails (J+2, J+5, J+10) and a monthly re-analysis email to tmp/ as HTML,
// using the latest stored analysis. Nothing is sent: fetch to Resend is intercepted.
// Build + run: see scripts/test-pdf.tsx (esbuild, then node --env-file=.env.local).
import { writeFileSync, mkdirSync } from 'fs'
import { supabaseAdmin } from '../lib/supabase'
import { sendNurture } from '../lib/nurture'
import { buildReportEmail } from '../lib/report-email'

const realFetch = globalThis.fetch
let n = 0
globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
  if (String(url).includes('api.resend.com')) {
    const body = JSON.parse(String(init?.body || '{}'))
    writeFileSync(`tmp/email-nurture-${++n}.html`, body.html)
    console.log(`nurture ${n}: ${body.subject}`)
    return new Response('{}', { status: 200 })
  }
  return realFetch(url, init)
}) as typeof fetch

async function main() {
  mkdirSync('tmp', { recursive: true })
  const { data } = await supabaseAdmin.from('visibility_checks').select('result, language, email').ilike('business_name', `%${process.argv[2] || 'Elite'}%`).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!data) throw new Error('no analysis')
  for (const step of [1, 2, 3]) await sendNurture(step, { email: 'preview@example.com', lang: 'fr', base: 'https://presenceia.com', r: data.result, founder: true })
  const m = buildReportEmail(data.result, 'fr', { pdf: true, spaceUrl: 'https://presenceia.com/espace-client', offer: { url: 'https://presenceia.com/api/stripe/checkout?plan=visibility&term=m12&lang=fr', founder: true },
    unsubscribeUrl: 'https://presenceia.com/api/client/unsubscribe?t=x', previous: { score: 25, mentions: 1, total: 4, date: '26 août' } })
  writeFileSync('tmp/email-monthly.html', m.html)
  console.log(`monthly: ${m.subject}`)
}
main().catch(e => { console.error(e); process.exit(1) })
