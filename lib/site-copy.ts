/**
 * Homepage copy — conversion page for the businesses we contact by email.
 *
 * The cold email says "Antoine, presenceia.com" and links the prospect to
 * the site we built for them. When they look us up, this page has one job:
 * confirm that we are real, Swiss, and that saying "oui" is simple and
 * risk-free. Prices here MUST stay aligned with the outreach sequence
 * (site CHF 99, + visibilité IA CHF 149, tout compris CHF 229).
 */
import type { Lang } from './i18n'

export const CONTACT = {
  email: 'antoine@presenceia.com',
  phone: '+41 78 915 15 73',
  phoneHref: 'tel:+41789151573',
  company: '41 Labs GmbH',
  city: 'Zug',
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
  nav: { analysis: 'Analyse gratuite', examples: 'Exemples', how: 'Comment ça marche', pricing: 'Tarifs', faq: 'Questions', blog: 'Blog', login: 'Espace client', cta: 'Activer mon site' },
  hero: {
    eyebrow: 'Sites web pour artisans, commerces et PME',
    h1a: 'Votre site web professionnel,',
    h1b: 'déjà prêt.',
    sub: 'Nous préparons votre site avant même de vous écrire. Vous le regardez, vous dites oui, il est en ligne cette semaine sur votre nom de domaine. CHF 99 par mois, tout compris, sans engagement.',
    cta1: 'Activer mon site',
    cta2: 'Voir des exemples',
    received: 'Vous avez reçu un email d\'Antoine ?',
    receivedLink: 'Voici la suite, en 3 étapes',
  },
  trust: ['Entreprise suisse, 41 Labs GmbH, Zug', 'Hébergement en Suisse', 'Données protégées (nLPD / RGPD)', 'Sans engagement, résiliable en tout temps', 'Réponse sous 24 h'],
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
    title: 'Un prix simple, sans frais d\'installation.',
    sub: 'Mensuel, sans engagement, résiliable en tout temps. Prix en francs suisses, facturation en euros ou en dollars selon votre pays.',
    mo: '/ mois',
    popular: 'Le plus choisi',
    plans: [
      { name: 'Site web', price: 99, desc: 'L\'essentiel, bien fait.', features: ['Site professionnel complet', 'Nom de domaine inclus', 'Hébergement suisse + SSL', 'Modifications illimitées', 'Référencement local', 'En ligne cette semaine'], cta: 'Activer mon site' },
      { name: 'Site + Visibilité IA', price: 149, popular: true, desc: 'Pour être recommandé par ChatGPT et Google.', features: ['Tout le pack Site web, plus :', 'Structure lisible par les IA (ChatGPT, Perplexity, Gemini)', 'Fiche Google Business optimisée', 'Inscription aux annuaires locaux', 'Rapport mensuel de visibilité IA'], cta: 'Choisir cette offre' },
      { name: 'Tout compris', price: 229, desc: 'Site, visibilité IA et assistant téléphonique.', features: ['Tout le pack Site + Visibilité IA, plus :', 'Assistant qui répond quand vous êtes occupé', 'Résumé WhatsApp de chaque appel', 'Prise de rendez-vous et rappels', 'Numéro dédié inclus'], cta: 'Nous contacter' },
    ],
    enterprise: 'Entreprise établie avec un site existant ? Programme de visibilité IA sur mesure dès CHF 299 / mois.',
    enterpriseCta: 'Parlons-en',
  },
  founder: {
    eyebrow: 'Qui est derrière',
    name: 'Antoine Pury',
    role: 'Fondateur, 41 Labs GmbH, Zug',
    text: 'J\'ai lancé Présence IA parce que trop d\'artisans excellents ont un site qui ne leur ressemble pas, ou pas de site du tout, et que ce n\'est pas leur métier de s\'en occuper. Nous faisons le travail d\'abord, vous décidez ensuite. Je lis et je réponds moi-même à chaque email.',
  },
  faq: {
    eyebrow: 'Questions fréquentes',
    title: 'Ce qu\'on nous demande le plus souvent.',
    items: [
      { q: 'Pourquoi avez-vous préparé un site pour mon entreprise sans me le demander ?', a: 'C\'est notre façon de nous présenter : plutôt qu\'un argumentaire, nous vous montrons le résultat. Le site est construit uniquement à partir d\'informations déjà publiques (fiche Google, annuaires professionnels). Si vous n\'en voulez pas, il est retiré, sans frais et sans relance.' },
      { q: 'Que se passe-t-il si je dis oui ?', a: 'Nous vous répondons sous 24 h. Nous choisissons ensemble le nom de domaine, vous nous envoyez votre logo, vos photos et vos corrections, et le site est en ligne sous 3 à 5 jours ouvrés. Vous ne touchez à rien de technique.' },
      { q: 'Le nom de domaine m\'appartient-il ?', a: 'Oui. Il est enregistré au nom de votre entreprise. Si un jour vous partez, vous le gardez.' },
      { q: 'Puis-je modifier le contenu ?', a: 'Autant que vous voulez, c\'est compris. Un email avec la modification, et elle est en ligne sous 48 h.' },
      { q: 'Y a-t-il un engagement ou des frais d\'installation ?', a: 'Non. L\'abonnement est mensuel, sans frais d\'installation, et vous pouvez l\'arrêter en tout temps.' },
      { q: 'J\'ai déjà un site. Est-ce utile pour moi ?', a: 'Deux options : nous remplaçons votre site par le nôtre, ou nous travaillons uniquement votre visibilité sur Google et dans les réponses des IA à partir de votre site existant.' },
      { q: 'Travaillez-vous en dehors de la Suisse ?', a: 'Oui. Nous travaillons avec des entreprises en Suisse, en France et à l\'international, en français, en allemand et en anglais, avec le nom de domaine adapté à votre pays (.ch, .fr, .com, .de…).' },
    ],
  },
  activate: {
    eyebrow: 'Activer mon site',
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
    title: 'Votre entreprise apparaît-elle dans les réponses de ChatGPT ?',
    sub: 'De plus en plus de clients demandent à ChatGPT, Perplexity ou Gemini « un bon artisan près de chez moi ». Nous posons la question à ChatGPT, Claude, Gemini et Perplexity pour vous : résultat en 20 secondes, gratuit, sans engagement.',
    cta: 'Lancer l\'analyse gratuite',
    note: '20 secondes · gratuit · email confirmé par code',
  },
  footer: {
    tagline: 'Sites web et visibilité IA pour artisans et PME.',
    legal: 'Mentions légales',
    privacy: 'Confidentialité',
    rights: `© 2026 ${CONTACT.company}, ${CONTACT.city}, Suisse`,
  },
}

