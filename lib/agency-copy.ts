/**
 * Homepage copy for the AI visibility agency positioning (2026-09-26).
 * Funnel: free analysis (20 s) -> free full audit (30 min + written plan) -> monthly accompaniment.
 * Prices must stay aligned with lib/site-copy.ts and the outreach sequence. No em dash anywhere.
 */
import type { Lang } from './i18n'

const fr = {
  mock: {
    label: 'Exemple illustratif',
    q: 'Quel est le meilleur carrossier à Sion ?',
    intro: 'Voici trois carrosseries bien notées à Sion :',
    items: [
      { name: 'Carrosserie du Rhône', meta: '4,9 · 212 avis' },
      { name: 'Votre entreprise', meta: '4,8 · 96 avis', you: true },
      { name: 'Garage des Alpes', meta: '4,6 · 88 avis' },
    ],
    you: 'Recommandé',
    footer: 'Cité par 3 assistants sur 4',
  },
  shift: {
    eyebrow: 'Pourquoi maintenant',
    title: 'Vos clients ne cliquent plus sur dix liens. Ils demandent une réponse.',
    points: [
      { title: 'L\'IA répond avec quelques noms', desc: 'Pas une page de résultats, une courte liste d\'entreprises recommandées. Si vous n\'y êtes pas, ce client ne vous verra jamais.' },
      { title: 'Elle s\'appuie sur des sources précises', desc: 'Votre fiche Google, les annuaires comme local.ch, vos avis, la presse locale et votre site. Chacune de ces sources se travaille.' },
      { title: 'Les places se prennent maintenant', desc: 'Les entreprises qui soignent ces signaux aujourd\'hui deviennent la réponse par défaut de demain dans leur ville.' },
    ],
  },
  band: {
    title: 'Que disent les IA de votre entreprise ?',
    sub: 'ChatGPT, Claude, Gemini et Perplexity, interrogés pour vous, avec leur recherche web. Réponses mot pour mot.',
    cta: 'Lancer l\'analyse gratuite',
  },
  journey: {
    eyebrow: 'Notre accompagnement',
    title: 'Trois étapes pour devenir la recommandation de votre ville.',
    steps: [
      { tag: 'Gratuit · 20 secondes', title: 'Analyse gratuite', desc: 'Nous posons à ChatGPT, Claude, Gemini et Perplexity la question de vos clients. Vous voyez leurs réponses exactes, qui est recommandé à votre place et sur quelles sources.', cta: 'Lancer l\'analyse', href: '#analyse' },
      { tag: 'Offert · 30 minutes', title: 'Audit complet', desc: 'Nous passons en revue votre site, votre fiche Google, les annuaires, vos avis et vos contenus. Vous repartez avec un plan d\'action écrit et priorisé.', cta: 'Réserver mon audit', href: '#audit' },
      { tag: 'Dès CHF 249 / mois', title: 'Accompagnement', desc: 'Nous appliquons le plan et le suivons chaque mois : données structurées, fiche Google, annuaires, avis, contenus qui répondent aux questions de vos clients, rapport de visibilité IA.', cta: 'Voir les offres', href: '#pricing' },
    ],
  },
  services: {
    eyebrow: 'Ce que nous faisons',
    title: 'Tout ce qui rend une entreprise visible pour les IA et sur Google.',
    items: [
      { title: 'Mesure de visibilité IA', desc: 'Votre place réelle sur quatre assistants, vos concurrents et leurs sources, suivies dans le temps.' },
      { title: 'Un site que les IA citent', desc: 'Données structurées Schema.org, pages claires, questions fréquentes : votre site devient une source fiable.' },
      { title: 'Fiche Google optimisée', desc: 'Services, horaires, photos, catégories : la base de presque toutes les réponses locales.' },
      { title: 'Annuaires et cohérence', desc: 'local.ch, search.ch et les annuaires de votre métier, avec les mêmes coordonnées partout.' },
      { title: 'Avis et réputation', desc: 'Une méthode simple pour obtenir des avis réguliers et y répondre. Les IA les lisent.' },
      { title: 'Rapport mensuel', desc: 'Chaque mois : qui vous cite, à quelle place, ce qui a changé et la prochaine action.' },
    ],
  },
  audit: {
    eyebrow: 'Audit complet offert',
    title: 'Réservez votre audit, nous vous montrons le chemin.',
    sub: '30 minutes avec Antoine, par téléphone ou en visio. Nous regardons ce que les IA et Google voient de votre entreprise, et vous recevez un plan d\'action écrit. Vous l\'appliquez vous-même, ou vous nous le confiez.',
    bullets: ['Analyse de votre site, fiche Google, annuaires et avis', 'Comparaison avec les entreprises recommandées à votre place', 'Plan d\'action écrit, priorisé, à garder', 'Sans engagement, sans frais'],
  },
  sites: {
    eyebrow: 'Sites web',
    title: 'Pas de site, ou un site qui vous dessert ? Nous le préparons avant même de vous écrire.',
  },
  enterprise: {
    title: 'Entreprise établie, site existant ?',
    desc: 'Accompagnement visibilité IA sur mesure, sans changer de site, dès CHF 690 / mois. On commence toujours par l\'audit offert.',
    cta: 'Commencer par l\'audit offert',
  },
}

