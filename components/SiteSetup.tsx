'use client'
// Client space: the website we prepared, once paid for. Two steps: where it goes live
// (the client's own domain, a new one, or later) and the legal details (legal notice and
// privacy page). The work happens on the droplet through /api/client/site.
import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, ExternalLink, Globe, Loader2, Mail, RefreshCw, Scale, Search, X } from 'lucide-react'
import { BOOKING_URL } from '@/lib/links'
import type { Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type Rec = { type: string; host: string; value: string; fqdn: string; alt?: string }
type HostState = { a: string[]; aaaa: string[]; cname: string[]; ready: boolean; problems: string[] }
type Provider = { key: string; label: string; url: string } | null
type Dns = { domain: string; exists: boolean; ns: string[]; provider: Provider; mail: string[]; hosts: Record<string, HostState>; ready_hosts: string[]; records?: Rec[] }
export type Site = {
  slug: string; status: 'claimed' | 'domain_pending' | 'live' | 'cancelled'; business_name: string | null; email: string
  plan: string | null; term: string | null; preview_url: string; market: string; city: string | null
  domain_mode: 'existing' | 'new' | 'later' | null; domain: string | null; canonical_host: string | null; live_url: string | null
  dns: Dns | null; legal: Record<string, string> | null; legal_done: boolean; ip: string; edge: string; records?: Rec[]
}
type Suggestion = { domain: string; status: 'available' | 'taken' | 'unknown' }

const L = {
  fr: {
    title: 'Votre site', preview: 'Aperçu', live: 'En ligne', pending: 'En attente du domaine', ready: 'Activé', cancelled: 'Abonnement terminé',
    welcome: 'Merci, votre site est à vous. Le bandeau d\'aperçu est retiré. Il reste deux étapes, deux minutes chacune.',
    s1: '1. Où mettre votre site en ligne ?', s2: '2. Vos informations légales',
    s2sub: 'Pour les pages « Mentions légales » et « Protection des données » de votre site, obligatoires pour un site d\'entreprise.',
    existing: ['J\'ai déjà un nom de domaine', 'Votre site actuel est remplacé, vos emails ne changent pas.'],
    fresh: ['Je n\'ai pas de nom de domaine', 'Nous en réservons un à votre nom, compris dans votre abonnement.'],
    later: ['Plus tard', 'Votre site reste en ligne à son adresse actuelle.'],
    yourDomain: 'Votre nom de domaine', check: 'Vérifier', confirmExisting: (d: string) => `Utiliser ${d}`,
    notFound: 'Ce domaine n\'existe pas encore. Vérifiez l\'orthographe, ou choisissez « Je n\'ai pas de nom de domaine ».',
    managedBy: (p: string) => `Géré chez ${p}.`, unknownProvider: (ns: string) => `Serveurs DNS : ${ns}.`,
    mailAt: (m: string) => `Vos emails passent par ${m} : nous n'y touchons pas.`,
    replaceNote: 'Le site actuellement à cette adresse sera remplacé par votre nouveau site. Les anciennes adresses de pages mènent à la page d\'accueil.',
    searchNew: 'Essayer un autre nom', available: 'Disponible', taken: 'Déjà pris', unknown: 'À vérifier',
    reserve: (d: string) => `Réserver ${d}`, noSuggest: 'Tapez le nom souhaité ci-dessus.',
    laterBtn: 'Garder l\'adresse actuelle pour l\'instant', laterNote: (u: string) => `Votre site reste en ligne sur ${u}. Vous pouvez choisir un domaine à tout moment ici.`,
    choose: 'Choisir un nom de domaine',
    isLive: (u: string) => `Votre site est en ligne sur ${u}.`, liveNote: 'Son ancienne adresse de prévisualisation redirige vers lui.',
    newPending: (d: string) => `Nous enregistrons ${d} au nom de votre entreprise, puis le site y est mis en ligne automatiquement. Vous recevez un email dès qu'il est en ligne.`,
    change: 'Choisir un autre domaine',
    dnsTitle: (d: string) => `Deux réglages chez votre fournisseur pour ${d}`,
    dnsIntro: (p: string) => `Connectez-vous chez ${p}, ouvrez la zone DNS de votre domaine et mettez ces deux enregistrements :`,
    yourProvider: 'votre fournisseur', openPanel: (p: string) => `Ouvrir ${p}`,
    type: 'Type', name: 'Nom', value: 'Valeur', or: 'ou', copy: 'Copier', copied: 'Copié',
    removeOld: 'Supprimez les autres enregistrements A et AAAA de ces deux noms (ceux de l\'ancien site). Ne touchez pas aux enregistrements MX : vos emails continuent de fonctionner.',
    cloudflare: 'Chez Cloudflare, mettez ces enregistrements en « DNS only » (nuage gris), sinon le certificat ne peut pas être émis.',
    builder: 'Si votre domaine est relié à un site Wix, Squarespace ou Jimdo, déconnectez-le d\'abord de ce site, puis modifiez les enregistrements.',
    status: 'État actuel', ok: 'pointe vers votre nouveau site', otherA: 'pointe encore vers l\'ancien site', aaaa: 'enregistrement AAAA à supprimer', missing: 'pas encore d\'enregistrement',
    recheck: 'Vérifier maintenant', auto: 'Nous vérifions toutes les 10 minutes et mettons le site en ligne dès que c\'est bon, avec son certificat https. Un changement DNS prend de quelques minutes à quelques heures.',
    help: 'Besoin d\'aide ?', helpCall: 'Le faire ensemble (10 min)', helpSend: 'Envoyer ces instructions à la personne qui gère mon site',
    sendSubject: (d: string) => `Réglages DNS pour ${d}`,
    sendBody: (d: string, lines: string) => `Bonjour,\n\nPouvez-vous faire ces réglages dans la zone DNS de ${d} ?\n\n${lines}\n\nSupprimer les autres enregistrements A et AAAA de ${d} et www.${d}. Ne pas modifier les enregistrements MX.\n\nMerci !`,
    company: 'Raison sociale', form: 'Forme juridique', street: 'Rue et numéro', zip: 'NPA', city: 'Localité', ide: 'Numéro IDE (si inscrit au RC)',
    rcs: 'SIREN / RCS', capital: 'Capital social', vat: 'N° TVA (facultatif)', responsible: 'Personne responsable du site', email: 'Email de contact (public)', phone: 'Téléphone (public)',
    forms: ['Raison individuelle', 'Sàrl', 'SA', 'Association', 'Autre'], formsFr: ['Entreprise individuelle', 'SARL', 'SAS', 'SA', 'Autre'],
    save: 'Publier les pages légales', saved: 'Pages légales publiées.', see: 'Voir', legalPage: 'Mentions légales', privacyPage: 'Protection des données',
    required: 'Merci de remplir les champs obligatoires.', err: 'Une erreur est survenue. Réessayez, ou écrivez-nous.',
    errs: { invalid_domain: 'Ce nom de domaine n\'est pas valide.', domain_not_found: 'Ce domaine n\'existe pas encore.', domain_taken: 'Ce domaine est déjà pris.' } as Record<string, string>,
  },
  de: {
    title: 'Ihre Website', preview: 'Vorschau', live: 'Online', pending: 'Domain ausstehend', ready: 'Aktiviert', cancelled: 'Abonnement beendet',
    welcome: 'Danke, die Website gehört Ihnen. Das Vorschau-Banner ist entfernt. Noch zwei Schritte, je zwei Minuten.',
    s1: '1. Wo soll Ihre Website online gehen?', s2: '2. Ihre rechtlichen Angaben',
    s2sub: 'Für das Impressum und die Datenschutzerklärung Ihrer Website, Pflicht für eine Firmenwebsite.',
    existing: ['Ich habe schon eine Domain', 'Ihre bisherige Website wird ersetzt, Ihre E-Mails bleiben gleich.'],
    fresh: ['Ich habe keine Domain', 'Wir registrieren eine auf Ihren Namen, im Abonnement inbegriffen.'],
    later: ['Später', 'Ihre Website bleibt unter ihrer jetzigen Adresse online.'],
    yourDomain: 'Ihre Domain', check: 'Prüfen', confirmExisting: (d: string) => `${d} verwenden`,
    notFound: 'Diese Domain existiert noch nicht. Prüfen Sie die Schreibweise oder wählen Sie «Ich habe keine Domain».',
    managedBy: (p: string) => `Verwaltet bei ${p}.`, unknownProvider: (ns: string) => `DNS-Server: ${ns}.`,
    mailAt: (m: string) => `Ihre E-Mails laufen über ${m}: daran ändern wir nichts.`,
    replaceNote: 'Die Website unter dieser Adresse wird durch Ihre neue ersetzt. Alte Seitenadressen führen auf die Startseite.',
    searchNew: 'Anderen Namen versuchen', available: 'Verfügbar', taken: 'Vergeben', unknown: 'Zu prüfen',
    reserve: (d: string) => `${d} reservieren`, noSuggest: 'Geben Sie oben den gewünschten Namen ein.',
    laterBtn: 'Vorerst die jetzige Adresse behalten', laterNote: (u: string) => `Ihre Website bleibt unter ${u} online. Sie können hier jederzeit eine Domain wählen.`,
    choose: 'Domain wählen',
    isLive: (u: string) => `Ihre Website ist online unter ${u}.`, liveNote: 'Die alte Vorschau-Adresse leitet dorthin weiter.',
    newPending: (d: string) => `Wir registrieren ${d} auf den Namen Ihres Unternehmens, danach geht die Website automatisch online. Sie erhalten eine E-Mail, sobald sie online ist.`,
    change: 'Andere Domain wählen',
    dnsTitle: (d: string) => `Zwei Einstellungen bei Ihrem Anbieter für ${d}`,
    dnsIntro: (p: string) => `Melden Sie sich bei ${p} an, öffnen Sie die DNS-Zone Ihrer Domain und setzen Sie diese zwei Einträge:`,
    yourProvider: 'Ihrem Anbieter', openPanel: (p: string) => `${p} öffnen`,
    type: 'Typ', name: 'Name', value: 'Wert', or: 'oder', copy: 'Kopieren', copied: 'Kopiert',
    removeOld: 'Löschen Sie die anderen A- und AAAA-Einträge dieser zwei Namen (die der alten Website). Ändern Sie die MX-Einträge nicht: Ihre E-Mails funktionieren weiter.',
    cloudflare: 'Bei Cloudflare diese Einträge auf «DNS only» (graue Wolke) stellen, sonst kann das Zertifikat nicht ausgestellt werden.',
    builder: 'Ist Ihre Domain mit einer Wix-, Squarespace- oder Jimdo-Website verbunden, trennen Sie sie zuerst davon und ändern dann die Einträge.',
    status: 'Aktueller Stand', ok: 'zeigt auf Ihre neue Website', otherA: 'zeigt noch auf die alte Website', aaaa: 'AAAA-Eintrag löschen', missing: 'noch kein Eintrag',
    recheck: 'Jetzt prüfen', auto: 'Wir prüfen alle 10 Minuten und schalten die Website mit https-Zertifikat online, sobald alles stimmt. Eine DNS-Änderung dauert einige Minuten bis einige Stunden.',
    help: 'Hilfe nötig?', helpCall: 'Gemeinsam erledigen (10 Min.)', helpSend: 'Diese Anleitung an die Person senden, die meine Website betreut',
    sendSubject: (d: string) => `DNS-Einstellungen für ${d}`,
    sendBody: (d: string, lines: string) => `Guten Tag\n\nKönnen Sie diese Einstellungen in der DNS-Zone von ${d} vornehmen?\n\n${lines}\n\nDie anderen A- und AAAA-Einträge von ${d} und www.${d} löschen. MX-Einträge nicht ändern.\n\nDanke!`,
    company: 'Firma', form: 'Rechtsform', street: 'Strasse und Nummer', zip: 'PLZ', city: 'Ort', ide: 'UID-Nummer (falls im Handelsregister)',
    rcs: 'SIREN / RCS', capital: 'Kapital', vat: 'MWST-Nr. (freiwillig)', responsible: 'Verantwortliche Person', email: 'Kontakt-E-Mail (öffentlich)', phone: 'Telefon (öffentlich)',
    forms: ['Einzelunternehmen', 'GmbH', 'AG', 'Verein', 'Andere'], formsFr: ['Entreprise individuelle', 'SARL', 'SAS', 'SA', 'Andere'],
    save: 'Rechtliche Seiten veröffentlichen', saved: 'Rechtliche Seiten veröffentlicht.', see: 'Ansehen', legalPage: 'Impressum', privacyPage: 'Datenschutz',
    required: 'Bitte füllen Sie die Pflichtfelder aus.', err: 'Ein Fehler ist aufgetreten. Bitte nochmals versuchen oder uns schreiben.',
    errs: { invalid_domain: 'Diese Domain ist ungültig.', domain_not_found: 'Diese Domain existiert noch nicht.', domain_taken: 'Diese Domain ist vergeben.' } as Record<string, string>,
  },
  en: {
    title: 'Your website', preview: 'Preview', live: 'Live', pending: 'Waiting for the domain', ready: 'Activated', cancelled: 'Subscription ended',
    welcome: 'Thank you, the website is yours. The preview banner is gone. Two steps left, two minutes each.',
    s1: '1. Where should your website go live?', s2: '2. Your legal details',
    s2sub: 'For the legal notice and privacy pages of your website, required for a business website.',
    existing: ['I already have a domain', 'Your current website is replaced, your email does not change.'],
    fresh: ['I do not have a domain', 'We register one in your name, included in your subscription.'],
    later: ['Later', 'Your website stays live at its current address.'],
    yourDomain: 'Your domain name', check: 'Check', confirmExisting: (d: string) => `Use ${d}`,
    notFound: 'This domain does not exist yet. Check the spelling, or choose "I do not have a domain".',
    managedBy: (p: string) => `Managed at ${p}.`, unknownProvider: (ns: string) => `DNS servers: ${ns}.`,
    mailAt: (m: string) => `Your email goes through ${m}: we do not touch it.`,
    replaceNote: 'The website currently at this address will be replaced by your new one. Old page addresses lead to the home page.',
    searchNew: 'Try another name', available: 'Available', taken: 'Taken', unknown: 'To check',
    reserve: (d: string) => `Reserve ${d}`, noSuggest: 'Type the name you want above.',
    laterBtn: 'Keep the current address for now', laterNote: (u: string) => `Your website stays live at ${u}. You can choose a domain here at any time.`,
    choose: 'Choose a domain',
    isLive: (u: string) => `Your website is live at ${u}.`, liveNote: 'Its old preview address redirects to it.',
    newPending: (d: string) => `We are registering ${d} in your company's name, then the website goes live on it automatically. You will get an email as soon as it is live.`,
    change: 'Choose another domain',
    dnsTitle: (d: string) => `Two settings at your provider for ${d}`,
    dnsIntro: (p: string) => `Log in at ${p}, open the DNS zone of your domain and set these two records:`,
    yourProvider: 'your provider', openPanel: (p: string) => `Open ${p}`,
    type: 'Type', name: 'Name', value: 'Value', or: 'or', copy: 'Copy', copied: 'Copied',
    removeOld: 'Delete the other A and AAAA records of these two names (those of the old website). Do not touch the MX records: your email keeps working.',
    cloudflare: 'At Cloudflare, set these records to "DNS only" (grey cloud), otherwise the certificate cannot be issued.',
    builder: 'If your domain is connected to a Wix, Squarespace or Jimdo website, disconnect it from that website first, then change the records.',
    status: 'Current state', ok: 'points to your new website', otherA: 'still points to the old website', aaaa: 'AAAA record to delete', missing: 'no record yet',
    recheck: 'Check now', auto: 'We check every 10 minutes and put the website live with its https certificate as soon as it is right. A DNS change takes a few minutes to a few hours.',
    help: 'Need help?', helpCall: 'Do it together (10 min)', helpSend: 'Send these instructions to whoever manages my website',
    sendSubject: (d: string) => `DNS settings for ${d}`,
    sendBody: (d: string, lines: string) => `Hello,\n\nCould you make these changes in the DNS zone of ${d}?\n\n${lines}\n\nDelete the other A and AAAA records of ${d} and www.${d}. Do not change the MX records.\n\nThank you!`,
    company: 'Company name', form: 'Legal form', street: 'Street and number', zip: 'Postcode', city: 'City', ide: 'Company ID (UID, if registered)',
    rcs: 'SIREN / RCS', capital: 'Share capital', vat: 'VAT number (optional)', responsible: 'Person responsible for the website', email: 'Contact email (public)', phone: 'Phone (public)',
    forms: ['Sole proprietorship', 'LLC (Sàrl / GmbH)', 'Corporation (SA / AG)', 'Association', 'Other'], formsFr: ['Entreprise individuelle', 'SARL', 'SAS', 'SA', 'Other'],
    save: 'Publish the legal pages', saved: 'Legal pages published.', see: 'See', legalPage: 'Legal notice', privacyPage: 'Privacy',
    required: 'Please fill in the required fields.', err: 'Something went wrong. Please try again, or write to us.',
    errs: { invalid_domain: 'This domain name is not valid.', domain_not_found: 'This domain does not exist yet.', domain_taken: 'This domain is already taken.' } as Record<string, string>,
  },
}
type TT = typeof L['fr']

const inputCls = 'w-full px-4 py-3 rounded-xl text-sm bg-white border border-line focus:outline-none focus:border-brand/60'
const labelCls = 'block text-xs font-mono mb-1.5 tracking-wider uppercase text-ink/50'

async function call<R = unknown>(body: Record<string, unknown>): Promise<R> {
  const r = await fetch('/api/client/site', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error((j as { error?: string })?.error || 'failed')
  return j as R
}

function CopyBtn({ text, t }: { text: string; t: TT }) {
  const [done, setDone] = useState(false)
  return (
    <button type="button" onClick={() => { navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500) }) }}
      className="inline-flex items-center gap-1 text-xs font-semibold text-brand" aria-label={t.copy}>
      {done ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{done ? t.copied : t.copy}
    </button>
  )
}