const de: typeof fr = {
  nav: { analysis: 'Kostenlose Analyse', examples: 'Beispiele', how: 'So funktioniert es', pricing: 'Preise', faq: 'Fragen', blog: 'Blog', login: 'Kundenbereich', cta: 'Website aktivieren' },
  hero: {
    eyebrow: 'Websites für Handwerker, Geschäfte und KMU',
    h1a: 'Ihre professionelle Website,',
    h1b: 'schon fertig.',
    sub: 'Wir bauen Ihre Website, bevor wir Ihnen schreiben. Sie schauen sie an, sagen Ja, und sie ist diese Woche unter Ihrer Domain online. CHF 99 pro Monat, alles inklusive, ohne Vertragsbindung.',
    cta1: 'Website aktivieren',
    cta2: 'Beispiele ansehen',
    received: 'Haben Sie eine E-Mail von Antoine erhalten?',
    receivedLink: 'So geht es weiter, in 3 Schritten',
  },
  trust: ['Schweizer Firma, 41 Labs GmbH, Zug', 'Hosting in der Schweiz', 'Datenschutz (DSG / DSGVO)', 'Ohne Vertragsbindung, jederzeit kündbar', 'Antwort innert 24 h'],
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
    title: 'Ein einfacher Preis, keine Einrichtungsgebühr.',
    sub: 'Monatlich, ohne Vertragsbindung, jederzeit kündbar. Preise in Schweizer Franken, Rechnung in Euro oder Dollar je nach Land.',
    mo: '/ Monat',
    popular: 'Am häufigsten gewählt',
    plans: [
      { name: 'Website', price: 99, desc: 'Das Wesentliche, gut gemacht.', features: ['Komplette professionelle Website', 'Domain inklusive', 'Schweizer Hosting + SSL', 'Unbegrenzte Änderungen', 'Lokale Suchmaschinenoptimierung', 'Diese Woche online'], cta: 'Website aktivieren' },
      { name: 'Website + KI-Sichtbarkeit', price: 149, popular: true, desc: 'Um von ChatGPT und Google empfohlen zu werden.', features: ['Alles aus Website, plus:', 'Für KI lesbare Struktur (ChatGPT, Perplexity, Gemini)', 'Optimiertes Google Business Profil', 'Eintrag in lokale Verzeichnisse', 'Monatlicher KI-Sichtbarkeitsbericht'], cta: 'Dieses Angebot wählen' },
      { name: 'Alles inklusive', price: 229, desc: 'Website, KI-Sichtbarkeit und Telefonassistent.', features: ['Alles aus Website + KI-Sichtbarkeit, plus:', 'Assistent, der abnimmt, wenn Sie beschäftigt sind', 'WhatsApp-Zusammenfassung jedes Anrufs', 'Terminvereinbarung und Rückrufe', 'Eigene Nummer inklusive'], cta: 'Kontakt aufnehmen' },
    ],
    enterprise: 'Etabliertes Unternehmen mit bestehender Website? Massgeschneidertes KI-Sichtbarkeitsprogramm ab CHF 299 / Monat.',
    enterpriseCta: 'Sprechen wir darüber',
  },
  founder: {
    eyebrow: 'Wer dahinter steht',
    name: 'Antoine Pury',
    role: 'Gründer, 41 Labs GmbH, Zug',
    text: 'Ich habe Présence IA gegründet, weil zu viele ausgezeichnete Handwerker eine Website haben, die ihnen nicht gerecht wird, oder gar keine, und weil es nicht ihr Beruf ist, sich darum zu kümmern. Wir machen zuerst die Arbeit, Sie entscheiden danach. Jede E-Mail lese und beantworte ich selbst.',
  },
  faq: {
    eyebrow: 'Häufige Fragen',
    title: 'Was wir am häufigsten gefragt werden.',
    items: [
      { q: 'Warum haben Sie eine Website für meinen Betrieb gebaut, ohne zu fragen?', a: 'So stellen wir uns vor: Statt einer Verkaufspräsentation zeigen wir Ihnen das Ergebnis. Die Website basiert ausschliesslich auf bereits öffentlichen Informationen (Google-Profil, Branchenverzeichnisse). Wenn Sie sie nicht wollen, wird sie entfernt, ohne Kosten und ohne Nachfassen.' },
      { q: 'Was passiert, wenn ich Ja sage?', a: 'Wir antworten innert 24 h. Wir wählen gemeinsam die Domain, Sie schicken uns Logo, Fotos und Korrekturen, und die Website ist in 3 bis 5 Arbeitstagen online. Sie müssen nichts Technisches tun.' },
      { q: 'Gehört mir die Domain?', a: 'Ja. Sie wird auf den Namen Ihres Unternehmens registriert. Falls Sie eines Tages gehen, behalten Sie sie.' },
      { q: 'Kann ich den Inhalt ändern?', a: 'So oft Sie wollen, das ist inklusive. Eine E-Mail mit der Änderung, und sie ist innert 48 h online.' },
      { q: 'Gibt es eine Vertragsbindung oder Einrichtungsgebühren?', a: 'Nein. Das Abo ist monatlich, ohne Einrichtungsgebühr, und Sie können es jederzeit beenden.' },
      { q: 'Ich habe bereits eine Website. Ist das für mich sinnvoll?', a: 'Zwei Möglichkeiten: Wir ersetzen Ihre Website durch unsere, oder wir arbeiten nur an Ihrer Sichtbarkeit bei Google und in den Antworten der KI, ausgehend von Ihrer bestehenden Website.' },
      { q: 'Arbeiten Sie auch ausserhalb der Schweiz?', a: 'Ja. Wir arbeiten mit Unternehmen in der Schweiz, in Deutschland, Österreich, Frankreich und international, auf Deutsch, Französisch und Englisch, mit der passenden Domain für Ihr Land (.ch, .de, .at, .com…).' },
    ],
  },
  activate: {
    eyebrow: 'Website aktivieren',
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
    title: 'Erscheint Ihr Betrieb in den Antworten von ChatGPT?',
    sub: 'Immer mehr Kunden fragen ChatGPT, Perplexity oder Gemini nach „einem guten Handwerker in meiner Nähe“. Wir stellen die Frage für Sie an ChatGPT, Claude, Gemini und Perplexity: Ergebnis in 20 Sekunden, kostenlos, unverbindlich.',
    cta: 'Kostenlose Analyse starten',
    note: '20 Sekunden · kostenlos · E-Mail per Code bestätigt',
  },
  footer: {
    tagline: 'Websites und KI-Sichtbarkeit für Handwerker und KMU.',
    legal: 'Impressum',
    privacy: 'Datenschutz',
    rights: `© 2026 ${CONTACT.company}, ${CONTACT.city}, Schweiz`,
  },
}

