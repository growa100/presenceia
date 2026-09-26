/**
 * Homepage copy. Since 2026-09-26 the page leads with AI visibility (see lib/agency-copy.ts); the site offer stays for cold-email prospects.
 *
 * The cold email says "Antoine, presenceia.com" and links the prospect to
 * the site we built for them. When they look us up, this page has one job:
 * confirm that we are real, Swiss, and that saying "oui" is simple and
 * risk-free. Prices here MUST stay aligned with the outreach sequence
 * (see lib/plans.ts for prices: site 99, visibilité IA 249, + assistant 390; 12 months / yearly / no commitment).
 */
import type { Lang } from './i18n'

export const CONTACT = {
  email: 'antoine@presenceia.com',
  phone: '+41 78 915 15 73',
  phoneHref: 'tel:+41789151573',
  // Until 41 Labs GmbH is registered, Présence IA is run by Antoine Pury as an individual.
  company: 'Présence IA',
  owner: 'Antoine Pury',
  street: 'Av. du Bietschhorn 37',
  zip: '1950',
  city: 'Sion',
}

/** Real generated sites, one per sector, shown as examples. */
export const SHOWCASE = [
  { slug: 'carrosserie-13-etoiles-sarl-sion', name: 'Carrosserie 13 étoiles', sector: { fr: 'Carrosserie', de: 'Carrosserie', en: 'Body shop' }, city: 'Sion' },
  { slug: 'garage-612-vevey', name: 'Garage 612', sector: { fr: 'Garage', de: 'Garage', en: 'Garage' }, city: 'Vevey' },
  { slug: 'bh-sanitaire-lausanne', name: 'BH Sanitaire', sector: { fr: 'Sanitaire', de: 'Sanitär', en: 'Plumbing' }, city: 'Lausanne' },
  { slug: 'voltarys-electricite-auvernier', name: 'Voltarys Électricité', sector: { fr: 'Électricité', de: 'Elektro', en: 'Electrician' }, city: 'Auvernier' },
  { slug: 'helvetibat-renovation-sion', name: 'Helvetibat Rénovation', sector: { fr: 'Rénovation', de: 'Renovation', en: 'Renovation' }, city: 'Sion' },
  { slug: 'garage-rumine-lausanne', name: 'Garage Rumine', sector: { fr: 'Garage', de: 'Garage', en: 'Garage' }, city: 'Lausanne' },
]

