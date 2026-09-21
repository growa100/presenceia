import type { BlogPost } from './blog-data'

/**
 * Case study: a client found 41 Advisory (Antoine's other company) through
 * ChatGPT, with no content, no ads, a few months after launch. The prospect's
 * first name is changed; the ChatGPT answer is reproduced from his screenshot
 * with the other advisors anonymised.
 */
export const chatgptClientPost: BlogPost = {
  slug: 'un-client-trouve-via-chatgpt',
  date: '2026-09-21',
  readingTime: 5,
  tags: ['Cas réel', 'ChatGPT', 'Visibilité IA'],
  image: '/blog/chatgpt-recommandation.svg',
  author: 'Antoine Pury',
  title: {
    fr: '« Comment avez-vous eu mon email ? » « J\'ai cherché sur ChatGPT. »',
    de: '«Wie sind Sie an meine E-Mail gekommen?» «Ich habe ChatGPT gefragt.»',
    en: '"How did you get my email?" "I asked ChatGPT."',
  },
  excerpt: {
    fr: 'Un jeudi soir, un inconnu m\'écrit pour un avis sur un placement. Je n\'ai jamais démarché cette personne. Je n\'ai encore rien publié. ChatGPT m\'a recommandé. Voici la requête exacte, la réponse, et ce que ça change pour n\'importe quelle entreprise.',
    de: 'An einem Donnerstagabend schreibt mir ein Unbekannter wegen einer Anlagefrage. Ich habe diese Person nie kontaktiert. Ich habe noch nichts veröffentlicht. ChatGPT hat mich empfohlen. Hier die genaue Anfrage, die Antwort, und was das für jedes Unternehmen bedeutet.',
    en: 'On a Thursday evening, a stranger writes to me for advice on an investment. I never contacted this person. I have not published anything yet. ChatGPT recommended me. Here is the exact query, the answer, and what it changes for any business.',
  },
  content: {
    fr: `## Jeudi, 21h42

Un email arrive sur la boîte de 41 Advisory, mon cabinet de conseil en investissement. Trois lignes, polies, directes : un particulier hésite à investir dans une cryptomonnaie et voudrait mon avis.

Je ne connais pas cette personne. Je ne l'ai jamais démarchée. 41 Advisory existe depuis quelques mois, je n'ai publié aucun article, aucune publicité, aucun post. Il y a un site qui explique ce que je fais, pour qui, où, et comment je suis payé. C'est tout.

Alors avant de répondre sur le fond, je pose la question que je pose à tout nouveau contact.

![Échange d'emails : « comment avez-vous obtenu mon email ? » « J'ai cherché via ChatGPT. »](/blog/comment-avez-vous-eu-mon-email.svg)

## La requête exacte

Julien (prénom modifié) m'a envoyé ses captures d'écran. Voici ce qu'il a demandé à ChatGPT, mot pour mot :

> Trouve-moi un conseiller en investissement qui fait autant de l'hypothèque que de la crypto que l'investissement en bourse que de l'immobilier.

Pas de nom d'entreprise. Pas de ville. Une question comme on la poserait à un ami qui s'y connaît. ChatGPT a cherché, comparé quelques profils, et a répondu avec une liste courte. J'y étais.

![La réponse de ChatGPT, avec 41 Advisory recommandé](/blog/chatgpt-recommandation.svg)

Ce qui m'a frappé, c'est la précision. ChatGPT n'a pas inventé : il a lu mon site et l'a résumé. « Conseiller indépendant fee-only, payé par le client, sans rétrocessions. » « Pertinent pour actions, ETF et crypto. » Il a même ajouté une réserve honnête : pas le premier choix si l'hypothèque est la priorité. C'est exactement ce que dit mon site. L'IA a fait de moi ce que j'avais écrit de moi.

## Ce qui a rendu ça possible

Rien de sophistiqué. En regardant après coup, quatre choses :

- **Un site qui dit clairement ce que je fais**, pour qui, et comment je suis rémunéré. Une phrase, pas un slogan.
- **Une entreprise identifiable** : un nom, une raison sociale, une ville. Une IA recommande une entité, pas une ambiance.
- **Une fiche cohérente** dans un annuaire suisse, avec le même nom et la même description que sur le site.
- **Des données structurées** dans les pages, le balisage que les machines lisent avant le texte.

Zéro contenu. Zéro publicité. Un site lisible par une IA, et une personne qui a posé sa question à une IA plutôt qu'à Google.

## Ce que ça veut dire pour un garage, un plombier, une fiduciaire

Remplacez ma question par la vôtre. « Un bon carrossier à Sion. » « Un électricien qui fait les bornes de recharge à Lausanne. » « Une fiduciaire pour une petite Sàrl à Fribourg. » Ces questions sont posées à ChatGPT, Perplexity et Gemini aujourd'hui, par des gens qui ont une carte de crédit et un problème à régler.

L'IA répond avec les entreprises qu'elle arrive à lire et à comprendre. Si votre site n'existe pas, ou s'il ne dit rien de précis, vous n'êtes pas dans la réponse. Pas par malveillance : par absence de matière.

Ce n'est pas une prédiction sur le futur du marketing. C'est un email que j'ai reçu un jeudi soir.

## Ce que nous en avons fait

C'est la raison d'être de Présence IA. Nous construisons des sites que les IA lisent aussi bien que les humains : contenu clair, entité identifiable, données structurées, fiches cohérentes. Pour les entreprises que nous contactons, le site est prêt avant même le premier email.

Si vous voulez savoir où vous en êtes, l'analyse gratuite en page d'accueil interroge ChatGPT avec les questions que vos clients posent réellement. Trente secondes, et vous saurez si vous faites partie de la réponse.

*Prénom du client modifié. Réponse de ChatGPT reproduite d'après sa capture d'écran ; les autres cabinets cités sont anonymisés.*`,

    de: `## Donnerstag, 21:42

Eine E-Mail trifft im Postfach von 41 Advisory ein, meiner Beratungsfirma für Anlagen. Drei Zeilen, höflich, direkt: Eine Privatperson überlegt, in eine Kryptowährung zu investieren, und möchte meine Meinung.

Ich kenne diese Person nicht. Ich habe sie nie kontaktiert. 41 Advisory gibt es seit ein paar Monaten, ich habe keinen Artikel veröffentlicht, keine Werbung, keinen Post. Es gibt eine Website, die erklärt, was ich tue, für wen, wo, und wie ich bezahlt werde. Das ist alles.

Bevor ich inhaltlich antworte, stelle ich die Frage, die ich jedem neuen Kontakt stelle.

![E-Mail-Austausch: «Wie sind Sie an meine E-Mail gekommen?» «Ich habe ChatGPT gefragt.»](/blog/comment-avez-vous-eu-mon-email.svg)

## Die genaue Anfrage

Julien (Name geändert) hat mir seine Screenshots geschickt. Das hat er ChatGPT gefragt, wörtlich (auf Französisch):

> Finde mir einen Anlageberater, der gleichermassen Hypotheken, Krypto, Börse und Immobilien macht.

Kein Firmenname. Keine Stadt. Eine Frage, wie man sie einem Freund stellen würde, der sich auskennt. ChatGPT hat gesucht, ein paar Profile verglichen und mit einer kurzen Liste geantwortet. Ich war darauf.

![Die Antwort von ChatGPT, mit 41 Advisory als Empfehlung](/blog/chatgpt-recommandation.svg)

Was mich beeindruckt hat, ist die Genauigkeit. ChatGPT hat nichts erfunden: Es hat meine Website gelesen und zusammengefasst. «Unabhängiger Fee-only-Berater, vom Kunden bezahlt, ohne Retrozessionen.» «Relevant für Aktien, ETF und Krypto.» Es hat sogar einen ehrlichen Vorbehalt hinzugefügt: nicht die erste Wahl, wenn die Hypothek Priorität hat. Genau das steht auf meiner Website. Die KI hat aus mir gemacht, was ich über mich geschrieben hatte.

## Was das möglich gemacht hat

Nichts Ausgeklügeltes. Im Nachhinein vier Dinge:

- **Eine Website, die klar sagt, was ich tue**, für wen, und wie ich bezahlt werde. Ein Satz, kein Slogan.
- **Ein identifizierbares Unternehmen**: ein Name, eine Firma, eine Stadt. Eine KI empfiehlt eine Entität, keine Stimmung.
- **Ein konsistenter Eintrag** in einem Schweizer Verzeichnis, mit demselben Namen und derselben Beschreibung wie auf der Website.
- **Strukturierte Daten** in den Seiten, das Markup, das Maschinen vor dem Text lesen.

Null Inhalte. Null Werbung. Eine Website, die eine KI lesen kann, und eine Person, die ihre Frage einer KI statt Google gestellt hat.

## Was das für eine Garage, einen Sanitär, ein Treuhandbüro bedeutet

Ersetzen Sie meine Frage durch Ihre. «Eine gute Carrosserie in Sitten.» «Ein Elektriker für Ladestationen in Lausanne.» «Ein Treuhandbüro für eine kleine GmbH in Freiburg.» Diese Fragen werden heute ChatGPT, Perplexity und Gemini gestellt, von Leuten mit einer Kreditkarte und einem Problem, das gelöst werden muss.

Die KI antwortet mit den Unternehmen, die sie lesen und verstehen kann. Wenn Ihre Website nicht existiert oder nichts Konkretes sagt, sind Sie nicht in der Antwort. Nicht aus Böswilligkeit: aus Mangel an Substanz.

Das ist keine Prognose über die Zukunft des Marketings. Das ist eine E-Mail, die ich an einem Donnerstagabend erhalten habe.

## Was wir daraus gemacht haben

Das ist der Grund für Présence IA. Wir bauen Websites, die KIs genauso gut lesen wie Menschen: klare Inhalte, identifizierbare Entität, strukturierte Daten, konsistente Einträge. Für die Unternehmen, die wir kontaktieren, ist die Website fertig, bevor die erste E-Mail rausgeht.

Wenn Sie wissen wollen, wo Sie stehen: Die kostenlose Analyse auf der Startseite fragt ChatGPT mit den Fragen, die Ihre Kunden wirklich stellen. Dreissig Sekunden, und Sie wissen, ob Sie Teil der Antwort sind.

*Name des Kunden geändert. Antwort von ChatGPT nach seinem Screenshot wiedergegeben; die anderen genannten Firmen sind anonymisiert.*`,

    en: `## Thursday, 9:42 pm

An email lands in the inbox of 41 Advisory, my investment advisory firm. Three lines, polite, direct: a private individual is hesitating about a cryptocurrency and would like my opinion.

I don't know this person. I never contacted them. 41 Advisory has existed for a few months; I have published no article, no ad, no post. There is a website that explains what I do, for whom, where, and how I am paid. That's all.

So before answering on substance, I ask the question I ask every new contact.

![Email exchange: "how did you get my email?" "I asked ChatGPT."](/blog/comment-avez-vous-eu-mon-email.svg)

## The exact query

Julien (name changed) sent me his screenshots. This is what he asked ChatGPT, word for word (in French):

> Find me an investment advisor who does mortgages as much as crypto, stock market investing and real estate.

No company name. No city. A question the way you'd ask a friend who knows the field. ChatGPT searched, compared a few profiles, and answered with a short list. I was on it.

![ChatGPT's answer, recommending 41 Advisory](/blog/chatgpt-recommandation.svg)

What struck me was the precision. ChatGPT didn't make anything up: it read my website and summarised it. "Independent fee-only advisor, paid by the client, no retrocessions." "Relevant for stocks, ETFs and crypto." It even added an honest caveat: not the first choice if the mortgage is the priority. That is exactly what my website says. The AI made of me what I had written about myself.

## What made it possible

Nothing sophisticated. Looking back, four things:

- **A website that says clearly what I do**, for whom, and how I am paid. One sentence, not a slogan.
- **An identifiable business**: a name, a legal entity, a city. An AI recommends an entity, not a vibe.
- **A consistent listing** in a Swiss directory, with the same name and description as on the website.
- **Structured data** in the pages, the markup machines read before the text.

Zero content. Zero advertising. A website an AI can read, and a person who asked their question to an AI instead of Google.

## What it means for a garage, a plumber, an accounting firm

Replace my question with yours. "A good body shop in Sion." "An electrician who installs EV chargers in Lausanne." "An accountant for a small company in Fribourg." These questions are being asked to ChatGPT, Perplexity and Gemini today, by people with a credit card and a problem to solve.

The AI answers with the businesses it can read and understand. If your website doesn't exist, or says nothing specific, you are not in the answer. Not out of malice: for lack of material.

This is not a prediction about the future of marketing. It is an email I received on a Thursday evening.

## What we did with it

This is why Présence IA exists. We build websites that AIs read as well as humans do: clear content, identifiable entity, structured data, consistent listings. For the businesses we contact, the website is ready before the first email goes out.

If you want to know where you stand, the free analysis on the homepage asks ChatGPT the questions your customers actually ask. Thirty seconds, and you'll know whether you are part of the answer.

*Client's name changed. ChatGPT's answer reproduced from his screenshot; the other firms mentioned are anonymised.*`,
  },
}