const de: typeof fr = {
  mock: {
    label: 'Illustratives Beispiel',
    q: 'Welche ist die beste Carrosserie in Sitten?',
    intro: 'Hier sind drei gut bewertete Carrosserien in Sitten:',
    items: [
      { name: 'Carrosserie du Rhône', meta: '4,9 · 212 Bewertungen' },
      { name: 'Ihr Betrieb', meta: '4,8 · 96 Bewertungen', you: true },
      { name: 'Garage des Alpes', meta: '4,6 · 88 Bewertungen' },
    ],
    you: 'Empfohlen',
    footer: 'Von 3 von 4 Assistenten genannt',
  },
  shift: {
    eyebrow: 'Warum jetzt',
    title: 'Ihre Kunden klicken nicht mehr auf zehn Links. Sie wollen eine Antwort.',
    points: [
      { title: 'Die KI antwortet mit wenigen Namen', desc: 'Keine Ergebnisseite, sondern eine kurze Liste empfohlener Betriebe. Wer nicht darauf steht, existiert für diesen Kunden nicht.' },
      { title: 'Sie stützt sich auf klare Quellen', desc: 'Ihr Google-Profil, Verzeichnisse wie local.ch, Ihre Bewertungen, die Lokalpresse und Ihre Website. Jede dieser Quellen lässt sich verbessern.' },
      { title: 'Die Plätze werden jetzt vergeben', desc: 'Betriebe, die diese Signale heute pflegen, werden morgen die Standardantwort in ihrem Ort.' },
    ],
  },
  band: {
    title: 'Was sagt die KI über Ihren Betrieb?',
    sub: 'ChatGPT, Claude, Gemini und Perplexity, für Sie befragt, mit Websuche. Antworten Wort für Wort.',
    cta: 'Kostenlose Analyse starten',
  },
  journey: {
    eyebrow: 'Unsere Begleitung',
    title: 'In drei Schritten zur Empfehlung in Ihrem Ort.',
    steps: [
      { tag: 'Kostenlos · 20 Sekunden', title: 'Kostenlose Analyse', desc: 'Wir stellen ChatGPT, Claude, Gemini und Perplexity die Frage Ihrer Kunden. Sie sehen die genauen Antworten, wer an Ihrer Stelle empfohlen wird und auf welche Quellen sich die KI stützt.', cta: 'Analyse starten', href: '#analyse' },
      { tag: 'Kostenlos · 30 Minuten', title: 'Vollständiges Audit', desc: 'Wir prüfen Website, Google-Profil, Verzeichnisse, Bewertungen und Inhalte. Sie erhalten einen schriftlichen, priorisierten Aktionsplan.', cta: 'Audit buchen', href: '#audit' },
      { tag: 'Ab CHF 249 / Monat', title: 'Begleitung', desc: 'Wir setzen den Plan um und begleiten Sie jeden Monat: strukturierte Daten, Google-Profil, Verzeichnisse, Bewertungen, Inhalte zu den Fragen Ihrer Kunden, monatlicher KI-Sichtbarkeitsbericht.', cta: 'Angebote ansehen', href: '#pricing' },
    ],
  },
  services: {
    eyebrow: 'Was wir tun',
    title: 'Alles, was einen Betrieb für die KI und auf Google sichtbar macht.',
    items: [
      { title: 'KI-Sichtbarkeit messen', desc: 'Ihr echter Platz bei vier Assistenten, Ihre Konkurrenz und deren Quellen, über die Zeit verfolgt.' },
      { title: 'Eine Website, die die KI zitiert', desc: 'Strukturierte Daten nach Schema.org, klare Seiten, häufige Fragen: Ihre Website wird zur verlässlichen Quelle.' },
      { title: 'Optimiertes Google-Profil', desc: 'Leistungen, Öffnungszeiten, Fotos, Kategorien: die Basis fast aller lokalen Antworten.' },
      { title: 'Verzeichnisse und Einheitlichkeit', desc: 'local.ch, search.ch und die Verzeichnisse Ihrer Branche, überall mit denselben Kontaktdaten.' },
      { title: 'Bewertungen und Ruf', desc: 'Eine einfache Methode für regelmässige Bewertungen und passende Antworten. Die KI liest sie.' },
      { title: 'Monatlicher Bericht', desc: 'Jeden Monat: wer Sie nennt, an welcher Stelle, was sich geändert hat und der nächste Schritt.' },
    ],
  },
  audit: {
    eyebrow: 'Kostenloses Audit',
    title: 'Buchen Sie Ihr Audit, wir zeigen Ihnen den Weg.',
    sub: '30 Minuten mit Antoine, per Telefon oder Video. Wir schauen, was KI und Google von Ihrem Betrieb sehen, und Sie erhalten einen schriftlichen Aktionsplan. Sie setzen ihn selbst um oder überlassen ihn uns.',
    bullets: ['Prüfung von Website, Google-Profil, Verzeichnissen und Bewertungen', 'Vergleich mit den Betrieben, die an Ihrer Stelle empfohlen werden', 'Schriftlicher, priorisierter Aktionsplan zum Behalten', 'Unverbindlich und kostenlos'],
  },
  sites: {
    eyebrow: 'Websites',
    title: 'Keine Website, oder eine, die Ihnen schadet? Wir bauen sie, bevor wir Ihnen schreiben.',
  },
  enterprise: {
    title: 'Etablierter Betrieb mit eigener Website?',
    desc: 'Massgeschneiderte KI-Sichtbarkeitsbegleitung, ohne Website-Wechsel, ab CHF 690 / Monat. Wir beginnen immer mit dem kostenlosen Audit.',
    cta: 'Mit dem kostenlosen Audit beginnen',
  },
}