const fr = {
  nav: { analysis: 'Analyse gratuite', journey: 'Accompagnement', services: 'Services', examples: 'Sites web', how: 'Comment ça marche', pricing: 'Tarifs', faq: 'Questions', blog: 'Blog', login: 'Espace client', cta: 'Analyse gratuite' },
  hero: {
    eyebrow: 'Agence de visibilité IA · Suisse',
    h1a: 'Quand vos clients cherchent avec l’IA,',
    h1b: 'soyez parmi les entreprises recommandées.',
    sub: 'Présence IA mesure comment ChatGPT, Gemini, Claude et Perplexity parlent de votre entreprise, de vos concurrents et de votre secteur. Nous vous montrons où vous êtes invisible et comment améliorer votre présence sur les IA et Google.',
    cta1: 'Tester ma visibilité IA',
    cta2: 'Voir l\'accompagnement',
    received: 'Vous avez reçu un email d\'Antoine avec votre site ?',
    receivedLink: 'Activer mon site',
  },
  trust: ['Basé en Suisse, à Sion', 'Mesure réelle sur ChatGPT, Claude, Gemini et Perplexity', 'Données protégées (nLPD / RGPD)', 'Garantie 90 jours', 'Réponse sous 24 h'],
  how: {
    eyebrow: 'Comment ça marche',
    title: 'Trois étapes, aucune technique de votre côté.',
    steps: [
      { n: '1', title: 'Nous préparons votre site', desc: 'À partir de vos informations publiques : métier, services, horaires, avis Google, coordonnées. Vous recevez un email avec le lien pour le voir.' },
      { n: '2', title: 'Vous regardez, vous décidez', desc: 'Si ça vous parle, vous répondez « oui » à l\'email ou vous nous appelez. Si ce n\'est pas pour vous, le site est retiré, sans frais et sans relance.' },
      { n: '3', title: 'En ligne cette semaine', desc: 'Nous enregistrons votre nom de domaine, mettons le site en ligne et intégrons vos photos et corrections. Ensuite, un email suffit pour toute modification.' },
    ],
  },
  examples: {
    eyebrow: 'Exemples',
    title: 'Des sites préparés pour de vraies entreprises.',
    sub: 'Chacun est construit à partir des informations publiques de l\'entreprise, dans le style de son métier. Cliquez pour voir.',
    open: 'Voir le site',
  },
  included: {
    eyebrow: 'Ce qui est compris',
    title: 'Tout ce qu\'il faut, rien à gérer.',
    items: [
      { title: 'Votre site professionnel', desc: 'Design moderne adapté à votre métier, vos services, vos photos, vos avis Google.' },
      { title: 'Votre nom de domaine', desc: 'www.votre-entreprise.ch, .fr ou .com, enregistré à votre nom, configuré pour vous.' },
      { title: 'Hébergement suisse + SSL', desc: 'Rapide, sécurisé, sauvegardé. Aucune technique à gérer, jamais.' },
      { title: 'Modifications illimitées', desc: 'Nouveaux horaires, photos, service ajouté : un email, c\'est fait sous 48 h.' },
      { title: 'Référencement local', desc: 'Optimisé pour apparaître sur Google quand on cherche votre métier dans votre région.' },
      { title: 'Lisible par les IA', desc: 'Structuré pour être compris et cité par ChatGPT, Perplexity et l\'IA de Google quand on leur demande un professionnel près de chez vous.' },
    ],
  },
  pricing: {
    eyebrow: 'Tarifs',
    title: 'Des offres claires, des résultats mesurés.',
    sub: 'Trois façons de payer : 12 mois avec mise en place offerte, à l\'année avec 2 mois offerts, ou sans engagement. Prix en francs suisses.',
    secure: 'Paiement sécurisé par Stripe (carte, Apple Pay, Google Pay). Vous gérez votre abonnement et vos factures dans votre espace client.',
    mo: '/ mois',
    popular: 'Le plus choisi',
    plans: [
      { key: 'site', name: 'Site web', desc: 'L\'essentiel, bien fait.', features: ['Site professionnel complet', 'Nom de domaine inclus', 'Hébergement suisse + SSL', 'Modifications illimitées', 'Référencement local', 'Lisible par les IA'], cta: 'Activer mon site' },
      { key: 'visibility', name: 'Visibilité IA', popular: true, desc: 'Pour être trouvé sur Google et recommandé par ChatGPT.', features: ['Mise en place : fiche Google, annuaires, données structurées, FAQ', 'Analyse mensuelle sur 4 IA, avec rapport', '4 publications Google par mois', 'Un nouveau contenu par mois', 'Suivi des annuaires et des avis', 'Votre site inclus si besoin'], cta: 'Démarrer' },
      { key: 'complete', name: 'Visibilité IA + Assistant', desc: 'Visibilité IA et un assistant qui répond à vos appels.', features: ['Tout Visibilité IA, plus :', 'Assistant qui répond quand vous êtes occupé', 'Résumé WhatsApp de chaque appel', 'Prise de rendez-vous et rappels', '2 contenus par mois au lieu d\'un'], cta: 'Démarrer' },
    ],
    enterprise: 'Entreprise établie avec un site existant ? Programme de visibilité IA sur mesure dès CHF 690 / mois.',
    enterpriseCta: 'Parlons-en',
  },
  founder: {
    eyebrow: 'Qui est derrière',
    name: 'Antoine Pury',
    role: 'Fondateur de Présence IA, Sion',
    text: 'J\'ai lancé Présence IA parce que la façon dont les clients trouvent un professionnel est en train de changer : ils demandent à une IA. D\'excellentes entreprises disparaissent de ces réponses simplement parce que personne ne s\'occupe de leurs signaux en ligne. Nous mesurons, nous corrigeons, nous suivons. Je lis et je réponds moi-même à chaque email.',
  },
  faq: {
    eyebrow: 'Questions fréquentes',
    title: 'Ce qu\'on nous demande le plus souvent.',
    items: [
      { q: 'Qu\'est-ce que la visibilité IA (GEO) ?', a: 'C\'est le fait d\'être cité par ChatGPT, Gemini, Claude ou Perplexity quand un client leur demande un professionnel. On parle aussi de GEO, pour Generative Engine Optimization. Ces assistants construisent leur réponse à partir de sources publiques : fiche Google, annuaires, avis, articles, sites web. Nous travaillons ces sources pour que votre entreprise soit reconnue et recommandée.' },
      { q: 'Comment fonctionne l\'analyse gratuite ?', a: 'Nous posons à quatre assistants, avec leur recherche web activée, la question qu\'un client poserait dans votre ville. Vous voyez leurs réponses mot pour mot, qui est recommandé et les sources utilisées. Nous confirmons votre email par un code pour éviter les abus : une analyse gratuite par jour.' },
      { q: 'Que se passe-t-il pendant l\'audit offert ?', a: '30 minutes avec Antoine, par téléphone ou en visio. Nous passons en revue votre site, votre fiche Google, les annuaires et vos avis, puis vous recevez un plan d\'action écrit. Vous pouvez l\'appliquer vous-même ou nous le confier.' },
      { q: 'Pourquoi avez-vous préparé un site pour mon entreprise sans me le demander ?', a: 'C\'est notre façon de nous présenter : plutôt qu\'un argumentaire, nous vous montrons le résultat. Le site est construit uniquement à partir d\'informations déjà publiques (fiche Google, annuaires professionnels). Si vous n\'en voulez pas, il est retiré, sans frais et sans relance.' },
      { q: 'Que se passe-t-il si je dis oui ?', a: 'Nous vous répondons sous 24 h. Nous choisissons ensemble le nom de domaine, vous nous envoyez votre logo, vos photos et vos corrections, et le site est en ligne sous 3 à 5 jours ouvrés. Vous ne touchez à rien de technique.' },
      { q: 'Le nom de domaine m\'appartient-il ?', a: 'Oui. Il est enregistré au nom de votre entreprise. Si un jour vous partez, vous le gardez.' },
      { q: 'Puis-je modifier le contenu ?', a: 'Autant que vous voulez, c\'est compris. Un email avec la modification, et elle est en ligne sous 48 h.' },
      { q: 'Y a-t-il un engagement ou des frais d\'installation ?', a: 'Vous choisissez. Sur 12 mois ou à l\'année, la mise en place est offerte. Sans engagement, vous résiliez chaque mois et la mise en place Visibilité IA coûte CHF 490. Dans tous les cas, garantie 90 jours : si rien ne progresse de façon mesurable, le 4e mois est offert.' },
      { q: 'J\'ai déjà un site. Est-ce utile pour moi ?', a: 'Deux options : nous remplaçons votre site par le nôtre, ou nous travaillons uniquement votre visibilité sur Google et dans les réponses des IA à partir de votre site existant.' },
      { q: 'Travaillez-vous en dehors de la Suisse ?', a: 'Oui. Nous travaillons avec des entreprises en Suisse, en France et à l\'international, en français, en allemand et en anglais, avec le nom de domaine adapté à votre pays (.ch, .fr, .com, .de…).' },
    ],
  },
  activate: {
    eyebrow: 'Vous avez reçu votre site ?',
    title: 'Vous avez vu votre site. Il est à vous.',
    sub: 'Le plus simple : répondez « oui » à l\'email que vous avez reçu. Sinon, un appel ou un email et nous nous occupons de tout.',
    call: 'Appeler',
    email: 'Écrire un email',
    emailSubject: 'Activer mon site',
    emailBody: 'Bonjour Antoine, je souhaite activer le site de mon entreprise : ',
    none: 'Vous n\'avez pas reçu d\'email ? Écrivez-nous le nom de votre entreprise et votre ville, nous préparons votre site gratuitement, sans engagement.',
    noneSubject: 'Préparer mon site',
    noneBody: 'Bonjour Antoine, pouvez-vous préparer un site pour mon entreprise ? Nom : … Ville : … Métier : …',
    reply: 'Réponse sous 24 h, par Antoine.',
  },
  checker: {
    eyebrow: 'Analyse gratuite',
    title: 'Que disent les IA de votre entreprise ?',
    sub: 'De plus en plus de clients demandent à ChatGPT, Perplexity ou Gemini « un bon artisan près de chez moi ». Nous posons la question à ChatGPT, Claude, Gemini et Perplexity pour vous : résultat en 20 secondes, gratuit, sans engagement.',
    cta: 'Lancer l\'analyse gratuite',
    note: '20 secondes · gratuit · email confirmé par code',
  },
  footer: {
    tagline: 'Visibilité IA et sites web pour PME, en Suisse et au-delà.',
    legal: 'Mentions légales',
    privacy: 'Confidentialité',
    rights: `© 2026 ${CONTACT.company}, ${CONTACT.city}, Suisse`,
  },
}

