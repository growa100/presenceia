/* eslint-disable @typescript-eslint/no-explicit-any */
// Manual test of the visibility engine, no Supabase needed.
//   npx tsx --env-file=.env.local scripts/test-geo.ts "Garage Daytona Motors" Lausanne Carrossier fr
//   npx tsx --env-file=.env.local scripts/test-geo.ts --models     (checks the configured model IDs exist)
import { runVisibilityCheck } from '../lib/scoring-engine'
import { MODELS } from '../lib/geo/platforms'

async function listModels() {
  const checks: [string, string, Record<string, string>, string][] = [
    ['OpenAI', 'https://api.openai.com/v1/models', { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, MODELS.chatgpt],
    ['Anthropic', 'https://api.anthropic.com/v1/models?limit=100', { 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' }, `${MODELS.claude} / ${process.env.GEO_ANALYST_MODEL || 'claude-sonnet-5'}`],
    ['Gemini', 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' }, MODELS.gemini],
    ['xAI', 'https://api.x.ai/v1/models', { Authorization: `Bearer ${process.env.XAI_API_KEY}` }, MODELS.grok],
  ]
  for (const [name, url, headers, wanted] of checks) {
    try {
      const r = await fetch(url, { headers })
      const j: any = await r.json()
      const ids: string[] = (j.data || j.models || []).map((m: any) => m.id || m.name)
      console.log(`\n${name} (wanted: ${wanted}) HTTP ${r.status}`)
      console.log(ids.filter(i => /gpt-5|gpt-6|claude|gemini-3|grok/.test(i)).slice(0, 40).join('\n'))
    } catch (e) { console.log(`\n${name}: ${e}`) }
  }
}

async function main() {
  if (process.argv[2] === '--models') return listModels()
  const [name = 'Garage Daytona Motors', city = 'Lausanne', category = 'Carrossier', language = 'fr'] = process.argv.slice(2)
  const t0 = Date.now()
  const r = await runVisibilityCheck({ businessName: name, city, category, language: language as 'fr' })
  for (const a of r.answers || []) {
    console.log(`\n━━ ${a.id} · ${a.model} · ${a.latencyMs} ms · $${(a.costUsd || 0).toFixed(4)} ${a.error ? '· ERROR ' + a.error : ''}`)
    console.log(`Q: ${a.query}`)
    console.log(`Named: ${a.appeared ? 'YES rank ' + a.position + ' (' + a.sentiment + ')' : 'no'}${a.evidence ? '  «' + a.evidence + '»' : ''}`)
    console.log(a.rawResponse.slice(0, 1500))
    console.log(`Sources: ${(a.sources || []).map(s => s.title || s.url).join(' | ')}`)
  }
  console.log('\n══════════')
  console.log(`Score ${r.overallScore}/100, grade ${r.grade}, named in ${r.mentions}/${r.totalAnswers}`)
  console.log(`Competitors: ${(r.competitors || []).map(c => `${c.name} (${c.count})`).join(', ')}`)
  console.log(`Summary: ${r.summary}`)
  console.log(`Actions:\n- ${r.topRecommendations.join('\n- ')}`)
  console.log(`Analyst: ${r.analystModel} · skipped: ${r.platformsSkipped?.join(', ') || 'none'}`)
  console.log(`TOTAL COST $${r.costUsd} · ${Date.now() - t0} ms`)
}
main()
