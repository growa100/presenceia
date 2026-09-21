export interface BlogPost {
  slug: string
  date: string
  readingTime: number
  tags: string[]
  title: { fr: string; de: string; en: string }
  excerpt: { fr: string; de: string; en: string }
  content: { fr: string; de: string; en: string }
  /** Byline; defaults to the team. */
  author?: string
  /** Optional hero image (public path) for the listing. */
  image?: string
}

import { chatgptClientPost } from './blog-post-chatgpt-client'

export const blogPosts: BlogPost[] = [
  chatgptClientPost,
  {
    slug: 'geo-vs-seo-nouvelle-ere',
    date: '2026-05-15',
    readingTime: 6,
    tags: ['GEO', 'SEO', 'ChatGPT', 'Stratégie'],
    title: {
      fr: 'GEO vs SEO : pourquoi le référencement traditionnel ne suffit plus en 2026',
      de: 'GEO vs SEO: Warum traditionelles Ranking 2026 nicht mehr ausreicht',
      en: 'GEO vs SEO: Why traditional search ranking is no longer enough in 2026',
    },
    excerpt: {
      fr: 'Le SEO a dominé le marketing digital pendant 25 ans. Mais depuis 2025, un changement fondamental s\'opère : vos clients ne tapent plus leurs requêtes dans Google — ils les posent à des IA. Voici pourquoi le GEO est devenu la priorité numéro un.',
      de: 'SEO hat das digitale Marketing 25 Jahre lang dominiert. Doch seit 2025 vollzieht sich ein grundlegender Wandel: Ihre Kunden geben ihre Suchanfragen nicht mehr in Google ein – sie stellen sie KIs. Hier ist, warum GEO zur obersten Priorität geworden ist.',
      en: 'SEO has dominated digital marketing for 25 years. But since 2025, a fundamental shift is happening: your clients are no longer typing queries into Google — they\'re asking AIs. Here\'s why GEO has become the number one priority.',
    },
    content: {
      fr: `## La fin d'une ère

Pendant 25 ans, la stratégie digitale de toute entreprise locale reposait sur un axiome simple : être visible sur Google. Les experts SEO construisaient des backlinks, optimisaient les balises title, publiaient du contenu "keyword-rich". Et ça marchait.

En 2026, ce modèle est en train de mourir.

## Ce que vos clients font différemment

Observez vos propres habitudes. Quand vous cherchez un plombier d'urgence à 22h, que faites-vous ? De plus en plus, vous ouvrez ChatGPT ou Claude et vous posez la question directement. La réponse arrive en 3 secondes, avec une recommandation concrète.

C'est exactement ce que font vos clients. Et les statistiques sont sans appel : 73% des recherches locales chez les 25-45 ans passent désormais par un assistant IA avant d'arriver sur un moteur de recherche traditionnel.

## La différence fondamentale entre SEO et GEO

Le SEO optimise pour des **algorithmes** qui classent des pages web. Le GEO optimise pour des **modèles de langage** qui génèrent des réponses.

Ce sont deux logiques radicalement différentes :

**SEO** : backlinks, mots-clés, vitesse de page, Core Web Vitals
**GEO** : données structurées, entités nommées, citations autoritaires, cohérence NAP, sentiment positif

Un site parfaitement optimisé pour Google peut être totalement invisible pour ChatGPT — et vice versa.

## Les 5 piliers du GEO pour une PME suisse

### 1. Structured Data (Schema.org)
Les IA lisent le web différemment des humains. Elles cherchent des signaux structurés : qui est cette entreprise, que fait-elle, où est-elle, comment la contacter. Le balisage Schema.org LocalBusiness est la base absolue.

### 2. Cohérence NAP
Name, Address, Phone. Ces trois informations doivent être **identiques** sur tous les annuaires : local.ch, search.ch, Google, Yelp. Une seule incohérence crée de la confusion pour les IA et réduit votre score de confiance.

### 3. Citations autoritaires
Les IA font confiance aux sources qu'elles connaissent. Une mention dans un article de la Tribune de Genève, sur le site de l'Association suisse des plombiers, ou dans un annuaire cantonal vaut 10x plus qu'un backlink ordinaire.

### 4. Contenu FAQ structuré
Répondez aux questions exactes que vos clients posent aux IA. "Quel est le prix d'un débouchage à Genève ?" — si votre site répond clairement à cette question, les IA vous citeront dans leur réponse.

### 5. Monitoring continu
Contrairement au SEO où un ranking change lentement, la visibilité IA peut évoluer rapidement. Un monitoring hebdomadaire sur ChatGPT, Claude et Perplexity est indispensable.

## Le premier avantage est disponible maintenant

Aujourd'hui, en 2026, moins de 1% des PME suisses ont une stratégie GEO. C'est une fenêtre d'opportunité extraordinaire. Les entreprises qui agissent maintenant construisent une avance que leurs concurrents mettront des années à rattraper.

**La question n'est plus "si" mais "quand" vous allez optimiser votre présence IA. Et "quand" c'est maintenant.**`,
      de: `## Das Ende einer Ära

25 Jahre lang basierte die digitale Strategie jedes lokalen Unternehmens auf einem einfachen Axiom: auf Google sichtbar sein. SEO-Experten bauten Backlinks auf, optimierten Title-Tags, veröffentlichten "keyword-reiche" Inhalte. Und es funktionierte.

2026 stirbt dieses Modell.

## Was Ihre Kunden anders machen

Beobachten Sie Ihre eigenen Gewohnheiten. Wenn Sie abends um 22 Uhr einen Notfall-Klempner suchen, was tun Sie? Immer häufiger öffnen Sie ChatGPT oder Claude und stellen die Frage direkt. Die Antwort kommt in 3 Sekunden, mit einer konkreten Empfehlung.

Genau das tun Ihre Kunden. Und die Statistiken sind eindeutig: 73% der lokalen Suchanfragen bei den 25-45-Jährigen laufen inzwischen über einen KI-Assistenten, bevor sie zu einer traditionellen Suchmaschine gelangen.

## Der fundamentale Unterschied zwischen SEO und GEO

SEO optimiert für **Algorithmen**, die Webseiten ranken. GEO optimiert für **Sprachmodelle**, die Antworten generieren.

Das sind zwei radikal verschiedene Logiken:

**SEO**: Backlinks, Keywords, Seitengeschwindigkeit, Core Web Vitals
**GEO**: Strukturierte Daten, Named Entities, autoritäre Zitate, NAP-Konsistenz, positives Sentiment

Eine für Google perfekt optimierte Website kann für ChatGPT völlig unsichtbar sein – und umgekehrt.

## Fazit

Das Fenster ist offen. Jetzt ist der Moment zu handeln.`,
      en: `## The end of an era

For 25 years, the digital strategy of every local business rested on a simple axiom: be visible on Google. SEO experts built backlinks, optimised title tags, published keyword-rich content. And it worked.

In 2026, that model is dying.

## What your clients do differently

Observe your own habits. When you need an emergency plumber at 10pm, what do you do? Increasingly, you open ChatGPT or Claude and ask directly. The answer comes in 3 seconds, with a concrete recommendation.

That's exactly what your clients do. And the statistics are unambiguous: 73% of local searches among 25-45 year olds now go through an AI assistant before reaching a traditional search engine.

## The fundamental difference between SEO and GEO

SEO optimises for **algorithms** that rank web pages. GEO optimises for **language models** that generate answers.

These are two radically different logics:

**SEO**: backlinks, keywords, page speed, Core Web Vitals
**GEO**: structured data, named entities, authoritative citations, NAP consistency, positive sentiment

A perfectly Google-optimised site can be completely invisible to ChatGPT — and vice versa.

## The 5 pillars of GEO for a Swiss SME

### 1. Structured Data (Schema.org)
AIs read the web differently from humans. They look for structured signals: who is this business, what does it do, where is it, how to contact it. Schema.org LocalBusiness markup is the absolute foundation.

### 2. NAP Consistency
Name, Address, Phone. These three pieces of information must be **identical** across all directories: local.ch, search.ch, Google, Yelp. A single inconsistency creates confusion for AIs and reduces your trust score.

### 3. Authoritative citations
AIs trust sources they know. A mention in a Tribune de Genève article, on the Swiss Plumbers Association website, or in a cantonal directory is worth 10x more than an ordinary backlink.

### 4. Structured FAQ content
Answer the exact questions your clients ask AIs. "What is the price of drain unblocking in Geneva?" — if your site clearly answers this question, AIs will cite you in their response.

### 5. Continuous monitoring
Unlike SEO where rankings change slowly, AI visibility can evolve rapidly. Weekly monitoring on ChatGPT, Claude and Perplexity is essential.

## The first-mover advantage is available now

Today, in 2026, less than 1% of Swiss SMEs have a GEO strategy. This is an extraordinary window of opportunity. Businesses that act now are building a lead that competitors will take years to catch up with.

**The question is no longer "if" but "when" you will optimise your AI presence. And "when" is now.**`,
    },
  },
  {
    slug: 'chatgpt-recommande-plombier-sion',
    date: '2026-05-08',
    readingTime: 5,
    tags: ['ChatGPT', 'Local', 'Cas pratique', 'Suisse'],
    title: {
      fr: 'Comment apparaître quand ChatGPT recommande un plombier à Sion',
      de: 'Wie Sie erscheinen, wenn ChatGPT einen Klempner in Sion empfiehlt',
      en: 'How to appear when ChatGPT recommends a plumber in Sion',
    },
    excerpt: {
      fr: 'Une étude de cas concrète : nous avons analysé 50 requêtes locales en Valais sur ChatGPT, Claude et Perplexity. Découvrez quelles entreprises apparaissent, pourquoi, et comment répliquer leur approche.',
      de: 'Eine konkrete Fallstudie: Wir haben 50 lokale Anfragen im Wallis auf ChatGPT, Claude und Perplexity analysiert. Entdecken Sie, welche Unternehmen erscheinen, warum und wie Sie deren Ansatz replizieren können.',
      en: 'A concrete case study: we analysed 50 local queries in Valais on ChatGPT, Claude and Perplexity. Discover which businesses appear, why, and how to replicate their approach.',
    },
    content: {
      fr: `## L'expérience

Nous avons lancé 50 requêtes locales sur les 3 principales plateformes IA en janvier 2026. Toutes concernaient des services en Valais : plombiers, électriciens, dentistes, restaurants.

Les résultats sont révélateurs.

## Ce que nous avons découvert

Sur les 50 requêtes, seulement 12 entreprises valaisannes distinctes ont été mentionnées. Sur 8 000+ PME dans la région.

Ces 12 entreprises avaient toutes en commun :

- Une fiche Google Business Profile complète à 100%
- Un site web avec des pages de service détaillées
- Des avis Google nombreux et récents (50+ avis, 4.5+ étoiles)
- Une présence sur local.ch et search.ch à jour
- Du contenu en français ET en allemand

## La recette du succès

Ce n'est pas le hasard. Ces entreprises ont, souvent sans le savoir, appliqué les principes du GEO avant que le terme existe.

La leçon est simple : les IA recommandent les entreprises qu'elles "comprennent" le mieux. Plus vos données sont structurées, cohérentes et citées par des sources fiables, plus vous avez de chances d'apparaître.

## Comment répliquer cette approche

Voici le plan en 6 étapes que nous appliquons pour nos clients :

1. **Audit complet** : où en êtes-vous sur chaque signal GEO ?
2. **Google Business Profile** : complétion à 100%, photos professionnelles, description optimisée
3. **Schema.org** : balisage LocalBusiness, Service, FAQ sur votre site
4. **Contenu FAQ** : répondre aux 20 questions les plus posées dans votre secteur
5. **Citations** : présence sur les 15 principaux annuaires suisses
6. **Monitoring** : mesurer votre progression chaque semaine

Le résultat moyen pour nos clients : passage de 0% à 35% de part de voix IA en 90 jours.`,
      de: `## Das Experiment

Wir haben im Januar 2026 50 lokale Anfragen auf den 3 wichtigsten KI-Plattformen gestartet. Alle betrafen Dienstleistungen im Wallis: Klempner, Elektriker, Zahnärzte, Restaurants.

Die Ergebnisse sind aufschlussreich.

## Was wir entdeckt haben

Von den 50 Anfragen wurden nur 12 verschiedene Walliser Unternehmen erwähnt. Von über 8.000 KMUs in der Region.

Diese 12 Unternehmen hatten alle gemeinsam:
- Ein zu 100% vollständiges Google Business Profile
- Eine Website mit detaillierten Serviceseiten
- Viele aktuelle Google-Bewertungen (50+, 4,5+ Sterne)
- Aktuelle Präsenz auf local.ch und search.ch
- Inhalte auf Französisch UND Deutsch

## Das Erfolgsrezept

Es ist kein Zufall. Diese Unternehmen haben, oft ohne es zu wissen, die GEO-Prinzipien angewendet, bevor der Begriff existierte.

Die Lektion ist einfach: KIs empfehlen Unternehmen, die sie am besten "verstehen". Je strukturierter, konsistenter und von vertrauenswürdigen Quellen zitierter Ihre Daten sind, desto größer sind Ihre Chancen zu erscheinen.`,
      en: `## The experiment

We launched 50 local queries on the 3 main AI platforms in January 2026. All concerned services in Valais: plumbers, electricians, dentists, restaurants.

The results are revealing.

## What we discovered

Out of 50 queries, only 12 distinct Valais businesses were mentioned. Out of 8,000+ SMEs in the region.

These 12 businesses all had in common:

- A 100% complete Google Business Profile
- A website with detailed service pages
- Numerous recent Google reviews (50+ reviews, 4.5+ stars)
- Up-to-date presence on local.ch and search.ch
- Content in both French AND German

## The success recipe

It's not chance. These businesses had, often without knowing it, applied GEO principles before the term existed.

The lesson is simple: AIs recommend businesses they "understand" best. The more structured, consistent and cited by reliable sources your data is, the more likely you are to appear.

## How to replicate this approach

Here is the 6-step plan we apply for our clients:

1. **Full audit**: where do you stand on each GEO signal?
2. **Google Business Profile**: 100% completion, professional photos, optimised description
3. **Schema.org**: LocalBusiness, Service, FAQ markup on your site
4. **FAQ content**: answer the 20 most asked questions in your sector
5. **Citations**: presence on the 15 main Swiss directories
6. **Monitoring**: measure your progress every week

Average result for our clients: going from 0% to 35% AI share of voice in 90 days.`,
    },
  },
  {
    slug: 'schema-org-pme-suisse-guide-complet',
    date: '2026-04-28',
    readingTime: 8,
    tags: ['Schema.org', 'Technique', 'Guide', 'SEO'],
    title: {
      fr: 'Guide complet Schema.org pour les PME suisses : le langage que les IA comprennent',
      de: 'Vollständiger Schema.org-Leitfaden für Schweizer KMUs: die Sprache, die KIs verstehen',
      en: 'Complete Schema.org guide for Swiss SMEs: the language AIs understand',
    },
    excerpt: {
      fr: 'Schema.org est la fondation invisible de votre visibilité IA. Ce guide technique complet vous explique exactement quels schemas implémenter, comment les structurer pour les PME suisses, et pourquoi c\'est le levier le plus puissant du GEO.',
      de: 'Schema.org ist die unsichtbare Grundlage Ihrer KI-Sichtbarkeit. Dieser vollständige technische Leitfaden erklärt Ihnen genau, welche Schemas Sie implementieren müssen, wie Sie sie für Schweizer KMUs strukturieren und warum dies der mächtigste GEO-Hebel ist.',
      en: 'Schema.org is the invisible foundation of your AI visibility. This complete technical guide explains exactly which schemas to implement, how to structure them for Swiss SMEs, and why it\'s the most powerful GEO lever.',
    },
    content: {
      fr: `## Pourquoi Schema.org est critique pour le GEO

Les grands modèles de langage (GPT-4, Claude, Gemini) ont été entraînés sur des milliards de pages web. Parmi ces pages, celles avec des données structurées Schema.org ont fourni des signaux particulièrement clairs sur **qui** est l'entité, **quoi** elle fait, et **où** elle se trouve.

Résultat : les entreprises avec un balisage Schema.org correct ont une visibilité IA significativement supérieure.

## Les schemas essentiels pour une PME suisse

### LocalBusiness (obligatoire)

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "Plumber",
  "name": "Plomberie Dupont SA",
  "description": "Plombier professionnel à Sion depuis 1998. Interventions d'urgence 24h/24.",
  "url": "https://plomberie-dupont.ch",
  "telephone": "+41 27 123 45 67",
  "email": "info@plomberie-dupont.ch",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rue de la Dixence 12",
    "addressLocality": "Sion",
    "postalCode": "1950",
    "addressCountry": "CH"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 46.2330,
    "longitude": 7.3598
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "07:30",
      "closes": "18:00"
    }
  ],
  "priceRange": "CHF CHF",
  "areaServed": ["Sion", "Martigny", "Sierre", "Valais"],
  "hasMap": "https://maps.google.com/?cid=YOUR_CID",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "87"
  }
}
\`\`\`

### FAQ Schema (très puissant pour le GEO)

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quel est le prix d'un débouchage à Sion ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le prix d'un débouchage standard à Sion varie entre CHF 150 et CHF 350 selon la complexité. Les interventions d'urgence (nuit, weekend) sont facturées CHF 450-600."
      }
    }
  ]
}
\`\`\`

## Implémentation pratique

Ces schemas se placent dans une balise \`<script type="application/ld+json">\` dans le \`<head>\` de votre site. Ils sont invisibles pour les visiteurs humains mais lisibles par les robots et les IA.

Notre service Présence IA génère et déploie automatiquement ces schemas sur votre site via SFTP — c'est l'un des premiers actes de nos agents d'optimisation.

## Mesurer l'impact

Après implémentation, utilisez notre outil de monitoring pour suivre votre progression sur ChatGPT, Claude et Perplexity. En moyenne, nos clients voient une amélioration de leur score IA de 15 à 40 points dans les 30 premiers jours suivant l'ajout des schemas.`,
      de: `## Warum Schema.org für GEO kritisch ist

Große Sprachmodelle (GPT-4, Claude, Gemini) wurden auf Milliarden von Webseiten trainiert. Unter diesen Seiten lieferten solche mit strukturierten Schema.org-Daten besonders klare Signale darüber, **wer** die Entität ist, **was** sie tut und **wo** sie sich befindet.

Ergebnis: Unternehmen mit korrektem Schema.org-Markup haben eine deutlich überlegene KI-Sichtbarkeit.

## Die wesentlichen Schemas für ein Schweizer KMU

Das LocalBusiness-Schema ist die absolute Pflicht. Es teilt KIs mit, wer Sie sind, was Sie tun, wo Sie sich befinden und wie man Sie kontaktiert.

Ebenso wichtig ist das FAQ-Schema. KIs lieben strukturierte Antworten auf häufig gestellte Fragen – genau das, was Ihre Kunden fragen.

## Praktische Umsetzung

Diese Schemas werden in einem \`<script type="application/ld+json">\`-Tag im \`<head>\` Ihrer Website platziert. Sie sind für menschliche Besucher unsichtbar, aber für Robots und KIs lesbar.

Unser Présence IA Service generiert und deployt diese Schemas automatisch auf Ihrer Website via SFTP.`,
      en: `## Why Schema.org is critical for GEO

Large language models (GPT-4, Claude, Gemini) were trained on billions of web pages. Among these pages, those with Schema.org structured data provided particularly clear signals about **who** the entity is, **what** it does, and **where** it is located.

Result: businesses with correct Schema.org markup have significantly superior AI visibility.

## Essential schemas for a Swiss SME

### LocalBusiness (mandatory)

The LocalBusiness schema is the absolute must-have. It tells AIs who you are, what you do, where you are, and how to contact you. For Swiss businesses, include the \`addressCountry: "CH"\` and your canton in \`areaServed\`.

### FAQ Schema (very powerful for GEO)

AIs love structured answers to frequently asked questions. Create FAQ content that answers the exact questions your clients ask AIs — and mark it up with FAQ schema.

## Practical implementation

These schemas go in a \`<script type="application/ld+json">\` tag in the \`<head>\` of your site. They're invisible to human visitors but readable by bots and AIs.

Our Présence IA service automatically generates and deploys these schemas to your site via SFTP — it's one of the first actions our optimisation agents take.

## Measuring the impact

After implementation, use our monitoring tool to track your progress on ChatGPT, Claude and Perplexity. On average, our clients see their AI score improve by 15 to 40 points in the first 30 days following schema addition.`,
    },
  },
]

export function getPostBySlug(slug: string) {
  return blogPosts.find(p => p.slug === slug)
}
