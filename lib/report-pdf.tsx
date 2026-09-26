// The full report as a PDF: same content as the results panel on the site (score, diagnosis,
// every AI answer word for word, who is recommended instead, sources, actions, next step).
// Rendered server side with @react-pdf/renderer, attached to the report email and downloadable
// from the client space.
import path from 'path'
import { Document, Page, View, Text, Link, StyleSheet, Font, renderToBuffer } from '@react-pdf/renderer'
import type { ScoringResult, PlatformResult } from './scoring-engine'
import { aggregateSources, answerDomains, cleanAnswer } from './geo/present'
import { mailLang, type MailLang } from './email-layout'

const FONTS = path.join(process.cwd(), 'assets', 'fonts')
let fontsReady = false
function registerFonts() {
  if (fontsReady) return
  Font.register({ family: 'Syne', fonts: [
    { src: path.join(FONTS, 'syne-latin-400-normal.woff'), fontWeight: 400 },
    { src: path.join(FONTS, 'syne-latin-600-normal.woff'), fontWeight: 600 },
    { src: path.join(FONTS, 'syne-latin-700-normal.woff'), fontWeight: 700 },
  ] })
  Font.register({ family: 'Serif', fonts: [
    { src: path.join(FONTS, 'instrument-serif-latin-400-normal.woff') },
    { src: path.join(FONTS, 'instrument-serif-latin-400-italic.woff'), fontStyle: 'italic' },
  ] })
  Font.registerHyphenationCallback(word => [word])
  fontsReady = true
}

// The embedded fonts cover Latin-1 and common punctuation. Other characters (arrows, emoji,
// rare accents) are mapped to the closest plain form so nothing prints as an empty box.
const ALLOWED = /[\u0000-ÿıŒœˆ˜ -⁯€™−]/
const MAP: Record<string, string> = { '→': '->', '←': '<-', '⇒': '=>', '★': '*', '⭐': '*', '✓': 'v', '✔': 'v', '•': '-', '≈': '~', '×': 'x' }
function pdfSafe(s: string): string {
  let out = ''
  for (const ch of String(s || '')) {
    if (ALLOWED.test(ch)) { out += ch; continue }
    if (MAP[ch]) { out += MAP[ch]; continue }
    const base = ch.normalize('NFKD').split('').filter(c => ALLOWED.test(c)).join('')
    out += base
  }
  return out
}