const en: typeof fr = {
  nav: { analysis: 'Free analysis', examples: 'Examples', how: 'How it works', pricing: 'Pricing', faq: 'FAQ', blog: 'Blog', login: 'Client area', cta: 'Activate my site' },
  hero: {
    eyebrow: 'Websites for trades, shops and small businesses',
    h1a: 'Your professional website,',
    h1b: 'already built.',
    sub: 'We build your website before we even write to you. You look at it, you say yes, and it is live this week on your own domain. CHF 99 per month, everything included, no commitment.',
    cta1: 'Activate my site',
    cta2: 'See examples',
    received: 'Did you get an email from Antoine?',
    receivedLink: 'Here is what happens next, in 3 steps',
  },
  trust: ['Swiss company, 41 Labs GmbH, Zug', 'Hosted in Switzerland', 'Data protected (nFADP / GDPR)', 'No commitment, cancel anytime', 'Reply within 24 h'],
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
    title: 'One simple price, no setup fee.',
    sub: 'Monthly, no commitment, cancel anytime. Prices in Swiss francs, billed in euros or dollars depending on your country.',
    mo: '/ month',
    popular: 'Most chosen',
    plans: [
      { name: 'Website', price: 99, desc: 'The essentials, done well.', features: ['Complete professional website', 'Domain name included', 'Swiss hosting + SSL', 'Unlimited changes', 'Local search optimisation', 'Live this week'], cta: 'Activate my site' },
      { name: 'Website + AI visibility', price: 149, popular: true, desc: 'To be recommended by ChatGPT and Google.', features: ['Everything in Website, plus:', 'AI-readable structure (ChatGPT, Perplexity, Gemini)', 'Optimised Google Business profile', 'Listing in local directories', 'Monthly AI visibility report'], cta: 'Choose this plan' },
      { name: 'All inclusive', price: 229, desc: 'Website, AI visibility and phone assistant.', features: ['Everything in Website + AI visibility, plus:', 'Assistant that answers when you are busy', 'WhatsApp summary of every call', 'Appointment booking and callbacks', 'Dedicated number included'], cta: 'Contact us' },
    ],
    enterprise: 'Established business with an existing site? Tailored AI visibility programme from CHF 299 / month.',
    enterpriseCta: 'Let\'s talk',
  },
  founder: {
    eyebrow: 'Who is behind it',
    name: 'Antoine Pury',
    role: 'Founder, 41 Labs GmbH, Zug',
    text: 'I started Présence IA because too many excellent tradespeople have a website that does not do them justice, or none at all, and looking after one is not their job. We do the work first, you decide after. I read and answer every email myself.',
  },
  faq: {
    eyebrow: 'Frequently asked',
    title: 'What we get asked most often.',
    items: [
      { q: 'Why did you build a site for my business without asking?', a: 'It is how we introduce ourselves: instead of a sales pitch, we show you the result. The site is built only from information that is already public (Google profile, trade directories). If you do not want it, it is taken down, no charge and no follow-up.' },
      { q: 'What happens if I say yes?', a: 'We reply within 24 h. We choose the domain name together, you send us your logo, photos and corrections, and the site is live within 3 to 5 working days. You touch nothing technical.' },
      { q: 'Do I own the domain name?', a: 'Yes. It is registered in your company\'s name. If you ever leave, you keep it.' },
      { q: 'Can I change the content?', a: 'As much as you like, it is included. One email with the change and it is live within 48 h.' },
      { q: 'Is there a commitment or a setup fee?', a: 'No. The subscription is monthly, with no setup fee, and you can stop it at any time.' },
      { q: 'I already have a website. Is this useful for me?', a: 'Two options: we replace your site with ours, or we work only on your visibility on Google and in AI answers, starting from your existing site.' },
      { q: 'Do you work outside Switzerland?', a: 'Yes. We work with businesses in Switzerland, across Europe and internationally, in English, French and German, with the right domain for your country (.com, .ch, .fr, .co.uk…).' },
    ],
  },
  activate: {
    eyebrow: 'Activate my site',
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
    title: 'Does your business show up in ChatGPT\'s answers?',
    sub: 'More and more customers ask ChatGPT, Perplexity or Gemini for "a good tradesperson near me". We ask ChatGPT, Claude, Gemini and Perplexity for you: result in 20 seconds, free, no commitment.',
    cta: 'Start the free analysis',
    note: '20 seconds · free · email confirmed by code',
  },
  footer: {
    tagline: 'Websites and AI visibility for trades and small businesses.',
    legal: 'Legal notice',
    privacy: 'Privacy',
    rights: `© 2026 ${CONTACT.company}, ${CONTACT.city}, Switzerland`,
  },
}

export const siteCopy: Record<Lang, typeof fr> = { fr, de, en }