const de: typeof fr = {
  nav: { analysis: 'Kostenlose Analyse', journey: 'Begleitung', services: 'Leistungen', examples: 'Websites', how: 'So funktioniert es', pricing: 'Preise', faq: 'Fragen', blog: 'Blog', login: 'Kundenbereich', cta: 'Kostenlose Analyse' },
  hero: {
    eyebrow: 'KI-Sichtbarkeitsagentur · Schweiz',
    h1a: 'Wenn Ihre Kunden mit KI suchen,',
    h1b: 'gehören Sie zu den empfohlenen Betrieben.',
    sub: 'Présence IA misst, wie ChatGPT, Gemini, Claude und Perplexity über Ihren Betrieb, Ihre Mitbewerber und Ihre Branche sprechen. Wir zeigen Ihnen, wo Sie unsichtbar sind und wie Sie Ihre Präsenz bei der KI und auf Google verbessern.',
    cta1: 'KI-Sichtbarkeit testen',
    cta2: 'Begleitung ansehen',
    received: 'Haben Sie von Antoine eine E-Mail mit Ihrer Website erhalten?',
    receivedLink: 'Website aktivieren',
  },
  trust: ['Mit Sitz in der Schweiz, in Sitten (Sion)', 'Echte Messung bei ChatGPT, Claude, Gemini und Perplexity', 'Datenschutz (DSG / DSGVO)', '90-Tage-Garantie', 'Antwort innert 24 h'],
  how: {
    eyebrow: 'So funktioniert es',
    title: 'Drei Schritte, keine Technik auf Ihrer Seite.',
    steps: [
      { n: '1', title: 'Wir bauen Ihre Website', desc: 'Aus Ihren öffentlichen Informationen: Beruf, Leistungen, Öffnungszeiten, Google-Bewertungen, Kontaktdaten. Sie erhalten eine E-Mail mit dem Link.' },
      { n: '2', title: 'Sie schauen, Sie entscheiden', desc: 'Gefällt sie Ihnen, antworten Sie mit „Ja“ oder rufen uns an. Falls nicht, wird die Website entfernt, ohne Kosten und ohne Nachfassen.' },
      { n: '3', title: 'Diese Woche online', desc: 'Wir registrieren Ihre Domain, schalten die Website frei und übernehmen Ihre Fotos und Korrekturen. Danach genügt eine E-Mail für jede Änderung.' },
    ],
  },
  examples: {
    eyebrow: 'Beispiele',
    title: 'Websites für echte Unternehmen.',
    sub: 'Jede wird aus den öffentlichen Informationen des Betriebs gebaut, im Stil seiner Branche. Klicken Sie, um sie anzusehen.',
    open: 'Website ansehen',
  },
  included: {
    eyebrow: 'Inklusive',
    title: 'Alles, was es braucht. Nichts zu verwalten.',
    items: [
      { title: 'Ihre professionelle Website', desc: 'Modernes Design passend zu Ihrem Beruf, Ihre Leistungen, Fotos und Google-Bewertungen.' },
      { title: 'Ihre Domain', desc: 'www.ihre-firma.ch, .de oder .com, auf Ihren Namen registriert und für Sie eingerichtet.' },
      { title: 'Schweizer Hosting + SSL', desc: 'Schnell, sicher, gesichert. Keine Technik, nie.' },
      { title: 'Unbegrenzte Änderungen', desc: 'Neue Öffnungszeiten, Fotos, Leistungen: eine E-Mail, innert 48 h erledigt.' },
      { title: 'Lokale Suchmaschinenoptimierung', desc: 'Optimiert, um bei Google gefunden zu werden, wenn jemand Ihren Beruf in Ihrer Region sucht.' },
      { title: 'Für KI lesbar', desc: 'So strukturiert, dass ChatGPT, Perplexity und Googles KI Sie verstehen und empfehlen, wenn jemand nach einem Profi in Ihrer Nähe fragt.' },
    ],
  },
  pricing: {
    eyebrow: 'Preise',
    title: 'Klare Angebote, messbare Resultate.',
    sub: 'Drei Zahlungsarten: 12 Monate mit geschenkter Einrichtung, jährlich mit 2 Gratismonaten, oder ohne Bindung. Preise in Schweizer Franken.',
    secure: 'Sichere Zahlung über Stripe (Karte, Apple Pay, Google Pay). Abonnement und Rechnungen verwalten Sie im Kundenbereich.',
    mo: '/ Monat',
    popular: 'Am häufigsten gewählt',
    plans: [
      { key: 'site', name: 'Website', desc: 'Das Wesentliche, gut gemacht.', features: ['Komplette professionelle Website', 'Domain inklusive', 'Schweizer Hosting + SSL', 'Unbegrenzte Änderungen', 'Lokale Suchmaschinenoptimierung', 'Für KI lesbar'], cta: 'Website aktivieren' },
      { key: 'visibility', name: 'KI-Sichtbarkeit', popular: true, desc: 'Um auf Google gefunden und von ChatGPT empfohlen zu werden.', features: ['Einrichtung: Google-Profil, Verzeichnisse, strukturierte Daten, FAQ', 'Monatliche Analyse bei 4 KI, mit Bericht', '4 Google-Beiträge pro Monat', 'Ein neuer Inhalt pro Monat', 'Kontrolle der Verzeichnisse und Bewertungen', 'Ihre Website inklusive, falls nötig'], cta: 'Starten' },
      { key: 'complete', name: 'KI-Sichtbarkeit + Assistent', desc: 'KI-Sichtbarkeit und ein Assistent, der Ihre Anrufe beantwortet.', features: ['Alles aus KI-Sichtbarkeit, plus:', 'Assistent, der abnimmt, wenn Sie beschäftigt sind', 'WhatsApp-Zusammenfassung jedes Anrufs', 'Terminvereinbarung und Rückrufe', '2 Inhalte pro Monat statt einem'], cta: 'Starten' },
    ],
    enterprise: 'Etabliertes Unternehmen mit bestehender Website? Massgeschneidertes KI-Sichtbarkeitsprogramm ab CHF 690 / Monat.',
    enterpriseCta: 'Sprechen wir darüber',
  },
  founder: {
    eyebrow: 'Wer dahinter steht',
    name: 'Antoine Pury',
    role: 'Gründer von Présence IA, Sitten (Sion)',
    text: 'Ich habe Présence IA gegründet, weil sich gerade ändert, wie Kunden einen Fachbetrieb finden: Sie fragen eine KI. Ausgezeichnete Betriebe verschwinden aus diesen Antworten, nur weil sich niemand um ihre Online-Signale kümmert. Wir messen, wir korrigieren, wir begleiten. Ich lese und beantworte jede E-Mail selbst.',
  },
  faq: {
    eyebrow: 'Häufige Fragen',
    title: 'Was wir am häufigsten gefragt werden.',
    items: [
      { q: 'Was ist KI-Sichtbarkeit (GEO)?', a: 'Genannt zu werden, wenn ein Kunde ChatGPT, Gemini, Claude oder Perplexity nach einem Fachbetrieb fragt. Man spricht auch von GEO, Generative Engine Optimization. Diese Assistenten bauen ihre Antwort aus öffentlichen Quellen: Google-Profil, Verzeichnisse, Bewertungen, Artikel, Websites. Wir pflegen diese Quellen, damit Ihr Betrieb erkannt und empfohlen wird.' },
      { q: 'Wie funktioniert die kostenlose Analyse?', a: 'Wir stellen vier Assistenten mit aktivierter Websuche die Frage, die ein Kunde in Ihrem Ort stellen würde. Sie sehen die Antworten Wort für Wort, wer empfohlen wird und welche Quellen genutzt werden. Wir bestätigen Ihre E-Mail per Code, um Missbrauch zu verhindern: eine kostenlose Analyse pro Tag.' },
      { q: 'Wie läuft das kostenlose Audit ab?', a: '30 Minuten mit Antoine, per Telefon oder Video. Wir prüfen Website, Google-Profil, Verzeichnisse und Bewertungen, danach erhalten Sie einen schriftlichen Aktionsplan. Sie setzen ihn selbst um oder überlassen ihn uns.' },
      { q: 'Warum haben Sie eine Website für meinen Betrieb gebaut, ohne zu fragen?', a: 'So stellen wir uns vor: Statt einer Verkaufspräsentation zeigen wir Ihnen das Ergebnis. Die Website basiert ausschliesslich auf bereits öffentlichen Informationen (Google-Profil, Branchenverzeichnisse). Wenn Sie sie nicht wollen, wird sie entfernt, ohne Kosten und ohne Nachfassen.' },
      { q: 'Was passiert, wenn ich Ja sage?', a: 'Wir antworten innert 24 h. Wir wählen gemeinsam die Domain, Sie schicken uns Logo, Fotos und Korrekturen, und die Website ist in 3 bis 5 Arbeitstagen online. Sie müssen nichts Technisches tun.' },
      { q: 'Gehört mir die Domain?', a: 'Ja. Sie wird auf den Namen Ihres Unternehmens registriert. Falls Sie eines Tages gehen, behalten Sie sie.' },
      { q: 'Kann ich den Inhalt ändern?', a: 'So oft Sie wollen, das ist inklusive. Eine E-Mail mit der Änderung, und sie ist innert 48 h online.' },
      { q: 'Gibt es eine Vertragsbindung oder Einrichtungsgebühren?', a: 'Sie wählen. Bei 12 Monaten oder jährlicher Zahlung ist die Einrichtung geschenkt. Ohne Bindung kündigen Sie monatlich, die Einrichtung KI-Sichtbarkeit kostet CHF 490. In jedem Fall gilt die 90-Tage-Garantie: Wenn sich nichts messbar verbessert, ist der 4. Monat geschenkt.' },
      { q: 'Ich habe bereits eine Website. Ist das für mich sinnvoll?', a: 'Zwei Möglichkeiten: Wir ersetzen Ihre Website durch unsere, oder wir arbeiten nur an Ihrer Sichtbarkeit bei Google und in den Antworten der KI, ausgehend von Ihrer bestehenden Website.' },
      { q: 'Arbeiten Sie auch ausserhalb der Schweiz?', a: 'Ja. Wir arbeiten mit Unternehmen in der Schweiz, in Deutschland, Österreich, Frankreich und international, auf Deutsch, Französisch und Englisch, mit der passenden Domain für Ihr Land (.ch, .de, .at, .com…).' },
    ],
  },
  activate: {
    eyebrow: 'Haben Sie Ihre Website erhalten?',
    title: 'Sie haben Ihre Website gesehen. Sie gehört Ihnen.',
    sub: 'Am einfachsten: Antworten Sie mit „Ja“ auf die E-Mail, die Sie erhalten haben. Sonst ein Anruf oder eine E-Mail, und wir kümmern uns um alles.',
    call: 'Anrufen',
    email: 'E-Mail schreiben',
    emailSubject: 'Website aktivieren',
    emailBody: 'Guten Tag Antoine, ich möchte die Website meines Unternehmens aktivieren: ',
    none: 'Keine E-Mail erhalten? Schreiben Sie uns den Namen Ihres Betriebs und Ihren Ort, wir bauen Ihre Website kostenlos und unverbindlich.',
    noneSubject: 'Meine Website vorbereiten',
    noneBody: 'Guten Tag Antoine, können Sie eine Website für meinen Betrieb vorbereiten? Name: … Ort: … Beruf: …',
    reply: 'Antwort innert 24 h, von Antoine.',
  },
  checker: {
    eyebrow: 'Kostenlose Analyse',
    title: 'Was sagt die KI über Ihren Betrieb?',
    sub: 'Immer mehr Kunden fragen ChatGPT, Perplexity oder Gemini nach „einem guten Handwerker in meiner Nähe“. Wir stellen die Frage für Sie an ChatGPT, Claude, Gemini und Perplexity: Ergebnis in 20 Sekunden, kostenlos, unverbindlich.',
    cta: 'Kostenlose Analyse starten',
    note: '20 Sekunden · kostenlos · E-Mail per Code bestätigt',
  },
  footer: {
    tagline: 'KI-Sichtbarkeit und Websites für KMU, in der Schweiz und darüber hinaus.',
    legal: 'Impressum',
    privacy: 'Datenschutz',
    rights: `© 2026 ${CONTACT.company}, ${CONTACT.city}, Schweiz`,
  },
}