const T = {
  fr: {
    doc: 'Analyse de visibilité IA', date: (d: string) => `Analyse du ${d}`,
    named: (m: number, t: number) => m === 0 ? `Aucun des ${t} assistants ne vous cite` : `${m} assistant${m > 1 ? 's' : ''} sur ${t} vous cite${m > 1 ? 'nt' : ''}`,
    diag: 'Diagnostic', actions: 'Vos 3 actions prioritaires',
    answers: 'Ce que les IA répondent à vos clients', answersSub: 'Réponses réelles, obtenues avec la recherche web activée. Texte non modifié.',
    q: (x: string) => `Question posée : « ${x} »`, yes: (p: number | null) => p ? `Cité, position ${p}` : 'Cité', no: 'Pas cité', failed: 'Pas de réponse de cet assistant au moment de l\'analyse.', src: 'Sources',
    instead: 'Recommandés à votre place', insteadSub: 'Les entreprises que les IA proposent quand un client cherche votre métier dans votre ville.',
    sources: 'Où les IA vont chercher', sourcesSub: 'Les sites sur lesquels les assistants se sont appuyés. C\'est là que votre présence se joue.',
    method: 'Méthode', methodText: (d: string, list: string) => `Le ${d}, nous avons posé à ${list} la question qu'un client poserait, avec leur recherche web activée. Chaque réponse est reproduite telle quelle. Les réponses des IA évoluent d'un jour à l'autre : un suivi mensuel donne la tendance.`,
    next: 'Étape suivante : votre audit complet, offert', nextText: 'En 30 minutes avec Antoine, nous passons en revue votre site, votre fiche Google, les annuaires et vos avis, et nous vous remettons un plan d\'action écrit. Sans engagement.',
    cta: 'Réserver mon audit offert', contact: 'Antoine Pury, fondateur · antoine@presenceia.com',
  },
  de: {
    doc: 'KI-Sichtbarkeitsanalyse', date: (d: string) => `Analyse vom ${d}`,
    named: (m: number, t: number) => m === 0 ? `Keiner der ${t} Assistenten nennt Sie` : `${m} von ${t} Assistenten nennen Sie`,
    diag: 'Diagnose', actions: 'Ihre 3 wichtigsten Massnahmen',
    answers: 'Was die KI Ihren Kunden antwortet', answersSub: 'Echte Antworten, mit aktivierter Websuche abgerufen. Text unverändert.',
    q: (x: string) => `Gestellte Frage: «${x}»`, yes: (p: number | null) => p ? `Genannt, Position ${p}` : 'Genannt', no: 'Nicht genannt', failed: 'Dieser Assistent hat zum Zeitpunkt der Analyse nicht geantwortet.', src: 'Quellen',
    instead: 'An Ihrer Stelle empfohlen', insteadSub: 'Die Betriebe, die die KI vorschlägt, wenn ein Kunde Ihren Beruf in Ihrem Ort sucht.',
    sources: 'Wo die KI sucht', sourcesSub: 'Die Websites, auf die sich die Assistenten gestützt haben. Dort entscheidet sich Ihre Sichtbarkeit.',
    method: 'Methode', methodText: (d: string, list: string) => `Am ${d} haben wir ${list} die Frage gestellt, die ein Kunde stellen würde, mit aktivierter Websuche. Jede Antwort ist unverändert wiedergegeben. KI-Antworten ändern sich von Tag zu Tag: Eine monatliche Messung zeigt den Trend.`,
    next: 'Nächster Schritt: Ihr vollständiges Audit, kostenlos', nextText: 'In 30 Minuten mit Antoine prüfen wir Ihre Website, Ihr Google-Profil, Verzeichnisse und Bewertungen und geben Ihnen einen schriftlichen Aktionsplan. Unverbindlich.',
    cta: 'Kostenloses Audit buchen', contact: 'Antoine Pury, Gründer · antoine@presenceia.com',
  },
  en: {
    doc: 'AI visibility analysis', date: (d: string) => `Analysis of ${d}`,
    named: (m: number, t: number) => m === 0 ? `None of the ${t} assistants names you` : `${m} of ${t} assistants name you`,
    diag: 'Diagnosis', actions: 'Your 3 priority actions',
    answers: 'What AI tells your customers', answersSub: 'Real answers, obtained with web search switched on. Text unchanged.',
    q: (x: string) => `Question asked: "${x}"`, yes: (p: number | null) => p ? `Named, position ${p}` : 'Named', no: 'Not named', failed: 'No answer from this assistant at the time of the analysis.', src: 'Sources',
    instead: 'Recommended instead of you', insteadSub: 'The businesses AI suggests when a customer looks for your trade in your town.',
    sources: 'Where AI looks', sourcesSub: 'The websites the assistants relied on. This is where your visibility is decided.',
    method: 'Method', methodText: (d: string, list: string) => `On ${d}, we asked ${list} the question a customer would ask, with their web search switched on. Every answer is reproduced as is. AI answers change from day to day: monthly tracking shows the trend.`,
    next: 'Next step: your full audit, free', nextText: 'In 30 minutes with Antoine, we review your website, Google profile, directories and reviews, and give you a written action plan. No commitment.',
    cta: 'Book my free audit', contact: 'Antoine Pury, founder · antoine@presenceia.com',
  },
}

const C = { paper: '#FAF8F3', line: '#E6E1D6', ink: '#0A0A0F', text: '#2A2A38', muted: '#6B6B80', brand: '#E8372A', ok: '#2F855A', okBg: '#EAF6EE', gold: '#C9A84C' }

