import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Conditions générales',
  description: 'Conditions générales des abonnements Présence IA : durée, paiement, résiliation, garantie 90 jours.',
  robots: { index: false, follow: true },
}

// Draft to have reviewed by a lawyer before the live launch.
export default function Conditions() {
  return (
    <LegalPage
      title="Conditions générales"
      updated="Dernière mise à jour : 26 septembre 2026"
      sections={[
        { title: '1. Parties', body: [
          'Les présentes conditions régissent les abonnements souscrits auprès d\'Antoine Pury, Présence IA, Av. du Bietschhorn 37, 1950 Sion, Suisse (ci-après « Présence IA »), par une entreprise ou un indépendant (ci-après « le client »). Elles s\'appliquent à toute commande passée en ligne ou après un échange avec Présence IA.',
        ]},
        { title: '2. Prestations', body: [
          'Site web : conception, hébergement, nom de domaine et modifications du site du client, dans les limites décrites sur la page Tarifs.',
          'Visibilité IA : mise en place (fiche Google, annuaires, données structurées, contenus de questions fréquentes, méthode pour les avis) puis suivi mensuel (analyse sur ChatGPT, Gemini, Claude et Perplexity avec rapport, publications Google, nouveau contenu, suivi des annuaires et des avis). L\'offre Visibilité IA + Assistant ajoute un assistant téléphonique et un second contenu mensuel.',
          'Le détail des prestations incluses est celui affiché sur presenceia.com au moment de la commande. Toute prestation supplémentaire fait l\'objet d\'un devis.',
        ]},
        { title: '3. Formules de paiement et durée', body: [
          '12 mois : prix mensuel, engagement de 12 mois à compter de la souscription, mise en place offerte. À l\'issue des 12 mois, l\'abonnement se poursuit de mois en mois et peut être résilié avec un préavis de 30 jours.',
          'Annuel : prix payé d\'avance pour 12 mois (équivalent à 10 mois), mise en place offerte. L\'abonnement se renouvelle pour une année, sauf résiliation au plus tard 30 jours avant l\'échéance.',
          'Sans engagement : prix mensuel, résiliable pour la fin de chaque période mensuelle. Pour Visibilité IA, des frais de mise en place uniques sont facturés avec le premier mois.',
          'En cas de résiliation anticipée d\'un engagement de 12 mois, les mensualités restantes jusqu\'au terme de l\'engagement restent dues.',
        ]},
        { title: '4. Offre fondateur', body: [
          'Les premiers clients Visibilité IA bénéficient d\'une réduction de 30 % pendant les 12 premiers mois, dans la limite des places indiquées sur le site. La réduction s\'applique automatiquement au paiement et n\'est pas cumulable avec une autre offre. Dès le 13e mois, le prix normal de la formule s\'applique.',
        ]},
        { title: '5. Prix et paiement', body: [
          'Les prix sont indiqués en francs suisses (CHF). Le paiement s\'effectue par carte, Apple Pay ou Google Pay via Stripe, prestataire de paiement sécurisé. Les montants sont prélevés automatiquement à chaque échéance. Les factures sont disponibles dans l\'espace client.',
          'En cas de défaut de paiement, Présence IA peut suspendre les prestations après un rappel resté sans effet pendant 10 jours.',
        ]},
        { title: '6. Garantie 90 jours', body: [
          'Si, 90 jours après la fin de la mise en place, aucune progression mesurable n\'est constatée (présence dans les réponses des assistants IA, score de visibilité ou signaux travaillés tels que fiche Google, annuaires et avis), le 4e mois d\'abonnement est offert. La garantie suppose que le client a transmis les accès et informations demandés.',
          'Présence IA s\'engage sur les moyens et sur un suivi transparent. Les réponses des assistants IA et les classements des moteurs de recherche dépendent de tiers : aucun résultat précis (position, nombre de clients) ne peut être garanti.',
        ]},
        { title: '7. Obligations du client', body: [
          'Le client fournit les informations, accès (par exemple à sa fiche Google) et validations nécessaires, et garantit disposer des droits sur les contenus transmis (logos, photos, textes). Les délais de Présence IA courent à réception de ces éléments.',
        ]},
        { title: '8. Propriété', body: [
          'Le nom de domaine du client est enregistré à son nom. Les contenus rédigés pour le client lui sont acquis une fois payés. En cas de fin d\'abonnement au site web, Présence IA remet sur demande les textes et images du site.',
        ]},
        { title: '9. Résiliation', body: [
          'La résiliation se fait par email à antoine@presenceia.com, en respectant la durée et le préavis de la formule choisie. Elle prend effet à la fin de la période en cours.',
        ]},
        { title: '10. Responsabilité', body: [
          'La responsabilité de Présence IA est limitée aux dommages directs causés intentionnellement ou par négligence grave, et au montant payé par le client au cours des 12 derniers mois.',
        ]},
        { title: '11. Protection des données', body: [
          'Le traitement des données personnelles est décrit dans la politique de confidentialité disponible sur presenceia.com/confidentialite.',
        ]},
        { title: '12. Droit applicable et for', body: [
          'Les présentes conditions sont soumises au droit suisse. Le for est à Sion, Suisse.',
        ]},
      ]}
    />
  )
}
