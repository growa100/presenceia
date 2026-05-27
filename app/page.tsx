import Navbar from '@/components/Navbar'
import CheckerForm from '@/components/CheckerForm'
import { Search, Zap, BarChart3, Shield, ArrowRight, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-white pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-red-50 rounded-full blur-2xl opacity-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto mb-14">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-4 py-2 rounded-full mb-8">
              <Zap className="w-3.5 h-3.5" />
              Nouveau · Analyse en temps réel sur ChatGPT, Claude & Perplexity
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-gray-900 mb-6 leading-tight">
              Votre entreprise{' '}
              <span className="gradient-text italic">existe-t-elle</span>
              {' '}pour les IA ?
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Quand un client demande à <strong className="text-gray-900">ChatGPT</strong> un plombier à Sion,
              un dentiste à Genève ou un avocat à Lausanne — votre nom apparaît-il ?
              Testez votre score gratuitement en 60 secondes.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-12">
              {['100% gratuit', 'Aucune carte requise', 'Résultat en 30–60s', 'Données 100% Swiss'].map(b => (
                <div key={b} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── FORM CARD ─────────────────────────────────────────────── */}
          <div id="checker" className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-strong border border-gray-100 p-8 md:p-10">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Analyser ma présence IA
              </h2>
              <p className="text-sm text-gray-500 text-center mb-8">
                Entrez les informations de votre entreprise pour obtenir votre score
              </p>
              <CheckerForm />
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-400">
              Déjà utilisé par des entrepreneurs à Genève, Lausanne, Zurich, Sion et Lugano
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-gray-600 ml-2 font-medium">4.9/5 — 120+ analyses</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
              Comment fonctionne l'analyse
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Notre moteur interroge les IA en temps réel et calcule votre score de visibilité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                step: '01',
                title: 'Nous interrogeons les IA',
                desc: 'Nous envoyons vos requêtes locales (en français, allemand, anglais) à ChatGPT, Claude et Perplexity — exactement comme le feraient vos clients.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: BarChart3,
                step: '02',
                title: 'Analyse des réponses',
                desc: 'Notre algorithme détecte si vous apparaissez, à quelle position, avec quel sentiment, et calcule votre part de voix face à vos concurrents.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Zap,
                step: '03',
                title: 'Score & Plan d\'action',
                desc: 'Vous recevez un score 0–100 avec un grade (A–F) et 4 recommandations concrètes pour améliorer votre visibilité IA dès aujourd\'hui.',
                color: 'bg-red-50 text-red-600',
              },
            ].map(({ icon: Icon, step, title, desc, color }, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-soft border border-gray-100 relative overflow-hidden">
                <div className="absolute top-6 right-6 text-6xl font-black text-gray-50 select-none">{step}</div>
                <div className={`inline-flex p-3 rounded-xl ${color} mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Plateformes analysées
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { name: 'ChatGPT', icon: '🤖', sub: 'GPT-4o' },
              { name: 'Claude', icon: '🧠', sub: 'Anthropic' },
              { name: 'Perplexity', icon: '🔍', sub: 'AI Search' },
              { name: 'Gemini', icon: '✨', sub: 'Google — bientôt' },
              { name: 'Copilot', icon: '🪟', sub: 'Microsoft — bientôt' },
            ].map(({ name, icon, sub }) => (
              <div key={name} className="flex flex-col items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <span className="text-3xl">{icon}</span>
                <span className="font-semibold text-gray-900 text-sm">{name}</span>
                <span className="text-xs text-gray-400">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
              Des tarifs transparents
            </h2>
            <p className="text-gray-600 text-lg">
              Commencez gratuitement. Passez à l'action avec nos offres mensuelles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'CHF 299',
                period: '/mois',
                desc: 'Pour démarrer votre présence IA',
                features: [
                  'Audit de présence IA complet',
                  'Optimisation Google Business Profile',
                  'Schema.org & données structurées',
                  'Rapport mensuel',
                  '3 langues analysées',
                ],
                cta: 'Commencer',
                highlight: false,
              },
              {
                name: 'Growth',
                price: 'CHF 599',
                period: '/mois',
                desc: 'Pour dominer votre marché local',
                features: [
                  'Tout Starter, plus :',
                  '2 articles IA par mois',
                  'Gestion des avis clients',
                  'Monitoring IA hebdomadaire',
                  'Rapport de concurrence',
                  'Support prioritaire',
                ],
                cta: 'Choisir Growth',
                highlight: true,
              },
              {
                name: 'Domination',
                price: 'CHF 1\'199',
                period: '/mois',
                desc: 'Pour devenir la référence régionale',
                features: [
                  'Tout Growth, plus :',
                  'Contenu hebdomadaire',
                  'Monitoring IA quotidien',
                  'Dashboard client dédié',
                  'Alertes concurrents temps réel',
                  'Account manager dédié',
                ],
                cta: 'Contacter',
                highlight: false,
              },
            ].map(({ name, price, period, desc, features, cta, highlight }) => (
              <div
                key={name}
                className={`rounded-3xl p-8 border ${
                  highlight
                    ? 'bg-red-500 border-red-400 text-white shadow-red scale-105'
                    : 'bg-white border-gray-100 shadow-soft'
                }`}
              >
                {highlight && (
                  <div className="inline-block bg-white text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
                    ⭐ Le plus populaire
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
                <p className={`text-sm mb-4 ${highlight ? 'text-red-100' : 'text-gray-500'}`}>{desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-black ${highlight ? 'text-white' : 'text-gray-900'}`}>{price}</span>
                  <span className={`text-sm ${highlight ? 'text-red-200' : 'text-gray-400'}`}>{period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${highlight ? 'text-red-200' : 'text-green-500'}`} />
                      <span className={highlight ? 'text-red-50' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:hello@presenceia.com?subject=Offre ${name}`}
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    highlight
                      ? 'bg-white text-red-600 hover:bg-red-50'
                      : 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
                  }`}
                >
                  {cta} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">
            Le moment d'agir, c'est maintenant
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            La révolution IA du référencement local est en cours. Les entreprises qui agissent aujourd'hui
            seront les références de demain. Vos concurrents n'ont pas encore bougé.
          </p>
          <a
            href="#checker"
            className="inline-flex items-center gap-2.5 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-red hover:shadow-lg hover:-translate-y-0.5"
          >
            Tester ma présence IA gratuitement
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="text-gray-600 text-sm mt-4">Gratuit · Sans engagement · Résultat en 60 secondes</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-500 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">P</span>
              </div>
              <span className="font-bold text-gray-300">présence<span className="text-red-500">ia</span></span>
              <span className="text-gray-700 text-sm">— Zug, Suisse</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="mailto:hello@presenceia.com" className="hover:text-gray-300 transition-colors">Contact</a>
              <span className="text-gray-700">©2026 Présence IA — Tous droits réservés</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