const en: typeof fr = {
  mock: {
    label: 'Illustrative example',
    q: 'Who is the best body shop in Sion?',
    intro: 'Here are three well rated body shops in Sion:',
    items: [
      { name: 'Carrosserie du Rhône', meta: '4.9 · 212 reviews' },
      { name: 'Your business', meta: '4.8 · 96 reviews', you: true },
      { name: 'Garage des Alpes', meta: '4.6 · 88 reviews' },
    ],
    you: 'Recommended',
    footer: 'Named by 3 of 4 assistants',
  },
  shift: {
    eyebrow: 'Why now',
    title: 'Your customers no longer click through ten links. They ask for an answer.',
    points: [
      { title: 'AI answers with a few names', desc: 'Not a page of results, a short list of recommended businesses. If you are not on it, that customer never sees you.' },
      { title: 'It relies on specific sources', desc: 'Your Google profile, directories like local.ch, your reviews, local press and your website. Each of them can be worked on.' },
      { title: 'The spots are being taken now', desc: 'Businesses that look after these signals today become tomorrow\'s default answer in their town.' },
    ],
  },
  band: {
    title: 'What does AI say about your business?',
    sub: 'ChatGPT, Claude, Gemini and Perplexity, asked for you, with web search. Answers word for word.',
    cta: 'Start the free analysis',
  },
  journey: {
    eyebrow: 'How we work with you',
    title: 'Three steps to become the recommendation in your town.',
    steps: [
      { tag: 'Free · 20 seconds', title: 'Free analysis', desc: 'We ask ChatGPT, Claude, Gemini and Perplexity your customers\' question. You see their exact answers, who is recommended instead of you and which sources they use.', cta: 'Start the analysis', href: '#analyse' },
      { tag: 'Free · 30 minutes', title: 'Full audit', desc: 'We review your website, Google profile, directories, reviews and content. You leave with a written, prioritised action plan.', cta: 'Book my audit', href: '#audit' },
      { tag: 'From CHF 249 / month', title: 'Ongoing support', desc: 'We carry out the plan and follow it every month: structured data, Google profile, directories, reviews, content that answers your customers\' questions, monthly AI visibility report.', cta: 'See the offers', href: '#pricing' },
    ],
  },
  services: {
    eyebrow: 'What we do',
    title: 'Everything that makes a business visible to AI and on Google.',
    items: [
      { title: 'AI visibility tracking', desc: 'Your real position on four assistants, your competitors and their sources, followed over time.' },
      { title: 'A website AI quotes', desc: 'Schema.org structured data, clear pages, frequent questions: your website becomes a trusted source.' },
      { title: 'Optimised Google profile', desc: 'Services, hours, photos, categories: the basis of almost every local answer.' },
      { title: 'Directories and consistency', desc: 'local.ch, search.ch and your trade\'s directories, with the same details everywhere.' },
      { title: 'Reviews and reputation', desc: 'A simple method to get regular reviews and reply to them. AI reads them.' },
      { title: 'Monthly report', desc: 'Every month: who names you, in which position, what changed and the next action.' },
    ],
  },
  audit: {
    eyebrow: 'Free full audit',
    title: 'Book your audit, we show you the way.',
    sub: '30 minutes with Antoine, by phone or video. We look at what AI and Google see of your business, and you get a written action plan. Apply it yourself, or hand it to us.',
    bullets: ['Review of your website, Google profile, directories and reviews', 'Comparison with the businesses recommended instead of you', 'Written, prioritised action plan to keep', 'No commitment, no cost'],
  },
  sites: {
    eyebrow: 'Websites',
    title: 'No website, or one that works against you? We build it before we even write to you.',
  },
  enterprise: {
    title: 'Established business with its own website?',
    desc: 'Tailored AI visibility support, without changing your website, from CHF 690 / month. We always start with the free audit.',
    cta: 'Start with the free audit',
  },
}

export const agencyCopy: Record<Lang, typeof fr> = { fr, de, en }