const s = StyleSheet.create({
  page: { backgroundColor: C.paper, paddingTop: 40, paddingBottom: 56, paddingHorizontal: 44, fontFamily: 'Syne', fontSize: 9.5, color: C.text, lineHeight: 1.5 },
  brand: { fontSize: 13, fontWeight: 700, color: C.ink },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 },
  topRight: { fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.2 },
  meta: { fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.4 },
  bizName: { fontFamily: 'Serif', fontSize: 30, color: C.ink, lineHeight: 1.15, marginTop: 4 },
  scoreBox: { marginTop: 18, backgroundColor: C.ink, borderRadius: 14, padding: 20, flexDirection: 'row', alignItems: 'center' },
  score: { fontFamily: 'Serif', fontSize: 46, color: '#fff', lineHeight: 1 },
  scoreOf: { fontSize: 11, color: '#9a9aab' },
  gradePill: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: C.brand, color: '#fff', borderRadius: 99, paddingVertical: 2, paddingHorizontal: 8, fontSize: 8.5, fontWeight: 600 },
  named: { fontFamily: 'Serif', fontSize: 17, color: '#fff', lineHeight: 1.25 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  pill: { fontSize: 7.5, borderRadius: 99, paddingVertical: 2.5, paddingHorizontal: 7, marginRight: 5, marginBottom: 4 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 14, marginTop: 10 },
  label: { fontSize: 7.5, color: C.brand, textTransform: 'uppercase', letterSpacing: 1.4, fontWeight: 600, marginBottom: 5 },
  h2: { fontFamily: 'Serif', fontSize: 19, color: C.ink, marginTop: 24, lineHeight: 1.3, paddingBottom: 2 },
  sub: { fontSize: 8.5, color: C.muted, marginTop: 2, marginBottom: 4 },
  ansHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ansName: { fontSize: 11, fontWeight: 700, color: C.ink },
  q: { fontSize: 7.5, color: C.muted, marginTop: 4, marginBottom: 6 },
  answer: { fontSize: 9, color: C.text, lineHeight: 1.55 },
  chip: { fontSize: 7, color: C.muted, borderWidth: 1, borderColor: C.line, borderRadius: 99, paddingVertical: 1.5, paddingHorizontal: 6, marginRight: 4, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  barBg: { flex: 1, height: 5, backgroundColor: '#EFEBE2', borderRadius: 3, marginHorizontal: 8 },
  num: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FCE7E5', color: C.brand, fontSize: 8, textAlign: 'center', paddingTop: 3.5, marginRight: 8, fontWeight: 600 },
  cta: { marginTop: 24, backgroundColor: C.brand, borderRadius: 14, padding: 20 },
  ctaBtn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#fff', color: C.brand, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 14, fontSize: 9.5, fontWeight: 700, textDecoration: 'none' },
  footer: { position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#8a8a99' },
})

function Answer({ a, t }: { a: PlatformResult; t: typeof T.fr }) {
  const text = pdfSafe(cleanAnswer(a.rawResponse))
  const ev = a.evidence ? pdfSafe(cleanAnswer(a.evidence)) : ''
  const i = ev ? text.indexOf(ev) : -1
  const domains = answerDomains(a.sources, 6)
  return (
    <View style={[s.card, a.appeared ? { borderColor: '#BFE3CB' } : {}]} wrap>
      <View style={s.ansHead} minPresenceAhead={40}>
        <Text style={s.ansName}>{pdfSafe(a.platformLabel)}{a.model ? <Text style={{ fontSize: 7, color: C.muted, fontWeight: 400 }}>{`  ${pdfSafe(a.model)}`}</Text> : null}</Text>
        <Text style={[s.pill, a.appeared ? { backgroundColor: C.okBg, color: C.ok } : { backgroundColor: '#FCE7E5', color: C.brand }]}>{a.appeared ? t.yes(a.position) : t.no}</Text>
      </View>
      <Text style={s.q}>{t.q(pdfSafe(a.query))}</Text>
      {a.error || !text ? <Text style={[s.answer, { color: C.muted }]}>{t.failed}</Text> : (
        <Text style={s.answer}>
          {i < 0 ? text : <>{text.slice(0, i)}<Text style={{ backgroundColor: '#FDE2DF', color: C.ink }}>{ev}</Text>{text.slice(i + ev.length)}</>}
        </Text>
      )}
      {domains.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          <Text style={{ fontSize: 7, color: C.muted, marginTop: 6, marginRight: 4 }}>{t.src} :</Text>
          {domains.map(d => <Text key={d} style={s.chip}>{d}</Text>)}
        </View>
      )}
    </View>
  )
}

