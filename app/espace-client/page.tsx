import type { Metadata } from 'next'
import ClientSpace from '@/components/ClientSpace'

export const metadata: Metadata = {
  title: 'Espace client',
  description: 'Vos analyses de visibilité IA, votre suivi avec Présence IA, vos rendez-vous et votre abonnement.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <ClientSpace />
}
