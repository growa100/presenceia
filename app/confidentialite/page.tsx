import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Confidentialité',
  description: 'Politique de confidentialité de presenceia.com (nLPD, RGPD).',
  robots: { index: false, follow: true },
}

export default function Confidentialite() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updated="Dernière mise à jour : 21 septembre 2026"
      sections={[
        { title: 'Responsable du traitement', body: [
          '41 Labs GmbH, Zug (Suisse), hello@presenceia.com. Nous traitons les données personnelles conformément à la loi fédérale suisse sur la protection des données (nLPD) et, lorsque applicable, au Règlement général sur la protection des données de l\'Union européenne (RGPD).',
        ]},
        { title: 'Données que nous traitons', body: [
          'Prospection : pour présenter notre service, nous préparons un site de démonstration et écrivons à des entreprises (artisans, PME) en utilisant des coordonnées professionnelles publiques : nom de l\'entreprise, adresse, téléphone, adresse email de contact, site web, avis publics. Base : intérêt légitime à proposer nos services à des professionnels (art. 31 nLPD ; art. 6 al. 1 let. f RGPD). Nous n\'envoyons pas de prospection à des adresses de particuliers.',
          'Formulaires et outils du site : lorsque vous utilisez l\'outil d\'analyse de visibilité ou nous écrivez, nous traitons les informations que vous nous transmettez (nom de l\'entreprise, ville, secteur, email) pour vous répondre et fournir le résultat demandé.',
          'Clients : pour fournir le service (site web, nom de domaine, hébergement, facturation), nous traitons les données nécessaires à l\'exécution du contrat.',
          'Données techniques : notre hébergeur collecte des journaux techniques (adresse IP, navigateur, pages consultées) nécessaires au fonctionnement et à la sécurité du site. Nous n\'utilisons pas de cookies publicitaires ni de suivi tiers.',
        ]},
        { title: 'Ne plus être contacté', body: [
          'Chaque email de prospection contient un lien de désinscription et vous pouvez répondre « stop ». Votre adresse est alors exclue de tout envoi futur, immédiatement et définitivement. Vous pouvez aussi écrire à hello@presenceia.com.',
        ]},
        { title: 'Conservation', body: [
          'Les données de prospection sont conservées au maximum 12 mois après le dernier contact, ou jusqu\'à votre demande de retrait. Les données clients sont conservées pendant la durée du contrat puis selon les obligations légales (10 ans pour les pièces comptables en Suisse).',
        ]},
        { title: 'Sous-traitants', body: [
          'Nous faisons appel à des prestataires pour l\'hébergement (Vercel, Infomaniak, DigitalOcean), la base de données (Supabase, UE), l\'envoi d\'emails (Infomaniak, Google Workspace) et l\'analyse de visibilité (fournisseurs de modèles d\'IA). Ces prestataires traitent les données sur nos instructions et avec des garanties appropriées.',
        ]},
        { title: 'Vos droits', body: [
          'Vous pouvez demander l\'accès à vos données, leur rectification, leur effacement, la limitation du traitement ou vous opposer au traitement, en écrivant à hello@presenceia.com. Vous pouvez également saisir le Préposé fédéral à la protection des données et à la transparence (PFPDT) ou, dans l\'UE, l\'autorité de contrôle de votre pays.',
        ]},
      ]}
    />
  )
}
