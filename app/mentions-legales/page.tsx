import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site presenceia.com, édité par Antoine Pury (Présence IA), Sion.',
  robots: { index: false, follow: true },
}

export default function MentionsLegales() {
  return (
    <LegalPage
      title="Mentions légales"
      updated="Dernière mise à jour : 21 septembre 2026"
      sections={[
        { title: 'Éditeur du site', body: [
          'Antoine Pury, Présence IA, Av. du Bietschhorn 37, 1950 Sion, Suisse. Le site presenceia.com et la marque Présence IA sont exploités par Antoine Pury, à titre individuel.',
          'Contact : antoine@presenceia.com · +41 78 915 15 73. Responsable de la publication : Antoine Pury.',
        ]},
        { title: 'Hébergement', body: [
          'Le site presenceia.com est hébergé par Vercel Inc. (San Francisco, États-Unis). Les sites web réalisés pour nos clients sont hébergés sur des serveurs en Suisse et dans l\'Union européenne, avec chiffrement TLS.',
        ]},
        { title: 'Sites préparés à titre de présentation', body: [
          'Les sites de démonstration accessibles sur des sous-domaines de presenceia.com sont préparés à partir d\'informations publiquement disponibles (fiches Google, annuaires professionnels, sites existants) afin de présenter notre service à l\'entreprise concernée. Ils ne sont pas indexés par les moteurs de recherche, portent une mention « aperçu » visible et sont retirés sur simple demande de l\'entreprise, sans frais.',
          'Aucune information relative à une entreprise n\'est publiée au-delà de ce qu\'elle a elle-même rendu public. Pour demander le retrait d\'un site de démonstration : antoine@presenceia.com.',
        ]},
        { title: 'Propriété intellectuelle', body: [
          'Les éléments du site presenceia.com (textes, graphismes, code) sont la propriété d\'Antoine Pury (Présence IA). Les logos, photos et contenus des entreprises clientes restent la propriété de ces entreprises. Le nom de domaine d\'un site client est enregistré au nom de l\'entreprise cliente.',
        ]},
        { title: 'Droit applicable', body: [
          'Les présentes mentions sont soumises au droit suisse. For : Sion, Suisse.',
        ]},
      ]}
    />
  )
}
