'use client'
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Share2, TrendingUp } from 'lucide-react'
import ScoreRing from './ui/ScoreRing'
import PlatformCard from './ui/PlatformCard'
import { ScoringResult } from '@/lib/scoring-engine'
import { type Lang } from '@/lib/translations'
import { cn } from '@/lib/utils'

interface Props {
  result: ScoringResult
  lang: Lang
  onReset: () => void
}

const gradeConfig = {
  A: { label: 'Excellent', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  B: { label: 'Bon', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  C: { label: 'Moyen', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  D: { label: 'Faible', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  F: { label: 'Invisible', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
}

export default function ResultsPanel({ result, lang, onReset }: Props) {
  const grade = result.grade as keyof typeof gradeConfig
  const cfg = gradeConfig[grade] || gradeConfig['F']
  const isEn = lang === 'en'

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mon score IA — Présence IA',
        text: `${result.businessName} a un score de visibilité IA de ${result.overallScore}/100. Testez le vôtre sur presenceia.com`,
        url: window.location.href
      })
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 fade-in-up">

      {/* Score header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <ScoreRing score={result.overallScore} size={180} grade={result.grade} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3', cfg.bg, cfg.color, `border ${cfg.border}`)}>
              <span>{result.grade}</span>
              <span>·</span>
              <span>{cfg.label}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{result.businessName}</h2>
            <p className="text-gray-500 text-sm mb-4">{result.city} · {result.category}</p>
            <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>

            {/* Share of voice badge */}
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-gray-600">
                  {isEn ? 'AI Share of Voice' : 'Part de voix IA'}:
                  <span className="font-bold text-gray-900 ml-1">{result.shareOfVoice}%</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform results */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {isEn ? 'Results by platform' : 'Résultats par plateforme'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.platformResults.map((pr, i) => (
            <PlatformCard key={i} result={pr} lang={isEn ? 'en' : 'fr'} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-7">
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          {isEn ? '🎯 Priority recommendations' : '🎯 Recommandations prioritaires'}
        </h3>
        <div className="space-y-3">
          {result.topRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-50 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-red-600">{i + 1}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-8 text-white text-center shadow-red">
        <h3 className="text-2xl font-bold mb-2">
          {isEn ? 'Ready to dominate AI recommendations?' : 'Prêt à dominer les recommandations IA ?'}
        </h3>
        <p className="text-red-100 mb-6 text-sm">
          {isEn
            ? 'GEO Swiss helps you become the answer AI gives your clients. Full audit + action plan.'
            : 'GEO Swiss vous aide à devenir la réponse que les IA donnent à vos clients. Audit complet + plan d\'action.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:hello@presenceia.com?subject=Audit gratuit&body=Bonjour, je souhaite un audit complet pour mon entreprise."
            className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors shadow-sm"
          >
            {isEn ? 'Get a free full audit' : 'Obtenir un audit gratuit'}
            <ArrowRight className="w-4 h-4" />
          </a>
          <button
            onClick={share}
            className="inline-flex items-center justify-center gap-2 border border-red-300 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {isEn ? 'Share my score' : 'Partager mon score'}
          </button>
        </div>
      </div>

      {/* Reset */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {isEn ? 'Check another business' : 'Analyser une autre entreprise'}
        </button>
      </div>
    </div>
  )
}