const en: typeof fr = {
  nav: { analysis: 'Free analysis', journey: 'Our approach', services: 'Services', examples: 'Websites', how: 'How it works', pricing: 'Pricing', faq: 'FAQ', blog: 'Blog', login: 'Client area', cta: 'Free analysis' },
  hero: {
    eyebrow: 'AI visibility agency · Switzerland',
    h1a: 'When your customers search with AI,',
    h1b: 'be among the businesses it recommends.',
    sub: 'Présence IA measures how ChatGPT, Gemini, Claude and Perplexity talk about your business, your competitors and your sector. We show you where you are invisible and how to improve your presence on AI and on Google.',
    cta1: 'Test my AI visibility',
    cta2: 'See our approach',
    received: 'Did Antoine email you with your website?',
    receivedLink: 'Activate my site',
  },
  trust: ['Based in Sion, Switzerland', 'Real measurement on ChatGPT, Claude, Gemini and Perplexity', 'Data protected (nFADP / GDPR)', '90-day guarantee', 'Reply within 24 h'],
  how: {
    eyebrow: 'How it works',
    title: 'Three steps, nothing technical on your side.',
    steps: [
      { n: '1', title: 'We build your site', desc: 'From your public information: trade, services, opening hours, Google reviews, contact details. You receive an email with the link to see it.' },
      { n: '2', title: 'You look, you decide', desc: 'If you like it, reply "yes" to the email or call us. If it is not for you, the site is taken down, no charge and no follow-up.' },
      { n: '3', title: 'Live this week', desc: 'We register your domain, publish the site and add your photos and corrections. From then on, one email is enough for any change.' },
    ],
  },
  examples: {
    eyebrow: 'Examples',
    title: 'Sites built for real businesses.',
    sub: 'Each one is built from the business\'s public information, in the style of its trade. Click to see.',
    open: 'View site',
  },
  included: {
    eyebrow: 'What is included',
    title: 'Everything you need, nothing to manage.',
    items: [
      { title: 'Your professional website', desc: 'Modern design suited to your trade, your services, your photos, your Google reviews.' },
      { title: 'Your domain name', desc: 'www.your-business.com, .ch or .fr, registered in your name and set up for you.' },
      { title: 'Swiss hosting + SSL', desc: 'Fast, secure, backed up. Nothing technical to manage, ever.' },
      { title: 'Unlimited changes', desc: 'New hours, photos, an added service: one email, done within 48 h.' },
      { title: 'Local search optimisation', desc: 'Built to show up on Google when someone searches for your trade in your area.' },
      { title: 'Readable by AI', desc: 'Structured so ChatGPT, Perplexity and Google\'s AI understand and recommend you when someone asks for a professional nearby.' },
    ],
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'Clear offers, measured results.',
    sub: 'Three ways to pay: 12 months with free set-up, yearly with 2 months free, or no commitment. Prices in Swiss francs.',
    secure: 'Secure payment by Stripe (card, Apple Pay, Google Pay). You manage your subscription and invoices in your client area.',
    mo: '/ month',
    popular: 'Most chosen',
    plans: [
      { key: 'site', name: 'Website', desc: 'The essentials, done well.', features: ['Complete professional website', 'Domain name included', 'Swiss hosting + SSL', 'Unlimited changes', 'Local search optimisation', 'Readable by AI'], cta: 'Activate my site' },
      { key: 'visibility', name: 'AI visibility', popular: true, desc: 'To be found on Google and recommended by ChatGPT.', features: ['Set-up: Google profile, directories, structured data, FAQ', 'Monthly analysis on 4 AIs, with report', '4 Google posts a month', 'One new piece of content a month', 'Directories and reviews follow-up', 'Your website included if needed'], cta: 'Get started' },
      { key: 'complete', name: 'AI visibility + Assistant', desc: 'AI visibility and an assistant that answers your calls.', features: ['Everything in AI visibility, plus:', 'Assistant that answers when you are busy', 'WhatsApp summary of every call', 'Appointment booking and callbacks', '2 pieces of content a month instead of one'], cta: 'Get started' },
    ],
    enterprise: 'Established business with an existing site? Tailored AI visibility programme from CHF 690 / month.',
    enterpriseCta: 'Let\'s talk',
  },
  founder: {
    eyebrow: 'Who is behind it',
    name: 'Antoine Pury',
    role: 'Founder of Présence IA, Sion',
    text: 'I started Présence IA because the way customers find a professional is changing: they ask an AI. Excellent businesses disappear from those answers simply because nobody looks after their online signals. We measure, we fix, we follow up. I read and answer every email myself.',
  },
  faq: {
    eyebrow: 'Frequently asked',
    title: 'What we get asked most often.',
    items: [
      { q: 'What is AI visibility (GEO)?', a: 'Being named when a customer asks ChatGPT, Gemini, Claude or Perplexity for a professional. It is also called GEO, Generative Engine Optimization. These assistants build their answers from public sources: Google profile, directories, reviews, articles, websites. We work on these sources so your business is recognised and recommended.' },
      { q: 'How does the free analysis work?', a: 'We ask four assistants, with web search switched on, the question a customer in your town would ask. You see their answers word for word, who is recommended and which sources are used. We confirm your email with a code to prevent abuse: one free analysis per day.' },
      { q: 'What happens during the free audit?', a: '30 minutes with Antoine, by phone or video. We review your website, Google profile, directories and reviews, then you receive a written action plan. Apply it yourself or hand it to us.' },
      { q: 'Why did you build a site for my business without asking?', a: 'It is how we introduce ourselves: instead of a sales pitch, we show you the result. The site is built only from information that is already public (Google profile, trade directories). If you do not want it, it is taken down, no charge and no follow-up.' },
      { q: 'What happens if I say yes?', a: 'We reply within 24 h. We choose the domain name together, you send us your logo, photos and corrections, and the site is live within 3 to 5 working days. You touch nothing technical.' },
      { q: 'Do I own the domain name?', a: 'Yes. It is registered in your company\'s name. If you ever leave, you keep it.' },
      { q: 'Can I change the content?', a: 'As much as you like, it is included. One email with the change and it is live within 48 h.' },
      { q: 'Is there a commitment or a setup fee?', a: 'Your choice. On 12 months or paid yearly, set-up is included. Without commitment you cancel any month and the AI visibility set-up costs CHF 490. Either way, 90-day guarantee: if nothing improves measurably, the 4th month is free.' },
      { q: 'I already have a website. Is this useful for me?', a: 'Two options: we replace your site with ours, or we work only on your visibility on Google and in AI answers, starting from your existing site.' },
      { q: 'Do you work outside Switzerland?', a: 'Yes. We work with businesses in Switzerland, across Europe and internationally, in English, French and German, with the right domain for your country (.com, .ch, .fr, .co.uk…).' },
    ],
  },
  activate: {
    eyebrow: 'Did you receive your website?',
    title: 'You have seen your site. It is yours.',
    sub: 'The simplest way: reply "yes" to the email you received. Otherwise, a call or an email and we take care of everything.',
    call: 'Call',
    email: 'Send an email',
    emailSubject: 'Activate my site',
    emailBody: 'Hello Antoine, I would like to activate the website for my business: ',
    none: 'No email received? Send us your business name and town, we build your site for free, no commitment.',
    noneSubject: 'Build my site',
    noneBody: 'Hello Antoine, could you build a website for my business? Name: … Town: … Trade: …',
    reply: 'Reply within 24 h, from Antoine.',
  },
  checker: {
    eyebrow: 'Free analysis',
    title: 'What does AI say about your business?',
    sub: 'More and more customers ask ChatGPT, Perplexity or Gemini for "a good tradesperson near me". We ask ChatGPT, Claude, Gemini and Perplexity for you: result in 20 seconds, free, no commitment.',
    cta: 'Start the free analysis',
    note: '20 seconds · free · email confirmed by code',
  },
  footer: {
    tagline: 'AI visibility and websites for small businesses, in Switzerland and beyond.',
    legal: 'Legal notice',
    privacy: 'Privacy',
    rights: `© 2026 ${CONTACT.company}, ${CONTACT.city}, Switzerland`,
  },
}

export const siteCopy: Record<Lang, typeof fr> = { fr, de, en }
