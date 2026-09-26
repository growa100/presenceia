// Renders the PDF report for the latest stored analysis (or a given business name) into tmp/.
// npx tsx --env-file=.env.local scripts/test-pdf.tsx ["Business name"] [fr|de|en]
import { writeFileSync, mkdirSync } from 'fs'
import { supabaseAdmin } from '../lib/supabase'
import { renderReportPdf, reportFilename } from '../lib/report-pdf'
import { buildReportEmail } from '../lib/report-email'

async function main() {
  const [name, lang] = process.argv.slice(2)
  let q = supabaseAdmin.from('visibility_checks').select('result, language').order('created_at', { ascending: false }).limit(1)
  if (name) q = q.ilike('business_name', `%${name}%`)
  const { data, error } = await q.maybeSingle()
  if (error || !data) throw new Error(error?.message || 'no analysis found')
  const l = lang || data.language || 'fr'
  const t0 = Date.now()
  const pdf = await renderReportPdf(data.result, l, 'https://presenceia.com/#audit')
  mkdirSync('tmp', { recursive: true })
  const file = `tmp/${reportFilename(data.result)}`
  writeFileSync(file, pdf)
  const mail = buildReportEmail(data.result, l, { pdf: true, spaceUrl: 'https://presenceia.com/espace-client' })
  writeFileSync('tmp/report-email.html', mail.html)
  console.log(`${file} ${Math.round(pdf.length / 1024)} KB in ${Date.now() - t0} ms; subject: ${mail.subject}`)
}
main().catch(e => { console.error(e); process.exit(1) })