function Badge({ site, t }: { site: Site; t: TT }) {
  const [label, cls] = site.status === 'live' ? [t.live, 'bg-green-50 text-green-700'] : site.status === 'domain_pending' ? [t.pending, 'bg-amber-50 text-amber-700']
    : site.status === 'cancelled' ? [t.cancelled, 'bg-ink/5 text-ink/60'] : [t.ready, 'bg-brand/10 text-brand']
  return <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', cls)}>{label}</span>
}

// ─── Step 1: domain ────────────────────────────────────────────────────────────

function DnsInstructions({ site, t, onUpdate }: { site: Site; t: TT; onUpdate: (s: Site) => void }) {
  const domain = site.domain!
  const records = site.records || []
  const dns = site.dns
  const prov = dns?.provider
  const [busy, setBusy] = useState(false)
  const recheck = async () => {
    setBusy(true)
    try {
      const d = await call<Dns>({ action: 'check', slug: site.slug, domain })
      onUpdate({ ...site, dns: d })
    } catch { /* keep the last state */ } finally { setBusy(false) }
  }
  const lines = records.map(r => `${r.type}  ${r.fqdn}  ->  ${r.value}`).join('\n')
  const mailto = `mailto:?subject=${encodeURIComponent(t.sendSubject(domain))}&body=${encodeURIComponent(t.sendBody(domain, lines))}`
  const state = (h: string) => {
    const s = dns?.hosts?.[h]
    if (!s) return null
    if (s.ready) return <span className="text-green-700">✓ {t.ok}</span>
    const p = s.problems.includes('other_a') ? t.otherA : s.problems.includes('aaaa') ? t.aaaa : t.missing
    return <span className="text-amber-700">• {p}</span>
  }
  return (
    <div className="mt-5 space-y-4">
      <h3 className="font-semibold text-ink">{t.dnsTitle(domain)}</h3>
      <p className="text-sm text-ink/65 leading-relaxed">
        {t.dnsIntro(prov?.label || t.yourProvider)}{' '}
        {prov?.url && <a href={prov.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand">{t.openPanel(prov.label)}<ExternalLink className="w-3.5 h-3.5" /></a>}
      </p>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs font-mono uppercase tracking-wider text-ink/45">
            <th className="px-4 py-3 font-normal">{t.type}</th><th className="px-4 py-3 font-normal">{t.name}</th><th className="px-4 py-3 font-normal">{t.value}</th><th className="px-4 py-3 font-normal">{t.status}</th>
          </tr></thead>
          <tbody className="divide-y divide-line">
            {records.map(r => (
              <tr key={r.fqdn}>
                <td className="px-4 py-3 font-mono font-semibold">{r.type}</td>
                <td className="px-4 py-3 font-mono">{r.host}<div className="text-[11px] text-ink/40">{r.fqdn}</div></td>
                <td className="px-4 py-3 font-mono">
                  <div className="flex items-center gap-3">{r.value}<CopyBtn text={r.value} t={t} /></div>
                  {r.alt && <div className="text-[11px] text-ink/45 mt-0.5">{t.or} {r.alt}</div>}
                </td>
                <td className="px-4 py-3 text-xs">{state(r.fqdn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-ink/65 leading-relaxed">{t.removeOld}</p>
      {prov?.key === 'cloudflare' && <p className="text-sm text-amber-700">{t.cloudflare}</p>}
      {(prov?.key === 'wix' || prov?.key === 'squarespace' || prov?.key === 'jimdo') && <p className="text-sm text-amber-700">{t.builder}</p>}
      {dns?.mail?.length ? <p className="text-sm text-ink/55">{t.mailAt(dns.mail.join(', '))}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={recheck} disabled={busy} className="btn-outline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}{t.recheck}
        </button>
        <p className="text-xs text-ink/50 max-w-xl">{t.auto}</p>
      </div>
      <div className="rounded-2xl bg-paper-2 p-4 text-sm">
        <p className="font-semibold text-ink">{t.help}</p>
        <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-5">
          {BOOKING_URL && <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="font-semibold text-brand">{t.helpCall}</a>}
          <a href={mailto} className="inline-flex items-center gap-1.5 font-semibold text-brand"><Mail className="w-4 h-4" />{t.helpSend}</a>
        </div>
      </div>
    </div>
  )
}

function DomainChoice({ site, t, onUpdate }: { site: Site; t: TT; onUpdate: (s: Site) => void }) {
  const [mode, setMode] = useState<'existing' | 'new' | null>(null)
  const [domain, setDomain] = useState('')
  const [checked, setChecked] = useState<(Dns & { domain: string }) | null>(null)
  const [sugg, setSugg] = useState<Suggestion[] | null>(null)
  const [q, setQ] = useState('')
  const [pick, setPick] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fail = (e: unknown) => setErr(t.errs[(e as Error)?.message] || t.err)

  const suggest = useCallback(async (query?: string) => {
    setBusy(true); setErr(null)
    try {
      const r = await call<{ items: Suggestion[] }>({ action: 'suggest', slug: site.slug, q: query || undefined })
      setSugg(r.items || [])
      const first = (r.items || []).find(x => x.status === 'available')
      setPick(first?.domain || null)
    } catch (e) { fail(e) } finally { setBusy(false) }
  }, [site.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const check = async () => {
    setBusy(true); setErr(null); setChecked(null)
    try { setChecked(await call<Dns & { domain: string }>({ action: 'check', slug: site.slug, domain })) } catch (e) { fail(e) } finally { setBusy(false) }
  }
  const choose = async (m: 'existing' | 'new' | 'later', d?: string) => {
    setBusy(true); setErr(null)
    try { onUpdate(await call<Site>({ action: 'domain', slug: site.slug, mode: m, domain: d })) } catch (e) { fail(e) } finally { setBusy(false) }
  }

  const opt = (key: 'existing' | 'new', [title, sub]: string[], Icon: typeof Globe) => (
    <button type="button" onClick={() => { setMode(key); setErr(null); if (key === 'new' && sugg === null && !busy) suggest() }}
      className={cn('text-left rounded-2xl border p-4 transition-colors', mode === key ? 'border-ink bg-white' : 'border-line bg-white/60 hover:border-ink/40')}>
      <Icon className="w-5 h-5 text-brand" />
      <p className="mt-2 font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink/55 mt-0.5 leading-snug">{sub}</p>
    </button>
  )

  return (
    <div className="mt-5">
      <div className="grid sm:grid-cols-3 gap-3">
        {opt('existing', t.existing, Globe)}
        {opt('new', t.fresh, Search)}
        <button type="button" disabled={busy} onClick={() => choose('later')}
          className={cn('text-left rounded-2xl border p-4 transition-colors', site.domain_mode === 'later' ? 'border-ink bg-white' : 'border-line bg-white/60 hover:border-ink/40')}>
          <X className="w-5 h-5 text-ink/40" />
          <p className="mt-2 font-semibold text-ink">{t.later[0]}</p>
          <p className="text-sm text-ink/55 mt-0.5 leading-snug">{t.later[1]}</p>
        </button>
      </div>
      {site.domain_mode === 'later' && !mode && <p className="mt-4 text-sm text-ink/60">{t.laterNote(site.preview_url.replace('https://', ''))}</p>}

      {mode === 'existing' && (
        <div className="mt-5 space-y-3">
          <label className={labelCls}>{t.yourDomain}</label>
          <div className="flex gap-2">
            <input value={domain} onChange={e => { setDomain(e.target.value); setChecked(null) }} placeholder="www.mon-entreprise.ch" className={inputCls}
              onKeyDown={e => { if (e.key === 'Enter' && domain) check() }} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
            <button onClick={check} disabled={busy || !domain} className="btn-outline px-5 rounded-xl text-sm font-semibold whitespace-nowrap">
              {busy && !checked ? <Loader2 className="w-4 h-4 animate-spin" /> : t.check}
            </button>
          </div>
          {checked && !checked.exists && <p className="text-sm text-brand">{t.notFound}</p>}
          {checked && checked.exists && (
            <div className="rounded-2xl bg-white border border-line p-4 space-y-2 text-sm">
              <p className="font-semibold text-ink">{checked.domain}</p>
              <p className="text-ink/65">{checked.provider ? t.managedBy(checked.provider.label) : t.unknownProvider(checked.ns.join(', ') || '?')}</p>
              {checked.mail?.length ? <p className="text-ink/65">{t.mailAt(checked.mail.join(', '))}</p> : null}
              <p className="text-ink/65">{t.replaceNote}</p>
              <button onClick={() => choose('existing', checked.domain)} disabled={busy} className="btn-primary mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}{t.confirmExisting(checked.domain)}
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'new' && (
        <div className="mt-5 space-y-3">
          <label className={labelCls}>{t.searchNew}</label>
          <div className="flex gap-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={site.market === 'FR' ? 'mon-entreprise.fr' : 'mon-entreprise.ch'} className={inputCls}
              onKeyDown={e => { if (e.key === 'Enter' && q) suggest(q) }} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
            <button onClick={() => suggest(q)} disabled={busy || !q} className="btn-outline px-5 rounded-xl text-sm font-semibold whitespace-nowrap">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t.check}
            </button>
          </div>
          {sugg === null ? <Loader2 className="w-5 h-5 animate-spin text-brand" /> : sugg.length === 0 ? <p className="text-sm text-ink/55">{t.noSuggest}</p> : (
            <ul className="rounded-2xl border border-line bg-white divide-y divide-line">
              {sugg.map(s => (
                <li key={s.domain}>
                  <label className={cn('flex items-center gap-3 px-4 py-3 text-sm', s.status === 'taken' ? 'opacity-50' : 'cursor-pointer')}>
                    <input type="radio" name="newdomain" disabled={s.status === 'taken'} checked={pick === s.domain} onChange={() => setPick(s.domain)} />
                    <span className="font-mono flex-1">{s.domain}</span>
                    <span className={cn('text-xs font-semibold', s.status === 'available' ? 'text-green-700' : s.status === 'taken' ? 'text-ink/50' : 'text-amber-700')}>
                      {s.status === 'available' ? t.available : s.status === 'taken' ? t.taken : t.unknown}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          {pick && (
            <button onClick={() => choose('new', pick)} disabled={busy} className="btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}{t.reserve(pick)}
            </button>
          )}
        </div>
      )}
      {err && <p className="mt-3 text-sm text-brand">{err}</p>}
    </div>
  )
}

function DomainStep({ site, t, onUpdate }: { site: Site; t: TT; onUpdate: (s: Site) => void }) {
  const [changing, setChanging] = useState(false)
  if (site.status === 'live' && site.live_url) {
    return (
      <div className="mt-4 rounded-2xl bg-green-50 text-green-800 p-4 text-sm">
        <p className="font-semibold">{t.isLive(site.live_url.replace('https://', ''))}</p>
        <p className="mt-1">{t.liveNote} <a href={site.live_url} target="_blank" rel="noreferrer" className="font-semibold underline">{site.live_url.replace('https://', '')}</a></p>
      </div>
    )
  }
  if (!changing && site.domain_mode === 'existing' && site.domain) {
    return <>
      <DnsInstructions site={site} t={t} onUpdate={onUpdate} />
      <button onClick={() => setChanging(true)} className="mt-4 text-sm text-ink/55 underline">{t.change}</button>
    </>
  }
  if (!changing && site.domain_mode === 'new' && site.domain) {
    return <>
      <p className="mt-4 rounded-2xl bg-paper-2 p-4 text-sm text-ink/75 leading-relaxed">{t.newPending(site.domain)}</p>
      <button onClick={() => setChanging(true)} className="mt-3 text-sm text-ink/55 underline">{t.change}</button>
    </>
  }
  return <DomainChoice site={site} t={t} onUpdate={s => { setChanging(false); onUpdate(s) }} />
}

// ─── Step 2: legal details ─────────────────────────────────────────────────────

function LegalStep({ site, t, onUpdate }: { site: Site; t: TT; onUpdate: (s: Site) => void }) {
  const fr = site.market === 'FR'
  const [f, setF] = useState<Record<string, string>>(() => ({
    company: site.business_name || '', legal_form: '', street: '', zip: '', city: site.city || '', country: fr ? 'France' : 'Suisse',
    ide: '', rcs: '', capital: '', vat: '', responsible: '', email: site.email || '', phone: '',
    ...(site.legal || {}),
  }))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })
  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.company || !f.street || !f.zip || !f.city || !f.responsible || !f.email) { setMsg(t.required); return }
    setBusy(true); setMsg(null)
    try { onUpdate(await call<Site>({ action: 'legal', slug: site.slug, legal: f })); setMsg(t.saved) } catch { setMsg(t.err) } finally { setBusy(false) }
  }
  const base = site.live_url || site.preview_url
  const field = (k: string, label: string, req = false, type = 'text') => (
    <div>
      <label className={labelCls}>{label}{req && ' *'}</label>
      <input type={type} value={f[k] || ''} onChange={set(k)} required={req} className={inputCls} />
    </div>
  )
  return (
    <form onSubmit={save} className="mt-5 grid sm:grid-cols-2 gap-4">
      {field('company', t.company, true)}
      <div>
        <label className={labelCls}>{t.form}</label>
        <select value={f.legal_form || ''} onChange={set('legal_form')} className={inputCls}>
          <option value="">–</option>
          {(fr ? t.formsFr : t.forms).map(x => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">{field('street', t.street, true)}</div>
      <div className="grid grid-cols-[110px_1fr] gap-3 sm:col-span-2">
        {field('zip', t.zip, true)}
        {field('city', t.city, true)}
      </div>
      {fr ? <>{field('rcs', t.rcs)}{field('capital', t.capital)}</> : field('ide', t.ide)}
      {field('vat', t.vat)}
      {field('responsible', t.responsible, true)}
      {field('email', t.email, true, 'email')}
      {field('phone', t.phone, false, 'tel')}
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button disabled={busy} className="btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}{t.save}
        </button>
        {site.legal_done && (
          <span className="text-sm text-ink/60">
            {t.see} : <a href={`${base}/mentions-legales/`} target="_blank" rel="noreferrer" className="text-brand font-semibold">{t.legalPage}</a> ·{' '}
            <a href={`${base}/confidentialite/`} target="_blank" rel="noreferrer" className="text-brand font-semibold">{t.privacyPage}</a>
          </span>
        )}
        {msg && <span className={cn('text-sm', msg === t.saved ? 'text-green-700' : 'text-brand')}>{msg}</span>}
      </div>
    </form>
  )
}

// ─── The card ──────────────────────────────────────────────────────────────────

export default function SiteSetup({ lang, welcome, onSites }: { lang: Lang; welcome?: boolean; onSites?: (n: number) => void }) {
  const t = L[lang] || L.fr
  const [sites, setSites] = useState<Site[] | null>(null)
  useEffect(() => {
    let alive = true
    fetch('/api/client/site', { cache: 'no-store' }).then(r => r.ok ? r.json() : { items: [] }).catch(() => ({ items: [] }))
      .then(d => { if (!alive) return; const items = (d.items || []) as Site[]; setSites(items); onSites?.(items.length) })
    return () => { alive = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (!sites?.length) return null
  const update = (s: Site) => setSites(prev => (prev || []).map(x => x.slug === s.slug ? { ...x, ...s } : x))

  return (
    <>
      {sites.map(site => (
        <div key={site.slug} className="card p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-3xl text-ink">{t.title}</h2>
                <Badge site={site} t={t} />
              </div>
              <a href={site.live_url || site.preview_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-ink">
                {(site.live_url || site.preview_url).replace('https://', '')}<ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          {welcome && site.status !== 'live' && (
            <div className="mt-5 rounded-2xl bg-green-50 text-green-800 p-4 flex gap-3 text-sm">
              <Check className="w-5 h-5 flex-shrink-0" /><p className="leading-relaxed">{t.welcome}</p>
            </div>
          )}
          <div className="mt-7">
            <h3 className="font-semibold text-lg text-ink flex items-center gap-2"><Globe className="w-5 h-5 text-brand" />{t.s1}</h3>
            <DomainStep site={site} t={t} onUpdate={update} />
          </div>
          <div className="mt-9 pt-7 border-t border-line">
            <h3 className="font-semibold text-lg text-ink flex items-center gap-2"><Scale className="w-5 h-5 text-brand" />{t.s2}</h3>
            <p className="text-sm text-ink/55 mt-1">{t.s2sub}</p>
            <LegalStep site={site} t={t} onUpdate={update} />
          </div>
        </div>
      ))}
    </>
  )
}
