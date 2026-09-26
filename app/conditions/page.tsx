import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Conditions générales',
  description: 'Conditions générales des abonnements Présence IA : durée, paiement, résiliation, garantie 90 jours.',
  robots: { index: false, follow: true },
}

export default function Conditions() {
  return (
    <LegalPage
      title="Conditions générales"
      updated="Dernière mise à jour : 26 septembre 2026"
      sections={[
        { title: '1. Parties', body: [
          'Les présentes conditions régissent les abonnements souscrits auprès d\'Antoine Pury, Présence IA, Av. du Bietschhorn 37, 1950 Sion, Suisse (ci-après « Présence IA »), par une entreprise ou un indépendant (ci-après « le client »). Les offres de Présence IA sont réservées aux professionnels : en commandant, le client confirme agir pour les besoins de son activité professionnelle.',
          'Les présentes conditions s\'appliquent à toute commande passée en ligne ou après un échange avec Présence IA. Dans ce dernier cas, elles sont transmises au client avec l\'offre.',
        ]},
        { title: '2. Prestations', body: [
          'Site web : conception, hébergement, nom de domaine et modifications du site du client, dans les limites décrites sur la page Tarifs.',
          'Visibilité IA : mise en place (fiche Google, annuaires, données structurées, contenus de questions fréquentes, méthode pour les avis) puis suivi mensuel (analyse sur ChatGPT, Gemini, Claude et Perplexity avec rapport, publications Google, nouveau contenu, suivi des annuaires et des avis). L\'offre Visibilité IA + Assistant ajoute un assistant téléphonique et un second contenu mensuel.',
          'Le détail des prestations incluses est celui affiché sur presenceia.com au moment de la commande. Toute prestation supplémentaire fait l\'objet d\'un devis.',
        ]},
        { title: '3. Formules de paiement et durée', body: [
          '**12 mois** : prix mensuel, engagement de 12 mois à compter de la souscription. Les frais de mise en place indiqués sur la page Tarifs sont offerts en contrepartie de cet engagement. À l\'issue des 12 mois, l\'abonnement se poursuit de mois en mois et peut être résilié moyennant un préavis de 30 jours pour la fin d\'un mois.',
          '**Annuel** : prix payé d\'avance pour 12 mois (équivalent à 10 mois), frais de mise en place offerts. L\'abonnement se renouvelle pour une année au prix normal de la formule, sauf résiliation au plus tard 30 jours avant l\'échéance.',
          '**Sans engagement** : prix mensuel, résiliable à tout moment pour la fin de la période mensuelle en cours. Pour Visibilité IA, des frais de mise en place uniques sont facturés avec le premier mois.',
          '**Fin anticipée.** Si le client résilie une formule 12 mois avant le terme de l\'engagement, les frais de mise en place offerts sont facturés au prorata des mois restants jusqu\'à ce terme. Si le client résilie une formule annuelle avant l\'échéance, les mois écoulés sont recalculés au prix mensuel de la formule 12 mois applicable au client, les frais de mise en place offerts sont facturés au prorata des mois restants, et la différence avec le prix annuel payé est remboursée au client, s\'il y en a une. Ces règles ne s\'appliquent pas lorsque la résiliation est due à un manquement de Présence IA.',
        ]},
        { title: '4. Offre fondateur', body: [
          'Les premiers clients Visibilité IA bénéficient d\'une réduction de 30 % pendant les 12 premiers mois, dans la limite des places indiquées sur le site. La réduction s\'applique automatiquement au paiement et n\'est pas cumulable avec une autre offre. Dès le 13e mois, y compris en cas de renouvellement de la formule annuelle, le prix normal de la formule s\'applique.',
        ]},
        { title: '5. Prix et paiement', body: [
          'Les prix sont indiqués en francs suisses (CHF). Le paiement s\'effectue par carte, Apple Pay ou Google Pay via Stripe, prestataire de paiement sécurisé. Les montants sont prélevés automatiquement à chaque échéance. Les factures sont disponibles dans l\'espace client.',
          'En cas de défaut de paiement, Présence IA peut suspendre les prestations après un rappel resté sans effet pendant 10 jours.',
        ]},
        { title: '6. Garantie 90 jours', body: [
          'Pour les formules Visibilité IA, Présence IA mesure le score de visibilité IA du client à la fin de la mise en place, selon la méthode décrite dans le premier rapport. Si le score mesuré 90 jours plus tard n\'est pas supérieur à ce score de départ, la mensualité suivante n\'est pas facturée ; pour la formule annuelle, l\'abonnement est prolongé d\'un mois sans frais.',
          'La garantie s\'applique une fois par client, à condition que celui-ci ait transmis les accès et informations demandés dans les 10 jours suivant la souscription. Elle constitue un geste commercial.',
          'Présence IA s\'engage sur les moyens et sur un suivi transparent. Les réponses des assistants IA et les classements des moteurs de recherche dépendent de tiers : aucun résultat précis (position, nombre de clients) ne peut être garanti.',
        ]},
        { title: '7. Obligations du client', body: [
          'Le client fournit les informations, accès (par exemple à sa fiche Google) et validations nécessaires, et garantit disposer des droits sur les contenus transmis (logos, photos, textes). Les délais de Présence IA courent à réception de ces éléments.',
          'Le client relit et valide les contenus avant leur publication et répond de l\'exactitude des informations concernant son entreprise. Il garantit Présence IA contre toute prétention de tiers liée aux contenus qu\'il a fournis.',
        ]},
        { title: '8. Propriété', body: [
          'Le nom de domaine du client est enregistré à son nom et sa fiche Google reste sa propriété. Une fois payés, les textes rédigés pour le client lui sont cédés, y compris le droit de les modifier et de les réutiliser. La conception, le code et les modèles du site restent la propriété de Présence IA. En cas de fin d\'abonnement au site web, Présence IA remet sur demande les textes et images du site, sous réserve des licences d\'images de tiers.',
        ]},
        { title: '9. Résiliation', body: [
          'La résiliation se fait par e-mail à antoine@presenceia.com, en respectant la durée et le préavis de la formule choisie (article 3).',
        ]},
        { title: '10. Responsabilité', body: [
          'Présence IA répond des dommages causés intentionnellement ou par négligence grave conformément à la loi. En cas de négligence légère, sa responsabilité est limitée aux dommages directs et au montant payé par le client au cours des 12 derniers mois ; la responsabilité pour les dommages indirects, notamment la perte de gain, de clientèle ou de données, est exclue.',
          'Présence IA ne répond pas du fonctionnement, des interruptions ni des changements de règles des services de tiers (assistants IA, moteurs de recherche, Google, annuaires, hébergeur, opérateurs téléphoniques).',
        ]},
        { title: '11. Protection des données', body: [
          'Le traitement des données personnelles est décrit dans la politique de confidentialité disponible sur presenceia.com/confidentialite.',
        ]},
        { title: '12. Droit applicable et for', body: [
          'Les présentes conditions sont soumises au droit suisse. Le for est à Sion, Suisse. En cas de divergence entre les versions linguistiques, la version française fait foi.',
        ]},
        { title: '13. Modifications et transfert', body: [
          'Présence IA peut modifier ses prix ou les présentes conditions en informant le client par e-mail au moins 60 jours à l\'avance. Pendant une période d\'engagement en cours, le prix convenu reste inchangé. Le client qui refuse une modification peut résilier sans frais pour la date de son entrée en vigueur.',
          'Présence IA peut transférer le contrat, avec l\'ensemble des droits et obligations, y compris l\'encaissement des paiements, à une société dont Antoine Pury est associé gérant. Le client en est informé par e-mail au moins 30 jours à l\'avance et peut, s\'il s\'y oppose, résilier sans frais pour la date du transfert.',
        ]},
      ]}
    />
  )
}