function Report({ r, lang, bookUrl, when }: { r: ScoringResult; lang: MailLang; bookUrl: string; when: string }) {
  const t = T[lang]
  const answers = (r.answers?.length ? r.answers : r.platformResults)
  const ok = answers.filter(a => !a.error)
  const total = r.totalAnswers ?? ok.length
  const mentions = r.mentions ?? ok.filter(a => a.appeared).length
  const comps = (r.competitors || []).slice(0, 8)
  const sources = aggregateSources(ok, 10)
  const locale = lang === 'de' ? 'de-CH' : lang === 'en' ? 'en-GB' : 'fr-CH'
  const date = new Date(when).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  const labels = [...new Set(answers.map(a => a.platformLabel))]
  const list = labels.length > 1 ? `${labels.slice(0, -1).join(', ')} ${lang === 'de' ? 'und' : lang === 'en' ? 'and' : 'et'} ${labels.at(-1)}` : labels.join('')

  return (
    <Document title={`${t.doc} : ${pdfSafe(r.businessName)}`} author="Présence IA" creator="presenceia.com" language={lang}>
      <Page size="A4" style={s.page}>
        <View style={s.top} fixed>
          <Text style={s.brand}>présence<Text style={{ color: C.brand }}>ia</Text></Text>
          <Text style={s.topRight}>{t.doc}</Text>
        </View>

        <Text style={s.meta}>{`${pdfSafe(r.city)} · ${pdfSafe(r.category)} · ${t.date(date)}`}</Text>
        <Text style={s.bizName}>{pdfSafe(r.businessName)}</Text>

        <View style={s.scoreBox}>
          <View style={{ width: 120 }}>
            <Text style={s.score}>{r.overallScore}<Text style={s.scoreOf}>/100</Text></Text>
            <Text style={s.gradePill}>{`${lang === 'fr' ? 'Note' : lang === 'de' ? 'Note' : 'Grade'} ${r.grade}`}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.named, mentions === 0 ? { color: '#FC8181' } : {}]}>{t.named(mentions, total)}</Text>
            <View style={s.pills}>
              {ok.map((a, k) => (
                <Text key={k} style={[s.pill, a.appeared ? { backgroundColor: '#1F3B2A', color: '#9AE6B4' } : { backgroundColor: '#2A2A38', color: '#c9c9d6' }]}>
                  {`${pdfSafe(a.platformLabel)} : ${a.appeared ? t.yes(a.position) : t.no}`}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.label}>{t.diag}</Text>
          <Text style={{ fontSize: 10, lineHeight: 1.55 }}>{pdfSafe(r.summary)}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>{t.actions}</Text>
          {r.topRecommendations.map((rec, k) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: k ? 7 : 2 }}>
              <Text style={s.num}>{String(k + 1)}</Text>
              <Text style={{ flex: 1, fontSize: 9.5, lineHeight: 1.5 }}>{pdfSafe(rec)}</Text>
            </View>
          ))}
        </View>

        <Text style={s.h2} minPresenceAhead={80}>{t.answers}</Text>
        <Text style={s.sub}>{t.answersSub}</Text>
        {answers.map((a, k) => <Answer key={k} a={a} t={t} />)}

        {comps.length > 0 && (
          <View wrap={false}>
            <Text style={s.h2}>{t.instead}</Text>
            <Text style={s.sub}>{t.insteadSub}</Text>
            <View style={s.card}>
              {comps.map((c, k) => (
                <View key={k} style={[s.row, k === 0 ? { marginTop: 0 } : {}]}>
                  <Text style={{ width: '45%', fontSize: 9 }}>{pdfSafe(c.name)}</Text>
                  <View style={s.barBg}><View style={{ width: `${Math.min(100, (c.count / Math.max(1, total)) * 100)}%`, height: 5, backgroundColor: C.gold, borderRadius: 3 }} /></View>
                  <Text style={{ fontSize: 8, color: C.muted, width: 22, textAlign: 'right' }}>{`${c.count}/${total}`}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {sources.length > 0 && (
          <View wrap={false}>
            <Text style={s.h2}>{t.sources}</Text>
            <Text style={s.sub}>{t.sourcesSub}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {sources.map(x => <Text key={x.domain} style={[s.chip, { fontSize: 8, color: C.text, backgroundColor: '#fff' }]}>{`${x.domain} · ${x.count}`}</Text>)}
            </View>
          </View>
        )}

        <View wrap={false}>
          <View style={s.card}>
            <Text style={s.label}>{t.method}</Text>
            <Text style={{ fontSize: 8.5, color: C.muted, lineHeight: 1.5 }}>{pdfSafe(t.methodText(date, list))}</Text>
          </View>
          <View style={s.cta}>
            <Text style={{ fontFamily: 'Serif', fontSize: 19, color: '#fff', lineHeight: 1.2 }}>{t.next}</Text>
            <Text style={{ fontSize: 9.5, color: '#fff', marginTop: 6, lineHeight: 1.5 }}>{t.nextText}</Text>
            <Link src={bookUrl} style={s.ctaBtn}>{t.cta}</Link>
            <Text style={{ fontSize: 8.5, color: '#FFE3E0', marginTop: 12 }}>{t.contact}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>Présence IA · 41 Labs GmbH, Zug · presenceia.com</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export async function renderReportPdf(r: ScoringResult, language: string, bookUrl: string): Promise<Buffer> {
  registerFonts()
  return renderToBuffer(<Report r={r} lang={mailLang(language)} bookUrl={bookUrl} when={r.createdAt || new Date().toISOString()} />)
}

export function reportFilename(r: ScoringResult): string {
  const slug = r.businessName.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 50)
  return `presenceia-analyse-${slug || 'rapport'}.pdf`
}
